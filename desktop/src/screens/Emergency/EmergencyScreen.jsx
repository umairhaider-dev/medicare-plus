import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, User, Plus, Activity, ChevronRight, Filter, Search } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ESI_LEVELS } from '../../constants'

const TRIAGE_QUEUE = [
  { id: 'T-001', name: 'Mohammed Al Hassan',  age: 62, gender: 'M', esi: 1, complaint: 'STEMI — chest pain, diaphoresis', wait: '0m',  vitals: { bp: '80/50', hr: 124, spo2: 91, rr: 28, temp: 37.2 }, bay: 'Trauma 1', assigned: 'Dr. Al Rashidi' },
  { id: 'T-002', name: 'Sarah Johnson',        age: 34, gender: 'F', esi: 2, complaint: 'Severe dyspnea, wheezing',        wait: '6m',  vitals: { bp: '148/92', hr: 110, spo2: 88, rr: 24, temp: 38.1 }, bay: 'Bay 2',     assigned: 'Dr. Hassan'     },
  { id: 'T-003', name: 'Ahmed Khalil',         age: 45, gender: 'M', esi: 2, complaint: 'Altered consciousness, GCS 10',  wait: '8m',  vitals: { bp: '180/110', hr: 98, spo2: 95, rr: 18, temp: 37.8 }, bay: 'Bay 3',     assigned: 'Dr. Chandra'    },
  { id: 'T-004', name: 'Fatima Al Zaabi',      age: 28, gender: 'F', esi: 3, complaint: 'Acute appendicitis (suspected)', wait: '22m', vitals: { bp: '122/78', hr: 88, spo2: 98, rr: 16, temp: 38.6 }, bay: 'Bay 5',     assigned: 'Pending'        },
  { id: 'T-005', name: 'Ravi Patel',           age: 51, gender: 'M', esi: 3, complaint: 'Diabetic: glucose 28.4 mmol/L', wait: '25m', vitals: { bp: '140/88', hr: 92, spo2: 97, rr: 17, temp: 37.0 }, bay: 'Bay 6',     assigned: 'Dr. Kim'        },
  { id: 'T-006', name: 'Elena Popescu',        age: 39, gender: 'F', esi: 3, complaint: 'Laceration: deep wound R hand', wait: '31m', vitals: { bp: '118/74', hr: 82, spo2: 99, rr: 14, temp: 36.8 }, bay: 'Suture Rm',  assigned: 'Nurse Al Amri'  },
  { id: 'T-007', name: 'James Obi',            age: 22, gender: 'M', esi: 4, complaint: 'Ankle sprain',                 wait: '55m', vitals: { bp: '120/76', hr: 72, spo2: 99, rr: 14, temp: 36.7 }, bay: 'Waiting',   assigned: 'Pending'        },
  { id: 'T-008', name: 'Nadia Rahman',         age: 30, gender: 'F', esi: 4, complaint: 'UTI symptoms',                 wait: '1h 2m',vitals:{ bp: '116/72', hr: 76, spo2: 99, rr: 13, temp: 37.5 }, bay: 'Waiting',   assigned: 'Pending'        },
  { id: 'T-009', name: 'Carlos Mendez',        age: 18, gender: 'M', esi: 5, complaint: 'Minor skin rash',              wait: '1h 28m',vitals:{ bp: '118/70', hr: 68, spo2: 100,rr: 13, temp: 36.5 }, bay: 'Waiting',   assigned: 'Pending'        },
]

const ED_STATS = [
  { label: 'Patients in ED', value: 47, color: '#0ea5e9' },
  { label: 'ESI Level 1',    value: 2,  color: '#ef4444' },
  { label: 'ESI Level 2',    value: 5,  color: '#f97316' },
  { label: 'ESI Level 3',    value: 12, color: '#f59e0b' },
  { label: 'Avg Wait Time',  value: '28m',color:'#8b5cf6' },
  { label: 'Beds Available', value: 6,  color: '#10b981' },
]

