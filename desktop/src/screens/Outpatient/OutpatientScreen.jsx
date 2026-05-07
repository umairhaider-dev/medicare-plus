import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Stethoscope, Users, Clock, CheckCircle, Calendar, Search,
  Plus, Filter, ChevronRight, Activity, User, Phone, AlertCircle,
  Timer, MapPin, Star,
} from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'

const QUEUE = [
  { token: 'A001', pt: 'Mohammed Al Hassan', mrn: 'MR-1001', age: 54, reason: 'Follow-up: Hypertension', dr: 'Dr. Al Rashidi', room: 'C-01', waited: '12m', status: 'in_consultation', priority: 'normal' },
  { token: 'A002', pt: 'Sarah Johnson',       mrn: 'MR-1007', age: 38, reason: 'New: Chest pain evaluation',dr: 'Dr. Al Rashidi', room: 'C-01', waited: '28m', status: 'waiting', priority: 'urgent'  },
  { token: 'A003', pt: 'Ahmed Khalil',         mrn: 'MR-1013', age: 67, reason: 'Follow-up: Kidney function', dr: 'Dr. Hassan', room: 'C-02', waited: '35m', status: 'waiting', priority: 'normal'  },
  { token: 'A004', pt: 'Fatima Al Zaabi',      mrn: 'MR-1022', age: 29, reason: 'OB/GYN: 28-week checkup',  dr: 'Dr. Chandra', room: 'C-04', waited: '18m', status: 'waiting', priority: 'normal'  },
  { token: 'A005', pt: 'Ravi Patel',           mrn: 'MR-1034', age: 45, reason: 'Follow-up: Post-op review', dr: 'Dr. Fernandez',room: 'C-03', waited: '5m', status: 'called', priority: 'normal'   },
  { token: 'A006', pt: 'Elena Popescu',        mrn: 'MR-1041', age: 61, reason: 'New: Back pain',           dr: 'Dr. Al Zaabi', room: 'C-05', waited: '42m', status: 'waiting', priority: 'normal'  },
  { token: 'B001', pt: 'Carlos Mendez',        mrn: 'MR-1056', age: 33, reason: 'New: Diabetes screening',  dr: 'Dr. Patel',    room: 'C-06', waited: '55m', status: 'waiting', priority: 'normal'  },
  { token: 'B002', pt: 'Aisha Abdullah',       mrn: 'MR-1062', age: 27, reason: 'Follow-up: Thyroid',       dr: 'Dr. Patel',    room: 'C-06', waited: '8m',  status: 'completed', priority: 'normal' },
]

const DOCTORS = [
  { name: 'Dr. Al Rashidi',  spec: 'Cardiology',   room: 'C-01', queue: 4, avg_wait: '22m', status: 'busy',      rating: 4.9 },
  { name: 'Dr. Hassan',      spec: 'Nephrology',    room: 'C-02', queue: 3, avg_wait: '18m', status: 'busy',      rating: 4.8 },
  { name: 'Dr. Fernandez',   spec: 'Orthopedics',   room: 'C-03', queue: 2, avg_wait: '12m', status: 'available', rating: 4.7 },
  { name: 'Dr. Chandra',     spec: 'OB/GYN',        room: 'C-04', queue: 5, avg_wait: '30m', status: 'busy',      rating: 4.9 },
  { name: 'Dr. Al Zaabi',    spec: 'Neurology',     room: 'C-05', queue: 3, avg_wait: '25m', status: 'busy',      rating: 4.8 },
  { name: 'Dr. Patel',       spec: 'Endocrinology', room: 'C-06', queue: 2, avg_wait: '15m', status: 'available', rating: 4.6 },
]

const statusConfig = {
  in_consultation: { label: 'In Consultation', badge: 'badge-blue',   color: '#38bdf8' },
  waiting:         { label: 'Waiting',          badge: 'badge-gold',   color: '#fbbf24' },
  called:          { label: 'Called',           badge: 'badge-purple', color: '#a78bfa' },
  completed:       { label: 'Completed',        badge: 'badge-green',  color: '#34d399' },
}

