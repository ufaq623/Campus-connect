import { Link } from 'react-router-dom'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'

export default function Clubs() {
  const { db, user, act } = useApp()
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Clubs</h1>
        <Link to="/request-club" className="btn-outline btn-sm">+ Request a club</Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {db.clubs.map((c) => {
          const joined = user.joinedClubs.includes(c.id)
          return (
            <div key={c.id} className="card p-4 flex flex-col">
              <Link to={`/clubs/${c.id}`} className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-orange-50 grid place-items-center text-2xl">{c.emoji}</span>
                <div><h2 className="font-bold hover:text-accent">{c.name}</h2><p className="text-xs text-slate-500">{c.memberCount} members</p></div>
              </Link>
              <p className="text-sm text-slate-600 mt-3 flex-1">{c.description}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => act(() => api.toggleJoin(c.id, joined), joined ? `Left ${c.name}` : `Joined ${c.name}`)} className={joined ? 'btn-outline btn-sm' : 'btn-primary btn-sm'}>{joined ? 'Leave' : 'Join'}</button>
                <Link to={`/clubs/${c.id}`} className="btn-outline btn-sm">View club</Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
