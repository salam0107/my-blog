'use client'

import { useState } from 'react'
import Link from 'next/link'

const archives = [
  { year: '2026', months: [
    { month: '4月', count: 4, posts: [
      { id: 1, title: 'STM32 温湿度传感器项目实战', date: '04-28' },
      { id: 2, title: 'PCB设计学习笔记', date: '04-20' },
      { id: 3, title: '今天的一些感悟', date: '04-15' },
      { id: 4, title: 'VS Code 插件推荐', date: '04-10' },
    ]}
  ]}
]

export default function Archives() {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="logo">博客站</Link>
        <nav className="nav-links">
          <Link href="/posts" className="nav-link">文章</Link>
          <Link href="/archives" className="nav-link active">归档</Link>
          <Link href="/works" className="nav-link">作品集</Link>
          <Link href="/about" className="nav-link">关于</Link>
          <Link href="/admin" className="nav-link login-btn">登录</Link>
        </nav>
      </header>

      <main className="content">
        <h1 className="page-title">归档</h1>
        
        <div className="archive-list">
          {archives.map(year => (
            <div key={year.year} className="archive-year">
              <button className="year-header" onClick={() => setExpanded(!expanded)}>
                <span className="year-name">{year.year}年</span>
                <span className="year-count">{year.months[0].count}篇</span>
                <span className="arrow">{expanded ? '−' : '+'}</span>
              </button>
              
              {expanded && year.months.map(m => (
                <div key={m.month} className="month-block">
                  <div className="month-name">{m.month}</div>
                  <ul className="post-list">
                    {m.posts.map(p => (
                      <li key={p.id}>
                        <Link href={`/posts/${p.id}`} className="archive-post">
                          <span className="post-date">{p.date}</span>
                          <span className="post-title">{p.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        © 2026 我的博客站
      </footer>

      <style>{`
        .content { flex: 1; padding: 32px 0; max-width: 600px; margin: 0 auto; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 32px; }
        .archive-year { margin-bottom: 16px; }
        .year-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--surface-2);
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
        }
        .year-count { color: var(--text-4); font-weight: 400; font-size: 14px; }
        .arrow { font-size: 18px; color: var(--text-3); }
        .month-block { padding: 16px 0; }
        .month-name { font-size: 14px; color: var(--text-3); margin-bottom: 12px; }
        .post-list { list-style: none; }
        .post-list li { margin-bottom: 8px; }
        .archive-post { display: flex; gap: 16px; padding: 8px 12px; border-radius: 8px; transition: background 0.3s; }
        .archive-post:hover { background: var(--surface-2); }
        .archive-post .post-date { color: var(--text-4); font-size: 13px; min-width: 40px; }
        .archive-post .post-title { color: var(--text-2); font-size: 14px; }
      `}</style>
    </div>
  )
}