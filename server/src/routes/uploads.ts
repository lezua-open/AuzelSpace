import { Hono } from 'hono'
import { randomUUID } from 'crypto'
import { extname, resolve, dirname } from 'path'
import { mkdirSync, existsSync, createReadStream, statSync } from 'fs'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadDir = process.env.UPLOAD_DIR ?? resolve(__dirname, '..', 'storage')
mkdirSync(uploadDir, { recursive: true })

const app = new Hono()

// Upload image
app.post('/', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file']

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file provided' }, 400)
  }

  const ext = extname(file.name) || '.bin'
  const filename = `${randomUUID()}${ext}`
  const filepath = resolve(uploadDir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  const { createWriteStream: cws } = await import('fs')
  const ws = cws(filepath)
  ws.write(buffer)
  ws.end()

  await new Promise<void>((resolve) => ws.on('finish', resolve))

  return c.json({ url: `/api/uploads/${filename}` }, 201)
})

// Serve uploaded file
app.get('/:filename', (c) => {
  const filename = c.req.param('filename')
  const filepath = resolve(uploadDir, filename)

  if (!existsSync(filepath)) {
    return c.json({ error: 'File not found' }, 404)
  }

  const stat = statSync(filepath)
  const ext = extname(filepath).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
  }
  const contentType = mimeMap[ext] ?? 'application/octet-stream'

  c.header('Content-Type', contentType)
  c.header('Content-Length', String(stat.size))
  c.header('Cache-Control', 'public, max-age=31536000')

  const stream = createReadStream(filepath)
  return new Response(stream as unknown as ReadableStream, {
    headers: c.res.headers,
  })
})

export default app
