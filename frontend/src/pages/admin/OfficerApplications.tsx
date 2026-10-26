import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOfficerApplications, type OfficerApplicationItem } from '../../hooks/useOfficerApplications';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { 
  FileText, Search, Clock, CheckCircle, XCircle, AlertCircle, 
  ChevronRight, Filter, RefreshCw, MapPin, Eye, ShieldCheck
} from 'lucide-react';

interface Props {
  initialStatus?: string;
  pageTitle?: string;
}

export const OfficerApplications: React.FC<Props> = ({ 
  initialStatus, 
  pageTitle = "Officer Application Queue" 
}) => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: applications, isLoading, isError, refetch, isFetching } = useOfficerApplications({
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    search: searchQuery.trim() || undefined,
  });

  // Calculate metrics
  const stats = useMemo(() => {
    if (!applications) return { total: 0, submitted: 0, underReview: 0, approved: 0, rejected: 0 };
    return {
      total: applications.length,
      submitted: applications.filter(a => a.status === 'SUBMITTED').length,
      underReview: applications.filter(a => a.status === 'UNDER_REVIEW').length,
      approved: applications.filter(a => a.status === 'APPROVED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
    };
  }, [applications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Under Review</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocStatusBadge = (app: OfficerApplicationItem) => {
    if (app.total_documents === 0) {
      return <span className="text-xs text-muted-foreground">No docs</span>;
    }
    if (app.verified_documents === app.total_documents) {
      return (
        <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          <CheckCircle className="w-3 h-3 mr-1" />
          {app.verified_documents}/{app.total_documents} Verified
        </span>
      );
    }
    if (app.rejected_documents > 0) {
      return (
        <span className="inline-flex items-center text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
          <XCircle className="w-3 h-3 mr-1" />
          {app.rejected_documents} Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
        <Clock className="w-3 h-3 mr-1" />
        {app.pending_documents} Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Officer Portal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review citizen scheme applications, inspect and verify uploaded certificates, and make approval decisions.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer transition-colors hover:border-primary/50" onClick={() => setSelectedStatus('ALL')}>
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total In Queue</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono">{stats.total}</span>
              <FileText className="h-4 w-4 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-blue-500/50" onClick={() => setSelectedStatus('SUBMITTED')}>
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-blue-400">New / Submitted</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-blue-400">{stats.submitted}</span>
              <Clock className="h-4 w-4 text-blue-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-purple-500/50" onClick={() => setSelectedStatus('UNDER_REVIEW')}>
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-purple-400">Under Review</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-purple-400">{stats.underReview}</span>
              <ShieldCheck className="h-4 w-4 text-purple-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-emerald-500/50" onClick={() => setSelectedStatus('APPROVED')}>
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-emerald-400">Approved</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">{stats.approved}</span>
              <CheckCircle className="h-4 w-4 text-emerald-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-rose-500/50" onClick={() => setSelectedStatus('REJECTED')}>
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-rose-400">Rejected</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-mono text-rose-400">{stats.rejected}</span>
              <XCircle className="h-4 w-4 text-rose-400 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, applicant name, or scheme..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={selectedStatus === st ? 'default' : 'outline'}
              onClick={() => setSelectedStatus(st)}
              className="text-xs h-8"
            >
              {st === 'ALL' ? 'All Applications' : st.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Applications</AlertTitle>
          <AlertDescription className="flex items-center justify-between mt-2">
            <span>Failed to load officer queue records from the server.</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Queue Table */}
      {!isLoading && !isError && applications && applications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No Applications Found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchQuery || selectedStatus !== 'ALL'
                ? "No applications matched the current filters. Try resetting the search or filter."
                : "No applications have been submitted in your authorized jurisdiction yet."}
            </p>
            {(searchQuery || selectedStatus !== 'ALL') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setSelectedStatus('ALL'); setSearchQuery(''); }}
              >
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && applications && applications.length > 0 && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border/60">
                <tr className="text-left text-xs font-semibold text-muted-foreground">
                  <th className="px-5 py-3">Application ID</th>
                  <th className="px-5 py-3">Applicant</th>
                  <th className="px-5 py-3">Scheme</th>
                  <th className="px-5 py-3">Jurisdiction</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Documents</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {applications.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                  >
                    <td className="px-5 py-4 font-mono font-medium text-foreground">
                      {app.application_id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{app.applicant_name}</div>
                      {(app.applicant_phone || app.applicant_email) && (
                        <div className="text-xs text-muted-foreground">
                          {app.applicant_phone || app.applicant_email}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground max-w-[200px] truncate" title={app.scheme_name}>
                        {app.scheme_name}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary opacity-60" />
                        <span>{app.village_name || app.mandal_name || app.district_name || 'Telangana'}</span>
                      </div>
                      {app.mandal_name && app.district_name && (
                        <div className="text-[11px] text-muted-foreground/80 pl-4">
                          {app.mandal_name}, {app.district_name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getDocStatusBadge(app)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-all gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/applications/${app.id}`);
                        }}
                      >
                        Review
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
