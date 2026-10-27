# GPT 深读：自回归预训练与规模法则

这篇是 **GPT 架构与预训练**主题的深度补充。上面标签页讲了「下一个词预测」，这里讲清楚三件事：**这个朴素目标为什么学出了智能**、**Scaling Law 如何把「堆算力」变成科学**、**从基座模型到 ChatGPT 中间发生了什么**。

> [!KEY] 一句话抓住本质
> GPT = **Decoder-only Transformer + 自回归语言建模**（预测下一个 token）。这个目标看似简单，但要做到极致，模型必须把句法、事实、推理、世界知识全部压缩进参数——压缩得好 = 下一个词猜得准。规模法则则告诉我们：这份能力随算力、数据、参数**可预测地**增长。

---

## 一、目标函数：一行交叉熵

给定 token 序列 $x_1, \ldots, x_T$，自回归因子化：

$$p(x_1,\ldots,x_T) = \prod_{t=1}^{T} p(x_t \mid x_1, \ldots, x_{t-1})$$

训练目标是最小化每个位置交叉熵的平均：

$$L = -\frac{1}{T}\sum_{t=1}^{T}\log p_\theta(x_t \mid x_{<t})$$

困惑度（PPL）= $\exp(L)$，直觉是「**模型在每个位置平均在多少个词里犹豫**」。PPL 降到 1.0 附近（在测试集上）意味着模型对语言近乎确定——事实上那通常意味着测试集泄漏进了训练数据。

> [!TIP] 为什么「猜下一个词」这么强？
> 想把「她把冰块放进温水杯，过了一会儿冰块___」的下一个词猜准，你必须懂物态变化；要把「剑桥大学位于___」猜准，你必须有事实知识；要把数学证明的下一行猜准，你必须会推理。**预测下一个 token 是压缩，而压缩需要智能**——这是 Ilya Sutskever 对 GPT 范式的经典论证。

---

## 二、Decoder-only 架构的三个要点

### 2.1 因果掩码

自注意力层加一个上三角掩码：位置 $t$ 只能看到 $\le t$ 的位置。训练时**整条序列并行前向**（teacher forcing），每个位置各自算「下一个词」的损失——这是 GPT 训练效率的根基（对比 RNN 逐步展开）。

### 2.2 位置编码

因果掩码保证「因果」，但注意力本身对称（不知道词序），需要位置信息注入。现代模型几乎都用 **RoPE**（旋转位置编码）：把相对位置编进 Q/K 的旋转角，长度外推性更好。详见「位置编码与长上下文」主题。

### 2.3 参数都花在哪

以 decoder-only 为骨架，参数分布（忽略嵌入）大致：注意力约 1/3，FFN 约 2/3。层数 × 隐维度决定一切；「宽 vs 深」的比例由 Scaling Law 与硬件效率（GPU 亲和宽矩阵）共同决定，主流模型深宽比在 80~128 附近。

---

## 三、Scaling Laws：把炼丹变成科学

### 3.1 Kaplan 定律（2020）

OpenAI 发现损失随三个量呈**幂律**下降：

$$L(N, D, C) \propto N^{-\alpha_N} + D^{-\alpha_D} + C^{-\alpha_C} + L_\infty$$

$N$ 参数量、$D$ 数据量、$C$ 计算量，指数 $\alpha \approx 0.3\sim0.5$，$L_\infty$ 是不可约熵（语言本身的不确定性）。意义：**在 log-log 图上是一条直线**——小模型上拟合的规律可以外推到上千倍大的模型，训练前就能预算出「加多少卡、损失降到哪」。

### 3.2 Chinchilla 修正（2022）：GPT-3 时代「参数给多了」

DeepMind 用 400+ 次实验重估了计算最优配比，结论：固定算力 $C$ 下，最优参数量与数据量应**同步放大**，且

$$D_{\text{opt}} \approx 20 \times N$$

