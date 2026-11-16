import { useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Globe,
  RefreshCw,
  TrendingDown,
  ChevronRight,
  ShieldCheck,
  Plus,
} from 'lucide-react'
import OnboardingModal from '../components/OnboardingModal'

// ─── Mock Fleet Data ─────────────────────────────────────────────────────────

interface EndpointMonitor {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  status: 'operational' | 'degraded' | 'down'
  uptime: string
  latency: number
  p95: number
  lastChecked: string
}

const MONITORS: EndpointMonitor[] = [
  {
    id: '1',
    name: 'Production Auth API',
    url: 'https://api.webblaze.com/api/v1/auth/me',
    method: 'GET',
    status: 'operational',
    uptime: '99.99%',
    latency: 92,
    p95: 145,
    lastChecked: '12s ago',
  },
  {
    id: '2',
    name: 'Users & Team Service',
    url: 'https://api.webblaze.com/api/v1/users',
    method: 'GET',
    status: 'operational',
    uptime: '99.98%',
    latency: 114,
    p95: 182,
    lastChecked: '25s ago',
  },
  {
    id: '3',
    name: 'Projects & Tasks API',
    url: 'https://api.webblaze.com/api/v1/projects',
    method: 'POST',
    status: 'operational',
    uptime: '99.95%',
    latency: 138,
    p95: 210,
    lastChecked: '40s ago',
  },
  {
    id: '4',
    name: 'Timelogs & Analytics',
    url: 'https://api.webblaze.com/api/v1/timelogs',
    method: 'GET',
    status: 'degraded',
    uptime: '98.40%',
    latency: 485,
    p95: 690,
    lastChecked: '1m ago',
  },
  {
    id: '5',
    name: 'Stripe Payment Webhook',
    url: 'https://api.webblaze.com/api/v1/billing/webhook',
    method: 'POST',
    status: 'down',
    uptime: '94.10%',
    latency: 2450,
    p95: 3200,
    lastChecked: '18s ago',
  },
]

