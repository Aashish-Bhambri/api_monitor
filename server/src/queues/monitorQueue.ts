
import { Queue } from "bullmq";
import { redisOptions } from "./redisConnection.js";

export interface MonitorJobData {
    monitorId: string;
}

export const monitorQueue = new Queue<MonitorJobData, any, string>(
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