即**每个参数约配 20 个 token**。GPT-3（175B 参数 / 300B token）按此标准严重「喂不饱」——同样的算力本可以训一个 70B + 1.4T token 的更强模型（Chinchilla 本尊就是这么做的，并击败了 Gopher）。后来 LLaMA 等开源模型更进一步**故意偏离**计算最优：多喂 10 倍以上的 token 换「推理更便宜」的小模型（推理成本占生命周期大头）。

> [!NOTE] Scaling 放缓与后训练时代
> 2024 年后高质量网络文本趋紧，纯预训练的收益变陡；行业重心移向**后训练**（SFT/RLHF）与**推理时扩展**（test-time compute，见「思维链与推理模型」主题）。但幂律框架没有被推翻——变化的是「下一个要缩放的量」从预训练算力转向了强化学习信号与思考长度。

---

## 四、涌现与上下文学习

### 4.1 上下文学习（ICL）

GPT-3 论文最惊人的发现：**不更新任何权重**，只在提示里放几个示例（few-shot prompt），模型就能照着做新任务。这不是训练时的设计目标，是规模到位后「免费」长出来的能力。

### 4.2 涌现能力

一系列能力（多步算术、指令跟随、思维链推理）在小模型上接近随机，跨过某个规模阈值后陡然可用。存在争议：有研究认为「涌现」部分是**非线性指标造成的测量假象**（用连续指标看是平滑改善）。但工程共识不变：**很多实用能力只在足够大的模型上出现**，这决定了开源模型追赶闭源的临界点。

---

## 五、从基座到 ChatGPT：三段式流水线

1. **预训练（PT）**：海量文本 + 下一词预测 → 基座模型。会续写，不会「听话」，爱编造。
2. **监督微调（SFT）**：几万~百万条高质量「指令 → 回答」对话示范，教会模型「以对话格式服务人类」。
3. **人类反馈强化学习（RLHF）**：人类对回答排序 → 训练奖励模型 → PPO 优化策略并加 KL 约束防止跑偏。

> [!WARN] 常见误解
> 「RLHF 让模型变聪明」——不。RLHF 主要改变**行为与风格**（有用、诚实、无害的对齐），知识几乎全部来自预训练。把 RLHF 比作「教一个读完了图书馆的人好好说话」更准确。完整推导见「RLHF 对齐」主题的深度阅读。

---

## 六、代码视角：一个极简自回归采样循环

```python
# 推理就是「前向 → 取最后位置分布 → 采样 → 拼回输入」的循环
@torch.no_grad()
def generate(model, ids, max_new=50, temp=0.8, top_p=0.95):
    for _ in range(max_new):
        logits = model(ids)[:, -1, :]              # (B, vocab)
        logits /= temp                              # 温度：低→保守，高→发散
        probs = softmax(logits)
        probs = top_p_filter(probs, p=top_p)        # 核采样：只留累积概率 top_p 的词
        next_id = torch.multinomial(probs, 1)
        ids = torch.cat([ids, next_id], dim=1)      # 自回归：输出变输入
    return ids
```

三个采样旋钮的直觉：**temperature** 调分布尖锐度（0 附近≈贪心）；**top-k/top-p** 砍掉长尾防胡说；**重复惩罚**防复读机。生产系统里采样策略对体验的影响不亚于模型本身——详见「推理优化与部署」主题。

---

## 常见误区

- **「GPT 理解语言」** —— GPT 学到的是语言的统计结构（下一个 token 的条件分布）；这种行为可以极像理解但机制上不是人类理解——务实地说「行为上像」比「机制上是」更准确。
- **「温度越高越有创造力」** —— 高温增加随机性不等于增加创造性——更多无意义 token 而非更多有趣想法；创造性更多来自 prompt 设计与 top-p 采样。
- **「上下文窗口 = 记忆力」** —— 窗口是注意力可达的范围，不是「记住」——模型不会从上下文中「学习」新知识并保留到下次对话（无权重更新）；「记住」是 anthropomorphism。
- **「更大的模型一定更好」** —— Scaling Law 描述的是损失下降趋势；小模型+好 prompt/RAG/工具可打大模型的裸输出——选择模型要看任务，不是只看参数量。

