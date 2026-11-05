# 推理优化深读：KV Cache、显存带宽与投机解码

这篇是**推理优化与部署**主题的深度补充。LLM 推理的优化有一套清晰的物理直觉：**decode 阶段是带宽瓶颈（每 token 都要把全部权重读一遍），不是算力瓶颈**。理解这一点，PagedAttention、量化、投机解码这些技术就串成了一条线。

> [!KEY] 一句话抓住本质
> 生成是「一次一个 token」的自回归：每步只算 1 个 token 的矩阵乘——GPU 算力大量闲置，瓶颈变成**把几十 GB 权重 + KV cache 从显存搬进计算单元的带宽**。优化的主线：减少要搬的东西（量化/合并）、减少搬的次数（投机解码/批处理）、搬得更整齐（PagedAttention/FlashAttention）。

---

## 一、两阶段：prefill 与 decode 的物理差异

- **Prefill（处理提示词）**：整段并行前向，GEMM 大矩阵乘——**算力受限**，一次算完，产出全部 prompt 的 KV。
- **Decode（生成）**：每步 1 个 token，GEMV 矩阵×向量——**带宽受限**：读全部权重只做一次乘加。算术强度（FLOPs/字节）远低于 GPU 平衡点，利用率常在 5~10%。

推论：**同样的卡，prefill 吞吐高、decode 慢**；首 token 延迟（TTFT）由 prefill 决定，之后每 token 延迟（TPOT）由带宽决定。生产系统的 prefill/decode 常分开放（disaggregated serving）。

**KV Cache 的显存账**——缓存让每步 decode 只算一个新 token：

```python
import numpy as np
def decode_cost(n_layers, n_heads, d_head, seq, batch, bytes_per=2):
    """fp16：K 和 V 各缓存一份"""
    per_token = 2 * n_layers * n_heads * d_head * bytes_per   # K+V，×2
    total = per_token * seq * batch
    return total / 1e9

gb = decode_cost(n_layers=80, n_heads=64, d_head=128, seq=4096, batch=16)
print(f'70B 模型 batch=16、4096 上下文的 KV Cache: {gb:.1f} GB')
print('对比权重本身: 70', 'GB (fp8) — Cache 占比可观，这就是 GQA 存在的理由')
```

---

## 二、KV Cache：显存账本

自回归生成不必重算历史——把每层的 K、V 存起来。显存公式：

$$\text{KV} = 2 \times L \times n_{\text{kv}} \times d_{\text{head}} \times \text{seq} \times \text{batch} \times \text{bytes}$$

（2 = K 和 V；L 层数；bytes：fp16=2，int8=1，int4=0.5）

以 Llama-2-7B（L=32，n_head=32，d_head=128，fp16）为例：**每 token 每 batch 约 512KB**；100K 上下文单条序列就要 ~48GB——**长上下文的瓶颈往往不是权重而是 cache**。由此派生的技术：

- **MQA/GQA**：多个 Q 头共享一组 KV 头（Llama-2-70B 用 GQA-8：cache 缩 8 倍）；
- **KV 量化**：cache 存 int8/int4，配合按「新 token 重要、老 token 可压」的分层精度；
- **滑动窗口/淘汰**：只保留最近 W + 少量锚定 token（StreamingLLM 思路）。

---

## 三、吞吐：continuous batching

单条请求的 decode 每步只搬一次权重却只产 1 token——浪费。**把多条请求拼成一个 batch 一起 decode**，权重搬运被摊薄：吞吐近似线性于并发。难点是各请求长度不一、完成时刻不同——**continuous batching**（vLLN/TGI 的核心）：每步动态加入新请求、踢掉已完成的，GPU 始终满载。这是吞吐侧收益最大的一项工程，通常比朴素服务高一个数量级。

---

## 四、投机解码：小模型起草、大模型验收

利用「**验证比生成便宜**」（并行一次前向可同时检查 k 个 token）：

1. 小模型（或 draft head）**一次猜 k 个 token**；
2. 大模型一次前向得到这 k 个位置的概率；
3. 按拒绝采样修正：与小模型分布一致的直接接受，遇到分歧在该处重采样并丢弃其后。

数学保证：**输出分布与大模型自己逐 token 生成完全相同**（无损）。k 个全中则一步出 k 个 token——翻译/代码这类「可预测文本」上 2~3 倍加速常见。变体：self-speculative（跳层起草）、Medusa（多头并行猜）、n-gram 起草（纯检索免小模型）。

---

## 五、其余武器一览

