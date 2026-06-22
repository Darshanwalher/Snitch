import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

const Protected = ({children,role = "buyer"})=>{

    const user = useSelector(state=>state.auth.user);
    const loading = useSelector(state=>state.auth.loading);
    if(loading){
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#060606]">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
                        <div className="absolute inset-0 border-2 border-transparent border-b-zinc-500 rounded-full animate-spin-slow opacity-50" />
                    </div>
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400 animate-pulse" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Snitch
                    </p>
                </div>
            </div>
        );
    }
    
    if(!user){
        return <Navigate to="/login"  />;
    }
    
    if (user.role !== role) {
        if (user.role === 'seller') {
            return <Navigate to="/seller/dashboard" />
        }
        return <Navigate to="/" />
    }

    return children
}


export default Protected;