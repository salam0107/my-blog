import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 文章列表（公开）
router.get('/', async (req, res, next) => {
  try {
    const { page = '1', limit = '10', category, tag, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.PostWhereInput = { published: true };
    
    if (category) {
      where.category = { slug: category as string };
    }
    if (tag) {
      where.tags = { some: { slug: tag as string } };
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          tags: true,
        },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      posts: posts.map(p => ({
        ...p,
        category: p.category?.name,
        tags: p.tags.map(t => t.name),
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('GET /posts error:', err);
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

// 获取单篇文章（公开）
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id }, { title: { equals: id, mode: 'insensitive' } }],
        published: true,
      },
      include: {
        category: true,
        tags: true,
        user: { select: { username: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 增加浏览量
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({
      ...post,
      category: post.category?.name,
      tags: post.tags.map(t => t.name),
      author: post.user?.username,
    });
  } catch (err) {
    console.error('GET /posts/:id error:', err);
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 创建文章（需登录）
const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  createdBy: z.string().optional(),
  published: z.boolean().optional(),
});

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        createdBy: data.createdBy,
        published: data.published ?? true,
        userId: req.userId!,
        tags: data.tagIds ? { connect: data.tagIds.map(id => ({ id })) } : undefined,
      },
      include: { tags: true },
    });

    res.json(post);
  } catch (err) {
    console.error('POST /posts error:', err);
    res.status(400).json({ error: '创建文章失败，请检查输入内容' });
  }
});

// 编辑文章（需登录）
const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const data = updateSchema.parse(req.body);

    const existing = await prisma.post.findUnique({ where: { id } });
    
    if (!existing) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        tags: data.tagIds ? { set: data.tagIds.map(tid => ({ id: tid })) } : undefined,
      },
      include: { tags: true },
    });

    res.json(post);
  } catch (err) {
    console.error('PUT /posts/:id error:', err);
    res.status(400).json({ error: '更新文章失败' });
  }
});

// 删除文章（需登录）
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.post.findUnique({ where: { id } });
    
    if (!existing) {
      return res.status(404).json({ error: '文章不存在' });
    }

    await prisma.post.delete({ where: { id } });

    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('DELETE /posts/:id error:', err);
    res.status(500).json({ error: '删除文章失败' });
  }
});

export { router as postsRouter };