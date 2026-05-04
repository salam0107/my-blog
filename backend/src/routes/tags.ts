import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 获取标签列表（公开）
router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(tags);
  } catch (err) {
    console.error('GET /tags error:', err);
    res.status(500).json({ error: '获取标签失败' });
  }
});

// 创建标签（需登录）
const createSchema = z.object({
  name: z.string().min(1).max(30),
  slug: z.string().min(1).max(30),
});

router.post('/', authenticate, async (req, res) => {
  try {
    const data = createSchema.parse(req.body);
    
    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
    res.json(tag);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('POST /tags error:', err);
    res.status(500).json({ error: '创建标签失败' });
  }
});

// 删除标签（需登录）
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({ where: { id } });
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('DELETE /tags/:id error:', err);
    res.status(500).json({ error: '删除标签失败' });
  }
});

export { router as tagsRouter };