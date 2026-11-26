// Announcements and events: anyone logged in can read (via /bootstrap), only admins can write.
import { Router } from 'express'
import db, { uid } from '../db.js'
import { HttpError, auth, requireAdmin, upload, attachmentFields, clean, normLink } from '../middleware.js'

const r = Router()
r.use(auth, requireAdmin)

// ---- announcements ----
r.post('/announcements', upload.single('file'), (req, res) => {
  const title = clean(req.body.title, 200), text = clean(req.body.text)
  if (!title || !text) throw new HttpError(400, 'Title and text are required.')
  const a = attachmentFields(req.file)
  db.prepare('INSERT INTO announcements (id,title,text,label,link,attachment_name,attachment_url,attachment_type,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(uid('a'), title, text, clean(req.body.label, 200), normLink(req.body.link), a.name, a.url, a.type, Date.now())
  res.status(201).json({ ok: true })
})
r.delete('/announcements/:id', (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

// ---- events ----
function readEvent(body) {
  const e = { title: clean(body.title, 200), description: clean(body.description, 2000), date: clean(body.date, 10), time: clean(body.time, 5), venue: clean(body.venue, 200) }
  if (!e.title || !e.venue) throw new HttpError(400, 'Title and venue are required.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !/^\d{2}:\d{2}$/.test(e.time)) throw new HttpError(400, 'Valid date and time are required.')
  return e
}
r.post('/events', (req, res) => {
  const e = readEvent(req.body)
  db.prepare('INSERT INTO events (id,title,description,date,time,venue) VALUES (?,?,?,?,?,?)').run(uid('e'), e.title, e.description, e.date, e.time, e.venue)
  res.status(201).json({ ok: true })
})
r.put('/events/:id', (req, res) => {
  const e = readEvent(req.body)
  const info = db.prepare('UPDATE events SET title=?, description=?, date=?, time=?, venue=? WHERE id=?').run(e.title, e.description, e.date, e.time, e.venue, req.params.id)
  if (!info.changes) throw new HttpError(404, 'Event not found.')
  res.json({ ok: true })
})
r.post('/events/:id/cancel', (req, res) => {
  const info = db.prepare("UPDATE events SET status='Cancelled' WHERE id=?").run(req.params.id)
  if (!info.changes) throw new HttpError(404, 'Event not found.')
  res.json({ ok: true })
})

export default r
