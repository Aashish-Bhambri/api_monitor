
import "dotenv/config";
import { Redis } from "ioredis";

function parseRedisConfig() {
  let raw = (process.env.REDIS_URL || "").trim();
  // Strip enclosing quotes if user pasted with quotes in Vercel UI
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim();
  }
  // If protocol was omitted, default to rediss://
  if (raw && !raw.includes("://")) {
    raw = `rediss://${raw}`;
  }

  if (!raw) {
    raw = "redis://127.0.0.1:6379";
  }

  try {
    const parsed = new URL(raw);
    const isTls = parsed.protocol === "rediss:";
    const opts: Record<string, any> = {
      host: parsed.hostname || "127.0.0.1",
      port: Number(parsed.port || 6379),
      connectTimeout: 5000,
      maxRetriesPerRequest: null,
    };
    if (parsed.username) {
      opts.username = decodeURIComponent(parsed.username);
    }
    if (parsed.password) {
      opts.password = decodeURIComponent(parsed.password);
    }
    if (isTls) {
      opts.tls = { servername: parsed.hostname };
    }
    return {
      options: opts,
      urlStr: raw,
    };
  } catch (err) {
    console.error("Warning: Failed to parse REDIS_URL, falling back to localhost:", err);
    return {
      options: {
        host: "127.0.0.1",
        port: 6379,
        connectTimeout: 5000,
        maxRetriesPerRequest: null,
      },
      urlStr: "redis://127.0.0.1:6379",
    };
  }
}

const { options: redisOptionsConfig, urlStr: parsedRedisUrl } = parseRedisConfig();

export const redisOptions = redisOptionsConfig as any;

export const workerRedisConnection = new Redis(parsedRedisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  connectTimeout: 5000,
});

workerRedisConnection.on("error", (err) => {
  console.warn("workerRedisConnection error:", err.message);
});
