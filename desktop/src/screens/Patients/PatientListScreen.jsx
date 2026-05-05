import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Plus, Search, Filter, Download, UserCircle, Phone, Calendar, Droplets } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'

const PATIENTS = Array.from({ length: 45 }, (_, i) => ({
  id: `MR-${String(1000 + i).padStart(4, '0')}`,
  name: ['Mohammed Al Hassan', 'Sarah Johnson', 'Ahmed Khalil', 'Fatima Al Zaabi',
         'Ravi Patel', 'Elena Popescu', 'James Obi', 'Nadia Rahman',
         'Carlos Mendez', 'Aisha Abdullah', 'Li Wei', 'Hassan Al Farsi',
         'Priya Sharma', 'Omar Siddiqui', 'Anna Kowalski'][i % 15],
  age: 20 + (i * 3 % 70),
  gender: i % 2 === 0 ? 'Male' : 'Female',
  blood: ['A+','O+','B+','AB+','O-','A-'][i % 6],
  phone: `+971 5${Math.floor(Math.random()*8+1)} ${Math.floor(Math.random()*9000000+1000000)}`,
  nationality: ['Emirati','Indian','Pakistani','Egyptian','Filipino','British','American'][i%7],
  insurance: ['Daman','Thiqa','AXA Gulf','DHA','Self-Pay'][i%5],
  lastVisit: `2026-${String(Math.ceil((i+1)/4)).padStart(2,'0')}-${String((i%28)+1).padStart(2,'0')}`,
  status: ['Active','Active','Active','Inactive','Active'][i%5],
  department: ['Cardiology','Emergency','Orthopedics','Pediatrics','Oncology','General'][i%6],
}))

const COLUMNS = [
  { key: 'id',         label: 'MR Number',   sortable: true, width: 110,
    render: (v) => <span className="font-700 text-sky-400 text-xs">{v}</span> },
  { key: 'name',       label: 'Patient Name', sortable: true,
    render: (v, row) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center flex-shrink-0 text-xs font-700 text-white">
          {v.split(' ').map(p=>p[0]).join('').slice(0,2)}
        </div>
        <div>
          <div className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{v}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{row.nationality}</div>
        </div>
      </div>
    )},
  { key: 'age',        label: 'Age',          sortable: true, width: 60  },
  { key: 'gender',     label: 'Gender',       sortable: true, width: 80  },
  { key: 'blood',      label: 'Blood',        width: 70,
    render: v => <span className="badge badge-red text-[10px]">{v}</span> },
  { key: 'insurance',  label: 'Insurance',    sortable: true },
  { key: 'department', label: 'Department',   sortable: true },
  { key: 'lastVisit',  label: 'Last Visit',   sortable: true,
    render: v => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v}</span> },
  { key: 'status',     label: 'Status',
    render: v => <Badge variant={v === 'Active' ? 'green' : 'gray'} dot size="xs">{v}</Badge> },
]

export default function PatientListScreen() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name:'', age:'', gender:'Male', blood:'O+', phone:'', insurance:'Self-Pay', nationality:'' })

  const filtered = PATIENTS.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  )

  const stats = [
    { label: 'Total Registered', value: PATIENTS.length, color: '#0ea5e9' },
    { label: 'Active Patients',  value: PATIENTS.filter(p=>p.status==='Active').length, color: '#10b981' },
    { label: 'Admitted Today',   value: 14, color: '#f59e0b' },
    { label: 'Discharged Today', value: 9,  color: '#8b5cf6' },
  ]

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)' }}>
              <Users size={15} style={{ color: '#38bdf8' }} />
            </div>
            Patient Registry
          </h1>
          <p className="page-subtitle">Electronic Health Records · Search · Demographics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={Download} variant="ghost" size="sm">Export</Button>
          <Button icon={Plus} variant="primary" onClick={() => setAddOpen(true)}>Register Patient</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="glass-card p-4 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="text-2xl font-800" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] mt-1 font-500" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input pl-9"
            placeholder="Search by name, MR number, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button icon={Filter} variant="ghost" size="sm">Filters</Button>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} patients found</span>
      </div>

      {/* Table */}
      <GlassCard className="flex-1 min-h-0" padding={false}>
        <div className="p-4 h-full">
          <DataTable
            columns={COLUMNS}
            data={filtered}
            pageSize={12}
            onRowClick={row => navigate(`/patients/${row.id}`)}
          />
        </div>
      </GlassCard>

      {/* Add Patient Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Register New Patient"
        subtitle="Create patient profile and assign Medical Record Number"
        width={620}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setAddOpen(false)}>Register Patient</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Full Name (as per Emirates ID)', key: 'name', col: 2 },
            { label: 'Date of Birth', key: 'dob', type: 'date' },
            { label: 'Gender', key: 'gender', type: 'select', opts: ['Male','Female','Other'] },
            { label: 'Nationality', key: 'nationality' },
            { label: 'Phone Number', key: 'phone' },
            { label: 'Blood Group', key: 'blood', type: 'select', opts: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
            { label: 'Emirates ID / Passport', key: 'eid' },
            { label: 'Insurance Provider', key: 'insurance', type: 'select', opts: ['Daman','Thiqa','AXA Gulf','DHA','Self-Pay'] },
            { label: 'Emergency Contact Name', key: 'ecname' },
            { label: 'Emergency Contact Phone', key: 'ecphone' },
            { label: 'Medical Alerts / Allergies', key: 'allergies', col: 2 },
          ].map(f => (
            <div key={f.key} style={{ gridColumn: f.col === 2 ? 'span 2' : 'span 1' }}>
              <label className="block text-xs font-600 mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
              {f.type === 'select' ? (
                <select className="input" value={form[f.key] || ''} onChange={e => setForm(prev => ({...prev,[f.key]:e.target.value}))}>
                  {f.opts?.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type || 'text'} className="input" value={form[f.key] || ''} onChange={e => setForm(prev => ({...prev,[f.key]:e.target.value}))} />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
