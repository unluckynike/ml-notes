# DQN 深读：贝尔曼方程、TD 误差与致命三要素

这篇是 **DQN 深度 Q 学习**主题的深度补充。PG 深读讲了「直接优化策略」，这篇讲另一半江山「学值函数再行动」——DQN 的两个招牌组件（**目标网络、经验回放**）都是为了驯服它的不稳定性，理解了不稳定性来源，这两个组件就不再是「玄学配件」。

> [!KEY] 一句话抓住本质
> Q 学习想拟合「状态-动作的价值表」$Q^*(s,a)$，目标由**贝尔曼方程**给出：$Q^*(s,a) = r + \gamma\max_{a'}Q^*(s',a')$。问题：目标里也含 Q 自己（自举），网络一更新目标就跟着动——**追一个会跑的靶子**。目标网络（冻结靶子）+ 经验回放（打破相关性、复用样本）就是两味镇定剂。

---

## 一、从贝尔曼方程到 Q 学习

期望回报的递归（贝尔曼方程）：

$$Q^*(s,a) = \text{E}\left[r + \gamma\max_{a'}Q^*(s',a')\right]$$

Q 学习把它变成**迭代更新**（时序差分，TD）：

$$Q(s,a) \leftarrow Q(s,a) + \alpha\left[y - Q(s,a)\right],\qquad y = r + \gamma\max_{a'}Q(s',a')\;\text{（TD 目标）}$$

方括号里就是 **TD 误差** $\delta$：当前估计与「一步现实 + 折叠的未来估计」的差。表格法下这一迭代收敛有定理保证；DQN 用神经网络 $Q_\theta(s)$ 近似表格，损失是回归：

$$L(\theta) = \text{E}_{(s,a,r,s')}\left[\left(y - Q_\theta(s,a)\right)^2\right],\qquad y = r + \gamma\max_{a'}Q_\theta(s',a')$$

**关键性质·off-policy**：max 目标不依赖行为策略（只依赖转移），所以可以用任何策略（比如 ε-greedy 探索）采的数据来学最优 Q——**样本效率高**，这是对比策略梯度（必须 on-policy）的核心优势。

**带目标网络的 Q 学习**——致命三要素里最关键的「固定目标」：

```python
import numpy as np
rng = np.random.default_rng(0)
gamma, alpha = 0.95, 0.05
nS = 6
Q = rng.normal(size=(nS, 2))                     # 主网络
Q_target = Q.copy()                              # 目标网络：定期才同步

def step(s, a):
    return min(s + 1, nS - 1), 1.0 if s + 1 == nS - 1 else 0.0   # 走到终点给奖励

for ep in range(300):
    s = 0
    for t in range(30):
        a = int(rng.random() < 0.5) if rng.random() < 0.1 else int(Q[s].argmax())
        s2, r = step(s, a)
        y = r + gamma * Q_target[s2].max()       # 用目标网络算 TD 目标
        Q[s, a] += alpha * (y - Q[s, a])
        s = s2
    if ep % 25 == 0: Q_target = Q.copy()         # 周期同步——这就是「固定目标」
print('学到的价值 V(0):', round(float(Q[0].max()), 2))
```

---

## 二、致命三要素：为什么朴素 DQN 会发散

Sutton & Barto 总结的「deadly triad」——三者同时出现时，值函数方法没有收敛保证：

1. **函数近似**（神经网络泛化：更新一个状态会波及一片）；
2. **自举**（目标里含自己的 Q，误差自我强化）；
3. **off-policy**（数据分布与被评估策略不一致）。

具体症状：Q 值过估计——max 操作系统性地放大噪声（取最大值时，噪声只增不减）；一次过估计经自举传播到整个状态空间，正反馈爆炸。

DQN（2015，Atari）的两味药：

**① 经验回放（Experience Replay）**：把转移 $(s,a,r,s')$ 存进大缓冲池，训练时均匀采样 mini-batch。

- 打破时间相关性（连续帧高度相关，违反 i.i.d. 假设）；
- 一条经验重复利用（样本效率，对采样昂贵的环境至关重要）；
- 平滑数据分布，减缓 off-policy 的漂移。

**② 目标网络（Target Network）**：复制一份参数 $\theta^-$ 冻结，TD 目标改用它计算：

$$y = r + \gamma\max_{a'}Q_{\theta^-}(s',a'),\qquad \theta^- \leftarrow \theta \;\;(\text{每隔 N 步同步一次})$$

靶子固定 N 步，回归问题短暂地变成普通监督学习——**切断「目标跟着参数跑」的正反馈**。

---

## 三、后续改进一览（常考命名）

| 改进 | 治什么 | 一句话 |
|---|---|---|
| **Double DQN** | max 的过估计 | 动作用在线网选、目标网评：$\max_a Q_{\theta^-}(s', \argmax_a Q_\theta(s',a))$ |
| **Dueling** | 状态价值与优势解耦 | $Q = V(s) + A(s,a) - \text{mean}(A)$，学「状态好不好」不必逐动作学 |
| **PER（优先回放）** | 均匀采样浪费 | TD 误差大的经验优先被采 |
| **多步回报** | 单步信号慢 | n-step unfold 折中偏差方差 |
| **分布 RL（C51）** | 只学均值丢信息 | 学回报的分布而非期望 |
| **RAINBOW** | — | 以上全家桶 |

---

## 四、DQN vs 策略梯度：选型表

| 维度 | DQN（值函数） | 策略梯度（PG/PPO） |
|---|---|---|
| 动作空间 | 离散（max 枚举） | 离散/连续皆可 |
| 数据利用 | off-policy，可复用旧数据 | on-policy，用完即弃 |
| 随机策略 | 天生确定性 | 显式建模分布 |
| 稳定性 | 致命三要素风险 | 方差大但收敛性质温和 |
| 典型场景 | Atari/推荐（离散大量） | 机器人控制/RLHF（连续或需随机） |

现代趋势：actor-critic 融合两者（学值函数当基线 + 策略梯度更新），DQN 家族思想活在 offline RL 与 AlphaZero 式「策略迭代 + 值引导」里。

---

## 常见误区

- **「DQN 能直接用于连续动作空间」** —— DQN 依赖 max Q(a) 需要枚举动作；连续空间需用策略梯度（DDPG/PPO）或动作离散化——架构选择不是调参问题。
- **「经验回放越多越好」** —— 缓冲区太大会引入过旧的策略产生的数据（off-policy 偏差加剧）；缓冲区大小是需要权衡的超参，不是越大越好。
- **「目标网络更新越频繁越稳定」** —— 恰恰相反：目标网络的作用是「延迟反馈」，更新太频繁等于没有目标网络——频率是需要调的超参。
- **「DQN 的 ε-greedy 可以用固定 ε=0.1 一练到底」** —— 训练早期需要大 ε 探索、后期需要小 ε 利用；固定 ε 会导致探索不足或利用不足——衰减调度是标配。

## 五、要点总结

1. **TD 误差的定义？** $\delta = r + \gamma\max Q(s',\cdot) - Q(s,a)$：「现实一步 + 未来估计」与当前估计的差，是 Q 学习的全部学习信号。
2. **为什么需要目标网络？** 目标含自己的 Q，参数一动目标就动（追移动靶）；冻结一份当靶子，切断正反馈。
3. **经验回放的三重作用？** 去相关、提样本效率、平滑数据分布（缓解 off-policy 漂移）。
4. **Q 学习为何过估计？** max 对含噪估计只取高不取低，噪声被系统性放大并经自举传播；Double DQN 把「选动作」与「评估」分开。
5. **致命三要素是什么？** 函数近似 + 自举 + off-policy 同时出现时无收敛保证——DQN 的组件本质是在缓解它。
6. **为什么 Q 学习不能直接做连续动作？** 目标里有 $\max_a$，连续空间无法枚举；需要 DDPG（确定性策略当 argmax）或改用策略梯度。

---

## 延伸阅读

- Mnih et al., *Human-level Control through Deep RL (DQN)*, 2015
- van Hasselt et al., *Deep RL with Double Q-learning*, 2016
- Sutton & Barto, *Reinforcement Learning: An Introduction* §11（ deadly triad 与 off-policy 学习）
