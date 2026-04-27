'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/lib/api';
import {
  CheckCircle2, Clock, ArrowRight, FileText, Shield, Settings,
  ClipboardCheck, Loader2, TrendingUp, User, Sparkles, Rocket
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface OnboardingStep {
  id: string; stepNumber: number; stepType: string;
  title: string; description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completedAt?: string;
}

interface Progress {
  progress: number; completedSteps: number; totalSteps: number;
  isComplete: boolean; clientStatus: string; steps: OnboardingStep[];
}

const stepIcons: Record<string, React.ElementType> = {
  DOCUMENT_UPLOAD: FileText, IDENTITY_VERIFICATION: Shield,
  BUSINESS_SETUP: Settings,  REVIEW_AND_CONFIRM: ClipboardCheck,
};

const statusBadge: Record<string, string> = {
  COMPLETED: 'badge badge-green', IN_PROGRESS: 'badge badge-indigo',
  PENDING: 'badge badge-gray',    SKIPPED: 'badge badge-yellow',
};

export default function DashboardPage() {
  const { client, refreshClient } = useAuth();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => { fetchProgress(); }, []);

  const fetchProgress = async () => {
    try {
      const res = await onboardingAPI.getProgress();
      setProgress(res.data.data);
    } catch { toast.error('Failed to load onboarding progress'); }
    finally { setIsLoading(false); }
  };

  const handleStartOnboarding = async () => {
    setIsStarting(true);
    try {
      await onboardingAPI.startOnboarding();
      await fetchProgress();
      await refreshClient();
      toast.success("Onboarding started! Let's begin.");
    } catch { toast.error('Failed to start onboarding'); }
    finally { setIsStarting(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
        <p className="text-sm text-gray-500">Loading your dashboard…</p>
      </div>
    </div>
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning'; if (h < 17) return 'Good afternoon'; return 'Good evening';
  };

  const pct = progress?.progress ?? 0;

  return (
    <div className="page-container py-7 sm:py-10">

      {/* ── Header ── */}
      <div className="mb-7 sm:mb-9">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest mb-1">
              Welcome back
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
              {greeting()}, <span className="gradient-text">{client?.firstName}</span> 👋
            </h1>
            <p className="text-gray-500 mt-1.5 text-[13px] sm:text-sm max-w-md">
              {progress?.isComplete
                ? 'Your account is fully activated. Welcome to ClientFlow!'
                : 'Complete your onboarding steps to unlock full platform access.'}
            </p>
          </div>
          <span className={`flex-shrink-0 badge ${
            client?.status === 'COMPLETED' ? 'badge-green' :
            client?.status === 'IN_PROGRESS' ? 'badge-indigo' : 'badge-gray'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse flex-shrink-0" />
            {client?.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7 sm:mb-9">
        {/* Progress */}
        <div className="glass-md rounded-2xl p-5 glow-card card-hover kpi-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Progress</span>
          </div>
          <div className="text-[28px] sm:text-3xl font-bold text-white tabular-nums leading-none mt-auto">
            {pct}<span className="text-base text-gray-500 font-medium">%</span>
          </div>
          <div className="w-full bg-white/8 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="progress-bar h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-gray-600 mt-2">{progress?.completedSteps ?? 0} of {progress?.totalSteps ?? 4} steps</p>
        </div>

        {/* Steps done */}
        <div className="glass-md rounded-2xl p-5 glow-card card-hover kpi-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Steps Done</span>
          </div>
          <div className="text-[28px] sm:text-3xl font-bold text-white tabular-nums leading-none mt-auto">
            {progress?.completedSteps ?? 0}
            <span className="text-base text-gray-500 font-medium"> / {progress?.totalSteps ?? 4}</span>
          </div>
          <p className="text-[11px] text-gray-600 mt-3">onboarding milestones</p>
        </div>

        {/* Account */}
        <div className="glass-md rounded-2xl p-5 glow-card card-hover kpi-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Account</span>
          </div>
          <div className="text-[14px] font-semibold text-white truncate mt-auto">{client?.email}</div>
          <p className="text-[11px] text-gray-600 mt-3 truncate">{client?.company || 'No company set'}</p>
        </div>
      </div>

      {/* ── Start onboarding CTA ── */}
      {client?.status === 'PENDING' && (
        <div className="relative rounded-2xl p-5 sm:p-6 mb-7 sm:mb-9 overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-500/8 via-purple-500/4 to-transparent">
          <div aria-hidden className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Rocket className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-[14.5px] mb-0.5">Ready to start your onboarding?</h3>
                <p className="text-[12.5px] text-gray-400 leading-relaxed">Complete 4 guided steps to fully activate your account.</p>
              </div>
            </div>
            <button
              id="start-onboarding-btn"
              onClick={handleStartOnboarding}
              disabled={isStarting}
              className="btn-primary w-full sm:w-auto flex-shrink-0 text-sm py-2.5 px-5"
            >
              {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isStarting ? 'Starting…' : 'Start Onboarding'}
            </button>
          </div>
        </div>
      )}

      {/* ── Steps ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14.5px] font-semibold text-white">Onboarding Steps</h2>
          <span className="text-[11px] text-gray-600">{progress?.completedSteps ?? 0}/{progress?.totalSteps ?? 4} complete</span>
        </div>

        <div className="space-y-2.5">
          {progress?.steps.map((step, index) => {
            const Icon = stepIcons[step.stepType] || FileText;
            const isActive = step.status === 'IN_PROGRESS';
            const isCompleted = step.status === 'COMPLETED';
            const isPending = step.status === 'PENDING';

            return (
              <div
                key={step.id}
                className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
                  isActive   ? 'bg-indigo-500/5 border-indigo-500/25 shadow-lg shadow-indigo-500/5'
                  : isCompleted ? 'bg-green-500/3 border-green-500/15'
                  : 'glass border-white/6 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Icon box */}
                  <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-green-500/15 border border-green-500/25'
                    : isActive  ? 'bg-indigo-500/20 border border-indigo-500/35'
                    : 'bg-white/5 border border-white/10'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : isActive ? (
                      <>
                        <Icon className="w-5 h-5 text-indigo-400" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse border-2 border-[#0a0914]" />
                      </>
                    ) : (
                      <span className="text-[13px] font-bold text-gray-500">{index + 1}</span>
                    )}
                  </div>

                  {/* Text — min-w-0 prevents overflow */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`font-semibold text-[13.5px] truncate max-w-full ${
                        isCompleted ? 'text-green-300' : isActive ? 'text-white' : 'text-gray-300'
                      }`}>
                        {step.title}
                      </span>
                      <span className={statusBadge[step.status]} style={{ flexShrink: 0 }}>
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{step.description}</p>
                    {step.completedAt && (
                      <p className="text-[11px] text-gray-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        Completed {new Date(step.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {(isActive || isPending) && client?.status !== 'PENDING' && (
                    <Link
                      href={`/dashboard/onboarding?step=${step.stepNumber}`}
                      id={`step-${step.stepNumber}-action`}
                      className={`flex-shrink-0 flex items-center gap-1.5 text-[12.5px] font-medium px-3.5 py-2 rounded-xl transition-all ${
                        isActive ? 'btn-primary' : 'btn-ghost'
                      }`}
                    >
                      <span className="hidden xs:inline">{isActive ? 'Continue' : 'Start'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Completion ── */}
      {progress?.isComplete && (
        <div className="mt-7 relative rounded-2xl p-7 sm:p-10 border border-green-500/20 bg-gradient-to-br from-green-500/8 via-emerald-500/4 to-transparent text-center overflow-hidden">
          <div aria-hidden className="absolute -top-14 left-1/2 -translate-x-1/2 w-44 h-44 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
          <CheckCircle2 className="w-11 h-11 text-green-400 mx-auto mb-3 drop-shadow-lg" />
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Onboarding Complete! 🎉</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">All steps completed. Your account is fully activated.</p>
        </div>
      )}
    </div>
  );
}
