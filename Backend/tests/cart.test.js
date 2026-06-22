import request from "supertest";
import { jest, describe, it, beforeAll, afterAll, afterEach, expect } from "@jest/globals";
import { app, setupDB, teardownDB, clearDB } from "./setup.js";
import productModel from "../src/models/product.model.js";
import cartModel from "../src/models/cart.model.js";

// Mock transactional emails
jest.mock("../src/utils/email.js", () => ({
    sendEmail: jest.fn().mockResolvedValue(true)
}));

describe("Cart Integration Tests", () => {
    let userCookie;

    beforeAll(async () => {
        await setupDB();

        // Create a mock user
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                email: "buyer@example.com",
                password: "password123",
                fullname: "Buyer Doe",
                contact: "1122334455",
                isSeller: false
            });
        userCookie = res.header["set-cookie"];
    });

    afterAll(async () => {
        await teardownDB();
    });

    afterEach(async () => {
        await productModel.deleteMany({});
        await cartModel.deleteMany({});
    });

    it("should add an item to the cart successfully", async () => {
        // Seed product with variant
        const product = await productModel.create({
            title: "Vintage Denim Jacket",
            description: "Retro fits",
            price: { amount: 2499, currency: "INR" },
            seller: "60c72b2f9b1d8a2c388a1111",
            images: [],
            variants: [{
                price: { amount: 2499, currency: "INR" },
                stock: 10,
                attributes: { color: "Blue", size: "M" }
            }]
        });
        const variantId = product.variants[0]._id;

        const res = await request(app)
            .post(`/api/cart/add/${product._id}/${variantId}`)
            .set("Cookie", userCookie)
            .send({ quantity: 1 });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("added");
    });

    it("should retrieve user's cart containing correct items and total price calculation", async () => {
        // Seed product and add to cart
        const product = await productModel.create({
            title: "Leather Boots",
            price: { amount: 4999, currency: "INR" },
            seller: "60c72b2f9b1d8a2c388a1111",
            images: [],
            variants: [{
                price: { amount: 4999, currency: "INR" },
                stock: 5,
                attributes: { color: "Brown", size: "10" }
            }]
        });
        const variantId = product.variants[0]._id;

        await request(app)
            .post(`/api/cart/add/${product._id}/${variantId}`)
            .set("Cookie", userCookie)
            .send({ quantity: 2 });

        const res = await request(app)
            .get("/api/cart")
            .set("Cookie", userCookie);

        expect(res.status).toBe(200);
        expect(res.body.cart).toBeDefined();
        expect(res.body.cart.items.length).toBe(1);
        expect(res.body.cart.items[0].quantity).toBe(2);
        
        // Total price should match variant price * quantity
        expect(res.body.cart.totalPrice).toBe(4999 * 2);
    });

    it("should reject adding an item to the cart when it is out of stock", async () => {
        // Seed product with 0 stock
        const product = await productModel.create({
            title: "Sold Out Cap",
            price: { amount: 599, currency: "INR" },
            seller: "60c72b2f9b1d8a2c388a1111",
            images: [],
            variants: [{
                price: { amount: 599, currency: "INR" },
                stock: 0,
                attributes: { color: "Black", size: "OS" }
            }]
        });
        const variantId = product.variants[0]._id;

        const res = await request(app)
            .post(`/api/cart/add/${product._id}/${variantId}`)
            .set("Cookie", userCookie)
            .send({ quantity: 1 });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("stock");
    });
});
