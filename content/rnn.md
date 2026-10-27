# RNN 深读：展开图、BPTT 与梯度为什么会消失

这篇是 **RNN 循环神经网络**主题的深度补充。RNN 的代码只有五行，但它训练不稳的根源——**反向传播通过时间时雅可比矩阵的连乘**——值得亲手推一遍，因为它是理解 LSTM、梯度裁剪乃至 Transformer 的共同地基。

> [!KEY] 一句话抓住本质
> RNN 把循环展开成一条与序列等长的深网络，同一个 $W_{hh}$ 在每个时间步**复用**。反向传播（BPTT）要穿过整条链，梯度里出现 $W_{hh}$ 的**幂次连乘**——最大奇异值大于 1 就爆炸，小于 1 就消失。LSTM 的门控和 Transformer 的残差，都是给这条链修「梯度高速公路」。

---

## 一、展开：循环变深度

$$h_t = \tanh(W_{xh}x_t + W_{hh}h_{t-1} + b),\qquad y_t = W_{hy}h_t$$

把时间步展开：$h_3$ 依赖 $h_2$ 依赖 $h_1$……一条长度 = 序列长度的链，**参数在所有步共享**。这就是「反向传播通过时间」（Back-Propagation Through Time, BPTT）：训练按普通深网络处理，只是每层的权重是同一个 $W$。

```python
# 最小 RNN 前向（隐藏态就是一个被循环复用的向量）
h = torch.zeros(batch, hidden)
for xt in x_seq:                    # x_seq: (seq_len, batch, in_dim)
    h = torch.tanh(xt @ Wxh + h @ Whh + bh)   # 同一组参数步步复用
    out = h @ Why
```

---

## 二、梯度去哪了：亲手推一遍

看 $h_0$ 对损失的影响（链式法则穿过 T 步）：

$$\frac{\partial L}{\partial h_0} = \frac{\partial L}{\partial h_T}\cdot\prod_{t=1}^{T}\frac{\partial h_t}{\partial h_{t-1}}$$

每一步的雅可比：

