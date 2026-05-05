import { Loader2 } from 'lucide-react'

export default function Button({
  children, onClick, variant = 'primary', size = 'md',
  icon: Icon, loading = false, disabled = false, className = '', type = 'button',
}) {
  const varMap = { primary: 'btn-primary', ghost: 'btn-ghost', danger: 'btn-danger', gold: 'btn-gold' }
  const sizeMap = { sm: 'btn-sm', md: '', lg: 'btn-lg', icon: 'btn-icon' }

  return (
    <button
      type={type}
      className={`btn ${varMap[variant] || 'btn-primary'} ${sizeMap[size] || ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : Icon && (
        <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />
      )}
      {size !== 'icon' && children}
    </button>
  )
}
