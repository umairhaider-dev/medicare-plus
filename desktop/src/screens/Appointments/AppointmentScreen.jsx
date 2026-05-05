import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Plus, Search, Clock, User, Stethoscope, CheckCircle, XCircle } from 'lucide-react'
import { format, addDays, startOfWeek } from 'date-fns'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

const DOCTORS = [
  { id: 1, name: 'Dr. Ahmed Al Rashidi',  dept: 'Cardiology',    slots: 12, booked: 10, color: '#0ea5e9' },
  { id: 2, name: 'Dr. Priya Chandra',     dept: 'Neurology',     slots: 10, booked: 8,  color: '#8b5cf6' },
  { id: 3, name: 'Dr. James Hassan',      dept: 'General Surgery',slots:14,  booked: 11, color: '#10b981' },
  { id: 4, name: 'Dr. Fatima Al Zaabi',   dept: 'Pediatrics',    slots: 16, booked: 9,  color: '#ec4899' },
  { id: 5, name: 'Dr. Kim Jae-Won',       dept: 'Internal Med.',  slots: 12, booked: 12, color: '#f59e0b' },
  { id: 6, name: 'Dr. Li Wei',            dept: 'Oncology',      slots: 8,  booked: 6,  color: '#f97316' },
]

const TODAY_APTS = [
  { id: 1, time: '08:00', patient: 'Mohammed Al Hassan',  type: 'Follow-up',  doctor: 'Dr. Al Rashidi',  status: 'COMPLETED', dept: 'Cardiology'     },
  { id: 2, time: '08:30', patient: 'Sarah Johnson',       type: 'Consultation',doctor:'Dr. Chandra',     status: 'COMPLETED', dept: 'Neurology'       },
  { id: 3, time: '09:00', patient: 'Ahmed Khalil',        type: 'OPD',        doctor: 'Dr. Hassan',      status: 'IN_PROGRESS',dept: 'General Surgery' },
  { id: 4, time: '09:30', patient: 'Fatima Al Zaabi',    type: 'Follow-up',   doctor: 'Dr. Kim',         status: 'WAITING',   dept: 'Internal Med.'   },
  { id: 5, time: '10:00', patient: 'Ravi Patel',          type: 'Procedure',  doctor: 'Dr. Al Rashidi',  status: 'WAITING',   dept: 'Cardiology'      },
  { id: 6, time: '10:30', patient: 'Elena Popescu',       type: 'Consultation',doctor:'Dr. Al Zaabi',    status: 'SCHEDULED', dept: 'Pediatrics'      },
  { id: 7, time: '11:00', patient: 'James Obi',           type: 'Follow-up',  doctor: 'Dr. Li Wei',      status: 'SCHEDULED', dept: 'Oncology'        },
  { id: 8, time: '11:30', patient: 'Nadia Rahman',        type: 'OPD',        doctor: 'Dr. Hassan',      status: 'SCHEDULED', dept: 'General Surgery' },
  { id: 9, time: '14:00', patient: 'Carlos Mendez',       type: 'Lab Results',doctor: 'Dr. Chandra',     status: 'SCHEDULED', dept: 'Neurology'       },
  { id:10, time: '14:30', patient: 'Aisha Abdullah',      type: 'Follow-up',  doctor: 'Dr. Kim',         status: 'SCHEDULED', dept: 'Internal Med.'   },
  { id:11, time: '15:00', patient: 'Omar Siddiqui',       type: 'Consultation',doctor:'Dr. Al Rashidi',  status: 'SCHEDULED', dept: 'Cardiology'      },
  { id:12, time: '15:30', patient: 'Priya Sharma',        type: 'OPD',        doctor: 'Dr. Al Zaabi',    status: 'NO_SHOW',   dept: 'Pediatrics'      },
]

const STATUS_CFG = {
  COMPLETED:   { badge: 'green',  label: 'Completed'    },
  IN_PROGRESS: { badge: 'purple', label: 'In Progress'  },
  WAITING:     { badge: 'gold',   label: 'Waiting'      },
  SCHEDULED:   { badge: 'blue',   label: 'Scheduled'    },
  CANCELLED:   { badge: 'gray',   label: 'Cancelled'    },
  NO_SHOW:     { badge: 'red',    label: 'No Show'      },
}

