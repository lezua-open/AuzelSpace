import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import filesRoutes from './routes/files.js'
import versionsRoutes from './routes/versions.js'
import uploadsRoutes from './routes/uploads.js'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())

app.route('/api/files', filesRoutes)
app.route('/api', versionsRoutes)
app.route('/api/uploads', uploadsRoutes)

app.get('/api/health', (c) => c.json({ ok: true }))

const port = Number(process.env.PORT) || 3000

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})
