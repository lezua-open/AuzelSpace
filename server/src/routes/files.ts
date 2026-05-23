import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import db from '../db.js'

const app = new Hono()

// List all files
app.get('/', (c) => {
  const files = db.prepare('SELECT id, name, content FROM files').all()
  return c.json(files)
})

// Create file
app.post('/', async (c) => {
  const body = await c.req.json<{ name: string; content?: string }>()
  const id = randomUUID()
  db.prepare('INSERT INTO files (id, name, content) VALUES (?, ?, ?)').run(
    id,
    body.name,
    body.content ?? '',
  )
  const file = db.prepare('SELECT id, name, content FROM files WHERE id = ?').get(id)
  return c.json(file, 201)
})

// Update file
app.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ name?: string; content?: string }>()

  const existing = db.prepare('SELECT id FROM files WHERE id = ?').get(id)
  if (!existing) return c.json({ error: 'File not found' }, 404)

  if (body.name !== undefined) {
    db.prepare('UPDATE files SET name = ? WHERE id = ?').run(body.name, id)
  }
  if (body.content !== undefined) {
    db.prepare('UPDATE files SET content = ? WHERE id = ?').run(body.content, id)
  }

  const file = db.prepare('SELECT id, name, content FROM files WHERE id = ?').get(id)
  return c.json(file)
})

// Delete file (cascade deletes versions via FK)
app.delete('/:id', (c) => {
  const id = c.req.param('id')
  const result = db.prepare('DELETE FROM files WHERE id = ?').run(id)
  if (result.changes === 0) return c.json({ error: 'File not found' }, 404)

  // Enforce at least one file remains
  const count = db.prepare('SELECT COUNT(*) as cnt FROM files').get() as { cnt: number }
  if (count.cnt === 0) {
    // Re-insert a default file
    const defaultId = randomUUID()
    db.prepare('INSERT INTO files (id, name, content) VALUES (?, ?, ?)').run(
      defaultId,
      '未命名.md',
      '',
    )
  }

  return c.json({ ok: true })
})

export default app
