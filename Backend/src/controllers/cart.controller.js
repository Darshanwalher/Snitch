import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import mongoose from "mongoose";
import { createOrder } from "../services/payment.service.js";
import { getCartDetails } from "../dao/cart.dao.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { config } from "../config/config.js";
import { sendEmail } from "../utils/email.js";



export const addToCart = async(req, res) => {

    const { productId, variantId } = req.params;
    const { quantity = 1 } = req.body;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })


    if(!product){
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const stock = await stockOfVariant(productId, variantId);

    if (stock <= 0) {
        return res.status(400).json({
            message: "This product or variant is out of stock. Please wait a few days for us to restock.",
            success: false
        })
    }

    const cart = (await cartModel.findOne({ user: req.user._id })) || ( await cartModel({ user: req.user._id }));
   
    const isProductAlreadyInCart = cart.items.some(item => item.product.toString() === productId && item.variant?.toString() === variantId);
    
    if(isProductAlreadyInCart){
        const quantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId).quantity;

        if(quantityInCart + quantity > stock){
            return res.status(400).json({
                 message: `Only ${stock} items left in stock. and you already have ${quantityInCart} items in your cart`,
                success: false
            })
        }

        await cartModel.findOneAndUpdate({
            user: req.user._id,
            "items.product": productId,
            "items.variant": variantId
        }, {
            $inc: {
                "items.$.quantity": quantity
            }
        },
            { new: true }
        )

        return res.status(200).json({
            message: "Cart updated successfully.",
            success: true
        })

    }

    if(quantity > stock){
        return res.status(400).json({
            message: `Only ${stock} items left in stock.`,
            success: false
        })
    }

    cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price:product.price
    })

    await cart.save()

    return res.status(200).json({
        message: "Item added to cart successfully.",
        success: true
    })

}

export const getCart = async(req,res)=>{
    const user = req.user;

    let cart = (await cartModel.aggregate([
    {
        $match: {
            user: new mongoose.Types.ObjectId(user._id)
        }
    },
    { 
        $unwind: { path: '$items' } 
    },
    {
        $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'items.product'
        }
    },
    { 
        $unwind: { path: '$items.product' } 
    },
    {
        $unwind: { path: '$items.product.variants' }
    },
    {
        $match: {
            $expr: {
                $eq: [
                    '$items.variant',
                    '$items.product.variants._id'
                ]
            }
        }
    },
    {
        $addFields: {
            itemPrice: {
                price: {
                    $multiply: [
                        '$items.quantity',
                        '$items.product.variants.price.amount'
                    ]
                },
                currency:
                    '$items.product.variants.price.currency'
            }
        }
    },
    {
        $group: {
            _id: '$_id',
            totalPrice: { $sum: '$itemPrice.price' },
            currency: {
                $first: '$itemPrice.currency'
            },
            items: { $push: '$items' }
        }
    }
]))[0];

    if(!cart){
        cart = await cartModel.create({
            user:user._id,
        })
    }

    return res.status(200).json({
        message:"Cart fetched successfully",
        success:true,
        cart
    })


}

export const incrementCartItemQuantity = async(req,res)=>{
    const { productId, variantId } = req.params;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        });
    }

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found.",
            success: false
        });
    }

    const stock = await stockOfVariant(productId, variantId);

    if (stock <= 0) {
        return res.status(400).json({
            message: "This product or variant is out of stock. Please wait a few days for us to restock.",
            success: false
        });
    }

    const itemQuantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId)?.quantity || 0;

    if (itemQuantityInCart + 1 > stock) {
        return res.status(400).json({
            message: `Only ${stock} items left in stock. and you already have ${itemQuantityInCart} items in your cart`,
            success: false
        });
    }

    await cartModel.findOneAndUpdate({
        user: req.user._id,
        "items.product": productId,
        "items.variant": variantId
    }, {
        $inc: {
            "items.$.quantity": 1
        }
    }, {
        new: true
    });

    return res.status(200).json({
        message: "Cart item quantity incremented successfully.",
        success: true
    });

}

