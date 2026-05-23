import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import db from '../db.js'

const app = new Hono()

// List versions for a file
app.get('/files/:fileId/versions', (c) => {
  const fileId = c.req.param('fileId')
  const versions = db
    .prepare(
      `SELECT id, file_id as fileId, name, note, content, published, created_at as createdAt
       FROM versions WHERE file_id = ? ORDER BY created_at DESC`,
    )
    .all(fileId)
  return c.json(versions)
})

// Create version (snapshot current file content)
app.post('/files/:fileId/versions', async (c) => {
  const fileId = c.req.param('fileId')
  const body = await c.req.json<{ name: string; note?: string; published?: boolean }>()

  const file = db.prepare('SELECT content FROM files WHERE id = ?').get(fileId) as
    | { content: string }
    | undefined
  if (!file) return c.json({ error: 'File not found' }, 404)

  const id = randomUUID()
  db.prepare(
    'INSERT INTO versions (id, file_id, name, note, content, published, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(id, fileId, body.name, body.note ?? '', file.content, body.published ? 1 : 0, Date.now())

  const version = db
    .prepare(
      `SELECT id, file_id as fileId, name, note, content, published, created_at as createdAt
       FROM versions WHERE id = ?`,
    )
    .get(id)
  return c.json(version, 201)
})

// Delete version
app.delete('/versions/:id', (c) => {
  const id = c.req.param('id')
  const result = db.prepare('DELETE FROM versions WHERE id = ?').run(id)
  if (result.changes === 0) return c.json({ error: 'Version not found' }, 404)
  return c.json({ ok: true })
})

export default app
