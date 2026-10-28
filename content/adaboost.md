# AdaBoost 深读：从「样本加权」到 boosting 的起点

这篇是 **AdaBoost**主题的深度补充。AdaBoost 是 boosting 的历史起点（1995），它发明的「**错分样本加权 + 弱分类器加权投票**」机制直接孕育了 GBDT/XGBoost 一族。理解它的样本权重更新式，就理解了「boosting = 逐步聚焦难样本」的全部直觉。

> [!KEY] 一句话抓住本质
> 每一轮：按当前样本权重训练弱分类器 → 被错分的样本权重升高（下一轮重点照顾）→ 弱分类器按准确率获得投票权重 α。若干弱分类器的加权和就是强分类器——**只用「比瞎猜好一点」的弱学习器，指数级逼近贝叶斯误差**（训练误差以 e^{−2Σγ²} 下降）。

---

## 一、算法与两个权重

初始权重 $w_i = 1/n$，每轮 t：

1. 按权重 $w^t$ 训练弱分类器 $h_t$（如一层的决策树桩），加权错误率 $\epsilon_t = \sum_{i:\,h_t(x_i)\ne y_i} w_i$；
2. **分类器的话语权**：

$$\alpha_t = \frac{1}{2}\ln\frac{1-\epsilon_t}{\epsilon_t}$$

准确（ϵ<0.5）→ α>0，越准 α 越大；**ϵ ≥ 0.5 直接停**（比瞎猜还差，说明挖不动了）；

3. **样本权重更新**：

$$w_i^{t+1} \propto w_i^t \cdot e^{-\alpha_t y_i h_t(x_i)}$$

对分对的乘 $e^{-\alpha}<1$（降权），错分的乘 $e^{+\alpha}>1$（升权）——**下一轮的注意力自动转向难样本**；归一化后进入下一轮。

最终模型 $H(x) = \text{sign}\left(\sum_t \alpha_t h_t(x)\right)$。

**AdaBoost 三十行**——OR 任务上单桩只能抓 73%，指数加权重分配让一串桩补完剩下的：

```python
import numpy as np
rng = np.random.default_rng(0)
X = rng.normal(size=(100, 2))
y = ((X[:, 0] > 0.2) | (X[:, 1] > 0.2)).astype(int) * 2 - 1   # OR，标签 ±1

def stump(X, y, w):
    best = (None, 1.0)
    for j in range(X.shape[1]):
        for thr in np.unique(X[:, j]):
            pred = np.where(X[:, j] > thr, 1, -1)
            e = float((w * (pred != y)).mean())
            if e < best[1]: best = ((j, thr, pred), e)
    return best

def adaboost(X, y, T=15):
    n = len(y); w = np.full(n, 1/n); F = np.zeros(n)
    for t in range(T):
        (j, thr, pred), e = stump(X, y, w)
        if e > 0.5: e, pred = 1 - e, -pred           # 反向桩：比随机差就翻转
        if e <= 0: break
        a = 0.5 * np.log((1 - e) / max(e, 1e-12))    # 该轮说话权
        F += a * pred
        w *= np.exp(-a * y * pred); w /= w.sum()     # 错的变重、对的变轻
    return np.sign(F)

print('单桩', float(np.mean(np.where(X[:, 0] > 0.2, 1, -1) == y)).__round__(2),
      '→ boost', float(np.mean(adaboost(X, y) == y)).__round__(2))   # 0.73 → 1.0
```python
import numpy as np
rng = np.random.default_rng(0)
X = rng.normal(size=(100, 2))
y = ((X[:, 0] > 0.2) ^ (X[:, 1] > 0.2)).astype(int) * 2 - 1   # XOR，标签 ±1

def stump(X, y, w):
    best = (None, 1.0)
    for j in range(X.shape[1]):
        for thr in np.unique(X[:, j]):
            pred = np.where(X[:, j] > thr, 1, -1)
            e = float((w * (pred != y)).mean())
            if e < best[1]: best = ((j, thr, pred), e)
    return best

def adaboost(X, y, T=15):
    n = len(y); w = np.full(n, 1/n); F = np.zeros(n)
    for t in range(T):
        (j, thr, pred), e = stump(X, y, w)
        if e >= 0.5: break
        a = 0.5 * np.log((1 - e) / max(e, 1e-12))   # 该轮说话权
        F += a * pred
        w *= np.exp(-a * y * pred); w /= w.sum()    # 错的变重、对的变轻
    return np.sign(F)

