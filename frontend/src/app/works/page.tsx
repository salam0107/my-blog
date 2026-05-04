'use client'

import Link from 'next/link'

const works = [
  {
    id: 1,
    title: '智能小车项目',
    desc: '基于STM32的蓝牙遥控智能小车',
    tech: ['STM32', '蓝牙', 'PCB'],
    link: '#'
  },
  {
    id: 2,
    title: '个人博客站',
    desc: '使用Next.js搭建的个人博客',
    tech: ['Next.js', 'React', 'TypeScript'],
    link: '#'
  },
  {
    id: 3,
    title: '温湿度监测系统',
    desc: 'DHT11传感器数据采集与显示',
    tech: ['STM32', 'DHT11', 'LCD'],
    link: '#'
  },
]

export default function Works() {
  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="logo">博客站</Link>
        <nav className="nav-links">
          <Link href="/posts" className="nav-link">文章</Link>
          <Link href="/archives" className="nav-link">归档</Link>
          <Link href="/works" className="nav-link active">作品集</Link>
          <Link href="/about" className="nav-link">关于</Link>
          <Link href="/admin" className="nav-link login-btn">登录</Link>
        </nav>
      </header>

      <main className="content">
        <h1 className="page-title">作品集</h1>
        <p className="page-desc">做过的一些项目</p>
        
        <div className="works-grid">
          {works.map(work => (
            <article key={work.id} className="work-card">
              <h2 className="work-title">{work.title}</h2>
              <p className="work-desc">{work.desc}</p>
              <div className="work-techs">
                {work.tech.map(t => <span key={t} className="tech-tag">{t}</span>)}
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="footer">
        © 2026 我的博客站
      </footer>

      <style>{`
        .content { flex: 1; padding: 32px 0; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .page-desc { color: var(--text-3); margin-bottom: 32px; }
        .works-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .work-card {
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s;
        }
        .work-card:hover { border-color: var(--accent-cool); transform: translateY(-4px); }
        .work-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .work-desc { font-size: 14px; color: var(--text-3); margin-bottom: 16px; }
        .work-techs { display: flex; gap: 8px; flex-wrap: wrap; }
        .tech-tag { font-size: 11px; color: var(--accent-cool); background: var(--accent-cool-soft); padding: 4px 10px; border-radius: 10px; }
      `}</style>
    </div>
  )
}