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
  Heart, MapPin, Activity, ShieldCheck, ArrowRight,
  Phone, Mic, Bell, Stethoscope, Landmark, 
  HelpCircle, CreditCard, Sparkles
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useMyApplications } from '../../hooks/useApplications';

export const SeniorCitizenDashboard = () => {
  const user = useAuthStore(state => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data: schemes, isLoading: schemesLoading } = useSchemes('senior');
  const { data: myApps, isLoading: appsLoading } = useMyApplications();

  const seniorName = user?.email?.split('@')[0] || user?.phone_number || 'Elder Citizen';
  const seniorId = user?.id ? `TG-SNR-${user.id.slice(0, 6).toUpperCase()}` : 'TG-SNR-4890';

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans animate-in fade-in duration-700 px-4 sm:px-6 lg:px-8 pb-16">
      
      {/* PREMIUM HEADER: High contrast, glassmorphism, dynamic elements */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-amber-400/20 group">
        
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 mix-blend-overlay transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 transition-transform duration-1000 group-hover:scale-110"></div>

        <div className="absolute -bottom-16 -right-16 opacity-5 pointer-events-none transform -rotate-12 scale-150 animate-pulse">
          <Heart className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 space-y-4 flex-1">
          <Badge className="bg-white/20 text-white text-sm px-4 py-1.5 border border-white/30 backdrop-blur-xl shadow-lg rounded-full flex w-fit items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-200" /> Senior Citizen Portal
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold font-heading leading-tight drop-shadow-lg tracking-tight">
            Namaskaram, <br className="hidden md:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-200">
              {seniorName}
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-white/95 text-base font-medium mt-2">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-inner hover:bg-black/30 transition-colors">
              <ShieldCheck className="h-5 w-5 text-amber-300" />
              ID: {seniorId}
            </div>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-inner hover:bg-black/30 transition-colors">
              <MapPin className="h-5 w-5 text-amber-300" />
              {location.loading ? 'Locating...' : location.address || 'Telangana'}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto mt-6 md:mt-0">
          {/* Animated Voice Button */}
          <div className="relative group/btn">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-white rounded-2xl blur opacity-30 group-hover/btn:opacity-60 transition duration-1000 group-hover/btn:duration-200 animate-pulse"></div>
            <Button 
              onClick={() => navigate('/voice')}
              className="relative w-full md:w-auto bg-white text-amber-800 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 text-lg py-6 px-8 rounded-2xl shadow-xl border border-white/50 flex items-center justify-center font-bold"
            >
              <Mic className="mr-3 h-6 w-6 text-amber-600 animate-bounce" /> Tap to Speak
            </Button>
          </div>
          
          <a 
            href="tel:14567" 
            className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-300 text-base py-3 px-6 rounded-2xl shadow-lg border border-red-500/50 flex items-center justify-center font-bold overflow-hidden relative"
          >
            <Phone className="mr-2 h-5 w-5" /> Emergency Help (14567)
          </a>
        </div>
      </div>

      {/* PREMIUM ALERT BANNER */}
      <Alert className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-l-4 border-emerald-500 flex items-center p-4 rounded-2xl shadow-md backdrop-blur-xl border-t border-r border-b border-emerald-500/20 hover:shadow-lg transition-shadow">
        <div className="bg-emerald-500/20 p-2 rounded-xl mr-4">
          <Bell className="h-6 w-6 text-emerald-600 shrink-0 animate-[ring_2s_infinite]" />
        </div>
        <AlertDescription className="text-foreground text-base font-semibold flex-1 tracking-tight">
          Attention: Your November pension has been successfully credited to your bank account.
        </AlertDescription>
      </Alert>

      {/* TOP METRICS (Glassmorphism Cards) */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Pension Status */}
        <Card className="bg-card/80 backdrop-blur-xl border-t-4 border-t-emerald-500 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Pension Status</h2>
            </div>
            <div className="text-base text-muted-foreground mb-6 font-medium">
              Your Aasara Pension is <span className="text-emerald-700 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-sm ml-1.5">Active</span>
            </div>
            <Button className="w-full text-base py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-emerald-500/25 transition-all group-hover:gap-3 flex items-center justify-center font-semibold">
              View Passbook <ArrowRight className="ml-2 h-5 w-5 transition-all" />
            </Button>
          </CardContent>
        </Card>

        {/* Healthcare */}
        <Card className="bg-card/80 backdrop-blur-xl border-t-4 border-t-blue-500 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-500/10 p-3 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Healthcare</h2>
            </div>
            <div className="text-base text-muted-foreground mb-6 font-medium">
              Aarogyasri Health Insurance is <span className="text-blue-700 font-bold bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 shadow-sm ml-1.5">Valid</span>
            </div>
            <Button className="w-full text-base py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-blue-500/25 transition-all group-hover:gap-3 flex items-center justify-center font-semibold">
              Find Hospital <ArrowRight className="ml-2 h-5 w-5 transition-all" />
            </Button>
          </CardContent>
        </Card>

      </div>

      <div className="grid lg:grid-cols-3 gap-6 pt-2">
        
        {/* LEFT MAIN (Welfare Schemes) */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="p-6 shadow-xl bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/60 relative z-10">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Landmark className="h-7 w-7 text-amber-500" /> Welfare Schemes
              </h2>
            </div>
            
            {schemesLoading ? (
              <div className="space-y-4 relative z-10">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : schemes && schemes.length > 0 ? (
              <div className="space-y-4 relative z-10">
                {schemes.map((scheme: any) => (
                  <div key={scheme.id} className="p-6 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors border border-border/50 flex flex-col md:flex-row justify-between md:items-center gap-6 group">
                    <div>
                      <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-amber-600 transition-colors">{scheme.name}</h3>
                      <p className="text-muted-foreground text-base mb-3 leading-relaxed">{scheme.description}</p>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-sm px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                        {scheme.department}
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => navigate(`/dashboard/schemes/${scheme.id}`)}
                      className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-base py-5 px-8 rounded-xl shadow-md hover:shadow-amber-500/25 hover:-translate-y-0.5 transition-all"
                    >
                      Apply Now
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border/50 relative z-10">
                <Sparkles className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-lg font-medium">No new schemes at this time.</p>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN (Quick Help, Services) */}
        <div className="space-y-6">
          
          {/* Quick Services */}
          <Card className="p-6 shadow-xl bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
            
            <h2 className="text-xl font-bold text-foreground mb-6 relative z-10">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 relative z-10">
              {[
                { name: 'Voice Assistance', icon: Mic, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hover: 'hover:bg-amber-500/20 hover:border-amber-500/40', action: () => navigate('/voice') },
                { name: 'Browse All Schemes', icon: Landmark, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hover: 'hover:bg-blue-500/20 hover:border-blue-500/40', action: () => navigate('/dashboard/schemes') },
                { name: 'My Applications', icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hover: 'hover:bg-emerald-500/20 hover:border-emerald-500/40', action: () => navigate('/dashboard/applications') }
              ].map((service, idx) => (
                <button 
                  key={idx} 
                  onClick={service.action}
                  className={`flex items-center p-4 ${service.bg} rounded-xl transition-all duration-300 border ${service.border} ${service.hover} group hover:-translate-y-0.5 hover:shadow-sm text-left`}
                >
                  <div className={`p-2.5 rounded-lg bg-white/50 dark:bg-black/20 ${service.color} mr-4 group-hover:scale-110 transition-transform`}>
                    <service.icon className="h-5 w-5" />
                  </div>
                  <span className="text-base font-bold text-foreground">{service.name}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Applications */}
          <Card className="p-6 shadow-xl bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-xl"></div>
            
            <h2 className="text-xl font-bold text-foreground mb-6 relative z-10">My Applications</h2>
            <div className="space-y-4 relative z-10">
              {appsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : myApps && myApps.length > 0 ? (
                myApps.slice(0, 3).map((app: any) => (
                  <div 
                    key={app.id} 
                    onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                    className="p-4 bg-muted/30 rounded-xl border border-border/60 hover:bg-muted/50 cursor-pointer transition-colors group hover:shadow-sm"
                  >
                    <h4 className="font-semibold text-base text-foreground mb-3 group-hover:text-primary transition-colors">
                      {app.scheme?.name || app.scheme_name || 'Scheme Application'}
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-mono text-muted-foreground font-medium">{app.application_id}</span>
                      <Badge className={`text-xs px-3 py-1 rounded-full shadow-sm border ${
                        app.status === 'APPROVED' 
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                          : app.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                  <p>No active applications found.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/dashboard/schemes')}
                    className="mt-3 text-xs"
                  >
                    Explore Senior Schemes
                  </Button>
                </div>
              )}
            </div>
            {myApps && myApps.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/applications')}
                className="w-full mt-4 text-sm font-semibold rounded-xl"
              >
                View All Applications
              </Button>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};
