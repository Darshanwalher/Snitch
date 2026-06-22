import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Lock, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from "../hook/useAuth.js";
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { clearError } from '../state/auth.slice.js';
import ContinueWithGoogle from '../components/ContinueWithGoogle.jsx';

const DM    = "'DM Sans', sans-serif";
const BEBAS = "'Bebas Neue', sans-serif";

const Login = () => {
  const { handleLogin } = useAuth();
  const navigate        = useNavigate();
  const dispatch        = useDispatch();

  const [formData,  setFormData]  = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const isActionLoading = useSelector(state => state.auth?.loading);
  const reduxError      = useSelector(state => state.auth?.error);

  // Clear redux error when this page unmounts (so it doesn't bleed into other pages)
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the error the moment the user starts correcting
    if (reduxError) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await handleLogin({ email: formData.email, password: formData.password });
      if (user.role === "buyer")  navigate('/');
      if (user.role === "seller") navigate("/seller/dashboard");
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
              <span className="text-[12px] font-black tracking-[0.4em] uppercase text-white animate-pulse">Authenticating</span>
              <div className="h-[2px] w-12 bg-white/20 mt-1 mb-1 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-white w-full auth-slide" />
              </div>
              <span className="text-[9px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Securing Connection</span>
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
            <p className="text-[12px] text-zinc-500 font-semibold tracking-[0.2em] uppercase mt-1">Welcome back</p>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] text-zinc-600 font-bold tracking-[0.25em] uppercase">01</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[11px] text-zinc-500 font-bold tracking-[0.22em] uppercase">Sign In</span>
            </div>
            <h2 className="text-[2.8rem] text-white uppercase leading-[0.9]" style={{ fontFamily: BEBAS, letterSpacing: '0.04em' }}>
              Log In
            </h2>
            <p className="mt-2 text-[13px] text-zinc-400 tracking-wide leading-[1.6]">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Error Banner ── */}
            {reduxError && (
              <ErrorBanner message={reduxError} onDismiss={() => dispatch(clearError())} />
            )}

            <AuthField id="email"    name="email"    type="email"    label="Email Address" icon={<Mail className="w-4 h-4" strokeWidth={1.5} />} value={formData.email}    onChange={handleChange} required />
            <AuthField id="password" name="password" type="password" label="Password"      icon={<Lock className="w-4 h-4" strokeWidth={1.5} />} value={formData.password} onChange={handleChange} required />

            <div className="flex justify-end pt-1">
              <a
                href="/forgot-password"
                className="text-[11px] text-zinc-500 hover:text-white transition-colors duration-200 tracking-wider uppercase font-bold"
              >
                Forgot Password?
              </a>
            </div>

            <div className="pt-2 space-y-3">
              <AuthButton loading={isLoading} label="Sign In" />
              <ContinueWithGoogle />
            </div>

            <p className="text-[12px] text-zinc-500 font-semibold tracking-wide text-center pt-2">
              Don't have an account?{' '}
              <a href="/register" className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-all duration-300 ml-1">
                Register
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   Shared — exported so Register.jsx can use them too
   ══════════════════════════════════════════ */

/** Red error banner that matches the app's dark aesthetic */
export const ErrorBanner = ({ message, onDismiss }) => (
  <div
    role="alert"
    className="flex items-start gap-3 border border-red-800/60 bg-red-950/20 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300"
  >
    {/* left accent bar */}
    <div className="w-[3px] self-stretch bg-red-500 shrink-0" />

    {/* icon */}
    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-[1px]" strokeWidth={1.8} />

    {/* message — direct from backend */}
    <p className="text-red-300 text-[13px] font-medium tracking-wide leading-[1.5] flex-1">
      {message}
    </p>

    {/* dismiss × */}
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="text-red-700 hover:text-red-300 transition-colors duration-200 shrink-0 mt-[1px] cursor-pointer"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    )}
  </div>
);

export const AuthField = ({ id, name, type, label, icon, value, onChange, required }) => {
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
          className="peer w-full bg-transparent border-b border-zinc-800 hover:border-zinc-700 focus:border-white py-2.5 pr-10 text-[14px] text-white placeholder-transparent outline-none transition-all duration-400 tracking-wide font-medium"
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

export const AuthButton = ({ loading, label }) => (
  <button
    type="submit"
    disabled={loading}
    className="relative flex items-center justify-between w-full bg-white text-black font-black tracking-[0.15em] py-4 px-6 uppercase text-[11px] hover:bg-zinc-100 active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
    style={{ fontFamily: DM }}
  >
    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none" />
    <span className="relative">{loading ? 'Signing in…' : label}</span>
    <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
  </button>
);

export default Login;
