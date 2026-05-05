import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const VARIANTS = {
  blue:   { bg: 'bg-metric-blue',   glow: 'glow-blue',  iconBg: 'rgba(14,165,233,0.2)',  color: '#38bdf8', border: 'rgba(14,165,233,0.25)' },
  gold:   { bg: 'bg-metric-gold',   glow: 'glow-gold',  iconBg: 'rgba(245,158,11,0.2)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  green:  { bg: 'bg-metric-green',  glow: 'glow-green', iconBg: 'rgba(16,185,129,0.2)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
  red:    { bg: 'bg-metric-red',    glow: 'glow-red',   iconBg: 'rgba(239,68,68,0.2)',   color: '#f87171', border: 'rgba(239,68,68,0.25)'  },
  purple: { bg: 'bg-metric-purple', glow: '',           iconBg: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  teal:   { bg: 'bg-metric-teal',   glow: '',           iconBg: 'rgba(20,184,166,0.2)', color: '#2dd4bf', border: 'rgba(20,184,166,0.25)' },
}

export default function MetricCard({
  label, value, unit = '', trend, trendLabel,
  icon: Icon, variant = 'blue', subtitle,
  animate = true, delay = 0, onClick,
}) {
  const v = VARIANTS[variant] || VARIANTS.blue

  return (
    <motion.div
      className={`metric-card ${v.bg} glass-card`}
      style={{ borderColor: v.border, cursor: onClick ? 'pointer' : 'default' }}
      initial={animate ? { opacity: 0, y: 20, scale: 0.96 } : false}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={{ duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: v.iconBg, border: `1px solid ${v.border}` }}
        >
          {Icon && <Icon size={18} style={{ color: v.color }} />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'
          }`}>
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="flex items-end gap-1 mb-1">
        <span className="text-3xl font-bold counter" style={{ color: v.color }}>{value}</span>
        {unit && <span className="text-sm mb-1" style={{ color: v.color, opacity: 0.7 }}>{unit}</span>}
      </div>

      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</div>

      {(subtitle || trendLabel) && (
        <div className="mt-2 text-xs text-slate-500">{subtitle || trendLabel}</div>
      )}

      {/* decorative ring */}
      <div
        className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${v.color}, transparent 70%)` }}
      />
    </motion.div>
  )
}
