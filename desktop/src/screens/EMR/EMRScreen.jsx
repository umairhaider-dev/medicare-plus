import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Search, Activity, Pill, FlaskConical, Stethoscope,
  Heart, Thermometer, Wind, Droplets, ChevronRight, Plus,
  Clock, AlertTriangle, CheckCircle, User, Calendar, Edit3,
  Printer, Download, Share2, History, Brain, Bone, Eye,
} from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'

const PATIENTS_EMR = [
  { id: 'MR-1001', name: 'Mohammed Al Hassan', age: 54, gender: 'Male', blood: 'O+', dept: 'Cardiology', dr: 'Dr. Al Rashidi', status: 'admitted' },
  { id: 'MR-1007', name: 'Sarah Johnson',       age: 38, gender: 'Female', blood: 'A+', dept: 'Oncology', dr: 'Dr. Patel', status: 'outpatient' },
  { id: 'MR-1013', name: 'Ahmed Khalil',         age: 67, gender: 'Male', blood: 'B+', dept: 'Nephrology', dr: 'Dr. Hassan', status: 'admitted' },
  { id: 'MR-1022', name: 'Fatima Al Zaabi',      age: 29, gender: 'Female', blood: 'AB+', dept: 'Obstetrics', dr: 'Dr. Chandra', status: 'admitted' },
  { id: 'MR-1034', name: 'Ravi Patel',           age: 45, gender: 'Male', blood: 'O-', dept: 'Orthopedics', dr: 'Dr. Fernandez', status: 'outpatient' },
  { id: 'MR-1041', name: 'Elena Popescu',        age: 61, gender: 'Female', blood: 'A-', dept: 'Neurology', dr: 'Dr. Al Zaabi', status: 'admitted' },
]

const SOAP_NOTES = [
  {
    date: '2026-05-07', time: '09:15', author: 'Dr. Al Rashidi', type: 'Progress Note',
    subjective: 'Patient reports mild chest discomfort, improved since yesterday. Denies shortness of breath at rest. Sleep improved on current medications.',
    objective: 'BP 128/82 mmHg, HR 72 bpm regular, RR 16, SpO2 98% on room air, Temp 36.8°C. Lungs clear to auscultation bilaterally. Heart: regular rhythm, no new murmurs.',
    assessment: 'Stable coronary artery disease, post-PTCA Day 3. Troponin trending down appropriately. Echo shows EF 48%, mildly reduced.',
    plan: 'Continue ASA 100mg + Clopidogrel 75mg. Add Bisoprolol 2.5mg OD. Repeat ECG in AM. Cardiology review tomorrow. Target discharge Day 5 if stable.',
  },
  {
    date: '2026-05-06', time: '08:45', author: 'Dr. Al Rashidi', type: 'Progress Note',
    subjective: 'Patient had a comfortable night. Pain controlled. Some anxiety about procedure.',
    objective: 'BP 134/88 mmHg, HR 78 bpm. Wound site clean, no hematoma. Troponin 0.8 ng/mL (down from 2.1).',
    assessment: 'Post-PTCA Day 2. Hemodynamically stable. Cardiac enzymes trending down.',
    plan: 'Continue medications. Cardiac rehab assessment. Dietitian referral for cardiac diet.',
  },
]

const VITALS_TREND = [
  { time: '06:00', bp_s: 134, bp_d: 88, hr: 78, spo2: 97, temp: 36.9 },
  { time: '09:00', bp_s: 128, bp_d: 82, hr: 72, spo2: 98, temp: 36.8 },
  { time: '12:00', bp_s: 126, bp_d: 80, hr: 70, spo2: 98, temp: 36.7 },
  { time: '15:00', bp_s: 130, bp_d: 84, hr: 74, spo2: 97, temp: 36.9 },
  { time: '18:00', bp_s: 132, bp_d: 86, hr: 76, spo2: 98, temp: 37.0 },
]

