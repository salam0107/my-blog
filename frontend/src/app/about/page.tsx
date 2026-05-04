'use client'

import Link from 'next/link'

export default function About() {
  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="logo">博客站</Link>
        <nav className="nav-links">
          <Link href="/posts" className="nav-link">文章</Link>
          <Link href="/archives" className="nav-link">归档</Link>
          <Link href="/works" className="nav-link">作品集</Link>
          <Link href="/about" className="nav-link active">关于</Link>
          <Link href="/admin" className="nav-link login-btn">登录</Link>
        </nav>
      </header>

      <main className="about-content">
        <div className="about-card">
          <div className="avatar">星</div>
          <h1 className="name">星尘</h1>
          <p className="intro">电子信息科学与技术 · 2025年毕业</p>
          
          <div className="skills">
            <div className="skill-tag">#嵌入式</div>
            <div className="skill-tag">#软硬件</div>
            <div className="skill-tag">#PCB</div>
            <div className="skill-tag">#OpenClaw</div>
            <div className="skill-tag">#前端</div>
          </div>
          
          <p className="desc">
            电子信息专业出身，现学习前端开发。
            记录嵌入式、软硬件、PCB设计等技术的学习笔记，
            也记录日常生活中的点滴感悟。
          </p>
          
          <div className="links">
            <a href="#" className="link-item">GitHub</a>
            <a href="#" className="link-item">邮箱</a>
          </div>
        </div>
      </main>

      <footer className="footer">
        © 2026 我的博客站
      </footer>

      <style>{`
        .about-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .about-card {
          max-width: 480px;
          text-align: center;
          padding: 48px;
        }
        .avatar {
          width: 80px;
          height: 80px;
          background: var(--gradient-key);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 600;
          color: white;
          margin: 0 auto 24px;
        }
        .name {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .intro {
          color: var(--text-2);
          margin-bottom: 24px;
        }
        .skills {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .skill-tag {
          padding: 6px 14px;
          background: var(--surface-2);
          border-radius: 16px;
          font-size: 12px;
          color: var(--text-2);
        }
        .desc {
          color: var(--text-3);
          line-height: 1.8;
          margin-bottom: 32px;
        }
        .links {
          display: flex;
          gap: 24px;
          justify-content: center;
        }
        .link-item {
          color: var(--accent-cool);
          text-decoration: none;
          font-size: 14px;
        }
        .link-item:hover { text-decoration: underline; }
        .nav-link.active { color: var(--accent-cool); }
      `}</style>
    </div>
  )
}