'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { onboardingAPI, documentAPI, profileAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  CheckCircle2, FileText, Shield, Settings, ClipboardCheck,
  Upload, Loader2, X, ArrowRight, ArrowLeft
} from 'lucide-react';

interface Step {
  id: string; stepNumber: number; stepType: string;
  title: string; description: string; status: string;
}

const DOCUMENT_TYPES = [
  { value: 'ID_CARD',              label: 'ID Card' },
  { value: 'PASSPORT',             label: 'Passport' },
  { value: 'DRIVING_LICENSE',      label: 'Driving License' },
  { value: 'BUSINESS_REGISTRATION', label: 'Business Registration' },
  { value: 'TAX_DOCUMENT',         label: 'Tax Document' },
  { value: 'BANK_STATEMENT',       label: 'Bank Statement' },
  { value: 'OTHER',                label: 'Other' },
];

const stepIcons: Record<string, React.ElementType> = {
  DOCUMENT_UPLOAD:       FileText,
  IDENTITY_VERIFICATION: Shield,
  BUSINESS_SETUP:        Settings,
  REVIEW_AND_CONFIRM:    ClipboardCheck,
};

const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none input-glow transition-all text-sm";

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
    businessType: '', website: '', address: '', city: '',
    state: '', zipCode: '', annualRevenue: '', employeeCount: '', bio: '',
  });

  const fetchSteps = useCallback(async () => {
    try {
      const res = await onboardingAPI.getSteps();
      setSteps(res.data.data.steps);
      setCurrentStepNum(parseInt(searchParams.get('step') || '1'));
    } catch { toast.error('Failed to load steps'); }
    finally { setIsLoading(false); }
  }, [searchParams]);

  useEffect(() => { fetchSteps(); }, [fetchSteps]);

  const currentStep = steps.find(s => s.stepNumber === currentStepNum);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB.'); return; }
    setSelectedFile(file);
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      await documentAPI.uploadDocument(selectedFile, documentType);
      setUploadedDocs(p => [...p, { name: selectedFile.name, type: documentType }]);
      setSelectedFile(null);
      toast.success('Document uploaded!');
    } catch { toast.error('Failed to upload document'); }
    finally { setIsSaving(false); }
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
        toast.success('🎉 Onboarding complete!');
        router.push('/dashboard');
      }
    } catch { toast.error('Failed to complete step'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      <span className="text-sm text-gray-500">Loading workflow…</span>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-10 max-w-3xl mx-auto w-full">

      {/* Page header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-indigo-400/80 uppercase tracking-widest mb-1.5">Onboarding</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Workflow</h1>
        <p className="text-gray-500 mt-1.5 text-sm">Complete each step to fully activate your account</p>
      </div>

      {/* Step progress timeline */}
      <div className="flex items-center mb-8 gap-0 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const Icon = stepIcons[step.stepType] || FileText;
          const isActive = step.stepNumber === currentStepNum;
          const isCompleted = step.status === 'COMPLETED';
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => {
                  if (isCompleted || isActive) {
                    setCurrentStepNum(step.stepNumber);
                    router.push(`/dashboard/onboarding?step=${step.stepNumber}`);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : isCompleted
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/15 border border-green-500/20'
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-green-500/20' : isActive ? 'bg-indigo-500/20' : 'bg-white/5'
                }`}>
                  {isCompleted
                    ? <CheckCircle2 className="w-3 h-3 text-green-400" />
                    : <Icon className={`w-3 h-3 ${isActive ? 'text-indigo-400' : 'text-gray-600'}`} />
                  }
                </div>
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.stepNumber}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px mx-1 flex-shrink-0 ${isCompleted ? 'step-line-done h-0.5' : 'bg-white/8'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step card */}
      {currentStep && (
        <div className="glass-md rounded-2xl glow-card overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-white/6 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              currentStep.status === 'COMPLETED'
                ? 'bg-green-500/15 border border-green-500/25'
                : 'bg-indigo-500/15 border border-indigo-500/25'
            }`}>
              {(() => {
                const Icon = stepIcons[currentStep.stepType] || FileText;
                return currentStep.status === 'COMPLETED'
                  ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                  : <Icon className="w-5 h-5 text-indigo-400" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-white text-[15px]">Step {currentStepNum}: {currentStep.title}</h2>
                {currentStep.status === 'COMPLETED' && (
                  <span className="badge badge-green text-[10px]">Completed</span>
                )}
              </div>
              <p className="text-[12px] text-gray-500 mt-0.5">{currentStep.description}</p>
            </div>
          </div>

          <div className="p-6">
            {/* ── Step 1: Document Upload ── */}
            {currentStepNum === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="doc-type">
                    Document Type
                  </label>
                  <select id="doc-type" value={documentType} onChange={e => setDocumentType(e.target.value)} className={inputCls}>
                    {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#13112a]">{t.label}</option>)}
                  </select>
                </div>
                <div
                  id="doc-upload-area"
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                  onClick={() => document.getElementById('doc-file-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/12 hover:border-indigo-500/40 hover:bg-indigo-500/4'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-300 mb-1">
                    {selectedFile ? selectedFile.name : 'Drop file here or click to browse'}
                  </p>
                  <p className="text-[11px] text-gray-600">PDF, JPEG, PNG, WebP · Max 10MB</p>
                  <input id="doc-file-input" type="file" className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2.5 p-3 bg-indigo-500/8 border border-indigo-500/20 rounded-xl">
                    <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-[12px] text-indigo-300 truncate flex-1">{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-white flex-shrink-0 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {selectedFile && (
                  <button id="upload-doc-btn" onClick={uploadDocument} disabled={isSaving} className="btn-primary w-full py-2.5 text-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isSaving ? 'Uploading…' : 'Upload Document'}
                  </button>
                )}
                {uploadedDocs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Uploaded this session</p>
                    {uploadedDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2.5 bg-green-500/5 border border-green-500/15 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        <span className="text-[12px] text-green-300 truncate">{doc.name}</span>
                        <span className="text-[11px] text-gray-600 ml-auto flex-shrink-0">{doc.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Identity Verification ── */}
            {currentStepNum === 2 && (
              <div className="space-y-4">
                <div className="rounded-2xl p-5 bg-blue-500/8 border border-blue-500/18">
                  <Shield className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-white mb-1.5">Identity Verification</h3>
                  <p className="text-[13px] text-gray-400 leading-relaxed">
                    Our team will review your uploaded documents within 1–2 business days and confirm your identity.
                  </p>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Documents submitted',       done: true  },
                    { label: 'Identity confirmed',        done: false },
                    { label: 'Background check complete', done: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3.5 p-3.5 glass rounded-xl border border-white/6">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500/20' : 'bg-white/5'}`}>
                        {item.done
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          : <div className="w-2 h-2 rounded-full bg-gray-600" />
                        }
                      </div>
                      <span className={`text-[13px] ${item.done ? 'text-green-300' : 'text-gray-400'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Business Setup ── */}
            {currentStepNum === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="biz-type">Business Type *</label>
                    <select id="biz-type" value={businessForm.businessType}
                      onChange={e => setBusinessForm(p => ({ ...p, businessType: e.target.value }))} className={inputCls}>
                      <option value="" className="bg-[#13112a]">Select type</option>
                      {['Sole Proprietor','LLC','Corp','Partnership','Non-Profit','Other'].map(t => (
                        <option key={t} value={t} className="bg-[#13112a]">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="biz-revenue">Annual Revenue</label>
                    <select id="biz-revenue" value={businessForm.annualRevenue}
                      onChange={e => setBusinessForm(p => ({ ...p, annualRevenue: e.target.value }))} className={inputCls}>
                      <option value="" className="bg-[#13112a]">Select range</option>
                      {['<100K','100K-500K','500K-1M','1M-10M','10M-100M','>100M'].map(r => (
                        <option key={r} value={r} className="bg-[#13112a]">{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="biz-website">Website</label>
                  <input id="biz-website" value={businessForm.website}
                    onChange={e => setBusinessForm(p => ({ ...p, website: e.target.value }))}
                    className={inputCls} placeholder="https://yourcompany.com" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="biz-city">City</label>
                    <input id="biz-city" value={businessForm.city}
                      onChange={e => setBusinessForm(p => ({ ...p, city: e.target.value }))}
                      className={inputCls} placeholder="San Francisco" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="biz-state">State</label>
                    <input id="biz-state" value={businessForm.state}
                      onChange={e => setBusinessForm(p => ({ ...p, state: e.target.value }))}
                      className={inputCls} placeholder="CA" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="biz-bio">Business Description</label>
                  <textarea id="biz-bio" value={businessForm.bio}
                    onChange={e => setBusinessForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                    className={`${inputCls} resize-none`} placeholder="Brief description of your business…" />
                </div>
              </div>
            )}

            {/* ── Step 4: Review ── */}
            {currentStepNum === 4 && (
              <div className="space-y-4">
                <div className="rounded-2xl p-5 bg-green-500/8 border border-green-500/18">
                  <ClipboardCheck className="w-8 h-8 text-green-400 mb-3" />
                  <h3 className="font-semibold text-white mb-1.5">Final Review</h3>
                  <p className="text-[13px] text-gray-400">Review all information. Once confirmed, your account will be fully activated.</p>
                </div>
                <div className="space-y-2">
                  {steps.map(step => (
                    <div key={step.id} className="flex items-center justify-between p-3.5 glass rounded-xl border border-white/6 gap-3">
                      <span className="text-[13px] text-gray-300 truncate">{step.title}</span>
                      <span className={`flex-shrink-0 badge ${
                        step.status === 'COMPLETED' ? 'badge-green' :
                        step.status === 'IN_PROGRESS' ? 'badge-indigo' :
                        'badge-gray'
                      }`}>
                        {step.status === 'COMPLETED' ? '✓ Done' : step.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-yellow-500/8 border border-yellow-500/18">
                  <p className="text-[12.5px] text-yellow-300 leading-relaxed">⚠️ By confirming, you certify that all information provided is accurate and complete.</p>
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex gap-3 mt-7 pt-6 border-t border-white/6">
              {currentStepNum > 1 && (
                <button
                  onClick={() => { setCurrentStepNum(currentStepNum - 1); router.push(`/dashboard/onboarding?step=${currentStepNum - 1}`); }}
                  className="btn-ghost flex items-center gap-2 px-5 py-2.5 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />Previous
                </button>
              )}
              <button
                id={`complete-step-${currentStepNum}-btn`}
                onClick={completeCurrentStep}
                disabled={isSaving || currentStep.status === 'COMPLETED'}
                className="btn-primary flex-1 py-2.5 text-sm"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
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
