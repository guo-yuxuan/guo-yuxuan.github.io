# 页面卡片布局配置指南 🎴

## 概述

通过设置 `card_layout` 参数，你可以完全控制页面主要部分（标题、封面、链接、内容）的卡片组合方式。

## 🎯 四种布局模式

### 1. separated - 分离模式（默认）

每个主要部分都是独立的卡片，视觉层次最清晰。

#### 配置

```yaml
---
layout: blog
card_layout: separated  # 或不设置，默认即为此模式
---
```

#### 结构

```
┌────────────────────────────┐
│ 📝 标题卡片                │
│  - 项目标题                │
│  - 描述                    │
│  - 作者信息                │
│  - 日期/阅读时间           │
└────────────────────────────┘
       ⬇️
┌────────────────────────────┐
│ 🖼️ 封面卡片                │
│  - Teaser 图片             │
└────────────────────────────┘
       ⬇️
┌────────────────────────────┐
│ 🔗 链接卡片                │
│  - arXiv / Paper / GitHub  │
└────────────────────────────┘
       ⬇️
┌────────────────────────────┐
│ 📄 内容卡片                │
│  - 主要文章内容            │
└────────────────────────────┘
```

#### 适用场景
- ✅ 正式的学术论文展示
- ✅ 需要清晰区分各部分的项目
- ✅ 封面图很重要需要突出显示
- ✅ 默认推荐布局

#### 视觉效果
- 每个卡片独立，间距明显
- 封面图作为独立卡片，没有 padding，图片占满整个卡片宽度
- 最清晰的视觉层次

---

### 2. compact - 紧凑模式

标题、封面、链接合并在一个卡片中，内容独立。类似传统论文首页。

#### 配置

```yaml
---
layout: blog
card_layout: compact
---
```

#### 结构

```
┌────────────────────────────┐
│ 📝 标题                    │
│  - 项目标题                │
│  - 描述                    │
│  - 作者信息                │
│  - 日期/阅读时间           │
│ ────────────────────────   │
│ 🖼️ 封面图片                │
│ ────────────────────────   │
│ 🔗 相关链接                │
│  - arXiv / Paper / GitHub  │
└────────────────────────────┘
       ⬇️
┌────────────────────────────┐
│ 📄 主要内容                │
└────────────────────────────┘
```

#### 适用场景
- ✅ 学术论文风格
- ✅ 需要紧凑布局的长文章
- ✅ 标题、封面、链接需要一起展示
- ✅ 减少卡片数量，更简洁

#### 视觉效果
- 上部是综合信息卡片（标题+封面+链接）
- 封面图会延伸到卡片边缘（通过负边距实现）
- 下部是纯内容卡片
- 更紧凑，卡片总数更少

---

### 3. single - 单一模式

所有内容（标题、封面、链接、正文）都在一个大卡片中。

#### 配置

```yaml
---
layout: blog
card_layout: single
---
```

#### 结构

```
┌────────────────────────────┐
│ 📝 标题                    │
│  - 项目标题                │
│  - 描述                    │
│  - 作者信息                │
│  - 日期/阅读时间           │
│ ────────────────────────   │
│ 🖼️ 封面图片                │
│ ────────────────────────   │
│ 🔗 相关链接                │
│  - arXiv / Paper / GitHub  │
│ ────────────────────────   │
│ 📄 主要内容                │
│  - 全部文章内容            │
│  - ...                     │
└────────────────────────────┘
```

#### 适用场景
- ✅ 短文章或简短项目介绍
- ✅ 想要最简洁的单一页面感觉
- ✅ 打印或导出 PDF 时保持完整性
- ✅ 类似传统博客的单页布局

#### 视觉效果
- 只有一个大卡片
- 所有内容在同一个白色背景区域
- 最简洁，没有卡片间的间隔
- 适合打印

---

### 4. flexible - 灵活模式 ⭐ 推荐

标题和封面**居中显示无卡片**，正文内容**完全自由控制**。

#### 配置

```yaml
---
layout: blog
card_layout: flexible
---
```

#### 结构

