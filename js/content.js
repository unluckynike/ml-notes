/* ============================================================
   ML 图谱 · 内容数据
   所有主题的系统化知识内容（中文）
   ============================================================ */

// 分类元信息
const CATEGORIES = {
  found:    { label: '基础与优化', color: '#94a3b8' },
  super:    { label: '监督学习',   color: '#00d4ff' },
  unsuper:  { label: '无监督学习', color: '#00e6a0' },
  ensemble: { label: '集成学习',   color: '#ffb85c' },
  dl:       { label: '深度学习',   color: '#ff7ac6' },
  gen:      { label: '生成模型',   color: '#c084fc' },
  rl:       { label: '强化学习',   color: '#ffd166' },
  app:      { label: '应用主题',   color: '#2dd4bf' },
  method:   { label: '方法论',     color: '#f59e0b' },
  stat:     { label: '统计基础',   color: '#5c9bff' },
  cv:       { label: '计算机视觉', color: '#38bdf8' },
  llm:      { label: '大语言模型', color: '#34d399' },
  agent:    { label: '智能体',     color: '#fb7185' }
};

// 路线图（分阶段）
const ROADMAP = [
  {
    title: '统计与数学地基',
    color: '#5c9bff',
    items: ['概率与分布', '均值·方差·假设检验', '线性代数·微积分', 'Python / NumPy']
  },
  {
    title: '优化与泛化',
    color: '#94a3b8',
    items: ['梯度下降', '损失函数', '过拟合·偏差方差', '正则化 L1/L2']
  },
  {
    title: '回归模型',
    color: '#00d4ff',
    items: ['线性回归', '岭回归·Lasso', '逻辑回归', '广义线性模型']
  },
  {
    title: '经典分类器',
    color: '#00e6a0',
    items: ['K近邻 KNN', '朴素贝叶斯', '决策树', '支持向量机 SVM']
  },
  {
    title: '集成学习',
    color: '#ffb85c',
    items: ['随机森林', 'AdaBoost', 'XGBoost / LightGBM', 'Bagging 与 Boosting']
  },
  {
    title: '无监督学习',
    color: '#a06bff',
    items: ['K-Means', 'DBSCAN 密度聚类', 'PCA 降维', 't-SNE 可视化']
  },
  {
    title: '深度学习',
    color: '#ff7ac6',
    items: ['神经网络 MLP', 'CNN 卷积网络', '自编码器', 'RNN / LSTM / GRU', 'Transformer 注意力']
  },
  {
    title: '进阶与应用',
    color: '#c084fc',
    items: ['GAN 生成模型', '强化学习', '迁移学习', '推荐系统', '异常检测']
  },
  {
    title: '计算机视觉',
    color: '#38bdf8',
    items: ['ResNet 残差网络', '目标检测 YOLO', '图像分割 U-Net', '数据增强', '视觉 Transformer']
  },
  {
    title: '生成模型',
    color: '#c084fc',
    items: ['VAE 变分自编码器', '扩散模型 DDPM', '文生图 Stable Diffusion', 'CLIP 多模态']
  },
  {
    title: '大语言模型',
    color: '#34d399',
    items: ['词嵌入 Word2Vec', 'GPT 架构与预训练', '微调与 LoRA', 'RLHF 对齐', '提示工程']
  },
  {
    title: '智能体 Agent',
    color: '#fb7185',
    items: ['RAG 检索增强生成', 'Agent 与工具调用', '多智能体协作']
  },
  {
    title: '工程方法论',
    color: '#f59e0b',
    items: ['特征工程', '模型评估与调参', '序列预测·时间序列', '部署上线']
  }
];

// 六步方法论
const METHODS = [
  { no: '01', title: '先问「它解决什么问题」', desc: '别急着抄公式。先记下这个模型诞生的动机：它要回答什么问题？之前的模型哪里不够？' },
  { no: '02', title: '用一句话复述核心思想', desc: '能用自己的话、给外行讲明白核心思想，才算真懂。比如「SVM 就是找离两类都最远的线」。' },
  { no: '03', title: '找一个直观比喻', desc: '把抽象机制映射到生活场景（投票、背单词、高速公路），记忆会牢固十倍。' },
  { no: '04', title: '手推一次核心公式', desc: '线性回归的最小二乘、逻辑回归的梯度……亲手算一遍，胜过看十遍推导。' },
  { no: '05', title: '动手跑一个最小例子', desc: '用 10 行代码在玩具数据上跑通，观察输入输出；再用下面的交互演示建立直觉。' },
  { no: '06', title: '记下它的边界', desc: '没有一个模型是万能的。记清它在什么情况下会失灵、何时该换下一个模型。' }
];

