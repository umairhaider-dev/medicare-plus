import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Droplets, Plus, AlertTriangle, CheckCircle, Clock,
  Search, Filter, RefreshCw, TrendingDown, Activity,
  User, Heart, Shield, ArrowRight, Download, ChevronRight,
} from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'

const BLOOD_INVENTORY = [
  { type: 'A+',  units: 42, critical: 10, expiring: 3, status: 'adequate'  },
  { type: 'A-',  units: 8,  critical: 5,  expiring: 1, status: 'low'       },
  { type: 'B+',  units: 35, critical: 10, expiring: 2, status: 'adequate'  },
  { type: 'B-',  units: 4,  critical: 5,  expiring: 0, status: 'critical'  },
  { type: 'O+',  units: 68, critical: 15, expiring: 5, status: 'adequate'  },
  { type: 'O-',  units: 12, critical: 10, expiring: 2, status: 'adequate'  },
  { type: 'AB+', units: 18, critical: 8,  expiring: 1, status: 'adequate'  },
  { type: 'AB-', units: 3,  critical: 5,  expiring: 0, status: 'critical'  },
]

const COMPONENTS = [
  { name: 'Packed Red Blood Cells', units: 190, unit_type: 'Units' },
  { name: 'Fresh Frozen Plasma',    units: 84,  unit_type: 'Units' },
  { name: 'Platelet Concentrates',  units: 36,  unit_type: 'Units' },
  { name: 'Cryoprecipitate',        units: 22,  unit_type: 'Units' },
  { name: 'Whole Blood',            units: 8,   unit_type: 'Units' },
  { name: 'Albumin 5%',             units: 45,  unit_type: 'Bottles' },
]

const REQUESTS = [
  { id: 'BB-501', pt: 'Mohammed Al Hassan', mrn: 'MR-1001', blood: 'O+', comp: 'PRBC', units: 2, reason: 'Cardiac surgery',   status: 'crossmatch', dr: 'Dr. Al Rashidi', time: '09:20', urgent: true  },
  { id: 'BB-502', pt: 'Sarah Johnson',       mrn: 'MR-1007', blood: 'A+', comp: 'FFP',  units: 4, reason: 'Coagulopathy',     status: 'approved',   dr: 'Dr. Patel',    time: '09:45', urgent: false },
  { id: 'BB-503', pt: 'Ahmed Khalil',         mrn: 'MR-1013', blood: 'B+', comp: 'PLT',  units: 1, reason: 'Thrombocytopenia', status: 'pending',    dr: 'Dr. Hassan',   time: '10:00', urgent: false },
  { id: 'BB-504', pt: 'Fatima Al Zaabi',      mrn: 'MR-1022', blood: 'AB+',comp: 'PRBC', units: 3, reason: 'PPH',              status: 'transfusing',dr: 'Dr. Chandra',  time: '10:15', urgent: true  },
  { id: 'BB-505', pt: 'Ravi Patel',           mrn: 'MR-1034', blood: 'O-', comp: 'PRBC', units: 2, reason: 'Ortho surgery',    status: 'completed',  dr: 'Dr. Fernandez',time: '08:30', urgent: false },
]

const DONORS = [
  { id: 'DON-1201', name: 'Omar Abdullah',   blood: 'O+',  date: '2026-05-07', vol: 450, status: 'collected'  },
  { id: 'DON-1202', name: 'Maria Garcia',    blood: 'A-',  date: '2026-05-07', vol: 450, status: 'screening'  },
  { id: 'DON-1203', name: 'Khalid Al Mansi', blood: 'B+',  date: '2026-05-06', vol: 450, status: 'processed'  },
  { id: 'DON-1204', name: 'Emma Wilson',     blood: 'AB+', date: '2026-05-06', vol: 450, status: 'issued'     },
]

const statusConfig = {
  crossmatch:  { label: 'Cross-Matching', badge: 'badge-blue'   },
  approved:    { label: 'Approved',        badge: 'badge-green'  },
  pending:     { label: 'Pending',         badge: 'badge-gold'   },
  transfusing: { label: 'Transfusing',     badge: 'badge-purple' },
  completed:   { label: 'Completed',       badge: 'badge-gray'   },
}

const inventoryColor = { adequate: '#10b981', low: '#f59e0b', critical: '#ef4444' }

