import { Link } from 'react-router-dom'
import { useApp } from '../services/AppContext.jsx'
import RoleBadge from './RoleBadge.jsx'

export default function Header({ onMenu }) {
  const { user, logout } = useApp()
  return (
    <header className="sticky top-0 z-50 h-14 bg-navy text-white flex items-center px-3 sm:px-5 gap-3">
      <button onClick={onMenu} className="lg:hidden p-2 -ml-1 rounded hover:bg-white/10" aria-label="Open menu">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h16M3 11h16M3 16h16" /></svg>
      </button>
      <Link to="/" className="flex items-center gap-2 font-bold text-lg">
        <span className="w-8 h-8 rounded-full bg-accent grid place-items-center text-sm">CC</span>
        <span className="hidden sm:inline">Campus Connect</span>
      </Link>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <RoleBadge role={user.role} dark />
        <Link to="/profile" className="text-sm font-medium hover:underline max-w-[110px] truncate">{user.name}</Link>
        <button onClick={logout} className="btn btn-sm border border-white/30 hover:bg-white/10">Log out</button>
      </div>
    </header>
  )
}
