import { Link } from 'react-router-dom'
import { useApp } from '../services/AppContext.jsx'
import { fmtDateTime } from '../services/utils.js'
import RoleBadge from '../components/RoleBadge.jsx'
import PostCard from '../components/PostCard.jsx'

export default function Profile() {
  const { db, user } = useApp()
  const clubs = db.clubs.filter((c) => user.joinedClubs.includes(c.id))
  const mine = db.posts.filter((p) => p.authorId === user.id).sort((a, b) => b.createdAt - a.createdAt)
  const saved = db.posts.filter((p) => user.bookmarks.includes(p.id))
  return (
    <div className="space-y-4">
      <div className="card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent text-white grid place-items-center text-2xl font-bold">{user.name[0]}</div>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email} · Joined {fmtDateTime(user.joinedAt)}</p>
          <div className="mt-1 flex items-center gap-2"><RoleBadge role={user.role} />{user.title && <span className="text-xs font-semibold text-slate-600">{user.title}</span>}</div>
          {user.modClubs.length > 0 && <p className="text-xs text-slate-500 mt-1">Moderator of {db.clubs.filter((c) => user.modClubs.includes(c.id)).map((c) => c.name).join(', ')}</p>}
        </div>
      </div>
      <section>
        <h2 className="font-bold mb-2">Joined clubs ({clubs.length})</h2>
        <div className="flex flex-wrap gap-2">
          {clubs.map((c) => <Link key={c.id} to={`/clubs/${c.id}`} className="card px-3 py-1.5 text-sm font-semibold hover:border-accent">{c.emoji} {c.name}</Link>)}
          {clubs.length === 0 && <p className="text-sm text-slate-500">None yet. <Link to="/clubs" className="text-accent font-semibold">Browse clubs</Link></p>}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-bold">My posts ({mine.length})</h2>
        {mine.map((p) => <PostCard key={p.id} post={p} />)}
        {mine.length === 0 && <p className="text-sm text-slate-500">You haven't posted yet.</p>}
      </section>
      <section className="space-y-3">
        <h2 className="font-bold">Bookmarks ({saved.length})</h2>
        {saved.map((p) => <PostCard key={p.id} post={p} />)}
        {saved.length === 0 && <p className="text-sm text-slate-500">Saved posts show up here.</p>}
      </section>
    </div>
  )
}