const LABS = [
  { name: 'Troponin I',       val: '0.8 ng/mL',   ref: '< 0.04',    flag: 'high',   date: '05/07 06:00' },
  { name: 'CK-MB',            val: '18 U/L',       ref: '< 25',      flag: 'normal', date: '05/07 06:00' },
  { name: 'BNP',              val: '312 pg/mL',    ref: '< 100',     flag: 'high',   date: '05/07 06:00' },
  { name: 'Creatinine',       val: '1.1 mg/dL',    ref: '0.7–1.3',  flag: 'normal', date: '05/07 06:00' },
  { name: 'Potassium',        val: '3.9 mEq/L',    ref: '3.5–5.0',  flag: 'normal', date: '05/07 06:00' },
  { name: 'Haemoglobin',      val: '11.2 g/dL',    ref: '12–17',    flag: 'low',    date: '05/07 06:00' },
  { name: 'WBC',              val: '9.8 × 10³/µL', ref: '4.5–11.0', flag: 'normal', date: '05/07 06:00' },
  { name: 'Platelets',        val: '224 × 10³/µL', ref: '150–400',  flag: 'normal', date: '05/07 06:00' },
]

const MEDICATIONS = [
  { name: 'Aspirin',        dose: '100 mg',  freq: 'Once daily',   route: 'Oral', start: '2026-05-05', status: 'active'   },
  { name: 'Clopidogrel',   dose: '75 mg',   freq: 'Once daily',   route: 'Oral', start: '2026-05-05', status: 'active'   },
  { name: 'Bisoprolol',    dose: '2.5 mg',  freq: 'Once daily',   route: 'Oral', start: '2026-05-07', status: 'active'   },
  { name: 'Atorvastatin',  dose: '80 mg',   freq: 'Once nightly', route: 'Oral', start: '2026-05-05', status: 'active'   },
  { name: 'Enoxaparin',    dose: '60 mg',   freq: 'Twice daily',  route: 'SC',   start: '2026-05-05', status: 'active'   },
  { name: 'Pantoprazole',  dose: '40 mg',   freq: 'Once daily',   route: 'IV',   start: '2026-05-05', status: 'active'   },
  { name: 'Morphine',      dose: '2–4 mg',  freq: 'PRN',          route: 'IV',   start: '2026-05-05', status: 'discontinued' },
]

const ALLERGIES = ['Penicillin — Anaphylaxis', 'Sulfa drugs — Rash', 'Contrast dye — Urticaria']

const PROBLEMS = [
  { dx: 'Acute Myocardial Infarction (NSTEMI)', icd: 'I21.4', onset: '2026-05-05', status: 'active' },
  { dx: 'Type 2 Diabetes Mellitus',              icd: 'E11.9', onset: '2019-03',    status: 'chronic' },
  { dx: 'Hypertension',                          icd: 'I10',   onset: '2017-06',    status: 'chronic' },
  { dx: 'Hyperlipidaemia',                       icd: 'E78.5', onset: '2019-03',    status: 'chronic' },
  { dx: 'CKD Stage 2',                           icd: 'N18.2', onset: '2022-09',    status: 'chronic' },
]

const TABS = ['Summary', 'SOAP Notes', 'Vitals', 'Labs', 'Medications', 'Problem List']

