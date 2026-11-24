import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { MonitorResult, MonitorLog } from "../services/api";

interface TimelineProps {
  results?: MonitorResult[];
  logs?: MonitorLog[];
  interval?: number;
  visibleCount?: number;
  onShowMore?: () => void;
  onShowAll?: (total: number) => void;
  onShowLess?: () => void;
}

export default function Timeline({
  results = [],
  interval = 60,
  visibleCount: controlledVisibleCount,
  onShowMore,
  onShowAll,
  onShowLess,
}: TimelineProps) {
  const [filter, setFilter] = useState<"all" | "success" | "failure">("all");
  const [internalVisibleCount, setInternalVisibleCount] = useState<number>(10);

  // Use controlled count if provided by parent (prevents polling from collapsing list), else internal state
  const visibleCount = controlledVisibleCount !== undefined ? controlledVisibleCount : internalVisibleCount;

  const handleShowMore = () => {
    if (onShowMore) {
      onShowMore();
    } else {
      setInternalVisibleCount((prev) => prev + 10);
    }
  };

  const handleShowAll = (total: number) => {
    if (onShowAll) {
      onShowAll(total);
    } else {
      setInternalVisibleCount(total);
    }
  };

  const handleShowLess = () => {
    if (onShowLess) {
      onShowLess();
    } else {
      setInternalVisibleCount(10);
    }
  };

  // Sorted newest first
  const sorted = [...results].sort(
    (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
  );

  const filtered = sorted.filter((r) => {
    if (filter === "success") return r.success;
    if (filter === "failure") return !r.success;
    return true;
  });

  const hasMore = filtered.length > visibleCount;

  return (
    <section className="rounded-2xl border border-[#1F1F1F] bg-[#0E0E0E] p-5 text-white shadow-xl flex flex-col gap-4">
      {/* ── Timeline Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A1A1A]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-purple-400" />
            <span>Event & Health Check Timeline</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit history of every recurring hit, status transition, and manual test
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#141414] border border-[#262626] text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-white text-black font-semibold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setFilter("success")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === "success"
                ? "bg-emerald-500 text-black font-semibold"
                : "text-neutral-400 hover:text-emerald-400"
            }`}
          >
            OK ({results.filter((r) => r.success).length})
          </button>
          <button
            onClick={() => setFilter("failure")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filter === "failure"
                ? "bg-red-500 text-white font-semibold"
                : "text-neutral-400 hover:text-red-400"
            }`}
          >
            Fails ({results.filter((r) => !r.success).length})
          </button>
        </div>
      </div>

      {/* ── Timeline List ── */}
      {filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-neutral-500">
          <Clock size={24} className="opacity-40" />
          <p className="text-xs font-medium">No check events found</p>
          <p className="text-[11px] text-neutral-600">
            Hits will log automatically every {interval}s
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#222222]">
            {filtered.slice(0, visibleCount).map((r, idx) => {
              const date = new Date(r.checkedAt);
              const timeStr = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              const diffSec = Math.round(
                (Date.now() - date.getTime()) / 1000
              );
              const timeAgo =
                diffSec < 60
                  ? `${diffSec}s ago`
                  : diffSec < 3600
                  ? `${Math.floor(diffSec / 60)}m ago`
                  : `${Math.floor(diffSec / 3600)}h ago`;

              return (
                <div
                  key={r.id || idx}
                  className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#141414] border border-[#222222] hover:border-neutral-700 transition-all group"
                >
                  {/* Node icon on vertical line */}
                  <span
                    className={`absolute -left-[19px] top-4 w-3.5 h-3.5 rounded-full border-2 border-[#0E0E0E] flex items-center justify-center ${
                      r.success ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />

                  {/* Left: Status & Details */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg border flex items-center justify-center ${
                        r.success
                          ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                          : "bg-red-950/40 border-red-800/40 text-red-400"
                      }`}
                    >
                      {r.success ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <AlertTriangle size={15} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {r.success
                            ? `HTTP ${r.statusCode ?? 200} - Operational`
                            : `HTTP ${r.statusCode ?? "ERR"} - Check Failed`}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            r.success
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                              : "bg-red-950/80 text-red-300 border border-red-800/40"
                          }`}
                        >
                          {r.statusCode ?? "Timeout"}
                        </span>
                      </div>

                      <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>Checked at {timeStr}</span>
                        <span>•</span>
                        <span className="text-neutral-500">{timeAgo}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Latency Badge */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold flex items-center gap-1 ${
                        r.responseTime < 300
                          ? "bg-emerald-950/30 text-emerald-300 border border-emerald-800/30"
                          : r.responseTime < 800
                          ? "bg-amber-950/30 text-amber-300 border border-amber-800/30"
                          : "bg-red-950/30 text-red-300 border border-red-800/30"
                      }`}
                    >
                      <Zap size={11} className="opacity-70" />
                      {r.responseTime} ms
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Show More / Show Less Controls ── */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 border-t border-[#1A1A1A]">
            {hasMore ? (
              <>
                <button
                  type="button"
                  onClick={handleShowMore}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] hover:border-neutral-600 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ChevronDown size={14} className="text-purple-400" />
                  <span>Show More ({filtered.length - visibleCount} remaining)</span>
                </button>

                {filtered.length > visibleCount + 10 && (
                  <button
                    type="button"
                    onClick={() => handleShowAll(filtered.length)}
                    className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer px-3 py-2"
                  >
                    Show All ({filtered.length})
                  </button>
                )}
              </>
            ) : (
              visibleCount > 10 && (
                <button
                  type="button"
                  onClick={handleShowLess}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] border border-[#262626] text-xs text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronUp size={13} />
                  <span>Show Less (Collapse to 10)</span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
