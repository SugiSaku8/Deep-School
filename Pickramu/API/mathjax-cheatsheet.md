# MathJax 数式チートシート

## 基本的な使い方

- インライン数式: `$数式$`
- ディスプレイ数式: `$$数式$$`

## 基本的な数式

### 四則演算
- 足し算: `$a + b$`
- 引き算: `$a - b$`
- 掛け算: `$a \times b$` または `$a \cdot b$`
- 割り算: `$a \div b$` または `$\frac{a}{b}$`

### 分数
- 分数: `$\frac{分子}{分母}$`
- 連分数: `$\cfrac{分子}{分母}$`

### 指数・累乗
- 指数: `$a^b$`
- 添字: `$a_b$`
- 複数: `$a^{b+c}$` または `$a_{b+c}$`

### 根号
- 平方根: `$\sqrt{x}$`
- n乗根: `$\sqrt[n]{x}$`

## 特殊記号

### ギリシャ文字
- 小文字: `$\alpha$, $\beta$, $\gamma$, $\pi$, $\sigma$`
- 大文字: `$\Alpha$, $\Beta$, $\Gamma$, $\Pi$, $\Sigma$`

### 演算子
- 無限: `$\infty$`
- 微分: `$\frac{d}{dx}$`
- 偏微分: `$\frac{\partial}{\partial x}$`
- 積分: `$\int$`
- 定積分: `$\int_{a}^{b}$`
- 総和: `$\sum$`
- 総乗: `$\prod$`

### 関係演算子
- 等号: `$=$`
- 不等号: `$<$, $>$, $\leq$, $\geq$`
- 近似: `$\approx$`
- 同値: `$\equiv$`

## 行列・ベクトル

### 行列
```latex
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$
```

### 行列（角括弧）
```latex
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$
```

### ベクトル
- 太字: `$\mathbf{x}$`
- 矢印: `$\vec{x}$`

## 集合

### 集合記号
- 要素: `$\in$`
- 部分集合: `$\subset$`
- 和集合: `$\cup$`
- 積集合: `$\cap$`
- 空集合: `$\emptyset$`

### 数集合
- 実数: `$\mathbb{R}$`
- 整数: `$\mathbb{Z}$`
- 有理数: `$\mathbb{Q}$`
- 自然数: `$\mathbb{N}$`

## 論理記号

- 否定: `$\neg$`
- 論理積: `$\wedge$`
- 論理和: `$\vee$`
- 含意: `$\Rightarrow$`
- 同値: `$\Leftrightarrow$`
- 全称: `$\forall$`
- 存在: `$\exists$`

## その他の便利な記号

### 矢印
- 右矢印: `$\rightarrow$`
- 左矢印: `$\leftarrow$`
- 両矢印: `$\leftrightarrow$`
- 長い矢印: `$\longrightarrow$`

### 括弧
- 丸括弧: `$( )$`
- 角括弧: `$[ ]$`
- 波括弧: `$\{ \}$`
- 自動サイズ調整: `$\left( \right)$`

### 装飾
- 上線: `$\overline{x}$`
- 下線: `$\underline{x}$`
- ハット: `$\hat{x}$`
- チルダ: `$\tilde{x}$`

## 応用例

### 二次方程式の解の公式
```latex
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

### テイラー展開
```latex
$$
f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n
$$
```

### 行列式
```latex
$$
\begin{vmatrix}
a & b \\
c & d
\end{vmatrix} = ad - bc
$$
```

### 連立方程式
```latex
$$
\begin{cases}
ax + by = c \\
dx + ey = f
\end{cases}
$$
``` 