# 项目博客系统使用指南

## 📖 简介

这是一个为项目详细介绍而设计的博客系统。它采用传统的博客阅读体验，专注于内容展示，提供优雅的图文排版和丰富的媒体支持。

## ✨ 特性

- **🎨 优雅设计** - 专业的博客阅读界面，采用 Merriweather 和 Open Sans 字体
- **📱 完全响应式** - 完美适配桌面、平板和手机
- **🖼️ 丰富媒体** - 支持图片、视频、代码、数学公式
- **📝 Markdown 编写** - 使用标准 Markdown 语法快速创作
- **🚀 易于使用** - 只需创建 .md 文件即可
- **🎯 专注阅读** - 优化的排版和视觉层级

## 🚀 快速开始

### 步骤 1：创建博客文件

在 `_projects/YYYY/` 目录下创建新的 Markdown 文件：

```bash
# 复制模板
cp _projects/BLOG_TEMPLATE.md _projects/2024/24_my_project_blog.md
```

### 步骤 2：编辑元信息

打开文件，填写 Front Matter（文件顶部的 YAML 配置）：

```yaml
---
layout: blog                    # 必须是 blog
title: "我的项目名称"           # 项目标题
date: 2024-10-24 00:00:00 +0800 # 发布日期
description: "项目简短描述"     # 副标题
cover: /assets/images/covers/my_cover.jpg  # 封面图
authors:
  - Your Name                   # 作者列表
tags:
  - Web Development            # 标签
  - React
reading_time: "5分钟"           # 阅读时间
has_blog: true                  # 启用博客
is_blog_page: true             # 防止在项目列表中重复显示（重要！）

# 可选：控制元信息显示（默认全部显示）
show_date: true                # 是否显示日期（默认true）
show_reading_time: true        # 是否显示阅读时间（默认true）
show_authors: true             # 是否显示作者信息（默认true）
show_affiliations: true        # 是否显示作者单位（默认true，需要先启用show_authors）

links:                          # 相关链接
  GitHub: https://github.com/xxx
  Demo: https://demo.xxx.com
---
```

### 步骤 3：编写内容

在 `---` 分隔符下方用 Markdown 编写内容：

```markdown
## 项目概述

这里写项目介绍...

## 核心功能

### 功能一

描述功能...

![截图]({{ '/assets/images/screenshot.jpg' | relative_url }})
```

### 步骤 4：启用博客链接

在对应的项目卡片文件中（例如 `24_my_project.md`）添加：

```yaml
has_blog: true
blog_url: /projects/24-my-project-blog/  # 注意：下划线要改成破折号！
```

**重要提示：** 
- Jekyll 会自动将文件名中的下划线 `_` 转换为破折号 `-`
- 例如：文件 `24_my_project_blog.md` 的 URL 是 `/projects/24-my-project-blog/`
- `blog_url` 的格式是 `/projects/文件名（不含.md，下划线改破折号）/`

### 步骤 5：预览

启动 Jekyll 服务器预览：

```bash
bundle exec jekyll serve
```

访问 `http://localhost:4000/projects` 查看效果。

## 📝 内容编写指南

### 基础 Markdown

```markdown
# 一级标题
## 二级标题
### 三级标题

**粗体** *斜体* `代码`

- 无序列表
  - 子项目

1. 有序列表
2. 第二项

[链接](https://example.com)

> 引用文字
```

### 插入图片

```markdown
![图片描述]({{ '/assets/images/your-image.jpg' | relative_url }})
```

图片会自动：
- 居中显示
- 添加圆角和阴影
- 适配移动设备

### 嵌入视频

**YouTube 视频：**

```html
<div class="video-wrapper">
    <iframe src="https://www.youtube.com/embed/VIDEO_ID" allowfullscreen></iframe>
</div>
```

**本地视频：**

```html
<div class="video-wrapper">
    <video controls poster="{{ '/assets/images/poster.jpg' | relative_url }}">
        <source src="/assets/videos/demo.mp4" type="video/mp4">
        您的浏览器不支持视频播放。
    </video>
</div>
```

### 图片画廊

```html
<div class="image-gallery">
    <img src="{{ '/assets/images/img1.jpg' | relative_url }}" alt="描述1">
    <img src="{{ '/assets/images/img2.jpg' | relative_url }}" alt="描述2">
    <img src="{{ '/assets/images/img3.jpg' | relative_url }}" alt="描述3">
</div>
```

### 代码块

````markdown
```javascript
function hello() {
  console.log('Hello World');
}
```

```python
def hello():
    print("Hello World")
```
````

### 表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |
```

### 数学公式

**行内公式：**

```markdown
根据公式 $E = mc^2$ 可知...
```

**块级公式：**

```markdown
$$
\int_{0}^{\infty} e^{-x} dx = 1
$$
```

## 🎨 设计规范

### 标题层级

- **H1** - 文章标题（自动生成，不要在内容中使用）
- **H2** - 主要章节（如：项目概述、核心功能）
- **H3** - 子章节（如：功能一、功能二）
- **H4** - 更细的分类

### 内容结构建议

推荐的文章结构：

```markdown
## 项目概述
[简要介绍项目]

## 背景与动机
[为什么做这个项目]

## 核心功能
### 功能一
### 功能二
### 功能三

