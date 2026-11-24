import { useEffect, useRef, useMemo } from "react";
import {
  Chart as ChartJS,
  type ChartOptions,
  type ScriptableContext,
} from "chart.js";
import "chart.js/auto";
import { Play, Pause, Zap, Clock, Activity, AlertCircle } from "lucide-react";
import type { Monitor } from "../services/api";

interface ChartProps {
  monitor: Monitor | null;
  onPause?: () => void;
  onResume?: () => void;
  onChangeInterval?: (interval: number) => void;
  onTriggerHit?: () => void;
  isTriggering?: boolean;
  isActionLoading?: boolean;
}

export default function Chart({
  monitor,
  onPause,
  onResume,
  onChangeInterval,
  onTriggerHit,
  isTriggering = false,
  isActionLoading = false,
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<"line", number[], string> | null>(null);

  // Chronologically sort results (oldest -> newest, left -> right)
  const sortedResults = useMemo(() => {
    if (!monitor?.results || monitor.results.length === 0) return [];
    return [...monitor.results].sort(
      (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
    );
  }, [monitor?.results]);

  // Labels for X-axis
  const labels = useMemo(() => {
    if (sortedResults.length === 0) return ["No checks yet"];
    return sortedResults.map((r) => {
      const d = new Date(r.checkedAt);
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    });
  }, [sortedResults]);

  // Response time data points
  const responseTimes = useMemo(() => {
    if (sortedResults.length === 0) return [0];
    return sortedResults.map((r) => r.responseTime);
  }, [sortedResults]);

  // Point colors: green for success, red for failures
  const pointColors = useMemo(() => {
    if (sortedResults.length === 0) return ["#525252"];
    return sortedResults.map((r) => (r.success ? "#10B981" : "#EF4444"));
  }, [sortedResults]);

  const maxVal = Math.max(...responseTimes, 100);
  const yAxisMax = Math.ceil((maxVal * 1.25) / 50) * 50;

  // Chart Options
  const chartOptions: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 400,
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(10, 14, 24, 0.95)",
          borderColor: "#334155",
          borderWidth: 1,
          titleColor: "#FFFFFF",
          bodyColor: "#CBD5E1",
          padding: 12,
          usePointStyle: true,
          callbacks: {
            title: (items) => {
              const idx = items[0]?.dataIndex;
              if (idx !== undefined && sortedResults[idx]) {
                const d = new Date(sortedResults[idx].checkedAt);
                return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
              }
              return items[0]?.label || "";
            },
            label: (item) => {
              const idx = item.dataIndex;
              const r = sortedResults[idx];
              if (!r) return `${item.formattedValue} ms`;
              const statusText = r.success
                ? `HTTP ${r.statusCode ?? 200} (OK)`
                : `HTTP ${r.statusCode ?? "Error"} (Failed)`;
              return [`Latency: ${r.responseTime} ms`, `Status: ${statusText}`];
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            color: "#262626",
          },
          ticks: {
            color: "#737373",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7,
            font: {
              size: 11,
              family: "monospace",
            },
          },
        },
        y: {
          beginAtZero: true,
          max: yAxisMax,
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
          border: {
            display: false,
          },
          ticks: {
            color: "#737373",
            font: {
              size: 11,
              family: "monospace",
            },
            callback: (val) => `${val}ms`,
          },
        },
      },
    }),
    [sortedResults, yAxisMax]
  );

  // Initialize and update Chart.js
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!chartRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const chart = new ChartJS<"line", number[], string>(canvasRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Response Time (ms)",
              data: responseTimes,
              borderColor: "#8B5CF6",
              backgroundColor: (context: ScriptableContext<"line">) => {
                const chartInstance = context.chart;
                const { ctx, chartArea } = chartInstance;
                if (!chartArea) return "rgba(139, 92, 246, 0.1)";
                const gradient = ctx.createLinearGradient(
                  0,
                  chartArea.top,
                  0,
                  chartArea.bottom
                );
                gradient.addColorStop(0, "rgba(139, 92, 246, 0.45)");
                gradient.addColorStop(0.7, "rgba(139, 92, 246, 0.08)");
                gradient.addColorStop(1, "rgba(139, 92, 246, 0.0)");
                return gradient;
              },
              borderWidth: 2.5,
              tension: 0.35,
              fill: true,
              pointRadius: sortedResults.length <= 1 ? 6 : 4,
              pointHoverRadius: 7,
              pointBackgroundColor: pointColors,
              pointBorderColor: "#0A0A0A",
              pointBorderWidth: 2,
            },
          ],
        },
        options: chartOptions,
      });

      chartRef.current = chart;
    } else {
      chartRef.current.options = chartOptions;
      chartRef.current.data.labels = labels;
      if (chartRef.current.data.datasets[0]) {
        chartRef.current.data.datasets[0].data = responseTimes;
        chartRef.current.data.datasets[0].pointBackgroundColor = pointColors;
      }
      chartRef.current.update();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, responseTimes, pointColors, chartOptions, sortedResults.length]);

  const isPaused = monitor?.status === "PAUSED";

  return (
    <section className="rounded-2xl border border-[#1F1F1F] bg-[#0E0E0E] p-5 text-white shadow-xl flex flex-col gap-4">
      {/* ── Header with Title and Control Buttons ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1A1A1A]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity size={18} className="text-purple-400" />
            <span>Monitor Telemetry & Incidents</span>
          </h2>
          <p className="mt-0.5 text-xs text-neutral-400">
            {monitor
              ? `Real-time latency trend per interval hit • ${sortedResults.length} pings tracked`
              : "Select a monitor to view response time telemetry"}
          </p>
        </div>

        {/* ── Control Actions: Pause/Resume, Change Interval, Trigger Hit ── */}
        {monitor && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Pause / Resume Button */}
            {isPaused ? (
              <button
                type="button"
                onClick={onResume}
                disabled={isActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-300 font-semibold text-xs shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all cursor-pointer disabled:opacity-50"
                title="Resume recurring interval checks"
              >
                <Play size={12} className="fill-emerald-400 text-emerald-400" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPause}
                disabled={isActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-900/50 border border-amber-800/40 text-amber-300 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
                title="Pause scheduled checks"
              >
                <Pause size={12} className="fill-amber-400 text-amber-400" />
                <span>Pause</span>
              </button>
            )}

            {/* Change Interval Selector */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#262626] text-xs">
              <Clock size={12} className="text-neutral-400" />
              <select
                value={monitor.interval}
                onChange={(e) => onChangeInterval?.(Number(e.target.value))}
                disabled={isActionLoading}
                className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
                title="Change interval between checks"
              >
                <option value={10} className="bg-[#141414]">
                  10s (Fast)
                </option>
                <option value={30} className="bg-[#141414]">
                  30s
                </option>
                <option value={60} className="bg-[#141414]">
                  60s (Default)
                </option>
                <option value={120} className="bg-[#141414]">
                  2m
                </option>
                <option value={300} className="bg-[#141414]">
                  5m
                </option>
              </select>
            </div>

            {/* Trigger Hit Now Button */}
            <button
              type="button"
              onClick={onTriggerHit}
              disabled={isTriggering}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold text-xs text-white shadow-[0_0_12px_rgba(147,51,234,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap
                size={12}
                className={isTriggering ? "animate-spin text-purple-200" : "fill-white"}
              />
              <span>{isTriggering ? "Pinging API..." : "Trigger Hit Now"}</span>
            </button>
          </div>
        )}
      </header>

      {/* Paused Alert Banner */}
      {isPaused && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/30 border border-amber-800/30 text-amber-300 text-xs">
          <AlertCircle size={14} className="text-amber-400 shrink-0" />
          <span>
            Click <strong>Resume</strong> to restart scheduled pings.
          </span>
        </div>
      )}

      {/* ── Canvas Chart Container ── */}
      <div className="relative h-[280px] w-full sm:h-[320px]">
        {sortedResults.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-2">
            <Clock size={28} className="text-neutral-600 animate-pulse" />
            <p className="text-xs font-semibold text-neutral-300">
              No interval hits recorded yet
            </p>
            <p className="text-[11px] text-neutral-500 max-w-sm">
              The worker checks this endpoint every {monitor?.interval ?? 60} seconds. Click{" "}
              <strong className="text-purple-400">"Trigger Hit Now"</strong> above to record an
              immediate check!
            </p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="API response time latency graph"
          />
        )}
      </div>
    </section>
  );
}
