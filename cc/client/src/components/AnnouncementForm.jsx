import { useState, useRef } from 'react'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'

export default function AnnouncementForm() {
  const { act } = useApp()
  const empty = { title: '', text: '', label: '', link: '' }
  const [f, setF] = useState(empty)
  const [file, setFile] = useState(null)
  const fileRef = useRef()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (await act(() => api.addAnnouncement({ ...f, file }), 'Announcement published')) { setF(empty); setFile(null); if (fileRef.current) fileRef.current.value = '' }
  }
  return (
    <form onSubmit={submit} className="card p-4 space-y-2">
      <h3 className="font-bold">Publish announcement</h3>
      <input className="input" placeholder="Title" value={f.title} onChange={set('title')} />
      <textarea className="input" rows={3} placeholder="Announcement text" value={f.text} onChange={set('text')} />
      <div className="grid sm:grid-cols-2 gap-2">
        <input className="input" placeholder="Link label (optional)" value={f.label} onChange={set('label')} />
        <input className="input" placeholder="Link (optional)" value={f.link} onChange={set('link')} />
      </div>
      <label className="block text-xs text-slate-600">📎 Attachment (optional, max 5 MB)
        <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip" onChange={(e) => setFile(e.target.files[0] || null)} className="block mt-1 text-xs" />
      </label>
      <div className="text-right"><button className="btn-primary">Publish</button></div>
    </form>
  )
}
