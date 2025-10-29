---
layout: blog
title: "Currency Design"
description: "Course Project - DESI11179 Introduction to Digital Design (Fall 2022, UoE)"
cover: /assets/images/projects/currency design/cover.jpg
authors_with_affiliations:
  - name: Yuxuan Guo
  - name: Chloé Keeble
  - name: Qin Jin

has_blog: true
is_blog_page: true  # 标记为博客页面，不在项目列表中显示

# 可选：控制元信息显示（默认全部显示，只有设为false才隐藏）
show_date: false             # 是否显示日期
show_reading_time: false    # 是否显示阅读时间
show_authors: true           # 是否显示作者信息
show_affiliations: false   # 是否显示作者单位

# 卡片布局模式选择：
# - separated: 每个部分独立卡片（默认）
# - compact: 标题+封面+链接合并，内容独立
# - single: 所有内容在一个卡片中
# - flexible: 标题和封面居中无卡片，正文自由控制卡片（推荐！）
card_layout: flexible

---

<div class="content-card">
This website features a fun platform for young learners to discover the basics of spending & saving money, manage personal finances, understand some world currencies, and most importantly - enjoy these activities in an interactive and engaging way.
</div>

## 核心功能介绍

> 💡 **提示**：在 flexible 模式下，这一段内容没有被包裹在卡片中，直接显示。你可以自由选择哪些内容需要卡片包裹！

<div class="content-card">

### 响应式设计

本项目采用了现代化的响应式设计理念，确保在各种设备上都能提供最佳的阅读体验。无论是27寸的显示器，还是5寸的手机屏幕，内容都会自动调整到最适合阅读的状态。

我们特别优化了移动端的体验，包括：

- 触摸友好的交互设计
- 适配手机屏幕的字体大小
- 优化的图片加载策略
- 流畅的滚动体验

</div>

<div class="content-card">

### 丰富的内容类型

博客系统支持多种内容类型的展示，让你可以用最合适的方式表达想法。

**文字内容**方面，我们支持：

- 多级标题结构
- **粗体**、*斜体*等文字样式
- 段落、列表、表格等基础排版
- 引用块和分割线

**多媒体内容**方面，支持：

1. 高质量图片展示
2. 在线视频嵌入
3. 图片画廊展示
4. 响应式视频播放

**技术内容**方面，提供：

- 代码高亮显示
- 数学公式渲染
- 表格数据展示
- 技术文档排版

</div>

### 优秀的可读性

阅读体验是我们设计的重中之重：

- 使用专业的衬线字体（Merriweather）展示正文
- 合理的行高和字间距
- 舒适的内容宽度
- 清晰的视觉层级

### 卡片式布局 🎴

博客采用全新的卡片式布局，支持**自定义卡片尺寸和布局**！

#### 灵活的卡片布局系统

你可以：
- 控制每个卡片的宽度（全宽、半宽、1/3宽等）
- 让多个卡片并排显示
- 创建网格布局
- 自由组合各种布局

#### 示例 1：两个卡片并排

<div class="card-row">

<div class="content-card card-half">

##### 🎨 左侧卡片

这是一个**半宽卡片**，与右侧卡片并排显示。

适合：
- 对比展示
- 功能列表
- 分栏内容

</div>

<div class="content-card card-half">

##### 🚀 右侧卡片

这也是一个**半宽卡片**，两个卡片自动平分空间。

在移动设备上会自动变成单列显示。

</div>

</div>

#### 示例 2：不等宽卡片（2:1）

<div class="card-row">

<div class="content-card card-two-thirds">

##### 📊 主要内容 (2/3 宽度)

这个卡片占据 **2/3 宽度**，适合放置主要内容或详细信息。

可以包含更多文字、图表、数据等。

</div>

<div class="content-card card-third">

##### 📌 侧边栏 (1/3)

这个卡片占 **1/3 宽度**。

适合：
- 提示信息
- 快速链接
- 小工具

</div>

</div>

#### 示例 3：三列网格

<div class="card-grid-3">

<div class="content-card">

##### ⚡ 特性 1

高性能设计

</div>

<div class="content-card">

##### 🎯 特性 2

易于使用

</div>

<div class="content-card">

##### 🔧 特性 3

高度可定制

</div>

</div>

#### 示例 4：居中窄卡片

<div class="content-card card-narrow">

##### 📝 重要声明

这是一个**窄宽度卡片**（最大 600px），内容会居中显示。

适合简短但重要的信息，让读者更加聚焦。

</div>

## 技术实现

### 前端技术栈

本项目使用了以下现代化的前端技术：

```javascript
// 项目技术配置
const techStack = {
  layout: 'Jekyll + Liquid',
  styling: 'Pure CSS3',
  fonts: {
    serif: 'Merriweather',
    sansSerif: 'Open Sans'
  },
  features: [
    'Responsive Design',
    'KaTeX Math',
    'Syntax Highlighting',
    'Lazy Loading'
  ]
};

// 初始化博客系统
function initBlog() {
  console.log('博客系统已启动');
  renderMath();
  setupLazyLoading();
  enableSmoothScroll();
}

initBlog();
```

