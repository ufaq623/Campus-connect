import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import db, { uid } from './db.js'

export const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status } }

// ---- authentication / authorization ----
export function auth(req, _res, next) {
  const header = req.headers.authorization || ''
  try {
    const { id } = jwt.verify(header.startsWith('Bearer ') ? header.slice(7) : '', SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    if (!user) throw new Error('no user')
    req.user = user
    next()
  } catch { next(new HttpError(401, 'Please log in again.')) }
}
export const requireAdmin = (req, _res, next) => (req.user.role === 'Admin' ? next() : next(new HttpError(403, 'Admins only.')))
export const isModOf = (userId, clubId) => !!db.prepare('SELECT 1 FROM moderators WHERE user_id = ? AND club_id = ?').get(userId, clubId)
export const canManageClub = (user, clubId) => user.role === 'Admin' || isModOf(user.id, clubId)
export const signToken = (user) => jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' })

// ---- file uploads (images + documents, 5 MB max) ----
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
const ALLOWED = /\.(png|jpe?g|gif|webp|pdf|docx?|pptx?|xlsx?|txt|zip)$/i
export const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, uid('f') + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => (ALLOWED.test(file.originalname) ? cb(null, true) : cb(new HttpError(400, 'Unsupported file type.')))
})
export const attachmentFields = (file) => file
  ? { name: file.originalname, url: '/uploads/' + file.filename, type: file.mimetype }
  : { name: null, url: null, type: null }

export const clean = (v, max = 5000) => String(v ?? '').trim().slice(0, max)
export const normLink = (l) => { l = clean(l, 500); return l && !/^https?:\/\//i.test(l) ? 'https://' + l : l }
