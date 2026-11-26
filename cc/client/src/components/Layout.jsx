import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import RightSidebar from './RightSidebar.jsx'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="min-h-screen bg-slate-50">
      <Header onMenu={() => setOpen(true)} />
      <div className="flex">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="flex-1 min-w-0 p-3 sm:p-4 max-w-3xl mx-auto w-full"><Outlet /></main>
        <RightSidebar />
      </div>
    </div>
  )
}
