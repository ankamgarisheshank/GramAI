import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useOfficerApplication, 
  useStartReview, 
  useVerifyDocument, 
  useApproveApplication, 
  useRejectApplication,
  type OfficerDocumentItem
} from '../../hooks/useOfficerApplications';
import { OfficerAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { useToast } from '../../components/ui/Toast';
import { 
  ArrowLeft, CheckCircle2, XCircle, Clock, FileText, Eye, Download, 
  ShieldCheck, AlertTriangle, User, MapPin, Calendar, Check, ExternalLink,
  Info, AlertCircle
} from 'lucide-react';

export const OfficerApplicationReview: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: application, isLoading, isError, refetch } = useOfficerApplication(applicationId || '');

  const startReviewMutation = useStartReview();
  const verifyDocMutation = useVerifyDocument();
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  // Document verification modal state
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<OfficerDocumentItem | null>(null);
  const [docAction, setDocAction] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [docRemarks, setDocRemarks] = useState('');

  // Document preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<OfficerDocumentItem | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Approval confirmation modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/admin/pending')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Queue
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied or Not Found</AlertTitle>
          <AlertDescription>
            Could not load application details. Either the application does not exist, or it is outside your authorized jurisdiction.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isSubmitted = application.status === 'SUBMITTED';
  const isUnderReview = application.status === 'UNDER_REVIEW';
  const isApproved = application.status === 'APPROVED';
  const isRejected = application.status === 'REJECTED';

  // Handle Document View
  const handleViewDocument = async (doc: OfficerDocumentItem) => {
    setPreviewDoc(doc);
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      const res = await OfficerAPI.getDocumentBlob(doc.id);
      const blob = new Blob([res.data], { type: doc.content_type });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err: any) {
      toast({
        title: 'Error Loading Document',
        description: err.response?.data?.message || 'Could not load document preview.',
        type: 'error'
      });
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Close preview modal
  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewDoc(null);
  };

  // Handle Document Verification Save
  const handleOpenDocModal = (doc: OfficerDocumentItem, action: 'VERIFIED' | 'REJECTED') => {
    setActiveDoc(doc);
    setDocAction(action);
    setDocRemarks(doc.officer_remarks || (action === 'VERIFIED' ? 'Document details verified and legible.' : ''));
    setDocModalOpen(true);
  };

  const handleSaveDocVerification = () => {
    if (!activeDoc) return;
    if (docAction === 'REJECTED' && !docRemarks.trim()) {
      toast({ title: 'Remarks Required', description: 'Please provide a reason for rejecting the document.', type: 'error' });
      return;
    }

    verifyDocMutation.mutate({
      documentId: activeDoc.id,
      data: {
        verification_status: docAction,
        officer_remarks: docRemarks.trim() || undefined,
      }
    }, {
      onSuccess: () => {
        toast({ 
          title: 'Document Updated', 
          description: `Document marked as ${docAction}.`,
          type: 'success'
        });
        setDocModalOpen(false);
        refetch();
      },
      onError: (err: any) => {
        toast({
          title: 'Verification Failed',
          description: err.response?.data?.message || 'Could not update document verification.',
          type: 'error'
        });
      }
    });
  };

  // Handle Start Review
  const handleStartReview = () => {
    startReviewMutation.mutate(application.id, {
      onSuccess: () => {
        toast({ title: 'Review Started', description: 'Application status changed to Under Review.', type: 'success' });
        refetch();
      },
      onError: (err: any) => {
        toast({ title: 'Error', description: err.response?.data?.message || 'Failed to start review.', type: 'error' });
      }
    });
  };

  // Handle Approve
  const handleConfirmApproval = () => {
    approveMutation.mutate({
      applicationId: application.id,
      officer_remarks: approvalRemarks.trim() || undefined
    }, {
      onSuccess: () => {
        toast({ title: 'Application Approved!', description: 'The citizen application has been approved.', type: 'success' });
        setApproveModalOpen(false);
        refetch();
      },
      onError: (err: any) => {
        toast({
          title: 'Approval Rejected',
          description: err.response?.data?.message || 'Cannot approve application. Verify required documents first.',
          type: 'error'
        });
      }
    });
  };

  // Handle Reject
  const handleConfirmRejection = () => {
    if (!rejectionRemarks.trim()) {
      toast({ title: 'Remarks Required', description: 'Rejection reason cannot be blank.', type: 'error' });
      return;
    }

    rejectMutation.mutate({
      applicationId: application.id,
      officer_remarks: rejectionRemarks.trim()
    }, {
      onSuccess: () => {
        toast({ title: 'Application Rejected', description: 'The citizen application has been rejected.', type: 'success' });
        setRejectModalOpen(false);
        refetch();
      },
      onError: (err: any) => {
        toast({
          title: 'Rejection Failed',
          description: err.response?.data?.message || 'Cannot reject application.',
          type: 'error'
        });
      }
    });
  };

  // Check required document status summary
  const allRequiredVerified = application.documents.length > 0 &&
    application.documents.every(d => d.verification_status === 'VERIFIED');
  const hasRejectedDocs = application.documents.some(d => d.verification_status === 'REJECTED');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-16">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/pending')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Queue
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">Status:</span>
          {application.status === 'APPROVED' && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm px-3 py-1">
              APPROVED
            </Badge>
          )}
          {application.status === 'REJECTED' && (
            <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-sm px-3 py-1">
              REJECTED
            </Badge>
          )}
          {application.status === 'UNDER_REVIEW' && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm px-3 py-1">
              UNDER REVIEW
            </Badge>
          )}
          {application.status === 'SUBMITTED' && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-sm px-3 py-1">
              SUBMITTED
            </Badge>
          )}
        </div>
      </div>

      {/* Decision Status Banners */}
      {isApproved && (
        <Alert className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <AlertTitle className="font-semibold text-emerald-400">Application Approved</AlertTitle>
          <AlertDescription className="text-sm mt-1 text-emerald-300">
            Approved on {application.decision_at ? new Date(application.decision_at).toLocaleString() : 'N/A'}.
            {application.officer_remarks && <div className="mt-2 font-mono text-xs bg-slate-900/60 p-2.5 rounded border border-emerald-500/20">Officer Remarks: {application.officer_remarks}</div>}
          </AlertDescription>
        </Alert>
      )}

      {isRejected && (
        <Alert variant="destructive">
          <XCircle className="h-5 w-5 text-rose-400" />
          <AlertTitle className="font-semibold text-rose-300">Application Rejected</AlertTitle>
          <AlertDescription className="text-sm mt-1 text-rose-200">
            Rejected on {application.decision_at ? new Date(application.decision_at).toLocaleString() : 'N/A'}.
            {application.officer_remarks && <div className="mt-2 font-mono text-xs bg-slate-900/60 p-2.5 rounded border border-rose-500/20">Rejection Reason: {application.officer_remarks}</div>}
          </AlertDescription>
        </Alert>
      )}

      {/* Header Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
            <div>
              <span className="text-xs font-mono uppercase text-muted-foreground">Government Application</span>
              <h1 className="text-3xl font-bold font-mono text-foreground mt-1">{application.application_id}</h1>
              <p className="text-lg font-medium text-primary mt-1">{application.scheme.name}</p>
            </div>
            
            {/* Review Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {isSubmitted && (
                <Button 
                  onClick={handleStartReview} 
                  disabled={startReviewMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-md"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {startReviewMutation.isPending ? 'Starting Review...' : 'Start Review'}
                </Button>
              )}

              {isUnderReview && (
                <>
                  <Button 
                    variant="destructive"
                    onClick={() => { setRejectionRemarks(''); setRejectModalOpen(true); }}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Application
                  </Button>
                  <Button 
                    onClick={() => { setApprovalRemarks(''); setApproveModalOpen(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Application
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Quick Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Applicant
              </span>
              <p className="font-medium text-foreground">{application.applicant_name}</p>
              <p className="text-xs text-muted-foreground">{application.applicant_phone || application.applicant_email || '-'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Jurisdiction
              </span>
              <p className="font-medium text-foreground">{application.village_name || application.mandal_name || 'Telangana'}</p>
              <p className="text-xs text-muted-foreground">
                {[application.mandal_name, application.district_name].filter(Boolean).join(', ') || '-'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Submitted Date
              </span>
              <p className="font-medium text-foreground">
                {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Draft'}
              </p>
              <p className="text-xs text-muted-foreground">
                {application.submitted_at ? new Date(application.submitted_at).toLocaleTimeString() : '-'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Reviewed / Decided
              </span>
              <p className="font-medium text-foreground">
                {application.decision_at 
                  ? new Date(application.decision_at).toLocaleDateString() 
                  : (application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : 'Awaiting Review')}
              </p>
              <p className="text-xs text-muted-foreground">
                {application.decision_at ? 'Final Decision' : (application.reviewed_at ? 'Under Inspection' : '-')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Details + Documents */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form Data & Eligibility */}
        <div className="md:col-span-2 space-y-6">
          {/* Eligibility Snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> System Eligibility Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg border bg-muted/40 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Criteria Match:</span>
                  <span className={`font-semibold ${application.eligibility_result?.eligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {application.eligibility_result?.eligible ? 'ELIGIBLE (Meets criteria)' : 'REQUIRES VERIFICATION'}
                  </span>
                </div>
                {application.eligibility_result?.reasons && application.eligibility_result.reasons.length > 0 && (
                  <div className="pt-2 border-t text-xs space-y-1">
                    <span className="text-muted-foreground font-medium">Evaluation Factors:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                      {application.eligibility_result.reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Data Snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Application Form Details
              </CardTitle>
              <CardDescription>Submitted form values provided by citizen</CardDescription>
            </CardHeader>
            <CardContent>
              {application.form_data && Object.keys(application.form_data).length > 0 ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(application.form_data).map(([key, value]) => (
                    <div key={key} className="p-2.5 rounded bg-muted/30 border border-border/40">
                      <span className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                      <p className="font-medium text-foreground mt-0.5">{String(value || '-')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specific form fields provided.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Documents & Verification */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Uploaded Documents
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {application.documents.length} Uploaded
                </Badge>
              </div>
              <CardDescription>Inspect documents and verify each requirement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-6">
                  No documents have been uploaded for this application.
                </p>
              ) : (
                application.documents.map((doc) => {
                  const isVerified = doc.verification_status === 'VERIFIED';
                  const isRejectedDoc = doc.verification_status === 'REJECTED';

                  return (
                    <div 
                      key={doc.id} 
                      className={`p-3.5 rounded-lg border transition-all ${
                        isVerified 
                          ? 'border-emerald-500/30 bg-emerald-500/5' 
                          : isRejectedDoc 
                            ? 'border-rose-500/30 bg-rose-500/5' 
                            : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-medium text-sm text-foreground">{doc.document_type}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{doc.original_filename}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {(doc.file_size / 1024).toFixed(0)} KB • {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            isVerified 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                              : isRejectedDoc 
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {doc.verification_status}
                        </Badge>
                      </div>

                      {doc.officer_remarks && (
                        <div className="mt-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border/40">
                          <span className="font-semibold text-foreground/80">Officer Remarks:</span> {doc.officer_remarks}
                        </div>
                      )}

                      {/* Document Actions */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/40">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs flex-1 gap-1"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>

                        {!isApproved && !isRejected && (
                          <>
                            <Button 
                              size="sm" 
                              variant={isVerified ? 'default' : 'outline'}
                              className={`h-7 text-xs gap-1 ${isVerified ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-500 hover:text-emerald-600'}`}
                              onClick={() => handleOpenDocModal(doc, 'VERIFIED')}
                            >
                              <Check className="h-3.5 w-3.5" /> Verify
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className={`h-7 text-xs gap-1 ${isRejectedDoc ? 'bg-rose-600 text-white' : 'text-rose-500 hover:text-rose-600'}`}
                              onClick={() => handleOpenDocModal(doc, 'REJECTED')}
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Document Verification / Rejection Dialog */}
      <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {docAction === 'VERIFIED' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-rose-500" />}
            {docAction === 'VERIFIED' ? 'Mark Document as Verified' : 'Reject Document'}
          </DialogTitle>
          <DialogDescription>
            {activeDoc && `${activeDoc.document_type} (${activeDoc.original_filename})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Officer Remarks {docAction === 'REJECTED' && <span className="text-rose-500">*</span>}
            </label>
            <Textarea 
              placeholder={docAction === 'VERIFIED' ? 'e.g. Details verified against government portal.' : 'Reason for rejection (e.g. illegible certificate, expired)...'}
              value={docRemarks}
              onChange={(e) => setDocRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDocModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveDocVerification} 
            disabled={verifyDocMutation.isPending}
            className={docAction === 'VERIFIED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
          >
            {verifyDocMutation.isPending ? 'Saving...' : `Confirm ${docAction}`}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" /> Confirm Scheme Approval
          </DialogTitle>
          <DialogDescription>
            You are approving application <span className="font-mono font-bold">{application.application_id}</span> for <span className="font-medium text-foreground">{application.applicant_name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
            <div className="flex justify-between items-center font-medium">
              <span>Required Documents:</span>
              <span className="text-emerald-400">All Verified ({application.documents.filter(d => d.verification_status === 'VERIFIED').length}/{application.documents.length})</span>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span>Eligibility:</span>
              <span className="text-emerald-400">Verified by Officer</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Approval Remarks (Optional)</label>
            <Textarea 
              placeholder="e.g. Application satisfies all scheme eligibility guidelines."
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmApproval} 
            disabled={approveMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="h-6 w-6 text-rose-500" /> Reject Application
          </DialogTitle>
          <DialogDescription>
            Please provide a mandatory, clear reason for rejecting application <span className="font-mono font-bold">{application.application_id}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <Textarea 
              placeholder="e.g. Landholding documentation does not meet scheme threshold."
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              rows={3}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmRejection} 
            disabled={rejectMutation.isPending || !rejectionRemarks.trim()}
            variant="destructive"
          >
            {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Authenticated Document Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span>{previewDoc?.document_type || 'Document Preview'}</span>
          </DialogTitle>
          <DialogDescription>
            {previewDoc?.original_filename}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 min-h-[400px] flex items-center justify-center border rounded-lg bg-slate-950 overflow-hidden">
          {previewLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
              <Clock className="h-8 w-8 animate-spin" />
              <span>Fetching secure file from server...</span>
            </div>
          ) : previewUrl ? (
            previewDoc?.content_type.startsWith('image/') ? (
              <img 
                src={previewUrl} 
                alt="Document preview" 
                className="max-h-[500px] w-auto object-contain rounded" 
              />
            ) : (
              <iframe 
                src={previewUrl} 
                title="Document PDF preview" 
                className="w-full h-[500px] rounded border-0" 
              />
            )
          ) : (
            <p className="text-sm text-rose-400">Failed to render preview.</p>
          )}
        </div>

        <DialogFooter>
          {previewUrl && (
            <a 
              href={previewUrl} 
              download={previewDoc?.original_filename || 'document'} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80"
            >
              <Download className="h-4 w-4" /> Download File
            </a>
          )}
          <Button variant="outline" onClick={handleClosePreview}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
