import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './services/AppContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Clubs from './pages/Clubs.jsx'
import ClubDetail from './pages/ClubDetail.jsx'
import RequestClub from './pages/RequestClub.jsx'
import Announcements from './pages/Announcements.jsx'
import Events from './pages/Events.jsx'
import Admin from './pages/Admin.jsx'
import Profile from './pages/Profile.jsx'

function Gate() {
  const { user, db, loading } = useApp()
  if (loading) return <div className="min-h-screen grid place-items-center text-slate-500">Loading...</div>
  return user && db ? <Layout /> : <Login />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Gate />}>
        <Route index element={<Home />} />
        <Route path="clubs" element={<Clubs />} />
        <Route path="clubs/:id" element={<ClubDetail />} />
        <Route path="request-club" element={<RequestClub />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="events" element={<Events />} />
        <Route path="admin" element={<Admin />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
