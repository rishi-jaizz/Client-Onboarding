'use client';

import { useEffect, useState } from 'react';
import { documentAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FileText, Upload, Trash2, Eye, CheckCircle2, XCircle, Clock, Loader2, X
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

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  APPROVED: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  REJECTED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await documentAPI.uploadDocument(selectedFile, documentType);
      setSelectedFile(null);
      toast.success('Document uploaded successfully!');
      fetchDocuments();
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
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
    } finally {
      setDeletingId(null);
    }
  };

  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'PENDING').length,
    approved: documents.filter(d => d.status === 'APPROVED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Documents</h1>
        <p className="text-gray-400 text-sm">Upload and manage your verification documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Approved', value: stats.approved, color: 'text-green-400' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-2xl p-4 border border-white/10 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-5 border border-white/10">
            <h2 className="font-semibold text-white mb-4">Upload Document</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="doc-type-select">Document Type</label>
              <select
                id="doc-type-select"
                value={documentType}
                onChange={e => setDocumentType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
              >
                {DOCUMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>
                ))}
              </select>
            </div>

            <div
              id="drop-zone"
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-indigo-500/50'
              }`}
            >
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-300 font-medium mb-1">
                {selectedFile ? selectedFile.name : 'Drop or click to upload'}
              </p>
              <p className="text-xs text-gray-500">PDF, JPEG, PNG, WebP up to 10MB</p>
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </div>

            {selectedFile && (
              <>
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-xs text-indigo-300 truncate flex-1">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</span>
                  <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  id="upload-btn"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-all"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Documents list */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Uploaded Documents</h2>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="" className="bg-gray-900">All Status</option>
              <option value="PENDING" className="bg-gray-900">Pending</option>
              <option value="APPROVED" className="bg-gray-900">Approved</option>
              <option value="REJECTED" className="bg-gray-900">Rejected</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : documents.length === 0 ? (
            <div className="glass rounded-2xl p-8 border border-white/10 text-center">
              <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No documents uploaded yet</p>
              <p className="text-xs text-gray-500 mt-1">Upload your first document using the form on the left</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => {
                const status = statusConfig[doc.status];
                const StatusIcon = status.icon;

                return (
                  <div key={doc.id} className="glass rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{doc.originalName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">
                            {DOCUMENT_TYPES.find(t => t.value === doc.documentType)?.label}
                          </span>
                          <span className="text-gray-600">·</span>
                          <span className="text-xs text-gray-500">{formatBytes(doc.fileSize)}</span>
                          <span className="text-gray-600">·</span>
                          <span className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${status.bg}`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                        <span className={`text-xs font-medium ${status.color}`}>{doc.status}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`http://localhost:5000${doc.downloadUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center glass border border-white/10 hover:border-white/20 rounded-lg text-gray-400 hover:text-white transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        {doc.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deletingId === doc.id}
                            className="w-8 h-8 flex items-center justify-center glass border border-white/10 hover:border-red-500/30 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                          >
                            {deletingId === doc.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
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
