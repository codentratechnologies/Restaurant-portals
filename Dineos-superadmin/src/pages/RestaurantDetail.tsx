import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import toast from 'react-hot-toast';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, FileText,
  MapPin, Phone, Mail, Calendar, Store, AlertCircle
} from 'lucide-react';

interface DocData {
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  rejectReason?: string;
}

interface RestaurantData {
  restaurant_name?: string;
  email?: string;
  role?: string;
  restaurant_details?: {
    status?: string;
    businessDetails?: {
      restaurantName?: string;
      gstVatNumber?: string;
      dateOfEstablishment?: string;
      address?: { street?: string; city?: string; state?: string; pin?: string; country?: string };
    };
    contactInfo?: {
      primaryName?: string;
      primaryEmail?: string;
      primaryPhone?: string;
      secondaryDetails?: string;
    };
    operationalDetails?: {
      openingTime?: string;
      closingTime?: string;
      operatingDays?: string[];
      logoUrl?: string;
    };
    legal_documents?: Record<string, DocData>;
  };
}

const DOC_LABELS: Record<string, string> = {
  businessRegistration: 'Business Registration',
  taxRegistration: 'Tax Registration',
  foodSafety: 'Food Safety License',
  authIdProof: 'Authorized ID Proof',
  liquorLicense: 'Liquor License',
};

