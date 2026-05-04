# 我的博客（全栈项目）

## 项目结构

```
my-blog-full/
├── frontend/    # Next.js 前端
└── backend/    # Express + Prisma 后端
```

## 本地开发

### 1. 启动后端
```bash
cd backend
npm install
npx prisma generate
npm run dev
```
后端运行在: http://localhost:3001

### 2. 启动前端
```bash
cd frontend
npm install
npm run dev
```
前端运行在: http://localhost:3000

## 部署到 Railway

1. 登录 https://railway.app
2. 创建新项目
3. 连接 GitHub 仓库
4. 添加环境变量:
   - DATABASE_URL (Supabase 连接字符串)
   - JWT_SECRET (随机字符串)

## 技术栈

- 前端: Next.js 15 + React 19 + TypeScript
- 后端: Express + TypeScript + Prisma
- 数据库: PostgreSQL (Supabase)
- 认证: JWT

## 管理员

- 账号: salam@blog.com
- 密码: admin123
- 登录地址: /posts/[文章ID] → 点"登录"