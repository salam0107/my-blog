import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 获取分类列表（公开）
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    console.error('GET /categories error:', err);
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 创建分类（需登录）
const createSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
});

router.post('/', authenticate, async (req, res) => {
  try {
    const data = createSchema.parse(req.body);
    
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
    res.json(category);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('POST /categories error:', err);
    res.status(500).json({ error: '创建分类失败' });
  }
});

// 删除分类（需登录）
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('DELETE /categories/:id error:', err);
    res.status(500).json({ error: '删除分类失败' });
  }
});

export { router as categoriesRouter };