import { useState } from 'react'
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  FileText,
  BarChart2,
  Settings,
  Plus,
  ChevronDown,
  Zap,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

type StatusKind = 'up' | 'down' | 'degraded'

interface MonitorEntry {
  id: string
  label: string
  status: StatusKind
}

interface StatusPageEntry {
  id: string
  label: string
  status: StatusKind
}

export interface SidebarProps {
  currentTab?: string
  onTabChange?: (tab: string) => void
}

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Overview',  icon: <LayoutDashboard size={15} /> },
  { id: 'monitors',  label: 'Monitors',  icon: <Activity        size={15} /> },
  { id: 'incidents', label: 'Incidents', icon: <AlertTriangle   size={15} /> },
  { id: 'logs',      label: 'Logs',      icon: <FileText        size={15} /> },
  { id: 'reports',   label: 'Reports',   icon: <BarChart2       size={15} /> },
  { id: 'settings',  label: 'Settings',  icon: <Settings        size={15} /> },
]

const STATUS_PAGES: StatusPageEntry[] = [
  { id: 'cloud', label: 'Cloud Platform Status', status: 'up' },
]

const MONITORS: MonitorEntry[] = [
  { id: 'prod',   label: 'Production API', status: 'up'       },
  { id: 'pay',    label: 'Payments API',   status: 'up'       },
  { id: 'user',   label: 'User Service',   status: 'up'       },
  { id: 'notif',  label: 'Notifications',  status: 'degraded' },
  { id: 'analyt', label: 'Analytics API',  status: 'down'     },
]

// ─── Status dot colours ───────────────────────────────────────────────────────

const DOT_COLOR: Record<StatusKind, string> = {
  up:       '#10B981',
  degraded: '#F59E0B',
  down:     '#EF4444',
}

const DOT_GLOW: Record<StatusKind, string> = {
  up:       '0 0 6px rgba(16,185,129,0.65)',
  degraded: '0 0 6px rgba(245,158,11,0.65)',
  down:     '0 0 6px rgba(239,68,68,0.65)',
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Sidebar({ currentTab = 'dashboard', onTabChange }: SidebarProps) {
  const [active, setActive] = useState(currentTab)

  function handleNav(id: string) {
    setActive(id)
    onTabChange?.(id)
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
      <WorkspaceSwitcher />

      <SectionLabel label="Workspace" />
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            isActive={active === item.id}
            onClick={() => handleNav(item.id)}
          />
        ))}
      </nav>

      <SectionLabel label="Status Pages" withAdd />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {STATUS_PAGES.map((p) => (
          <SubItem key={p.id} label={p.label} status={p.status} />
        ))}
      </div>

      <SectionLabel label="Monitors" withAdd />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {MONITORS.map((m) => (
          <SubItem key={m.id} label={m.label} status={m.status} />
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 24 }} />
    </aside>
  )
}

// ─── WorkspaceSwitcher ────────────────────────────────────────────────────────

function WorkspaceSwitcher() {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             10,
        width:           '100%',
        padding:         '14px 10px 12px',
        background:      hovered ? '#161616' : 'transparent',
        border:          'none',
        borderBottom:    '1px solid #1F1F1F',
        marginBottom:    8,
        cursor:          'pointer',
        transition:      'background 150ms ease',
        borderRadius:    0,
      }}
    >
      <span
        style={{
          width:          28,
          height:         28,
          borderRadius:   7,
          backgroundColor:'#1A1A1A',
          border:         '1px solid #2A2A2A',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          color:          '#FFFFFF',
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

      <ChevronDown size={14} color="#4A4A4A" strokeWidth={2} />
    </button>
  )
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ label, withAdd }: { label: string; withAdd?: boolean }) {
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
          color:         '#4A4A4A',
        }}
      >
        {label}
      </span>

      {withAdd && (
        <button
          onMouseEnter={() => setAddHovered(true)}
          onMouseLeave={() => setAddHovered(false)}
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           20,
            height:          20,
            borderRadius:    5,
            border:          'none',
            backgroundColor: addHovered ? '#2A2A2A' : 'transparent',
            color:           addHovered ? '#FFFFFF' : '#4A4A4A',
            cursor:          'pointer',
            transition:      'background 150ms ease, color 150ms ease',
            padding:         0,
          }}
        >
          <Plus size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

// ─── NavLink ──────────────────────────────────────────────────────────────────

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
        transition:      'background 150ms ease, color 150ms ease',
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

function SubItem({ label, status }: { label: string; status: StatusKind }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
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
        backgroundColor: hovered ? '#1A1A1A' : 'transparent',
        color:           hovered ? '#FFFFFF' : '#8A8A8A',
        fontSize:        13,
        fontWeight:      400,
        textAlign:       'left',
        transition:      'background 150ms ease, color 150ms ease',
        letterSpacing:   '-0.005em',
        fontFamily:      'inherit',
      }}
    >
      {/* Status dot */}
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
