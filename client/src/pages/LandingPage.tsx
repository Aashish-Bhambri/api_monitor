import { useNavigate } from 'react-router';
import {
  Zap,
  ArrowRight,
  Activity,
  Bell,
  BarChart3,
  ShieldCheck,
  Check,
  LayoutGrid,
  AlertTriangle,
  FileText,
  Settings,
  ChevronDown,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white selection:bg-purple-600 selection:text-white font-sans antialiased overflow-x-hidden relative">
      {/* ── Ambient Background Glows ── */}
      <div className="pointer-events-none absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/3" />
      <div className="pointer-events-none absolute top-[20%] right-0 w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[160px] translate-x-1/3" />
      <div className="pointer-events-none absolute top-[60%] left-[-100px] w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[150px]" />

      {/* ── 1. NAVBAR (Exact match to Image 1) ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#060608]/75 border-b border-[#1A1A22] transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_14px_rgba(147,51,234,0.45)] group-hover:scale-105 transition-transform">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">API Monitor</span>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Docs
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3.5">
            {/* Status Pill */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101015] border border-[#20202A] text-xs font-medium text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>

            {/* Sign In */}
            <button
              onClick={handleSignIn}
              className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
            >
              Sign In
            </button>

            {/* Get Started Button */}
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9333EA] hover:bg-[#8B5CF6] text-white text-sm font-semibold shadow-[0_0_16px_rgba(147,51,234,0.4)] hover:shadow-[0_0_24px_rgba(147,51,234,0.6)] transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 2. HERO SECTION (Exact match to Image 1) ── */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Real-time API Monitoring Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111118] border border-[#242432] text-xs font-medium text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Real-time API Monitoring</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Keep Your APIs{' '}
              <span className="text-[#A855F7] inline-block">Online,</span> Always.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-400 max-w-lg leading-relaxed font-normal">
              Monitor, track and get instant alerts for your APIs with powerful uptime and performance insights.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9333EA] hover:bg-[#8B5CF6] text-white font-semibold text-sm sm:text-base shadow-[0_0_24px_rgba(147,51,234,0.45)] hover:shadow-[0_0_32px_rgba(147,51,234,0.65)] transition-all cursor-pointer"
              >
                <span>Start Monitoring Free</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => scrollToSection('features')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#111118] hover:bg-[#191924] text-neutral-200 border border-[#282836] hover:border-neutral-600 font-semibold text-sm sm:text-base transition-all cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column: 3D Perspective Dashboard Mockup (Exact match to Image 1) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-xl relative group">
              {/* Outer Glow Aura behind mockup */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-purple-800/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-700" />

              {/* Mockup Frame with Isometric / Perspective 3D rotation */}
              <div className="relative rounded-2xl bg-[#0D0D12] border border-[#232330] shadow-[0_24px_70px_rgba(0,0,0,0.85)] p-4 sm:p-5 flex gap-4 text-xs select-none transition-transform duration-500 hover:scale-[1.02]">
                {/* Mockup Mini Sidebar */}
                <div className="hidden sm:flex flex-col justify-between w-36 border-r border-[#1B1B25] pr-3 shrink-0 text-left">
                  <div className="space-y-4">
                    {/* Logo inside mockup */}
                    <div className="flex items-center gap-2 font-bold text-white text-[11px] pb-1">
                      <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center">
                        <Zap size={10} className="fill-white text-white" />
                      </div>
                      <span>API Monitor</span>
                    </div>

                    {/* Workspace */}
                    <div>
                      <div className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        WORKSPACE
                      </div>
                      <div className="space-y-1">
                        <div className="px-2.5 py-1.5 rounded-lg bg-white text-black font-bold flex items-center gap-2 text-[11px]">
                          <LayoutGrid size={12} />
                          <span>Overview</span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white flex items-center gap-2 text-[11px]">
                          <Activity size={12} />
                          <span>Monitors</span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white flex items-center gap-2 text-[11px]">
                          <AlertTriangle size={12} />
                          <span>Incidents</span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white flex items-center gap-2 text-[11px]">
                          <FileText size={12} />
                          <span>Logs</span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white flex items-center gap-2 text-[11px]">
                          <BarChart3 size={12} />
                          <span>Reports</span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white flex items-center gap-2 text-[11px]">
                          <Settings size={12} />
                          <span>Settings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mockup Mini Main Content */}
                <div className="flex-1 space-y-3.5 min-w-0 text-left">
                  {/* Top Bar inside Mockup */}
                  <div className="flex items-center justify-between pb-1 border-b border-[#1A1A24]">
                    <div className="font-bold text-white text-xs">Overview</div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#161620] border border-[#252532] text-[10px] text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live (04:30:36 PM)</span>
                      <ChevronDown size={10} className="text-neutral-500" />
                    </div>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#13131A] border border-[#22222E]">
                      <div className="text-[10px] text-neutral-400">Uptime %</div>
                      <div className="text-base font-bold text-white mt-0.5">100.0%</div>
                      <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">▲ +0.1%</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#13131A] border border-[#22222E]">
                      <div className="text-[10px] text-neutral-400">Avg Response</div>
                      <div className="text-base font-bold text-white mt-0.5">213 ms</div>
                      <div className="text-[9px] text-purple-400 font-semibold mt-0.5">▼ -12ms</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#13131A] border border-[#22222E]">
                      <div className="text-[10px] text-neutral-400">Incidents</div>
                      <div className="text-base font-bold text-white mt-0.5">0</div>
                      <div className="text-[9px] text-neutral-500 font-medium mt-0.5">▼ 0%</div>
                    </div>
                  </div>

                  {/* Response Time Graph Box */}
                  <div className="p-3 rounded-xl bg-[#13131A] border border-[#22222E] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-[11px]">Response Time</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[9px] font-semibold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Healthy
                      </span>
                    </div>

                    {/* SVG Telemetry Curve with glowing tooltip */}
                    <div className="relative pt-1 flex gap-2">
                      {/* Y-axis labels (Matching Image 1) */}
                      <div className="flex flex-col justify-between text-[7.5px] text-neutral-500 font-mono py-0.5 select-none shrink-0 text-right w-7">
                        <span>600ms</span>
                        <span>400ms</span>
                        <span>200ms</span>
                        <span>0ms</span>
                      </div>

                      <div className="relative flex-1 min-w-0">
                        {/* Tooltip Pill */}
                        <div className="absolute top-0.5 left-[68%] -translate-x-1/2 z-10 px-2 py-0.5 rounded-md bg-[#1E1B2E] border border-purple-500/50 text-[9px] font-bold text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                          213 ms
                        </div>

                        <svg viewBox="0 0 320 90" className="w-full h-20 overflow-visible">
                          <defs>
                            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid lines */}
                          <line x1="0" y1="20" x2="320" y2="20" stroke="#1F1F2C" strokeDasharray="2 2" />
                          <line x1="0" y1="50" x2="320" y2="50" stroke="#1F1F2C" strokeDasharray="2 2" />
                          <line x1="0" y1="80" x2="320" y2="80" stroke="#1F1F2C" />

                          {/* Area Fill */}
                          <path
                            d="M 0 65 Q 20 60, 40 62 T 80 58 T 120 60 T 160 52 T 200 62 T 220 30 T 260 62 T 300 58 T 320 62 L 320 85 L 0 85 Z"
                            fill="url(#purpleGrad)"
                          />

                          {/* Line Stroke */}
                          <path
                            d="M 0 65 Q 20 60, 40 62 T 80 58 T 120 60 T 160 52 T 200 62 T 220 30 T 260 62 T 300 58 T 320 62"
                            fill="none"
                            stroke="#A855F7"
                            strokeWidth="2.2"
                          />

                          {/* Highlighted Glowing Node */}
                          <circle cx="220" cy="30" r="4.5" fill="#FFFFFF" stroke="#9333EA" strokeWidth="2.5" />
                          <circle cx="220" cy="30" r="9" fill="#A855F7" fillOpacity="0.3" />
                        </svg>

                        {/* X-axis labels */}
                        <div className="flex justify-between text-[8px] text-neutral-500 font-mono mt-1 px-1">
                          <span>12AM</span>
                          <span>6AM</span>
                          <span>12PM</span>
                          <span>6PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. BOTTOM HERO HIGHLIGHTS BAR (4 Pillars, matching Image 1 bottom) ── */}
        <div className="mt-16 sm:mt-20 pt-8 pb-4 border-t border-b border-[#171720]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Pillar 1 */}
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                <Activity size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Real-time Monitoring</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Track performance 24/7</p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Instant Alerts</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Get notified immediately</p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <BarChart3 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Detailed Insights</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Analyze and improve</p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Reliable & Secure</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Your data stays protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURES SECTION (Exact match to Image 2 Top) ── */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Powerful Features Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13111C] border border-[#2B1B40] text-xs font-medium text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Powerful Features</span>
            </div>

            {/* Section Headline */}
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Everything you need to monitor your <span className="text-[#A855F7]">APIs.</span>
            </h2>

            {/* Description */}
            <p className="text-base text-neutral-400 leading-relaxed font-normal">
              Get real-time insights, stay ahead of issues, and keep your services running smoothly.
            </p>
          </div>

          {/* Right Column: 2x2 Feature Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-left">
            {/* Card 1: Real-time Monitoring */}
            <div className="p-6 rounded-2xl bg-[#0D0D12] border border-[#1E1E28] hover:border-purple-500/40 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Activity size={20} />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Real-time Monitoring</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Track uptime and performance in real-time, 24/7.
              </p>
            </div>

            {/* Card 2: Instant Alerts */}
            <div className="p-6 rounded-2xl bg-[#0D0D12] border border-[#1E1E28] hover:border-emerald-500/40 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Bell size={20} />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Instant Alerts</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Get notified via email, Slack or webhooks.
              </p>
            </div>

            {/* Card 3: Detailed Analytics */}
            <div className="p-6 rounded-2xl bg-[#0D0D12] border border-[#1E1E28] hover:border-purple-500/40 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Detailed Analytics</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Analyze response times, latency and trends.
              </p>
            </div>

            {/* Card 4: Reliable & Secure */}
            <div className="p-6 rounded-2xl bg-[#0D0D12] border border-[#1E1E28] hover:border-emerald-500/40 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Reliable & Secure</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Your data stays protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. SOCIAL PROOF / TRUSTED BY (Exact match to Image 2 Middle) ── */}
      <section className="py-14 border-t border-b border-[#161620] relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>TRUSTED BY DEVELOPERS WORLDWIDE</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-neutral-300">
            {/* Vercel */}
            <div className="flex items-center gap-2 font-semibold text-lg hover:text-white transition-colors">
              <svg viewBox="0 0 76 65" className="w-5 h-4 fill-current">
                <polygon points="38,0 76,65 0,65" />
              </svg>
              <span>Vercel</span>
            </div>

            {/* GitHub */}
            <div className="flex items-center gap-2 font-semibold text-lg hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </div>

            {/* Netlify */}
            <div className="flex items-center gap-2 font-semibold text-lg hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M16.5 3L12 7.5 7.5 3 3 7.5 7.5 12 3 16.5 7.5 21l4.5-4.5 4.5 4.5 4.5-4.5-4.5-4.5 4.5-4.5z" />
              </svg>
              <span>Netlify</span>
            </div>

            {/* Cloudflare */}
            <div className="flex items-center gap-2 font-semibold text-lg hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
              </svg>
              <span>Cloudflare</span>
            </div>

            {/* DigitalOcean */}
            <div className="flex items-center gap-2 font-semibold text-lg hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12.04 0C5.408 0 .04 5.367.04 12c0 3.316 1.343 6.32 3.518 8.495l2.483-2.484A8.47 8.47 0 013.56 12c0-4.683 3.797-8.48 8.48-8.48 4.683 0 8.48 3.797 8.48 8.48 0 4.683-3.797 8.48-8.48 8.48v3.52c6.633 0 12-5.367 12-12S18.673 0 12.04 0zm-1.76 17.6h3.52v3.52h-3.52z" />
              </svg>
              <span>DigitalOcean</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PRICING SECTION (Exact match to Image 2 Middle-Bottom) ── */}
      <section id="pricing" className="py-20 md:py-28 max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Simple Pricing Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13111C] border border-[#2B1B40] text-xs font-medium text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Simple Pricing</span>
            </div>

            {/* Section Headline */}
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Start Free. <br />
              Scale as You Grow.
            </h2>

            {/* Description */}
            <p className="text-base text-neutral-400 leading-relaxed font-normal">
              No credit card required. Get started in seconds and explore all features.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9333EA] hover:bg-[#8B5CF6] text-white font-semibold text-sm sm:text-base shadow-[0_0_24px_rgba(147,51,234,0.45)] hover:shadow-[0_0_32px_rgba(147,51,234,0.65)] transition-all cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: 2 Pricing Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
            {/* Pro Card (Most Popular) */}
            <div className="p-7 rounded-2xl bg-[#0D0D12] border border-purple-500/40 relative shadow-[0_0_40px_rgba(147,51,234,0.15)] flex flex-col justify-between">
              <div>
                {/* Most Popular Badge */}
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-semibold text-emerald-400 mb-3">
                  Most Popular
                </span>

                <h3 className="text-2xl font-bold text-white">Pro</h3>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">$19</span>
                  <span className="text-sm font-normal text-neutral-400">/ month</span>
                </div>

                {/* Features List */}
                <div className="mt-6 space-y-3.5">
                  <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <Check size={14} className="text-purple-400 shrink-0" />
                    <span>Unlimited Projects</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <Check size={14} className="text-purple-400 shrink-0" />
                    <span>Real-time Alerts</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <Check size={14} className="text-purple-400 shrink-0" />
                    <span>Advanced Analytics</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <Check size={14} className="text-purple-400 shrink-0" />
                    <span>Team Collaboration</span>
                  </div>
                </div>
              </div>

              {/* Upgrade Button */}
              <button
                onClick={handleGetStarted}
                className="w-full mt-8 py-3 rounded-xl bg-[#15151D] hover:bg-[#1E1E28] border border-[#2B2B3A] text-white font-semibold text-xs transition-all cursor-pointer text-center"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Free Card */}
            <div className="p-7 rounded-2xl bg-[#0D0D12] border border-[#1E1E28] flex flex-col justify-between">
              <div>
                {/* Spacing placeholder to align with Pro card */}
                <div className="h-6 mb-3" />

                <h3 className="text-2xl font-bold text-white">Free</h3>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">$0</span>
                  <span className="text-sm font-normal text-neutral-400">/ forever</span>
                </div>

                {/* Features List */}
                <div className="mt-6 space-y-3.5">
                  <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <Check size={14} className="text-purple-400 shrink-0" />
                    <span>1 Project</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <Check size={14} className="text-purple-400 shrink-0" />
                    <span>Basic Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                    <Check size={14} className="text-purple-400 shrink-0" />
                    <span>Email Alerts</span>
                  </div>
                </div>
              </div>

              {/* Get Started Button */}
              <button
                onClick={handleGetStarted}
                className="w-full mt-8 py-3 rounded-xl bg-[#15151D] hover:bg-[#1E1E28] border border-[#2B2B3A] text-white font-semibold text-xs transition-all cursor-pointer text-center"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. BOTTOM CTA BANNER (Exact match to Image 2 Bottom) ── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="p-8 sm:p-10 rounded-2xl bg-[#0C0C12] border border-[#1F1F2B] shadow-[0_0_50px_rgba(147,51,234,0.12)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/35 flex items-center justify-center text-purple-400 shadow-[0_0_16px_rgba(147,51,234,0.35)] shrink-0">
              <Zap size={22} className="fill-purple-400" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Ready to keep your APIs online?</h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Join thousands of developers who trust API Monitor.
              </p>
            </div>
          </div>

          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9333EA] hover:bg-[#8B5CF6] text-white font-semibold text-sm shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all cursor-pointer shrink-0"
          >
            <span>Get Started Free</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── 8. FOOTER (Exact match to Image 2 Bottom) ── */}
      <footer className="max-w-7xl mx-auto px-6 pt-12 pb-10 border-t border-[#171720] text-xs text-neutral-400">
        {/* Footer Top Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Zap size={14} className="text-white fill-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">API Monitor</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-neutral-400 text-xs">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
              Product
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">
              Pricing
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
              Docs
            </button>
          </div>

          {/* Status & Socials */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>All Systems Operational</span>
            </div>

            <div className="w-px h-3.5 bg-neutral-800" />

            {/* Social Icons */}
            <div className="flex items-center gap-3 text-neutral-400">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors p-1"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors p-1"
                aria-label="X / Twitter"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors p-1"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#12121A] text-neutral-500 text-[11px]">
          <div>© 2025 API Monitor. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
