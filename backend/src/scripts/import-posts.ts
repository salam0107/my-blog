// 将前端 posts.ts 导入数据库
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const posts = [
  {
    title: 'STM32 温湿度传感器项目实战',
    category: '技术',
    tags: ['嵌入式', 'STM32'],
    excerpt: '使用DHT11传感器和STM32单片机实现温湿度监测...',
    content: `
## 项目介绍
使用 STM32F103C8T6 单片机读取 DHT11 温湿度传感器的数据...

## 硬件连接
- VCC -> 3.3V
- GND -> GND
- DATA -> PA0

## 代码实现
\`\`\`c
// DHT11 读取代码
\`\`\`

## 总结
项目完成后可以实时监测环境温湿度...
    `
  },
  {
    title: 'PCB设计学习笔记',
    category: '技术',
    tags: ['工具'],
    excerpt: 'Altium Designer入门教程，从画原理图到PCB布局...',
    content: `## PCB设计流程...`
  },
  {
    title: '今天的一些感悟',
    category: '生活',
    tags: ['日常'],
    excerpt: '天气不错，心情也挺好的...',
    content: `今天天气很好...`
  },
  {
    title: 'VS Code 插件推荐',
    category: '知识',
    tags: ['工具'],
    excerpt: '前端开发必备的10个VS Code插件...',
    content: `## 插件推荐...`
  },
];

async function main() {
  // 获取默认用户
  const user = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!user) {
    console.error('User not found');
    return;
  }

  // 获取分类 ID
  const categoryMap: Record<string, string> = {};
  const categories = await prisma.category.findMany();
  for (const c of categories) {
    categoryMap[c.name] = c.id;
  }

  // 获取标签 ID
  const tagMap: Record<string, string> = {};
  const tags = await prisma.tag.findMany();
  for (const t of tags) {
    tagMap[t.name] = t.id;
  }

  // 导入文章
  for (const p of posts) {
    const post = await prisma.post.create({
      data: {
        title: p.title,
        content: p.content,
        excerpt: p.excerpt,
        published: true,
        userId: user.id,
        categoryId: categoryMap[p.category],
        tags: {
          connect: p.tags.map(t => ({ id: tagMap[t] })).filter(t => t.id),
        },
      },
    });
    console.log(`✅ Created: ${post.title}`);
  }

  console.log('\\n🎉 All posts imported!');
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });