import React, { useState, useMemo } from 'react';
import { Activity, Clock, Zap, CheckCircle2, AlertCircle, Play, ExternalLink } from 'lucide-react';

export interface MonitorResult {
  id?: string;
  responseTime: number;
  statusCode: number | null;
  success: boolean;
  checkedAt: string;
}

export interface Monitor {
  id: string;
  projectId: string;
  url: string;
  method: string;
  interval: number;
  status: 'UP' | 'DOWN' | 'PENDING' | 'PAUSED';
  results?: MonitorResult[];
}

interface LatencyChartProps {
  monitor: Monitor;
  onTestNow?: (id: string) => void;
  isTesting?: boolean;
}

export const LatencyChart: React.FC<LatencyChartProps> = ({
  monitor,
  onTestNow,
  isTesting = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    result: MonitorResult;
  } | null>(null);

  // Sort chronologically (oldest to newest, left-to-right)
  const sortedResults = useMemo(() => {
    const list = [...(monitor.results || [])];
    return list.sort(
      (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
    );
  }, [monitor.results]);

  // Aggregate metrics
  const totalHits = sortedResults.length;
  const latestResult = sortedResults[sortedResults.length - 1];
  const avgLatency = totalHits
    ? Math.round(sortedResults.reduce((acc, r) => acc + r.responseTime, 0) / totalHits)
    : 0;
  const minLatency = totalHits
    ? Math.min(...sortedResults.map((r) => r.responseTime))
    : 0;
  const maxLatency = totalHits
    ? Math.max(...sortedResults.map((r) => r.responseTime))
    : 0;
  const successCount = sortedResults.filter((r) => r.success).length;
  const uptimeRate = totalHits ? ((successCount / totalHits) * 100).toFixed(0) : '100';

  // SVG Chart Dimensions
  const width = 800;
  const height = 230;
  const padding = { top: 30, right: 30, bottom: 35, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Latency Y-Scale
  const yMax = Math.max(100, Math.ceil((maxLatency * 1.25) / 50) * 50);
  const yMin = 0;

  // Calculate coordinates for each interval hit
  const points = useMemo(() => {
    return sortedResults.map((r, i) => {
      const x =
        sortedResults.length === 1
          ? padding.left + chartWidth / 2
          : padding.left + (i / (sortedResults.length - 1)) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((r.responseTime - yMin) / (yMax - yMin)) * chartHeight;
      return { x, y, result: r, index: i };
    });
  }, [sortedResults, chartWidth, chartHeight, yMax]);

  // Generate smooth cubic bezier curve
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };
    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${padding.left} ${p.y} L ${padding.left + chartWidth} ${p.y}`,
        areaPath: `M ${padding.left} ${p.y} L ${padding.left + chartWidth} ${p.y} L ${
          padding.left + chartWidth
        } ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`,
      };
    }

    const path = points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (p.x - prev.x) / 2;
      const cpY2 = p.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, '');

    const area = `${path} L ${points[points.length - 1].x} ${
      padding.top + chartHeight
    } L ${points[0].x} ${padding.top + chartHeight} Z`;

    return { linePath: path, areaPath: area };
  }, [points, chartWidth, chartHeight]);

  // Y-axis grid step values
  const yGridTicks = [0, 0.33, 0.66, 1].map((pct) => ({
    yVal: Math.round(yMax * pct),
    yPos: padding.top + chartHeight - pct * chartHeight,
  }));

  // X-axis timestamps to display (up to 5 evenly spaced)
  const xLabels = useMemo(() => {
    if (points.length <= 1) return [];
    const count = Math.min(5, points.length);
    const step = Math.floor((points.length - 1) / (count - 1));
    const labels = [];
    for (let i = 0; i < points.length; i += step) {
      const p = points[i];
      const d = new Date(p.result.checkedAt);
      const timeStr = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      labels.push({ x: p.x, label: timeStr });
      if (labels.length === count) break;
    }
    // Always include the last one if not already present
    const lastP = points[points.length - 1];
    if (labels[labels.length - 1].x !== lastP.x) {
      const d = new Date(lastP.result.checkedAt);
      labels[labels.length - 1] = {
        x: lastP.x,
        label: d.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
    }
    return labels;
  }, [points]);

  return (
    <div className="rounded-2xl bg-[#0E1422] border border-[#1E293B] p-5 shadow-xl flex flex-col gap-5 text-white">
      {/* ── Top Header of Selected Monitor ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Activity size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141C2E] text-purple-300 border border-purple-800/40">
                {monitor.method}
              </span>
              <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md font-mono">
                {monitor.url}
              </h3>
              <a
                href={monitor.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-purple-400" />
                Interval: <strong className="text-slate-200">{monitor.interval}s</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    monitor.status === 'UP'
                      ? 'bg-emerald-400 animate-pulse'
                      : monitor.status === 'DOWN'
                      ? 'bg-red-400'
                      : 'bg-amber-400'
                  }`}
                />
                Status: <strong className="text-slate-200">{monitor.status}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        {onTestNow && (
          <button
            onClick={() => onTestNow(monitor.id)}
            disabled={isTesting}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold text-xs text-white shadow-[0_0_12px_rgba(147,51,234,0.35)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Play size={12} className={isTesting ? 'animate-spin text-purple-300' : ''} />
            <span>{isTesting ? 'Testing Hit...' : 'Trigger Hit Now'}</span>
          </button>
        )}
      </div>

      {/* ── Key Metrics Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#080B13] border border-[#1E293B]">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Latest Latency
          </span>
          <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1">
            {latestResult ? latestResult.responseTime : 0}
            <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Status: {latestResult?.statusCode ? `${latestResult.statusCode}` : 'Pending'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#080B13] border border-[#1E293B]">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Average Latency
          </span>
          <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1">
            {avgLatency}
            <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Min: {minLatency}ms / Max: {maxLatency}ms
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#080B13] border border-[#1E293B]">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Uptime SLA
          </span>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
            {uptimeRate}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {successCount} of {totalHits} checks OK
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#080B13] border border-[#1E293B]">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Interval Hits
          </span>
          <div className="text-xl font-bold text-purple-400 mt-1 flex items-baseline gap-1">
            {totalHits}
            <span className="text-xs font-normal text-slate-400">recorded</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Auto-repeating every {monitor.interval}s
          </span>
        </div>
      </div>

      {/* ── Main SVG Area Chart ─────────────────────────────────────────── */}
      <div className="relative w-full rounded-xl bg-[#080B13] border border-[#1E293B] p-3 sm:p-4 overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-amber-400" />
            <span className="font-semibold text-slate-300">Response Time Trend (Per Interval Hit)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Success (2xx)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Error (4xx/5xx)
            </span>
          </div>
        </div>

        {totalHits === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 gap-2">
            <Clock size={28} className="text-purple-400/60 animate-pulse" />
            <p className="text-xs font-semibold text-slate-300">
              Waiting for initial interval hit...
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm">
              The worker pings this API every {monitor.interval} seconds. You can also click{' '}
              <span className="text-purple-400 font-semibold">"Trigger Hit Now"</span> above to record an immediate data point!
            </p>
          </div>
        ) : (
          <div className="w-full relative">
            <svg
              className="w-full h-48 overflow-visible select-none"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                {/* Purple Area Gradient */}
                <linearGradient id={`areaGrad-${monitor.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333EA" stopOpacity="0.45" />
                  <stop offset="80%" stopColor="#9333EA" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#9333EA" stopOpacity="0.0" />
                </linearGradient>

                {/* Stroke Gradient */}
                <linearGradient id={`lineGrad-${monitor.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines & Y-Labels */}
              {yGridTicks.map((t, idx) => (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={t.yPos}
                    x2={width - padding.right}
                    y2={t.yPos}
                    stroke="#1E293B"
                    strokeDasharray={idx === 0 ? '0' : '3 3'}
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={t.yPos + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {t.yVal}ms
                  </text>
                </g>
              ))}

              {/* Gradient Area under curve */}
              {areaPath && (
                <path d={areaPath} fill={`url(#areaGrad-${monitor.id})`} />
              )}

              {/* The Curve Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={`url(#lineGrad-${monitor.id})`}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {points.map((p, idx) => {
                const isHovered = hoveredPoint?.result === p.result;
                const isLast = idx === points.length - 1;
                const isOk = p.result.success;

                return (
                  <g key={idx} className="cursor-pointer">
                    {/* Pulsing ring on latest live point */}
                    {isLast && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="9"
                        fill={isOk ? '#10B981' : '#EF4444'}
                        opacity="0.3"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer hover ring */}
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="8"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    )}

                    {/* Main Point Circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : isLast ? 5 : 4}
                      fill={isOk ? '#10B981' : '#EF4444'}
                      stroke="#080B13"
                      strokeWidth="2"
                      onMouseEnter={() =>
                        setHoveredPoint({ x: p.x, y: p.y, result: p.result })
                      }
                    />
                  </g>
                );
              })}

              {/* Bottom X-Axis Time Labels */}
              {xLabels.map((xl, idx) => (
                <text
                  key={idx}
                  x={xl.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-mono"
                >
                  {xl.label}
                </text>
              ))}
            </svg>

            {/* Hover Tooltip floating box */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-2 rounded-xl bg-[#121929] border border-purple-500/60 shadow-2xl text-xs flex flex-col gap-1"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${(hoveredPoint.y / height) * 100}%`,
                  marginTop: '-12px',
                }}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {hoveredPoint.result.success ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <AlertCircle size={13} className="text-red-400" />
                  )}
                  <span className="text-white">
                    {hoveredPoint.result.responseTime} ms
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      hoveredPoint.result.success
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-red-950 text-red-300'
                    }`}
                  >
                    HTTP {hoveredPoint.result.statusCode ?? 'Err'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(hoveredPoint.result.checkedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
