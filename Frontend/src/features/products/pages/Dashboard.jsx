import React, { useEffect, useState } from "react";
import { useProduct } from "../hooks/useProduct";
import { useAuth } from "../../auth/hook/useAuth.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  Plus,
  ArrowRight,
  Package,
  ImageOff,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Nav from "../../Shared/Components/Nav";

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */
const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
const DM = "'DM Sans', sans-serif";
const BEBAS = "'Bebas Neue', sans-serif";

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

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ═══════════════════════════════════════════════════════
   ProductCard
   ═══════════════════════════════════════════════════════ */
const ProductCard = ({ product, index, onImageClick }) => {
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
      onClick={onImageClick}
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950/80 border-b border-white/[0.03]">
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

            {/* Prev / Next arrows */}
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

            {/* Dot indicators */}
            {validImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {validImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImgIdx(i);
                    }}
                    className={`transition-all duration-300 cursor-pointer rounded-full ${
                      i === safeIdx
                        ? "w-4 h-1 bg-white"
                        : "w-1 h-1 bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Counter badge */}
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
              No images
            </span>
          </div>
        )}

        {/* Index badge */}
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 z-10">
          <span className="text-[9px] font-black text-zinc-400 tracking-[0.22em] tabular-nums">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-5 gap-2.5">
        {/* Title */}
        <h2
          className="text-[14px] font-bold text-white leading-snug tracking-tight line-clamp-1 group-hover:text-zinc-200 transition-colors duration-300"
          style={{ fontFamily: DM }}
        >
          {product.title}
        </h2>

        {/* Description */}
        {product.description && (
          <p className="text-[11px] text-zinc-500 leading-relaxed tracking-wide line-clamp-1 font-normal group-hover:text-zinc-400 transition-colors duration-300">
            {product.description}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-white/[0.04] mt-auto mb-2" />

        {/* Footer row */}
        <div className="flex items-end justify-between">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-650 font-bold tracking-[0.18em] uppercase mb-0.5">
              Price
            </span>
            <span
              className="text-[18px] font-black text-white tracking-tight leading-none"
              style={{ fontFamily: DM }}
            >
              {formatPrice(product.price?.amount, product.price?.currency)}
            </span>
          </div>

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

/* ═══════════════════════════════════════════════════════
   Empty State
   ═══════════════════════════════════════════════════════ */
const EmptyState = ({ onAdd }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-28 gap-6 bg-[#09090b]/20 border border-dashed border-white/[0.06] backdrop-blur-sm">
    <div className="w-20 h-20 border border-dashed border-white/[0.12] flex items-center justify-center">
      <Package className="w-8 h-8 text-zinc-700" strokeWidth={1} />
    </div>
    <div className="text-center space-y-2">
      <p className="text-[13px] text-zinc-400 font-semibold tracking-[0.2em] uppercase">
        No products listed
      </p>
      <p className="text-[12px] text-zinc-600 tracking-wide max-w-xs leading-relaxed">
        You haven't listed any products yet. Create your first listing to launch your studio.
      </p>
    </div>
    <button
      onClick={onAdd}
      className="relative flex items-center gap-2.5 bg-white text-black text-[11px] font-black tracking-[0.18em] uppercase px-7 py-3.5 hover:bg-zinc-150 active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
      List Product
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   Skeleton
   ═══════════════════════════════════════════════════════ */
const SkeletonCard = () => (
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

/* ═══════════════════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════════════════ */
function Dashboard() {
  const { handleGetSellerProducts } = useProduct();
  const { handleLogout } = useAuth();
  const sellerProducts = useSelector((state) => state.product.sellerProducts);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const isActionLoading = useSelector((state) => state.product?.loading);

  useEffect(() => {
    const fetch = async () => {
      await handleGetSellerProducts();
      setLoading(false);
    };
    fetch();
  }, []);

  const products = Array.isArray(sellerProducts) ? sellerProducts : [];

  // Group totals by currency — never mix currencies into one number
  const totalsByCurrency = products.reduce((acc, p) => {
    const cur = p.price?.currency || "INR";
    acc[cur] = (acc[cur] || 0) + (p.price?.amount || 0);
    return acc;
  }, {});

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

      <Nav
        title="Seller Studio"
        homeRoute="/seller/dashboard"
        rightContent={
          <div className="flex items-center gap-6">
            <nav className="hidden sm:flex items-center gap-8">
              <button className="text-[11px] font-bold tracking-[0.2em] uppercase text-white transition-colors duration-300 cursor-pointer">
                Dashboard
              </button>
            </nav>
            <button
              onClick={() => navigate("/seller/create-product")}
              className="relative flex items-center gap-2 bg-white text-black text-[11px] font-black tracking-[0.18em] uppercase px-4 py-2.5 hover:bg-zinc-150 active:scale-[0.98] transition-all duration-300 cursor-pointer group overflow-hidden"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />
              <Plus
                className="relative w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300"
                strokeWidth={2.5}
              />
              <span className="relative hidden sm:inline">New Product</span>
            </button>
          </div>
        }
      />

      {/* ══════════ HERO / STATS ══════════ */}
      <section className="pt-16 relative overflow-hidden border-b border-white/[0.05]">
        {/* Technical drafting grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.01] rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060606]/20 to-[#060606]" />

        <div className="relative max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 py-12 lg:py-16 z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            {/* Heading */}
            <div>
              <div className="flex items-center gap-4 mb-5">
                <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.28em] uppercase">
                  Seller Portal
                </span>
                <div className="h-px w-12 bg-zinc-700" />
                <span className="text-[11px] text-zinc-650 font-semibold tracking-[0.28em] uppercase">
                  SS 2026
                </span>
              </div>
              <h1
                className="text-[clamp(2.8rem,6vw,5.5rem)] text-white leading-[0.88] uppercase"
                style={{ fontFamily: BEBAS, letterSpacing: "0.04em" }}
              >
                My<br />
                <span className="text-zinc-600">Products</span>
              </h1>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full lg:w-auto">
              {[
                {
                  label: "Total Listings",
                  value: loading ? "—" : String(products.length).padStart(2, "0"),
                  icon: <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />,
                },
                {
                  label: "Total Value",
                  value:
                    loading || Object.keys(totalsByCurrency).length === 0 ? "—" : null,
                  icon: <Package className="w-3.5 h-3.5" strokeWidth={1.5} />,
                  isCurrencyTile: true,
                },
                {
                  label: "Last Listed",
                  value:
                    loading || products.length === 0
                      ? "—"
                      : formatDate(
                          [...products].sort(
                            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                          )[0]?.createdAt
                        ),
                  icon: <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col justify-between px-5 py-4 min-w-[100px] sm:min-w-[130px] lg:min-w-[160px] bg-[#09090b]/65 border border-white/[0.04] backdrop-blur-sm hover:border-white/[0.1] hover:bg-[#0c0c0e]/80 transition-all duration-300"
                >
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-3">
                    {stat.icon}
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">
                      {stat.label}
                    </span>
                  </div>

                  {stat.isCurrencyTile ? (
                    loading ? (
                      <span
                        className="text-[16px] sm:text-[18px] font-black text-white tracking-tight"
                        style={{ fontFamily: DM }}
                      >
                        —
                      </span>
                    ) : Object.keys(totalsByCurrency).length === 0 ? (
                      <span
                        className="text-[16px] sm:text-[18px] font-black text-white tracking-tight"
                        style={{ fontFamily: DM }}
                      >
                        —
                      </span>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {Object.entries(totalsByCurrency).map(([cur, amt]) => (
                          <span
                            key={cur}
                            className="text-[15px] sm:text-[17px] font-black text-white tracking-tight leading-tight"
                            style={{ fontFamily: DM }}
                          >
                            {formatPrice(amt, cur)}
                          </span>
                        ))}
                      </div>
                    )
                  ) : (
                    <span
                      className="text-[16px] sm:text-[18px] font-black text-white tracking-tight"
                      style={{ fontFamily: DM }}
                    >
                      {stat.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FILTER BAR ══════════ */}
      <div className="border-b border-white/[0.04] sticky top-16 z-20 bg-[#060606]/80 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-white border-b border-white pb-0.5">
              All Products
            </span>
          </div>
          <span className="text-[11px] text-zinc-550 font-semibold tracking-[0.15em] tabular-nums">
            {loading ? "—" : `${products.length} item${products.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* ══════════ GRID ══════════ */}
      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 bg-transparent">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-transparent">
                <SkeletonCard />
              </div>
            ))
          ) : products.length === 0 ? (
            <EmptyState onAdd={() => navigate("/seller/create-product")} />
          ) : (
            products.map((product, i) => (
              <div key={product._id} className="bg-transparent">
                <ProductCard
                  product={product}
                  index={i}
                  onImageClick={() => navigate(`/seller/product/${product._id}`)}
                />
              </div>
            ))
          )}
        </div>
      </main>

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
}

export default Dashboard;