import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplication, useSubmitApplication, useUpdateApplicationDraft, useApplicationDocuments, useUploadDocument, useDeleteDocument } from '../../hooks/useApplications';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { useToast } from '../../components/ui/Toast';
import { CheckCircle2, ArrowLeft, Upload, Trash2, FileText, AlertCircle, Eye, Check, Clock, Save } from 'lucide-react';
import api from '../../lib/api';
import { trackApplicationSubmitted } from '../../lib/analytics';

export const CitizenApplication = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: application, isLoading, isError, refetch } = useApplication(applicationId || '');
  const { data: documents, isLoading: docsLoading, refetch: refetchDocs } = useApplicationDocuments(applicationId || '');
  
  const updateDraftMutation = useUpdateApplicationDraft();
  const submitMutation = useSubmitApplication();
  const uploadMutation = useUploadDocument();
  const deleteDocMutation = useDeleteDocument();
  
  const [formData, setFormData] = useState<any>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  
  // Basic prefill if form_data is empty
  useEffect(() => {
    if (application && application.form_data && Object.keys(application.form_data).length > 0) {
      setFormData(application.form_data);
    }
  }, [application]);
  
  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }
  
  if (isError || !application) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard/applications')}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load application details.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const isDraft = application.status === 'DRAFT';
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Maximum file size is 10MB', type: 'error' });
        return;
      }
      setSelectedFiles({ ...selectedFiles, [documentType]: file });
    }
  };
  
  const handleUpload = (documentType: string) => {
    const file = selectedFiles[documentType];
    if (!file) {
      toast({ title: 'No File Selected', description: 'Please choose a file first before clicking Upload.', type: 'error' });
      return;
    }
    
    uploadMutation.mutate({ applicationId: application.id, documentType, file }, {
      onSuccess: () => {
        toast({ title: 'Upload Successful', description: `${documentType} has been attached to your application.`, type: 'success' });
        setSelectedFiles(prev => {
          const newState = { ...prev };
          delete newState[documentType];
          return newState;
        });
        refetchDocs();
        refetch();
      },
      onError: (err: any) => {
        toast({ title: 'Upload Failed', description: err.response?.data?.message || err.message || 'Error uploading file. Please ensure file is PDF, PNG, or JPG under 10MB.', type: 'error' });
      }
    });
  };
  
  const handleDeleteDoc = (docId: string) => {
    deleteDocMutation.mutate({ applicationId: application.id, documentId: docId }, {
      onSuccess: () => toast({ title: 'Deleted', description: 'Document removed.' }),
      onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Could not delete.', type: 'error' })
    });
  };
  
  const handleSaveDraft = (silent = false) => {
    if (!application) return;
    updateDraftMutation.mutate(
      { applicationId: application.id, formData },
      {
        onSuccess: () => {
          if (!silent) {
            toast({ title: 'Draft Saved', description: 'Your application details have been saved to the database.', type: 'success' });
          }
        },
        onError: (err: any) => {
          if (!silent) {
            toast({ title: 'Save Failed', description: err.response?.data?.message || 'Could not save draft.', type: 'error' });
          }
        },
      }
    );
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.full_name || !formData.age || !formData.annual_income || !formData.district) {
      toast({ title: 'Validation Error', description: 'Please fill all required form fields.', type: 'error' });
      return;
    }
    
    // Save draft first, then submit
    updateDraftMutation.mutate(
      { applicationId: application.id, formData },
      {
        onSuccess: () => {
          submitMutation.mutate(application.id, {
            onSuccess: () => {
              if (application.scheme_id) {
                trackApplicationSubmitted(String(application.scheme_id), application.application_id);
              }
              toast({ title: 'Application Submitted!', description: 'Your application has been received.', type: 'success' });
            },
            onError: (err: any) => {
              const missing = err.response?.data?.missing_documents;
              if (missing) {
                 toast({ title: 'Missing Documents', description: `Please upload: ${missing.join(', ')}`, type: 'error' });
              } else {
                 toast({ title: 'Error', description: err.response?.data?.message || 'Submission failed.', type: 'error' });
              }
            }
          });
        },
        onError: (err: any) => {
          toast({ title: 'Save Failed', description: err.response?.data?.message || 'Could not save form details before submitting.', type: 'error' });
        }
      }
    );
  };
  
  const requiredDocs = application.scheme?.required_documents 
    ? application.scheme.required_documents.split(',').map((d: string) => d.trim()).filter(Boolean)
    : [];
    
  const getUploadedDoc = (type: string) => {
    if (!documents || !Array.isArray(documents)) return undefined;
    const normType = type.trim().replace(/\.+$/, '').toLowerCase();
    return documents.find((d: any) => {
      const docTypeNorm = (d.document_type || '').trim().replace(/\.+$/, '').toLowerCase();
      return docTypeNorm === normType || docTypeNorm.includes(normType) || normType.includes(docTypeNorm);
    });
  };

  const handleViewDocument = async (docId: string, contentType?: string) => {
    try {
      const res = await api.get(`/applications/${application.id}/documents/${docId}/file`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: contentType || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: any) {
      toast({
        title: 'Error Opening Document',
        description: err.response?.data?.message || 'Could not load document file.',
        type: 'error'
      });
    }
  };

  const renderStatusTimeline = () => {
    const statuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'];
    let currentIndex = statuses.indexOf(application.status);
    if (application.status === 'REJECTED') currentIndex = 3; // Step 4 is Decision
    
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-8 mt-4 gap-4">
        {['Application Created', 'Submitted', 'Under Review', application.status === 'REJECTED' ? 'Rejected' : 'Approved'].map((step, idx) => {
           let state = 'pending';
           if (idx < currentIndex) state = 'completed';
           if (idx === currentIndex) state = application.status === 'REJECTED' ? 'rejected' : (application.status === 'APPROVED' ? 'completed' : 'current');
           
           return (
             <div key={step} className="flex flex-col items-center text-center flex-1">
               <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 border-2 ${
                 state === 'completed' ? 'bg-primary text-primary-foreground border-primary' :
                 state === 'current' ? 'bg-primary/20 text-primary border-primary' :
                 state === 'rejected' ? 'bg-destructive text-destructive-foreground border-destructive' :
                 'bg-muted text-muted-foreground border-muted'
               }`}>
                 {state === 'completed' ? <Check className="h-5 w-5" /> : <span>{idx + 1}</span>}
               </div>
               <span className="text-sm font-medium">{step}</span>
             </div>
           );
        })}
      </div>
    );
  };
  
  // Render Success/Tracking state
  if (!isDraft) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
        <Button variant="ghost" onClick={() => navigate('/dashboard/applications')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to My Applications</Button>
        
        {application.status === 'SUBMITTED' && (
          <Alert className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <AlertTitle>APPLICATION SUBMITTED</AlertTitle>
            <AlertDescription>Your application has been successfully submitted and is awaiting officer assignment.</AlertDescription>
          </Alert>
        )}

        {application.status === 'UNDER_REVIEW' && (
          <Alert className="bg-purple-500/10 text-purple-600 border-purple-500/20">
            <Clock className="h-5 w-5 text-purple-600" />
            <AlertTitle>APPLICATION UNDER REVIEW</AlertTitle>
            <AlertDescription>An authorized government officer is currently reviewing your details and verifying documents.</AlertDescription>
          </Alert>
        )}

        {application.status === 'APPROVED' && (
          <Alert className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <AlertTitle>APPLICATION APPROVED</AlertTitle>
            <AlertDescription>
              Congratulations! Your application has been approved by the department.
              {application.officer_remarks && (
                <div className="mt-2 text-xs font-mono bg-background/80 p-2 rounded border border-emerald-500/20">
                  Officer Remarks: {application.officer_remarks}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {application.status === 'REJECTED' && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>APPLICATION REJECTED</AlertTitle>
            <AlertDescription>
              Your application was not approved by the inspecting officer.
              {application.officer_remarks && (
                <div className="mt-2 text-xs font-mono bg-destructive/10 p-2 rounded border border-destructive/20">
                  Reason: {application.officer_remarks}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Application ID</p>
                <h1 className="text-3xl font-bold font-mono">{application.application_id}</h1>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground font-medium mb-1">Status</p>
                <Badge className="text-lg px-4 py-1" variant={application.status === 'REJECTED' ? 'destructive' : 'default'}>{application.status}</Badge>
              </div>
            </div>
            
            {renderStatusTimeline()}
            
            <div className="grid md:grid-cols-2 gap-8 mt-8 border-t pt-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center"><FileText className="mr-2 h-5 w-5" /> Application Details</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Scheme:</span> <span className="font-medium">{application.scheme.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Submitted:</span> <span className="font-medium">{application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Eligibility:</span> <span className="font-medium">{application.eligibility_result?.eligible ? 'Eligible' : 'Check Required'}</span></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center"><FileText className="mr-2 h-5 w-5" /> Documents</h3>
                <div className="space-y-2">
                  {documents?.map((doc: any) => (
                    <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{doc.document_type}</p>
                          <p className="text-xs text-muted-foreground truncate">{doc.original_filename}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline">{doc.verification_status}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleViewDocument(doc.id, doc.content_type)}
                          title="View Document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Draft Form
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      <Button variant="ghost" onClick={() => navigate('/dashboard/schemes')}><ArrowLeft className="mr-2 h-4 w-4" /> Cancel Application</Button>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Apply for {application.scheme?.name}</h1>
        <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
          <span>ID: <span className="font-mono font-medium">{application.application_id}</span></span>
          <span>Status: <Badge variant="secondary">DRAFT</Badge></span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
              <CardDescription>Please fill in all required details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <input name="full_name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.full_name || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age *</label>
                  <input type="number" name="age" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.age || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Annual Income (₹) *</label>
                  <input type="number" name="annual_income" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.annual_income || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Occupation *</label>
                  <input name="occupation" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.occupation || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">District *</label>
                  <input name="district" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.district || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mandal *</label>
                  <input name="mandal" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.mandal || ''} onChange={handleInputChange} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Village *</label>
                  <input name="village" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.village || ''} onChange={handleInputChange} />
                </div>
                <div className="col-span-2 pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveDraft(false)}
                    disabled={updateDraftMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateDraftMutation.isPending ? 'Saving...' : 'Save Draft Progress'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Upload the documents required for this scheme. Max size 10MB.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiredDocs.map((docType: string) => {
                const uploaded = getUploadedDoc(docType);
                return (
                  <div key={docType} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium flex items-center">
                        {docType} {uploaded && <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-500" />}
                      </p>
                      {uploaded ? (
                        <p className="text-sm text-muted-foreground">{uploaded.original_filename}</p>
                      ) : (
                        <p className="text-sm text-rose-500">Required</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploaded ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleViewDocument(uploaded.id, uploaded.content_type)}>
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteDoc(uploaded.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <input 
                            type="file" 
                            className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-muted-foreground" 
                            onChange={(e) => handleFileChange(docType, e)} 
                            accept=".pdf,.jpg,.jpeg,.png" 
                          />
                          {selectedFiles[docType] && (
                            <span className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded max-w-[140px] truncate" title={selectedFiles[docType].name}>
                              {selectedFiles[docType].name}
                            </span>
                          )}
                          <Button 
                            size="sm" 
                            disabled={!selectedFiles[docType] || uploadMutation.isPending} 
                            onClick={() => handleUpload(docType)}
                            className="shrink-0 h-8 text-xs font-semibold"
                          >
                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                            {uploadMutation.isPending && selectedFiles[docType] ? 'Uploading...' : 'Upload'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {requiredDocs.length === 0 && <p className="text-sm text-muted-foreground">No documents required.</p>}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Eligibility</span> <span className="font-medium text-emerald-600">{application.eligibility_result?.eligible ? 'Matches Criteria' : 'Check Required'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Docs Uploaded</span> <span className="font-medium">{documents?.length || 0} / {requiredDocs.length}</span></div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Notice</AlertTitle>
                <AlertDescription className="text-xs mt-1">By submitting, you confirm that all provided information is accurate.</AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSaveDraft(false)}
                  disabled={updateDraftMutation.isPending || submitMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateDraftMutation.isPending ? 'Saving Draft...' : 'Save Draft'}
                </Button>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleSubmit} 
                  disabled={submitMutation.isPending || updateDraftMutation.isPending || (documents?.length || 0) < requiredDocs.length}
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
