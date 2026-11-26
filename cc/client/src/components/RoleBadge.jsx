const styles = { Admin: 'bg-red-100 text-red-700', Moderator: 'bg-purple-100 text-purple-700', Student: 'bg-sky-100 text-sky-700' }
export default function RoleBadge({ role, dark }) {
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${dark ? 'bg-white/15 text-white' : styles[role]}`}>{role}</span>
}
