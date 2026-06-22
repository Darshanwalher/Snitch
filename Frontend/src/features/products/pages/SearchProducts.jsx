import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useProduct } from "../hooks/useProduct.js";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff
} from "lucide-react";
import Nav from "../../Shared/Components/Nav";
import { SkeletonCard } from "./Home.jsx";

const DM = "'DM Sans', sans-serif";
const BEBAS = "'Bebas Neue', sans-serif";

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const AVAILABLE_COLORS = [
  "Black",
  "White",
  "Grey",
  "Blue",
  "Red",
  "Green",
  "Beige",
  "Brown",
  "Yellow",
  "Pink",
];

const COLOR_MAP = {
  Black: "#000000",
  White: "#FFFFFF",
  Grey: "#808080",
  Blue: "#1E40AF",
  Red: "#EF4444",
  Green: "#15803D",
  Beige: "#F5F5DC",
  Brown: "#78350F",
  Yellow: "#FBBF24",
  Pink: "#EC4899",
};

const formatPrice = (amount, currency) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "INR"} ${amount}`;
  }
};

/* ══════════════════════════════════════════════════════
   SearchProductCard Component
   ══════════════════════════════════════════════════════ */
const SearchProductCard = ({ product, index }) => {
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

  // Extract unique sizes and colors available in product variants
  const availableSizes = React.useMemo(() => {
    if (!product.variants) return [];
    const sizes = product.variants
      .map((v) => v.attributes?.size || v.attributes?.get?.("size"))
      .filter(Boolean);
    return Array.from(new Set(sizes));
  }, [product.variants]);

  const availableColors = React.useMemo(() => {
    if (!product.variants) return [];
    const colors = product.variants
      .map((v) => v.attributes?.color || v.attributes?.get?.("color"))
      .filter(Boolean);
    return Array.from(new Set(colors));
  }, [product.variants]);

  return (
    <article
      className="group relative flex flex-col bg-[#09090b]/65 border border-white/[0.04] hover:border-white/[0.12] hover:bg-[#0c0c0e]/80 hover:shadow-[0_25px_50px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-all duration-500 overflow-hidden cursor-pointer"
      style={{ animationDelay: `${index * 30}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setImgIdx(0);
      }}
    >
      {/* Image Area */}
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
              className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] filter group-hover:brightness-[1.03]"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-40 group-hover:opacity-85 transition-opacity duration-500 pointer-events-none" />

            {/* Nav Arrows */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/85 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/85 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Pagination dots */}
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
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
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

      {/* Info Area */}
      <div className="flex-1 flex flex-col p-5 gap-3 bg-transparent">
        <div className="space-y-1">
          <h2
            className="text-[14px] font-bold text-white leading-snug tracking-tight line-clamp-1 group-hover:text-zinc-200 transition-colors"
            style={{ fontFamily: DM }}
          >
            {product.title}
          </h2>

          {product.description && (
            <p className="text-[11px] text-zinc-500 leading-normal tracking-wide line-clamp-1 font-normal">
              {product.description}
            </p>
          )}
        </div>

        {/* Size/Color preview details for Professional Look */}
        {(availableSizes.length > 0 || availableColors.length > 0) && (
          <div className="flex items-center justify-between text-[10px] text-zinc-550 pt-1">
            {/* Color Swatch dots */}
            <div className="flex items-center gap-1.5">
              {availableColors.slice(0, 4).map((c) => (
                <span
                  key={c}
                  className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block transition-transform duration-350 hover:scale-110"
                  style={{ backgroundColor: COLOR_MAP[c] || "#808080" }}
                  title={c}
                />
              ))}
              {availableColors.length > 4 && (
                <span className="text-[9px] font-bold text-zinc-650">+{availableColors.length - 4}</span>
              )}
            </div>

            {/* Sizes list */}
            {availableSizes.length > 0 && (
              <span className="font-bold tracking-[0.15em] text-[9px] text-zinc-500 uppercase">
                {availableSizes.slice(0, 3).join(" · ")}
                {availableSizes.length > 3 && " +"}
              </span>
            )}
          </div>
        )}

        <div className="h-px bg-white/[0.04] mt-auto" />

        <div className="flex items-end justify-between">
          <span
            className="text-[17px] font-bold text-white tracking-tight leading-none"
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
   SearchProducts Page Component
   ══════════════════════════════════════════════════════ */
