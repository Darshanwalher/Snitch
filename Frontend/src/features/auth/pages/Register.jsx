import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Lock, Store, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from "../hook/useAuth.js";
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { clearError } from '../state/auth.slice.js';
import ContinueWithGoogle from '../components/ContinueWithGoogle.jsx';
import { ErrorBanner } from './Login.jsx';

const BEBAS = "'Bebas Neue', sans-serif";
const DM    = "'DM Sans', sans-serif";

const Register = () => {
  const { handleRegister } = useAuth();
  const navigate            = useNavigate();
  const dispatch            = useDispatch();

  const isActionLoading = useSelector(state => state.auth?.loading);
  const reduxError      = useSelector(state => state.auth?.error);

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    password: '',
    isSeller: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Clear redux error when this page unmounts
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Clear error the moment the user starts correcting their input
    if (reduxError) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleRegister({
        email:    formData.email,
        contact:  formData.contactNumber,
        password: formData.password,
        fullname: formData.fullName,
        isSeller: formData.isSeller,
      });
      navigate('/');
    } catch {
      // Error is already in Redux (dispatched by useAuth) — nothing to do here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full overflow-hidden flex bg-[#060606] text-white selection:bg-white selection:text-black"
      style={{ fontFamily: DM }}
    >
      {/* ══ AUTH PROCESSING OVERLAY ══ */}
      {isActionLoading && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
          <style>{`
            @keyframes authDash {
              0%   { stroke-dasharray: 1, 200;  stroke-dashoffset: 0; }
              50%  { stroke-dasharray: 90, 200; stroke-dashoffset: -35px; }
              100% { stroke-dasharray: 90, 200; stroke-dashoffset: -124px; }
            }
            .auth-dash  { animation: authDash  2s   ease-in-out infinite; }
            @keyframes expandGlow {
              0%   { box-shadow: 0 0 0 0px  rgba(255,255,255,0.2); }
              100% { box-shadow: 0 0 0 20px rgba(255,255,255,0);   }
            }
            .auth-glow  { animation: expandGlow 1.5s cubic-bezier(0.16,1,0.3,1) infinite; }
            @keyframes slideLine {
              0%   { transform: translateX(-100%); }
              50%  { transform: translateX(0);     }
              100% { transform: translateX(100%);  }
            }
            .auth-slide { animation: slideLine 1.5s ease-in-out infinite; }
          `}</style>

          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
              <svg className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite] opacity-30" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
              <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#222" strokeWidth="2" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" className="auth-dash" />
              </svg>
              <div className="absolute w-10 h-10 border border-white/40 rotate-45 animate-[spin_3s_ease-in-out_infinite_reverse]" />
              <div className="absolute w-10 h-10 border border-white/20 rotate-[20deg] animate-[spin_4s_ease-in-out_infinite]" />
              <div className="absolute w-2 h-2 bg-white rounded-full auth-glow" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[12px] font-black tracking-[0.4em] uppercase text-white animate-pulse">Creating Account</span>
              <div className="h-[2px] w-12 bg-white/20 mt-1 mb-1 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-white w-full auth-slide" />
              </div>
              <span className="text-[9px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Establishing Identity</span>
            </div>
          </div>
        </div>
      )}

      {/* ── LEFT — brand panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden select-none">
        <div
          className="absolute inset-0 bg-[url('/snitch-aesthetic.png')] bg-cover bg-center transition-transform duration-[40s] ease-out hover:scale-105"
          style={{ opacity: 0.65 }}
        />
        {/* Technical drafting grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#060606]" />

        <div className="relative z-10 flex flex-col justify-end h-full w-full p-16 pb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] text-zinc-400 font-black tracking-[0.3em] uppercase">SS 2026 drop</span>
            <div className="h-[2px] w-8 bg-white" />
          </div>
          <h1 className="text-[clamp(4rem,6vw,6.5rem)] text-white uppercase leading-[0.85] mb-6 font-black tracking-tight" style={{ fontFamily: BEBAS }}>
            Snitch<br/><span className="text-zinc-500">Studio</span>
          </h1>
          <p className="text-[12px] text-zinc-400 font-bold tracking-[0.15em] leading-[1.8] max-w-sm uppercase">
            Redefining modern street culture. Built for the bold.
          </p>
        </div>
      </div>

      {/* ── RIGHT — form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 relative overflow-y-auto">
        {/* Soft background glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/[0.01] rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-zinc-900/30 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#09090b]/80 border border-white/[0.04] p-8 sm:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.85)] backdrop-blur-md relative z-10">

          {/* Mobile wordmark */}
          <div className="lg:hidden mb-10">
            <span className="text-[2.5rem] text-white uppercase leading-none tracking-[0.06em]" style={{ fontFamily: BEBAS }}>
              Snitch
            </span>
            <p className="text-[12px] text-zinc-500 font-semibold tracking-[0.2em] uppercase mt-1">Join the movement</p>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] text-zinc-600 font-bold tracking-[0.25em] uppercase">01</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[11px] text-zinc-500 font-bold tracking-[0.22em] uppercase">New Account</span>
            </div>
            <h2 className="text-[2.8rem] text-white uppercase leading-[0.9]" style={{ fontFamily: BEBAS, letterSpacing: '0.04em' }}>
              Register
            </h2>
            <p className="mt-2 text-[13px] text-zinc-400 tracking-wide leading-[1.6]">
              Access exclusive drops and manage your orders.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Error Banner — shows the exact backend message ── */}
            {reduxError && (
              <ErrorBanner message={reduxError} onDismiss={() => dispatch(clearError())} />
            )}

            {/* Two-column row: Full Name + Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CompactField id="fullName"      name="fullName"      type="text" label="Full Name" icon={<User  className="w-3.5 h-3.5" strokeWidth={1.5} />} value={formData.fullName}      onChange={handleChange} required />
              <CompactField id="contactNumber" name="contactNumber" type="tel"  label="Contact"   icon={<Phone className="w-3.5 h-3.5" strokeWidth={1.5} />} value={formData.contactNumber} onChange={handleChange} required />
            </div>

            <CompactField id="email"    name="email"    type="email"    label="Email Address" icon={<Mail className="w-3.5 h-3.5" strokeWidth={1.5} />} value={formData.email}    onChange={handleChange} required />
            <CompactField id="password" name="password" type="password" label="Password"      icon={<Lock className="w-3.5 h-3.5" strokeWidth={1.5} />} value={formData.password} onChange={handleChange} required />

            {/* isSeller toggle switch */}
            <div
              className="flex items-center justify-between p-4 border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 cursor-pointer group"
              onClick={() => setFormData(p => ({ ...p, isSeller: !p.isSeller }))}
            >
              <div className="flex items-center gap-3">
                <Store className={`w-4 h-4 transition-colors duration-300 ${formData.isSeller ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`} strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 group-hover:text-white transition-colors duration-300">
                    Register as Seller
                  </span>
                  <span className="text-[9px] text-zinc-600 tracking-wide mt-0.5">
                    I want to list and sell clothing items
                  </span>
                </div>
              </div>
              <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 p-0.5 flex items-center shrink-0 ${
                formData.isSeller ? 'bg-white' : 'bg-zinc-800 border border-zinc-700'
              }`}>
                <div className={`w-3 h-3 rounded-full transition-transform duration-300 ${
                  formData.isSeller ? 'translate-x-4 bg-black' : 'translate-x-0 bg-zinc-500'
                }`} />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="relative flex items-center justify-between w-full bg-white text-black font-black tracking-[0.15em] py-4 px-6 uppercase text-[11px] hover:bg-zinc-100 active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                style={{ fontFamily: DM }}
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />
                <span className="relative">{isLoading ? 'Creating account…' : 'Create Account'}</span>
                <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
              </button>

              <ContinueWithGoogle />
            </div>

            <p className="text-[12px] text-zinc-500 font-semibold tracking-wide text-center pt-2">
              Already a member?{' '}
              <a href="/login" className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-all duration-300 ml-1">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── Compact field (tighter spacing than Login's AuthField) ── */
const CompactField = ({ id, name, type, label, icon, value, onChange, required }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-zinc-600 group-focus-within:text-zinc-300 transition-colors duration-300">{icon}</span>
        <label
          htmlFor={id}
          className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase transition-colors duration-300 group-focus-within:text-white cursor-text"
        >
          {label}
        </label>
      </div>
      <div className="relative flex items-center">
        <input
          type={inputType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={label}
          className="peer w-full bg-transparent border-b border-zinc-800 hover:border-zinc-700 focus:border-white py-2.5 pr-10 text-[14px] text-white placeholder-transparent outline-none transition-all duration-300 tracking-wide font-medium"
          style={{ fontFamily: DM }}
        />
        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-white transition-all duration-500 peer-focus:w-full" />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 text-zinc-500 hover:text-white transition-all duration-300 cursor-pointer p-1 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <div className="relative w-4 h-4 overflow-hidden">
              <span className={`absolute inset-0 transition-all duration-500 transform ${
                showPassword ? 'rotate-0 opacity-100 scale-100' : 'rotate-45 opacity-0 scale-75'
              }`}>
                <Eye className="w-4 h-4" strokeWidth={2} />
              </span>
              <span className={`absolute inset-0 transition-all duration-500 transform ${
                !showPassword ? 'rotate-0 opacity-100 scale-100' : '-rotate-45 opacity-0 scale-75'
              }`}>
                <EyeOff className="w-4 h-4" strokeWidth={2} />
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Register;