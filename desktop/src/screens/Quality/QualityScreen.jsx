import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, CheckCircle, AlertTriangle, XCircle, TrendingUp,
  Award, FileText, BarChart2, Users, Activity, Plus, Download,
  ClipboardCheck, Star, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import GlassCard from '../../components/ui/GlassCard'

const ACCREDITATIONS = [
  { name: 'JCI Accreditation',         status: 'active', score: 96.4, expires: '2027-08-15', badge: '🏆' },
  { name: 'ISO 9001:2015',              status: 'active', score: 98.1, expires: '2026-11-30', badge: '⭐' },
  { name: 'DHA License',               status: 'active', score: 100,  expires: '2026-12-31', badge: '🏛️' },
  { name: 'MOH Approval',              status: 'active', score: 100,  expires: '2026-12-31', badge: '✅' },
  { name: 'CLIA Laboratory Cert.',     status: 'active', score: 95.2, expires: '2027-03-10', badge: '🔬' },
  { name: 'Magnet Recognition',        status: 'pending',score: 88.0, expires: '—',          badge: '🧲' },
]

const KPIs = [
  { name: 'Patient Satisfaction',       value: 94.2, target: 90, unit: '%',   trend: 'up',   color: '#10b981' },
  { name: 'Medication Error Rate',      value: 0.04, target: 0.1, unit: '%',  trend: 'down', color: '#10b981', inversed: true },
  { name: 'Hand Hygiene Compliance',    value: 97.8, target: 95, unit: '%',   trend: 'up',   color: '#10b981' },
  { name: 'Hospital-Acquired Infection',value: 1.2,  target: 2.0, unit: '%',  trend: 'up',   color: '#10b981', inversed: true },
  { name: 'Mortality Rate (Risk-Adj.)', value: 0.8,  target: 1.5, unit: '%',  trend: 'up',   color: '#10b981', inversed: true },
  { name: 'Readmission Rate (30-day)',  value: 4.1,  target: 5.0, unit: '%',  trend: 'down', color: '#fbbf24', inversed: true },
  { name: 'Surgical Site Infection',   value: 0.9,  target: 1.0, unit: '%',  trend: 'up',   color: '#10b981', inversed: true },
  { name: 'Falls per 1000 Patient Days',value: 0.3, target: 0.5, unit: '',   trend: 'up',   color: '#10b981', inversed: true },
]

const INCIDENTS = [
  { id: 'INC-441', type: 'Near Miss',    dept: 'Pharmacy',  desc: 'Look-alike drug detected before administration',  severity: 'low',    status: 'closed',      date: '2026-05-06' },
  { id: 'INC-442', type: 'Medication',   dept: 'Ward B',    desc: 'Wrong dose administered — patient unharmed',      severity: 'medium', status: 'under_review',date: '2026-05-07' },
  { id: 'INC-443', type: 'Fall',         dept: 'Surgery',   desc: 'Post-op patient fall from bed — no injury',       severity: 'medium', status: 'investigating',date: '2026-05-07' },
  { id: 'INC-444', type: 'Equipment',    dept: 'ICU',       desc: 'Ventilator alarm malfunction — backup activated',  severity: 'high',   status: 'closed',      date: '2026-05-05' },
  { id: 'INC-445', type: 'Infection',    dept: 'NICU',      desc: 'Suspected CLABSI — cultures pending',             severity: 'high',   status: 'investigating',date: '2026-05-07' },
]

const AUDIT_ITEMS = [
  { area: 'Hand Hygiene Compliance',          score: 97, max: 100, status: 'pass' },
  { area: 'Medication Administration',        score: 94, max: 100, status: 'pass' },
  { area: 'Patient Identification Protocol',  score: 98, max: 100, status: 'pass' },
  { area: 'Surgical Safety Checklist',        score: 100,max: 100, status: 'pass' },
  { area: 'Fall Prevention Measures',         score: 88, max: 100, status: 'pass' },
  { area: 'Pressure Injury Prevention',       score: 82, max: 100, status: 'warning' },
  { area: 'Isolation Precautions',            score: 96, max: 100, status: 'pass' },
  { area: 'Resuscitation Equipment Check',    score: 100,max: 100, status: 'pass' },
]

const RADAR_DATA = [
  { subject: 'Safety',        score: 96 },
  { subject: 'Effectiveness', score: 91 },
  { subject: 'Patient-Centred',score: 94 },
  { subject: 'Timeliness',    score: 88 },
  { subject: 'Efficiency',    score: 85 },
  { subject: 'Equity',        score: 92 },
]

const TREND_DATA = [
  { month: 'Nov', score: 88.2 },
  { month: 'Dec', score: 89.7 },
  { month: 'Jan', score: 91.1 },
  { month: 'Feb', score: 92.4 },
  { month: 'Mar', score: 93.8 },
  { month: 'Apr', score: 94.9 },
  { month: 'May', score: 96.4 },
]

const severityColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' }
const severityBadge = { low: 'badge-green', medium: 'badge-gold', high: 'badge-red' }
const incidentStatus = { closed: 'badge-gray', under_review: 'badge-blue', investigating: 'badge-orange' }

