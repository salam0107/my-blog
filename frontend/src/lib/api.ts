const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  categoryId?: string;
  tags: string[];
  createdAt: string;
  viewCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return res.json();
}

// Posts
export async function getPosts(params?: { page?: number; limit?: number; category?: string; tag?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.search) query.set('search', params.search);
  
  const queryString = query.toString();
  return fetchAPI<{ posts: Post[]; pagination: any }>(`/posts${queryString ? `?${queryString}` : ''}`);
}

export async function getPost(id: string) {
  return fetchAPI<Post>(`/posts/${id}`);
}

// Categories
export async function getCategories() {
  return fetchAPI<Category[]>('/categories');
}

// Tags
export async function getTags() {
  return fetchAPI<Tag[]>('/tags');
}

// Auth
export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error || 'Login failed');
  }
  
  return res.json();
}

export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(error.error || 'Registration failed');
  }
  
  return res.json();
}

// Authenticated requests
export async function apiFetch<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  return fetchAPI<T>(path, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}