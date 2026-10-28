# GAN 深读：最优判别器、JS 散度与训练玄学

这篇是 **GAN 生成对抗网络**主题的深度补充。GAN 的直觉（造假者 vs 鉴别家）人人会讲，但**为什么这个博弈的全局最优恰好是真实分布、训练为什么这么难**——这两问的答案都在公式里。

> [!KEY] 一句话抓住本质
> GAN 同时训练两个网络：G 把噪声变成样本，D 给样本打「真/假」分。固定 G 时最优判别器是 $D^*(x) = p_{\text{data}}(x) / (p_{\text{data}}(x) + p_g(x))$，代入后博弈值正比于 **JS 散度**——所以训练 G 就是在最小化两个分布的 JS 距离。

---

## 一、极小极大目标

$$\min_{G}\;\max_{D}\; V(D, G) = \text{E}_{x\sim p_{\text{data}}}\left[\log D(x)\right] + \text{E}_{z\sim p_z}\left[\log(1 - D(G(z)))\right]$$

读法：

- **内层 max（D 的视角）**：真样本 $D(x)$ 越接近 1 越好，假样本 $D(G(z))$ 越接近 0 越好——二分类交叉熵。
- **外层 min（G 的视角）**：G 希望「D 把假样本判真」，即 $D(G(z)) \to 1$，也就是让 $\log(1-D(G(z)))$ 变大（损失变小）。

> [!WARN] 论文里的一个坑
> 原论文外层用的是 $\min_G \max_D$，但**实际训练用「非饱和」损失**：G 最大化 $\log D(G(z))$ 而不是最小化 $\log(1-D(G(z)))$。两者理论最优相同，但前者的梯度在「D 很自信地识破 G」时不会消失——早期训练 G 很烂、D 全对，饱和版梯度趋近 0，G 直接学不动。

**最优判别器的形状**——正文推导的解析解 $D^* = p_d/(p_d+p_g)$ 代进两个分布就能看见：

```python
import numpy as np
grid = np.linspace(-3, 3, 400)
norm = lambda m, s: np.exp(-0.5*((grid-m)/s)**2)/(s*np.sqrt(2*np.pi))
pd = 0.5*norm(-1, 0.3) + 0.5*norm(1, 0.3)    # 双峰 p_data
pg = norm(0, 1.0)                            # 单峰 p_g（还没学会双峰）
D = pd / (pd + pg)                           # 最优判别器
print(D[np.argmin(abs(grid-1))].round(3),    # 数据峰值处 ≈0.73：偏向「真」
      D[np.argmin(abs(grid))].round(3))      # 重叠谷底 ≈0.01：一眼识破
# 当 p_g 离 p_data 远，D≈0 处 log(1−D) 的梯度≈0（饱和）；换 −log D 梯度≈1/p_g——
# 这正是「非饱和损失」存在的理由
```

---

## 二、最优判别器：一步步推

**第一步：固定 G，求最优 D。** 对单个 $x$，$D(x) \in (0,1)$，$V$ 中与 $D(x)$ 相关的两项是：

$$p_{\text{data}}(x)\log D(x) + p_g(x)\log(1 - D(x))$$

对 $D(x)$ 求导置零（注意 $\frac{d}{dt}\log(1-t) = -\frac{1}{1-t}$）：

$$\frac{p_{\text{data}}(x)}{D(x)} - \frac{p_g(x)}{1 - D(x)} = 0 \;\;\Rightarrow\;\; D^*(x) = \frac{p_{\text{data}}(x)}{p_{\text{data}}(x) + p_g(x)}$$

直觉读法：**D 的最优答案就是贝叶斯后验**——「这个样本来自真实数据的概率」。两个分布完全重合时 $D^* = 1/2$（瞎猜，也就是分不出真假）。

**第二步：把 $D^*$ 代回博弈值。** 做变量代换后可以化简为：

$$V(G, D^*) = -\log 4 + 2\cdot\text{JS}(p_{\text{data}} \| p_g)$$

其中 JS 是 Jensen–Shannon 散度（两个 KL 的平均，恒 $\ge 0$，当且仅当两分布相等时取 0）。

**结论**：$\min_G V(G, D^*) \Leftrightarrow \min_G \text{JS}(p_{\text{data}}\|p_g)$，全局最优 $p_g = p_{\text{data}}$，此时 $D^* \equiv 1/2$，博弈值 $-\log 4 \approx -1.386$。**GAN 理论上是在最小化一个合法的分布距离。**

---

## 三、那训练为什么还是难？

理论上完美，实践中著名地难训。三个结构性原因：

### 3.1 JS 散度在高维空间的病态

当 $p_{\text{data}}$ 与 $p_g$ 的支撑不相交（高维低样本量下几乎必然），**JS 是常数** $\log 2$——梯度为 0，G 失去学习信号。这不是实现 bug，是目标函数本身的性质（WGAN 论文的核心论证）。

### 3.2 模式崩溃（mode collapse）

G 发现某个输出能骗过 D，就把**所有噪声都映射到这一个模式**——生成多样性坍缩。以 0-9 数字生成为例：G 只会写「8」，D 短期内挑不出毛病。根源：G 的目标只要求「骗过 D」，**不要求覆盖全部数据分布**；博弈存在许多「G 偷懒也能活」的局部均衡。

### 3.3 博弈的不稳定性

两个网络交替上升，没有单一的全局损失单调下降——训练轨迹是动力学系统而不是优化问题。D 太强 → G 梯度消失；D 太弱 → G 收到垃圾信号。失衡是常态。

