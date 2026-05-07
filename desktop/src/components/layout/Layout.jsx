import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-gradient-main overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        {/* z-index 40 ensures TopBar dropdowns float above main content */}
        <div style={{ position: 'relative', zIndex: 40, flexShrink: 0 }}>
          <TopBar />
        </div>
        <main className="flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
