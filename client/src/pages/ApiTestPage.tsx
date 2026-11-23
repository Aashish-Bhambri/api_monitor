import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Plus,
  Activity,
  Folder,
  Trash2,
  Play,
  RefreshCw,
  Globe,
  Clock,
  Zap,
  ArrowRight,
  Lock,
  ExternalLink,
  Pause,
} from 'lucide-react';
import { LatencyChart } from '../components/LatencyChart';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: { monitors: number };
}

interface MonitorResult {
  responseTime: number;
  statusCode: number | null;
  success: boolean;
  checkedAt: string;
}

interface Monitor {
  id: string;
  projectId: string;
  url: string;
  method: string;
  interval: number;
  status: 'UP' | 'DOWN' | 'PENDING' | 'PAUSED';
  results?: MonitorResult[];
}

export default function ApiTestPage() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('token') || '');
  
  // Auth fallback states (if user opens /test without logging in)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Monitors State
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [selectedMonitorId, setSelectedMonitorId] = useState<string | null>(null);
  const [isLoadingMonitors, setIsLoadingMonitors] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newMethod, setNewMethod] = useState('GET');
  const [newInterval, setNewInterval] = useState(60);
  const [testingMonitorId, setTestingMonitorId] = useState<string | null>(null);

  // Live Auto-Refresh (Polling) State
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');

  const getHeaders = useCallback(() => {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, [token]);

  // Load Projects
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setIsLoadingProjects(true);
    try {
      const res = await axios.get('/api/projects', getHeaders());
      const list = res.data.projects || [];
      setProjects(list);
      if (list.length > 0 && !activeProject) {
        setActiveProject(list[0]);
      } else if (activeProject && !list.find((p: Project) => p.id === activeProject.id)) {
        setActiveProject(list[0] || null);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setToken('');
        localStorage.removeItem('token');
      }
    } finally {
      setIsLoadingProjects(false);
    }
  }, [token, activeProject, getHeaders]);

  // Load Monitors for active project (with option to suppress full-page loader on background polls)
  const fetchMonitors = useCallback(
    async (projectId: string, showSpinner = true) => {
      if (!token || !projectId) return;
      if (showSpinner) setIsLoadingMonitors(true);
      try {
        const res = await axios.get(`/api/monitors?projectId=${projectId}`, getHeaders());
        setMonitors(res.data.monitors || []);
        setLastRefreshedAt(
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
      } catch {
        // Ignored
      } finally {
        if (showSpinner) setIsLoadingMonitors(false);
      }
    },
    [token, getHeaders]
  );

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token, fetchProjects]);

  useEffect(() => {
    if (activeProject) {
      fetchMonitors(activeProject.id, true);
    } else {
      setMonitors([]);
    }
  }, [activeProject, fetchMonitors]);

  // Auto-polling interval: fetches fresh data every 5 seconds so background hits immediately show in the chart
  useEffect(() => {
    if (!token || !activeProject || !autoRefresh) return;
    const intervalTimer = setInterval(() => {
      fetchMonitors(activeProject.id, false);
    }, 5000);
    return () => clearInterval(intervalTimer);
  }, [token, activeProject, autoRefresh, fetchMonitors]);

  // The active monitor displayed in the large chart
  const activeChartMonitor = useMemo(() => {
    if (!monitors || monitors.length === 0) return null;
    if (selectedMonitorId) {
      const found = monitors.find((m) => m.id === selectedMonitorId);
      if (found) return found;
    }
    return monitors[0];
  }, [monitors, selectedMonitorId]);

  // Quick Guest Login handler if token is missing
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      let res;
      try {
        res = await axios.post('/api/auth/login', { email, password });
      } catch {
        // Try signup if account does not exist
        await axios.post('/api/auth/signup', { email, password });
        res = await axios.post('/api/auth/login', { email, password });
      }
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const res = await axios.post(
        '/api/projects',
        { name: newProjectName.trim(), description: newProjectDesc.trim() || undefined },
        getHeaders()
      );
      if (res.data?.project) {
        setNewProjectName('');
        setNewProjectDesc('');
        setShowNewProjectModal(false);
        setActiveProject(res.data.project);
        fetchProjects();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project and its monitors?')) return;
    try {
      await axios.delete(`/api/projects/${id}`, getHeaders());
      if (activeProject?.id === id) {
        setActiveProject(null);
      }
      fetchProjects();
    } catch {
      alert('Failed to delete project');
    }
  };

  const handleAddMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newUrl.trim()) return;
    try {
      await axios.post(
        '/api/monitors',
        {
          projectId: activeProject.id,
          url: newUrl.trim(),
          method: newMethod,
          interval: Number(newInterval) || 60,
        },
        getHeaders()
      );
      setNewUrl('');
      fetchMonitors(activeProject.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create monitor');
    }
  };

  const handleDeleteMonitor = async (id: string) => {
    try {
      await axios.delete(`/api/monitors/${id}`, getHeaders());
      if (activeProject) {
        fetchMonitors(activeProject.id);
      }
    } catch {
      alert('Failed to delete monitor');
    }
  };

  const handleTestMonitor = async (id: string) => {
    setTestingMonitorId(id);
    try {
      await axios.post(`/api/monitors/${id}/test`, {}, getHeaders());
      if (activeProject) {
        fetchMonitors(activeProject.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Live test failed');
    } finally {
      setTestingMonitorId(null);
    }
  };

  // If unauthenticated: clean, minimal sign-in experience
  if (!token) {
    return (
      <div className="min-h-screen bg-[#080B13] text-white flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm p-6 sm:p-8 rounded-2xl bg-[#0E1422] border border-[#1E293B] shadow-2xl flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Lock size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">Sign In to Test</h2>
              <p className="text-xs text-slate-400">Authenticate to create projects & API monitors</p>
            </div>
          </div>

          {authError && (
            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-400">
              {authError}
            </div>
          )}

          <form onSubmit={handleQuickLogin} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="px-3.5 py-2.5 rounded-xl bg-[#080B13] border border-[#1E293B] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="px-3.5 py-2.5 rounded-xl bg-[#080B13] border border-[#1E293B] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold text-xs text-white shadow-[0_0_14px_rgba(147,51,234,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{isLoggingIn ? 'Connecting...' : 'Continue to Workspace'}</span>
              <ArrowRight size={13} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B13] text-slate-100 font-sans selection:bg-purple-600 selection:text-white flex flex-col">
      {/* ── Top Minimal Navbar ───────────────────────────────────────────── */}
      <header className="h-16 px-6 border-b border-[#1E293B] bg-[#0A0E18] flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Activity size={16} />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">API Monitor</span>
          <span className="text-xs text-slate-500 hidden sm:inline">/ Minimal Test Experience</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-[0_0_12px_rgba(147,51,234,0.3)] transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>New Project</span>
          </button>

          <button
            onClick={() => {
              setToken('');
              localStorage.removeItem('token');
            }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="Sign out"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Main Container: Split 2-Column Minimal Workspace ───────────────── */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Projects List (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Folder size={13} className="text-purple-400" />
              Projects ({projects.length})
            </span>
            <button
              onClick={fetchProjects}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw size={11} className={isLoadingProjects ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Project List */}
          {projects.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0E1422] border border-[#1E293B] border-dashed text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center">
                <Folder size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">No projects yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Create your first project to add API URLs.</p>
              </div>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="mt-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white cursor-pointer"
              >
                + Create Project
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {projects.map((p) => {
                const isActive = activeProject?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActiveProject(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? 'bg-[#121929] border-purple-500/60 shadow-[0_0_16px_rgba(99,102,241,0.15)] text-white'
                        : 'bg-[#0E1422] border-[#1E293B] text-slate-300 hover:border-slate-700 hover:bg-[#111726]'
                    }`}
                  >
                    <div className="truncate max-w-[200px]">
                      <div className="text-xs font-semibold truncate flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-purple-400' : 'bg-slate-600'
                          }`}
                        />
                        {p.name}
                      </div>
                      {p.description && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 pl-4">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleDeleteProject(p.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 transition-opacity cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Monitors for Selected Project (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-5">
          {activeProject ? (
            <>
              {/* Active Project Banner with Live Auto-Refresh controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    {activeProject.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeProject.description || 'Configured API endpoints & real-time hit telemetry'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  {/* Live Polling Status Pill */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141C2E] border border-[#232D42] text-[11px] text-slate-300"
                    title={`Last synced: ${lastRefreshedAt}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span>{autoRefresh ? `Live (${lastRefreshedAt})` : 'Paused'}</span>
                  </div>

                  {/* Toggle Auto-Refresh */}
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className="p-1.5 rounded-lg bg-[#141C2E] hover:bg-[#1A243B] border border-[#232D42] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={autoRefresh ? 'Pause live auto-polling' : 'Resume live auto-polling'}
                  >
                    {autoRefresh ? <Pause size={13} /> : <Play size={13} />}
                  </button>

                  {/* Manual Refresh */}
                  <button
                    onClick={() => fetchMonitors(activeProject.id, true)}
                    className="p-1.5 rounded-lg bg-[#141C2E] hover:bg-[#1A243B] border border-[#232D42] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Refresh fleet immediately"
                  >
                    <RefreshCw size={13} className={isLoadingMonitors ? 'animate-spin text-purple-400' : ''} />
                  </button>
                </div>
              </div>

              {/* Minimal Inline Form: Add URL */}
              <form
                onSubmit={handleAddMonitor}
                className="p-3 rounded-2xl bg-[#0E1422] border border-[#1E293B] flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="relative flex-1 w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Globe size={14} />
                  </div>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://api.yourdomain.com/health"
                    required
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#080B13] border border-[#1E293B] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-[#080B13] border border-[#1E293B] text-xs text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>

                  <select
                    value={newInterval}
                    onChange={(e) => setNewInterval(Number(e.target.value))}
                    className="px-2.5 py-2 rounded-xl bg-[#080B13] border border-[#1E293B] text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10s (Test)</option>
                    <option value={30}>30s</option>
                    <option value={60}>60s</option>
                    <option value={120}>2m</option>
                    <option value={300}>5m</option>
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold text-xs text-white shadow-[0_0_12px_rgba(147,51,234,0.35)] transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    + Add URL
                  </button>
                </div>
              </form>

              {/* ── LIVE INTERACTIVE CHART (Plotted per interval hit) ────────── */}
              {activeChartMonitor && (
                <LatencyChart
                  monitor={activeChartMonitor}
                  onTestNow={handleTestMonitor}
                  isTesting={testingMonitorId === activeChartMonitor.id}
                />
              )}

              {/* ── Monitored Fleet List ──────────────────────────────────────── */}
              <div className="flex flex-col gap-3 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={13} className="text-purple-400" />
                    Monitored Endpoints ({monitors.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Click any card to view its live chart
                  </span>
                </div>

                {isLoadingMonitors && monitors.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-purple-400" />
                    <span>Loading API monitors...</span>
                  </div>
                ) : monitors.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-[#0E1422] border border-[#1E293B] text-center flex flex-col items-center gap-2">
                    <Activity size={24} className="text-slate-600" />
                    <p className="text-xs font-medium text-slate-300">No API URLs monitored yet</p>
                    <p className="text-[11px] text-slate-500">
                      Enter an endpoint above (e.g. https://httpbin.org/status/200) to start tracking.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {monitors.map((m) => {
                      const isTesting = testingMonitorId === m.id;
                      const isSelected = activeChartMonitor?.id === m.id;
                      const latestResult = m.results?.[0];
                      const isUp = m.status === 'UP';
                      const isDown = m.status === 'DOWN';
                      const recentHits = m.results?.slice(0, 10).reverse() || [];

                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMonitorId(m.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                            isSelected
                              ? 'bg-[#121929] border-purple-500/80 ring-1 ring-purple-500/30 shadow-[0_0_16px_rgba(147,51,234,0.15)]'
                              : 'bg-[#0E1422] border-[#1E293B] hover:border-slate-700 hover:bg-[#111726]'
                          }`}
                        >
                          {/* URL & Method info */}
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Live Status Indicator */}
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              {isUp && (
                                <>
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                </>
                              )}
                              {isDown && <span className="inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />}
                              {!isUp && !isDown && (
                                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-slate-500" />
                              )}
                            </span>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141C2E] text-purple-300 border border-purple-800/40">
                                  {m.method}
                                </span>
                                <span className="text-xs font-mono text-white truncate max-w-sm">
                                  {m.url}
                                </span>
                                <a
                                  href={m.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                  <ExternalLink size={11} />
                                </a>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1 pl-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} /> Every {m.interval}s
                                </span>
                                {latestResult && (
                                  <span className="flex items-center gap-1 text-slate-300 font-mono">
                                    <Zap size={11} className="text-amber-400" />
                                    {latestResult.responseTime}ms
                                    {latestResult.statusCode && (
                                      <span className="text-slate-500">
                                        ({latestResult.statusCode})
                                      </span>
                                    )}
                                  </span>
                                )}

                                {/* Recent hits mini pills */}
                                {recentHits.length > 0 && (
                                  <div className="flex items-center gap-1 ml-1" title="Recent hit history">
                                    <span className="text-[10px] text-slate-600">Hits:</span>
                                    {recentHits.map((r, idx) => (
                                      <span
                                        key={idx}
                                        title={`${r.responseTime}ms (${r.statusCode ?? 'err'}) at ${new Date(
                                          r.checkedAt
                                        ).toLocaleTimeString()}`}
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          r.success ? 'bg-emerald-400' : 'bg-red-400'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div
                            className="flex items-center gap-2 self-end sm:self-center shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleTestMonitor(m.id)}
                              disabled={isTesting}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141C2E] hover:bg-[#1A243B] text-slate-200 border border-[#232D42] text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Play size={11} className={isTesting ? 'animate-spin text-purple-400' : ''} />
                              <span>{isTesting ? 'Pinging...' : 'Test Now'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMonitor(m.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete monitor"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0E1422] border border-[#1E293B] text-center flex flex-col items-center justify-center gap-2">
              <Folder size={28} className="text-slate-600" />
              <p className="text-xs font-semibold text-white">Select or create a project</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Pick a project from the left to view and add monitored API URLs.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* ── Minimal Create Project Modal ──────────────────────────────────── */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0E1422] border border-[#1E293B] shadow-2xl flex flex-col gap-4 text-white">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Folder size={16} className="text-purple-400" />
              Create New Project
            </h3>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Production APIs"
                  required
                  autoFocus
                  className="px-3 py-2 rounded-xl bg-[#080B13] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Description (Optional)</label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="e.g. Health checks for payment gateways"
                  className="px-3 py-2 rounded-xl bg-[#080B13] border border-[#1E293B] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
