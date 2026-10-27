import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { useLocation } from '../../hooks/useLocation';
import { useSchemes } from '../../hooks/useSchemes';
import { 
  GraduationCap, MapPin, BookOpen, Laptop, ArrowRight,
  Bell, FileText, CheckCircle, Clock, Sparkles, 
  Calendar, FileDown, Bus, Award, Building2, Mic,
  Zap, Brain, Target, Rocket
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useMyApplications } from '../../hooks/useApplications';

export const StudentDashboard = () => {
  const user = useAuthStore(state => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data: schemes, isLoading: schemesLoading } = useSchemes('student');
  const { data: myApps, isLoading: appsLoading } = useMyApplications();

  const studentName = user?.email?.split('@')[0] || user?.phone_number || 'Student';
  const studentId = user?.id ? `TG-STU-${user.id.slice(0, 6).toUpperCase()}` : 'TG-EDU-2041A';

  const calendarEvents = [
    { event: 'Semester Scholarship Renewal', date: 'Nov 15', type: 'critical' },
    { event: 'Fee Reimbursement Verification', date: 'Dec 05', type: 'warning' },
    { event: 'Skill Development Workshop', date: 'Dec 20', type: 'info' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans animate-in fade-in duration-700 px-4 sm:px-6 lg:px-8 pb-16">
      
      {/* HEADER: High-Tech Immersive Profile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-950 text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-indigo-500/20 group">
        
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-950"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 mix-blend-screen transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 mix-blend-screen transition-transform duration-1000 group-hover:scale-110"></div>
        
        <div className="absolute -bottom-16 -right-16 opacity-[0.03] pointer-events-none transform rotate-12 scale-150 animate-pulse">
          <GraduationCap className="w-[400px] h-[400px] text-white" />
        </div>
        
        <div className="relative z-10 space-y-5 flex-1">
          <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-xl px-4 py-1.5 text-xs uppercase tracking-[0.2em] font-bold flex w-max items-center shadow-lg rounded-full">
            <Zap className="w-4 h-4 mr-2 text-cyan-400" />
            Student Hub
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight leading-tight">
            Hello, <br className="hidden md:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              {studentName}
            </span>
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 pt-4 text-slate-300 text-sm font-medium">
            <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/5 shadow-inner hover:bg-slate-800/80 transition-colors cursor-default">
              <Award className="h-4 w-4 text-cyan-400" />
              ID: {studentId}
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/5 shadow-inner hover:bg-slate-800/80 transition-colors cursor-default">
              <Building2 className="h-4 w-4 text-purple-400" />
              Telangana Higher Education
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/5 shadow-inner hover:bg-slate-800/80 transition-colors cursor-default">
              <MapPin className="h-4 w-4 text-indigo-400" />
              {location.loading ? 'Locating...' : location.address || 'Telangana'}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto mt-8 md:mt-0">
          {/* Quick Metrics */}
          <div className="flex gap-4 w-full">
            <div className="flex-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">Verified</div>
              <div className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mt-1">Student Status</div>
            </div>
            <div className="flex-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{myApps?.length || 0}</div>
              <div className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mt-1">Applications</div>
            </div>
          </div>
          
          <div className="relative group/btn mt-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover/btn:opacity-100 transition duration-500 animate-pulse"></div>
            <Button 
              onClick={() => navigate('/voice')}
              className="relative w-full bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 border border-white/10 shadow-2xl h-14 rounded-2xl transition-all font-semibold px-8 text-base flex items-center justify-center"
            >
              <Mic className="mr-3 h-5 w-5 text-cyan-400" /> Edu Voice Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENTS MARQUEE */}
      <Alert className="bg-indigo-950/30 border-l-4 border-l-cyan-500 flex items-center p-4 rounded-2xl backdrop-blur-sm border-t border-r border-b border-white/5 shadow-md">
        <div className="bg-cyan-500/20 p-2 rounded-xl mr-4">
          <Bell className="h-5 w-5 text-cyan-400 shrink-0 animate-[ring_2s_infinite]" />
        </div>
        <AlertDescription className="text-slate-200 font-medium flex-1 overflow-hidden">
          <div className="flex gap-2">
            <span className="text-cyan-400 font-bold">Latest:</span> The TS ePASS fresh registration portal is now open for the academic year 2026-27. Apply before Dec 31st.
          </div>
        </AlertDescription>
      </Alert>

      {/* TOP METRICS (AI Career, Calendar, Docs) */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* AI Career Assistant */}
        <Card className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 shadow-xl shadow-indigo-900/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <Brain className="h-24 w-24 text-cyan-400" />
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
          
          <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold font-heading text-white flex items-center gap-3">
                  <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                  </div>
                  AI Career Match
                </h2>
              </div>
              <p className="text-sm text-indigo-200/80 mb-6 leading-relaxed">
                Based on your B.Tech profile, GramAI recommends <span className="text-white font-bold">3 new internships</span> and <span className="text-white font-bold">2 skill development schemes</span>.
              </p>
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 border-0 font-semibold group-hover:gap-3 transition-all flex items-center justify-center">
              View Recommendations <ArrowRight className="ml-2 h-4 w-4 transition-all" />
            </Button>
          </CardContent>
        </Card>

        {/* Academic Calendar */}
        <Card className="bg-white dark:bg-card border border-border/50 shadow-lg hover:shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold font-heading flex items-center gap-3 text-foreground">
                <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                  <Calendar className="h-5 w-5" />
                </div>
                Academic Calendar
              </h2>
            </div>
            <div className="space-y-4">
              {calendarEvents.map((ev, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-muted/40 border border-border/50 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${ev.type === 'critical' ? 'bg-red-500' : ev.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                    <span className="font-semibold text-sm text-foreground">{ev.event}</span>
                  </div>
                  <Badge variant="outline" className="bg-background text-xs font-bold whitespace-nowrap">
                    {ev.date}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Digital Locker / Documents */}
        <Card className="bg-white dark:bg-card border border-border/50 shadow-lg hover:shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold font-heading flex items-center gap-3 text-foreground">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <FileDown className="h-5 w-5" />
                </div>
                Digital Locker
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/40 p-4 rounded-xl border border-border/50 text-center hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer transition-all group/doc">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover/doc:text-emerald-500 transition-colors" />
                <p className="text-xs font-bold text-foreground">Caste Cert.</p>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl border border-border/50 text-center hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer transition-all group/doc">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover/doc:text-emerald-500 transition-colors" />
                <p className="text-xs font-bold text-foreground">Income Cert.</p>
              </div>
              <div className="col-span-2 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-center flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Synced with DigiLocker</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 pt-2">
        
        {/* LEFT MAIN (Scholarships, Education Schemes) */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="p-0 shadow-lg bg-white dark:bg-card border border-border/50 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-4">
                <h2 className="text-2xl font-bold font-heading flex items-center gap-3 text-foreground">
                  <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Rocket className="h-6 w-6" />
                  </div>
                  Scholarship Board
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/schemes')}
                  className="hidden sm:flex text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-semibold rounded-xl"
                >
                  Browse All Options
                </Button>
              </div>
              
              {schemesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
              ) : schemes && schemes.length > 0 ? (
                <div className="space-y-4 relative z-10">
                  {schemes.map((scheme: any) => (
                    <div key={scheme.id} className="p-5 rounded-2xl bg-muted/20 border border-border/50 flex flex-col md:flex-row justify-between md:items-center gap-5 hover:border-indigo-500/50 hover:bg-muted/40 hover:shadow-md transition-all group">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{scheme.name}</h3>
                          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs shadow-sm shadow-cyan-500/20">
                            High Match
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed max-w-xl">{scheme.description}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs bg-background text-muted-foreground">{scheme.department}</Badge>
                          <Badge variant="outline" className="text-xs bg-background text-muted-foreground"><Clock className="w-3 h-3 mr-1 inline"/> Verified Scheme</Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate(`/dashboard/schemes/${scheme.id}`)}
                        className="shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md font-semibold px-6 py-5 rounded-xl"
                      >
                        Apply Now
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                  <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">No new schemes matching your profile.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (Application Tracker, Quick Services) */}
        <div className="space-y-6">
          
          {/* Quick Services (Glass Tiles) */}
          <Card className="p-6 shadow-lg border border-border/50 rounded-2xl bg-gradient-to-b from-card to-muted/20">
            <h2 className="text-lg font-bold font-heading mb-5 text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Quick Access
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Bus Pass', icon: Bus, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/10' },
                { name: 'Laptop Grant', icon: Laptop, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-500/10' },
                { name: 'Exam Fee', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' },
                { name: 'Skill Dev', icon: Award, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-500/10' }
              ].map((service, idx) => (
                <button key={idx} className={`flex flex-col items-center justify-center p-5 bg-background rounded-xl transition-all duration-300 border border-border/50 group hover:-translate-y-1 hover:shadow-sm ${service.border}`}>
                  <div className={`p-3 rounded-xl ${service.bg} mb-3 group-hover:scale-110 transition-transform`}>
                    <service.icon className={`h-6 w-6 ${service.color}`} />
                  </div>
                  <span className="text-xs font-bold text-foreground">{service.name}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Application Tracker */}
          <Card className="p-6 shadow-lg border border-border/50 rounded-2xl">
            <h2 className="text-lg font-bold font-heading mb-5 flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-indigo-500" /> My Applications
            </h2>
            <div className="space-y-4">
              {appsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : myApps && myApps.length > 0 ? (
                myApps.slice(0, 4).map((app: any) => (
                  <div 
                    key={app.id} 
                    onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                    className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm leading-tight text-foreground pr-2">
                        {app.scheme?.name || app.scheme_name || 'Scheme Application'}
                      </h4>
                      <Badge variant="outline" className={
                        app.status === 'APPROVED' 
                          ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shrink-0 font-bold' 
                          : app.status === 'REJECTED'
                            ? 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10 shrink-0 font-bold'
                            : 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 shrink-0 font-bold'
                      }>
                        {app.status === 'APPROVED' ? <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> : <Clock className="mr-1.5 h-3.5 w-3.5" />}
                        {app.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span className="bg-background px-2 py-0.5 rounded border border-border/50 font-mono text-[11px]">{app.application_id}</span>
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Draft'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  <p>No applications submitted yet.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/dashboard/schemes')}
                    className="mt-3 text-xs"
                  >
                    Explore Scholarships
                  </Button>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/applications')}
              className="w-full mt-4 border-dashed border-border/80 text-muted-foreground hover:text-foreground rounded-xl font-semibold"
            >
              Track All Applications
            </Button>
          </Card>

        </div>
      </div>
    </div>
  );
};
