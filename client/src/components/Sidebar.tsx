import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  FileText,
  BarChart2,
  Settings,
  Plus,
  Zap,
  LogOut,
} from 'lucide-react'
import { monitoringApi, type Monitor } from '../services/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

type StatusKind = 'up' | 'down' | 'degraded'

interface StatusPageEntry {
  id: string
  label: string
  status: StatusKind
}

export interface SidebarProps {
  currentTab?: string
  onTabChange?: (tab: string) => void
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Overview',   icon: <LayoutDashboard size={15} />, path: '/dashboard' },
  { id: 'monitors',  label: 'Monitors',   icon: <Activity        size={15} />, path: '/monitors' },
  { id: 'incidents', label: 'Incidents',  icon: <AlertTriangle   size={15} />, path: '/incidents' },
  { id: 'logs',      label: 'Logs',       icon: <FileText        size={15} />, path: '/logs' },
  { id: 'reports',   label: 'Reports',    icon: <BarChart2       size={15} />, path: '/dashboard' },
  { id: 'settings',  label: 'Settings',   icon: <Settings        size={15} />, path: '/dashboard' },
]

const STATUS_PAGES: StatusPageEntry[] = [
  { id: 'cloud', label: 'Cloud Platform Status', status: 'up' },
]

// ─── Status Colors (OpenStatus / Vercel style) ───────────────────────────────

const DOT_COLOR: Record<StatusKind, string> = {
  up:       '#10B981', // Crisp Emerald
  degraded: '#F59E0B', // Crisp Amber
  down:     '#EF4444', // Crisp Red
}

const DOT_GLOW: Record<StatusKind, string> = {
  up:       '0 0 6px rgba(16, 185, 129, 0.55)',
  degraded: '0 0 6px rgba(245, 158, 11, 0.55)',
  down:     '0 0 6px rgba(239, 68, 68, 0.55)',
}

// ─── Sidebar Component ────────────────────────────────────────────────────────