export default function QualityScreen() {
  const [activeTab, setActiveTab] = useState('overview')

  const overallScore = 96.4
  const passAudits = AUDIT_ITEMS.filter(a => a.status === 'pass').length

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield size={22} style={{ color: '#f59e0b' }} />
            Quality Control & JCI
          </h1>
          <p className="page-subtitle">Accreditation · KPIs · Incident Reporting · Clinical Audits</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm gap-1.5 text-xs"><Download size={12} />Export Report</button>
          <button className="btn btn-gold btn-sm gap-1.5 text-xs"><Plus size={13} />Report Incident</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-shrink-0" style={{ borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
        {['overview', 'kpis', 'incidents', 'audits', 'accreditations'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-xs font-600 capitalize transition-all"
            style={{
              color: activeTab === tab ? '#fbbf24' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid #fbbf24' : '2px solid transparent',
              marginBottom: -1,
            }}
          >{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
          {/* Score Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'JCI Overall Score',    value: `${overallScore}%`, trend: '+2.6%',  color: '#f59e0b', up: true },
              { label: 'Incidents This Month', value: INCIDENTS.length,   trend: '-2 vs last', color: '#10b981', up: false },
              { label: 'Audit Pass Rate',      value: `${passAudits}/${AUDIT_ITEMS.length}`, trend: '100% target', color: '#0ea5e9', up: true },
              { label: 'Patient Satisfaction', value: '94.2%',             trend: '+1.4%', color: '#8b5cf6', up: true },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <GlassCard className="p-4">
                  <div className="text-xs font-600 mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                  <div className="text-2xl font-800 mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="flex items-center gap-1 text-[11px]" style={{ color: s.up ? '#34d399' : '#f87171' }}>
                    {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {s.trend}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-4">
              <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>JCI Score Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: '#445e7a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fill: '#445e7a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(10,22,48,0.95)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 10 }} />
                  <Bar dataKey="score" fill="url(#goldGrad)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4">
              <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Care Quality Domains</h3>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="rgba(56,189,248,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#445e7a', fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} dot={{ fill: '#f59e0b', r: 3 }} />
                </RadarChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {activeTab === 'kpis' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4">
            <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Key Performance Indicators</h3>
            <table className="data-table">
              <thead>
                <tr>
                  {['Indicator', 'Current', 'Target', 'Status', 'Trend'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {KPIs.map(k => {
                  const met = k.inversed ? k.value <= k.target : k.value >= k.target
                  return (
                    <tr key={k.name}>
                      <td className="font-600 text-xs" style={{ color: 'var(--text-primary)' }}>{k.name}</td>
                      <td className="font-800 text-sm" style={{ color: met ? '#34d399' : '#fbbf24' }}>
                        {k.value}{k.unit}
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{k.target}{k.unit}</td>
                      <td>
                        <span className={`badge text-[10px] ${met ? 'badge-green' : 'badge-gold'}`}>
                          {met ? '✓ Met' : '⚠ Below'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: k.trend === 'up' ? '#34d399' : '#f87171', fontSize: 12 }}>
                          {k.trend === 'up' ? '↑' : '↓'} improving
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'incidents' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Incident Reports</h3>
              <button className="btn btn-gold btn-sm gap-1.5 text-xs"><Plus size={12} />New Report</button>
            </div>
            <div className="flex flex-col gap-3">
              {INCIDENTS.map((inc, i) => (
                <motion.div key={inc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl" style={{
                    background: 'rgba(10,22,48,0.6)',
                    border: `1px solid ${severityColor[inc.severity]}25`,
                    borderLeft: `3px solid ${severityColor[inc.severity]}`,
                  }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-700" style={{ color: '#38bdf8' }}>{inc.id}</span>
                        <span className={`badge text-[9px] ${severityBadge[inc.severity]}`}>{inc.severity}</span>
                        <span className={`badge text-[9px] ${incidentStatus[inc.status]}`}>{inc.status.replace('_',' ')}</span>
                      </div>
                      <div className="text-xs font-600 mb-0.5" style={{ color: 'var(--text-primary)' }}>{inc.desc}</div>
                      <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span>{inc.type}</span>
                        <span>·</span>
                        <span>{inc.dept}</span>
                        <span>·</span>
                        <span>{inc.date}</span>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm text-xs ml-2">Review</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'audits' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4">
            <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Clinical Audit Results — May 2026</h3>
            <div className="flex flex-col gap-3">
              {AUDIT_ITEMS.map((a, i) => {
                const pct = Math.round((a.score / a.max) * 100)
                const color = a.status === 'pass' ? '#10b981' : '#f59e0b'
                return (
                  <motion.div key={a.area} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{a.area}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-800" style={{ color }}>{a.score}%</span>
                        {a.status === 'pass'
                          ? <CheckCircle size={13} style={{ color: '#34d399' }} />
                          : <AlertTriangle size={13} style={{ color: '#fbbf24' }} />
                        }
                      </div>
                    </div>
                    <div className="severity-bar">
                      <div className="severity-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'accreditations' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1}}>
          <div className="grid grid-cols-3 gap-4">
            {ACCREDITATIONS.map((acc, i) => (
              <motion.div key={acc.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                <GlassCard className="p-5 text-center">
                  <div className="text-4xl mb-3">{acc.badge}</div>
                  <div className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>{acc.name}</div>
                  <div className="text-2xl font-900 mb-1" style={{ color: acc.status === 'active' ? '#10b981' : '#f59e0b' }}>{acc.score}%</div>
                  <div className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
                    {acc.status === 'active' ? `Expires: ${acc.expires}` : 'Application in progress'}
                  </div>
                  <span className={`badge text-xs ${acc.status === 'active' ? 'badge-green' : 'badge-gold'}`}>
                    {acc.status === 'active' ? '✓ Accredited' : '⏳ Pending'}
                  </span>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
