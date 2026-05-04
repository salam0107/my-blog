import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 注册
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
    });
    
    if (existing) {
      return res.status(400).json({ error: '用户名或邮箱已被使用' });
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    });
    
    const token = generateToken(user.id, user.username);
    
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    
    const valid = await bcrypt.compare(data.password, user.password);
    
    if (!valid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    
    const token = generateToken(user.id, user.username);
    
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Login error:', err);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户（需登录）
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, username: true, email: true },
  });
  res.json(user);
});

// 登出（客户端直接删除 token 即可）
router.post('/logout', (req, res) => {
  res.json({ message: '退出成功' });
});

export { router as authRouter };