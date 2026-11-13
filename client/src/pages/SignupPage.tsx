
import { Activity, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import Signup from '../components/Signup';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#080B11] text-white">

      {/* =========================================================
          LEFT SIDE: BRANDING + HERO + OBSERVABILITY WAVES
      ========================================================= */}

      <div className="w-full lg:w-1/2 min-h-[600px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative isolate overflow-hidden bg-[#0A0D14]">

        {/* Ambient Purple Glows */}

        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="absolute top-1/2 -right-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

        {/* Subtle Grid */}

        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139,92,246,0.035) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139,92,246,0.035) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              maskImage: 'linear-gradient(to bottom, transparent, black)',
            }}
          />
        </div>

        {/* =========================================================
            FULL WIDTH DECORATIVE SVG WAVES
        ========================================================= */}

        <div className="absolute bottom-16 left-0 w-full h-[48%] pointer-events-none z-0 overflow-hidden">

          <svg
            className="w-full h-full"
            viewBox="0 0 700 350"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >

            <defs>

              {/* Main Wave Gradient */}

              <linearGradient
                id="mainWave"
                x1="0"
                y1="0"
                x2="700"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="45%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>

              {/* Main Wave Fill */}

              <linearGradient
                id="mainFill"
                x1="350"
                y1="0"
                x2="350"
                y2="350"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.32" />
                <stop offset="55%" stopColor="#6D28D9" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>

              {/* Secondary Wave */}

              <linearGradient
                id="secondWave"
                x1="0"
                y1="0"
                x2="700"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
              </linearGradient>

              {/* Purple Neon Glow */}

              <filter
                id="purpleGlow"
                x="-20%"
                y="-50%"
                width="140%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="5" result="blur" />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

            </defs>

            {/* Main Gradient Area */}

            <path
              d="
                M0 235
                C65 240 75 155 145 170
                S210 90 270 115
                S340 215 405 135
                S490 65 545 105
                S640 95 700 15
                L700 350
                L0 350 Z
              "
              fill="url(#mainFill)"
            />

            {/* Background Wave 1 */}

            <path
              d="
                M0 280
                C90 220 110 300 190 240
                S300 200 370 245
                S480 180 550 220
                S650 165 700 135
              "
              stroke="#4F46E5"
              strokeOpacity="0.3"
              strokeWidth="2"
            />

            {/* Background Wave 2 */}

            <path
              d="
                M0 300
                C80 265 140 330 220 260
                S330 280 400 210
                S510 235 570 170
                S650 160 700 90
              "
              stroke="url(#secondWave)"
              strokeWidth="2"
            />

            {/* Main Glowing Wave */}

            <path
              d="
                M0 235
                C65 240 75 155 145 170
                S210 90 270 115
                S340 215 405 135
                S490 65 545 105
                S640 95 700 15
              "
              stroke="url(#mainWave)"
              strokeWidth="3"
              filter="url(#purpleGlow)"
            />

            {/* Main Wave Highlight */}

            <path
              d="
                M0 235
                C65 240 75 155 145 170
                S210 90 270 115
                S340 215 405 135
                S490 65 545 105
                S640 95 700 15
              "
              stroke="#C4B5FD"
              strokeOpacity="0.5"
              strokeWidth="1"
            />

            {/* Live Monitoring Point */}

            <circle cx="405" cy="135" r="4" fill="#38BDF8" />

            <circle
              cx="405"
              cy="135"
              r="9"
              fill="#38BDF8"
              opacity="0.3"
              className="animate-ping"
            />

          </svg>

        </div>

        {/* =========================================================
            HEADER / LOGO
        ========================================================= */}
        <div>
          <div className="flex items-center gap-3 relative z-10">

            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.35)]">

              <Activity className="w-5 h-5 text-indigo-400" />

            </div>

            <span className="text-xl font-bold tracking-tight text-white">
              API Monitor
            </span>

          </div>

          {/* =========================================================
            HERO CONTENT
        ========================================================= */}

          <div className="my-auto py-16 relative z-10 max-w-lg">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20">

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              <span className="text-xs font-medium text-indigo-300">
                API Observability Platform
              </span>

            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-white leading-[1.15]">

              Monitor. Analyze.

              <br />

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">
                Stay online.
              </span>

            </h1>

            <p className="mt-6 text-slate-400 text-sm sm:text-base leading-relaxed max-w-md">

              The complete observability platform for your APIs.
              Get real-time insights, instant alerts and historical reports.

            </p>

          </div>
        </div>

        {/* =========================================================
            BOTTOM FEATURE BADGES
        ========================================================= */}

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/10 relative z-10">

          {/* Uptime */}

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 backdrop-blur-md">

            <span className="relative flex h-2 w-2">

              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />

            </span>

            <span className="font-semibold text-emerald-400">
              99.99%
            </span>

            <span>Uptime</span>

          </div>

          {/* Real-time Alerts */}

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 backdrop-blur-md">

            <Zap className="w-3.5 h-3.5 text-amber-400" />

            <span>Real-time Alerts</span>

          </div>

          {/* Analytics */}

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 backdrop-blur-md">

            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />

            <span>Powerful Analytics</span>

          </div>

        </div>

      </div>

      {/* =========================================================
          RIGHT SIDE: LOGIN / SIGNUP
      ========================================================= */}

      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white overflow-y-auto">

        

          <Signup onSwitchToLogin={handleSwitchToLogin} />

        

      </div>

    </div>
  );
};

export default LoginPage;