export default function Sidebar({ currentTab = 'dashboard', onTabChange }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const activeMonitorId = searchParams.get('monitorId')

  const active = location.pathname.startsWith('/monitors')
    ? 'monitors'
    : location.pathname.startsWith('/incidents')
    ? 'incidents'
    : location.pathname.startsWith('/logs')
    ? 'logs'
    : location.pathname.startsWith('/dashboard')
    ? 'dashboard'
    : currentTab
  const [liveMonitors, setLiveMonitors] = useState<Monitor[]>([])

  // Fetch real monitors from backend
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const fetchMonitors = async () => {
      try {
        const data = await monitoringApi.getMonitors()
        setLiveMonitors(data)
      } catch {
        // Ignored
      }
    }

    fetchMonitors()
    const timer = setInterval(fetchMonitors, 8000)
    return () => clearInterval(timer)
  }, [])

  function handleNav(item: NavItem) {
    onTabChange?.(item.id)
    navigate(item.path)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <aside
      style={{
        width:           240,
        height:          '100vh',
        position:        'fixed',
        top:             0,
        left:            0,
        display:         'flex',
        flexDirection:   'column',
        backgroundColor: '#0A0A0A',
        borderRight:     '1px solid #1F1F1F',
        padding:         '0 10px',
        zIndex:          50,
        overflowY:       'auto',
        overflowX:       'hidden',
        fontFamily:      "'Inter', sans-serif",
      }}
    >
      {/* ── Workspace Switcher ─────────────────────────────────────────────── */}
      <WorkspaceSwitcher />

      {/* ── Main Nav ──────────────────────────────────────────────────────── */}
      <SectionLabel label="Workspace" />
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            isActive={active === item.id}
            onClick={() => handleNav(item)}
          />
        ))}
      </nav>

      {/* ── Status Pages ──────────────────────────────────────────────────── */}
      

      {/* ── Live Backend Monitors ─────────────────────────────────────────── */}
      <SectionLabel
        label="Monitors"
        withAdd
        onAddClick={() => navigate('/monitors?action=new')}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {liveMonitors.length === 0 ? (
          <div
            onClick={() => navigate('/monitors?action=new')}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              color: '#525252',
              cursor: 'pointer',
            }}
          >
            + Add first monitor
          </div>
        ) : (
          liveMonitors.map((m) => {
            const statusKind: StatusKind =
              m.status === 'UP' ? 'up' : m.status === 'DOWN' ? 'down' : 'degraded'

            // Clean short label from URL
            let displayLabel = m.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
            if (displayLabel.length > 22) {
              displayLabel = displayLabel.slice(0, 20) + '...'
            }

            const isSelected = activeMonitorId === m.id

            return (
              <SubItem
                key={m.id}
                label={displayLabel}
                status={statusKind}
                isActive={isSelected}
                onClick={() => navigate(`/dashboard?monitorId=${m.id}`)}
              />
            )
          })
        )}
      </div>

      {/* ── Bottom spacer & Logout ─────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 24 }} />

      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '10px 12px',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          backgroundColor: 'transparent',
          color: '#737373',
          fontSize: 13,
          marginBottom: 12,
          transition: 'all 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#EF4444'
          e.currentTarget.style.backgroundColor = '#1C1111'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#737373'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <LogOut size={14} />
        <span>Sign Out</span>
      </button>
    </aside>
  )
}

// ─── Workspace Switcher ───────────────────────────────────────────────────────

function WorkspaceSwitcher() {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('/dashboard')}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             10,
        width:           '100%',
        padding:         '14px 10px 12px',
        background:      'transparent',
        border:          'none',
        borderBottom:    '1px solid #1F1F1F',
        marginBottom:    8,
        transition:      'all 150ms ease',
        cursor:          'pointer',
      }}
    >
      {/* Dark minimalist logo mark */}
      <span
        style={{
          width:           28,
          height:          28,
          borderRadius:    7,
          backgroundColor: '#1A1A1A',
          border:          '1px solid #2A2A2A',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexShrink:      0,
          color:           '#FFFFFF',
        }}
      >
        <Zap size={13} />
      </span>

      <span
        style={{
          flex:          1,
          textAlign:     'left',
          fontSize:      14,
          fontWeight:    600,
          color:         '#FFFFFF',
          letterSpacing: '-0.01em',
        }}
      >
        API Monitor
      </span>
    </div>
  )
}

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({
  label,
  withAdd,
  onAddClick,
}: {
  label: string
  withAdd?: boolean
  onAddClick?: () => void
}) {
  const [addHovered, setAddHovered] = useState(false)

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '14px 10px 5px',
      }}
    >
      <span
        style={{
          fontSize:      11,
          fontWeight:    500,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color:         '#525252',
        }}
      >
        {label}
      </span>

      {withAdd && (
        <button
          onClick={onAddClick}
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}
          title="Add Monitor"
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           20,
            height:          20,
            borderRadius:    5,
            border:          'none',
            backgroundColor: addHovered ? '#262626' : 'transparent',
            color:           addHovered ? '#FFFFFF' : '#525252',
            cursor:          'pointer',
            transition:      'all 150ms ease',
            padding:         0,
          }}
        >
          <Plus size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

// ─── Nav Link with Signature White Pill ───────────────────────────────────────

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const bg    = isActive ? '#FFFFFF' : hovered ? '#1A1A1A' : 'transparent'
  const color = isActive ? '#000000' : hovered ? '#FFFFFF' : '#8A8A8A'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             10,
        width:           '100%',
        padding:         '8px 12px',
        border:          'none',
        borderRadius:    8,
        cursor:          'pointer',
        backgroundColor: bg,
        color,
        fontWeight:      isActive ? 600 : 400,
        fontSize:        13.5,
        letterSpacing:   '-0.005em',
        textAlign:       'left',
        transition:      'all 150ms ease',
        fontFamily:      'inherit',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {item.icon}
      </span>
      {item.label}
    </button>
  )
}

// ─── SubItem ──────────────────────────────────────────────────────────────────

function SubItem({
  label,
  status,
  onClick,
  isActive = false,
}: {
  label: string
  status: StatusKind
  onClick?: () => void
  isActive?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const bg = isActive ? '#1F1F1F' : hovered ? '#1A1A1A' : 'transparent'
  const color = isActive ? '#FFFFFF' : hovered ? '#FFFFFF' : '#8A8A8A'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             9,
        width:           '100%',
        padding:         '7px 12px',
        border:          'none',
        borderRadius:    8,
        cursor:          'pointer',
        backgroundColor: bg,
        color,
        fontSize:        13,
        fontWeight:      isActive ? 600 : 400,
        textAlign:       'left',
        transition:      'all 150ms ease',
        letterSpacing:   '-0.005em',
        fontFamily:      'inherit',
      }}
    >
      <span
        style={{
          display:         'inline-block',
          width:           7,
          height:          7,
          borderRadius:    '50%',
          flexShrink:      0,
          backgroundColor: DOT_COLOR[status],
          boxShadow:       DOT_GLOW[status],
        }}
      />
      <span
        style={{
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  )
}
