import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  FileText,
  Menu,
  Play,
  X,
  Zap,
  Check,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Capabilities', href: '#capabilities', isRoute: false },
  { label: 'Workflow', href: '#workflow', isRoute: false },
  { label: 'Pricing', href: '#pricing', isRoute: false },
  { label: 'API Tester', href: '/test', isRoute: true },
] as const;

const TECH_SPECS = [
  { label: 'Polling Cadence', value: '60s synthetic intervals' },
  { label: 'HTTP Methods', value: 'GET · POST · PUT · DELETE · PATCH · HEAD' },
  { label: 'TLS Verification', value: 'Deterministic SSL expiry tracking' },
  { label: 'Alert Routing', value: 'Email · Slack · Discord · Webhooks' },
] as const;

const CAPABILITIES = [
  {
    icon: Activity,
    title: 'Synthetic Endpoint Monitors',
    description:
      'Schedule HTTP checks down to 60 seconds with custom headers, request payloads, pause controls, and SSL status tracking.',
    routeTag: '/monitors',
    accentClass: 'text-[#8B5CF6]',
  },
  {
    icon: Play,
    title: 'On-Demand API Test Runner',
    description:
      'Trigger immediate endpoint probes without waiting for the next polling tick and inspect status codes and response latency.',
    routeTag: '/test',
    accentClass: 'text-[#06B6D4]',
  },
  {
    icon: AlertTriangle,
    title: 'Incident Lifecycle Triage',
    description:
      'Separate ongoing outages from resolved incidents with failure durations, severity tags, and root-cause summaries.',
    routeTag: '/incidents',
    accentClass: 'text-[#F59E0B]',
  },
  {
    icon: FileText,
    title: 'Granular Execution Logs',
    description:
      'Filter check history by HTTP status, execution timestamp, response latency, and failure traces to pinpoint regressions.',
    routeTag: '/logs',
    accentClass: 'text-[#22C55E]',
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: '1',
    title: 'Define the target endpoint',
    description:
      'Set the endpoint URL, HTTP method, custom headers, request body, and 60-second check interval inside a project workspace.',
  },
  {
    step: '2',
    title: 'Verify immediately on demand',
    description:
      'Fire a live check from the API tester or monitor card to confirm 2xx health, TLS validity, and baseline response latency.',
  },
  {
    step: '3',
    title: 'Triage incidents with log context',
    description:
      'Correlate latency spikes, status code drops, and alert dispatches in one timeline the moment an endpoint degrades.',
  },
] as const;

const FREE_FEATURES = [
  '1 project workspace',
  '60s synthetic HTTP checks',
  'SSL validity & latency curves',
  'Execution logs & email alerts',
] as const;

