import { motion } from 'framer-motion'
import { BedDouble, Plus, Filter } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const WARDS = [
  { name:'Medical Ward A',   beds:40, occupied:32, gender:'Mixed',   floor:3, nurse:'Head Nurse Al Amri' },
  { name:'Medical Ward B',   beds:40, occupied:28, gender:'Mixed',   floor:3, nurse:'Head Nurse Rahman'  },
  { name:'Surgical Ward',    beds:30, occupied:24, gender:'Mixed',   floor:4, nurse:'Head Nurse Chen'    },
  { name:'Paediatric Ward',  beds:25, occupied:18, gender:'Mixed',   floor:5, nurse:'Head Nurse Kim'     },
  { name:'Maternity Ward',   beds:20, occupied:15, gender:'Female',  floor:6, nurse:'Head Nurse Patel'   },
  { name:'Orthopaedic Ward', beds:20, occupied:13, gender:'Mixed',   floor:4, nurse:'Head Nurse Hassan'  },
  { name:'Oncology Ward',    beds:18, occupied:16, gender:'Mixed',   floor:7, nurse:'Head Nurse Al Zaabi'},
  { name:'Isolation Ward',   beds:10, occupied:4,  gender:'Mixed',   floor:2, nurse:'Head Nurse Rashid'  },
]

export default function WardScreen() {
  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(14,165,233,0.15)',border:'1px solid rgba(14,165,233,0.3)'}}>
              <BedDouble size={15} style={{color:'#38bdf8'}} />
            </div>
            Inpatient Ward Management
          </h1>
          <p className="page-subtitle">Bed Allocation · ADT · Patient Placement · Nurse Assignment</p>
        </div>
        <div className="flex gap-2">
          <Button icon={Filter} variant="ghost">Filter</Button>
          <Button icon={Plus} variant="primary">Admit Patient</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {[
          {label:'Total Ward Beds',   value:WARDS.reduce((s,w)=>s+w.beds,0),     color:'#0ea5e9'},
          {label:'Occupied',          value:WARDS.reduce((s,w)=>s+w.occupied,0),  color:'#f59e0b'},
          {label:'Available',         value:WARDS.reduce((s,w)=>s+w.beds-w.occupied,0), color:'#10b981'},
          {label:'Isolation',         value:4, color:'#f97316'},
        ].map((s,i)=>(
          <motion.div key={s.label} className="glass-card p-4 text-center" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
            <div className="text-2xl font-800" style={{color:s.color}}>{s.value}</div>
            <div className="text-[10px] mt-1 font-500" style={{color:'var(--text-muted)'}}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {WARDS.map((ward,i)=>{
          const util = Math.round((ward.occupied/ward.beds)*100)
          return (
            <motion.div key={ward.name} className="glass-card p-5 cursor-pointer" initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} transition={{delay:i*0.06}}
              whileHover={{scale:1.02}}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-700" style={{color:'var(--text-primary)'}}>{ward.name}</h3>
                  <p className="text-[11px] mt-0.5" style={{color:'var(--text-muted)'}}>Floor {ward.floor} · {ward.gender} · {ward.nurse}</p>
                </div>
                <Badge variant={util>90?'red':util>75?'gold':'green'} size="xs">{util}% occupied</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[{l:'Total',v:ward.beds,c:'#0ea5e9'},{l:'Occupied',v:ward.occupied,c:'#f59e0b'},{l:'Available',v:ward.beds-ward.occupied,c:'#10b981'}].map(s=>(
                  <div key={s.l} className="p-2 rounded-lg text-center" style={{background:'rgba(10,22,48,0.5)'}}>
                    <div className="text-lg font-800" style={{color:s.c}}>{s.v}</div>
                    <div className="text-[9px]" style={{color:'var(--text-muted)'}}>{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="severity-bar mb-2">
                <motion.div className="severity-fill"
                  style={{background:`linear-gradient(90deg,#10b981,${util>90?'#ef4444':util>75?'#f59e0b':'#10b981'})`,width:`${util}%`}}
                  initial={{width:0}} animate={{width:`${util}%`}} transition={{duration:0.8}}/>
              </div>

              {/* Bed grid */}
              <div className="grid gap-1 mt-3" style={{gridTemplateColumns:'repeat(10, 1fr)'}}>
                {Array.from({length:ward.beds},(_,j)=>(
                  <div key={j} className={`aspect-square rounded text-center text-[7px] flex items-center justify-center ${j<ward.occupied?'bed-occupied':'bed-available'}`}>
                    {j+1}
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
