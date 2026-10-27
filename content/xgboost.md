# XGBoost 深读：二阶泰勒展开与叶子权重闭式解

这篇是 **XGBoost**主题的深度补充。表格时代大家都会调 `xgboost.XGBRegressor`，这篇要讲清两件原始论文里最漂亮的事：**为什么用二阶泰勒**、**为什么最优叶子权重有闭式解**——它们直接决定了 XGBoost 的分裂增益公式与那些正则化超参的含义。

> [!KEY] 一句话抓住本质
> 提升法是加法模型：每轮新加一棵树去**拟合当前损失的负梯度方向**。XGBoost 的贡献是把「拟合一阶梯度」升级成「一阶 + 二阶泰勒展开」，于是每个叶子的最优权重 $w^* = -G/(H+\lambda)$ 和分裂增益都有解析解，正则化直接写进目标函数。

---

## 一、加法模型：为什么是「一棵接一棵」

第 $t$ 轮的模型是 $F_t(x) = F_{t-1}(x) + f_t(x)$，目标：

$$\text{Obj}^{(t)} = \sum_{i=1}^{n} L\left(y_i,\; F_{t-1}(x_i) + f_t(x_i)\right) + \Omega(f_t)$$

其中正则项 $\Omega(f) = \gamma T + \frac{1}{2}\lambda\sum_{j=1}^{T} w_j^2$（$T$ 是叶子数，$w_j$ 是第 $j$ 个叶子的输出）。

关键：直接优化这个目标需要知道 $L$ 的具体形式。**XGBoost 的目标是让任意二阶可导的 $L$ 都能用同一套流程**——这就是泰勒展开登场的理由。

---

## 二、二阶泰勒展开：把损失「局部线性化 + 曲率修正」

记 $f_t(x_i)$ 为小增量 $\Delta$，在 $\Delta = 0$ 处展开：

$$L(y_i,\; \hat{y}_i + \Delta) \approx L(y_i, \hat{y}_i) + g_i\,\Delta + \frac{1}{2}h_i\,\Delta^2$$

其中：

$$g_i = \frac{\partial L(y_i, \hat{y}_i)}{\partial \hat{y}_i},\qquad h_i = \frac{\partial^2 L(y_i, \hat{y}_i)}{\partial \hat{y}_i^2}$$

代回目标并丢弃常数项 $L(y_i,\hat y_i)$（与 $f_t$ 无关）：

$$\text{Obj}^{(t)} \approx \sum_{i=1}^{n}\left[g_i f_t(x_i) + \frac{1}{2}h_i f_t^2(x_i)\right] + \gamma T + \frac{1}{2}\lambda\sum_j w_j^2$$

> [!NOTE] 为什么要二阶？
> - 一阶（GBDT）：只知「往哪个方向走」，步长靠学习率硬控，**本质是把树当梯度方向用**。
> - 二阶（XGBoost）：还知道「该走多远」（曲率大的地方小步、曲率小的地方大步），相当于每个样本自带**牛顿法步长**。对平方损失 $h_i = 2$ 是常数、看不出差别；对 logistic 损失 $h_i = p(1-p)$——**不确定样本（p≈0.5）自动获得更小步长**，这是 XGBoost 在分类任务上明显更稳的来源之一。

---

## 三、叶子权重闭式解与增益公式

树把样本划分到 $T$ 个叶子。记第 $j$ 个叶子的样本集为 $I_j$，聚合：

$$G_j = \sum_{i\in I_j} g_i,\qquad H_j = \sum_{i\in I_j} h_i$$

目标变成对每个叶子独立的二次函数：

$$\text{Obj} = \sum_{j=1}^{T}\left[G_j w_j + \frac{1}{2}(H_j + \lambda)w_j^2\right] + \gamma T$$

对 $w_j$ 求导置零（二次函数极值）：

$$w_j^* = -\frac{G_j}{H_j + \lambda},\qquad \text{Obj}^* = -\frac{1}{2}\sum_{j=1}^{T}\frac{G_j^2}{H_j + \lambda} + \gamma T$$

**分裂增益**：把一个叶子切成左右两半 $L, R$，目标下降量：

$$\text{Gain} = \frac{1}{2}\left[\frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L+G_R)^2}{H_L+H_R+\lambda}\right] - \gamma$$

读法：左孩子得分 + 右孩子得分 − 不分裂得分 − **开新叶子的税** $\gamma$。Gain > 0 才分裂——**剪枝被内置进了分裂准则**，不用像 CART 那样事后剪。

**增益公式十行**——分裂收益的闭式判据，γ 是它的「准入门槛」：

```python
import numpy as np
def xgb_gain(GL, HL, GR, HR, lam=1.0, gamma=0.0):
    s = lambda G, H: G * G / (H + lam)       # 结构分数（λ 在分母压权重）
    return 0.5 * (s(GL, HL) + s(GR, HR) - s(GL + GR, HL + HR)) - gamma

print(round(xgb_gain(3, 2, 1, 4), 3))        # ≈0.457 > 0：值得分裂
print(round(xgb_gain(1, 2, 1, 2), 3))        # < 0：收益不及门槛，预剪枝直接停
```

---

## 四、每个超参在公式里的位置

| 超参 | 公式位置 | 作用直觉 |
|---|---|---|
| $\lambda$（reg_lambda） | 分母 $H_j + \lambda$ | 叶权重的 L2 收缩；$H$ 小（样本少/曲率低）的叶子被压得更狠 |
| $\gamma$（gamma） | 增益里的常数税 | 分裂门槛：增益盖不过 $\gamma$ 就不裂，控制树复杂度 |
| $\eta$（learning_rate） | 每轮 $f_t \leftarrow \eta f_t$ | shrinkage：留余地给后面的树，是**最重要的防过拟合手段** |
| subsample | 训练每棵树用的行比例 | 行采样引入随机性，类似随机森林的 bagging 效应 |
| colsample_by* | 列采样（树级/节点级） | 特征去相关，防少数强特征垄断所有分裂 |

