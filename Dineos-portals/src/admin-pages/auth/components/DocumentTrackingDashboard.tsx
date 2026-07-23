import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, UploadCloud, X } from 'lucide-react';
import Button from '../../../components/common/Button';
import { ref, update } from 'firebase/database';
import { rtdb } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

interface DocData {
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  rejectReason?: string;
}

interface DocumentTrackingDashboardProps {
  serverDocuments: Record<string, DocData> | null;
}

const DOC_LABELS: Record<string, string> = {
  businessRegistration: 'Business Registration',
  taxRegistration: 'Tax Registration',
  foodSafety: 'Food Safety License',
  authIdProof: 'Authorized ID Proof',
  liquorLicense: 'Liquor License'
};

export default function DocumentTrackingDashboard({ serverDocuments }: DocumentTrackingDashboardProps) {
  const { user } = useAuth();
  const [reUploadFiles, setReUploadFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!serverDocuments) {
    return (
      <div className="flex-1 flex items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 max-w-lg w-full text-center flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-brand-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading document status...</p>
        </div>
      </div>
    );
  }

  const hasRejectedDocs = Object.values(serverDocuments).some((doc) => doc?.status === 'Rejected');
  
  // Helper to upload any file to Cloudinary (auto detects image vs document)
  const uploadToCloudinary = async (file: File | null) => {
    if (!file) return null;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary config missing');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Cloudinary upload failed');
    const data = await response.json();
    return data.secure_url;
  };

  const handleResubmit = async () => {
    if (!user) return;
    
    const keysToUpdate = Object.keys(reUploadFiles).filter(k => reUploadFiles[k]);
    if (keysToUpdate.length === 0) {
      toast.error('No new files selected for upload');
      return;
    }

    setSubmitting(true);
    try {
      const updates: any = {};
      
      for (const key of keysToUpdate) {
        const file = reUploadFiles[key]!;
        const url = await uploadToCloudinary(file);
        
        updates[`admin_users/${user.uid}/restaurant_details/legal_documents/${key}`] = {
          fileName: file.name,
          fileUrl: url,
          status: 'In Review',
          uploadedAt: new Date().toISOString()
        };
      }
      
      // Also set the root restaurant status back to In Review so it can be evaluated again
      updates[`admin_users/${user.uid}/restaurant_details/status`] = 'In Review';
      
      await update(ref(rtdb), updates);
      
      setReUploadFiles({});
      toast.success('Documents successfully resubmitted!');
    } catch (error) {
      console.error('Error resubmitting docs:', error);
      toast.error('Failed to resubmit documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReUploadFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${hasRejectedDocs ? 'bg-red-100' : 'bg-orange-100'}`}>
            {hasRejectedDocs ? (
              <AlertCircle className="w-10 h-10 text-red-600" />
            ) : (
              <Clock className="w-10 h-10 text-orange-600" />
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {hasRejectedDocs ? 'Action Required' : 'Under Review'}
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
            {hasRejectedDocs 
              ? 'One or more of your documents were rejected. Please review the reasons below and upload corrected versions.' 
              : 'Your documents are currently under review. The review process will be completed within 48 hours.'}
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(DOC_LABELS).map(([key, label]) => {
            const doc = serverDocuments[key];
            if (!doc) return null; // e.g. Optional liquor license wasn't uploaded

            const isRejected = doc.status === 'Rejected';
            const isApproved = doc.status === 'Approved';
            const isPending = doc.status === 'In Review';
            const pendingNewFile = reUploadFiles[key];

            return (
              <div key={key} className={`p-5 rounded-xl border ${isRejected ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{label}</h4>
                      {isApproved && <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Approved</span>}
                      {isPending && <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> In Review</span>}
                      {isRejected && <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{doc.fileName}</p>
                    
                    {isRejected && doc.rejectReason && (
                      <div className="mt-3 p-3 bg-red-100/50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-800">Reason for rejection:</p>
                        <p className="text-sm text-red-700 mt-0.5">{doc.rejectReason}</p>
                      </div>
                    )}

                    {isRejected && (
                      <div className="mt-4">
                        {pendingNewFile ? (
                          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <UploadCloud className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700 flex-1 truncate">{pendingNewFile.name}</span>
                            <button 
                              onClick={() => setReUploadFiles(p => { const newObj = {...p}; delete newObj[key]; return newObj; })}
                              className="p-1 hover:bg-blue-100 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4 text-blue-500" />
                            </button>
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                            <UploadCloud className="w-4 h-4" />
                            Upload Replacement
                            <input type="file" className="hidden" onChange={(e) => handleFileChange(key, e)} accept=".pdf,image/*" />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasRejectedDocs && Object.keys(reUploadFiles).length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button 
              onClick={handleResubmit} 
              disabled={submitting}
              className="w-full justify-center py-3 bg-brand-navy hover:bg-brand-navy/90 text-white shadow-md"
            >
              {submitting ? 'Resubmitting...' : 'Submit New Documents'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
