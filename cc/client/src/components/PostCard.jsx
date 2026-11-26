import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'
import { timeAgo } from '../services/utils.js'
import CommentSection from './CommentSection.jsx'
import RoleBadge from './RoleBadge.jsx'

export default function PostCard({ post, showClub = true }) {
  const { db, user, act } = useApp()
  const [open, setOpen] = useState(false)
  const club = db.clubs.find((c) => c.id === post.clubId)
  const author = db.users.find((u) => u.id === post.authorId)
  const my = post.votes[user.id] || 0
  const count = db.comments.filter((c) => c.postId === post.id).length
  const marked = user.bookmarks.includes(post.id)
  const manage = api.canManagePost(user, post)
  const arrow = (val, active, color) => `p-1 rounded hover:bg-slate-100 ${active ? color : 'text-slate-400'}`

  return (
    <article className={`card p-3 sm:p-4 flex gap-3 ${post.pinned ? 'border-accent/60' : ''}`}>
      <div className="flex flex-col items-center w-8 shrink-0">
        <button aria-label="Upvote" onClick={() => act(() => api.vote(post.id, 1))} className={arrow(1, my === 1, 'text-accent')}>▲</button>
        <span className={`text-sm font-bold ${my === 1 ? 'text-accent' : my === -1 ? 'text-blue-600' : ''}`}>{api.score(post)}</span>
        <button aria-label="Downvote" onClick={() => act(() => api.vote(post.id, -1))} className={arrow(-1, my === -1, 'text-blue-600')}>▼</button>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          {showClub && club && <Link to={`/clubs/${club.id}`} className="font-bold text-slate-800 hover:underline">{club.emoji} {club.name}</Link>}
          <span>by {author?.name || 'Unknown'}</span>{author && <RoleBadge role={author.role} />}
          <span>{timeAgo(post.createdAt)}</span>
          {post.pinned && <span className="font-semibold text-accent">📌 Pinned</span>}
        </div>
        <h2 className="mt-1 font-bold text-base sm:text-lg break-words">{post.title}</h2>
        {post.text && <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap break-words">{post.text}</p>}
        {post.link && <a href={post.link} target="_blank" rel="noreferrer" className="inline-block mt-1 text-sm text-blue-600 hover:underline break-all">🔗 {post.link}</a>}
        {post.attachment && (/^image\//.test(post.attachment.type)
          ? <a href={post.attachment.url} target="_blank" rel="noreferrer"><img src={post.attachment.url} alt={post.attachment.name} className="mt-2 rounded-xl max-h-80 border border-slate-200" /></a>
          : <a href={post.attachment.url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm font-semibold text-blue-600 hover:underline">📎 {post.attachment.name}</a>)}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-semibold">
          <button onClick={() => setOpen(!open)} className="btn-outline btn-sm">💬 {count} {count === 1 ? 'comment' : 'comments'}</button>
          <button onClick={() => act(() => api.toggleBookmark(post.id), marked ? 'Bookmark removed' : 'Post bookmarked')} className={`btn-sm btn ${marked ? 'bg-accent text-white' : 'btn-outline'}`}>{marked ? '★ Saved' : '☆ Save'}</button>
          {manage && <button onClick={() => act(() => api.togglePin(post.id), post.pinned ? 'Post unpinned' : 'Post pinned')} className="btn-outline btn-sm">📌 {post.pinned ? 'Unpin' : 'Pin'}</button>}
          {manage && <button onClick={() => window.confirm('Delete this post?') && act(() => api.deletePost(post.id), 'Post deleted')} className="btn-danger btn-sm">🗑 Delete</button>}
        </div>
        {open && <CommentSection post={post} />}
      </div>
    </article>
  )
}
