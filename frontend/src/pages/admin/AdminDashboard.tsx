import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { Chart } from '../../components/custom/Chart';
import { 
  Users, FileText, CheckCircle, Clock, 
  MapPin, Activity, Search,
  TrendingUp, ShieldAlert, BarChart3, ChevronRight,
  ClipboardList, Globe, Shield, Terminal, RefreshCw, AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard();

  // Filter recent applications by search term and status
  const filteredApplications = useMemo(() => {
    if (!data?.recent_applications) return [];
    return data.recent_applications.filter((app) => {
      const matchesSearch = !searchQuery.trim() || 
        app.application_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.scheme_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.status?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data?.recent_applications, searchQuery, statusFilter]);

  // Chart data from real trends or fallback
  const chartData = useMemo(() => {
    if (data?.application_trends && data.application_trends.length > 0) {
      return data.application_trends;
    }
    if (data) {
      return [
        { month: 'Current', applications: data.total_applications, approved: data.approved_applications }
      ];
    }
    return [];
  }, [data]);

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'Pending':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono text-xs">
            Submitted
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono text-xs">
            Under Review
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs">
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 font-mono text-xs">
            Rejected
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="outline" className="bg-slate-700/50 text-slate-400 border-slate-600 font-mono text-xs">
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-mono text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="dark bg-slate-950 min-h-screen text-slate-50 p-6 md:p-8 -m-6 md:-m-8 font-sans animate-in fade-in duration-700">
      <div className="max-w-[90rem] mx-auto space-y-8">
        
        {/* COMMAND CENTER HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-slate-900/50 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          
          {/* Neon Gradients */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/30 transition-colors"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/2"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 backdrop-blur-md px-3 py-1 font-mono tracking-widest text-xs uppercase shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Shield className="w-3 h-3 mr-2 inline" /> GovOps Command Center
              </Badge>
              <span className="flex items-center text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                LIVE METRICS
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Admin & Officer Dashboard
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm font-medium mt-2 font-mono">
              <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700/50 shadow-inner">
                <Globe className="h-4 w-4 text-blue-400" />
                Jurisdiction: <span className="text-emerald-400">Telangana Statewide</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700/50 shadow-inner">
                <Activity className="h-4 w-4 text-emerald-400" />
                Pipeline Active: <span className="text-emerald-400">{data ? data.submitted_applications + data.under_review_applications : '—'}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-8 xl:mt-0 w-full xl:w-auto">
            <div className="relative group/input">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/input:text-indigo-400 transition-colors" />
              <Input 
                placeholder="Search ID, citizen, scheme..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-slate-900/80 border-slate-700 text-slate-100 placeholder:text-slate-500 w-full sm:w-[320px] focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all font-mono text-sm rounded-xl shadow-inner"
              />
            </div>
            <Button 
              onClick={() => refetch()} 
              disabled={isFetching}
              variant="outline"
              className="h-12 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white border-slate-700 transition-all rounded-xl shadow-md"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ERROR STATE */}
        {isError && (
          <Alert variant="destructive" className="bg-rose-950/40 border-rose-800 text-rose-200">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold text-lg">Failed to Load Dashboard Data</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span>{error instanceof Error ? error.message : 'Unable to connect to analytics services.'}</span>
              <Button 
                onClick={() => refetch()} 
                size="sm" 
                variant="outline"
                className="bg-rose-900/60 border-rose-700 text-rose-100 hover:bg-rose-800 shrink-0"
              >
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-slate-900/40 border-slate-800 p-6 rounded-2xl">
                  <Skeleton className="h-4 w-24 bg-slate-800 mb-4" />
                  <Skeleton className="h-9 w-16 bg-slate-800 mb-3" />
                  <Skeleton className="h-3 w-32 bg-slate-800/60" />
                </Card>
              ))}
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-64 bg-slate-900/40 border border-slate-800 rounded-3xl" />
                <Skeleton className="h-80 bg-slate-900/40 border border-slate-800 rounded-3xl" />
              </div>
              <div className="space-y-8">
                <Skeleton className="h-64 bg-slate-900/40 border border-slate-800 rounded-3xl" />
                <Skeleton className="h-64 bg-slate-900/40 border border-slate-800 rounded-3xl" />
              </div>
            </div>
          </div>
        )}

        {/* REAL METRICS GRID */}
        {!isLoading && data && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              
              {/* Card 1: Total Applications */}
              <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Apps</p>
                      <h3 className="text-3xl font-bold font-heading text-slate-100 mt-1">
                        {data.total_applications.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-mono text-slate-400">
                    <span className="text-indigo-400 font-semibold mr-1">{data.draft_applications}</span> drafts recorded
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Submitted & Pending */}
              <Card 
                onClick={() => navigate('/admin/pending')}
                className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-400"></div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Submitted</p>
                      <h3 className="text-3xl font-bold font-heading text-amber-400 mt-1 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                        {data.submitted_applications.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-mono text-amber-300/80">
                    Awaiting officer review →
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Under Review */}
              <Card 
                onClick={() => navigate('/admin/verification')}
                className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Under Review</p>
                      <h3 className="text-3xl font-bold font-heading text-purple-300 mt-1">
                        {data.under_review_applications.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                      <Activity className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-mono text-purple-300/80">
                    In verification queue →
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Approved */}
              <Card 
                onClick={() => navigate('/admin/approvals')}
                className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Approved</p>
                      <h3 className="text-3xl font-bold font-heading text-emerald-400 mt-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        {data.approved_applications.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-mono text-emerald-300/80">
                    Beneficiaries eligible →
                  </div>
                </CardContent>
              </Card>

              {/* Card 5: Rejected */}
              <Card 
                onClick={() => navigate('/admin/rejections')}
                className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-600"></div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Rejected</p>
                      <h3 className="text-3xl font-bold font-heading text-rose-400 mt-1">
                        {data.rejected_applications.toLocaleString()}
                      </h3>
                    </div>
                    <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                      <ShieldAlert className="h-5 w-5 text-rose-400" />
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-mono text-rose-300/80">
                    Remarks documented →
                  </div>
                </CardContent>
              </Card>

              {/* Card 6: Schemes & Citizens */}
              <Card 
                onClick={() => navigate('/admin/schemes')}
                className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Schemes / Citizens</p>
                      <h3 className="text-3xl font-bold font-heading text-cyan-300 mt-1">
                        {data.active_schemes} <span className="text-lg font-normal text-slate-400">/ {data.total_citizens}</span>
                      </h3>
                    </div>
                    <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                      <Users className="h-5 w-5 text-cyan-400" />
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-mono text-slate-400">
                    <span className="text-cyan-400 font-semibold mr-1">{data.total_schemes}</span> total schemes in DB
                  </div>
                </CardContent>
              </Card>

            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              
              {/* LEFT MAIN COLUMN: Charts & Applications */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Real Approval Trends */}
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-indigo-400" />
                        <h3 className="text-lg font-semibold text-slate-200">Application Trends</h3>
                      </div>
                      <Badge variant="outline" className="text-xs font-mono text-indigo-400 border-indigo-500/30">
                        Monthly
                      </Badge>
                    </div>
                    {chartData.length > 0 ? (
                      <Chart 
                        title=""
                        data={chartData}
                        xAxisDataKey="month"
                        series={[
                          { dataKey: "applications", color: "#6366f1", name: "Received" },
                          { dataKey: "approved", color: "#10b981", name: "Approved" }
                        ]}
                        height={220}
                      />
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-sm font-mono text-slate-500">
                        No monthly trend data recorded yet.
                      </div>
                    )}
                  </div>

                  {/* Real Geographical Distribution */}
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-slate-700 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-blue-400" /> 
                          <h3 className="text-lg font-semibold text-slate-200">District Distribution</h3>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono text-blue-400 border-blue-500/30">
                          Live Data
                        </Badge>
                      </div>

                      {/* District Listing */}
                      <div className="space-y-3 mt-4">
                        {data.district_distribution.slice(0, 3).map((dist, idx) => (
                          <div 
                            key={dist.district_name}
                            className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`}></span>
                              <span className="text-sm font-medium text-slate-200">{dist.district_name}</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono text-xs">
                              <span className="text-slate-400">{dist.total_applications} apps</span>
                              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                                {dist.pending} pending
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Total Active Districts: {data.district_distribution.length}</span>
                      <span className="text-emerald-400">Statewide Coverage</span>
                    </div>
                  </div>
                </div>

                {/* Real Applications Queue Table */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="h-5 w-5 text-indigo-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-200">Recent Applications</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time database records</p>
                      </div>
                    </div>
                    
                    {/* Status Filter Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`text-xs font-mono px-3 py-1 rounded-lg border transition-all ${
                            statusFilter === st 
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                        </button>
                      ))}
                      <Button 
                        onClick={() => navigate('/admin/pending')}
                        variant="outline" 
                        size="sm" 
                        className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs ml-2"
                      >
                        Full Queue →
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto p-4">
                    {filteredApplications.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 font-mono text-sm">
                        No applications match the current search or status filter.
                      </div>
                    ) : (
                      <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                        <thead className="text-xs text-slate-500 uppercase tracking-wider font-mono">
                          <tr>
                            <th className="px-6 py-3 font-semibold">Application ID</th>
                            <th className="px-6 py-3 font-semibold">Citizen</th>
                            <th className="px-6 py-3 font-semibold">Scheme</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                            <th className="px-6 py-3 font-semibold">Submitted / Created</th>
                            <th className="px-6 py-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApplications.map((app) => (
                            <tr key={app.id} className="bg-slate-900/40 hover:bg-slate-800/80 transition-colors group">
                              <td className="px-6 py-4 rounded-l-xl">
                                <span className="font-mono text-indigo-300 font-medium group-hover:text-indigo-400 transition-colors">
                                  {app.application_id}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-200">{app.applicant_name}</td>
                              <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">{app.scheme_name}</td>
                              <td className="px-6 py-4">
                                {getStatusBadge(app.status)}
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                {app.submitted_at 
                                  ? new Date(app.submitted_at).toLocaleDateString() 
                                  : app.created_at 
                                    ? new Date(app.created_at).toLocaleDateString()
                                    : '—'}
                              </td>
                              <td className="px-6 py-4 rounded-r-xl text-right">
                                <Button 
                                  onClick={() => navigate(`/admin/applications/${app.id}`)}
                                  size="sm" 
                                  className="h-8 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white border border-indigo-500/50 shadow-sm transition-all"
                                >
                                  Review
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Real Pipeline Status & Quick Navigation */}
              <div className="space-y-8">
                
                {/* Real Pipeline Distribution */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Terminal className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-200">Pipeline Status Breakdown</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        Submitted / Awaiting Review
                      </span>
                      <span className="font-mono font-bold text-blue-400">{data.submitted_applications}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        Under Active Review
                      </span>
                      <span className="font-mono font-bold text-purple-400">{data.under_review_applications}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Approved Applications
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{data.approved_applications}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        Rejected Applications
                      </span>
                      <span className="font-mono font-bold text-rose-400">{data.rejected_applications}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                        Citizen Drafts
                      </span>
                      <span className="font-mono font-bold text-slate-400">{data.draft_applications}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate('/admin/pending')}
                    variant="ghost" 
                    className="w-full mt-6 text-sm text-slate-400 border border-dashed border-slate-700 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600 transition-all"
                  >
                    Manage Entire Pipeline →
                  </Button>
                </div>

                {/* Real Quick Workflows */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-slate-200">Officer Workspaces</h3>
                  </div>
                  <div className="space-y-4">
                    <button 
                      onClick={() => navigate('/admin/pending')}
                      className="w-full flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-800/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group shadow-sm text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 group-hover:border-slate-600 transition-all">
                          <Clock className="h-5 w-5 text-amber-400 transition-colors" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors block">
                            Pending Verification Queue
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {data.submitted_applications} applications pending review
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button 
                      onClick={() => navigate('/admin/approvals')}
                      className="w-full flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-800/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group shadow-sm text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 group-hover:border-slate-600 transition-all">
                          <CheckCircle className="h-5 w-5 text-emerald-400 transition-colors" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors block">
                            Approved Applications
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {data.approved_applications} sanctioned cases
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button 
                      onClick={() => navigate('/admin/schemes')}
                      className="w-full flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-800/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group shadow-sm text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 group-hover:border-slate-600 transition-all">
                          <Shield className="h-5 w-5 text-cyan-400 transition-colors" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors block">
                            Scheme Management
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {data.active_schemes} active schemes configured
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
