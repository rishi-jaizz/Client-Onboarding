'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Shield, Zap, CheckCircle, Users, FileText, BarChart3, Star } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: Shield,      title: 'Secure Authentication', desc: 'JWT-based auth with refresh tokens and bcrypt password hashing.' },
  { icon: Zap,         title: 'Multi-Step Onboarding',  desc: 'Guided 4-step workflow: documents, verification, setup, review.' },
  { icon: FileText,    title: 'Document Management',    desc: 'Upload and track business documents with real-time status.' },
  { icon: BarChart3,   title: 'Real-time Progress',     desc: 'Visual progress tracking across all onboarding stages.' },
  { icon: Users,       title: 'Profile Management',     desc: 'Full CRUD for client profiles with business information.' },
  { icon: CheckCircle, title: 'Status Tracking',        desc: 'Pending → In-Progress → Completed lifecycle management.' },
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
    <main className="min-h-screen animated-bg text-white overflow-x-hidden">
      {/* Grid overlay */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.035) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-20 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16 sm:h-18">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <Zap className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight">ClientFlow</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link href="/login" className="px-3 sm:px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors font-medium rounded-xl hover:bg-white/5">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4 sm:px-5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 w-full">
        {/* Ambient glow — centred via absolute inside a relative container */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 flex justify-center pointer-events-none overflow-hidden"
        >
          <div className="w-[700px] h-[420px] bg-indigo-600/10 rounded-full blur-[120px] mt-[-80px]" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-20 sm:pt-28 pb-20 sm:pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge badge-indigo mb-7">
            <Star className="w-3 h-3 fill-current flex-shrink-0" />
            <span>Production-ready Onboarding Platform</span>
          </div>

          <h1 className="text-[38px] sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-5">
            Onboard Clients{' '}
            <span className="gradient-text">Seamlessly</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-lg mx-auto mb-9 leading-relaxed">
            A complete client registration platform with multi-step workflows,
            document management, JWT authentication, and real-time progress tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm sm:max-w-none mx-auto">
            <Link href="/signup" className="btn-primary text-sm sm:text-base py-3 px-6 sm:px-7 w-full sm:w-auto justify-center group">
              Start Onboarding
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5001'}/api/docs`}
              target="_blank" rel="noopener noreferrer"
              className="btn-ghost text-sm sm:text-base py-3 px-6 sm:px-7 w-full sm:w-auto justify-center"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              View API Docs
            </a>
          </div>

          {/* Trust line */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-gray-600">
            {['No credit card required', 'Free to start', 'Deploy anywhere'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 sm:px-8 pb-20 sm:pb-24">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map(s => (
            <div key={s.label} className="glass-md rounded-2xl p-4 sm:p-6 text-center glow-card">
              <div className="text-2xl sm:text-4xl font-bold gradient-text mb-1 tabular-nums">{s.value}</div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 font-semibold uppercase tracking-wider leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pb-20 sm:pb-24">
        <div className="text-center mb-10 sm:mb-14">
          <div className="section-tag justify-center mb-3">Platform Features</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Everything You Need</h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
            Built with production-grade security and developer experience in mind.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title} className="glass rounded-2xl p-5 sm:p-6 glow-card card-hover group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/12 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:border-indigo-500/40 transition-colors flex-shrink-0">
                <f.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-[14.5px]">{f.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 sm:px-8 pb-20 sm:pb-24">
        <div className="relative glass-md rounded-3xl p-8 sm:p-12 text-center glow-card overflow-hidden">
          <div aria-hidden className="absolute -top-20 -left-20 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div aria-hidden className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight">Ready to get started?</h2>
            <p className="text-gray-400 mb-7 text-sm max-w-xs mx-auto leading-relaxed">
              Create your account in seconds and begin the guided onboarding process.
            </p>
            <Link href="/signup" className="btn-primary inline-flex text-sm sm:text-base py-3 px-7">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-7 border-t border-white/5">
        <p className="text-[11.5px] text-gray-600">
          © 2026 ClientFlow. Built with Next.js, Node.js &amp; PostgreSQL.
        </p>
      </footer>
    </main>
  );
}
