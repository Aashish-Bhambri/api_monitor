
import { monitorQueue } from "./monitorQueue.js";

export const scheduleMonitor = async (monitorId: string, interval: number) => {
    if (!Number.isInteger(interval) || interval < 1) {
        throw new Error("Monitor interval must be a positive number");
    }

    await Promise.race([
        monitorQueue.upsertJobScheduler(
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
            setTimeout(() => reject(new Error("Redis schedule operation timed out after 3500ms")), 3500)
        )
    ]);
};

export const removeMonitorSchedule = async (
    monitorId: string
) => {
    await Promise.race([
        monitorQueue.removeJobScheduler(
            `monitor-${monitorId}`
        ),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Redis remove schedule operation timed out after 3500ms")), 3500)
        )
    ]);
};
