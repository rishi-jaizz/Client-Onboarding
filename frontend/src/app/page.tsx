'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Shield, Zap, CheckCircle, Users, FileText, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: Shield, title: 'Secure Authentication', desc: 'JWT-based auth with refresh tokens and bcrypt password hashing.' },
  { icon: Zap, title: 'Multi-Step Onboarding', desc: 'Guided 4-step workflow: documents, verification, setup, review.' },
  { icon: FileText, title: 'Document Management', desc: 'Upload and track business documents with status monitoring.' },
  { icon: BarChart3, title: 'Real-time Progress', desc: 'Visual progress tracking across all onboarding stages.' },
  { icon: Users, title: 'Profile Management', desc: 'Full CRUD for client profiles with business information.' },
  { icon: CheckCircle, title: 'Status Tracking', desc: 'Pending → In-Progress → Completed lifecycle management.' },
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="min-h-screen animated-bg text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">ClientFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-8 pt-20 pb-24 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-indigo-300 mb-8 border border-indigo-500/20">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Production-ready Onboarding Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Onboard Clients{' '}
          <span className="gradient-text">Seamlessly</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A complete client registration and onboarding platform with multi-step workflows,
          document management, JWT authentication, and real-time progress tracking.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
          >
            Start Onboarding
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="http://localhost:5000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-4 glass rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20"
          >
            <FileText className="w-5 h-5" />
            API Docs
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 mb-24">
        <div className="grid grid-cols-3 gap-6">
          {[
            { value: '4', label: 'Onboarding Steps' },
            { value: '15+', label: 'API Endpoints' },
            { value: '100%', label: 'Type Safe' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 text-center border border-white/10">
              <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Everything You Need</h2>
          <p className="text-gray-400">Built with production-grade security and developer experience in mind.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all">
                <feature.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 pb-24 text-center">
        <div className="glass rounded-3xl p-12 border border-white/10">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Create your account and begin the onboarding process in minutes.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-semibold text-lg transition-all shadow-xl shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
