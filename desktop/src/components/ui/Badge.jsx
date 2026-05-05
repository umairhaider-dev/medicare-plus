export default function Badge({ children, variant = 'blue', size = 'sm', dot = false }) {
  const map = {
    blue: 'badge-blue', green: 'badge-green', red: 'badge-red',
    orange: 'badge-orange', gold: 'badge-gold', purple: 'badge-purple',
    teal: 'badge-teal', gray: 'badge-gray',
  }
  return (
    <span className={`badge ${map[variant] || 'badge-gray'} ${size === 'xs' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      )}
      {children}
    </span>
  )
}
