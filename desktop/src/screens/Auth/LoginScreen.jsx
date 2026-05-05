import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Cross, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react'
import useAuthStore from '../../store/auth.store'
import { HOSPITAL_NAME, HOSPITAL_TAGLINE } from '../../constants'

/* ── Animated particle canvas ─────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = (canvas.width  = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)

    const PARTICLES = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Gradient background
      const grad = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, w * 0.7)
      grad.addColorStop(0, 'rgba(14,165,233,0.06)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      const grad2 = ctx.createRadialGradient(w * 0.8, h * 0.8, 0, w * 0.8, h * 0.8, w * 0.5)
      grad2.addColorStop(0, 'rgba(139,92,246,0.04)')
      grad2.addColorStop(1, 'transparent')
      ctx.fillStyle = grad2
      ctx.fillRect(0, 0, w, h)

      PARTICLES.forEach(p => {
        p.x += p.dx; p.y += p.dy
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(56,189,248,${p.alpha})`
        ctx.fill()
      })

      // Draw connections
      for (let i = 0; i < PARTICLES.length; i++) {
        for (let j = i + 1; j < PARTICLES.length; j++) {
          const dx = PARTICLES[i].x - PARTICLES[j].x
          const dy = PARTICLES[i].y - PARTICLES[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(PARTICLES[i].x, PARTICLES[i].y)
            ctx.lineTo(PARTICLES[j].x, PARTICLES[j].y)
            ctx.strokeStyle = `rgba(56,189,248,${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

/* ── ECG line decoration ──────────────────────────────────────────── */
function EcgLine() {
  return (
    <svg viewBox="0 0 400 60" className="w-full opacity-20" fill="none">
      <motion.polyline
        points="0,30 40,30 50,10 60,50 75,30 90,30 110,30 125,5 135,55 148,30 180,30 200,30 220,30 235,8 245,52 258,30 290,30 310,30 325,12 335,48 348,30 400,30"
        stroke="#0ea5e9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
      />
    </svg>
  )
}

export default function LoginScreen() {
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => { clearError?.() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/dashboard')
  }

  // Demo quick-fill
  const fillDemo = () => { setEmail('admin@dpmc.ae'); setPassword('admin123') }

  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <ParticleCanvas />

      {/* Left branding panel */}
      <motion.div
        className="hidden lg:flex flex-col justify-center items-start w-[55%] px-20 relative z-10"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Hospital crest */}
        <div className="flex items-center gap-4 mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #075985 100%)',
              boxShadow: '0 0 40px rgba(14,165,233,0.4), 0 0 80px rgba(14,165,233,0.15)',
            }}
          >
            <Cross size={30} color="white" />
          </div>
          <div>
            <div className="text-3xl font-900 tracking-tight" style={{ color: '#e2f0ff' }}>
              MediCare <span className="gradient-text-gold">Pro</span>
            </div>
            <div className="text-sm font-500 tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Enterprise Edition
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-900 leading-tight mb-4 tracking-tight">
          <span className="gradient-text-hero">Next-Generation</span>
          <br />
          <span style={{ color: '#e2f0ff' }}>Hospital Command</span>
          <br />
          <span style={{ color: '#e2f0ff' }}>& Control System</span>
        </h1>

        <p className="text-base mb-8 max-w-md leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Powering Dubai's most advanced medical center with real-time clinical intelligence,
          AI-driven decision support, and seamless departmental coordination.
        </p>

        {/* ECG decoration */}
        <div className="w-full max-w-md mb-8">
          <EcgLine />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8">
          {[
            { value: '1,200+', label: 'Beds' },
            { value: '85',     label: 'Departments' },
            { value: '3,400+', label: 'Staff Members' },
            { value: '24/7',   label: 'Operations' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-800 gradient-text-blue">{s.value}</div>
              <div className="text-xs font-500 mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="flex items-center gap-3 mt-10">
          {['JCI Accredited', 'ISO 27001', 'DHA Certified', 'HIMSS Stage 7'].map(cert => (
            <span key={cert} className="badge badge-blue text-[10px]">{cert}</span>
          ))}
        </div>
      </motion.div>

      {/* Right login panel */}
      <motion.div
        className="flex flex-col items-center justify-center flex-1 px-8 relative z-10"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="w-full max-w-sm">
          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(10,22,48,0.95), rgba(6,11,24,0.98))',
              border: '1px solid rgba(56,189,248,0.15)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {/* Icon */}
            <div className="flex flex-col items-center mb-7">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.05))',
                  border: '1px solid rgba(14,165,233,0.3)',
                  boxShadow: '0 0 20px rgba(14,165,233,0.15)',
                }}
              >
                <Lock size={22} style={{ color: '#38bdf8' }} />
              </div>
              <h2 className="text-xl font-700 text-center" style={{ color: 'var(--text-primary)' }}>
                Secure Sign In
              </h2>
              <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>
                Dubai Premier Medical Center
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                className="mb-4 p-3 rounded-lg text-xs text-red-400 flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Employee ID / Email
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="input pl-9"
                    placeholder="you@dpmc.ae"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pl-9 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                    onClick={() => setShowPass(s => !s)}
                  >
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-sky-500" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Remember me</span>
                </label>
                <button type="button" className="text-xs text-sky-400 hover:text-sky-300 font-500">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full btn btn-primary btn-lg mt-2 justify-center"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Authenticating...</>
                ) : (
                  <>Sign In to System <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Demo hint */}
            <div
              className="mt-5 p-3 rounded-xl text-center cursor-pointer transition-colors"
              style={{ background: 'rgba(56,189,248,0.05)', border: '1px dashed rgba(56,189,248,0.15)' }}
              onClick={fillDemo}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(56,189,248,0.05)'}
            >
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Demo: <span className="text-sky-400 font-600">admin@dpmc.ae</span> / <span className="text-sky-400 font-600">admin123</span>
                <span className="block mt-0.5 text-[10px]">Click to auto-fill</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] mt-5" style={{ color: 'var(--text-muted)' }}>
            © 2026 Dubai Premier Medical Center · Powered by MediCare Pro
          </p>
        </div>
      </motion.div>
    </div>
  )
}
