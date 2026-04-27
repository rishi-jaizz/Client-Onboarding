'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center px-4 py-10 relative overflow-x-hidden">
      {/* Grid overlay */}
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.035) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Centred ambient glow */}
      <div aria-hidden className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-[17px] font-bold text-white tracking-tight">ClientFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1.5 tracking-tight">Welcome back</h1>
          <p className="text-[13px] text-gray-500">Sign in to continue your onboarding</p>
        </div>

        {/* Card */}
        <div className="glass-md rounded-2xl p-6 sm:p-7 glow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="login-form">

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="login-email">
                Email Address
              </label>
              <input id="login-email" type="email" autoComplete="email"
                {...register('email')}
                className="input-base input-glow"
                placeholder="you@company.com"
              />
              {errors.email && <p className="mt-1.5 text-[11px] text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <input id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className="input-base input-glow pr-11"
                  placeholder="••••••••"
                />
                <button type="button" id="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-[11px] text-red-400">{errors.password.message}</p>}
            </div>

            {/* Demo hint */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/8 border border-indigo-500/18">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0 mt-1" />
              <p className="text-[12px] text-indigo-300 leading-relaxed">
                <span className="font-semibold">Demo:</span> demo@example.com / Demo@1234
              </p>
            </div>

            <button type="submit" id="login-submit" disabled={isLoading}
              className="btn-primary w-full py-3 text-sm mt-1">
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
                : <>Sign In<ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/6 text-center">
            <p className="text-[12.5px] text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
