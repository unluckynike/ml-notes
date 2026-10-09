# 扩散模型深入：从加噪到生成

这篇是**扩散模型**主题的深度补充。如果你还没看过上面的「核心思想」标签页，建议先花两分钟看一遍——那里讲的是直觉，这里讲的是**为什么公式长这样**。

> [!KEY] 一句话抓住本质
> 扩散模型干的事：把「一步生成图像」这个**太难学的映射**，拆成「一千步各自去一点噪」这个**很容易学的小任务**。每一步只需要预测一点点噪声，但连起来就能从纯噪声里雕出图。

---

## 一、为什么还需要扩散模型？

在扩散模型（2020）之前，生成模型主要是两大派：

| 流派 | 代表 | 优势 | 致命问题 |
|---|---|---|---|
| **GAN** | StyleGAN、BigGAN | 采样快（一次前向）、图像锐利 | 训练不稳定、**模式崩溃**（只会生成少数几种样本）、难调 |
| **VAE** | β-VAE、VQ-VAE | 训练稳定、有概率解释 | 生成**模糊**（高斯似然假设 + 重构项主导） |
| **自回归** | PixelCNN | 似然可精确计算 | 采样**极慢**（逐像素）、无法并行 |

扩散模型的目标是**同时拿到「训练稳定」和「生成质量高」**：

- 训练目标就是一个**回归损失**（预测噪声），没有对抗、没有博弈 → 稳定
- 每一步只做微小的去噪，**模式覆盖完整**（不易模式崩溃）
- 代价是**采样慢**（要迭代几百上千步）——这也是后续 DDIM、蒸馏等工作要解决的核心问题

> [!NOTE] 和 GAN 的比喻对比
> GAN 像「造假者与警察对抗」——紧张、容易崩。扩散像「把照片一步步复印糊掉，再训练一个修复师倒着修回来」——枯燥但可靠。

---

## 二、前向过程：把数据变成噪声

前向过程（forward process）也叫**扩散过程**，是一个**固定的、不学习的**马尔可夫链：每一步往数据里加一点高斯噪声。

### 2.1 单步加噪

$$x_t = \sqrt{1-\beta_t}\, x_{t-1} + \sqrt{\beta_t}\,\varepsilon,\qquad \varepsilon \sim N(0, I)$$

其中 $\beta_t \in (0,1)$ 是第 $t$ 步的**噪声方差**（noise variance），$\beta_1 \ldots \beta_T$ 合起来叫**噪声调度**（noise schedule）。

系数 $\sqrt{1-\beta_t}$ 和 $\sqrt{\beta_t}$ 的设计不是随便写的——它们保证**方差守恒**：

$$(1-\beta_t) + \beta_t = 1$$

也就是说，加噪不会让数据的数值尺度越滚越大或越来越小，始终是「原来是能量 1，现在拆成 信号部分 + 噪声部分」。

### 2.2 为什么需要重参数化（reparameterization）

注意上面这一句 `x_t = 均值 + 标准差 × ε`——这就是**重参数化技巧**的形态。它的作用有两个：

1. **让采样可微**：如果把「从 $N(\mu,\sigma^2)$ 采样」当成一个黑盒操作，梯度传不过去；写成 $\mu + \sigma\varepsilon$ 后，$\mu$ 和 $\sigma$ 都在计算图里，可以正常求导。
2. **把随机性剥离出来**：随机性全部集中在 $\varepsilon$ 上，网络只需要学 $\mu$、$\sigma$ 这类确定性的量。

这个技巧不是扩散模型发明的，VAE 里就在用，扩散模型直接继承了过来。

### 2.3 闭式解：一步跳到任意时刻

如果只能一步步加噪，那训练时每次都要跑 $t$ 步，太慢。幸运的是**高斯分布的叠加还是高斯分布**，所以可以推导出闭式解。

记 $\alpha_t = 1 - \beta_t$，并定义累积乘积：

$$\bar{\alpha}_t = \prod_{s=1}^{t} \alpha_s$$

那么可以直接从 $x_0$ 跳到任意时刻 $t$：

$$x_t = \sqrt{\bar{\alpha}_t}\, x_0 + \sqrt{1-\bar{\alpha}_t}\,\varepsilon,\qquad \varepsilon \sim N(0, I)$$