const PRO_FEATURES = [
  'Unlimited project workspaces',
  'All 6 HTTP methods & custom payloads',
  'Email, Slack, Discord & webhook alerts',
  'Multi-project incident & log triage',
] as const;

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleAnchorClick = (href: string) => {
    setMobileMenuOpen(false);
    const id = href.replace('#', '');
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id="top"
      className="min-h-screen bg-[#0C0D0F] text-[#F3F4F6] selection:bg-[#8B5CF6] selection:text-white font-sans antialiased overflow-x-clip relative"
    >
      {/* ── Sticky Navigation ── */}
      <header className="sticky top-0 z-50 bg-[#0C0D0F]/90 backdrop-blur-md border-b border-[#2A2F3A]">
        <nav
          aria-label="Primary navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4"
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2.5 min-h-[44px] pr-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D0F] group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 ">
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#F3F4F6]">
              API Monitor
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#9CA3AF]">
            {NAV_LINKS.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="py-2 hover:text-[#F3F4F6] transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick(item.href);
                  }}
                  className="py-2 hover:text-[#F3F4F6] transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                >
                  {item.label}
                </a>
              )
            )}
          </div>

          {/* Desktop Auth Actions + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-3.5 text-sm font-medium text-[#D1D5DB] hover:text-white rounded-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
            >
              Sign In
            </Link>

            <Link
              to="/signup?plan=free"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-[10px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D0F]"
            >
              <span>Get Started</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-[10px] border border-[#2A2F3A] bg-[#111318] text-[#F3F4F6] hover:bg-[#1A1F28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
            >
              {mobileMenuOpen ? (
                <X size={18} aria-hidden="true" />
              ) : (
                <Menu size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="md:hidden border-t border-[#2A2F3A] bg-[#111318] px-4 py-4 space-y-2"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((item) =>
                item.isRoute ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] px-3 rounded-[10px] flex items-center justify-between text-sm font-medium text-[#D1D5DB] hover:bg-[#1A1F28] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={14} className="text-[#9CA3AF]" aria-hidden="true" />
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleAnchorClick(item.href);
                    }}
                    className="min-h-[44px] px-3 rounded-[10px] flex items-center text-sm font-medium text-[#D1D5DB] hover:bg-[#1A1F28] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                  >
                    {item.label}
                  </a>
                )
              )}
            </div>

            <div className="pt-3 border-t border-[#2A2F3A] grid grid-cols-2 gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] inline-flex items-center justify-center rounded-[10px] border border-[#2A2F3A] bg-[#1A1F28] text-sm font-medium text-[#F3F4F6] hover:bg-[#202633] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
              >
                Sign In
              </Link>
              <Link
                to="/signup?plan=free"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[#7C3AED] hover:bg-[#6D28D9] text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
              >
                <span>Get Started</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero Section ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-14 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.03em] text-[#F3F4F6] leading-[1.06] text-balance">
                Keep Your APIs{' '}
                <span className="text-[#8B5CF6]">Online,</span> Always.
              </h1>

              <p className="text-base sm:text-lg text-[#9CA3AF] max-w-[54ch] leading-relaxed">
                Run 60-second synthetic HTTP checks, verify SSL expiry, inspect response latency curves, and trace failing payloads in one telemetry workspace.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => navigate('/signup?plan=free')}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-[10px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm sm:text-base shadow-[0_6px_18px_rgba(0,0,0,0.45)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D0F]"
                >
                  <span>Start Monitoring Free</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>

               
              </div>
            </div>

            {/* Right Column: Illustrative Telemetry Preview (flat single-container surface, decorative) */}
            <div className="lg:col-span-6" aria-hidden="true">
              <div className="rounded-2xl bg-[#111318] border border-[#2A2F3A] shadow-[0_20px_50px_rgba(0,0,0,0.55)] overflow-hidden select-none">
                {/* Frame Header */}
                <div className="px-4 sm:px-5 py-3.5 bg-[#151922] border-b border-[#2A2F3A] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded-[6px] bg-[rgba(6,182,212,0.14)] text-[#06B6D4] font-mono text-xs font-semibold">
                      GET
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-[#F3F4F6] truncate">
                      /v1/payments/authorize
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(34,197,94,0.12)] text-[#22C55E] text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span>200 OK · Sample</span>
                  </span>
                </div>

                {/* Hairline-divided KPI Strip (no nested cards) */}
                <div className="grid grid-cols-3 divide-x divide-[#2A2F3A] border-b border-[#2A2F3A]">
                  <div className="px-4 py-3.5">
                    <div className="text-xs text-[#9CA3AF]">Uptime (30d)</div>
                    <div className="mt-1 text-lg sm:text-xl font-bold text-[#F3F4F6] tabular-nums">
                      99.98%
                    </div>
                  </div>
                  <div className="px-4 py-3.5">
                    <div className="text-xs text-[#9CA3AF]">p95 Latency</div>
                    <div className="mt-1 text-lg sm:text-xl font-bold text-[#F3F4F6] tabular-nums">
                      213 ms
                    </div>
                  </div>
                  <div className="px-4 py-3.5">
                    <div className="text-xs text-[#9CA3AF]">SSL Certificate</div>
                    <div className="mt-1 text-lg sm:text-xl font-bold text-[#22C55E] tabular-nums">
                      Valid (142d)
                    </div>
                  </div>
                </div>

                {/* Latency Curve Canvas */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F3F4F6]">Response Latency</span>
                    <span className="font-mono text-[#9CA3AF] tabular-nums">
                      60s polling · TLS verified
                    </span>
                  </div>

                  <div className="flex items-stretch gap-3">
                    <div className="flex flex-col justify-between text-[11px] text-[#9CA3AF] font-mono tabular-nums text-right shrink-0 py-0.5">
                      <span>600ms</span>
                      <span>300ms</span>
                      <span>0ms</span>
                    </div>

                    <div className="relative flex-1 min-w-0">
                      <div className="absolute top-0 left-[68%] -translate-x-1/2 px-2 py-0.5 rounded-[6px] bg-[#1A1F28] border border-[#8B5CF6]/60 text-[11px] font-mono font-semibold text-[#F3F4F6] shadow-[0_4px_12px_rgba(0,0,0,0.45)] tabular-nums">
                        213 ms
                      </div>

                      <svg viewBox="0 0 320 96" className="w-full h-24 overflow-visible">
                        <defs>
                          <linearGradient id="latencyAreaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        <line x1="0" y1="22" x2="320" y2="22" stroke="#2A2F3A" strokeDasharray="3 3" />
                        <line x1="0" y1="54" x2="320" y2="54" stroke="#2A2F3A" strokeDasharray="3 3" />
                        <line x1="0" y1="86" x2="320" y2="86" stroke="#2A2F3A" />

                        <path
                          d="M 0 68 Q 20 62, 40 64 T 80 60 T 120 62 T 160 54 T 200 63 T 220 34 T 260 62 T 300 59 T 320 63 L 320 86 L 0 86 Z"
                          fill="url(#latencyAreaFill)"
                        />

                        <path
                          d="M 0 68 Q 20 62, 40 64 T 80 60 T 120 62 T 160 54 T 200 63 T 220 34 T 260 62 T 300 59 T 320 63"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="2.2"
                        />

                        <path
                          d="M 0 74 Q 40 72, 80 71 T 160 69 T 240 73 T 320 70"
                          fill="none"
                          stroke="#06B6D4"
                          strokeOpacity="0.65"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />

                        <circle cx="220" cy="34" r="4.5" fill="#F3F4F6" stroke="#8B5CF6" strokeWidth="2.5" />
                      </svg>

                      <div className="flex justify-between text-[11px] text-[#9CA3AF] font-mono tabular-nums mt-1">
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Execution Trace Strip */}
                <div className="px-4 sm:px-5 py-3 bg-[#0C0D0F]/60 border-t border-[#2A2F3A] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#9CA3AF]">
                  <span>POST /v1/webhooks/stripe · 200 OK</span>
                  <span className="text-[#06B6D4] tabular-nums">148 ms · 60s check</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specification Strip (semantic dl, no skipped headings) */}
          <dl className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#2A2F3A] border-y border-[#2A2F3A]">
            {TECH_SPECS.map((spec) => (
              <div key={spec.label} className="py-5 sm:px-6 first:sm:pl-0 last:sm:pr-0">
                <dt className="text-xs font-medium text-[#9CA3AF]">{spec.label}</dt>
                <dd className="mt-1.5 text-sm font-semibold text-[#F3F4F6] font-mono">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Capabilities Matrix ── */}
        <section id="capabilities" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5 space-y-5 text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.025em] text-[#F3F4F6] leading-[1.12] text-balance">
                Built for Low-Latency Incident{' '}
                <span className="text-[#8B5CF6]">Triage.</span>
              </h2>

              <p className="text-base text-[#9CA3AF] leading-relaxed max-w-[46ch]">
                Inspect synthetic uptime, execution logs, and outage root causes in one workspace without the configuration friction of enterprise APM suites.
              </p>

              <div className="pt-1">
                <Link
                  to="/test"
                  className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-[#06B6D4] hover:text-[#22D3EE] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] rounded-md"
                >
                  <span>Try the API Test Runner</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl border border-[#2A2F3A] bg-[#111318] divide-y divide-[#2A2F3A]">
              {CAPABILITIES.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={cap.title}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[#161922] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <Icon
                        size={18}
                        className={`${cap.accentClass} mt-1 shrink-0`}
                        aria-hidden="true"
                      />
                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-[#F3F4F6]">{cap.title}</h3>
                        <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-[56ch]">
                          {cap.description}
                        </p>
                      </div>
                    </div>

                    <span className="self-start shrink-0 px-2.5 py-1 rounded-[6px] bg-[#1A1F28] border border-[#2A2F3A] font-mono text-xs text-[#D1D5DB]">
                      {cap.routeTag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Verification Workflow ── */}
        <section
          id="workflow"
          className="py-16 md:py-20 border-y border-[#2A2F3A] bg-[#111318]/45"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#F3F4F6] text-balance">
                From Endpoint URL to Root Cause in Under a Minute.
              </h2>
              <p className="text-base text-[#9CA3AF] leading-relaxed">
                Every workflow in API Monitor connects monitoring setup directly to live verification and structured execution logs.
              </p>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {WORKFLOW_STEPS.map((item) => (
                <li
                  key={item.step}
                  className="pt-5 border-t border-[#2A2F3A] space-y-2.5 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#06B6D4] tabular-nums">
                      {item.step.padStart(2, '0')}
                    </span>
                    <h3 className="text-base font-bold text-[#F3F4F6]">{item.title}</h3>
                  </div>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed text-pretty">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Pricing Section ── */}
        <section id="pricing" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5 space-y-5 text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.025em] text-[#F3F4F6] leading-[1.12] text-balance">
                Start Free. Scale Without Bloat.
              </h2>

              <p className="text-base text-[#9CA3AF] leading-relaxed max-w-[42ch]">
                Create a workspace in seconds with no credit card required and verify live endpoints right away.
              </p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/signup?plan=free')}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-[10px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm sm:text-base shadow-[0_6px_18px_rgba(0,0,0,0.45)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D0F]"
                >
                  <span>Create Free Account</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
              {/* Pro Tier */}
              <div className="p-7 rounded-2xl bg-[#111318] border border-[#8B5CF6]/60 shadow-[0_12px_32px_rgba(0,0,0,0.45)] flex flex-col justify-between gap-8">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-2xl font-bold text-[#F3F4F6]">Pro</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[rgba(34,197,94,0.12)] text-[#22C55E] text-xs font-semibold">
                      Recommended
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-[#F3F4F6] tracking-tight tabular-nums">
                      $19
                    </span>
                    <span className="text-sm text-[#9CA3AF]">/ month</span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {PRO_FEATURES.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm text-[#D1D5DB]">
                        <Check size={15} className="text-[#8B5CF6] shrink-0" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/signup?plan=pro')}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-[10px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111318]"
                >
                  Choose Pro Plan
                </button>
              </div>

              {/* Free Tier */}
              <div className="p-7 rounded-2xl bg-[#111318] border border-[#2A2F3A] flex flex-col justify-between gap-8">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-2xl font-bold text-[#F3F4F6]">Free</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1A1F28] text-[#9CA3AF] text-xs font-medium">
                      No card required
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-[#F3F4F6] tracking-tight tabular-nums">
                      $0
                    </span>
                    <span className="text-sm text-[#9CA3AF]">/ forever</span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {FREE_FEATURES.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm text-[#D1D5DB]">
                        <Check size={15} className="text-[#06B6D4] shrink-0" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/signup?plan=free')}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-[10px] bg-[#1A1F28] hover:bg-[#202633] border border-[#2A2F3A] hover:border-[#363D4A] text-[#F3F4F6] font-semibold text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111318]"
                >
                  Start with Free
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA Banner ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="p-7 sm:p-10 rounded-2xl bg-[#111318] border border-[#2A2F3A] shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] text-balance">
                Ready to monitor your production APIs?
              </h2>
              <p className="text-sm text-[#9CA3AF] max-w-[58ch]">
                Spin up 60-second synthetic checks with deterministic SSL verification or open the standalone API tester right now.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/test"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-[10px] bg-[#1A1F28] hover:bg-[#202633] border border-[#2A2F3A] text-[#F3F4F6] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
              >
                Open API Tester
              </Link>
              <button
                type="button"
                onClick={() => navigate('/signup?plan=free')}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-[10px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-[0_6px_18px_rgba(0,0,0,0.45)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
              >
                <span>Get Started Free</span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-10 border-t border-[#2A2F3A] text-xs text-[#9CA3AF]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2.5 min-h-[44px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            <span className="w-7 h-7 rounded-[8px] bg-[#7C3AED] flex items-center justify-center">
              <Zap size={14} className="text-white fill-white" aria-hidden="true" />
            </span>
            <span className="text-base font-bold text-[#F3F4F6] tracking-tight">
              API Monitor
            </span>
          </a>

          <div className="flex flex-wrap items-center gap-6 text-sm text-[#9CA3AF]">
            {NAV_LINKS.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="py-2 hover:text-[#F3F4F6] transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorClick(item.href);
                  }}
                  className="py-2 hover:text-[#F3F4F6] transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                >
                  {item.label}
                </a>
              )
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link
              to="/login"
              className="min-h-[44px] inline-flex items-center px-3 text-[#D1D5DB] hover:text-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
            >
              Sign In
            </Link>
            <Link
              to="/signup?plan=free"
              className="min-h-[44px] inline-flex items-center px-3.5 rounded-[10px] bg-[#1A1F28] border border-[#2A2F3A] text-[#F3F4F6] hover:bg-[#202633] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-[#1D212B] text-[#9CA3AF]">
          <div>© 2026 API Monitor. Synthetic API observability.</div>
          <div className="font-mono text-xs text-[#9CA3AF]">
            5s fleet polling · 60s checks · JWT session auth
          </div>
        </div>
      </footer>
    </div>
  );
}