---

## 五、GPT 训练管线的完整成本分解

GPT 级模型的训练成本不是一个数字而是一张表：

| 阶段 | 算力占比 | 说明 |
|---|---|---|
| **数据收集与清洗** | ~10%（人力为主） | 去重/去毒/质量过滤/配比——数据工程决定上限 |
| **预训练（PT）** | ~80% | 万卡集群数周~数月；能源成本是主要开销 |
| **SFT（监督微调）** | ~5% | 高质量指令数据（~100K 条），1~8 卡数天 |
| **RLHF/DPO** | ~5% | 偏好标注+策略优化；提升可用性 |

**推理成本（部署后持续发生）**：

- 每 1000 token：GPT-4 级 ~$0.03-0.10、7B 开源 ~$0.001（自部署）
- 推理成本 = 硬件折旧 + 能耗 + 运维——**是训练成本的数十倍**（模型生命周期内持续累积）
- 降低推理成本三板斧：量化（见模型量化主题）+ 路由（见模型路由主题）+ 缓存（KV cache/语义缓存）

## 六、评测数据集污染检测的实操

污染（benchmark data leaking into training data）的检测方法：

```python
# n-gram 重叠检测（13-gram 是常用的严格标准）
from collections import defaultdict

def get_ngrams(text, n=13):
    words = text.lower().split()
    return {' '.join(words[i:i+n]) for i in range(len(words)-n+1)}

# 构建训练集索引
train_ngrams = set()
for doc in training_corpus:
    train_ngrams |= get_ngrams(doc.text)

# 检测基准集
for q in benchmark_questions:
    if get_ngrams(q.question) & train_ngrams:
        print(f"⚠ 污染嫌疑: {q.id}")
```

**Beyond n-gram**：语义嵌入相似度（嵌入距离 < 0.85 即嫌疑）、成员推断攻击（模型对训练数据的过拟合程度）——多层检测比单层更可靠。

## 七、要点总结

1. **GPT 与 BERT 的目标差异？** 自回归（因果掩码，预测下一词）vs 掩码语言模型（双向，完形填空）；生成 vs 理解的原生倾向由此而来。
2. **Chinchilla 定律内容？** 计算最优配比 $D \approx 20N$；小模型多喂数据可以更便宜地逼近大模型（LLaMA 路线）。
3. **困惑度的定义与陷阱？** $\text{PPL} = \exp(\text{平均交叉熵})$；跨模型比较必须同 tokenizer、同数据；PPL 极低警惕数据泄漏。
4. **为什么 decoder-only 胜过了 encoder-decoder（T5/BART 路线）？** 训练效率（无 encoder 冗余）、KV cache 推理天然适配、Scaling 实证更优、工程生态收敛。
5. **ICL 是怎么工作的？** 主流解释：注意力在激活空间内执行了「隐式的梯度下降式」模式匹配，等价于临时构建任务向量——权重未变，行为已适配。
6. **为什么 GPT 训练用 teacher forcing，生成却是逐步的？** 训练有完整目标序列可并行监督；推理时下一词未知，只能自回归展开。

---

## 延伸阅读

- Radford et al., *Improving Language Understanding by Generative Pre-Training (GPT-1)*, 2018；Brown et al., *Language Models are Few-Shot Learners (GPT-3)*, 2020
- Kaplan et al., *Scaling Laws for Neural Language Models*, 2020；Hoffmann et al., *Training Compute-Optimal LLMs (Chinchilla)*, 2022
- Wei et al., *Emergent Abilities of LLMs*, 2022；Schaeffer et al., *Are Emergent Abilities a Mirage?*, 2023
