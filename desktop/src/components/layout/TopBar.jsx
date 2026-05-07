import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Search, User, LogOut, Wifi, WifiOff, Settings,
  Minus, Maximize2, X, ChevronDown, AlertCircle, CheckCircle, Info, Languages,
} from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { setLanguage } from '../../i18n'
import useAuthStore from '../../store/auth.store'

const MOCK_ALERTS = [
  { id: 1, type: 'critical', message: 'ICU Bed 3: Critical O2 sat 84%', time: '2m ago', read: false },
  { id: 2, type: 'warning',  message: 'Lab: Glucose critical — Patient MR-1042', time: '8m ago', read: false },
  { id: 3, type: 'info',     message: 'Dr. Khalid consultation request pending', time: '15m ago', read: false },
  { id: 4, type: 'warning',  message: 'Pharmacy: Metformin stock below 20 units', time: '22m ago', read: true },
  { id: 5, type: 'success',  message: 'Surgery OT-2 completed successfully', time: '1h ago', read: true },
]

const ALERT_ICONS = {
  critical: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  warning:  { icon: AlertCircle, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  info:     { icon: Info,        color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  success:  { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
}

function WindowControls() {
  const isElectron = !!window.electronAPI

  if (!isElectron) return null

  return (
    <div className="flex items-center gap-1.5 mr-2" style={{ WebkitAppRegion: 'no-drag' }}>
      <button className="win-ctrl win-ctrl-min" onClick={() => window.electronAPI.minimize()}>
        <Minus size={10} />
      </button>
      <button className="win-ctrl win-ctrl-max" onClick={() => window.electronAPI.maximize()}>
        <Maximize2 size={9} />
      </button>
      <button className="win-ctrl win-ctrl-cls" onClick={() => window.electronAPI.close()}>
        <X size={10} />
      </button>
    </div>
  )
}

export default function TopBar({ onSearchFocus }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [now, setNow] = useState(new Date())
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const unread = MOCK_ALERTS.filter(a => !a.read).length
  const isArabic = i18n.language === 'ar'

  const toggleLanguage = () => setLanguage(isArabic ? 'en' : 'ar')

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    const onOnline  = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { clearInterval(t); window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="topbar">
      {/* Window controls (Electron only) */}
      <WindowControls />

      {/* Search */}
      <div className="topbar-actions flex-1 max-w-xs">
        <div className="relative">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input ps-9 h-8 text-xs"
            placeholder={t('topbar.search_placeholder')}
            onFocus={onSearchFocus}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* DateTime */}
      <div className="topbar-actions text-right mr-2">
        <div className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>
          {format(now, 'HH:mm:ss')}
        </div>
        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {format(now, 'EEE, dd MMM yyyy')}
        </div>
      </div>

      {/* Connection */}
      <div className="topbar-actions">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
          style={{ background: online ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: online ? '#34d399' : '#f87171' }}
        >
          {online ? <Wifi size={11} /> : <WifiOff size={11} />}
          {online ? 'Live' : 'Offline'}
        </div>
      </div>

      {/* Language Toggle */}
      <div className="topbar-actions">
        <button
          onClick={toggleLanguage}
          title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-600 transition-all"
          style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', color: 'var(--text-secondary)' }}
        >
          <Languages size={13} />
          {isArabic ? 'EN' : 'عر'}
        </button>
      </div>

      {/* Notifications */}
      <div className="topbar-actions relative">
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: alertsOpen ? 'rgba(14,165,233,0.15)' : 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.12)' }}
          onClick={() => { setAlertsOpen(o => !o); setUserMenuOpen(false) }}
        >
          <Bell size={15} style={{ color: alertsOpen ? '#38bdf8' : 'var(--text-secondary)' }} />
          {unread > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-700 flex items-center justify-center"
              style={{ background: '#ef4444', color: 'white' }}
            >
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {alertsOpen && (
            <motion.div
              className="absolute right-0 top-11 w-80 glass-card overflow-hidden z-50"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(56,189,248,0.1)' }}>
                <span className="text-sm font-600">{t('topbar.notifications')}</span>
                <span className="badge badge-red text-[10px]">{unread} unread</span>
              </div>
              <div className="divide-y" style={{ divideColor: 'rgba(56,189,248,0.05)' }}>
                {MOCK_ALERTS.map(alert => {
                  const cfg = ALERT_ICONS[alert.type]
                  return (
                    <div
                      key={alert.id}
                      className="p-3 flex items-start gap-3 cursor-pointer transition-colors"
                      style={{ background: alert.read ? 'transparent' : 'rgba(14,165,233,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = alert.read ? 'transparent' : 'rgba(14,165,233,0.03)'}
                    >
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: cfg.bg }}>
                        <cfg.icon size={13} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-snug" style={{ color: alert.read ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                          {alert.message}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{alert.time}</p>
                      </div>
                      {!alert.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="p-2 border-t text-center" style={{ borderColor: 'rgba(56,189,248,0.08)' }}>
                <button className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-500">
                  View All Alerts
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Menu */}
      <div className="topbar-actions relative">
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: userMenuOpen ? 'rgba(14,165,233,0.12)' : 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.12)' }}
          onClick={() => { setUserMenuOpen(o => !o); setAlertsOpen(false) }}
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center flex-shrink-0">
            <User size={12} color="white" />
          </div>
          <div className="text-left">
            <div className="text-xs font-600 leading-tight" style={{ color: 'var(--text-primary)' }}>
              {user?.name || 'Dr. Admin'}
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              {user?.role || 'Administrator'}
            </div>
          </div>
          <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} />
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              className="absolute right-0 top-11 w-52 glass-card overflow-hidden z-50"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 border-b" style={{ borderColor: 'rgba(56,189,248,0.1)' }}>
                <p className="text-sm font-600 text-white">{user?.name || 'Dr. Admin'}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email || 'admin@dpmc.ae'}</p>
              </div>
              {[
                { icon: User, label: t('topbar.profile') },
                { icon: Settings, label: t('nav.settings') },
              ].map(item => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-500 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.07)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <item.icon size={13} /> {item.label}
                </button>
              ))}
              <div className="border-t" style={{ borderColor: 'rgba(56,189,248,0.08)' }}>
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-500 transition-colors text-red-400 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut size={13} /> {t('topbar.logout')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