> [!TIP] 这个式子为什么是全文最重要的
> 因为**训练时只用到它**。每次训练只需要：随机抽一个 $t$、随机抽一个 $\varepsilon$、用上面这个式子一步算出 $x_t$——不需要真的迭代 $t$ 次。
> 这就是扩散模型训练能并行的根本原因。

**它的两个极端**：
- $t = 0$：$\bar\alpha_0 = 1$，$x_0 = x_0$（原始数据）
- $t = T$：$\bar\alpha_T \to 0$，$x_T \approx \varepsilon \sim N(0,I)$（纯噪声，和数据无关了）

所以只要 $T$ 够大、调度设计合理，**最终一定会变成标准正态噪声**——这正是采样时可以从 $N(0,I)$ 出发的原因。

### 2.4 噪声调度的选择

$\beta_t$ 怎么取是门学问。常见三种：

| 调度 | 公式 / 特点 | 问题 |
|---|---|---|
| **线性**（DDPM 原始） | $\beta_t$ 从 $1e^{-4}$ 线性增到 $0.02$ | 末端加噪过快，低分辨率下信息破坏太早 |
| **余弦**（Improved DDPM） | $\bar\alpha_t = \cos^2\!\big(\frac{t/T+s}{1+s}\cdot\frac{\pi}{2}\big)$ | 更平滑，$T$ 可以更小 |
| **Sigmoid / 缩放线性** | 在两端更平缓 | 工程实现细节更多 |

> [!WARN] 一个常见误解
> 很多人以为 $\beta_t$ 越大越好（加噪越猛越彻底）。实际上**加噪太快会让模型没机会学中间过程**，加噪太慢又浪费步数。调度是扩散模型里少数需要认真调的超参数之一。

---

## 三、逆向过程：从噪声还原数据

逆向过程（reverse process）是我们**真正要学习**的部分，它也是一个马尔可夫链，但方向相反：$x_T \to x_{T-1} \to \cdots \to x_0$。

### 3.1 关键假设：逆向也是高斯

严格来说，真实逆向分布 $q(x_{t-1}|x_t)$ 是**难以计算的**（需要对整个数据集求积分）。

但可以证明：**当 $\beta_t$ 足够小时，逆向条件分布近似为高斯**。于是我们用神经网络去拟合它：

$$p_\theta(x_{t-1}\mid x_t) = N\big(x_{t-1};\ \mu_\theta(x_t,t),\ \Sigma_\theta(x_t,t)\big)$$

### 3.2 均值怎么算：从「预测 x₀」到「预测 ε」

经过推导（见下节），可以得到均值的一个漂亮形式：

$$\mu_\theta(x_t,t) = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\varepsilon_\theta(x_t,t)\right)$$

读一下这个式子：**从 $x_t$ 里减去「网络预测出来的噪声」，再缩放回上一步的尺度**。

所以网络的任务被简化成一句话：

> [!KEY] 网络只需要做一件事
> **给定带噪图像 $x_t$ 和时刻 $t$，预测当初加进去的噪声 $\varepsilon$。**

这也解释了为什么扩散模型的输出维度和输入维度**完全一样**（都是图像维度）——它是个「去噪自编码器」形态的网络（通常用 U-Net）。

### 3.3 为什么预测 ε 比预测 x₀ 更好

理论上，让网络预测 $x_0$、预测 $\varepsilon$、预测 $v = \sqrt{\bar\alpha_t}\varepsilon - \sqrt{1-\bar\alpha_t}x_0$ 都是等价的（可以互相换算）。但实践上**预测 $\varepsilon$ 效果最好**，原因在于：

- **数值尺度更稳**：$x_0$ 的数值范围随数据集变化很大，而 $\varepsilon$ 永远是标准正态，尺度固定为 1。
- **各时刻任务难度更均衡**：预测 $x_0$ 在 $t$ 接近 $T$ 时几乎不可能（信息已经被破坏完了），损失会巨大且无意义；预测 $\varepsilon$ 在任何 $t$ 都是「从一堆东西里认出噪声」，难度相对可控。
- **和损失函数天然匹配**：$L_2$ 损失假设噪声是高斯的，而 $\varepsilon$ 确实是高斯的。

---

