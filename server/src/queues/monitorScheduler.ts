
import { monitorQueue } from "./monitorQueue.js";

export const scheduleMonitor = async (monitorId: string, interval: number) => {
    if (!Number.isInteger(interval) || interval < 1) {
        throw new Error("Monitor interval must be a positive number");
    }

    await monitorQueue.upsertJobScheduler(
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
    );
};

export const removeMonitorSchedule = async (
    monitorId: string
) => {
    await monitorQueue.removeJobScheduler(
        `monitor-${monitorId}`
    );
};
