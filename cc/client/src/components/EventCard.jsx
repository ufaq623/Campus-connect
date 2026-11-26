import { useState } from 'react'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'
import { fmtDate, fmtTime, todayStr } from '../services/utils.js'
import EventForm from './EventForm.jsx'

export default function EventCard({ event: e }) {
  const { user, act } = useApp()
  const [editing, setEditing] = useState(false)
  const past = e.date < todayStr()
  const cancelled = e.status === 'Cancelled'
  if (editing) return <EventForm event={e} onDone={() => setEditing(false)} />
  const d = new Date(e.date + 'T00:00:00')
  return (
    <div className={`card p-4 flex gap-4 ${cancelled ? 'opacity-70' : ''}`}>
      <div className="w-14 shrink-0 text-center rounded-xl bg-navy text-white py-2">
        <div className="text-[11px] font-semibold">{d.toLocaleString([], { month: 'short' })}</div>
        <div className="text-xl font-bold leading-none">{d.getDate()}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-bold ${cancelled ? 'line-through' : ''}`}>{e.title}</h3>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cancelled ? 'bg-red-100 text-red-700' : past ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>{cancelled ? 'Cancelled' : past ? 'Completed' : 'Scheduled'}</span>
        </div>
        <p className="text-sm text-slate-600 mt-1">{e.description}</p>
        <p className="text-xs text-slate-500 mt-2">📅 {fmtDate(e.date)} &nbsp; 🕒 {fmtTime(e.time)} &nbsp; 📍 {e.venue}</p>
        {user.role === 'Admin' && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => setEditing(true)} className="btn-outline btn-sm">Edit</button>
            {!cancelled && !past && <button onClick={() => window.confirm('Cancel this event?') && act(() => api.cancelEvent(user, e.id), 'Event cancelled')} className="btn-danger btn-sm">Cancel event</button>}
          </div>
        )}
      </div>
    </div>
  )
}
