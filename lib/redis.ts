import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url:   process.env.REDIS_URL!,    // «!» — говорим TS, что переменные точно есть
  token: process.env.REDIS_TOKEN!,
});
