'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Shield, Zap, CheckCircle, Users, FileText, BarChart3, Star } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: Shield,    title: 'Secure Authentication',  desc: 'JWT-based auth with refresh tokens and bcrypt password hashing.' },
  { icon: Zap,       title: 'Multi-Step Onboarding',  desc: 'Guided 4-step workflow: documents, verification, setup, review.' },
  { icon: FileText,  title: 'Document Management',    desc: 'Upload and track business documents with real-time status.' },
  { icon: BarChart3, title: 'Real-time Progress',     desc: 'Visual progress tracking across all onboarding stages.' },
  { icon: Users,     title: 'Profile Management',     desc: 'Full CRUD for client profiles with business information.' },
  { icon: CheckCircle, title: 'Status Tracking',      desc: 'Pending → In-Progress → Completed lifecycle management.' },
];

const stats = [
  { value: '4',    label: 'Onboarding Steps' },
  { value: '15+',  label: 'API Endpoints' },
  { value: '100%', label: 'Type Safe' },
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="min-h-screen animated-bg text-white overflow-x-hidden selection:bg-indigo-500/30">
      {/* ── Grid overlay ── */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Navigation ── */}
      <nav className="relative z-20 flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <Zap className="w-[18px] h-[18px] text-white" />
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
          </div>
          <span className="text-[17px] font-bold tracking-tight">ClientFlow</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors font-medium">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="btn-primary text-sm py-2.5 px-5"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center px-5 sm:px-8 pt-16 sm:pt-20 lg:pt-28 pb-20 sm:pb-24 max-w-4xl mx-auto">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 badge badge-indigo mb-8">
          <Star className="w-3 h-3 fill-current" />
          Production-ready Onboarding Platform
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold leading-[1.1] tracking-tight mb-6">
          Onboard Clients{' '}
          <br className="hidden sm:block" />
          <span className="gradient-text">Seamlessly</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
          A complete client registration platform with multi-step workflows,
          document management, JWT authentication, and real-time progress tracking.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup" className="btn-primary w-full sm:w-auto text-base py-3.5 px-7 group">
            Start Onboarding
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5001'}/api/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost w-full sm:w-auto text-base py-3.5 px-7"
          >
            <FileText className="w-4 h-4" />
            View API Docs
          </a>
        </div>

        {/* Floating trust line */}
        <p className="mt-8 text-[12px] text-gray-600 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-green-500" />No credit card required
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-green-500" />Free to start
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-green-500" />Deploy anywhere
          </span>
        </p>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 mb-20 sm:mb-28">
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-md rounded-2xl p-5 sm:p-7 text-center glow-card">
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1.5 tabular-nums">{stat.value}</div>
              <div className="text-[11px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="text-center mb-12 sm:mb-16">
          <div className="section-tag justify-center mb-3">Platform Features</div>
          <h2 className="text-2xl sm:text-[32px] font-bold mb-3 tracking-tight">Everything You Need</h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
            Built with production-grade security and developer experience in mind.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 glow-card card-hover group cursor-default"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:border-indigo-500/40 transition-colors">
                <feature.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-[15px]">{feature.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="relative glass-md rounded-3xl p-10 sm:p-14 text-center glow-card overflow-hidden">
          {/* Glow blobs */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-600/12 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Ready to get started?</h2>
            <p className="text-gray-400 mb-8 text-sm sm:text-base max-w-sm mx-auto">
              Create your account in seconds and begin the guided onboarding process.
            </p>
            <Link href="/signup" className="btn-primary inline-flex text-base py-3.5 px-8">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-8 border-t border-white/5">
        <p className="text-[12px] text-gray-600">
          © 2026 ClientFlow. Built with Next.js, Node.js & PostgreSQL.
        </p>
      </footer>
    </main>
  );
}
