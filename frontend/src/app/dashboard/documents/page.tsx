'use client';

import { useEffect, useState } from 'react';
import { documentAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FileText, Upload, Trash2, Eye, CheckCircle2, XCircle, Clock, Loader2, X, FilePlus
} from 'lucide-react';

interface Document {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  documentType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  downloadUrl: string;
  uploadedAt: string;
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

const statusConfig = {
  PENDING:  { icon: Clock,         cls: 'badge badge-yellow',  dot: 'bg-yellow-400' },
  APPROVED: { icon: CheckCircle2,  cls: 'badge badge-green',   dot: 'bg-green-400'  },
  REJECTED: { icon: XCircle,       cls: 'badge badge-red',     dot: 'bg-red-400'    },
} as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5001';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('ID_CARD');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchDocuments = async () => {
    try {
      const res = await documentAPI.getDocuments(statusFilter ? { status: statusFilter } : undefined);
      setDocuments(res.data.data.documents);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [statusFilter]);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB.'); return; }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await documentAPI.uploadDocument(selectedFile, documentType);
      setSelectedFile(null);
      toast.success('Document uploaded!');
      fetchDocuments();
    } catch { toast.error('Failed to upload document'); }
    finally { setIsUploading(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await documentAPI.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to delete document');
    } finally { setDeletingId(null); }
  };

  const stats = {
    total:    documents.length,
    pending:  documents.filter(d => d.status === 'PENDING').length,
    approved: documents.filter(d => d.status === 'APPROVED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-10 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-indigo-400/80 uppercase tracking-widest mb-1.5">Management</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Documents</h1>
        <p className="text-gray-500 mt-1.5 text-sm">Upload and manage your verification documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total',    value: stats.total,    cls: 'text-white',        dot: 'bg-gray-400' },
          { label: 'Pending',  value: stats.pending,  cls: 'text-yellow-300',   dot: 'bg-yellow-400' },
          { label: 'Approved', value: stats.approved, cls: 'text-green-300',    dot: 'bg-green-400' },
          { label: 'Rejected', value: stats.rejected, cls: 'text-red-300',      dot: 'bg-red-400' },
        ].map(s => (
          <div key={s.label} className="glass-md rounded-2xl p-4 glow-card text-center">
            <div className={`text-2xl font-bold ${s.cls} tabular-nums`}>{s.value}</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <span className="text-[11px] text-gray-500 font-medium">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">
        {/* ── Upload panel ── */}
        <div className="lg:col-span-2">
          <div className="glass-md rounded-2xl p-5 glow-card h-fit sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <FilePlus className="w-4 h-4 text-indigo-400" />
              </div>
              <h2 className="font-semibold text-white text-[15px]">Upload Document</h2>
            </div>

            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2" htmlFor="doc-type-select">
                Document Type
              </label>
              <select
                id="doc-type-select"
                value={documentType}
                onChange={e => setDocumentType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none input-glow transition-all text-sm"
              >
                {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#13112a]">{t.label}</option>)}
              </select>
            </div>

            <div
              id="drop-zone"
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-white/12 hover:border-indigo-500/40 hover:bg-indigo-500/4'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-300 font-medium mb-1">
                {selectedFile ? selectedFile.name : 'Drop file or click to browse'}
              </p>
              <p className="text-[11px] text-gray-600">PDF, JPEG, PNG, WebP · Max 10MB</p>
              <input
                id="file-input" type="file" className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </div>

            {selectedFile && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2.5 p-3 bg-indigo-500/8 border border-indigo-500/20 rounded-xl">
                  <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-[12px] text-indigo-300 truncate flex-1">{selectedFile.name}</span>
                  <span className="text-[11px] text-gray-500 flex-shrink-0">{formatBytes(selectedFile.size)}</span>
                  <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  id="upload-btn"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Uploading…' : 'Upload Document'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Documents list ── */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="font-semibold text-white text-[15px]">Uploaded Documents</h2>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-[12px] font-medium focus:outline-none input-glow"
            >
              <option value="" className="bg-[#13112a]">All Status</option>
              <option value="PENDING"  className="bg-[#13112a]">Pending</option>
              <option value="APPROVED" className="bg-[#13112a]">Approved</option>
              <option value="REJECTED" className="bg-[#13112a]">Rejected</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-sm text-gray-600">Loading documents…</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="glass rounded-2xl p-12 glow-card text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium mb-1">No documents yet</p>
              <p className="text-[12px] text-gray-600">Upload your first document using the panel on the left</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {documents.map(doc => {
                const sc = statusConfig[doc.status];
                const StatusIcon = sc.icon;
                return (
                  <div key={doc.id} className="glass rounded-2xl p-4 glow-card group hover:border-white/10 transition-all duration-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/8 border border-indigo-500/15 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4.5 h-4.5 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-semibold text-white truncate">{doc.originalName}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-500">
                            {DOCUMENT_TYPES.find(t => t.value === doc.documentType)?.label}
                          </span>
                          <span className="text-gray-700">·</span>
                          <span className="text-[11px] text-gray-500">{formatBytes(doc.fileSize)}</span>
                          <span className="text-gray-700 hidden sm:inline">·</span>
                          <span className="text-[11px] text-gray-600 hidden sm:inline">
                            {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block flex-shrink-0">
                        <span className={sc.cls}>
                          <StatusIcon className="w-3 h-3" />
                          {doc.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a
                          href={`${API_BASE}${doc.downloadUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center glass border border-white/8 hover:border-indigo-500/30 hover:text-indigo-400 rounded-xl text-gray-500 transition-all"
                          title="View document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        {doc.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deletingId === doc.id}
                            className="w-8 h-8 flex items-center justify-center glass border border-white/8 hover:border-red-500/30 hover:text-red-400 rounded-xl text-gray-500 transition-all"
                            title="Delete document"
                          >
                            {deletingId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Mobile status */}
                    <div className="sm:hidden mt-2.5 ml-[52px]">
                      <span className={sc.cls}>
                        <StatusIcon className="w-3 h-3" />
                        {doc.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
