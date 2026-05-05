import { useState } from 'react'
import { UserCog, Plus, Search } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'

const STAFF = Array.from({length:30},(_,i)=>({
  id: `EMP-${String(1000+i).padStart(4,'0')}`,
  name: ['Dr. Ahmed Al Rashidi','Dr. Priya Chandra','RN Sarah Johnson','Dr. James Hassan','RN Fatima Al Zaabi',
         'Dr. Kim Jae-Won','RN Ahmed Khalil','Dr. Elena Popescu','RN Ravi Patel','Dr. Carlos Mendez'][i%10],
  role: ['Doctor','Doctor','Nurse','Doctor','Nurse','Doctor','Nurse','Doctor','Nurse','Doctor'][i%10],
  dept: ['Cardiology','Neurology','Emergency','General Surgery','ICU','Internal Med.','Pharmacy','Radiology','OB/GYN','Pediatrics'][i%10],
  status: ['On Duty','Off Duty','On Leave','On Duty'][i%4],
  shift: ['Morning (07-15)','Evening (15-23)','Night (23-07)','Morning (07-15)'][i%4],
  joined: `2020-0${(i%9)+1}-01`,
  nationality: ['Emirati','Indian','Egyptian','Filipino','British'][i%5],
}))

const COLUMNS = [
  {key:'id',    label:'Employee ID', width:100, render:v=><span className="font-700 text-sky-400 text-xs">{v}</span>},
  {key:'name',  label:'Name',        sortable:true, render:v=>(
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-xs font-700 text-white flex-shrink-0">
        {v.split(' ').filter(p=>!['Dr.','RN'].includes(p)).map(p=>p[0]).join('').slice(0,2)}
      </div>
      <span className="text-xs font-600" style={{color:'var(--text-primary)'}}>{v}</span>
    </div>
  )},
  {key:'role',   label:'Role',       sortable:true, render:v=><Badge variant={v==='Doctor'?'blue':v==='Nurse'?'teal':'purple'} size="xs">{v}</Badge>},
  {key:'dept',   label:'Department', sortable:true},
  {key:'shift',  label:'Shift',      sortable:true},
  {key:'status', label:'Status',     render:v=><Badge variant={v==='On Duty'?'green':v==='Off Duty'?'gray':'gold'} dot size="xs">{v}</Badge>},
  {key:'joined', label:'Joined',     sortable:true},
  {key:'nationality',label:'Nationality',sortable:true},
]

export default function StaffScreen() {
  const [search, setSearch] = useState('')
  const filtered = STAFF.filter(s=>!search||s.name.toLowerCase().includes(search.toLowerCase())||s.dept.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)'}}>
              <UserCog size={15} style={{color:'#a78bfa'}} />
            </div>
            Staff Management
          </h1>
          <p className="page-subtitle">Human Resources · Scheduling · Attendance · Credentials</p>
        </div>
        <Button icon={Plus} variant="primary">Add Staff Member</Button>
      </div>
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {[
          {label:'Total Staff',  value:STAFF.length,                                   color:'#0ea5e9'},
          {label:'On Duty',      value:STAFF.filter(s=>s.status==='On Duty').length,   color:'#10b981'},
          {label:'Doctors',      value:STAFF.filter(s=>s.role==='Doctor').length,       color:'#8b5cf6'},
          {label:'Nurses',       value:STAFF.filter(s=>s.role==='Nurse').length,        color:'#ec4899'},
        ].map((s,i)=>(
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="text-2xl font-800" style={{color:s.color}}>{s.value}</div>
            <div className="text-[10px] mt-1 font-500" style={{color:'var(--text-muted)'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}} />
          <input className="input pl-9" placeholder="Search staff..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>
      <GlassCard className="flex-1 min-h-0" padding={false}>
        <div className="p-4 h-full"><DataTable columns={COLUMNS} data={filtered} pageSize={12} /></div>
      </GlassCard>
    </div>
  )
}