| 技术 | 治什么 | 一句话 |
|---|---|---|
| FlashAttention | 注意力的显存读写 | 分块计算不落显存，O(n) 显存 |
| PagedAttention | KV 碎片 | 像操作系统分页管理 cache，利用率大增（vLLM） |
| 权重量化（W4/W8） | 权重搬运量 | 见「模型量化」；4bit 是端侧标配 |
| 算子融合/编译 | kernel 开销 | torch.compile / TensorRT 把碎算子拼成大 kernel |
| 结构化稀疏/剪枝 | 冗余计算 | 半结构化 2:4 稀疏有硬件加速 |

> [!TIP] 常用的估算题
> 「7B 模型 fp16 推理最少要多少显存？」——权重 14GB + 少量激活 ≈ 15GB（cache 另算）。「为什么 batch 越大每 token 成本越低？」——权重只搬一次，摊到更多 token（直到算力成为新瓶颈）。会算这两笔账，部署问题就有了锚点。

---

## 六、延迟指标的分解与部署账：TTFT / TPOT / 吞吐

上线一个 LLM 服务，先回答三个数：**TTFT**（首 token 延迟，≈ prefill 全部计算 + 队列）、**TPOT**（每 token 延迟，≈ 单步 decode 的显存瓶颈时间）、**吞吐**（每卡每秒 token）。三者的优化方向互相打架：

- **压 TTFT**：更小的 prefill 批、prompt 缓存（相同前缀的 KV 直接复用——系统提示词的缓存命中能省整个 prefill）、chunked prefill（长 prompt 切片与 decode 混排，别让一个 32k 请求卡住全场）；
- **压 TPOT**：更大 decode 批（continuous batching 的核心账：decode 是访存受限，批越大每次权重读取摊到的 token 越多——直到 KV Cache 挤爆显存）、投机解码、量化（带宽减半 ≈ TPOT 减半）；
- **抬吞吐**：把上面两个的余量吃满，代价是排队。

**部署决策的顺序**：先定 SLA（TTFT 上限决定「能不能接受排队与长 prompt」），再选量化档位（TPOT 预算），最后用 continuous batching 收吞吐。**收益最大的第一刀几乎总是「prompt 缓存 + 量化」**——组合拳的每一项单独都不惊艳，叠起来的账（见 KV Cache 一节的 171 GB）才是上线与上不了线的区别。

> [!TIP] 端到端视角
> 用户感知的是「输入到看到完整答案」的总时长 ≈ TTFT + TPOT × 输出长度。**限制输出长度（max_tokens）是最被低估的延迟优化**——省的是线性的 decode 时间，且顺便省钱。

## 常见误区

- **「推理优化只关乎速度」** —— 推理优化的三支柱：延迟（首 token/每 token）、吞吐（并发）、成本（每请求）——三者常常冲突（如投机解码增加计算换延迟）；明确优化目标再选手段。
- **「KV cache 是免费的优化」** —— KV cache 用显存换计算——长上下文的 KV 占用可超过权重本身；需要配合 GQA/量化/滑窗等手段控制（见推理优化深读）。
- **「量化位数越低越好」** —— 4-bit 以下（3/2-bit）精度急剧下降，需要 QAT 或混合精度补偿；量化位数是精度-显存-速度三角中的决策变量。
- **「batch 越大吞吐越高」** —— 大 batch 提升 GPU 利用率但增加排队延迟——实时场景需要在延迟约束下找最优 batch（continuous batching 缓解但未消除）。

## 七、要点总结

1. **decode 为什么是带宽瓶颈？** 每 token 一次 GEMV：读全部权重、算术强度极低，GPU 算力闲置。
2. **KV cache 公式与量级？** 2·L·n_kv·d_head·seq·batch·bytes；Llama-7B fp16 约 0.5MB/token/序列。
3. **GQA 为什么省？** KV 头数从 n_head 缩到 n_kv，cache 与带宽按比例降；质量损失通常可忽略。
4. **continuous batching 是什么？** 每步动态增删请求的批处理，权重搬运被并发摊薄——吞吐数量级提升。
5. **投机解码为何无损？** 拒绝采样修正保证最终 token 分布与大模型独立采样完全一致；加速来自「验收并行、起草便宜」。
6. **长上下文最先爆的是什么？** 通常不是权重而是 KV cache——所以 MQA/KV 量化/窗口淘汰是长上下文工程重点。

---

## 延伸阅读

- Kwon et al., *Efficient Memory Management for LLM Serving with PagedAttention (vLLM)*, 2023
- Leviathan et al., *Fast Inference from Transformers via Speculative Decoding*, 2023
- Pope et al., *Efficiently Scaling Transformer Inference*, 2022（带宽分析的参考）
