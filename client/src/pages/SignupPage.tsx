import { TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import Signup from '../components/Signup';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#000000] text-neutral-100 font-sans">

      {/* =========================================================
          LEFT SIDE: OBSIDIAN NEON HERO (THE PERFECT MIDDLEGROUND)
      ========================================================= */}
      <div className="w-full lg:w-1/2 min-h-[550px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative isolate overflow-hidden bg-[#0A0A0A] border-b lg:border-b-0 lg:border-r border-[#1F1F1F]">


        {/* Subtle Tech Grid */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-25">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '44px 44px',
              maskImage: 'linear-gradient(to bottom, transparent, black 40%)',
            }}
          />
        </div>

        {/* =========================================================
            ELECTRIC PURPLE & CYAN OBSERVABILITY WAVES
        ========================================================= */}
        <div className="absolute bottom-16 left-0 w-full h-[46%] pointer-events-none z-0 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 700 350"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Primary Electric Violet Wave */}
              <linearGradient id="neonWave" x1="0" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>

              {/* Gradient Area Fill */}
              <linearGradient id="neonFill" x1="350" y1="0" x2="350" y2="350" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
                <stop offset="60%" stopColor="#6D28D9" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>

              {/* Secondary Cyan Trace */}
              <linearGradient id="cyanTrace" x1="0" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.2" />
              </linearGradient>

              {/* Purple Bloom Filter */}
              <filter id="bloomFilter" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Gradient Fill under wave */}
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
              fill="url(#neonFill)"
            />

            {/* Background Trace Line 1 */}
            <path
              d="
                M0 280
                C90 220 110 300 190 240
                S300 200 370 245
                S480 180 550 220
                S650 165 700 135
              "
              stroke="#3B2667"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />

            {/* Background Cyan Line */}
            <path
              d="
                M0 300
                C80 265 140 330 220 260
                S330 280 400 210
                S510 235 570 170
                S650 160 700 90
              "
              stroke="url(#cyanTrace)"
              strokeWidth="2"
            />

            {/* Glowing Neon Purple Wave */}
            <path
              d="
                M0 235
                C65 240 75 155 145 170
                S210 90 270 115
                S340 215 405 135
                S490 65 545 105
                S640 95 700 15
              "
              stroke="url(#neonWave)"
              strokeWidth="2.5"
              filter="url(#bloomFilter)"
            />

            {/* Bright highlight ridge */}
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
              strokeOpacity="0.6"
              strokeWidth="1"
            />

            {/* Live Monitoring Status Dot (Cyan Ping) */}
            <circle cx="405" cy="135" r="4" fill="#38BDF8" />
            <circle cx="405" cy="135" r="9" fill="#38BDF8" opacity="0.35" className="animate-ping" />
          </svg>
        </div>

        {/* =========================================================
            HEADER / LOGO
        ========================================================= */}
        <div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 ">
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              API Monitor
            </span>
          </div>

          {/* =========================================================
              HERO CONTENT (Clean contrast + Vibrant accent)
          ========================================================= */}
          <div className="my-auto py-16 relative z-10 max-w-lg mt-10">


            <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-extrabold tracking-tight text-white leading-[1.15]">
              Monitor. Analyze.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">
                Stay online.
              </span>
            </h1>

            <p className="mt-5 text-neutral-400 text-sm sm:text-base leading-relaxed max-w-md">
              The complete observability platform for your APIs. Real-time insights, instant incident alerts, and historical reporting.
            </p>
          </div>
        </div>

        {/* =========================================================
            BOTTOM FEATURE BADGES (Obsidian Glass + Neon Indicators)
        ========================================================= */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#1F1F1F] relative z-10">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#222222] text-xs text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="font-semibold text-white">99.99%</span>
            <span>Uptime</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#222222] text-xs text-neutral-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Real-time Alerts</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#222222] text-xs text-neutral-300">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>P95 / P99 Analytics</span>
          </div>
        </div>

      </div>

      {/* =========================================================
          RIGHT SIDE: WHITE SIGNUP FORM
      ========================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white overflow-y-auto">
        <Signup onSwitchToLogin={handleSwitchToLogin} />
      </div>

    </div>
  );
};

export default SignupPage;
