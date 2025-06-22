import { Redis } from "@upstash/redis";

/**
 * Singleton-клиент Upstash Redis.
 * Используется во всех Server / Edge ручках.
 */
export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});