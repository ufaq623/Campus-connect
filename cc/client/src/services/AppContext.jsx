import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from './api.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [db, setDb] = useState(null)       // snapshot from GET /api/bootstrap
  const [user, setUser] = useState(null)   // the logged-in user (db.me)
  const [loading, setLoading] = useState(!!api.getToken())
  const [toast, setToast] = useState(null)

  const notify = useCallback((msg, type = 'info') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2800)
  }, [])

  const logout = useCallback(() => { api.clearToken(); setDb(null); setUser(null) }, [])

  // Re-fetch everything from the server (called after every change).
  const refresh = useCallback(async () => {
    if (!api.getToken()) { setLoading(false); return }
    try { const d = await api.bootstrap(); setDb(d); setUser(d.me) }
    catch (e) { if (e.status === 401) logout(); else notify(e.message, 'error') }
    finally { setLoading(false) }
  }, [logout, notify])

  useEffect(() => { refresh() }, [refresh])

  // Run a service call, then refresh the UI. Shows errors from the server. Resolves true on success.
  const act = useCallback(async (fn, successMsg) => {
    try { await fn(); await refresh(); if (successMsg) notify(successMsg, 'ok'); return true }
    catch (e) { if (e.status === 401) logout(); notify(e.message, 'error'); return false }
  }, [refresh, notify, logout])

  const authenticate = async (fn, msg) => {
    try { await fn(); await refresh(); if (msg) notify(msg, 'ok'); return true }
    catch (e) { notify(e.message, 'error'); return false }
  }
  const login = (email, pw) => authenticate(() => api.login(email, pw))
  const signup = (data) => authenticate(() => api.signup(data), 'Welcome to Campus Connect!')

  return (
    <Ctx.Provider value={{ db, user, loading, act, notify, login, signup, logout, refresh }}>
      {children}
      {toast && (
        <div role="status" className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full text-sm font-medium shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'ok' ? 'bg-emerald-600' : 'bg-navy'}`}>
          {toast.msg}
        </div>
      )}
    </Ctx.Provider>
  )
}
