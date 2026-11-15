import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRateLimitInfo(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 200 && data.ok) {
        if (data.token) {
          localStorage.setItem('klay_admin_token', data.token);
          sessionStorage.setItem('klay_admin_token', data.token);
        }
        if (data.user?.username) {
          localStorage.setItem('klay_admin_user', data.user.username);
        }
        const destination = (location.state as { from?: string })?.from || '/admin/leads';
        navigate(destination, { replace: true });
        return;
      }

      if (response.status === 429) {
        const errorText =
          data.error ||
          'Too many failed attempts. Rate limit active. Please try again in 15 minutes.';
        setErrorMessage('Security Rate Limit Enforced (HTTP 429)');
        setRateLimitInfo(errorText);
        return;
      }

      if (response.status === 401) {
        setErrorMessage(data.error || 'Invalid credentials. Access denied.');
        return;
      }

      setErrorMessage(data.error || `Authentication failed (${response.status})`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setErrorMessage(`Network error connecting to Admin Gateway: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05131F] text-[#FAFBFD] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-[#FAFBFD]">
      {/* Subtle luxury ambient glow behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0C2D48]/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Sovereign Header Card */}
      <div className="w-full max-w-md bg-[#0A1E30] border border-[#0C2D48] rounded-2xl shadow-2xl shadow-black/60 p-8 sm:p-10 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-t-2xl opacity-60" />

        {/* Brand Crest */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0C2D48] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg shadow-black/40 mb-4">
            <Shield className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wide text-white">
            KLAY CONSULTANTS
          </h1>
          <p className="font-mono text-xs text-[#D4AF37] uppercase tracking-widest mt-1">
            Executive Admin Portal
          </p>
          <p className="text-xs text-white/50 mt-2">
            Restricted Access &bull; Authorized Personnel Only
          </p>
        </div>

        {/* Error / Rate Limit Alert Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-mono space-y-1"
          >
            <div className="flex items-center gap-2 font-semibold text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {rateLimitInfo && (
              <p className="text-rose-300/80 pl-6 leading-relaxed">{rateLimitInfo}</p>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-username"
              className="block font-mono text-xs uppercase tracking-wider text-white/70"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 bg-[#05131F] border border-white/10 rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block font-mono text-xs uppercase tracking-wider text-white/70"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-2.5 bg-[#05131F] border border-white/10 rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0C2D48] via-[#103859] to-[#0C2D48] hover:from-[#103859] hover:to-[#174871] text-[#D4AF37] font-mono text-xs font-semibold uppercase tracking-wider border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all shadow-lg shadow-black/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <span>Sign In to Executive Portal</span>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-white/50 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
