'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { onboardingAPI } from '@/lib/api';
import { CheckCircle2, Clock, ArrowRight, FileText, Shield, Settings, ClipboardCheck, Loader2, TrendingUp, User } from 'lucide-react';
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

const statusColors: Record<string, string> = {
  COMPLETED: 'text-green-400 bg-green-400/10 border-green-400/20',
  IN_PROGRESS: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  PENDING: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  SKIPPED: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
};

const clientStatusColors: Record<string, string> = {
  PENDING: 'text-gray-400',
  IN_PROGRESS: 'text-indigo-400',
  COMPLETED: 'text-green-400',
  SUSPENDED: 'text-red-400',
};

export default function DashboardPage() {
  const { client, refreshClient } = useAuth();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

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
      toast.success('Onboarding started! Let\'s begin.');
    } catch {
      toast.error('Failed to start onboarding');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className={`text-xs font-medium px-2.5 py-1 rounded-full border ${clientStatusColors[client?.status || 'PENDING']} bg-current/10 border-current/20`}>
            {client?.status?.replace('_', ' ')}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">
          {greeting()}, {client?.firstName}! 👋
        </h1>
        <p className="text-gray-400 mt-1">
          {progress?.isComplete
            ? 'Your onboarding is complete. Welcome aboard!'
            : 'Complete your onboarding to unlock full platform access.'}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{progress?.progress ?? 0}%</div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${progress?.progress ?? 0}%` }}
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Steps Completed</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {progress?.completedSteps ?? 0}
            <span className="text-lg text-gray-400 font-normal"> / {progress?.totalSteps ?? 0}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">onboarding steps</p>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Account</span>
            <User className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-semibold text-white truncate">{client?.email}</div>
          <p className="text-sm text-gray-500 mt-1">{client?.company || 'No company'}</p>
        </div>
      </div>

      {/* Start onboarding CTA */}
      {client?.status === 'PENDING' && (
        <div className="glass rounded-2xl p-6 border border-indigo-500/20 bg-indigo-500/5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-white mb-1">Ready to start onboarding?</h3>
              <p className="text-sm text-gray-400">Complete 4 steps to fully activate your account.</p>
            </div>
            <button
              id="start-onboarding-btn"
              onClick={handleStartOnboarding}
              disabled={isStarting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-500/25"
            >
              {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isStarting ? 'Starting...' : 'Start Now'}
            </button>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Onboarding Steps</h2>
        <div className="space-y-3">
          {progress?.steps.map((step, index) => {
            const Icon = stepIcons[step.stepType] || FileText;
            const isActive = step.status === 'IN_PROGRESS';
            const isCompleted = step.status === 'COMPLETED';

            return (
              <div
                key={step.id}
                className={`glass rounded-2xl p-5 border transition-all duration-300 ${
                  isActive ? 'border-indigo-500/40 bg-indigo-500/5' :
                  isCompleted ? 'border-green-500/20' :
                  'border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Step number / status icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative ${
                    isCompleted ? 'bg-green-500/20 border border-green-500/30' :
                    isActive ? 'bg-indigo-500/20 border border-indigo-500/40' :
                    'bg-white/5 border border-white/10'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : isActive ? (
                      <Icon className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <span className="text-sm font-semibold text-gray-400">{index + 1}</span>
                    )}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`font-semibold text-sm ${isCompleted ? 'text-green-300' : isActive ? 'text-white' : 'text-gray-300'}`}>
                        {step.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[step.status]}`}>
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{step.description}</p>
                    {step.completedAt && (
                      <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Completed {new Date(step.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {(isActive || step.status === 'PENDING') && client?.status !== 'PENDING' && (
                    <Link
                      href={`/dashboard/onboarding?step=${step.stepNumber}`}
                      id={`step-${step.stepNumber}-action`}
                      className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl transition-all ${
                        isActive
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white font-medium'
                          : 'glass border border-white/10 text-gray-400 hover:text-white'
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

      {/* Completed message */}
      {progress?.isComplete && (
        <div className="glass rounded-2xl p-8 border border-green-500/20 bg-green-500/5 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Onboarding Complete! 🎉</h3>
          <p className="text-gray-400">All steps have been completed. Your account is fully activated.</p>
        </div>
      )}
    </div>
  );
}