### 样式架构

我们采用了模块化的CSS架构设计：

```css
/* CSS变量系统 */
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --text-color: #333;
  --bg-color: #fff;
}

/* 响应式布局 */
.blog-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 30px;
}

@media (max-width: 768px) {
  .blog-main {
    padding: 30px 20px;
  }
}
```

### Python后端示例

如果你的项目涉及后端开发，也可以展示相关代码：

```python
class BlogPost:
    """博客文章类"""
    
    def __init__(self, title, content, author):
        self.title = title
        self.content = content
        self.author = author
        self.created_at = datetime.now()
    
    def render(self):
        """渲染文章内容"""
        return f"""
        <article>
            <h1>{self.title}</h1>
            <p>作者：{self.author}</p>
            <div>{self.content}</div>
        </article>
        """
    
    def __str__(self):
        return f"BlogPost: {self.title} by {self.author}"
```

## 使用示例

### 插入单张图片

你可以轻松地在博客中插入图片，图片会自动适配页面宽度并添加优雅的阴影效果：

![项目封面图]({{ '/assets/images/covers/cover2.jpg' | relative_url }})

图片会居中显示，并带有圆角和阴影，提供更好的视觉效果。

### 引用块展示

引用块可以用来突出显示重要的信息、名人名言或者关键提示：

> "设计不仅仅是它看起来的样子和感觉如何。设计是它如何工作。"
> 
> — Steve Jobs

你可以用引用块来强调项目的核心理念或设计哲学。

### 列表组织内容

**项目特性列表：**

- 现代化的用户界面设计
  - 简洁直观的操作流程
  - 优雅的视觉呈现
  - 流畅的交互动画
- 强大的功能支持
  - 多媒体内容展示
  - 代码语法高亮
  - 数学公式渲染
- 优秀的性能表现
  - 快速加载
  - 流畅滚动
  - 低内存占用

**开发流程：**

1. **需求分析** - 明确项目目标和用户需求
2. **设计阶段** - 创建原型和视觉设计
3. **开发实现** - 编码和功能实现
4. **测试优化** - 全面测试和性能优化
5. **部署上线** - 发布到生产环境
6. **维护迭代** - 持续改进和功能更新

### 嵌入视频

你可以嵌入YouTube视频来展示项目演示：

<div class="video-wrapper">
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
</div>

或者嵌入本地视频文件：

<div class="video-wrapper">
    <video controls poster="{{ '/assets/images/covers/cover3.jpg' | relative_url }}">
        <source src="/assets/videos/demo.mp4" type="video/mp4">
        您的浏览器不支持视频播放。
    </video>
</div>

### 图片画廊

使用HTML可以创建精美的图片画廊，展示项目的多个截图：

<div class="image-gallery">
    <img src="{{ '/assets/images/covers/cover1.jpg' | relative_url }}" alt="界面截图1">
    <img src="{{ '/assets/images/covers/cover2.jpg' | relative_url }}" alt="界面截图2">
    <img src="{{ '/assets/images/covers/cover3.jpg' | relative_url }}" alt="界面截图3">
</div>

图片画廊会自动适配不同屏幕尺寸，在桌面端显示为网格布局，移动端则堆叠显示。

## 数学公式支持

项目完整支持LaTeX数学公式，适合展示技术和科研项目。

**行内公式示例：**质能方程 $E = mc^2$ 是爱因斯坦最著名的公式之一。

**块级公式示例：**

微积分基本定理：

$$
\frac{d}{dx}\left( \int_{a}^{x} f(t)\,dt\right) = f(x)
$$

麦克斯韦方程组：

$$
\begin{aligned}
\nabla \times \vec{\mathbf{E}} &= -\frac{\partial \vec{\mathbf{B}}}{\partial t} \\
\nabla \times \vec{\mathbf{B}} &= \mu_0\vec{\mathbf{J}} + \mu_0\epsilon_0\frac{\partial \vec{\mathbf{E}}}{\partial t} \\
\nabla \cdot \vec{\mathbf{E}} &= \frac{\rho}{\epsilon_0} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{aligned}
$$

傅里叶变换：

$$
F(\omega) = \int_{-\infty}^{\infty} f(t) e^{-i\omega t} dt
$$

## 数据展示

### 性能指标

使用表格可以清晰地展示项目的性能数据：

| 性能指标 | 优化前 | 优化后 | 提升 |
|---------|--------|--------|------|
| 页面加载时间 | 3.2s | 1.5s | 53% |
| 首次内容绘制 | 1.8s | 0.8s | 56% |
| 可交互时间 | 4.1s | 2.0s | 51% |
| Lighthouse评分 | 72 | 95 | +23 |

