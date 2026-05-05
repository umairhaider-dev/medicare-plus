import { useState } from 'react'
import { motion } from 'framer-motion'
import { Receipt, Plus, Search, DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'

const REVENUE_DATA = [
  {dept:'Emergency', revenue:182000, insured:140000, selfpay:42000},
  {dept:'ICU',       revenue:340000, insured:290000, selfpay:50000},
  {dept:'Cardiology',revenue:220000, insured:180000, selfpay:40000},
  {dept:'Surgery',   revenue:410000, insured:360000, selfpay:50000},
  {dept:'OPD',       revenue:95000,  insured:70000,  selfpay:25000},
  {dept:'Lab',       revenue:45000,  insured:38000,  selfpay:7000},
  {dept:'Pharmacy',  revenue:78000,  insured:60000,  selfpay:18000},
]

const INVOICES = Array.from({length:30},(_,i)=>({
  id: `INV-2026-${String(5000+i).padStart(5,'0')}`,
  patient: ['Mohammed Al Hassan','Sarah Johnson','Ahmed Khalil','Fatima Al Zaabi','Ravi Patel'][i%5],
  mrn: `MR-${1000+i}`,
  date: `2026-05-0${(i%9)+1}`,
  amount: (500 + i*280).toFixed(2),
  insurance: ['Daman','Thiqa','AXA Gulf','DHA','Self-Pay'][i%5],
  covered: (350 + i*200).toFixed(2),
  patient_share: (150 + i*80).toFixed(2),
  status: ['Paid','Pending','Submitted','Approved','Rejected'][i%5],
  dept: ['Emergency','ICU','Cardiology','Surgery','OPD','Lab'][i%6],
}))

const STATUS_CFG = {
  Paid:      { badge:'green',  icon:CheckCircle },
  Pending:   { badge:'gold',   icon:Clock       },
  Submitted: { badge:'blue',   icon:Clock       },
  Approved:  { badge:'teal',   icon:CheckCircle },
  Rejected:  { badge:'red',    icon:AlertCircle },
}

const COLUMNS = [
  { key:'id',           label:'Invoice #',  width:140, render:v=><span className="font-700 text-sky-400 text-xs">{v}</span> },
  { key:'patient',      label:'Patient',    sortable:true },
  { key:'date',         label:'Date',       sortable:true },
  { key:'dept',         label:'Department', sortable:true },
  { key:'amount',       label:'Total (AED)',sortable:true, render:v=><span className="font-700 text-emerald-400">AED {v}</span> },
  { key:'insurance',    label:'Insurance',  sortable:true },
  { key:'covered',      label:'Covered',    render:v=><span className="text-xs text-sky-400">AED {v}</span> },
  { key:'patient_share',label:'Pt. Share',  render:v=><span className="text-xs text-amber-400">AED {v}</span> },
  { key:'status',       label:'Status',     render:v=><Badge variant={STATUS_CFG[v]?.badge||'gray'} dot size="xs">{v}</Badge> },
]

export default function BillingScreen() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = INVOICES
    .filter(inv=>filter==='All'||inv.status===filter)
    .filter(inv=>!search||inv.patient.toLowerCase().includes(search.toLowerCase())||inv.id.toLowerCase().includes(search.toLowerCase()))

  const totalRevenue = INVOICES.reduce((s,i)=>s+parseFloat(i.amount),0)
  const totalPaid = INVOICES.filter(i=>i.status==='Paid').reduce((s,i)=>s+parseFloat(i.amount),0)
  const totalPending = INVOICES.filter(i=>i.status==='Pending').reduce((s,i)=>s+parseFloat(i.amount),0)

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)'}}>
              <Receipt size={15} style={{color:'#34d399'}} />
            </div>
            Billing & Insurance
          </h1>
          <p className="page-subtitle">Invoicing · Insurance Claims · Revenue Tracking · DHA Compliance</p>
        </div>
        <Button icon={Plus} variant="primary">Create Invoice</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        {[
          {label:'Total Revenue (May)',  value:`AED ${(totalRevenue/1000).toFixed(0)}K`,  color:'#10b981', icon:DollarSign},
          {label:'Collected',           value:`AED ${(totalPaid/1000).toFixed(0)}K`,      color:'#0ea5e9', icon:CheckCircle},
          {label:'Pending Collection',  value:`AED ${(totalPending/1000).toFixed(0)}K`,   color:'#f59e0b', icon:Clock},
          {label:'Insurance Claims',    value:INVOICES.filter(i=>i.status==='Submitted').length, color:'#8b5cf6', icon:TrendingUp},
        ].map((s,i)=>(
          <motion.div key={s.label} className="glass-card p-4" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${s.color}18`}}>
                <s.icon size={16} style={{color:s.color}} />
              </div>
              <div className="text-xl font-800" style={{color:s.color}}>{s.value}</div>
            </div>
            <div className="text-[10px] font-500 uppercase tracking-wider" style={{color:'var(--text-muted)'}}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue by Dept Chart */}
      <GlassCard className="flex-shrink-0" padding={false}>
        <div className="p-4 pb-0">
          <h3 className="text-sm font-700" style={{color:'var(--text-primary)'}}>Revenue by Department</h3>
          <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>Insured vs Self-Pay (AED)</p>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={REVENUE_DATA} margin={{top:12,right:20,left:0,bottom:0}} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.05)" vertical={false} />
            <XAxis dataKey="dept" tick={{fill:'#445e7a',fontSize:10}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill:'#445e7a',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={v=>[`AED ${v.toLocaleString()}`]} contentStyle={{background:'rgba(10,22,48,0.95)',border:'1px solid rgba(56,189,248,0.2)',borderRadius:8,fontSize:11}} />
            <Bar dataKey="insured"  name="Insurance" fill="#0ea5e9" radius={[3,3,0,0]} opacity={0.8} />
            <Bar dataKey="selfpay"  name="Self-Pay"  fill="#f59e0b" radius={[3,3,0,0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Invoice Table */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}} />
          <input className="input pl-9" placeholder="Search patient or invoice..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {['All','Paid','Pending','Submitted','Approved','Rejected'].map(f=>(
          <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      <GlassCard className="flex-1 min-h-0" padding={false}>
        <div className="p-4 h-full">
          <DataTable columns={COLUMNS} data={filtered} pageSize={10} />
        </div>
      </GlassCard>
    </div>
  )
}
