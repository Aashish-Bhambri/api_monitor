
import {Redis} from "ioredis";

const redisUrl = new URL(
    process.env.REDIS_URL || "redis://127.0.0.1:6379"
);

export const redisOptions = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    ...(redisUrl.protocol === "rediss:" ? { tls: {} } : {}),
};

export const workerRedisConnection = new Redis(redisUrl.toString(), {
    maxRetriesPerRequest: null,
});
