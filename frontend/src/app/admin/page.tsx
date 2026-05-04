'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login, getPosts, getCategories, getTags, apiFetch, type Post, type Category, type Tag } from '@/lib/api'

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
      padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
      background: type === 'success' ? 'var(--text-1)' : 'var(--accent-warm)',
      color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: '10px',
      animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {type === 'success' ? (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/><path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/><path d="M10 6v5M10 13.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      )}
      {message}
    </div>
  )
}

function parseMarkdown(text: string) {
  if (!text) return ''
  return text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>')
}

function stripMarkdown(text: string): string {
  return text.replace(/[#*`\[\]_\-\n]/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function Admin() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [view, setView] = useState<'list' | 'edit'>('list')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const saved = localStorage.getItem('blog_token')
    if (saved) { setToken(saved); setLoggedIn(true); loadData() }
  }, [])

  // Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && view === 'edit') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, title, content, categoryId, tagIds, loading])

  // Auto-save draft to localStorage
  useEffect(() => {
    if (view === 'edit' && (title || content)) {
      const draft = { title, content, excerpt, categoryId, tagIds }
      localStorage.setItem('blog_draft', JSON.stringify(draft))
    }
  }, [view, title, content, excerpt, categoryId, tagIds])

  async function loadData() {
    const [p, c, t] = await Promise.all([getPosts({ limit: 100 }), getCategories(), getTags()])
    setPosts(p?.posts || []); setCategories(c || []); setTags(t || [])
  }

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    if (!email || !password) { showToast('请输入账号和密码', 'error'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { showToast('请输入有效的邮箱地址', 'error'); return }
    try { setLoading(true)
      const res = await login(email, password)
      setToken(res.token); setLoggedIn(true)
      localStorage.setItem('blog_token', res.token)
      showToast('登录成功', 'success')
      loadData()
    } catch { showToast('账号或密码错误', 'error') }
    finally { setLoading(false) }
  }

  async function handleSave() {
    if (!title.trim()) { showToast('请输入文章标题', 'error'); return }
    if (!content.trim()) { showToast('请输入文章内容', 'error'); return }
    try {
      setLoading(true)
      const data = { title, content, excerpt, categoryId: categoryId || null, tagIds: tagIds.length ? tagIds : [] }
      if (editingPost) {
        await apiFetch(`/posts/${editingPost.id}`, { method: 'PUT', body: JSON.stringify(data) }, token)
        showToast('文章已更新', 'success')
      } else {
        await apiFetch('/posts', { method: 'POST', body: JSON.stringify(data) }, token)
        showToast('文章已发布', 'success')
      }
      localStorage.removeItem('blog_draft')
      setView('list'); setTitle(''); setContent(''); setExcerpt(''); setCategoryId(''); setTagIds([]); setEditingPost(null); loadData()
    } catch (e: any) { showToast(e.message || '保存失败', 'error') }
    finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/posts/${id}`, { method: 'DELETE' }, token)
      showToast('文章已删除', 'success')
      loadData()
    } catch (e: any) { showToast(e.message || '删除失败', 'error') }
  }

  function openNew() {
    // Restore draft if exists
    const draft = localStorage.getItem('blog_draft')
    if (draft) {
      try {
        const d = JSON.parse(draft)
        setTitle(d.title || '')
        setContent(d.content || '')
        setExcerpt(d.excerpt || '')
        setCategoryId(d.categoryId || '')
        setTagIds(d.tagIds || [])
        showToast('已恢复草稿', 'success')
      } catch {}
    } else {
      setTitle(''); setContent(''); setExcerpt(''); setCategoryId(''); setTagIds([])
    }
    setEditingPost(null); setView('edit')
  }

  function openEdit(post: Post) {
    // Map category name to id
    const cat = categories.find(c => c.name === post.category)
    // Map tag names to ids
    const tagIdList = tags.filter(t => (post.tags as string[]).includes(t.name)).map(t => t.id)
    setTitle(post.title)
    setContent(post.content)
    setExcerpt(post.excerpt || '')
    setCategoryId(cat?.id || '')
    setTagIds(tagIdList)
    setEditingPost(post)
    setView('edit')
  }

  function handleLogout() {
    localStorage.removeItem('blog_token')
    setLoggedIn(false); setToken('')
    showToast('已退出登录', 'success')
    router.push('/')
  }

  function handleBack() {
    if (title || content) {
      if (!confirm('当前内容尚未保存，确定要返回吗？')) return
    }
    localStorage.removeItem('blog_draft')
    setView('list')
    setTitle(''); setContent(''); setExcerpt(''); setCategoryId(''); setTagIds([]); setEditingPost(null)
  }

  // 未登录页面
  if (!loggedIn) {
    return (
      <div className="admin-container">
        <div className="admin-bg" />

        <header className="admin-header">
          <Link href="/" className="admin-logo">博客站</Link>
          <nav className="admin-nav">
            <Link href="/posts">文章</Link>
            <Link href="/archives">归档</Link>
            <Link href="/works">作品集</Link>
            <Link href="/about">关于</Link>
          </nav>
        </header>

        <main className="admin-main">
          <form className="login-panel" onSubmit={handleLogin}>
            <div className="login-badge">后台管理</div>
            <h1 className="login-title">登录<span className="gradient-text">管理</span></h1>
            <p className="login-desc">输入账号密码进入后台</p>

            <div className="login-form">
              <input type="email" placeholder="账号邮箱" value={email} onChange={e => setEmail(e.target.value)} className="admin-input" autoComplete="email" />
              <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" autoComplete="current-password" />
              <button type="submit" disabled={loading} className="admin-btn primary">
                {loading ? '登录中...' : '进入后台'}
              </button>
            </div>
          </form>

          <div className="login-cards">
            <div className="feature-card">
              <div className="card-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <h3>文章管理</h3>
              <p>创建、编辑、发布文章</p>
            </div>
            <div className="feature-card">
              <div className="card-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <h3>分类标签</h3>
              <p>管理文章分类和标签</p>
            </div>
            <div className="feature-card">
              <div className="card-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              </div>
              <h3>系统设置</h3>
              <p>网站基本配置</p>
            </div>
          </div>
        </main>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <style>{`
          @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .admin-container { min-height: 100vh; position: relative; overflow: hidden; background: var(--bg); }
          .admin-bg { position: fixed; inset: 0; background: radial-gradient(ellipse 100% 80% at 50% 0%, rgba(37, 99, 235, 0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(220, 38, 38, 0.04) 0%, transparent 40%); z-index: 0; }
          .admin-header { position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 24px 48px; }
          .admin-logo { font: 700 16px var(--font-ui); color: var(--text-1); text-decoration: none; letter-spacing: 0.05em; }
          .admin-nav { display: flex; gap: 32px; }
          .admin-nav a { color: var(--text-3); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
          .admin-nav a:hover { color: var(--accent-cool); }
          .admin-main { position: relative; z-index: 10; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; max-width: 1200px; margin: 0 auto; padding: 48px; min-height: calc(100vh - 120px); }
          .login-panel { background: var(--surface-1); border: 1px solid var(--border); border-radius: 20px; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
          .login-badge { display: inline-block; padding: 6px 14px; background: var(--gradient-key); color: white; font-size: 11px; font-weight: 600; border-radius: 20px; margin-bottom: 24px; letter-spacing: 0.05em; }
          .login-title { font-size: 36px; font-weight: 700; margin-bottom: 12px; line-height: 1.2; letter-spacing: -0.02em; }
          .gradient-text { background: var(--gradient-key); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .login-desc { color: var(--text-3); margin-bottom: 32px; font-size: 15px; }
          .login-form { display: flex; flex-direction: column; gap: 16px; }
          .admin-input { width: 100%; padding: 16px 18px; border: 1px solid var(--border); border-radius: 12px; font-size: 15px; font-family: var(--font-ui); background: var(--surface-2); transition: all 0.2s; color: var(--text-1); }
          .admin-input:focus { outline: none; border-color: var(--accent-cool); box-shadow: 0 0 0 3px var(--accent-cool-soft); }
          .admin-input::placeholder { color: var(--text-4); }
          .admin-btn { padding: 16px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; font-family: var(--font-ui); cursor: pointer; transition: all 0.2s; border: none; }
          .admin-btn.primary { background: var(--text-1); color: white; }
          .admin-btn.primary:hover { background: var(--accent-cool); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25); }
          .admin-btn.primary:disabled { opacity: 0.5; transform: none; }
          .login-cards { display: flex; flex-direction: column; gap: 16px; }
          .feature-card { background: var(--surface-1); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
          .feature-card:hover { transform: translateX(-6px); border-color: var(--accent-cool); box-shadow: 0 8px 28px rgba(0,0,0,0.07); }
          .card-icon-wrap { width: 44px; height: 44px; background: var(--surface-2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: var(--accent-cool); }
          .feature-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; color: var(--text-1); }
          .feature-card p { color: var(--text-3); font-size: 13px; }
          @media (max-width: 900px) { .admin-main { grid-template-columns: 1fr; gap: 48px; } .login-cards { display: none; } .admin-header { padding: 20px 24px; } .login-panel { padding: 36px; } }
        `}</style>
      </div>
    )
  }

  // 文章列表页
  if (view === 'list') {
    return (
      <div className="admin-container">
        <div className="admin-bg" />

        <header className="admin-header">
          <Link href="/" className="admin-logo">博客站</Link>
          <div className="header-actions">
            <Link href="/posts" className="header-link">前台</Link>
            <button onClick={handleLogout} className="header-link logout">退出</button>
          </div>
        </header>

        <main className="admin-content">
          <div className="content-header">
            <div className="header-info">
              <span className="page-tag">文章管理</span>
              <h1>所有文章</h1>
              <p>共 {posts.length} 篇</p>
            </div>
            <button onClick={openNew} className="admin-btn primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新建文章
            </button>
          </div>

          <div className="posts-list">
            {posts.map((post, i) => {
              const plainText = stripMarkdown(post.content).substring(0, 80)
              return (
                <article key={post.id} className="post-item">
                  <div className="post-number">{String(i + 1).padStart(2, '0')}</div>
                  <div className="post-info">
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-excerpt">{post.excerpt || plainText}...</p>
                    <div className="post-meta">
                      <span className="meta-badge">{post.category || '未分类'}</span>
                      <span className="meta-dot"></span>
                      <span className="meta-item">{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                      <span className="meta-dot"></span>
                      <span className="meta-item">{post.viewCount} 次阅读</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag-badge">{tag}</span>
                        ))}
                        {post.tags.length > 3 && <span className="tag-more">+{post.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                  <div className="post-actions">
                    <button onClick={() => openEdit(post)} className="action-btn edit">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      编辑
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="action-btn delete">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      删除
                    </button>
                  </div>
                </article>
              )
            })}
            {posts.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <h3>暂无文章</h3>
                <p>点击「新建文章」开始创作</p>
              </div>
            )}
          </div>
        </main>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <style>{`
          .admin-container { min-height: 100vh; position: relative; overflow: hidden; background: var(--bg); }
          .admin-bg { position: fixed; inset: 0; background: radial-gradient(ellipse 100% 80% at 50% 0%, rgba(37, 99, 235, 0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(220, 38, 38, 0.04) 0%, transparent 40%); z-index: 0; }
          .admin-header { position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 24px 48px; border-bottom: 1px solid var(--border); background: var(--surface-1); }
          .admin-logo { font: 700 16px var(--font-ui); color: var(--text-1); text-decoration: none; }
          .header-actions { display: flex; gap: 28px; align-items: center; }
          .header-link { color: var(--text-3); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; background: none; border: none; cursor: pointer; font-family: var(--font-ui); }
          .header-link:hover { color: var(--accent-cool); }
          .header-link.logout:hover { color: var(--accent-warm); }
          .admin-content { position: relative; z-index: 10; max-width: 1000px; margin: 0 auto; padding: 48px; }
          .content-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
          .page-tag { display: inline-block; padding: 6px 14px; background: var(--surface-2); border-radius: 20px; font-size: 12px; color: var(--text-3); margin-bottom: 12px; font-weight: 500; }
          .header-info h1 { font-size: 32px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
          .header-info p { color: var(--text-3); font-size: 14px; }
          .admin-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; font-family: var(--font-ui); cursor: pointer; transition: all 0.2s; border: none; }
          .admin-btn.primary { background: var(--accent-cool); color: white; }
          .admin-btn.primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3); }
          .posts-list { display: flex; flex-direction: column; gap: 12px; }
          .post-item { display: flex; align-items: center; gap: 24px; background: var(--surface-1); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
          .post-item:hover { border-color: var(--accent-cool); box-shadow: 0 4px 16px rgba(37, 99, 235, 0.08); }
          .post-number { font: 600 13px var(--font-mono); color: var(--text-4); min-width: 32px; }
          .post-info { flex: 1; min-width: 0; }
          .post-title { font-size: 16px; font-weight: 600; color: var(--text-1); margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .post-excerpt { font-size: 13px; color: var(--text-3); margin-bottom: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .post-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .meta-badge { font-size: 11px; padding: 3px 10px; background: var(--accent-cool-soft); color: var(--accent-cool); border-radius: 10px; font-weight: 500; }
          .meta-item { font-size: 12px; color: var(--text-4); }
          .meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-4); }
          .post-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
          .tag-badge { font-size: 11px; padding: 3px 8px; background: var(--surface-2); color: var(--text-3); border-radius: 8px; }
          .tag-more { font-size: 11px; color: var(--text-4); padding: 3px 4px; }
          .post-actions { display: flex; gap: 10px; flex-shrink: 0; }
          .action-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; font-family: var(--font-ui); cursor: pointer; transition: all 0.2s; border: 1px solid var(--border); background: var(--surface-1); color: var(--text-2); }
          .action-btn.edit:hover { background: var(--accent-cool); color: white; border-color: var(--accent-cool); }
          .action-btn.delete:hover { background: var(--accent-warm); color: white; border-color: var(--accent-warm); }
          .empty-state { text-align: center; padding: 80px 40px; background: var(--surface-1); border: 1px dashed var(--border); border-radius: 20px; }
          .empty-icon { width: 72px; height: 72px; background: var(--surface-2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--text-4); }
          .empty-state h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
          .empty-state p { color: var(--text-3); font-size: 14px; }
          @media (max-width: 768px) { .post-item { flex-wrap: wrap; } .post-info { width: 100%; } .post-actions { width: 100%; justify-content: flex-end; } }
        `}</style>
      </div>
    )
  }

  // 编辑器页面 - 单栏垂直布局
  const titleLength = title.length
  const contentLength = content.length
  const excerptLength = excerpt.length
  const canSave = title.trim().length > 0 && content.trim().length > 0 && !loading

  return (
    <div className="admin-container">
      <div className="admin-bg" />

      <header className="editor-header">
        <Link href="/" className="admin-logo">博客站</Link>
        <button onClick={handleBack} className="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          返回文章列表
        </button>
      </header>

      <main className="editor-main">
        <div className="editor-container">
          {/* 页面标题 */}
          <div className="editor-page-header">
            <span className="page-tag">{editingPost ? '编辑' : '新建'}文章</span>
            <h1 className="editor-title">{editingPost ? '编辑文章' : '发布新文章'}</h1>
          </div>

          {/* 标题区域 */}
          <div className="editor-card">
            <div className="form-section">
              <div className="label-row">
                <label className="form-label">标题</label>
                <span className={`char-count ${titleLength > 180 ? 'warning' : ''}`}>{titleLength}/200</span>
              </div>
              <input
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 200))}
                placeholder="输入文章标题"
                className="title-input"
              />
            </div>
          </div>

          {/* 分类和标签 */}
          <div className="editor-row">
            <div className="editor-card flex-1">
              <div className="form-section">
                <label className="form-label">分类</label>
                <div className="tag-cloud">
                  {categories.length === 0 && <span className="no-data">暂无分类</span>}
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setCategoryId(categoryId === c.id ? '' : c.id)} className={`tag-chip ${categoryId === c.id ? 'active' : ''}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="editor-card flex-1">
              <div className="form-section">
                <label className="form-label">标签</label>
                <div className="tag-cloud">
                  {tags.length === 0 && <span className="no-data">暂无标签</span>}
                  {tags.map(t => (
                    <button key={t.id} onClick={() => setTagIds(tagIds.includes(t.id) ? tagIds.filter(id => id !== t.id) : [...tagIds, t.id])}
                      className={`tag-chip ${tagIds.includes(t.id) ? 'active' : ''}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="editor-card">
            <div className="form-section">
              <div className="label-row">
                <label className="form-label">内容</label>
                <div className="content-controls">
                  <button onClick={() => setShowPreview(!showPreview)} className={`preview-toggle ${showPreview ? 'active' : ''}`}>
                    {showPreview ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> 编辑</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> 预览</>
                    )}
                  </button>
                  <span className="char-count">{contentLength} 字</span>
                </div>
              </div>
              {showPreview ? (
                <div className="preview-content" dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
              ) : (
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="输入文章内容，支持 Markdown 语法..."
                  className="content-input"
                />
              )}
            </div>
          </div>

          {/* 摘要区域 */}
          <div className="editor-card">
            <div className="form-section">
              <div className="label-row">
                <label className="form-label">摘要</label>
                <span className="char-count hint">可选，不超过 200 字</span>
              </div>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value.slice(0, 200))}
                placeholder="简短描述文章内容，帮助读者快速了解..."
                className="excerpt-input"
              />
              <div className="excerpt-footer">
                <span className={`char-count ${excerptLength > 180 ? 'warning' : ''}`}>{excerptLength}/200</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="editor-footer">
            <button onClick={handleBack} className="admin-btn secondary">取消</button>
            <button onClick={handleSave} disabled={!canSave} className="admin-btn primary">
              {loading ? '保存中...' : (editingPost ? '保存修改' : '发布文章')}
            </button>
          </div>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        .editor-header { position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 20px 48px; border-bottom: 1px solid var(--border); background: var(--surface-1); }
        .back-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; font-family: var(--font-ui); cursor: pointer; transition: all 0.2s; background: var(--surface-2); color: var(--text-2); border: 1px solid var(--border); }
        .back-btn:hover { background: var(--accent-cool); color: white; border-color: var(--accent-cool); }
        .editor-main { position: relative; z-index: 10; padding: 40px 48px; }
        .editor-container { max-width: 840px; margin: 0 auto; }
        .editor-page-header { margin-bottom: 28px; }
        .page-tag { display: inline-block; padding: 6px 14px; background: var(--surface-2); border-radius: 20px; font-size: 12px; color: var(--text-3); font-weight: 500; }
        .editor-title { font-size: 26px; font-weight: 700; margin: 12px 0 0; letter-spacing: -0.02em; }
        .editor-card { background: var(--surface-1); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 16px; }
        .editor-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .flex-1 { flex: 1; }
        .form-section { }
        .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .form-label { font-weight: 600; font-size: 13px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.05em; }
        .char-count { font-size: 12px; color: var(--text-4); font-family: var(--font-mono); }
        .char-count.warning { color: var(--accent-warm); }
        .char-count.hint { color: var(--text-4); font-family: var(--font-ui); font-weight: 400; }
        .title-input { width: 100%; padding: 18px 20px; border: 1px solid var(--border); border-radius: 12px; font-size: 20px; font-weight: 600; font-family: var(--font-ui); background: var(--surface-2); color: var(--text-1); transition: all 0.2s; }
        .title-input:focus { outline: none; border-color: var(--accent-cool); box-shadow: 0 0 0 3px var(--accent-cool-soft); }
        .title-input::placeholder { color: var(--text-4); font-weight: 400; }
        .tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag-chip { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-family: var(--font-ui); background: var(--surface-2); border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; color: var(--text-2); }
        .tag-chip:hover { border-color: var(--accent-cool); color: var(--accent-cool); }
        .tag-chip.active { background: var(--accent-cool); color: white; border-color: var(--accent-cool); }
        .no-data { font-size: 13px; color: var(--text-4); padding: 4px 0; }
        .content-controls { display: flex; align-items: center; gap: 12px; }
        .preview-toggle { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 12px; font-family: var(--font-ui); font-weight: 500; background: var(--surface-2); border: 1px solid var(--border); cursor: pointer; color: var(--text-2); transition: all 0.2s; }
        .preview-toggle.active { background: var(--accent-cool); color: white; border-color: var(--accent-cool); }
        .content-input { width: 100%; min-height: 360px; padding: 18px 20px; border: 1px solid var(--border); border-radius: 12px; font-size: 14px; font-family: var(--font-mono); line-height: 1.8; background: var(--surface-2); resize: vertical; color: var(--text-1); transition: all 0.2s; }
        .content-input:focus { outline: none; border-color: var(--accent-cool); box-shadow: 0 0 0 3px var(--accent-cool-soft); }
        .content-input::placeholder { color: var(--text-4); }
        .preview-content { min-height: 360px; padding: 20px; background: var(--surface-2); border-radius: 12px; line-height: 1.8; font-size: 15px; color: var(--text-2); }
        .preview-content h1 { font-size: 24px; font-weight: 700; margin: 20px 0 12px; color: var(--text-1); }
        .preview-content h2 { font-size: 20px; font-weight: 600; margin: 16px 0 10px; color: var(--text-1); }
        .preview-content h3 { font-size: 17px; font-weight: 600; margin: 14px 0 8px; color: var(--text-1); }
        .preview-content code { background: var(--border-strong); padding: 3px 8px; border-radius: 6px; font-family: var(--font-mono); font-size: 13px; color: var(--accent-cool); }
        .preview-content strong { font-weight: 600; color: var(--text-1); }
        .excerpt-input { width: 100%; min-height: 90px; padding: 14px 16px; border: 1px solid var(--border); border-radius: 12px; font-size: 14px; font-family: var(--font-ui); background: var(--surface-2); resize: vertical; color: var(--text-1); transition: all 0.2s; }
        .excerpt-input:focus { outline: none; border-color: var(--accent-cool); box-shadow: 0 0 0 3px var(--accent-cool-soft); }
        .excerpt-input::placeholder { color: var(--text-4); }
        .excerpt-footer { text-align: right; margin-top: 8px; }
        .editor-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 0; }
        .admin-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; font-family: var(--font-ui); cursor: pointer; border: none; transition: all 0.2s; }
        .admin-btn.primary { background: var(--accent-cool); color: white; }
        .admin-btn.primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3); }
        .admin-btn.primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .admin-btn.secondary { background: var(--surface-2); color: var(--text-2); border: 1px solid var(--border); }
        .admin-btn.secondary:hover { background: var(--border); }
        @media (max-width: 768px) { .editor-header { padding: 16px 24px; } .editor-main { padding: 24px; } .editor-row { grid-template-columns: 1fr; } .editor-card { padding: 20px; } .editor-footer { flex-direction: column; } .admin-btn { width: 100%; justify-content: center; } }
      `}</style>
    </div>
  )
}