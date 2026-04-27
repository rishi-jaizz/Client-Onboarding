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
  id: string;
  stepNumber: number;
  stepType: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completedAt?: string;
}

interface Progress {
  progress: number;
  completedSteps: number;
  totalSteps: number;
  isComplete: boolean;
  clientStatus: string;
  steps: OnboardingStep[];
}

const stepIcons: Record<string, React.ElementType> = {
  DOCUMENT_UPLOAD: FileText,
  IDENTITY_VERIFICATION: Shield,
  BUSINESS_SETUP: Settings,
  REVIEW_AND_CONFIRM: ClipboardCheck,
};

const statusBadge: Record<string, string> = {
  COMPLETED: 'badge badge-green',
  IN_PROGRESS: 'badge badge-indigo',
  PENDING: 'badge badge-gray',
  SKIPPED: 'badge badge-yellow',
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
    } catch {
      toast.error('Failed to load onboarding progress');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    setIsStarting(true);
    try {
      await onboardingAPI.startOnboarding();
      await fetchProgress();
      await refreshClient();
      toast.success("Onboarding started! Let's begin.");
    } catch {
      toast.error('Failed to start onboarding');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-400 mx-auto" />
          <p className="text-sm text-gray-500">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const pct = progress?.progress ?? 0;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-10 max-w-5xl mx-auto w-full">

      {/* ── Page header ── */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-indigo-400/80 uppercase tracking-widest mb-1.5">
              Welcome back
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {greeting()}, <span className="gradient-text">{client?.firstName}</span> 👋
            </h1>
            <p className="text-gray-500 mt-2 text-sm max-w-md">
              {progress?.isComplete
                ? 'Your account is fully activated. Welcome to ClientFlow!'
                : 'Complete your onboarding steps to unlock full platform access.'}
            </p>
          </div>
          {/* Status chip */}
          <div className={`flex-shrink-0 badge mt-1 ${
            client?.status === 'COMPLETED' ? 'badge-green' :
            client?.status === 'IN_PROGRESS' ? 'badge-indigo' :
            'badge-gray'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {client?.status?.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 lg:mb-10">
        {/* Progress card */}
        <div className="glass-md rounded-2xl p-5 glow-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Progress</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1 tabular-nums">{pct}<span className="text-lg text-gray-500 font-medium">%</span></div>
          <div className="w-full bg-white/8 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="progress-bar h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-gray-600 mt-2">{progress?.completedSteps ?? 0} of {progress?.totalSteps ?? 4} steps</p>
        </div>

        {/* Steps card */}
        <div className="glass-md rounded-2xl p-5 glow-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Steps Done</span>
          </div>
          <div className="text-3xl font-bold text-white tabular-nums">
            {progress?.completedSteps ?? 0}
            <span className="text-lg text-gray-500 font-medium"> / {progress?.totalSteps ?? 4}</span>
          </div>
          <p className="text-[11px] text-gray-600 mt-3">onboarding milestones</p>
        </div>

        {/* Account card */}
        <div className="glass-md rounded-2xl p-5 glow-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Account</span>
          </div>
          <div className="text-[15px] font-semibold text-white truncate">{client?.email}</div>
          <p className="text-[11px] text-gray-600 mt-3">{client?.company || 'No company set'}</p>
        </div>
      </div>

      {/* ── Start onboarding CTA ── */}
      {client?.status === 'PENDING' && (
        <div className="relative rounded-2xl p-6 mb-8 lg:mb-10 overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-500/8 via-purple-500/4 to-transparent">
          {/* Glow blob */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Ready to start your onboarding?</h3>
                <p className="text-sm text-gray-400">Complete 4 guided steps to fully activate your account and unlock all features.</p>
              </div>
            </div>
            <button
              id="start-onboarding-btn"
              onClick={handleStartOnboarding}
              disabled={isStarting}
              className="btn-primary w-full sm:w-auto flex-shrink-0"
            >
              {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isStarting ? 'Starting…' : 'Start Onboarding'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step list ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Onboarding Steps</h2>
          <span className="text-[11px] text-gray-500">{progress?.completedSteps ?? 0}/{progress?.totalSteps ?? 4} complete</span>
        </div>

        <div className="space-y-3">
          {progress?.steps.map((step, index) => {
            const Icon = stepIcons[step.stepType] || FileText;
            const isActive = step.status === 'IN_PROGRESS';
            const isCompleted = step.status === 'COMPLETED';
            const isPending = step.status === 'PENDING';

            return (
              <div
                key={step.id}
                className={`relative rounded-2xl p-5 border transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-500/5 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                    : isCompleted
                    ? 'bg-green-500/3 border-green-500/15'
                    : 'glass border-white/6 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Step icon */}
                  <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-500/15 border border-green-500/25'
                      : isActive
                      ? 'bg-indigo-500/20 border border-indigo-500/35'
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
                      <span className="text-sm font-bold text-gray-500">{index + 1}</span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`font-semibold text-[14px] ${
                        isCompleted ? 'text-green-300' :
                        isActive ? 'text-white' :
                        'text-gray-300'
                      }`}>
                        {step.title}
                      </span>
                      <span className={statusBadge[step.status]}>
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed">{step.description}</p>
                    {step.completedAt && (
                      <p className="text-[11px] text-gray-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Completed {new Date(step.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {(isActive || isPending) && client?.status !== 'PENDING' && (
                    <Link
                      href={`/dashboard/onboarding?step=${step.stepNumber}`}
                      id={`step-${step.stepNumber}-action`}
                      className={`flex-shrink-0 flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-xl transition-all ${
                        isActive
                          ? 'btn-primary'
                          : 'btn-ghost'
                      }`}
                    >
                      {isActive ? 'Continue' : 'Start'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Completion banner ── */}
      {progress?.isComplete && (
        <div className="mt-8 relative rounded-2xl p-8 border border-green-500/20 bg-gradient-to-br from-green-500/8 via-emerald-500/4 to-transparent text-center overflow-hidden">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4 drop-shadow-lg" />
          <h3 className="text-xl font-bold text-white mb-2">Onboarding Complete! 🎉</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">All steps completed. Your account is fully activated and ready to use.</p>
        </div>
      )}
    </div>
  );
}
