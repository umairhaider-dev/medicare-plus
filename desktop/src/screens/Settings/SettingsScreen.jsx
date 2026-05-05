import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Building2, Bell, Shield, Database, Wifi, User, ChevronRight, Save, Check } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Button from '../../components/ui/Button'
import { HOSPITAL_NAME } from '../../constants'

const SECTIONS = [
  { id:'hospital',    icon:Building2, label:'Hospital Profile' },
  { id:'users',       icon:User,      label:'User Management' },
  { id:'notifications',icon:Bell,     label:'Notifications' },
  { id:'security',    icon:Shield,    label:'Security & Compliance' },
  { id:'integrations',icon:Wifi,      label:'System Integrations' },
  { id:'database',    icon:Database,  label:'Data & Backup' },
]

export default function SettingsScreen() {
  const [active, setActive] = useState('hospital')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(100,116,139,0.15)',border:'1px solid rgba(100,116,139,0.3)'}}>
              <Settings size={15} style={{color:'#94a3b8'}} />
            </div>
            System Settings
          </h1>
          <p className="page-subtitle">Hospital Configuration · Users · Integrations · Security</p>
        </div>
        <Button icon={saved?Check:Save} variant={saved?'gold':'primary'} onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Section Nav */}
        <GlassCard className="w-56 flex-shrink-0 h-fit">
          <div className="space-y-0.5">
            {SECTIONS.map(s=>(
              <button
                key={s.id}
                className={`nav-item w-full ${active===s.id?'active':''}`}
                onClick={()=>setActive(s.id)}
              >
                <s.icon size={14} style={{color:active===s.id?'#38bdf8':'var(--text-muted)'}} />
                <span className="flex-1 text-left">{s.label}</span>
                <ChevronRight size={11} style={{color:'var(--text-muted)'}} />
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Content */}
        <GlassCard className="flex-1">
          {active === 'hospital' && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-4">
              <h2 className="text-base font-700" style={{color:'var(--text-primary)'}}>Hospital Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {label:'Hospital Name',      val:HOSPITAL_NAME,                     key:'name'},
                  {label:'License Number',     val:'DHA-HCF-2015-001234',             key:'lic'},
                  {label:'Hospital Type',      val:'General Hospital (Tertiary Care)', key:'type'},
                  {label:'Bed Capacity',       val:'1,200',                            key:'beds'},
                  {label:'Accreditation',      val:'JCI Accredited (2024)',            key:'acc'},
                  {label:'HIMSS Level',        val:'Stage 7',                          key:'himss'},
                  {label:'Address',            val:'Healthcare City, Dubai, UAE',      key:'addr'},
                  {label:'Emergency Hotline',  val:'+971 4 XXX XXXX',                 key:'hot'},
                ].map(f=>(
                  <div key={f.key}>
                    <label className="block text-xs font-600 mb-1.5" style={{color:'var(--text-secondary)'}}>{f.label}</label>
                    <input className="input" defaultValue={f.val} />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-xs font-600 mb-1.5" style={{color:'var(--text-secondary)'}}>System Language</label>
                <select className="input max-w-xs">
                  <option>English</option>
                  <option>العربية (Arabic)</option>
                  <option>Bilingual (EN + AR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-600 mb-1.5" style={{color:'var(--text-secondary)'}}>Date Format</label>
                <select className="input max-w-xs">
                  <option>DD/MM/YYYY (Gregorian)</option>
                  <option>MM/DD/YYYY</option>
                  <option>Hijri Calendar</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-5 rounded-full" style={{background:'#0ea5e9'}} />
                    <div className="absolute top-0.5 left-6 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                  <span className="text-sm" style={{color:'var(--text-secondary)'}}>Enable real-time clinical alerts</span>
                </label>
              </div>
            </motion.div>
          )}

          {active === 'security' && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-4">
              <h2 className="text-base font-700" style={{color:'var(--text-primary)'}}>Security & Compliance</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {label:'Session Timeout (minutes)', val:'30'},
                  {label:'Password Policy',           val:'Min 8 chars, mixed case + digits'},
                  {label:'Two-Factor Authentication', type:'select', opts:['Enabled (All Users)','Enabled (Admins Only)','Disabled']},
                  {label:'Audit Log Retention',       val:'2 years (DHA Requirement)'},
                  {label:'Data Encryption',           val:'AES-256 at rest, TLS 1.3 in transit'},
                  {label:'Backup Frequency',          type:'select', opts:['Every 4 hours','Daily','Weekly']},
                ].map(f=>(
                  <div key={f.label}>
                    <label className="block text-xs font-600 mb-1.5" style={{color:'var(--text-secondary)'}}>{f.label}</label>
                    {f.type==='select'?(
                      <select className="input">{f.opts?.map(o=><option key={o}>{o}</option>)}</select>
                    ):(
                      <input className="input" defaultValue={f.val} />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2 p-4 rounded-xl" style={{background:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.2)'}}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} style={{color:'#34d399'}} />
                  <span className="text-sm font-700 text-emerald-400">Compliance Status</span>
                </div>
                {['DHA Regulatory Compliance','HIPAA Standards','JCI Accreditation Standards','ISO 27001 Information Security','GDPR Data Protection'].map(c=>(
                  <div key={c} className="flex items-center gap-2 text-xs py-1" style={{color:'var(--text-secondary)'}}>
                    <Check size={11} style={{color:'#34d399'}} /> {c}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!['hospital','security'].includes(active) && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="flex flex-col items-center justify-center h-64 gap-3">
              <Settings size={40} style={{color:'var(--text-muted)'}} />
              <p className="text-sm" style={{color:'var(--text-muted)'}}>
                {SECTIONS.find(s=>s.id===active)?.label} configuration coming soon
              </p>
            </motion.div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