export default function OutpatientScreen() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState('queue')

  const waiting   = QUEUE.filter(q => q.status === 'waiting').length
  const serving   = QUEUE.filter(q => q.status === 'in_consultation').length
  const completed = QUEUE.filter(q => q.status === 'completed').length
  const urgent    = QUEUE.filter(q => q.priority === 'urgent').length

  const filtered = QUEUE.filter(q =>
    !search || q.pt.toLowerCase().includes(search.toLowerCase()) || q.token.includes(search.toUpperCase()) || q.mrn.includes(search)
  )

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Stethoscope size={22} style={{ color: '#0ea5e9' }} />
            Outpatient Clinic (OPD)
          </h1>
          <p className="page-subtitle">Queue Management · Consultation Tracking · Doctor Schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm gap-1.5 text-xs"><Filter size={12} />Filter</button>
          <button className="btn btn-primary btn-sm gap-1.5 text-xs"><Plus size={13} />Register Patient</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        {[
          { label: 'Total in Queue', value: QUEUE.length, color: '#0ea5e9',  sub: 'All statuses' },
          { label: 'Waiting',        value: waiting,       color: '#fbbf24',  sub: 'Avg wait 24m'  },
          { label: 'In Consultation',value: serving,       color: '#8b5cf6',  sub: `${DOCTORS.filter(d=>d.status==='busy').length} doctors busy` },
          { label: 'Urgent Cases',   value: urgent,        color: '#ef4444',  sub: 'Priority queue' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard className="p-4">
              <div className="text-xs font-600 mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              <div className="text-3xl font-900" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Live Queue Board */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        {[
          { status: 'in_consultation', label: 'Now Serving', color: '#38bdf8'  },
          { status: 'called',          label: 'Please Proceed', color: '#a78bfa' },
          { status: 'waiting',         label: 'Next Up',     color: '#fbbf24'  },
        ].map(({ status, label, color }) => {
          const items = QUEUE.filter(q => q.status === status).slice(0, 2)
          return (
            <GlassCard key={status} className="p-3" style={{ border: `1px solid ${color}25` }}>
              <div className="text-[10px] font-700 uppercase tracking-wider mb-2" style={{ color }}>{label}</div>
              {items.length === 0
                ? <p className="text-xs" style={{ color: 'var(--text-muted)' }}>None</p>
                : items.map(q => (
                  <div key={q.token} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid rgba(56,189,248,0.06)' }}>
                    <div>
                      <div className="text-sm font-800" style={{ color }}>{q.token}</div>
                      <div className="text-xs" style={{ color: 'var(--text-primary)' }}>{q.pt}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{q.dr} · {q.room}</div>
                    </div>
                    {q.priority === 'urgent' && (
                      <AlertCircle size={14} style={{ color: '#f87171' }} />
                    )}
                  </div>
                ))
              }
            </GlassCard>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="flex gap-5" style={{ flex: 1, minHeight: 0 }}>
        {/* Queue Table */}
        <div style={{ flex: 3 }}>
          <GlassCard className="p-4 h-full flex flex-col gap-3">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Full Queue</h3>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input className="input pl-7 text-xs py-1.5" style={{ width: 200 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="data-table">
                <thead>
                  <tr>
                    {['Token', 'Patient', 'Reason', 'Doctor', 'Room', 'Waited', 'Status'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(q => (
                    <tr key={q.token}>
                      <td>
                        <div className="text-sm font-800" style={{ color: '#38bdf8' }}>{q.token}</div>
                        {q.priority === 'urgent' && <span className="badge badge-red text-[9px]">URGENT</span>}
                      </td>
                      <td>
                        <div className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{q.pt}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{q.mrn} · {q.age}y</div>
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-secondary)', maxWidth: 160 }}>{q.reason}</td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{q.dr}</td>
                      <td><span className="badge badge-gray text-[10px]">{q.room}</span></td>
                      <td>
                        <div className="flex items-center gap-1" style={{ color: parseInt(q.waited) > 30 ? '#f87171' : 'var(--text-muted)' }}>
                          <Timer size={10} />
                          <span className="text-xs">{q.waited}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge text-[10px] ${statusConfig[q.status].badge}`}>
                          {statusConfig[q.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Doctor Status */}
        <div style={{ flex: 2 }}>
          <GlassCard className="p-4 h-full flex flex-col gap-3">
            <h3 className="text-sm font-700 flex-shrink-0" style={{ color: 'var(--text-primary)' }}>Doctor Status</h3>
            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
              {DOCTORS.map((d, i) => (
                <motion.div key={d.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl" style={{
                    background: d.status === 'available' ? 'rgba(16,185,129,0.06)' : 'rgba(10,22,48,0.5)',
                    border: `1px solid ${d.status === 'available' ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.07)'}`,
                  }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="text-xs font-700" style={{ color: 'var(--text-primary)' }}>{d.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.spec} · {d.room}</div>
                    </div>
                    <span className={`badge text-[9px] ${d.status === 'available' ? 'badge-green' : 'badge-blue'}`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Users size={9} />{d.queue} in queue</span>
                    <span className="flex items-center gap-1"><Clock size={9} />Avg {d.avg_wait}</span>
                    <span className="flex items-center gap-1"><Star size={9} style={{ color: '#fbbf24' }} />{d.rating}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
