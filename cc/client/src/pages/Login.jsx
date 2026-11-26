import { useState } from 'react'
import { useApp } from '../services/AppContext.jsx'

const DEMOS = [
  ['Admin', 'admin@campus.edu', 'admin123'],
  ['Moderator', 'mod@campus.edu', 'mod123'],
  ['Student', 'student@campus.edu', 'student123']
]

// ---- sign-up validation (keep these rules in sync with server/routes/auth.js) ----
// Name: letters from ANY language (Urdu, Arabic, Latin...) plus spaces, . ' - ; no digits or symbols.
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}‌ .'’-]*$/u
// Email: one @, no spaces, no consecutive/leading/trailing dots, domain labels separated by single dots, valid extension.
const EMAIL_RE = /^[A-Za-z0-9_%+-]+(\.[A-Za-z0-9_%+-]+)*@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/

export const validateName = (v) => {
  const s = v.trim().replace(/\s+/g, ' ')
  if (!s) return 'Full name is required.'
  if (s.length < 2) return 'Name must be at least 2 characters.'
  if (s.length > 50) return 'Name must be 50 characters or fewer.'
  if (!NAME_RE.test(s)) return 'Name can contain letters only (no numbers or special characters).'
  return ''
}
export const validateEmail = (v) => {
  const s = v.trim()
  if (!s) return 'Email is required.'
  if (s.length > 254 || !EMAIL_RE.test(s)) return 'Enter a valid email address, e.g. name@example.com.'
  return ''
}
export const validatePassword = (v) => {
  if (!v || !v.trim()) return 'Password is required.'
  if (v.length < 8) return 'Password must be at least 8 characters.'
  if (v.length > 64) return 'Password must be 64 characters or fewer.'
  if (/\s/.test(v)) return 'Password cannot contain spaces.'
  if (!/[a-z]/.test(v)) return 'Password needs a lowercase letter.'
  if (!/[A-Z]/.test(v)) return 'Password needs an uppercase letter.'
  if (!/\d/.test(v)) return 'Password needs a number.'
  if (!/[^A-Za-z0-9\s]/.test(v)) return 'Password needs a special character (e.g. ! @ # $).'
  return ''
}

// Standard "eye" icon; `off` draws the slashed eye (shown while the password is visible).
const EyeIcon = ({ off }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
    {off && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
)

const Err = ({ msg }) => (msg ? <p className="text-xs text-red-600 mt-1">{msg}</p> : null)

export default function Login() {
  const { login, signup } = useApp()
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const signingUp = mode === 'signup'
  // Log in only checks that fields are filled; strict rules apply to NEW accounts only,
  // so existing users (and demo accounts) with older passwords can still sign in.
  const errors = signingUp
    ? { name: validateName(f.name), email: validateEmail(f.email), password: validatePassword(f.password) }
    : { name: '', email: f.email.trim() ? '' : 'Email is required.', password: f.password ? '' : 'Password is required.' }
  const show_ = (k) => (submitted ? errors[k] : '')

  const switchMode = (k) => {
    setMode(k)
    setSubmitted(false)
    setShow(false)
    setF({ name: '', email: f.email, password: '' }) // keep the email, clear the rest
  }

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (errors.name || errors.email || errors.password) return
    const email = f.email.trim().toLowerCase()
    if (signingUp) signup({ name: f.name.trim().replace(/\s+/g, ' '), email, password: f.password })
    else login(email, f.password)
  }

  return (
    <div className="min-h-screen bg-navy grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center text-white mb-6">
          <div className="w-14 h-14 rounded-full bg-accent grid place-items-center text-xl font-bold mx-auto mb-3">CC</div>
          <h1 className="text-3xl font-bold">Campus Connect</h1>
          <p className="text-slate-300 text-sm mt-1">The community for CS department students</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex bg-slate-100 rounded-full p-1 mb-4">
            {[['login', 'Log in'], ['signup', 'Sign up']].map(([k, l]) => (
              <button type="button" key={k} onClick={() => switchMode(k)} className={`flex-1 py-1.5 rounded-full text-sm font-semibold ${mode === k ? 'bg-white shadow text-navy' : 'text-slate-500'}`}>{l}</button>
            ))}
          </div>
          <form onSubmit={submit} noValidate className="space-y-3">
            {signingUp && (
              <div>
                <label className="label">Full name</label>
                <input className="input" value={f.name} maxLength={50} autoComplete="name" onChange={set('name')} />
                <Err msg={show_('name')} />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={f.email} maxLength={254} autoComplete="email" onChange={set('email')} />
              <Err msg={show_('email')} />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input pr-11"
                  value={f.password}
                  maxLength={64}
                  autoComplete={signingUp ? 'new-password' : 'current-password'}
                  onChange={set('password')}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  aria-pressed={show}
                  title={show ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-navy"
                >
                  <EyeIcon off={show} />
                </button>
              </div>
              <Err msg={show_('password')} />
              {signingUp && !show_('password') && (
                <p className="text-xs text-slate-500 mt-1">8–64 characters with uppercase, lowercase, a number and a special character.</p>
              )}
            </div>
            {signingUp && <p className="text-xs text-slate-500">New accounts join as <b>Student</b>.</p>}
            <button className="btn-primary w-full">{signingUp ? 'Create account' : 'Log in'}</button>
          </form>
          <p className="text-sm text-slate-500 text-center mt-4">
            {signingUp ? 'Already registered?' : 'New here?'}{' '}
            <button type="button" onClick={() => switchMode(signingUp ? 'login' : 'signup')} className="font-semibold text-navy underline">
              {signingUp ? 'Log in instead' : 'Create an account'}
            </button>
          </p>
          <div className="mt-5 pt-4 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-2 text-center">Demo login</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMOS.map(([role, e, p]) => <button type="button" key={role} onClick={() => login(e, p)} className="btn-outline btn-sm">{role}</button>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}