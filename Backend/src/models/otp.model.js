import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Automatically deletes this document from MongoDB after 10 minutes (600 seconds)
    }
});

const otpModel = mongoose.model("otp", otpSchema);

export default otpModel;
