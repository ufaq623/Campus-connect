import { useState } from 'react'
import { useApp } from '../services/AppContext.jsx'
import { todayStr } from '../services/utils.js'
import EventCard from '../components/EventCard.jsx'
import EventForm from '../components/EventForm.jsx'

export default function Events() {
  const { db, user } = useApp()
  const [tab, setTab] = useState('upcoming')
  const [creating, setCreating] = useState(false)
  const key = (e) => e.date + e.time
  const list = db.events.filter((e) => (tab === 'upcoming' ? e.date >= todayStr() : e.date < todayStr()))
    .sort((a, b) => (tab === 'upcoming' ? key(a).localeCompare(key(b)) : key(b).localeCompare(key(a))))
  const t = (a) => `px-4 py-1.5 rounded-full text-sm font-semibold ${a ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📅 Events</h1>
        {user.role === 'Admin' && <button onClick={() => setCreating(!creating)} className="btn-primary btn-sm">{creating ? 'Close form' : '+ Create event'}</button>}
      </div>
      {creating && <EventForm onDone={() => setCreating(false)} />}
      <div className="flex gap-2">
        <button className={t(tab === 'upcoming')} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button className={t(tab === 'past')} onClick={() => setTab('past')}>Past</button>
      </div>
      {list.map((e) => <EventCard key={e.id} event={e} />)}
      {list.length === 0 && <div className="card p-8 text-center text-slate-500">No {tab} events.</div>}
    </div>
  )
}