export default function BloodBankScreen() {
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState('inventory')

  const totalUnits = BLOOD_INVENTORY.reduce((a, b) => a + b.units, 0)
  const criticalTypes = BLOOD_INVENTORY.filter(b => b.status === 'critical').length
  const pendingRequests = REQUESTS.filter(r => r.status === 'pending' || r.status === 'crossmatch').length
  const donationsToday = DONORS.filter(d => d.date === '2026-05-07').length

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Droplets size={22} style={{ color: '#ef4444' }} />
            Blood Bank Management
          </h1>
          <p className="page-subtitle">Inventory · Requests · Crossmatch · Donor Registry</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm gap-1.5 text-xs"><RefreshCw size={12} />Refresh</button>
          <button className="btn btn-danger btn-sm gap-1.5 text-xs"><Plus size={13} />Emergency Request</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        {[
          { label: 'Total Units',       value: totalUnits,     sub: 'All blood types',   color: '#ef4444', icon: Droplets  },
          { label: 'Critical Types',    value: criticalTypes,  sub: 'Below threshold',   color: '#f97316', icon: AlertTriangle },
          { label: 'Active Requests',   value: pendingRequests,sub: 'Pending/crossmatch', color: '#0ea5e9', icon: Activity },
          { label: 'Donations Today',   value: donationsToday, sub: 'Walk-in donors',    color: '#10b981', icon: Heart    },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-600" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className="text-3xl font-800" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 flex-shrink-0" style={{ borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
        {['inventory', 'requests', 'donors', 'components'].map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className="px-4 py-2.5 text-xs font-600 capitalize transition-all"
            style={{
              color: activeSection === section ? '#38bdf8' : 'var(--text-muted)',
              borderBottom: activeSection === section ? '2px solid #38bdf8' : '2px solid transparent',
              marginBottom: -1,
            }}
          >{section.replace('_', ' ')}</button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'inventory' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-3">
            {BLOOD_INVENTORY.map((b, i) => {
              const pct = Math.round((b.units / (b.critical * 5)) * 100)
              const color = inventoryColor[b.status]
              return (
                <motion.div key={b.type} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                  <GlassCard className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-900"
                        style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                        {b.type}
                      </div>
                      <span className="badge text-[10px]" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-3xl font-900 mb-0.5" style={{ color }}>{b.units}</div>
                    <div className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>units available</div>
                    <div className="severity-bar mb-1.5">
                      <div className="severity-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                    </div>
                    <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <span>Min: {b.critical}</span>
                      {b.expiring > 0 && <span style={{ color: '#fbbf24' }}>⚠ {b.expiring} expiring</span>}
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {activeSection === 'requests' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Blood Requests</h3>
              <button className="btn btn-primary btn-sm gap-1.5 text-xs"><Plus size={12} />New Request</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  {['Request ID', 'Patient', 'Blood Type', 'Component', 'Units', 'Reason', 'Requested by', 'Time', 'Status'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REQUESTS.map(r => (
                  <tr key={r.id}>
                    <td className="font-700 text-xs" style={{ color: r.urgent ? '#f87171' : '#38bdf8' }}>
                      {r.urgent && <AlertTriangle size={10} className="inline mr-1" style={{ color: '#f87171' }} />}
                      {r.id}
                    </td>
                    <td>
                      <div className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{r.pt}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.mrn}</div>
                    </td>
                    <td><span className="badge badge-red text-xs">{r.blood}</span></td>
                    <td><span className="badge badge-purple text-[10px]">{r.comp}</span></td>
                    <td className="font-700" style={{ color: 'var(--text-primary)' }}>{r.units}</td>
                    <td className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.reason}</td>
                    <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.dr}</td>
                    <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.time}</td>
                    <td><span className={`badge text-[10px] ${statusConfig[r.status].badge}`}>{statusConfig[r.status].label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </motion.div>
      )}

      {activeSection === 'donors' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Donor Registry</h3>
              <button className="btn btn-primary btn-sm gap-1.5 text-xs"><Plus size={12} />Register Donor</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  {['Donor ID', 'Name', 'Blood Type', 'Date', 'Volume', 'Status'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {DONORS.map(d => (
                  <tr key={d.id}>
                    <td className="font-700 text-xs" style={{ color: '#38bdf8' }}>{d.id}</td>
                    <td className="font-600 text-xs" style={{ color: 'var(--text-primary)' }}>{d.name}</td>
                    <td><span className="badge badge-red text-xs">{d.blood}</span></td>
                    <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.date}</td>
                    <td className="font-600" style={{ color: 'var(--text-primary)' }}>{d.vol} mL</td>
                    <td>
                      <span className={`badge text-[10px] ${d.status === 'collected' ? 'badge-blue' : d.status === 'processed' ? 'badge-green' : d.status === 'issued' ? 'badge-purple' : 'badge-gold'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </motion.div>
      )}

      {activeSection === 'components' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4">
            <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Blood Components Inventory</h3>
            <div className="grid grid-cols-3 gap-3">
              {COMPONENTS.map((c, i) => (
                <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="p-4 rounded-xl" style={{ background: 'rgba(10,22,48,0.6)', border: '1px solid rgba(56,189,248,0.08)' }}>
                  <div className="text-xs font-600 mb-2" style={{ color: 'var(--text-secondary)' }}>{c.name}</div>
                  <div className="text-3xl font-900 mb-0.5" style={{ color: '#ef4444' }}>{c.units}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.unit_type}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
