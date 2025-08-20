# Cloudflare Pages 部署指南 (修复版)

## 项目概述
这是一个完整的墨西哥电商网站项目，基于 React + TypeScript + Vite + Supabase 构建。

## 密码信息
- **管理员密码**: `19961015`
- **管理员页面**: `/admin`

## 快速部署到 Cloudflare Pages

### 方法一：通过 Cloudflare Dashboard（推荐）

1. **上传到 GitHub**
   - 将此项目上传到您的 GitHub 仓库
   - 确保所有文件都已提交

2. **连接 Cloudflare Pages**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Pages" 部分
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权并选择您的 GitHub 仓库

3. **配置构建设置**
   ```
   构建命令: npm run build
   构建输出目录: dist
   Root directory: /
   Node.js 版本: 18
   ```

4. **环境变量设置**
   在 Cloudflare Pages 项目设置中添加：
   ```
   VITE_SUPABASE_URL=您的_Supabase_URL
   VITE_SUPABASE_ANON_KEY=您的_Supabase_匿名密钥
   ```

### ⚠️ 重要修复说明

**wrangler.toml 配置已修复**：
- ❌ 原配置使用了 `staging` 环境（不支持）
- ✅ 现已修正为 `preview` 和 `production`（Cloudflare Pages 支持的环境）

### 环境变量配置

确保在 Cloudflare Pages 中设置以下环境变量：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 故障排除

#### 如果遇到 wrangler.toml 错误：
- 确保 wrangler.toml 中只使用 `preview` 和 `production` 环境
- 删除任何 `staging` 或其他自定义环境名称

#### 如果构建失败：
- 检查 Node.js 版本是否为 18
- 确认所有依赖都在 package.json 中
- 查看构建日志了解具体错误

#### 如果环境变量问题：
- 确保 Supabase URL 和密钥正确
- 检查变量名称是否以 `VITE_` 开头
- 重新部署以应用新的环境变量

## 功能特性

- ✅ 响应式设计，支持移动设备
- ✅ 产品展示和分类浏览
- ✅ 管理员后台 (`/admin`)
- ✅ 产品图片上传
- ✅ SEO 优化设置
- ✅ Banner 管理
- ✅ 网站Logo设置
- ✅ Supabase 后端集成

## 管理员功能

访问 `/admin` 页面，使用密码 `19961015` 登录后可以：

- 添加/编辑/删除产品
- 上传产品图片
- 设置产品置顶
- 管理SEO设置
- 自定义Banner
- 更换网站Logo

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **后端**: Supabase (数据库 + 存储 + 认证)
- **部署**: Cloudflare Pages
- **图标**: Lucide React

## 支持与维护

- 项目基于现代 Web 技术栈构建
- 代码结构清晰，易于维护和扩展
- 完整的 TypeScript 支持
- 响应式设计，兼容各种设备

## 注意事项

1. 部署前请确保 Supabase 项目已正确配置
2. 检查所有环境变量是否正确设置
3. 如需修改管理员密码，请编辑 `src/pages/AdminPage.tsx` 文件
4. Cloudflare Pages 会自动处理 HTTPS 和 CDN 分发

祝您部署顺利！🚀