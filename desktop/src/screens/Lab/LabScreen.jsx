import { useState } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Plus, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'

const LAB_ORDERS = Array.from({length:30},(_,i) => ({
  id: `LAB-${String(5000+i).padStart(5,'0')}`,
  patient: ['Mohammed Al Hassan','Sarah Johnson','Ahmed Khalil','Fatima Al Zaabi','Ravi Patel','Elena Popescu'][i%6],
  mrn: `MR-${1000+i}`,
  test: ['CBC','Metabolic Panel','Lipid Panel','HbA1c','Blood Culture','Thyroid Panel','Troponin I','D-Dimer','Coagulation Screen','Urinalysis'][i%10],
  category: ['Hematology','Biochemistry','Biochemistry','Biochemistry','Microbiology','Biochemistry','Biochemistry','Coagulation','Coagulation','Urinalysis'][i%10],
  ordered: `${String(Math.floor(i/3)+7).padStart(2,'0')}:${String((i*7)%60).padStart(2,'0')}`,
  doctor: ['Dr. Al Rashidi','Dr. Chandra','Dr. Hassan','Dr. Al Zaabi','Dr. Kim'][i%5],
  status: ['Pending','In Progress','Completed','Critical','Completed'][i%5],
  result: i%5===2||i%5===3 ? (i%5===3?'CRITICAL':'Normal') : '',
  priority: i%3===0?'STAT':'Routine',
}))

const STATUS_CFG = {
  Pending:     { badge:'gold',   icon:Clock        },
  'In Progress':{ badge:'blue',  icon:FlaskConical },
  Completed:   { badge:'green',  icon:CheckCircle  },
  Critical:    { badge:'red',    icon:AlertTriangle},
}

const COLUMNS = [
  { key:'id',       label:'Order ID',  width:110, render: v=><span className="font-700 text-sky-400 text-xs">{v}</span> },
  { key:'patient',  label:'Patient',   sortable:true },
  { key:'test',     label:'Test Name', sortable:true },
  { key:'category', label:'Category',  sortable:true, render: v=><Badge variant="teal" size="xs">{v}</Badge> },
  { key:'ordered',  label:'Ordered At',sortable:true },
  { key:'doctor',   label:'Ordered By',sortable:true },
  { key:'priority', label:'Priority',  render:v=><Badge variant={v==='STAT'?'red':'gray'} size="xs">{v}</Badge> },
  { key:'status',   label:'Status',    render:(v)=><Badge variant={STATUS_CFG[v]?.badge||'gray'} size="xs" dot>{v}</Badge> },
  { key:'result',   label:'Result',    render:v=>v?<span className={`text-xs font-700 ${v==='CRITICAL'?'text-red-400':'text-emerald-400'}`}>{v}</span>:<span className="text-xs" style={{color:'var(--text-muted)'}}>Pending</span> },
]

export default function LabScreen() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = LAB_ORDERS
    .filter(o => filter==='All' || o.status===filter)
    .filter(o => !search || o.patient.toLowerCase().includes(search.toLowerCase()) || o.test.toLowerCase().includes(search.toLowerCase()))

  const critical = LAB_ORDERS.filter(o=>o.status==='Critical')

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(20,184,166,0.15)',border:'1px solid rgba(20,184,166,0.3)'}}>
              <FlaskConical size={15} style={{color:'#2dd4bf'}} />
            </div>
            Laboratory Management
          </h1>
          <p className="page-subtitle">Order Tracking · Result Reporting · Critical Value Alerts</p>
        </div>
        <Button icon={Plus} variant="primary">Order Lab Test</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        {[
          {label:'Total Orders',   value:LAB_ORDERS.length, color:'#0ea5e9'},
          {label:'Pending',        value:LAB_ORDERS.filter(o=>o.status==='Pending').length,      color:'#f59e0b'},
          {label:'In Progress',    value:LAB_ORDERS.filter(o=>o.status==='In Progress').length,  color:'#8b5cf6'},
          {label:'Completed',      value:LAB_ORDERS.filter(o=>o.status==='Completed').length,    color:'#10b981'},
          {label:'Critical Values',value:critical.length,   color:'#ef4444'},
        ].map((s,i) => (
          <motion.div key={s.label} className="glass-card p-3 text-center" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
            <div className="text-2xl font-800" style={{color:s.color}}>{s.value}</div>
            <div className="text-[10px] mt-1 font-500 uppercase tracking-wider" style={{color:'var(--text-muted)'}}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Critical alerts */}
      {critical.length > 0 && (
        <GlassCard variant="red" className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} style={{color:'#f87171'}} />
            <h3 className="text-sm font-700 text-red-400">Critical Value Alerts — Immediate Physician Notification Required</h3>
          </div>
          <div className="flex gap-3 flex-wrap">
            {critical.map(o=>(
              <div key={o.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)'}}>
                <div className="pulse-dot" style={{background:'#ef4444',color:'#ef4444'}} />
                <div>
                  <div className="text-xs font-700 text-red-400">{o.test} — {o.patient}</div>
                  <div className="text-[10px]" style={{color:'var(--text-muted)'}}>{o.mrn} · Dr. {o.doctor}</div>
                </div>
                <button className="btn btn-danger btn-sm ml-2">Notify Physician</button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}} />
          <input className="input pl-9" placeholder="Search patient or test..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {['All','Pending','In Progress','Completed','Critical'].map(f=>(
          <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <GlassCard className="flex-1 min-h-0" padding={false}>
        <div className="p-4 h-full">
          <DataTable columns={COLUMNS} data={filtered} pageSize={12} />
        </div>
      </GlassCard>
    </div>
  )
}
