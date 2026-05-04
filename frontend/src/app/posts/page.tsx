'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPosts, getCategories, type Post, type Category } from '@/lib/api'

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCat, setActiveCat] = useState('全部')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeCat, search])

  async function loadData() {
    setLoading(true)
    try {
      const [postsRes, catsRes] = await Promise.all([
        getPosts({ category: activeCat === '全部' ? undefined : activeCat, search: search || undefined }),
        getCategories()
      ])
      setPosts(postsRes.posts)
      setCategories(catsRes)
    } catch (e) {
      console.error('Load failed:', e)
    } finally {
      setLoading(false)
    }
  }

  const cats = ['全部', ...categories.map(c => c.name)]

  return (
    <div className="container">
      <header className="header">
        <Link href="/" className="logo">博客站</Link>
        <nav className="nav-links">
          <Link href="/posts" className="nav-link active">文章</Link>
          <Link href="/archives" className="nav-link">归档</Link>
          <Link href="/works" className="nav-link">作品集</Link>
          <Link href="/about" className="nav-link">关于</Link>
          <Link href="/admin" className="nav-link login-btn">登录</Link>
        </nav>
      </header>

      <main className="content">
        <div className="filters">
          <input 
            type="text" 
            placeholder="搜索文章..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="categories">
            {cats.map(cat => (
              <button 
                key={cat}
                className={`cat-btn ${activeCat === cat ? 'active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <article key={post.id} className="post-card" onClick={() => window.location.href = `/posts/${post.id}`}>
                <div className="post-meta">
                  <span className="post-date">{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                  <span className="post-cat">{post.category}</span>
                </div>
                <h2 className="post-title">{post.title}</h2>
                <p className="post-excerpt">{post.excerpt}</p>
              </article>
            ))}
            {posts.length === 0 && (
              <p className="no-results">暂无文章</p>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        © 2026 我的博客站
      </footer>

      <style>{`
        .content { flex: 1; padding: 32px 0; }
        .filters { margin-bottom: 32px; }
        .search-input {
          width: 100%;
          max-width: 400px;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 14px;
          background: var(--surface-1);
          outline: none;
          transition: border-color 0.3s;
        }
        .search-input:focus { border-color: var(--accent-cool); }
        .categories { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
        .cat-btn {
          padding: 8px 20px;
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 13px;
          background: var(--surface-1);
          cursor: pointer;
          transition: all 0.3s;
        }
        .cat-btn:hover { border-color: var(--accent-cool); }
        .cat-btn.active { background: var(--accent-cool); color: white; border-color: var(--accent-cool); }
        .posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .post-card {
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .post-card:hover { border-color: var(--accent-cool); transform: translateY(-4px); }
        .post-meta { display: flex; gap: 12px; margin-bottom: 12px; }
        .post-date { font-size: 12px; color: var(--text-4); }
        .post-cat { font-size: 11px; color: var(--accent-cool); background: var(--accent-cool-soft); padding: 2px 10px; border-radius: 10px; }
        .post-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .post-excerpt { font-size: 14px; color: var(--text-3); line-height: 1.6; }
        .no-results { color: var(--text-3); text-align: center; padding: 48px; }
        .loading { color: var(--text-3); text-align: center; padding: 48px; }
        .nav-link.active { color: var(--accent-cool); }
      `}</style>
    </div>
  )
}