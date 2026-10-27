# VAE 深读：ELBO、重参数化与后验坍缩

这篇是 **VAE 变分自编码器**主题的深度补充。目标：读懂 ELBO 的两种推导、亲手算出高斯特例下的损失函数、理解「后验坍缩」这个 VAE 最著名的毛病。

> [!KEY] 一句话抓住本质
> VAE 学的是一个**带隐变量的概率模型** $p_\theta(x) = \int p_\theta(z)p_\theta(x|z)\,dz$。因为积分算不了，引入近似后验 $q_\phi(z|x)$，转而最大化证据下界 ELBO——**「重构得好」+「先验匹配得好」**两项的加权和。

---

## 一、生成模型想要什么

所有生成模型的共同目标：学出数据分布 $p(x)$，然后从中采样。自编码器只学了一个压缩函数，「生成」无从谈起——解码器只认训练过的编码，随机采一个 $z$ 喂进去通常得到噪声。

VAE 的改造：给隐空间一个**先验分布** $p(z) = N(0, I)$，生成时从先验采样 $z \sim N(0,I)$，再经解码器 $p_\theta(x|z)$ 生成。只要把模型 $p_\theta(x)$ 训得贴近数据分布，采样就有意义。

训练目标就是**最大化对数似然** $\log p_\theta(x)$。

---

## 二、为什么不能直接优化：算不动的积分

$$\log p_\theta(x) = \log \int p_\theta(z)\, p_\theta(x|z)\, dz$$

$z$ 是连续向量，积分没有解析解；枚举蒙特卡洛又会在高维空间遭遇「维度灾难」——绝大多数 $z$ 对该 $x$ 的似然近乎 0，采样效率极低。

思路转变：既然**真后验** $p_\theta(z|x)$（「看到 $x$ 后 $z$ 应该是什么分布」）也算不动，那就**再引入一个神经网络 $q_\phi(z|x)$ 去近似它**——这就是「变分」二字的含义：用一族可优化的分布去逼近不可解的量。

---

## 三、ELBO 推导（两条路，结论一致）

### 3.1 路 A：Jensen 不等式

从 $\log p_\theta(x) = \log \int q_\phi(z|x)\,\frac{p_\theta(x,z)}{q_\phi(z|x)}\,dz$ 出发，把积分看成对 $q_\phi$ 的期望，再用 Jensen（$\log$ 是凹函数，期望的 $\log \ge$ $\log$ 的期望）：

$$\log p_\theta(x) \ge \text{E}_{q_\phi(z|x)}\left[\log \frac{p_\theta(x,z)}{q_\phi(z|x)}\right] \quad\text{（这就是 ELBO，证据下界）}$$

### 3.2 路 B：拆成重构项 + KL 项（更有用）

把联合 $p_\theta(x,z) = p_\theta(x|z)p(z)$ 代入 ELBO 并拆开：

$$\text{ELBO} = \text{E}_{q_\phi(z|x)}\left[\log p_\theta(x|z)\right] - \text{KL}\left(q_\phi(z|x)\,\|\,p(z)\right)$$

同时可以证明恒等式：

$$\log p_\theta(x) = \text{ELBO} + \text{KL}\left(q_\phi(z|x)\,\|\,p_\theta(z|x)\right)$$

> [!KEY] 这行恒等式解释了一切
> KL 项 $\ge 0$，所以 ELBO 是似然的**下界**；当 $q_\phi(z|x)$ 完美逼近真后验时 KL = 0，下界变紧。**最大化 ELBO 同时做了两件事：抬高似然下界 + 让近似后验贴住真后验。**

两项是**拔河**关系：重构项希望 $z$ 编码尽可能多的信息（$q$ 方差小、均值分得开），KL 项希望所有 $q(z|x)$ 都挤向 $N(0,I)$。VAE 生成的「模糊感」正来自这个拉扯——模型宁可输出各处都差不多的均值，也不愿冒方差大的风险。

---

## 四、重参数化：让采样可以求导

ELBO 的重构项要对 $z \sim q_\phi(z|x)$ 采样求期望，但「采样」不可导——梯度传不到编码器 $\phi$。

重参数化技巧：把随机性从计算图里**剥离**到独立噪声上：

$$z = \mu_\phi(x) + \sigma_\phi(x) ⊙ \varepsilon,\qquad \varepsilon \sim N(0, I)$$

现在 $\mu$、$\sigma$ 都是计算图内的确定节点，梯度畅通；随机性全部集中在与参数无关的 $\varepsilon$ 上。蒙特卡洛估计也变成了低方差的形式（对 $\varepsilon$ 采样一次即可估计整个期望）。

> [!TIP] 这个技巧是共享的
> 重参数化不是 VAE 专利：扩散模型的 $x_t = \sqrt{1-\beta_t}\,x_{t-1} + \sqrt{\beta_t}\,\varepsilon$、策略梯度里的 reparameterization trick、某些 Gumbel-Softmax 离散松弛，核心思想完全相同——**把「采样」改写成「确定性函数 × 外部噪声」**。

---

## 五、高斯特例：损失函数到底长什么样

工程实现里，解码器输出高斯 $p_\theta(x|z) = N(\mu_\theta(z), \sigma^2 I)$、编码器输出对角高斯 $q_\phi(z|x) = N(\mu, \text{diag}(\sigma^2))$ 时，两项都有闭式解：

