
import { getMonitorQueue } from "./monitorQueue.js";

export const scheduleMonitor = async (monitorId: string, interval: number) => {
    // In Vercel serverless environment, background BullMQ queue is not running
    if (process.env.VERCEL) {
        return;
    }

    if (!Number.isInteger(interval) || interval < 1) {
        throw new Error("Monitor interval must be a positive number");
    }

    const queue = getMonitorQueue();
    if (!queue) return;

    try {
        await Promise.race([
            queue.upsertJobScheduler(
                `monitor-${monitorId}`,
                {
                    every: interval * 1000,
                },
                {
                    name: "check-monitor",
                    data: {
                        monitorId,
                    },
                }
            ),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Redis schedule operation timed out")), 1000)
            )
        ]);
    } catch (err: any) {
        console.warn(`Could not schedule BullMQ job for ${monitorId}:`, err.message);
    }
};

export const removeMonitorSchedule = async (
    monitorId: string
) => {
    // In Vercel serverless environment, background BullMQ queue is not running
    if (process.env.VERCEL) {
        return;
    }

    const queue = getMonitorQueue();
    if (!queue) return;

    try {
        await Promise.race([
            queue.removeJobScheduler(
                `monitor-${monitorId}`
            ),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Redis remove schedule operation timed out")), 1000)
            )
        ]);
    } catch (err: any) {
        console.warn(`Could not remove BullMQ schedule for ${monitorId}:`, err.message);
    }
};