export default function RestaurantDetail() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);

  // Per-doc reject reason state
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = onValue(ref(rtdb, `admin_users/${uid}`), (snap) => {
      setData(snap.val());
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  const updateDocStatus = async (docKey: string, status: 'Approved' | 'Rejected') => {
    if (!uid) return;
    if (status === 'Rejected' && !rejectReasons[docKey]?.trim()) {
      toast.error('Please enter a rejection reason before rejecting.');
      return;
    }
    setActionLoading(`${docKey}-${status}`);
    try {
      const updates: Record<string, any> = {
        [`admin_users/${uid}/restaurant_details/legal_documents/${docKey}/status`]: status,
      };
      if (status === 'Rejected') {
        updates[`admin_users/${uid}/restaurant_details/legal_documents/${docKey}/rejectReason`] = rejectReasons[docKey];
      } else {
        updates[`admin_users/${uid}/restaurant_details/legal_documents/${docKey}/rejectReason`] = null;
      }
      await update(ref(rtdb), updates);
      toast.success(`Document ${status === 'Approved' ? 'approved' : 'rejected'} successfully.`);
    } catch (e) {
      toast.error('Failed to update document status.');
    } finally {
      setActionLoading(null);
    }
  };

  const updateOverallStatus = async (status: 'Approved' | 'Rejected') => {
    if (!uid) return;
    setActionLoading(`overall-${status}`);
    try {
      await update(ref(rtdb, `admin_users/${uid}/restaurant_details`), { status });
      if (status === 'Approved') {
        await update(ref(rtdb, `admin_users/${uid}`), { isOnboardingComplete: true });
      }
      toast.success(`Restaurant ${status === 'Approved' ? 'approved and activated!' : 'rejected.'}`);
    } catch (e) {
      toast.error('Failed to update restaurant status.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Restaurant not found.</p>
      </div>
    );
  }

  const rd = data.restaurant_details;
  const bd = rd?.businessDetails;
  const ci = rd?.contactInfo;
  const od = rd?.operationalDetails;
  const docs = rd?.legal_documents || {};
  const overallStatus = rd?.status || 'In Review';

  const allDocsApproved = Object.keys(DOC_LABELS).every(k => !docs[k] || docs[k].status === 'Approved');

  return (
    <div className="fade-in max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Restaurants
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-soft border border-border p-6 mb-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange-50 border border-brand-orange-100 flex items-center justify-center text-2xl font-black text-brand-orange-600 shrink-0">
          {(bd?.restaurantName || data.restaurant_name || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{bd?.restaurantName || data.restaurant_name || 'Unnamed Restaurant'}</h1>
          <p className="text-sm text-gray-500">{ci?.primaryEmail || data.email}</p>
          <p className="text-sm text-gray-400">{[bd?.address?.city, bd?.address?.state, bd?.address?.country].filter(Boolean).join(', ')}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {overallStatus === 'Approved'  && <span className="status-badge-approved"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>}
          {overallStatus === 'In Review' && <span className="status-badge-review"><Clock className="w-3.5 h-3.5" /> In Review</span>}
          {overallStatus === 'Rejected'  && <span className="status-badge-rejected"><XCircle className="w-3.5 h-3.5" /> Rejected</span>}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        {/* Business Info */}
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 border border-border p-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><Store className="w-4 h-4 text-brand-orange-500" /> Business Info</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2"><dt className="text-gray-400 w-28 shrink-0">GST/VAT No.</dt><dd className="text-gray-700 font-medium">{bd?.gstVatNumber || '—'}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-400 w-28 shrink-0">Est. Date</dt><dd className="text-gray-700 font-medium">{bd?.dateOfEstablishment || '—'}</dd></div>
          </dl>
        </div>
        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 border border-border p-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><Mail className="w-4 h-4 text-brand-orange-500" /> Contact</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-700">{ci?.primaryEmail || '—'}</span></div>
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-700">{ci?.primaryPhone || '—'}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-700">{[bd?.address?.street, bd?.address?.city, bd?.address?.pin].filter(Boolean).join(', ') || '—'}</span></div>
          </dl>
        </div>
        {/* Operations */}
        <div className="bg-white rounded-2xl shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 border border-border p-6">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><Calendar className="w-4 h-4 text-brand-orange-500" /> Operations</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2"><dt className="text-gray-400 w-24 shrink-0">Hours</dt><dd className="text-gray-700 font-medium">{od?.openingTime} – {od?.closingTime}</dd></div>
            <div className="flex gap-2 items-start"><dt className="text-gray-400 w-24 shrink-0 mt-0.5">Days</dt><dd className="text-gray-700 font-medium">{od?.operatingDays?.join(', ') || '—'}</dd></div>
          </dl>
        </div>
        {/* Logo */}
        {od?.logoUrl && (
          <div className="bg-white rounded-2xl shadow-soft border border-border p-6 flex items-center justify-center">
            <img src={od.logoUrl} alt="Restaurant Logo" className="max-h-24 object-contain rounded-xl" />
          </div>
        )}
      </div>

      {/* Document Review */}
      <div className="bg-white rounded-2xl shadow-soft border border-border overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-orange-500" />
          <h2 className="font-semibold text-gray-900">Document Verification</h2>
        </div>
        <div className="divide-y divide-border">
          {Object.entries(DOC_LABELS).map(([key, label]) => {
            const doc = docs[key];
            if (!doc) return null;

            const isApproved = doc.status === 'Approved';
            const isRejected = doc.status === 'Rejected';
            const isPending  = doc.status === 'In Review';

            return (
              <div key={key} className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Doc info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{label}</h4>
                      {isApproved && <span className="status-badge-approved"><CheckCircle className="w-3 h-3" /> Approved</span>}
                      {isPending  && <span className="status-badge-review"><Clock className="w-3 h-3" /> In Review</span>}
                      {isRejected && <span className="status-badge-rejected"><XCircle className="w-3 h-3" /> Rejected</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-orange-600 font-medium hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Document
                    </a>
                    {isRejected && doc.rejectReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <strong>Reject Reason:</strong> {doc.rejectReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isApproved && (
                    <div className="flex flex-col gap-2 sm:items-end sm:min-w-[240px]">
                      <input
                        type="text"
                        placeholder="Rejection reason (required if rejecting)…"
                        value={rejectReasons[key] || ''}
                        onChange={e => setRejectReasons(p => ({ ...p, [key]: e.target.value }))}
                        className="input-field text-xs py-2"
                      />
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => updateDocStatus(key, 'Rejected')}
                          disabled={actionLoading === `${key}-Rejected`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {actionLoading === `${key}-Rejected` ? 'Rejecting…' : 'Reject'}
                        </button>
                        <button
                          onClick={() => updateDocStatus(key, 'Approved')}
                          disabled={actionLoading === `${key}-Approved`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-60"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {actionLoading === `${key}-Approved` ? 'Approving…' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Decision */}
      {overallStatus === 'In Review' && (
        <div className="bg-white rounded-2xl shadow-soft border border-border p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Final Decision</h2>
          <p className="text-sm text-gray-500 mb-5">
            {allDocsApproved
              ? 'All documents are approved. You can now fully activate this restaurant.'
              : 'Review all individual documents above before making a final decision.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => updateOverallStatus('Rejected')}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
            >
              <XCircle className="w-4 h-4" />
              {actionLoading === 'overall-Rejected' ? 'Rejecting…' : 'Reject Restaurant'}
            </button>
            <button
              onClick={() => updateOverallStatus('Approved')}
              disabled={!!actionLoading || !allDocsApproved}
              title={!allDocsApproved ? 'Approve all individual documents first' : ''}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading === 'overall-Approved' ? 'Approving…' : 'Approve & Activate Restaurant'}
            </button>
          </div>
        </div>
      )}

      {overallStatus === 'Approved' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">This restaurant has been approved and is fully active.</p>
        </div>
      )}

      {overallStatus === 'Rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="font-semibold text-red-800">This restaurant application was rejected.</p>
        </div>
      )}
    </div>
  );
}
