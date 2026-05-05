import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pill, Plus, Search, AlertTriangle, ShoppingCart, TrendingDown } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'

const MEDICINES = Array.from({length:40},(_,i)=>({
  id: `MED-${String(100+i).padStart(4,'0')}`,
  name: ['Amoxicillin 500mg','Metformin 500mg','Paracetamol 500mg','Omeprazole 20mg',
         'Atorvastatin 40mg','Amlodipine 5mg','Metoprolol 50mg','Warfarin 5mg',
         'Insulin Glargine','Enoxaparin 40mg','Ceftriaxone 1g Inj','Vancomycin 500mg',
         'Midazolam 5mg Inj','Morphine 10mg Inj','Norepinephrine Inj','Epinephrine 1:1000'][i%16],
  category: ['Antibiotics','Antidiabetic','Analgesic','GI','Cardiovascular','Cardiovascular',
              'Cardiovascular','Anticoagulant','Antidiabetic','Anticoagulant',
              'Antibiotics','Antibiotics','Sedative','Analgesic','Vasopressor','Emergency'][i%16],
  stock: Math.max(0, 200 - i*4),
  reorder: 30,
  unit: ['Capsules','Tablets','Tablets','Capsules','Tablets','Tablets','Tablets','Tablets','Vials','Syringes','Vials','Vials','Vials','Vials','Vials','Vials'][i%16],
  price: (2.5 + i * 1.8).toFixed(2),
  expiry: `2026-${String(Math.ceil((i+1)/4)+3).padStart(2,'0')}-01`,
  supplier: ['Al Hayat Pharma','Gulf Medical Supplies','Emirates Pharma','MedLine'][i%4],
  status: i*4>200?'Out of Stock': i*4>170?'Critical Low':i*4>140?'Low Stock':'In Stock',
}))

const COLUMNS = [
  { key:'id',       label:'Med ID',   width:100, render:v=><span className="font-700 text-teal-400 text-xs">{v}</span> },
  { key:'name',     label:'Medicine', sortable:true, render:v=><span className="text-xs font-600" style={{color:'var(--text-primary)'}}>{v}</span> },
  { key:'category', label:'Category', sortable:true, render:v=><Badge variant="teal" size="xs">{v}</Badge> },
  { key:'stock',    label:'Stock',    sortable:true, render:(v,row)=>(
    <div>
      <span className={`font-700 text-sm ${v===0?'text-red-400':v<row.reorder?'text-amber-400':'text-emerald-400'}`}>{v}</span>
      <span className="text-xs ml-1" style={{color:'var(--text-muted)'}}>{row.unit}</span>
    </div>
  )},
  { key:'price',    label:'Unit Price', render:v=><span className="text-xs">AED {v}</span> },
  { key:'expiry',   label:'Expiry',   sortable:true },
  { key:'status',   label:'Status',   render:v=><Badge variant={v==='In Stock'?'green':v==='Low Stock'?'gold':v==='Critical Low'?'orange':'red'} dot size="xs">{v}</Badge> },
]

const CART = [
  { name:'Amoxicillin 500mg', qty:2,  price:2.50,  patient:'MR-1001' },
  { name:'Paracetamol 500mg', qty:10, price:0.80,  patient:'MR-1001' },
  { name:'Omeprazole 20mg',   qty:14, price:1.20,  patient:'MR-1001' },
]