## 四、训练目标：从 ELBO 到一行公式

### 4.1 理论出发点

扩散模型的严格训练目标是**最大化对数似然的变分下界（ELBO）**：

$$L_{\text{ELBO}} = E_q\Big[\log p_\theta(x_0\mid x_1) - \sum_{t=2}^{T} KL\big(q(x_{t-1}\mid x_t,x_0)\,\|\,p_\theta(x_{t-1}\mid x_t)\big) - KL\big(q(x_T\mid x_0)\,\|\,p(x_T)\big)\Big]$$

不用怕这个式子，它的结构其实很清楚：

- 第一项：**重建项**（最后一步还原得像不像）
- 中间求和：**每一步的 KL 散度**（我们拟合的逆向分布和真实后验差多少）
- 最后一项：**先验匹配项**（$x_T$ 是否真的接近标准正态）——这一项和前向过程有关，**没有可训练参数，是个常数**，可以直接忽略

### 4.2 化简成 L2 回归

把中间那些 KL 项展开后（都是两个高斯之间的 KL），可以证明它们**等价于一个加权的均方误差**。再进一步，DDPM 论文发现：**把权重项直接扔掉，效果反而更好**。

于是得到了那个著名的简化损失：

$$L_{\text{simple}} = E_{t,\,x_0,\,\varepsilon}\Big[\big\|\,\varepsilon - \varepsilon_\theta\big(\sqrt{\bar\alpha_t}\,x_0 + \sqrt{1-\bar\alpha_t}\,\varepsilon,\ t\big)\big\|^2\Big]$$

翻译成大白话，**训练循环只有四行**：

1. 从数据集抽一个 $x_0$
2. 随机抽一个时刻 $t \sim \text{Uniform}(1,T)$
3. 随机抽噪声 $\varepsilon \sim N(0,I)$，算出 $x_t = \sqrt{\bar\alpha_t}x_0 + \sqrt{1-\bar\alpha_t}\varepsilon$
4. 让网络预测 $\varepsilon_\theta(x_t,t)$，做一次 MSE 反向传播

> [!TIP] 为什么说扩散模型训练特别省心
> 没有对抗、没有 EM、没有重要性采样——**就是一个带噪的回归问题**。这是它相比 GAN 最大的工程优势。

---

## 五、采样：怎么从噪声里「雕」出图

训练完了，怎么生成？从 $x_T \sim N(0,I)$ 出发，倒着走 $T$ 步。

### 5.1 DDPM 采样（随机）

```
x ← 采样自 N(0, I)
for t = T, T-1, ..., 1:
    ε̂ ← ε_θ(x, t)                          # 网络预测噪声
    x̂₀ ← (x − √(1−ᾱ_t)·ε̂) / √ᾱ_t           # 反推出对 x₀ 的估计
    μ ← (1/√α_t)·(x − (β_t/√(1−ᾱ_t))·ε̂)     # 上一步的均值
    if t > 1:
        z ← 采样自 N(0, I)
        x ← μ + σ_t · z                     # 加回一点随机性
    else:
        x ← μ
return x
```

注意 `σ_t = √β_t`（或 $\tilde\beta_t$）——**每一步都重新注入随机性**，所以 DDPM 是**随机**采样：同一个噪声起点，两次生成的结果不一样。

### 5.2 DDIM 采样（确定性、可加速）

DDIM 的核心观察是：**训练目标只约束了边缘分布 $q(x_t|x_0)$，并没有约束这个马尔可夫链具体怎么走**。所以我们可以换一条**非马尔可夫的、确定性的**采样路径：

$$x_{t-1} = \sqrt{\bar\alpha_{t-1}}\,\hat{x}_0 + \sqrt{1-\bar\alpha_{t-1}}\,\varepsilon_\theta(x_t,t)$$

它带来的好处：

- **确定性**：去掉随机项后，同一个起点永远生成同一张图（可以做插值、语义编辑）
- **可跳步**：因为不依赖马尔可夫性，可以只取 $t$ 的一个子序列（比如 1000 步里只走 50 步），**速度提升 20 倍**，质量下降很小

| 采样器 | 步数 | 随机性 | 质量 | 典型耗时 |
|---|---|---|---|---|
| DDPM | 1000 | 有 | 最好 | 慢 |
| DDIM | 20~100 | 无 | 接近 | 快 |
| DPM-Solver / UniPC | 10~20 | 无 | 接近 | 很快 |

