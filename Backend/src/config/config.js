import dotenv from "dotenv";
dotenv.config();

const isTest = process.env.NODE_ENV === "test";

if (!isTest) {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not defined in environment variables");
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables");
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variables");
    }
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
        throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables");
    }
    if (!process.env.RAZORPAY_KEY_ID) {
        throw new Error("RAZORPAY_KEY_ID is not defined in environment variables");
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("RAZORPAY_KEY_SECRET is not defined in environment variables");
    }
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
        throw new Error("GOOGLE_REFRESH_TOKEN is not defined in environment variables");
    }
    if (!process.env.GOOGLE_USER) {
        throw new Error("GOOGLE_USER is not defined in environment variables");
    }
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "mock_jwt_secret_key_for_testing",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "mock_google_client_id",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "mock_google_client_secret",
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "mock_imagekit_private_key",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "mock_razorpay_key_id",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "mock_razorpay_key_secret",
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || "mock_google_refresh_token",
    GOOGLE_USER: process.env.GOOGLE_USER || "test@test.com",
    NODE_ENV: process.env.NODE_ENV || "development",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173"
};

