import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, BedDouble, AlertTriangle, DollarSign, Activity, FlaskConical,
  Calendar, Pill, ArrowUpRight, ArrowDownRight, Clock, TrendingUp,
  Heart, Thermometer, Wind, Droplets, Stethoscope, ChevronRight,
  UserCheck, Zap, Shield, BarChart2,
} from 'lucide-react'
import MetricCard from '../../components/ui/MetricCard'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import { format } from 'date-fns'

/* ── Mock live data ────────────────────────────────────────────────── */
const PATIENT_FLOW = [
  { h: '00', adm: 4, dis: 2, er: 8  },
  { h: '02', adm: 2, dis: 1, er: 12 },
  { h: '04', adm: 1, dis: 0, er: 6  },
  { h: '06', adm: 3, dis: 2, er: 9  },
  { h: '08', adm: 12,dis: 8, er: 22 },
  { h: '10', adm: 18,dis: 14,er: 31 },
  { h: '12', adm: 22,dis: 18,er: 38 },
  { h: '14', adm: 19,dis: 20,er: 35 },
  { h: '16', adm: 25,dis: 22,er: 42 },
  { h: '18', adm: 20,dis: 18,er: 38 },
  { h: '20', adm: 14,dis: 12,er: 28 },
  { h: '22', adm: 8, dis: 6, er: 16 },
]

const REVENUE_TREND = [
  { m: 'Jan', rev: 4.2, target: 4.0 },
  { m: 'Feb', rev: 4.8, target: 4.2 },
  { m: 'Mar', rev: 4.5, target: 4.4 },
  { m: 'Apr', rev: 5.1, target: 4.6 },
  { m: 'May', rev: 5.6, target: 4.8 },
  { m: 'Jun', rev: 5.3, target: 5.0 },
  { m: 'Jul', rev: 6.0, target: 5.2 },
]

const DEPT_LOAD = [
  { dept: 'Emergency', load: 94, color: '#ef4444' },
  { dept: 'ICU',       load: 87, color: '#f97316' },
  { dept: 'Cardiology',load: 72, color: '#0ea5e9' },
  { dept: 'Pediatrics',load: 65, color: '#8b5cf6' },
  { dept: 'OB/GYN',    load: 78, color: '#ec4899' },
  { dept: 'Orthopedics',load:58, color: '#14b8a6' },
]

const CASE_MIX = [
  { name: 'Medical',   value: 35, color: '#0ea5e9' },
  { name: 'Surgical',  value: 22, color: '#8b5cf6' },
  { name: 'Emergency', value: 18, color: '#ef4444' },
  { name: 'Pediatric', value: 14, color: '#10b981' },
  { name: 'OB/GYN',   value: 11, color: '#ec4899' },
]

const CRITICAL_ALERTS = [
  { id: 1, type: 'critical', dept: 'ICU',        msg: 'Bed ICU-3: O₂ saturation critical (84%)',        time: '2m', action: 'View Patient' },
  { id: 2, type: 'critical', dept: 'Emergency',   msg: 'Trauma bay: MVA patient arriving, ETA 8 min',   time: '4m', action: 'Alert Team'  },
  { id: 3, type: 'warning',  dept: 'Lab',         msg: 'Potassium 7.2 mEq/L critical — MR-1042',        time: '7m', action: 'View Report' },
  { id: 4, type: 'warning',  dept: 'Pharmacy',    msg: 'Epinephrine stock critically low (3 units left)',time: '12m',action: 'Order Now'   },
  { id: 5, type: 'info',     dept: 'Radiology',   msg: 'CT Chest: Pulmonary embolism suspected — MR-887',time:'18m',action: 'View Scan'   },
]

const SURGERY_TODAY = [
  { or: 'OT-1', proc: 'CABG',             surgeon: 'Dr. Al Rashidi',  start: '07:30', dur: '4h',   status: 'in_progress' },
  { or: 'OT-2', proc: 'Total Hip Replace',surgeon: 'Dr. Patel',       start: '09:00', dur: '2.5h', status: 'in_progress' },
  { or: 'OT-3', proc: 'Appendectomy',     surgeon: 'Dr. Hassan',      start: '11:00', dur: '1h',   status: 'scheduled'   },
  { or: 'OT-4', proc: 'Laparoscopic Chole',surgeon:'Dr. Chandra',     start: '12:30', dur: '1.5h', status: 'scheduled'   },
  { or: 'OT-5', proc: 'Craniotomy',       surgeon: 'Dr. Al Zaabi',    start: '13:00', dur: '5h',   status: 'scheduled'   },
]