print(float(np.mean(adaboost(X, y) == y)))          # 单桩必败的任务，boost 后 ≈1.0
```

---

## 二、训练误差的指数下降（boosting 的合法性）

Freund & Schapire 的经典结论：若每轮弱分类器 $\epsilon_t = 1/2 - \gamma_t$（比随机好 γ），则：

$$\text{训练误差} \le \prod_t 2\sqrt{\epsilon_t(1-\epsilon_t)} = \prod_t\sqrt{1-4\gamma_t^2} \le e^{-2\sum_t \gamma_t^2}$$

**T 轮后训练误差指数级下降**——只要每轮都「略好于随机」。这是「弱学习器 → 强学习器」的 PAC 理论保证，也是 boosting 名字的含义（提升）。

**理论视角（加法模型）**：AdaBoost 等价于在指数损失 $\sum e^{-yF(x)}$ 上做前向分步加法建模——GBDT 把指数损失换成任意可导损失，就成了通用梯度提升（见 GBDT 深读的谱系）。

---

## 三、特性与实操

- **对噪声敏感**：错分样本被指数加权——一个标错样本会被反复放大，权重爆炸。带噪声标签的数据上不如 bagging 稳（随机森林靠平均抵抗噪声）；
- **无需调学习率**（每轮 α 由 ϵ 自动定），弱分类器深度（树桩 vs 深树）是主要超参；
- **现代地位**：表格数据被 GBDT 系取代；但它的思想活在人脸检测的 VJ 级联（Haar 特征+AdaBoost 的世纪组合）与 boosting 理论本身。

---

---

## 三·五、与 GBDT 的损失函数统一视角

前向分步加法模型下，AdaBoost 与 GBDT 是同一框架的不同损失（Friedman 2000 的统计化解读）：

| | AdaBoost | GBDT |
|---|---|---|
| 损失 | 指数损失 $e^{-yF(x)}$ | 任意可导损失 |
| 「权重更新」 | 样本权重 ×e^{±α} | 伪残差 r = −∂L/∂F |
| 本质 | 加权重采样视角 | 函数空间梯度下降 |

关键联系：**指数损失对样本的「加权」与「拟合负梯度」在数学上等价**——AdaBoost 的样本权重更新恰好是在指数损失下做函数空间梯度下降的隐式实现。统一视角解释了两个现象：AdaBoost 对噪声敏感（指数损失对大负边际的惩罚是指数级的）与 GBDT 用 Huber/LogLoss 替换后鲁棒性提升。

**SAMME**（多分类 AdaBoost）：把二分类的 sign 推广到 K 类，α 的分母从 ln((1−ϵ)/ϵ) 变为 ln((1−ϵ)/ϵ + ln(K−1))——保证 K 类随机猜测的基线仍是 ϵ ≤ 1−1/K。

## 常见误区

- **「弱学习器越弱越好」** —— 错。弱学习器只需「略好于随机」，但太弱（如深度为 0 的常数树）会导致收敛极慢；深度 1~2 的决策树是实践甜点。
- **「AdaBoost 对异常值鲁棒，因为它会自动学习忽略它们」** —— 恰恰相反。异常点被指数级加权，AdaBoost 会「死磕」这些点——这是它与 GBDT（用 Huber 等鲁棒损失）的核心差异。
- **「 boosting 一定能提升性能」** —— 只在基学习器满足「略好于随机」且数据没有严重噪声时成立；数据有标签噪声或基学习器过弱时，boosting 可能比单模型更差。
- **「权重更新公式很复杂所以需要调参」** —— α 由每轮错误率自动计算，无需人工设定；真正需要选择的是基学习器复杂度与迭代轮数（配合早停）。

## 四、要点总结

1. **样本权重怎么更新、为什么？** 对的乘 e^{−α}、错的乘 e^{+α}——注意力逐步转向难样本。
2. **α 的公式与含义？** $\frac{1}{2}\ln\frac{1-\epsilon}{\epsilon}$：分类器的话语权随准确率增加；ϵ≥0.5 时停止。
3. **训练误差为什么指数下降？** 每轮好于随机 γ 即可，误差上界 $e^{-2\sum\gamma^2}$——弱到强的理论保证。
4. **AdaBoost 与 GBDT 的关系？** 前向分步加法模型的不同损失：指数损失（Ada，权重更新是它的自然结果）vs 任意可导损失（GBDT 拟合负梯度）。
5. **为什么对噪声敏感？** 错分权重指数放大——标签噪声被当「难样本」死磕；bagging 类对此更鲁棒。
6. **弱分类器怎么选？** 树桩（一层决策树）是经典；要求只是「略好于随机」。

---

## 延伸阅读

- Freund & Schapire, *A Decision-Theoretic Generalization of On-Line Learning (AdaBoost)*, 1997
- Schapire & Freund, *Boosting: Foundations and Algorithms*, 2012（专著）
- Friedman et al., *Additive Logistic Regression: A Statistical View of Boosting*, 2000（统计视角的统一）
