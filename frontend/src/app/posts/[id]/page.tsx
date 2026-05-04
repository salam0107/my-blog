'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getPost, getCategories, getTags, apiFetch, type Post, type Category, type Tag } from '@/lib/api'

export default function PostDetail() {
  const params = useParams()
  const id = params?.id as string
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Edit mode
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('blog_token')
    if (token) setIsAdmin(true)
  }, [])

  useEffect(() => {
    async function loadPost() {
      if (!id) return
      setLoading(true)
      try {
        const data = await getPost(id)
        setPost(data)
        setTitle(data.title)
        setContent(data.content)
        setExcerpt(data.excerpt || '')
      } catch (e: any) {
        setError(e.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id])

  async function handleSave() {
    const token = localStorage.getItem('blog_token')
    if (!token) return
    
    setSaving(true)
    try {
      await apiFetch(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content, excerpt })
      }, token)
      setEditing(false)
      // Reload
      const data = await getPost(id)
      setPost(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('确定删除这篇文章？')) return
    const token = localStorage.getItem('blog_token')
    if (!token) return
    
    try {
      await apiFetch(`/posts/${id}`, { method: 'DELETE' }, token)
      window.location.href = '/posts'
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function handleLogin() {
    // Inline login
    const email = prompt('管理员邮箱 (salam@blog.com):')
    const password = prompt('密码:')
    if (!email || !password) return
    
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('blog_token', data.token)
        setIsAdmin(true)
      } else {
        alert(data.error || '登录失败')
      }
    } catch (e: any) {
      alert('登录失败')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <header className="header">
          <Link href="/" className="logo">我的<span>博客站</span></Link>
        </header>
        <main className="content"><div className="loading">加载中...</div></main>
        <footer className="footer">© 2026 我的博客站</footer>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container">
        <header className="header">
          <Link href="/" className="logo">我的<span>博客站</span></Link>
        </header>
        <main className="content">
          <div className="error">{error || '文章不存在'}</div>
          <Link href="/posts" className="back-link">← 返回文章列表</Link>
        </main>
        <footer className="footer">© 2026 我的博客站</footer>
      </div>
    )
  }

  // Edit mode
  if (editing) {
    return (
      <div className="container">
        <header className="header">
          <Link href="/" className="logo">我的<span>博客站</span></Link>
          <button onClick={() => setEditing(false)} className="nav-link">取消</button>
        </header>
        
        <main className="content">
          <div className="editor">
            <div className="form-group">
              <label>标题</label>
              <input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>摘要</label>
              <input value={excerpt} onChange={e => setExcerpt(e.target.value)} />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={20} />
            </div>
            <div className="buttons">
              <button onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </main>
        
        <footer className="footer">© 2026 我的博客站</footer>
      </div>
    )
  }

  // View mode
  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="logo">我的<span>博客站</span></Link>
        <nav className="nav-links">
          <Link href="/posts" className="nav-link">文章</Link>
          <Link href="/about" className="nav-link">关于</Link>
          {isAdmin && (
            <>
              <button onClick={() => setEditing(true)} className="nav-link">编辑</button>
              <button onClick={handleDelete} className="nav-link delete">删除</button>
            </>
          )}
          {!isAdmin && (
            <button onClick={handleLogin} className="nav-link">登录</button>
          )}
        </nav>
      </header>

      <main className="post-content">
        <Link href="/posts" className="back-link">← 返回文章列表</Link>
        
        <article className="post-article">
          <header className="post-header">
            <div className="post-meta">
              <span className="post-date">{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
              <span className="post-cat">{post.category}</span>
            </div>
            <h1 className="post-title">{post.title}</h1>
            {post.tags?.length > 0 && (
              <div className="post-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </header>
          
          <div className="post-body">
            {post.content}
          </div>
        </article>
      </main>

      <footer className="footer">© 2026 我的博客站</footer>

      <style>{`
        .nav-link { background: none; border: none; cursor: pointer; color: var(--text-2); font-size: 14px; }
        .nav-link:hover { color: var(--accent-cool); }
        .nav-link.delete { color: #e53e3e; }
        .post-content { flex: 1; padding: 32px 0; max-width: 720px; margin: 0 auto; }
        .back-link { color: var(--text-3); font-size: 14px; margin-bottom: 24px; display: inline-block; }
        .back-link:hover { color: var(--accent-cool); }
        .post-article { background: var(--surface-1); border: 1px solid var(--border); border-radius: 20px; padding: 40px; }
        .post-header { margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 24px; }
        .post-meta { display: flex; gap: 12px; margin-bottom: 16px; }
        .post-date { font-size: 13px; color: var(--text-4); }
        .post-cat { font-size: 12px; color: var(--accent-cool); background: var(--accent-cool-soft); padding: 4px 12px; border-radius: 12px; }
        .post-title { font-size: 28px; font-weight: 700; line-height: 1.4; margin-bottom: 12px; }
        .post-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .tag { font-size: 12px; color: var(--text-3); background: var(--surface-2); padding: 4px 10px; border-radius: 8px; }
        .post-body { font-size: 16px; line-height: 1.8; color: var(--text-2); white-space: pre-wrap; }
        .loading { color: var(--text-3); text-align: center; padding: 48px; }
        .error { color: #e53e3e; }
        
        /* Editor */
        .editor { background: var(--surface-1); border: 1px solid var(--border); border-radius: 16px; padding: 32px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: var(--surface-2); }
        .form-group textarea { font-family: monospace; resize: vertical; }
        .buttons button { padding: 12px 24px; background: var(--accent-cool); color: white; border: none; border-radius: 8px; cursor: pointer; }
        .buttons button:disabled { opacity: 0.6; }
      `}</style>
    </div>
  )
}