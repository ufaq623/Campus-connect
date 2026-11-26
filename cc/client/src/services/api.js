// HTTP client for the Express/SQLite backend. The server is the source of truth and
// enforces every permission; the helpers at the bottom only decide which buttons to show.
const TOKEN_KEY = 'cc_token'
const BASE = import.meta.env.VITE_API_URL || ''

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function req(method, path, body) {
  const isForm = body instanceof FormData
  const headers = {}
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  let res
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined })
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.status = res.status; throw e }
  return data
}
const form = (fields, file) => {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v ?? ''))
  if (file) fd.append('file', file)
  return fd
}

// ---------- auth ----------
export const login = async (email, password) => setToken((await req('POST', '/auth/login', { email, password })).token)
export const signup = async (data) => setToken((await req('POST', '/auth/signup', data)).token)
export const bootstrap = () => req('GET', '/bootstrap')

// ---------- clubs ----------
export const toggleJoin = (clubId, joined) => req(joined ? 'DELETE' : 'POST', `/clubs/${clubId}/join`)

// ---------- posts ----------
export const createPost = ({ clubId, title, text, link, file }) => req('POST', '/posts', form({ clubId, title, text, link }, file))
export const deletePost = (id) => req('DELETE', `/posts/${id}`)
export const togglePin = (id) => req('POST', `/posts/${id}/pin`)
export const vote = (id, value) => req('PUT', `/posts/${id}/vote`, { value })
export const toggleBookmark = (id) => req('POST', `/posts/${id}/bookmark`)

// ---------- comments ----------
export const addComment = ({ postId, parentId = null, text }) => req('POST', `/posts/${postId}/comments`, { text, parentId })
export const deleteComment = (id) => req('DELETE', `/comments/${id}`)

// ---------- announcements & events (admin) ----------
export const addAnnouncement = ({ title, text, label, link, file }) => req('POST', '/announcements', form({ title, text, label, link }, file))
export const deleteAnnouncement = (id) => req('DELETE', `/announcements/${id}`)
export const saveEvent = (ev) => (ev.id ? req('PUT', `/events/${ev.id}`, ev) : req('POST', '/events', ev))
export const cancelEvent = (id) => req('POST', `/events/${id}/cancel`)

// ---------- club requests & moderators ----------
export const requestClub = (data) => req('POST', '/club-requests', data)
export const reviewRequest = (id, approve) => req('POST', `/club-requests/${id}/review`, { approve })
export const assignModerator = (userId, clubId) => req('POST', '/admin/moderators', { userId, clubId })
export const removeModerator = (userId, clubId) => req('DELETE', `/admin/moderators/${userId}/${clubId}`)

// ---------- UI-only helpers (the server re-checks all of these) ----------
export const isAdmin = (u) => u?.role === 'Admin'
export const isModOf = (u, clubId) => u?.role === 'Moderator' && u.modClubs.includes(clubId)
export const canManagePost = (u, post) => isAdmin(u) || isModOf(u, post.clubId)
export const canDeleteComment = (u, c, post) => isAdmin(u) || c.authorId === u?.id || isModOf(u, post?.clubId)
export const score = (post) => Object.values(post.votes).reduce((a, b) => a + b, 0)
