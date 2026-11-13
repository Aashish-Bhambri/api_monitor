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
          LEFT SIDE: MINIMAL MONOCHROME HERO & OBSERVABILITY
      ========================================================= */}
      <div className="w-full lg:w-1/2 min-h-[550px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative isolate overflow-hidden bg-[#0A0A0A] border-b lg:border-b-0 lg:border-r border-[#1F1F1F]">

        {/* Minimal Dark Grid */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage: 'linear-gradient(to bottom, transparent, black 40%)',
            }}
          />
        </div>

        {/* Clean Monochrome Wave Graphic */}
        <div className="absolute bottom-16 left-0 w-full h-[45%] pointer-events-none z-0 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 700 350"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="monoFillSignup" x1="350" y1="0" x2="350" y2="350" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>

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
              fill="url(#monoFillSignup)"
            />

            <path
              d="
                M0 280
                C90 220 110 300 190 240
                S300 200 370 245
                S480 180 550 220
                S650 165 700 135
              "
              stroke="#333333"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            <path
              d="
                M0 235
                C65 240 75 155 145 170
                S210 90 270 115
                S340 215 405 135
                S490 65 545 105
                S640 95 700 15
              "
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            <circle cx="405" cy="135" r="4.5" fill="#10B981" />
            <circle cx="405" cy="135" r="10" fill="#10B981" opacity="0.35" className="animate-ping" />
          </svg>
        </div>

        {/* Header / Logo */}
        <div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-white">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              API Monitor
            </span>
          </div>

          <div className="my-auto py-16 relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#141414] border border-[#262626]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-medium text-neutral-300">
                Observability & Synthetic Monitoring
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-bold tracking-tight text-white leading-[1.15]">
              Monitor. Analyze.
              <br />
              <span className="text-neutral-400">
                Stay online.
              </span>
            </h1>

            <p className="mt-5 text-neutral-400 text-sm sm:text-base leading-relaxed max-w-md">
              Complete observability for your microservices. Start tracking endpoints and response times in seconds.
            </p>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#1F1F1F] relative z-10">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#222222] text-xs text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="font-semibold text-white">99.99%</span>
            <span>Uptime</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#222222] text-xs text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>Instant Alerts</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#222222] text-xs text-neutral-300">
            <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
            <span>P95 / P99 Latency</span>
          </div>
        </div>

      </div>

      {/* =========================================================
          RIGHT SIDE: PITCH BLACK SIGNUP FORM
      ========================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#000000] overflow-y-auto">
        <Signup onSwitchToLogin={handleSwitchToLogin} />
      </div>

    </div>
  );
};

export default SignupPage;