export const decrementCartItemQuantity = async(req,res)=>{
    const { productId, variantId } = req.params;

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        });
    }

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found.",
            success: false
        });
    }

    const stock = await stockOfVariant(productId, variantId);

    const itemQuantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId)?.quantity || 0;

    if (itemQuantityInCart - 1 < 1) {
        return res.status(400).json({
            message: `Cannot decrease quantity below 1. Current quantity: ${itemQuantityInCart}.`,
            success: false
        });
    }

    await cartModel.findOneAndUpdate({
        user: req.user._id,
        "items.product": productId,
        "items.variant": variantId
    }, {
        $inc: {
            "items.$.quantity": -1
        }
    }, {
        new: true
    });

    return res.status(200).json({
        message: "Cart item quantity decremented successfully.",
        success: true
    });

}


export const removeItemFromCart = async (req, res) => {
    try {

        const { productId, variantId } = req.params;

        // Check if product and variant exist
        const product = await productModel.findOne({
            _id: productId,
            "variants._id": variantId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product or variant not found.",
                success: false
            });
        }

        // Find user's cart
        const cart = await cartModel.findOne({
            user: req.user._id
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found.",
                success: false
            });
        }

        // Check if item exists in cart
        const itemExists = cart.items.some(
            item =>
                item.product.toString() === productId &&
                item.variant?.toString() === variantId
        );

        if (!itemExists) {
            return res.status(404).json({
                message: "Item not found in cart.",
                success: false
            });
        }

        // Remove item from cart
        const updatedCart = await cartModel.findOneAndUpdate(
            {
                user: req.user._id
            },
            {
                $pull: {
                    items: {
                        product: new mongoose.Types.ObjectId(productId),
                        variant: new mongoose.Types.ObjectId(variantId)
                    }
                }
            },
            {
                new: true
            }
        );

        return res.status(200).json({
            message: "Item removed from cart successfully.",
            success: true,
            cart: updatedCart
        });

    } catch (error) {

        console.error("Remove Cart Item Error:", error);

        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });

    }
};

export const createOrderController = async(req,res)=>{


    const cart = await getCartDetails(req.user._id)

    if (!cart) {
        return res.status(400).json({
            message: "Cart is empty",
            success: false
        })
    }
    
    const order = await createOrder({amount:cart.totalPrice,currency:cart.currency});


    const payment = await paymentModel.create({
        user:req.user._id,
        razorpay:{
            orderId:order.id,
        },
        price:{
            amount:cart.totalPrice,
            currency:cart.currency
        },
        orderItems:cart.items.map(item=>({
            title: item.product.title,
            productId: item.product._id,
            variantId: item.variant,
            quantity: item.quantity,
            images: item.product.variants.images || item.product.images,
            description: item.product.description,
            price: {
                amount: item.product.variants.price.amount || item.product.price.amount,
                currency: item.product.variants.price.currency || item.product.price.currency
            }
        }))
    })

    return res.status(200).json({
        message:"Order created successfully",
        success:true,
        order
    })
    
};

