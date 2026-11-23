
import { Worker } from "bullmq";
import {
    workerRedisConnection,
} from "../queues/redisConnection.js";
import type {
    MonitorJobData,
} from "../queues/monitorQueue.js";
import { runMonitorCheck } from "../services/monitorservice.js";

const monitorWorker = new Worker<MonitorJobData>(
    "monitor-checks",

    async (job) => {
        const { monitorId } = job.data;

        console.log("Executing monitor:", monitorId);

        const result = await runMonitorCheck(monitorId);

        return {
            success: result.success,
            monitorId,
            statusCode: result.statusCode,
            responseTime: result.responseTime,
        };
    },

    {
        connection: workerRedisConnection,
        concurrency: 10,
    }
);

monitorWorker.on("completed", (job) => {
    console.log(`Monitor job ${job.id} completed`);
});

monitorWorker.on("failed", (job, error) => {
    console.error(
        `Monitor job ${job?.id} failed:`,
        error.message
    );
});

monitorWorker.on("error", (error) => {
    console.error("Worker error:", error);
});

const shutdown = async () => {
    console.log("Shutting down monitor worker...");

    await monitorWorker.close();
    await workerRedisConnection.quit();

    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
