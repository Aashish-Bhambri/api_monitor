
import "dotenv/config";
import { Redis } from "ioredis";

const DEFAULT_UPSTASH_HOST = "striking-serval-180344.upstash.io";
const DEFAULT_UPSTASH_TOKEN = "gQAAAAAAAsB4AAIgcDJkZmUwN2Q5Zjg4Yzg0ZjBiYjk5ZjE4ZWI3ODgxMzE1Nw";

function parseRedisConfig() {
  let raw = (process.env.REDIS_URL || "").trim();
  // Strip enclosing quotes if user pasted with quotes in Vercel UI
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim();
  }
  // If protocol was https:// from Upstash REST URL, or missing protocol
  if (raw.startsWith("https://")) {
    const host = raw.replace("https://", "").replace(/\/$/, "");
    raw = `rediss://default:${DEFAULT_UPSTASH_TOKEN}@${host}:6379`;
  } else if (raw && !raw.includes("://")) {
    raw = `rediss://${raw}`;
  }

  if (!raw) {
    raw = `rediss://default:${DEFAULT_UPSTASH_TOKEN}@${DEFAULT_UPSTASH_HOST}:6379`;
  }

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname || DEFAULT_UPSTASH_HOST;
    const isTls = parsed.protocol === "rediss:" || host.includes("upstash.io");
    const password = parsed.password
      ? decodeURIComponent(parsed.password)
      : (host === DEFAULT_UPSTASH_HOST ? DEFAULT_UPSTASH_TOKEN : undefined);

    const opts: Record<string, any> = {
      host,
      port: Number(parsed.port || 6379),
      connectTimeout: 4000,
      maxRetriesPerRequest: null,
    };
    if (parsed.username || password) {
      opts.username = parsed.username ? decodeURIComponent(parsed.username) : "default";
    }
    if (password) {
      opts.password = password;
    }
    if (isTls) {
      opts.tls = { servername: host };
    }
    return {
      options: opts,
      urlStr: raw,
    };
  } catch (err) {
    console.error("Warning: Failed to parse REDIS_URL, falling back:", err);
    return {
      options: {
        host: DEFAULT_UPSTASH_HOST,
        port: 6379,
        username: "default",
        password: DEFAULT_UPSTASH_TOKEN,
        tls: { servername: DEFAULT_UPSTASH_HOST },
        connectTimeout: 4000,
        maxRetriesPerRequest: null,
      },
      urlStr: `rediss://default:${DEFAULT_UPSTASH_TOKEN}@${DEFAULT_UPSTASH_HOST}:6379`,
    };
  }
}

const { options: redisOptionsConfig, urlStr: parsedRedisUrl } = parseRedisConfig();

export const redisOptions = redisOptionsConfig as any;

export const workerRedisConnection = new Redis(parsedRedisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  connectTimeout: 4000,
});

workerRedisConnection.on("error", (err) => {
  console.warn("workerRedisConnection error:", err.message);
});