export default function PharmacyScreen() {
  const [tab, setTab] = useState('inventory')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [cart, setCart] = useState(CART)
  const [dispensed, setDispensed] = useState(false)

  const lowStock = MEDICINES.filter(m=>m.status!=='In Stock')
  const filtered = MEDICINES
    .filter(m=>filter==='All'||m.status===filter)
    .filter(m=>!search||m.name.toLowerCase().includes(search.toLowerCase()))

  const cartTotal = cart.reduce((s,c)=>s+c.qty*parseFloat(c.price),0)

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)'}}>
              <Pill size={15} style={{color:'#34d399'}} />
            </div>
            Pharmacy Management
          </h1>
          <p className="page-subtitle">Inventory · Dispensing · Procurement · Drug Interactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={ShoppingCart} variant="ghost">Dispense Rx</Button>
          <Button icon={Plus} variant="primary">Add Medicine</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        {[
          {label:'Total Medicines', value:MEDICINES.length,                                    color:'#0ea5e9'},
          {label:'In Stock',        value:MEDICINES.filter(m=>m.status==='In Stock').length,   color:'#10b981'},
          {label:'Low Stock',       value:MEDICINES.filter(m=>m.status==='Low Stock').length,  color:'#f59e0b'},
          {label:'Critical Low',    value:MEDICINES.filter(m=>m.status==='Critical Low').length,color:'#f97316'},
          {label:'Out of Stock',    value:MEDICINES.filter(m=>m.status==='Out of Stock').length,color:'#ef4444'},
        ].map((s,i)=>(
          <motion.div key={s.label} className="glass-card p-3 text-center" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
            <div className="text-2xl font-800" style={{color:s.color}}>{s.value}</div>
            <div className="text-[10px] mt-1 font-500 uppercase tracking-wider" style={{color:'var(--text-muted)'}}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Alert for critical stocks */}
      {lowStock.filter(m=>m.status==='Critical Low'||m.status==='Out of Stock').length > 0 && (
        <GlassCard className="flex-shrink-0" style={{borderColor:'rgba(249,115,22,0.25)'}}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} style={{color:'#fb923c'}} />
            <span className="text-sm font-700 text-orange-400">Stock Alerts — Immediate Procurement Required</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {lowStock.filter(m=>m.status!=='Low Stock').slice(0,6).map(m=>(
              <div key={m.id} className="badge badge-orange text-[10px]">
                <TrendingDown size={9} /> {m.name}: {m.stock} {m.unit}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Inventory table */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}} />
              <input className="input pl-9" placeholder="Search medicine..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            {['All','In Stock','Low Stock','Critical Low','Out of Stock'].map(f=>(
              <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(f)}>{f}</button>
            ))}
          </div>
          <GlassCard className="flex-1 min-h-0" padding={false}>
            <div className="p-4 h-full">
              <DataTable columns={COLUMNS} data={filtered} pageSize={12} />
            </div>
          </GlassCard>
        </div>

        {/* Dispense Panel */}
        <GlassCard className="w-72 flex-shrink-0 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={14} style={{color:'#34d399'}} />
            <h3 className="text-sm font-700" style={{color:'var(--text-primary)'}}>Dispense Counter</h3>
          </div>
          <div className="text-xs font-600 mb-2" style={{color:'var(--text-muted)'}}>
            Patient: MR-1001 · Mohammed Al Hassan
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {cart.map((item,i)=>(
              <div key={i} className="p-2.5 rounded-xl" style={{background:'rgba(10,22,48,0.5)',border:'1px solid rgba(56,189,248,0.08)'}}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-600" style={{color:'var(--text-primary)'}}>{item.name}</div>
                    <div className="text-[10px] mt-0.5" style={{color:'var(--text-muted)'}}>Qty: {item.qty} · AED {(item.qty*parseFloat(item.price)).toFixed(2)}</div>
                  </div>
                  <button onClick={()=>setCart(c=>c.filter((_,idx)=>idx!==i))} className="text-red-400 text-xs hover:text-red-300">×</button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t mt-3" style={{borderColor:'rgba(56,189,248,0.08)'}}>
            <div className="flex justify-between text-sm font-700 mb-3">
              <span style={{color:'var(--text-secondary)'}}>Total</span>
              <span style={{color:'#34d399'}}>AED {cartTotal.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <select className="input text-xs">
                <option>Daman Insurance</option>
                <option>Cash</option>
                <option>Credit Card</option>
              </select>
              {dispensed ? (
                <div className="btn btn-ghost w-full justify-center text-emerald-400" style={{borderColor:'rgba(16,185,129,0.3)'}}>
                  ✓ Dispensed Successfully
                </div>
              ) : (
                <button className="btn btn-primary w-full justify-center" onClick={()=>setDispensed(true)}>
                  Dispense & Print Label
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
