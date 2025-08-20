# 部署步骤详细说明

## 第一步：准备 GitHub 仓库

1. **在 GitHub 创建新仓库**
   - 访问 https://github.com/new
   - 输入仓库名称（建议：`mexico-ecommerce-site`）
   - 选择 "Public" 或 "Private"（推荐 Public）
   - 不要初始化 README（我们已经有了）
   - 点击 "Create repository"

2. **上传代码到 GitHub**
   ```bash
   # 在项目根目录运行
   chmod +x init-github.sh
   ./init-github.sh
   
   # 按照脚本提示，添加远程仓库
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## 第二步：配置 Cloudflare Pages

### 方法一：通过 Cloudflare Dashboard

1. **访问 Cloudflare Dashboard**
   - 登录 https://dash.cloudflare.com/
   - 选择您的账户
   - 进入 "Pages" 部分

2. **创建新项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权 Cloudflare 访问您的 GitHub
   - 选择刚才创建的仓库

3. **配置构建设置**
   ```
   项目名称: mexico-ecommerce-site
   生产分支: main
   构建命令: npm run build
   构建输出目录: dist
   Node.js 版本: 18
   ```

4. **设置环境变量**
   在 "Settings" > "Environment variables" 中添加：
   ```
   VITE_SUPABASE_URL = https://你的项目.supabase.co
   VITE_SUPABASE_ANON_KEY = 你的匿名密钥
   ```

5. **开始部署**
   - 点击 "Save and Deploy"
   - 等待构建完成（通常 2-5 分钟）

### 方法二：使用 GitHub Actions（自动化）

如果您已经设置了 GitHub Actions（项目中包含 `.github/workflows/deploy.yml`）：

1. **设置 GitHub Secrets**
   - 进入 GitHub 仓库
   - Settings > Secrets and variables > Actions
   - 添加以下 secrets：
     - `CLOUDFLARE_API_TOKEN`: 从 Cloudflare 获取的 API 令牌
     - `CLOUDFLARE_ACCOUNT_ID`: 您的 Cloudflare 账户 ID

2. **获取 Cloudflare API 令牌**
   - 访问 https://dash.cloudflare.com/profile/api-tokens
   - 点击 "Create Token"
   - 使用 "Cloudflare Pages:Edit" 模板
   - 配置权限并创建令牌

3. **自动部署**
   - 每次推送到 main 分支都会自动部署
   - 在 GitHub Actions 标签页查看部署状态

## 第三步：验证部署

1. **访问网站**
   - Cloudflare 会提供一个 `*.pages.dev` 域名
   - 测试主页是否正常加载
   - 访问 `/admin` 测试管理员功能

2. **测试管理员功能**
   - 使用密码 `19961015` 登录
   - 测试产品添加功能
   - 测试图片上传功能

## 第四步：自定义域名（可选）

1. **添加自定义域名**
   - 在 Cloudflare Pages 项目设置中
   - 点击 "Custom domains"
   - 添加您的域名

2. **配置 DNS**
   - 添加 CNAME 记录指向您的 `*.pages.dev` 域名
   - 或使用 Cloudflare 作为 DNS 提供商

## 故障排除

### 构建失败
- 检查 Node.js 版本是否为 18
- 确认所有依赖都在 `package.json` 中
- 查看构建日志了解具体错误

### 环境变量问题
- 确保 Supabase URL 和密钥正确
- 检查变量名称是否以 `VITE_` 开头
- 重新部署以应用新的环境变量

### 功能异常
- 检查浏览器控制台的错误信息
- 确认 Supabase 数据库和存储桶已正确设置
- 验证 RLS 策略是否正确配置

## 维护建议

1. **定期备份**
   - 定期备份 Supabase 数据
   - 保存重要配置文件

2. **安全性**
   - 定期更新依赖包
   - 监控访问日志
   - 考虑更换管理员密码

3. **性能优化**
   - 使用 Cloudflare 的优化功能
   - 定期检查页面加载速度
   - 优化图片大小

---

✅ 完成以上步骤后，您的网站就成功部署到 Cloudflare Pages 了！