---

## 六、Classifier-Free Guidance：怎么让生成「听话」

无条件扩散只会随机生成「像训练集的东西」。要让它按文本/类别生成，需要**引导（guidance）**。

### 6.1 做法

训练时**以一定概率（如 10%）把条件丢掉**（用空条件 $\varnothing$），让同一个网络同时学会「有条件」和「无条件」两种预测。采样时把两者外推：

$$\hat\varepsilon = \varepsilon_\theta(x_t,\varnothing) + w\cdot\big(\varepsilon_\theta(x_t,c) - \varepsilon_\theta(x_t,\varnothing)\big)$$

### 6.2 $w$ 在调什么

- $w = 1$：等价于普通条件生成
- $w > 1$：**放大条件的影响** → 更贴合 prompt，但**多样性下降、颜色容易过饱和**
- $w = 0$：退化成无条件生成

> [!NOTE] 这就是 Stable Diffusion 里那个 CFG Scale
> WebUI 上的 `CFG Scale`（默认 7 左右）就是这里的 $w$。调太高画面会「油腻」，调太低则不听话——这是最需要手感的参数之一。

---

## 七、从像素空间到潜空间：Stable Diffusion 的关键一步

在像素空间做扩散有两个问题：**算力爆炸**（512×512×3 的图像直接扩散，每步都要过一遍 U-Net）和**训练成本高**。

Stable Diffusion 的方案是**潜空间扩散（Latent Diffusion）**：

```
图像 x (512×512×3)
   ↓ VAE 编码器（冻结，8 倍下采样）
潜变量 z (64×64×4)          ← 扩散在这里进行
   ↓ UNet 逐步去噪（条件：CLIP 文本编码 + cross-attention）
干净潜变量 z₀
   ↓ VAE 解码器（冻结）
图像 x̂ (512×512×3)
```

三个组件各司其职：

| 组件 | 作用 | 是否训练 |
|---|---|---|
| **VAE** | 像素 ↔ 潜空间来回压缩 | 单独预训练后**冻结** |
| **UNet** | 在潜空间里预测噪声（带文本条件） | **扩散训练的主体** |
| **CLIP 文本编码器** | 把 prompt 变成条件向量 | 预训练后**冻结** |

> [!TIP] 8 倍下采样意味着什么
> 64×64 的潜空间比 512×512 的像素空间小了 **64 倍**。这就是为什么 Stable Diffusion 能在消费级显卡上跑，而像素空间的扩散模型不行。

---

## 八、PyTorch 代码骨架

### 8.1 噪声调度

```python
import torch

class Schedule:
    """线性噪声调度 + 预计算所有 ᾱ"""
    def __init__(self, T=1000, beta_start=1e-4, beta_end=0.02):
        self.T = T
        self.beta = torch.linspace(beta_start, beta_end, T)
        self.alpha = 1.0 - self.beta
        self.alpha_bar = torch.cumprod(self.alpha, dim=0)   # ᾱ_t = ∏ α_s

    def q_sample(self, x0, t, eps=None):
        """闭式解：一步从 x0 跳到 x_t"""
        if eps is None:
            eps = torch.randn_like(x0)
        ab = self.alpha_bar[t].view(-1, 1, 1, 1)
        return ab.sqrt() * x0 + (1 - ab).sqrt() * eps, eps
```

### 8.2 训练循环（核心只有几行）

```python
def train_step(model, schedule, x0, optimizer):
    B = x0.shape[0]
    t = torch.randint(0, schedule.T, (B,), device=x0.device)   # ① 随机时刻
    xt, eps = schedule.q_sample(x0, t)                          # ②③ 加噪
    eps_pred = model(xt, t)                                     # ④ 预测噪声
    loss = torch.nn.functional.mse_loss(eps_pred, eps)          # MSE 回归
    optimizer.zero_grad(); loss.backward(); optimizer.step()
    return loss.item()
```

> [!KEY] 就这么多
> 扩散模型的训练循环**没有任何特殊技巧**——一个 MSE、一次反向传播。所有复杂性都在「采样」和「条件注入」上。