export const SearchProducts = () => {
  const navigate = useNavigate();
  const { handleSearchProducts } = useProduct();
  const products = useSelector((state) => state.product.products);
  const pagination = useSelector((state) => state.product.pagination);
  const loading = useSelector((state) => state.product.loading);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Accordion open/close state
  const [openSections, setOpenSections] = useState({
    price: true,
    size: true,
    color: true,
  });

  // Mobile Filter Drawer Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce Search Term
  useEffect(() => {
    const handler = setTimeout(() => {
      setQ(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page to 1 whenever search query or filters change
  useEffect(() => {
    setPage(1);
  }, [q, minPrice, maxPrice, selectedSizes, selectedColors, sort]);

  // Fetch products on search or filter change
  useEffect(() => {
    const performSearch = async () => {
      const params = { page, limit: 9 };
      if (q.trim()) params.q = q.trim();
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);
      if (selectedSizes.length > 0) params.size = selectedSizes;
      if (selectedColors.length > 0) params.color = selectedColors;
      if (sort) params.sort = sort;

      try {
        await handleSearchProducts(params);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    };
    performSearch();
  }, [q, minPrice, maxPrice, selectedSizes, selectedColors, sort, page]);

  const handleToggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleToggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setSort("newest");
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const allProducts = Array.isArray(products) ? products : [];
  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    minPrice ||
    maxPrice ||
    q;

  return (
    <div
      className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black"
      style={{ fontFamily: DM }}
    >
      {/* ══ NAVBAR ══ */}
      <Nav title="Search Studio" />

      {/* ══ HERO HEADER ══ */}
      <section className="pt-24 border-b border-white/[0.04]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 pb-8">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase">
              Catalogue Search
            </span>
            <div className="h-px w-8 bg-zinc-800" />
            <span className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase">
              Filter System
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h1
              className="text-[3.5rem] sm:text-[4.5rem] text-white leading-none uppercase"
              style={{ fontFamily: BEBAS, letterSpacing: "0.02em" }}
            >
              Search <span className="text-zinc-600">Collection</span>
            </h1>
            <p className="text-[12px] text-zinc-500 tracking-wide font-normal max-w-xs leading-normal">
              Explore streetwear inventory. Refine by style, color, size, and price instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ══ SEARCH & GRID CONTAINER ══ */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* ══ DESKTOP FILTERS SIDEBAR ══ */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6 sticky top-24 self-start max-h-[80vh] overflow-y-auto pr-3 scrollbar-none bg-[#09090b]/40 border border-white/[0.04] backdrop-blur-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="text-[10px] font-black tracking-[0.25em] uppercase text-zinc-400">Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white font-bold tracking-widest uppercase transition-colors duration-200 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Accordion: Price Section */}
            <div className="border-b border-white/[0.04] pb-5">
              <button
                onClick={() => toggleSection("price")}
                className="w-full flex items-center justify-between text-[11px] text-white font-black tracking-[0.2em] uppercase py-2 outline-none cursor-pointer border-none bg-transparent"
              >
                <span>Price Range</span>
                {openSections.price ? (
                  <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </button>

              {openSections.price && (
                <div className="mt-4 flex items-center gap-3 animate-in fade-in duration-355">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-650">
                      Min
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-[#070708]/85 border border-white/[0.06] focus:border-white/30 py-2.5 pl-10 pr-3 rounded-none text-xs text-white outline-none transition-colors duration-300"
                    />
                  </div>
                  <span className="text-zinc-700 text-xs">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-655">
                      Max
                    </span>
                    <input
                      type="number"
                      placeholder="9999"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-[#070708]/85 border border-white/[0.06] focus:border-white/30 py-2.5 pl-10 pr-3 rounded-none text-xs text-white outline-none transition-colors duration-300"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Size Section */}
            <div className="border-b border-white/[0.04] pb-5">
              <button
                onClick={() => toggleSection("size")}
                className="w-full flex items-center justify-between text-[11px] text-white font-black tracking-[0.2em] uppercase py-2 outline-none cursor-pointer border-none bg-transparent"
              >
                <span>Sizes</span>
                {openSections.size ? (
                  <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </button>

              {openSections.size && (
                <div className="grid grid-cols-3 gap-2 mt-4 animate-in fade-in duration-355">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleToggleSize(size)}
                        className={`h-11 flex items-center justify-center text-[11px] font-black tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-white text-black border-white shadow-lg"
                            : "bg-transparent text-zinc-500 border-white/[0.06] hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion: Color Section */}
            <div className="border-b border-white/[0.04] pb-5">
              <button
                onClick={() => toggleSection("color")}
                className="w-full flex items-center justify-between text-[11px] text-white font-black tracking-[0.2em] uppercase py-2 outline-none cursor-pointer border-none bg-transparent"
              >
                <span>Colors</span>
                {openSections.color ? (
                  <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </button>

              {openSections.color && (
                <div className="flex flex-wrap gap-3 mt-4 animate-in fade-in duration-355">
                  {AVAILABLE_COLORS.map((color) => {
                    const isSelected = selectedColors.includes(color);
                    const colorCode = COLOR_MAP[color] || "#808080";
                    return (
                      <button
                        key={color}
                        onClick={() => handleToggleColor(color)}
                        className={`group/color relative w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "border-white scale-110 ring-1 ring-white/30 ring-offset-2 ring-offset-black"
                            : "border-white/[0.1] hover:scale-110"
                        }`}
                        style={{ backgroundColor: colorCode }}
                        title={color}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3.5 h-3.5 ${
                              color === "White" || color === "Yellow" || color === "Beige"
                                ? "text-black font-black"
                                : "text-white"
                            }`}
                            strokeWidth={3}
                          />
                        )}
                        <span className="absolute bottom-full mb-2 opacity-0 group-hover/color:opacity-100 bg-black border border-white/10 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-zinc-300 pointer-events-none transition-opacity duration-300 z-50 whitespace-nowrap">
                          {color}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* ══ MAIN RESULTS AREA ══ */}
          <main className="flex-1 space-y-6 min-w-0">
            {/* Search Input, Results count and Sorting Bar */}
            <div className="flex flex-col gap-4">
              
              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search products by keywords, colors, sizes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#09090b]/60 border border-white/[0.04] focus:border-white/20 py-4 pl-12 pr-10 text-[14px] text-white placeholder-zinc-650 outline-none transition-all duration-400 rounded-none backdrop-blur-sm shadow-xl"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setQ("");
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Utility Header bar */}
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                    {loading
                      ? "Searching..."
                      : `${allProducts.length} item${
                          allProducts.length !== 1 ? "s" : ""
                        } found`}
                  </span>
                  {q.trim() && (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                      <span className="text-[11px] text-zinc-400 font-semibold italic">
                        Results for "{q.trim()}"
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-1.5 border border-white/[0.06] px-3.5 py-2 text-[10px] font-black tracking-wider uppercase hover:border-white/20 transition-colors cursor-pointer bg-[#0a0a0a]"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-zinc-400" /> Filters
                  </button>

                  <div className="relative min-w-[160px]">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/[0.06] hover:border-white/20 py-2.5 pl-4 pr-8 text-[10px] font-black tracking-[0.15em] uppercase text-zinc-400 focus:text-white outline-none cursor-pointer appearance-none"
                    >
                      <option value="newest">Sort: Newest</option>
                      <option value="price_asc">Sort: Price Low-High</option>
                      <option value="price_desc">Sort: Price High-Low</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-zinc-650 font-bold tracking-[0.15em] uppercase mr-2">
                  Active Criteria:
                </span>
                {q.trim() && (
                  <span className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                    Keyword: {q}
                    <X
                      className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer"
                      onClick={() => {
                        setSearchTerm("");
                        setQ("");
                      }}
                    />
                  </span>
                )}
                {minPrice && (
                  <span className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                    Min: {minPrice}
                    <X
                      className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer"
                      onClick={() => setMinPrice("")}
                    />
                  </span>
                )}
                {maxPrice && (
                  <span className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                    Max: {maxPrice}
                    <X
                      className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer"
                      onClick={() => setMaxPrice("")}
                    />
                  </span>
                )}
                {selectedSizes.map((size) => (
                  <span
                    key={size}
                    className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider"
                  >
                    Size: {size}
                    <X
                      className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer"
                      onClick={() => handleToggleSize(size)}
                    />
                  </span>
                ))}
                {selectedColors.map((color) => (
                  <span
                    key={color}
                    className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 text-[10px] font-bold text-zinc-300 uppercase tracking-wider"
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block border border-white/10"
                      style={{ backgroundColor: COLOR_MAP[color] }}
                    />
                    {color}
                    <X
                      className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer"
                      onClick={() => handleToggleColor(color)}
                    />
                  </span>
                ))}
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold text-zinc-500 hover:text-white underline underline-offset-2 uppercase tracking-widest pl-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[#060606]">
                    <SkeletonCard />
                  </div>
                ))
              ) : allProducts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-24 gap-6">
                  <div className="w-16 h-16 border border-dashed border-zinc-800 flex items-center justify-center bg-[#0a0a0a]">
                    <ShoppingBag className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
                  </div>
                  <div className="text-center space-y-1.5">
                    <p className="text-[12px] text-zinc-400 font-black tracking-[0.25em] uppercase">
                      No matching products
                    </p>
                    <p className="text-[11px] text-zinc-600 tracking-wide max-w-xs leading-normal mx-auto font-normal">
                      Adjust your filters or query to explore other streetwear items in our collections.
                    </p>
                  </div>
                </div>
              ) : (
                allProducts.map((product, i) => (
                  <div
                    onClick={() => navigate(`/product/${product._id}`)}
                    key={product._id}
                    className="bg-[#060606]"
                  >
                    <SearchProductCard product={product} index={i} />
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
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
        </div>
      </div>

      {/* ══ MOBILE FILTERS DRAWER/OVERLAY ══ */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#0a0a0a]/95 border-l border-white/[0.08] backdrop-blur-md h-full flex flex-col p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="text-[12px] font-black tracking-[0.25em] uppercase text-zinc-400">Filters</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-zinc-500 hover:text-white p-1 cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <span className="block text-[11px] text-zinc-400 font-bold tracking-[0.18em] uppercase">Price Range</span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] py-3 px-4 text-xs text-white outline-none rounded-none"
                />
                <span className="text-zinc-700">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] py-3 px-4 text-xs text-white outline-none rounded-none"
                />
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-4">
              <span className="block text-[11px] text-zinc-400 font-bold tracking-[0.18em] uppercase">Sizes</span>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleToggleSize(size)}
                      className={`h-11 flex items-center justify-center text-[11px] font-black tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-zinc-400 border-white/[0.06]"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-4">
              <span className="block text-[11px] text-zinc-400 font-bold tracking-[0.18em] uppercase">Colors</span>
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_COLORS.map((color) => {
                  const isSelected = selectedColors.includes(color);
                  const colorCode = COLOR_MAP[color] || "#808080";
                  return (
                    <button
                      key={color}
                      onClick={() => handleToggleColor(color)}
                      className={`flex items-center gap-2 py-2 px-3.5 text-[11px] font-bold tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-zinc-400 border-white/[0.06]"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: colorCode }}
                      />
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-6 border-t border-white/[0.06] flex gap-4 mt-auto">
              <button
                onClick={() => {
                  handleResetFilters();
                  setShowMobileFilters(false);
                }}
                className="flex-1 py-3.5 text-[10px] font-black tracking-[0.2em] uppercase border border-white/20 text-white hover:bg-white/5 cursor-pointer text-center"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3.5 text-[10px] font-black tracking-[0.2em] uppercase bg-white text-black hover:bg-zinc-200 cursor-pointer text-center"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchProducts;
