import request from "supertest";
import { jest, describe, it, beforeAll, afterAll, afterEach, expect } from "@jest/globals";
import { app, setupDB, teardownDB, clearDB } from "./setup.js";
import productModel from "../src/models/product.model.js";

// Mock file uploads
jest.mock("../src/services/storage.service.js", () => ({
    uploadFile: jest.fn().mockResolvedValue({
        url: "https://ik.imagekit.io/mock/image.jpg",
        fileId: "mock_file_id"
    })
}));

// Mock transactional emails
jest.mock("../src/utils/email.js", () => ({
    sendEmail: jest.fn().mockResolvedValue(true)
}));

describe("Product Integration Tests", () => {
    let sellerCookie;
    let buyerCookie;

    beforeAll(async () => {
        await setupDB();

        // Create a mock seller user
        const sellerRes = await request(app)
            .post("/api/auth/register")
            .send({
                email: "seller@example.com",
                password: "password123",
                fullname: "Seller Doe",
                contact: "0987654321",
                isSeller: true
            });
        sellerCookie = sellerRes.header["set-cookie"];

        // Create a mock buyer user
        const buyerRes = await request(app)
            .post("/api/auth/register")
            .send({
                email: "buyer@example.com",
                password: "password123",
                fullname: "Buyer Doe",
                contact: "1122334455",
                isSeller: false
            });
        buyerCookie = buyerRes.header["set-cookie"];
    });

    afterAll(async () => {
        await teardownDB();
    });

    afterEach(async () => {
        // Clean products collection between runs
        await productModel.deleteMany({});
    });

    it("should allow a seller to create a product", async () => {
        const res = await request(app)
            .post("/api/products")
            .set("Cookie", sellerCookie)
            .field("title", "Test Streetwear Tee")
            .field("description", "Premium cotton heavy oversized graphic tee")
            .field("priceAmount", "1299")
            .field("priceCurrency", "INR")
            .attach("images", Buffer.from("fake-img-bytes"), "tee.jpg");

        expect(res.status).toBe(201);
        expect(res.body.product).toBeDefined();
        expect(res.body.product.title).toBe("Test Streetwear Tee");
        expect(res.body.product.images.length).toBe(1);
    });

    it("should reject product creation from non-seller account (buyer)", async () => {
        const res = await request(app)
            .post("/api/products")
            .set("Cookie", buyerCookie)
            .field("title", "Forbidden Tee")
            .field("description", "Unauthorized test")
            .field("priceAmount", "999")
            .attach("images", Buffer.from("fake-img-bytes"), "forbidden.jpg");

        expect(res.status).toBe(403);
        expect(res.body.message).toContain("Forbidden");
    });

    it("should get all products with pagination support", async () => {
        // Seed 3 products manually
        await productModel.create([
            { title: "Product A", description: "Desc A", price: { amount: 100, currency: "INR" }, seller: "60c72b2f9b1d8a2c388a1111", images: [] },
            { title: "Product B", description: "Desc B", price: { amount: 200, currency: "INR" }, seller: "60c72b2f9b1d8a2c388a1111", images: [] },
            { title: "Product C", description: "Desc C", price: { amount: 300, currency: "INR" }, seller: "60c72b2f9b1d8a2c388a1111", images: [] },
        ]);

        const res = await request(app)
            .get("/api/products?page=1&limit=2");

        expect(res.status).toBe(200);
        expect(res.body.products.length).toBe(2);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.currentPage).toBe(1);
        expect(res.body.pagination.totalPages).toBe(2);
        expect(res.body.pagination.totalProducts).toBe(3);
    });

    it("should retrieve specific product detail by ID", async () => {
        const product = await productModel.create({
            title: "Detail Tee",
            description: "Detail test description",
            price: { amount: 1599, currency: "INR" },
            seller: "60c72b2f9b1d8a2c388a1111",
            images: []
        });

        const res = await request(app)
            .get(`/api/products/detail/${product._id}`);

        expect(res.status).toBe(200);
        expect(res.body.product).toBeDefined();
        expect(res.body.product.title).toBe("Detail Tee");
    });
});