export default function AppointmentScreen() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = TODAY_APTS.filter(a =>
    (statusFilter === 'ALL' || a.status === statusFilter) &&
    (!search || a.patient.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase()))
  )

  const counts = {
    total: TODAY_APTS.length,
    completed: TODAY_APTS.filter(a=>a.status==='COMPLETED').length,
    waiting: TODAY_APTS.filter(a=>a.status==='WAITING').length,
    inProgress: TODAY_APTS.filter(a=>a.status==='IN_PROGRESS').length,
  }

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <CalendarDays size={15} style={{ color: '#a78bfa' }} />
            </div>
            Appointments
          </h1>
          <p className="page-subtitle">Today · {format(new Date(),'EEEE, dd MMMM yyyy')}</p>
        </div>
        <Button icon={Plus} variant="primary" onClick={() => setAddOpen(true)}>New Appointment</Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {[
          { label: 'Total Today',  value: counts.total,      color: '#0ea5e9' },
          { label: 'Completed',    value: counts.completed,  color: '#10b981' },
          { label: 'In Progress',  value: counts.inProgress, color: '#8b5cf6' },
          { label: 'Waiting',      value: counts.waiting,    color: '#f59e0b' },
        ].map((s, i) => (
          <motion.div key={s.label} className="glass-card p-4 text-center" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}>
            <div className="text-2xl font-800" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] mt-1 font-500" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Appointment List */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input pl-9" placeholder="Search patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {['ALL','WAITING','IN_PROGRESS','SCHEDULED','COMPLETED'].map(s => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'IN_PROGRESS' ? 'Active' : s.charAt(0)+s.slice(1).toLowerCase().replace('_',' ')}
              </button>
            ))}
          </div>

          <GlassCard className="flex-1 min-h-0 overflow-y-auto" padding={false}>
            <div className="divide-y" style={{ divideColor: 'rgba(56,189,248,0.04)' }}>
              {filtered.map((apt, i) => {
                const cfg = STATUS_CFG[apt.status]
                return (
                  <motion.div
                    key={apt.id}
                    className="p-4 flex items-center gap-4 cursor-pointer transition-colors"
                    initial={{ opacity:0, x:-8 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.04 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="w-14 text-center flex-shrink-0">
                      <div className="text-sm font-700 text-sky-400">{apt.time}</div>
                    </div>
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ background: apt.status === 'COMPLETED' ? '#10b981' : apt.status === 'IN_PROGRESS' ? '#8b5cf6' : apt.status === 'WAITING' ? '#f59e0b' : 'rgba(56,189,248,0.2)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{apt.patient}</span>
                        <Badge variant={cfg.badge} size="xs">{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><Stethoscope size={10} />{apt.doctor}</span>
                        <span>{apt.dept}</span>
                        <span className="badge badge-gray text-[9px] px-1.5 py-0">{apt.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {apt.status === 'WAITING' && (
                        <button className="btn btn-primary btn-sm">Start Visit</button>
                      )}
                      {apt.status === 'IN_PROGRESS' && (
                        <button className="btn btn-ghost btn-sm" style={{ color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}>
                          <CheckCircle size={12} /> Complete
                        </button>
                      )}
                      {apt.status === 'SCHEDULED' && (
                        <button className="btn btn-ghost btn-sm">Check In</button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>
        </div>

        {/* Doctor Availability */}
        <GlassCard className="w-72 flex-shrink-0">
          <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Doctor Availability</h3>
          <div className="space-y-3">
            {DOCTORS.map(doc => (
              <div key={doc.id} className="p-3 rounded-xl" style={{ background: 'rgba(10,22,48,0.4)', border: '1px solid rgba(56,189,248,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{doc.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{doc.dept}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-700" style={{ color: doc.booked >= doc.slots ? '#ef4444' : doc.color }}>{doc.booked}/{doc.slots}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>booked</div>
                  </div>
                </div>
                <div className="severity-bar">
                  <motion.div
                    className="severity-fill"
                    style={{ background: doc.color, width: `${(doc.booked/doc.slots)*100}%`, opacity: 0.7 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(doc.booked/doc.slots)*100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Add Appointment Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Schedule Appointment" width={560}
        footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button><Button variant="primary">Schedule</Button></>}
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Patient (MR or Name)', key: 'patient', col: 2 },
            { label: 'Doctor', key: 'doctor', type: 'select', opts: DOCTORS.map(d=>d.name) },
            { label: 'Department', key: 'dept' },
            { label: 'Date', key: 'date', type: 'date' },
            { label: 'Time', key: 'time', type: 'time' },
            { label: 'Visit Type', key: 'type', type: 'select', opts: ['OPD','Follow-up','Consultation','Procedure','Lab Results','Emergency'] },
            { label: 'Notes', key: 'notes', col: 2 },
          ].map(f => (
            <div key={f.key} style={{ gridColumn: f.col === 2 ? 'span 2' : 'span 1' }}>
              <label className="block text-xs font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
              {f.type === 'select' ? (
                <select className="input">{f.opts?.map(o=><option key={o}>{o}</option>)}</select>
              ) : (
                <input type={f.type || 'text'} className="input" />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
