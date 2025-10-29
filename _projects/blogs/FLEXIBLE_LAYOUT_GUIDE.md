# Flexible 布局模式使用指南 ✨

## 概述

**flexible** 模式是最自由灵活的布局模式，让你完全掌控页面的卡片布局：

- ✅ **标题和封面居中显示，无卡片包裹**
- ✅ **正文内容完全自由控制**
- ✅ **自己决定哪些内容成组卡片**
- ✅ **文本保持左对齐**

这是最接近 **DataWink** 风格的布局模式！

---

## 🎯 核心特点

### 1. 标题区域 - 居中无卡片

标题、描述、作者信息都**居中显示**，没有卡片背景：

```
        【标题】
      【描述文字】
    【作者 - 机构】
      【日期信息】
```

**视觉效果：**
- 干净、简洁
- 突出标题
- 学术风格

---

### 2. 封面图 - 居中无卡片

封面图片**居中显示**，没有卡片包裹：

```
    ┌───────────┐
    │   封面图   │
    └───────────┘
```

**视觉效果：**
- 图片更突出
- 无多余装饰
- 类似论文首页

---

### 3. 链接区域 - 居中显示

相关链接**居中排列**：

```
   arXiv  Paper  GitHub  Demo
```

**视觉效果：**
- 简洁的文字链接
- 居中对齐
- 不占用太多空间

---

### 4. 正文内容 - 完全自由

**这是关键！** 正文内容**不会自动包裹在卡片中**，你可以：

- ✅ 选择哪些段落放在卡片里
- ✅ 选择哪些段落直接显示
- ✅ 自由组合多个卡片
- ✅ 控制卡片宽度和布局

**文本对齐：左对齐**（不是居中）

---

## 📝 配置方法

在 Front Matter 中设置：

```yaml
---
layout: blog
title: "你的项目标题"
card_layout: flexible  # 👈 关键设置
---
```

就这么简单！

---

## 🎨 使用示例

### 示例 1：基础使用

```yaml
---
layout: blog
title: "DataWink: Reusing SVG Visualizations"
description: "Using LMMs to transform visualizations"
cover: /assets/images/teaser.png
card_layout: flexible

authors_with_affiliations:
  - name: Your Name
    affiliation: Your University

links:
  arXiv: https://arxiv.org/abs/xxx
  Paper: https://example.com/paper.pdf
---

## Motivation

这一段内容**没有卡片**，直接显示在页面上，文本左对齐。

<div class="content-card">

## Core Features

这一段内容**有卡片包裹**，是一个独立的白色卡片。

你可以在卡片中：
- 添加任何 Markdown 内容
- 使用标题、列表、图片
- 完全自由

</div>

## Another Section

这一段又**没有卡片**了，直接显示。

<div class="content-card">

## Yet Another Card

这又是一个**独立卡片**。

</div>
```

---

### 示例 2：多个卡片组合

```markdown
## Introduction

引言部分，无卡片，直接显示。

<div class="content-card">

## Method

方法部分，在一个卡片中。

### Step 1
详细说明...

### Step 2
详细说明...

</div>

<div class="content-card">

## Results

结果部分，另一个独立卡片。

</div>

## Discussion

讨论部分，无卡片，直接显示。
```

---

### 示例 3：使用卡片宽度控制

```markdown
<div class="content-card card-narrow">

## 重点内容

这个卡片比较窄（600px），内容居中，更突出。

</div>

<div class="content-card">

## 常规内容

这是标准宽度的卡片。

</div>

<div class="content-card card-wide">

## 宽内容

这个卡片比较宽（1000px），适合展示大图表。

</div>
```

---

### 示例 4：卡片并排布局

```markdown
<div class="card-row">

<div class="content-card card-half">

### Before

优化前的情况...

</div>

<div class="content-card card-half">

### After

优化后的情况...

</div>

</div>
```

---

## 🎯 完整页面结构示例

```
┌─────────────────────────────────┐
│                                 │
│          【标题居中】            │
│        【描述居中】              │
│      【作者信息居中】            │
│                                 │
└─────────────────────────────────┘
           ⬇️
┌─────────────────────────────────┐
│      【封面图居中】              │
└─────────────────────────────────┘
           ⬇️
     【链接居中排列】
           ⬇️
┌─────────────────────────────────┐
│ ## 章节标题（无卡片，左对齐）    │
│ 这段文字直接显示，无卡片背景     │
└─────────────────────────────────┘
           ⬇️
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │  ## 卡片内的内容（左对齐） │  │
│  │  这段文字在卡片中         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
           ⬇️
┌─────────────────────────────────┐
│ ## 另一个章节（无卡片，左对齐）  │
└─────────────────────────────────┘
```

---

## 💡 设计理念

### 为什么选择 flexible 模式？

1. **最大灵活性**
   - 完全控制页面结构
   - 自由决定卡片位置
   - 适应各种内容类型

2. **视觉清晰**
   - 标题居中，醒目
   - 卡片分隔，层次清晰
   - 无卡片部分流畅阅读

3. **学术风格**
   - 类似论文首页
   - 专业正式
   - 适合研究项目

4. **内容优先**
   - 不受固定结构限制
   - 根据内容决定布局
   - 更自然的阅读流

---

## 🆚 与其他模式对比

### vs. separated 模式

