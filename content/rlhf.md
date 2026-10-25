# 对齐深读：奖励模型、PPO 与 DPO

这篇是 **RLHF 对齐**主题的深度补充。ChatGPT 与 GPT-3 的差距不在知识（都来自预训练），而在**行为**——这份差距是 RLHF 补上的。这里把三段式流水线里最硬的两块讲透：**奖励模型怎么从偏好排序学出来**、**DPO 怎么把整个 RL 流程塌缩成一个分类损失**。

> [!KEY] 一句话抓住本质
> RLHF 三步：① SFT 教格式；② 用人类偏好对（A 好于 B）训一个**奖励模型** r(x,y) 当「人类品味的可微代理」；③ 用 PPO 最大化 r，同时用 KL 惩罚拴住模型别偏离语言模型太远。DPO 的贡献是证明：③ 的最优解有闭式形式，**直接对偏好对做类似分类的损失即可，不需要 RL**。

---

## 一、为什么预训练 + SFT 还不够

- 预训练目标（下一词）与「对人有用」不对齐：网络文本里最「像」的续写常常不是最有帮助的。
- SFT 只能模仿示范，**表达不了「两个都不错但 A 更好」这种序数信号**——而人类标注偏好比写标准答案便宜得多、一致性也更高。
- RLHF 把「好」的定义从「像示范」升级为「奖励模型打分高且不跑偏」。

---

## 二、奖励模型：Bradley–Terry 偏好模型

人类标注的是**相对偏好**：同一 prompt $x$ 下，回答 $y_w$ 好于 $y_l$（win/lose）。Bradley–Terry 模型假设「偏好概率由奖励差决定」：

$$P(y_w > y_l \mid x) = \sigma\left(r(x, y_w) - r(x, y_l)\right)$$

于是奖励模型就是「把 pair 变成二分类」：极大似然等价于最小化

$$\text{Loss}_{\text{RM}} = -\log\sigma\left(r(x, y_w) - r(x, y_l)\right)$$

工程细节：

- RM 通常是 SFT 模型换头（标量输出，去 softmax）再全参微调；近年趋势是直接用**生成式 RM**（LLM 打分）。
- loss 里常加一个 $\frac{1}{2}(r^2)$ 类正则防奖励值漂移（KL 惩罚里会出现 $(r - \log\frac{p_\theta}{p_{\text{ref}}})$ 的耦合，见下）。
- 数据质量 > 数量：偏好标注的**一致性校验**（多人投票、去噪）比堆量重要。

---

## 三、RL 阶段：目标函数逐项拆

策略 $\pi_\theta$（当前模型）与参考模型 $\pi_{\text{ref}}$（SFT 冻结副本）。目标：

$$\max_{\pi_\theta}\;\; \text{E}_{x\sim D,\; y\sim\pi_\theta(\cdot\mid x)}\left[r(x, y)\right] - \beta\,\text{KL}\left(\pi_\theta(\cdot\mid x)\,\|\,\pi_{\text{ref}}(\cdot\mid x)\right)$$

为什么要 KL 惩罚（而不是只看奖励）：

1. **防 reward hacking**：RM 只是人类品味的有噪代理，无约束最大化必然钻空子（废话连篇刷格式分、复读、乱堆 emoji）。
2. **保持语言质量**：远离参考模型太远，流畅性先崩（mode collapse 到 RM 喜欢的窄分布）。
3. 数学上它等价于在**后验正则化的偏好优化**（这正是 DPO 推导的钥匙）。

**PPO 的角色**：上述目标是不知环境转移的策略梯度问题。PPO 用「重要性采样 + 裁剪」限制每步更新幅度：

$$\text{clip}\left(\frac{\pi_\theta(a|s)}{\pi_{\text{old}}(a|s)},\; 1\pm\epsilon\right)$$

LLM 场景的落地形态（InstructGPT 配方）：4 个模型同时在显存里（策略、参考、RM、价值网络），rollout 一批回答 → 算「奖励 − KL 罚」的优势 → 裁剪更新。**工程复杂度是 RLHF 最大的门槛**。GRPO（DeepSeek 提出）砍掉价值网络、用组内相对优势，是当下流行的简化。

