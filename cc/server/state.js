// Builds the JSON snapshot the frontend renders (shaped for the logged-in user's permissions).
import db from './db.js'

const att = (r) => (r.attachment_url ? { name: r.attachment_name, url: r.attachment_url, type: r.attachment_type } : null)

export function buildState(me) {
  const isAdmin = me.role === 'Admin'
  const member = {}, mod = {}
  db.prepare('SELECT user_id, club_id FROM memberships').all().forEach((r) => (member[r.user_id] ||= []).push(r.club_id))
  db.prepare('SELECT user_id, club_id FROM moderators').all().forEach((r) => (mod[r.user_id] ||= []).push(r.club_id))
  const bookmarks = db.prepare('SELECT post_id FROM bookmarks WHERE user_id = ?').all(me.id).map((r) => r.post_id)

  const shape = (u) => ({
    id: u.id, name: u.name, role: u.role, title: u.title, joinedAt: u.joined_at,
    joinedClubs: member[u.id] || [], modClubs: mod[u.id] || [],
    ...(isAdmin || u.id === me.id ? { email: u.email } : {}),
    bookmarks: u.id === me.id ? bookmarks : []
  })

  const counts = {}
  Object.values(member).forEach((list) => list.forEach((c) => (counts[c] = (counts[c] || 0) + 1)))

  const votes = {}
  db.prepare('SELECT post_id, user_id, value FROM votes').all().forEach((v) => ((votes[v.post_id] ||= {})[v.user_id] = v.value))

  return {
    me: shape(me),
    users: db.prepare('SELECT * FROM users').all().map(shape),
    clubs: db.prepare('SELECT * FROM clubs ORDER BY rowid').all().map((c) => ({
      id: c.id, name: c.name, emoji: c.emoji, description: c.description, memberCount: c.base_members + (counts[c.id] || 0)
    })),
    posts: db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all().map((p) => ({
      id: p.id, clubId: p.club_id, authorId: p.author_id, title: p.title, text: p.text, link: p.link,
      pinned: !!p.pinned, createdAt: p.created_at, votes: votes[p.id] || {}, attachment: att(p)
    })),
    comments: db.prepare('SELECT * FROM comments ORDER BY created_at').all().map((c) => ({
      id: c.id, postId: c.post_id, parentId: c.parent_id, authorId: c.author_id, text: c.text, createdAt: c.created_at
    })),
    announcements: db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all().map((a) => ({
      id: a.id, title: a.title, text: a.text, label: a.label, link: a.link, createdAt: a.created_at, attachment: att(a)
    })),
    events: db.prepare('SELECT * FROM events').all(),
    clubRequests: db.prepare(`SELECT * FROM club_requests ${isAdmin ? '' : 'WHERE user_id = ?'} ORDER BY created_at DESC`)
      .all(...(isAdmin ? [] : [me.id])).map((r) => ({
        id: r.id, name: r.name, description: r.description, reason: r.reason, userId: r.user_id, status: r.status, createdAt: r.created_at
      }))
  }
}
