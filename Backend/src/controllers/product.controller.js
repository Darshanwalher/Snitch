import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";


export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency } = req.body;
        const seller = req.user;

        const images = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            });
        }));

        const product = await productModel.create({
            title,
            description,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR"
            },
            seller: seller._id,
            images
        });

        res.status(201).json({
            message: "Product created successfully",
            success: true,
            product
        });
    } catch (error) {
        console.error("[createProduct]", error);
        res.status(500).json({ message: "Failed to create product. Please try again." });
    }
};


export const getSellerProducts = async (req, res) => {
    try {
        const seller = req.user;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            productModel.find({ seller: seller._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            productModel.countDocuments({ seller: seller._id })
        ]);

        res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                limit
            }
        });
    } catch (error) {
        console.error("[getSellerProducts]", error);
        res.status(500).json({ message: "Failed to fetch your products. Please try again." });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            productModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            productModel.countDocuments()
        ]);

        return res.status(200).json({
            message: "Products fetched successfully.",
            success: true,
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                limit
            }
        });
    } catch (error) {
        console.error("[getAllProducts]", error);
        res.status(500).json({ message: "Failed to fetch products. Please try again." });
    }
};

export const getProductDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Product fetched successfully.",
            success: true,
            product
        });
    } catch (error) {
        console.error("[getProductDetails]", error);
        res.status(500).json({ message: "Failed to fetch product details. Please try again." });
    }
};

export const addProductVariant = async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        const files = req.files;
        const images = [];
        if (files && files.length !== 0) {
            (await Promise.all(files.map(async (file) => {
                return await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                });
            }))).forEach(image => images.push(image));
        }

        const price = req.body.priceAmount;
        const stock = req.body.stock;
        const attributes = JSON.parse(req.body.attributes || "{}");

        product.variants.push({
            images,
            price: {
                amount: price || product.price.amount,
                currency: req.body.priceCurrency || product.price.currency
            },
            stock,
            attributes
        });

        await product.save();

        return res.status(200).json({
            message: "Product variant added successfully.",
            success: true,
            product
        });
    } catch (error) {
        console.error("[addProductVariant]", error);
        res.status(500).json({ message: "Failed to add product variant. Please try again." });
    }
};


export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Product deleted successfully.",
            success: true
        });
    } catch (error) {
        console.error("[deleteProduct]", error);
        res.status(500).json({ message: "Failed to delete product. Please try again." });
    }
};

export const deleteProductVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({
                message: "Product variant not found.",
                success: false
            });
        }

        product.variants.pull(variantId);
        await product.save();

        return res.status(200).json({
            message: "Product variant deleted successfully.",
            success: true
        });
    } catch (error) {
        console.error("[deleteProductVariant]", error);
        res.status(500).json({ message: "Failed to delete product variant. Please try again." });
    }
};


export const updateProductVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.params;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({
                message: "Product variant not found.",
                success: false
            });
        }

        // Upload new images if provided
        const files = req.files;
        const images = [];
        if (files?.length) {
            const uploadedImages = await Promise.all(
                files.map(async (file) => {
                    return await uploadFile({
                        buffer: file.buffer,
                        fileName: file.originalname
                    });
                })
            );
            images.push(...uploadedImages);
        }

        const priceAmount   = req.body.priceAmount;
        const priceCurrency = req.body.priceCurrency;
        const stock         = req.body.stock;
        const attributes    = req.body.attributes ? JSON.parse(req.body.attributes) : null;

        if (images.length > 0) variant.images = images;

        variant.price = {
            amount:   priceAmount   ?? variant.price.amount,
            currency: priceCurrency ?? variant.price.currency
        };
        variant.stock = stock ?? variant.stock;
        if (attributes) variant.attributes = attributes;

        await product.save();

        return res.status(200).json({
            message: "Product variant updated successfully.",
            success: true,
            product
        });
    } catch (error) {
        console.error("[updateProductVariant]", error);
        res.status(500).json({ message: "Failed to update product variant. Please try again." });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priceAmount, priceCurrency } = req.body;

        const product = await productModel.findByIdAndUpdate(
            id,
            {
                title,
                description,
                price: {
                    amount: priceAmount,
                    currency: priceCurrency
                }
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Product updated successfully.",
            success: true,
            product
        });
    } catch (error) {
        console.error("[updateProduct]", error);
        res.status(500).json({ message: "Failed to update product. Please try again." });
    }
};

export const searchProduct = async (req, res) => {
    try {
        const { q, minPrice, maxPrice, size, color, sort } = req.query;
        const conditions = [];

        // 1. Text query: title, description, or variant attributes (color, size)
        if (q) {
            conditions.push({
                $or: [
                    { title: { $regex: q, $options: "i" } },
                    { description: { $regex: q, $options: "i" } },
                    { "variants.attributes.color": { $regex: q, $options: "i" } },
                    { "variants.attributes.size": { $regex: q, $options: "i" } }
                ]
            });
        }

        // 2. Price range filtering (base product price or variant-level price)
        const hasMinPrice = minPrice !== undefined && minPrice !== "";
        const hasMaxPrice = maxPrice !== undefined && maxPrice !== "";
        if (hasMinPrice || hasMaxPrice) {
            const priceQuery = {};
            if (hasMinPrice) priceQuery.$gte = Number(minPrice);
            if (hasMaxPrice) priceQuery.$lte = Number(maxPrice);
            
            conditions.push({
                $or: [
                    { "price.amount": priceQuery },
                    { "variants.price.amount": priceQuery }
                ]
            });
        }

        // 3. Size filtering (attributes.size) - handle potential brackets query format from Axios
        const sizeParam = size || req.query["size[]"];
        if (sizeParam) {
            const sizeArray = Array.isArray(sizeParam) ? sizeParam : [sizeParam];
            conditions.push({
                $or: sizeArray.map(s => ({
                    "variants.attributes.size": { $regex: new RegExp(`^${s}$`, "i") }
                }))
            });
        }

        // 4. Color filtering (attributes.color) - handle potential brackets query format from Axios
        const colorParam = color || req.query["color[]"];
        if (colorParam) {
            const colorArray = Array.isArray(colorParam) ? colorParam : [colorParam];
            conditions.push({
                $or: colorArray.map(c => ({
                    "variants.attributes.color": { $regex: new RegExp(`^${c}$`, "i") }
                }))
            });
        }

        // Combine all conditions using $and (if any exist)
        const query = conditions.length > 0 ? { $and: conditions } : {};

        let queryBuilder = productModel.find(query);

        // Sorting
        if (sort) {
            if (sort === "price_asc") {
                queryBuilder = queryBuilder.sort({ "price.amount": 1 });
            } else if (sort === "price_desc") {
                queryBuilder = queryBuilder.sort({ "price.amount": -1 });
            } else if (sort === "newest") {
                queryBuilder = queryBuilder.sort({ createdAt: -1 });
            }
        } else {
            queryBuilder = queryBuilder.sort({ createdAt: -1 });
        }

        // Pagination
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            queryBuilder.skip(skip).limit(limit),
            productModel.countDocuments(query)
        ]);

        return res.status(200).json({
            message: "Products searched successfully.",
            success: true,
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                limit
            }
        });
    } catch (error) {
        console.error("[searchProduct]", error);
        res.status(500).json({ message: "Failed to search products. Please try again." });
    }
};

