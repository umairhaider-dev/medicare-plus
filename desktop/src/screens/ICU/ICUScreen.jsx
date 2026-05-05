import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Wind, Thermometer, Heart, Droplets, BedDouble, Plus, RefreshCw } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const ICU_BEDS = [
  {
    id: 'ICU-1', patient: 'Mohammed Al Hassan', age: 62, mrn: 'MR-1001',
    dx: 'STEMI post-PCI', adm: '2026-04-30', ventilated: true, isolation: false,
    vitals: { bp: '108/68', map: 81, hr: 88, spo2: 97, rr: 14, temp: 37.2, cvp: 10 },
    status: 'stable', nurse: 'RN Al Amri', doctor: 'Dr. Al Rashidi',
    alerts: ['Troponin trending down — good sign'],
    trend: Array.from({length:12},(_,i)=>({ t:i, spo2: 95+Math.round(Math.random()*4), hr: 85+Math.round(Math.random()*10) })),
  },
  {
    id: 'ICU-2', patient: 'Sarah Johnson', age: 34, mrn: 'MR-1002',
    dx: 'Status Asthmaticus', adm: '2026-05-01', ventilated: true, isolation: false,
    vitals: { bp: '130/84', map: 99, hr: 102, spo2: 92, rr: 22, temp: 38.1, cvp: 8 },
    status: 'critical', nurse: 'RN Hamdan', doctor: 'Dr. Hassan',
    alerts: ['SpO₂ 92% — below threshold', 'PEEP increased to 10'],
    trend: Array.from({length:12},(_,i)=>({ t:i, spo2: 88+Math.round(Math.random()*6), hr: 98+Math.round(Math.random()*12) })),
  },
  {
    id: 'ICU-3', patient: 'Ahmed Khalil', age: 45, mrn: 'MR-1003',
    dx: 'Hypertensive Crisis + Encephalopathy', adm: '2026-05-02', ventilated: false, isolation: false,
    vitals: { bp: '160/96', map: 117, hr: 94, spo2: 96, rr: 18, temp: 37.8, cvp: 12 },
    status: 'critical', nurse: 'RN Chen', doctor: 'Dr. Chandra',
    alerts: ['MAP 117 — hypertensive urgency', 'Nicardipine drip in progress'],
    trend: Array.from({length:12},(_,i)=>({ t:i, spo2: 94+Math.round(Math.random()*4), hr: 90+Math.round(Math.random()*8) })),
  },
  {
    id: 'ICU-4', patient: 'Elena Petrova', age: 58, mrn: 'MR-1004',
    dx: 'Septic Shock (E.coli bacteremia)', adm: '2026-04-28', ventilated: true, isolation: true,
    vitals: { bp: '88/54', map: 65, hr: 118, spo2: 94, rr: 26, temp: 39.4, cvp: 6 },
    status: 'critical', nurse: 'RN Rashid', doctor: 'Dr. Kim',
    alerts: ['MAP borderline 65', 'Norepinephrine 0.25 mcg/kg/min', 'Temp 39.4 — antipyretics given'],
    trend: Array.from({length:12},(_,i)=>({ t:i, spo2: 90+Math.round(Math.random()*6), hr: 112+Math.round(Math.random()*14) })),
  },
  {
    id: 'ICU-5', patient: 'James Obi', age: 28, mrn: 'MR-1005',
    dx: 'Traumatic Brain Injury (GCS 9)', adm: '2026-05-03', ventilated: true, isolation: false,
    vitals: { bp: '142/88', map: 106, hr: 76, spo2: 98, rr: 14, temp: 37.0, cvp: 9 },
    status: 'stable', nurse: 'RN Al Amri', doctor: 'Dr. Al Zaabi',
    alerts: ['ICP within acceptable range', 'Head CT scheduled 16:00'],
    trend: Array.from({length:12},(_,i)=>({ t:i, spo2: 96+Math.round(Math.random()*3), hr: 73+Math.round(Math.random()*7) })),
  },
  {
    id: 'ICU-6', patient: 'Fatima Al Marri', age: 71, mrn: 'MR-1006',
    dx: 'ARDS — COVID-19 complications', adm: '2026-04-25', ventilated: true, isolation: true,
    vitals: { bp: '118/72', map: 87, hr: 86, spo2: 91, rr: 20, temp: 37.6, cvp: 11 },
    status: 'critical', nurse: 'RN Hamdan', doctor: 'Dr. Hassan',
    alerts: ['SpO₂ 91% on FiO₂ 70%', 'Prone positioning q6h'],
    trend: Array.from({length:12},(_,i)=>({ t:i, spo2: 88+Math.round(Math.random()*5), hr: 83+Math.round(Math.random()*8) })),
  },
  { id: 'ICU-7',  patient: null, status: 'available' },
  { id: 'ICU-8',  patient: null, status: 'available' },
  { id: 'ICU-9',  patient: null, status: 'cleaning'  },
  { id: 'ICU-10', patient: null, status: 'reserved'  },
  { id: 'ICU-11', patient: null, status: 'available' },
  { id: 'ICU-12', patient: null, status: 'available' },
]

