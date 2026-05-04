'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setTimeout(() => document.getElementById('eyebrow')?.classList.add('visible'), 300)
    setTimeout(() => document.getElementById('title')?.classList.add('visible'), 500)
    setTimeout(() => document.getElementById('subtitle')?.classList.add('visible'), 800)
    setTimeout(() => document.getElementById('cta')?.classList.add('visible'), 1000)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.querySelectorAll('.card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), 600 + i * 150)
    })
  }, [mounted])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.card')
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 10
      
      cards.forEach((card, i) => {
        (card as HTMLElement).style.transform = 
          `translateX(${x * (i + 1) * 0.5}px) translateY(${y * (i + 1) * 0.3}px) rotateY(${-x * (i + 1) * 0.3}deg)`
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mounted])

  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="logo">博客站</Link>
        <nav className="nav-links">
          <Link href="/posts" className="nav-link">文章</Link>
          <Link href="/archives" className="nav-link">归档</Link>
          <Link href="/works" className="nav-link">作品集</Link>
          <Link href="/about" className="nav-link">关于</Link>
          <Link href="/admin" className="nav-link login-btn">登录</Link>
        </nav>
      </header>

      <main className="main">
        <div className="content-left">
          <div className="eyebrow" id="eyebrow">
            电子信息科学与技术 2025年毕业
          </div>
          
          <h1 className="title" id="title">
            记录技术<br/>
            <span className="accent">记录生活</span>
          </h1>
          
          <p className="subtitle" id="subtitle">
            嵌入式 · 软硬件 · PCB · 前端
          </p>

          <Link href="/posts" className="cta" id="cta">
            进入博客 →
          </Link>
        </div>

        <div className="cards-container">
          <div className="card" onClick={() => router.push('/posts')}>
            <div className="card-num">01</div>
            <div className="card-title">技术</div>
            <div className="card-desc">嵌入式/软硬件/前端</div>
          </div>
          <div className="card" onClick={() => router.push('/posts?category=life')}>
            <div className="card-num">02</div>
            <div className="card-title">生活</div>
            <div className="card-desc">日常与感悟</div>
          </div>
          <div className="card" onClick={() => router.push('/posts?category=knowledge')}>
            <div className="card-num">03</div>
            <div className="card-title">知识</div>
            <div className="card-desc">笔记与工具</div>
          </div>
        </div>
      </main>

      <footer className="footer">
        © 2026 博客站
      </footer>
    </div>
  )
}