import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, FileText, CheckCircle2, Clock, XCircle, FileEdit,
  TrendingUp, Shield, RefreshCw, AlertCircle, Search, ExternalLink,
  Eye, MousePointer, Activity, UserCheck, Calendar, Filter,
  ArrowUpRight, BarChart3, Layers, Tractor, GraduationCap, Heart, UserCircle
} from 'lucide-react';
import { CitizenAccountModal } from '../../components/admin/CitizenAccountModal';
import { AdminAPI, type CitizenUserDetail } from '../../lib/api';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'applications' | 'citizens'>('overview');
  
  // Citizen inspection modal states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [citizenModalOpen, setCitizenModalOpen] = useState(false);

  // Citizen Directory states
  const [citizenPersonaFilter, setCitizenPersonaFilter] = useState<string>('ALL');
  const [citizenSearch, setCitizenSearch] = useState<string>('');
  const [citizensList, setCitizensList] = useState<CitizenUserDetail[]>([]);
  const [citizensLoading, setCitizensLoading] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard();

  // Fetch Citizens directory on demand
  React.useEffect(() => {
    if (activeTab === 'citizens') {
      setCitizensLoading(true);
      AdminAPI.getCitizens({
        persona: citizenPersonaFilter === 'ALL' ? undefined : citizenPersonaFilter,
        search: citizenSearch || undefined
      })
        .then((res: any) => setCitizensList(res.data.data || []))
        .catch(() => setCitizensList([]))
        .finally(() => setCitizensLoading(false));
    }
  }, [activeTab, citizenPersonaFilter, citizenSearch]);

  // Filter recent applications by search term and status
  const filteredApplications = useMemo(() => {
    if (!data?.recent_applications) return [];
    return data.recent_applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        app.application_id?.toLowerCase().includes(q) ||
        app.applicant_name?.toLowerCase().includes(q) ||
        app.scheme_name?.toLowerCase().includes(q) ||
        app.status?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data?.recent_applications, searchQuery, statusFilter]);

  // Persona pie/bar data
  const personaChartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Farmers', count: data.farmer_accounts || 0, color: '#10b981' },
      { name: 'Students', count: data.student_accounts || 0, color: '#3b82f6' },
      { name: 'Senior Citizens', count: data.senior_accounts || 0, color: '#f59e0b' },
      { name: 'General Citizens', count: data.general_citizen_accounts || 0, color: '#6366f1' },
    ];
  }, [data]);

  // Application status distribution
  const statusPieData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Approved', value: data.approved_applications || 0, color: '#10b981' },
      { name: 'Submitted', value: data.submitted_applications || 0, color: '#3b82f6' },
      { name: 'Under Review', value: data.under_review_applications || 0, color: '#8b5cf6' },
      { name: 'Drafts', value: data.draft_applications || 0, color: '#64748b' },
      { name: 'Rejected', value: data.rejected_applications || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [data]);

  // Status badge styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'Pending':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-xs">Under Review</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-xs">Rejected</Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 text-xs">Draft</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  // Error State with Retry
  if (isError) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Analytics Connectivity Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unable to connect to production analytics service.'}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry Connection
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/applications')}>
            Go to Application Queue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* HEADER & OPERATIONS STRIP */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Operations & Analytics Command Center
            </h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
              Live DB
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Production metrics across citizens, welfare schemes, officer reviews, and user engagement.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-muted-foreground uppercase font-medium">Last Synchronized</p>
            <p className="text-xs font-mono font-semibold text-foreground">
              {data?.last_updated ? new Date(data.last_updated).toLocaleTimeString() : 'Live'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="gap-2 text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('engagement')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'engagement'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <MousePointer className="h-3.5 w-3.5" />
          Scheme Engagement & Visits
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'applications'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Application Operations ({data?.total_applications ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('citizens')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'citizens'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Citizen Directory & Personas ({data?.total_citizens ?? 0})
        </button>
      </div>

      {/* LOADING SKELETON */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      )}

      {/* TAB 1: SYSTEM OVERVIEW */}
      {!isLoading && activeTab === 'overview' && data && (
        <div className="space-y-6">
          {/* SECTION A: KEY METRIC CARDS */}
          <div>
            <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-3">
              Citizen & Administrative Accounts
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <Card className="p-4 border-border bg-card">
                <p className="text-xs text-muted-foreground font-medium">Total Registered</p>
                <p className="text-2xl font-bold text-foreground mt-1">{data.total_users}</p>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-emerald-500" /> Active: {data.active_users_24h} (24h)
                </p>
              </Card>

              <Card className="p-4 border-border bg-card">
                <p className="text-xs text-muted-foreground font-medium">Total Citizens</p>
                <p className="text-2xl font-bold text-foreground mt-1">{data.total_citizens}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Role 4 Citizens</p>
              </Card>

              <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Farmers</p>
                <p className="text-2xl font-bold text-foreground mt-1">{data.farmer_accounts}</p>
                <p className="text-[11px] text-muted-foreground mt-1">PM-Kisan / Rythu</p>
              </Card>

              <Card className="p-4 border-blue-500/20 bg-blue-500/5">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Students</p>
                <p className="text-2xl font-bold text-foreground mt-1">{data.student_accounts}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Scholarships</p>
              </Card>

              <Card className="p-4 border-amber-500/20 bg-amber-500/5">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Senior Citizens</p>
                <p className="text-2xl font-bold text-foreground mt-1">{data.senior_accounts}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Pensions & Health</p>
              </Card>

              <Card className="p-4 border-indigo-500/20 bg-indigo-500/5">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">General Citizens</p>
                <p className="text-2xl font-bold text-foreground mt-1">{data.general_citizen_accounts}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Welfare & Services</p>
              </Card>

              <Card className="p-4 border-purple-500/20 bg-purple-500/5">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Auth Officers</p>
                <p className="text-2xl font-bold text-foreground mt-1">{data.total_officers}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Mandal / Village</p>
              </Card>
            </div>
          </div>

          {/* APPLICATION & SCHEME METRICS */}
          <div>
            <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-3">
              Application Pipeline & Scheme Status
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <Card className="p-3.5 border-border bg-card">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                  <FileText className="h-3.5 w-3.5" /> Total Apps
                </div>
                <p className="text-xl font-bold text-foreground mt-1">{data.total_applications}</p>
              </Card>

              <Card className="p-3.5 border-slate-500/20 bg-slate-500/5">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs font-medium">
                  <FileEdit className="h-3.5 w-3.5" /> Drafts
                </div>
                <p className="text-xl font-bold text-foreground mt-1">{data.draft_applications}</p>
              </Card>

              <Card className="p-3.5 border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-medium">
                  <Clock className="h-3.5 w-3.5" /> Submitted
                </div>
                <p className="text-xl font-bold text-foreground mt-1">{data.submitted_applications}</p>
              </Card>

              <Card className="p-3.5 border-purple-500/20 bg-purple-500/5">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs font-medium">
                  <Activity className="h-3.5 w-3.5" /> Under Review
                </div>
                <p className="text-xl font-bold text-foreground mt-1">{data.under_review_applications}</p>
              </Card>

              <Card className="p-3.5 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                </div>
                <p className="text-xl font-bold text-foreground mt-1">{data.approved_applications}</p>
              </Card>

              <Card className="p-3.5 border-rose-500/20 bg-rose-500/5">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  <XCircle className="h-3.5 w-3.5" /> Rejected
                </div>
                <p className="text-xl font-bold text-foreground mt-1">{data.rejected_applications}</p>
              </Card>

              <Card className="p-3.5 border-border bg-card">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                  <Layers className="h-3.5 w-3.5" /> Total Schemes
                </div>
                <p className="text-xl font-bold text-foreground mt-1">{data.total_schemes}</p>
              </Card>

              <Card className="p-3.5 border-emerald-500/20 bg-card">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active Schemes
                </div>
                <p className="text-xl font-bold text-foreground mt-1">{data.active_schemes}</p>
              </Card>
            </div>
          </div>

          {/* VISUAL CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Application & Approval Trends */}
            <Card className="p-5 border-border bg-card">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
                  <span>Application Volume & Approval Trends</span>
                  <Badge variant="outline" className="text-[11px] font-normal">Real Monthly Data</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Actual historical volume of scheme applications and officer approvals.
                </CardDescription>
              </CardHeader>
              <div className="h-64 w-full">
                {data.application_trends && data.application_trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.application_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="applications" name="Total Applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No historical trend records found.
                  </div>
                )}
              </div>
            </Card>

            {/* Persona Distribution Chart */}
            <Card className="p-5 border-border bg-card">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
                  <span>Citizen Persona Breakdown</span>
                  <Badge variant="outline" className="text-[11px] font-normal">Verified Profiles</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Distribution of registered citizen accounts across farmer, student, senior, and general personas.
                </CardDescription>
              </CardHeader>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={personaChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" name="Accounts" radius={[0, 4, 4, 0]}>
                      {personaChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* SECTION B: REGISTRATION VELOCITY & DISTRICTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 border-border bg-card md:col-span-1">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Registration Velocity</span>
              </CardTitle>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground">Last 24 Hours</span>
                  <span className="text-sm font-bold text-foreground">+{data.registrations_today}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground">Last 7 Days</span>
                  <span className="text-sm font-bold text-foreground">+{data.registrations_this_week}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-xs text-muted-foreground">Last 30 Days</span>
                  <span className="text-sm font-bold text-foreground">+{data.registrations_this_month}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Citizens (24h)</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{data.active_users_24h}</span>
                </div>
              </div>
            </Card>

            {/* Application Status Pipeline Donut */}
            <Card className="p-5 border-border bg-card md:col-span-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-primary" />
                <span>Application Lifecycle Distribution</span>
              </CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="h-44 w-full">
                  {statusPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      No status data available.
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  {statusPieData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between p-1.5 rounded border border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEME ENGAGEMENT & FIRST-PARTY VISITS */}
      {!isLoading && activeTab === 'engagement' && data && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-primary" />
              First-Party Website Visit & Interaction Telemetry
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Privacy-preserving event metrics collected directly by the GramAI backend without third-party trackers or PII collection.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
              <Card className="p-4 bg-muted/30 border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Eye className="h-3.5 w-3.5" /> Total Page Views
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{data.total_page_views}</p>
                <p className="text-[11px] text-muted-foreground mt-1">First-party telemetry</p>
              </Card>

              <Card className="p-4 bg-muted/30 border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Users className="h-3.5 w-3.5" /> Unique Sessions
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{data.unique_sessions}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Pseudonymous sessions</p>
              </Card>

              <Card className="p-4 bg-muted/30 border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <FileText className="h-3.5 w-3.5" /> Scheme Detail Views
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{data.scheme_detail_views}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Deep inspections</p>
              </Card>

              <Card className="p-4 bg-muted/30 border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <MousePointer className="h-3.5 w-3.5" /> Apply Clicks
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{data.apply_clicks}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Intent to apply</p>
              </Card>

              <Card className="p-4 bg-muted/30 border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <ExternalLink className="h-3.5 w-3.5" /> External Link Clicks
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{data.external_link_clicks}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Outbound gov portals</p>
              </Card>
            </div>
          </div>

          {/* TOP VIEWED SCHEMES TABLE */}
          <Card className="border-border bg-card">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
                <span>Top Engaged Government Schemes</span>
                <Badge variant="outline" className="text-xs font-normal">Real Interaction Records</Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Actual scheme inspection counts and apply clicks recorded from citizen visits.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {data.top_viewed_schemes && data.top_viewed_schemes.length > 0 ? (
                <div className="divide-y divide-border text-sm">
                  {data.top_viewed_schemes.map((scheme, i) => (
                    <div key={scheme.scheme_id || i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">{scheme.scheme_name}</p>
                        <p className="text-xs text-muted-foreground">Scheme ID: {scheme.scheme_id || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Views</p>
                          <p className="font-bold text-foreground">{scheme.views}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Apply Clicks</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">{scheme.apply_clicks}</p>
                        </div>
                        {scheme.scheme_id && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/dashboard/schemes/${scheme.scheme_id}`)}
                            className="text-xs"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  <p>Telemetry event collection began with this deployment.</p>
                  <p className="mt-1">Events will appear as citizens view schemes and click apply buttons.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: APPLICATION OPERATIONS & LIVE TABLE */}
      {!isLoading && activeTab === 'applications' && data && (
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="p-5 border-b border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    Live Application Operations
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Real applications submitted by citizens, awaiting or completed review by authorized officers.
                  </CardDescription>
                </div>

                {/* FILTERS */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search ID, applicant, scheme..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Application ID</th>
                        <th className="py-3 px-4">Applicant</th>
                        <th className="py-3 px-4">Scheme</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Submitted Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-foreground">
                            <button
                              onClick={() => navigate(`/admin/applications/${app.id}`)}
                              className="hover:text-primary hover:underline transition-colors text-left"
                            >
                              {app.application_id}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground">
                            <button
                              onClick={() => {
                                if (app.user_id) {
                                  setSelectedUserId(String(app.user_id));
                                  setCitizenModalOpen(true);
                                }
                              }}
                              className="hover:text-primary transition-colors cursor-pointer text-left font-medium underline decoration-dotted underline-offset-4 flex items-center gap-1"
                              title="Click to inspect citizen account and all submitted applications"
                            >
                              <UserCircle className="h-3.5 w-3.5 text-primary opacity-70" />
                              <span>{app.applicant_name}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">
                            {app.scheme_name}
                          </td>
                          <td className="py-3 px-4">
                            {renderStatusBadge(app.status)}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {app.submitted_at 
                              ? new Date(app.submitted_at).toLocaleDateString() 
                              : app.created_at 
                                ? new Date(app.created_at).toLocaleDateString() 
                                : 'Draft'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/applications/${app.id}`)}
                              className="h-7 text-xs px-2.5"
                            >
                              Inspect / Review
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center text-xs text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="font-medium text-foreground">No applications found matching criteria.</p>
                  <p className="mt-1">Try adjusting your search query or status filter.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: CITIZEN DIRECTORY & PERSONA INSPECTION */}
      {!isLoading && activeTab === 'citizens' && (
        <div className="space-y-6">
          
          {/* Persona breakdown metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card 
              className={`p-4 cursor-pointer transition-all border ${citizenPersonaFilter === 'farmer' ? 'border-emerald-500 bg-emerald-500/10' : 'hover:border-emerald-500/40'}`}
              onClick={() => setCitizenPersonaFilter(citizenPersonaFilter === 'farmer' ? 'ALL' : 'farmer')}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Tractor className="h-4 w-4 text-emerald-500" /> Farmers
                </span>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px]">Persona</Badge>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground mt-2">{data?.farmer_accounts || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Agriculture & subsidy seekers</p>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-all border ${citizenPersonaFilter === 'student' ? 'border-indigo-500 bg-indigo-500/10' : 'hover:border-indigo-500/40'}`}
              onClick={() => setCitizenPersonaFilter(citizenPersonaFilter === 'student' ? 'ALL' : 'student')}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-indigo-400" /> Students
                </span>
                <Badge className="bg-indigo-500/15 text-indigo-400 border-0 text-[10px]">Persona</Badge>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground mt-2">{data?.student_accounts || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Scholarships & education</p>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-all border ${citizenPersonaFilter === 'senior' ? 'border-amber-500 bg-amber-500/10' : 'hover:border-amber-500/40'}`}
              onClick={() => setCitizenPersonaFilter(citizenPersonaFilter === 'senior' ? 'ALL' : 'senior')}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-amber-500" /> Senior Citizens
                </span>
                <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[10px]">Persona</Badge>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground mt-2">{data?.senior_accounts || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Pension & healthcare schemes</p>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-all border ${citizenPersonaFilter === 'citizen' ? 'border-blue-500 bg-blue-500/10' : 'hover:border-blue-500/40'}`}
              onClick={() => setCitizenPersonaFilter(citizenPersonaFilter === 'citizen' ? 'ALL' : 'citizen')}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <UserCircle className="h-4 w-4 text-blue-400" /> General Citizens
                </span>
                <Badge className="bg-blue-500/15 text-blue-400 border-0 text-[10px]">Persona</Badge>
              </div>
              <p className="text-2xl font-bold font-mono text-foreground mt-2">{data?.general_citizen_accounts || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Welfare & housing schemes</p>
            </Card>
          </div>

          {/* Directory Card */}
          <Card className="border-border">
            <CardHeader className="p-4 sm:p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Live Citizen Accounts & Identification
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Click any Citizen ID or applicant name to open their account dossier and inspect all their submitted applications.
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search name, ID, phone, email..."
                    value={citizenSearch}
                    onChange={(e) => setCitizenSearch(e.target.value)}
                    className="pl-8 text-xs h-8 w-full sm:w-64"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {['ALL', 'farmer', 'student', 'senior', 'citizen'].map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={citizenPersonaFilter === p ? 'default' : 'outline'}
                      onClick={() => setCitizenPersonaFilter(p)}
                      className="text-xs h-8 capitalize shrink-0"
                    >
                      {p === 'ALL' ? 'All Personas' : p}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {citizensLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : citizensList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Citizen ID (Click to View)</th>
                        <th className="py-3 px-4">Full Name</th>
                        <th className="py-3 px-4">Persona</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Applications</th>
                        <th className="py-3 px-4">Last Activity</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {citizensList.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setSelectedUserId(c.id);
                                setCitizenModalOpen(true);
                              }}
                              className="font-mono text-xs font-semibold text-primary hover:underline flex items-center gap-1 group/btn"
                              title="Click to view full user account & applications"
                            >
                              <Shield className="h-3 w-3 text-primary opacity-70 group-hover/btn:scale-110 transition-transform" />
                              <span>TG-CIT-{c.id.slice(0, 8).toUpperCase()}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground">
                            <button
                              onClick={() => {
                                setSelectedUserId(c.id);
                                setCitizenModalOpen(true);
                              }}
                              className="hover:text-primary transition-colors cursor-pointer text-left font-medium underline decoration-dotted underline-offset-4"
                            >
                              {c.full_name}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            {c.persona === 'farmer' && (
                              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                                <Tractor className="w-3 h-3 mr-1" /> Farmer
                              </Badge>
                            )}
                            {c.persona === 'student' && (
                              <Badge className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-[10px]">
                                <GraduationCap className="w-3 h-3 mr-1" /> Student
                              </Badge>
                            )}
                            {c.persona === 'senior' && (
                              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px]">
                                <Heart className="w-3 h-3 mr-1" /> Senior Citizen
                              </Badge>
                            )}
                            {c.persona !== 'farmer' && c.persona !== 'student' && c.persona !== 'senior' && (
                              <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px]">
                                <UserCircle className="w-3 h-3 mr-1" /> General Citizen
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            <div>{c.email || c.phone_number || '-'}</div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            <span>{c.village ? `${c.village}, ` : ''}{c.district || 'Telangana'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={`text-[10px] ${c.application_count > 0 ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground'}`}>
                              {c.application_count} {c.application_count === 1 ? 'Application' : 'Applications'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-[11px]">
                            {c.last_active ? new Date(c.last_active).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(c.id);
                                setCitizenModalOpen(true);
                              }}
                              className="h-7 text-xs px-2.5 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                            >
                              Inspect Account
                              <ArrowUpRight className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center text-xs text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="font-medium text-foreground">No citizen accounts found matching criteria.</p>
                  <p className="mt-1">Try selecting 'All Personas' or clearing the search query.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Citizen Account Dossier Modal */}
      <CitizenAccountModal 
        userId={selectedUserId}
        open={citizenModalOpen}
        onOpenChange={setCitizenModalOpen}
      />
    </div>
  );
};