```python
# 最小可跑例子：那些公式里的量都能在 dump 里看到
import xgboost as xgb, numpy as np
X = np.random.rand(1000, 5); y = (X.sum(1) > 2.5).astype(int)
model = xgb.XGBClassifier(n_estimators=100, max_depth=3, learning_rate=0.1,
                          reg_lambda=1.0, subsample=0.8, colsample_bytree=0.8)
model.fit(X, y)
# model.get_booster().get_dump() 里每个叶子的输出就是 w* = -G/(H+λ)
```

---

## 五、工程贡献：快从哪里来

理论优雅只是一半，XGBoost 制霸 Kaggle 的另一半是工程：

1. **分裂查找的近似算法**：不用枚举每个特征的全部取值，而是按**分位数草图**给出候选切分点（`tree_method='hist'` 直方图法的前身），加权分位数还考虑二阶梯度 $h$ 作为样本权重。
2. **稀疏感知**：缺失值/one-hot 的零值走单独的「默认方向」，扫描复杂度只与非缺失项相关。
3. **列块并行 + 缓存命中**：特征预排序存成 CSC 块，各特征独立并行扫描；buffer 处理梯度访存。
4. **核外计算**：大数据分块压缩读写。

> [!TIP] 与后来者的分工
> LightGBM 把直方图 + 叶子生长（depth-wise→leaf-wise） + GOSS/EFB 做到极致，更快更省内存；CatBoost 用**有序目标统计**解决类别特征的目标泄漏。三者理论同源（都是本文第二、三节的公式），差异在工程与类别特征处理——见「LightGBM / CatBoost」主题。

---

## 六、常见误区

- **「XGBoost = GBDT + 正则化」**——不止：二阶展开、闭式叶子权重、内置剪枝、近似分裂、并行工程都进了公式层面。
- **「树模型不用特征缩放」**——对，分裂只看顺序不看尺度；但**特征编码方式依然重要**（有序编码的噪声会浪费树容量）。
- **「learning_rate 越小越好」**——太小需要更多树，收益边际递减；常用 0.05~0.1 配合 early stopping。
- **「early_stopping_rounds 用了就不怕过拟合」**——它防的是「训练太久」，不防「leakage / 分布漂移」。

---

---

## 五、XGBoost vs LightGBM vs CatBoost 的技术对比

三个梯度提升框架各有独特的工程创新：

| 维度 | XGBoost | LightGBM | CatBoost |
|---|---|---|---|
| 树生长策略 | level-wise（逐层） | leaf-wise（最优叶生长） | 对称/ oblivious 树 |
| 分裂搜索 | 预排序 + 分位草图 | 直方图（ Histogram） | 直方图 + 有序目标编码 |
| 类别特征 | 需 one-hot/编码 | 原生支持（Fisher 最优分割） | **有序目标编码**（防泄漏） |
| 并行 | 特征并行 + 数据并行 | 特征并行 + 数据并行 | GPU 加速最佳 |
| 速度 | 中 | **快** | 中 |
| 类别特征 | 弱 | 中 | **强** |

**选型**：特征工程好 + 小数据 → XGBoost（更稳定）；大数据 + 需要速度 → LightGBM；类别特征多（用户/商品 ID）→ CatBoost。

## 六、XGBoost 超参调优的系统化方法

XGBoost 的超参分为四组，调优有先后依赖：

1. **固定学习率 → 调树结构**：`max_depth`(3~8)、`min_child_weight`(1~10)、`gamma`(0~1)；
2. **调采样**：`subsample`(0.6~0.9)、`colsample_bytree`(0.6~0.9)——防过拟合；
3. **调正则化**：`reg_alpha`(L1, 0~10)、`reg_lambda`(L2, 1~10)——进一步压缩；
4. **降低学习率 + 增加树数**：`learning_rate`(0.01~0.1) + `n_estimators`(↑) + `early_stopping_rounds`(50)。

**贝叶斯优化（Optuna）是标准工具**——网格搜索在 10+ 超参空间中效率极低；Optuna 的 TPE 采样在 100~200 次试验内找到接近最优的配置。

## 七、要点总结

1. **XGBoost 与 GBDT 的核心区别？** 二阶泰勒（牛顿法 vs 梯度）、叶子权重闭式解、正则化进目标（$\gamma$、$\lambda$）、内置剪枝、工程并行。
2. **$g_i$、$h_i$ 的含义？** 样本损失的一阶/二阶导数；平方损失下 $h$ 恒为常数，logistic 下 $h = p(1-p)$。
3. **叶子权重公式与 $\lambda$ 的作用？** $w^* = -G/(H+\lambda)$；$\lambda$ 是 L2 收缩，让小样本叶子输出更保守。
4. **$\gamma$ 与增益公式？** 分裂需满足增益（含 $-\gamma$ 罚）> 0，相当于预剪枝。
5. **为什么树模型对缺失值和量纲不敏感？** 分裂基于排序比较；缺失值有默认方向机制。
6. **如何处理类别特征？** 原生建议 one-hot（高基数时效应差）；CatBoost 的目标统计更优；LightGBM 有直接类别分裂。

---

## 延伸阅读

- Chen & Guestrin, *XGBoost: A Scalable Tree Boosting System*, 2016（第二、三节即论文 Sec 2）
- Friedman, *Greedy Function Approximation: A Gradient Boosting Machine*, 2001（GBDT 源头）
- Ke et al., *LightGBM*, 2017；Prokhorenkova et al., *CatBoost*, 2018
