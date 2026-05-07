import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart, Plus, Search, Filter, Download, AlertTriangle,
  CheckCircle, Clock, TrendingDown, Package, Truck, FileText,
  ChevronRight, DollarSign, BarChart2, RefreshCw,
} from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import Badge from '../../components/ui/Badge'

const PURCHASE_ORDERS = [
  { id: 'PO-7801', supplier: 'Gulf Pharma Dist.',   items: 12, value: 42500, currency: 'AED', status: 'delivered',   ordered: '2026-05-01', eta: '2026-05-07', dr: 'Pharmacy Dept.' },
  { id: 'PO-7802', supplier: 'MedEx Arabia',         items: 8,  value: 18750, currency: 'AED', status: 'in_transit',  ordered: '2026-05-03', eta: '2026-05-09', dr: 'Lab Dept.'      },
  { id: 'PO-7803', supplier: 'Al Hayat Pharmaceuticals', items: 5, value: 91200, currency: 'AED', status: 'approved', ordered: '2026-05-05', eta: '2026-05-12', dr: 'Pharmacy Dept.' },
  { id: 'PO-7804', supplier: 'DubaiMed Supplies',    items: 20, value: 7340,  currency: 'AED', status: 'pending',    ordered: '2026-05-07', eta: '2026-05-14', dr: 'Nursing Dept.' },
  { id: 'PO-7805', supplier: 'EuroMed FZCO',         items: 3,  value: 156000,currency: 'AED', status: 'pending',    ordered: '2026-05-07', eta: '2026-05-18', dr: 'Radiology Dept.'},
]

const SUPPLIERS = [
  { name: 'Gulf Pharma Dist.',         category: 'Pharmaceuticals',   rating: 4.8, lead: '6 days', ytd: '1.24M AED', status: 'preferred', contact: 'Ahmed Nasser' },
  { name: 'MedEx Arabia',              category: 'Lab Reagents',       rating: 4.6, lead: '5 days', ytd: '480K AED',  status: 'approved',  contact: 'Sara Williams' },
  { name: 'Al Hayat Pharmaceuticals',  category: 'Vaccines & Biologics',rating:4.9, lead: '10 days',ytd: '3.1M AED', status: 'preferred', contact: 'Khalid Al Ali' },
  { name: 'DubaiMed Supplies',         category: 'Consumables',        rating: 4.4, lead: '3 days', ytd: '220K AED',  status: 'approved',  contact: 'Maria Santos'  },
  { name: 'EuroMed FZCO',             category: 'Medical Equipment',  rating: 4.7, lead: '14 days',ytd: '890K AED',  status: 'approved',  contact: 'Klaus Fischer'  },
]

const LOW_STOCK = [
  { name: 'Epinephrine 1mg/mL',  current: 3,  min: 20, unit: 'vials',  category: 'Emergency',    urgency: 'critical' },
  { name: 'Norepinephrine 4mg',  current: 8,  min: 15, unit: 'ampoules',category: 'ICU',          urgency: 'critical' },
  { name: 'Cefazolin 1g',        current: 24, min: 50, unit: 'vials',  category: 'Antibiotic',   urgency: 'high'     },
  { name: 'Heparin 5000 U/mL',  current: 18, min: 40, unit: 'vials',  category: 'Anticoagulant',urgency: 'high'     },
  { name: 'Midazolam 5mg/mL',   current: 12, min: 25, unit: 'ampoules',category: 'Anaesthesia',  urgency: 'medium'   },
  { name: 'Vancomycin 500mg',    current: 30, min: 60, unit: 'vials',  category: 'Antibiotic',   urgency: 'medium'   },
]

const statusConfig = {
  delivered:  { badge: 'badge-green',  label: 'Delivered',   icon: CheckCircle },
  in_transit: { badge: 'badge-blue',   label: 'In Transit',  icon: Truck       },
  approved:   { badge: 'badge-purple', label: 'Approved',    icon: CheckCircle },
  pending:    { badge: 'badge-gold',   label: 'Pending',     icon: Clock       },
}

const urgencyColor = { critical: '#ef4444', high: '#f97316', medium: '#fbbf24' }

