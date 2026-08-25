# 网站管理后台

这个目录提供一个独立的静态内容管理界面，不会修改现有 Jekyll 网站的模板、布局或内容目录。

发布到 GitHub Pages 后，访问：

```text
https://yuxuanguo.com/admin/
```

## 第一次登录

1. 打开 GitHub 的 Fine-grained personal access token 创建页面：<https://github.com/settings/personal-access-tokens/new>。
2. 在 **Resource owner** 中选择自己的 GitHub 账户。
3. 在 **Repository access** 中选择 **Only select repositories**，然后选择 `guo-yuxuan.github.io`。
4. 在 **Repository permissions** 中，将 **Contents** 设置为 **Read and write**；其余权限保持默认。
5. 设置适当的令牌有效期，创建并复制令牌。
6. 打开 `/admin/`，粘贴令牌并登录。

令牌只保存在当前浏览器标签页的 `sessionStorage` 中，不会写入 GitHub 仓库，也不会发送给除 `api.github.com` 以外的服务。关闭标签页或点击“退出登录”后，需要重新输入令牌。

## 可以管理的内容

- 个人简介、联系方式、头像、简历、教育经历、研究经历和奖项。
- 首页的论文、项目、新闻和经历显示开关。
- 论文成果、项目卡片、项目详情页和新闻动态。
- 图片、封面、简历及 PDF 文件上传。
- 最近的 Git 提交记录和版本历史。

修改会直接提交到当前 GitHub 分支，GitHub Pages 随后自动重新构建网站。每次保存都有独立的提交记录，可以通过 GitHub 的提交历史查看或恢复。

项目详情页里的现有 Markdown、HTML、自定义字段与布局不会被表单编辑自动删除；需要编辑完整源码时，可使用编辑窗口里的“完整源码”模式。

## 移除后台

不再需要时，删除整个 `admin/` 目录并提交即可。已通过后台发布的个人资料、论文、项目、新闻和图片都不会受到影响。
