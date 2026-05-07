import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Scan, Search, Clock, CheckCircle, AlertTriangle, Plus,
  Monitor, Layers, Activity, Filter, Download, Eye,
  ChevronRight, ZoomIn, RotateCcw, Maximize2, FileText,
} from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'

const MODALITIES = [
  { id: 'CT',  label: 'CT Scanner',    total: 12, pending: 4, active: 2, icon: '🔬', color: '#0ea5e9' },
  { id: 'MRI', label: 'MRI Scanner',   total: 8,  pending: 3, active: 1, icon: '🧲', color: '#8b5cf6' },
  { id: 'XR',  label: 'X-Ray',         total: 24, pending: 2, active: 6, icon: '📡', color: '#10b981' },
  { id: 'US',  label: 'Ultrasound',    total: 15, pending: 1, active: 3, icon: '🔊', color: '#f59e0b' },
  { id: 'NM',  label: 'Nuclear Med.',  total: 3,  pending: 2, active: 0, icon: '⚛️', color: '#ec4899' },
  { id: 'FL',  label: 'Fluoroscopy',   total: 2,  pending: 1, active: 0, icon: '✨', color: '#14b8a6' },
]

const WORKLIST = [
  { id: 'RAD-2401', pt: 'Mohammed Al Hassan', mrn: 'MR-1001', study: 'CT Chest with Contrast', modality: 'CT',  dr: 'Dr. Al Rashidi', ordered: '09:15', priority: 'urgent',  status: 'in_progress', tech: 'T. Ibrahim'  },
  { id: 'RAD-2402', pt: 'Sarah Johnson',       mrn: 'MR-1007', study: 'MRI Brain w/wo Contrast', modality: 'MRI', dr: 'Dr. Al Zaabi',  ordered: '08:30', priority: 'stat',    status: 'in_progress', tech: 'F. Al Mansoori' },
  { id: 'RAD-2403', pt: 'Ahmed Khalil',         mrn: 'MR-1013', study: 'X-Ray Chest PA/Lat',     modality: 'XR',  dr: 'Dr. Hassan',    ordered: '10:00', priority: 'routine', status: 'scheduled',   tech: 'S. Patel'    },
  { id: 'RAD-2404', pt: 'Fatima Al Zaabi',      mrn: 'MR-1022', study: 'Pelvic Ultrasound',       modality: 'US',  dr: 'Dr. Chandra',   ordered: '09:45', priority: 'routine', status: 'completed',   tech: 'M. Rahman'   },
  { id: 'RAD-2405', pt: 'Ravi Patel',           mrn: 'MR-1034', study: 'CT Knee without Contrast', modality: 'CT', dr: 'Dr. Fernandez', ordered: '11:00', priority: 'urgent',  status: 'scheduled',   tech: 'T. Ibrahim'  },
  { id: 'RAD-2406', pt: 'Elena Popescu',        mrn: 'MR-1041', study: 'MRI Lumbar Spine',        modality: 'MRI', dr: 'Dr. Patel',    ordered: '11:30', priority: 'routine', status: 'scheduled',   tech: 'F. Al Mansoori' },
  { id: 'RAD-2407', pt: 'Carlos Mendez',        mrn: 'MR-1056', study: 'CT Abdomen Pelvis',       modality: 'CT',  dr: 'Dr. Al Rashidi',ordered: '12:00', priority: 'stat',   status: 'scheduled',   tech: 'T. Ibrahim'  },
  { id: 'RAD-2408', pt: 'Aisha Abdullah',       mrn: 'MR-1062', study: 'Chest X-Ray Portable',   modality: 'XR',  dr: 'Dr. Hassan',   ordered: '12:15', priority: 'routine', status: 'completed',   tech: 'S. Patel'    },
]

const REPORTS = [
  { id: 'RAD-2398', pt: 'Li Wei',         study: 'CT Head without Contrast',   finding: 'No acute intracranial pathology. Small chronic white matter changes bilaterally consistent with age.', impression: 'Unremarkable CT head.', status: 'verified', radiologist: 'Dr. Al Mansouri', time: '08:10' },
  { id: 'RAD-2399', pt: 'Hassan Al Farsi', study: 'CT Pulmonary Angiography',  finding: 'Filling defect in the right pulmonary artery extending into segmental branches. Findings consistent with acute pulmonary embolism.', impression: 'Acute pulmonary embolism, right lung.', status: 'critical', radiologist: 'Dr. Al Mansouri', time: '07:45' },
  { id: 'RAD-2400', pt: 'Priya Sharma',   study: 'MRI Right Knee',             finding: 'Complete tear of the anterior cruciate ligament. Medial meniscus posterior horn tear. No bone marrow oedema.', impression: 'ACL tear with medial meniscus injury.', status: 'verified', radiologist: 'Dr. Jaber', time: '07:30' },
]

const priorityColor = { stat: '#ef4444', urgent: '#f97316', routine: '#10b981' }
const priorityBg    = { stat: 'rgba(239,68,68,0.12)', urgent: 'rgba(249,115,22,0.12)', routine: 'rgba(16,185,129,0.12)' }
const statusBadge   = { in_progress: 'badge-blue', scheduled: 'badge-gold', completed: 'badge-green' }

