import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import ProductRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import cors from "cors";
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import {config} from "./config/config.js";
import path from "path";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.static("./public"));

app.use(passport.initialize());
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL:"/api/auth/google/callback",
    proxy: true
},(accessToken, refreshToken, profile, done)=>{
    return done(null,profile);
}))

app.get("/",(req,res)=>{
    res.status(200).json({message:"server is running"});
})

app.use("/api", apiLimiter);
app.use("/api/auth", authRouter);
app.use("/api/products", ProductRouter);
app.use("/api/cart", cartRouter);

// Catch-all route to serve the frontend React/Vue app for any unknown routes (Fixes "Cannot GET /login")
app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});


export default app;