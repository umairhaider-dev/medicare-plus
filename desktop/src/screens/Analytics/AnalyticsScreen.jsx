import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, DollarSign, Activity, BedDouble, Heart, Clock } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'

const MONTHLY_PATIENTS = [
  {m:'Jan',patients:1820,admissions:340,er:620},{m:'Feb',patients:1950,admissions:380,er:680},
  {m:'Mar',patients:2100,admissions:420,er:720},{m:'Apr',patients:2250,admissions:450,er:780},
  {m:'May',patients:2400,admissions:490,er:830},
]
const REVENUE_MONTHLY = [
  {m:'Jan',rev:4.2,cost:3.1,profit:1.1},{m:'Feb',rev:4.8,cost:3.4,profit:1.4},
  {m:'Mar',rev:4.5,cost:3.2,profit:1.3},{m:'Apr',rev:5.1,cost:3.6,profit:1.5},
  {m:'May',rev:5.6,cost:3.8,profit:1.8},
]
const DEPT_PERFORMANCE = [
  {dept:'Emergency',score:88},{dept:'ICU',score:92},{dept:'Cardiology',score:96},
  {dept:'Surgery',score:91},{dept:'OB/GYN',score:89},{dept:'Pediatrics',score:94},
]
const BED_UTIL = [
  {name:'ICU',util:87,color:'#ef4444'},{name:'Medical',util:72,color:'#0ea5e9'},
  {name:'Surgical',util:65,color:'#10b981'},{name:'Pediatric',util:58,color:'#ec4899'},
  {name:'OB/GYN',util:78,color:'#8b5cf6'},
]
const DIAGNOSIS_MIX = [
  {name:'Cardiovascular',value:28,color:'#ef4444'},{name:'Respiratory',value:18,color:'#0ea5e9'},
  {name:'Orthopedic',value:14,color:'#f59e0b'},{name:'Gastrointestinal',value:12,color:'#10b981'},
  {name:'Neurological',value:10,color:'#8b5cf6'},{name:'Other',value:18,color:'#64748b'},
]
const QUALITY_RADAR = [
  {kpi:'Patient Satisfaction',value:92},{kpi:'Readmission Rate',value:85},
  {kpi:'HCAI Prevention',value:96},{kpi:'Medication Safety',value:94},
  {kpi:'Surgical Outcomes',value:91},{kpi:'Response Time',value:88},
]

const KPI_CARDS = [
  {label:'Avg Length of Stay',   value:'4.2 days',  trend:'+0.2',  color:'#0ea5e9', icon:Clock,    good:false},
  {label:'Patient Satisfaction', value:'4.7 / 5.0', trend:'+0.3',  color:'#10b981', icon:Heart,    good:true},
  {label:'Bed Turnover Rate',    value:'6.8 / month',trend:'+0.5', color:'#f59e0b', icon:BedDouble,good:true},
  {label:'30-day Readmission',   value:'3.2%',       trend:'-0.8%',color:'#8b5cf6', icon:Users,    good:true},
  {label:'OR Utilisation',       value:'82.4%',      trend:'+4.1', color:'#ec4899', icon:Activity, good:true},
  {label:'Revenue / Patient',    value:'AED 2,714',  trend:'+180', color:'#34d399', icon:DollarSign,good:true},
]