const STATUS_CONFIG = {
  critical:  { label: 'Critical',  badge: 'red',   glow: 'rgba(239,68,68,0.3)' },
  stable:    { label: 'Stable',    badge: 'green',  glow: 'rgba(16,185,129,0.2)' },
  improving: { label: 'Improving', badge: 'blue',   glow: 'rgba(14,165,233,0.2)' },
  available: { label: 'Available', badge: 'teal',   glow: 'none' },
  cleaning:  { label: 'Cleaning',  badge: 'purple', glow: 'none' },
  reserved:  { label: 'Reserved',  badge: 'gold',   glow: 'none' },
}

function SparkLine({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="spo2" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function BedCard({ bed, onClick }) {
  const cfg = STATUS_CONFIG[bed.status]
  const isCritical = bed.status === 'critical'

  if (!bed.patient) {
    return (
      <motion.div
        className="glass-card p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
        style={{ minHeight: 160, borderStyle: bed.status === 'reserved' ? 'dashed' : 'solid' }}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
      >
        <BedDouble size={20} style={{ color: 'var(--text-muted)' }} />
        <div className="text-sm font-700" style={{ color: 'var(--text-muted)' }}>{bed.id}</div>
        <Badge variant={cfg.badge} size="xs">{cfg.label}</Badge>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="glass-card p-4 cursor-pointer"
      style={{
        borderColor: isCritical ? 'rgba(239,68,68,0.35)' : 'rgba(56,189,248,0.12)',
        boxShadow: isCritical ? `0 0 20px ${cfg.glow}` : undefined,
        animation: isCritical ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
      }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-700 text-sky-400">{bed.id}</span>
        <div className="flex items-center gap-1.5">
          {bed.ventilated && (
            <span className="badge badge-purple text-[9px] px-1.5 py-0">Vent</span>
          )}
          {bed.isolation && (
            <span className="badge badge-orange text-[9px] px-1.5 py-0">ISO</span>
          )}
          <Badge variant={cfg.badge} size="xs">{cfg.label}</Badge>
        </div>
      </div>

      {/* Patient */}
      <div className="mb-2">
        <p className="text-sm font-700 truncate" style={{ color: 'var(--text-primary)' }}>{bed.patient}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{bed.age}y · {bed.mrn}</p>
        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{bed.dx}</p>
      </div>

      {/* Vitals grid */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        {[
          { l: 'SpO₂', v: `${bed.vitals.spo2}%`, danger: bed.vitals.spo2 < 93 },
          { l: 'HR',   v: `${bed.vitals.hr}`,    danger: bed.vitals.hr > 110   },
          { l: 'MAP',  v: `${bed.vitals.map}`,   danger: bed.vitals.map < 65   },
          { l: 'Temp', v: `${bed.vitals.temp}°`, danger: bed.vitals.temp > 38.5},
          { l: 'RR',   v: `${bed.vitals.rr}`,   danger: bed.vitals.rr > 22    },
          { l: 'CVP',  v: `${bed.vitals.cvp}`,  danger: false                  },
        ].map(v => (
          <div
            key={v.l}
            className="text-center py-1 rounded-lg"
            style={{
              background: v.danger ? 'rgba(239,68,68,0.1)' : 'rgba(10,22,48,0.5)',
              border: v.danger ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(56,189,248,0.06)',
            }}
          >
            <div className="text-[11px] font-700" style={{ color: v.danger ? '#f87171' : '#38bdf8' }}>{v.v}</div>
            <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{v.l}</div>
          </div>
        ))}
      </div>

      {/* SparkLine */}
      <SparkLine data={bed.trend} color={isCritical ? '#ef4444' : '#0ea5e9'} />

      {/* Alerts */}
      {bed.alerts?.length > 0 && (
        <div
          className="mt-2 p-1.5 rounded text-[9px] truncate"
          style={{
            background: isCritical ? 'rgba(239,68,68,0.08)' : 'rgba(14,165,233,0.06)',
            color: isCritical ? '#f87171' : 'var(--text-muted)',
          }}
        >
          ⚠ {bed.alerts[0]}
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 flex justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
        <span>{bed.nurse}</span>
        <span>{bed.doctor}</span>
      </div>
    </motion.div>
  )
}

export default function ICUScreen() {
  const occupied = ICU_BEDS.filter(b => b.patient).length
  const critical = ICU_BEDS.filter(b => b.status === 'critical').length
  const ventilated = ICU_BEDS.filter(b => b.ventilated).length

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)' }}>
              <Activity size={15} style={{ color: '#38bdf8' }} />
            </div>
            Intensive Care Unit
          </h1>
          <p className="page-subtitle">Real-time Patient Monitoring · Ventilator Status · Critical Alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={RefreshCw} variant="ghost" size="sm">Sync Monitors</Button>
          <Button icon={Plus} variant="primary">Admit to ICU</Button>
        </div>
      </div>

      {/* ICU Stats */}
      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        {[
          { label: 'Total Beds',      value: ICU_BEDS.length, color: '#0ea5e9' },
          { label: 'Occupied',        value: occupied,         color: '#f59e0b' },
          { label: 'Critical Status', value: critical,         color: '#ef4444' },
          { label: 'Ventilated',      value: ventilated,       color: '#8b5cf6' },
          { label: 'Available',       value: ICU_BEDS.length - occupied, color: '#10b981' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="glass-card p-3 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="text-2xl font-800" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] mt-1 font-500 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Bed Grid */}
      <div className="grid gap-4 flex-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {ICU_BEDS.map((bed, i) => (
          <motion.div
            key={bed.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <BedCard bed={bed} onClick={() => {}} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
