import { Link } from 'react-router-dom'
export default function AccessDenied() {
  return (
    <div className="card p-10 text-center">
      <div className="text-5xl mb-3">🚫</div>
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-slate-500 mt-2">You need an administrator account to view this page.</p>
      <Link to="/" className="btn-primary mt-5">Back to Home</Link>
    </div>
  )
}