function CustomTooltip({active,payload,label}) {
  if(!active||!payload?.length) return null
  return (
    <div className="glass-card p-2.5 text-xs">
      <p className="font-600 mb-1.5" style={{color:'var(--text-primary)'}}>{label}</p>
      {payload.map(p=>(
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span style={{color:p.color}}>{p.name}</span>
          <span className="font-700" style={{color:'var(--text-primary)'}}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsScreen() {
  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)'}}>
              <BarChart3 size={15} style={{color:'#a78bfa'}} />
            </div>
            Business Intelligence & Analytics
          </h1>
          <p className="page-subtitle">Executive Dashboard · KPIs · Clinical Performance · Financial Intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input text-xs w-36">
            <option>May 2026</option><option>Apr 2026</option><option>Q2 2026</option>
          </select>
          <Badge variant="blue" dot>Real-time</Badge>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-6 gap-3 flex-shrink-0">
        {KPI_CARDS.map((k,i)=>(
          <motion.div key={k.label} className="glass-card p-4" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{background:`${k.color}18`}}>
              <k.icon size={14} style={{color:k.color}} />
            </div>
            <div className="text-lg font-800" style={{color:k.color}}>{k.value}</div>
            <div className="text-[10px] font-500 mt-0.5 uppercase tracking-wider" style={{color:'var(--text-muted)'}}>{k.label}</div>
            <div className={`text-[10px] mt-1 font-600 ${k.good?'text-emerald-400':'text-red-400'}`}>
              {k.good?'↑':'↓'} {k.trend} vs last month
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Patient Volume */}
        <GlassCard className="col-span-5" animate delay={0.2} padding={false}>
          <div className="p-4 pb-0"><h3 className="text-sm font-700" style={{color:'var(--text-primary)'}}>Patient Volume Trend</h3></div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_PATIENTS} margin={{top:16,right:16,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gPat" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                <linearGradient id="gEr2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.05)"/>
              <XAxis dataKey="m" tick={{fill:'#445e7a',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#445e7a',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="patients"   name="Total Patients" stroke="#0ea5e9" fill="url(#gPat)" strokeWidth={2}/>
              <Area type="monotone" dataKey="er"         name="ED Visits"      stroke="#ef4444" fill="url(#gEr2)" strokeWidth={1.5}/>
              <Line type="monotone" dataKey="admissions" name="Admissions"     stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Revenue vs Cost */}
        <GlassCard className="col-span-4" animate delay={0.25} padding={false}>
          <div className="p-4 pb-0">
            <h3 className="text-sm font-700" style={{color:'var(--text-primary)'}}>Revenue vs Cost (AED M)</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={REVENUE_MONTHLY} margin={{top:16,right:12,left:-24,bottom:0}} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.05)" vertical={false}/>
              <XAxis dataKey="m" tick={{fill:'#445e7a',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#445e7a',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="rev"    name="Revenue" fill="#10b981" radius={[3,3,0,0]} opacity={0.8}/>
              <Bar dataKey="cost"   name="Cost"    fill="#ef4444" radius={[3,3,0,0]} opacity={0.6}/>
              <Bar dataKey="profit" name="Profit"  fill="#0ea5e9" radius={[3,3,0,0]} opacity={0.7}/>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Diagnosis Mix */}
        <GlassCard className="col-span-3" animate delay={0.3} padding={false}>
          <div className="p-4 pb-0"><h3 className="text-sm font-700" style={{color:'var(--text-primary)'}}>Diagnosis Mix</h3></div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={DIAGNOSIS_MIX} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value">
                {DIAGNOSIS_MIX.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={v=>[`${v}%`]} contentStyle={{background:'rgba(10,22,48,0.95)',border:'1px solid rgba(56,189,248,0.2)',borderRadius:8,fontSize:11}}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="px-3 pb-3 space-y-1">
            {DIAGNOSIS_MIX.map(d=>(
              <div key={d.name} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{background:d.color}}/><span style={{color:'var(--text-muted)'}}>{d.name}</span></div>
                <span className="font-600" style={{color:'var(--text-secondary)'}}>{d.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Quality Radar */}
        <GlassCard className="col-span-4" animate delay={0.35} padding={false}>
          <div className="p-4 pb-0"><h3 className="text-sm font-700" style={{color:'var(--text-primary)'}}>Quality KPI Radar</h3></div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={QUALITY_RADAR}>
              <PolarGrid stroke="rgba(56,189,248,0.1)"/>
              <PolarAngleAxis dataKey="kpi" tick={{fill:'#445e7a',fontSize:9}}/>
              <Radar name="Score" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={2}/>
              <Tooltip contentStyle={{background:'rgba(10,22,48,0.95)',border:'1px solid rgba(56,189,248,0.2)',borderRadius:8,fontSize:11}}/>
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Dept Performance */}
        <GlassCard className="col-span-4" animate delay={0.4}>
          <h3 className="text-sm font-700 mb-4" style={{color:'var(--text-primary)'}}>Department Performance Score</h3>
          <div className="space-y-3">
            {DEPT_PERFORMANCE.map(d=>(
              <div key={d.dept}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span style={{color:'var(--text-secondary)'}}>{d.dept}</span>
                  <span className="font-700" style={{color:d.score>=95?'#34d399':d.score>=85?'#fbbf24':'#f87171'}}>{d.score}%</span>
                </div>
                <div className="severity-bar">
                  <motion.div className="severity-fill" style={{background:`linear-gradient(90deg, #0ea5e9, ${d.score>=95?'#34d399':d.score>=85?'#f59e0b':'#ef4444'})`,width:`${d.score}%`,opacity:0.8}}
                    initial={{width:0}} animate={{width:`${d.score}%`}} transition={{duration:0.8}}/>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Bed Utilisation */}
        <GlassCard className="col-span-4" animate delay={0.42}>
          <h3 className="text-sm font-700 mb-4" style={{color:'var(--text-primary)'}}>Bed Utilisation by Ward</h3>
          <div className="space-y-3">
            {BED_UTIL.map(b=>(
              <div key={b.name}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span style={{color:'var(--text-secondary)'}}>{b.name} Ward</span>
                  <span className="font-700" style={{color:b.color}}>{b.util}%</span>
                </div>
                <div className="severity-bar">
                  <motion.div className="severity-fill" style={{background:b.color,width:`${b.util}%`,opacity:0.7}}
                    initial={{width:0}} animate={{width:`${b.util}%`}} transition={{duration:0.8}}/>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
