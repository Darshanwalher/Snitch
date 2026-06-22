import rateLimit from "express-rate-limit";

// Strict rate limiter for auth endpoints (login, register, forgot-password, reset-password)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,                  // Allow 15 requests per 15 minutes (slightly more lenient for testing/UX)
    message: { 
        message: "Too many authentication attempts. Please try again after 15 minutes.",
        success: false
    },
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
});

// General rate limiter for all API endpoints
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // Limit each IP to 100 requests per window
    message: { 
        message: "Too many requests. Please slow down.",
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});
