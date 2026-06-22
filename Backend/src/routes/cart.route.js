import {Router} from "express";
import {authtenticateUser} from "../middleware/auth.middleware.js";
import { validateAddToCart,validateIncrementCartItemQuantity } from "../validator/cart.validator.js";
import { addToCart,createOrderController,createBuyNowOrderController,decrementCartItemQuantity,getCart, incrementCartItemQuantity, removeItemFromCart, verifyOrderController } from "../controllers/cart.controller.js";

const cartRouter = Router();



/**
 * @route POST /api/cart/add/:productId/:variantId
 * @desc Add item to cart
 * @access Private
 * @argument productId - ID of the product to add
 * @argument variantId - ID of the variant to add
 * @argument quantity - Quantity of the item to add (optional, default: 1)
 */
cartRouter.post("/add/:productId/:variantId",authtenticateUser, validateAddToCart,addToCart);


/**
 * @route GET /api/cart
 * @desc Get user's cart
 * @access Private
 */
cartRouter.get("/",authtenticateUser,getCart)


/**
 * @route PATCH /api/cart/quantity/increment/:productId/:variantId
 * @desc Increment item quantity in cart by one
 * @access Private
 * @argument productId - ID of the product to update
 * @argument variantId - ID of the variant to update
 */
cartRouter.patch("/quantity/increment/:productId/:variantId",authtenticateUser,validateIncrementCartItemQuantity,incrementCartItemQuantity);


/** * @route PATCH /api/cart/quantity/decrement/:productId/:variantId
 * @desc Decrement item quantity in cart by one
 * @access Private
 * @argument productId - ID of the product to update
 * @argument variantId - ID of the variant to update
 */
cartRouter.patch("/quantity/decrement/:productId/:variantId",authtenticateUser,validateIncrementCartItemQuantity,decrementCartItemQuantity);

/**
 * @route DELETE /api/cart/item/:productId/:variantId
 * @desc Remove item from cart
 * @access Private
 * @argument productId - ID of the product to remove
 * @argument variantId - ID of the variant to remove
 */
cartRouter.delete("/item/:productId/:variantId",authtenticateUser,validateIncrementCartItemQuantity,removeItemFromCart);

/**
 * @route POST /api/cart/payment/buy-now
 * @desc Create order for payment
 * @access Private
 * @argument productId - ID of the product to buy
 * @argument variantId - ID of the variant to buy
 * @argument quantity - Quantity of the item to buy (optional, default: 1)
 */
cartRouter.post("/payment/buy-now", authtenticateUser, createBuyNowOrderController)

/**
 * @route POST /api/cart/payment/create/order
 * @desc Create order for payment
 * @access Private
 */
cartRouter.post("/payment/create/order",authtenticateUser,createOrderController)

/**
 * @route POST /api/cart/payment/verify/order
 * @desc Verify order payment
 * @access Private
 */
cartRouter.post("/payment/verify/order",authtenticateUser,verifyOrderController)

export default cartRouter;