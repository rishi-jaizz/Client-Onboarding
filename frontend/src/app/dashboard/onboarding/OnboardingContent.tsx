'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { onboardingAPI, documentAPI, profileAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle2, FileText, Shield, Settings, ClipboardCheck, Upload, Loader2, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface Step {
  id: string;
  stepNumber: number;
  stepType: string;
  title: string;
  description: string;
  status: string;
}

const DOCUMENT_TYPES = [
  { value: 'ID_CARD', label: 'ID Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'BUSINESS_REGISTRATION', label: 'Business Registration' },
  { value: 'TAX_DOCUMENT', label: 'Tax Document' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement' },
  { value: 'OTHER', label: 'Other' },
];

const stepIcons: Record<string, React.ElementType> = {
  DOCUMENT_UPLOAD: FileText,
  IDENTITY_VERIFICATION: Shield,
  BUSINESS_SETUP: Settings,
  REVIEW_AND_CONFIRM: ClipboardCheck,
};

export default function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepNum, setCurrentStepNum] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('ID_CARD');
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string; type: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [businessForm, setBusinessForm] = useState({
    businessType: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    annualRevenue: '',
    employeeCount: '',
    bio: '',
  });

  const fetchSteps = useCallback(async () => {
    try {
      const res = await onboardingAPI.getSteps();
      setSteps(res.data.data.steps);
      const paramStep = parseInt(searchParams.get('step') || '1');
      setCurrentStepNum(paramStep);
    } catch {
      toast.error('Failed to load steps');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  const currentStep = steps.find(s => s.stepNumber === currentStepNum);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB allowed.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      await documentAPI.uploadDocument(selectedFile, documentType);
      setUploadedDocs(prev => [...prev, { name: selectedFile.name, type: documentType }]);
      setSelectedFile(null);
      toast.success('Document uploaded successfully!');
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setIsSaving(false);
    }
  };

  const completeCurrentStep = async () => {
    setIsSaving(true);
    try {
      if (currentStepNum === 3 && businessForm.businessType) {
        await profileAPI.updateProfile(businessForm);
      }
      await onboardingAPI.completeStep(currentStepNum);
      await fetchSteps();
      if (currentStepNum < 4) {
        setCurrentStepNum(currentStepNum + 1);
        router.push(`/dashboard/onboarding?step=${currentStepNum + 1}`);
        toast.success(`Step ${currentStepNum} completed!`);
      } else {
        toast.success('🎉 Onboarding complete! Welcome aboard!');
        router.push('/dashboard');
      }
    } catch {
      toast.error('Failed to complete step');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Onboarding Workflow</h1>
        <p className="text-gray-400 text-sm">Complete each step to fully activate your account</p>
      </div>

      {/* Steps progress bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {steps.map((step, i) => {
          const Icon = stepIcons[step.stepType] || FileText;
          const isActive = step.stepNumber === currentStepNum;
          const isCompleted = step.status === 'COMPLETED';
          return (
            <div key={step.id} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  if (isCompleted || isActive) {
                    setCurrentStepNum(step.stepNumber);
                    router.push(`/dashboard/onboarding?step=${step.stepNumber}`);
                  }
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive ? 'bg-indigo-600 text-white' :
                  isCompleted ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                  'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.stepNumber}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-4 sm:w-6 h-0.5 rounded-full flex-shrink-0 ${isCompleted ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </div>

      {currentStep && (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                {(() => { const Icon = stepIcons[currentStep.stepType] || FileText; return <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />; })()}
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm sm:text-base">Step {currentStepNum}: {currentStep.title}</h2>
                <p className="text-xs sm:text-sm text-gray-400">{currentStep.description}</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Step 1: Document Upload */}
            {currentStepNum === 1 && (
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="doc-type">Document Type</label>
                  <select id="doc-type" value={documentType} onChange={e => setDocumentType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm">
                    {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>)}
                  </select>
                </div>
                <div
                  id="doc-upload-area"
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('doc-file-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-indigo-500/50'}`}
                >
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1 text-sm sm:text-base">{selectedFile ? selectedFile.name : 'Drop file here or click to browse'}</p>
                  <p className="text-xs text-gray-500">PDF, JPEG, PNG, WebP up to 10MB</p>
                  <input id="doc-file-input" type="file" className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                </div>
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <span className="text-sm text-indigo-300 truncate mr-2">{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white flex-shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                )}
                {selectedFile && (
                  <button id="upload-doc-btn" onClick={uploadDocument} disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-medium text-white transition-all text-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isSaving ? 'Uploading...' : 'Upload Document'}
                  </button>
                )}
                {uploadedDocs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">Uploaded documents:</p>
                    <div className="space-y-2">
                      {uploadedDocs.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{doc.name} ({doc.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Identity Verification */}
            {currentStepNum === 2 && (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Identity Verification</h3>
                  <p className="text-sm text-gray-400">Our team will review your uploaded documents. This typically takes 1-2 business days.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Documents submitted', done: true },
                    { label: 'Identity confirmed', done: false },
                    { label: 'Background check complete', done: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-3 glass rounded-xl border border-white/10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500/20' : 'bg-white/5'}`}>
                        {item.done ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                      </div>
                      <span className={`text-sm ${item.done ? 'text-green-300' : 'text-gray-400'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Business Setup */}
            {currentStepNum === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-type">Business Type *</label>
                    <select id="biz-type" value={businessForm.businessType} onChange={e => setBusinessForm(p => ({ ...p, businessType: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm">
                      <option value="" className="bg-gray-900">Select type</option>
                      {['Sole Proprietor', 'LLC', 'Corp', 'Partnership', 'Non-Profit', 'Other'].map(t => (
                        <option key={t} value={t} className="bg-gray-900">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-revenue">Annual Revenue</label>
                    <select id="biz-revenue" value={businessForm.annualRevenue} onChange={e => setBusinessForm(p => ({ ...p, annualRevenue: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm">
                      <option value="" className="bg-gray-900">Select range</option>
                      {['<100K', '100K-500K', '500K-1M', '1M-10M', '10M-100M', '>100M'].map(r => (
                        <option key={r} value={r} className="bg-gray-900">{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-website">Website</label>
                  <input id="biz-website" value={businessForm.website} onChange={e => setBusinessForm(p => ({ ...p, website: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                    placeholder="https://yourcompany.com" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-city">City</label>
                    <input id="biz-city" value={businessForm.city} onChange={e => setBusinessForm(p => ({ ...p, city: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                      placeholder="San Francisco" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-state">State</label>
                    <input id="biz-state" value={businessForm.state} onChange={e => setBusinessForm(p => ({ ...p, state: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                      placeholder="CA" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-bio">Business Description</label>
                  <textarea id="biz-bio" value={businessForm.bio} onChange={e => setBusinessForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none text-sm"
                    placeholder="Brief description of your business..." />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStepNum === 4 && (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-green-500/10 border border-green-500/20">
                  <ClipboardCheck className="w-7 h-7 sm:w-8 sm:h-8 text-green-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">Final Review</h3>
                  <p className="text-sm text-gray-400">Review all information. Once confirmed, your account will be fully activated.</p>
                </div>
                <div className="space-y-2">
                  {steps.map(step => (
                    <div key={step.id} className="flex items-center justify-between p-3 glass rounded-xl border border-white/10 gap-2">
                      <span className="text-sm text-gray-300 truncate">{step.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${step.status === 'COMPLETED' ? 'text-green-400 bg-green-400/10' : step.status === 'IN_PROGRESS' ? 'text-indigo-400 bg-indigo-400/10' : 'text-gray-400 bg-gray-400/10'}`}>
                        {step.status === 'COMPLETED' ? '✓ Done' : step.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm text-yellow-300">⚠️ By confirming, you certify that all information provided is accurate and complete.</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
              {currentStepNum > 1 && (
                <button onClick={() => { setCurrentStepNum(currentStepNum - 1); router.push(`/dashboard/onboarding?step=${currentStepNum - 1}`); }}
                  className="flex items-center gap-2 px-4 sm:px-5 py-3 glass border border-white/10 hover:border-white/20 rounded-xl text-gray-300 hover:text-white transition-all text-sm">
                  <ArrowLeft className="w-4 h-4" />Previous
                </button>
              )}
              <button
                id={`complete-step-${currentStepNum}-btn`}
                onClick={completeCurrentStep}
                disabled={isSaving || currentStep.status === 'COMPLETED'}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-500/25 text-sm">
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                ) : currentStep.status === 'COMPLETED' ? (
                  <><CheckCircle2 className="w-4 h-4" />Completed</>
                ) : currentStepNum === 4 ? (
                  <><CheckCircle2 className="w-4 h-4" />Complete Onboarding</>
                ) : (
                  <>Complete &amp; Continue<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