/* ── Bed Map ────────────────────────────────────────────────────────── */
function BedMap() {
  const beds = [
    ...Array(18).fill('occupied'),
    ...Array(8).fill('available'),
    ...Array(4).fill('reserved'),
    ...Array(2).fill('cleaning'),
    ...Array(6).fill('icu'),
  ].sort(() => Math.random() - 0.5)

  const STATUS_MAP = {
    occupied:  { css: 'bed-occupied',  label: 'OCC' },
    available: { css: 'bed-available', label: 'AVL' },
    reserved:  { css: 'bed-reserved',  label: 'RES' },
    cleaning:  { css: 'bed-cleaning',  label: 'CLN' },
    icu:       { css: 'bed-icu',       label: 'ICU' },
  }

  return (
    <div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
        {beds.map((s, i) => {
          const st = STATUS_MAP[s]
          return (
            <div key={i} className={`bed-cell ${st.css}`} title={`Bed ${i + 1}: ${s}`}>
              <BedDouble size={10} />
              <span>{i + 1}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <div className={`w-2.5 h-2.5 rounded-sm ${v.css}`} />
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Custom Tooltip ────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-xs">
      <p className="font-600 mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-600" style={{ color: 'var(--text-primary)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Animated Counter ──────────────────────────────────────────────── */
function Counter({ to, duration = 1.5 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const step = () => {
      const elapsed = (Date.now() - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      setVal(Math.round(progress * to))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [to])
  return <>{val.toLocaleString()}</>
}

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(v => v + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  const METRICS = [
    { label: t('dashboard.metric_patients'),  value: <Counter to={312} />, unit: '',      icon: Users,        variant: 'blue',   trend: 8,  subtitle: `47 ${t('dashboard.sub_waiting_ed')}` },
    { label: t('dashboard.metric_beds'),      value: <Counter to={87} />,  unit: '/ 120', icon: BedDouble,    variant: 'gold',   trend: -2, subtitle: `33 ${t('dashboard.sub_available')}` },
    { label: t('dashboard.metric_emergency'), value: <Counter to={34} />,  unit: '',      icon: AlertTriangle,variant: 'red',    trend: 15, subtitle: `7 ${t('dashboard.sub_critical_sev')}` },
    { label: t('dashboard.metric_revenue'),   value: 'AED 842K',           unit: '',      icon: DollarSign,   variant: 'green',  trend: 12, subtitle: `${t('dashboard.sub_target')}: AED 900K` },
    { label: t('dashboard.metric_surgeries'), value: <Counter to={12} />,  unit: '',      icon: Activity,     variant: 'purple', trend: 0,  subtitle: `5 ${t('dashboard.sub_in_progress')}` },
    { label: t('dashboard.metric_lab'),       value: <Counter to={89} />,  unit: '',      icon: FlaskConical, variant: 'teal',   trend: -5, subtitle: `12 ${t('dashboard.sub_critical_val')}` },
  ]

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.05))', border: '1px solid rgba(14,165,233,0.3)' }}
            >
              <BarChart2 size={15} style={{ color: '#38bdf8' }} />
            </div>
            {t('dashboard.title')}
          </h1>
          <p className="page-subtitle">
            {format(new Date(), "EEEE, dd MMMM yyyy")} · {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-500"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
            <span className="pulse-dot" style={{ background: '#10b981', color: '#10b981' }} />
            {t('dashboard.live')} · {format(new Date(), 'HH:mm')}
          </div>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-6 gap-4 flex-shrink-0">
        {METRICS.map((m, i) => (
          <MetricCard key={m.label} {...m} delay={i * 0.06} animate />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">

        {/* Patient Flow Chart */}
        <GlassCard className="col-span-5" animate delay={0.2} padding={false}>
          <div className="p-4 pb-0 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{t('dashboard.patient_flow')}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('dashboard.patient_flow_sub')}</p>
            </div>
            <Badge variant="blue" dot>{t('dashboard.live')}</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={PATIENT_FLOW} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gAdm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gEr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.05)" />
              <XAxis dataKey="h" tick={{ fill: '#445e7a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#445e7a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="er"  name="ED Visits"   stroke="#ef4444" fill="url(#gEr)"  strokeWidth={2} />
              <Area type="monotone" dataKey="adm" name="Admissions"  stroke="#0ea5e9" fill="url(#gAdm)" strokeWidth={2} />
              <Area type="monotone" dataKey="dis" name="Discharges"  stroke="#10b981" fill="none"        strokeWidth={1.5} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Critical Alerts */}
        <GlassCard className="col-span-4" animate delay={0.25}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={15} style={{ color: '#ef4444' }} />
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{t('dashboard.critical_alerts')}</h3>
            </div>
            <span className="badge badge-red">{CRITICAL_ALERTS.filter(a=>a.type==='critical').length} critical</span>
          </div>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 220 }}>
            {CRITICAL_ALERTS.map(alert => (
              <div
                key={alert.id}
                className={`alert-item alert-${alert.type === 'info' ? 'info' : alert.type === 'warning' ? 'warning' : 'critical'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-700 uppercase tracking-wider" style={{
                      color: alert.type === 'critical' ? '#f87171' : alert.type === 'warning' ? '#fb923c' : '#38bdf8'
                    }}>{alert.dept}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{alert.time} ago</span>
                  </div>
                  <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>{alert.msg}</p>
                </div>
                <button
                  className="text-[10px] font-600 text-sky-400 hover:text-sky-300 flex-shrink-0 mt-0.5"
                  onClick={() => {}}
                >
                  {alert.action}
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Revenue Chart */}
        <GlassCard className="col-span-3" animate delay={0.3} padding={false}>
          <div className="p-4 pb-0">
            <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{t('dashboard.revenue_trend')}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('dashboard.revenue_sub')}</p>
          </div>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={REVENUE_TREND} margin={{ top: 16, right: 12, left: -24, bottom: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.05)" vertical={false} />
              <XAxis dataKey="m" tick={{ fill: '#445e7a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#445e7a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rev"    name="Revenue" fill="#0ea5e9" radius={[3,3,0,0]} opacity={0.8} />
              <Bar dataKey="target" name="Target"  fill="rgba(245,158,11,0.35)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Bed Map */}
        <GlassCard className="col-span-4" animate delay={0.35}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BedDouble size={15} style={{ color: '#0ea5e9' }} />
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{t('dashboard.hospital_census')}</h3>
            </div>
            <div className="text-xs font-600" style={{ color: 'var(--text-muted)' }}>
              87 / 120 occupied
            </div>
          </div>
          <BedMap />
          {/* Utilisation bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
              <span>Bed Utilisation</span><span>72.5%</span>
            </div>
            <div className="severity-bar">
              <motion.div
                className="severity-fill"
                style={{ background: 'linear-gradient(90deg, #0ea5e9, #ef4444)', width: '72.5%' }}
                initial={{ width: 0 }}
                animate={{ width: '72.5%' }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Department Load */}
        <GlassCard className="col-span-3" animate delay={0.4}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} style={{ color: '#8b5cf6' }} />
            <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{t('dashboard.dept_workload')}</h3>
          </div>
          <div className="space-y-3">
            {DEPT_LOAD.map(d => (
              <div key={d.dept}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>{d.dept}</span>
                  <span className="font-700" style={{ color: d.load > 85 ? '#f87171' : d.load > 70 ? '#fbbf24' : '#34d399' }}>
                    {d.load}%
                  </span>
                </div>
                <div className="severity-bar" style={{ height: 5 }}>
                  <motion.div
                    className="severity-fill"
                    style={{ background: d.color, width: `${d.load}%`, opacity: 0.8 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.load}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Case Mix Pie */}
        <GlassCard className="col-span-2" animate delay={0.42} padding={false}>
          <div className="p-4 pb-0">
            <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{t('dashboard.case_mix')}</h3>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={CASE_MIX} cx="50%" cy="50%" innerRadius={32} outerRadius={48} paddingAngle={3} dataKey="value">
                {CASE_MIX.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ background: 'rgba(10,22,48,0.95)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="px-3 pb-3 space-y-1">
            {CASE_MIX.map(c => (
              <div key={c.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span style={{ color: 'var(--text-muted)' }}>{c.name}</span>
                </div>
                <span className="font-600" style={{ color: 'var(--text-secondary)' }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Today's Surgery Schedule */}
        <GlassCard className="col-span-3" animate delay={0.45}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Stethoscope size={15} style={{ color: '#f59e0b' }} />
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{t('dashboard.or_schedule')}</h3>
            </div>
            <button className="text-[11px] text-sky-400 flex items-center gap-0.5" onClick={() => navigate('/surgery')}>
              All <ChevronRight size={11} />
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 180 }}>
            {SURGERY_TODAY.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl transition-colors"
                style={{ background: 'rgba(10,22,48,0.4)', border: '1px solid rgba(56,189,248,0.06)' }}
              >
                <div
                  className="px-2 py-0.5 rounded font-700 text-[10px] flex-shrink-0 mt-0.5"
                  style={{
                    background: 'rgba(14,165,233,0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(14,165,233,0.2)',
                  }}
                >
                  {s.or}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-600 truncate" style={{ color: 'var(--text-primary)' }}>{s.proc}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.surgeon} · {s.start} · {s.dur}</p>
                </div>
                <Badge
                  variant={s.status === 'in_progress' ? 'orange' : 'blue'}
                  size="xs"
                >
                  {s.status === 'in_progress' ? 'Active' : 'Sched.'}
                </Badge>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="col-span-2" animate delay={0.48}>
          <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: UserCheck,   label: 'Admit Patient',   to: '/patients',     color: '#0ea5e9' },
              { icon: Calendar,    label: 'New Appt',        to: '/appointments', color: '#8b5cf6' },
              { icon: AlertTriangle,label:'ED Triage',       to: '/emergency',    color: '#ef4444' },
              { icon: Pill,        label: 'Dispense Rx',     to: '/pharmacy',     color: '#10b981' },
              { icon: FlaskConical,label: 'Order Lab',       to: '/lab',          color: '#f59e0b' },
              { icon: Shield,      label: 'Incident Rpt',   to: '/quality',      color: '#f97316' },
            ].map(a => (
              <button
                key={a.label}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: 'rgba(10,22,48,0.5)', border: '1px solid rgba(56,189,248,0.07)' }}
                onClick={() => navigate(a.to)}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${a.color}40`}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(56,189,248,0.07)'}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${a.color}18` }}
                >
                  <a.icon size={14} style={{ color: a.color }} />
                </div>
                <span className="text-[10px] font-600 text-center leading-tight" style={{ color: 'var(--text-muted)' }}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  )
}
