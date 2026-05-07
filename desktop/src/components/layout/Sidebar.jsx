import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, AlertTriangle, Activity, Scissors, Users2, BedDouble,
  UserCircle, ClipboardList, CalendarDays, FlaskConical, ScanLine, Droplets,
  Pill, ShoppingCart, TruckIcon, Receipt, BarChart3, UserCog, Settings,
  ShieldCheck, HeartPulse, Cross, Stethoscope, Building2,
} from 'lucide-react'
import { HOSPITAL_NAME, HOSPITAL_SHORT } from '../../constants'

export default function Sidebar() {
  const location = useLocation()
  const { t } = useTranslation()

  const NAV = [
    {
      group: t('nav.overview'),
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), badge: null },
      ],
    },
    {
      group: t('nav.clinical'),
      items: [
        { to: '/emergency',    icon: AlertTriangle, label: t('nav.emergency'),   badge: '7',  badgeVariant: 'red'    },
        { to: '/icu',          icon: Activity,      label: t('nav.icu'),          badge: '12'                         },
        { to: '/surgery',      icon: Scissors,      label: t('nav.surgery'),      badge: null                         },
        { to: '/outpatient',   icon: Stethoscope,   label: t('nav.outpatient'),   badge: null                         },
        { to: '/ward',         icon: BedDouble,     label: t('nav.ward'),         badge: null                         },
      ],
    },
    {
      group: t('nav.patients_group'),
      items: [
        { to: '/patients',     icon: UserCircle,    label: t('nav.patients'),     badge: null },
        { to: '/emr',          icon: ClipboardList, label: t('nav.emr'),          badge: null },
        { to: '/appointments', icon: CalendarDays,  label: t('nav.appointments'), badge: '24', badgeVariant: 'gold' },
      ],
    },
    {
      group: t('nav.diagnostics'),
      items: [
        { to: '/lab',          icon: FlaskConical,  label: t('nav.lab'),          badge: '5', badgeVariant: 'orange' },
        { to: '/radiology',    icon: ScanLine,      label: t('nav.radiology'),    badge: null },
        { to: '/bloodbank',    icon: Droplets,      label: t('nav.bloodbank'),    badge: null },
      ],
    },
    {
      group: t('nav.pharmacy_group'),
      items: [
        { to: '/pharmacy',              icon: Pill,          label: t('nav.pharmacy'),    badge: null },
        { to: '/pharmacy/inventory',    icon: ShoppingCart,  label: t('nav.inventory'),   badge: null },
        { to: '/pharmacy/procurement',  icon: TruckIcon,     label: t('nav.procurement'), badge: null },
      ],
    },
    {
      group: t('nav.finance'),
      items: [
        { to: '/billing',      icon: Receipt,       label: t('nav.billing'),      badge: null },
      ],
    },
    {
      group: t('nav.administration'),
      items: [
        { to: '/staff',        icon: UserCog,       label: t('nav.staff'),        badge: null },
        { to: '/quality',      icon: ShieldCheck,   label: t('nav.quality'),      badge: null },
      ],
    },
    {
      group: t('nav.analytics_group'),
      items: [
        { to: '/analytics',    icon: BarChart3,     label: t('nav.analytics'),    badge: null },
      ],
    },
    {
      group: t('nav.system'),
      items: [
        { to: '/settings',     icon: Settings,      label: t('nav.settings'),     badge: null },
      ],
    },
  ]

  const BADGE_COLORS = {
    red:    { bg: 'rgba(239,68,68,0.2)',   color: '#f87171' },
    orange: { bg: 'rgba(249,115,22,0.2)', color: '#fb923c' },
    gold:   { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
    blue:   { bg: 'rgba(14,165,233,0.2)', color: '#38bdf8' },
    default:{ bg: 'rgba(56,189,248,0.12)', color: '#67a0c0' },
  }

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              boxShadow: '0 0 16px rgba(14,165,233,0.4)',
            }}
          >
            <Cross size={18} color="white" />
          </div>
          <div>
            <div className="font-800 text-sm leading-tight" style={{ color: '#e2f0ff' }}>
              MediCare <span className="gradient-text-gold">Pro</span>
            </div>
            <div className="text-[10px] font-500 tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
              DUBAI HOSPITAL SYSTEM
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((group) => (
          <div key={group.group}>
            <div className="nav-group-label">{group.group}</div>
            {group.items.map((item, idx) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
              const bc = BADGE_COLORS[item.badgeVariant] || BADGE_COLORS.default

              return (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                >
                  <NavLink to={item.to} className={`nav-item ${isActive ? 'active' : ''}`}>
                    <item.icon
                      size={15}
                      className="nav-icon flex-shrink-0"
                      style={{ color: isActive ? '#38bdf8' : 'var(--text-muted)' }}
                    />
                    <span className="flex-1 truncate text-[13px]">{item.label}</span>
                    {item.badge && (
                      <span
                        className="nav-badge"
                        style={{ background: bc.bg, color: bc.color }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </motion.div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: 'rgba(56,189,248,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center flex-shrink-0">
            <Building2 size={12} color="white" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-600 truncate" style={{ color: 'var(--text-secondary)' }}>
              {HOSPITAL_SHORT} — Dubai
            </div>
            <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>v2.0 Enterprise</div>
          </div>
          <div className="ms-auto">
            <span className="pulse-dot" style={{ background: '#10b981', color: '#10b981' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
