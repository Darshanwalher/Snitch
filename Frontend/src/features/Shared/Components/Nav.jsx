import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Home, ShoppingBag, Search, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hook/useAuth.js';

const Nav = ({ title, rightContent, homeRoute, hideBack = false }) => {
    const navigate = useNavigate();
    const { handleLogout } = useAuth();
    const user = useSelector(state => state.auth?.user);
    const cartItems = useSelector(state => state.cart?.items) || [];
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Profile Dropdown state
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            {/* ══════════ HEADER ══════════ */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#060606]/95 backdrop-blur-md">
                <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-16 h-16 flex items-center justify-between">
                    
                    {/* Wordmark (Left side) */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer select-none group"
                        onClick={() => navigate(homeRoute || "/")}
                    >
                        <div className="w-8 h-8 bg-white text-black flex items-center justify-center group-hover:rotate-90 transition-transform duration-700 ease-in-out">
                            <span className="font-black text-xl leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>S</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span
                                className="hidden sm:block text-white text-2xl leading-none tracking-[0.3em] uppercase group-hover:text-zinc-300 transition-colors duration-500"
                                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.3em" }}
                            >
                                Snitch
                            </span>
                            <span className="text-[9px] text-zinc-500 tracking-[0.28em] uppercase sm:mt-0.5 font-bold flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-white inline-block animate-pulse"></span>
                                {title || "Checkout"}
                            </span>
                        </div>
                    </div>

                    {/* Nav Right (Actions + Links) */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        
                        {/* Custom links if passed, otherwise default back/home buttons */}
                        {rightContent ? (
                            rightContent
                        ) : (
                            <nav className="flex items-center gap-3 sm:gap-6">
                                {!hideBack && (
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer text-zinc-500 hover:text-white flex items-center gap-1.5"
                                    >
                                        <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Back</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate(homeRoute || "/")}
                                    className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer text-zinc-500 hover:text-white flex items-center gap-1.5"
                                >
                                    <Home className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Home</span>
                                </button>
                            </nav>
                        )}
                        
                        {/* Search Icon */}
                        {user?.role !== 'seller' && (
                            <button
                                onClick={() => navigate("/search")}
                                className="flex items-center justify-center transition-all duration-300 cursor-pointer text-zinc-500 hover:text-white group"
                                aria-label="Search"
                            >
                                <Search className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                            </button>
                        )}

                        {/* Cart Icon (Buyers only) */}
                        {(!user || user?.role === 'buyer') && (
                            <button
                                onClick={() => navigate("/cart")}
                                className="relative flex items-center justify-center transition-all duration-300 cursor-pointer text-zinc-500 hover:text-white group"
                                aria-label="Cart"
                            >
                                <ShoppingBag className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={2} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2.5 min-w-[16px] h-[16px] flex items-center justify-center bg-white text-black text-[9px] font-bold rounded-full px-1 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Profile Logo Avatar Dropdown - AT THE VERY LAST */}
                        <div ref={profileRef} className="relative border-l border-white/10 pl-4 sm:pl-6 h-6 flex items-center">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen((o) => !o)}
                                        className="w-8 h-8 flex items-center justify-center bg-white text-black text-[11px] font-black tracking-widest uppercase rounded-full cursor-pointer hover:bg-zinc-200 transition-all duration-200 border border-white/10"
                                        aria-label="Profile menu"
                                        aria-expanded={profileOpen}
                                    >
                                        {(user.fullname || "U").charAt(0).toUpperCase()}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {profileOpen && (
                                        <div className="absolute top-[calc(100%+14px)] right-0 z-50 min-w-[200px] bg-[#0a0a0a] border border-white/[0.08] shadow-2xl p-1 animate-in fade-in slide-in-from-top-2 duration-150 rounded-sm">
                                            {/* User Details */}
                                            <div className="px-4 py-3 border-b border-white/[0.06] mb-1">
                                                <p className="text-[9px] text-zinc-600 font-black tracking-[0.2em] uppercase mb-0.5">
                                                    Signed in as
                                                </p>
                                                <p className="text-[12px] text-white font-bold tracking-wide truncate">
                                                    {user.fullname}
                                                </p>
                                                <p className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase mt-1">
                                                    Role: {user.role}
                                                </p>
                                            </div>

                                            {/* Seller Dashboard Link */}
                                            {user.role === 'seller' && (
                                                <button
                                                    onClick={() => {
                                                        setProfileOpen(false);
                                                        navigate("/seller/dashboard");
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] font-black tracking-[0.18em] uppercase text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all duration-200 cursor-pointer text-left"
                                                >
                                                    Seller Studio
                                                </button>
                                            )}

                                            {/* Logout Option */}
                                            <button
                                                onClick={async () => {
                                                    setProfileOpen(false);
                                                    await handleLogout();
                                                    navigate("/");
                                                }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-black tracking-[0.18em] uppercase text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 cursor-pointer group text-left"
                                            >
                                                <LogOut className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2.5} />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="w-8 h-8 flex items-center justify-center border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white rounded-full transition-all duration-300 cursor-pointer"
                                    aria-label="Login"
                                >
                                    <User className="w-4 h-4" strokeWidth={2} />
                                </button>
                            )}
                        </div>

                    </div>

                </div>
            </header>
        </>
    );
};

export default Nav;