---

## 四、DPO：把 RL 塌缩成分类

**核心观察**：第三节的目标有闭式最优解（带 KL 约束的奖励最大化是 Gibbs 分布）：

$$\pi^*(y\mid x) = \frac{1}{Z(x)}\,\pi_{\text{ref}}(y\mid x)\,\exp\left(\frac{1}{\beta}r(x,y)\right)$$

反解出用 $\pi$ 表达的 r：

$$r(x,y) = \beta\log\frac{\pi(y\mid x)}{\pi_{\text{ref}}(y\mid x)} + \beta\log Z(x)$$

代回 Bradley–Terry 损失——配分函数 $Z(x)$ 在 win/lose 相减时**神奇地消掉**，得到：

$$\text{Loss}_{\text{DPO}} = -\log\sigma\left(\beta\log\frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta\log\frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}\right)$$

读法：不需要 RM、不需要 rollout、不需要价值网络——**直接拿偏好对做「隐式奖励差」的 sigmoid 分类**，拉大被偏好回答的对数概率比、压低被拒绝的。$\beta$ 就是 RLHF 里的 KL 系数。

| | RLHF (PPO) | DPO |
|---|---|---|
| 需要 RM | 是 | 否（隐式） |
| 需要 rollout 采样 | 是 | 否（离线偏好对） |
| 显存（训练时模型数） | 4 | 2（策略 + 参考） |
| 在线探索 | 有（能发现新行为） | 无（受限于偏好数据覆盖） |
| 工程门槛 | 高（RL 超参敏感） | 低（像 SFT 一样稳） |

> [!WARN] DPO 不是免费午餐
> 偏好数据没覆盖的行为模式，DPO 无从优化；奖励剧烈偏移的「探索型」任务上 PPO 仍占优。实践中常见 pipeline：先 DPO 快速迭代，效果 plateau 后再上在线 RL（或迭代式 DPO / RLHF 混合）。

---

## 五、实战三坑

1. **长度偏置**：RM 与人都偏爱长回答 → 模型学会注水。对策：偏好数据里控制长度分布、loss 里加长度罚、评测用长度控制的对.
2. **奖励过优化（overoptimization）**：KL 距离越大，真实偏好与 RM 分数的相关性越差（「Goodhart 曲线」）。监控：定期用留出的人类标注校验 RM 与真实偏好的一致率。
3. **数据分布漂移**：RL 阶段模型生成的回答分布会离开 SFT 分布，RM 在分布外打分不可靠。对策：定期把新 rollout 加进 RM 训练池（iterative RLHF）。

---

## 六、面试要点速答

1. **RLHF 三个阶段各自解决什么？** SFT 教格式与基础对话；RM 学偏好代理；PPO 把偏好注入策略且 KL 防跑偏。
2. **Bradley–Terry 假设是什么？** 偏好概率 = 奖励差的 sigmoid；把排序标注转成可微二分类。
3. **KL 惩罚去掉会怎样？** Reward hacking + 语言崩坏；模型找到 RM 的漏洞而非人类价值观。
4. **DPO 为什么等价于 RLHF？** KL 约束目标的最优解是 Gibbs 分布，反解奖励代入 BT 损失后配分函数相消，得到直接优化策略的闭式损失。
5. **PPO 裁剪在裁什么？** 新旧策略概率比被限制在 $[1-\epsilon, 1+\epsilon]$，防单步更新过大导致策略崩塌。
6. **GRPO 与 PPO 的区别？** 砍掉价值网络，用同一 prompt 一组回答的组内相对奖励当优势基线。

---

## 延伸阅读

- Ouyang et al., *Training language models to follow instructions (InstructGPT)*, 2022
- Christiano et al., *Deep RL from Human Preferences*, 2017（RM 范式源头）
- Rafailov et al., *Direct Preference Optimization*, 2023（第四节即论文推导主线）
- Shao et al., *DeepSeekMath (GRPO)*, 2024
