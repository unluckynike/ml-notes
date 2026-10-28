# 激活函数与初始化深读：方差守恒的两难

这篇是**激活函数与初始化**主题的深度补充。「换激活函数」和「调初始化」常被当成玄学，其实背后只有一条主线：**让信号与梯度的方差在网络里不爆炸不消失**。读懂 Xavier/He 的两行推导，这两个主题就通了。

> [!KEY] 一句话抓住本质
> 没有 != 非线性，多少层都等价一层线性回归。加了激活后的新问题是：每层的方差会被乘上一个大数或小数，层数一深就指数爆炸/消失——**Xavier/He 初始化就是在解「方差守恒方程」**，而激活函数的演进（sigmoid→ReLU→GELU）一半的历史就是「导数别太小」的历史。

---

## 一、为什么必须有非线性

若每层只是线性变换 $h = Wx$，则 $W_2W_1x = W'x$——**任意深度的线性层合成还是一个线性层**，深就白搭。激活函数打破了这一坍缩，让深度有了表达力。配套要求：**可导（几乎处处）、单调或有界、导数别太小**。

**五种激活一行对比**——负区间的「小坡」是 GELU/SiLU 更平滑的全部原因：

```python
import numpy as np
z = np.linspace(-3, 3, 7)
gelu = 0.5 * z * (1 + np.tanh(np.sqrt(2/np.pi) * (z + 0.044715 * z**3)))
silu = z / (1 + np.exp(-z))
leaky = np.where(z > 0, z, 0.1 * z)
print('z     ', z.round(1))
print('relu  ', np.maximum(z, 0).round(2))
print('gelu  ', gelu.round(2))
print('silu  ', silu.round(2))
print('leaky ', leaky.round(2))
```

---

## 二、激活函数演进：导数大小的战争

| 函数 | 导数特性 | 问题/优点 |
|---|---|---|
| Sigmoid | 最大 **0.25** | 梯度消失加速器；输出非零中心 |
| Tanh | 最大 1.0，零中心 | 好一点，深层仍消失 |
| **ReLU** | 正区恒 1 | 便宜、不饱和；「死亡 ReLU」（负区恒 0，一次性死透） |
| Leaky/GELU | 正 1 负小斜率/平滑 | GELU = ReLU 的光滑版，Transformer 标配 |
| SwiGLU | 门控线性单元 | LLaMA 系 FFN 标配，带门控的非线性 |

两个常考细节：

- **零中心为什么重要**：sigmoid 输出恒正 → 下层梯度符号被上一层的正负权重分布锁死，更新路径呈 Z 字形（zig-zag）；
- **死亡 ReLU**：一次大梯度把偏置推得很负 → 该单元对所有输入输出 0 且不再有梯度复活。Leaky/小学习率/warmup 是解药。

---

## 三、初始化：方差守恒的两行推导

设某层输入 $x$ 各维独立、方差 $\sigma_x^2$，权重 $W$ 独立同分布方差 $\sigma_W^2$，输出 $y=Wx$（n_in 维输入）：

$$\text{Var}(y) = n_{\text{in}}\cdot\sigma_W^2\cdot\sigma_x^2$$

**前向守恒**要求 $n_{\text{in}}\sigma_W^2 = 1$；**反向守恒**（梯度方差）要求 $n_{\text{out}}\sigma_W^2 = 1$。两者不可兼得，Xavier 取折中：

$$\sigma_W^2 = \frac{2}{n_{\text{in}} + n_{\text{out}}}\qquad(\text{配 tanh})$$

ReLU 砍掉了一半信号（负区归零），He 初始化把损失的方差补回来：

$$\sigma_W^2 = \frac{2}{n_{\text{in}}}\qquad(\text{配 ReLU})$$

不这么做的后果：$\sigma_W$ 偏大 → 方差每层 ×k，几十层后激活爆成 inf；偏小 → 梯度指数衰减，前层学不到。** BN 缓解了初始化敏感度**（每层强行标准化），但好的初始化依然是深网无 BN/小 batch 场景的生命线。

> [!TIP] 现代默认
> CNN+ReLU → He(kaiming)；Transformer → GPT 系用 N(0, 0.02) 截断正态（工程调出来的经验值）；别用 uniform(0,1) 或全零（对称性死亡：同层神经元梯度完全相同，永远学成一样）。

---

## 常见误区

- **「ReLU 输出恒正所以是坏事」** —— 正区恒正不是缺陷，负区才是（死亡 ReLU）。LeakyReLU 修的是负区斜率，不是「正区太平凡」。
- **「初始化只影响训练初期」** —— 错。初始化决定了前几步梯度的方差结构，配合无 BatchNorm 的深网络会直接影响能否收敛——不只是「慢一点」。
- **「tanh 一定优于 sigmoid」** —— 零中心与更大导数是优势，但输出值域 (−1,1) 对某些门控结构（如 LSTM 的门）反而是 sigmoid(0,1) 更合适——看用途。
- **「He 初始化万能」** —— He 针对的是 ReLU 族；如果中间夹了 BN/LayerNorm，前面的方差守恒假设被打破，理论上应重新推导——实践中「差不多」但不是「严格最优」。

## 四、要点总结

1. **为什么需要激活函数？** 没有非线性时多层合成等价单层；激活打破坍缩赋予深度意义。
2. **sigmoid 的两大罪？** 导数上限 0.25（消失加速）+ 输出非零中心（zig-zag 更新）。
3. **Xavier 与 He 的区别？** He 多乘 2 补偿 ReLU 的负半轴信号损失；Xavier 用 2/(n_in+n_out) 折中前后向。
4. **死亡 ReLU 怎么发生、怎么救？** 偏置被推得很负 → 恒 0 且无梯度；Leaky、较小 lr、重启该单元。
5. **为什么不能全零初始化？** 同层神经元梯度一致，永久对称，学成一个单元的复制。
6. **GELU 是什么？** ReLU 的光滑概率版本（x·Φ(x)），处处可导且负区保留微小信息——Transformer 标配。

---

## 延伸阅读

- Glorot & Bengio, *Understanding the difficulty of training deep nets (Xavier)*, 2010
- He et al., *Delving Deep into Rectifiers (He init)*, 2015
- Hendrycks & Gimpel, *GELU*, 2016；Shazeer, *GLU Variants (SwiGLU)*, 2020
