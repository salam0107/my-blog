# 后端搭建任务 — 给后端Agent

> 请严格按照以下要求搭建博客后端

---

## 项目信息

```
项目名称：我的博客站后端
项目路径：/media/salam/Elements SE1/my-blog
前端已做好：Next.js 15 + React 19
等待后端：API服务 + 数据库
```

---

## 技术栈要求

```
• 语言：Node.js
• 框架：你决定（推荐Express或NestJS）
• 数据库：PostgreSQL
• 认证方式：JWT
• 部署：你决定（Railway/Render/或其他）
```

---

## 需要做的功能

### 1. 用户认证
```
• 注册 / 登录 / 登出
• JWT Token验证
```

### 2. 文章管理
```
• 创建文章（标题/内容/分类/标签/日期）
• 编辑文章
• 删除文章
• 获取文章列表（分页/筛选）
• 获取单篇文章
```

### 3. 分类管理
```
• 技术 / 生活 / 知识 三大分类
```

### 4. 标签管理
```
• 多标签支持
```

### 5. 评论系统
```
• 发表评论
• 获取评论列表
```

---

## 数据库设计参考

```sql
-- users（用户：admin）
users: id, username, email, password_hash, created_at

-- posts（文章）
posts: id, title, content, category_id, user_id, created_at, updated_at

-- categories（分类）
categories: id, name, slug

-- tags（标签）
tags: id, name, slug

-- post_tags（文章标签关联）
post_tags: post_id, tag_id

-- comments（评论）
comments: id, post_id, user_id, content, created_at
```

---

## API接口设计

```
认证：
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

文章：
GET /api/posts (列表，支持分页/筛选)
GET /api/posts/:id
POST /api/posts (创建，需登录)
PUT /api/posts/:id (编辑，需登录)
DELETE /api/posts/:id (删除，需登录)

分类：
GET /api/categories

标签：
GET /api/tags

评论：
GET /api/posts/:id/comments
POST /api/posts/:id/comments
```

---

## 对接方式

```
前端位置：/media/salam/Elements SE1/my-blog
后端位置：自己决定（建议 /media/salam/Elements SE1/my-blog-backend 或独立项目）

前端调用示例：
fetch('/api/posts')
fetch('/api/posts/1', { headers: { Authorization: 'Bearer token' } })
```

---

## 重要提示

```
1. 先确认方案再开始搭建
2. 有问题在对话中问我
3. 完成后告诉我部署情况和API地址
```

---

开始吧！有问题随时问我。