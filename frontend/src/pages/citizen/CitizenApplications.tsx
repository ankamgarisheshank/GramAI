import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyApplications } from '../../hooks/useApplications';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { FileText, ArrowRight, Clock } from 'lucide-react';

export const CitizenApplications = () => {
  const navigate = useNavigate();
  const { data: applications, isLoading, isError } = useMyApplications();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Unable to load your applications. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
      case 'SUBMITTED': return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Submitted</Badge>;
      case 'UNDER_REVIEW': return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Under Review</Badge>;
      case 'APPROVED': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'REJECTED': return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard/schemes')}>
          Browse Schemes
        </Button>
      </div>

      {applications && applications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">No applications found</h3>
            <p className="text-muted-foreground">You haven't submitted any applications yet.</p>
            <Button onClick={() => navigate('/dashboard/schemes')}>Explore Government Schemes</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications?.map((app: any) => (
            <Card key={app.id} className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate(`/dashboard/applications/${app.id}`)}>
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold bg-muted px-2 py-1 rounded">
                      {app.application_id}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>
                  <h3 className="text-xl font-bold">{app.scheme?.name || 'Unknown Scheme'}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Last updated: {new Date(app.updated_at || app.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