### 技术对比

| 特性 | 传统方案 | 我们的方案 | 优势 |
|-----|---------|----------|------|
| 加载速度 | 慢 | 快 | ✅ |
| 响应式 | 部分支持 | 完全支持 | ✅ |
| 可维护性 | 一般 | 优秀 | ✅ |
| 扩展性 | 有限 | 灵活 | ✅ |

## 项目成果

通过这个项目，我们实现了一系列重要目标：

- ✅ 创建了专业级的博客展示系统
- ✅ 提供了优秀的阅读体验
- ✅ 支持丰富的内容类型
- ✅ 确保了跨平台兼容性
- ✅ 实现了快速的加载性能
- ✅ 保持了代码的简洁性

**用户反馈：**

> "这是我见过最优雅的项目展示页面，阅读体验非常舒适。"
> 
> — 测试用户 A

> "Markdown编写非常方便，而且渲染效果很专业。"
> 
> — 测试用户 B

## 遇到的挑战

### 挑战一：字体选择

在字体选择上，我们经过了多次尝试。最初使用的无衬线字体虽然现代，但长文阅读时容易疲劳。经过研究和测试，我们最终选择了Merriweather作为正文字体，Open Sans作为标题字体，达到了美观和可读性的平衡。

### 挑战二：响应式布局

如何在保持美观的同时适配各种屏幕尺寸是一个挑战。我们采用了移动优先的设计策略，从小屏幕开始设计，然后逐步增强到大屏幕，确保了各种设备上的体验。

### 挑战三：性能优化

在保证功能丰富的同时保持快速的加载速度需要精心优化。我们使用了CSS优化、图片懒加载、代码分割等技术，将初始加载时间控制在了2秒以内。

## 经验总结

在这个项目中，我学到了很多宝贵的经验：

1. **内容为王** - 再好的设计也要服务于内容的展示
2. **性能很重要** - 用户不会等待加载超过3秒
3. **移动优先** - 越来越多的用户使用移动设备
4. **细节决定成败** - 行距、字号、颜色等细节都会影响体验
5. **持续迭代** - 没有完美的设计，只有不断改进

## 未来计划

我们计划在未来版本中添加以下功能：

- [ ] **评论系统** - 允许读者留言和讨论
- [ ] **目录导航** - 自动生成文章目录
- [ ] **阅读进度** - 显示文章阅读进度条
- [ ] **暗黑模式** - 提供护眼的夜间阅读模式
- [ ] **分享功能** - 一键分享到社交媒体
- [ ] **搜索功能** - 全文搜索和标签过滤
- [ ] **相关推荐** - 推荐相关的其他项目
- [ ] **多语言支持** - 国际化界面支持

## 技术文档

### 快速开始

创建一个新的项目博客非常简单：

```bash
# 1. 复制模板文件
cp _projects/BLOG_TEMPLATE.md _projects/2024/24_my_project_blog.md

# 2. 编辑文件内容
vim _projects/2024/24_my_project_blog.md

# 3. 设置 has_blog: true
# 在对应的项目文件中添加 has_blog: true

# 4. 预览效果
bundle exec jekyll serve
```

### 配置说明

在Markdown文件的Front Matter中，你需要配置：

```yaml
layout: blog          # 必须设置为 blog
title: "项目标题"      # 显示的标题
date: 2024-10-24      # 发布日期
description: "描述"   # 项目简介
has_blog: true        # 启用博客页面
```

## 参考资源

在项目开发过程中，以下资源提供了很大帮助：

- [Jekyll 官方文档](https://jekyllrb.com/) - 静态站点生成器
- [Markdown 语法指南](https://www.markdownguide.org/) - Markdown教程
- [KaTeX 文档](https://katex.org/) - 数学公式渲染
- [Google Fonts](https://fonts.google.com/) - 网络字体服务
- [Font Awesome](https://fontawesome.com/) - 图标库

## 致谢

感谢所有为这个项目做出贡献的人：

- 设计团队：提供了优秀的视觉设计
- 开发团队：实现了所有功能特性
- 测试团队：发现并帮助修复了许多问题
- 社区贡献者：提供了宝贵的反馈和建议

## 总结

这个博客系统为项目展示提供了一个完美的解决方案。它结合了传统博客的优雅阅读体验和现代网页的交互特性，让项目介绍既专业又易读。

**核心价值：**

- 📝 简单的Markdown创作
- 🎨 专业的视觉呈现
- 📱 完美的跨设备体验
- ⚡ 快速的加载性能
- 🔧 灵活的定制能力

无论你是要介绍一个技术项目、展示一个设计作品，还是分享一个研究成果，这个博客系统都能满足你的需求。

希望这个示例能帮助你创建自己的精彩项目博客！如果有任何问题或建议，欢迎通过上面的链接联系我们。

---

*最后更新：2024年10月24日*
