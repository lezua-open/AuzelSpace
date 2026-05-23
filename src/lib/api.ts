import type { MarkdownFile, Version } from '@/view/edit/samples'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

// ── Files ──

export function fetchFiles(): Promise<MarkdownFile[]> {
  return request('/files')
}

export function createFile(name: string, content = ''): Promise<MarkdownFile> {
  return request('/files', {
    method: 'POST',
    body: JSON.stringify({ name, content }),
  })
}

export function updateFile(
  id: string,
  data: { name?: string; content?: string },
): Promise<MarkdownFile> {
  return request(`/files/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteFile(id: string): Promise<void> {
  return request(`/files/${id}`, { method: 'DELETE' })
}

// ── Versions ──

export function fetchVersions(fileId: string): Promise<Version[]> {
  return request(`/files/${fileId}/versions`)
}

export function createVersion(
  fileId: string,
  name: string,
  note = '',
  published = false,
): Promise<Version> {
  return request(`/files/${fileId}/versions`, {
    method: 'POST',
    body: JSON.stringify({ name, note, published }),
  })
}

export function deleteVersion(id: string): Promise<void> {
  return request(`/versions/${id}`, { method: 'DELETE' })
}

// ── Uploads ──

export async function uploadImage(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/uploads`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}
