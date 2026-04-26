import { Suspense } from 'react';
import OnboardingPageContent from './OnboardingContent';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    }>
      <OnboardingPageContent />
    </Suspense>
  );
}