> [!TIP] 工程上的稳定器清单（DCGAN 以来的经验结晶）
> - 用 **LeakyReLU**（两个网络都用），别用 ReLU/池化
> - 生成器输出用 **Tanh**，判别器输出直接 logits（配合 BCEWithLogitsLoss）
> - **标签平滑**：真样本标 0.9 而不是 1
> - D 的学习率可以比 G 大（TTUR，如 4:1）
> - 批归一化 / 谱归一化（spectral norm）限制 D 的 Lipschitz 常数
> - 历史样本池（buffer）防止 D 只针对 G 的「最新一招」

---

## 四、WGAN：换一个距离就好了吗？

Wasserstein GAN 的诊断：JS 不连续导致梯度缺失，而**推土机距离（W1）**即使分布不相交也连续可导，能提供有意义的梯度。问题在于 W1 直接算不动，需要 Kantorovich–Rubinstein 对偶：

$$W(p_{\text{data}}, p_g) = \sup_{\lVert f\rVert_L \le 1}\; \text{E}_{p_{\text{data}}}[f(x)] - \text{E}_{p_g}[f(x)]$$

限制条件「$f$ 是 1-Lipschitz」实现上很麻烦：权重裁剪（WGAN）太粗暴，**梯度惩罚 WGAN-GP**（对插值样本加 $\left(\lVert\nabla_x f\rVert - 1\right)^2$ 惩罚）是标准做法。判别器改名 critic（不再输出概率，输出无界的打分）。

实战定位：WGAN-GP 的 loss 数值与生成质量相关（能当监控指标用），训练更平稳；但调好后的大多数现代任务里，原生 GAN + 非饱和损失 + 上面那张稳定器清单依然能打。

---

## 五、怎么评价生成质量：IS 与 FID

生成模型没有「准确率」，常用两个分布距离代理：

| 指标 | 思路 | 问题 |
|---|---|---|
| **IS（Inception Score）** | 用预训练分类器给生成图分类：类别分布要**尖锐**（图质量高）、边际分布要**均匀**（多样性好） | 只看生成分布，不看真实数据；依赖 InceptionNet 的偏见 |
| **FID（Fréchet Inception Distance）** | 把真图与假图都过 Inception 提特征，假设特征高斯，算两个高斯的 Fréchet 距离 | 仍是特征空间的代理；样本少时高估 |

$$\text{FID} = \lVert\mu_r - \mu_g\rVert^2 + \text{Tr}\left(\Sigma_r + \Sigma_g - 2(\Sigma_r\Sigma_g)^{1/2}\right)$$

**FID 越低越好**，是当前论文标配。注意 FID 对模式崩溃敏感（协方差项惩罚多样性损失），但它是「代理指标」——FID 低不等于人眼看着好。

---

## 六、GAN 的遗产

GAN 的对抗范式衍生出一大家子：Pix2Pix / CycleGAN（图像翻译，用成对/循环一致性损失替代显式对齐）、StyleGAN 系列（风格注入 + 逐级分辨率，人脸生成的巅峰）、SRGAN（超分）。但在纯「文生图」赛道，GAN 已被扩散模型接棒——训练稳定性与模式覆盖是决定性因素。GAN 的残存优势是**一次前向的采样速度**，所以「GAN 蒸馏扩散模型」（如 SD-Turbo 一致性模型路线）成了新分工：扩散负责教，GAN/蒸馏负责快。

---

## 常见误区

- **「GAN 的生成器和判别器是零和博弈（一个赢一个输）」** —— 原始 GAN 的目标确实接近零和，但实践中使用非饱和损失（生成器最大化 log D(G(z)) 而非最小化 log(1−D(G(z))))——这使得博弈不再是严格的零和。
- **「判别器越强生成器学得越好」** —— 判别器过强 → 生成器收到的梯度趋近于零 → 生成器学不到东西；判别器需要被适当限制（谱归一化/label smoothing）。
- **「模式崩溃 = GAN 只能生成一张图」** —— 模式崩溃是「只生成少数几种输出类型」而非「只生成一张」——例如人脸生成中只生成几类面孔但每种面孔内有变化。
- **「GAN 只能生成图像」** —— GAN 已用于音频（WaveGAN）、分子生成、时间序列——但文本的离散性使 GAN 效果受限（已被自回归模型取代）。

## 七、要点总结

1. **最优判别器形式？** $D^*(x) = p_{\text{data}}/(p_{\text{data}}+p_g)$，即贝叶斯后验；全局最优时 $D^*=1/2$。
2. **GAN 等价于最小化什么？** JS 散度（原生 GAN）；WGAN 换成 Wasserstein-1。
3. **为什么用非饱和损失？** 早期 D 太强时 $\log(1-D(G(z)))$ 梯度消失，改最大化 $\log D(G(z))$ 保住梯度。
4. **模式崩溃是什么、怎么办？** G 收敛到少数模式；缓解靠 mini-batch discrimination、unrolled training、经验回放、多样性正则，根治要靠换目标（扩散模型）。
5. **WGAN-GP 惩罚什么？** 对真假样本的插值点，约束 critic 梯度范数接近 1（软化 1-Lipschitz 条件）。
6. **为什么不用 VAE 的似然来评 GAN？** GAN 是隐式生成模型，$p_g(x)$ 无显式密度，似然算不出——所以只能用 FID/IS 这类采样式指标。

---

## 延伸阅读

- Goodfellow et al., *Generative Adversarial Nets*, 2014（第二节推导即论文 Proposition 1）
- Arjovsky & Bottou, *Towards Principled Methods for Training GANs*, 2017（支撑不相交的病理分析）
- Arjovsky et al., *Wasserstein GAN*, 2017；Gulrajani et al., *Improved Training of WGANs (GP)*, 2017
- Karras et al., *A Style-Based Generator Architecture (StyleGAN)*, 2019
