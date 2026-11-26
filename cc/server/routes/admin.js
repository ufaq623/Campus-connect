// Club requests (students submit, admins review) and moderator assignment (admins).
import { Router } from 'express'
import db, { uid } from '../db.js'
import { HttpError, auth, requireAdmin, clean } from '../middleware.js'

const r = Router()
r.use(auth)

r.post('/club-requests', (req, res) => {
  const name = clean(req.body.name, 100), description = clean(req.body.description, 1000), reason = clean(req.body.reason, 1000)
  if (!name || !description || !reason) throw new HttpError(400, 'Please fill in all fields.')
  if (db.prepare('SELECT 1 FROM clubs WHERE name = ?').get(name)) throw new HttpError(409, 'A club with that name already exists.')
  db.prepare('INSERT INTO club_requests (id,name,description,reason,user_id,created_at) VALUES (?,?,?,?,?,?)').run(uid('r'), name, description, reason, req.user.id, Date.now())
  res.status(201).json({ ok: true })
})

r.post('/club-requests/:id/review', requireAdmin, (req, res) => {
  const reqRow = db.prepare('SELECT * FROM club_requests WHERE id = ?').get(req.params.id)
  if (!reqRow) throw new HttpError(404, 'Request not found.')
  if (reqRow.status !== 'pending') throw new HttpError(400, 'This request was already reviewed.')
  const approve = !!req.body.approve
  db.transaction(() => {
    db.prepare('UPDATE club_requests SET status = ? WHERE id = ?').run(approve ? 'approved' : 'rejected', reqRow.id)
    if (approve) {
      const clubId = uid('c')
      db.prepare('INSERT INTO clubs (id,name,emoji,description,base_members) VALUES (?,?,?,?,0)').run(clubId, reqRow.name, '🌟', reqRow.description)
      db.prepare('INSERT OR IGNORE INTO memberships VALUES (?,?)').run(reqRow.user_id, clubId)
    }
  })()
  res.json({ ok: true })
})

r.post('/admin/moderators', requireAdmin, (req, res) => {
  const { userId, clubId } = req.body
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!u || u.role === 'Admin') throw new HttpError(400, 'Pick a valid user.')
  if (!db.prepare('SELECT 1 FROM clubs WHERE id = ?').get(clubId)) throw new HttpError(404, 'Club not found.')
  db.transaction(() => {
    db.prepare('INSERT OR IGNORE INTO moderators VALUES (?,?)').run(userId, clubId)
    db.prepare('INSERT OR IGNORE INTO memberships VALUES (?,?)').run(userId, clubId)
    db.prepare("UPDATE users SET role = 'Moderator' WHERE id = ?").run(userId)
  })()
  res.json({ ok: true })
})

r.delete('/admin/moderators/:userId/:clubId', requireAdmin, (req, res) => {
  db.transaction(() => {
    db.prepare('DELETE FROM moderators WHERE user_id = ? AND club_id = ?').run(req.params.userId, req.params.clubId)
    const left = db.prepare('SELECT COUNT(*) n FROM moderators WHERE user_id = ?').get(req.params.userId).n
    if (!left) db.prepare("UPDATE users SET role = 'Student' WHERE id = ? AND role = 'Moderator'").run(req.params.userId)
  })()
  res.json({ ok: true })
})

export default r
