import { useState } from 'react'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'
import { timeAgo } from '../services/utils.js'

const badge = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700' }

export default function RequestClub() {
  const { db, user, act } = useApp()
  const empty = { name: '', description: '', reason: '' }
  const [f, setF] = useState(empty)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const mine = db.clubRequests.filter((r) => r.userId === user.id)
  const submit = async (e) => { e.preventDefault(); if (await act(() => api.requestClub(f), 'Request submitted for admin review')) setF(empty) }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Request a new club</h1>
      <form onSubmit={submit} className="card p-4 space-y-3">
        <div><label className="label">Club name</label><input className="input" value={f.name} onChange={set('name')} /></div>
        <div><label className="label">Description</label><textarea rows={3} className="input" value={f.description} onChange={set('description')} /></div>
        <div><label className="label">Why should this club exist?</label><textarea rows={3} className="input" value={f.reason} onChange={set('reason')} /></div>
        <button className="btn-primary">Submit request</button>
      </form>
      <h2 className="font-bold">Your requests</h2>
      {mine.length === 0 && <p className="text-sm text-slate-500">You haven't requested any clubs yet.</p>}
      {mine.map((r) => (
        <div key={r.id} className="card p-4 flex items-center justify-between gap-3">
          <div><div className="font-semibold">{r.name}</div><div className="text-xs text-slate-500">{timeAgo(r.createdAt)}</div></div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${badge[r.status]}`}>{r.status}</span>
        </div>
      ))}
    </div>
  )
}
