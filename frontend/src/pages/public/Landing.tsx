import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Mic, ArrowRight, CheckCircle2, Tractor, 
  GraduationCap, Heart, Building2, Bell, Quote, 
  ChevronRight, Calendar, User, FileText
} from 'lucide-react';

import { GovEmblem } from '../../components/custom/GovEmblem';
import { Footer } from '../../components/layout/Footer';
import bgVideo from '../../assets/videos/Drone Shots of our Village _ Dji Mini 3 Pro Cinematic Shots 4K _ My village_1080p.mp4';

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-24 md:pt-16 md:pb-32 px-4 overflow-hidden border-b min-h-[85vh] flex flex-col justify-center">
          {/* Background Video */}
          <div className="absolute inset-0 z-0 w-full h-full">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="object-cover w-full h-full"
            >
              <source src={bgVideo} type="video/mp4" />
            </video>
            {/* Overlays for readability and fading into the next section */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60"></div>
          </div>
          
          <div className="container mx-auto max-w-5xl relative z-10 text-center">
            <FadeIn>
              <Badge variant="outline" className="mb-6 px-4 py-1 text-sm border-primary/20 bg-primary/5 text-primary">
                Official Telangana Government Initiative
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight text-foreground leading-tight mb-6">
                Discover Your Eligibility with <span className="text-primary">GramAI</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Empowering the citizens of Telangana. Search for government schemes, subsidies, and services instantly using advanced AI and Voice recognition in Telugu and English.
              </p>
            </FadeIn>

            <FadeIn delay={0.2} className="max-w-2xl mx-auto">
              <div className="relative group flex items-center">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full transition-opacity opacity-0 group-hover:opacity-100"></div>
                <div className="relative flex w-full items-center bg-card border rounded-full shadow-lg p-2 transition-all hover:shadow-xl focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent z-10">
                  <Search className="h-6 w-6 text-muted-foreground ml-4 mr-2" />
                  <Input 
                    type="text" 
                    placeholder="Search schemes, type your need, or ask a question..." 
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-12 shadow-none px-2"
                  />
                  <div className="hidden sm:block w-px h-8 bg-border mx-2"></div>
                  <Button variant="ghost" size="icon" className="hidden sm:flex text-primary hover:text-primary/80 hover:bg-primary/10 rounded-full h-10 w-10 shrink-0 mx-1">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button onClick={() => navigate('/register')} className="rounded-full h-12 px-8 ml-2 shadow-md">
                    Search AI
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Trending Searches:</span>
                <Badge variant="secondary" className="font-normal cursor-pointer hover:bg-secondary/80">Rythu Bandhu</Badge>
                <Badge variant="secondary" className="font-normal cursor-pointer hover:bg-secondary/80">Aarogyasri</Badge>
                <Badge variant="secondary" className="font-normal cursor-pointer hover:bg-secondary/80">Student Scholarships</Badge>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* CHIEF MINISTER MESSAGE */}
        <section className="py-20 bg-card border-b">
          <div className="container mx-auto px-4 max-w-5xl">
            <FadeIn>
              <div className="flex flex-col md:flex-row items-center gap-10 bg-background rounded-3xl p-8 md:p-12 border shadow-sm">
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-muted shadow-md bg-muted">
                    <img 
                      src="/cm.png" 
                      alt="Hon'ble Chief Minister of Telangana" 
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <Quote className="h-10 w-10 text-primary/20 mb-4" />
                  <h3 className="text-2xl font-bold font-heading mb-4">A Digital Telangana for Every Citizen</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6 text-lg italic">
                    "Our vision is to bring government services directly to the people, ensuring transparency, accessibility, and speed. Through AI and voice technology, GramAI breaks the digital divide and empowers farmers, students, and seniors across the state."
                  </p>
                  <div>
                    <div className="font-semibold text-foreground">Sri A. Revanth Reddy</div>
                    <div className="text-sm text-muted-foreground">Hon'ble Chief Minister, Telangana</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FEATURED SCHEMES */}
        <section id="schemes" className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Featured State Schemes</h2>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Explore the flagship welfare programs currently active in Telangana.
                </p>
              </FadeIn>
              <FadeIn delay={0.2} className="mt-4 md:mt-0">
                <Button variant="outline" onClick={() => navigate('/register')}>
                  View All Schemes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </FadeIn>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Rythu Bandhu", category: "Agriculture", desc: "Investment support scheme for farmers providing ₹10,000 per acre per year.", icon: Tractor },
                { title: "Aarogyasri", category: "Health", desc: "Premium healthcare access and financial protection to BPL families.", icon: Heart },
                { title: "Kalyana Lakshmi", category: "Welfare", desc: "Financial assistance for the marriage of girls from minority families.", icon: User },
              ].map((scheme, i) => (
                <FadeIn key={scheme.title} delay={0.1 * i}>
                  <Card hoverable className="h-full flex flex-col group cursor-pointer" onClick={() => navigate('/register')}>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-primary/10 p-3 rounded-lg text-primary">
                          <scheme.icon className="h-6 w-6" />
                        </div>
                        <Badge variant="outline">{scheme.category}</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{scheme.title}</h3>
                      <p className="text-muted-foreground mb-6 flex-1">{scheme.desc}</p>
                      <div className="flex items-center text-sm font-medium text-primary mt-auto">
                        Check Eligibility <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CITIZEN SERVICES GRID */}
        <section id="services" className="py-24 bg-muted/30 border-y">
          <div className="container mx-auto px-4 max-w-6xl">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Services Tailored For You</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Select your profile to discover personalized government benefits.
              </p>
            </FadeIn>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Tractor, title: "Farmers", desc: "Subsidies, crop insurance, and equipment grants.", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
                { icon: GraduationCap, title: "Students", desc: "Scholarships, fee reimbursement, and hostels.", color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
                { icon: Heart, title: "Senior Citizens", desc: "Voice-guided assistance for pensions and healthcare.", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
                { icon: Building2, title: "Gov Officers", desc: "Verify eligibility quickly and reduce paperwork.", color: "text-info", bg: "bg-info/10", border: "border-info/20" }
              ].map((user, i) => (
                <FadeIn key={user.title} delay={0.1 * i}>
                  <Card hoverable className={`h-full overflow-hidden border-2 transition-colors ${user.border}`}>
                    <CardContent className="p-8 text-center flex flex-col items-center">
                      <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-6 shadow-sm ${user.bg}`}>
                        <user.icon className={`h-8 w-8 ${user.color}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{user.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">{user.desc}</p>
                      <Button variant="outline" size="sm" className="w-full mt-auto rounded-full" onClick={() => navigate('/register')}>Select Profile</Button>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* AI CHAT PREVIEW (Trust & Tech) */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <FadeIn className="w-full lg:w-1/2">
                <Badge variant="success" className="mb-4">Live Assistant</Badge>
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Ask GramAI in your Native Language</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our advanced natural language engine understands complex queries in Telugu and English. Speak directly to the system to check eligibility without filling out long forms.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Voice Recognition in Telugu and English.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Automatic document and eligibility parsing.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Direct application links provided instantly.</span>
                  </li>
                </ul>
                <Button size="lg" onClick={() => navigate('/register')}>Try Demo Now</Button>
              </FadeIn>

              <FadeIn delay={0.2} className="w-full lg:w-1/2">
                <div className="bg-card border rounded-3xl shadow-xl overflow-hidden flex flex-col h-[400px]">
                  <div className="bg-muted/50 border-b px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <GovEmblem size="sm" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">GramAI Assistant</div>
                      <div className="text-xs text-success flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-success"></span> Online
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] text-sm shadow-sm">
                        నేను కరీంనగర్‌లో 3 ఎకరాల రైతును. నాకు ఏ పథకాలు ఉన్నాయి? (I am a farmer with 3 acres in Karimnagar. What schemes are there?)
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm shadow-sm border text-foreground">
                        <p className="mb-2">Based on your details, you are eligible for the following:</p>
                        <div className="space-y-2">
                          <div className="bg-background border p-2 rounded-lg flex items-center justify-between">
                            <span className="font-medium">Rythu Bandhu</span>
                            <Badge variant="success" className="text-[10px]">Eligible</Badge>
                          </div>
                          <div className="bg-background border p-2 rounded-lg flex items-center justify-between">
                            <span className="font-medium">Crop Insurance</span>
                            <Badge variant="success" className="text-[10px]">Eligible</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t bg-muted/20">
                    <div className="relative">
                      <Input placeholder="Type a message..." className="pr-10 bg-background" disabled />
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 text-primary" disabled>
                        <Mic className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ANNOUNCEMENTS & STATS */}
        <section id="announcements" className="py-24 bg-muted/50 border-t">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-12 gap-12">
              <FadeIn className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-8">
                  <Bell className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-bold font-heading">Official Announcements</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { date: "Oct 15, 2026", title: "Kharif Season Rythu Bandhu Disbursement Started", type: "success" },
                    { date: "Oct 12, 2026", title: "New Scholarships Added for Post-Graduate Students", type: "info" },
                    { date: "Oct 05, 2026", title: "Deadline for Crop Insurance Registration extended to Oct 31", type: "warning" }
                  ].map((announcement, i) => (
                    <Alert key={i} variant={announcement.type as any} className="bg-background shadow-sm hover:shadow-md transition-shadow">
                      <Calendar className="h-4 w-4" />
                      <AlertTitle className="text-sm text-muted-foreground font-normal">{announcement.date}</AlertTitle>
                      <AlertDescription className="text-base font-medium mt-1 text-foreground">
                        {announcement.title}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
                <Button variant="link" className="mt-4 px-0">View All Announcements <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </FadeIn>

              <FadeIn delay={0.2} className="lg:col-span-4 flex flex-col justify-center">
                <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <h3 className="text-xl font-bold mb-8">Impact Delivered</h3>
                  <div className="space-y-6 relative z-10">
                    <div>
                      <div className="text-4xl font-bold mb-1">3.2M+</div>
                      <div className="text-primary-foreground/80 text-sm">Citizens Benefited</div>
                    </div>
                    <div className="w-full h-px bg-primary-foreground/20"></div>
                    <div>
                      <div className="text-4xl font-bold mb-1">₹12,400Cr</div>
                      <div className="text-primary-foreground/80 text-sm">Funds Disbursed</div>
                    </div>
                    <div className="w-full h-px bg-primary-foreground/20"></div>
                    <div>
                      <div className="text-4xl font-bold mb-1">450+</div>
                      <div className="text-primary-foreground/80 text-sm">Active Schemes Indexed</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