// 延伸资源
const RESOURCES = [
  { tag: '经典教材', title: '《统计学习方法》李航', desc: '中文世界最系统的机器学习教材，覆盖 SVM、树模型、EM 等经典方法，推导严谨。', url: 'https://book.douban.com/subject/33437381/' },
  { tag: '入门首选', title: '吴恩达《Machine Learning》', desc: 'Coursera 上最经典的入门课，从线性回归讲到神经网络，配套 Octave/NumPy 作业。', url: 'https://www.coursera.org/learn/machine-learning' },
  { tag: '深度学习', title: '《Deep Learning》花书', desc: 'Ian Goodfellow 等合著，深度学习的理论圣经，讲清反向传播、优化与序列模型。', url: 'https://www.deeplearningbook.org/' },
  { tag: '实战宝典', title: '《Hands-On ML》Aurélien Géron', desc: '用 Scikit-Learn / Keras / TensorFlow 从零做项目，工程细节与调参技巧极佳。', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/' },
  { tag: '可视化直觉', title: 'Distill.pub', desc: '用精美交互可视化讲机器学习与深度学习，尤其推荐 LSTM、Attention 的专题。', url: 'https://distill.pub/' },
  { tag: '动手交互', title: '3Blue1Brown 神经网络系列', desc: 'YouTube 上最直观的神经网络讲解，动画演示反向传播与梯度下降。', url: 'https://www.3blue1brown.com/topics/neural-networks' },
  { tag: '竞赛练习', title: 'Kaggle', desc: '真实数据集 + 排行榜，从 Titanic 入门到 XGBoost 打榜，最好的实战训练场。', url: 'https://www.kaggle.com/' },
  { tag: '查漏补缺', title: 'scikit-learn 官方文档', desc: '每个模型一页，含数学公式、参数说明与示例图，是最好的 API 参考。', url: 'https://scikit-learn.org/stable/' }
];

// ============================================================
// 核心模型内容
// 字段说明：
//   intro    { what, problem, idea }
//   principle{ text[], formula{html, note} }
//   example  { analogy, mini }
//   pros[], cons[], history[{year,text}], use[], avoid[], learn[]
//   demo     { id, title, note }
// ============================================================
const TOPICS = [
  {
    id: 'stats',
    num: '00',
    emoji: '📊',
    name: '统计学基础',
    en: 'Statistics Foundations',
    cat: 'stat',
    diff: 1,
    accent: '#5c9bff',
    tagline: '一切机器学习的地基——用少数几个数字概括数据，用概率量化不确定性，用假设检验控制下错结论的风险。',
    intro: {
      what: '研究「如何收集、描述、分析数据并从中推断结论」的学科。机器学习本质上是应用统计：模型 = 用数据估计一个函数，评估 = 用统计量衡量好坏。',
      problem: '面对一堆杂乱的数据，如何用几个数字看清全貌？看到一个差异时，如何判断它是真实规律还是随机巧合？统计学就是「在噪声中寻找信号」的科学。',
      idea: '用分布描述不确定性，用样本估计总体，用 p 值衡量「证据有多强」。'
    },
    principle: {
      text: [
        '描述统计：均值（μ）刻画「中心」，方差/标准差（σ）刻画「离散」，分位数刻画「分布形状」。',
        '概率分布：正态分布是最重要的分布——大量独立随机因素叠加的结果往往近似正态（中心极限定理）。',
        '推断统计：假设检验先假定「没有差异」（零假设 H₀），再计算看到当前数据（或更极端）的概率 p 值；p 越小，越有理由拒绝 H₀。'
      ],
      formula: {
        html: '<span class="fn">N</span>(<span class="sym">x</span>; <span class="sym">μ</span>, <span class="sym">σ</span>²) = <span class="frac"><span class="num">1</span><span class="den"><span class="sym">σ</span>√(2π)</span></span> <span class="fn">exp</span><span class="op">(</span>− <span class="frac"><span class="num">(x−μ)²</span><span class="den">2σ²</span></span><span class="op">)</span>',
        note: '正态分布的概率密度函数。约 68% 的数据落在 μ±σ 内，95% 落在 μ±2σ 内，99.7% 落在 μ±3σ 内（68–95–99.7 法则）。'
      }
    },
    example: {
      analogy: '全班 50 人的考试成绩——均值告诉你「平均水平」，标准差告诉你「差距有多大」。而「这个班是否比全校平均分显著更高」就是一个假设检验问题。',
      mini: '抛一枚硬币 100 次，得到 55 次正面。硬币是否公平？在「公平」假设下，正面次数服从二项分布，出现 55 次或更极端结果的概率 p≈0.37，> 0.05，所以证据不足，不能断定硬币有偏。'
    },
    pros: ['提供严谨的推断框架，是所有模型的评价基础', '概念直观，可解释性强', '计算量小，样本量要求相对低'],
    cons: ['经典假设（正态、独立、同方差）现实中常不满足', '对「相关性 ≠ 因果性」缺乏保障', '高维数据下经典方法易失效'],
    history: [
      { year: '1809', text: '高斯（Gauss）系统提出正态分布与最小二乘法，奠定参数估计基础。' },
      { year: '1890s', text: '高尔顿（Galton）提出「回归」概念，研究父子身高的均值回归现象。' },
      { year: '1900', text: '皮尔逊（Pearson）提出卡方检验与相关系数，建立现代统计推断。' },
      { year: '1920s', text: '费希尔（Fisher）提出最大似然估计、方差分析、显著性检验。' },
      { year: '1930s', text: '内曼与皮尔逊（Neyman–Pearson）建立假设检验的完整框架。' },
      { year: '至今', text: '统计学思想贯穿机器学习：损失函数、正则化、交叉验证皆源于统计。' }
    ],
    use: ['任何建模之前的数据探索（EDA）', 'A/B 测试与实验结论判断', '理解损失函数、正则化、评估指标的理论根基'],
    avoid: ['只做描述不做推断时不必过度纠结 p 值', '数据严重不满足假设时慎用经典检验', '追求因果结论时需另用因果推断方法'],
    learn: [
      '先掌握 <strong>均值、方差、标准差、分位数</strong> 四个概念，会读直方图与箱线图。',
      '理解 <strong>正态分布</strong> 与中心极限定理，这是后续一切的基础。',
      '学会 <strong>p 值与置信区间</strong> 的直觉，而不只是背判断规则。',
      '把统计学概念与机器学习对应起来：<strong>损失函数≈似然、正则化≈先验、交叉验证≈样本外检验</strong>。'
    ],
    demo: { id: 'dist', title: '正态分布 · 交互演示', note: '拖动均值 μ 与标准差 σ，观察分布形状与 68–95–99.7 法则。' }
  },

  {
    id: 'gd',
    num: '01',
    emoji: '⛰️',
    name: '梯度下降与优化',
    en: 'Gradient Descent & Optimization',
    cat: 'found',
    diff: 2,
    accent: '#94a3b8',
    tagline: '几乎所有模型的「发动机」——顺着坡度最陡的方向，一步步滚到山谷最低点。',
    intro: {
      what: '一种迭代优化算法：反复计算损失函数对每个参数的梯度（偏导数），沿负梯度方向更新参数，直到损失不再下降。',
      problem: '模型好坏由损失函数衡量，但如何自动找到让损失最小的参数？参数成千上万时无法穷举，必须用「试错-修正」的方式逼近最优。',
      idea: '蒙眼下山：每一步都感受脚下最陡的方向，朝那个方向迈一小步，反复直到走到谷底。'
    },
    principle: {
      text: [
        '梯度是损失增长最快的方向，所以沿「负梯度」走就能最快地降低损失。',
        '学习率 η 决定每步迈多大：太小收敛慢，太大可能来回震荡甚至发散。',
        '三种变体：批量（全量数据算梯度）、随机（每次 1 个样本）、小批量（每次一小撮），工程上常用小批量。'
      ],
      formula: {
        html: '<span class="sym">θ</span> ← <span class="sym">θ</span> − <span class="sym">η</span> · <span class="fn">∇</span><span class="sym">L</span>(<span class="sym">θ</span>)',
        note: 'θ 是参数，∇L(θ) 是损失关于参数的梯度，η 是学习率。反复执行直到收敛。'
      }
    },
    example: {
      analogy: '调整淋浴水温：太冷就往热转一点、太烫就往冷转一点，每次微调，最终找到舒服的温度——这就是梯度下降。',
      mini: '拟合 y=2x 时，若当前 w=3，梯度指出「w 太大该减小」，于是 w 每步减一点，逐渐逼近 2。'
    },
    pros: ['通用：任何可微损失都能用', '简单、易实现、可扩展到百万参数', '是反向传播与所有深度学习训练的基石'],
    cons: ['学习率需要精心选择', '可能陷入局部最优或鞍点', '全批量梯度下降在大数据上很慢'],
    history: [
      { year: '1847', text: '柯西（Cauchy）提出最速下降法，梯度下降思想的起源。' },
      { year: '1986', text: '反向传播让梯度下降能够高效训练多层神经网络。' },
      { year: '2011', text: 'AdaGrad 提出自适应学习率。' },
      { year: '2014', text: 'Adam 优化器问世，成为深度学习最常用的默认优化器。' }
    ],
    use: ['一切需要「最小化损失」的训练过程', '深度学习、逻辑回归、线性回归等所有可微模型', '任何可导目标函数的数值优化'],
    avoid: ['目标函数不可导时（需次梯度/其他方法）', '对收敛速度要求极高且参数多时（用二阶方法/Adam）', '手算可解且数据量小时（线性回归可用正规方程直接解）'],
    learn: [
      '先手推 <strong>一元函数的梯度下降</strong>：L(w)=(w−2)²，用一张纸算 3 步更新。',
      '理解 <strong>学习率</strong> 的三种后果：太小、适中、太大（看演示）。',
      '对比 <strong>批量/随机/小批量</strong> 的差异与取舍。',
      '进阶了解 <strong>动量、Adam、学习率衰减</strong> 为何能加速收敛。'
    ],
    demo: { id: 'gd', title: '梯度下降 · 3D 损失地形', note: '拖拽旋转 3D 地形，调 η 看小球沿最陡方向滚向谷底：太小爬不动、太大会冲出山谷。' }
  },

  {
    id: 'overfit',
    num: '02',
    emoji: '⚖️',
    name: '过拟合与欠拟合',
    en: 'Bias–Variance Tradeoff',
    cat: 'found',
    diff: 2,
    accent: '#94a3b8',
    tagline: '模型太「笨」记不住规律（欠拟合），太「死记硬背」又不会举一反三（过拟合）——关键是找到平衡点。',
    intro: {
      what: '描述模型泛化能力的两个核心概念：偏差（模型平均预测离真相多远）与方差（模型对训练数据波动的敏感程度）。',
      problem: '为什么模型在训练集上表现很好、一到新数据就翻车？如何判断它是「没学会」还是「学过头了」？',
      idea: '欠拟合=偏差高（太简单）；过拟合=方差高（太复杂、记住了噪声）；两者此消彼长，要找最佳复杂度。'
    },
    principle: {
      text: [
        '偏差高 → 欠拟合：模型太简单，连训练集的规律都学不到。',
        '方差高 → 过拟合：模型太复杂，把噪声也当成规律记下来，换一批数据就崩。',
        '诊断方法：训练误差高且验证误差也高 = 欠拟合；训练误差低但验证误差高 = 过拟合。'
      ],
      formula: {
        html: '<span class="fn">泛化误差</span> ≈ <span class="fn">偏差</span>² + <span class="fn">方差</span> + <span class="fn">噪声</span>',
        note: '总误差可分解为偏差平方、方差和不可约噪声三部分，这正是「偏差-方差权衡」的来源。'
      }
    },
    example: {
      analogy: '考前死记硬背 50 道题的答案（过拟合）：换 50 道新题就懵；理解原理（恰拟合）：什么题都会做。',
      mini: '用 15 次多项式去拟合 10 个带噪声的点，曲线会疯狂扭动穿过每个点，但对新点的预测反而更差——这就是过拟合。'
    },
    pros: ['理解它才能正确诊断与改进模型', '指导模型复杂度、正则化、数据量的选择', '是所有模型评估的底层逻辑'],
    cons: ['偏差与方差通常难以同时精确计算', '真实场景中噪声不可约，只能逼近', '过度追求低偏差/低方差都可能适得其反'],
    history: [
      { year: '1992', text: 'Geman 等系统阐述偏差-方差分解，成为理解泛化的经典框架。' },
      { year: '1970s', text: '交叉验证被广泛用于估计模型在未见数据上的表现。' },
      { year: '1990s+', text: '正则化（L1/L2、Dropout、早停）成为对抗过拟合的标准武器。' },
      { year: '至今', text: '深度学习中发现「过参数化模型反而泛化更好」的新现象，理论仍在发展。' }
    ],
    use: ['训练任何模型前的复杂度选择', '解读训练/验证曲线', '决定是加数据、降复杂度还是加正则'],
    avoid: ['只用训练集准确率判断好坏', '数据极少时强行用复杂模型', '忽略噪声来源就盲目加容量'],
    learn: [
      '记住一句话：<strong>欠拟合加容量，过拟合加数据或正则</strong>。',
      '学会画 <strong>训练/验证误差随复杂度变化的曲线</strong>，找到拐点。',
      '在演示里对比 <strong>1 次、3 次、15 次</strong> 多项式的差别。',
      '理解 <strong>正则化、早停、交叉验证</strong> 分别是如何降低方差的。'
    ],
    demo: { id: 'overfit', title: '过拟合 · 3D 曲面拟合', note: '拖拽旋转；同一批 3D 数据，用 1 次（欠拟合）/ 3 次（合适）/ 6 次（过拟合）多项式曲面去拟合。' }
  },

  {
    id: 'linear',
    num: '01',
    emoji: '📈',
    name: '线性回归',
    en: 'Linear Regression',
    cat: 'super',
    diff: 1,
    accent: '#00d4ff',
    tagline: '最古老也最常用的模型——用一条直线（或超平面）刻画变量之间的数量关系。',
    intro: {
      what: '给定自变量 x，预测连续型目标 y，并量化「x 每变一个单位，y 平均变多少」。它是理解「模型 = 参数 + 损失函数 + 优化」的最佳起点。',
      problem: '如何用一个简单的数学公式近似一组数据点的规律？如何知道每个因素对结果的影响方向和大小？',
      idea: '找一条直线 ŷ = w·x + b，使预测值与真实值的误差平方和（MSE）最小。'
    },
    principle: {
      text: [
        '模型假设 y 与 x 之间是线性关系：ŷ = w·x + b。w 是斜率（权重），b 是截距（偏置）。',
        '用最小二乘法求解：选择使「残差平方和」最小的参数。因为它有封闭解，可直接算出来（正规方程）；也可用梯度下降迭代逼近。',
        '评估用 R²（决定系数）：模型解释了目标变量多大比例的变化，越接近 1 拟合越好。'
      ],
      formula: {
        html: '<span class="sym">ŷ</span> = <span class="sym">w</span><span class="sym">x</span> + <span class="sym">b</span> <span class="op">,</span>　 <span class="fn">MSE</span> = <span class="frac"><span class="num">1</span><span class="den">n</span></span> <span class="op">Σ</span>(<span class="sym">y</span> − <span class="sym">ŷ</span>)²',
        note: '目标是最小化 MSE。多元时写成 ŷ = w₁x₁ + w₂x₂ + … + b，仍是一个超平面。'
      }
    },
    example: {
      analogy: '根据房屋面积预测房价：面积每增加 1 平米，房价平均上涨多少？那条「最贴合的直线」就是模型。',
      mini: '已知 (学习时长, 分数)：(1, 52), (2, 58), (3, 65)。拟合得 ŷ = 6.5x + 46。则「多学 1 小时，分数约 +6.5 分」——这就是可解释的系数。'
    },
    pros: ['可解释性极强：系数直接表示影响方向与大小', '训练极快，有封闭解，适合做基线', '在线性成立时是最优无偏估计（高斯-马尔可夫定理）', '易于扩展（多元、多项式、正则化）'],
    cons: ['假设线性关系，真实世界常不满足', '对异常值（离群点）非常敏感', '多重共线性会让系数不稳定、难以解释', '无法自动捕捉特征交互'],
    history: [
      { year: '1805', text: '勒让德（Legendre）首次发表最小二乘法。' },
      { year: '1809', text: '高斯（Gauss）独立推导并证明其统计最优性，用于天文轨道计算。' },
      { year: '1886', text: '高尔顿（Galton）研究父子身高，提出「回归到均值」，命名 Regression。' },
      { year: '20 世纪', text: '多元线性回归、正则化（岭回归 1970、Lasso 1996）不断扩展。' },
      { year: '至今', text: '仍是工业界最常见、最实用的基线模型与因果推断工具。' }
    ],
    use: ['预测连续数值：房价、销量、温度、寿命', '量化「因素 → 结果」的影响（可解释性优先）', '作为任何更复杂模型的性能基线'],
    avoid: ['关系明显非线性时（先用散点图确认）', '存在大量离群点时', '特征高度相关（多重共线性）且需要稳定系数时'],
    learn: [
      '手推一遍 <strong>最小二乘</strong> 的封闭解（对 MSE 求导令其为 0），这是第一块敲门砖。',
      '再用 <strong>梯度下降</strong> 求解同一问题，理解「迭代优化」的通用范式。',
      '理解 <strong>R² 与残差图</strong>：R² 看拟合好坏，残差图看假设是否成立。',
      '把线性回归当「标尺」：后面每个复杂模型，本质上都是它的非线性推广。'
    ],
    demo: { id: 'linear', title: '线性回归 · 3D 平面拟合', note: '拖拽旋转；用平面 ŷ = w1·x1 + w2·x2 + b 拟合 3D 数据，粉色竖线是残差。' }
  },

  {
    id: 'ridge',
    num: '04',
    emoji: '🛡️',
    name: '岭回归与 Lasso',
    en: 'Ridge & Lasso Regression',
    cat: 'super',
    diff: 3,
    accent: '#00d4ff',
    tagline: '给线性回归戴上「紧箍咒」——惩罚过大的系数，防止过拟合，Lasso 还能顺便做特征选择。',
    intro: {
      what: '带正则化的线性回归：在 MSE 损失上额外加惩罚项。岭回归加 L2（系数平方和），Lasso 加 L1（系数绝对值之和）。',
      problem: '特征多或高度相关时，线性回归系数不稳定、容易过拟合；还想自动筛掉没用的特征。',
      idea: '通过惩罚大系数「约束」模型复杂度：L2 让所有系数变小但不归零，L1 会把不重要系数直接压成 0。'
    },
    principle: {
      text: [
        '岭回归（L2）：损失 = MSE + λΣw²，把系数整体缩小，缓解共线性、更稳定。',
        'Lasso（L1）：损失 = MSE + λΣ|w|，L1 的尖角使部分系数正好等于 0，天然做特征选择。',
        'λ 是正则强度：λ=0 退化为普通线性回归，λ 越大系数越被压向 0。'
      ],
      formula: {
        html: '<span class="fn">L</span> = <span class="fn">MSE</span> + <span class="sym">λ</span><span class="op">Σ</span>|<span class="sym">w</span>|　或　<span class="fn">MSE</span> + <span class="sym">λ</span><span class="op">Σ</span><span class="sym">w</span>²',
        note: '左式是 Lasso（L1），右式是岭回归（L2）。λ 控制惩罚强度。'
      }
    },
    example: {
      analogy: '花钱做预算：L2 是「全面削减 10%」，L1 是「直接把不重要的开销砍成 0」。',
      mini: '预测房价时若有 100 个特征、只有 5 个真相关，Lasso 会把另外 95 个系数压成 0，等于自动帮你挑特征。'
    },
    pros: ['有效防止过拟合、提升泛化', 'Lasso 自动特征选择，模型更简洁', '缓解多重共线性、系数更稳定', '训练快、可解释'],
    cons: ['λ 需要调（通常用交叉验证）', 'L1 不可导，优化需特殊处理', 'Lasso 在特征数>样本数时最多选 n 个特征', '需先标准化特征（对尺度敏感）'],
    history: [
      { year: '1970', text: 'Hoerl 与 Kennard 提出岭回归，解决共线性问题。' },
      { year: '1996', text: 'Tibshirani 提出 Lasso，引入 L1 正则做稀疏特征选择。' },
      { year: '2004', text: '弹性网络（Elastic Net）提出，结合 L1 与 L2 的优点。' },
      { year: '至今', text: '正则化思想贯穿深度学习（权重衰减 = L2，Dropout 等）。' }
    ],
    use: ['特征多、样本少、易过拟合的回归', '需要自动特征选择（Lasso）', '存在多重共线性的数据（岭回归）'],
    avoid: ['特征极少且都重要时（正则反而有害）', '不标准化特征就套 Lasso', '需要严格稀疏解且特征高度相关时（用弹性网络）'],
    learn: [
      '先理解 <strong>为什么惩罚系数能防过拟合</strong>（限制模型容量）。',
      '搞清 <strong>L1 为何产生稀疏、L2 为何不</strong>：画出菱形 vs 圆形的几何约束。',
      '动手对比 <strong>λ 从小到大</strong> 时系数的变化（看演示）。',
      '记住使用前提：<strong>特征要先标准化</strong>，λ 用交叉验证选。'
    ],
    demo: { id: 'ridge', title: '正则化 · 3D 系数路径', note: '拖拽旋转；纵轴 λ、横平面 (w1,w2)，看 L2 平滑收缩、L1 把 w2 压到 0 后沿平面滑行。' }
  },

  {
    id: 'logistic',
    num: '02',
    emoji: '🎯',
    name: '逻辑回归',
    en: 'Logistic Regression',
    cat: 'super',
    diff: 2,
    accent: '#00d4ff',
    tagline: '名字叫「回归」，干的却是分类的活——输出「这件事发生」的概率。',
    intro: {
      what: '用于二分类（或多分类）的模型。它把输入的线性组合通过 sigmoid 函数压缩到 (0,1)，解释为概率，再以 0.5 为阈值做决策。',
      problem: '线性回归输出可以是任意实数，但分类问题需要「是/否」的概率。如何把一个实数映射成 0~1 之间的概率，并且保持可解释性？',
      idea: '先算线性得分 z = w·x + b，再用 sigmoid σ(z)=1/(1+e⁻ᶻ) 把它「压」成概率。'
    },
    principle: {
      text: [
        'Sigmoid 函数把任意实数映射到 (0,1)，天然适合表示概率；z=0 时概率正好 0.5。',
        '训练时用「交叉熵损失」而非 MSE：交叉熵对概率的惩罚更合理，且凸性好、梯度不消失。',
        '系数 w 的含义是「对数几率」（log-odds）：wᵢ 每增加 1，几率（发生/不发生）变为原来的 e^wᵢ 倍。'
      ],
      formula: {
        html: '<span class="fn">σ</span>(<span class="sym">z</span>) = <span class="frac"><span class="num">1</span><span class="den">1 + e<sup>−z</sup></span></span> <span class="op">,</span>　 <span class="sym">z</span> = <span class="sym">w</span>·<span class="sym">x</span> + <span class="sym">b</span>',
        note: 'z 越大，σ(z) 越接近 1（越可能是正类）；z 越小越接近 0。阈值常取 0.5。'
      }
    },
    example: {
      analogy: '邮件分类器：把邮件特征（含「免费」「中奖」等词的次数）算出一个分数 z，分数越高，是垃圾邮件的概率越接近 100%。',
      mini: '根据血糖值预测患病：血糖 z = 0.8×血糖 − 5。当血糖=6.5，z=0.2，σ(0.2)≈0.55，即患病概率 55%。'
    },
    pros: ['直接输出概率，可校准阈值、权衡精度与召回', '系数可解释为对数几率，业务友好', '训练快、易部署、可加 L1/L2 正则化', '二分类的工业标准基线'],
    cons: ['本质是线性分类器，难以拟合复杂非线性边界', '对多重共线性敏感', '特征工程依赖强（需手工构造交互项）', '多分类需扩展（Softmax / OvR）'],
    history: [
      { year: '1838', text: 'Verhulst 提出逻辑斯蒂曲线，用于描述人口增长的 S 形饱和。' },
      { year: '1958', text: 'Cox 将逻辑斯蒂函数用于二分类，正式命名「逻辑回归」。' },
      { year: '1970s', text: '与最大似然估计结合，成为生物统计与医学研究的标配。' },
      { year: '至今', text: '仍是风控、广告点击率预估、医学诊断中最常用的基线模型。' }
    ],
    use: ['二分类且需要概率输出：风控、点击率、患病预测', '需要强可解释性、受监管的行业', '作为复杂分类器的基线'],
    avoid: ['数据高度非线性且样本量充足时（可换树模型/神经网络）', '类别严重不平衡且未做处理时', '需要大量自动特征交互时'],
    learn: [
      '从线性回归出发，理解「为什么不能直接拿 MSE 做分类」，引出 <strong>sigmoid</strong>。',
      '搞懂 <strong>对数几率 log-odds</strong> 的含义，这是理解系数业务意义的关键。',
      '手推 <strong>交叉熵损失</strong> 对 w 的梯度，感受它的优美。',
      '对比「线性回归→逻辑回归」的进化路径，学会「改损失函数 + 加激活」这一通用改造思路。'
    ],
    demo: { id: 'logistic', title: '逻辑回归 · 3D Sigmoid 曲面', note: '拖拽旋转；曲面高度 = P(正类)，拖 w1/w2/b 看 S 形曲面倾斜，地面绿线是 0.5 决策边界。' }
  },

  {
    id: 'knn',
    num: '06',
    emoji: '👥',
    name: 'K 近邻',
    en: 'K-Nearest Neighbors',
    cat: 'super',
    diff: 1,
    accent: '#00d4ff',
    tagline: '「物以类聚」——看看离它最近的 K 个邻居是谁，少数服从多数。',
    intro: {
      what: '一种「惰性学习」算法：几乎不训练，预测时直接找训练集中离样本最近的 K 个点，分类取多数投票、回归取平均。',
      problem: '数据没有明显的线性结构、又希望方法简单直观时，如何基于「相似度」做预测？',
      idea: '相似的事物应该有相似的标签。距离越近越像，让最近的 K 个邻居投票决定。'
    },
    principle: {
      text: [
        '核心是距离度量：常用欧氏距离，也可用曼哈顿、余弦等。',
        'K 是关键超参：K=1 边界最曲折（易过拟合），K 越大边界越平滑、越稳定但可能欠拟合。',
        '特征必须标准化，否则数值大的特征会主导距离。'
      ],
      formula: {
        html: '<span class="fn">dist</span>(<span class="sym">x</span>,<span class="sym">x′</span>) = √<span class="op">Σ</span>(<span class="sym">x</span><sub>i</sub>−<span class="sym">x′</span><sub>i</sub>)²',
        note: '欧氏距离：各维度差值的平方和再开方。K 个最近邻中数量最多的类就是预测结果。'
      }
    },
    example: {
      analogy: '租房估价：看同小区最近成交的 K 套房子的均价，就能估算你房子的价格。',
      mini: '判断一个用户是否喜欢某电影：看他最近的 5 个「口味相似」的用户里 4 个都喜欢 → 预测他也喜欢。'
    },
    pros: ['极简单、无需训练、可解释', '天然非线性，能拟合任意复杂边界', '新数据可直接加入，无需重训', '分类回归皆可'],
    cons: ['预测慢（每次都要扫全量数据）', '高维下「维度灾难」，距离失效', '对 K 与距离度量、特征尺度敏感', '存储全部训练数据'],
    history: [
      { year: '1951', text: 'Fix 与 Hodges 提出最近邻规则。' },
      { year: '1967', text: 'Cover 与 Hart 给出最近邻的理论分析，证明其误差不超过最优的 2 倍。' },
      { year: '1970s+', text: 'k-d tree 等索引结构加速近邻搜索。' },
      { year: '至今', text: '仍是推荐、检索、小数据分类的常用基线，思想启发了向量检索。' }
    ],
    use: ['小到中型数据集的分类/回归基线', '推荐系统、相似检索', '需要直观可解释预测的场景'],
    avoid: ['大数据、高维数据（慢且失效）', '对实时性要求高的线上预测', '特征未标准化时'],
    learn: [
      '在演示里 <strong>拖动查询点、切换 K</strong>，直观感受 K 对边界的影响。',
      '理解 <strong>维度灾难</strong>：维度越高，点之间距离越趋于相同，近邻失去意义。',
      '实践 <strong>标准化 + 距离度量选择</strong> 的重要性。',
      '对比 <strong>KNN 与逻辑回归/SVM</strong> 的适用边界。'
    ],
    demo: { id: 'knn', title: 'KNN · 3D 近邻投票', note: '拖拽旋转；查询点自动巡航，看最近的 K 个邻居如何投票、预测如何随位置变化。' }
  },

  {
    id: 'naivebayes',
    num: '07',
    emoji: '📨',
    name: '朴素贝叶斯',
    en: 'Naive Bayes',
    cat: 'super',
    diff: 2,
    accent: '#00d4ff',
    tagline: '用「先验 × 似然」算后验概率——垃圾邮件过滤的经典功臣，快如闪电。',
    intro: {
      what: '基于贝叶斯定理的概率分类器，核心假设是「各特征在给定类别下相互独立」，从而把联合概率拆成简单乘积。',
      problem: '文本分类等场景特征成千上万，直接估计联合分布不现实；如何快速、可增量地算出「属于某类的概率」？',
      idea: '每个词独立地为类别贡献证据，把所有词的证据相乘，再乘先验，得到后验概率。'
    },
    principle: {
      text: [
        '贝叶斯定理：P(类别|特征) ∝ P(类别) × P(特征|类别)。',
        '「朴素」= 条件独立假设：P(x₁,x₂|y)=P(x₁|y)P(x₂|y)，让参数估计从指数级降到线性级。',
        '虽然独立性假设常不成立，但朴素贝叶斯在实践中（尤其文本）表现往往出奇地好。'
      ],
      formula: {
        html: '<span class="sym">P</span>(<span class="sym">y</span>|<span class="sym">x</span>) ∝ <span class="sym">P</span>(<span class="sym">y</span>) <span class="op">Π</span> <span class="sym">P</span>(<span class="sym">x</span><sub>i</sub>|<span class="sym">y</span>)',
        note: '后验 ∝ 先验 × 各特征的似然之积。取概率最大的类别作为预测。'
      }
    },
    example: {
      analogy: '判断一封邮件是否垃圾：看到「中奖」「免费」这类词，它们各自独立地提高了「垃圾」的概率，综合起来就下判断。',
      mini: '「免费领取大奖」——「免费」「领取」「大奖」在垃圾邮件里高频、在正常邮件里低频，三者相乘后垃圾概率接近 100%。'
    },
    pros: ['极快、内存占用小，可增量学习', '小样本也能较好工作，天然输出概率', '对无关特征不敏感，实现简单', '文本分类的经典基线'],
    cons: ['条件独立假设在现实中常不成立', '对稀有词/未见组合敏感（需平滑）', '连续特征需假设分布（高斯/多项式）', '概率值通常被过度自信（校准差）'],
    history: [
      { year: '1763', text: '贝叶斯定理发表（贝叶斯死后由其朋友整理出版）。' },
      { year: '1950s+', text: '朴素贝叶斯假设被用于文本与医学诊断。' },
      { year: '1990s', text: '成为垃圾邮件过滤、文档分类的标准方法。' },
      { year: '至今', text: '仍是文本分类、实时预测场景的高性价比基线。' }
    ],
    use: ['文本分类：垃圾邮件、情感分析', '需要实时/低延迟预测', '多分类且类别较均衡', '作为快速基线'],
    avoid: ['特征间强相关且该相关性很重要时', '类别严重不平衡且未校正先验时', '需要精确概率校准时'],
    learn: [
      '先复习 <strong>贝叶斯定理</strong>，搞清先验/似然/后验三者的含义。',
      '理解 <strong>条件独立假设</strong> 如何让计算从「不可能」变「简单」。',
      '亲手做一个 <strong>垃圾邮件分类器</strong>，体会词频证据的累加。',
      '了解 <strong>拉普拉斯平滑</strong> 如何解决「没见过这个词」的概率为零问题。'
    ],
    demo: { id: 'naivebayes', title: '朴素贝叶斯 · 概率边界演示', note: '两类各服从高斯分布，看朴素贝叶斯如何用先验×似然画出决策边界。' }
  },

  {
    id: 'tree',
    num: '03',
    emoji: '🌳',
    name: '决策树',
    en: 'Decision Tree',
    cat: 'super',
    diff: 2,
    accent: '#00e6a0',
    tagline: '像「20 个问题」一样，用一连串 if / else 把数据一路分下去，最后得到结论。',
    intro: {
      what: '一种白盒模型，把数据按「特征 + 阈值」递归切分，形成树状规则。每个内部节点是一个判断，每个叶子节点是一个预测结果（分类或数值）。',
      problem: '线性模型假设关系是线性的，且不易解释复杂规则。如何自动学习一套「人看得懂的 if/else 规则」来做决策？',
      idea: '每次选一个「最能把数据分干净」的特征和切分点，用信息增益 / Gini 不纯度衡量「纯度」，递归分裂直到叶子足够纯。'
    },
    principle: {
      text: [
        '纯度度量：分类用 Gini 不纯度或信息熵；回归用方差（MSE）。分裂的目标是让子节点比父节点更纯。',
        '信息增益 = 分裂前的不纯度 − 分裂后各子节点不纯度的加权平均。选增益最大的切分。',
        '树会一直长到过拟合，因此需要「剪枝」或限制最大深度、最小样本数等。'
      ],
      formula: {
        html: '<span class="fn">Gini</span> = 1 − <span class="op">Σ</span> <span class="sym">p</span><sub>k</sub>²',
        note: 'pₖ 是节点中第 k 类样本的占比。Gini 越小节点越纯（全是一类时为 0）。'
      }
    },
    example: {
      analogy: '银行放贷：收入 > 5000？→ 有房产？→ 无逾期记录？一路问下去，最后给出「批/拒」。这套流程图就是一棵决策树。',
      mini: '判断「今天是否打球」：先看天气（晴/阴/雨），再看湿度，再看风力。晴天且湿度 ≤ 70 → 打球。每个分支都可追溯到一条清晰的规则。'
    },
    pros: ['完全可解释，规则可直接给业务方看', '无需特征缩放，能处理类别与数值混合', '天然处理非线性与特征交互', '训练快，还能输出特征重要性'],
    cons: ['极易过拟合，单棵树泛化差', '对数据微小扰动敏感（换几条数据结构大变）', '贪心切分可能陷入次优', '倾向选择取值多的特征（需修正）'],
    history: [
      { year: '1963', text: 'Morgan 与 Sonquist 提出 AID，最早的自动树模型。' },
      { year: '1979', text: '昆兰（Quinlan）提出 ID3，用信息增益做分类切分。' },
      { year: '1984', text: '布雷曼（Breiman）等提出 CART，支持分类与回归，奠定现代决策树。' },
      { year: '1993', text: 'Quinlan 提出 C4.5，改进信息增益比与剪枝，成为经典。' },
      { year: '至今', text: '单棵树更多作为「积木」，组合成随机森林与梯度提升树。' }
    ],
    use: ['需要可解释规则/合规的场景：信贷审批、医疗辅助', '特征含大量类别与非线性关系', '作为集成模型（RF / GBDT）的基学习器'],
    avoid: ['数据高维稀疏（如文本）时效果差', '追求最高精度且可解释性不重要时', '样本极少且噪声大时'],
    learn: [
      '亲手算一个 <strong>Gini / 信息增益</strong> 的分裂例子，理解「纯度」直觉。',
      '用 sklearn 训练一棵树并 <strong>可视化</strong>，逐条读规则。',
      '理解「树为什么过拟合」，引出 <strong>剪枝与深度限制</strong>。',
      '记住：单棵树是弱模型，它的真正威力在 <strong>随机森林与梯度提升</strong> 中爆发。'
    ],
    demo: { id: 'tree', title: '决策树 · 分裂演示', note: '点「下一步」看贪心算法如何在 2D 数据上不断切分，让每个区域越来越纯。' }
  },

  {
    id: 'forest',
    num: '04',
    emoji: '🌲',
    name: '随机森林',
    en: 'Random Forest',
    cat: 'ensemble',
    diff: 3,
    accent: '#ffb85c',
    tagline: '种一片树、让它们投票——用「群众的智慧」压住单棵树的过拟合。',
    intro: {
      what: '集成学习中的 Bagging 代表：训练许多棵决策树，每棵树用「随机样本 + 随机特征」训练，最后分类投票、回归取平均。',
      problem: '单棵决策树方差大、易过拟合、对数据敏感。如何在不牺牲太多解释性的前提下，大幅提升稳定性和精度？',
      idea: '让很多棵树「各看各的、各自犯错」，再把它们的结果平均/投票，误差互相抵消，方差大幅下降。'
    },
    principle: {
      text: [
        'Bagging（自助采样）：每棵树从原始数据有放回地抽一份样本，训练出自己的模型。',
        '随机特征子集：每次分裂只从随机选出的少量特征里挑最优，进一步让树之间「去相关」。',
        '方差降低原理：若每棵树独立且误差相当，平均后的方差降为原来的 1/T（T 为树的数量）。',
        '副产品：可统计每个特征在分裂中的贡献，得到「特征重要性」。'
      ],
      formula: {
        html: '<span class="sym">ŷ</span><sub>forest</sub> = <span class="frac"><span class="num">1</span><span class="den">T</span></span> <span class="op">Σ</span><sub>t</sub> <span class="sym">tree</span><sub>t</sub>(<span class="sym">x</span>)',
        note: '回归取 T 棵树的平均；分类取多数投票。T 越大越稳定，但收益递减。'
      }
    },
    example: {
      analogy: '请 100 位医生各自诊断（每人只随机看部分症状、各自受过不同数据训练），最后少数服从多数——比任何单个人的判断都稳。',
      mini: '预测房价：训练 500 棵树，每棵给出一个预测，取平均。单棵树可能偏离很远，但 500 个「略显不同」的预测平均后非常接近真相。'
    },
    pros: ['精度高、鲁棒性强，几乎不用调参也能很好', '抗过拟合、对异常值与噪声不敏感', '能处理高维数据，输出特征重要性', '可并行训练，天然支持分类与回归'],
    cons: ['模型体积大，训练与预测都比单棵树慢', '可解释性差（黑盒集合）', '对高维稀疏数据（文本）不如线性模型', '极端不平衡数据下仍需特殊处理'],
    history: [
      { year: '1996', text: '布雷曼（Breiman）提出 Bagging，证明平均可降低方差。' },
      { year: '2001', text: 'Breiman 发表《Random Forests》，将随机特征子集与 Bagging 结合。' },
      { year: '2000s', text: '凭借「开箱即用」的强性能，成为表格数据的事实标准基线。' },
      { year: '至今', text: '仍是许多工业问题（风控、推荐、异常检测）的首选强基线。' }
    ],
    use: ['表格数据的中到大规模分类/回归任务', '特征重要性分析、特征筛选', '需要稳健、省心的默认强模型时'],
    avoid: ['图像、语音等原始信号（深度学习更优）', '需要逐条可解释规则时', '对推理延迟有极严格要求的场景'],
    learn: [
      '先彻底理解 <strong>Bagging 为什么降方差</strong>（独立误差平均）。',
      '对比 <strong>单棵树 vs 随机森林</strong> 的决策边界与准确率，直观感受差异。',
      '理解 <strong>随机特征子集</strong> 的作用：让树之间去相关，才能让平均更有效。',
      '动手调 <strong>n_estimators、max_depth、max_features</strong>，观察精度与速度的权衡。'
    ],
    demo: { id: 'forest', title: '随机森林 · Bagging 演示', note: '多条高方差曲线各自拟合带噪声数据，看「取平均」后如何得到一条平滑、稳健的曲线。' }
  },

  {
    id: 'adaboost',
    num: '11',
    emoji: '💪',
    name: 'AdaBoost',
    en: 'AdaBoost',
    cat: 'ensemble',
    diff: 3,
    accent: '#ffb85c',
    tagline: '「知错就改」——每轮把注意力放到上一轮分错的样本上，让弱分类器接力变强。',
    intro: {
      what: '经典 Boosting 算法：串行训练一系列弱分类器（常为决策树桩），每轮提高被分错样本的权重，最后按各分类器准确率加权投票。',
      problem: '单个弱分类器（比瞎猜好一点）能力有限；如何把一堆「弱鸡」组合成「强者」？',
      idea: '每一轮都重点「补考」上一轮的错题：错分样本权重加大，逼下一个分类器专门学它们，最后加权合并。'
    },
    principle: {
      text: [
        '初始化所有样本权重相等，训练第一个弱分类器。',
        '每轮之后：提高分错样本的权重、降低分对样本的权重，让下一轮「聚焦」困难样本。',
        '每个弱分类器按错误率得到一个权重 α（越准权重越大），最终加权多数投票。'
      ],
      formula: {
        html: '<span class="sym">H</span>(<span class="sym">x</span>) = <span class="fn">sign</span><span class="op">(</span> <span class="op">Σ</span> <span class="sym">α</span><sub>t</sub> · <span class="sym">h</span><sub>t</sub>(<span class="sym">x</span>) <span class="op">)</span>',
        note: '最终预测 = 所有弱分类器 hₜ 按其权重 αₜ 的加权和取符号。'
      }
    },
    example: {
      analogy: '老师上课：先统一讲一遍，把全班错得最多的题重点再讲，再错再讲……几轮下来，大家都掌握了难点。',
      mini: '用 50 个「决策树桩」做 AdaBoost，每个桩只做一次判断，叠加起来能画出非常复杂的决策边界。'
    },
    pros: ['精度高，能把弱模型变成强模型', '无需手动设计复杂特征', '对基分类器要求低', '理论保证强（指数损失最小化）'],
    cons: ['对噪声和离群点敏感（错分样本被反复加权）', '串行训练，无法并行', '基分类器太弱或太强都不理想', '表格数据上不如 GBDT/XGBoost 稳定'],
    history: [
      { year: '1995', text: 'Freund 与 Schapire 提出 AdaBoost，Boosting 思想走向实用。' },
      { year: '1997', text: 'Freund 与 Schapire 提出更通用的 AdaBoost.M1/M2。' },
      { year: '2003', text: '两人因 AdaBoost 荣获理论计算机科学最高奖——哥德尔奖。' },
      { year: '至今', text: '思想演化为梯度提升（GBDT/XGBoost），成为竞赛主力。' }
    ],
    use: ['小到中型分类任务，追求精度', '需要自动「聚焦」难样本的场景', '作为理解 Boosting 思想的入门'],
    avoid: ['数据含大量噪声/错标时', '需要并行训练的超大数据', '对实时性要求高的场景（可换树模型）'],
    learn: [
      '先搞懂 <strong>弱分类器 + 加权投票</strong> 的基本框架。',
      '理解 <strong>样本权重如何更新</strong>：错分样本权重放大，是 AdaBoost 的灵魂。',
      '在演示里看 <strong>点的大小（权重）</strong> 每轮如何变化、边界如何越分越准。',
      '对比 <strong>AdaBoost vs 随机森林（Bagging）</strong>：一个串行降偏差，一个并行降方差。'
    ],
    demo: { id: 'adaboost', title: 'AdaBoost · 加权提升演示', note: '每轮一个决策树桩，点的大小=样本权重；看错分点如何被放大、边界如何变准。' }
  },

  {
    id: 'xgboost',
    num: '05',
    emoji: '⚡',
    name: 'XGBoost',
    en: 'XGBoost',
    cat: 'ensemble',
    diff: 4,
    accent: '#ffb85c',
    tagline: 'Kaggle 竞赛的「大杀器」——把一串弱小的树串起来，越错越补，直到近乎完美。',
    intro: {
      what: '梯度提升决策树（GBDT）的高性能实现。Boosting 家族代表：串行训练许多棵小树，每棵新树专门去拟合前面模型的「残差」，逐步逼近目标。',
      problem: 'Bagging 让树并行、平均；但「平均」只能降方差。若模型本身偏差大、欠拟合怎么办？如何让弱模型「接力」变得极强？',
      idea: '加法模型：每新增一棵树，都让整体预测更接近真实值（拟合残差/负梯度），像「每次只补上次没学会的部分」。'
    },
    principle: {
      text: [
        '与随机森林不同，Boosting 是串行的：第 t 棵树拟合前 t−1 棵树的残差（梯度方向），一步步降低偏差。',
        'XGBoost 用损失函数的「二阶泰勒展开」（梯度 + Hessian）更精确地决定每步走多远，收敛更快。',
        '加入正则化（叶子数、权重 L2）防过拟合，并做大量工程优化（稀疏感知、缓存、并行建树）。'
      ],
      formula: {
        html: '<span class="sym">ŷ</span><sub>i</sub><sup>(t)</sup> = <span class="sym">ŷ</span><sub>i</sub><sup>(t−1)</sup> + <span class="sym">η</span> · <span class="sym">f</span><sub>t</sub>(<span class="sym">x</span><sub>i</sub>)',
        note: '第 t 轮预测 = 上一轮预测 + 学习率 η × 新树 fₜ 的输出。新树拟合的是当前模型的负梯度（残差）。'
      }
    },
    example: {
      analogy: '背单词：第一遍把会与不会的都过一遍，第二遍只背第一遍「不会的」，第三遍只背还不会的……几轮下来，不会的越来越少。',
      mini: '预测房价：先用均值预测（残差很大），第一棵树拟合残差，第二棵树拟合剩下的残差……500 棵树叠加后，预测几乎贴着真实曲线。'
    },
    pros: ['精度通常是表格数据的天花板，竞赛霸主', '内置正则化、缺失值处理、早停', '输出特征重要性，可做特征选择', '支持并行建树与分布式训练'],
    cons: ['参数多、调参成本高', '对噪声和离群点敏感，可能过拟合', '串行训练，比随机森林慢', '黑盒，可解释性差'],
    history: [
      { year: '1999', text: '弗里德曼（Friedman）提出梯度提升（Gradient Boosting），奠定 GBDT 理论基础。' },
      { year: '2014', text: '陈天奇发布 XGBoost，凭借速度与精度横扫 Kaggle 竞赛。' },
      { year: '2017', text: '微软发布 LightGBM、俄罗斯 Yandex 发布 CatBoost，进一步优化速度与类别处理。' },
      { year: '至今', text: '梯度提升树仍是结构化表格数据上最强、最常用的模型家族。' }
    ],
    use: ['结构化表格数据的分类/回归，追求最高精度', 'Kaggle 等竞赛', '特征重要性与特征选择', '风控、点击率预估、销量预测'],
    avoid: ['数据量小或噪声大时需谨慎（易过拟合）', '需要逐条可解释性时', '图像/语音/文本等原始信号（深度学习更优）'],
    learn: [
      '先吃透 <strong>决策树 + 残差拟合</strong>，理解 Boosting 与 Bagging 的本质区别（串行降偏差 vs 并行降方差）。',
      '理解 <strong>二阶泰勒展开</strong> 为什么让 XGBoost 比普通 GBDT 更快更准。',
      '掌握核心超参：<strong>learning_rate、n_estimators、max_depth、subsample、reg_lambda</strong>。',
      '上 Kaggle 跑一个表格比赛，用 <strong>早停（early stopping）</strong> 防过拟合。'
    ],
    demo: { id: 'xgboost', title: 'XGBoost · 残差拟合演示', note: '逐步叠加小树拟合残差，观察预测曲线如何从「均值」一步步逼近真实函数。' }
  },

  {
    id: 'svm',
    num: '06',
    emoji: '🧭',
    name: '支持向量机',
    en: 'Support Vector Machine',
    cat: 'super',
    diff: 4,
    accent: '#00e6a0',
    tagline: '找一条「离两类都最远」的分界线——追求最大间隔，而不是勉强分开。',
    intro: {
      what: '一种分类器，核心目标是找到一个超平面，使两类样本到它的「最小距离」（间隔 margin）最大化。',
      problem: '能分开两类的线有无数条，哪一条最好？直觉上，「离两类都尽量远」的那条最稳，对没见过的新数据容错最高。',
      idea: '只关心贴着边界的少数「支持向量」，最大化间隔；线性不可分时用「核技巧」升维，在高维空间里线性分开。'
    },
    principle: {
      text: [
        '最大间隔：在两类之间画最宽的「安全带」，带子边界由少数支持向量撑起，其余点不影响边界。',
        '软间隔：允许少量点越界（用松弛变量 + 惩罚参数 C 权衡），以换取更好的泛化。',
        '核技巧：数据在原空间线性不可分时，用核函数隐式映射到高维，在高维里线性可分（如 RBF 核）。'
      ],
      formula: {
        html: '<span class="fn">min</span> <span class="frac"><span class="num">1</span><span class="den">2</span></span>‖<span class="sym">w</span>‖² + <span class="sym">C</span> <span class="op">Σ</span> <span class="sym">ξ</span><sub>i</sub>',
        note: '目标 = 最大化间隔（最小化 ‖w‖²）+ 惩罚越界点（C·Σξᵢ）。C 越大越不容忍错误，越容易过拟合。'
      }
    },
    example: {
      analogy: '在两类点之间画一条最宽的马路，路两侧的「护栏」由离得最近的那几个点（支持向量）决定；新来的点落在哪一侧就归哪类。',
      mini: '区分「猫 vs 狗」的图片：提取特征后，SVM 找一条离两类样本都最远的分界面。对于绕成一圈的数据，用 RBF 核就能画出弯曲的边界。'
    },
    pros: ['小样本、高维数据上表现优异', '核技巧能处理非线性，理论保证强', '只有支持向量决定模型，天然稀疏', '泛化能力强，不易过拟合'],
    cons: ['大样本训练慢（二次规划/迭代开销大）', '对参数 C 与核函数、gamma 敏感，需调参', '不直接输出概率（需 Platt 校准）', '结果不如树/深度学习可解释'],
    history: [
      { year: '1963', text: 'Vapnik 与 Chervonenkis 提出线性支持向量分类，最大间隔思想萌芽。' },
      { year: '1992', text: 'Boser、Guyon、Vapnik 引入核技巧，SVM 可处理非线性问题。' },
      { year: '1995', text: 'Cortes 与 Vapnik 提出软间隔 SVM，解决噪声与不完全可分问题。' },
      { year: '2000s', text: '在深度学习崛起前，SVM 是分类任务的黄金标准。' },
      { year: '至今', text: '在小样本、高维（如文本、生物信息）场景仍有不可替代的价值。' }
    ],
    use: ['小样本、高维数据：文本分类、基因表达', '需要强泛化与清晰几何直觉的场景', '非线性小数据（用 RBF 核）'],
    avoid: ['样本量巨大时（训练太慢，可换线性/树模型）', '需要概率输出且未校准时', '特征多为类别型且高基数时'],
    learn: [
      '先建立 <strong>几何直觉</strong>：为什么「最大间隔」比「勉强分开」更好。',
      '搞懂 <strong>支持向量</strong> 是哪些点、为什么它们决定边界。',
      '理解 <strong>核技巧</strong>：RBF 核如何在「不显式算高维坐标」的情况下画出弯曲边界。',
      '动手体会 <strong>C 与 gamma</strong> 对边界形状的影响（过拟合 vs 欠拟合）。'
    ],
    demo: { id: 'svm', title: 'SVM · 3D 核技巧', note: '拖拽旋转；把 2D 里线性不可分的圆环数据抬到 3D（z=x²+y²），一个平面即可干净分开。' }
  },

  {
    id: 'kmeans',
    num: '07',
    emoji: '🧩',
    name: 'K-Means 聚类',
    en: 'K-Means Clustering',
    cat: 'unsuper',
    diff: 2,
    accent: '#a06bff',
    tagline: '没有标签怎么办？自己把数据分成 K 堆——最经典的聚类算法。',
    intro: {
      what: '一种无监督算法，把 n 个点划分到 K 个簇，使每个点到其所属簇中心的距离平方和最小。',
      problem: '数据没有标签，但你想发现内在的分组结构（用户分群、图像分割、异常点）。如何自动、快速地把相似的点聚到一起？',
      idea: '先随机放 K 个中心，反复「分配最近点 → 重新算中心」，直到中心不再移动，就像不断「抢地盘」直到稳定。'
    },
    principle: {
      text: [
        '初始化：随机选 K 个质心（或用 K-Means++ 改善初始化）。',
        '分配步：每个点归到最近的质心，形成 K 个簇。',
        '更新步：每个簇的质心移到簇内所有点的均值位置。',
        '重复直到质心几乎不动或达到最大迭代次数，收敛到局部最优。'
      ],
      formula: {
        html: '<span class="fn">argmin</span><sub>S</sub> <span class="op">Σ</span><sub>k</sub> <span class="op">Σ</span><sub>x∈S<sub>k</sub></sub> ‖<span class="sym">x</span> − <span class="sym">μ</span><sub>k</sub>‖²',
        note: '最小化「簇内平方和」（SSE）。μₖ 是第 k 个簇的中心。'
      }
    },
    example: {
      analogy: '商场给顾客分群：随机猜 K 个「典型画像」，把每个顾客归到最像的那类，再根据实际成员更新画像，反复直到画像稳定。',
      mini: '把客户按「年消费额 vs 访问频率」聚成 3 类：高价值、普通、流失边缘——用于精准营销。'
    },
    pros: ['简单、直观、计算快，可扩展到大数据', '实现容易，是聚类任务的天然基线', '结果容易可视化与解释'],
    cons: ['必须预先指定 K（可借助肘部法则选）', '对初始质心敏感，可能陷入次优', '只适合球形簇，对非凸/密度不均的簇失效', '对异常值敏感，只能硬分配'],
    history: [
      { year: '1957', text: 'Lloyd 提出迭代量化算法（信号处理领域），即后来的 K-Means 思想。' },
      { year: '1967', text: 'MacQueen 正式命名「K-Means」并给出经典描述。' },
      { year: '2007', text: 'Arthur 与 Vassilvitskii 提出 K-Means++ 初始化，显著改善质量与速度。' },
      { year: '至今', text: '仍是最广泛使用的聚类算法，也是许多进阶方法的基础。' }
    ],
    use: ['客户/用户分群、市场细分', '图像颜色量化、图像分割', '数据预处理中的粗分组、异常检测辅助'],
    avoid: ['簇形状非球形或大小差异悬殊时（换 DBSCAN/谱聚类）', '无法确定 K 且业务上也不明确时', '存在大量离群点时'],
    learn: [
      '在演示里 <strong>手动点「下一步」</strong>，看分配步与更新步交替，建立肌肉记忆。',
      '用 <strong>肘部法则</strong> 选 K：画出「SSE vs K」的曲线，找拐点。',
      '理解 <strong>初始化敏感性</strong>，尝试 K-Means++ 的改进。',
      '对比 <strong>K-Means vs DBSCAN vs 层次聚类</strong>，知道何时该换。'
    ],
    demo: { id: 'kmeans', title: 'K-Means · 3D 聚类', note: '拖拽旋转 3D 点云，选 K 点「下一步」看「分配 → 更新质心」如何交替，直到收敛。' }
  },

  {
    id: 'dbscan',
    num: '14',
    emoji: '🫧',
    name: 'DBSCAN 密度聚类',
    en: 'DBSCAN',
    cat: 'unsuper',
    diff: 3,
    accent: '#a06bff',
    tagline: '「人以群分」按密度——不需要指定分几类，还能自动识别离群点。',
    intro: {
      what: '基于密度的聚类算法：把「高密度区域」连成簇，稀疏处的点视为噪声，无需预设簇的数量。',
      problem: 'K-Means 需要预先指定 K、且只擅长球形簇；现实中的簇形状任意、还混有离群点。',
      idea: '一个点邻域内若有不少于 minPts 个邻居，就是「核心点」；核心点连成一片形成簇，够不着的点是噪声。'
    },
    principle: {
      text: [
        '两个参数：eps（邻域半径）与 minPts（成为核心点的最少邻居数）。',
        '核心点：eps 邻域内点数 ≥ minPts；边界点：邻域点不够但落在某核心点邻域内；噪声点：两者都不是。',
        '从任意核心点出发，把「密度可达」的点不断扩展，直到形成一个簇。'
      ],
      formula: {
        html: '<span class="fn">N</span><sub>eps</sub>(<span class="sym">p</span>) = { <span class="sym">q</span> : <span class="fn">dist</span>(<span class="sym">p</span>,<span class="sym">q</span>) ≤ <span class="sym">eps</span> }',
        note: 'p 的 eps 邻域内点的集合。若 |N_eps(p)| ≥ minPts，则 p 是核心点。'
      }
    },
    example: {
      analogy: '城市聚落：人群密集的地方连成一片就是「城区」，孤零零的房子就是「离群点」，不需要事先说好有几座城。',
      mini: '出租车载客热点分析：把 GPS 点用 DBSCAN 聚类，能自动找到商圈，还能识别出「不该有人的异常点」。'
    },
    pros: ['无需预设 K，自动发现簇的数量', '能发现任意形状的簇', '天然识别噪声/离群点', '对簇内密度均匀的数据效果好'],
    cons: ['对 eps 与 minPts 很敏感，选参难', '密度差异大的数据上表现差', '高维数据下距离失效（维度灾难）', '边界点归属可能不确定'],
    history: [
      { year: '1996', text: 'Ester 等提出 DBSCAN，成为密度聚类的代表算法。' },
      { year: '2014', text: 'HDBSCAN 提出，自动选择密度层次，减少参数敏感问题。' },
      { year: '至今', text: '广泛用于地理、异常检测、图像分割等需要任意形状聚类的场景。' }
    ],
    use: ['任意形状的聚类、空间数据', '需要同时识别离群点的任务', '不确定簇数量时'],
    avoid: ['密度差异很大的簇', '高维数据', '对 eps/minPts 无先验且无法调参时'],
    learn: [
      '先理解 <strong>核心点/边界点/噪声点</strong> 三者的定义。',
      '在演示里 <strong>拖动 eps 与 minPts</strong>，看簇如何「连成一片」或「碎成噪声」。',
      '掌握 <strong>k-距离图</strong> 选 eps 的技巧。',
      '对比 <strong>K-Means（球形、需 K） vs DBSCAN（任意形状、需密度）</strong>。'
    ],
    demo: { id: 'dbscan', title: 'DBSCAN · 3D 密度聚类', note: '拖拽旋转，看两个分离的 3D 甜甜圈如何被连成簇、噪声点如何被标灰。' }
  },

  {
    id: 'pca',
    num: '08',
    emoji: '🪞',
    name: 'PCA 主成分分析',
    en: 'Principal Component Analysis',
    cat: 'unsuper',
    diff: 3,
    accent: '#a06bff',
    tagline: '把高维数据「压扁」到几根主轴——去噪、降维、可视化。',
    intro: {
      what: '一种线性降维方法，把数据投影到方差最大的几个正交方向上（主成分），用少数维度保留尽可能多的信息。',
      problem: '特征太多会带来维度灾难、计算昂贵、冗余与噪声；高维数据也无法可视化。如何用更少的维度「尽量不丢信息」地表示数据？',
      idea: '找数据散布最广的方向（第一主成分），再找与它正交且方差次大的方向（第二主成分），以此类推。'
    },
    principle: {
      text: [
        '第一主成分 = 数据方差最大的方向；第二主成分 = 与第一个正交的方向里方差最大的……',
        '数学上等价于对「协方差矩阵」做特征分解（或对数据中心化后做 SVD），特征值即各主成分的方差。',
        '方差解释率 = 该特征值 / 所有特征值之和，用来决定保留几个主成分。'
      ],
      formula: {
        html: '<span class="sym">Z</span> = <span class="sym">X</span><span class="sym">W</span> <span class="op">,</span>　 <span class="fn">Cov</span>(<span class="sym">X</span>) = <span class="sym">W</span> <span class="sym">Λ</span> <span class="sym">W</span><sup>T</sup>',
        note: 'W 的列是协方差矩阵的特征向量（主成分方向），Λ 的对角线是特征值（各方向方差）。'
      }
    },
    example: {
      analogy: '给一堆散落的点找一个「最能代表它们走势」的箭头——把点都投影到箭头上，就得到一维数据，损失的信息最少。',
      mini: '把 100 维的人脸像素降成 50 维，再用 2 维可视化——相似的样本自然聚在一起，这就是「特征脸」的原理。'
    },
    pros: ['降维去噪、加速下游模型', '去除特征相关性，缓解多重共线性', '可视化高维数据', '计算简单、可逆（可近似重构）'],
    cons: ['只做线性降维，非线性结构无能为力', '主成分是特征的线性组合，难以解释', '对特征尺度敏感，必须标准化', '信息损失难以避免'],
    history: [
      { year: '1901', text: '皮尔逊（Pearson）首次提出主成分的概念。' },
      { year: '1933', text: '霍特林（Hotelling）独立发展并命名 PCA，建立现代形式。' },
      { year: '1990s', text: '与 SVD 结合，广泛应用于人脸识别（特征脸）与图像压缩。' },
      { year: '至今', text: '仍是降维、可视化与数据预处理的标准工具，并衍生出 Kernel PCA、t-SNE 等。' }
    ],
    use: ['高维数据可视化（降到 2D/3D）', '降维加速 + 去噪 + 去除共线性', '特征提取（如金融因子、基因数据）'],
    avoid: ['需要可解释特征时（主成分难以解释）', '数据非线性结构强时（换 t-SNE/UMAP/自编码器）', '特征尺度不一致且未标准化时'],
    learn: [
      '先建立 <strong>「方差最大方向」</strong> 的几何直觉，再看协方差矩阵。',
      '理解 <strong>特征值 = 方差</strong>、<strong>方差解释率</strong> 的物理含义。',
      '亲手对 2D 数据算协方差矩阵并求特征向量，验证与演示一致。',
      '对比 <strong>PCA（线性） vs t-SNE（非线性）</strong> 的适用场景。'
    ],
    demo: { id: 'pca', title: 'PCA · 3D 主成分演示', note: '拖拽旋转 3D 数据云，看三个主成分方向如何依次抓住最大方差，以及投影到 PC1。' }
  },

  {
    id: 'tsne',
    num: '16',
    emoji: '🗺️',
    name: 't-SNE 降维可视化',
    en: 't-SNE',
    cat: 'unsuper',
    diff: 4,
    accent: '#a06bff',
    tagline: '把高维数据「捏」成 2D 地图——专为可视化而生，让相似的样本聚成团。',
    intro: {
      what: '非线性降维算法，目标是让高维空间中「相近的点」在低维映射后仍然相近，主要用于高维数据可视化。',
      problem: 'PCA 只做线性降维，真实数据（如手写数字）的非线性结构在 2D 里展不开、糊成一团。',
      idea: '用概率描述「谁离谁近」：高维里是邻居的概率 vs 低维里是邻居的概率，让两个分布尽量一致（最小化 KL 散度）。'
    },
    principle: {
      text: [
        '高维空间：用高斯分布把「点 i 选 j 为邻居」建模成条件概率 p(j|i)。',
        '低维空间：用 t 分布（厚尾）建模对应概率 q(j|i)，厚尾让中等距离的点被推开、不挤成一团。',
        '用梯度下降最小化两个分布的 KL 散度，逐步把点「摆放」到合适位置。'
      ],
      formula: {
        html: '<span class="fn">min</span> <span class="op">Σ</span> <span class="sym">KL</span>(<span class="sym">P</span> ‖ <span class="sym">Q</span>) = <span class="op">Σ</span> <span class="sym">p</span><sub>ij</sub> <span class="fn">log</span> <span class="frac"><span class="num">p<sub>ij</sub></span><span class="den">q<sub>ij</sub></span></span>',
        note: '让低维分布 Q 尽量接近高维邻居分布 P。结果：相似样本聚成团。'
      }
    },
    example: {
      analogy: '把 784 维的手写数字「压」到 2D 纸上，摆得越像原图近邻关系越好——同一数字自然聚成一堆。',
      mini: '对 MNIST 做 t-SNE，画出来看到 0~9 各成一团、边界清晰，肉眼就能看出模型学到的结构。'
    },
    pros: ['可视化效果极佳，保局部结构', '能揭示 PCA 看不到的非线性结构', '是探索高维数据的利器'],
    cons: ['计算慢（O(n²)），难处理大数据', '结果随机、每次运行可能不同', '只适合可视化，不适合作为下游特征', '对困惑度 perplexity 等参数敏感'],
    history: [
      { year: '2008', text: 'van der Maaten 与 Hinton 提出 t-SNE，改进 SNE 的「拥挤问题」。' },
      { year: '2014', text: 'Barnes-Hut t-SNE 大幅加速，可处理数万点。' },
      { year: '2018', text: 'UMAP 提出，速度更快且更好保持全局结构，逐渐流行。' },
      { year: '至今', text: 't-SNE/UMAP 成为高维数据探索与论文配图的标准工具。' }
    ],
    use: ['高维数据可视化（图像、基因、词向量）', '发现数据中的聚类/异常结构', '探索性数据分析'],
    avoid: ['作为下游模型的降维输入（用 PCA/自编码器）', '超大数据集（用 UMAP）', '需要可复现/可解释的降维时'],
    learn: [
      '先理解 <strong>「保邻居关系」</strong> 这个目标，以及它与 PCA「保方差」的区别。',
      '认识两个关键超参：<strong>困惑度 perplexity</strong> 与 <strong>迭代次数</strong>。',
      '记住：<strong>t-SNE 的簇大小和距离没有绝对意义</strong>，别过度解读。',
      '对比 <strong>PCA（线性、快、可解释） vs t-SNE/UMAP（非线性、慢、仅可视化）</strong>。'
    ],
    demo: { id: 'tsne', title: 't-SNE · 3D 降维', note: '真实 t-SNE 把 4 个高维簇嵌入到 3D；拖拽旋转，拖动迭代看它们从一团随机逐渐分离。' }
  },

  {
    id: 'mlp',
    num: '09',
    emoji: '🧠',
    name: '神经网络',
    en: 'Neural Network (MLP)',
    cat: 'dl',
    diff: 3,
    accent: '#ff7ac6',
    tagline: '层层叠加的「万能函数逼近器」——深度学习的一切都从这里开始。',
    intro: {
      what: '由多层神经元（权重 + 激活函数）堆叠而成的模型，能拟合任意复杂函数。它是 CNN、RNN、Transformer 的共同基石。',
      problem: '线性模型无法处理「异或」这类非线性可分问题；手工构造特征又费时费力。如何让模型自动学习特征与非线性关系？',
      idea: '把简单线性变换 + 非线性激活反复叠加，用反向传播（链式法则）逐层更新权重，让网络自动学出复杂特征。'
    },
    principle: {
      text: [
        '前向传播：每层计算 z = W·x + b，再过激活函数 a = σ(z)（如 ReLU、sigmoid）。',
        '非线性激活是关键：没有它，再多层也等价于一个线性变换（连 XOR 都学不会）。',
        '反向传播：用链式法则从输出层往回算梯度，再用梯度下降更新所有权重。',
        '「万能逼近定理」保证：一个足够宽的隐藏层就能逼近任意连续函数。'
      ],
      formula: {
        html: '<span class="sym">a</span><sup>(l)</sup> = <span class="fn">σ</span>(<span class="sym">W</span><sup>(l)</sup><span class="sym">a</span><sup>(l−1)</sup> + <span class="sym">b</span><sup>(l)</sup>)',
        note: '第 l 层的输出 = 激活函数(权重 × 上层输出 + 偏置)。误差通过链式法则逐层回传更新权重。'
      }
    },
    example: {
      analogy: '识别图片：第一层识别边缘，第二层把边缘组合成形状，第三层把形状组合成物体——层层抽象，就像人脑逐级加工信息。',
      mini: '解决 XOR（异或）：单个线性分类器无论如何都分不开，但一个带隐藏层的 MLP 能画出弯曲的决策边界，轻松分开四个点。'
    },
    pros: ['表达力极强，可逼近任意函数', '自动学习特征，端到端训练', '可扩展到图像、语音、文本等任意数据', '随数据量增大性能持续提升'],
    cons: ['需要大量数据与算力', '黑盒，难以解释', '易过拟合，需正则化/早停/BN 等', '超参数多，调参困难'],
    history: [
      { year: '1943', text: 'McCulloch 与 Pitts 提出 MCP 神经元，神经网络思想起源。' },
      { year: '1958', text: 'Rosenblatt 提出感知机，引发第一波热潮。' },
      { year: '1986', text: 'Rumelhart 等推广反向传播算法，多层网络可训练。' },
      { year: '2006', text: 'Hinton 提出深度信念网络，深度学习复兴。' },
      { year: '2012', text: 'AlexNet 在 ImageNet 大胜，深度学习全面爆发。' }
    ],
    use: ['非线性分类/回归、复杂模式识别', '图像、语音、文本等原始信号', '需要自动特征提取的端到端任务'],
    avoid: ['小样本表格数据（树模型/线性通常更好）', '需要强可解释性时', '算力与数据都不足时'],
    learn: [
      '先 <strong>手写一个 XOR 网络</strong>，从前向到反向完整实现，这是理解深度学习的分水岭。',
      '搞懂 <strong>激活函数为什么必须非线性</strong>，以及 ReLU 为什么流行。',
      '用链式法则 <strong>手推一层反向传播</strong>，理解梯度如何逐层传递。',
      '再上框架（PyTorch/Keras），把「手写版」翻译成「框架版」，体会抽象。'
    ],
    demo: { id: 'mlp', title: '神经网络 · 3D 结构', note: '拖拽旋转看 MLP 三层结构，训练解决 XOR；节点颜色=激活值，连线青=正权重、品红=负权重、粗细=|权重|。' }
  },

  {
    id: 'cnn',
    num: '18',
    emoji: '🖼️',
    name: '卷积神经网络',
    en: 'Convolutional Neural Network',
    cat: 'dl',
    diff: 4,
    accent: '#ff7ac6',
    tagline: '给神经网络装上「局部视野」——用滑动的小窗口扫描图像，自动提取边缘、纹理、物体。',
    intro: {
      what: '为图像等网格数据设计的网络，用「卷积核」在输入上滑动做局部特征提取，配合池化降采样，层层抽象。',
      problem: '图像用 MLP 处理会参数爆炸，且丢失像素间的空间结构；如何高效地利用「局部相关性」和「平移不变性」？',
      idea: '卷积=一个小的权重矩阵（核）在图像上滑动、逐块加权求和；同一核全图共享参数，天然捕捉局部模式。'
    },
    principle: {
      text: [
        '卷积层：多个卷积核分别提取不同特征（边缘、纹理），生成多张特征图。',
        '池化层：对局部区域取最大/平均，降低分辨率、增强平移不变性。',
        '堆叠多个卷积+池化，浅层学边缘、深层学部件、再深层学整体物体。'
      ],
      formula: {
        html: '<span class="sym">(I ∗ K)</span>(<span class="sym">i</span>,<span class="sym">j</span>) = <span class="op">Σ</span><sub>m,n</sub> <span class="sym">I</span>(<span class="sym">i</span>+<span class="sym">m</span>,<span class="sym">j</span>+<span class="sym">n</span>) <span class="sym">K</span>(<span class="sym">m</span>,<span class="sym">n</span>)',
        note: '输出特征图 (i,j) 处的值 = 图像局部区域与卷积核 K 的逐元素乘加。'
      }
    },
    example: {
      analogy: '用一块 3×3 的「放大镜」在图片上滑动，每到一处就提取该局部的一个特征（如「这里有没有竖直边缘」）。',
      mini: '识别猫：浅层卷积学到边缘，中层学到眼睛、耳朵的形状，深层把这些部件组合起来识别出「猫」。'
    },
    pros: ['参数共享，参数量远小于 MLP', '保留空间结构，局部感知强', '平移不变，泛化好', '图像/视频任务的绝对主力'],
    cons: ['需要海量数据与算力', '对旋转、尺度变化敏感（需数据增强）', '黑盒，难以解释', '调参复杂'],
    history: [
      { year: '1998', text: 'LeCun 提出 LeNet-5，用于手写数字识别，奠定 CNN 架构。' },
      { year: '2012', text: 'AlexNet 在 ImageNet 大胜，掀起深度学习革命。' },
      { year: '2015', text: 'ResNet 用残差连接让上百层网络可训练。' },
      { year: '至今', text: 'CNN 是视觉任务基石，并衍生出目标检测、分割等大量应用。' }
    ],
    use: ['图像分类、目标检测、分割', '视频理解、医学影像', '任何具有空间/网格结构的数据'],
    avoid: ['表格数据（树模型/MLP 更好）', '数据量极少的场景', '需要严格可解释性的场景'],
    learn: [
      '先在演示里 <strong>亲手滑一个卷积核</strong>，理解「滑动+加权求和」到底是什么。',
      '搞懂 <strong>步长、填充、池化、感受野</strong> 四个概念。',
      '用 Keras/PyTorch 搭一个 <strong>LeNet/Mini-CNN</strong> 跑 MNIST。',
      '理解 <strong>为什么越深越抽象</strong>：可视化每层学到的特征。'
    ],
    demo: { id: 'cnn', title: 'CNN · 3D 特征体', note: '拖拽旋转；一个 8×8 图像经 4 个卷积核变成 4 通道的 3D 特征体（6×6×4）。' }
  },

  {
    id: 'autoencoder',
    num: '19',
    emoji: '🗜️',
    name: '自编码器',
    en: 'Autoencoder',
    cat: 'dl',
    diff: 4,
    accent: '#ff7ac6',
    tagline: '让网络「压缩再还原」——学到的中间瓶颈，就是数据最精华的表示。',
    intro: {
      what: '一种无监督网络：编码器把输入压缩到低维隐空间，解码器再从隐空间重建输入，训练目标是最小化重建误差。',
      problem: '没有标签时，如何自动学到紧凑、有用的特征表示？如何降噪、降维？',
      idea: '通过「重建输入」这个自监督任务，逼网络在瓶颈处保留最关键信息，从而学到数据的本质表示。'
    },
    principle: {
      text: [
        '编码器 Enc(x)→z，把高维输入压到低维隐向量 z。',
        '解码器 Dec(z)→x̂，从 z 重建输入，损失 = ‖x − x̂‖²。',
        '瓶颈越小，网络越被迫只保留最重要的信息；变体：去噪自编码器、变分自编码器 VAE。'
      ],
      formula: {
        html: '<span class="fn">L</span> = ‖ <span class="sym">x</span> − <span class="fn">Dec</span>(<span class="fn">Enc</span>(<span class="sym">x</span>)) ‖²',
        note: '重建损失：让输出尽量还原输入。隐向量 z 就是学到的紧凑表示。'
      }
    },
    example: {
      analogy: '把一篇长文提炼成一句话大纲（编码），再凭大纲复述全文（解码）。大纲越短，越能逼你抓住精髓。',
      mini: '把 784 维的手写数字压到 2 维再重建：重建虽略有损失，但那 2 维已经抓住了数字最关键的信息，可用于可视化。'
    },
    pros: ['无需标签，自监督学习特征', '可降维、去噪、异常检测', '是 VAE、扩散模型等生成模型的基础'],
    cons: ['隐空间难解释、不保证语义', '重建好≠表示有用', '易学到恒等映射（需正则/瓶颈约束）', '训练不总稳定'],
    history: [
      { year: '1980s', text: '自编码器作为神经网络降维方法出现。' },
      { year: '2006', text: 'Hinton 用逐层预训练的深度自编码器开启深度学习复兴。' },
      { year: '2013', text: 'Kingma 提出变分自编码器 VAE，成为经典生成模型。' },
      { year: '至今', text: '自编码思想演化为去噪扩散模型（DDPM）等前沿生成方法。' }
    ],
    use: ['无监督特征学习与降维', '图像去噪、异常检测', '生成模型的基石（VAE）'],
    avoid: ['需要可解释特征时（用 PCA）', '下游任务有大量标签时（监督学习更好）', '数据规模大且只需压缩时（PCA 更快）'],
    learn: [
      '先理解 <strong>「压缩-重建」</strong> 为什么能逼出好特征。',
      '对比 <strong>自编码器 vs PCA</strong>：线性 vs 非线性降维。',
      '动手训练一个 <strong>去噪自编码器</strong>，感受「先加噪再还原」的神奇。',
      '进阶了解 <strong>VAE 的隐空间采样</strong> 与生成能力。'
    ],
    demo: { id: 'autoencoder', title: '自编码器 · 3D 流形重建', note: '拖拽旋转；一个 3D→1D→3D 非线性自编码器把螺旋线压到 1 维再还原，看误差随训练下降。' }
  },

  {
    id: 'rnn',
    num: '10',
    emoji: '🔁',
    name: 'RNN 循环神经网络',
    en: 'Recurrent Neural Network',
    cat: 'dl',
    diff: 4,
    accent: '#ff7ac6',
    tagline: '会「记住」前面内容的网络——专门处理有先后顺序的数据。',
    intro: {
      what: '一种处理序列的神经网络，隐藏状态在时间步之间循环传递，使当前输出依赖之前的所有输入。',
      problem: '普通网络假设输入彼此独立；但文本、语音、股价等序列中，「前面」决定了「后面」。如何让网络拥有记忆？',
      idea: '维护一个隐藏状态 h，每读入一个 token，就结合新输入和旧状态更新 h：hₜ = tanh(W·xₜ + U·hₜ₋₁)。'
    },
    principle: {
      text: [
        '共享权重：无论序列多长，都用同一组权重 W、U 处理每个时间步，参数量不随长度增长。',
        '展开视图：把 RNN 在时间上展开，就像一条很深的链，隐藏状态在链上流动。',
        '训练用 BPTT（沿时间反向传播）：梯度沿时间步回传，序列越长越容易梯度消失/爆炸。'
      ],
      formula: {
        html: '<span class="sym">h</span><sub>t</sub> = <span class="fn">tanh</span>(<span class="sym">W</span><span class="sym">x</span><sub>t</sub> + <span class="sym">U</span><span class="sym">h</span><sub>t−1</sub> + <span class="sym">b</span>)',
        note: '当前隐藏状态 hₜ 由「当前输入 xₜ」与「上一步状态 hₜ₋₁」共同决定，这就是它的「记忆」。'
      }
    },
    example: {
      analogy: '读句子时，你一边读新词、一边在心里更新对整句的理解——这个不断更新的「理解」就是 RNN 的隐藏状态。',
      mini: '预测句子下一个词：「我昨天去___」——网络必须记住「昨天」这个时间线索，才更可能填「了超市」而不是「要去」。'
    },
    pros: ['能处理任意长度的序列', '参数共享，模型紧凑', '捕捉序列中的时序依赖', '是 LSTM/GRU/注意力机制的基础'],
    cons: ['梯度消失/爆炸，难学长程依赖', '串行计算，无法并行，训练慢', '长期记忆能力弱', '可解释性差'],
    history: [
      { year: '1982', text: 'Hopfield 提出联想记忆网络，循环结构雏形。' },
      { year: '1986', text: 'Jordan 网络；1990 年 Elman 提出简单循环网络（SRN）。' },
      { year: '1990s', text: '发现梯度消失问题，长序列训练困难。' },
      { year: '1997', text: 'LSTM 问世，解决长程依赖，RNN 家族走向实用。' },
      { year: '2010s', text: 'RNN/LSTM 统治语音识别、机器翻译，直至 Transformer 崛起。' }
    ],
    use: ['序列建模：文本、语音、时间序列', '语言模型、机器翻译、序列标注', '需要「上下文记忆」的任务'],
    avoid: ['序列极长且需并行时（倾向 Transformer）', '输入之间无顺序关系时', '对长程依赖要求高时（优先 LSTM/GRU）'],
    learn: [
      '先画 <strong>展开图</strong>，把 RNN 看成一条时间链，理解 hₜ 如何在链上流动。',
      '手推 <strong>BPTT</strong>，亲自体会「梯度连乘」如何导致消失/爆炸。',
      '用小数据训练一个字符级语言模型，<strong>看它生成文本</strong>，建立直观感受。',
      '带着「梯度消失」的痛点去学 <strong>LSTM/GRU</strong>，理解它们为什么被发明。'
    ],
    demo: { id: 'rnn', title: 'RNN · 序列处理演示', note: '观察字符依次流入循环单元、隐藏状态如何更新，以及「下一个字符」的概率如何随上下文变化。' }
  },

  {
    id: 'lstm',
    num: '11',
    emoji: '🗃️',
    name: 'LSTM 长短期记忆',
    en: 'Long Short-Term Memory',
    cat: 'dl',
    diff: 5,
    accent: '#ff7ac6',
    tagline: '给网络装上「内存条」和三个「闸门」——该记的记、该忘的忘。',
    intro: {
      what: '一种改进的循环网络，通过「细胞状态」这条信息高速公路和三个门控（遗忘/输入/输出），缓解 RNN 的梯度消失，学会长程依赖。',
      problem: 'RNN 处理长序列时梯度连乘趋近 0，远距离的信息传不过来。如何让网络有选择地「记住很久以前」的信息？',
      idea: '细胞状态 c 像一条几乎无损耗的高速公路贯穿时间；三个 sigmoid 门分别决定「忘掉多少旧信息、写入多少新信息、输出多少」。'
    },
    principle: {
      text: [
        '遗忘门：决定丢弃细胞状态里的哪些旧信息（fₜ = σ(…)，输出 0~1）。',
        '输入门：决定把哪些新信息写入细胞状态（iₜ 选择写入，c̃ₜ 是候选内容）。',
        '细胞状态更新：cₜ = fₜ·cₜ₋₁ + iₜ·c̃ₜ ——「遗忘」与「写入」的加权组合。',
        '输出门：决定细胞状态里哪些部分作为本次的隐藏输出 hₜ。'
      ],
      formula: {
        html: '<span class="sym">c</span><sub>t</sub> = <span class="sym">f</span><sub>t</sub> ⊙ <span class="sym">c</span><sub>t−1</sub> + <span class="sym">i</span><sub>t</sub> ⊙ <span class="fn">c̃</span><sub>t</sub>',
        note: '⊙ 表示逐元素相乘。细胞状态 cₜ 由「遗忘门筛过的旧记忆」+「输入门筛过的新内容」组成。'
      }
    },
    example: {
      analogy: '复述一个长故事：普通 RNN 只记得结尾，LSTM 的「细胞状态」像随身笔记本，三个门分别决定「擦掉哪行、写下哪行、念出哪行」，因此能记住开头埋的伏笔。',
      mini: '句子里隔着很远的主语与谓语：「那个昨天在公园里遇到的朋友，今天打电话给我」。LSTM 能记住主语「朋友」跨越多个词，正确理解是谁打电话。'
    },
    pros: ['有效缓解梯度消失，能学长程依赖', '比 RNN 稳定，长期记忆更强', '曾是序列任务（翻译/语音/文本）的多年 SOTA 基石', '思想启发了 GRU 与后续门控机制'],
    cons: ['结构复杂、参数量大（RNN 的 4 倍）', '串行计算慢，无法并行', '对极长序列仍可能遗忘', '可解释性差，调参困难'],
    history: [
      { year: '1997', text: 'Hochreiter 与 Schmidhuber 提出 LSTM，直击 RNN 梯度消失。' },
      { year: '2000s', text: '加入遗忘门后，LSTM 在语音识别、手写识别取得突破。' },
      { year: '2015+', text: 'LSTM 成为机器翻译、语音、文本生成的标配，撑起深度学习黄金期。' },
      { year: '2017+', text: 'Transformer 崛起，逐步在多数序列任务上取代 LSTM，但 LSTM 思想影响深远。' }
    ],
    use: ['长程依赖的序列任务：文本、语音、时间序列', '需要长时间记忆的预测与生成', '资源有限、序列不极长时的序列建模'],
    avoid: ['序列极长且可并行时（优先 Transformer）', '依赖关系较短的简单序列（普通 RNN/GRU 即可）', '需要严格可解释性时'],
    learn: [
      '先彻底搞懂 <strong>RNN 的梯度消失</strong>，明确 LSTM 要解决什么痛点。',
      '逐个理解 <strong>遗忘门、输入门、输出门</strong> 的直觉，再对号入座到公式。',
      '<strong>手推一个时间步</strong> 的门控计算，追踪 c 和 h 的数值变化。',
      '读 Colah 的经典博客《Understanding LSTM》，配合本站门控动画建立画面感。'
    ],
    demo: { id: 'lstm', title: 'LSTM · 3D 门控单元', note: '拖拽旋转；看细胞状态 c 沿信息高速路流动，三个门（遗忘/输入/输出）如何控制写入与读取。' }
  },

  {
    id: 'gru',
    num: '22',
    emoji: '🚪',
    name: 'GRU 门控循环单元',
    en: 'Gated Recurrent Unit',
    cat: 'dl',
    diff: 4,
    accent: '#ff7ac6',
    tagline: 'LSTM 的精简版——两个门就够用了，更快更好训，效果几乎不输。',
    intro: {
      what: '一种门控循环网络，用「更新门 + 重置门」两个门简化 LSTM 的三个门，并把细胞状态与隐藏状态合二为一。',
      problem: 'LSTM 结构复杂、参数多、训练慢；能否用更少的门达到接近的效果？',
      idea: '更新门决定「保留多少旧记忆、写入多少新信息」，重置门决定「忽略多少历史」，一个状态 h 同时承担记忆与输出。'
    },
    principle: {
      text: [
        '更新门 zₜ：越大越保留旧状态、写入越少新信息。',
        '重置门 rₜ：越小越忽略历史（适合捕捉短期依赖）。',
        '候选状态 h̃ₜ 由当前输入与「被重置门过滤的历史」算出，最终 hₜ = (1−zₜ)hₜ₋₁ + zₜh̃ₜ。'
      ],
      formula: {
        html: '<span class="sym">h</span><sub>t</sub> = (<span class="sym">1</span>−<span class="sym">z</span><sub>t</sub>)⊙<span class="sym">h</span><sub>t−1</sub> + <span class="sym">z</span><sub>t</sub>⊙<span class="fn">h̃</span><sub>t</sub>',
        note: '更新门 zₜ 在「旧记忆」与「新信息」之间做加权。zₜ 越大越偏重新信息。'
      }
    },
    example: {
      analogy: 'LSTM 像三扇门（进、出、开关记忆）；GRU 用一扇「推拉门」同时管进出，结构更简单但效果接近。',
      mini: '读「猫在追老鼠，它很灵活」：GRU 的更新门决定「它」的指代信息是否要一直保留到句尾。'
    },
    pros: ['参数比 LSTM 少约 1/4，训练更快', '效果接近 LSTM，小数据上常更优', '结构更简单、不易过拟合'],
    cons: ['表达力理论上略弱于 LSTM', '仍串行计算，无法并行', '对极长程依赖不如注意力机制', '可解释性差'],
    history: [
      { year: '2014', text: 'Cho 等在机器翻译论文中提出 GRU。' },
      { year: '2014+', text: 'GRU 与 LSTM 成为序列建模的两大标准门控单元。' },
      { year: '2017+', text: 'Transformer 崛起，GRU/LSTM 在部分任务被取代，但在轻量场景仍常用。' }
    ],
    use: ['中小规模序列任务：文本、语音、时序', '需要比 LSTM 更轻量高效时', '资源受限的设备端模型'],
    avoid: ['极长序列且可并行时（用 Transformer）', '需要最强长程记忆时（LSTM/注意力）', '依赖关系很短的简单序列'],
    learn: [
      '先吃透 <strong>LSTM 的三个门</strong>，再看 GRU 如何「三合一」成两个门。',
      '搞清 <strong>更新门 z 与重置门 r</strong> 各自的职责。',
      '对比 <strong>GRU vs LSTM</strong> 的参数数量与效果，理解「够用就好」。',
      '手推一个时间步，追踪 h 的更新。'
    ],
    demo: { id: 'gru', title: 'GRU · 3D 双门单元', note: '拖拽旋转；更新门 z 与重置门 r 控制隐藏状态 h 的写入与遗忘。' }
  },

  {
    id: 'transformer',
    num: '23',
    emoji: '🎯',
    name: 'Transformer 与注意力',
    en: 'Transformer & Attention',
    cat: 'dl',
    diff: 5,
    accent: '#ff7ac6',
    tagline: '「注意力」让每个词都能直接看到其他词——并行、强大，撑起 GPT 与大模型时代。',
    intro: {
      what: '完全基于自注意力与前馈网络的架构，抛弃循环结构，让序列中任意两个位置直接交互，可高度并行。',
      problem: 'RNN/LSTM 串行计算慢、长程依赖弱；如何既并行又能全局建模任意距离的依赖？',
      idea: '每个 token 对全序列计算注意力权重（Query·Key 的相似度），再按权重加权聚合 Value，捕捉任意距离的关系。'
    },
    principle: {
      text: [
        '自注意力：对每个 token，用 Q、K、V 三个投影；注意力 = softmax(QKᵀ/√d)·V。',
        '多头注意力：并行多组 QKV，分别关注不同方面（语法、指代、语义）。',
        '位置编码：为弥补「无顺序」，给每个位置注入位置信息。'
      ],
      formula: {
        html: '<span class="fn">Attention</span>(<span class="sym">Q</span>,<span class="sym">K</span>,<span class="sym">V</span>) = <span class="fn">softmax</span><span class="op">(</span><span class="frac"><span class="num">QK<sup>T</sup></span><span class="den">√d</span></span><span class="op">)</span><span class="sym">V</span>',
        note: '先算 Q 与 K 的相似度（除以 √d 防梯度消失），softmax 归一化成注意力权重，再加权聚合 V。'
      }
    },
    example: {
      analogy: '翻译「bank」时，注意力会自动聚焦到句中的「river（河）」或「money（钱）」来决定它该翻成「河岸」还是「银行」。',
      mini: '「The animal didn\'t cross the street because it was too tired」——注意力让「it」正确指回「animal」而非「street」。'
    },
    pros: ['并行计算，训练快、可扩展', '长程依赖建模强', '通用：NLP、CV、语音全面开花', '撑起 GPT/BERT 等大模型'],
    cons: ['注意力计算/显存 O(n²)，长序列昂贵', '需要海量数据，小数据易过拟合', '缺乏归纳偏置（需更多数据补偿）', '可解释性仍有限'],
    history: [
      { year: '2017', text: 'Vaswani 等发表《Attention Is All You Need》，提出 Transformer。' },
      { year: '2018', text: 'BERT 与 GPT 问世，预训练+微调范式席卷 NLP。' },
      { year: '2020+', text: 'GPT-3、Vision Transformer 等，Transformer 成为多模态通用架构。' },
      { year: '2022', text: 'ChatGPT 发布，基于 Transformer 的大语言模型改变世界。' }
    ],
    use: ['自然语言处理、大语言模型', '长序列建模、机器翻译', '图像（ViT）、语音、多模态'],
    avoid: ['小数据集（缺乏归纳偏置，易过拟合）', '极长序列且算力受限时', '对可解释性要求高的场景'],
    learn: [
      '先在演示里看 <strong>注意力权重热力图</strong>，建立「每个词看向哪里」的直觉。',
      '搞懂 <strong>Q、K、V 分别是什么</strong>：查询、键、值，来自检索的类比。',
      '理解 <strong>softmax(QKᵀ/√d)</strong> 每一步的意义。',
      '读《Attention Is All You Need》原文 + 图解 Transformer，再看 BERT/GPT 的差异。'
    ],
    demo: { id: 'transformer', title: 'Transformer · 注意力热力图', note: '一句话逐词计算自注意力，看每个词「最关注」句子里的哪些词。' }
  },

  {
    id: 'seq',
    num: '12',
    emoji: '⏳',
    name: '序列预测 / 时间序列',
    en: 'Sequence & Time-Series Forecasting',
    cat: 'dl',
    diff: 4,
    accent: '#ff5c7a',
    tagline: '用过去预测未来——从股票、天气到销量、流量，无处不在的应用主题。',
    intro: {
      what: '一个应用主题而非单一模型：已知过去若干时刻的观测，预测未来值。核心技巧是把序列问题「重构」成监督学习问题。',
      problem: '时间序列是连续、有顺序的，直接套普通模型会丢失时间结构。如何用「历史」预测「未来」，并科学地评估预测好坏？',
      idea: '用滑动窗口把「前 N 个值」当作特征、「下一个值」当作标签，把序列切成监督样本，再喂给线性模型、树模型或 LSTM。'
    },
    principle: {
      text: [
        '滑动窗口（滞后特征）：用 [xₜ₋ₙ, …, xₜ₋₁] 预测 xₜ，窗口大小 n 是超参数。',
        '特征工程：加入趋势、季节、节假日、差分、滚动统计等，常比换模型更有效。',
        '评估要「按时间」切分：不能用随机打乱的交叉验证，否则会泄露未来信息。',
        '基线先行：朴素预测、移动平均、指数平滑、ARIMA 是必须对比的基线。'
      ],
      formula: {
        html: '<span class="sym">x</span><sub>t</sub> = <span class="sym">f</span>(<span class="sym">x</span><sub>t−1</sub>, <span class="sym">x</span><sub>t−2</sub>, …, <span class="sym">x</span><sub>t−n</sub>)',
        note: '把序列预测建模为回归：用过去 n 个值预测下一个值。多步预测可递归或直接输出向量。'
      }
    },
    example: {
      analogy: '预报天气：你根据「昨天、前天、上周」的气温走势来猜明天的气温——滑动窗口就是选「看多少天」，模型就是「怎么从这些天推出明天」。',
      mini: '预测销量：取过去 7 天的销量作为特征，预测第 8 天。加入「是否周末」「是否促销」等特征，精度往往大幅提升。'
    },
    pros: ['应用面极广，价值直接（库存/调度/风控）', '可复用所有回归模型（线性/树/LSTM）', '特征工程收益高，业务可解释'],
    cons: ['未来与过去分布漂移时预测失准', '多步预测误差会累积', '易过拟合历史噪声', '评估不当会高估效果（时间泄露）'],
    history: [
      { year: '1970', text: 'Box 与 Jenkins 提出 ARIMA，经典统计时间序列方法的代表。' },
      { year: '1980s+', text: '指数平滑、GARCH 等扩展，广泛用于经济与金融预测。' },
      { year: '2015+', text: 'LSTM 等深度学习模型在序列预测中展现强大能力。' },
      { year: '2017+', text: 'Transformer 与各类时序大模型（Informer、PatchTST 等）兴起。' }
    ],
    use: ['销量/流量/库存预测、能源负荷预测', '金融时间序列、异常检测', '自然语言生成（序列预测的另一种形式）'],
    avoid: ['数据极短且无周期性时', '未来受外部事件强干扰且不可建模时', '只追求「看起来像」而不做严格时间切分评估时'],
    learn: [
      '先跑 <strong>朴素基线 + 移动平均</strong>，理解「预测并不总需要复杂模型」。',
      '掌握 <strong>滑动窗口重构</strong>：亲手把一条序列切成 (X, y) 监督样本。',
      '学会 <strong>时间序列交叉验证</strong>（Walk-forward），杜绝时间泄露。',
      '再上 <strong>LSTM/Transformer</strong>，并与 ARIMA、梯度提升树对比，理解各自适用边界。'
    ],
    demo: { id: 'seq', title: '序列预测 · 窗口演示', note: '拖动窗口位置，观察「过去 n 个值 → 下一个值」如何构成监督样本，以及滑动窗口预测的走势。' }
  },

  {
    id: 'gan',
    num: '25',
    emoji: '🎭',
    name: '生成对抗网络',
    en: 'Generative Adversarial Network',
    cat: 'gen',
    diff: 5,
    accent: '#c084fc',
    tagline: '造假者 vs 鉴别者——两个网络互相对抗，逼生成器画出以假乱真的作品。',
    intro: {
      what: '由生成器 G 与判别器 D 组成的博弈框架：G 造假样本，D 辨真假，二者交替训练，最终 G 能生成逼真数据。',
      problem: '如何让机器「创造」全新的逼真数据（图像、语音），而不只是分类或回归？',
      idea: '生成器努力骗过判别器，判别器努力识破；两者互相逼迫升级，直到生成样本真假难辨。'
    },
    principle: {
      text: [
        '生成器 G(z)：从随机噪声 z 映射出假样本，目标是让 D 误判为真。',
        '判别器 D(x)：判断样本是真实数据还是 G 生成的，目标是尽量辨对。',
        '交替训练形成 min-max 博弈，理论上收敛到纳什均衡。'
      ],
      formula: {
        html: '<span class="fn">min</span><sub>G</sub> <span class="fn">max</span><sub>D</sub> <span class="sym">E</span>[<span class="fn">log</span> <span class="sym">D</span>(<span class="sym">x</span>)] + <span class="sym">E</span>[<span class="fn">log</span>(<span class="sym">1</span>−<span class="sym">D</span>(<span class="sym">G</span>(<span class="sym">z</span>)))]',
        note: 'D 想最大化这个目标（辨真伪），G 想最小化它（骗过 D），二者对抗。'
      }
    },
    example: {
      analogy: '伪钞贩子（G）造假币，警察（D）辨真伪；贩子越造越真，警察越查越严，最后假币几乎以假乱真。',
      mini: '训练后，StyleGAN 能生成不存在的人脸照片，肉眼几乎无法分辨真假。'
    },
    pros: ['生成质量极高（图像/音频/文本）', '无需标注，无监督学习', '为大量创作型应用提供可能'],
    cons: ['训练极不稳定，易模式坍缩', '难以评估生成质量', '收敛难判断，调参困难'],
    history: [
      { year: '2014', text: 'Goodfellow 提出 GAN，开启生成模型新纪元。' },
      { year: '2017', text: 'CycleGAN、pix2pix 实现图像风格迁移与转换。' },
      { year: '2018', text: 'StyleGAN 生成高分辨率逼真人脸。' },
      { year: '2020+', text: '扩散模型崛起，与 GAN 竞争生成质量与稳定性。' }
    ],
    use: ['图像/音频/文本生成', '图像风格迁移、超分辨率', '数据增强、缺失数据补全'],
    avoid: ['训练不稳定时（可换 VAE/扩散模型）', '对生成质量要求极高且需稳定训练时', '数据量不足时'],
    learn: [
      '先理解 <strong>min-max 博弈</strong> 这个核心，别急着看网络结构。',
      '了解 <strong>模式坍缩</strong>：G 只会生成少数几种样本，是 GAN 的头号难题。',
      '动手跑一个 <strong>生成手写数字的 DCGAN</strong>，观察生成图像从噪声到清晰。',
      '对比 <strong>GAN vs VAE vs 扩散模型</strong> 的生成质量与稳定性。'
    ],
    demo: { id: 'gan', title: 'GAN · 3D 分布对抗', note: '拖拽旋转；绿色=真实分布、粉色=生成分布、黄色平面=判别器边界，看粉色云如何迁移过去。' }
  },

  {
    id: 'rl',
    num: '26',
    emoji: '🎮',
    name: '强化学习',
    en: 'Reinforcement Learning',
    cat: 'rl',
    diff: 5,
    accent: '#ffd166',
    tagline: '让智能体「试错」——做对了给糖、做错了挨打，自己学会最优策略。',
    intro: {
      what: '智能体通过与环境交互获得奖励，学习「在什么状态该采取什么动作」以最大化长期累积奖励。',
      problem: '没有现成的正确答案标注，只有「做得好不好」的反馈，如何学习序贯决策（下棋、游戏、机器人控制）？',
      idea: '状态 → 动作 → 奖励 → 新状态，不断试错，学出最优的动作选择策略。'
    },
    principle: {
      text: [
        '核心要素：状态 s、动作 a、奖励 r、策略 π(a|s)、价值函数 Q(s,a)。',
        'Q-learning：用贝尔曼方程迭代更新 Q(s,a) = r + γ·max Q(s′,a′)，逐步逼近最优价值。',
        '探索与利用的平衡：既要尝试新动作（探索），又要选当前最优（利用），常用 ε-greedy。'
      ],
      formula: {
        html: '<span class="sym">Q</span>(<span class="sym">s</span>,<span class="sym">a</span>) ← <span class="sym">Q</span>(<span class="sym">s</span>,<span class="sym">a</span>) + <span class="sym">α</span>[<span class="sym">r</span> + <span class="sym">γ</span> <span class="fn">max</span><sub>a′</sub> <span class="sym">Q</span>(<span class="sym">s′</span>,<span class="sym">a′</span>) − <span class="sym">Q</span>(<span class="sym">s</span>,<span class="sym">a</span>)]',
        note: 'Q 学习更新：当前值向「即时奖励 + 折扣后的未来最优值」靠拢。'
      }
    },
    example: {
      analogy: '教狗握手：做对了给零食（正奖励）、做错了不给（负反馈），反复强化，狗就学会了。',
      mini: 'AlphaGo 通过自我对弈 + 强化学习，学会了下围棋，最终击败人类世界冠军。'
    },
    pros: ['能解决序贯决策问题', '无需标注数据，靠奖励信号学习', '可超越人类水平（游戏、棋类）', '通用框架，可扩展'],
    cons: ['样本效率极低，需要海量交互', '奖励函数设计困难', '训练不稳定、易发散', '探索-利用难以平衡'],
    history: [
      { year: '1950s', text: 'Bellman 提出动态规划与最优控制，奠定理论。' },
      { year: '1989', text: 'Watkins 提出 Q-learning。' },
      { year: '2013', text: 'DeepMind 用 DQN（深度 Q 网络）玩 Atari 游戏超越人类。' },
      { year: '2016', text: 'AlphaGo 击败李世石，强化学习走向大众视野。' }
    ],
    use: ['游戏 AI、棋类博弈', '机器人控制、自动驾驶决策', '推荐系统、资源调度', '大模型对齐（RLHF）'],
    avoid: ['数据标注充足且任务非序贯时（监督学习更好）', '无法定义清晰奖励的任务', '交互成本极高的现实场景'],
    learn: [
      '先玩懂演示里的 <strong>Q-learning 走迷宫</strong>，理解「试错-更新 Q 表」。',
      '搞清 <strong>状态、动作、奖励、折扣因子 γ</strong> 四个概念。',
      '理解 <strong>探索 vs 利用</strong> 的 ε-greedy 策略。',
      '进阶看 <strong>DQN → 策略梯度 → PPO</strong> 的演进脉络。'
    ],
    demo: { id: 'rl', title: '强化学习 · 3D 价值地形', note: '拖拽旋转；每根柱子=一个状态的价值（max Q），点「训练」看它从平地长成通向终点的地形。' }
  },

  {
    id: 'transfer',
    num: '27',
    emoji: '🚀',
    name: '迁移学习',
    en: 'Transfer Learning',
    cat: 'dl',
    diff: 4,
    accent: '#ff7ac6',
    tagline: '站在巨人肩膀上——拿在千万张图上练好的模型，微调一下就解决你的小数据问题。',
    intro: {
      what: '把在源任务上学到的知识迁移到目标任务，最常见的做法是「预训练 + 微调」：加载大模型权重，在少量数据上继续训练。',
      problem: '深度学习需要海量数据与算力，而多数实际场景数据有限，从零训练效果差。',
      idea: '底层特征（边缘、纹理、语法）是通用的，冻结底层、只微调高层，用极少数据就能适配新任务。'
    },
    principle: {
      text: [
        '预训练：在大型数据集（ImageNet、海量文本）上先训练一个通用模型。',
        '微调：加载预训练权重，换掉输出层，用目标小数据集继续训练（可冻结部分层）。',
        '适用前提：源任务与目标任务「相关」，底层特征可共享。'
      ],
      formula: {
        html: '<span class="sym">θ</span><sub>task</sub> = <span class="sym">θ</span><sub>pretrain</sub> − <span class="sym">η</span> <span class="fn">∇</span><span class="sym">L</span><sub>task</sub>',
        note: '从预训练权重 θ_pretrain 出发，用目标任务损失继续梯度下降，而不是随机初始化。'
      }
    },
    example: {
      analogy: '会开汽车的人学开卡车：底层的「方向盘、油门、刹车」经验通用，只需适应差异，不用从零学开车。',
      mini: '想区分「猫 vs 狗」但只有 500 张图：加载 ImageNet 预训练的 ResNet，微调后精度远超从零训练。'
    },
    pros: ['小数据也能训出好模型', '省时省力省算力', '收敛更快、泛化更好', '已成为深度学习标准范式'],
    cons: ['源任务与目标任务差异大时可能失效', '可能发生负迁移（反而更差）', '预训练模型体积大、有部署成本', '对「为何有效」缺乏完整理论'],
    history: [
      { year: '1995', text: '迁移学习概念在 NIPS 研讨会上正式提出。' },
      { year: '2014', text: 'ImageNet 预训练 + 微调成为 CV 任务的标准做法。' },
      { year: '2018', text: 'BERT/GPT 确立 NLP 的「预训练 + 微调」范式。' },
      { year: '至今', text: '预训练大模型 + 提示/微调，成为 AI 应用的通用基座。' }
    ],
    use: ['数据量小的图像/文本任务', '快速原型验证', '复用大模型能力到垂直领域'],
    avoid: ['源域与目标域差异巨大时（如自然图像→医学影像需谨慎）', '对延迟/体积要求极严的端侧场景', '目标任务数据充足时（从零训练可能更优）'],
    learn: [
      '先理解 <strong>「预训练 → 微调」</strong> 的两步流程。',
      '搞清 <strong>冻结层 vs 微调层</strong> 的取舍：数据越少越要多冻结。',
      '动手用 <strong>torchvision 的预训练模型</strong> 微调一个分类器。',
      '了解 <strong>BERT/GPT 的预训练任务</strong>（掩码语言模型/自回归）。'
    ],
    demo: { id: 'transfer', title: '迁移学习 · 微调对比演示', note: '示意：预训练+微调 vs 从零训练，看前者如何用更少轮次达到更好效果。' }
  },

  {
    id: 'recsys',
    num: '28',
    emoji: '🛍️',
    name: '推荐系统',
    en: 'Recommender Systems',
    cat: 'app',
    diff: 3,
    accent: '#2dd4bf',
    tagline: '「猜你喜欢」——从协同过滤到深度学习，让你刷到的都是想看的内容。',
    intro: {
      what: '预测用户对物品的偏好并排序。经典方法有协同过滤、矩阵分解，现代方法融合深度学习与召回-排序两阶段。',
      problem: '信息过载：如何在海量物品中，为每个用户挑出最可能喜欢的少数几个？',
      idea: '物以类聚（买了 A 的人也买 B）、人以群分（口味相似的人喜欢相似的东西），或用隐向量建模用户与物品的偏好。'
    },
    principle: {
      text: [
        '协同过滤：基于用户-物品交互（评分/点击）找相似用户或相似物品。',
        '矩阵分解：把用户-物品评分矩阵 R 分解成 R ≈ U·Vᵀ，得到用户隐向量与物品隐向量。',
        '现代系统常分「召回（粗筛）→ 排序（精排）→ 重排」多阶段。'
      ],
      formula: {
        html: '<span class="sym">R</span> ≈ <span class="sym">U</span> · <span class="sym">V</span><sup>T</sup> <span class="op">,</span>　 <span class="sym">r̂</span><sub>ui</sub> = <span class="sym">u</span><sub>u</sub> · <span class="sym">v</span><sub>i</sub>',
        note: '用户 u 对物品 i 的预测评分 = 用户隐向量与物品隐向量的内积。'
      }
    },
    example: {
      analogy: '「买了这本书的人还买了那本」是基于物品的协同过滤；「和你口味相似的朋友推荐」是基于用户的协同过滤。',
      mini: 'Netflix 用矩阵分解学习用户与电影的隐向量，预测「你可能打几分」，据此推荐。'
    },
    pros: ['个性化强，直接驱动增长', '协同过滤无需内容特征', '可扩展到海量用户与物品'],
    cons: ['冷启动（新用户/新物品没数据）', '评分矩阵稀疏', '信息茧房与多样性不足', '偏置（热门物品霸榜）'],
    history: [
      { year: '1994', text: 'GroupLens 系统提出协同过滤，用于新闻推荐。' },
      { year: '2006', text: 'Netflix 百万美元大奖推动矩阵分解成为主流。' },
      { year: '2016', text: 'YouTube 发表深度学习推荐系统，深度模型大规模落地。' },
      { year: '至今', text: '推荐系统成为电商、内容、广告的核心增长引擎。' }
    ],
    use: ['电商、视频、音乐、资讯推荐', '广告投放与个性化营销', '搜索排序'],
    avoid: ['冷启动严重且无内容特征时', '强实时性且数据稀疏时', '需要保证内容多样性/公平性的场景'],
    learn: [
      '先搞懂 <strong>协同过滤</strong> 的两大流派：基于用户 vs 基于物品。',
      '在演示里看 <strong>矩阵分解</strong> 如何用隐向量「补全」缺失评分。',
      '理解 <strong>冷启动与稀疏性</strong> 两大难题。',
      '了解现代架构：<strong>召回-排序两阶段 + 深度学习特征</strong>。'
    ],
    demo: { id: 'recsys', title: '推荐系统 · 协同过滤演示', note: '一个小型用户-物品评分矩阵，看基于物品的协同过滤如何预测缺失评分。' }
  },

  {
    id: 'anomaly',
    num: '29',
    emoji: '🚨',
    name: '异常检测',
    en: 'Anomaly Detection',
    cat: 'app',
    diff: 3,
    accent: '#2dd4bf',
    tagline: '在一堆正常里揪出「不对劲」的那个——欺诈、故障、入侵都靠它。',
    intro: {
      what: '识别与大多数样本显著不同的罕见样本。方法包括统计（高斯）、孤立森林、One-Class SVM、自编码器重建误差等。',
      problem: '异常样本极少且往往无标签，如何只用「正常数据」（或极度不平衡数据）发现异常？',
      idea: '正常数据是主流且有规律，异常是「离群」的——用密度、距离或重建误差来度量「有多不对劲」。'
    },
    principle: {
      text: [
        '统计法：假设正常数据服从某分布（如高斯），概率极低的点判为异常。',
        '孤立森林：异常点「更容易被随机切分孤立出来」，路径越短越异常。',
        '重建法：自编码器在正常数据上训练，重建误差大的样本是异常。'
      ],
      formula: {
        html: '<span class="sym">p</span>(<span class="sym">x</span>) < <span class="sym">ε</span> ⇒ <span class="fn">异常</span>',
        note: '若样本在正常分布下的概率密度低于阈值 ε，则判为异常。'
      }
    },
    example: {
      analogy: '信用卡突然在异国大额消费、工厂机器温度突然飙升、账号凌晨异地登录——都是「和平时不一样」的信号。',
      mini: '用自编码器学「正常交易」的模式，一旦某笔交易重建误差特别大，就可能是欺诈。'
    },
    pros: ['无需异常标签（无监督）', '业务价值高（欺诈/故障/入侵）', '方法多样、可组合'],
    cons: ['「异常」定义模糊，边界难定', '正常分布漂移会导致大量误报', '评估困难（异常极少、无真值）', '对噪声敏感'],
    history: [
      { year: '2003', text: 'One-Class SVM 提出，用于单类异常检测。' },
      { year: '2008', text: '孤立森林（Isolation Forest）提出，高效且无需分布假设。' },
      { year: '2018+', text: '深度自编码器、GAN 等重建法在异常检测中广泛应用。' },
      { year: '至今', text: '异常检测成为风控、运维监控、工业质检的核心组件。' }
    ],
    use: ['金融欺诈、反洗钱', '工业设备故障预测、IT 运维监控', '网络入侵检测、质检'],
    avoid: ['正常与异常界限本身很模糊时', '无法获得足够正常样本建模时', '对误报成本极敏感且难调阈值时'],
    learn: [
      '先理解 <strong>「用正常数据建模，偏离即异常」</strong> 的基本思路。',
      '在演示里看 <strong>高斯法</strong> 如何用密度阈值圈出正常区、标出异常点。',
      '对比 <strong>统计法 vs 孤立森林 vs 重建法</strong> 的适用场景。',
      '了解异常检测的 <strong>评估指标</strong>（精确率/召回/AUC 的权衡）。'
    ],
    demo: { id: 'anomaly', title: '异常检测 · 3D 密度阈值', note: '拖拽旋转；用 3D 高斯拟合正常数据，拖 ε 看哪些点被判为异常，绿网是高密度等值面。' }
  },

  {
    id: 'feature',
    num: '30',
    emoji: '🛠️',
    name: '特征工程',
    en: 'Feature Engineering',
    cat: 'method',
    diff: 3,
    accent: '#f59e0b',
    tagline: '「数据决定上限，模型逼近上限」——把原始数据加工成模型爱吃的形状，往往比换模型更管用。',
    intro: {
      what: '从原始数据构造、选择、变换特征的过程，目标是让模型更容易学到规律。',
      problem: '原始数据噪声大、尺度乱、含冗余与缺失，直接喂模型效果差；如何把「脏数据」变成「好特征」？',
      idea: '归一化、缺失处理、类别编码、分箱、组合特征、时间/文本特征、降维等，让信息以模型能利用的形式呈现。'
    },
    principle: {
      text: [
        '数值特征：标准化/归一化、对数变换（处理长尾）、分箱。',
        '类别特征：独热编码、标签编码、目标编码。',
        '时间特征：提取年/月/日/星期/节假日、距某事件的时长。',
        '组合特征：交叉特征、聚合特征、与业务强相关的衍生特征。'
      ],
      formula: {
        html: '<span class="sym">x′</span> = <span class="frac"><span class="num">x − μ</span><span class="den">σ</span></span>',
        note: '标准化（z-score）：减去均值除以标准差，让特征零均值、单位方差。'
      }
    },
    example: {
      analogy: '把「出生日期」变成「年龄」，把「IP 地址」变成「是否VPN/是否异地」，把「消费额」做对数变换——信息没变，但模型一下子会用了。',
      mini: '预测房价时，直接给「面积」不如再给「面积²」和「面积×卧室数」，帮模型捕捉非线性与交互。'
    },
    pros: ['收益大，常超过换模型', '可解释、贴合业务', '对表格数据仍是决定性因素'],
    cons: ['耗时、依赖领域知识', '易引入数据泄露（用未来信息）', '特征过多会过拟合', '部分被深度学习自动特征替代'],
    history: [
      { year: '2010s 前', text: '特征工程是传统 ML 的核心工作，决定了模型上限。' },
      { year: '2012+', text: '深度学习兴起，图像/文本的「自动特征」逐渐取代手工特征。' },
      { year: '至今', text: '结构化/表格数据中，特征工程依然是胜负手。' }
    ],
    use: ['结构化/表格数据建模', '领域知识丰富的业务问题', '竞赛与工业建模'],
    avoid: ['图像/语音等原始信号（深度学习自动学）', '盲目堆特征而不做选择', '引入未来信息导致数据泄露'],
    learn: [
      '先掌握 <strong>标准化、独热编码、缺失处理</strong> 三件套。',
      '理解 <strong>数据泄露</strong> 的严重性，学会时间切分。',
      '动手做一次 <strong>EDA（探索性数据分析）</strong>，先看懂数据再造特征。',
      '在演示里看 <strong>对数变换</strong> 如何把长尾分布拉近正态。'
    ],
    demo: { id: 'feature', title: '特征工程 · 变换演示', note: '切换原始/对数/标准化，看同一批数据经过变换后分布如何变得更好用。' }
  },

  {
    id: 'evaluation',
    num: '31',
    emoji: '🎛️',
    name: '模型评估与调参',
    en: 'Evaluation & Hyperparameter Tuning',
    cat: 'method',
    diff: 3,
    accent: '#f59e0b',
    tagline: '模型好不好不能靠感觉——用正确的指标与交叉验证，把「玄学调参」变成科学。',
    intro: {
      what: '用合适的指标（准确率/精确率/召回/F1/AUC）与交叉验证客观评估模型，并用网格/随机/贝叶斯搜索调超参数。',
      problem: '单一准确率在类别不平衡时会骗人；随机划分可能泄露；调参靠运气效率低。',
      idea: '按业务选对指标、按时间/分层切分数据、用交叉验证估计泛化、用搜索算法高效调参。'
    },
    principle: {
      text: [
        '混淆矩阵：TP/FP/FN/TN；精确率=TP/(TP+FP)，召回=TP/(TP+FN)，F1 是二者调和平均。',
        'ROC-AUC：刻画「排序能力」，对阈值不敏感，适合类别不平衡。',
        '交叉验证：K 折切分轮流验证，减少单次划分的偶然性。'
      ],
      formula: {
        html: '<span class="fn">Precision</span> = <span class="frac"><span class="num">TP</span><span class="den">TP+FP</span></span> <span class="op">,</span>　 <span class="fn">Recall</span> = <span class="frac"><span class="num">TP</span><span class="den">TP+FN</span></span>',
        note: '精确率衡量「预测为正的里面有多少真为正」，召回衡量「真正的正样本找回了多少」。'
      }
    },
    example: {
      analogy: '癌症筛查宁可「错杀」不可放过 → 重召回；垃圾邮件过滤别误删正常信 → 重精确率。阈值一调，两者此消彼长。',
      mini: '在 1000 笔交易里只有 10 笔欺诈：全预测「正常」准确率就有 99%，但毫无意义——这时必须看召回与 AUC。'
    },
    pros: ['客观、可比、可复现', '指导业务权衡（阈值选择）', '交叉验证减少偶然性'],
    cons: ['计算成本高（多次训练）', '指标选择需业务判断', '离线指标好≠线上效果好', '调参仍可能过拟合验证集'],
    history: [
      { year: '1970s', text: '交叉验证（K 折）被引入统计与机器学习。' },
      { year: '1982', text: 'ROC 曲线用于评估诊断测试。' },
      { year: '2010s', text: '贝叶斯优化、AutoML 让调参自动化。' },
      { year: '至今', text: '评估与调参是每个 ML 项目的标准流程。' }
    ],
    use: ['任何模型的选型、评估、上线前验证', '类别不平衡场景的指标选择', '超参数优化'],
    avoid: ['只用单一准确率评估不平衡数据', '随机切分时间序列（泄露未来）', '用测试集反复调参（应留出独立测试集）'],
    learn: [
      '先背熟 <strong>精确率、召回、F1、AUC</strong> 的定义与适用场景。',
      '在演示里 <strong>拖动阈值</strong>，看精确率-召回如何此消彼长、ROC 如何变化。',
      '掌握 <strong>K 折交叉验证</strong> 与「训练/验证/测试」三集划分。',
      '了解 <strong>网格搜索 vs 随机搜索 vs 贝叶斯优化</strong> 的效率差异。'
    ],
    demo: { id: 'evaluation', title: '评估 · ROC 与阈值演示', note: '拖动分类阈值，看混淆矩阵、精确率/召回与 ROC 曲线如何联动变化。' }
  },

  {
    id: 'resnet',
    num: '32',
    emoji: '🛣️',
    name: 'ResNet 残差网络',
    en: 'Residual Network (ResNet)',
    cat: 'cv',
    diff: 4,
    accent: '#38bdf8',
    tagline: '深度学习的分水岭——用「跳连」把网络堆到 152 层还不退化，让计算机视觉真正起飞。',
    intro: {
      what: '一种用「残差连接（skip connection）」解决深层网络退化问题的卷积网络。核心单元是 y = F(x) + x：让层学习「残差」而非直接映射。',
      problem: '直觉上网络越深越好，但实验发现：超过一定深度后，网络反而更差（退化问题）。原因不是过拟合，而是深层梯度难回传、优化变难。',
      idea: '与其让每层从头学 y=H(x)，不如学「残差」F(x)=H(x)−x，再让 y=F(x)+x。当最优接近恒等映射时，层只需把 F(x) 逼近 0，跳连直接把 x 传过去。'
    },
    principle: {
      text: [
        '残差块：输入 x 走两条路——一条经 卷积→BN→ReLU→卷积→BN 得到 F(x)，另一条直接跳连；两者相加后再过 ReLU。',
        '为什么有效：跳连让梯度多了一条「高速路」∂(F+x)/∂x = ∂F/∂x + 1，即使 F 的梯度很小，那个「1」也能把梯度原样传回浅层，缓解梯度消失。',
        '恒等映射直觉：若某层是多余的，它只需学到 F(x)≈0，网络自动退化为浅层，不会变差。'
      ],
      formula: {
        html: '<span class="sym">y</span> = <span class="fn">F</span>(<span class="sym">x</span>) + <span class="sym">x</span>',
        note: '残差连接的核心：输出 = 残差分支 F(x) 加上恒等映射 x。'
      }
    },
    example: {
      analogy: '抄笔记时，直接把「原文」抄一份再补「批注」，比凭空默写全文更不易漏——跳连就是那条始终保留原文的捷径。',
      mini: '一个 3×3 卷积层学恒等映射很难（要学出单位核），但残差块只需让 F(x)→0，加法自动保留 x，优化难度大幅下降。'
    },
    pros: ['极大缓解深层网络的梯度消失/退化，可训练上百层', '残差结构通用，被后续几乎所有架构沿用', '收敛更快、精度更高，成为 CV 主干网络标配'],
    cons: ['参数量与计算量仍随深度增长', '对「为什么有效」仍有争议（集成假说等）', '跳连并非万能，极端深度仍需其他技巧'],
    history: [
      { year: '2015', text: '何恺明等提出 ResNet，以 152 层在 ImageNet 夺冠，误差首次低于人类水平。' },
      { year: '2016', text: 'ResNeXt、Wide ResNet 等变体探索「宽度 vs 深度」。' },
      { year: '2017', text: 'DenseNet 将跳连推到极致（每层连到所有前层）。' },
      { year: '至今', text: '残差思想成为 Transformer、扩散模型等几乎所有深度模型的标配组件。' }
    ],
    use: ['图像分类、目标检测、分割的主干网络（backbone）', '任何需要「更深网络」的视觉任务', '作为迁移学习的预训练模型（ImageNet 权重）'],
    avoid: ['极轻量/移动端场景可用 MobileNet 等替代', '浅层小模型上用残差收益有限', '把跳连当万能药——仍需配合 BN、合理初始化'],
    learn: [
      '先理解 <strong>退化问题</strong>：为什么「更深」反而更差，而非过拟合。',
      '在演示里切换 <strong>普通块 vs 残差块</strong>，看信号/梯度如何在跳连中保持。',
      '手推残差块的 <strong>梯度回传</strong>：∂(F+x)/∂x 里那个「+1」是关键。',
      '了解 <strong>ResNet-18/34/50/101/152</strong> 的结构差异与瓶颈块（bottleneck）。'
    ],
    demo: { id: 'resnet', title: 'ResNet · 残差连接演示', note: '切换「普通网络 / 残差网络」，看信号穿过深层时残差跳连如何保住它不退化为零。' }
  },

  {
    id: 'yolo',
    num: '33',
    emoji: '🎯',
    name: '目标检测 · YOLO',
    en: 'Object Detection (YOLO)',
    cat: 'cv',
    diff: 4,
    accent: '#38bdf8',
    tagline: '「只看一眼」——把检测变成一次回归，同时输出框和类别，快到能实时跑视频。',
    intro: {
      what: 'You Only Look Once：一张图只过一遍网络，直接回归出所有目标的边界框和类别，是单阶段（one-stage）检测的代表。',
      problem: '传统两阶段方法（如 R-CNN）先生成候选框再逐个分类，慢；滑动窗口/金字塔更是计算爆炸。',
      idea: '把图像分成 S×S 网格，每个格子负责预测「中心落在本格」的目标：输出边界框 (x,y,w,h)、置信度和类别概率，一次前向全搞定。'
    },
    principle: {
      text: [
        '网格划分：每个格子预测 B 个候选框，每个框含 (中心坐标, 宽高, 置信度) + C 个类别概率。',
        '置信度 = 框内含物体的概率 × 框与真值的 IoU，用于过滤低质量框。',
        'NMS（非极大值抑制）：同一目标可能被多个框重复预测，保留置信度最高者，压掉与其 IoU 过大的重复框。'
      ],
      formula: {
        html: '<span class="fn">Confidence</span> = <span class="fn">Pr</span>(object) × <span class="fn">IoU</span>(pred, truth)',
        note: '框的置信度是「这里有没有物体」与「框准不准」的乘积。IoU 是预测框与真值框交并比。'
      }
    },
    example: {
      analogy: '数一筐水果：不用一个个抓起来辨认，扫一眼就同时报出「左上两个苹果、右下三根香蕉」——YOLO 就是这种「一眼全报」。',
      mini: '把 448×448 的图分成 7×7 网格，每个格子预测 2 个框；网格中心负责落在其中的物体，一次前向得到 98 个框，再筛掉低置信度、NMS 去重。'
    },
    pros: ['速度极快，可实时（YOLOv8 达数百 FPS）', '端到端、一次前向，架构简洁', '全局上下文理解好，背景误检少'],
    cons: ['对小物体、密集物体精度弱于两阶段方法', '定位精度略糙', '边界框回归有尺度敏感性'],
    history: [
      { year: '2015', text: 'Redmon 提出 YOLOv1，开创单阶段检测范式。' },
      { year: '2016', text: 'YOLOv2/YOLO9000 引入 anchor、多尺度训练，支持 9000 类。' },
      { year: '2018', text: 'YOLOv3 引入多尺度预测（FPN），小物体检测提升。' },
      { year: '2020–2023', text: 'YOLOv4/v5 工程化爆发；Ultralytics 推出 YOLOv8，成为工业界事实标准。' }
    ],
    use: ['视频监控、自动驾驶、无人机实时检测', '工业质检、零售货架清点', '任何对速度有要求的检测任务'],
    avoid: ['需要高精度小目标检测（可用 Faster R-CNN 等两阶段）', '极密集遮挡场景', '要求亚像素级定位的任务'],
    learn: [
      '先搞清 <strong>单阶段 vs 两阶段</strong> 的本质区别：速度换精度。',
      '在演示里看 <strong>网格 + 边界框 + NMS</strong> 如何协作定位。',
      '理解 <strong>IoU、置信度、NMS</strong> 三个核心概念。',
      '动手用 YOLOv8 跑一张图，感受从训练到推理的完整流程。'
    ],
    demo: { id: 'yolo', title: 'YOLO · 网格检测演示', note: '一张合成图被分成网格，看每个格子如何预测边界框、置信度与类别，再经 NMS 去重。' }
  },

  {
    id: 'segment',
    num: '34',
    emoji: '🧩',
    name: '图像分割 · 语义分割',
    en: 'Image Segmentation (U-Net)',
    cat: 'cv',
    diff: 4,
    accent: '#38bdf8',
    tagline: '从「框住物体」到「抠出每个像素」——给图像的每一个点都打上类别标签。',
    intro: {
      what: '把图像按像素分类：每个像素都预测一个语义类别（天空/道路/人/车）。语义分割不区分个体，实例分割才区分同类中的不同个体。',
      problem: '分类只需一个标签，检测只需框，而分割要逐像素输出，空间分辨率与语义理解必须兼得。',
      idea: '用编码器（下采样）提取语义、解码器（上采样）恢复分辨率，中间用跳连把细节拼回去——U-Net 的对称 U 形结构。'
    },
    principle: {
      text: [
        '编码器：卷积 + 池化逐层下采样，感受野变大，学到「是什么」的语义。',
        '解码器：转置卷积/上采样逐步恢复分辨率，学到「在哪里」的空间信息。',
        '跳连：把编码器的高分辨率特征直接拼到解码器，找回池化丢失的边缘细节。'
      ],
      formula: {
        html: '<span class="fn">Loss</span> = − <span class="frac"><span class="num">1</span><span class="den">N</span></span> Σ<sub>i</sub> Σ<sub>c</sub> <span class="sym">y</span><sub>ic</sub> log <span class="sym">p</span><sub>ic</sub>',
        note: '逐像素交叉熵损失：对每个像素、每个类别求和，衡量预测概率分布与真值标签的差距。'
      }
    },
    example: {
      analogy: '给黑白线稿上色：先看全局判断「这是天空、那是房子」，再回到细节把边界一笔笔描准——编码器负责「判断」，解码器负责「描边」。',
      mini: '输入 256×256 的街景，输出 256×256 的标签图：0=背景、1=道路、2=车、3=行人，每个像素一个颜色，形成「抠图式」结果。'
    },
    pros: ['像素级精确理解，是自动驾驶/医疗的基础', 'U-Net 结构简洁、样本效率高（医学影像小数据集也能用）', '跳连保留细节，边缘更准'],
    cons: ['标注成本极高（逐像素标注）', '计算量大，实时性弱于检测', '语义分割不区分同类个体（需实例分割补充）'],
    history: [
      { year: '2014', text: 'FCN（全卷积网络）首次实现端到端语义分割。' },
      { year: '2015', text: 'U-Net 提出，成为医学图像分割的黄金标准。' },
      { year: '2017', text: 'Mask R-CNN 把分割加到检测上，实现实例分割。' },
      { year: '2020s', text: 'SegFormer、SAM（分割一切大模型）让分割走向通用与交互式。' }
    ],
    use: ['医学影像（肿瘤/器官分割）', '自动驾驶（道路、车道线、行人）', '卫星遥感、抠图、视频特效'],
    avoid: ['只需「有没有物体」用分类/检测更省', '标注预算有限的场景', '对实时性要求极高的边缘设备'],
    learn: [
      '理解 <strong>语义分割 vs 实例分割 vs 全景分割</strong> 的区别。',
      '在演示里看 <strong>编码-解码 + 跳连</strong> 如何恢复细节。',
      '掌握 <strong>IoU（mIoU）</strong> 这一分割评价指标。',
      '用 U-Net 跑一个医学/遥感小数据集，体会小样本下的优势。'
    ],
    demo: { id: 'segment', title: '分割 · 编码解码演示', note: '一张合成街景，切换「原图 / 分割掩码 / 叠加」，看逐像素类别如何被 U 形结构还原。' }
  },

  {
    id: 'augment',
    num: '35',
    emoji: '🪞',
    name: '数据增强',
    en: 'Data Augmentation',
    cat: 'cv',
    diff: 2,
    accent: '#38bdf8',
    tagline: '不花钱买数据的「免费午餐」——把一张图变出十张，让模型见多识广、更抗过拟合。',
    intro: {
      what: '通过对现有训练样本做随机变换（翻转、旋转、裁剪、变色、加噪等）生成新样本，扩大训练集多样性、提升泛化能力。',
      problem: '深度学习数据饥渴，标注昂贵；数据太少时模型死记硬背训练集、过拟合。',
      idea: '利用「图像的语义不随某些几何/颜色变换而改变」这一先验，人为扩充样本，逼模型学到本质特征而非表面像素。'
    },
    principle: {
      text: [
        '几何增强：翻转、旋转、缩放、裁剪、平移——物体换个角度还是同一个物体。',
        '颜色增强：亮度、对比度、饱和度、色相抖动——光照变了语义不变。',
        '高级增强：MixUp（两张图线性混合）、CutMix（粘贴补丁）、AutoAugment（自动搜索策略）。'
      ],
      formula: {
        html: '<span class="sym">x̃</span> = <span class="fn">T</span>(<span class="sym">x</span>),　<span class="fn">T</span> ~ <span class="fn">Augment</span>(·)',
        note: '每个样本 x 经过随机增强变换 T 得到新样本 x̃，标签不变；T 每次随机采样。'
      }
    },
    example: {
      analogy: '学认猫：只见过正面的照片，见到侧面的猫就不认识了。把照片翻转、裁剪、调色后，等于见过了各种角度的猫。',
      mini: '一张手写数字「7」，随机旋转 ±15°、平移、加噪，得到 10 张「不同的 7」，模型不再只记住那一个像素位置。'
    },
    pros: ['几乎零成本提升泛化、抗过拟合', '对图像语义破坏小、实现简单', '是自监督/对比学习的重要组成部分'],
    cons: ['增强不当可能引入错误先验（如医学图像镜像可能错误）', '对某些任务（如 OCR 文字）需谨慎设计', '不能替代真正需要的新数据分布'],
    history: [
      { year: '2012', text: 'AlexNet 用随机裁剪 + 翻转 + PCA 颜色扰动，成为标配。' },
      { year: '2018', text: 'MixUp、CutMix 提出，用样本混合提升鲁棒性。' },
      { year: '2019', text: 'AutoAugment、RandAugment 自动搜索/简化增强策略。' },
      { year: '至今', text: '增强贯穿分类、检测、分割、对比学习（如 SimCLR）。' }
    ],
    use: ['任何图像训练（分类/检测/分割）', '小数据集场景（医学、遥感）', '对比学习、自监督预训练'],
    avoid: ['语义会因变换而改变的任务（需小心设计）', '测试时不要做「随机」增强，需固定', '医学影像镜像/旋转可能改变解剖语义'],
    learn: [
      '在演示里逐个开关 <strong>翻转/旋转/裁剪/亮度/噪声</strong>，看变换效果。',
      '理解 <strong>训练时增强 vs 测试时</strong> 的区别：测试要确定性。',
      '了解 <strong>MixUp/CutMix</strong> 为何能提升鲁棒性。',
      '在实践中把增强写进 <strong>数据管道（DataLoader）</strong> 而非预处理磁盘。'
    ],
    demo: { id: 'augment', title: '数据增强 · 变换演示', note: '一张简单图案，逐个切换翻转/旋转/裁剪/亮度/加噪，看它如何变出多张「新样本」。' }
  },

  {
    id: 'vit',
    num: '36',
    emoji: '👁️',
    name: '视觉 Transformer',
    en: 'Vision Transformer (ViT)',
    cat: 'cv',
    diff: 5,
    accent: '#38bdf8',
    tagline: '把一张图切成「词」——用 Transformer 做视觉，证明卷积不是理解图像的唯一道路。',
    intro: {
      what: '把图像切成固定大小的 patch（补丁），每个 patch 展平成向量当作「词」，加位置编码后送进标准 Transformer，做分类/检测/分割。',
      problem: '卷积有「局部性、平移不变性」的归纳偏置，但感受野受限；Transformer 全局建模能力强，却天然是为序列设计的，无法直接吃图像。',
      idea: '「图像 = 一串补丁」：把 patch 当作 token，让自注意力在任意两个 patch 之间自由交互，靠数据量换取对局部性的自动学习。'
    },
    principle: {
      text: [
        'Patch 化：把 H×W×C 的图像切成 N 个 P×P 的补丁，展平成 N 个 P²C 维向量。',
        '加 [CLS] token 与位置编码：一个可学习的分类 token 汇总全局信息；位置编码告诉网络补丁原本在哪。',
        '标准 Transformer 编码器：多头自注意力 + MLP，堆 L 层；[CLS] 的最终表示接分类头。'
      ],
      formula: {
        html: '<span class="fn">Attention</span>(Q,K,V) = <span class="fn">softmax</span><span class="op">(</span><span class="frac"><span class="num">QKᵀ</span><span class="den">√d</span></span><span class="op">)</span>V',
        note: '自注意力核心：每个补丁与所有补丁算相似度并加权求和，天然全局建模。'
      }
    },
    example: {
      analogy: '把一张拼图打散，每块写上个编号（位置编码），然后让所有拼块两两「对话」看谁和谁相关——拼块即 patch，对话即注意力。',
      mini: '224×224 图切成 16×16=196 个 16×16 的 patch，每个展平成 768 维向量，输入 12 层 Transformer，[CLS] 输出接 1000 类分类。'
    },
    pros: ['全局感受野，长距离依赖建模强', '结构统一，可与 NLP 多模态共享', '大模型 + 大数据下可超过 CNN'],
    cons: ['缺少卷积的归纳偏置，小数据上易过拟合', '计算量随 patch 数平方增长', '对分辨率敏感（需插值位置编码）'],
    history: [
      { year: '2020', text: 'Dosovitskiy 等提出 ViT，证明「大数据 + Transformer」可媲美 CNN。' },
      { year: '2021', text: 'Swin Transformer 引入窗口注意力 + 层级结构，成为视觉主干。' },
      { year: '2021', text: 'CLIP 用对比学习把 ViT 与文本对齐，开启视觉-语言多模态。' },
      { year: '2020s', text: 'ViT 成为 SAM、DINO、扩散模型等前沿视觉系统的核心。' }
    ],
    use: ['大模型/大数据图像分类', '多模态（图文）任务', '作为现代视觉系统的主干网络'],
    avoid: ['小数据集（CNN 或微调预训练 ViT 更稳）', '对实时性要求极高的边缘端', '超高分辨率输入（需分块或窗口注意力）'],
    learn: [
      '先回顾 <strong>Transformer 自注意力</strong>（见前面 Transformer 主题）。',
      '在演示里看 <strong>patch 划分 + 位置编码 + 注意力</strong> 的完整流程。',
      '对比 <strong>ViT 与 CNN</strong> 的归纳偏置差异：局部性 vs 全局性。',
      '了解 <strong>Swin Transformer</strong> 如何用窗口注意力降低计算量。'
    ],
    demo: { id: 'vit', title: 'ViT · 补丁注意力演示', note: '一张图被切成补丁，点击某个补丁看它「最关注」哪些其他补丁（注意力权重）。' }
  },

  {
    id: 'vae',
    num: '37',
    emoji: '🎲',
    name: '变分自编码器 VAE',
    en: 'Variational Autoencoder',
    cat: 'gen',
    diff: 4,
    accent: '#c084fc',
    tagline: '给自编码器装上「概率」——不记死一张图，而是学一个分布，能随手「抽」出新样本。',
    intro: {
      what: '把输入编码成一个「概率分布」（均值 μ 和方差 σ），再从分布里采样解码，是一种生成式自编码器。',
      problem: '普通自编码器把每张图压成一个确定点，隐空间可能断裂、不连续；随便取一个点解码往往得到无意义结果，也无法生成新样本。',
      idea: '强制隐变量服从标准正态分布（z ~ N(μ,σ²)），用「重参数化」z = μ + σε 让梯度可回传，从而学到一个连续、可采样的隐空间。'
    },
    principle: {
      text: [
        '编码器输出 μ 与 σ（而非一个点），隐变量 z 从 N(μ,σ²) 采样。',
        '重参数化技巧：z = μ + σ·ε（ε~N(0,1)），把采样「移出」计算图，使梯度能通过 μ、σ 回传。',
        '损失 = 重建误差 + KL 散度：重建项让解码还原输入，KL 项把隐分布拉向标准正态（正则化）。'
      ],
      formula: {
        html: '<span class="fn">L</span> = <span class="fn">E</span>[log <span class="sym">p</span>(x|z)] − <span class="fn">KL</span>(<span class="fn">q</span>(z|x) ‖ <span class="fn">p</span>(z))',
        note: '证据下界（ELBO）：第一项是重建质量，第二项是隐分布与先验的 KL 散度，作为正则化。'
      }
    },
    example: {
      analogy: '学画猫：普通自编码器把每只猫记成一个坐标点；VAE 记住的是「猫分布」（大概在哪个区域、有多散），所以能在这个区域里随机抽点，画出没见过的新猫。',
      mini: '在 MNIST 上训练 VAE 后，在隐空间两个数字之间匀速滑动采样点，解码出的数字会平滑地从「3」渐变到「8」。'
    },
    pros: ['隐空间连续、可采样，是真正的生成模型', 'KL 正则化提升泛化与鲁棒性', '可做插值、编辑、异常检测'],
    cons: ['生成的图像往往偏模糊（高斯假设限制）', '训练比 AE 更不稳定', '隐空间可解释性有限'],
    history: [
      { year: '2013', text: 'Kingma & Welling 提出 VAE，用重参数化使变分推断可端到端训练。' },
      { year: '2015', text: '条件 VAE（CVAE）实现按标签/条件生成。' },
      { year: '2016', text: 'β-VAE 用加权 KL 学到更解耦的隐表示。' },
      { year: '2019+', text: 'VQ-VAE 用离散隐变量，成为扩散模型等的基础。' }
    ],
    use: ['图像生成与编辑、隐空间插值', '异常检测（重建误差大=异常）', '表示学习、半监督学习'],
    avoid: ['追求高清晰度生成（扩散模型/GAN 更强）', '对隐空间可解释性要求高的场景', '需要精确重建时（AE 更直接）'],
    learn: [
      '先回顾 <strong>自编码器</strong>（见前面主题），理解编码-解码。',
      '在演示里拖拽隐空间点，看解码如何<strong>平滑插值</strong>，体会「连续隐空间」。',
      '手推 <strong>重参数化</strong>：为什么 z=μ+σε 能让梯度回传。',
      '理解 <strong>ELBO 两项</strong>：重建项 vs KL 项，以及 β 的作用。'
    ],
    demo: { id: 'vae', title: 'VAE · 隐空间插值演示', note: '拖拽 2D 隐空间中的点，看解码结果在「圆/方/三角」之间平滑渐变——这就是连续隐空间。' }
  },

  {
    id: 'diffusion',
    num: '38',
    emoji: '🌫️',
    name: '扩散模型 · DDPM',
    en: 'Diffusion Model (DDPM)',
    cat: 'gen',
    diff: 5,
    accent: '#c084fc',
    tagline: '先学会「把图加噪成纯噪声」，再反过来一步步去噪——从噪声里「雕」出图像。',
    intro: {
      what: '一类生成模型：前向过程逐步给数据加高斯噪声直到变成纯噪声；逆向过程学习一步步去噪，最终从纯噪声生成数据。',
      problem: '直接学「从噪声一步生成图像」太难（映射高度复杂）；GAN 又存在训练不稳定、模式崩溃。',
      idea: '把难的「一步生成」拆成很多个小步骤：每步只预测「当前步的噪声」，逐步去噪。这样每步任务简单、训练稳定。'
    },
    principle: {
      text: [
        '前向过程（加噪）：x_t = √ᾱ_t · x_0 + √(1−ᾱ_t) · ε，ᾱ_t 随 t 从 1 单调降到 0。',
        '逆向过程（去噪）：训练一个 UNet，输入带噪的 x_t 和时刻 t，预测其中的噪声 ε_θ(x_t, t)。',
        '采样：从纯噪声 x_T 开始，用学到的 ε_θ 逐步去噪，T 步后得到清晰图像。'
      ],
      formula: {
        html: '<span class="sym">x</span><sub>t</sub> = <span class="rad">√</span><span class="ov">ᾱ<sub>t</sub></span> <span class="sym">x</span><sub>0</sub> + <span class="rad">√</span><span class="ov">1−ᾱ<sub>t</sub></span> <span class="sym">ε</span>,　<span class="sym">ε</span> ~ <span class="fn">N</span>(0, I)',
        note: '前向加噪的闭式解：无需逐步迭代，直接从 x_0 跳到任意时刻 t 的 x_t。'
      }
    },
    example: {
      analogy: '把一张照片反复复印，越来越糊直到一片雪花；然后训练一个「修复师」，看糊的程度猜出该去掉多少噪点，一层层还原。',
      mini: '训练时给一张猫图加 50% 噪声，让 UNet 猜「噪声长什么样」；采样时从纯噪声出发，反复让 UNet 去噪 1000 步，最后得到一张新猫图。'
    },
    pros: ['生成质量极高、模式覆盖全（不易模式崩溃）', '训练稳定，似然可解释', '可控性强（条件生成、文生图）'],
    cons: ['采样慢（需多步迭代）', '计算成本高', '理论到实践细节多（噪声调度等）'],
    history: [
      { year: '2015', text: 'Sohl-Dickstein 等提出扩散概率模型雏形。' },
      { year: '2020', text: 'DDPM（Ho 等）简化训练目标，大幅提升生成质量。' },
      { year: '2021', text: 'DDIM 加速采样；Classifier-free guidance 提升可控性。' },
      { year: '2022', text: 'Stable Diffusion、DALL·E 2 引爆文生图，扩散成为主流生成范式。' }
    ],
    use: ['文生图、图像编辑（inpainting/超分）', '音频、视频、分子生成', '条件生成（文本/草图/类别）'],
    avoid: ['实时生成（采样慢，可用 DDIM 加速）', '算力受限的边缘端', '需要精确似然估计时用其他方法'],
    learn: [
      '在演示里拖动时间步 t，看图像如何<strong>逐渐加噪/去噪</strong>。',
      '理解 <strong>前向闭式解</strong>：为什么能一步跳到任意 t。',
      '搞清逆向是<strong>预测噪声</strong>（而非直接预测 x_0）。',
      '了解 <strong>DDPM → DDIM → Stable Diffusion</strong> 的演进主线。'
    ],
    demo: { id: 'diffusion', title: '扩散 · 3D 点云加噪去噪', note: '拖拽旋转；拖动 t 看一个 3D 甜甜圈如何被打散成噪声云、再重新聚拢成形。' },
    deep: 'content/diffusion.md'
  },

  {
    id: 'sd',
    num: '39',
    emoji: '🖼️',
    name: '文生图 · Stable Diffusion',
    en: 'Text-to-Image (Stable Diffusion)',
    cat: 'gen',
    diff: 5,
    accent: '#c084fc',
    tagline: '「一句话生成一张图」——把扩散搬进压缩的潜空间，用文本当方向盘。',
    intro: {
      what: '一种潜空间扩散模型（Latent Diffusion）：先用 VAE 把图像压到小得多的潜空间，在潜空间里做扩散去噪，并用 CLIP 文本编码器把文字变成条件信号。',
      problem: '直接在像素空间做扩散，内存与计算量巨大；且纯扩散无法按「文本」控制生成内容。',
      idea: '三步：① VAE 编码到潜空间（省算力）；② UNet 在潜空间按文本条件去噪；③ VAE 解码回像素。文本经 CLIP 编码后通过交叉注意力注入 UNet。'
    },
    principle: {
      text: [
        '潜空间压缩：VAE 把 512×512 图像压到 64×64 潜变量，扩散在此进行，算力大幅下降。',
        '文本条件：prompt 经 CLIP 文本编码器得到向量，通过 cross-attention 让 UNet 每一步都知道「要生成什么」。',
        'Classifier-free guidance：同时训练有条件/无条件，采样时用 (1+w)·有 − w·无 放大文本影响力。'
      ],
      formula: {
        html: '<span class="sym">ε̂</span> = (1+<span class="sym">w</span>)<span class="fn">ε</span><sub>θ</sub>(z<sub>t</sub>,<span class="sym">c</span>) − <span class="sym">w</span>·<span class="fn">ε</span><sub>θ</sub>(z<sub>t</sub>, ∅)',
        note: 'Classifier-free guidance：在「有文本 c」与「无文本 ∅」预测之间外推，w 越大越贴合文本（但可能过饱和）。'
      }
    },
    example: {
      analogy: '在「潜空间草图」上作画：先在缩略图上用文字指挥布局（文本当导演），定稿后再放大成高清大图——比直接在巨幅画布上一笔笔改高效得多。',
      mini: '输入「a cat wearing a hat」，CLIP 把这句话编码成向量；UNet 在 64×64 潜空间里从噪声去噪 30 步，每步都「看着」这句话；最后 VAE 解码成 512×512 的猫图。'
    },
    pros: ['生成质量高、可控（文本/图像/草图）', '潜空间压缩大幅降算力，可在家用 GPU 跑', '生态丰富（LoRA、ControlNet 等）'],
    cons: ['仍非实时，多步采样有延迟', '文本理解有偏差，细节可能不合理', '版权、伦理与安全争议'],
    history: [
      { year: '2021', text: 'CLIP（Radford 等）建立图文对齐，为文生图提供文本编码。' },
      { year: '2022', text: 'Rombach 等提出 Latent Diffusion（Stable Diffusion 前身）。' },
      { year: '2022', text: 'Stable Diffusion 开源，文生图爆发式普及。' },
      { year: '2023', text: 'SDXL、ControlNet、视频生成（Sora 等）持续演进。' }
    ],
    use: ['文生图、图生图、图像编辑', '设计、广告、游戏美术辅助', '可控生成（ControlNet 线稿/姿态）'],
    avoid: ['需要精确事实/文字渲染的场景', '对版权敏感的商业用途', '算力/延迟受限的实时应用'],
    learn: [
      '先掌握 <strong>VAE + 扩散模型</strong>（见前两个主题），SD 是二者的结合。',
      '在演示里看 <strong>文本→潜空间→图像</strong> 三段式流水线。',
      '理解 <strong>cross-attention</strong> 如何让文本「指挥」去噪。',
      '动手用 SD 试不同 prompt 与 <strong>guidance scale</strong>，感受可控性。'
    ],
    demo: { id: 'sd', title: '文生图 · 流水线演示', note: '切换 prompt，看潜空间从噪声逐步去噪，最后 VAE 解码出对应像素图。' }
  },

  {
    id: 'clip',
    num: '40',
    emoji: '🔗',
    name: 'CLIP 多模态对齐',
    en: 'Contrastive Language–Image Pretraining',
    cat: 'gen',
    diff: 5,
    accent: '#c084fc',
    tagline: '让图和文「说同一种语言」——对比学习把它们拉进同一个向量空间，成为文生图的基石。',
    intro: {
      what: '一种对比学习模型：用图像编码器和文本编码器分别把图/文映射到同一空间，训练目标是让匹配的图文对靠近、不匹配的远离。',
      problem: '传统视觉模型只能输出固定类别标签，无法理解任意文本描述，也难以零样本迁移到新任务。',
      idea: '收集海量「图文对」，用对比损失（InfoNCE）让 4 亿对图文在共同空间中对齐，从而获得强大的图文联合表示。'
    },
    principle: {
      text: [
        '双塔结构：图像编码器（ViT/ResNet）与文本编码器（Transformer）各自输出一个向量，投影到同一维度。',
        '对比学习：一个 batch 里 N 对图文，拉近对角线（匹配对）的余弦相似度，推远其余 N²−N 对。',
        '零样本分类：把类别名变成文本「a photo of {class}」，与图像算相似度，取最高者。'
      ],
      formula: {
        html: '<span class="fn">L</span> = − <span class="frac"><span class="num">1</span><span class="den">N</span></span> Σ<sub>i</sub> log <span class="frac"><span class="num">exp(sim(I<sub>i</sub>,T<sub>i</sub>)/τ)</span><span class="den">Σ<sub>j</sub> exp(sim(I<sub>i</sub>,T<sub>j</sub>)/τ)</span></span>',
        note: 'InfoNCE 对比损失：最大化匹配对相似度、最小化不匹配对，τ 是温度系数。'
      }
    },
    example: {
      analogy: '给一堆照片和一堆标签，把「猫的照片」和「猫」这个词贴得越来越近，把「猫」和「汽车的照片」推开——训练完，图和文就能互相指认。',
      mini: '训练后无需任何微调，就能做「零样本分类」：把 1000 个类别写成「a photo of dog/cat/...」，与测试图算相似度，最高者即为预测。'
    },
    pros: ['图文联合表示，零样本迁移能力强', '成为 SD、多模态大模型的文本编码基础', '无需逐类标注，利用海量图文对'],
    cons: ['需要海量数据与算力', '对细粒度/计数/空间关系理解有限', '对比学习对 batch 大小与负样本敏感'],
    history: [
      { year: '2021', text: 'OpenAI 发布 CLIP，用 4 亿图文对做对比预训练。' },
      { year: '2021', text: 'ALIGN、OpenCLIP 等复现与扩展。' },
      { year: '2022', text: 'CLIP 文本编码器被 Stable Diffusion 采用，成为文生图标准组件。' },
      { year: '2023+', text: '多模态大模型（GPT-4V、LLaVA）继承图文对齐思想。' }
    ],
    use: ['文生图的文本编码', '零样本图像分类/检索', '图文检索、多模态大模型底座'],
    avoid: ['需要精确文本/OCR 的场景', '细粒度视觉推理（计数、空间关系）', '算力与数据受限的自训练场景'],
    learn: [
      '在演示里看<strong>图文相似度矩阵</strong>，理解「匹配对靠近」。',
      '理解 <strong>对比损失 InfoNCE</strong> 与温度 τ 的作用。',
      '体验 <strong>零样本</strong>：类别名当文本，与图像比相似度。',
      '了解 CLIP 如何成为 <strong>Stable Diffusion</strong> 的文本编码器。'
    ],
    demo: { id: 'clip', title: 'CLIP · 图文对齐演示', note: '三张图与三个词映射到同一空间，点击看匹配对的相似度如何远高于不匹配对。' }
  },

  {
    id: 'word2vec',
    num: '41',
    emoji: '🧭',
    name: '词嵌入 Word2Vec',
    en: 'Word Embeddings (Word2Vec)',
    cat: 'llm',
    diff: 3,
    accent: '#34d399',
    tagline: '把词变成向量，让「国王 − 男人 + 女人 ≈ 女王」这样的语义运算成为可能。',
    intro: {
      what: '把每个词映射成一个稠密向量，使语义相近的词在向量空间中彼此靠近，并支持向量运算表达语义关系。',
      problem: 'one-hot 表示稀疏、维度爆炸且无法表达语义相似（「猫」和「狗」的 one-hot 距离与「猫」和「汽车」一样远）。',
      idea: '利用「分布式假说」：一个词的语义由它的上下文决定。让模型预测上下文（或由上下文预测中心词），副产品就是有语义的词向量。'
    },
    principle: {
      text: [
        'CBOW：用上下文词预测中心词；Skip-gram：用中心词预测上下文。',
        '训练时每词对应一个待学习的向量，通过「词-上下文」共现来调整，语义相近的词梯度相近、向量拉近。',
        '词向量具有线性结构：vec(国王)−vec(男人)+vec(女人) 的最近邻往往是 vec(女王)。'
      ],
      formula: {
        html: '<span class="fn">P</span>(c|w) = <span class="frac"><span class="num">exp(<span class="sym">v</span><sub>w</sub>·<span class="sym">v</span><sub>c</sub>)</span><span class="den">Σ<sub>c′</sub> exp(<span class="sym">v</span><sub>w</sub>·<span class="sym">v</span><sub>c′</sub>)</span></span>',
        note: 'Skip-gram 用 softmax 建模「中心词 w 预测上下文词 c」，点积衡量两词向量相似度。'
      }
    },
    example: {
      analogy: '给每个词发一个「坐标」：住在同一条街（语义相近）的词坐标接近；「国王」和「女王」在「性别」这条街上差一个「男人→女人」的位移。',
      mini: '在维基百科上训练 Skip-gram 后，vec(巴黎) − vec(法国) + vec(意大利) ≈ vec(罗马)，模型自己学会了「首都」关系。'
    },
    pros: ['语义相近的词自然聚集，可做类比推理', '向量可用于下游模型（RNN/Transformer 输入）', '无监督，用海量文本即可训练'],
    cons: ['一词多义被压缩成单向量（需 ELMo/BERT 改进）', '训练需大语料，低频词向量质量差', '捕捉的是分布相似而非严格语义'],
    history: [
      { year: '2013', text: 'Mikolov 等提出 Word2Vec（CBOW/Skip-gram），开启词嵌入时代。' },
      { year: '2014', text: 'GloVe 用全局共现矩阵统计得到词向量。' },
      { year: '2018', text: 'ELMo、BERT 用上下文相关表示取代静态词向量。' },
      { year: '至今', text: '词嵌入思想内化为所有语言模型的第一层「词表嵌入」。' }
    ],
    use: ['文本分类、检索、推荐的特征表示', '语义搜索与类比推理', '作为语言模型的输入层'],
    avoid: ['需要精确消歧（一词多义）时用上下文模型', '小语料训练（向量质量差）', '直接用于需要字面匹配的任务'],
    learn: [
      '在演示里做<strong>向量运算</strong>：国王 − 男人 + 女人 ≈ 女王。',
      '理解 <strong>分布式假说</strong>：语义由上下文决定。',
      '对比 <strong>CBOW vs Skip-gram</strong> 的训练目标。',
      '了解 Word2Vec → GloVe → BERT 的演进。'
    ],
    demo: { id: 'word2vec', title: 'Word2Vec · 词向量空间演示', note: '在 2D 词向量空间里做「国王 − 男人 + 女人」，看结果落点如何接近「女王」。' }
  },

  {
    id: 'gpt',
    num: '42',
    emoji: '🔮',
    name: 'GPT 架构与预训练',
    en: 'GPT & Pretraining',
    cat: 'llm',
    diff: 5,
    accent: '#34d399',
    tagline: '「预测下一个词」这件小事，规模大到一定程度，就涌现出了惊人的智能。',
    intro: {
      what: 'Generative Pre-trained Transformer：用自回归方式（逐 token 预测下一个）在海量文本上预训练的 Transformer 解码器，可被微调/提示用于各种任务。',
      problem: '标注数据稀缺，每做一个任务都要从头训练；且模型无法理解长上下文与开放域语言。',
      idea: '先做无监督预训练（学语言本身的规律），再用少量数据微调或直接提示（in-context learning），一个模型通吃多种任务。'
    },
    principle: {
      text: [
        '自回归语言建模：给定前文 x₁…xₜ，预测下一个 token xₜ₊₁，损失 = 交叉熵。',
        'Masked self-attention（因果注意力）：每个位置只能看它前面的 token，保证预测「下一个」时不偷看答案。',
        '规模定律：数据量、参数量、算力同步放大时，能力平滑提升，并涌现出推理等新能力。'
      ],
      formula: {
        html: '<span class="fn">L</span> = − Σ<sub>t</sub> log <span class="fn">P</span>(x<sub>t+1</sub> | x<sub>1</sub>…x<sub>t</sub>)',
        note: '预训练目标：最大化每个 token 在其前文条件下的概率（负对数似然）。'
      }
    },
    example: {
      analogy: '像「接龙」高手：读过海量文字后，你说上半句，它就能很自然地接出下半句——接得越多越准，最后连推理、翻译都「顺带」会了。',
      mini: '给 GPT 输入「1+1=」，它预测下一个 token 大概率是「2」；输入「法国的首都是」，预测「巴黎」。预训练阶段只做这一件事。'
    },
    pros: ['一个模型通吃生成/理解任务，泛化强', '少样本/零样本（in-context learning）能力强', '规模可扩展，能力随规模涌现'],
    cons: ['训练与推理成本极高', '可能编造事实（幻觉）、有偏见', '不可解释，行为不可完全预测'],
    history: [
      { year: '2017', text: 'Transformer 提出，为 GPT 提供架构基础。' },
      { year: '2018', text: 'OpenAI 发布 GPT-1，验证「预训练 + 微调」范式。' },
      { year: '2020', text: 'GPT-3（1750 亿参数）展现惊人的少样本学习。' },
      { year: '2022', text: 'ChatGPT（GPT-3.5 + RLHF）引爆大模型应用。' }
    ],
    use: ['对话、写作、代码生成', '翻译、摘要、问答', '作为 Agent 的「大脑」'],
    avoid: ['需要事实精确、可验证的场景（需 RAG/校验）', '低延迟/低成本的边缘推理', '敏感、合规要求高的领域'],
    learn: [
      '在演示里看<strong>自回归生成</strong>：逐 token 预测 + 采样。',
      '理解 <strong>因果注意力</strong> 为什么不能偷看未来。',
      '搞清 <strong>预训练 vs 微调 vs 提示</strong> 三种使用方式。',
      '了解 <strong>缩放定律与涌现能力</strong> 的讨论。'
    ],
    demo: { id: 'gpt', title: 'GPT · 下一个词预测演示', note: '给一小段上文，看模型对下一个字符的概率分布，用温度采样生成——这就是自回归。' }
  },

  {
    id: 'lora',
    num: '43',
    emoji: '🔩',
    name: '微调与 LoRA',
    en: 'Fine-tuning & LoRA',
    cat: 'llm',
    diff: 4,
    accent: '#34d399',
    tagline: '不用重训千亿参数——只学一个「低秩补丁」，就能让大模型学会新技能。',
    intro: {
      what: '在预训练大模型基础上做轻量适配。LoRA（Low-Rank Adaptation）冻结原权重 W，只训练一个低秩更新 ΔW = A·B。',
      problem: '全量微调要更新所有参数、为每个任务存一份完整模型，显存与存储成本巨大。',
      idea: '利用「微调时的权重变化是低秩的」这一发现，把 ΔW 分解成两个小矩阵 A、B，只训练这少量参数，前向时 W′ = W + A·B。'
    },
    principle: {
      text: [
        '冻结预训练权重 W，注入可训练的低秩矩阵：h = Wx + (A·B)x，A 是 d×r，B 是 r×d，r 远小于 d。',
        '参数量：全量微调 d×d，LoRA 仅 (d+d)×r；r=8 时通常能省 99% 以上。',
        '训练时可只更新 A、B，推理时把 A·B 合并进 W，零额外延迟。'
      ],
      formula: {
        html: '<span class="sym">W</span>′ = <span class="sym">W</span> + <span class="fn">A</span>·<span class="fn">B</span>,　<span class="fn">A</span> ∈ ℝ<sup>d×r</sup>, <span class="fn">B</span> ∈ ℝ<sup>r×d</sup>',
        note: 'LoRA 把权重更新 ΔW 约束为低秩：冻结 W，只训练小矩阵 A、B。'
      }
    },
    example: {
      analogy: '在巨幅海报上只贴一小块「修正补丁」，而不是整张重画——海报原样保留，补丁却能让它适配新场景。',
      mini: '一个 4096×4096 的注意力矩阵有 1600 万参数；LoRA 用 r=8 只需 4096×8×2≈6.5 万参数（约 1/256），就能让大模型学会新领域知识。'
    },
    pros: ['显存与存储大幅下降，单卡可微调大模型', '多个 LoRA 可插拔切换，一份底座多任务', '推理时合并进 W，零额外延迟'],
    cons: ['r 太小会限制容量', '与全量微调相比可能略欠上限', '并非所有层/任务都适合 LoRA'],
    history: [
      { year: '2019', text: 'Adapter、prefix-tuning 等参数高效微调（PEFT）兴起。' },
      { year: '2021', text: '微软提出 LoRA，用低秩分解实现高效微调。' },
      { year: '2022', text: 'LoRA 与 Stable Diffusion 结合，成为个性化生成标配。' },
      { year: '2023', text: 'QLoRA 用 4-bit 量化 + LoRA，单卡微调 70B 模型。' }
    ],
    use: ['大模型领域适配（医疗/法律/代码）', '个性化文生图（角色 LoRA）', '资源受限下的模型微调'],
    avoid: ['任务与预训练差异巨大、需要全面重训时', '需要极致性能上限的场景', 'r 与目标层选择不当'],
    learn: [
      '在演示里调 <strong>秩 r</strong>，看 LoRA 参数量如何变化。',
      '理解 <strong>低秩假设</strong>：为什么 ΔW 能压缩成 A·B。',
      '对比 <strong>全量微调 vs LoRA vs 前缀微调</strong>。',
      '动手用 PEFT/LoRA 微调一个小模型。'
    ],
    demo: { id: 'lora', title: 'LoRA · 低秩分解演示', note: '看一个大权重矩阵如何被 A×B 低秩近似，拖动秩 r 对比参数量。' }
  },

  {
    id: 'rlhf',
    num: '44',
    emoji: '⚖️',
    name: 'RLHF 与对齐',
    en: 'Reinforcement Learning from Human Feedback',
    cat: 'llm',
    diff: 5,
    accent: '#34d399',
    tagline: '让模型不只「会说」，还要「说得有用、无害、符合人类偏好」——用人来当裁判。',
    intro: {
      what: '用人类偏好反馈来对齐语言模型：先训练一个「奖励模型」学会打分，再用强化学习（PPO）优化语言模型去拿高分。',
      problem: '只做「预测下一个词」的模型会生成流畅但可能有害、不诚实或不符用户意图的内容。',
      idea: '让人类对多个回答排序，训练奖励模型 r(回答) 逼近人类偏好，再用强化学习最大化 r，把模型拉向「人类更满意」的方向。'
    },
    principle: {
      text: [
        '第一步 SFT：在高质量指令-回答上监督微调，让模型学会「按指令回答」。',
        '第二步 奖励模型：让人类对同一 prompt 的多个回答排序，训练模型打分（Bradley-Terry 模型）。',
        '第三步 PPO：用奖励模型当「裁判」，强化学习优化策略，同时加 KL 惩罚防止偏离太远。'
      ],
      formula: {
        html: '<span class="fn">max</span><sub>θ</sub> <span class="fn">E</span>[<span class="sym">r</span>(x,y)] − <span class="sym">β</span>·<span class="fn">KL</span>(π<sub>θ</sub> ‖ π<sub>ref</sub>)',
        note: 'PPO 目标：最大化奖励，同时用 KL 项约束新策略别离参考策略太远，防止「刷分」退化。'
      }
    },
    example: {
      analogy: '像训练客服：先给标准答案（SFT），再请一批老员工给各种回答打分（奖励模型），最后让新员工照着「高分标准」不断练习（PPO）。',
      mini: '同一问题给出两个回答，人类更认可「有帮助、不啰嗦」的那个；奖励模型学会这个偏好后，PPO 让模型多生成这类回答。'
    },
    pros: ['显著提升有用性、诚实性、安全性', '让模型贴合人类价值观与意图', '是可扩展的对齐范式'],
    cons: ['需要大量人工标注，成本高', '奖励模型可能被「钻空子」（reward hacking）', '人类偏好本身有偏、难以统一'],
    history: [
      { year: '2017', text: 'Christiano 等提出从人类偏好学奖励（RLHF 雏形）。' },
      { year: '2020', text: 'OpenAI 用 RLHF 微调 GPT-3，得到 InstructGPT。' },
      { year: '2022', text: 'ChatGPT 用 RLHF 显著改善对话体验，引爆关注。' },
      { year: '2023+', text: 'DPO 等直接偏好优化方法简化了 RLHF 流程。' }
    ],
    use: ['对话助手的对齐', '减少有害/偏见输出', '让模型更贴合特定领域规范'],
    avoid: ['追求客观唯一答案的场景（偏好主观）', '标注资源不足时', '把对齐当「一次完成」——需持续迭代'],
    learn: [
      '在演示里对两个回答<strong>点选偏好</strong>，看奖励如何累积。',
      '理解 <strong>SFT → 奖励模型 → PPO</strong> 三段式。',
      '搞清 <strong>KL 惩罚</strong> 为什么能防止模型刷分。',
      '了解 <strong>DPO</strong> 等无需显式奖励模型的替代方法。'
    ],
    demo: { id: 'rlhf', title: 'RLHF · 偏好打分演示', note: '同一问题两个回答，点选你更喜欢的，看奖励模型如何累积人类偏好。' }
  },

  {
    id: 'prompt',
    num: '45',
    emoji: '💬',
    name: '提示工程',
    en: 'Prompt Engineering',
    cat: 'llm',
    diff: 2,
    accent: '#34d399',
    tagline: '不训练模型，光靠「怎么问」，就能让同一个模型的表现天差地别。',
    intro: {
      what: '设计输入提示（prompt）来引导大模型产出期望结果的技术，包括零样本、少样本、思维链、角色设定等策略。',
      problem: '大模型对措辞敏感：问法不同，答案质量差异巨大；直接问复杂问题常得到错误或含糊的回答。',
      idea: '把「任务说明、示例、格式、角色、思考步骤」显式写进提示，用上下文激活模型已有能力，而不是重新训练。'
    },
    principle: {
      text: [
        '零样本（zero-shot）：直接下指令，不给示例。',
        '少样本（few-shot）：给几个「输入→输出」示例，让模型照猫画虎。',
        '思维链（CoT）：让模型「一步步想」，显著提升推理题正确率。',
        '角色/格式约束：设定「你是专家」，要求结构化输出（JSON/表格）。'
      ],
      formula: {
        html: '<span class="fn">output</span> = <span class="fn">LLM</span>(<span class="fn">prompt</span>),　<span class="fn">prompt</span> = 指令 + 上下文 + 示例 + 格式',
        note: '提示工程的本质：把任务所需信息组织进上下文窗口，激活模型的 in-context learning。'
      }
    },
    example: {
      analogy: '请人帮忙：说「帮我做这道题」不如「你是数学老师，先写步骤再给答案，用中文」——信息越全，帮得越准。',
      mini: '同一道推理题，直接问可能答错；加上「请一步一步思考」后，模型展开推理链，正确率大幅提升。'
    },
    pros: ['零成本、见效快、可迭代', '无需训练与部署，即时调整', '释放模型已有的少样本/推理能力'],
    cons: ['效果不稳定，依赖模型能力', '提示易过拟合特定模型', '可解释性与可复现性有限'],
    history: [
      { year: '2020', text: 'GPT-3 展示 in-context learning，few-shot 提示兴起。' },
      { year: '2022', text: 'Wei 等提出思维链（Chain-of-Thought），推理大幅提升。' },
      { year: '2023', text: 'ReAct、self-consistency、结构化提示等蓬勃发展。' },
      { year: '至今', text: '提示工程成为 AI 应用开发的基础技能。' }
    ],
    use: ['快速原型与任务适配', '让模型输出结构化结果', '提升推理/代码/写作质量'],
    avoid: ['依赖事实准确性时（需 RAG/校验）', '把提示当「魔法咒语」过度玄学化', '需要稳定可复现的工业场景'],
    learn: [
      '在演示里切换<strong>零样本/少样本/思维链</strong>，对比效果差异。',
      '掌握 <strong>「角色 + 任务 + 上下文 + 格式」</strong> 的提示模板。',
      '练习 <strong>思维链</strong>：让模型先推理再给答案。',
      '了解 <strong>ReAct</strong>（思考+行动）如何与工具结合。'
    ],
    demo: { id: 'prompt', title: '提示工程 · 策略对比演示', note: '同一道题，切换「直接问 / 给例子 / 思维链」，看模型答案如何从错到对。' }
  },

  {
    id: 'rag',
    num: '46',
    emoji: '📚',
    name: 'RAG 检索增强生成',
    en: 'Retrieval-Augmented Generation',
    cat: 'agent',
    diff: 4,
    accent: '#fb7185',
    tagline: '给大模型外挂一个「资料库」——先查再答，让答案有据可依、减少胡编。',
    intro: {
      what: '在生成回答前，先从外部知识库检索相关文档片段，把它们作为上下文拼进提示，再让大模型据此生成。',
      problem: '大模型的知识有截止日期、会遗忘细节、且容易「一本正经地胡说」（幻觉）；私有数据它更是一无所知。',
      idea: '把「检索」和「生成」分开：检索器负责从知识库找到相关片段，生成器负责基于这些片段作答并引用来源。'
    },
    principle: {
      text: [
        '索引：把文档切块（chunk），用嵌入模型编码成向量，存入向量数据库。',
        '检索：把问题也编码成向量，用相似度（如余弦）找出最相关的 top-k 片段。',
        '生成：把「问题 + 检索到的片段」拼成提示，让 LLM 基于上下文生成带出处的回答。'
      ],
      formula: {
        html: '<span class="fn">score</span>(q,d) = <span class="frac"><span class="num">q·d</span><span class="den">‖q‖‖d‖</span></span> = cos(<span class="sym">q</span>,<span class="sym">d</span>)',
        note: '检索打分常用余弦相似度：把问题向量 q 与文档向量 d 比较，取最相近的 top-k。'
      }
    },
    example: {
      analogy: '考试时允许「开卷」：先翻书找到相关章节（检索），再照着书组织答案（生成），而不是凭记忆瞎写。',
      mini: '问「公司今年的报销政策是什么？」，系统先从内部文档库检索到《报销制度 2024》的两个片段，再让 LLM 基于片段回答并标注出处。'
    },
    pros: ['显著减少幻觉，答案可溯源', '能接入私有/最新知识，无需重训模型', '成本低、灵活，可随时更新知识库'],
    cons: ['检索质量决定上限（垃圾进垃圾出）', '多一步检索，延迟增加', '长上下文拼接有窗口限制'],
    history: [
      { year: '2020', text: 'Lewis 等提出 RAG，结合检索与生成。' },
      { year: '2022', text: 'ChatGPT 引爆后，RAG 成为企业落地大模型的主流方案。' },
      { year: '2023', text: '向量数据库（Pinecone、Milvus）与 LangChain 等框架普及。' },
      { year: '至今', text: 'GraphRAG、Agentic RAG 等让检索更智能、可多跳推理。' }
    ],
    use: ['企业知识库问答、客服', '私有文档、最新资讯的问答', '减少幻觉、需要引用来源的场景'],
    avoid: ['知识库质量差/未维护时', '需要深度多跳推理（可用 Agentic RAG）', '对延迟极度敏感的实时场景'],
    learn: [
      '在演示里看<strong>检索→拼接→生成</strong>的完整流程。',
      '理解 <strong>向量检索 + 余弦相似度</strong> 的原理。',
      '掌握 <strong>chunk 切分、top-k 选择</strong> 等工程细节。',
      '了解 RAG 与 <strong>微调</strong> 的区别：何时检索、何时微调。'
    ],
    demo: { id: 'rag', title: 'RAG · 检索生成演示', note: '选一个问题，看系统如何从文档库检索相关片段，再据此生成带出处的回答。' }
  },

  {
    id: 'agent',
    num: '47',
    emoji: '🕵️',
    name: 'Agent 与工具调用',
    en: 'AI Agent & Tool Use (ReAct)',
    cat: 'agent',
    diff: 5,
    accent: '#fb7185',
    tagline: '让大模型不再只会「说」，还会「做」——思考、调工具、看结果，循环直到完成。',
    intro: {
      what: 'AI Agent 是能用大模型做「决策 + 行动」的智能体：给定目标，自主规划、调用工具、观察反馈、迭代执行。',
      problem: '纯大模型只能生成文本，无法联网搜索、查数据库、执行代码；遇到多步任务也不会自己分解执行。',
      idea: '用 ReAct 范式让模型交替输出「思考（Thought）→ 行动（Action，即调用工具）→ 观察（Observation）」，把工具结果喂回模型，循环直到给出最终答案。'
    },
    principle: {
      text: [
        'ReAct 循环：Thought（该做什么）→ Action（调用哪个工具、参数是什么）→ Observation（工具返回什么）→ 再 Thought……',
        '工具（Tools）：把外部能力封装成可调用接口——搜索、计算器、数据库、代码执行等。',
        '规划与反思：复杂任务可先拆解子目标，执行中根据观察修正计划。'
      ],
      formula: {
        html: 'Thought → Action → Observation → Thought → … → <span class="fn">Final Answer</span>',
        note: 'Agent 的核心循环：推理与行动交替，工具观察作为外部记忆反馈给模型。'
      }
    },
    example: {
      analogy: '派一个助手去买东西：助手会想「先查地图（工具）→ 找到路线（观察）→ 再决定怎么走」，而不是凭空报个答案。',
      mini: '问「北京今天多少度？」，Agent 思考后调用「天气查询(北京)」工具，得到「25°C」后回答「北京今天 25°C」。'
    },
    pros: ['能执行真实任务（搜索、计算、写代码）', '多步推理与规划能力强', '可组合任意工具，能力可扩展'],
    cons: ['多步循环成本高、延迟大', '可能选错工具或陷入循环', '自主行动带来安全与可靠性风险'],
    history: [
      { year: '2022', text: 'ReAct（Yao 等）提出推理与行动交替的范式。' },
      { year: '2023', text: 'AutoGPT、LangChain Agent 等让 Agent 概念火爆。' },
      { year: '2023', text: 'OpenAI 推出 Function Calling，把工具调用标准化。' },
      { year: '2024+', text: '多模态、多智能体、计算机操作（Computer Use）Agent 兴起。' }
    ],
    use: ['智能客服、自动化办公助手', '数据分析、代码生成与执行', '联网搜索、信息整合'],
    avoid: ['高风险、不可逆操作（需人工确认）', '需要严格可复现的确定性任务', '对成本/延迟敏感的场景'],
    learn: [
      '在演示里逐步推进<strong>Thought → Action → Observation</strong> 循环。',
      '理解 <strong>工具（Function Calling）</strong> 如何被模型调用。',
      '对比 <strong>纯生成 vs ReAct Agent</strong> 的能力边界。',
      '动手用 LangChain/官方 SDK 搭一个最小 Agent。'
    ],
    demo: { id: 'agent', title: 'Agent · ReAct 循环演示', note: '逐步推进「思考→调工具→观察」，看 Agent 如何查天气、算数字并给出最终答案。' }
  },

  {
    id: 'multiagent',
    num: '48',
    emoji: '🤝',
    name: '多智能体协作',
    en: 'Multi-Agent Collaboration',
    cat: 'agent',
    diff: 5,
    accent: '#fb7185',
    tagline: '一个 Agent 不够，就派一个团队——分工协作、互相审核，完成更复杂的任务。',
    intro: {
      what: '让多个各司其职的 Agent 通过消息传递协作，例如「研究员→写手→审校」流水线，或「辩论/投票」式协作，共同完成单个 Agent 难做好的任务。',
      problem: '单个 Agent 要同时负责规划、执行、验证，上下文负担重、易出错；复杂任务需要分工与交叉检查。',
      idea: '把任务分解给不同角色的 Agent：有的负责检索、有的负责生成、有的负责批判与修正，通过结构化对话协作产出。'
    },
    principle: {
      text: [
        '角色分工：每个 Agent 有独立的系统提示与职责（如产品经理/工程师/测试）。',
        '消息传递：Agent 之间通过共享的对话/消息队列交接中间结果。',
        '编排模式：流水线（串行）、辩论（并行再汇总）、层级（管理者分配）等。'
      ],
      formula: {
        html: '<span class="fn">result</span> = <span class="fn">f</span>(A<sub>1</sub> → A<sub>2</sub> → … → A<sub>k</sub>),　<span class="sym">A</span><sub>i</sub> 各司其职',
        note: '多智能体把任务分解给多个角色 Agent 串行/并行协作，各自完成擅长的子任务。'
      }
    },
    example: {
      analogy: '写一篇深度报道：一个记者搜集素材、一个写手成稿、一个编辑审校润色、一个校对挑错——流水线各管一段，质量比一个人全包更高。',
      mini: '三个 Agent 协作：「研究员」检索资料 → 「写手」据此写初稿 → 「审校」挑错并让写手修改，最终输出一篇有据可查的文章。'
    },
    pros: ['分工明确，单任务质量更高', '可交叉验证（辩论/审核）减少错误', '模块化，易于替换与扩展'],
    cons: ['多 Agent 通信成本高、延迟大', '协作协议复杂，易出错', '整体可靠性仍受底层模型限制'],
    history: [
      { year: '2023', text: 'AutoGen（微软）、CrewAI 等多智能体框架发布。' },
      { year: '2023', text: '「辩论式」多智能体（如多模型投票）用于提升推理正确率。' },
      { year: '2024', text: 'MetaGPT 把软件开发 SOP 编码进多智能体协作。' },
      { year: '至今', text: '多智能体与工具、环境结合，走向自主任务完成。' }
    ],
    use: ['复杂内容生产（研究→写作→审核）', '软件开发的「虚拟团队」', '多视角辩论、交叉验证'],
    avoid: ['简单任务（单 Agent 足够，多 Agent 反增成本）', '对延迟/成本敏感的场景', '协作协议设计不当导致混乱'],
    learn: [
      '在演示里看<strong>研究员→写手→审校</strong>的消息传递。',
      '理解 <strong>流水线 vs 辩论 vs 层级</strong> 三种编排模式。',
      '对比 <strong>单 Agent vs 多 Agent</strong> 的适用场景。',
      '了解 AutoGen / CrewAI / LangGraph 等框架。'
    ],
    demo: { id: 'multiagent', title: '多智能体 · 协作演示', note: '三个角色 Agent 依次交接，看一段内容如何经「研究→写作→审校」逐步打磨成型。' }
  }
];
