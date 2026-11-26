import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db, { uid } from '../db.js'
import { HttpError, auth, signToken } from '../middleware.js'
import { buildState } from '../state.js'

const r = Router()

// ---- sign-up validation (keep these rules in sync with client/src/pages/Login.jsx) ----
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}‌ .'’-]*$/u            // letters of any language, no digits/symbols
// Email: one @, no spaces, no consecutive/leading/trailing dots, domain labels separated by single dots, valid extension.
const EMAIL_RE = /^[A-Za-z0-9_%+-]+(\.[A-Za-z0-9_%+-]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/

const normEmail = (v) => String(v ?? '').trim().toLowerCase()
const normName = (v) => String(v ?? '').trim().replace(/\s+/g, ' ')

function nameError(name) {
  if (!name) return 'Full name is required.'
  if (name.length < 2) return 'Name must be at least 2 characters.'
  if (name.length > 50) return 'Name must be 50 characters or fewer.'
  if (!NAME_RE.test(name)) return 'Name can contain letters only (no numbers or special characters).'
}
function emailError(email) {
  if (!email) return 'Email is required.'
  if (email.length > 254 || !EMAIL_RE.test(email)) return 'Enter a valid email address, e.g. name@example.com.'
}
function passwordError(p) {
  if (!p || !p.trim()) return 'Password is required.'
  if (p.length < 8) return 'Password must be at least 8 characters.'
  if (p.length > 64 || Buffer.byteLength(p) > 72) return 'Password is too long (64 characters max).' // bcrypt only reads 72 bytes
  if (/\s/.test(p)) return 'Password cannot contain spaces.'
  if (!/[a-z]/.test(p)) return 'Password needs a lowercase letter.'
  if (!/[A-Z]/.test(p)) return 'Password needs an uppercase letter.'
  if (!/\d/.test(p)) return 'Password needs a number.'
  if (!/[^A-Za-z0-9\s]/.test(p)) return 'Password needs a special character (e.g. ! @ # $).'
}

// Log in: only checks credentials. Strict password rules apply to new accounts, so
// existing users (and demo accounts) with older passwords can still sign in.
r.post('/auth/login', (req, res) => {
  const email = normEmail(req.body.email)
  const password = String(req.body.password ?? '')
  if (!email || !password) throw new HttpError(400, 'Enter your email and password.')
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)   // email column is case-insensitive
  if (!user || !bcrypt.compareSync(password, user.password_hash)) throw new HttpError(401, 'Invalid email or password.')
  res.json({ token: signToken(user) })
})

// Public sign-up always creates a Student. Roles are only changed by admins.
r.post('/auth/signup', (req, res) => {
  const name = normName(req.body.name), email = normEmail(req.body.email), password = String(req.body.password ?? '')
  const problem = nameError(name) || emailError(email) || passwordError(password)
  if (problem) throw new HttpError(400, problem)
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
    throw new HttpError(409, 'Email already registered.')
  }
  const user = { id: uid('u'), name, email, password_hash: bcrypt.hashSync(password, 10), role: 'Student', title: '', joined_at: Date.now() }
  db.prepare('INSERT INTO users VALUES (@id,@name,@email,@password_hash,@role,@title,@joined_at)').run(user)
  res.status(201).json({ token: signToken(user) })
})

// One call returns everything the UI needs for this user.
r.get('/bootstrap', auth, (req, res) => res.json(buildState(req.user)))

export default r