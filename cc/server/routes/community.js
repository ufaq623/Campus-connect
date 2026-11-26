// Clubs, posts, votes, bookmarks, comments.
import { Router } from 'express'
import db, { uid } from '../db.js'
import { HttpError, auth, canManageClub, upload, attachmentFields, clean, normLink } from '../middleware.js'

const r = Router()
r.use(auth)

const getPost = (id) => db.prepare('SELECT * FROM posts WHERE id = ?').get(id) || (() => { throw new HttpError(404, 'Post not found.') })()
const getClub = (id) => db.prepare('SELECT * FROM clubs WHERE id = ?').get(id) || (() => { throw new HttpError(404, 'Club not found.') })()

// ---- clubs ----
r.post('/clubs/:id/join', (req, res) => {
  getClub(req.params.id)
  db.prepare('INSERT OR IGNORE INTO memberships VALUES (?,?)').run(req.user.id, req.params.id)
  res.json({ ok: true })
})
r.delete('/clubs/:id/join', (req, res) => {
  db.prepare('DELETE FROM memberships WHERE user_id = ? AND club_id = ?').run(req.user.id, req.params.id)
  res.json({ ok: true })
})

// ---- posts ----
r.post('/posts', upload.single('file'), (req, res) => {
  const clubId = clean(req.body.clubId, 50), title = clean(req.body.title, 200)
  getClub(clubId)
  if (!title) throw new HttpError(400, 'Title is required.')
  const isMember = db.prepare('SELECT 1 FROM memberships WHERE user_id = ? AND club_id = ?').get(req.user.id, clubId)
  if (!isMember && req.user.role !== 'Admin') throw new HttpError(403, 'Join this club to post.')
  const a = attachmentFields(req.file)
  const id = uid('p')
  db.prepare(`INSERT INTO posts (id,club_id,author_id,title,text,link,attachment_name,attachment_url,attachment_type,created_at)
              VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(id, clubId, req.user.id, title, clean(req.body.text), normLink(req.body.link), a.name, a.url, a.type, Date.now())
  db.prepare('INSERT INTO votes VALUES (?,?,1)').run(id, req.user.id)
  res.status(201).json({ id })
})

r.delete('/posts/:id', (req, res) => {
  const p = getPost(req.params.id)
  if (!canManageClub(req.user, p.club_id)) throw new HttpError(403, 'Only admins and this club\'s moderators can delete posts.')
  db.prepare('DELETE FROM posts WHERE id = ?').run(p.id) // votes, bookmarks, comments cascade
  res.json({ ok: true })
})

r.post('/posts/:id/pin', (req, res) => {
  const p = getPost(req.params.id)
  if (!canManageClub(req.user, p.club_id)) throw new HttpError(403, 'Only admins and this club\'s moderators can pin posts.')
  db.prepare('UPDATE posts SET pinned = 1 - pinned WHERE id = ?').run(p.id)
  res.json({ ok: true })
})

r.put('/posts/:id/vote', (req, res) => {
  const p = getPost(req.params.id)
  const value = Number(req.body.value)
  if (![1, -1].includes(value)) throw new HttpError(400, 'Vote must be 1 or -1.')
  const cur = db.prepare('SELECT value FROM votes WHERE post_id = ? AND user_id = ?').get(p.id, req.user.id)
  if (cur?.value === value) db.prepare('DELETE FROM votes WHERE post_id = ? AND user_id = ?').run(p.id, req.user.id) // click again to undo
  else db.prepare('INSERT OR REPLACE INTO votes VALUES (?,?,?)').run(p.id, req.user.id, value)
  res.json({ ok: true })
})

r.post('/posts/:id/bookmark', (req, res) => {
  const p = getPost(req.params.id)
  const has = db.prepare('SELECT 1 FROM bookmarks WHERE user_id = ? AND post_id = ?').get(req.user.id, p.id)
  if (has) db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?').run(req.user.id, p.id)
  else db.prepare('INSERT INTO bookmarks VALUES (?,?)').run(req.user.id, p.id)
  res.json({ ok: true })
})

// ---- comments & replies ----
r.post('/posts/:id/comments', (req, res) => {
  const p = getPost(req.params.id)
  const text = clean(req.body.text, 2000)
  if (!text) throw new HttpError(400, 'Comment cannot be empty.')
  const parentId = req.body.parentId || null
  if (parentId && !db.prepare('SELECT 1 FROM comments WHERE id = ? AND post_id = ?').get(parentId, p.id)) throw new HttpError(400, 'Parent comment not found.')
  db.prepare('INSERT INTO comments VALUES (?,?,?,?,?,?)').run(uid('cm'), p.id, parentId, req.user.id, text, Date.now())
  res.status(201).json({ ok: true })
})

r.delete('/comments/:id', (req, res) => {
  const c = db.prepare('SELECT c.*, p.club_id FROM comments c JOIN posts p ON p.id = c.post_id WHERE c.id = ?').get(req.params.id)
  if (!c) throw new HttpError(404, 'Comment not found.')
  if (c.author_id !== req.user.id && !canManageClub(req.user, c.club_id)) throw new HttpError(403, 'You cannot delete this comment.')
  db.prepare('DELETE FROM comments WHERE id = ?').run(c.id) // replies cascade
  res.json({ ok: true })
})

export default r
