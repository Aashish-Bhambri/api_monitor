import { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Link2,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Zap,
  Globe,
  Mail,
  Bell,
  Box,
  Play,
  Lock,
  ChevronDown,
  Info,
} from 'lucide-react';
import onboardingHero from '../assets/onboarding-hero.jpg';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: any) => void;
}

interface EndpointItem {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

const STEPS = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Project Details' },
  { id: 3, label: 'Endpoints' },
  { id: 4, label: 'Monitoring' },
  { id: 5, label: 'Alerts' },
  { id: 6, label: 'Review' },
];

const COLOR_OPTIONS = [
  '#8B5CF6', // Purple
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F97316', // Orange
  '#F43F5E', // Rose
];

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 2 State
  const [projectName, setProjectName] = useState('My API Monitor');
  const [description, setDescription] = useState('Monitor my production APIs and get notified about any issues.');
  const [environment, setEnvironment] = useState<'Production' | 'Staging' | 'Development'>('Production');
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');

  // Step 3 State
  const [endpointUrl, setEndpointUrl] = useState('https://api.example.com/health');
  const [endpointMethod, setEndpointMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [authType, setAuthType] = useState('None');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [endpoints, setEndpoints] = useState<EndpointItem[]>([
    { id: '1', url: 'https://api.example.com/health', method: 'GET' },
  ]);

  // Step 4 State
  const [checkFrequency, setCheckFrequency] = useState('5 Minutes');
  const [requestTimeout, setRequestTimeout] = useState('30 Seconds');
  const [expectedStatus, setExpectedStatus] = useState('200');
  const [responseThreshold, setResponseThreshold] = useState('2s');
  const [region, setRegion] = useState('Global (Recommended)');

  // Step 5 State
  const [alerts, setAlerts] = useState({
    email: true,
    browser: true,
    slack: false,
    discord: false,
    downAlert: true,
  });

  // Step 6 State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete?.({
        projectName,
        description,
        environment,
        selectedColor,
        endpoints,
        checkFrequency,
        requestTimeout,
        expectedStatus,
        responseThreshold,
        region,
        alerts,
      });
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAddEndpoint = () => {
    if (!endpointUrl.trim()) return;
    setEndpoints((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        url: endpointUrl.trim(),
        method: endpointMethod,
      },
    ]);
  };

  const handleDeleteEndpoint = (id: string) => {
    setEndpoints((prev) => prev.filter((e) => e.id !== id));
  };

  const handleRunTest = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('Ping response: 200 OK — 92ms latency');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      {/* Modal Dialog Card */}
      <div className="w-full max-w-[690px] min-h-[510px] bg-[#0C101A] border border-[#1E2638] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(139,92,246,0.12)] flex flex-col justify-between overflow-hidden relative text-white">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 z-20 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* ── Top Stepper Bar ────────────────────────────────────────────── */}
        <div className="px-8 pt-6 pb-4 relative z-10 border-b border-[#161D2B]">
          <div className="flex items-center justify-between max-w-lg mx-auto relative">
            {/* Connecting Line behind circles */}
            <div className="absolute top-[12px] left-4 right-4 h-[1px] bg-[#1E2638] -z-0" />

            {STEPS.map((s) => {
              const isCurrent = currentStep === s.id;
              const isCompleted = currentStep > s.id;

              return (
                <div key={s.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-[#6366F1] text-white shadow-[0_0_14px_rgba(99,102,241,0.65)] scale-105'
                        : isCompleted
                        ? 'bg-[#141A28] border border-[#2D3952] text-slate-300'
                        : 'bg-[#0E1320] border border-[#1E2638] text-slate-600'
                    }`}
                  >
                    {s.id}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 transition-colors whitespace-nowrap ${
                      isCurrent ? 'font-semibold text-white' : 'text-slate-500 font-normal'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Modal Body ─────────────────────────────────────────────────── */}
        <div className="flex-1 px-8 py-6 flex flex-col justify-center relative z-10">
          
          {/* STEP 1: WELCOME */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Welcome to <br />
                  <span className="text-[#8B5CF6]">API Monitor</span>
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-2.5 leading-relaxed">
                  Let&apos;s set up your first project to start monitoring your APIs.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  {[
                    'Monitor uptime & performance',
                    'Get instant alerts',
                    'Keep your services reliable',
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                      <span className="w-4 h-4 rounded-full border border-emerald-500/80 flex items-center justify-center text-emerald-400 shrink-0">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3D Server & Heartbeat Render */}
              <div className="flex items-center justify-center relative">
                <img
                  src={onboardingHero}
                  alt="API Monitor 3D Stack"
                  className="w-full max-w-[260px] h-auto object-contain rounded-2xl drop-shadow-[0_15px_35px_rgba(99,102,241,0.25)] border border-white/5"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PROJECT DETAILS */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Tell us about your project</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Give your project a name and a short description (optional).
                </p>
              </div>

              {/* Project Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Project Name <span className="text-[#8B5CF6]">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My API Monitor"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B13] border border-[#1E2638] text-white text-xs focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
                <textarea
                  rows={2}
                  maxLength={200}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Monitor my production APIs and get notified about any issues."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B13] border border-[#1E2638] text-white text-xs focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all resize-none pb-6"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono">
                  {description.length}/200
                </span>
              </div>

              {/* Environment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Environment</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Production', 'Staging', 'Development'] as const).map((env) => {
                    const isSelected = environment === env;
                    return (
                      <button
                        key={env}
                        type="button"
                        onClick={() => setEnvironment(env)}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#121929] border-[#6366F1] text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                            : 'bg-[#080B13] border-[#1E2638] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-[#6366F1]' : 'bg-slate-600'
                          }`}
                        />
                        {env}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project Icon & Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Project Icon & Color</label>
                <div className="flex items-center gap-3">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        selectedColor === c
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0C101A] scale-110'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="w-7 h-7 rounded-lg bg-[#141A28] border border-[#232D42] flex items-center justify-center text-slate-400 ml-1">
                    <Box size={14} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ADD API ENDPOINTS */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-3.5 max-w-xl mx-auto w-full">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Add API Endpoints</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Enter the API endpoints you want to monitor.
                </p>
              </div>

              {/* URL Input Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Link2 size={14} />
                  </div>
                  <input
                    type="url"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    placeholder="https://api.example.com/health"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#080B13] border border-[#1E2638] text-white text-xs focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                {/* Method selector */}
                <select
                  value={endpointMethod}
                  onChange={(e) => setEndpointMethod(e.target.value as any)}
                  className="px-3 py-2.5 rounded-xl bg-[#080B13] border border-[#1E2638] text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                {/* Add button */}
                <button
                  type="button"
                  onClick={handleAddEndpoint}
                  className="px-3 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold transition-all cursor-pointer flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Auth Type & Advanced Options */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B13] border border-[#1E2638] text-xs text-slate-300">
                  <span className="flex items-center gap-2">
                    <Lock size={13} className="text-slate-500" />
                    Auth Type (Optional)
                  </span>
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <select
                      value={authType}
                      onChange={(e) => setAuthType(e.target.value)}
                      className="bg-transparent text-slate-300 outline-none text-xs cursor-pointer"
                    >
                      <option value="None" className="bg-[#0C101A]">None</option>
                      <option value="Bearer" className="bg-[#0C101A]">Bearer Token</option>
                      <option value="ApiKey" className="bg-[#0C101A]">API Key</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#080B13] border border-[#1E2638] text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Advanced Settings (Optional)</span>
                  <ChevronDown size={14} className={showAdvanced ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
              </div>

              {/* Add Endpoint full button */}
              <button
                type="button"
                onClick={handleAddEndpoint}
                className="w-full py-2.5 rounded-xl bg-[#1C2035] hover:bg-[#232942] border border-[#2B3550] text-[#A5B4FC] text-xs font-semibold transition-all cursor-pointer"
              >
                Add Endpoint
              </button>

              {/* Added Endpoints List */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                  Added Endpoints ({endpoints.length})
                </div>

                <div className="flex flex-col gap-2 max-h-28 overflow-y-auto">
                  {endpoints.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#080B13] border border-[#1E2638] text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-white font-mono text-[11px] truncate">{item.url}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141A28] text-slate-300 border border-[#232D42]">
                          {item.method}
                        </span>
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEndpoint(item.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIGURE MONITORING SETTINGS */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Configure Monitoring Settings</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Choose how often you want to check your API and set alert preferences.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Frequency */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Check Frequency</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#080B13] border border-[#1E2638] text-xs">
                    <Clock size={13} className="text-slate-400" />
                    <select
                      value={checkFrequency}
                      onChange={(e) => setCheckFrequency(e.target.value)}
                      className="w-full bg-transparent text-white outline-none cursor-pointer"
                    >
                      <option value="1 Minute" className="bg-[#0C101A]">1 Minute</option>
                      <option value="5 Minutes" className="bg-[#0C101A]">5 Minutes</option>
                      <option value="15 Minutes" className="bg-[#0C101A]">15 Minutes</option>
                      <option value="30 Minutes" className="bg-[#0C101A]">30 Minutes</option>
                    </select>
                  </div>
                </div>

                {/* Timeout */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Request Timeout</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#080B13] border border-[#1E2638] text-xs">
                    <Clock size={13} className="text-slate-400" />
                    <select
                      value={requestTimeout}
                      onChange={(e) => setRequestTimeout(e.target.value)}
                      className="w-full bg-transparent text-white outline-none cursor-pointer"
                    >
                      <option value="10 Seconds" className="bg-[#0C101A]">10 Seconds</option>
                      <option value="30 Seconds" className="bg-[#0C101A]">30 Seconds</option>
                      <option value="60 Seconds" className="bg-[#0C101A]">60 Seconds</option>
                    </select>
                  </div>
                </div>

                {/* Status Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    Expected Status Code
                    <Info size={11} className="text-slate-500" />
                  </label>
                  <input
                    type="text"
                    value={expectedStatus}
                    onChange={(e) => setExpectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B13] border border-[#1E2638] text-white text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Response Threshold */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    Response Time Threshold
                    <Info size={11} className="text-slate-500" />
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={responseThreshold}
                      onChange={(e) => setResponseThreshold(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#080B13] border border-[#1E2638] text-white text-xs font-mono focus:outline-none"
                    />
                    <Zap size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Monitoring Region */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Monitoring Region</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#080B13] border border-[#1E2638] text-xs">
                  <Globe size={13} className="text-slate-400" />
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-transparent text-white outline-none cursor-pointer"
                  >
                    <option value="Global (Recommended)" className="bg-[#0C101A]">Global (Recommended)</option>
                    <option value="US East (N. Virginia)" className="bg-[#0C101A]">US East (N. Virginia)</option>
                    <option value="EU Central (Frankfurt)" className="bg-[#0C101A]">EU Central (Frankfurt)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIGURE ALERTS */}
          {currentStep === 5 && (
            <div className="flex flex-col gap-3.5 max-w-xl mx-auto w-full">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Configure Alerts</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Get notified when something goes wrong.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {/* Email */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B13] border border-[#1E2638]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Mail size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Email Notifications</div>
                      <div className="text-[10px] text-slate-500">Receive alerts via email</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlerts({ ...alerts, email: !alerts.email })}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      alerts.email ? 'bg-[#6366F1]' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alerts.email ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Browser */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B13] border border-[#1E2638]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Bell size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Browser Notifications</div>
                      <div className="text-[10px] text-slate-500">Get notified in your browser</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlerts({ ...alerts, browser: !alerts.browser })}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      alerts.browser ? 'bg-[#6366F1]' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alerts.browser ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Slack */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B13] border border-[#1E2638]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#E01E5A]/10 text-amber-400 flex items-center justify-center">
                      <span className="font-bold text-xs">#</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Slack Integration</div>
                      <div className="text-[10px] text-slate-500">Send alerts to your Slack workspace</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlerts({ ...alerts, slack: !alerts.slack })}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      alerts.slack ? 'bg-[#6366F1]' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alerts.slack ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Discord */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B13] border border-[#1E2638]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#5865F2]/10 text-indigo-400 flex items-center justify-center">
                      <span className="font-bold text-xs">@</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Discord Integration</div>
                      <div className="text-[10px] text-slate-500">Get alerts in Discord</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlerts({ ...alerts, discord: !alerts.discord })}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      alerts.discord ? 'bg-[#6366F1]' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alerts.discord ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Alert when API goes down */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080B13] border border-[#1E2638] mt-1">
                  <div>
                    <div className="text-xs font-semibold text-white">Alert When API Goes Down</div>
                    <div className="text-[10px] text-slate-500">Get notified if your API is unreachable</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlerts({ ...alerts, downAlert: !alerts.downAlert })}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      alerts.downAlert ? 'bg-[#6366F1]' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${alerts.downAlert ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & LAUNCH */}
          {currentStep === 6 && (
            <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Review & Launch</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Almost there! Review your project details before creating it.
                </p>
              </div>

              {/* Review Card */}
              <div className="p-4 rounded-2xl bg-[#080B13] border border-[#1E2638] flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#161D2B]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: selectedColor }}
                    >
                      <Box size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{projectName}</div>
                      <div className="text-[11px] text-slate-500">{description}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {environment}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-slate-500 text-[11px]">Endpoints</div>
                    <div className="text-white font-medium mt-0.5">{endpoints.length}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px]">Monitoring Interval</div>
                    <div className="text-white font-medium mt-0.5">{checkFrequency}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px]">Alerts</div>
                    <div className="text-white font-medium mt-0.5">
                      {[alerts.email && 'Email', alerts.browser && 'Browser', alerts.slack && 'Slack', alerts.discord && 'Discord']
                        .filter(Boolean)
                        .join(', ') || 'None'}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center gap-2 text-xs text-emerald-400">
                  <span className="w-3.5 h-3.5 rounded-full border border-emerald-500 flex items-center justify-center shrink-0">
                    <svg className="w-2 h-2" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[11px]">Initial test will run automatically after creation.</span>
                </div>

                {testResult && (
                  <div className="p-2 rounded-lg bg-[#141A28] border border-[#232D42] text-xs text-[#A5B4FC] font-mono">
                    ✔ {testResult}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ─────────────────────────────────────────────────── */}
        <div className="px-8 py-4 border-t border-[#161D2B] flex items-center justify-between relative z-10 bg-[#090D15]">
          {/* Left Action */}
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Skip
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} />
              Back
            </button>
          )}

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {currentStep === 6 && (
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-[#232D42] hover:bg-white/5 transition-all cursor-pointer"
              >
                <Play size={11} className={isTesting ? 'animate-spin' : ''} />
                <span>{isTesting ? 'Testing...' : 'Run Initial Test'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6366F1] hover:bg-[#4F46E5] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_16px_rgba(99,102,241,0.4)]"
            >
              <span>
                {currentStep === 1
                  ? 'Get Started'
                  : currentStep === 6
                  ? 'Create Project'
                  : 'Continue'}
              </span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
