import { useState } from 'react'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'
import { fmtDateTime, timeAgo, fmtDate, fmtTime } from '../services/utils.js'
import AccessDenied from '../components/AccessDenied.jsx'
import AnnouncementForm from '../components/AnnouncementForm.jsx'
import EventForm from '../components/EventForm.jsx'
import EventCard from '../components/EventCard.jsx'
import RoleBadge from '../components/RoleBadge.jsx'

const TABS = ['Club Requests', 'Assign Moderators', 'Announcements', 'Events', 'All Users']

function Requests() {
  const { db, user, act } = useApp()
  const pending = db.clubRequests.filter((r) => r.status === 'pending')
  const done = db.clubRequests.filter((r) => r.status !== 'pending')
  return (
    <div className="space-y-3">
      <h2 className="font-bold">Pending ({pending.length})</h2>
      {pending.length === 0 && <p className="text-sm text-slate-500">No pending requests.</p>}
      {pending.map((r) => {
        const u = db.users.find((x) => x.id === r.userId)
        return (
          <div key={r.id} className="card p-4">
            <div className="font-bold">{r.name}</div>
            <div className="text-xs text-slate-500">Requested by {u?.name} · {timeAgo(r.createdAt)}</div>
            <p className="text-sm mt-2">{r.description}</p>
            <p className="text-sm text-slate-500 mt-1"><b>Reason:</b> {r.reason}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => act(() => api.reviewRequest(r.id, true), `${r.name} approved and created`)} className="btn-primary btn-sm">Approve</button>
              <button onClick={() => act(() => api.reviewRequest(r.id, false), 'Request rejected')} className="btn-danger btn-sm">Reject</button>
            </div>
          </div>
        )
      })}
      {done.length > 0 && <h2 className="font-bold pt-2">History</h2>}
      {done.map((r) => <div key={r.id} className="card p-3 flex justify-between text-sm"><span>{r.name}</span><span className={`font-semibold capitalize ${r.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>{r.status}</span></div>)}
    </div>
  )
}

function Moderators() {
  const { db, user, act } = useApp()
  const [clubId, setClubId] = useState(db.clubs[0]?.id || '')
  const candidates = db.users.filter((u) => u.role !== 'Admin')
  const [userId, setUserId] = useState('')
  const mods = db.users.filter((u) => u.modClubs.length)
  return (
    <div className="space-y-3">
      <div className="card p-4 grid sm:grid-cols-3 gap-3 items-end">
        <div><label className="label">Club</label><select className="input" value={clubId} onChange={(e) => setClubId(e.target.value)}>{db.clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="label">User</label><select className="input" value={userId} onChange={(e) => setUserId(e.target.value)}><option value="">Select user...</option>{candidates.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}</select></div>
        <button disabled={!userId} onClick={() => act(() => api.assignModerator(userId, clubId), 'Moderator assigned')} className="btn-primary">Assign moderator</button>
      </div>
      <h2 className="font-bold">Current moderators</h2>
      {mods.map((m) => m.modClubs.map((cid) => {
        const c = db.clubs.find((x) => x.id === cid)
        return c && (
          <div key={m.id + cid} className="card p-3 flex items-center justify-between gap-2 text-sm">
            <span><b>{m.name}</b> moderates {c.emoji} {c.name}</span>
            <button onClick={() => act(() => api.removeModerator(m.id, cid), 'Moderator removed')} className="btn-danger btn-sm">Remove</button>
          </div>
        )
      }))}
      {mods.length === 0 && <p className="text-sm text-slate-500">No moderators assigned.</p>}
    </div>
  )
}

function AnnouncementsManager() {
  const { db, user, act } = useApp()
  return (
    <div className="space-y-3">
      <AnnouncementForm />
      {db.announcements.map((a) => (
        <div key={a.id} className="card p-3 flex items-center justify-between gap-2">
          <div className="min-w-0"><div className="font-semibold text-sm truncate">{a.title}</div><div className="text-xs text-slate-500">{fmtDateTime(a.createdAt)}</div></div>
          <button onClick={() => act(() => api.deleteAnnouncement(a.id), 'Announcement deleted')} className="btn-danger btn-sm">Delete</button>
        </div>
      ))}
    </div>
  )
}

function EventsManager() {
  const { db } = useApp()
  const events = [...db.events].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
  return (
    <div className="space-y-3">
      <EventForm />
      {events.map((e) => <EventCard key={e.id} event={e} />)}
    </div>
  )
}

function Users() {
  const { db } = useApp()
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-slate-500 border-b"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Clubs</th></tr></thead>
        <tbody>
          {db.users.map((u) => (
            <tr key={u.id} className="border-b last:border-0">
              <td className="p-3 font-semibold whitespace-nowrap">{u.name}</td><td className="p-3">{u.email}</td>
              <td className="p-3"><RoleBadge role={u.role} />{u.title && <span className="ml-2 text-xs text-slate-500">{u.title}</span>}</td><td className="p-3">{u.joinedClubs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Admin() {
  const { user, db } = useApp()
  const [tab, setTab] = useState(TABS[0])
  if (user.role !== 'Admin') return <AccessDenied />
  const pending = db.clubRequests.filter((r) => r.status === 'pending').length
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">🛡️ Admin Panel</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold ${tab === t ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
            {t}{t === 'Club Requests' && pending > 0 && <span className="ml-1.5 bg-accent text-white text-[11px] rounded-full px-1.5">{pending}</span>}
          </button>
        ))}
      </div>
      {tab === 'Club Requests' && <Requests />}
      {tab === 'Assign Moderators' && <Moderators />}
      {tab === 'Announcements' && <AnnouncementsManager />}
      {tab === 'Events' && <EventsManager />}
      {tab === 'All Users' && <Users />}
    </div>
  )
}