export default function RadiologyScreen() {
  const [search, setSearch] = useState('')
  const [modalFilter, setModalFilter] = useState('All')
  const [selectedStudy, setSelectedStudy] = useState(null)

  const filtered = WORKLIST.filter(w => {
    const matchSearch = !search || w.pt.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search) || w.mrn.includes(search)
    const matchModal  = modalFilter === 'All' || w.modality === modalFilter
    return matchSearch && matchModal
  })

  const stats = [
    { label: 'Studies Today',    value: 62,  sub: '+8 vs yesterday', color: '#0ea5e9' },
    { label: 'Pending Read',     value: 14,  sub: '3 critical',      color: '#f97316' },
    { label: 'In Progress',      value: 8,   sub: '4 machines busy', color: '#8b5cf6' },
    { label: 'Avg Report Time',  value: '42m', sub: 'Target: 60min', color: '#10b981' },
  ]

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Scan size={22} style={{ color: '#8b5cf6' }} />
            Radiology & Imaging
          </h1>
          <p className="page-subtitle">DICOM Worklist · Modality Management · Reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm gap-1.5 text-xs"><Download size={13} />Export</button>
          <button className="btn btn-primary btn-sm gap-1.5 text-xs"><Plus size={13} />New Order</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard className="p-4">
              <div className="text-xs font-600 mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              <div className="text-2xl font-800 mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Modalities */}
      <div className="grid grid-cols-6 gap-3 flex-shrink-0">
        {MODALITIES.map((m, i) => (
          <motion.button
            key={m.id}
            onClick={() => setModalFilter(modalFilter === m.id ? 'All' : m.id)}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl p-3 text-left transition-all"
            style={{
              background: modalFilter === m.id ? `${m.color}18` : 'rgba(10,22,48,0.6)',
              border: `1px solid ${modalFilter === m.id ? m.color + '40' : 'rgba(56,189,248,0.08)'}`,
            }}
          >
            <div className="text-xl mb-1">{m.icon}</div>
            <div className="text-xs font-700" style={{ color: modalFilter === m.id ? m.color : 'var(--text-primary)' }}>{m.id}</div>
            <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
            <div className="flex justify-between text-[10px]">
              <span style={{ color: m.color }}>{m.active} active</span>
              <span style={{ color: '#fbbf24' }}>{m.pending} pending</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-5 min-h-0" style={{ flex: 1 }}>
        {/* Worklist */}
        <div className="flex flex-col gap-3" style={{ flex: 3 }}>
          <GlassCard className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Today's Worklist</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input className="input pl-7 text-xs py-1.5" style={{ width: 200 }} placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    {['Order ID', 'Patient', 'Study', 'Mod', 'Priority', 'Ordered', 'Technician', 'Status'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(w => (
                    <tr key={w.id} className="cursor-pointer" onClick={() => setSelectedStudy(w)}>
                      <td className="font-700 text-xs" style={{ color: '#38bdf8' }}>{w.id}</td>
                      <td>
                        <div className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{w.pt}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{w.mrn}</div>
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-secondary)', maxWidth: 180 }}>{w.study}</td>
                      <td>
                        <span className="badge text-[10px]" style={{
                          background: `${MODALITIES.find(m=>m.id===w.modality)?.color}18`,
                          color: MODALITIES.find(m=>m.id===w.modality)?.color,
                          border: `1px solid ${MODALITIES.find(m=>m.id===w.modality)?.color}40`,
                        }}>{w.modality}</span>
                      </td>
                      <td>
                        <span className="badge text-[10px]" style={{ background: priorityBg[w.priority], color: priorityColor[w.priority], border: `1px solid ${priorityColor[w.priority]}40` }}>
                          {w.priority}
                        </span>
                      </td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{w.ordered}</td>
                      <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{w.tech}</td>
                      <td><span className={`badge text-[10px] ${statusBadge[w.status]}`}>{w.status.replace('_',' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Reports / Detail */}
        <div className="flex flex-col gap-3" style={{ flex: 2 }}>
          {selectedStudy ? (
            <GlassCard className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Study Detail</h3>
                <button onClick={() => setSelectedStudy(null)} className="btn btn-ghost btn-sm text-xs">✕ Close</button>
              </div>
              <div className="rounded-xl flex items-center justify-center" style={{ height: 200, background: 'rgba(4,8,20,0.8)', border: '1px solid rgba(56,189,248,0.1)' }}>
                <div className="text-center">
                  <Monitor size={40} className="mx-auto mb-2" style={{ color: 'rgba(56,189,248,0.3)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>DICOM Viewer</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedStudy.study}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[{ icon: ZoomIn, label: 'Zoom' }, { icon: RotateCcw, label: 'Rotate' }, { icon: Maximize2, label: 'Full' }, { icon: Download, label: 'Export' }].map(a => (
                  <button key={a.label} className="btn btn-ghost btn-sm flex-1 text-xs gap-1">
                    <a.icon size={11} />{a.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  ['Patient', selectedStudy.pt],
                  ['MRN', selectedStudy.mrn],
                  ['Study', selectedStudy.study],
                  ['Ordered by', selectedStudy.dr],
                  ['Priority', selectedStudy.priority],
                  ['Status', selectedStudy.status],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid rgba(56,189,248,0.06)' }}>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-sm gap-1.5 text-xs w-full"><FileText size={12} />Write Report</button>
            </GlassCard>
          ) : (
            <GlassCard className="p-4">
              <h3 className="text-sm font-700 mb-3" style={{ color: 'var(--text-primary)' }}>Recent Reports</h3>
              <div className="flex flex-col gap-3">
                {REPORTS.map(r => (
                  <div key={r.id} className="p-3 rounded-xl" style={{
                    background: r.status === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(10,22,48,0.5)',
                    border: `1px solid ${r.status === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(56,189,248,0.07)'}`,
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-700" style={{ color: 'var(--text-primary)' }}>{r.pt}</span>
                      <span className={`badge text-[9px] ${r.status === 'critical' ? 'badge-red' : 'badge-green'}`}>{r.status}</span>
                    </div>
                    <div className="text-[11px] mb-1.5" style={{ color: '#38bdf8' }}>{r.study}</div>
                    <div className="text-[10px] mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-muted)' }}>Impression: </strong>{r.impression}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.radiologist}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
