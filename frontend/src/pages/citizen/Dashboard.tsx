import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useMyApplications } from '../../hooks/useApplications';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { 
  CloudSun, Bell, FileText, CheckCircle, Clock, 
  MapPin, Fingerprint, Sparkles, AlertCircle, ChevronRight,
  Landmark, UserCircle, Activity, Mic, Download
} from 'lucide-react';

export const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  
  // Mock data for the demonstration
  const citizenData = {
    name: 'Ramudu P.',
    id: 'TG-CIT-9402X',
    district: 'Hyderabad',
    weather: '32°C, Sunny',
    profileCompletion: 85
  };

  const { data: realApplications } = useMyApplications();
  const applications = realApplications?.slice(0, 3) || [];

  const recommendations = [
    { name: 'Kalyana Lakshmi Scheme', tag: 'High Match' },
    { name: 'Chief Minister Relief Fund', tag: 'Eligible' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* TOP HEADER: Personalized Greeting & Citizen Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Abstract Premium Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 space-y-4">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-wider font-semibold">
            Digital Telangana Citizen Portal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">
            Namaskaram, {citizenData.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-primary-foreground/90 text-sm font-medium">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-inner">
              <Fingerprint className="h-4 w-4 text-emerald-400" />
              Citizen ID: {citizenData.id}
            </div>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-inner">
              <MapPin className="h-4 w-4 text-emerald-400" />
              {citizenData.district}, TS
            </div>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-inner">
              <CloudSun className="h-4 w-4 text-amber-300" />
              {citizenData.weather}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-6 md:mt-0">
          <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 w-full sm:w-auto h-12 rounded-xl transition-all">
            <Mic className="mr-2 h-4 w-4" /> Voice Assistant
          </Button>
          <Button className="bg-white text-primary hover:bg-white/90 border-0 shadow-xl w-full sm:w-auto h-12 rounded-xl transition-all font-semibold">
            <Download className="mr-2 h-4 w-4" /> E-Card
          </Button>
        </div>
      </div>

      {/* ANNOUNCEMENTS MARQUEE */}
      <Alert className="bg-accent/10 border-accent/20 flex items-center p-3 rounded-2xl">
        <Bell className="h-5 w-5 text-accent shrink-0 mr-3" />
        <AlertDescription className="text-foreground font-medium flex-1 overflow-hidden">
          <div className="animate-pulse">
            <strong>Official Announcement:</strong> The deadline for Rythu Bandhu Kharif 2026 applications has been extended to November 15th. Please ensure your e-KYC is complete.
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Dash */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Recommendation Summary */}
          <Card className="p-8 bg-gradient-to-br from-card to-muted/20 border-primary/10 shadow-sm relative overflow-hidden rounded-3xl transition-shadow hover:shadow-md">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles className="h-32 w-32 text-primary" />
            </div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-heading">AI Recommendation Summary</h2>
            </div>
            <p className="text-muted-foreground mb-8 relative z-10 text-lg">
              Based on your profile (<span className="font-semibold text-foreground">{citizenData.profileCompletion}% complete</span>) and location in <span className="font-semibold text-foreground">{citizenData.district}</span>, GramAI has found new benefits for you.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 relative z-10">
              {recommendations.map((rec, i) => (
                <div key={i} className="bg-background/80 backdrop-blur p-5 rounded-2xl border flex flex-col gap-2 shadow-sm hover:border-primary/50 transition-all hover:-translate-y-1 group">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{rec.name}</span>
                  </div>
                  <Badge className="w-max bg-success/10 text-success-foreground border-0">{rec.tag}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Applications & Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Application Status
                </h2>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/dashboard/applications')}>View All</Button>
              </div>
              <div className="space-y-4">
                {applications.length === 0 && <p className="text-sm text-muted-foreground">No applications found.</p>}
                {applications.map((app: any) => (
                  <div key={app.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-border/50 cursor-pointer hover:bg-muted" onClick={() => navigate(`/dashboard/applications/${app.id}`)}>
                    <div>
                      <h4 className="font-semibold text-sm">{app.scheme?.name || 'Unknown Scheme'}</h4>
                      <p className="text-xs text-muted-foreground">{app.application_id}</p>
                    </div>
                    <Badge variant="outline" className={
                      app.status === 'APPROVED' ? 'border-success/50 text-success bg-success/10' : 
                      app.status === 'REJECTED' ? 'border-destructive/50 text-destructive bg-destructive/10' :
                      'border-warning/50 text-warning bg-warning/10'
                    }>
                      {app.status === 'APPROVED' ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Recent Activity
                </h2>
              </div>
              <div className="relative border-l-2 border-muted ml-3 space-y-6">
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 border-2 border-background"></div>
                  <p className="text-sm font-semibold">Profile updated</p>
                  <p className="text-xs text-muted-foreground">Today at 10:30 AM</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-muted-foreground rounded-full -left-[7px] top-1.5 border-2 border-background"></div>
                  <p className="text-sm font-semibold">Logged in via Portal</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Services & Profile */}
        <div className="space-y-6">
          
          <Card className="p-6 bg-primary text-primary-foreground border-0 shadow-lg">
            <h2 className="text-lg font-bold font-heading mb-4">Profile Summary</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <UserCircle className="h-10 w-10 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">{citizenData.name}</p>
                <p className="text-sm text-primary-foreground/70">Aadhaar Verified</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile Completion</span>
                <span className="font-bold">{citizenData.profileCompletion}%</span>
              </div>
              <div className="w-full bg-primary-foreground/20 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${citizenData.profileCompletion}%` }}></div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" /> Quick Services
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Apply Scheme', icon: FileText },
                { name: 'Track Status', icon: Activity },
                { name: 'Grievance', icon: AlertCircle },
                { name: 'Certificates', icon: Landmark }
              ].map((service, idx) => (
                <button key={idx} className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors border border-border/50 group">
                  <service.icon className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs font-semibold text-center">{service.name}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-accent/5 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="bg-accent/10 p-3 rounded-full">
                <Bell className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold font-heading mb-1 text-accent">Action Required</h3>
                <p className="text-sm text-muted-foreground mb-3">Your annual life certificate for Aasara pension is due in 15 days.</p>
                <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                  Submit Now
                </Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
