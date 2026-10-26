import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useLocation } from '../../hooks/useLocation';
import { useSchemes, useApplications, useApplyScheme } from '../../hooks/useSchemes';
import { useMarketPrices, useWeather } from '../../hooks/useAgriculture';
import { VoiceAssistant } from '../../components/custom/VoiceAssistant';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog';
import { 
  Tractor, CloudSun, MapPin, Droplets, ArrowRight, BookOpen,
  Sprout, Wind, TrendingUp, FileText, CheckCircle, Clock, PlayCircle,
  Leaf, AlertTriangle, Newspaper, ShieldCheck, ExternalLink, Info,
  Sun, Thermometer, BarChart3, Wheat, IndianRupee, CalendarDays
} from 'lucide-react';

export const FarmerDashboard = () => {
  const user = useAuthStore(state => state.user);
  const location = useLocation();
  
  const { data: schemes, isLoading: schemesLoading } = useSchemes('farmer');
  const { data: applications, isLoading: appsLoading } = useApplications();
  const applyMutation = useApplyScheme();

  const { data: prices, isLoading: pricesLoading } = useMarketPrices();
  const { data: weather, isLoading: weatherLoading } = useWeather(location.address ? location.address : '');

  const [highlightedSchemes, setHighlightedSchemes] = useState(false);
  const [guidebookOpen, setGuidebookOpen] = useState(false);

  const soilInfo = {
    type: 'Black Cotton',
    ph: 6.8,
    moisture: '42%',
    nitrogen: 'Medium'
  };

  const advisories = [
    { type: 'Pest Alert', message: 'High risk of Pink Bollworm in Cotton. Spray recommended.', severity: 'high' as const },
    { type: 'Weather', message: 'Heavy rains expected in 48 hours. Postpone harvesting.', severity: 'medium' as const }
  ];

  const handleVoiceCommand = (intent: string, text: string) => {
    if (intent === 'SHOW_SCHEMES') {
      setHighlightedSchemes(true);
      setTimeout(() => {
        document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };

  const handleApply = (schemeId: string) => {
    applyMutation.mutate(schemeId);
  };

  const isApplied = (schemeId: string) => {
    if (!applications) return false;
    return applications.some((app: any) => app.scheme.id === schemeId);
  };

  const displayName = user?.email?.split('@')[0] || 'Farmer';
  const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-24">

      {/* ═══════════════════════════════════════════ */}
      {/* HERO HEADER                                */}
      {/* ═══════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8 md:p-10 shadow-2xl">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        <div className="absolute -bottom-16 -right-16 opacity-[0.04] pointer-events-none">
          <Tractor className="w-80 h-80 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-md px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-semibold shadow-sm">
                <Leaf className="w-3 h-3 mr-1.5 text-emerald-200" />
                Telangana Agriculture Portal
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading tracking-tight text-white leading-[1.1]">
              Namaskaram,<br />{displayName}
            </h1>
            <p className="text-emerald-100/80 text-sm max-w-md">{currentDate}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-sm text-white/90">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
                <span className="font-medium">TG-FRM-8302</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-sm text-white/90">
                <MapPin className="h-3.5 w-3.5 text-sky-300" />
                <span className="font-medium">{location.loading ? 'Locating...' : location.address || 'Telangana'}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats in Header */}
          <div className="flex items-end gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[100px]">
              <p className="text-3xl font-bold text-white">
                {applications?.length || 0}
              </p>
              <p className="text-emerald-100/70 text-xs font-medium mt-1">Applications</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[100px]">
              <p className="text-3xl font-bold text-white">
                {schemes?.length || 0}
              </p>
              <p className="text-emerald-100/70 text-xs font-medium mt-1">Eligible Schemes</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* NEWS TICKER                                */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-3.5">
        <div className="bg-amber-500/20 rounded-lg p-2 shrink-0">
          <Newspaper className="h-4 w-4 text-amber-400" />
        </div>
        <p className="text-sm font-medium text-foreground flex-1">
          <span className="text-amber-400 font-bold mr-2">Breaking:</span>
          Telangana Govt releases ₹7,500 Cr for Rythu Bandhu Kharif season. Check your bank status immediately.
        </p>
      </div>

      <VoiceAssistant onCommandMatch={handleVoiceCommand} />

      {/* ═══════════════════════════════════════════ */}
      {/* METRICS ROW (4 cards)                      */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Weather */}
        <Card className="bg-card border-border/50 hover:border-amber-500/40 transition-all duration-300 group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <CloudSun className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Weather</span>
            </div>
            {weatherLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : weather ? (
              <div>
                <p className="text-3xl font-bold text-foreground">{weather.temperature}°C</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{weather.humidity}%</span>
                  <span className="flex items-center gap-1"><Wind className="h-3 w-3" />12 km/h</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Location disabled</p>
            )}
          </CardContent>
        </Card>

        {/* Market Prices */}
        <Card className="bg-card border-border/50 hover:border-emerald-500/40 transition-all duration-300 group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Mandi</span>
            </div>
            {pricesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : prices && prices.length > 0 ? (
              <div className="space-y-2">
                {prices.slice(0, 2).map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground">{p.crop_name}</span>
                    <span className="font-bold text-emerald-400">₹{p.price_per_quintal}/q</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sync pending</p>
            )}
          </CardContent>
        </Card>

        {/* Soil Profile */}
        <Card className="bg-card border-border/50 hover:border-orange-500/40 transition-all duration-300 group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500/10 p-2 rounded-xl text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Soil</span>
            </div>
            <p className="text-lg font-bold text-foreground mb-1">{soilInfo.type}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span>pH <strong className="text-foreground">{soilInfo.ph}</strong></span>
              <span>•</span>
              <span>Moisture <strong className="text-foreground">{soilInfo.moisture}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Crop Advisory Quick */}
        <Card className="bg-card border-border/50 hover:border-red-500/40 transition-all duration-300 group">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500/10 p-2 rounded-xl text-red-400 group-hover:bg-red-500/20 transition-colors">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Alerts</span>
            </div>
            <p className="text-lg font-bold text-foreground mb-1">{advisories.length} Active</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{advisories[0].message}</p>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* MAIN CONTENT (2-column)                    */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-6" id="schemes-section">

        {/* LEFT: Schemes (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`bg-card rounded-2xl border border-border/50 p-6 transition-all duration-500 ${highlightedSchemes ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <Tractor className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-heading text-foreground">Eligible Schemes</h2>
                  <p className="text-xs text-muted-foreground">Government schemes you qualify for</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGuidebookOpen(true)}
                className="rounded-full border-primary/30 text-primary hover:bg-primary/10 text-xs gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Guide Book
              </Button>
            </div>

            {schemesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-36 w-full rounded-xl" />
              </div>
            ) : schemes && schemes.length > 0 ? (
              <div className="space-y-4">
                {schemes.map((scheme: any) => {
                  const alreadyApplied = isApplied(scheme.id);
                  return (
                    <div key={scheme.id} className="rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 transition-all duration-200 overflow-hidden">
                      {/* Scheme Header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-base text-foreground">{scheme.name}</h3>
                              <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px] font-semibold px-2 py-0.5">AI Matched</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{scheme.description}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="text-[11px] bg-card border-border/60">{scheme.department}</Badge>
                          {scheme.category && <Badge variant="outline" className="text-[11px] bg-card border-border/60">{scheme.category}</Badge>}
                        </div>

                        {/* Inline Application Guide */}
                        {scheme.application_process && (
                          <div className="border-l-2 border-primary/40 pl-4 py-2 bg-primary/5 rounded-r-lg mb-4">
                            <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Info className="h-3 w-3" /> How to Apply
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{scheme.application_process}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                          {scheme.official_link && (
                            <a 
                              href={scheme.official_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-primary hover:underline flex items-center gap-1 w-full sm:w-auto"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> Official Portal
                            </a>
                          )}
                          <div className="sm:ml-auto w-full sm:w-auto">
                            <Button 
                              onClick={() => handleApply(scheme.id)}
                              disabled={alreadyApplied || applyMutation.isPending}
                              size="sm"
                              className={`w-full sm:w-auto rounded-lg text-xs font-semibold transition-all ${
                                alreadyApplied 
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                              }`}
                            >
                              {alreadyApplied ? <><CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Applied</> : 'Mark as Applied'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 rounded-xl border border-dashed border-border/50">
                <Tractor className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">No matching schemes found for your profile.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">

          {/* Scheme Guide Book Card */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-card border-blue-500/20 hover:border-blue-500/40 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/15 p-2.5 rounded-xl text-blue-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Guide Book</h3>
                  <p className="text-[11px] text-muted-foreground">Step-by-step help</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Learn how to gather documents, fill forms, and track your applications.
              </p>
              <Button 
                onClick={() => setGuidebookOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md"
              >
                <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Open Guide Book
              </Button>
            </CardContent>
          </Card>

          {/* My Applications */}
          <Card className="bg-card border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">My Applications</h3>
                  <p className="text-[11px] text-muted-foreground">Track your status</p>
                </div>
              </div>

              {appsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.map((app: any) => (
                    <div key={app.id} className="p-3 bg-muted/20 rounded-xl border border-border/40">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h4 className="font-semibold text-xs text-foreground leading-tight">{app.scheme.name}</h4>
                        <Badge 
                          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 ${
                            app.status === 'Approved' 
                              ? 'bg-emerald-500/15 text-emerald-400 border-0'
                              : 'bg-amber-500/15 text-amber-400 border-0'
                          }`}
                        >
                          {app.status === 'Approved' ? <CheckCircle className="mr-1 h-2.5 w-2.5" /> : <Clock className="mr-1 h-2.5 w-2.5" />}
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{app.application_id}</span>
                        <span>{new Date(app.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-xl border border-dashed border-border/40">
                  <p className="text-muted-foreground text-xs">No applications yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Crop Advisory */}
          <Card className="bg-card border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/10 p-2.5 rounded-xl text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">AI Crop Advisory</h3>
                  <p className="text-[11px] text-muted-foreground">Active alerts</p>
                </div>
              </div>
              <div className="space-y-3">
                {advisories.map((adv, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-muted/20 rounded-xl border border-border/40">
                    <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                      adv.severity === 'high' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-foreground">{adv.type}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{adv.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* GUIDEBOOK MODAL                            */}
      {/* ═══════════════════════════════════════════ */}
      <Dialog open={guidebookOpen} onOpenChange={setGuidebookOpen}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-500/15 rounded-xl text-blue-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-heading">Scheme Application Guide</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">Step-by-step instructions for Telangana farmers</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-5">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
              <div className="w-px h-full bg-border mt-2"></div>
            </div>
            <div className="pb-2">
              <h4 className="font-bold text-sm text-foreground mb-1">Gather Your Documents</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Keep your <strong>Pattadar Passbook</strong>, <strong>Aadhaar Card</strong>, and <strong>Bank Passbook</strong> ready. Ensure names match across all documents.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">2</div>
              <div className="w-px h-full bg-border mt-2"></div>
            </div>
            <div className="pb-2">
              <h4 className="font-bold text-sm text-foreground mb-1">Select & Apply</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">Browse <strong>Eligible Schemes</strong>. Click <strong>"Mark as Applied"</strong> if done offline, or use <strong>"Visit Official Portal"</strong> for online application.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">3</div>
            </div>
            <div className="pb-2">
              <h4 className="font-bold text-sm text-foreground mb-1">Track Your Application</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">GramAI automatically tracks your application status and updates the <strong>"My Applications"</strong> section in real time.</p>
            </div>
          </div>
          
          {/* Video Help */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
            <PlayCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-sm text-foreground">Need more help?</h5>
              <p className="text-xs text-muted-foreground mt-1">Watch our video tutorial on how to apply for Rythu Bandhu scheme online.</p>
              <Button variant="link" className="text-amber-400 p-0 h-auto mt-2 font-bold text-xs">Watch Video Tutorial →</Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