**重构项**：高斯对数似然展开后，就是（常数因子的）**平方误差**：

$$\text{E}\left[\log p_\theta(x|z)\right] \propto -\lVert x - \hat{x}\rVert^2$$

（若把输出方差设为可学习，就得到加权 MSE，$\sigma$ 还能自动平衡各维度的噪声水平。）

**KL 项**：两个对角高斯之间的 KL 有解析解：

$$\text{KL} = \frac{1}{2}\sum_{j=1}^{d}\left(\mu_j^2 + \sigma_j^2 - \log\sigma_j^2 - 1\right)$$

所以最终 loss 就一行：

```python
loss = ((x - x_hat)**2).sum(dim=1).mean() \
     + 0.5 * (mu**2 + sigma2 - torch.log(sigma2) - 1).sum(dim=1).mean()
```

没有一行涉及采样技巧——采样只发生在前向算 $z$ 时，损失本身全是闭式。

---

## 六、后验坍缩与三大后续工作

### 6.1 后验坍缩（posterior collapse）

现象：解码器足够强时，训练会收敛到 $q_\phi(z|x) \approx N(0,I)$——**对所有 $x$ 输出同一个后验**。KL 项归零，$z$ 不再携带任何 $x$ 的信息，生成退化为无条件的自回归模型，「变分」部分名存实亡。

原因：KL 项把 $q$ 拉向先验的梯度，比对重构项的梯度更稳定直接；强大解码器不需要 $z$ 也能记住训练集。

缓解：KL 退火（训练早期给 KL 项加权 $\beta: 1 \to 0$ 逐渐升）、free bits（每维 KL 低于阈值就不惩罚）、 weakening decoder（加 dropout / 缩小解码器）。

### 6.2 β-VAE

把 KL 项乘上系数 $\beta > 1$：更紧的先验约束换来**更解耦的隐空间**——不同隐维度趋向编码独立的变化因子（位置/姿态/颜色）。代价是重构变差。这是「可控生成/表示学习」方向的起点。

### 6.3 VQ-VAE：把「变分」换成「向量量化」

隐空间不再是连续高斯，而是一个**码本**：编码器输出最近邻查表得到离散 code。训练用 straight-through estimator 传梯度。收益：离散隐空间天然适配自回归先验（PixelCNN 对 code 序列建模），且完全没有后验坍缩。VQ-VAE-2 与 DALL·E 的第一阶段都用它——**先把图压成离散 token 序列，再交给自回归模型**。

---

## 常见误区

- **「VAE 的隐空间是「有意义的语义空间」（每个维度对应一个可解释属性）」** —— 标准 VAE 的隐空间维度是**纠缠的**（entangled）——每个维度可能混合多个语义因子；解纠缠需要 β-VAE 或显式因子分解。
- **「VAE 的 KL 项只是正则化可以随意删掉」** —— KL 项是 VAE 的**核心**：没有 KL 就退化为普通 AE（隐空间无分布约束，无法采样生成）——KL 项使得隐空间接近先验 N(0,I)，是「可采样」的前提。
- **「VAE 生成的图像模糊是因为模型不够大」** —— 模糊的根源是**重建损失（通常 MSE）+ 后验坍缩**的权衡，与模型大小无关——更大模型只让模糊的图像更清晰但不会变得锐利（GAN/扩散模型解决了锐度问题）。
- **「ELBO 中的 KL 项在训练后期趋近于零（后验=先验）」** —— 这是**后验坍缩**（posterior collapse） pathology，不是理想状态——后验坍缩意味着编码器不提供信息（解码器忽略 z）。

## 七、要点总结

1. **ELBO 的两个分解项分别是什么？** 重构项（$q$ 采样下 $\log p(x|z)$ 的期望）+ 先验正则项（$-\text{KL}(q(z|x)\|p(z))$）。
2. **为什么需要重参数化？** 采样不可导；把 $z$ 写成 $\mu + \sigma\varepsilon$ 后梯度绕过随机节点直达编码器。
3. **VAE 生成为什么模糊？** 高斯似然的最优解是条件均值；ELBO 的 KL-重构拉扯让模型偏好保守输出；像素级 MSE 对「多模态真值」的天然平均。
4. **后验坍缩的机理与对策？** 强解码器 + KL 梯度占优 → $q$ 塌向先验；对策是 KL 退火 / free bits / 削弱解码器。
5. **VAE 与自编码器的本质区别？** AE 学压缩函数（无分布、不能生成）；VAE 学生成模型的参数 + 近似后验，隐空间被先验正则化，可采样、可插值。
6. **VAE 与 GAN/DDPM 的定位差异？** VAE：隐变量表示学习 + 似然下界；GAN：对抗博弈、无显式似然；DDPM：固定加噪 + 大迭代步去噪，质量最高但采样最慢。

---

## 延伸阅读

- Kingma & Welling, *Auto-Encoding Variational Bayes*, 2013（原始论文，第三节的推导就是论文附录 B）
- Doersch, *A Tutorial on Variational Autoencoders*, 2016（最友好的完整教程）
- Higgins et al., *β-VAE*, 2017；van den Oord et al., *Neural Discrete Representation Learning (VQ-VAE)*, 2017
