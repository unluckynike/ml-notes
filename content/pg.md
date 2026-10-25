# 策略梯度深读：从 REINFORCE 到优势函数

这篇是**策略梯度 PG**主题的深度补充。策略梯度是所有「直接优化策略」方法（PPO、GRPO、RLHF 的 RL 阶段）的地基，而它的核心推导只有一行**对数微分恒等式**——读懂它，RLHF 那些公式就不再神秘。

> [!KEY] 一句话抓住本质
> 想最大化期望回报 $J(\theta) = \text{E}_{\tau\sim\pi_\theta}[R(\tau)]$，但回报对动作不可导。技巧：**把「采样的梯度」换成「对数概率的梯度」**——$\nabla J = \text{E}[R(\tau)\nabla\log\pi_\theta(\tau)]$。直觉：**「回报高的轨迹，把它的对数概率推高」**，推的力度就是回报本身。

---

## 一、推导：一行恒等式撑起半个领域

$$J(\theta) = \sum_{\tau} P(\tau;\theta)R(\tau)$$

直接对 $\theta$ 求导，用 $\nabla P = P\cdot\nabla\log P$（对数微分恒等式）：

$$\nabla J(\theta) = \sum_{\tau} P(\tau;\theta)\,R(\tau)\,\nabla\log P(\tau;\theta) = \text{E}_{\tau}\left[R(\tau)\,\nabla\log P(\tau;\theta)\right]$$

轨迹概率按逐步动作展开 $\log P(\tau) = \log p(s_1) + \sum_t\log\pi_\theta(a_t|s_t) + \log p(s_{t+1}|s_t,a_t)$，**只有动作项含 θ**，其余梯度为 0，得到：

$$\nabla J(\theta) = \text{E}\left[\sum_{t} R(\tau)\,\nabla\log\pi_\theta(a_t|s_t)\right]$$

这就是 **REINFORCE**（Williams, 1992）。采样若干轨迹，按 $R\,\nabla\log\pi$ 的样本均值更新——**期望正确、方差巨大**。

---

## 二、方差三连降：这半部「工程史」

**① 减去基线（baseline）**：给回报减一个与动作无关的量 $b(s_t)$，期望不变（$\text{E}[\nabla\log\pi \cdot b] = b\,\nabla\sum_a\pi(a) = 0$），方差大降。最优基线近似**该状态的价值** $V(s_t)$，于是：

$$\nabla J = \text{E}\left[\sum_t \left(R_t - V(s_t)\right)\nabla\log\pi_\theta(a_t|s_t)\right] = \text{E}\left[\sum_t A^{\pi}(s_t,a_t)\,\nabla\log\pi_\theta(a_t|s_t)\right]$$

$A = R - V$ 就是**优势函数**：动作比该状态的平均水平好多少。V 用另一个网络（critic）回归拟合——**actor-critic 架构**从此定型。

**② 只信用「动作之后的回报」**：$R_t = \sum_{t' > t}\gamma^{t'-t}r_{t'}$（reward-to-go），动作之前的奖励与它无关，砍掉白噪声。

**③ 偏差换方差（可选）**：GAE(λ) 对多步 TD 误差做指数平均，控制偏差-方差权衡——现代实现的默认选择。

> [!WARN] 必须是 on-policy
> 梯度期望里的分布就是当前策略本身——**采样必须来自正在更新的策略**。旧数据一旦策略变了就「过期」。这是 PPO 用重要性采样 + 裁剪扩展复用、离线 RL 专门要解决的根本矛盾。

---

## 三、从 REINFORCE 到 PPO 的两级跳

**第一跳·TRPO（2015）**：每次更新加「新策略不能离旧策略太远」的 KL 约束（置信域），防一步走崩。推导漂亮（Fisher 自然梯度），实现复杂（二阶优化）。

**第二跳·PPO（2017）**：把约束改成**目标函数里的裁剪**——重要性比率 $r_t = \pi_\theta(a_t|s_t)/\pi_{\text{old}}(a_t|s_t)$：

$$L = \text{E}\left[\min\left(r_tA_t,\;\; \text{clip}(r_t,\;1\pm\epsilon)A_t\right)\right]$$

比率跑出 $[1-\epsilon, 1+\epsilon]$ 就不再给奖励——一阶优化、简单稳定，成为 RLHF 的默认选择（详见 RLHF 深读第三节）。GRPO 再把 critic 换成组内相对优势。

---

## 四、面试要点速答

1. **策略梯度的核心公式与直觉？** $\nabla J = \text{E}[R\nabla\log\pi]$：按回报大小成比例地推高/压低轨迹的对数概率。
2. **为什么减 baseline 期望不变？** $\text{E}[b\nabla\log\pi] = b\nabla\text{(sum of probs)} = 0$——与动作无关的量不改变梯度方向，只降方差。
3. **优势函数的定义与意义？** $A(s,a) = Q(s,a) - V(s)$：动作比状态平均好多少；替代原始回报作为推高力度。
4. **为什么策略梯度方差大？** 回报是整条轨迹的随机函数（环境随机+多步累积），单样本梯度噪声极大——baseline/reward-to-go/GAE 全是降方差工程。
5. **PPO 裁剪在防什么？** 策略一步更新过大（off-policy 失配）；超出信任区间的优势不再提供梯度。
6. **策略梯度与 DQN 的本质区别？** 直接参数化策略（可处理连续动作、随机策略）vs 学值函数再贪心（off-policy 样本效率高，但难处理连续/随机）。

---

## 延伸阅读

- Williams, *Simple Statistical Gradient-Following Algorithms for Connectionist RL (REINFORCE)*, 1992
- Schulman et al., *Trust Region Policy Optimization*, 2015；*Proximal Policy Optimization*, 2017
- Schulman et al., *High-Dimensional Continuous Control Using GAE*, 2015
