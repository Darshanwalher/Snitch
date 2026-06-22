import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return the FIRST validation error as { message: "..." }
        // so error.response.data.message works on the frontend
        const firstError = errors.array()[0].msg;
        return res.status(400).json({ message: firstError });
    }
    next();
}

export const createProductValidator = [
    body("title").notEmpty().withMessage("Product title is required"),
    body("description").notEmpty().withMessage("Product description is required"),
    body("priceAmount").isNumeric().withMessage("Price amount must be a valid number"),
    body("priceCurrency").notEmpty().withMessage("Price currency is required"),
    validateRequest,
];