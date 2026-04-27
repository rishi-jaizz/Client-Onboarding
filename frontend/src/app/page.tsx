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

/* Shared max-width wrapper used by every section */
function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      style={{ maxWidth: '1024px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
      className={`px-5 sm:px-8 ${className}`}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  return (
    <main
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%),' +
          'radial-gradient(ellipse 60% 50% at 90% 80%, rgba(139,92,246,0.12) 0%, transparent 70%),' +
          'linear-gradient(160deg,#080715 0%,#0f0c29 40%,#0d0b23 70%,#080715 100%)',
      }}
    >
      {/* Grid texture */}
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

      {/* Ambient glow — fixed, truly centred */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-0 flex items-start justify-center overflow-hidden"
      >
        <div
          style={{
            width: '800px',
            height: '500px',
            background: 'radial-gradient(ellipse,rgba(99,102,241,0.12) 0%,transparent 70%)',
            borderRadius: '50%',
            marginTop: '-100px',
            flexShrink: 0,
          }}
        />
      </div>

      {/* ─────────── NAV ─────────── */}
      <header className="relative z-20 w-full">
        <Container className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-[17px] h-[17px] text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight">ClientFlow</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/login" className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4 sm:px-5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Container>
      </header>

      {/* ─────────── HERO ─────────── */}
      <section className="relative z-10 w-full">
        <Container className="pt-20 sm:pt-28 pb-20 sm:pb-24">
          {/* Everything explicitly centred */}
          <div className="flex flex-col items-center text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge badge-indigo mb-7">
              <Star className="w-3 h-3 fill-current shrink-0" />
              <span>Production-ready Onboarding Platform</span>
            </div>

            {/* Headline */}
            <h1
              className="font-bold leading-[1.1] tracking-tight mb-5 text-center"
              style={{
                fontSize: 'clamp(32px, 5vw, 58px)',
                maxWidth: '720px',
              }}
            >
              Onboard Clients{' '}
              <span className="gradient-text">Seamlessly</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-gray-400 leading-relaxed mb-9 text-center"
              style={{ maxWidth: '520px', fontSize: 'clamp(15px, 1.4vw, 18px)' }}
            >
              A complete client registration platform with multi-step workflows,
              document management, JWT authentication, and real-time progress tracking.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full" style={{ maxWidth: '420px' }}>
              <Link href="/signup" className="btn-primary text-sm sm:text-[15px] py-3 px-7 w-full sm:w-auto justify-center group">
                Start Onboarding
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5001'}/api/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-sm sm:text-[15px] py-3 px-7 w-full sm:w-auto justify-center"
              >
                <FileText className="w-4 h-4 shrink-0" />
                View API Docs
              </a>
            </div>

            {/* Trust line */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2" style={{ fontSize: '11.5px', color: '#6b7280' }}>
              {['No credit card required', 'Free to start', 'Deploy anywhere'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                  {t}
                </span>
              ))}
            </div>

          </div>
        </Container>
      </section>

      {/* ─────────── STATS ─────────── */}
      <section className="relative z-10 w-full">
        <Container className="pb-20 sm:pb-24">
          <div
            className="grid gap-3 sm:gap-5"
            style={{ gridTemplateColumns: 'repeat(3,1fr)', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}
          >
            {stats.map(s => (
              <div key={s.label} className="glass-md rounded-2xl p-4 sm:p-6 glow-card flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-4xl font-bold gradient-text mb-1 tabular-nums">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider leading-tight mt-1 text-center">{s.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────── FEATURES ─────────── */}
      <section className="relative z-10 w-full">
        <Container className="pb-20 sm:pb-24">

          {/* Section heading */}
          <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
            <div className="section-tag mb-3">Platform Features</div>
            <h2 className="text-2xl sm:text-[30px] font-bold mb-3 tracking-tight text-center">Everything You Need</h2>
            <p className="text-gray-500 text-sm sm:text-[15px] text-center leading-relaxed" style={{ maxWidth: '380px' }}>
              Built with production-grade security and developer experience in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="glass rounded-2xl p-5 sm:p-6 glow-card card-hover group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:border-indigo-500/40 transition-colors shrink-0">
                  <f.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2" style={{ fontSize: '14.5px' }}>{f.title}</h3>
                <p className="text-gray-500 leading-relaxed" style={{ fontSize: '13px' }}>{f.desc}</p>
              </div>
            ))}
          </div>

        </Container>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="relative z-10 w-full">
        <Container className="pb-20 sm:pb-24">
          <div style={{ maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="relative glass-md rounded-3xl p-9 sm:p-14 glow-card overflow-hidden">
              <div aria-hidden className="absolute -top-20 -left-20 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div aria-hidden className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-xl shadow-indigo-500/25">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 tracking-tight text-center">Ready to get started?</h2>
                <p className="text-gray-400 mb-7 text-sm text-center leading-relaxed" style={{ maxWidth: '300px' }}>
                  Create your account in seconds and begin the guided onboarding process.
                </p>
                <Link href="/signup" className="btn-primary text-sm sm:text-[15px] py-3 px-8">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="relative z-10 w-full border-t border-white/5">
        <Container className="py-7">
          <p className="text-center" style={{ fontSize: '11.5px', color: '#6b7280' }}>
            © 2026 ClientFlow. Built with Next.js, Node.js &amp; PostgreSQL.
          </p>
        </Container>
      </footer>

    </main>
  );
}
