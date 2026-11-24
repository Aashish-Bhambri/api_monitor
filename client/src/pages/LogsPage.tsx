import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Download,
  RefreshCw,
  FileText,
  Clock,
} from 'lucide-react';
import {
  monitoringApi,
  type MonitorLog,
  type Monitor,
} from '../services/api';

export default function LogsPage() {
  // ── States ──
  const [logs, setLogs] = useState<MonitorLog[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonitorId, setSelectedMonitorId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');

  // Load Data
  const loadData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    try {
      const [logsData, monitorsData] = await Promise.all([
        monitoringApi.getLogs(),
        monitoringApi.getMonitors(),
      ]);
      setLogs(logsData);
      setMonitors(monitorsData);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    const intervalTimer = setInterval(() => loadData(false), 8000);
    return () => clearInterval(intervalTimer);
  }, [loadData]);

  // Enriched Logs parsing executionResult
  const enrichedLogs = useMemo(() => {
    return logs.map((log) => {
      let parsed: any = {};
      try {
        parsed = JSON.parse(log.executionResult || '{}');
      } catch {
        // fallback
      }

      const statusCode: number =
        parsed.statusCode ?? (parsed.success ? 200 : 500);
      const isSuccess: boolean =
        parsed.success ?? (statusCode >= 200 && statusCode < 400);
      const responseTime: number = parsed.responseTime ?? 0;
      const reqDetails = (log.requestDetails as any) || {};
      const method = reqDetails.method || 'GET';
      const url = reqDetails.url || log.monitor?.url || '/';

      let message = 'Request successful';
      if (!isSuccess) {
        if (statusCode === 500) message = 'Internal Server Error';
        else if (statusCode === 502) message = 'Bad Gateway';
        else if (statusCode === 504) message = 'Gateway Timeout';
        else if (statusCode === 404) message = 'Not Found';
        else message = log.error || parsed.error || `HTTP ${statusCode} Error`;
      }

      const monitorName =
        log.monitor?.project?.name ||
        monitors.find((m) => m.id === log.monitorId)?.project?.name ||
        'API Service';

      return {
        ...log,
        statusCode,
        isSuccess,
        responseTime,
        method,
        url,
        message,
        monitorName,
      };
    });
  }, [logs, monitors]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return enrichedLogs.filter((log) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.url.toLowerCase().includes(q) ||
        log.monitorName.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q) ||
        String(log.statusCode).includes(q);

      // 2. Monitor Filter
      const matchesMonitor =
        selectedMonitorId === 'all' || log.monitorId === selectedMonitorId;

      // 3. Status Filter
      let matchesStatus = true;
      if (selectedStatus === '200') matchesStatus = log.statusCode >= 200 && log.statusCode < 300;
      else if (selectedStatus === '4xx') matchesStatus = log.statusCode >= 400 && log.statusCode < 500;
      else if (selectedStatus === '5xx') matchesStatus = log.statusCode >= 500;

      // 4. Level Filter
      let matchesLevel = true;
      if (selectedLevel === 'error') matchesLevel = !log.isSuccess;
      else if (selectedLevel === 'success') matchesLevel = log.isSuccess;

      return matchesSearch && matchesMonitor && matchesStatus && matchesLevel;
    });
  }, [enrichedLogs, searchQuery, selectedMonitorId, selectedStatus, selectedLevel]);

  // Format Time
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'Monitor', 'Method', 'URL', 'Status', 'Response Time (ms)', 'Message'];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt).toISOString(),
      `"${l.monitorName.replace(/"/g, '""')}"`,
      l.method,
      `"${l.url.replace(/"/g, '""')}"`,
      l.statusCode,
      l.responseTime,
      `"${l.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `api_monitor_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 w-full p-6 lg:p-8 space-y-6 bg-[#000000] text-neutral-100 font-sans selection:bg-purple-600 selection:text-white max-w-7xl mx-auto">
      {/* ── Header Bar (Matching Image 6) ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Logs Explorer</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-300 font-mono font-medium">
              Live Stream
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time audit telemetry & health check execution stream
          </p>
        </div>

        {/* Info & Time Filter on Right */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 font-mono">
            Showing {filteredLogs.length > 0 ? `1-${filteredLogs.length}` : '0'} of {enrichedLogs.length}
          </span>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121212] border border-[#222222] text-xs text-neutral-300">
            <Clock size={12} className="text-purple-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
            >
              <option value="1h" className="bg-[#141414]">Last 1 hour</option>
              <option value="6h" className="bg-[#141414]">Last 6 hours</option>
              <option value="24h" className="bg-[#141414]">Last 24 hours</option>
              <option value="7d" className="bg-[#141414]">Last 7 days</option>
            </select>
          </div>

          <button
            onClick={() => loadData(true)}
            className="p-2 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-purple-400' : ''} />
          </button>
        </div>
      </header>

      {/* ── Filter Controls Row (Matching Image 6) ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by URL, message, or code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0E0E0E] border border-[#222222] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Dropdown Filters & Export CSV Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dropdown: Levels */}
          <div className="px-3 py-1.5 rounded-xl bg-[#0E0E0E] border border-[#222222] text-xs">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-transparent text-neutral-300 font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141414]">All Levels</option>
              <option value="success" className="bg-[#141414]">SUCCESS</option>
              <option value="error" className="bg-[#141414]">ERROR</option>
            </select>
          </div>

          {/* Dropdown: Monitors */}
          <div className="px-3 py-1.5 rounded-xl bg-[#0E0E0E] border border-[#222222] text-xs max-w-[180px]">
            <select
              value={selectedMonitorId}
              onChange={(e) => setSelectedMonitorId(e.target.value)}
              className="bg-transparent text-neutral-300 font-medium outline-none cursor-pointer truncate max-w-full"
            >
              <option value="all" className="bg-[#141414]">All Monitors</option>
              {monitors.map((m) => {
                const label = m.url.replace(/^https?:\/\//, '').slice(0, 25);
                return (
                  <option key={m.id} value={m.id} className="bg-[#141414]">
                    {m.method} {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Dropdown: Statuses */}
          <div className="px-3 py-1.5 rounded-xl bg-[#0E0E0E] border border-[#222222] text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-neutral-300 font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141414]">All Statuses</option>
              <option value="200" className="bg-[#141414]">2xx Success</option>
              <option value="4xx" className="bg-[#141414]">4xx Client Error</option>
              <option value="5xx" className="bg-[#141414]">5xx Server Error</option>
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-[0_0_12px_rgba(147,51,234,0.35)] transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Logs Table (Matching Image 6) ── */}
      <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1A1A1A] text-[11px] font-semibold text-neutral-400 tracking-wider">
                <th className="py-3.5 px-5">Time →</th>
                <th className="py-3.5 px-4">Monitor</th>
                <th className="py-3.5 px-4">Status →</th>
                <th className="py-3.5 px-4">Response Time</th>
                <th className="py-3.5 px-5">Message</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#161616]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    <FileText size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium text-neutral-400">No logs found</p>
                    <p className="text-xs text-neutral-600 mt-1">
                      Automated hits log every interval. Try adjusting filters above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSuccess = log.isSuccess;
                  const durationStr =
                    log.responseTime >= 1000
                      ? `${(log.responseTime / 1000).toFixed(1)} s`
                      : `${log.responseTime} ms`;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#121212] transition-colors font-mono text-xs"
                    >
                      {/* 1. Time */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-neutral-400">
                        {formatTime(log.createdAt)}
                      </td>

                      {/* 2. Monitor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {log.monitorName}
                          </span>
                          <span className="text-[11px] text-neutral-500 truncate max-w-[140px]">
                            {log.url}
                          </span>
                        </div>
                      </td>

                      {/* 3. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            isSuccess
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-red-950/60 text-red-400 border border-red-800/40'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSuccess ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'
                            }`}
                          />
                          {log.statusCode}
                        </span>
                      </td>

                      {/* 4. Response Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={
                            log.responseTime > 800
                              ? 'text-red-400'
                              : log.responseTime > 300
                              ? 'text-amber-400'
                              : 'text-neutral-200'
                          }
                        >
                          {durationStr}
                        </span>
                      </td>

                      {/* 5. Message */}
                      <td className="py-3.5 px-5 font-sans text-xs text-neutral-300">
                        {log.message}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}