## 技术实现
### 技术栈
### 架构设计
### 关键代码

## 效果展示
[截图、视频]

## 项目成果
[数据、反馈]

## 经验总结
[心得体会]

## 未来计划
[后续规划]
```

### 图片规范

**封面图片：**
- 推荐尺寸：1200x600px
- 格式：JPG 或 PNG
- 大小：< 500KB

**内容图片：**
- 最大宽度：800px（会自动缩放）
- 格式：JPG 或 PNG
- 使用描述性的 alt 文本

## 🔧 高级功能

### 控制元信息显示

你可以选择性地隐藏某些元信息（日期、阅读时间、作者、单位等）。

**示例 1：隐藏日期和阅读时间**

```yaml
---
layout: blog
title: "项目标题"
show_date: false          # 隐藏日期
show_reading_time: false  # 隐藏阅读时间
---
```

**示例 2：只显示作者名字，不显示单位**

```yaml
---
layout: blog
title: "项目标题"
authors_with_affiliations:
  - name: Yuxuan Guo
    affiliation: MIT
  - name: Collaborator
    affiliation: Stanford
show_affiliations: false  # 隐藏单位信息
---
```

**示例 3：完全隐藏作者信息**

```yaml
---
layout: blog
title: "项目标题"
show_authors: false  # 隐藏所有作者信息
---
```

**可用配置项：**

| 配置项 | 默认值 | 说明 |
|-------|--------|------|
| `show_date` | `true` | 是否显示发布日期 |
| `show_reading_time` | `true` | 是否显示阅读时间 |
| `show_authors` | `true` | 是否显示作者信息 |
| `show_affiliations` | `true` | 是否显示作者单位（需要先启用 `show_authors`） |

**注意：** 这些配置项默认值都是 `true`，只有显式设置为 `false` 时才会隐藏对应内容。

### 自定义样式

如需自定义样式，可以在内容中添加内联样式：

```html
<div style="background: #f0f0f0; padding: 20px; border-radius: 8px;">
    自定义内容区域
</div>
```

### 响应式图片

```html
<picture>
    <source media="(max-width: 768px)" srcset="/assets/images/mobile.jpg">
    <img src="/assets/images/desktop.jpg" alt="描述">
</picture>
```

### 锚点链接

```markdown
## 章节标题 {#custom-id}

[跳转到章节](#custom-id)
```

## 📁 文件组织

```
_projects/
├── BLOG_TEMPLATE.md          # 博客模板
├── README_BLOG.md            # 本文档
└── 2024/
    ├── 24_project1.md        # 项目卡片
    ├── 24_project1_blog.md   # 项目博客
    ├── 24_project2.md
    └── 24_project2_blog.md

assets/
├── images/
│   ├── covers/               # 封面图片
│   ├── screenshots/          # 截图
│   └── gallery/              # 画廊图片
└── videos/                   # 视频文件
```

## 💡 最佳实践

### 内容编写

1. **开门见山** - 在前两段明确项目价值
2. **使用小标题** - 帮助读者快速定位内容
3. **配图说明** - 每张图片都应该有意义
4. **保持简洁** - 避免冗长的段落
5. **突出重点** - 使用列表、引用、粗体强调关键信息

### 性能优化

1. **压缩图片** - 使用 TinyPNG 等工具压缩
2. **合理尺寸** - 不要上传过大的原图
3. **懒加载** - 大型图片考虑懒加载
4. **视频外链** - 大型视频建议使用 YouTube 等平台

### SEO 优化

1. **标题清晰** - 使用描述性的标题
2. **描述完整** - description 字段要写详细
3. **图片 alt** - 所有图片都要有 alt 文本
4. **合理标签** - 使用相关的 tags

## 🐛 常见问题

### Q: 博客链接不显示？

**A:** 确保在项目卡片文件中设置了 `has_blog: true`

### Q: 图片不显示？

**A:** 检查：
1. 图片路径是否正确
2. 使用了 `| relative_url` 过滤器
3. 图片文件确实存在

### Q: 数学公式不渲染？

**A:** 确保：
1. 使用了 `$...$` 或 `$$...$$` 语法
2. LaTeX 语法正确
3. 页面加载了 KaTeX 库（已内置）

### Q: 视频无法播放？

**A:** 检查：
1. 使用了正确的 `video-wrapper` 类
2. 视频 URL 正确
3. 视频格式支持（推荐 MP4）

### Q: 样式不正常？

**A:** 尝试：
1. 清除浏览器缓存
2. 重启 Jekyll 服务器
3. 检查是否有自定义 CSS 冲突

## 📚 示例

查看完整示例：

- 📄 模板文件：`_projects/BLOG_TEMPLATE.md`
- 🎨 示例博客：`_projects/2024/24_example_project_blog.md`
- 🔗 项目卡片：`_projects/2024/24_example_project.md`

## 🤝 获取帮助

如有问题或建议：

1. 查看示例文件
2. 阅读本文档
3. 检查 Jekyll 日志输出
4. 在项目仓库提 Issue

## 📄 许可

本博客系统随主项目一起发布，遵循相同的许可协议。

---

**祝你创作愉快！** ✨

如果这个博客系统对你有帮助，欢迎给项目加星 ⭐

