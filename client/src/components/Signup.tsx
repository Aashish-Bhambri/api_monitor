import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { api } from '../services/api';

interface SignupProps {
  onSwitchToLogin?: () => void;
}

const Signup = ({ onSwitchToLogin }: SignupProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post('/auth/signup', { email, password });
      setSuccess('Account created successfully! Switching to sign in...');
      setTimeout(() => {
        if (onSwitchToLogin) onSwitchToLogin();
      }, 1200);
    } catch (err: unknown) {
      let msg = 'Signup failed. Please try again.';
      if (isAxiosError(err)) {
        const errorData = err.response?.data?.error;
        if (typeof errorData === 'string') {
          msg = errorData;
        } else if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          msg = String((errorData as { message: unknown }).message);
        } else if (typeof err.response?.data?.message === 'string') {
          msg = err.response.data.message;
        } else {
          msg = err.message || msg;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center gap-6 py-6 animate-fade-in text-neutral-100">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Create an account
        </h2>
        <p className="text-sm text-neutral-400 mt-1.5">Start monitoring your APIs in minutes</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-sm text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 font-bold ml-2 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-sm text-emerald-400 flex items-center justify-between">
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Email address
          </label>
          <input
            placeholder="you@company.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#262626] text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition-all bg-[#121212]"
          />
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-[#262626] text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition-all bg-[#121212]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Confirm Password
          </label>
          <input
            placeholder="••••••••"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#262626] text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-white transition-all bg-[#121212]"
          />
        </div>

        {/* Submit Button (High Contrast White on Black) */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full py-3 px-4 rounded-xl font-semibold text-sm text-black bg-white hover:bg-neutral-200 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="w-full border-t border-[#222222]"></div>
        <span className="absolute bg-[#000000] px-3 text-xs text-neutral-500 font-medium tracking-wide">
          or continue with
        </span>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#262626] bg-[#121212] hover:bg-[#1A1A1A] active:bg-[#222222] text-sm font-medium text-neutral-200 transition-all cursor-pointer"
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
          <span>Google</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#262626] bg-[#121212] hover:bg-[#1A1A1A] active:bg-[#222222] text-sm font-medium text-neutral-200 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>GitHub</span>
        </button>
      </div>

      {/* Switch to Login */}
      <p className="text-center text-xs sm:text-sm text-neutral-400 mt-2">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-white hover:underline font-semibold cursor-pointer transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default Signup;
