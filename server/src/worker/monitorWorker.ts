
import { Worker } from "bullmq";
import { redisOptions } from "../queues/redisConnection.js";
import { runMonitorCheck } from "../services/monitorservice.js";

let monitorWorkerInstance: Worker | null = null;

// BullMQ background worker only runs in local or dedicated server processes, never inside serverless functions
if (!process.env.VERCEL) {
    try {
        monitorWorkerInstance = new Worker(
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
                concurrency: 2, // Optimized for demo: low concurrency reduces idle Redis pings
                drainDelay: 30, // Sleep 30s when queue is empty instead of polling every 5s
                stalledInterval: 120000, // Check stalled jobs every 2 minutes instead of 30s
            }
        );

        monitorWorkerInstance.on("completed", (job) => {
            console.log(`Job ${job.id} completed`);
        });

        monitorWorkerInstance.on("failed", (job, error) => {
            console.error(`Job ${job?.id} failed:`, error.message);
        });

        monitorWorkerInstance.on("error", (error) => {
            console.error("Worker error:", error);
        });
    } catch (err) {
        console.error("Failed to start monitor worker:", err);
    }
}

export const monitorWorker = monitorWorkerInstance;
