# Stable Diffusion 深读：latent 空间、条件注入与 CFG

这篇是 **文生图 Stable Diffusion**主题的深度补充。SD 的流行不靠单个发明，而是三件成熟零件的组装：**在隐空间扩散（省 64 倍计算）+ U-Net 去噪 + 用交叉注意力把文字「焊」进去**。这篇按组装顺序讲清每个零件，以及 CFG 这个「最被低估的旋钮」。

> [!KEY] 一句话抓住本质
> Stable Diffusion = **VAE 压缩 + latent 扩散 + CLIP 文本条件**。512×512 的图先用 VAE 压成 64×64 的隐表示（计算量降 64 倍），扩散过程全在隐空间进行；文字条件通过**交叉注意力**注入每层 U-Net；采样时用 CFG 把「条件方向」外推放大——guidance scale 从 1 到 15，画的是「听话」和「好看」之间的权衡。

---

## 一、为什么搬到隐空间：LDM 的账

在像素空间做扩散，每步都要对 512×512×3 ≈ 78 万维做 U-Net 前向。LDM（Latent Diffusion，SD 的论文）的思路：**人眼能感知的细节远少于像素数**——用预训练 VAE 把图压到 64×64×4（下采样 8 倍）：

$$E(x) = z,\quad \hat{x} = D(z),\qquad z \in \text{R}^{64\times64\times4}$$

计算量按像素数比例降到 **1/64**（8² 倍空间下采样），而感知质量几乎无损（重建是 VAE 的活，不是扩散的）。扩散只在 64×64×4 上加噪去噪——**消费级显卡可训可跑**，这是 SD 爆发的工程前提。

代价：隐空间的细节容量由 VAE 决定（小文字、手指纹理由 8× 压缩损失），后期 SDXL/SD3 在自动编码器上继续下功夫。

---

## 二、去噪网络：U-Net + 时间嵌入

每步去噪的网络不是普通 Transformer，而是** U-Net**（编码-瓶颈-解码 + 跳连保细节）：

- **时间条件**：timestep $t$ 经正弦嵌入 + MLP 加进每层（同一网络处理所有噪声水平）；
- **空间条件**：文字通过**交叉注意力**注入——U-Net 每层内部，隐特征当 Q，**CLIP 文本 token 当 K/V**：

$$\text{Attn}(Q, K_{\text{text}}, V_{\text{text}}) = \text{softmax}\left(\frac{QK_{\text{text}}^{\text{T}}}{\sqrt{d}}\right)V_{\text{text}}$$

这是「文生图」的真正机关：**图像特征向文字 token 查询对齐**——「天空」的 token 能拉动图像里对应区域的特征。后续控制手段（ControlNet 的边缘/姿态控制）都是在往这些注意力/特征里注入额外条件。

文本编码器用的是 CLIP 的 text encoder（SD1.x 是 ViT-L/14 的文本塔，77 token 上限的由来）。提示词的「权重语法」（如 `(word:1.3)`）本质是放大对应 token 的嵌入。

---

## 三、CFG：最被低估的旋钮

**无分类器引导（Classifier-Free Guidance）**：训练时随机丢条件（10~20% 概率只学无条件去噪），采样时外推：

$$\epsilon_{\text{cfg}} = \epsilon_{\text{uncond}} + s\cdot(\epsilon_{\text{cond}} - \epsilon_{\text{uncond}})$$

读法：$s=1$ 是普通条件采样；$s>1$ 沿「条件 − 无条件」方向**放大**——模型对提示词的响应被人为加强。

| guidance scale | 效果 |
|---|---|
| 1~3 | 忠实但平淡，常欠饱和 |
| 5~9 | 常用甜点：既像又好看 |
| 12~20 | 戏剧化、高对比、强风格，开始僵硬/过饱和 |
| 更高 | 出现伪影、双头、色彩崩坏 |

代价：高 guidance 压缩了分布的多样性（mode seeking），且 s>1 时生成分布与真实分布有系统性偏移——「越听话越不像真照片」。

---

## 四、采样循环：一步在做什么

```
z_T ~ N(0, I)                       # 起点是纯噪声（64×64×4）
for t = T → 1:
    ε_cond   = UNet(z_t, t, text_emb)      # 预测噪声（含文本条件）
    ε_uncond = UNet(z_t, t, ∅)             # 无条件版本
    ε = ε_uncond + s · (ε_cond − ε_uncond) # CFG 外推
    z_{t-1} = DDIM/DDPM 更新(z_t, ε)       # 见扩散模型/DDIM 深读
x = VAE_decode(z_0)                   # 最后才解码回像素
```

50 步 DDIM 是质量和速度的常用平衡；蒸馏/一致性模型把步数压到 1~4 步（见「扩散加速采样」主题）。图生图、inpainting 都是对这个循环的改造：从带噪的图起步而不是纯噪声、固定部分区域不更新。

---

## 常见误区

- **「Stable Diffusion 从纯噪声一步生成图像」** —— SD 从噪声开始经过**多次迭代去噪**（通常 20~50 步），每步基于文本条件预测并移除一部分噪声——是迭代精化不是一步魔法。
- **「CFG 的 guidance scale 越大生成质量越高」** —— 过高的 guidance scale（>15）导致过饱和/伪影/多样性下降——guidance 是「文本相关性 vs 图像质量」的权衡旋钮，7~9 通常是甜点。
- **「负面提示词 = 排除不想要的内容」** —— 负面提示通过 CFG 的无条件分支工作——效果是「降低相关方向的概率」而非「硬性排除」；过度依赖负面提示可能引入伪影。
- **「SD 的 latent 空间是人类可理解的语义空间」** —— VAE 的 latent 空间是压缩表示（8× 空间下采样），其维度不直接对应人类语义概念——「插值latent = 语义插值」只在局部近似成立。

## 五、要点总结

1. **为什么在 latent 空间扩散？** VAE 8× 下采样把计算量降 64 倍，感知质量几乎无损——扩散学「语义结构」，VAE 管「像素细节」。
2. **文字怎么注入？** 交叉注意力：图像特征为 Q、CLIP 文本 token 为 K/V，逐层注入 U-Net。
3. **CFG 的公式与作用？** ε_uncond + s·(ε_cond − ε_uncond)；s 放大条件响应，权衡听话度与多样性/真实感。
4. **guidance scale 过高会怎样？** 过饱和、伪影、模式塌缩（多样性下降）。
5. **为什么是 77 token？** CLIP 文本编码器的位置嵌入上限；超长提示词被截断（不是模型拒收）。
6. **SD 与 DALL·E 2 / Imagen 的路线区别？** DALL·2：CLIP 嵌入 → 先验 → 扩散解码；Imagen：T5 文本 + 级联像素扩散；SD：latent 扩散 + 交叉注意力——SD 开源可微调，生态因此起飞。

---

## 延伸阅读

- Rombach et al., *High-Resolution Image Synthesis with Latent Diffusion Models*, 2022（SD/LDM 论文）
- Ho & Salimans, *Classifier-Free Diffusion Guidance*, 2022
- Ramesh et al., *DALL·E 2*, 2022；Saharia et al., *Imagen*, 2022
