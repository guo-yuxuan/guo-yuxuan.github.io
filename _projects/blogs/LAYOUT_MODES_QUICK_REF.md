# 页面布局模式快速参考 ⚡

## 🎯 四种模式

### flexible（灵活）⭐ 推荐
```yaml
card_layout: flexible
```
✅ 标题封面居中无卡片，正文完全自由控制  
📍 推荐用于：所有项目，最灵活！

---

### separated（分离）
```yaml
card_layout: separated
```
✅ 标题、封面、链接、内容 → 各自独立卡片  
📍 推荐用于：传统学术论文、正式项目

---

### compact（紧凑）
```yaml
card_layout: compact
```
✅ (标题+封面+链接) 合并 → 内容独立  
📍 推荐用于：技术文档、长教程

---

### single（单一）
```yaml
card_layout: single
```
✅ 所有内容在一个大卡片中  
📍 推荐用于：简短介绍、打印PDF

---

## 📊 视觉对比

```
flexible: ⭐
  【标题】(居中)
  【封面】(居中)
  【链接】(居中)
普通文字...
┌────┐
│卡片│(你自己控制)
└────┘
普通文字...

separated:
┌────┐
│标题│
└────┘
┌────┐
│封面│
└────┘
┌────┐
│链接│
└────┘
┌────┐
│内容│
└────┘

compact:
┌────┐
│标题│
│封面│
│链接│
└────┘
┌────┐
│内容│
└────┘

single:
┌────┐
│标题│
│封面│
│链接│
│内容│
└────┘
```

---

## 🚀 快速决策

| 场景 | 推荐 |
|------|------|
| 不确定？ | `flexible` ⭐ |
| 最大自由度 | `flexible` |
| DataWink风格 | `flexible` |
| 传统论文 | `separated` |
| 技术文档 | `compact` |
| 短内容 | `single` |
| 打印PDF | `single` |

---

## 💡 配置位置

在 Markdown 文件顶部的 Front Matter 中：

```yaml
---
layout: blog
title: "Your Title"
card_layout: separated  # 👈 在这里设置
---
```

---

📖 **详细文档**: `PAGE_LAYOUT_GUIDE.md`

