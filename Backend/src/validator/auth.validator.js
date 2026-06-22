import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return the FIRST validation error as { message: "..." }
        // so it matches every other backend error shape and
        // error.response.data.message works on the frontend
        const firstError = errors.array()[0].msg;
        return res.status(400).json({ message: firstError });
    }
    next();
}

export const validateRegisterUser = [
    body("email")
        .isEmail().withMessage("Please provide a valid email address"),

    body("contact")
        .matches(/^\d{10}$/)
        .withMessage("Contact number must be exactly 10 digits"),

    body("password")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

    body("fullname")
        .notEmpty().withMessage("Full name is required")
        .isLength({ min: 3 }).withMessage("Full name must be at least 3 characters long"),

    body("isSeller")
        .isBoolean().withMessage("isSeller must be a boolean value"),

    validateRequest,
];

export const validateLoginUser = [
    body("email")
        .isEmail().withMessage("Please provide a valid email address"),

    body("password")
        .notEmpty().withMessage("Password is required"),

    validateRequest,
];

export const validateForgotPassword = [
    body("email")
        .isEmail().withMessage("Please provide a valid email address"),
    validateRequest,
];

export const validateResetPassword = [
    body("email")
        .isEmail().withMessage("Please provide a valid email address"),
    body("otp")
        .matches(/^\d{6}$/).withMessage("OTP must be exactly 6 digits"),
    body("newPassword")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    validateRequest,
];