export default function EMRScreen() {
  const [search, setSearch] = useState('')
  const [selectedPt, setSelectedPt] = useState(PATIENTS_EMR[0])
  const [activeTab, setActiveTab] = useState('Summary')

  const filtered = PATIENTS_EMR.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
  )

  const flagColor = (f) => f === 'high' ? '#f87171' : f === 'low' ? '#60a5fa' : '#34d399'
  const flagBg   = (f) => f === 'high' ? 'rgba(239,68,68,0.12)' : f === 'low' ? 'rgba(59,130,246,0.12)' : 'transparent'

  return (
    <div className="page-content h-full flex gap-5 overflow-hidden" style={{ padding: 24 }}>
      {/* Patient List */}
      <div className="flex flex-col gap-3 flex-shrink-0" style={{ width: 260 }}>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input pl-8 text-xs"
            placeholder="Search patients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto" style={{ flex: 1 }}>
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPt(p)}
              className="text-left rounded-xl p-3 transition-all"
              style={{
                background: selectedPt.id === p.id ? 'rgba(14,165,233,0.12)' : 'rgba(10,22,48,0.6)',
                border: `1px solid ${selectedPt.id === p.id ? 'rgba(14,165,233,0.3)' : 'rgba(56,189,248,0.08)'}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-700 flex-shrink-0"
                  style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>
                  {p.name.split(' ').map(x=>x[0]).join('').slice(0,2)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-600 truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.id} · {p.age}y {p.gender[0]}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.dept}</span>
                <span className={`badge text-[9px] ${p.status === 'admitted' ? 'badge-blue' : 'badge-green'}`}>
                  {p.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* EMR Detail */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
        {/* Patient Header */}
        <GlassCard className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-800"
                style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.3)' }}>
                {selectedPt.name.split(' ').map(x=>x[0]).join('').slice(0,2)}
              </div>
              <div>
                <h2 className="text-lg font-800" style={{ color: 'var(--text-primary)' }}>{selectedPt.name}</h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedPt.id}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>·</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedPt.age}y {selectedPt.gender}</span>
                  <span className="badge badge-red text-xs">{selectedPt.blood}</span>
                  <span className={`badge text-xs ${selectedPt.status === 'admitted' ? 'badge-blue' : 'badge-green'}`}>{selectedPt.status}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedPt.dept}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedPt.dr}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[{ icon: Edit3, label: 'Edit' }, { icon: Printer, label: 'Print' }, { icon: Download, label: 'Export' }, { icon: Share2, label: 'Share' }].map(({ icon: Icon, label }) => (
                <button key={label} className="btn btn-ghost btn-sm gap-1.5 text-xs">
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>
          </div>
          {/* Allergies */}
          {ALLERGIES.length > 0 && (
            <div className="mt-3 p-2.5 rounded-lg flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
              <div>
                <span className="text-xs font-700" style={{ color: '#f87171' }}>ALLERGIES: </span>
                <span className="text-xs" style={{ color: '#fca5a5' }}>{ALLERGIES.join(' | ')}</span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Tabs */}
        <div className="flex gap-1 flex-shrink-0" style={{ borderBottom: '1px solid rgba(56,189,248,0.08)', paddingBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-xs font-600 transition-all relative"
              style={{
                color: activeTab === tab ? '#38bdf8' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid #38bdf8' : '2px solid transparent',
                marginBottom: -1,
              }}
            >{tab}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

              {activeTab === 'Summary' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Latest Vitals */}
                  <GlassCard className="p-4">
                    <h3 className="text-xs font-700 uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Current Vitals</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: Activity, label: 'BP', val: '128/82', unit: 'mmHg', color: '#0ea5e9' },
                        { icon: Heart, label: 'Heart Rate', val: '72', unit: 'bpm', color: '#ef4444' },
                        { icon: Wind, label: 'SpO₂', val: '98', unit: '%', color: '#10b981' },
                        { icon: Thermometer, label: 'Temp', val: '36.8', unit: '°C', color: '#f59e0b' },
                      ].map(v => (
                        <div key={v.label} className="vital-chip">
                          <div className="flex items-center gap-1.5 mb-1">
                            <v.icon size={11} style={{ color: v.color }} />
                            <span className="vital-label">{v.label}</span>
                          </div>
                          <span className="vital-value" style={{ color: v.color, fontSize: 18 }}>{v.val}</span>
                          <span className="vital-unit">{v.unit}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Active Problems */}
                  <GlassCard className="p-4">
                    <h3 className="text-xs font-700 uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Active Problems</h3>
                    <div className="flex flex-col gap-2">
                      {PROBLEMS.slice(0, 4).map(p => (
                        <div key={p.icd} className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{p.dx}</div>
                            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.icd} · since {p.onset}</div>
                          </div>
                          <span className={`badge text-[9px] flex-shrink-0 ${p.status === 'active' ? 'badge-red' : 'badge-gray'}`}>{p.status}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Latest Note */}
                  <GlassCard className="p-4 col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-700 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Latest Progress Note</h3>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{SOAP_NOTES[0].date} · {SOAP_NOTES[0].time} · {SOAP_NOTES[0].author}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'S — Subjective', content: SOAP_NOTES[0].subjective },
                        { label: 'O — Objective',  content: SOAP_NOTES[0].objective  },
                        { label: 'A — Assessment', content: SOAP_NOTES[0].assessment },
                        { label: 'P — Plan',       content: SOAP_NOTES[0].plan       },
                      ].map(s => (
                        <div key={s.label} className="p-3 rounded-lg" style={{ background: 'rgba(10,22,48,0.5)', border: '1px solid rgba(56,189,248,0.07)' }}>
                          <div className="text-[10px] font-700 mb-1.5" style={{ color: '#38bdf8' }}>{s.label}</div>
                          <p className="text-xs leading-relaxed selectable" style={{ color: 'var(--text-secondary)' }}>{s.content}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeTab === 'SOAP Notes' && (
                <div className="flex flex-col gap-4">
                  {SOAP_NOTES.map((note, i) => (
                    <GlassCard key={i} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="badge badge-blue text-xs">{note.type}</span>
                          <span className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{note.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={11} />
                          <span className="text-xs">{note.date} at {note.time}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'S — Subjective', content: note.subjective },
                          { label: 'O — Objective',  content: note.objective  },
                          { label: 'A — Assessment', content: note.assessment },
                          { label: 'P — Plan',       content: note.plan       },
                        ].map(s => (
                          <div key={s.label} className="p-3 rounded-lg selectable" style={{ background: 'rgba(10,22,48,0.5)', border: '1px solid rgba(56,189,248,0.06)' }}>
                            <div className="text-[10px] font-700 mb-1.5" style={{ color: '#38bdf8' }}>{s.label}</div>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.content}</p>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {activeTab === 'Vitals' && (
                <GlassCard className="p-4">
                  <h3 className="text-xs font-700 uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Vitals Timeline (Today)</h3>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {['Time', 'BP (Systolic)', 'BP (Diastolic)', 'Heart Rate', 'SpO₂', 'Temp'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {VITALS_TREND.map(v => (
                          <tr key={v.time}>
                            <td className="font-600 text-xs" style={{ color: 'var(--text-primary)' }}>{v.time}</td>
                            <td style={{ color: v.bp_s > 140 ? '#f87171' : '#34d399' }}>{v.bp_s} mmHg</td>
                            <td style={{ color: v.bp_d > 90 ? '#f87171' : '#34d399' }}>{v.bp_d} mmHg</td>
                            <td>{v.hr} bpm</td>
                            <td style={{ color: v.spo2 < 95 ? '#f87171' : '#34d399' }}>{v.spo2}%</td>
                            <td style={{ color: v.temp > 37.5 ? '#fbbf24' : 'var(--text-secondary)' }}>{v.temp}°C</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}

              {activeTab === 'Labs' && (
                <GlassCard className="p-4">
                  <h3 className="text-xs font-700 uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Laboratory Results</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {['Test', 'Result', 'Reference Range', 'Flag', 'Date/Time'].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {LABS.map(l => (
                        <tr key={l.name}>
                          <td className="font-600" style={{ color: 'var(--text-primary)' }}>{l.name}</td>
                          <td style={{ color: flagColor(l.flag), fontWeight: 600 }}>{l.val}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{l.ref}</td>
                          <td>
                            {l.flag !== 'normal' && (
                              <span className="badge text-[10px]" style={{ background: flagBg(l.flag), color: flagColor(l.flag), border: `1px solid ${flagColor(l.flag)}40` }}>
                                {l.flag.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{l.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </GlassCard>
              )}

              {activeTab === 'Medications' && (
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-700 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Medication Administration Record</h3>
                    <button className="btn btn-primary btn-sm gap-1.5 text-xs"><Plus size={12} />Add Medication</button>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {['Medication', 'Dose', 'Frequency', 'Route', 'Start Date', 'Status'].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MEDICATIONS.map(m => (
                        <tr key={m.name} style={{ opacity: m.status === 'discontinued' ? 0.5 : 1 }}>
                          <td className="font-600" style={{ color: 'var(--text-primary)' }}>
                            <div className="flex items-center gap-2">
                              <Pill size={13} style={{ color: '#a78bfa' }} />
                              {m.name}
                            </div>
                          </td>
                          <td className="font-600" style={{ color: '#38bdf8' }}>{m.dose}</td>
                          <td>{m.freq}</td>
                          <td><span className="badge badge-gray text-[10px]">{m.route}</span></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{m.start}</td>
                          <td>
                            <span className={`badge text-[10px] ${m.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </GlassCard>
              )}

              {activeTab === 'Problem List' && (
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-700 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Problem List (ICD-10)</h3>
                    <button className="btn btn-primary btn-sm gap-1.5 text-xs"><Plus size={12} />Add Diagnosis</button>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {['Diagnosis', 'ICD-10', 'Onset', 'Status'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {PROBLEMS.map(p => (
                        <tr key={p.icd}>
                          <td className="font-600" style={{ color: 'var(--text-primary)' }}>{p.dx}</td>
                          <td><span className="badge badge-gray text-[10px]">{p.icd}</span></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.onset}</td>
                          <td>
                            <span className={`badge text-[10px] ${p.status === 'active' ? 'badge-red' : 'badge-blue'}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </GlassCard>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
