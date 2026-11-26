import { useState, useRef } from 'react'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'

export default function PostForm({ clubId }) {
  const { act } = useApp()
  const [f, setF] = useState({ title: '', text: '', link: '' })
  const [file, setFile] = useState(null)
  const fileRef = useRef()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (await act(() => api.createPost({ clubId, ...f, file }), 'Post published')) {
      setF({ title: '', text: '', link: '' }); setFile(null); if (fileRef.current) fileRef.current.value = ''
    }
  }
  return (
    <form onSubmit={submit} className="card p-4 space-y-2">
      <h3 className="font-bold">Create a post</h3>
      <input className="input" placeholder="Title" value={f.title} onChange={set('title')} />
      <textarea className="input" rows={3} placeholder="What do you want to share? (optional)" value={f.text} onChange={set('text')} />
      <input className="input" placeholder="Link (optional)" value={f.link} onChange={set('link')} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs text-slate-600">📎 Image or document (max 5 MB)
          <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip" onChange={(e) => setFile(e.target.files[0] || null)} className="block mt-1 text-xs" />
        </label>
        <button className="btn-primary">Post</button>
      </div>
    </form>
  )
}
