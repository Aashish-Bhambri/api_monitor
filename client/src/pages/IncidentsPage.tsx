import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Bell,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import {
  monitoringApi,
  type Incident,
  type Monitor,
  type MonitorLog,
} from '../services/api';

export default function IncidentsPage() {
  const navigate = useNavigate();

  // ── State ──
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [logs, setLogs] = useState<MonitorLog[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Load Data
  const loadData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    try {
      const [incidentsData, monitorsData, logsData] = await Promise.all([
        monitoringApi.getIncidents(),
        monitoringApi.getMonitors(),
        monitoringApi.getLogs(),
      ]);
      setIncidents(incidentsData);
      setMonitors(monitorsData);
      setLogs(logsData);

      // Auto-select first incident if not selected
      if (!selectedIncidentId && incidentsData.length > 0) {
        setSelectedIncidentId(incidentsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, [selectedIncidentId]);

  useEffect(() => {
    loadData(true);
    const intervalTimer = setInterval(() => loadData(false), 8000);
    return () => clearInterval(intervalTimer);
  }, [loadData]);

  // Active vs Resolved
  const activeIncidents = useMemo(
    () => incidents.filter((inc) => inc.status === 'ONGOING'),
    [incidents]
  );
  const resolvedIncidents = useMemo(
    () => incidents.filter((inc) => inc.status === 'RESOLVED'),
    [incidents]
  );

  const displayedIncidents = activeTab === 'active' ? activeIncidents : resolvedIncidents;
  const currentIncident =
    incidents.find((i) => i.id === selectedIncidentId) || displayedIncidents[0] || null;

  // Find monitor associated with current incident
  const currentMonitor = useMemo(() => {
    if (!currentIncident) return null;
    return (
      currentIncident.monitor ||
      monitors.find((m) => m.id === currentIncident.monitorId) ||
      null
    );
  }, [currentIncident, monitors]);

  // Related Logs for current incident
  const relatedLogs = useMemo(() => {
    if (!currentMonitor) return logs.slice(0, 5);
    const filtered = logs.filter((l) => l.monitorId === currentMonitor.id);
    return filtered.length > 0 ? filtered.slice(0, 5) : logs.slice(0, 5);
  }, [currentMonitor, logs]);

  // Acknowledge / Resolve action
  const handleAcknowledge = async () => {
    if (!currentIncident) return;
    setIsAcknowledging(true);
    try {
      await monitoringApi.acknowledgeIncident(currentIncident.id);
      await loadData(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to acknowledge incident');
    } finally {
      setIsAcknowledging(false);
    }
  };

  // Format time helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 w-full p-6 lg:p-8 space-y-6 bg-[#000000] text-neutral-100 font-sans selection:bg-purple-600 selection:text-white max-w-7xl mx-auto">
      {/* ── Header Bar (Matching Image 5) ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Incidents</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                activeIncidents.length > 0
                  ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              }`}
            >
              {activeIncidents.length > 0
                ? `${activeIncidents.length} Active Alert`
                : 'All Systems Operational'}
            </span>
          </h1>

          {/* Filter Tabs: Active (X) | Resolved */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.35)]'
                  : 'bg-[#121212] border border-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              Active ({activeIncidents.length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'resolved'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.35)]'
                  : 'bg-[#121212] border border-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              Resolved ({resolvedIncidents.length})
            </button>

            <button
              onClick={() => loadData(true)}
              className="p-1.5 rounded-lg bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] text-neutral-400 hover:text-white transition-colors cursor-pointer ml-1"
              title="Refresh incidents"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-purple-400' : ''} />
            </button>
          </div>
        </div>

        {/* Top Right: Acknowledge Button */}
        {activeIncidents.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcknowledge}
              disabled={isAcknowledging || !currentIncident}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-[0_0_16px_rgba(147,51,234,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              <span>{isAcknowledging ? 'Resolving...' : 'Acknowledge'}</span>
            </button>
          </div>
        )}
      </header>

      {/* ── Active Incident Banner Card (Matching Image 5) ── */}
      {displayedIncidents.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No {activeTab} incidents</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {activeTab === 'active'
                ? 'All configured API endpoints are responding with healthy 200 OK statuses.'
                : 'No historical resolved outages recorded.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Incident Card */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border transition-all relative overflow-hidden ${
              currentIncident?.status === 'ONGOING'
                ? 'bg-[#1C090E]/90 border-red-900/50 shadow-[0_0_30px_rgba(239,68,68,0.12)]'
                : 'bg-[#0E1712]/90 border-emerald-900/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left: Icon & Title */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                    currentIncident?.status === 'ONGOING'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  <ShieldAlert size={18} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {currentIncident?.status === 'ONGOING'
                        ? 'API is currently down'
                        : 'Incident Resolved'}
                    </h2>
                    {currentMonitor && (
                      <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-black/40 border border-white/10 text-neutral-300 truncate max-w-[240px]">
                        {currentMonitor.url}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">
                    {currentIncident?.cause ||
                      `${currentMonitor?.project?.name || 'Production API'} returned errors during automated interval checks`}
                  </p>
                </div>
              </div>

              {/* Right: Status Pill & Since Timestamp */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    currentIncident?.status === 'ONGOING'
                      ? 'bg-orange-950/80 text-orange-400 border border-orange-800/50'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                  }`}
                >
                  {currentIncident?.status === 'ONGOING' ? 'Investigating' : 'Resolved'}
                </span>

                <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                  <span>Since →</span>
                  <span className="text-white font-semibold">
                    {formatTime(currentIncident?.startedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Incident Timeline (Matching Image 5) ── */}
          <section className="p-6 rounded-2xl bg-[#0E0E0E] border border-[#1F1F1F] shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={15} className="text-purple-400" />
              <span>Incident Timeline</span>
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#222222]">
              {/* Event 1: Failure detected */}
              <div className="relative flex items-center justify-between gap-3 text-xs">
                <span className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-red-400 border-2 border-[#0E0E0E]" />
                <span className="font-mono text-neutral-400 w-16 shrink-0">
                  {formatTime(currentIncident?.startedAt)}
                </span>
                <span className="text-neutral-200 font-medium flex-1">
                  Incident created – Consecutive health check failures detected
                </span>
              </div>

              {/* Event 2: Notification sent */}
              <div className="relative flex items-center justify-between gap-3 text-xs">
                <span className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-sky-400 border-2 border-[#0E0E0E]" />
                <span className="font-mono text-neutral-400 w-16 shrink-0">
                  {formatTime(currentIncident?.startedAt)}
                </span>
                <span className="text-neutral-200 font-medium flex-1 flex items-center gap-1.5">
                  <Bell size={12} className="text-sky-400" />
                  <span>Alert dispatched to notification channels (Webhook & Email)</span>
                </span>
              </div>

              {/* Event 3: Acknowledged or Ongoing */}
              <div className="relative flex items-center justify-between gap-3 text-xs">
                <span
                  className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-[#0E0E0E] ${
                    currentIncident?.status === 'RESOLVED' ? 'bg-emerald-400' : 'bg-purple-400'
                  }`}
                />
                <span className="font-mono text-neutral-400 w-16 shrink-0">
                  {currentIncident?.resolvedAt
                    ? formatTime(currentIncident.resolvedAt)
                    : formatTime(currentIncident?.startedAt)}
                </span>
                <span className="text-neutral-200 font-medium flex-1">
                  {currentIncident?.status === 'RESOLVED'
                    ? `Incident resolved – Service operational (Duration: ${
                        currentIncident.duration ? `${currentIncident.duration}s` : 'under 1m'
                      })`
                    : 'Investigation ongoing – Health checks executing every interval'}
                </span>
              </div>
            </div>
          </section>

          {/* ── Related Logs (Matching Image 5) ── */}
          <section className="p-6 rounded-2xl bg-[#0E0E0E] border border-[#1F1F1F] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio size={15} className="text-purple-400" />
                <span>Related Logs</span>
              </h3>
              <button
                onClick={() => navigate('/logs')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-[#1A1A1A] border-t border-[#1A1A1A]">
              {relatedLogs.map((log, idx) => {
                let parsedResult: any = {};
                try {
                  parsedResult = JSON.parse(log.executionResult || '{}');
                } catch {
                  // ignored
                }
                const statusCode = parsedResult.statusCode ?? (parsedResult.success ? 200 : 500);
                const responseTime = parsedResult.responseTime ?? 180;
                const reqDetails = (log.requestDetails as any) || {};

                return (
                  <div
                    key={log.id || idx}
                    className="py-3 flex items-center justify-between gap-4 text-xs font-mono"
                  >
                    <span className="text-neutral-400 w-20 shrink-0">
                      {formatTime(log.createdAt)}
                    </span>

                    <span className="text-white font-medium truncate flex-1">
                      {reqDetails.method || 'GET'} {reqDetails.url || currentMonitor?.url || '/health'}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                        statusCode >= 200 && statusCode < 400
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-red-950/60 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {statusCode}
                    </span>

                    <span className="text-neutral-300 text-right w-16 shrink-0">
                      {responseTime >= 1000
                        ? `${(responseTime / 1000).toFixed(1)}s`
                        : `${responseTime}ms`}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}