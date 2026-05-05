import { motion } from 'framer-motion'

export default function GlassCard({
  children, className = '', variant = 'default',
  hover = true, animate = false, delay = 0, style = {},
  onClick, padding = true,
}) {
  const variants = {
    default: 'glass-card',
    gold:    'glass-card glass-card-gold',
    green:   'glass-card glass-card-green',
    red:     'glass-card glass-card-red',
  }

  const Component = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial:    { opacity: 0, y: 16 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
  } : {}

  return (
    <Component
      className={`${variants[variant]} ${padding ? 'p-5' : ''} ${hover ? '' : 'hover:border-[rgba(56,189,248,0.1)] hover:shadow-none'} ${className}`}
      style={style}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  )
}
