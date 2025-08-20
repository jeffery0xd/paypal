# 墨西哥电商网站 - Mexico E-commerce Site

一个基于 React + Supabase 的现代电商网站，专为墨西哥市场设计。

## 🚀 快速开始

### 管理员登录
- **访问地址**: `/admin`
- **密码**: `19961015`

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📦 部署到 Cloudflare Pages

详细部署说明请查看 [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)

### 快速部署步骤：

1. Fork 或下载此仓库
2. 上传到您的 GitHub
3. 在 Cloudflare Pages 中连接 GitHub 仓库
4. 设置构建命令: `npm run build`
5. 设置输出目录: `dist`
6. 添加环境变量（Supabase 配置）
7. 部署完成！

## ✨ 功能特性

- 🛍️ 产品展示和分类
- 📱 完全响应式设计
- 🔐 管理员后台系统
- 📷 图片上传功能
- 🎨 自定义 Banner 和 Logo
- 🔍 SEO 优化设置
- ⚡ 基于 Vite 的快速构建
- 🌐 Cloudflare Pages 优化

## 🛠️ 技术栈

- **前端**: React 18, TypeScript, Vite
- **样式**: Tailwind CSS
- **后端**: Supabase
- **部署**: Cloudflare Pages
- **图标**: Lucide React

## 📱 页面结构

- `/` - 主页
- `/admin` - 管理员后台
- `/category/[id]` - 分类页面

## 🔧 环境配置

在 `.env` 文件中设置：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**作者**: MiniMax Agent  
**更新时间**: 2025-08-20