function VitalChip({ label, value, unit, danger }) {
  return (
    <div className="vital-chip" style={danger ? { borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)' } : {}}>
      <div className="vital-value text-sm" style={{ color: danger ? '#f87171' : '#38bdf8' }}>{value}</div>
      <div className="vital-label">{label}</div>
      {unit && <div className="vital-unit">{unit}</div>}
    </div>
  )
}

function EsiBadge({ level }) {
  const cfg = ESI_LEVELS[level]
  return (
    <div className={`badge ${cfg.bg} font-700 text-xs`}>
      ESI-{level} · {cfg.label}
    </div>
  )
}

export default function EmergencyScreen() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = TRIAGE_QUEUE
    .filter(p => filter === 'all' || String(p.esi) === filter)
    .filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    )

  const selectedPt = TRIAGE_QUEUE.find(p => p.id === selected)

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={15} style={{ color: '#f87171' }} />
            </div>
            Emergency Department
          </h1>
          <p className="page-subtitle">Triage Queue · ESI Classification · Real-time Status</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={Plus} variant="danger">Register Patient</Button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-6 gap-3 flex-shrink-0">
        {ED_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="glass-card p-3 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="text-2xl font-800" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] mt-1 font-500 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ESI Legend */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        <span className="text-xs font-600 mr-1" style={{ color: 'var(--text-muted)' }}>ESI Filter:</span>
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilter('all')}
        >All</button>
        {[1,2,3,4,5].map(lvl => (
          <button
            key={lvl}
            className={`btn btn-sm ${filter === String(lvl) ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(String(lvl))}
          >
            <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ background: ESI_LEVELS[lvl].color }} />
            ESI-{lvl}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-9" placeholder="Search patient name or triage ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Triage Queue */}
        <GlassCard className="flex-1" padding={false}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(56,189,248,0.08)' }}>
            <h2 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>
              Triage Queue ({filtered.length} patients)
            </h2>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            {filtered.map((pt, i) => {
              const isSelected = selected === pt.id
              const esiCfg = ESI_LEVELS[pt.esi]
              return (
                <motion.div
                  key={pt.id}
                  className="p-4 border-b cursor-pointer transition-all"
                  style={{
                    borderColor: 'rgba(56,189,248,0.04)',
                    background: isSelected ? 'rgba(14,165,233,0.07)' : 'transparent',
                    borderLeft: isSelected ? `3px solid ${esiCfg.color}` : '3px solid transparent',
                  }}
                  onClick={() => setSelected(isSelected ? null : pt.id)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(56,189,248,0.03)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-start gap-3">
                    {/* ESI indicator */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-900 text-sm flex-shrink-0"
                      style={{
                        background: `${esiCfg.color}20`,
                        border: `2px solid ${esiCfg.color}`,
                        color: esiCfg.color,
                        boxShadow: pt.esi <= 2 ? `0 0 12px ${esiCfg.color}40` : 'none',
                      }}
                    >
                      {pt.esi}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{pt.name}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pt.age}y {pt.gender}</span>
                        <span className="text-[10px] font-600" style={{ color: 'var(--text-muted)' }}>{pt.id}</span>
                      </div>
                      <p className="text-xs truncate mb-1" style={{ color: 'var(--text-secondary)' }}>{pt.complaint}</p>
                      <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><Clock size={9} />{pt.wait}</span>
                        <span>Bay: {pt.bay}</span>
                        <span>{pt.assigned}</span>
                      </div>
                    </div>

                    {/* Vital quick view */}
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={`font-600 ${pt.vitals.spo2 < 92 ? 'text-red-400' : 'text-slate-400'}`}>
                        SpO₂ {pt.vitals.spo2}%
                      </span>
                      <span className={`font-600 ${pt.vitals.hr > 110 ? 'text-red-400' : 'text-slate-400'}`}>
                        HR {pt.vitals.hr}
                      </span>
                    </div>

                    <ChevronRight
                      size={13}
                      style={{
                        color: 'var(--text-muted)',
                        transform: isSelected ? 'rotate(90deg)' : 'rotate(0)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </div>

                  {/* Expanded vitals */}
                  {isSelected && (
                    <motion.div
                      className="mt-3 pt-3 border-t"
                      style={{ borderColor: 'rgba(56,189,248,0.08)' }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div className="flex gap-2 flex-wrap mb-3">
                        <VitalChip label="BP"   value={pt.vitals.bp} unit="mmHg" danger={parseInt(pt.vitals.bp) > 160} />
                        <VitalChip label="HR"   value={pt.vitals.hr} unit="bpm"  danger={pt.vitals.hr > 110 || pt.vitals.hr < 50} />
                        <VitalChip label="SpO₂" value={`${pt.vitals.spo2}%`} danger={pt.vitals.spo2 < 92} />
                        <VitalChip label="RR"   value={pt.vitals.rr} unit="/min" danger={pt.vitals.rr > 22} />
                        <VitalChip label="Temp" value={`${pt.vitals.temp}°C`} danger={pt.vitals.temp > 38.5} />
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-primary btn-sm">Assign Doctor</button>
                        <button className="btn btn-ghost btn-sm">Order Labs</button>
                        <button className="btn btn-ghost btn-sm">Admit to Ward</button>
                        <button className="btn btn-ghost btn-sm">Print Triage</button>
                        {pt.esi <= 2 && (
                          <button className="btn btn-danger btn-sm">
                            <Activity size={12} /> Activate Code
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </GlassCard>

        {/* Right panel: Bay Status */}
        <div className="w-64 flex flex-col gap-4">
          <GlassCard>
            <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Treatment Bays</h3>
            <div className="space-y-2">
              {[
                { name: 'Trauma Bay 1', status: 'occupied', patient: 'ESI-1 Active',   color: '#ef4444' },
                { name: 'Trauma Bay 2', status: 'available',patient: 'Available',       color: '#10b981' },
                { name: 'Bay 2',        status: 'occupied', patient: 'ESI-2 Pt. Active',color: '#f97316' },
                { name: 'Bay 3',        status: 'occupied', patient: 'ESI-2 Pt. Active',color: '#f97316' },
                { name: 'Bay 4',        status: 'cleaning', patient: 'Cleaning',         color: '#8b5cf6' },
                { name: 'Bay 5',        status: 'occupied', patient: 'ESI-3 Pt. Active',color: '#f59e0b' },
                { name: 'Bay 6',        status: 'occupied', patient: 'ESI-3 Pt. Active',color: '#f59e0b' },
                { name: 'Suture Room',  status: 'occupied', patient: 'Procedure',        color: '#0ea5e9' },
                { name: 'Obs Bay 1',    status: 'available',patient: 'Available',        color: '#10b981' },
                { name: 'Obs Bay 2',    status: 'available',patient: 'Available',        color: '#10b981' },
              ].map(bay => (
                <div
                  key={bay.name}
                  className="flex items-center gap-2.5 p-2 rounded-lg"
                  style={{ background: 'rgba(10,22,48,0.4)', border: `1px solid ${bay.color}20` }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: bay.color, boxShadow: `0 0 4px ${bay.color}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-600" style={{ color: 'var(--text-primary)' }}>{bay.name}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{bay.patient}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard variant="red">
            <h3 className="text-sm font-700 mb-3" style={{ color: '#f87171' }}>Active Codes</h3>
            <div
              className="p-2.5 rounded-lg text-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <div className="text-xs font-700 text-red-400">CODE BLUE</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Trauma Bay 1 · 14:32</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Team assembled</div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
