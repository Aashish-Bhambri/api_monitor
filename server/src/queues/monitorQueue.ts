
import { Queue } from "bullmq";
import { redisOptions } from "./redisConnection.js";

export interface MonitorJobData {
    monitorId: string;
}

export const monitorQueue = new Queue<MonitorJobData>(
    "monitor-checks",
    {
        connection: redisOptions,

        defaultJobOptions: {
            attempts: 2,

            backoff: {
                type: "exponential",
                delay: 5000,
            },

            removeOnComplete: {
                age: 3600,
                count: 1000,
            },

            removeOnFail: {
                age: 86400,
            },
        },
    }
);
