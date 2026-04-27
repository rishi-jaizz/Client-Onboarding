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
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter required')
    .regex(/[0-9]/, 'One number required')
    .regex(/[^A-Za-z0-9]/, 'One special character required'),
  company: z.string().max(100).optional(),
  industry: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
});

type SignupForm = z.infer<typeof signupSchema>;

const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Real Estate', 'Other'];
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
];

const steps = ['Account', 'Business', 'Review'];

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { register, handleSubmit, trigger, formState: { errors }, watch } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  const passwordChecks = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
    { label: 'Special character', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const nextStep = async () => {
    const fieldsToValidate: (keyof SignupForm)[] =
      currentStep === 0 ? ['firstName', 'lastName', 'email', 'password'] : [];
    const valid = fieldsToValidate.length ? await trigger(fieldsToValidate) : true;
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ClientFlow</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400">Join thousands of clients onboarded seamlessly</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300 ${
                i < currentStep ? 'bg-indigo-600 text-white' :
                i === currentStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30' :
                'bg-white/10 text-gray-400'
              }`}>
                {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm ${i === currentStep ? 'text-white' : 'text-gray-500'}`}>{step}</span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${i < currentStep ? 'bg-indigo-600' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-5 sm:p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} id="signup-form">

            {/* Step 0: Account Info */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-firstName">First Name</label>
                    <input
                      id="signup-firstName"
                      {...register('firstName')}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                      placeholder="John"
                    />
                    {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-lastName">Last Name</label>
                    <input
                      id="signup-lastName"
                      {...register('lastName')}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-email">Email address</label>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-password">Password</label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...register('password')}
                      className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {passwordChecks.map(check => (
                        <div key={check.label} className={`flex items-center gap-1.5 text-xs ${check.valid ? 'text-green-400' : 'text-gray-500'}`}>
                          <CheckCircle className={`w-3 h-3 ${check.valid ? 'text-green-400' : 'text-gray-600'}`} />
                          {check.label}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                </div>
              </div>
            )}

            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-company">Company Name <span className="text-gray-500">(optional)</span></label>
                  <input
                    id="signup-company"
                    {...register('company')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                    placeholder="Acme Corp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-industry">Industry <span className="text-gray-500">(optional)</span></label>
                  <select
                    id="signup-industry"
                    {...register('industry')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 input-glow transition-all"
                  >
                    <option value="" className="bg-gray-900">Select industry</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind} className="bg-gray-900">{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-phone">Phone <span className="text-gray-500">(optional)</span></label>
                  <input
                    id="signup-phone"
                    {...register('phone')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="signup-country">Country <span className="text-gray-500">(optional)</span></label>
                  <select
                    id="signup-country"
                    {...register('country')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 input-glow transition-all"
                  >
                    <option value="" className="bg-gray-900">Select country</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} className="bg-gray-900">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <h3 className="text-sm font-semibold text-indigo-300 mb-3">What happens next?</h3>
                  <div className="space-y-2">
                    {[
                      'Your account will be created instantly',
                      'You\'ll start a 4-step onboarding workflow',
                      'Upload identity and business documents',
                      'Get verified and start using the platform',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-indigo-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-indigo-400">{i + 1}</span>
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="flex-1 py-3.5 glass border border-white/10 hover:border-white/20 rounded-xl font-medium text-gray-300 hover:text-white transition-all"
                >
                  Back
                </button>
              )}

              {currentStep < 2 ? (
                <button
                  type="button"
                  id={`signup-next-${currentStep}`}
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-500/25"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  id="signup-submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-500/25"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</>
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
