import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { seedIfEmpty } from './seed.js'
import { UPLOAD_DIR, HttpError } from './middleware.js'
import authRoutes from './routes/auth.js'
import communityRoutes from './routes/community.js'
import officialRoutes from './routes/official.js'
import adminRoutes from './routes/admin.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(UPLOAD_DIR))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api', authRoutes)
app.use('/api', communityRoutes)
app.use('/api', officialRoutes)
app.use('/api', adminRoutes)
app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found.')))

// In production, serve the built React app from the same server (one deployment).
const dist = path.join(here, '..', 'client', 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

// Central error handler: every failure becomes { error: "message" }.
app.use((err, _req, res, _next) => {
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 400 : 500)
  const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (5 MB max).' : status === 500 ? 'Something went wrong on the server.' : err.message
  if (status === 500) console.error(err)
  res.status(status).json({ error: message })
})

if (seedIfEmpty()) console.log('Seeded demo data.')
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Campus Connect running on http://localhost:${PORT}`))
