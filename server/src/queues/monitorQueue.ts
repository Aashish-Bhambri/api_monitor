
import { Queue } from "bullmq";
import { redisOptions } from "./redisConnection.js";

export interface MonitorJobData {
    monitorId: string;
}

let _monitorQueue: Queue<MonitorJobData, any, string> | null = null;

export const getMonitorQueue = (): Queue<MonitorJobData, any, string> | null => {
    // On Vercel serverless functions, do not instantiate persistent queue sockets
    if (process.env.VERCEL) {
        return null;
    }
    if (!_monitorQueue) {
        _monitorQueue = new Queue<MonitorJobData, any, string>(
            "monitor-checks",
            {
                connection: redisOptions,
                defaultJobOptions: {
                    attempts: 1, // Single execution for demo, avoids infinite retry loops
                    removeOnComplete: true, // Immediately deletes completed jobs to avoid hoarding keys in Redis
                    removeOnFail: {
                        count: 50, // Keep at most 50 failed jobs in Redis
                    },
                },
            }
        );
    }
    return _monitorQueue;
};

// Export proxy for backwards compatibility
export const monitorQueue = new Proxy({} as Queue<MonitorJobData, any, string>, {
    get(_, prop) {
        const q = getMonitorQueue();
        if (!q) return () => Promise.resolve();
        const val = (q as any)[prop];
        return typeof val === "function" ? val.bind(q) : val;
    },
});