export default function ProcurementScreen() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('orders')

  const totalPending = PURCHASE_ORDERS.filter(p => p.status === 'pending').length
  const totalValue   = PURCHASE_ORDERS.reduce((a, b) => a + b.value, 0)
  const lowStockCount= LOW_STOCK.filter(l => l.urgency === 'critical').length

  return (
    <div className="page-content h-full flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShoppingCart size={22} style={{ color: '#10b981' }} />
            Procurement & Purchase Orders
          </h1>
          <p className="page-subtitle">Purchase Orders · Suppliers · Stock Replenishment</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm gap-1.5 text-xs"><Download size={12} />Export</button>
          <button className="btn btn-primary btn-sm gap-1.5 text-xs"><Plus size={13} />New PO</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 flex-shrink-0">
        {[
          { label: 'Active Orders',    value: PURCHASE_ORDERS.length, color: '#0ea5e9',  sub: `${totalPending} pending approval` },
          { label: 'Total PO Value',   value: `${(totalValue/1000).toFixed(0)}K AED`, color: '#10b981', sub: 'This month' },
          { label: 'Critical Stock',   value: lowStockCount, color: '#ef4444', sub: 'Items below minimum' },
          { label: 'Active Suppliers', value: SUPPLIERS.length, color: '#8b5cf6', sub: `${SUPPLIERS.filter(s=>s.status==='preferred').length} preferred` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard className="p-4">
              <div className="text-xs font-600 mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              <div className="text-2xl font-800 mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-shrink-0" style={{ borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
        {['orders', 'low_stock', 'suppliers'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-xs font-600 capitalize transition-all"
            style={{
              color: activeTab === tab ? '#10b981' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid #10b981' : '2px solid transparent',
              marginBottom: -1,
            }}
          >{tab.replace('_', ' ')}</button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Purchase Orders</h3>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input className="input pl-7 text-xs py-1.5" style={{ width: 200 }} placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  {['PO Number', 'Supplier', 'Items', 'Value', 'Ordered', 'ETA', 'Status'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {PURCHASE_ORDERS.filter(p => !search || p.id.includes(search) || p.supplier.toLowerCase().includes(search.toLowerCase())).map(po => {
                  const cfg = statusConfig[po.status]
                  return (
                    <tr key={po.id}>
                      <td className="font-700 text-xs" style={{ color: '#38bdf8' }}>{po.id}</td>
                      <td>
                        <div className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{po.supplier}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{po.dr}</div>
                      </td>
                      <td className="text-xs text-center font-600" style={{ color: 'var(--text-primary)' }}>{po.items}</td>
                      <td className="font-700 text-sm" style={{ color: '#10b981' }}>{po.value.toLocaleString()} {po.currency}</td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{po.ordered}</td>
                      <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{po.eta}</td>
                      <td>
                        <span className={`badge text-[10px] ${cfg.badge}`}>{cfg.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'low_stock' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Low Stock Alerts</h3>
              <button className="btn btn-danger btn-sm gap-1.5 text-xs"><RefreshCw size={12} />Auto-Reorder</button>
            </div>
            <div className="flex flex-col gap-3">
              {LOW_STOCK.map((item, i) => {
                const pct = Math.round((item.current / item.min) * 100)
                const color = urgencyColor[item.urgency]
                return (
                  <motion.div key={item.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-3 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}25`, borderLeft: `3px solid ${color}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs font-700" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-900" style={{ color }}>{item.current}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>of {item.min} min {item.unit}</div>
                      </div>
                    </div>
                    <div className="severity-bar mb-1">
                      <div className="severity-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="badge text-[10px]" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{item.urgency}</span>
                      <button className="btn btn-ghost btn-sm text-[10px] py-0.5 px-2 gap-1"><Plus size={9} />Reorder</button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {activeTab === 'suppliers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Supplier Directory</h3>
              <button className="btn btn-primary btn-sm gap-1.5 text-xs"><Plus size={12} />Add Supplier</button>
            </div>
            <div className="flex flex-col gap-3">
              {SUPPLIERS.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl" style={{ background: 'rgba(10,22,48,0.6)', border: '1px solid rgba(56,189,248,0.08)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-700" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                        <span className={`badge text-[9px] ${s.status === 'preferred' ? 'badge-gold' : 'badge-green'}`}>{s.status}</span>
                      </div>
                      <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{s.category} · Contact: {s.contact}</div>
                      <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span>Lead time: {s.lead}</span>
                        <span>YTD: {s.ytd}</span>
                        <span>Rating: {'★'.repeat(Math.round(s.rating))} {s.rating}</span>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm text-xs">View</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
