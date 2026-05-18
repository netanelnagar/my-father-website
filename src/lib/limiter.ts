import { RateLimiterMemory } from "rate-limiter-flexible";

export const rateLimiter = new RateLimiterMemory({
  points: 60,
  duration: 60,
});

// Tighter limiter for public submission endpoints: 3 per 10 minutes per IP
export const submissionRateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 600,
  blockDuration: 600,
});