| 特性 | separated | flexible |
|------|-----------|----------|
| 标题 | 在卡片中 | 居中无卡片 |
| 封面 | 在卡片中 | 居中无卡片 |
| 正文 | 全部在一个卡片 | 自由控制 |
| 灵活度 | 低 | **高** ✨ |

### vs. compact 模式

| 特性 | compact | flexible |
|------|---------|----------|
| 标题 | 在大卡片中 | 居中无卡片 |
| 封面 | 在大卡片中 | 居中无卡片 |
| 正文 | 全部在一个卡片 | 自由控制 |
| 视觉效果 | 紧凑 | 开阔 |

### vs. single 模式

| 特性 | single | flexible |
|------|--------|----------|
| 全部内容 | 一个大卡片 | 分离+自由 |
| 标题 | 在卡片中 | 居中无卡片 |
| 灵活度 | 最低 | **最高** ✨ |

---

## 🎨 使用场景

### ✅ 最适合 flexible 模式的场景

1. **学术论文展示**
   - 标题居中，正式
   - 不同章节独立卡片
   - 类似 arXiv 风格

2. **研究项目介绍**
   - 清晰的章节划分
   - 部分内容需要突出
   - 灵活的内容组织

3. **技术博客**
   - 某些部分需要卡片强调
   - 其他部分流畅阅读
   - 自由的排版风格

4. **作品集展示**
   - 标题和封面突出
   - 不同作品独立卡片
   - 灵活的布局组合

---

## 📋 最佳实践

### ✅ 推荐做法

1. **标题和封面留给系统**
   - 不要在正文开头重复标题
   - 不要在正文中再放封面图

2. **合理使用卡片**
   - 重要内容放在卡片中
   - 过渡性内容直接显示
   - 保持视觉节奏

3. **章节标题不要卡片**
   - `## 章节标题` 直接写
   - 章节内容用卡片包裹
   - 保持清晰的层次

4. **组合使用宽度控制**
   - 重点内容用 `card-narrow`
   - 对比内容用 `card-half`
   - 数据展示用 `card-wide`

### ❌ 避免做法

1. **不要所有内容都用卡片**
   - 会失去 flexible 的意义
   - 不如直接用 separated 模式

2. **不要完全不用卡片**
   - 页面会显得松散
   - 缺少视觉焦点

3. **不要嵌套卡片**
   - 卡片里不要再放卡片
   - 会导致视觉混乱

4. **不要过度居中**
   - 正文内容保持左对齐
   - 只有标题、封面、链接居中

---

## 🔧 高级技巧

### 技巧 1：章节分组

```markdown
## Part 1: Introduction

这是引言部分的介绍文字，无卡片。

<div class="content-card">

### 1.1 Background

背景内容在卡片中...

### 1.2 Motivation

动机内容也在同一个卡片中...

</div>

## Part 2: Method

方法部分的介绍文字，无卡片。

<div class="content-card">

### 2.1 Algorithm

算法描述...

</div>
```

---

### 技巧 2：重点突出

```markdown
## Introduction

普通介绍文字...

<div class="content-card card-highlight">

### 🌟 Core Contribution

这是核心贡献，使用高亮卡片突出显示！

</div>

后续内容...
```

---

### 技巧 3：对比展示

```markdown
## Comparison

<div class="card-row">

<div class="content-card card-half">

### ❌ Traditional Approach

- 缺点 1
- 缺点 2

</div>

<div class="content-card card-half">

### ✅ Our Approach

- 优点 1
- 优点 2

</div>

</div>
```

---

## 📊 实战案例

### 案例 1：学术论文（DataWink 风格）

```yaml
---
layout: blog
title: "DataWink: Reusing SVG Visualizations"
card_layout: flexible
---

## Motivation

Large Multimodal Models (LMMs) show promise...

<div class="content-card">

## Why General-Purpose LMM Is Not a Panacea?

While LMMs excel at many tasks...

![Example](example.png)

</div>

## Our Work: DataWink

We propose a pipeline...

<div class="content-card">

## Core Idea

The key innovation is...

</div>
```

---

### 案例 2：技术项目

```yaml
---
layout: blog
title: "React Performance Toolkit"
card_layout: flexible
---

## Overview

A comprehensive toolkit for React optimization.

<div class="content-card">

## Features

### 🚀 Fast
Performance improvements...

### 🎨 Beautiful
Modern UI components...

</div>

<div class="content-card">

## Getting Started

```bash
npm install react-perf-toolkit
```

</div>

## Documentation

Visit our docs at...
```

---

## 📱 响应式行为

### 桌面端
- 标题居中，字号 2.8rem
- 封面图最大 1000px
- 卡片保持设定宽度

### 移动端（< 768px）
- 标题居中，字号 2rem
- 封面图 100% 宽度
- 所有卡片 100% 宽度
- 保持良好阅读体验

---

## 🎓 学习路径

1. **入门** - 先用一两个卡片
2. **进阶** - 尝试不同宽度的卡片
3. **高级** - 使用并排布局
4. **精通** - 自由组合创造独特布局

---

## 总结

**flexible** 模式是最灵活强大的布局选择：

- 🎯 **标题封面居中** - 优雅专业
- ✨ **完全自由控制** - 随心所欲
- 📖 **左对齐正文** - 舒适阅读
- 🎨 **无限可能** - 创意无限

如果你想要最大的设计自由度，flexible 是最佳选择！

---

*建议：先从简单开始，逐步尝试更复杂的布局组合。*

