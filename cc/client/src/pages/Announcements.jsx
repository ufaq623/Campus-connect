import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'
import { fmtDateTime } from '../services/utils.js'
import AnnouncementForm from '../components/AnnouncementForm.jsx'

export default function Announcements() {
  const { db, user, act } = useApp()
  const admin = user.role === 'Admin'
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">📢 Announcements</h1>
      {admin && <AnnouncementForm />}
      {db.announcements.map((a) => (
        <article key={a.id} className="card p-4 border-l-4 border-l-accent">
          <div className="flex justify-between gap-2"><h2 className="font-bold">{a.title}</h2>
            {admin && <button onClick={() => window.confirm('Delete announcement?') && act(() => api.deleteAnnouncement(a.id), 'Announcement deleted')} className="btn-danger btn-sm">Delete</button>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Official · {fmtDateTime(a.createdAt)}</p>
          <p className="text-sm mt-2 whitespace-pre-wrap">{a.text}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
            {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">🔗 {a.label || a.link}</a>}
            {!a.link && a.label && <span className="text-slate-600">📎 {a.label}</span>}
            {a.attachment && <a href={a.attachment.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">📎 {a.attachment.name}</a>}
          </div>
        </article>
      ))}
      {db.announcements.length === 0 && <div className="card p-8 text-center text-slate-500">No announcements yet.</div>}
    </div>
  )
}