$$\frac{\partial h_t}{\partial h_{t-1}} = \text{diag}\left(\tanh'(z_t)\right) W_{hh}^{\text{T}}$$

连乘的量级由两块决定：

1. **激活导数对角阵**：tanh 的导数 $\in (0,1)$，多数时候在 0.5 以下——连乘指数衰减。
2. **$W_{hh}^{\text{T}}$ 的幂**：最大奇异值 $> 1$ 指数放大（爆炸），$< 1$ 指数缩小（消失）。

> [!KEY] 判据
> $\rho(W_{hh}) < 1$（谱半径）且激活饱和 → 梯度消失，前面的词「学不进」模型；$\rho(W_{hh}) > 1$ → 梯度爆炸，loss 变 NaN。两者不是反义词——**同一网络不同时刻可能分别遭遇两者**，消失是常态、爆炸是事故。

**爆炸的对策：梯度裁剪（gradient clipping）**——范数超过阈值就等比例缩回：

$$g \leftarrow \frac{\tau}{\lVert g\rVert}g \quad \text{if } \lVert g\rVert > \tau$$

简单粗暴、几乎无副作用，是 RNN/LSTM 训练的标准配件（本站演示代码里也有 `clipGrads`）。

**消失没有这么好治**——裁剪救不了趋近 0 的梯度。这就轮到 LSTM 登场（见「LSTM 长短期记忆网络」的深度阅读）：细胞状态用**加法**更新，梯度沿加法支路近似无衰减地流动。

**截断 BPTT（truncated BPTT）**：长序列每 k 步截断反向（如 k=32），只学 k 步内的依赖——训练省内存更稳，代价是放弃超长依赖，工程上常配合「让 $h$ 跨批次传递」保留状态。

**亲手看梯度消失**——前向 40 步状态一直在流动，梯度侧却在指数衰减：

```python
import numpy as np
rng = np.random.default_rng(0)
n, L = 4, 40
Wh = 0.8 * rng.normal(size=(n, n)) / np.sqrt(n)   # 循环权重（谱半径<1 附近）
h = np.zeros(n)
for t in range(L):                                # 前向：状态每步全量覆写
    h = np.tanh(Wh @ h + 0.1 * rng.normal(size=n))
print(h.round(2))
# 梯度：每步 Jacobian = diag(1 − h²)·Whᵀ，连乘 L 次——
J = np.diag(1 - h**2) @ Wh.T
print(round(float(np.abs(np.linalg.eigvals(J)).max()), 3))  # 每步衰减率 <1 → 40 步≈归零
```

---

## 三、RNN 的能力与边界

| 任务形态 | RNN 表现 | 说明 |
|---|---|---|
| 短序列（<30 步）标注/分类 | 良好 | 依赖在可达范围内 |
| 长文档/长程依赖 | 差 | 梯度传不到，信息被覆盖 |
| 流式/在线推理 | 优 | O(1) 状态、按步计算，天然低延迟 |
| 大规模并行训练 | 差 | 时间步串行，GPU 吃不满（对比 Transformer 全并行） |

一句常考的对比：**Transformer 用 $O(n^2)$ 的计算换来了 $O(1)$ 的交互路径和全并行；RNN 用 $O(n)$ 的计算付出了 $O(n)$ 的路径长度**。2023 年后 SSM/Mamba 一脉用「可并行扫描的状态空间模型」把 RNN 的 O(1) 推理和 Transformer 的可训练性结合起来——RNN 的思想并没退场。

---

## 常见误区

- **「RNN 按时间步串行计算所以完全无法并行」** —— 训练时 BPTT 在时间维度是串行的，但**跨样本/batch 维度可以并行**——RNN 的「无法并行」是指时间维不能并行，不是全部维度。
- **「梯度消失 = RNN 完全学不到东西」** —— 梯度消失影响的是**远距离依赖**的学习；近距离依赖（局部特征）仍然可以学习——RNN 是「健忘」不是「失忆」。
- **「双向 RNN 的输出可以用于语言模型」** —— 双向 RNN 在计算 t 时刻的隐藏状态时**使用了未来信息**（t 之后的输入）——不满足自回归生成的因果约束，不能直接当语言模型用。
- **「注意力机制完全取代了 RNN」** —— 在流式推理（token-by-token 生成，O(1) 状态）与超长序列（线性计算成本）场景，RNN/SSM 的思路仍有优势（Mamba 就是 SSM 路线）——不是「淘汰」而是「各有所长」。

---

## 五、Seq2Seq 与注意力：从 RNN 到 Transformer 的过渡

RNN 处理「输入序列 → 输出序列」任务时，编码器-解码器（Seq2Seq）架构将输入压缩为固定向量再解码——瓶颈在于「固定向量装不下任意长的输入信息」。**注意力机制**最初就是为了解决这个瓶颈而发明的（Bahdanau 2014）：

$$\text{context}_t = \sum_{i=1}^{T} \alpha_{t,i} \cdot h_i, \quad \alpha_{t,i} = \text{softmax}(e_{t,i})$$

解码器在每一步「回看」编码器的所有隐状态 $h_i$，按注意力权重 $\alpha$ 加权取信息——**不再把全部信息塞进一个固定向量**。

这个注意力机制后来被单独抽取出来——**「Attention is all you need」**（2017）——去掉了 RNN 骨干，只用注意力 + FFN 堆叠，就是 Transformer。所以：注意力起源于 RNN 的瓶颈，反过来取代了 RNN。

## 六、实战：RNN 的超参与陷阱

| 超参 | 推荐值 | 陷阱 |
|---|---|---|
| hidden_size | 128~512 | 太大→过拟合+计算慢 |
| num_layers | 1~2 | >2 需要 residual 连接 |
| gradient clipping | max_norm=5.0 | 不裁剪→梯度爆炸 NaN |
| dropout | 0.2~0.5（层间） | 太多→训练不稳定 |
| bidirectional | 分类/NER 用，LM 不用 | 双向不能做自回归生成 |

**梯度裁剪是 RNN 训练的标配**（不是可选）：即使用了 LSTM/GRU，遇到异常长的序列仍可能梯度爆炸——`clip_grad_norm_(model.parameters(), 5.0)` 一行代码防止 NaN。

**序列长度不等时的 batching**：按长度排序→分桶（bucketing）→pad 到桶内最长→用 pack_padded_sequence 跳过 pad 计算——不排序直接 pad 会浪费大量计算在 pad 上。

## 四、要点总结

1. **BPTT 是什么？** 把循环按时间展开后做普通反向传播；同一参数在各步的梯度**累加**。
2. **梯度消失/爆炸的数学来源？** 雅可比连乘：$\prod \text{diag}(\tanh')W_{hh}^{\text{T}}$；谱半径决定指数放大或衰减。
3. **为什么用 tanh 不用 sigmoid？** tanh 均值 0、导数上限 1（sigmoid 只有 0.25），略缓和消失；深层网络里两者都不够，靠门控/残差解决。
4. **梯度裁剪治什么不治什么？** 治爆炸（按范数缩放），不治消失（0 不能被放大回来）。
5. **双向 RNN 是什么？** 两个方向的 RNN 拼接隐藏态；只能用于**整段可见**的任务（分类/NER），不能用于语言模型生成。
6. **RNN vs Transformer 的取舍？** 长上下文与并行训练选 Transformer；流式、低延迟、边缘部署 O(1) 状态的 RNN/SSM 仍有优势。

---

## 延伸阅读

- Rumelhart et al., *Learning representations by back-propagating errors*, 1986（BPTT 源头之一）
- Pascanu et al., *On the difficulty of training recurrent neural networks*, 2013（梯度裁剪与病态曲率的系统分析）
- Gu & Dao, *Mamba: Linear-Time Sequence Modeling*, 2023（RNN 思想的现代复兴）
