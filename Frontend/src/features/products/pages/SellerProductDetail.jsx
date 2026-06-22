import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Plus, Image as ImageIcon, Box, Trash2, Edit3, X, ImageOff, UploadCloud, Tag, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Nav from '../../Shared/Components/Nav';

const CURRENCY_OPTIONS = [
    { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
    { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
    { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
];

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */
const formatPrice = (amount, currency = "INR") => {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount}`;
    }
};

const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ═══════════════════════════════════════════════════════
   SellerProductDetail
   ═══════════════════════════════════════════════════════ */
const SellerProductDetail = () => {
    const { handleGetProductById, handleAddProductVariant, handleDeleteProduct, handleDeleteProductVariant, handleUpdateProductVariant, handleUpdateProduct } = useProduct();
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const isActionLoading = useSelector((state) => state.product?.loading);

    // Local state for variants to manage UI independently of the backend API
    const [variants, setVariants] = useState([]);

    // Form state for creating a new variant
    const [showAddForm, setShowAddForm] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    // Variant form: color + sizes flow
    const [variantColor, setVariantColor] = useState('');
    const [variantSizes, setVariantSizes] = useState([]);
    const [customSize, setCustomSize] = useState('');
    const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38'];

    // Form state for creating a new variant
    const [newVariant, setNewVariant] = useState({
        images: [],
        stock: 0,
        price: { amount: '', currency: 'INR' }
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [variantToDelete, setVariantToDelete] = useState(null);

    // Edit Product State
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [editProductData, setEditProductData] = useState({
        title: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'INR'
    });

    async function fetchProductDetails() {
        try {
            const data = await handleGetProductById(productId);
            const prodData = data?.product || data;
            setProduct(prodData);
            setVariants(prodData?.variants || []);
        } catch (error) {
            console.error("Failed to fetch product details", error);
        } finally {
            setIsInitialLoad(false);
        }
    }

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    // State for editing variant
    const [editingVariantId, setEditingVariantId] = useState(null);

    // Handle adding a variant — color + sizes flow.
    // Creates one variant per selected size (all sharing the same color, images, stock, price).
    const handleSaveVariant = async (e) => {
        e.preventDefault();

        if (!variantColor.trim()) {
            alert('Please enter a color.');
            return;
        }
        if (variantSizes.length === 0) {
            alert('Please select at least one size.');
            return;
        }

        const basePrice = {
            amount: newVariant.price.amount ? Number(newVariant.price.amount) : (product?.price?.amount || 0),
            currency: newVariant.price.currency || 'INR'
        };
        const baseStock = Number(newVariant.stock) || 0;
        const baseImages = newVariant.images;

        if (editingVariantId) {
            // Edit Flow
            const size = variantSizes[0];
            const attributesObj = { color: variantColor.trim(), size };
            const payload = { images: baseImages, stock: baseStock, attributes: attributesObj, price: basePrice };
            
            try {
                const updatedProduct = await handleUpdateProductVariant(productId, editingVariantId, payload);
                if (updatedProduct && updatedProduct.variants) {
                    setVariants(updatedProduct.variants);
                } else {
                    setVariants(prev => prev.map(v => v._id === editingVariantId ? {
                        ...v,
                        images: baseImages.map(img => ({ url: img.url || img.previewUrl })),
                        stock: baseStock,
                        attributes: attributesObj,
                        price: basePrice
                    } : v));
                }
            } catch (err) {
                console.error("Failed to update variant", err);
                alert("Failed to update variant");
                return;
            }
        } else {
            // Create Flow
            const createdVariants = [];
            for (const size of variantSizes) {
                const attributesObj = { color: variantColor.trim(), size };
                const payload = { images: baseImages, stock: baseStock, attributes: attributesObj, price: basePrice };
                try {
                    await handleAddProductVariant(productId, payload);
                    const uiImages = baseImages.map(img => ({ url: img.previewUrl }));
                    createdVariants.push({
                        _id: Math.random().toString(36).substr(2, 9),
                        images: uiImages, stock: baseStock,
                        attributes: attributesObj, price: basePrice
                    });
                } catch (err) {
                    console.error(`Failed to add variant color=${variantColor} size=${size}:`, err);
                }
            }
            if (createdVariants.length > 0) setVariants(prev => [...prev, ...createdVariants]);
        }

        setShowAddForm(false);
        setEditingVariantId(null);
        setVariantColor('');
        setVariantSizes([]);
        setCustomSize('');
        setNewVariant({ images: [], stock: 0, price: { amount: '', currency: 'INR' } });
    };

    const handleEditVariant = (variant) => {
        let color = '';
        let size = '';
        if (typeof variant.attributes === 'string') {
            try {
                const parsed = JSON.parse(variant.attributes);
                color = parsed.color || '';
                size = parsed.size || '';
            } catch (e) {}
        } else if (variant.attributes) {
            color = variant.attributes.color || '';
            size = variant.attributes.size || '';
        }
        
        setVariantColor(color);
        setVariantSizes(size ? [String(size)] : []);
        setNewVariant({
            images: (variant.images || []).map(img => ({ previewUrl: img.url, url: img.url })),
            stock: variant.stock || 0,
            price: { amount: variant.price?.amount || '', currency: variant.price?.currency || 'INR' }
        });
        setEditingVariantId(variant._id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleSize = (size) => {
        if (editingVariantId) {
            setVariantSizes([size]);
        } else {
            setVariantSizes(prev =>
                prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
            );
        }
    };

    const addCustomSize = () => {
        const s = customSize.trim();
        if (s && !variantSizes.includes(s)) {
            if (editingVariantId) {
                setVariantSizes([s]);
            } else {
                setVariantSizes(prev => [...prev, s]);
            }
        }
        setCustomSize('');
    };

    const processFiles = (files) => {
        if (!files || files.length === 0) return;

        const remainingSlots = 7 - newVariant.images.length;
        const filesToAdd = files.slice(0, remainingSlots);

        const newImages = filesToAdd.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setNewVariant(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
    };

    const handleImageUpload = (e) => {
        processFiles(Array.from(e.target.files));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleEditProductClick = () => {
        setEditProductData({
            title: product.title || '',
            description: product.description || '',
            priceAmount: product.price?.amount || '',
            priceCurrency: product.price?.currency || 'INR'
        });
        setShowEditProductModal(true);
    };

    const handleSaveProductEdit = async (e) => {
        e.preventDefault();
        try {
            const updated = await handleUpdateProduct(productId, editProductData);
            if (updated) {
                setProduct(updated);
                setShowEditProductModal(false);
            }
        } catch (error) {
            console.error("Failed to update product:", error);
        }
    };

    if (isInitialLoad) {
        return (
            <div className="min-h-screen bg-[#060606] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center gap-4 text-white">
                <p className="text-[13px] tracking-[0.2em] uppercase font-bold text-zinc-500">Product Not Found</p>
                <button onClick={() => navigate(-1)} className="text-[11px] uppercase tracking-[0.1em] border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black pb-20" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            
            {/* ══ GLOBAL ACTION LOADING OVERLAY ══ */}
            {isActionLoading && !isInitialLoad && (
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

            {/* Header */}
            <Nav title="Product Details" homeRoute="/seller/dashboard" />

            <main className="max-w-screen-xl mx-auto px-6 pt-24 space-y-12 relative z-10">

                {/* ═══════════════════════════════════════════════════════
                   Product Summary
                ═══════════════════════════════════════════════════════ */}
                <section className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 bg-[#09090b]/65 border border-white/[0.04] backdrop-blur-sm hover:border-white/[0.12] transition-all duration-500 overflow-hidden group">
                    <div className="aspect-[4/5] bg-[#0f0f0f] relative flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/[0.06]">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0].url}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                        ) : (
                            <ImageOff className="w-8 h-8 text-zinc-700" strokeWidth={1} />
                        )}
                        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/10">
                            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Base Product</span>
                        </div>
                    </div>

                    <div className="flex flex-col p-6 lg:p-12 relative">
                        {/* Actions */}
                        <div className="absolute top-6 right-6 lg:top-12 lg:right-12 flex items-center gap-3">
                            <button
                                onClick={handleEditProductClick}
                                className="w-10 h-10 flex items-center justify-center border border-white/[0.06] backdrop-blur-sm text-zinc-550 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                                aria-label="Edit Product"
                                title="Edit Product"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-10 h-10 flex items-center justify-center border border-white/[0.06] backdrop-blur-sm text-zinc-550 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300 cursor-pointer"
                                aria-label="Delete Product"
                                title="Delete Product"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="pr-24 sm:pr-28 lg:pr-32">
                            <h1
                                className="text-[clamp(1.5rem,4vw,3.5rem)] font-black text-white tracking-wider leading-[1.1] uppercase"
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                            >
                                {product.title}
                            </h1>
                            <p className="text-[14px] text-zinc-400 mt-4 leading-relaxed max-w-2xl font-light">
                                {product.description || "No description provided."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-auto pt-8 sm:pt-10 border-t border-white/[0.08]">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mb-2">Base Price</span>
                                <span className="text-[28px] font-black tracking-tight text-white leading-none">
                                    {formatPrice(product.price?.amount, product.price?.currency)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mb-2">Listed On</span>
                                <span className="text-[16px] font-medium text-zinc-300">
                                    {formatDate(product.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                   Variants Management
                ═══════════════════════════════════════════════════════ */}
                <section className="space-y-8 pt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-white/[0.08] pb-6 gap-4 sm:gap-0">
                        <div>
                            <h2 className="text-[32px] uppercase tracking-wider leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                Inventory & Variants
                            </h2>
                            <p className="text-[12px] text-zinc-500 tracking-[0.1em] mt-2 uppercase font-semibold">Manage stock, specific pricing, and styles</p>
                        </div>
                        <button
                            onClick={() => {
                                if (showAddForm) {
                                    setShowAddForm(false);
                                    setEditingVariantId(null);
                                    setVariantColor('');
                                    setVariantSizes([]);
                                    setNewVariant({ images: [], stock: 0, price: { amount: '', currency: 'INR' } });
                                } else {
                                    setShowAddForm(true);
                                }
                            }}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase px-6 py-3.5 transition-all duration-300 cursor-pointer active:scale-[0.98] ${showAddForm
                                ? "bg-transparent border border-white/20 text-white hover:bg-white/5"
                                : "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-zinc-200"
                                }`}
                        >
                            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showAddForm ? "Cancel" : "Add Variant"}
                        </button>
                    </div>

                    {/* Add/Edit Variant Form */}
                    {showAddForm && (
                        <form onSubmit={handleSaveVariant} className="bg-[#09090b]/65 border border-white/[0.04] backdrop-blur-sm p-5 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 animate-in slide-in-from-top-8 fade-in duration-500 relative overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <div className="space-y-2 lg:col-span-3 border-b border-white/[0.05] pb-4">
                                <h3 className="text-[14px] font-bold tracking-[0.25em] uppercase text-white flex items-center gap-3">
                                    <span className="w-2 h-2 bg-white rounded-full inline-block animate-pulse" />
                                    {editingVariantId ? "Edit Variant" : "Configure New Variant"}
                                </h3>
                            </div>

                            {/* Dynamic Images */}
                            <div className="space-y-3 lg:col-span-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">Images (Up to 7)</label>
                                    <span className="text-[10px] text-zinc-500 font-bold tracking-widest">
                                        {newVariant.images.length} / 7
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-2">
                                    {newVariant.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-[4/5] bg-zinc-950 border border-white/[0.08] overflow-hidden group shadow-lg">
                                            <img src={img.previewUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImgs = newVariant.images.filter((_, i) => i !== idx);
                                                    setNewVariant({ ...newVariant, images: newImgs });
                                                }}
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {newVariant.images.length < 7 && (
                                        <label
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`relative aspect-[4/5] flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-md transition-all duration-300 cursor-pointer group overflow-hidden ${isDragging
                                                ? "border-white bg-white/[0.05] scale-105"
                                                : "bg-[#09090b]/35 border-white/[0.08] hover:border-white/[0.22] hover:bg-white/[0.02]"
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="w-12 h-12 rounded-full bg-[#141414] border border-white/[0.05] group-hover:border-white/[0.2] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg relative z-10">
                                                <UploadCloud className={`w-5 h-5 transition-colors ${isDragging ? "text-white" : "text-zinc-400 group-hover:text-white"}`} />
                                            </div>
                                            <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors relative z-10 ${isDragging ? "text-white" : "text-zinc-500 group-hover:text-white"}`}>
                                                {isDragging ? "Drop Here" : "Upload Image"}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Stock */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <Box className="w-3.5 h-3.5" />
                                    Available Stock
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={newVariant.stock}
                                        onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                                        className="w-full bg-[#09090b]/45 border border-white/[0.06] rounded-md text-white text-[15px] font-bold px-5 py-4 outline-none focus:border-white/20 focus:bg-[#0c0c0e]/85 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-focus-within:text-white transition-colors">Units</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-3 lg:col-span-2">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5" />
                                    Price Override <span className="text-zinc-550 font-normal ml-1">(Optional)</span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3 lg:w-2/3">
                                    <div className="relative flex-1 group">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder={product?.price?.amount}
                                            value={newVariant.price.amount}
                                            onChange={(e) => setNewVariant({ ...newVariant, price: { ...newVariant.price, amount: e.target.value } })}
                                            className="w-full bg-[#09090b]/45 border border-white/[0.06] rounded-md text-white text-[15px] font-bold pl-5 pr-12 py-4 outline-none focus:border-white/20 focus:bg-[#0c0c0e]/85 transition-all duration-300 placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    <div className="w-full sm:w-[180px] h-[56px] sm:h-auto">
                                        <CurrencyPicker
                                            value={newVariant.price.currency}
                                            onChange={(code) => setNewVariant({ ...newVariant, price: { ...newVariant.price, currency: code } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Step 1: Color ── */}
                            <div className="space-y-3 lg:col-span-3 border-t border-white/[0.05] pt-6 mt-2">
                                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em]">
                                    Step 1 — Color <span className="text-red-400/80 ml-1">*Required</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Red, Navy Blue, Charcoal..."
                                    value={variantColor}
                                    onChange={(e) => setVariantColor(e.target.value)}
                                    className="w-full sm:w-80 bg-[#09090b]/45 border border-white/[0.06] text-white text-[14px] px-5 py-3.5 outline-none focus:border-white/20 focus:bg-[#0c0c0e]/85 transition-colors placeholder:text-zinc-700"
                                />
                            </div>

                            {/* ── Step 2: Sizes ── */}
                            <div className="space-y-4 lg:col-span-3">
                                <div>
                                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em]">
                                        Step 2 — Sizes available in this color <span className="text-red-400/80 ml-1">*Required</span>
                                    </label>
                                    <p className="text-[10px] text-zinc-650 mt-1">
                                        {editingVariantId ? "Select size." : "Click to select. Each size becomes a separate variant."}
                                    </p>
                                </div>

                                {/* Preset size chips */}
                                <div className="flex flex-wrap gap-2">
                                    {SIZE_PRESETS.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`h-10 px-4 text-[11px] font-black tracking-[0.15em] uppercase border transition-all duration-200 cursor-pointer ${
                                                variantSizes.includes(size)
                                                    ? 'border-white bg-white text-black'
                                                    : 'border-white/[0.1] text-zinc-550 hover:border-white/30 hover:text-white'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom size input */}
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Custom size (e.g. 40, XXXL)..."
                                        value={customSize}
                                        onChange={(e) => setCustomSize(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSize(); } }}
                                        className="w-56 bg-[#09090b]/45 border border-white/[0.06] text-white text-[12px] px-4 py-2.5 outline-none focus:border-white/20 focus:bg-[#0c0c0e]/85 transition-colors placeholder:text-zinc-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomSize}
                                        className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest border border-white/20 text-zinc-400 hover:text-white hover:border-white/50 transition-colors cursor-pointer"
                                    >
                                        + Add
                                    </button>
                                </div>

                                {/* Selected sizes preview */}
                                {variantSizes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest self-center">Will create:</span>
                                        {variantSizes.map(size => (
                                            <div key={size} className="flex items-center gap-1 bg-white/[0.06] border border-white/10 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                                                <span className="text-zinc-500">{variantColor || '?'}</span>
                                                <span className="text-zinc-700 mx-1">/</span>
                                                <span>{size}</span>
                                                <button type="button" onClick={() => toggleSize(size)} className="ml-1.5 text-zinc-550 hover:text-red-405 transition-colors cursor-pointer">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-3 flex justify-stretch sm:justify-end pt-6 border-t border-white/[0.05]">
                                <button type="submit" className="w-full sm:w-auto bg-white text-black text-[12px] font-black tracking-[0.2em] uppercase px-10 py-4 hover:bg-zinc-200 transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]">
                                    {editingVariantId
                                        ? 'Update Variant'
                                        : (variantSizes.length > 1
                                            ? `Create ${variantSizes.length} Variants`
                                            : 'Save Variant')}
                                </button>
                            </div>

                        </form>
                    )}

                    {/* Variants List */}
                    {variants.length === 0 ? (
                        <div className="border border-dashed border-white/[0.08] py-24 flex flex-col items-center justify-center gap-6 bg-[#09090b]/45 hover:bg-white/[0.02] transition-colors duration-500">
                            <div className="w-16 h-16 border border-white/[0.08] flex items-center justify-center rounded-full bg-black">
                                <Box className="w-6 h-6 text-zinc-650" />
                            </div>
                            <p className="text-[13px] text-zinc-450 tracking-[0.3em] uppercase font-bold">No variants configured</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {variants.map((variant, idx) => (
                                <div key={variant._id || idx} className="flex flex-col md:flex-row gap-6 p-5 sm:p-6 bg-[#09090b]/65 border border-white/[0.04] backdrop-blur-sm hover:border-white/[0.12] hover:bg-[#0c0c0e]/80 transition-all duration-550 group shadow-lg">

                                    {/* Image & Attributes */}
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start flex-1 min-w-0">
                                        {/* Variant Images */}
                                        <div className="shrink-0 w-full sm:w-auto sm:max-w-[300px] min-w-0">
                                            <VariantImagesScroller images={variant.images} />
                                        </div>

                                        {/* Variant Attributes */}
                                        <div className="flex flex-col gap-3 flex-1 w-full min-w-0 mt-2 sm:mt-0">
                                            <div className="flex flex-wrap gap-2.5">
                                                {(() => {
                                                    let attrs = variant.attributes;
                                                    if (typeof attrs === 'string') {
                                                        try { attrs = JSON.parse(attrs); } catch { attrs = {}; }
                                                    }
                                                    const entries = (attrs && typeof attrs === 'object' && !Array.isArray(attrs))
                                                        ? Object.entries(attrs)
                                                        : [];
                                                    return entries.length > 0 ? (
                                                        entries.map(([key, val]) => (
                                                            <div key={key} className="flex items-center bg-[#141414]/80 border border-white/[0.06] text-[11px] font-bold uppercase tracking-widest rounded-sm overflow-hidden">
                                                                <span className="px-3 py-1.5 text-zinc-550 bg-black/40">{key}</span>
                                                                <span className="px-3 py-1.5 text-white">{String(val)}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-[11px] text-zinc-650 italic">No attributes defined</span>
                                                    );
                                                })()}

                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats & Actions */}
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/[0.05] sm:items-center">

                                        {/* Price */}
                                        <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start gap-1 sm:pl-6 sm:border-l border-white/[0.05] min-w-[120px]">
                                            <span className="text-[10px] text-zinc-550 font-bold tracking-[0.2em] uppercase">Price</span>
                                            <span className="text-[18px] font-black text-white">
                                                {formatPrice(variant.price?.amount, variant.price?.currency)}
                                            </span>
                                        </div>

                                        {/* Stock Management */}
                                        <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start gap-2 sm:pl-6 sm:border-l border-white/[0.05] min-w-[150px]">
                                            <span className="text-[10px] text-zinc-550 font-bold tracking-[0.2em] uppercase">Stock</span>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-[20px] font-black tracking-tight ${variant.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                                                    {variant.stock} <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1.5 hidden sm:inline-block">units</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row sm:flex-col justify-end sm:justify-start items-center sm:items-start gap-2 sm:pl-6 sm:border-l border-white/[0.05]">
                                            <button
                                                onClick={() => handleEditVariant(variant)}
                                                className="w-10 h-10 flex items-center justify-center border border-white/[0.06] text-zinc-650 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] sm:opacity-0 group-hover:opacity-100"
                                                aria-label="Edit Variant"
                                                title="Edit Variant"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setVariantToDelete({ id: variant._id, index: idx })}
                                                className="w-10 h-10 flex items-center justify-center border border-white/[0.06] text-zinc-650 hover:text-red-500 hover:border-red-500/30 hover:bg-red-550/10 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] sm:opacity-0 group-hover:opacity-100"
                                                aria-label="Delete Variant"
                                                title="Delete Variant"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* ══ EDIT PRODUCT MODAL ══ */}
            {showEditProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#09090b]/90 border border-white/[0.08] p-6 sm:p-8 max-w-2xl w-full shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto backdrop-blur-xl">
                        <div className="flex justify-between items-center border-b border-white/[0.05] pb-4">
                            <h3 className="text-[clamp(1.5rem,3vw,2rem)] text-white uppercase leading-[1.1] tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                Edit Product
                            </h3>
                            <button onClick={() => setShowEditProductModal(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProductEdit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editProductData.title}
                                    onChange={(e) => setEditProductData({...editProductData, title: e.target.value})}
                                    className="w-full bg-[#09090b]/45 border border-white/[0.06] text-white text-[14px] px-4 py-3 outline-none focus:border-white/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={editProductData.description}
                                    onChange={(e) => setEditProductData({...editProductData, description: e.target.value})}
                                    className="w-full bg-[#09090b]/45 border border-white/[0.06] text-white text-[14px] px-4 py-3 outline-none focus:border-white/50 transition-colors resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Price Amount</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={editProductData.priceAmount}
                                        onChange={(e) => setEditProductData({...editProductData, priceAmount: e.target.value})}
                                        className="w-full bg-[#09090b]/45 border border-white/[0.06] text-white text-[14px] px-4 py-3 outline-none focus:border-white/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Currency</label>
                                    <select
                                        value={editProductData.priceCurrency}
                                        onChange={(e) => setEditProductData({...editProductData, priceCurrency: e.target.value})}
                                        className="w-full bg-[#09090b]/45 border border-white/[0.06] text-white text-[14px] px-4 py-3 outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer"
                                    >
                                        {CURRENCY_OPTIONS.map(opt => (
                                            <option key={opt.code} className="bg-zinc-950 text-white" value={opt.code}>{opt.flag} {opt.code}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-white/[0.05]">
                                <button
                                    type="button"
                                    onClick={() => setShowEditProductModal(false)}
                                    className="flex-1 py-3 border border-white/20 text-white text-[12px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-white text-black text-[12px] font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══ DELETE CONFIRMATION MODAL ══ */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#09090b]/95 border border-red-500/[0.15] p-6 sm:p-8 max-w-md w-full shadow-[0_30px_70px_rgba(239,68,68,0.08)] flex flex-col gap-6 backdrop-blur-xl">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-[clamp(1.5rem,3vw,2rem)] text-white uppercase leading-[1.1] tracking-widest mb-1 text-red-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                Delete Product
                            </h3>
                            <p className="text-[13px] text-zinc-400 font-normal leading-[1.6]">
                                Are you sure you want to delete this product? This action cannot be undone and will permanently remove all variants and data.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 border border-white/20 text-white text-[12px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await handleDeleteProduct(product._id);
                                        setShowDeleteConfirm(false);
                                        navigate('/seller/dashboard');
                                    } catch (error) {
                                        console.error("Failed to delete product:", error);
                                    }
                                }}
                                className="flex-1 bg-red-650 text-white text-[11px] font-black tracking-[0.2em] uppercase h-12 hover:bg-red-600 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)] active:scale-[0.98]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ DELETE VARIANT CONFIRMATION MODAL ══ */}
            {variantToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#09090b]/95 border border-red-500/[0.15] p-6 sm:p-8 max-w-md w-full shadow-[0_30px_70px_rgba(239,68,68,0.08)] flex flex-col gap-6 backdrop-blur-xl">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-[clamp(1.5rem,3vw,2rem)] text-white uppercase leading-[1.1] tracking-widest mb-1 text-red-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                Delete Variant
                            </h3>
                            <p className="text-[13px] text-zinc-400 font-normal leading-[1.6]">
                                Are you sure you want to delete this variant? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setVariantToDelete(null)}
                                className="flex-1 border border-white/20 text-white text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase h-12 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        if (variantToDelete.id) {
                                            await handleDeleteProductVariant(product._id, variantToDelete.id);
                                        }
                                        const updatedVariants = variants.filter((_, i) => i !== variantToDelete.index);
                                        setVariants(updatedVariants);
                                        setVariantToDelete(null);
                                    } catch (error) {
                                        console.error("Failed to delete variant:", error);
                                    }
                                }}
                                className="flex-1 bg-red-655 text-white text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase h-12 hover:bg-red-600 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)] active:scale-[0.98]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerProductDetail;

/* ═══════════════════════════════════════════════════════
   Variant Images Scroller
   ═══════════════════════════════════════════════════════ */
const VariantImagesScroller = ({ images }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 110; // approximate width of one image + gap
            scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const hasMultipleImages = images && images.length > 1;

    return (
        <div className="relative flex shrink-0 group/scroller w-full min-w-0">
            {/* Left Button */}
            {hasMultipleImages && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/20 rounded-full text-white opacity-0 group-hover/scroller:opacity-100 transition-all hover:bg-white hover:text-black hover:scale-110 shadow-lg cursor-pointer hidden md:flex"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto shrink-0 max-w-full pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
            >
                {images && images.length > 0 ? (
                    images.map((img, imgIdx) => (
                        <div key={imgIdx} className="w-20 sm:w-24 md:w-[100px] shrink-0 aspect-[4/5] bg-zinc-950/80 border border-white/[0.06] flex items-center justify-center overflow-hidden relative group/img snap-start">
                            <img src={img.url || img.previewUrl} alt={`Variant ${imgIdx + 1}`} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                        </div>
                    ))
                ) : (
                    <div className="w-20 sm:w-24 md:w-[100px] shrink-0 aspect-[4/5] bg-zinc-955/80 border border-white/[0.06] flex items-center justify-center overflow-hidden snap-start">
                        <ImageIcon className="w-6 h-6 text-zinc-750" />
                    </div>
                )}
            </div>

            {/* Right Button */}
            {hasMultipleImages && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/20 rounded-full text-white opacity-0 group-hover/scroller:opacity-100 transition-all hover:bg-white hover:text-black hover:scale-110 shadow-lg cursor-pointer hidden md:flex"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════
   Custom Currency Picker
   ═══════════════════════════════════════════════════════ */
const CurrencyPicker = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = CURRENCY_OPTIONS.find((c) => c.code === value);

    // close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative h-full">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full h-full flex items-center justify-between bg-[#09090b]/45 border border-white/[0.06] rounded-md px-4 py-4 hover:border-white/[0.15] focus:border-white/[0.2] transition-all duration-300 outline-none group cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <span className="text-[16px]">{selected?.flag}</span>
                    <div className="text-left leading-none">
                        <span className="text-[14px] font-black text-white tracking-[0.1em] uppercase block">
                            {selected?.code}
                        </span>
                    </div>
                </div>
                <svg
                    className={`w-3.5 h-3.5 text-zinc-550 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute top-full right-0 mt-1 w-[200px] bg-[#09090b]/95 border border-white/[0.08] backdrop-blur-md rounded-md z-50 overflow-hidden shadow-2xl shadow-black/80 animate-in fade-in duration-200">
                    {CURRENCY_OPTIONS.map((c) => {
                        const isActive = c.code === value;
                        return (
                            <button
                                key={c.code}
                                type="button"
                                onClick={() => { onChange(c.code); setOpen(false); }}
                                className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-200 cursor-pointer ${isActive
                                    ? "bg-white/[0.06] text-white"
                                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-[16px]">{c.flag}</span>
                                    <div className="text-left">
                                        <span className="text-[13px] font-bold block tracking-[0.05em]">
                                            {c.code}
                                        </span>
                                        <span className="text-[10px] text-zinc-550 font-semibold block tracking-[0.05em]">
                                            {c.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-black text-zinc-500">{c.symbol}</span>
                                    {isActive && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};