import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Check,
  Loader2,
  Home,
} from "lucide-react";
import { useProduct } from "../hooks/useProduct";
import { useSelector, useDispatch } from "react-redux";
import { clearError } from "../state/product.slice.js";
import { useNavigate } from "react-router";
import Nav from "../../Shared/Components/Nav";
import { ErrorBanner } from "../../auth/pages/Login.jsx";

const MAX_IMAGES = 7;
const DESC_MAX = 600;

const CURRENCY_OPTIONS = [
  { code: "USD", symbol: "$",  name: "US Dollar",      flag: "🇺🇸" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee",   flag: "🇮🇳" },
  { code: "EUR", symbol: "€",  name: "Euro",           flag: "🇪🇺" },
  { code: "GBP", symbol: "£",  name: "British Pound",  flag: "🇬🇧" },
];

/* ═══════════════════════════════════════════════════════
   CreateProduct
   ═══════════════════════════════════════════════════════ */
const CreateProduct = () => {
  const { handleCreateProduct } = useProduct();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "USD",
  });
  const [images, setImages]             = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess]           = useState(false);
  const [dragOver, setDragOver]         = useState(false);

  const isActionLoading = useSelector((state) => state.product?.loading);
  const reduxError      = useSelector((state) => state.product?.error);

  // Clear product error when this page unmounts
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const fileInputRef = useRef(null);

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error the moment the user starts correcting input
    if (reduxError) dispatch(clearError());
  };

  const addFiles = (files) => {
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...toAdd]);
  };

  const handleImageSelect = (e) => {
    addFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", priceAmount: "", priceCurrency: "USD" });
    images.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setImages([]);
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title",         formData.title.trim());
      fd.append("description",   formData.description.trim());
      fd.append("priceAmount",   formData.priceAmount);
      fd.append("priceCurrency", formData.priceCurrency);
      images.forEach(({ file }) => fd.append("images", file));
      await handleCreateProduct(fd);
      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      // Error is already dispatched to Redux by useProduct — nothing extra needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const slots = Array.from({ length: MAX_IMAGES }, (_, i) => images[i] || null);
  const selectedCurrency = CURRENCY_OPTIONS.find((c) => c.code === formData.priceCurrency);

  /* ── render ── */
  return (
    <div
      className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black"
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

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

      {/* ══════════ HEADER ══════════ */}
      <Nav 
        title="Seller Studio"
        homeRoute="/seller/dashboard"
        rightContent={
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-zinc-455 font-semibold tracking-[0.15em] uppercase hidden sm:block">
                Draft
              </span>
            </div>
            <nav className="flex items-center gap-6 border-l border-white/[0.05] pl-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer text-zinc-500 hover:text-white flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => navigate("/seller/dashboard")}
                className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer text-zinc-500 hover:text-white flex items-center gap-2"
              >
                <Home className="w-3.5 h-3.5" /> Home
              </button>
            </nav>
          </div>
        }
      />

      {/* ══════════ HERO ══════════ */}
      <div className="pt-16 relative overflow-hidden border-b border-white/[0.05]">
        {/* Technical drafting grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.01] rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060606]/20 to-[#060606]" />

        <div className="relative max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 py-14 lg:py-20 z-10">
          <div className="flex items-center gap-4 mb-7">
            <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.28em] uppercase">
              New Listing
            </span>
            <div className="h-px w-12 bg-zinc-700" />
            <span className="text-[11px] text-zinc-650 font-semibold tracking-[0.28em] uppercase">
              SS 2026
            </span>
          </div>

          <h1
            className="text-[clamp(3rem,7vw,6.5rem)] text-white leading-[0.88] uppercase"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}
          >
            Create<br />
            <span className="text-zinc-600">Product</span>
          </h1>

          <p className="mt-6 text-[13px] text-zinc-450 tracking-wide max-w-sm leading-[1.7] font-normal">
            Complete the form below to list your item.
            Fields marked <span className="text-zinc-200 font-semibold">*</span> are required.
          </p>
        </div>
      </div>

      {/* ══════════ FORM ══════════ */}
      <form onSubmit={handleSubmit}>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-white/[0.05]">

            {/* ── LEFT — fields ── */}
            <div className="flex-1 py-12 lg:py-16 lg:pr-16 xl:pr-24 space-y-14 min-w-0">

              {success && (
                <div className="flex items-start gap-3 border border-emerald-800/40 bg-emerald-950/15 px-4 py-3.5 backdrop-blur-sm">
                  <div className="w-[3px] self-stretch bg-emerald-500 shrink-0" />
                  <p className="text-emerald-300 text-[13px] font-medium tracking-wide leading-relaxed">
                    Product listed successfully! The form has been reset for your next listing.
                  </p>
                </div>
              )}

              {reduxError && (
                <ErrorBanner
                  message={reduxError}
                  onDismiss={() => dispatch(clearError())}
                />
              )}

              {/* 01 — Title */}
              <Section index="01" label="Title">
                <div className="relative group mt-3">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Washed Oversized Varsity Jacket"
                    className="w-full bg-[#09090b]/45 border border-white/[0.06] focus:border-white/[0.2] focus:bg-[#0c0c0e]/85 py-3.5 px-4 text-[15px] text-white placeholder-zinc-650 outline-none transition-all duration-300 tracking-tight font-medium"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  {formData.title.length > 0 && (
                    <span className="absolute right-4 bottom-3 text-[11px] text-zinc-500 tabular-nums font-semibold">
                      {formData.title.length}
                    </span>
                  )}
                </div>
              </Section>

              {/* 02 — Description */}
              <Section index="02" label="Description">
                <div className="relative group mt-3">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    maxLength={DESC_MAX}
                    placeholder="Describe the silhouette, fabric composition, fit, care instructions, and any special details that make this piece stand out…"
                    className="w-full bg-[#09090b]/45 border border-white/[0.06] focus:border-white/[0.2] focus:bg-[#0c0c0e]/85 py-4 px-5 text-[13px] text-zinc-100 placeholder-zinc-650 outline-none transition-all duration-300 resize-none leading-[1.75] tracking-wide"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <div className="flex items-center justify-between px-4 py-2.5 border-x border-b border-white/[0.06] bg-[#09090b]/20">
                    <span className="text-[10px] text-zinc-550 tracking-[0.18em] uppercase font-bold">
                      Characters
                    </span>
                    <span className={`text-[11px] tabular-nums font-bold transition-colors duration-300 ${
                      formData.description.length > DESC_MAX * 0.9 ? "text-amber-450" : "text-zinc-500"
                    }`}>
                      {formData.description.length}
                      <span className="text-zinc-700 font-normal">/{DESC_MAX}</span>
                    </span>
                  </div>
                </div>
              </Section>

              {/* 03 — Pricing */}
              <Section index="03" label="Pricing">
                <div className="grid grid-cols-2 gap-6 sm:gap-10 mt-3">

                  {/* Amount */}
                  <div className="relative group">
                    <label
                      htmlFor="priceAmount"
                      className="block text-[11px] text-zinc-500 font-bold tracking-[0.2em] uppercase mb-3 transition-colors duration-300 group-focus-within:text-white"
                    >
                      Amount *
                    </label>
                    <div className="relative">
                      {/* Currency symbol prefix */}
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500 group-focus-within:text-zinc-350 transition-colors duration-350 pointer-events-none">
                        {selectedCurrency?.symbol}
                      </span>
                      <input
                        type="number"
                        id="priceAmount"
                        name="priceAmount"
                        value={formData.priceAmount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="w-full bg-[#09090b]/45 border border-white/[0.06] focus:border-white/[0.2] focus:bg-[#0c0c0e]/85 pl-8 pr-4 py-3.5 text-[15px] text-white placeholder-zinc-650 outline-none transition-all duration-300 font-bold tracking-tight"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                  </div>

                  {/* Custom Currency Picker */}
                  <div>
                    <label className="block text-[11px] text-zinc-500 font-bold tracking-[0.2em] uppercase mb-3">
                      Currency
                    </label>
                    <CurrencyPicker
                      value={formData.priceCurrency}
                      onChange={(code) => setFormData((p) => ({ ...p, priceCurrency: code }))}
                    />
                  </div>
                </div>

                {/* Live price preview */}
                {formData.priceAmount && !isNaN(Number(formData.priceAmount)) && Number(formData.priceAmount) > 0 && (
                  <div className="mt-8 flex items-center gap-4 border-l-2 border-white/20 pl-4 py-1">
                    <span className="text-[11px] text-zinc-500 font-bold tracking-[0.2em] uppercase">
                      Listed value
                    </span>
                    <span
                      className="text-[24px] text-white font-black tracking-tight"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: formData.priceCurrency,
                        minimumFractionDigits: 2,
                      }).format(Number(formData.priceAmount))}
                    </span>
                  </div>
                )}
              </Section>

              {/* Desktop submit */}
              <div className="hidden lg:block pt-2">
                <SubmitButton isSubmitting={isSubmitting} />
                <p className="mt-4 text-[11px] text-zinc-650 tracking-wide leading-relaxed">
                  By listing this product you agree to Snitch's{" "}
                  <span className="text-zinc-400 underline underline-offset-2 cursor-pointer hover:text-white transition-colors">Seller Terms</span>{" "}
                  and{" "}
                  <span className="text-zinc-400 underline underline-offset-2 cursor-pointer hover:text-white transition-colors">Content Policy</span>.
                </p>
              </div>
            </div>

            {/* ── RIGHT — images ── */}
            <div className="lg:w-[420px] xl:w-[480px] shrink-0 py-12 lg:py-16 lg:pl-16 xl:pl-24">
              <div className="lg:sticky lg:top-28">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[11px] text-zinc-600 font-bold tracking-[0.2em]">04</span>
                    <span className="text-[11px] text-zinc-400 font-bold tracking-[0.2em] uppercase">Product Images</span>
                  </div>
                  <span className="text-[11px] font-bold tabular-nums text-zinc-400">
                    {images.length}<span className="text-zinc-700">/{MAX_IMAGES}</span>
                  </span>
                </div>

                {/* Progress */}
                <div className="h-px bg-zinc-800 mb-6 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-white transition-all duration-700 ease-out"
                    style={{ width: `${(images.length / MAX_IMAGES) * 100}%` }}
                  />
                </div>

                {/* Primary image */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative aspect-[4/5] border transition-all duration-550 mb-3 overflow-hidden ${
                    dragOver
                      ? "border-white/40 bg-white/5"
                      : images[0]
                      ? "border-white/[0.06] bg-[#09090b]/40"
                      : "border-dashed border-white/[0.1] hover:border-white/[0.25] hover:bg-white/[0.02]"
                  }`}
                >
                  {images[0] ? (
                    <>
                      <img src={images[0].preview} alt="Primary product" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-500 group flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(0)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/50 text-white text-[11px] font-bold tracking-[0.18em] uppercase px-4 py-2 hover:bg-white hover:text-black cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="absolute top-0 left-0 bg-white text-black text-[9px] font-black tracking-[0.25em] uppercase px-2.5 py-1">
                        Primary
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer group"
                    >
                      <div className="w-12 h-12 border border-white/[0.08] group-hover:border-white/[0.2] flex items-center justify-center transition-all duration-400 bg-white/[0.01]">
                        <Plus className="w-5 h-5 text-zinc-650 group-hover:text-white transition-colors duration-400" strokeWidth={1.5} />
                      </div>
                      <div className="text-center space-y-1.5">
                        <p className="text-[12px] text-zinc-400 font-semibold tracking-[0.14em] uppercase">
                          Add Primary Image
                        </p>
                        <p className="text-[11px] text-zinc-650 tracking-wide">
                          Drag & drop or click to browse
                        </p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Thumbnail strip */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {slots.slice(1).map((img, i) => {
                    const idx   = i + 1;
                    const canAdd = images.length < MAX_IMAGES;
                    return img ? (
                      <div key={idx} className="relative aspect-square group overflow-hidden">
                        <img src={img.preview} alt={`Image ${idx + 1}`} className="w-full h-full object-cover border border-white/[0.08]" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                        >
                          <X className="w-4 h-4 text-white" strokeWidth={1.5} />
                        </button>
                      </div>
                    ) : (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => canAdd && fileInputRef.current?.click()}
                        disabled={!canAdd}
                        className={`aspect-square border border-dashed flex items-center justify-center transition-all duration-300 ${
                          canAdd
                            ? "border-white/[0.08] hover:border-white/[0.22] hover:bg-[#09090b]/40 cursor-pointer group"
                            : "border-white/[0.03] opacity-20 cursor-not-allowed"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors duration-300" strokeWidth={1.5} />
                      </button>
                    );
                  })}
                </div>

                {/* Tips */}
                <div className="space-y-2.5 border-t border-white/[0.05] pt-5">
                  {[
                    "Use a clean, neutral background",
                    "Shoot in natural light for accurate colour",
                    "Include detail, back, and flat-lay shots",
                  ].map((tip) => (
                    <div key={tip} className="flex items-start gap-2.5">
                      <div className="w-1 h-1 rounded-full bg-zinc-650 mt-1.5 shrink-0" />
                      <p className="text-[12px] text-zinc-500 tracking-wide leading-snug">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile submit */}
        <div className="lg:hidden border-t border-white/[0.05] px-6 py-8">
          <SubmitButton isSubmitting={isSubmitting} />
          <p className="mt-3 text-[11px] text-zinc-650 text-center tracking-wide">
            By listing you agree to Snitch's Seller Terms and Content Policy.
          </p>
        </div>
      </form>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/[0.05] mt-4">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 h-14 flex items-center justify-between">
          <span className="text-[11px] text-zinc-650 font-bold tracking-[0.22em] uppercase">
            Snitch © 2026
          </span>
          <span className="text-[11px] text-zinc-650 tracking-[0.22em] uppercase font-semibold">
            Seller Studio v1
          </span>
        </div>
      </footer>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   Custom Currency Picker
   ═══════════════════════════════════════════════════════ */
const CurrencyPicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const selected        = CURRENCY_OPTIONS.find((c) => c.code === value);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-[#09090b]/45 border border-white/[0.06] hover:border-white/[0.15] focus:border-white/[0.2] py-3.5 px-4 transition-all duration-300 outline-none group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{selected?.flag}</span>
          <div className="text-left">
            <span className="text-[15px] font-bold text-white tracking-tight block leading-tight">
              {selected?.code}
            </span>
            <span className="text-[9px] text-zinc-500 font-semibold tracking-[0.1em] uppercase block mt-0.5">
              {selected?.symbol} · {selected?.name}
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#09090b]/95 border border-white/[0.08] backdrop-blur-md z-50 overflow-hidden shadow-2xl">
          {CURRENCY_OPTIONS.map((c) => {
            const isActive = c.code === value;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{c.flag}</span>
                  <div className="text-left">
                    <span className="text-[13px] font-bold block tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {c.code}
                    </span>
                    <span className="text-[10px] text-zinc-550 font-medium block tracking-wide">
                      {c.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-black text-zinc-500">{c.symbol}</span>
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

/* ═══════════════════════════════════════════════════════
   Section header
   ═══════════════════════════════════════════════════════ */
const Section = ({ index, label, children }) => (
  <div>
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[11px] text-zinc-650 font-black tracking-[0.2em] tabular-nums">
        {index}
      </span>
      <div className="h-px flex-1 bg-white/[0.05]" />
      <span className="text-[11px] text-zinc-400 font-bold tracking-[0.22em] uppercase">
        {label}
      </span>
    </div>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════
   Submit
   ═══════════════════════════════════════════════════════ */
const SubmitButton = ({ isSubmitting }) => (
  <button
    type="submit"
    disabled={isSubmitting}
    className="relative flex items-center justify-between w-full bg-white text-black font-black tracking-[0.15em] py-4 px-6 uppercase text-[11px] hover:bg-zinc-100 active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />
    <span className="relative">{isSubmitting ? "Publishing…" : "List Product"}</span>
    {isSubmitting
      ? <Loader2 className="relative w-4 h-4 animate-spin" strokeWidth={2} />
      : <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
    }
  </button>
);

export default CreateProduct;