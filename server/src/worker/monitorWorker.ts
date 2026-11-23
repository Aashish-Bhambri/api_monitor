
import { Worker } from "bullmq";
import { redisOptions } from "../queues/redisConnection.js";
import { runMonitorCheck } from "../services/monitorservice.js";

export const monitorWorker = new Worker(
    "monitor-checks",
    async (job) => {
        const { monitorId } = job.data;

        console.log(`Starting monitor check: ${monitorId}`);

        const result = await runMonitorCheck(monitorId);

        console.log(`Monitor completed: ${monitorId}`, result);

        return result;
    },
    {
        connection: redisOptions,
        concurrency: 10,
    }
);

monitorWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

monitorWorker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
});

monitorWorker.on("error", (error) => {
    console.error("Worker error:", error);
});
