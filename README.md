# 静态短链接服务 (Static Short Links Service)

这是一个基于 GitHub Pages 构建的纯静态、无后端的短链接服务。

## ✨ 功能特性

- **纯静态**: 无需服务器、无需数据库，完全托管于 GitHub Pages。
- **客户端跳转**: 利用 `404.html` 页面和 JavaScript 实现智能的客户端重定向。
- **安全管理**: 通过一个独立的管理页面 (`admin.html`)，使用 GitHub Personal Access Token (PAT) 安全地更新链接数据。
- **易于部署**: 只需将代码推送到 GitHub 仓库并开启 GitHub Pages 功能即可。
- **支持自定义域名**: 可以轻松绑定您自己的域名。

## 🎯 适用场景

本项目非常适合 **个人开发者、技术爱好者或小型团队** 用于创建和管理私人的短链接服务。例如：

- 统一管理个人在各个社交媒体的地址。
- 为开源项目创建简短的演示或文档链接。
- 在技术分享中提供清爽的资源链接。

**注意**: 由于每次链接更新都需要通过 GitHub API 修改单个 JSON 文件，当链接数量非常庞大（例如成千上万）时，可能会遇到性能瓶颈或管理上的不便。因此，它不适合作为大规模、高并发的商业服务。

## 🚀 工作原理

本服务巧妙地利用了 GitHub Pages 的一个特性：当用户访问一个不存在的路径时，GitHub Pages 会返回仓库根目录下的 `404.html` 文件的内容。

1.  用户访问 `your-username.github.io/your-repo/short-code`。
2.  由于 `/short-code` 路径不存在，GitHub Pages 服务器返回 `404.html`。
3.  `404.html` 内的 JavaScript 脚本被执行。脚本会获取当前页面的路径 (`/your-repo/short-code`)。
4.  脚本通过 `fetch` API 请求 `data/links.json` 文件，这是一个存储了所有短链接与长链接映射关系的 JSON 文件。
5.  在获取到 JSON 数据后，脚本在其中查找与当前路径匹配的短链接，并找到对应的目标长链接。
6.  最后，脚本执行 `window.location.replace()`，将浏览器重定向到目标长链接。

整个过程完全在客户端完成，实现了动态的跳转行为。

## 🛠️ 如何使用

### 1. 部署

1.  **Star 本项目**: 如果您觉得这个项目对您有帮助，请点击右上角的 "Star" 支持一下！
2.  **Fork 本仓库**: 点击右上角的 "Fork" 按钮，将此仓库复制到您自己的 GitHub 账户下。
3.  **配置仓库地址**:
    - 在您的仓库中，找到并打开 `js/config.js` 文件。
    - 将 `GITHUB_REPO` 的值修改为您自己的仓库地址，格式为 `"your-username/your-repo-name"`。
    - 保存并提交文件。
4.  **开启 GitHub Pages**:
    - 进入您 Fork 后的仓库设置 (Settings)。
    - 点击左侧菜单的 "Pages"。
    - 在 "Build and deployment" 部分，将 Source 设置为 "Deploy from a branch"。
    - 选择 `main` (或 `master`) 分支和 `/ (root)` 目录，然后点击 "Save"。
    - 等待片刻，您的短链接服务就会部署在 `https://your-username.github.io/your-repo-name/`。

4.  **(可选) 配置自定义域名**:
    - 在您的域名提供商处，添加一条 `CNAME` 记录，指向 `your-username.github.io`。
    - 回到仓库的 "Pages" 设置页面，在 "Custom domain" 字段输入您的域名，然后点击 "Save"。
    - GitHub 会自动为您配置 HTTPS。详情请参考 [GitHub Pages 官方文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)。

### 2. 添加/更新链接

1.  **生成 Personal Access Token (PAT)**:
    - 进入您的 GitHub [开发者设置页面](https://github.com/settings/tokens?type=beta)。
    - 点击 "Generate new token"，选择 "Generate new token (fine-grained)"。
    - **Token name**: 给令牌起一个描述性的名字，例如 `short-links-admin`。
    - **Repository access**: 选择 "Only select repositories"，然后选择您 Fork 的这个短链接仓库。
    - **Permissions**: 在仓库权限 (Repository permissions) 中，找到 "Contents" 并将其权限设置为 "Read and write"。
    - 点击 "Generate token" 并**立即复制生成的令牌**。这个令牌只会显示一次。

2.  **访问管理页面**:
    - 打开 `https://your-username.github.io/your-repo-name/admin.html`。

3.  **填写表单**:
    - **短代码**: 您可以手动输入想要的短链接路径 (例如 `gh`)，程序会自动为您添加前导的 `/`。也可以点击旁边的 **“随机生成”** 按钮，根据您的偏好（长度、是否包含大小写字母或数字）来生成一个随机的短代码。
    - **目标长链接**: 填入您想要跳转到的完整 URL (例如 `https://github.com`)。
    - **GitHub PAT**: 粘贴您刚刚生成的令牌。

    > **💡 提示**: 为了方便起见，您可以让浏览器的密码管理器记住这个 PAT。在输入框中右键点击，选择“保存密码”或类似选项，下次访问时浏览器会自动填充。

4.  **提交**:
    - 点击 "添加/更新链接" 按钮。脚本将通过 GitHub API 自动更新仓库中的 `data/links.json` 文件。
    - 页面会显示成功或失败的消息。

## 🔒 安全性

- **PAT 不会被存储**: 您输入的 PAT 仅存在于当前页面的内存中，用于当次的 API 请求。它不会被硬编码或存储在任何地方。关闭页面后，令牌信息即失效。
- **HTTPS**: 所有与 GitHub API 的通信都通过 HTTPS 进行，确保了数据传输的安全性。
- **权限限制**: 生成的 PAT 仅对当前仓库的 `Contents` 具有读写权限，最大限度地减小了潜在风险。
