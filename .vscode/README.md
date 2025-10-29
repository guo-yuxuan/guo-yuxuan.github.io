# VSCode 配置说明

## 配置文件说明

本目录下的 `settings.json` 文件配置了 VSCode 的编辑器行为，主要用于防止 HTML 文件被自动格式化。

### 关键配置

```json
{
  "files.associations": {
    "*.html": "liquid"
  }
}
```
将所有 `.html` 文件识别为 Liquid 模板文件（Jekyll 使用的模板语言）。

```json
{
  "[liquid]": {
    "editor.formatOnSave": false
  }
}
```
禁用 Liquid 文件的保存时自动格式化。

## 为什么需要这些配置？

Jekyll 项目中的 HTML 文件包含 Liquid 模板语法（如 `{% if %}`, `{{ variable }}`），标准的 HTML 格式化工具会破坏这些语法，导致：

1. Liquid 标签被错误格式化
2. 代码可读性变差
3. 可能导致模板语法错误

## 其他配置文件

### `.editorconfig`
统一不同编辑器的代码风格配置。

### `.prettierignore`
告诉 Prettier 忽略包含 Liquid 语法的文件。

## 重新加载配置

创建或修改配置文件后，请重新加载 VSCode 窗口：
1. 按 `Cmd/Ctrl + Shift + P`
2. 输入 "Reload Window"
3. 按回车

现在保存 HTML 文件时，格式将不会被自动改变。

