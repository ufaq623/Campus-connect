import { Link } from 'react-router-dom'
import { useApp } from '../services/AppContext.jsx'
import { fmtDate, fmtTime, timeAgo, todayStr } from '../services/utils.js'

export default function RightSidebar() {
  const { db } = useApp()
  const upcoming = db.events.filter((e) => e.date >= todayStr()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 3)
  return (
    <aside className="hidden xl:block w-80 shrink-0 space-y-4 py-4 pr-4">
      <section className="card p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-bold">📢 Announcements</h3><Link to="/announcements" className="text-xs text-accent font-semibold">View all</Link></div>
        <ul className="space-y-3">
          {db.announcements.slice(0, 3).map((a) => (
            <li key={a.id}><Link to="/announcements" className="block text-sm font-semibold hover:text-accent">{a.title}</Link><span className="text-xs text-slate-500">{timeAgo(a.createdAt)}</span></li>
          ))}
        </ul>
      </section>
      <section className="card p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-bold">📅 Upcoming Events</h3><Link to="/events" className="text-xs text-accent font-semibold">View all</Link></div>
        <ul className="space-y-3">
          {upcoming.length === 0 && <li className="text-sm text-slate-500">No upcoming events.</li>}
          {upcoming.map((e) => (
            <li key={e.id} className="text-sm"><Link to="/events" className={`font-semibold hover:text-accent ${e.status === 'Cancelled' ? 'line-through text-slate-400' : ''}`}>{e.title}</Link>
              <div className="text-xs text-slate-500">{fmtDate(e.date)}, {fmtTime(e.time)} at {e.venue}</div></li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
