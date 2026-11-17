import React, { useEffect } from 'react';
import {
  Headphones,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Sparkles,
  Languages,
  BookOpen,
  X,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAppContext } from '../reducer/appReducer.js';
import Footer from './Footer.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Official Google "G" SVG Logo
export function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

export default function AuthForm({ isModal = false, onClose }) {
  const { state, dispatch } = useAppContext();
  const { isLoginMode, form, loading, error, forgotPassword } = state.auth;
  const { googleClientId } = state;

  // Fetch GOOGLE_CLIENT_ID configured in backend/.env
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/google-client-id`)
      .then((res) => res.json())
      .then((data) => {
        if (data.clientId) {
          dispatch({ type: 'SET_GOOGLE_CLIENT_ID', payload: data.clientId });
        }
      })
      .catch(() => {});
  }, [dispatch]);

  const handleFieldChange = (field, value) => {
    dispatch({
      type: 'AUTH_UPDATE_FIELD',
      payload: { field, value },
    });
  };

  // Email & Password Login / Student Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'AUTH_START' });

    const endpoint = isLoginMode ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
    const bodyPayload = isLoginMode
      ? { email: form.email, password: form.password }
      : {
          username: form.username,
          email: form.email,
          password: form.password,
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: data.error || 'Authentication failed. Please check your credentials.',
        });
        return;
      }

      localStorage.setItem('sk_user', JSON.stringify(data.user));
      localStorage.setItem('sk_token', data.token);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: data.user, token: data.token },
      });
    } catch (err) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: 'Unable to reach the server. Please verify the backend is running on port 5000.',
      });
    }
  };

  // Step 1 of Forgot Password: Request 6-digit reset code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPassword.email }),
      });
      const data = await response.json();
      if (!response.ok) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: data.error || 'Could not generate reset code.',
        });
        return;
      }
      dispatch({
        type: 'FORGOT_CODE_SENT',
        payload: { message: data.message, resetCode: data.resetCode },
      });
    } catch {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: 'Unable to reach the server to request a reset code.',
      });
    }
  };

  // Step 2 of Forgot Password: Verify code & save new password
  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotPassword.email,
          code: forgotPassword.code,
          newPassword: forgotPassword.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: data.error || 'Could not reset password.',
        });
        return;
      }
      dispatch({
        type: 'FORGOT_RESET_SUCCESS',
        payload: data.message,
      });
    } catch {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: 'Unable to reach the server to reset password.',
      });
    }
  };

  // Real Google OAuth 2.0 Popup via accounts.google.com
  const handleRealGoogleLogin = () => {
    if (!googleClientId) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload:
          'Google Client ID is missing in backend/.env. Please set GOOGLE_CLIENT_ID in backend/.env.',
      });
      return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: 'Google Identity Services SDK is still loading. Please try again in a moment.',
      });
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: 'openid email profile',
      prompt: 'select_account',
      callback: async (tokenResponse) => {
        if (tokenResponse.error || !tokenResponse.access_token) {
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Google sign-in was cancelled or failed.',
          });
          return;
        }

        dispatch({ type: 'AUTH_START' });
        try {
          const response = await fetch(`${API_BASE}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: tokenResponse.access_token,
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            dispatch({
              type: 'AUTH_FAILURE',
              payload: data.error || 'Google authentication failed on server.',
            });
            return;
          }

          localStorage.setItem('sk_user', JSON.stringify(data.user));
          localStorage.setItem('sk_token', data.token);

          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: data.user, token: data.token },
          });
        } catch (err) {
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Could not reach backend server to verify Google token.',
          });
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  return (
    <div
      className={
        isModal
          ? 'w-full max-w-md mx-auto relative'
          : 'min-h-screen bg-[#FAF9F6] flex flex-col justify-between'
      }
    >
      <div
        className={
          isModal
            ? 'w-full'
            : 'flex-1 flex flex-col justify-center items-center px-4 py-10 sm:py-14'
        }
      >
        <div className="w-full max-w-md relative">
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Brand Header */}
          {!isModal && (
            <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20 mb-4">
            <Headphones className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shadowing<span className="text-[#2563EB]">Khmer</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 khmer-text">
            រៀននិយាយភាសាអង់គ្លេសតាមវីដេអូ YouTube ជាមួយការបកប្រែភាសាខ្មែរ
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" /> YouTube Shadowing
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 khmer-text">
              <Languages className="w-3.5 h-3.5" /> បកប្រែខ្មែរ (Khmer)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
              <BookOpen className="w-3.5 h-3.5" /> Vocab & Grammar
            </span>
          </div>
        </div>
          )}

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
          {forgotPassword.isForgotMode ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'FORGOT_CLOSE' })}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {forgotPassword.step === 'request' ? 'Forgot Password?' : 'Reset Your Password'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 khmer-text">
                  {forgotPassword.step === 'request'
                    ? 'បញ្ចូលអ៊ីមែលរបស់អ្នក ដើម្បីទទួលបានលេខកូដ 6 ខ្ទង់សម្រាប់កំណត់ពាក្យសម្ងាត់ថ្មី។'
                    : 'បញ្ចូលលេខកូដ 6 ខ្ទង់ និងពាក្យសម្ងាត់ថ្មីរបស់អ្នក។'}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
                  {error}
                </div>
              )}

              {forgotPassword.successMessage && forgotPassword.step === 'reset' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{forgotPassword.successMessage}</span>
                </div>
              )}

              {forgotPassword.step === 'request' ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="your.email@gmail.com"
                        value={forgotPassword.email}
                        onChange={(e) =>
                          dispatch({
                            type: 'FORGOT_UPDATE_FIELD',
                            payload: { field: 'email', value: e.target.value },
                          })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Get 6-Digit Reset Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={forgotPassword.code}
                      onChange={(e) =>
                        dispatch({
                          type: 'FORGOT_UPDATE_FIELD',
                          payload: { field: 'code', value: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm tracking-widest font-bold focus:bg-white focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={forgotPassword.newPassword}
                        onChange={(e) =>
                          dispatch({
                            type: 'FORGOT_UPDATE_FIELD',
                            payload: { field: 'newPassword', value: e.target.value },
                          })
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save New Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
          {isModal && (
            <div className="text-center mb-5 pr-4">
              <h2 className="text-lg font-extrabold text-slate-900">
                Sign in to unlock all features
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 khmer-text">
                បង្កើតគណនីឥតគិតថ្លៃ ដើម្បីបង្កើតមេរៀន YouTube, Dictation, Flashcards & Grammar
              </p>
            </div>
          )}

          {forgotPassword.successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{forgotPassword.successMessage}</span>
            </div>
          )}
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => !isLoginMode && dispatch({ type: 'AUTH_TOGGLE_MODE' })}
              className={`py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                isLoginMode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => isLoginMode && dispatch({ type: 'AUTH_TOGGLE_MODE' })}
              className={`py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                !isLoginMode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Real Google OAuth Button */}
          <button
            type="button"
            onClick={handleRealGoogleLogin}
            disabled={loading}
            className="w-full mb-5 inline-flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-1 items-center mb-5">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              or with email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required={!isLoginMode}
                    placeholder="Sokha Khmer"
                    value={form.username}
                    onChange={(e) => handleFieldChange('username', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={form.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                {isLoginMode && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'FORGOT_OPEN' })}
                    className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isLoginMode ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {isLoginMode ? "Don't have an account yet?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => dispatch({ type: 'AUTH_TOGGLE_MODE' })}
                className="font-semibold text-[#2563EB] hover:underline ml-1 cursor-pointer"
              >
                {isLoginMode ? 'Register now' : 'Sign in instead'}
              </button>
            </p>
          </div>
            </>
          )}
        </div>
      </div>
      </div>
      {!isModal && <Footer />}
    </div>
  );
}
