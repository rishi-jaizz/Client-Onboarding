'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName:  z.string().min(1, 'Last name is required').max(50),
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(8,'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter required')
    .regex(/[0-9]/, 'One number required')
    .regex(/[^A-Za-z0-9]/, 'One special character required'),
  company:  z.string().max(100).optional(),
  industry: z.string().optional(),
  phone:    z.string().optional(),
  country:  z.string().optional(),
});
type SignupForm = z.infer<typeof signupSchema>;

const industries = ['Technology','Finance','Healthcare','Retail','Manufacturing','Education','Real Estate','Other'];
const countries  = [
  { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },        { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },         { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
];
const STEPS = ['Account', 'Business', 'Review'];

const selectCls = "input-base input-glow";
const inputCls  = "input-base input-glow";
const labelCls  = "block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [currentStep, setCurrentStep]   = useState(0);

  const { register, handleSubmit, trigger, formState: { errors }, watch } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');
  const passwordChecks = [
    { label: '8+ characters',    valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Number',           valid: /[0-9]/.test(password) },
    { label: 'Special character',valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const nextStep = async () => {
    const fields = currentStep === 0 ? ['firstName','lastName','email','password'] as (keyof SignupForm)[] : [];
    const valid  = fields.length ? await trigger(fields) : true;
    if (valid) setCurrentStep(s => Math.min(s + 1, 2));
  };

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      await signup(data);
      toast.success('Account created! Starting your onboarding...');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center px-4 py-10 relative overflow-x-hidden">
      {/* Grid */}
      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.035) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div aria-hidden className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-[17px] font-bold text-white tracking-tight">ClientFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1.5 tracking-tight">Create your account</h1>
          <p className="text-[13px] text-gray-500">Join thousands of clients onboarded seamlessly</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold transition-all duration-300 ${
                i < currentStep  ? 'bg-indigo-600 text-white'
                : i === currentStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/25'
                : 'bg-white/8 text-gray-500'
              }`}>
                {i < currentStep ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-[12px] font-medium ${i === currentStep ? 'text-white' : 'text-gray-600'}`}>{step}</span>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-px rounded-full transition-all duration-300 ${i < currentStep ? 'bg-indigo-600' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-md rounded-2xl p-6 sm:p-7 glow-card">
          <form onSubmit={handleSubmit(onSubmit)} id="signup-form">

            {/* ── Step 0: Account ── */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} htmlFor="signup-firstName">First Name</label>
                    <input id="signup-firstName" {...register('firstName')} className={inputCls} placeholder="John" />
                    {errors.firstName && <p className="mt-1 text-[11px] text-red-400">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="signup-lastName">Last Name</label>
                    <input id="signup-lastName" {...register('lastName')} className={inputCls} placeholder="Doe" />
                    {errors.lastName && <p className="mt-1 text-[11px] text-red-400">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelCls} htmlFor="signup-email">Email Address</label>
                  <input id="signup-email" type="email" autoComplete="email" {...register('email')}
                    className={inputCls} placeholder="you@example.com" />
                  {errors.email && <p className="mt-1 text-[11px] text-red-400">{errors.email.message}</p>}
                </div>

                <div>
                  <label className={labelCls} htmlFor="signup-password">Password</label>
                  <div className="relative">
                    <input id="signup-password" type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password" {...register('password')}
                      className={`${inputCls} pr-11`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-0.5">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                      {passwordChecks.map(c => (
                        <div key={c.label} className={`flex items-center gap-1.5 text-[11px] ${c.valid ? 'text-green-400' : 'text-gray-600'}`}>
                          <CheckCircle className={`w-3 h-3 flex-shrink-0 ${c.valid ? 'text-green-400' : 'text-gray-700'}`} />
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-[11px] text-red-400">{errors.password.message}</p>}
                </div>
              </div>
            )}

            {/* ── Step 1: Business ── */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls} htmlFor="signup-company">
                    Company Name <span className="text-gray-600 normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <input id="signup-company" {...register('company')} className={inputCls} placeholder="Acme Corp" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="signup-industry">
                    Industry <span className="text-gray-600 normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <select id="signup-industry" {...register('industry')} className={selectCls}>
                    <option value="" className="bg-[#0f0c29]">Select industry</option>
                    {industries.map(ind => <option key={ind} value={ind} className="bg-[#0f0c29]">{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="signup-phone">
                    Phone <span className="text-gray-600 normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <input id="signup-phone" {...register('phone')} className={inputCls} placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="signup-country">
                    Country <span className="text-gray-600 normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <select id="signup-country" {...register('country')} className={selectCls}>
                    <option value="" className="bg-[#0f0c29]">Select country</option>
                    {countries.map(c => <option key={c.code} value={c.code} className="bg-[#0f0c29]">{c.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* ── Step 2: Review ── */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/18">
                  <h3 className="text-[13px] font-semibold text-indigo-300 mb-3">What happens next?</h3>
                  <div className="space-y-2.5">
                    {[
                      'Your account will be created instantly',
                      "You'll start a 4-step onboarding workflow",
                      'Upload identity and business documents',
                      'Get verified and start using the platform',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-[12.5px] text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-indigo-600/25 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-indigo-400">{i + 1}</span>
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[11.5px] text-gray-600 text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            )}

            {/* ── Nav buttons ── */}
            <div className="flex gap-3 mt-5">
              {currentStep > 0 && (
                <button type="button" onClick={() => setCurrentStep(s => s - 1)}
                  className="btn-ghost flex-1 py-2.5 text-sm">
                  Back
                </button>
              )}
              {currentStep < 2 ? (
                <button type="button" id={`signup-next-${currentStep}`} onClick={nextStep}
                  className="btn-primary flex-1 py-2.5 text-sm">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" id="signup-submit" disabled={isLoading}
                  className="btn-primary flex-1 py-2.5 text-sm">
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</>
                    : <>Create Account <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              )}
            </div>
          </form>

          <div className="mt-5 pt-5 border-t border-white/6 text-center">
            <p className="text-[12.5px] text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