// ─── Dashboard Component (Pitch Black Monochrome) ────────────────────────────

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('24h')
  const [region, setRegion] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Strictly a one-time popup after user signup
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const isPending = localStorage.getItem('pendingOnboarding') === 'true';
    const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
    return isPending && !hasCompleted;
  });

  const handleDismissOnboarding = () => {
    localStorage.removeItem('pendingOnboarding');
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className="flex-1 w-full p-6 lg:p-8 space-y-6 bg-[#000000] text-neutral-100 font-sans">
      {/* ── Top Header Bar ───────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
            <span>Workspace</span>
            <ChevronRight size={12} />
            <span className="text-neutral-300 font-semibold">Production Fleet</span>
            <ChevronRight size={12} />
            <span className="text-neutral-400">Overview</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Open Status Fleet
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              All Systems Operational (99.99%)
            </span>
          </h1>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* New Project Button (Regular dashboard action, NOT the onboarding wizard) */}
          <button
            onClick={() => {
              // Regular project creation handler
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white text-xs font-semibold border border-[#2D2D2D] transition-all cursor-pointer"
          >
            <Plus size={13} />
            New Project
          </button>

          {/* Region selector */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] border border-[#222222] text-xs font-medium text-neutral-300">
            <Globe size={13} className="text-neutral-400" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent text-neutral-200 outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141414]">All Regions (Global)</option>
              <option value="us-east" className="bg-[#141414]">US East (N. Virginia)</option>
              <option value="eu-west" className="bg-[#141414]">EU West (Frankfurt)</option>
              <option value="ap-south" className="bg-[#141414]">AP South (Mumbai)</option>
            </select>
          </div>

          {/* Time range pills */}
          <div className="inline-flex rounded-lg bg-[#141414] border border-[#222222] p-0.5 text-xs">
            {['1h', '24h', '7d', '30d'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  timeRange === t
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-[#141414] border border-[#222222] text-neutral-400 hover:text-white hover:border-neutral-500 transition-all cursor-pointer"
            title="Refresh Fleet Data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-white' : ''} />
          </button>
        </div>
      </header>

      {/* ── Metric Cards Grid (Stark Monochrome) ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Uptime */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-500">Fleet Uptime</span>
            <span className="inline-flex items-center gap-1 text-[#10B981] font-semibold bg-[#10B981]/10 px-2 py-0.5 rounded-full text-[11px]">
              <ArrowUpRight size={11} />
              +0.01%
            </span>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">99.99%</div>
          <p className="text-xs text-neutral-500 mt-1">Target SLA: 99.95% (Operational)</p>
          {/* Uptime bars */}
          <div className="flex gap-0.5 mt-3 pt-3 border-t border-[#1F1F1F]">
            {Array.from({ length: 30 }).map((_, i) => (
              <span
                key={i}
                className={`flex-1 h-3 rounded-xs ${
                  i === 19 ? 'bg-[#F59E0B]' : i === 24 ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                }`}
                title={`Day ${i + 1}: ${i === 19 ? 'Degraded' : i === 24 ? 'Outage' : '100% OK'}`}
              />
            ))}
          </div>
        </div>

        {/* Card 2: Average Latency */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-500">Avg Latency</span>
            <span className="inline-flex items-center gap-1 text-white font-semibold bg-neutral-800 px-2 py-0.5 rounded-full text-[11px]">
              <TrendingDown size={11} />
              -14 ms
            </span>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">
            142 <span className="text-lg font-normal text-neutral-500">ms</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
            <span>P50: <strong className="text-white">110ms</strong></span>
            <span>P95: <strong className="text-white">240ms</strong></span>
            <span>P99: <strong className="text-white">385ms</strong></span>
          </div>
          <div className="w-full h-1 bg-[#222222] rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-white rounded-full w-[42%]" />
          </div>
        </div>

        {/* Card 3: Error Rate */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-500">Error Rate</span>
            <span className="inline-flex items-center gap-1 text-[#10B981] font-semibold bg-[#10B981]/10 px-2 py-0.5 rounded-full text-[11px]">
              0.08%
            </span>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">0.08%</div>
          <p className="text-xs text-neutral-500 mt-1">1 degraded endpoint</p>
          <div className="w-full h-1 bg-[#222222] rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-white rounded-full w-[8%]" />
          </div>
        </div>

        {/* Card 4: Total Checks */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-500">Total Pings</span>
            <span className="inline-flex items-center gap-1 text-neutral-300 font-semibold bg-neutral-800 px-2 py-0.5 rounded-full text-[11px]">
              24 Active
            </span>
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">24,680</div>
          <p className="text-xs text-neutral-500 mt-1">60s ping interval</p>
          <div className="w-full h-1 bg-[#222222] rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-white rounded-full w-[85%]" />
          </div>
        </div>
      </div>

      {/* ── Main Latency Chart (Monochrome Wireframe with Status Colors) ── */}
      <div className="p-6 rounded-xl bg-[#141414] border border-[#222222] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity size={17} className="text-neutral-400" />
              Latency Breakdown & Response Time Trend
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Average latency across all regions (DNS, Connect, TTFB, Download)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" /> DNS
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Connect
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> TTFB
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#A855F7]" /> Download
            </span>
          </div>
        </div>

        {/* Clean SVG Latency Curve */}
        <div className="w-full h-52 pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 900 200" preserveAspectRatio="none">
            {/* Subtle grid lines */}
            <line x1="0" y1="40" x2="900" y2="40" stroke="#1F1F1F" strokeDasharray="3 3" />
            <line x1="0" y1="90" x2="900" y2="90" stroke="#1F1F1F" strokeDasharray="3 3" />
            <line x1="0" y1="140" x2="900" y2="140" stroke="#1F1F1F" strokeDasharray="3 3" />
            <line x1="0" y1="190" x2="900" y2="190" stroke="#1F1F1F" />

            {/* Response Time Curve 1 (White Primary) */}
            <path
              d="M0 140 C120 160 180 60 280 100 S400 150 520 50 S680 120 780 80 S850 110 900 60"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            {/* Response Time Curve 2 (TTFB) */}
            <path
              d="M0 160 C130 170 200 100 300 120 S420 170 540 90 S700 140 800 110 S860 130 900 100"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />

            {/* Response Time Curve 3 (DNS - Green) */}
            <path
              d="M0 180 C110 185 220 170 320 175 S450 180 560 165 S720 175 820 170 S870 175 900 160"
              fill="none"
              stroke="#10B981"
              strokeWidth="1.5"
            />

            {/* Active Data point */}
            <circle cx="520" cy="50" r="4" fill="#FFFFFF" />
            <circle cx="520" cy="50" r="9" fill="#FFFFFF" opacity="0.25" className="animate-ping" />
          </svg>
        </div>

        {/* X-Axis Timestamps */}
        <div className="flex justify-between text-[11px] text-neutral-500 font-mono pt-1">
          <span>1:35 PM</span>
          <span>1:39 PM</span>
          <span>3:30 PM</span>
          <span>3:55 PM</span>
          <span>4:32 PM</span>
          <span>5:01 PM</span>
          <span>5:54 PM</span>
          <span>Now</span>
        </div>
      </div>

      {/* ── Active Monitors Fleet Table ─────────────────────────────────── */}
      <div className="p-6 rounded-xl bg-[#141414] border border-[#222222] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#10B981]" />
              Monitors Fleet
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Endpoint health, uptime SLA, and response times
            </p>
          </div>
          <button className="text-xs font-semibold text-neutral-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
            View All Monitors
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222222] text-neutral-500 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Service & Endpoint</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Latency</th>
                <th className="pb-3 font-semibold">P95</th>
                <th className="pb-3 font-semibold">Uptime</th>
                <th className="pb-3 font-semibold text-right">Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {MONITORS.map((m) => (
                <tr key={m.id} className="hover:bg-[#1A1A1A] transition-colors">
                  {/* Service name & URL */}
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-[11px] text-neutral-500 font-mono truncate max-w-xs">{m.url}</div>
                  </td>

                  {/* Method */}
                  <td className="py-3.5 pr-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1F1F1F] text-neutral-300 border border-[#2A2A2A]">
                      {m.method}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        m.status === 'operational'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : m.status === 'degraded'
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                          : 'bg-[#EF4444]/10 text-[#EF4444]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          m.status === 'operational'
                            ? 'bg-[#10B981]'
                            : m.status === 'degraded'
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#EF4444] animate-ping'
                        }`}
                      />
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </td>

                  {/* Latency */}
                  <td className="py-3.5 pr-4 font-mono font-medium text-neutral-200">
                    {m.latency}ms
                  </td>

                  {/* P95 */}
                  <td className="py-3.5 pr-4 font-mono text-neutral-400">
                    {m.p95}ms
                  </td>

                  {/* Uptime */}
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-neutral-200">{m.uptime}</div>
                  </td>

                  {/* Last Checked */}
                  <td className="py-3.5 text-right text-neutral-500 font-mono">
                    {m.lastChecked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Onboarding / Project Setup Modal (One-time post-signup popup) ── */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleDismissOnboarding}
        onComplete={(data) => {
          console.log('Project created:', data);
          handleDismissOnboarding();
        }}
      />
    </div>
  )
}
