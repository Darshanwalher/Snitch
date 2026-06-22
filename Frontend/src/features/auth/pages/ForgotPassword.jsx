import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Mail, Lock, AlertCircle, X, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from "../hook/useAuth.js";
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { clearError } from '../state/auth.slice.js';
import { ErrorBanner, AuthField, AuthButton } from './Login.jsx';

const DM = "'DM Sans', sans-serif";
const BEBAS = "'Bebas Neue', sans-serif";

const ForgotPassword = () => {
  const { handleRequestReset, handleResetPassword } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Segmented OTP State
  const [otpArray, setOtpArray] = useState(new Array(6).fill(''));
  const otpRefs = useRef([]);

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isActionLoading = useSelector(state => state.auth?.loading);
  const reduxError = useSelector(state => state.auth?.error);

  // Clear redux and local errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle OTP field transitions
  const handleOtpChange = (val, idx) => {
    if (isNaN(val)) return;
    const newOtpArray = [...otpArray];
    newOtpArray[idx] = val.slice(-1);
    setOtpArray(newOtpArray);

    // Auto focus next box
    if (val && idx < 5) {
      otpRefs.current[idx + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      const newOtpArray = [...otpArray];
      if (!otpArray[idx] && idx > 0) {
        // focus previous and clear it
        otpRefs.current[idx - 1].focus();
        newOtpArray[idx - 1] = '';
      } else {
        newOtpArray[idx] = '';
      }
      setOtpArray(newOtpArray);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const pasteArray = pasteData.split('');
      const newOtpArray = [...otpArray];
      for (let i = 0; i < 6; i++) {
        newOtpArray[i] = pasteArray[i] || '';
      }
      setOtpArray(newOtpArray);

      // Focus the last filled box or last box
      const targetIdx = Math.min(pasteData.length, 5);
      otpRefs.current[targetIdx].focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);
    try {
      await handleRequestReset({ email });
      setStep(2);
      setSuccessMessage('Verification code sent! Please check your email.');

      // Auto focus first OTP segment
      setTimeout(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }, 100);
    } catch (err) {
      // Error handled by redux
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    const otpString = otpArray.join('');

    if (otpString.length !== 6) {
      setLocalError('Please enter the full 6-digit verification code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await handleResetPassword({ email, otp: otpString, newPassword });
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Error handled by redux
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength meter logic
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-zinc-800', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Weak Password', color: 'bg-red-500/80', width: 'w-1/3' };
    if (score <= 4) return { score, label: 'Medium Password', color: 'bg-amber-500/80', width: 'w-2/3' };
    return { score, label: 'Strong Security', color: 'bg-emerald-500/80', width: 'w-full' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div
      className="h-screen w-full overflow-hidden flex bg-[#060606] text-white selection:bg-white selection:text-black"
      style={{ fontFamily: DM }}
    >
      {/* ══ AUTH PROCESSING OVERLAY ══ */}
      {isActionLoading && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <style>{`
            @keyframes planeFly {
              0%   { transform: translate(-40px, 10px) scale(0.8); opacity: 0; }
              20%  { opacity: 1; }
              80%  { opacity: 1; }
              100% { transform: translate(40px, -10px) scale(1.1); opacity: 0; }
            }
            .plane-animation { animation: planeFly 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
            @keyframes trailMove {
              0%   { transform: scaleX(0); opacity: 0; }
              50%  { transform: scaleX(1); opacity: 0.4; }
              100% { transform: scaleX(1); opacity: 0; }
            }
            .trail-animation { animation: trailMove 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; transform-origin: left; }
          `}</style>

          <div className="flex flex-col items-center">
            {/* Animated Mail Sender Container */}
            <div className="relative w-36 h-20 mb-6 flex items-center justify-center overflow-hidden">
              {/* Central horizontal line for track */}
              <div className="absolute left-6 right-6 h-[1px] bg-zinc-800" />
              <div className="absolute left-6 right-6 h-[1px] bg-white trail-animation" />

              {/* Flying envelope */}
              <div className="plane-animation text-white flex items-center justify-center">
                <Mail className="w-8 h-8" strokeWidth={1} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-black tracking-[0.45em] uppercase text-white animate-pulse">Transmitting OTP</span>
              <div className="h-[1px] w-8 bg-white/20 mt-1 mb-1" />
              <span className="text-[9px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Routing via Resend API</span>
            </div>
          </div>
        </div>
      )}

      {/* ── LEFT — brand panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/snitch-aesthetic.png')] bg-cover bg-center transition-transform duration-[25s] ease-out hover:scale-105"
          style={{ opacity: 0.75 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#060606]" />

        <div className="relative z-10 flex flex-col justify-end h-full w-full p-14 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] text-zinc-400 font-semibold tracking-[0.28em] uppercase">Security</span>
            <div className="h-px w-10 bg-zinc-600" />
          </div>
          <h1 className="text-[clamp(3.5rem,5.5vw,5rem)] text-white uppercase leading-[0.9] mb-4" style={{ fontFamily: BEBAS, letterSpacing: '0.04em' }}>
            Snitch
          </h1>
          <p className="text-[14px] text-zinc-400 font-normal tracking-wide leading-[1.7] max-w-xs">
            Redefining modern streetwear.<br />Reset your account password.
          </p>
        </div>
      </div>

      {/* ── RIGHT — form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 relative overflow-y-auto">
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-zinc-800 rounded-full filter blur-[160px] opacity-10 pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">

          {/* Heading */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] text-zinc-600 font-bold tracking-[0.25em] uppercase">03</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[11px] text-zinc-500 font-bold tracking-[0.22em] uppercase">Forgot Password</span>
            </div>
            <h2 className="text-[2.8rem] text-white uppercase leading-[0.9]" style={{ fontFamily: BEBAS, letterSpacing: '0.04em' }}>
              {step === 1 ? 'Recover Password' : 'Choose New Password'}
            </h2>
            <p className="mt-2 text-[13px] text-zinc-400 tracking-wide leading-[1.6]">
              {step === 1
                ? 'Enter your registered email address below. We will send a secure verification code to authorize your password update.'
                : 'Confirm the verification code and set a strong, secure new password.'
              }
            </p>
          </div>

          {/* Step 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-8">
              {(reduxError || localError) && (
                <ErrorBanner message={reduxError || localError} onDismiss={() => { dispatch(clearError()); setLocalError(''); }} />
              )}

              {successMessage && (
                <div className="flex items-start gap-3 border border-emerald-800/60 bg-emerald-950/20 px-4 py-3">
                  <div className="w-[3px] self-stretch bg-emerald-500 shrink-0" />
                  <p className="text-emerald-300 text-[13px] font-medium tracking-wide leading-[1.5]">
                    {successMessage}
                  </p>
                </div>
              )}

              <AuthField
                id="email"
                name="email"
                type="email"
                label="Email Address"
                icon={<Mail className="w-4 h-4" strokeWidth={1.5} />}
                value={email}
                onChange={(e) => { setEmail(e.target.value); dispatch(clearError()); }}
                required
              />

              <div className="pt-2">
                <AuthButton loading={isLoading} label="Send Code" />
              </div>

              <p className="text-[12px] text-zinc-500 font-semibold tracking-wide text-center pt-2">
                Remembered your credentials?{' '}
                <a href="/login" className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-all duration-300 ml-1">
                  Log In
                </a>
              </p>
            </form>
          )}

          {/* Step 2: Verify & Reset */}
          {step === 2 && (
            <form onSubmit={handleResetSubmit} className="space-y-8">
              {(reduxError || localError) && (
                <ErrorBanner message={reduxError || localError} onDismiss={() => { dispatch(clearError()); setLocalError(''); }} />
              )}

              {successMessage && (
                <div className="flex items-start gap-3 border border-emerald-800/60 bg-emerald-950/20 px-4 py-3">
                  <div className="w-[3px] self-stretch bg-emerald-500 shrink-0" />
                  <p className="text-emerald-300 text-[13px] font-medium tracking-wide leading-[1.5]">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Segmented OTP Input Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-zinc-600" strokeWidth={1.5} />
                  <span className="text-[11px] text-zinc-500 font-bold tracking-[0.2em] uppercase">
                    Verification Code
                  </span>
                </div>
                <div
                  className="grid grid-cols-6 gap-2 sm:gap-3"
                  onPaste={handleOtpPaste}
                >
                  {otpArray.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      ref={el => otpRefs.current[index] = el}
                      value={data}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-full aspect-square text-center bg-white/[0.02] border border-zinc-800 focus:border-white focus:bg-white/[0.05] text-[20px] font-black tracking-tight text-white outline-none transition-all duration-300"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-zinc-600 tracking-wide">
                  Type or paste the 6-digit verification code.
                </p>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <AuthField
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  label="New Password"
                  icon={<Lock className="w-4 h-4" strokeWidth={1.5} />}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setLocalError(''); }}
                  required
                />

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="h-[3px] w-full bg-zinc-800/80 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase">
                      <span className="text-zinc-500">Strength:</span>
                      <span className={
                        strength.score <= 2 ? 'text-red-400' :
                          strength.score <= 4 ? 'text-amber-400' : 'text-emerald-400'
                      }>{strength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <AuthField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                icon={<Lock className="w-4 h-4" strokeWidth={1.5} />}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }}
                required
              />

              <div className="pt-2">
                <AuthButton loading={isLoading} label="Reset Password" />
              </div>

              <div className="flex justify-between items-center text-[12px] text-zinc-500 font-semibold tracking-wide pt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setSuccessMessage(''); setLocalError(''); setOtpArray(new Array(6).fill('')); }}
                  className="hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                </button>
                <a href="/login" className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-all duration-300">
                  Log In
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
