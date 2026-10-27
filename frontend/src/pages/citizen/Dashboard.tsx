import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useMyApplications } from '../../hooks/useApplications';
import { useSchemes } from '../../hooks/useSchemes';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { 
  CloudSun, Bell, FileText, CheckCircle, Clock, 
  MapPin, Fingerprint, Sparkles, AlertCircle, ChevronRight,
  Landmark, UserCircle, Activity, Mic, Download, ArrowRight
} from 'lucide-react';

export const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  
  // Real authenticated citizen info
  const displayName = user?.email?.split('@')[0] || user?.phone_number || 'Citizen';
  const citizenId = user?.id ? `TG-CIT-${user.id.slice(0, 8).toUpperCase()}` : 'TG-CIT-PORTAL';
  const district = 'Telangana';

  const { data: realApplications, isLoading: appsLoading } = useMyApplications();
  const applications = realApplications?.slice(0, 4) || [];

  const { data: realSchemes, isLoading: schemesLoading } = useSchemes();
  const recommendations = realSchemes?.slice(0, 4) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans px-4 sm:px-6 lg:px-8 pb-16">
      
      {/* TOP HEADER: Personalized Greeting & Citizen Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 space-y-4">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-wider font-semibold">
            Digital Telangana Citizen Portal
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading tracking-tight">
            Namaskaram, {displayName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-primary-foreground/90 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 shadow-inner">
              <Fingerprint className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Citizen ID: {citizenId}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 shadow-inner">
              <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{district}, TS</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 shadow-inner">
              <CloudSun className="h-4 w-4 text-amber-300 shrink-0" />
              <span>32°C, Telangana</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => navigate('/voice')}
            className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 w-full sm:w-auto h-11 sm:h-12 rounded-xl transition-all"
          >
            <Mic className="mr-2 h-4 w-4" /> Voice Assistant
          </Button>
          <Button 
            onClick={() => navigate('/dashboard/schemes')}
            className="bg-white text-primary hover:bg-white/90 border-0 shadow-xl w-full sm:w-auto h-11 sm:h-12 rounded-xl transition-all font-semibold"
          >
            Explore Schemes
          </Button>
        </div>
      </div>

      {/* ANNOUNCEMENTS MARQUEE */}
      <Alert className="bg-accent/10 border-accent/20 flex items-center p-3 sm:p-4 rounded-2xl">
        <Bell className="h-5 w-5 text-accent shrink-0 mr-3" />
        <AlertDescription className="text-foreground text-xs sm:text-sm font-medium flex-1">
          <strong>Official Notification:</strong> Digital Telangana citizen services and welfare scheme applications are actively being processed. Track your submitted applications below.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Dash (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Recommendation Summary */}
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-card to-muted/20 border-primary/10 shadow-sm relative overflow-hidden rounded-3xl transition-shadow hover:shadow-md">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles className="h-32 w-32 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-2xl">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading">Recommended Welfare Schemes</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard/schemes')}
                className="text-xs text-primary"
              >
                Browse All <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
            <p className="text-muted-foreground mb-6 relative z-10 text-sm sm:text-base">
              Based on your citizen profile and state welfare guidelines, here are the top schemes available for application:
            </p>

            {schemesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {recommendations.map((rec: any) => (
                  <div 
                    key={rec.id} 
                    onClick={() => navigate(`/dashboard/schemes/${rec.id}`)}
                    className="bg-background/80 backdrop-blur p-4 sm:p-5 rounded-2xl border border-border/60 flex flex-col justify-between gap-3 shadow-sm hover:border-primary/50 transition-all hover:-translate-y-1 cursor-pointer group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">{rec.name}</span>
                        <Badge className="shrink-0 bg-primary/10 text-primary border-0 text-[10px] font-semibold">Eligible</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs text-primary font-medium">
                      <span>{rec.department || 'Telangana Govt'}</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-2xl border border-dashed border-border/60">
                <p className="text-sm text-muted-foreground">No active schemes currently listed. Check back shortly.</p>
              </div>
            )}
          </Card>

          {/* Applications & Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-base font-bold font-heading flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Application Status
                </h2>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/dashboard/applications')}>View All</Button>
              </div>
              <div className="space-y-3">
                {appsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-border/50 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-2">No applications submitted yet.</p>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate('/dashboard/schemes')}>
                      Apply Now
                    </Button>
                  </div>
                ) : (
                  applications.map((app: any) => (
                    <div 
                      key={app.id} 
                      className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-border/50 cursor-pointer hover:bg-muted transition-colors" 
                      onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">{app.scheme?.name || 'Welfare Application'}</h4>
                        <p className="text-[11px] text-muted-foreground">{app.application_id}</p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-[10px] ${
                        app.status === 'APPROVED' ? 'border-success/50 text-success bg-success/10' : 
                        app.status === 'REJECTED' ? 'border-destructive/50 text-destructive bg-destructive/10' :
                        'border-warning/50 text-warning bg-warning/10'
                      }`}>
                        {app.status === 'APPROVED' ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                        {app.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-base font-bold font-heading flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Recent Activity
                </h2>
              </div>
              <div className="relative border-l-2 border-muted ml-3 space-y-5">
                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-primary rounded-full -left-[6px] top-1.5 border-2 border-background"></div>
                  <p className="text-xs sm:text-sm font-semibold">Account Active</p>
                  <p className="text-[11px] text-muted-foreground">Logged in via Digital Telangana Portal</p>
                </div>
                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-muted-foreground rounded-full -left-[6px] top-1.5 border-2 border-background"></div>
                  <p className="text-xs sm:text-sm font-semibold">Eligibility Profile Synchronized</p>
                  <p className="text-[11px] text-muted-foreground">Schemes matched to citizen persona</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Services & Profile */}
        <div className="space-y-6">
          
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-0 shadow-lg rounded-3xl">
            <h2 className="text-base font-bold font-heading mb-4">Citizen Profile</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <UserCircle className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">{displayName}</p>
                <p className="text-xs text-primary-foreground/75 truncate">{user?.email || user?.phone_number}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-foreground/20 text-white rounded text-[10px] font-medium">General Citizen</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/profile')}
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/25 text-xs rounded-xl"
            >
              Manage Profile
            </Button>
          </Card>

          <Card className="p-5 sm:p-6 rounded-2xl border-border/60">
            <h2 className="text-base font-bold font-heading mb-4 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" /> Quick Citizen Services
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Apply Scheme', icon: FileText, action: () => navigate('/dashboard/schemes') },
                { name: 'Track Status', icon: Activity, action: () => navigate('/dashboard/applications') },
                { name: 'Voice Help', icon: Mic, action: () => navigate('/voice') },
                { name: 'My Profile', icon: UserCircle, action: () => navigate('/dashboard/profile') }
              ].map((service, idx) => (
                <button 
                  key={idx} 
                  onClick={service.action}
                  className="flex flex-col items-center justify-center p-3.5 bg-muted/30 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors border border-border/50 group"
                >
                  <service.icon className="h-5 w-5 mb-1.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs font-semibold text-center">{service.name}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6 bg-accent/5 border-accent/20 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="bg-accent/10 p-2.5 rounded-xl shrink-0">
                <Bell className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1 text-foreground">Assistance Hotline</h3>
                <p className="text-xs text-muted-foreground mb-3">Need help with applications or documentation? Contact the Telangana Meeseva helpline at 1100.</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate('/voice')}
                  className="border-accent text-accent hover:bg-accent hover:text-white text-xs rounded-lg"
                >
                  Ask Voice Assistant
                </Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
