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

/**
 * LAYOUT STRATEGY
 * ───────────────
 * Every section uses the same wrapper:
 *   <div class="landing-container"> → max-w-5xl, mx-auto, symmetric px
 * This single shared column width guarantees everything aligns
 * identically on every screen size — no more left-shift or unequal gutters.
 * Hero text is narrowed with an inner max-w-2xl mx-auto for readability.
 */
export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="min-h-screen animated-bg text-white overflow-x-hidden">

      {/* ── Subtle grid texture ── */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* ── Ambient glow (truly centred, z-0, no layout impact) ── */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-0 pointer-events-none flex justify-center overflow-hidden"
      >
        <div className="w-[900px] h-[500px] rounded-full bg-indigo-500/8 blur-[160px] -translate-y-1/3" />
      </div>

      {/* ════════════════════════════════════════
          SINGLE SHARED COLUMN — all sections use
          this same max-w-5xl centering wrapper
      ════════════════════════════════════════ */}

      {/* ── Nav ── */}
      <header className="relative z-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-[17px] h-[17px] text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight">ClientFlow</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4 sm:px-5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-20 sm:pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge badge-indigo mb-7">
            <Star className="w-3 h-3 fill-current shrink-0" />
            <span>Production-ready Onboarding Platform</span>
          </div>

          {/* Headline — inner max-w keeps it readable, mx-auto centres it */}
          <h1 className="max-w-2xl mx-auto text-[36px] sm:text-5xl md:text-[58px] font-bold leading-[1.1] tracking-tight mb-5">
            Onboard Clients{' '}
            <span className="gradient-text">Seamlessly</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-lg mx-auto text-base sm:text-[17px] text-gray-400 mb-9 leading-relaxed">
            A complete client registration platform with multi-step workflows,
            document management, JWT authentication, and real-time progress tracking.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xs sm:max-w-none mx-auto">
            <Link href="/signup" className="btn-primary text-sm sm:text-[15px] py-3 px-7 w-full sm:w-auto group">
              Start Onboarding
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5001'}/api/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm sm:text-[15px] py-3 px-7 w-full sm:w-auto"
            >
              <FileText className="w-4 h-4 shrink-0" />
              View API Docs
            </a>
          </div>

          {/* Trust line */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11.5px] text-gray-600">
            {['No credit card required', 'Free to start', 'Deploy anywhere'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-20 sm:pb-24">
          {/* Inner narrower wrapper for 3 stat cards so they don't stretch full 5xl width */}
          <div className="max-w-xl mx-auto grid grid-cols-3 gap-3 sm:gap-5">
            {stats.map(s => (
              <div key={s.label} className="glass-md rounded-2xl p-4 sm:p-6 text-center glow-card">
                <div className="text-2xl sm:text-4xl font-bold gradient-text mb-1 tabular-nums">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider leading-tight mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-20 sm:pb-24">
          <div className="text-center mb-10 sm:mb-14">
            <div className="section-tag justify-center mb-3">Platform Features</div>
            <h2 className="text-2xl sm:text-[30px] font-bold mb-3 tracking-tight">Everything You Need</h2>
            <p className="text-gray-500 text-sm sm:text-[15px] max-w-sm mx-auto leading-relaxed">
              Built with production-grade security and developer experience in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div
                key={f.title}
                className="glass rounded-2xl p-5 sm:p-6 glow-card card-hover group cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:border-indigo-500/40 transition-colors shrink-0">
                  <f.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-[14.5px]">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="relative z-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-20 sm:pb-24">
          {/* Inner card narrowed for visual balance */}
          <div className="max-w-2xl mx-auto">
            <div className="relative glass-md rounded-3xl p-9 sm:p-14 text-center glow-card overflow-hidden">
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
                <Link href="/signup" className="btn-primary inline-flex text-sm sm:text-[15px] py-3 px-8">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-7 text-center">
          <p className="text-[11.5px] text-gray-600">
            © 2026 ClientFlow. Built with Next.js, Node.js &amp; PostgreSQL.
          </p>
        </div>
      </footer>

    </main>
  );
}
