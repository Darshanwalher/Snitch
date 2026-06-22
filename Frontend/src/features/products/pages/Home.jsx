import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useProduct } from "../hooks/useProduct.js";
import { useAuth } from "../../auth/hook/useAuth.js";
import {
  ShoppingBag,
  ArrowRight,
  ImageOff,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Nav from "../../Shared/Components/Nav";

/* ══════════════════════════════════════════════════════
   Constants & Helpers
   ══════════════════════════════════════════════════════ */
const DM = "'DM Sans', sans-serif";
const BEBAS = "'Bebas Neue', sans-serif";

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

export const formatPrice = (amount, currency) => {
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

/* ══════════════════════════════════════════════════════
   ProductCard
   ══════════════════════════════════════════════════════ */
export const ProductCard = ({ product, index }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [errorSet, setErrorSet] = useState(new Set());
  const [hovered, setHovered] = useState(false);

  const allImages = product.images || [];
  const validImages = allImages.filter((_, i) => !errorSet.has(i));
  const hasImages = validImages.length > 0;
  const safeIdx = Math.min(imgIdx, Math.max(0, validImages.length - 1));

  const prev = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i - 1 + validImages.length) % validImages.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i + 1) % validImages.length);
  };
  const handleError = (originalIdx) => {
    setErrorSet((prev) => new Set([...prev, originalIdx]));
    setImgIdx(0);
  };

  return (
    <article
      className="group relative flex flex-col bg-[#09090b]/65 border border-white/[0.04] hover:border-white/[0.12] hover:bg-[#0c0c0e]/80 hover:shadow-[0_25px_50px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-all duration-500 overflow-hidden cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-955/80 select-none border-b border-white/[0.03]">
        {hasImages ? (
          <>
            <img
              key={validImages[safeIdx]?._id || safeIdx}
              src={validImages[safeIdx]?.url}
              alt={`${product.title} – image ${safeIdx + 1}`}
              onError={() => {
                const origIdx = allImages.findIndex(
                  (img) => img._id === validImages[safeIdx]?._id
                );
                handleError(origIdx >= 0 ? origIdx : safeIdx);
              }}
              className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] filter group-hover:brightness-[1.05]"
            />

            {/* Ambient vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-40 group-hover:opacity-85 transition-opacity duration-500 pointer-events-none" />

            {/* Arrows with fine borders */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/80 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/80 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Indicator dots */}
            {validImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {validImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                    className={`transition-all duration-300 cursor-pointer rounded-full ${
                      i === safeIdx
                        ? "w-4 h-1 bg-white"
                        : "w-1 h-1 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Top-Right counter */}
            {validImages.length > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 z-10">
                <span className="text-[9px] text-zinc-400 font-black tracking-widest tabular-nums">
                  {safeIdx + 1}/{validImages.length}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <ImageOff className="w-8 h-8 text-zinc-800" strokeWidth={1} />
            <span className="text-[10px] text-zinc-700 font-bold tracking-[0.2em] uppercase">
              No image
            </span>
          </div>
        )}

        {/* Currency badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-black text-zinc-400 tracking-[0.22em] uppercase px-2 py-0.5">
            {product.price?.currency || "INR"}
          </span>
        </div>
      </div>

      {/* Info area */}
      <div className="flex-1 flex flex-col p-5 gap-2.5">
        <h2
          className="text-[14px] font-bold text-white leading-snug tracking-tight line-clamp-1 group-hover:text-zinc-200 transition-colors duration-300"
          style={{ fontFamily: DM }}
        >
          {product.title}
        </h2>

        {product.description && (
          <p className="text-[11px] text-zinc-500 leading-relaxed tracking-wide line-clamp-1 font-normal group-hover:text-zinc-400 transition-colors duration-300">
            {product.description}
          </p>
        )}

        <div className="h-px bg-white/[0.04] mt-auto mb-2" />

        <div className="flex items-end justify-between">
          <span
            className="text-[18px] font-black text-white tracking-tight leading-none"
            style={{ fontFamily: DM }}
          >
            {formatPrice(product.price?.amount, product.price?.currency)}
          </span>
          <div className="w-7 h-7 rounded-full border border-white/5 flex items-center justify-center text-zinc-650 group-hover:text-white group-hover:border-white/20 transition-all duration-300">
            <ArrowRight
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

/* ══════════════════════════════════════════════════════
   Skeleton Card
   ══════════════════════════════════════════════════════ */
export const SkeletonCard = () => (
  <div className="flex flex-col bg-white/[0.01] border border-white/[0.03] overflow-hidden animate-pulse">
    <div className="aspect-[3/4] bg-zinc-900/60" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-zinc-850 rounded-sm w-3/4" />
      <div className="h-3 bg-zinc-900 rounded-sm w-full" />
      <div className="h-px bg-white/[0.03]" />
      <div className="h-5 bg-zinc-850 rounded-sm w-1/2" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   Empty State
   ══════════════════════════════════════════════════════ */
const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-32 gap-6 animate-in fade-in duration-500">
    <div className="w-20 h-20 border border-dashed border-white/10 flex items-center justify-center bg-white/[0.01] relative group">
      <ShoppingBag className="w-8 h-8 text-zinc-650 group-hover:scale-110 transition-transform duration-300" strokeWidth={1} />
    </div>
    <div className="text-center space-y-3">
      <p className="text-[12px] text-zinc-400 font-black tracking-[0.25em] uppercase">
        No Products Found
      </p>
      <p className="text-[12px] text-zinc-650 tracking-wide max-w-xs leading-relaxed mx-auto font-normal">
        Our exclusive drops update frequently. Try adjusting filters or check back soon.
      </p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   Home Page
   ══════════════════════════════════════════════════════ */
export const Home = () => {
  const { handleGetAllProducts } = useProduct();
  const { handleLogout } = useAuth();
  const products = useSelector((state) => state.product.products);
  const pagination = useSelector((state) => state.product.pagination);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const isActionLoading = useSelector((state) => state.product?.loading);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await handleGetAllProducts({ page, limit: 12 });
      setLoading(false);
    };
    fetch();
  }, [page]);

  const allProducts = Array.isArray(products) ? products : [];

  // Derive unique currencies for filter tabs
  const currencies = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.price?.currency).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [allProducts]);

  // Filtered + searched products
  const filtered = useMemo(() => {
    let list = allProducts;
    if (activeFilter !== "All") {
      list = list.filter((p) => p.price?.currency === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allProducts, activeFilter, search]);

  return (
    <div
      className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black"
      style={{ fontFamily: DM }}
    >
      {/* ══ GLOBAL ACTION LOADING OVERLAY ══ */}
      {isActionLoading && !loading && (
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

      {/* ══ NAVBAR ══ */}
      <Nav title="New Season" hideBack={true} />

      {/* ══ HERO ══ */}
      <section className="pt-16 relative">
        {/* Technical drafting grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative border-b border-white/[0.05] overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.01] rounded-full filter blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060606]/20 to-[#060606]" />

          <div className="relative max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 py-16 lg:py-24 z-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
              {/* Headline */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[10px] text-zinc-400 font-black tracking-[0.3em] uppercase">
                    New Arrivals
                  </span>
                  <div className="h-[2px] w-8 bg-white" />
                  <span className="text-[10px] text-zinc-555 font-black tracking-[0.3em] uppercase">
                    SS 2026
                  </span>
                </div>
                <h1
                  className="text-[clamp(3.5rem,9vw,8rem)] text-white uppercase leading-[0.88]"
                  style={{ fontFamily: BEBAS, letterSpacing: "0.04em" }}
                >
                  Shop the
                  <br />
                  <span className="text-zinc-600">Collection</span>
                </h1>
                <p className="mt-6 text-[14px] text-zinc-400 tracking-wide leading-[1.8] max-w-md font-normal">
                  Discover premium streetwear crafted for the bold. Every piece tells a story — wear yours.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 sm:flex sm:items-stretch divide-x sm:divide-x sm:divide-white/[0.04] border border-white/[0.04] bg-[#09090b]/40 backdrop-blur-sm shadow-2xl w-full sm:w-auto">
                {[
                  { label: "Products", value: loading ? "—" : String(allProducts.length).padStart(2, "0") },
                  { label: "Brands", value: "01" },
                  { label: "Currencies", value: loading ? "—" : String(currencies.length - 1).padStart(2, "0") },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col justify-between px-3 sm:px-8 py-4 sm:py-5 min-w-0 sm:min-w-[110px] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 group/stat hover:scale-[1.02] border-r sm:border-none border-white/[0.04] last:border-r-0"
                  >
                    <span className="text-[9px] text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300 font-black tracking-[0.25em] uppercase mb-4">
                      {s.label}
                    </span>
                    <span
                      className="text-[24px] font-black text-white tracking-tight group-hover:translate-x-0.5 transition-transform duration-300"
                      style={{ fontFamily: DM }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FILTER BAR ══ */}
      <div className="sticky top-16 z-30 border-b border-white/[0.05] bg-[#060606]/90 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 h-12 flex items-center justify-between gap-4">
          {/* Currency tabs */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
            {currencies.map((cur) => (
              <button
                key={cur}
                id={`filter-tab-${cur}`}
                onClick={() => setActiveFilter(cur)}
                className={`shrink-0 text-[11px] font-bold tracking-[0.18em] uppercase pb-0.5 transition-all duration-300 cursor-pointer ${
                  activeFilter === cur
                    ? "text-white border-b border-white"
                    : "text-zinc-650 hover:text-zinc-300 border-b border-transparent"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600" strokeWidth={2} />
            <span className="text-[11px] text-zinc-600 font-semibold tracking-[0.15em] tabular-nums">
              {loading ? "—" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
      </div>

      {/* ══ PRODUCT GRID ══ */}
      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 bg-transparent">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-transparent">
                <SkeletonCard />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((product, i) => (
              <div
                onClick={() => navigate(`/product/${product._id}`)}
                key={product._id}
                className="bg-transparent"
              >
                <ProductCard product={product} index={i} />
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-white/[0.04]">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => setPage(pagination.currentPage - 1)}
              className="w-10 h-10 flex items-center justify-center border border-white/10 text-white disabled:opacity-20 disabled:pointer-events-none hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] tracking-[0.25em] text-zinc-400 font-black uppercase">
              PAGE {pagination.currentPage} OF {pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => setPage(pagination.currentPage + 1)}
              className="w-10 h-10 flex items-center justify-center border border-white/10 text-white disabled:opacity-20 disabled:pointer-events-none hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-white/[0.05] mt-4">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span
              className="text-white text-3xl leading-none tracking-[0.3em] uppercase block mb-3"
              style={{ fontFamily: BEBAS, letterSpacing: "0.3em" }}
            >
              Snitch
            </span>
            <p className="text-[12px] text-zinc-600 tracking-wide leading-[1.8] max-w-[220px]">
              Redefining modern streetwear. Bold by design.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-zinc-700 font-bold tracking-[0.25em] uppercase mb-1">
              Quick Links
            </span>
            {["Shop All", "About", "Contact", "Register", "Login"].map((link) => (
              <button
                key={link}
                onClick={() => {
                  if (link === "Login") navigate("/login");
                  else if (link === "Register") navigate("/register");
                }}
                className="text-[12px] text-zinc-500 hover:text-white font-semibold tracking-wide text-left transition-colors duration-300 cursor-pointer w-fit"
              >
                {link}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col justify-between gap-6">
            <div>
              <span className="text-[10px] text-zinc-700 font-bold tracking-[0.25em] uppercase block mb-3">
                Are you a Seller?
              </span>
              <p className="text-[12px] text-zinc-500 tracking-wide leading-[1.8] max-w-[220px]">
                List your products on Snitch and reach thousands of fashion-forward buyers.
              </p>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="w-fit flex items-center gap-2 border border-white/20 text-white text-[10px] font-black tracking-[0.2em] uppercase px-5 py-3 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer group"
            >
              Start Selling
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="border-t border-white/[0.04] max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 h-12 flex items-center justify-between">
          <span className="text-[11px] text-zinc-700 font-bold tracking-[0.22em] uppercase">
            Snitch © 2026
          </span>
          <span className="text-[11px] text-zinc-700 tracking-[0.22em] uppercase font-semibold">
            All rights reserved
          </span>
        </div>
      </footer>
    </div>
  );
};
