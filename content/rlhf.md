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

## 常见误区

- **「RLHF 让模型更聪明/知识更多」** —— RLHF 不增加知识（训练数据的知识上限不变）；它改变的是**行为的对齐**（格式/风格/安全性/有用性）——「更聪明」和「更有用」是不同维度。
- **「奖励模型的分数 = 人类偏好」** —— RM 是人类偏好的**有损压缩**（有限样本 + 模型偏差）——RM 分数高不等于人类更喜欢；RM 存在 reward hacking 的可利用漏洞。
- **「PPO 是 RLHF 的必需组件」** —— DPO 通过数学变换消除了显式奖励模型与 RL 训练循环——直接在偏好对上优化策略，效果可比 PPO 但实现大幅简化。
- **「RLHF 训练后模型在所有任务上都变好了」** —— RLHF 可能导致**对齐税**：对齐训练后在某些推理/知识任务上的性能下降——对齐与能力是跷跷板而非同步提升。

---

## 五、DPO 的数学推导（从 RLHF 到直接优化）

DPO 的推导只需三步（从 RLHF 目标出发）：

**Step 1**：RLHF 目标 = 最大化奖励 − β·KL(π‖π_ref)。这个约束优化的最优解有闭式：

$$\pi^*(y|x) = \frac{1}{Z(x)} \pi_{\text{ref}}(y|x) \exp\left(\frac{r(x,y)}{\beta}\right)$$

**Step 2**：反解奖励 r(x,y) = β·log[π(y|x)/π_ref(y|x)] + β·log Z(x)——奖励可用策略比率表示。

**Step 3**：将 Step 2 代入 Bradley-Terry 模型 P(y_w ≻ y_l) = σ[r(y_w) − r(y_l)]——配分函数 Z(x) 在差中消去：

$$\text{Loss}_{DPO} = -\log \sigma\left( \beta \log \frac{\pi(y_w|x)}{\pi_{ref}(y_w|x)} - \beta \log \frac{\pi(y_l|x)}{\pi_{ref}(y_l|x)} \right)$$

**读法**：DPO 直接最大化「被偏好回答的策略比率 − 被拒绝回答的策略比率」的 sigmoid——不需要奖励模型、不需要 RL 循环、不需要采样。**这就是「DPO = RLHF 的闭式解」的完整推导。**

## 六、迭代 DPO 与在线偏好学习

标准 DPO 是**离线**的（用固定的偏好数据集训练一轮）；迭代 DPO 加入**在线采样**：

1. 用当前模型生成回答；
2. LLM-as-judge 或人工标注偏好；
3. 将新偏好数据加入训练集；
4. 重新做 DPO → 回到 Step 1。

**迭代 DPO 的效果**：每一轮的偏好数据分布更接近当前模型的能力边界（不会被旧分布的噪声稀释）——Snorkel-AI（2024）报告迭代 DPO 在 AlpacaEval 上提升 8~15 个百分点。

**与在线 RL（PPO/GRPO）的对比**：在线方法能「探索」新的行为空间（发现训练数据中没有的好的行为），迭代 DPO 只能在「已有偏好数据的邻域」内改进——能力上限不同但实现复杂度差一个量级。

## 六、要点总结

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
