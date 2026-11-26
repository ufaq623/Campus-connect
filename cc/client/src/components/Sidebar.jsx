import { NavLink } from 'react-router-dom'
import { useApp } from '../services/AppContext.jsx'
import { isAdmin } from '../services/api.js'

export default function Sidebar({ open, onClose }) {
  const { db, user } = useApp()
  const link = ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-orange-50 text-accent' : 'text-slate-600 hover:bg-slate-100'}`
  const nav = [['/', '🏠 Home'], ['/clubs', '👥 All Clubs'], ['/announcements', '📢 Announcements'], ['/events', '📅 Events'], ['/request-club', '➕ Request a Club'], ['/profile', '🙋 My Profile']]
  if (isAdmin(user)) nav.push(['/admin', '🛡️ Admin Panel'])
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:sticky z-40 top-14 left-0 h-[calc(100vh-3.5rem)] w-64 shrink-0 bg-white border-r border-slate-200 overflow-y-auto p-3 transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <nav className="space-y-1" onClick={onClose}>
          {nav.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={link}>{label}</NavLink>)}
        </nav>
        <h3 className="mt-5 mb-2 px-3 text-xs font-semibold text-slate-500">Clubs</h3>
        <nav className="space-y-1" onClick={onClose}>
          {db.clubs.map((c) => (
            <NavLink key={c.id} to={`/clubs/${c.id}`} className={link}>
              <span>{c.emoji}</span><span className="truncate">{c.name}</span>
              {user.joinedClubs.includes(c.id) && <span className="ml-auto w-2 h-2 rounded-full bg-accent" title="Joined" />}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
