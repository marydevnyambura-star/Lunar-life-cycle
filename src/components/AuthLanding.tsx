import React, { useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from '../firebase';
import {
  ShieldCheck,
  Lock,
  Heart,
  Calendar,
  Sparkles,
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthLandingProps {
  onAuthSuccess: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<'google_only' | 'email_login' | 'email_register' | 'forgot_password'>('google_only');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onAuthSuccess();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. You can try again whenever you are ready.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Another sign-in window was opened. Please complete authentication.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Log In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onAuthSuccess();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Too many unsuccessful attempts. Please wait a few moments or reset your password.');
      } else {
        setErrorMsg(err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide an email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      try {
        await sendEmailVerification(userCredential.user);
        setInfoMsg('Account created! A verification link has been sent to your email.');
      } catch (e) {
        // Verification email send fail non-blocking
      }
      onAuthSuccess();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please log in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please provide a valid email address.');
      } else {
        setErrorMsg(err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address to receive a password reset link.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg('Password reset link sent! Check your inbox to set a new password.');
      setAuthMode('email_login');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send reset email. Ensure the email is registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F0FC] text-[#321442] flex flex-col justify-between selection:bg-[#FCE7F3] selection:text-[#542080]">
      {/* Top Simple Header */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#542080] via-[#7B2CBF] to-[#EC4899] flex items-center justify-center text-white shadow-sm shadow-purple-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 stroke-[2.2]">
              <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
              <path d="M12 7c-2 2-3 4-3 6a3 3 0 0 0 6 0c0-2-1-4-3-6Z" fill="currentColor" />
            </svg>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-[#321442]">
            LumaCycle
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#542080] bg-white px-3 py-1.5 rounded-full border border-[#C8A2E8]/40 shadow-xs">
          <Lock className="w-3.5 h-3.5 text-[#7B2CBF]" />
          <span>Strict Privacy & Isolation</span>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Left Column: Welcoming Value Proposition */}
        <div className="flex-1 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-[#C8A2E8]/50 text-[#542080] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>Privacy-First Menstrual & Fertility Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-[#321442] leading-[1.15]">
            Tune into your natural biological rhythm.
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            LumaCycle is an intuitive, clinical-grade menstrual cycle, ovulation, and reproductive health companion.
            Learn your recurring symptoms, predict future cycle windows with adaptive intelligence, and track your health with complete confidentiality.
          </p>

          {/* Privacy & Health Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-100 text-[#7B2CBF] flex items-center justify-center mt-0.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs sm:text-sm text-stone-700">
                <strong className="text-[#321442]">Zero Cross-User Exposure:</strong> Your cycles, notes, and pain logs are stored in private database records bound strictly to your verified account. User A never sees User B's health records.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-pink-100 text-[#EC4899] flex items-center justify-center mt-0.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs sm:text-sm text-stone-700">
                <strong className="text-[#321442]">Intelligent Prediction Engine:</strong> Learns your actual average cycle length, accounts for variability, and detects early or late cycles without arbitrary assumptions.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-100 text-[#7B2CBF] flex items-center justify-center mt-0.5 shrink-0">
                <Heart className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs sm:text-sm text-stone-700">
                <strong className="text-[#321442]">Complete Data Sovereignty:</strong> Export your full records anytime or delete your account and personal history permanently with a single tap.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Secure Authentication Card */}
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#C8A2E8]/40 p-6 sm:p-8 shadow-xl shadow-purple-100 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold font-display text-[#321442]">
              {authMode === 'email_register'
                ? 'Create Your Account'
                : authMode === 'forgot_password'
                ? 'Reset Password'
                : 'Welcome to LumaCycle'}
            </h2>
            <p className="text-xs text-stone-500">
              Sign in to access your personal period calendar and private health history.
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7B2CBF] mt-0.5 shrink-0" />
              <div className="flex-1">{infoMsg}</div>
            </div>
          )}

          {/* Primary Action: Google OAuth Authentication */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl border border-[#C8A2E8]/60 bg-white hover:bg-purple-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-semibold text-[#321442] text-sm shadow-xs hover:border-[#7B2CBF] disabled:opacity-50 cursor-pointer"
            >
              {/* Google G logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-purple-100 w-full"></div>
              <span className="bg-white px-3 text-xs text-stone-400 font-medium uppercase tracking-wider">
                or
              </span>
              <div className="border-t border-purple-100 w-full"></div>
            </div>
          </div>

          {/* Secondary: Email/Password Forms */}
          {authMode === 'forgot_password' ? (
            <form onSubmit={handlePasswordReset} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Your Account Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#542080] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#7B2CBF] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sending link...' : 'Send Password Reset Link'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthMode('email_login');
                  }}
                  className="text-xs text-[#7B2CBF] hover:underline font-semibold cursor-pointer"
                >
                  Back to login
                </button>
              </div>
            </form>
          ) : authMode === 'email_register' ? (
            <form onSubmit={handleEmailRegister} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Create Password (min. 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#542080] to-[#7B2CBF] text-white rounded-xl text-xs sm:text-sm font-bold hover:brightness-105 transition-colors shadow-md shadow-purple-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Creating account...' : 'Create Free Account'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-stone-500">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthMode('email_login');
                  }}
                  className="text-xs text-[#7B2CBF] font-semibold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setAuthMode('forgot_password');
                    }}
                    className="text-[11px] text-[#7B2CBF] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-sm bg-[#F6F0FC] border border-[#C8A2E8]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#542080] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#7B2CBF] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Log In with Email'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-stone-500">Need an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setAuthMode('email_register');
                  }}
                  className="text-xs text-[#7B2CBF] font-semibold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Medical Disclaimer */}
          <div className="pt-4 border-t border-purple-50 text-[11px] text-stone-500 leading-relaxed text-center space-y-1.5">
            <p>
              By proceeding, you agree to our private health data protection terms.
              We adhere strictly to privacy-by-design standards (including Kenya's Data Protection Act).
            </p>
            <p className="text-[10px] text-stone-400 italic">
              *Disclaimer: Period, ovulation, and fertile windows are statistical estimates based on biological rhythm algorithms and are not intended for medical diagnosis or contraception.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 text-center text-xs text-[#7B2CBF] border-t border-[#C8A2E8]/40">
        <p>LumaCycle · Private, encrypted reproductive health companion · Stored securely on your account</p>
      </footer>
    </div>
  );
};
