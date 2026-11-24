import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  Activity,
  Plus,
  RefreshCw,
  Folder,
  Globe,
  Clock,
  Zap,
  Play,
  Pause,
  ArrowUpRight,
  ExternalLink,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  monitoringApi,
  type Project,
  type Monitor,
} from '../services/api';
import Chart from '../components/Chart';
import Timeline from '../components/Timeline';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monitorParam = searchParams.get('monitorId');
  const projectParam = searchParams.get('projectId');

  // ── States ──
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [selectedMonitorId, setSelectedMonitorId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Auto-refresh (polling)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastSynced, setLastSynced] = useState<string>('Just now');

  // Timeline pagination limit (controlled so 5s polling does NOT collapse it)
  const [timelineLimit, setTimelineLimit] = useState(10);

  // Target project for new monitor modal
  const [targetProjectId, setTargetProjectId] = useState<string>('');

  // Action loaders
  const [isTriggering, setIsTriggering] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modals
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [showNewMonitorModal, setShowNewMonitorModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newMethod, setNewMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [newInterval, setNewInterval] = useState(60);

  // ── 1. Fetch Projects ──
  const loadProjects = useCallback(async () => {
    try {
      const data = await monitoringApi.getProjects();
      setProjects(data);
      if (projectParam && data.some((p) => p.id === projectParam)) {
        setSelectedProjectId(projectParam);
      }
      // If no projectParam in URL, stay on '' (All Projects) so all fleet endpoints remain visible and never vanish!
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }, [projectParam]);

  // ── 2. Fetch Monitors for selected project ──
  const loadMonitors = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setIsLoading(true);
      try {
        const data = await monitoringApi.getMonitors(
          selectedProjectId || undefined
        );
        setMonitors(data);
        setLastSynced(
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );

        if (data.length > 0) {
          // If query param matches, pick it; else keep current or select first
          if (monitorParam && data.some((m) => m.id === monitorParam)) {
            setSelectedMonitorId(monitorParam);
          } else {
            setSelectedMonitorId((prev) =>
              prev && data.some((m) => m.id === prev) ? prev : data[0].id
            );
          }
        } else {
          setSelectedMonitorId('');
        }
      } catch (err) {
        console.error('Failed to load monitors:', err);
      } finally {
        if (showSpinner) setIsLoading(false);
      }
    },
    [selectedProjectId, monitorParam]
  );

  // Initial load
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load monitors when selected project changes
  useEffect(() => {
    loadMonitors(true);
  }, [selectedProjectId, loadMonitors]);

  // Live polling every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const intervalTimer = setInterval(() => {
      loadMonitors(false);
    }, 5000);
    return () => clearInterval(intervalTimer);
  }, [autoRefresh, loadMonitors]);

  // Active selected project & monitor objects
  const activeMonitor = useMemo(() => {
    if (!monitors.length) return null;
    return monitors.find((m) => m.id === selectedMonitorId) || monitors[0] || null;
  }, [monitors, selectedMonitorId]);

  const activeProject = useMemo(() => {
    if (selectedProjectId) {
      return projects.find((p) => p.id === selectedProjectId) || null;
    }
    if (activeMonitor?.projectId) {
      return projects.find((p) => p.id === activeMonitor.projectId) || null;
    }
    return projects[0] || null;
  }, [projects, selectedProjectId, activeMonitor]);

  // Update query params when monitor changes
  const handleSelectMonitor = (id: string) => {
    setSelectedMonitorId(id);
    setTimelineLimit(10); // reset timeline visible window when switching monitors intentionally
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('monitorId', id);
      return next;
    });
  };

  // ── Actions ──
  const handlePause = async () => {
    if (!activeMonitor) return;
    setIsActionLoading(true);
    try {
      await monitoringApi.pauseMonitor(activeMonitor.id);
      await loadMonitors(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to pause monitor');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!activeMonitor) return;
    setIsActionLoading(true);
    try {
      await monitoringApi.resumeMonitor(activeMonitor.id, activeMonitor.interval);
      await loadMonitors(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resume monitor');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleChangeInterval = async (interval: number) => {
    if (!activeMonitor) return;
    setIsActionLoading(true);
    try {
      await monitoringApi.updateMonitor(activeMonitor.id, { interval });
      await loadMonitors(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update interval');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTriggerHit = async () => {
    if (!activeMonitor) return;
    setIsTriggering(true);
    try {
      await monitoringApi.testMonitor(activeMonitor.id);
      await loadMonitors(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Manual test failed');
    } finally {
      setIsTriggering(false);
    }
  };

  const handleDeleteMonitor = async () => {
    if (!activeMonitor) return;
    if (!confirm(`Are you sure you want to delete "${activeMonitor.url}"? This will delete all its telemetry history.`)) {
      return;
    }
    setIsActionLoading(true);
    try {
      await monitoringApi.deleteMonitor(activeMonitor.id);
      const remaining = monitors.filter((m) => m.id !== activeMonitor.id);
      setMonitors(remaining);
      if (remaining.length > 0) {
        handleSelectMonitor(remaining[0].id);
      } else {
        setSelectedMonitorId('');
      }
      await loadMonitors(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete monitor');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSeedDemoFleet = async () => {
    const projId = selectedProjectId || projects[0]?.id;
    if (!projId) {
      alert('Please create a project first before seeding demo monitors');
      return;
    }
    setIsActionLoading(true);
    try {
      // 1. GitHub API (Operational • 60s)
      const m1 = await monitoringApi.createMonitor({
        projectId: projId,
        url: 'https://api.github.com',
        method: 'GET',
        interval: 60,
      });
      // 2. HttpBin 500 (Down / Incident • 60s)
      const m2 = await monitoringApi.createMonitor({
        projectId: projId,
        url: 'https://httpbin.org/status/500',
        method: 'GET',
        interval: 60,
      });
      // 3. HttpBin Delay (Paused • 120s)
      const m3 = await monitoringApi.createMonitor({
        projectId: projId,
        url: 'https://httpbin.org/get',
        method: 'GET',
        interval: 120,
      });

      // Execute tests so telemetry jumps live
      await monitoringApi.testMonitor(m1.id).catch(() => {});
      await monitoringApi.testMonitor(m2.id).catch(() => {});
      await monitoringApi.pauseMonitor(m3.id).catch(() => {});

      await loadMonitors(false);
      handleSelectMonitor(m1.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to seed demo fleet');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const created = await monitoringApi.createProject(
        newProjectName.trim(),
        newProjectDesc.trim() || undefined
      );
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProjectModal(false);
      await loadProjects();
      setSelectedProjectId(created.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleCreateMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    const projId = targetProjectId || selectedProjectId || projects[0]?.id;
    if (!projId) {
      alert('Please create a project first before adding monitors');
      return;
    }
    if (!newUrl.trim()) return;
    try {
      const created = await monitoringApi.createMonitor({
        projectId: projId,
        url: newUrl.trim(),
        method: newMethod,
        interval: Number(newInterval) || 60,
      });
      setNewUrl('');
      setShowNewMonitorModal(false);
      await loadMonitors(false);
      handleSelectMonitor(created.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create monitor');
    }
  };

  // ── Metrics Calculation (for the 7 Cards) ──
  const results = activeMonitor?.results || [];
  const totalPings = results.length;
  const successPings = results.filter((r) => r.success).length;
  const failCount = totalPings - successPings;
  const uptimePercent = totalPings > 0 ? ((successPings / totalPings) * 100).toFixed(1) : '100';

  const avgLatency =
    totalPings > 0
      ? Math.round(results.reduce((acc, r) => acc + r.responseTime, 0) / totalPings)
      : 0;
  const minLatency = totalPings > 0 ? Math.min(...results.map((r) => r.responseTime)) : 0;
  const maxLatency = totalPings > 0 ? Math.max(...results.map((r) => r.responseTime)) : 0;

  const latestResult = results[0]; // results are sorted desc from backend
  const lastCheckTime = latestResult
    ? new Date(latestResult.checkedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Never';

  const lastCheckTimeAgo = useMemo(() => {
    if (!latestResult) return 'Never checked';
    const diffSec = Math.round((Date.now() - new Date(latestResult.checkedAt).getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return `${Math.floor(diffSec / 3600)}h ago`;
  }, [latestResult]);

  // Calculate Up for Time
  const upForTime = useMemo(() => {
    if (!activeMonitor) return 'No active monitor';
    if (activeMonitor.status === 'PAUSED') return 'Currently Paused';
    if (activeMonitor.status === 'DOWN') return 'Currently Down';
    if (!latestResult) return 'Awaiting initial check';

    // Calculate time from monitor creation or latest result
    const startTime = activeMonitor.createdAt
      ? new Date(activeMonitor.createdAt).getTime()
      : Date.now() - 3600000;
    const diffSec = Math.round((Date.now() - startTime) / 1000);
    if (diffSec < 60) return `${diffSec} seconds`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`;
    const hours = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    return `${hours}h ${mins}m`;
  }, [activeMonitor, latestResult]);

  const incidentCount = activeMonitor?.incidents?.length ?? (failCount > 0 ? 1 : 0);

  return (
    <div className="flex-1 w-full p-6 lg:p-8 space-y-7 bg-[#000000] text-neutral-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* ── Top Header Bar (Matching Image 1) ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
         

          <div className="min-w-0 flex-1 overflow-hidden">
            {/* Breadcrumb: Project Name / API Key Name */}
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
              <span className="text-neutral-500">Workspace</span>
              <span>/</span>
              <div className="relative inline-block shrink-0">
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedProjectId(val);
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      if (val) {
                        next.set('projectId', val);
                      } else {
                        next.delete('projectId');
                      }
                      return next;
                    });
                  }}
                  className="bg-transparent text-white font-semibold outline-none cursor-pointer hover:text-purple-300 transition-colors"
                >
                  <option value="" className="bg-[#141414] text-white">
                    All Projects ({monitors.length} endpoints)
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#141414] text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <span>/</span>
              {monitors.length > 1 ? (
                <div className="relative inline-block max-w-[200px] sm:max-w-xs md:max-w-md overflow-hidden">
                  <select
                    value={activeMonitor?.id || ''}
                    onChange={(e) => handleSelectMonitor(e.target.value)}
                    className="bg-transparent text-purple-300 font-mono font-medium outline-none cursor-pointer hover:text-white transition-colors truncate max-w-full"
                  >
                    {monitors.map((m) => {
                      const display = m.url.length > 45 ? m.url.slice(0, 42) + '...' : m.url;
                      return (
                        <option key={m.id} value={m.id} className="bg-[#141414] text-white font-mono">
                          {m.method} {display}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <span className="text-neutral-300 font-mono truncate max-w-[200px] sm:max-w-xs inline-block" title={activeMonitor?.url}>
                  {activeMonitor ? activeMonitor.url : 'No Endpoint'}
                </span>
              )}
            </div>

            {/* Subtitle: API key name which is being monitor */}
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1 min-w-0">
              <span
                className="truncate max-w-[240px] sm:max-w-md md:max-w-lg lg:max-w-xl font-mono text-white inline-block"
                title={activeMonitor ? activeMonitor.url : ''}
              >
                {activeMonitor ? activeMonitor.url : 'No Active Monitor Selected'}
              </span>

              {activeMonitor && (
                <a
                  href={activeMonitor.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded text-neutral-500 hover:text-purple-300 transition-colors shrink-0"
                  title="Open endpoint in new tab"
                >
                  <ExternalLink size={13} />
                </a>
              )}

              {activeMonitor && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                    activeMonitor.status === 'UP'
                      ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]'
                      : activeMonitor.status === 'DOWN'
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : activeMonitor.status === 'PAUSED'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeMonitor.status === 'UP'
                        ? 'bg-[#10B981] animate-pulse'
                        : activeMonitor.status === 'DOWN'
                        ? 'bg-red-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  {activeMonitor.status}
                </span>
              )}
            </h1>
            {activeProject?.description && (
              <p className="text-xs text-neutral-400 mt-0.5">{activeProject.description}</p>
            )}
          </div>
        </div>

        {/* Action Controls on Top Right */}
        <div className="flex items-center gap-2.5 self-start md:self-center">
          

          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="p-2 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-[#222222] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={autoRefresh ? 'Pause auto-polling' : 'Resume auto-polling'}
          >
            {autoRefresh ? <Pause size={13} /> : <Play size={13} />}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={() => loadMonitors(true)}
            className="p-2 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-[#222222] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh fleet immediately"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-purple-400' : ''} />
          </button>

          {/* New Monitor Button */}
          <button
            onClick={() => {
              setTargetProjectId(selectedProjectId || projects[0]?.id || '');
              setShowNewMonitorModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-white text-xs font-semibold border border-[#333333] transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Monitor</span>
          </button>

          {/* New Project Button */}
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-[0_0_12px_rgba(147,51,234,0.3)] transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* ── 7 METRIC CARDS (Exact Layout from Image 1) ── */}
      <section className="space-y-4">
        {/* ROW 1 (4 Cards): Uptime in % | Fail number | Average ping latency | Total Pings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Uptime in % */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] hover:border-neutral-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">
                Uptime in %
              </span>
              
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{uptimePercent}%</div>
            <p className="text-xs text-neutral-400 mt-1">
              Calculated over {totalPings} checks
            </p>
          </div>

          {/* Card 2: Fail number */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] hover:border-neutral-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">
                Fail number
              </span>
              
            </div>
            <div
              className={`text-3xl font-bold tracking-tight ${
                failCount === 0 ? 'text-white' : 'text-red-400'
              }`}
            >
              {failCount}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {failCount === 0 ? 'No downtime recorded' : 'Unsuccessful requests'}
            </p>
          </div>

          {/* Card 3: Average ping latency */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] hover:border-neutral-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">
                Average ping latency
              </span>
              
            </div>
            <div className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-1">
              {avgLatency} <span className="text-sm font-normal text-neutral-400">ms</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Min: {minLatency}ms • Max: {maxLatency}ms
            </p>
          </div>

          {/* Card 4: Total Pings */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] hover:border-neutral-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">
                Total Pings
              </span>
              <span className="inline-flex items-center gap-1 text-neutral-300 font-semibold bg-neutral-800 px-2 py-0.5 rounded-full text-[11px]">
                {activeMonitor ? `Every ${activeMonitor.interval}s` : 'Idle'}
              </span>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{totalPings}</div>
            <p className="text-xs text-neutral-400 mt-1">
              Automated checks executed
            </p>
          </div>
        </div>

        {/* ROW 2 (3 Cards): Up for Time | last Check at | Incidents */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 5: Up for Time */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] hover:border-neutral-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">
                Up for Time
              </span>
              
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
              {upForTime}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Continuous operational period
            </p>
          </div>

          {/* Card 6: last Check at */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] hover:border-neutral-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">
                last Check at
              </span>
              <span className="inline-flex items-center gap-1 text-neutral-300 font-semibold bg-neutral-800 px-2 py-0.5 rounded-full text-[11px]">
                {latestResult?.statusCode ? `HTTP ${latestResult.statusCode}` : 'Pending'}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {lastCheckTimeAgo}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Timestamp: {lastCheckTime}
            </p>
          </div>

          {/* Card 7: Incidents */}
          <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] hover:border-neutral-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">
                Incidents
              </span>
              
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{incidentCount}</div>
            <p className="text-xs text-neutral-400 mt-1">
              {incidentCount === 0 ? 'No open incidents' : `${incidentCount} active outage alerts`}
            </p>
          </div>
        </div>
      </section>

      {/* ── CHART SECTION WITH CONTROL LOGIC (Matching Image 2) ── */}
      <Chart
        monitor={activeMonitor}
        onPause={handlePause}
        onResume={handleResume}
        onChangeInterval={handleChangeInterval}
        onTriggerHit={handleTriggerHit}
        onDelete={handleDeleteMonitor}
        isTriggering={isTriggering}
        isActionLoading={isActionLoading}
      />

      {/* ── TIMELINE SECTION (Matching Image 2) ── */}
      <Timeline
        key={activeMonitor?.id}
        results={activeMonitor?.results}
        logs={activeMonitor?.logs}
        interval={activeMonitor?.interval}
        visibleCount={timelineLimit}
        onShowMore={() => setTimelineLimit((prev) => prev + 10)}
        onShowAll={(total) => setTimelineLimit(total || activeMonitor?.results?.length || 100)}
        onShowLess={() => setTimelineLimit(10)}
      />

      {/* ── CREATE PROJECT MODAL ── */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl flex flex-col gap-4 text-white">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Folder size={18} className="text-purple-400" />
              <span>Create New Project</span>
            </h3>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-400">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Production APIs"
                  required
                  autoFocus
                  className="px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#262626] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-400">Description (Optional)</label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="e.g. Health checks for microservices"
                  className="px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#262626] text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
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

      {/* ── ADD MONITOR MODAL ── */}
      {showNewMonitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl flex flex-col gap-4 text-white">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe size={18} className="text-purple-400" />
              <span>Add New API Endpoint</span>
            </h3>

            <form onSubmit={handleCreateMonitor} className="flex flex-col gap-3">
              {/* Target Project Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-400">Target Project</label>
                {projects.length > 0 ? (
                  <select
                    value={targetProjectId || selectedProjectId || projects[0]?.id}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#262626] text-xs text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-400">Please create a project first</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-400">Endpoint URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://api.example.com/health"
                  required
                  autoFocus
                  className="px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#262626] text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-400">HTTP Method</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#262626] text-xs text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-400">Interval</label>
                  <select
                    value={newInterval}
                    onChange={(e) => setNewInterval(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[#262626] text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value={60}>60s (Recommended • -83% Redis load)</option>
                    <option value={120}>120s (2m Demo Fleet)</option>
                    <option value={300}>300s (5m)</option>
                    <option value={30}>30s</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowNewMonitorModal(false)}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white cursor-pointer"
                >
                  Start Monitoring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
