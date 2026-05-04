import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { postsRouter } from './routes/posts.js';
import { categoriesRouter } from './routes/categories.js';
import { tagsRouter } from './routes/tags.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动
app.listen(PORT, () => {
  console.log(`🚀 Blog API running on http://localhost:${PORT}`);
});

export default app;