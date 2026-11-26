import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../services/AppContext.jsx'
import { score } from '../services/api.js'
import PostCard from '../components/PostCard.jsx'

export default function Home() {
  const { db, user } = useApp()
  const [scope, setScope] = useState('joined')
  const [club, setClub] = useState('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('new')

  let posts = db.posts.filter((p) => (scope === 'all' ? true : user.joinedClubs.includes(p.clubId)))
  if (club !== 'all') posts = posts.filter((p) => p.clubId === club)
  const term = q.trim().toLowerCase()
  if (term) posts = posts.filter((p) => (p.title + ' ' + p.text).toLowerCase().includes(term))
  posts = [...posts].sort((a, b) => (sort === 'top' ? score(b) - score(a) : b.createdAt - a.createdAt))

  const tab = (active) => `px-3 py-1.5 rounded-full text-sm font-semibold ${active ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`
  return (
    <div className="space-y-3">
      <div className="card p-3 space-y-3">
        <input className="input" placeholder="🔍 Search posts..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap items-center gap-2">
          <button className={tab(scope === 'joined')} onClick={() => setScope('joined')}>My clubs</button>
          <button className={tab(scope === 'all')} onClick={() => setScope('all')}>All clubs</button>
          <select className="input !w-auto" value={club} onChange={(e) => setClub(e.target.value)} aria-label="Filter by club">
            <option value="all">Any club</option>
            {db.clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="ml-auto flex gap-2">
            <button className={tab(sort === 'new')} onClick={() => setSort('new')}>New</button>
            <button className={tab(sort === 'top')} onClick={() => setSort('top')}>Top</button>
          </div>
        </div>
      </div>
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
      {posts.length === 0 && (
        <div className="card p-8 text-center text-slate-500">
          <p>{scope === 'joined' && user.joinedClubs.length === 0 ? "You haven't joined any clubs yet." : 'No posts match your filters.'}</p>
          <div className="mt-3 flex justify-center gap-2">
            <Link to="/clubs" className="btn-primary">Browse clubs</Link>
            <button onClick={() => { setScope('all'); setClub('all'); setQ('') }} className="btn-outline">Show all posts</button>
          </div>
        </div>
      )}
    </div>
  )
}
