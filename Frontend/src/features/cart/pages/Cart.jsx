import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Nav from '../../Shared/Components/Nav';
import { useRazorpay } from "react-razorpay";

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

const formatPrice = (amount, currency) => {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            minimumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${CURRENCY_SYMBOLS[currency] || ""}${amount}`;
    }
};

const Cart = () => {
    const cartItems = useSelector(state => state.cart) || [];
    const isActionLoading = useSelector(state => state.cart?.loading);
    const { Razorpay } = useRazorpay();
    const { handleGetCart, handleIncrementItem, handleDecrementItem, handleRemoveItem, handleCreateOrder, handleVerifyOrder } = useCart();
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const user = useSelector(state => state.auth.user);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        handleGetCart();
    }, []);

    async function handleCheckOut() {
        if (!user) {
            showNotification("Please login to proceed to checkout.");
            navigate('/login');
            return;
        }
        const order = await handleCreateOrder();
        console.log(order);
        const options = {
            key: "rzp_test_SoMktJCBBYNrVf",
            amount: order.order.amount,
            currency: order.order.currency,
            name: "Snitch",
            description: "Snitch Checkout",
            order_id: order.order.id,
            handler: async (response) => {
                const isValidPayment = await handleVerifyOrder(response);
                if (isValidPayment) {
                    navigate(`/order-success?order_id=${response?.razorpay_order_id}`);
                }
            },
            prefill: {
                name: user?.fullname,
                email: user?.email,
                contact: user?.contact,
            },
            theme: {
                color: "#F37254",
            },
        };

        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();
    }

    return (
        <div
            className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black pt-24 pb-32"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* ══ GLOBAL ACTION LOADING OVERLAY ══ */}
            {isActionLoading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-5 bg-[#0a0a0a] border border-white/10 px-10 py-8 shadow-2xl">
                        <div className="relative flex items-center justify-center">
                            <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
                            <div className="absolute inset-0 border-2 border-transparent border-b-zinc-500 rounded-full animate-spin-slow opacity-50" />
                        </div>
                        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white animate-pulse">
                            Processing...
                        </p>
                    </div>
                </div>
            )}

            <Nav title="Checkout" />

            <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 animate-in fade-in duration-500">

                {/* ══════════ HERO ══════════ */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-6 mt-6">
                    <div>
                        <div className="flex items-center gap-4 mb-5">
                            <span className="text-[10px] text-zinc-400 font-black tracking-[0.3em] uppercase">
                                Checkout
                            </span>
                            <div className="h-[2px] w-8 bg-white" />
                            <span className="text-[10px] text-zinc-500 font-black tracking-[0.3em] uppercase">
                                {cartItems.items?.length || 0} Items
                            </span>
                        </div>
                        <h1
                          className="text-[clamp(2.8rem,6vw,5.5rem)] text-white leading-[0.88] uppercase"
                          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}
                        >
                            Your<br />
                            <span className="text-zinc-600">Bag</span>
                        </h1>
                    </div>
                </div>

                <div className="h-px w-full bg-white/[0.05] mb-8" />

                {(!cartItems || !cartItems.items || cartItems.items.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 border border-white/[0.04] bg-[#09090b]/40 backdrop-blur-sm">
                        <div className="text-center space-y-3">
                            <p className="text-[12px] text-zinc-400 font-black tracking-[0.25em] uppercase">
                                Your bag is empty
                            </p>
                            <p className="text-[12px] text-zinc-650 tracking-wide max-w-xs leading-relaxed mx-auto font-normal">
                                Browse our exclusive collections to add items to your cart.
                            </p>
                        </div>
                        <button
                            onClick={() => { navigate('/') }}
                            className="flex items-center gap-2 bg-white text-black text-[11px] font-black tracking-[0.18em] uppercase px-6 py-4 hover:bg-zinc-155 active:scale-[0.98] transition-all duration-300 cursor-pointer rounded-none relative overflow-hidden group"
                        >
                            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none" />
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 flex flex-col gap-5">
                            {cartItems.items?.map((item) => {
                                const matchedVariant = Array.isArray(item.product?.variants) ? item.product?.variants?.find(v => v._id === item.variant) : item.product?.variants;
                                const imageUrl = matchedVariant?.images?.[0]?.url || item.product?.images?.[0]?.url;
                                const attributes = matchedVariant?.attributes || {};
                                const stock = matchedVariant?.stock || item.product?.stock;
                                const variantPrice = matchedVariant?.price?.amount || item.product?.price?.amount;
                                const displayPriceAmount = item.price?.amount;
                                const currency = item.price?.currency || 'INR';

                                return (
                                    <div
                                        key={item._id}
                                        className="flex flex-col sm:flex-row bg-[#09090b]/65 border border-white/[0.04] hover:border-white/[0.12] hover:bg-[#0c0c0e]/80 transition-all duration-500 overflow-hidden backdrop-blur-sm shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="w-full sm:w-40 aspect-[3/4] bg-zinc-950/80 overflow-hidden shrink-0 relative border-b sm:border-b-0 sm:border-r border-white/[0.03]">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={item.product?.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-102" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-[9px] text-zinc-650 uppercase tracking-widest font-black">No Image</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col p-4 sm:p-6 gap-3.5">
                                            <div className="flex justify-between items-start gap-4">
                                                <h2 className="text-[15px] font-bold text-white leading-snug tracking-tight">
                                                    {item.product?.title}
                                                </h2>
                                                <button
                                                    onClick={() => handleRemoveItem({ productId: item.product._id, variantId: item.variant })}
                                                    className="text-zinc-500 hover:text-red-500 hover:scale-105 transition-all duration-300 p-2 cursor-pointer bg-white/[0.01] hover:bg-red-500/5 border border-transparent hover:border-red-500/10 shrink-0"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {item.product?.description && (
                                                <p className="text-[11px] text-zinc-500 leading-relaxed tracking-wide line-clamp-1 font-normal">
                                                    {item.product.description}
                                                </p>
                                            )}

                                            {Object.entries(attributes).length > 0 && (
                                                <div className="flex flex-wrap gap-4 mt-0.5">
                                                    {Object.entries(attributes).map(([key, value]) => (
                                                        <div key={key} className="flex gap-2 items-center">
                                                            <span className="text-[9px] text-zinc-600 font-bold tracking-[0.2em] uppercase">{key}:</span>
                                                            <span className="text-[11px] text-zinc-350 uppercase tracking-wider font-semibold">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {stock !== undefined && (
                                                <div className="mt-0.5">
                                                    <span className={`text-[9px] font-black tracking-[0.2em] uppercase px-2.5 py-1 ${stock > 5 ? 'text-zinc-550 border border-zinc-850 bg-zinc-950/20' : stock > 0 ? 'text-orange-500 border border-orange-500/20 bg-orange-950/10' : 'text-red-500 border border-red-500/20 bg-red-950/10'}`}>
                                                        {stock > 0 ? `${stock} IN STOCK` : 'OUT OF STOCK'}
                                                    </span>
                                                </div>
                                            )}

                                            {displayPriceAmount !== variantPrice && (
                                                <div className="mt-2 flex items-start gap-2.5 bg-white/[0.01] border border-white/[0.04] p-3 text-[10px] uppercase tracking-[0.15em] font-bold leading-relaxed">
                                                    <div className={`w-1.5 h-1.5 mt-1 rounded-full shrink-0 ${displayPriceAmount > variantPrice ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                                                    <p className="text-zinc-500">
                                                        {displayPriceAmount > variantPrice
                                                            ? <>Price Dropped. Get this at <span className="text-white">{formatPrice(variantPrice, currency)}</span> (Save <span className="text-green-500">{formatPrice(Math.abs(variantPrice - displayPriceAmount), currency)}</span>)</>
                                                            : <>Price Updated. This costs <span className="text-red-500">{formatPrice(Math.abs(variantPrice - displayPriceAmount), currency)}</span> more</>
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            <div className="h-px bg-white/[0.04] mt-auto pt-2" />

                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center border border-white/[0.06] bg-[#070708]/80 hover:border-white/[0.15] transition-all duration-300">
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity <= 1) {
                                                                showNotification(`Cannot decrease quantity below 1.`);
                                                                return;
                                                            }
                                                            handleDecrementItem({ productId: item.product._id, variantId: item.variant }).catch(err => showNotification(err.message));
                                                        }}
                                                        className="px-3.5 py-2 text-zinc-550 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="px-3 py-2 text-[12px] font-bold w-10 text-center select-none">{item.quantity}</span>
                                                    <button
                                                        onClick={() => {
                                                            if (item.quantity >= stock) {
                                                                showNotification(`Only ${stock} items available in stock.`);
                                                                return;
                                                            }
                                                            handleIncrementItem({ productId: item.product._id, variantId: item.variant }).catch(err => showNotification(err.message));
                                                        }}
                                                        className="px-3.5 py-2 text-zinc-550 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] text-zinc-600 font-bold tracking-[0.2em] uppercase">Total</span>
                                                    <span className="text-[16px] font-black text-white tracking-tight leading-tight">
                                                        {formatPrice(variantPrice * item.quantity, currency)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4">
                            <div className="bg-[#09090b]/80 border border-white/[0.04] p-6 sm:p-8 backdrop-blur-md shadow-[0_30px_70px_rgba(0,0,0,0.85)] sticky top-24 relative overflow-hidden z-10">
                                <h3
                                    className="text-2xl text-white uppercase tracking-wider mb-6"
                                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em" }}
                                >
                                    Summary
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase">Subtotal</span>
                                        <span className="text-[14px] font-bold text-white tracking-tight">
                                            {formatPrice(cartItems.totalPrice || 0, cartItems.currency || 'INR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase">Shipping</span>
                                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-white/[0.05] mb-6" />

                                <div className="flex justify-between items-end mb-8">
                                    <span className="text-[11px] text-white font-bold tracking-[0.2em] uppercase">Total</span>
                                    <span className="text-[24px] font-black text-white tracking-tight leading-none">
                                        {formatPrice(cartItems.totalPrice || 0, cartItems.currency || 'INR')}
                                    </span>
                                </div>

                                <button 
                                    onClick={handleCheckOut} 
                                    className="w-full flex items-center justify-center gap-2 bg-white text-black text-[12px] font-black tracking-[0.18em] uppercase px-6 py-4 hover:bg-zinc-100 active:scale-[0.98] transition-all duration-300 cursor-pointer relative overflow-hidden group"
                                >
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1050 bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none" />
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Custom Alert / Toast */}
            {notification && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 text-white px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-5 fade-in duration-300 rounded-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
                    <span className="text-[11px] font-bold tracking-[0.1em] uppercase">{notification}</span>
                </div>
            )}
        </div>
    );
};

export default Cart;