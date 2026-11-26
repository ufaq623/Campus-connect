import { Link, useParams } from 'react-router-dom'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'
import PostCard from '../components/PostCard.jsx'
import PostForm from '../components/PostForm.jsx'

export default function ClubDetail() {
  const { id } = useParams()
  const { db, user, act } = useApp()
  const club = db.clubs.find((c) => c.id === id)
  if (!club) return <div className="card p-8 text-center"><p>Club not found.</p><Link to="/clubs" className="btn-primary mt-3">All clubs</Link></div>
  const joined = user.joinedClubs.includes(club.id)
  const posts = db.posts.filter((p) => p.clubId === club.id).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt)
  const mods = db.users.filter((u) => u.modClubs.includes(club.id))
  return (
    <div className="space-y-3">
      <div className="card overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-navy to-slate-700" />
        <div className="p-4 -mt-8 flex flex-wrap items-end gap-3">
          <span className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow grid place-items-center text-3xl">{club.emoji}</span>
          <div className="flex-1 min-w-[10rem]">
            <h1 className="text-xl font-bold">{club.name}</h1>
            <p className="text-xs text-slate-500">{club.memberCount} members{mods.length > 0 && ` · Moderated by ${mods.map((m) => m.name).join(', ')}`}</p>
          </div>
          <button onClick={() => act(() => api.toggleJoin(club.id, joined), joined ? `Left ${club.name}` : `Joined ${club.name}`)} className={joined ? 'btn-outline' : 'btn-primary'}>{joined ? 'Joined ✓ (Leave)' : 'Join club'}</button>
        </div>
        <p className="px-4 pb-4 text-sm text-slate-600">{club.description}</p>
      </div>
      {joined || user.role === 'Admin' ? <PostForm clubId={club.id} /> : <div className="card p-4 text-sm text-slate-600">Join this club to create posts.</div>}
      {posts.map((p) => <PostCard key={p.id} post={p} showClub={false} />)}
      {posts.length === 0 && <div className="card p-8 text-center text-slate-500">No posts yet. Be the first to post!</div>}
    </div>
  )
}