```
        ┌────────┐
        │ 📝 标题│ (居中，无卡片)
        │ 作者   │
        └────────┘
        ┌────────┐
        │ 🖼️ 封面│ (居中，无卡片)
        └────────┘
        🔗 链接  (居中)
           ⬇️
## 章节标题 (无卡片，左对齐)
普通文字内容...
           ⬇️
┌────────────────────────────┐
│ 卡片内容 (左对齐)           │
│ - 你选择包裹的部分          │
└────────────────────────────┘
           ⬇️
## 另一个章节 (无卡片，左对齐)
更多文字...
```

#### 适用场景
- ✅ **最大灵活度** - 完全自由控制
- ✅ 学术论文（DataWink 风格）
- ✅ 需要自定义卡片组合
- ✅ 标题需要居中突出
- ✅ 部分内容需要卡片，部分不需要

#### 视觉效果
- 标题和封面居中，优雅醒目
- 正文左对齐，舒适阅读
- 自己选择哪些内容成卡片
- **最灵活，最自由** ✨

#### 使用方法

在正文中，你可以自己决定哪些内容需要卡片：

```markdown
## 章节标题

这段文字无卡片，直接显示。

<div class="content-card">

### 子章节

这段文字在卡片中。

</div>

这段又无卡片了。
```

---

## 📖 完整示例

### 示例 1：学术论文（separated 模式）

```yaml
---
layout: blog
title: "DataWink: Reusing and Adapting SVG-based Visualizations"
description: "Using LMMs to transform SVG visualizations into reusable templates"
cover: /assets/images/teaser_datawink.png

authors_with_affiliations:
  - name: Liwenhan Xie
    affiliation: HKUST
  - name: Yanna Lin
    affiliation: HKUST
  - name: Huamin Qu
    affiliation: HKUST

card_layout: separated  # 清晰分层，标准学术风格

links:
  arXiv: https://arxiv.org/abs/xxx
  Paper: https://example.com/paper.pdf
  Video: https://youtube.com/watch?v=xxx
  
updated_date: "October 24, 2025"
---

## Motivation

Your content here...
```

---

### 示例 2：技术项目（compact 模式）

```yaml
---
layout: blog
title: "React Performance Optimization Toolkit"
description: "A comprehensive toolkit for optimizing React applications"
cover: /assets/images/react_toolkit.jpg

authors_with_affiliations:
  - name: Your Name
    affiliation: Your Company

card_layout: compact  # 紧凑布局，适合技术文档

links:
  GitHub: https://github.com/username/toolkit
  Demo: https://demo.example.com
  Docs: https://docs.example.com
---

## Overview

Your content here...
```

---

### 示例 3：简短介绍（single 模式）

```yaml
---
layout: blog
title: "Quick Project Introduction"
description: "A brief overview of our new tool"
cover: /assets/images/tool_screenshot.png

authors:
  - Your Name

card_layout: single  # 简短内容，单页展示

links:
  GitHub: https://github.com/username/tool
  Demo: https://demo.example.com
---

## What is it?

Your content here...
```

---

## 🎨 布局模式对比

| 特性 | separated | compact | single |
|------|-----------|---------|--------|
| 卡片数量 | 4个 | 2个 | 1个 |
| 视觉层次 | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| 紧凑程度 | 低 | 中 | 高 |
| 适合长文 | ✅ | ✅ | ❌ |
| 学术风格 | ✅ | ✅ | ❌ |
| 简洁感 | ❌ | ✅ | ✅ |
| 打印友好 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

---

## 💡 选择建议

### 选择 separated 如果：
- 📄 正式的学术论文或研究项目
- 🖼️ 封面图很重要，需要突出显示
- 📊 需要清晰的信息层次
- 🎯 这是你的默认选择，适合大多数情况

### 选择 compact 如果：
- 📚 想要学术论文的经典布局
- 🎨 需要更紧凑的视觉效果
- 🔗 标题、封面、链接关联性强
- 📝 长文章，但不想太多卡片间隔

### 选择 single 如果：
- 📋 内容较短，一页可以展示完
- 🖨️ 需要打印或导出 PDF
- ✨ 想要最简洁的单页感觉
- 📖 类似传统博客的阅读体验

---

## 🔧 技术细节

### 实现原理

布局系统通过 Liquid 模板条件判断实现：

