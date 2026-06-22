import {Router} from 'express';
import { authtenticateSeller } from '../middleware/auth.middleware.js';
import { addProductVariant, createProduct,deleteProduct,deleteProductVariant,getAllProducts,getProductDetails,getSellerProducts, updateProduct, updateProductVariant, searchProduct } from '../controllers/product.controller.js';
import { createProductValidator } from '../validator/product.validator.js';

import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

const ProductRouter = Router();


/**
 * @route POST /api/products
 * @description Create a new product
 * @access Private (Seller only)
 */
ProductRouter.post("/",authtenticateSeller,upload.array("images",7),createProductValidator,createProduct)


/** 
 * @route GET /api/products/seller
 * @description Get all products of the authenticated seller
 * @access Private (Seller only)
 */
ProductRouter.get("/seller",authtenticateSeller,getSellerProducts)

/** 
 * @route GET /api/products
 * @description Get all products
 * @access Public
 */
ProductRouter.get("/",getAllProducts)

/**
 * @route GET /api/products/search
 * @description Search and filter products
 * @access Public
 */
ProductRouter.get("/search", searchProduct)

/** 
 * @route GET /api/products/detail/:id
 * @description Get details of a specific product
 * @access Public
 */
ProductRouter.get("/detail/:id",getProductDetails)

/** 
 * @route POST /api/products/product/:productId/variants
 * @description Add a new variant to an existing product
 * @access Private (Seller only)
 */
ProductRouter.post("/:productId/variants", authtenticateSeller,upload.array("images",7),addProductVariant)


/** 
 * @route DELETE /api/products/delete/:id
 * @description Delete a product by ID
 * @access Private (Seller only)
 */
ProductRouter.delete("/delete/:id",authtenticateSeller,deleteProduct)



/** 
 * @route DELETE /api/products/delete/variant/:productId/:variantId
 * @description Delete a specific variant of a product
 * @access Private (Seller only)
 */
ProductRouter.delete("/delete/variant/:productId/:variantId",authtenticateSeller,deleteProductVariant)

/** 
 * @route PATCH /api/products/update/variant/:productId/:variantId
 * @description Update a specific variant of a product
 * @access Private (Seller only)
 */
ProductRouter.patch("/update/variant/:productId/:variantId",authtenticateSeller,upload.array("images",7),updateProductVariant)


/** 
 * @route PATCH /api/products/update/product/:id
 * @description Update a product by ID
 * @access Private (Seller only)
 */
ProductRouter.patch("/update/product/:id",authtenticateSeller,upload.array("images",7),createProductValidator,updateProduct)

export default ProductRouter;
