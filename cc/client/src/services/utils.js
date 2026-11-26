export const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago'
  const d = Math.floor(h / 24); if (d < 30) return d + 'd ago'
  return new Date(ts).toLocaleDateString()
}
export const fmtDateTime = (ts) => new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
export const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
export const fmtTime = (t) => { const [h, m] = t.split(':'); const d = new Date(); d.setHours(+h, +m); return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }
export const dateStr = (offsetDays = 0) => {
  const d = new Date(); d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const todayStr = () => dateStr(0)