```liquid
{% assign card_layout = page.card_layout | default: "separated" %}

{% if card_layout == "single" %}
  <!-- 单一卡片布局 -->
{% elsif card_layout == "compact" %}
  <!-- 紧凑布局 -->
{% else %}
  <!-- 默认分离布局 -->
{% endif %}
```

### 封面图处理差异

- **separated 模式**：封面图在独立的 `teaser-card` 中，无 padding
- **compact 模式**：封面图在标题卡片内，使用负边距延伸到边缘
- **single 模式**：封面图在大卡片内，正常间距

### 响应式行为

所有三种模式在移动端（< 768px）都会：
- 自动调整内边距
- 保持布局结构
- 优化触摸体验

---

## ⚙️ 高级配置

### 与宽度控制结合

如果你在内容中使用了自定义卡片宽度，它们会正常工作：

```yaml
---
card_layout: compact
---

<div class="content-card card-narrow">
  这个内容会居中显示，最大宽度 600px
</div>
```

### 动态切换

你可以为不同的博客文章使用不同的布局：

```
_projects/
  ├── paper1_blog.md  (card_layout: separated)
  ├── tutorial_blog.md (card_layout: compact)
  └── quick_intro_blog.md (card_layout: single)
```

---

## 📝 最佳实践

### ✅ 推荐做法

1. **默认使用 separated** - 除非有特殊需求
2. **学术论文用 separated 或 compact** - 专业正式
3. **简短介绍用 single** - 简洁高效
4. **保持一致性** - 同类型项目使用相同布局
5. **先预览再发布** - 确认视觉效果符合预期

### ❌ 避免做法

1. **不要频繁切换** - 保持项目风格统一
2. **长文不用 single** - 会显得过于拥挤
3. **重要封面图不用 single** - separated 能更好突出
4. **不确定就用默认** - separated 是最安全的选择

---

## 🎓 实战案例

### 案例 1：研究论文网站

所有论文使用 **separated** 模式：

```yaml
# paper1_blog.md
card_layout: separated

# paper2_blog.md  
card_layout: separated

# paper3_blog.md
card_layout: separated
```

**优势**：统一、专业、易于维护

---

### 案例 2：个人技术博客

根据内容长度选择：

```yaml
# long_tutorial.md （长教程）
card_layout: compact

# quick_tip.md （快速提示）
card_layout: single

# project_showcase.md （项目展示）
card_layout: separated
```

**优势**：灵活、适配不同内容类型

---

### 案例 3：产品文档站

全站使用 **compact** 模式：

```yaml
# 所有文档页面
card_layout: compact
```

**优势**：紧凑、专业、技术感强

---

## 🔍 故障排除

### Q: 设置了 card_layout 但没有效果？

**A:** 检查：
1. 确保在 Front Matter 中设置（`---` 之间）
2. 拼写是否正确（`card_layout` 不是 `cardLayout`）
3. 值是否正确（`separated`、`compact` 或 `single`）
4. 重新构建网站（`bundle exec jekyll serve`）

### Q: compact 模式下封面图显示不正常？

**A:** 这是正常的，compact 模式下封面图会延伸到卡片边缘。如果你更喜欢原来的样式，使用 `separated` 模式。

### Q: 可以自定义新的布局模式吗？

**A:** 可以！编辑 `_layouts/blog.html`，添加新的条件分支：

```liquid
{% elsif card_layout == "custom" %}
  <!-- 你的自定义布局 -->
{% endif %}
```

---

## 📊 快速决策表

| 我的项目是... | 推荐布局 |
|--------------|---------|
| 🎓 学术论文 | `separated` |
| 📚 技术文档 | `compact` |
| 🚀 产品介绍 | `separated` |
| 📝 长教程 | `compact` |
| ⚡ 快速说明 | `single` |
| 🖼️ 作品展示 | `separated` |
| 📰 新闻公告 | `single` |
| 🔬 研究报告 | `separated` |

---

## 总结

卡片布局配置系统提供了三种精心设计的布局模式：

- 🎯 **separated** - 清晰专业，默认推荐
- 📦 **compact** - 紧凑高效，学术风格
- 📄 **single** - 简洁统一，适合短内容

只需在 Front Matter 中添加一行配置，就能完全改变页面的视觉结构！

---

*提示：不确定用哪个？试试默认的 `separated` 模式，它适合 90% 的场景。*