export const createBuyNowOrderController = async (req, res) => {
    try {
        const { productId, variantId, quantity = 1 } = req.body;

        const product = await productModel.findOne({
            _id: productId,
            "variants._id": variantId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product or variant not found",
                success: false
            });
        }

        const variant = product.variants.find(v => v._id.toString() === variantId);
        
        if (!variant) {
            return res.status(404).json({
                message: "Variant not found",
                success: false
            });
        }

        const amount = variant.price.amount * quantity;
        const currency = variant.price.currency;

        const order = await createOrder({ amount, currency });

        const payment = await paymentModel.create({
            user: req.user._id,
            isBuyNow: true,
            razorpay: {
                orderId: order.id,
            },
            price: {
                amount,
                currency
            },
            orderItems: [{
                title: product.title,
                productId: product._id,
                variantId: variant._id,
                quantity: quantity,
                images: variant.images || product.images,
                description: product.description,
                price: variant.price
            }]
        });

        return res.status(200).json({
            message: "Buy Now order created successfully",
            success: true,
            order
        });
    } catch (error) {
        console.error("Create Buy Now Order Error:", error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
};

export const verifyOrderController = async(req,res)=>{
    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
    } = req.body;

    const payment = await paymentModel.findOne({
        "razorpay.orderId":razorpay_order_id,
        status:"pending"
    })

    if(!payment){
        return res.status(404).json({
            message:"Payment not found",
            success:false
        })
    }

    const isPaymentVerified = validatePaymentVerification({
        order_id:razorpay_order_id,
        payment_id:razorpay_payment_id,
    },razorpay_signature,config.RAZORPAY_KEY_SECRET)

    if(!isPaymentVerified){
        payment.status = "failed"
        await payment.save()


        return res.status(400).json({
            message:"Payment verification failed",
            success:false
        })
    }

    // Perform atomic stock deduction with rollback mechanism
    const stockDeductedItems = [];
    try {
        for (const item of payment.orderItems) {
            const result = await productModel.findOneAndUpdate(
                {
                    _id: item.productId,
                    "variants._id": item.variantId,
                    "variants.stock": { $gte: item.quantity }
                },
                {
                    $inc: { "variants.$.stock": -item.quantity }
                },
                { new: true }
            );

            if (!result) {
                // Insufficient stock or product variant does not exist. Rollback previous items.
                for (const rolledBackItem of stockDeductedItems) {
                    await productModel.findOneAndUpdate(
                        {
                            _id: rolledBackItem.productId,
                            "variants._id": rolledBackItem.variantId
                        },
                        {
                            $inc: { "variants.$.stock": rolledBackItem.quantity }
                        }
                    );
                }

                payment.status = "failed";
                await payment.save();

                return res.status(400).json({
                    message: `Product "${item.title}" is out of stock. Payment has been marked for refund.`,
                    success: false
                });
            }

            stockDeductedItems.push(item);
        }
    } catch (dbError) {
        console.error("Database error during stock lock:", dbError);
        // Rollback any stock we already deducted
        for (const rolledBackItem of stockDeductedItems) {
            await productModel.findOneAndUpdate(
                {
                    _id: rolledBackItem.productId,
                    "variants._id": rolledBackItem.variantId
                },
                {
                    $inc: { "variants.$.stock": rolledBackItem.quantity }
                }
            );
        }
        return res.status(500).json({
            message: "Internal server error during stock reservation.",
            success: false
        });
    }

    payment.status = "paid"

    payment.razorpay.paymentId = razorpay_payment_id
    payment.razorpay.signature = razorpay_signature

    await payment.save()

    if (!payment.isBuyNow) {
        await cartModel.deleteOne({
            user: payment.user
        })
    }

    // Send Transactional Emails asynchronously so we don't block the API response
    try {
        const buyer = await userModel.findById(payment.user);
        if (buyer && buyer.email) {
            const buyerName = buyer.fullname || "Customer";
            const buyerEmail = buyer.email;
            const orderId = payment.razorpay.orderId;
            const paymentId = payment.razorpay.paymentId;
            const formattedTotal = `${payment.price.currency === 'INR' ? '₹' : payment.price.currency + ' '}${payment.price.amount}`;

            const itemsHtml = payment.orderItems.map(item => {
                const currency = item.price.currency || 'INR';
                const itemTotal = `${currency === 'INR' ? '₹' : currency + ' '}${item.price.amount * item.quantity}`;
                return `
                    <tr style="border-bottom: 1px solid #111111; font-size: 13px; color: #a1a1aa;">
                        <td style="padding: 12px 0;">
                            <div style="font-weight: 700; color: #ffffff;">${item.title}</div>
                            <div style="font-size: 11px; color: #52525b; margin-top: 2px;">${item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : ''}</div>
                        </td>
                        <td align="center" style="padding: 12px 0; color: #ffffff;">${item.quantity}</td>
                        <td align="right" style="padding: 12px 0; color: #ffffff; font-weight: 600;">${itemTotal}</td>
                    </tr>
                `;
            }).join('');

            const buyerHtml = `
                <div style="background-color: #000000; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <!-- Header Accent Line -->
                        <tr>
                            <td height="3" style="background: linear-gradient(to right, #ffffff, #2a2a2a, #ffffff);"></td>
                        </tr>
                        
                        <!-- Brand Logo -->
                        <tr>
                            <td align="center" style="padding: 40px 20px 20px 20px;">
                                <h1 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: 0.1em; color: #ffffff; text-transform: uppercase;">SNITCH</h1>
                                <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: 700; letter-spacing: 0.3em; color: #52525b; text-transform: uppercase;">Streetwear Studio</p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 20px 40px 40px 40px;">
                                <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center; text-transform: uppercase;">ORDER CONFIRMED</h2>
                                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa; font-weight: 400; text-align: center;">
                                    Thank you for shopping at SNITCH, ${buyerName.toUpperCase()}. Your payment was successful, and your order is now being processed.
                                </p>
                                
                                <!-- Order Metadata -->
                                <div style="background-color: #121212; border: 1px solid #27272a; padding: 16px; border-radius: 2px; margin-bottom: 24px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #a1a1aa; line-height: 1.6;">
                                        <tr>
                                            <td style="font-weight: 700; color: #ffffff;">Order ID:</td>
                                            <td align="right">${orderId}</td>
                                        </tr>
                                        <tr>
                                            <td style="font-weight: 700; color: #ffffff;">Payment ID:</td>
                                            <td align="right">${paymentId}</td>
                                        </tr>
                                        <tr>
                                            <td style="font-weight: 700; color: #ffffff;">Date:</td>
                                            <td align="right">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- Items Purchased -->
                                <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">ITEMS PURCHASED</h3>
                                
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; border-collapse: collapse;">
                                    <thead>
                                        <tr style="border-bottom: 1px solid #1a1a1a; font-size: 11px; font-weight: 700; color: #52525b; text-transform: uppercase; text-align: left;">
                                            <th style="padding: 8px 0; width: 60%;">Product</th>
                                            <th style="padding: 8px 0; text-align: center; width: 15%;">Qty</th>
                                            <th style="padding: 8px 0; text-align: right; width: 25%;">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                    <tfoot>
                                        <tr style="border-top: 1px solid #1a1a1a; font-size: 14px; font-weight: 700; color: #ffffff;">
                                            <td colspan="2" style="padding: 16px 0 8px 0;">Total Amount Paid</td>
                                            <td align="right" style="padding: 16px 0 8px 0; color: #ffffff;">${formattedTotal}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                
                                <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 0 0 24px 0;" />
                                
                                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #ffffff; text-align: center; font-weight: 700; letter-spacing: 0.05em;">
                                    THANK YOU FOR VISITING, VISIT AGAIN!
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td align="center" style="background-color: #050505; padding: 24px 20px; border-top: 1px solid #101010; text-align: center;">
                                <p style="margin: 0; font-size: 9px; font-weight: 700; letter-spacing: 0.25em; color: #3f3f46; text-transform: uppercase;">
                                    Snitch Streetwear © 2025
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            `;

            // Dispatch buyer email
            await sendEmail({
                to: buyerEmail,
                subject: `Snitch - Order Confirmed #${orderId}`,
                html: buyerHtml
            });

            // Group purchased items by seller
            const itemsWithSellers = await Promise.all(
                payment.orderItems.map(async (item) => {
                    const product = await productModel.findById(item.productId).select("seller");
                    return {
                        item,
                        sellerId: product ? product.seller.toString() : null
                    };
                })
            );

            const sellerGroups = {};
            for (const { item, sellerId } of itemsWithSellers) {
                if (!sellerId) continue;
                if (!sellerGroups[sellerId]) {
                    sellerGroups[sellerId] = [];
                }
                sellerGroups[sellerId].push(item);
            }

            // Send order notifications to each seller
            for (const sellerId of Object.keys(sellerGroups)) {
                const seller = await userModel.findById(sellerId);
                if (seller && seller.email) {
                    const sellerName = seller.fullname || "Seller";
                    const sellerEmail = seller.email;
                    const items = sellerGroups[sellerId];

                    let sellerTotalAmount = 0;
                    let currency = 'INR';
                    const sellerItemsHtml = items.map(item => {
                        const itemTotal = item.price.amount * item.quantity;
                        sellerTotalAmount += itemTotal;
                        currency = item.price.currency || 'INR';
                        const formattedItemTotal = `${currency === 'INR' ? '₹' : currency + ' '}${itemTotal}`;
                        return `
                            <tr style="border-bottom: 1px solid #111111; font-size: 13px; color: #a1a1aa;">
                                <td style="padding: 12px 0;">
                                    <div style="font-weight: 700; color: #ffffff;">${item.title}</div>
                                </td>
                                <td align="center" style="padding: 12px 0; color: #ffffff;">${item.quantity}</td>
                                <td align="right" style="padding: 12px 0; color: #ffffff; font-weight: 600;">${formattedItemTotal}</td>
                            </tr>
                        `;
                    }).join('');

                    const formattedSellerTotal = `${currency === 'INR' ? '₹' : currency + ' '}${sellerTotalAmount}`;

                    const sellerHtml = `
                        <div style="background-color: #000000; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                <!-- Header Accent Line -->
                                <tr>
                                    <td height="3" style="background: linear-gradient(to right, #ffffff, #2a2a2a, #ffffff);"></td>
                                </tr>
                                
                                <!-- Brand Logo -->
                                <tr>
                                    <td align="center" style="padding: 40px 20px 20px 20px;">
                                        <h1 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: 0.1em; color: #ffffff; text-transform: uppercase;">SNITCH</h1>
                                        <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: 700; letter-spacing: 0.3em; color: #52525b; text-transform: uppercase;">Seller Hub</p>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 20px 40px 40px 40px;">
                                        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center; text-transform: uppercase;">NEW ORDER RECEIVED</h2>
                                        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa; font-weight: 400; text-align: center;">
                                            Hello ${sellerName.toUpperCase()}, a new order has arrived from user <strong>${buyerName}</strong> (${buyerEmail}).
                                        </p>
                                        
                                        <!-- Order Metadata -->
                                        <div style="background-color: #121212; border: 1px solid #27272a; padding: 16px; border-radius: 2px; margin-bottom: 24px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #a1a1aa; line-height: 1.6;">
                                                <tr>
                                                    <td style="font-weight: 700; color: #ffffff;">Order ID:</td>
                                                    <td align="right">${orderId}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight: 700; color: #ffffff;">Date:</td>
                                                    <td align="right">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                </tr>
                                            </table>
                                        </div>

                                        <!-- Seller's Items -->
                                        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em;">YOUR ITEMS SOLD</h3>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; border-collapse: collapse;">
                                            <thead>
                                                <tr style="border-bottom: 1px solid #1a1a1a; font-size: 11px; font-weight: 700; color: #52525b; text-transform: uppercase; text-align: left;">
                                                    <th style="padding: 8px 0; width: 60%;">Product</th>
                                                    <th style="padding: 8px 0; text-align: center; width: 15%;">Qty</th>
                                                    <th style="padding: 8px 0; text-align: right; width: 25%;">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${sellerItemsHtml}
                                            </tbody>
                                            <tfoot>
                                                <tr style="border-top: 1px solid #1a1a1a; font-size: 14px; font-weight: 700; color: #ffffff;">
                                                    <td colspan="2" style="padding: 16px 0 8px 0;">Total Earnings</td>
                                                    <td align="right" style="padding: 16px 0 8px 0; color: #ffffff;">${formattedSellerTotal}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                        
                                        <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 0 0 24px 0;" />
                                        
                                        <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #52525b; text-align: center;">
                                            Please prepare the packaging and prepare to ship these items. Access your Seller Dashboard to manage fulfillment.
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="background-color: #050505; padding: 24px 20px; border-top: 1px solid #101010; text-align: center;">
                                        <p style="margin: 0; font-size: 9px; font-weight: 700; letter-spacing: 0.25em; color: #3f3f46; text-transform: uppercase;">
                                            Snitch Streetwear © 2025
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    `;

                    await sendEmail({
                        to: sellerEmail,
                        subject: `Snitch - New Order Received`,
                        html: sellerHtml
                    });
                }
            }
        }
    } catch (emailError) {
        console.error("Error sending order confirmation / seller notification emails:", emailError);
    }

    return res.status(200).json({
        message:"Payment verification successful",
        success:true
    })

}





  