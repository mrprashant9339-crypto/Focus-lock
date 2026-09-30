import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Check, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    resetPassword,
    resendVerificationEmail,
    user
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'verify'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password strength calculations
  const hasMinLength = password.length >= 8;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasMixedCase, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: '', color: 'bg-slate-200' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-rose-500' };
    if (strengthScore <= 3) return { label: 'Medium', color: 'bg-amber-500' };
    return { label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getStrengthLabel();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in was cancelled or encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (!acceptedTerms) {
          setErrorMsg('Please accept the Terms of Service to create your FocusLock account.');
          setLoading(false);
          return;
        }
        if (strengthScore < 3) {
          setErrorMsg('Please choose a stronger password matching the criteria below.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(name, email, password);
        setMode('verify');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Check your inbox. A password reset link has been dispatched.');
      }
    } catch (err: any) {
      const code = err.code || '';
      if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else if (code.includes('email-already-in-use')) {
        setErrorMsg('An account with this email address already exists.');
      } else {
        setErrorMsg(err.message || 'An unexpected authentication error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      {/* Center compact card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Lockup */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo size="md" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Conscious digital wellbeing & app blocking
          </p>
        </div>

        {/* Error / Success Banners */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="text-xs text-rose-700 dark:text-rose-300 leading-tight">
              {errorMsg}
            </span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-left">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 leading-tight">
              {successMsg}
            </span>
          </div>
        )}

        {/* MODE: VERIFY EMAIL NOTIFICATION */}
        {mode === 'verify' ? (
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Check your inbox to verify your FocusLock account
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              We sent a verification link to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>. Click the link to complete verification.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={resendVerificationEmail}
                className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 transition-colors"
              >
                Resend verification email
              </button>
              <button
                onClick={() => setMode('signin')}
                className="w-full py-2.5 px-4 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Google Continue Button */}
            {mode !== 'forgot' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-white font-medium text-xs flex items-center justify-center gap-3 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider "or" */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[11px] text-slate-400 uppercase">
                    <span className="bg-white dark:bg-slate-900 px-3 font-medium">or</span>
                  </div>
                </div>
              </>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setErrorMsg(null); }}
                        className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator for Signup */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-slate-500">Strength:</span>
                        <span className="text-slate-700 dark:text-slate-300">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${strength.color}`} 
                          style={{ width: `${(strengthScore / 4) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] text-slate-400">
                        <span className={hasMinLength ? 'text-emerald-500 font-medium' : ''}>• 8+ chars</span>
                        <span className={hasMixedCase ? 'text-emerald-500 font-medium' : ''}>• Mixed case</span>
                        <span className={hasNumber ? 'text-emerald-500 font-medium' : ''}>• Numbers</span>
                        <span className={hasSpecial ? 'text-emerald-500 font-medium' : ''}>• Symbols</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      I agree to the FocusLock Privacy Terms and conscious data isolation principles.
                    </span>
                  </label>
                </>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.99] shadow-md shadow-emerald-500/10"
              >
                <span>
                  {mode === 'signin' && (loading ? 'Signing in...' : 'Sign In')}
                  {mode === 'signup' && (loading ? 'Creating Account...' : 'Create Account')}
                  {mode === 'forgot' && (loading ? 'Sending...' : 'Send Password Reset Email')}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              {mode === 'signin' ? (
                <span>
                  New to FocusLock?{' '}
                  <button
                    onClick={() => { setMode('signup'); setErrorMsg(null); }}
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Create Account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('signin'); setErrorMsg(null); }}
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>

            {/* Privacy & Terms Links */}
            <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-400">
              <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
              <span>·</span>
              <span className="hover:text-slate-600 cursor-pointer">Security</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
