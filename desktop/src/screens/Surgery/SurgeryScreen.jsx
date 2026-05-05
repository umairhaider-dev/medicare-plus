import { motion } from 'framer-motion'
import { Scissors, Clock, User, CheckCircle, AlertTriangle, Plus } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const ORS = [
  { id:'OT-1', proc:'Coronary Artery Bypass Graft (CABG)', patient:'Mohammed Al Hassan (MR-1001)', surgeon:'Dr. Ahmed Al Rashidi', anest:'Dr. Fernandez', start:'07:30', eta:'11:30', elapsed:'2h 45m', status:'active',    team:5, notes:'On-pump, 2 grafts completed' },
  { id:'OT-2', proc:'Total Hip Replacement (Right)',       patient:'Sarah Johnson (MR-1002)',       surgeon:'Dr. Raj Patel',        anest:'Dr. Kim',       start:'09:00', eta:'11:30', elapsed:'1h 15m', status:'active',    team:4, notes:'Implant placed, cementing phase' },
  { id:'OT-3', proc:'Laparoscopic Appendectomy',          patient:'Ahmed Khalil (MR-1003)',         surgeon:'Dr. James Hassan',     anest:'Dr. Chen',      start:'11:00', eta:'12:00', elapsed:'—',      status:'prep',      team:3, notes:'Patient in theatre, draping' },
  { id:'OT-4', proc:'Laparoscopic Cholecystectomy',       patient:'Fatima Al Zaabi (MR-1004)',      surgeon:'Dr. Priya Chandra',    anest:'Dr. Fernandez', start:'12:30', eta:'14:00', elapsed:'—',      status:'scheduled', team:3, notes:'Awaiting OT-3 completion' },
  { id:'OT-5', proc:'Craniotomy — Meningioma Excision',   patient:'Ravi Patel (MR-1005)',           surgeon:'Dr. Al Zaabi',         anest:'Dr. Kim',       start:'13:00', eta:'18:00', elapsed:'—',      status:'scheduled', team:6, notes:'Neuro nav system setup required' },
  { id:'OT-6', proc:'Caesarean Section (Emergency)',      patient:'Elena Petrova (MR-1006)',         surgeon:'Dr. Al Farsi',         anest:'Dr. Chen',      start:'NOW',   eta:'+45m',  elapsed:'—',      status:'emergency', team:5, notes:'Fetal distress, emergency C/S called' },
]

const STATUS_MAP = {
  active:    { badge:'purple', label:'In Progress', glow:'rgba(139,92,246,0.3)' },
  prep:      { badge:'orange', label:'Preparation', glow:'rgba(249,115,22,0.2)' },
  scheduled: { badge:'blue',   label:'Scheduled',   glow:'none' },
  emergency: { badge:'red',    label:'EMERGENCY',   glow:'rgba(239,68,68,0.4)' },
  completed: { badge:'green',  label:'Completed',   glow:'none' },
}

export default function SurgeryScreen() {
  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(236,72,153,0.15)',border:'1px solid rgba(236,72,153,0.3)'}}>
              <Scissors size={15} style={{color:'#f472b6'}} />
            </div>
            Operating Theater Management
          </h1>
          <p className="page-subtitle">Surgical Schedule · OR Status · Anaesthesia · Post-Op Tracking</p>
        </div>
        <Button icon={Plus} variant="primary">Schedule Surgery</Button>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {[
          {label:'ORs Active',    value:2, color:'#8b5cf6'},
          {label:'Scheduled',     value:3, color:'#0ea5e9'},
          {label:'Emergency',     value:1, color:'#ef4444'},
          {label:'Completed Today',value:4,color:'#10b981'},
        ].map((s,i)=>(
          <motion.div key={s.label} className="glass-card p-4 text-center" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}>
            <div className="text-2xl font-800" style={{color:s.color}}>{s.value}</div>
            <div className="text-[10px] mt-1 font-500 uppercase tracking-wider" style={{color:'var(--text-muted)'}}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {ORS.map((or, i) => {
          const cfg = STATUS_MAP[or.status]
          return (
            <motion.div
              key={or.id}
              className="glass-card p-5"
              style={{
                borderColor: or.status==='emergency'?'rgba(239,68,68,0.35)':or.status==='active'?'rgba(139,92,246,0.25)':'rgba(56,189,248,0.1)',
                boxShadow: cfg.glow!=='none'?`0 0 24px ${cfg.glow}`:undefined,
              }}
              initial={{opacity:0,scale:0.97}}
              animate={{opacity:1,scale:1}}
              transition={{delay:i*0.08}}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="px-2.5 py-1 rounded-lg font-800 text-sm"
                    style={{background:'rgba(14,165,233,0.15)',color:'#38bdf8',border:'1px solid rgba(14,165,233,0.25)'}}>
                    {or.id}
                  </div>
                  <Badge variant={cfg.badge}>
                    {or.status==='emergency'&&<span className="pulse-dot mr-1" style={{background:'currentColor',color:'currentColor'}}/>}
                    {cfg.label}
                  </Badge>
                </div>
                {or.status==='active'&&<div className="text-xs font-700 text-purple-400">{or.elapsed}</div>}
                {or.status==='emergency'&&<div className="text-xs font-700 text-red-400 animate-pulse">STAT</div>}
              </div>

              <h3 className="text-sm font-700 mb-1" style={{color:'var(--text-primary)'}}>{or.proc}</h3>
              <p className="text-xs mb-3" style={{color:'var(--text-muted)'}}>{or.patient}</p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  {label:'Surgeon',   value:or.surgeon.replace('Dr. ','Dr.')},
                  {label:'Anaest.',   value:or.anest.replace('Dr. ','Dr.')},
                  {label:'Team Size', value:`${or.team} members`},
                  {label:'Start',     value:or.start},
                  {label:'ETA Done',  value:or.eta},
                  {label:'Elapsed',   value:or.elapsed||'—'},
                ].map(f=>(
                  <div key={f.label} className="p-2 rounded-lg" style={{background:'rgba(10,22,48,0.5)',border:'1px solid rgba(56,189,248,0.06)'}}>
                    <div className="text-[9px] uppercase tracking-wider" style={{color:'var(--text-muted)'}}>{f.label}</div>
                    <div className="text-[11px] font-600 mt-0.5 truncate" style={{color:'var(--text-secondary)'}}>{f.value}</div>
                  </div>
                ))}
              </div>

              {or.notes&&(
                <div className="p-2 rounded-lg text-[11px]" style={{background:'rgba(14,165,233,0.06)',border:'1px solid rgba(56,189,248,0.1)',color:'var(--text-muted)'}}>
                  📋 {or.notes}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {or.status==='active'&&<button className="btn btn-ghost btn-sm">Update Status</button>}
                {or.status==='prep'&&<button className="btn btn-primary btn-sm">Start Surgery</button>}
                {or.status==='emergency'&&<button className="btn btn-danger btn-sm"><AlertTriangle size={12}/>Activate Emergency Protocol</button>}
                <button className="btn btn-ghost btn-sm">View Patient</button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
