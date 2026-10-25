# EM 深读：从 Jensen 不等式到收敛性证明

这篇是 **EM 算法与高斯混合**主题的深度补充。上面标签页讲了「E 步猜归属、M 步更新参数」的操作，这里回答三个更根本的问题：**EM 为什么必然收敛**、**它和 VAE 的 ELBO 是什么关系**、**K-Means 为什么是它的极限**。

> [!KEY] 一句话抓住本质
> 含隐变量的似然算不动（要对 z 积分），EM 的做法是：用 Jensen 不等式给似然造一个**可以下界**（ELBO），**E 步把下界顶紧**（固定参数选最好的 q），**M 步抬高下界**（固定 q 最大化参数）——下界 ≤ 似然且每轮上升，似然就被「托着」单调上升。

---

## 一、问题的形状：隐变量把似然变成算不动的积分

观测 $x$、隐变量 $z$（如每个点属于哪个高斯）。想要的最大似然：

$$\log p_\theta(x) = \log \int p_\theta(x, z)\,dz$$

积分没有闭式、数值采样在高维失效。**路径**：引入任意分布 $q(z)$，把 log 拆成两项：

$$\log p_\theta(x) = \text{ELBO}(q, \theta) + \text{KL}\left(q(z)\,\|\,p_\theta(z|x)\right)$$

其中（推导用一次 Jensen 或恒等变形）：

$$\text{ELBO} = \text{E}_{q(z)}\left[\log\frac{p_\theta(x, z)}{q(z)}\right]$$

两个直接推论：

1. KL ≥ 0 ⟹ **ELBO 是似然的下界**；
2. 固定 $\theta$，让 ELBO 最大的 $q$ 恰是**真后验** $q = p_\theta(z|x)$（此时 KL=0，下界贴住似然）。

---

## 二、两步各自在干什么（并证明单调性）

**E 步（顶紧下界）**：固定 $\theta$，取 $q^*(z) = p_\theta(z|x)$。这一步**不改变似然**，只把 KL 归零——下界从下面贴到似然身上。

**M 步（抬高下界）**：固定 $q^*$，关于 $\theta$ 最大化 ELBO。因为下界此刻与似然重合，抬高下界**至少不会降低似然**：

$$\log p_{\theta_{t+1}}(x) \;\ge\; \text{ELBO}(q^*, \theta_{t+1}) \;\ge\; \text{ELBO}(q^*, \theta_t) \;=\; \log p_{\theta_t}(x)$$

三连不等式就是 EM 的**单调性证明**——似然每轮不降（最差原地踏步）。加上参数空间的正则性条件（或简单的「每轮严格上升或停止」），EM 收敛到对数似然的驻点（通常是局部最优）。

> [!TIP] 用一张图记住
> 想象似然是一条天花板曲线，ELBO 是一条贴着它的橡皮膜：E 步把膜**吸上去贴住天花板**（当前位置），M 步把膜**顶高**——天花板（似然）只能跟着被托上去或不动。VAE 与 EM 的全部区别在于：VAE 承认「贴住真后验太难」，用神经网络近似，且每步只做**一次联合的 SGD 上升**。

---

## 三、GMM：M 步闭式解从哪来

对高斯混合，E 步的责任度就是后验的显式形式：

$$r_{ik} = p(z_i = k | x_i) = \frac{\pi_k\,N(x_i;\mu_k,\Sigma_k)}{\sum_j \pi_j\,N(x_i;\mu_j,\Sigma_j)}$$

M 步对 $\mu_k, \Sigma_k, \pi_k$ 最大化 ELBO，拉格朗日处理 $\sum\pi=1$，得到一组「责任度加权统计量」：

$$\mu_k = \frac{\sum_i r_{ik}x_i}{\sum_i r_{ik}},\qquad \pi_k = \frac{\sum_i r_{ik}}{n},\qquad \Sigma_k = \frac{\sum_i r_{ik}(x_i-\mu_k)(x_i-\mu_k)^{\text{T}}}{\sum_i r_{ik}}$$

全部是「软计数」版的样本均值/协方差/频率——**当 $r_{ik}$ 退化为 0/1（最近质心），这组公式精确变成 K-Means 的更新**。这就是「K-Means 是 GMM 的硬分配极限」的数学含义：把 $\Sigma_k = \epsilon I$ 且 $\epsilon \to 0$，责任度就 one-hot 化。

**实践警告**：$\Sigma_k$ 在小簇/高维下奇异（$|\Sigma|\to 0$，似然爆炸到 ∞）——标准补丁是加正则 $\Sigma_k \leftarrow \Sigma_k + \lambda I$（sklearn 的 `reg_covar`）。初值用 k-means++ 的聚类结果，比随机初始化稳得多。

---

## 四、EM 的家族谱系

| 模型 | 隐变量 | E 步 | M 步 |
|---|---|---|---|
| GMM | 簇归属 | 责任度（闭式） | 加权统计量（闭式） |
| K-Means | 硬归属 | 最近质心 | 簇均值 |
| HMM | 状态序列 | 前向-后向算法 | Baum-Welch 重估 |
| LDA | 词的主题 | ——（坍缩后不可解析，改用吉布斯采样/变分） | —— |
| VAE | 连续 z | **变分近似**（编码器网络） | 与 E 步合并为联合 SGD |
| 缺失值填充 | 缺失元素 | 填充条件期望 | 完整数据的 MLE |

规律：**E 步能闭式就闭式（EM 快、准），算不动就近似**——采样式（Gibbs，见 LDA 深读）或变分式（VAE）。变分推断（VI）就是「E 步限定在某易解分布族里找最好 q」的一般化，ELBO 一词也因此从 EM 内部构件升格为整个领域的通用语言。

---

## 五、面试要点速答

1. **EM 单调性的证明思路？** 似然 = ELBO + KL；E 步 KL→0（下界贴紧，似然不变），M 步抬 ELBO，抬高的下界托着似然不降。
2. **E 步输出的「责任度」是什么？** 固定参数下的后验 $p(z_i=k|x_i)$，软归属概率。
3. **K-Means 与 GMM 的极限关系？** $\Sigma_k=\epsilon I,\ \epsilon\to 0$ 时责任度 one-hot 化，M 步公式退化为均值更新。
4. **EM 一定找到全局最优吗？** 不保证；收敛到驻点，初值敏感，常用 k-means 初始化 + 多次重启。
5. **EM 与 VAE 的关系？** 同一个 ELBO 框架；VAE 用神经网络近似 E 步（后验不可解析时）、E/M 合并成联合梯度上升，牺牲精确性换可扩展性。
6. **什么时候不该用 EM？** 隐变量空间太大/后验多峰严重时（EM 易陷局部，采样或变分更合适）；或 M 步无闭式（退化为广义 EM，只要求 ELBO 上升）。

---

## 延伸阅读

- Dempster, Laird & Rubin, *Maximum Likelihood from Incomplete Data via the EM Algorithm*, 1977
- Bishop, *PRML* §9.3（本篇推导的教材版）
- Neal & Hinton, *A View of the EM Algorithm that Justifies Incremental, Sparse, and Other Variants*, 1998（ELBO 视角的统一）