### 8.3 DDPM 采样

```python
@torch.no_grad()
def sample(model, schedule, shape, device):
    x = torch.randn(shape, device=device)          # 从纯噪声出发
    for t in reversed(range(schedule.T)):
        t_batch = torch.full((shape[0],), t, device=device, dtype=torch.long)
        eps = model(x, t_batch)                     # 预测噪声

        ab = schedule.alpha_bar[t]
        ab_prev = schedule.alpha_bar[t - 1] if t > 0 else torch.tensor(1.0)

        # 均值：从 x_t 里减去预测噪声再缩放
        mean = (x - (1 - schedule.alpha[t]) / (1 - ab).sqrt() * eps) / schedule.alpha[t].sqrt()

        if t > 0:
            sigma = ((1 - ab_prev) / (1 - ab) * schedule.beta[t]).sqrt()
            x = mean + sigma * torch.randn_like(x)  # 重新注入随机性
        else:
            x = mean
    return x
```

---

## 九、常见误区与面试要点

- [x] 能写出**闭式解** $x_t = \sqrt{\bar\alpha_t}x_0 + \sqrt{1-\bar\alpha_t}\varepsilon$
- [x] 说清为什么要**预测 ε** 而不是直接预测 $x_0$
- [x] 知道 DDPM 和 DDIM 的区别是**马尔可夫性 vs 确定性路径**
- [ ] 能推导 ELBO 化到 $L_{\text{simple}}$ 的关键一步
- [ ] 能说清 CFG 的 $w$ 在放大什么、副作用是什么
- [ ] 能画清楚 Stable Diffusion 的三个组件和各自是否训练

### 几个高频误解

> [!WARN] 误区一：「扩散模型是在学数据分布」
> 更准确地说，它学的是**每一步的条件去噪分布** $p_\theta(x_{t-1}|x_t)$。整个链的乘积才隐含了数据分布，但网络本身只看单步。这解释了为什么它泛化好、也解释了为什么采样误差会累积。

> [!WARN] 误区二：「步数越多质量一定越好」
> 不是。当 $T$ 超过某个程度，相邻步之间的差异极小，网络几乎在学恒等映射——**浪费算力还难训**。这也是余弦调度能在 $T=1000$ 就够用、而线性调度需要 $T=4000$ 的原因。

> [!WARN] 误区三：「DDIM 只是 DDPM 的加速版」
> 更本质的区别是**确定性**。DDIM 的确定性让「潜空间插值」「图像编辑（SDEdit）」「DDIM Inversion」这些下游应用成为可能——这些在随机采样下很难做。

### 和其他生成模型的取舍

| 需求 | 选择 |
|---|---|
| 极致采样速度（单步） | GAN / 蒸馏后的扩散（LCM、SDXL-Turbo） |
| 生成质量 + 模式覆盖 + 训练稳定 | **扩散模型** |
| 需要似然、要概率解释 | VAE / 流模型 |
| 需要精细可控（文本、姿态、线稿） | **扩散 + ControlNet / LoRA** |

---

## 十、延伸阅读

- **DDPM 原始论文**：Ho et al., *Denoising Diffusion Probabilistic Models*, NeurIPS 2020 —— 简化损失的出处
- **DDIM**：Song et al., *Denoising Diffusion Implicit Models*, ICLR 2021 —— 确定性采样
- **Improved DDPM**：Nichol & Dhariwal, 2021 —— 余弦调度、学习方差
- **Latent Diffusion / Stable Diffusion**：Rombach et al., CVPR 2022 —— 潜空间方案
- **Lilian Weng 的博客**：*What are Diffusion Models?* —— 推导最清晰的综述之一
- **Classifier-Free Guidance**：Ho & Salimans, 2022 —— CFG 的原始论文

---

> [!TIP] 下一步怎么练
> 1. 先用本文的代码骨架在 MNIST / CIFAR-10 上**跑通一个 32×32 的 DDPM**，看损失曲线和采样效果
> 2. 把 DDPM 采样换成 DDIM，对比同样 50 步下的质量差异
> 3. 加上类别条件 + CFG，调 $w$ 感受「贴合度 vs 多样性」的权衡
> 4. 最后再去看 Stable Diffusion 的源码，会发现核心逻辑你已经全懂了
