import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import Nav from '../../Shared/Components/Nav';

const OrderSuccess = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const isActionLoading = useSelector(state => state.product?.loading || state.cart?.loading);
    const queryParams = new URLSearchParams(location.search)
    const orderId = queryParams.get("order_id") || "PENDING"
    
    // Calculate estimated delivery date
    const getEstimatedDelivery = () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() + 3);
        const end = new Date(today);
        end.setDate(today.getDate() + 5);
        
        const options = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options).toUpperCase()} - ${end.toLocaleDateString('en-US', options).toUpperCase()}`;
    }

  return (
    <div className="min-h-screen w-full bg-[#060606] text-white selection:bg-white selection:text-black pt-24 pb-32 flex flex-col relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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

        {/* Technical drafting grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.01] rounded-full filter blur-[120px] pointer-events-none" />

        <Nav title="Order Success" />

        <div className="flex-1 flex flex-col items-center justify-center max-w-screen-2xl mx-auto px-6 lg:px-16 w-full mt-10 relative z-10 animate-in fade-in duration-500">
            <div className="border border-white/[0.04] p-12 md:p-16 flex flex-col items-center max-w-2xl w-full text-center bg-[#09090b]/80 backdrop-blur-md shadow-[0_30px_70px_rgba(0,0,0,0.85)] relative">
                
                {/* Glowing checkmark container */}
                <div className="relative w-20 h-20 mb-10 flex items-center justify-center border border-white/20 bg-white/[0.01] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.05)] group overflow-hidden">
                    <div className="absolute inset-0 bg-white/[0.02] scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                    <Check className="w-8 h-8 text-white animate-pulse" strokeWidth={1.5} />
                </div>

                <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-white leading-[0.95] uppercase tracking-wide mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    Thank You<br/>For Your Order
                </h1>

                <p className="text-zinc-400 text-[13px] leading-[1.8] max-w-sm mb-10 font-normal tracking-wide">
                    Thank you for trusting Snitch. We are deeply honored to be a part of your style journey. Your selections are being meticulously prepared.
                </p>

                <div className="h-px w-24 bg-white/[0.06] mb-10" />

                <div className="flex flex-col gap-4 mb-12 w-full max-w-sm">
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                        <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Order ID</span>
                        <span className="text-[13px] font-mono font-bold text-white tracking-widest">{orderId}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                        <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Estimated Delivery</span>
                        <span className="text-[13px] font-mono font-bold text-white tracking-widest">{getEstimatedDelivery()}</span>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/')}
                    className="bg-white text-black cursor-pointer text-[12px] font-black tracking-[0.18em] uppercase px-10 py-4.5 hover:bg-zinc-100 active:scale-[0.98] transition-all duration-300 rounded-none w-full max-w-sm relative overflow-hidden group"
                >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none" />
                    Continue Shopping
                </button>
            </div>
        </div>
    </div>
  )
}

export default OrderSuccess