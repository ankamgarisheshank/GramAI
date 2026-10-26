import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScheme } from '../../hooks/useSchemes';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { 
  ArrowLeft, 
  ExternalLink, 
  Info, 
  FileText, 
  Banknote, 
  Users,
  Briefcase,
  Activity,
  Calendar
} from 'lucide-react';
import { useCreateApplication } from '../../hooks/useApplications';

export const SchemeDetails = () => {
  const { schemeId } = useParams<{ schemeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: scheme, isLoading, isError } = useScheme(schemeId || '');
  const { mutate: createApplication, isPending: isCreating } = useCreateApplication();

  const handleApplyClick = () => {
    createApplication({ scheme_id: scheme.id, form_data: {} }, {
      onSuccess: (data: any) => {
        navigate(`/dashboard/applications/${data.id}`);
      },
      onError: (err: any) => {
        if (err.response?.status === 409) {
          toast({
            title: 'Application Exists',
            description: 'You already have an active application for this scheme. Please check "My Applications".',
            type: 'error'
          });
        } else {
          toast({
            title: 'Error',
            description: err.response?.data?.message || 'Failed to start application.',
            type: 'error'
          });
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !scheme) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard/schemes')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schemes
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {isError ? 'Failed to load scheme details.' : 'Scheme not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/schemes')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{scheme.name}</h1>
            <Badge variant="outline" className={
              scheme.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
              scheme.status === 'Inactive' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-muted text-muted-foreground'
            }>
              {scheme.status || 'Unknown Status'}
            </Badge>
          </div>
          <div className="flex gap-2 flex-wrap text-sm">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent">
              {scheme.department}
            </Badge>
            {scheme.beneficiary_type && (
              <Badge variant="outline" className="bg-muted">
                {scheme.beneficiary_type}
              </Badge>
            )}
            {scheme.last_updated && (
              <span className="text-muted-foreground flex items-center ml-2">
                <Calendar className="mr-1 h-3 w-3" />
                Updated: {new Date(scheme.last_updated).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[200px]">
          <Button onClick={handleApplyClick} className="w-full shadow-sm" size="lg" disabled={isCreating}>
            {isCreating ? 'Creating Application...' : 'Apply for Scheme'}
          </Button>
          
          {scheme.official_link ? (
            <Button variant="outline" className="w-full" onClick={() => window.open(scheme.official_link, '_blank')}>
              Official Website <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground text-center">Official link not available</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center">
                <Info className="mr-2 h-5 w-5 text-primary" /> About Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {scheme.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center">
                <Banknote className="mr-2 h-5 w-5 text-emerald-500" /> Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {scheme.benefits}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center">
                <Activity className="mr-2 h-5 w-5 text-blue-500" /> Application Process
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {scheme.application_process}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5 text-purple-500" /> Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {scheme.income_limit !== null && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Income Limit</h4>
                  <p className="text-foreground font-medium">₹{scheme.income_limit.toLocaleString()}</p>
                </div>
              )}
              
              {(scheme.age_limit_min !== null || scheme.age_limit_max !== null) && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Age Requirement</h4>
                  <p className="text-foreground font-medium">
                    {scheme.age_limit_min !== null ? scheme.age_limit_min : '0'} 
                    {scheme.age_limit_max !== null ? ` to ${scheme.age_limit_max}` : '+'} years
                  </p>
                </div>
              )}
              
              {scheme.occupation_requirement && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Occupation</h4>
                  <p className="text-foreground font-medium flex items-center">
                    <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                    {scheme.occupation_requirement}
                  </p>
                </div>
              )}
              
              {scheme.income_limit === null && scheme.age_limit_min === null && scheme.age_limit_max === null && !scheme.occupation_requirement && (
                <p className="text-sm text-muted-foreground italic">No specific eligibility criteria listed.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5 text-orange-500" /> Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
                {scheme.required_documents}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
