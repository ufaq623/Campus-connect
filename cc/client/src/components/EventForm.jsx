import { useState } from 'react'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'
import { dateStr } from '../services/utils.js'

export default function EventForm({ event, onDone }) {
  const { user, act } = useApp()
  const empty = { title: '', description: '', date: dateStr(7), time: '10:00', venue: '' }
  const [f, setF] = useState(event || empty)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (await act(() => api.saveEvent(f), event ? 'Event updated' : 'Event created')) { setF(empty); onDone?.() }
  }
  return (
    <form onSubmit={submit} className="card p-4 space-y-2">
      <h3 className="font-bold">{event ? 'Edit event' : 'Create event'}</h3>
      <input className="input" placeholder="Event title" value={f.title} onChange={set('title')} />
      <textarea className="input" rows={2} placeholder="Description" value={f.description} onChange={set('description')} />
      <div className="grid sm:grid-cols-3 gap-2">
        <div><label className="label">Date</label><input type="date" className="input" value={f.date} onChange={set('date')} /></div>
        <div><label className="label">Time</label><input type="time" className="input" value={f.time} onChange={set('time')} /></div>
        <div><label className="label">Venue</label><input className="input" value={f.venue} onChange={set('venue')} /></div>
      </div>
      <div className="flex justify-end gap-2">
        {onDone && <button type="button" onClick={onDone} className="btn-outline">Cancel</button>}
        <button className="btn-primary">{event ? 'Save changes' : 'Create event'}</button>
      </div>
    </form>
  )
}
