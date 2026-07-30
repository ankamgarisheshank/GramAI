import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { Mic, ArrowRight, CheckCircle2, Sprout, Tractor, GraduationCap, Heart, Building2, UserPlus, Brain, FileCheck } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/Accordion';

import heroVideo from '../../assets/videos/Drone Shots of our Village _ Dji Mini 3 Pro Cinematic Shots 4K _ My village_1080p.mp4';
import heroPoster from '../../assets/images/hero-poster.png';

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
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const videoOverlayOpacity = useTransform(scrollYProgress, [0, 0.3], [0.65, 0.95]);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[50vh] md:min-h-[55vh] lg:min-h-[60vh] px-4 overflow-hidden z-0">
        {/* Parallax Video Background */}
        <motion.div style={{ y }} className="absolute inset-0 z-0 w-full h-[120%] -top-[10%]">
          <video
            src={heroVideo}
            poster={heroPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center"
            aria-hidden="true"
            ref={(el) => {
              if (el) {
                el.defaultMuted = true;
                el.muted = true;
                el.play().catch((e) => console.log('Autoplay prevented:', e));
              }
            }}
          />
        </motion.div>

        {/* Overlays */}
        <motion.div
          style={{ opacity: videoOverlayOpacity }}
          className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/50 to-black/80 pointer-events-none"
        />
        <div className="absolute inset-0 z-10 bg-emerald-900/10 mix-blend-overlay pointer-events-none" /> {/* Subtle Green Tint */}

        {/* Hero Content Container */}
        <motion.div
          style={{ opacity, y }}
          className="container mx-auto max-w-4xl relative z-20 pt-16 pb-8 flex flex-col items-center justify-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", staggerChildren: 0.15 }}
            className="w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center rounded-full border border-emerald-400/30 bg-black/30 backdrop-blur-md px-3 py-1 text-xs md:text-sm font-medium text-emerald-300 mb-6 shadow-lg"
            >
              <Sprout className="h-3.5 w-3.5 mr-2" />
              Built for Telangana
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight drop-shadow-2xl"
            >
              Find Every <br className="md:hidden" />
              <span className="text-emerald-400">
                Government Scheme
              </span> <br />
              You Deserve.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-base md:text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed font-light drop-shadow-xl"
            >
              GramAI helps farmers, students and rural citizens discover government benefits using AI-powered recommendations and voice conversations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="rounded-full px-8 h-14 text-base w-full sm:w-auto shadow-xl shadow-emerald-900/50 bg-emerald-600 hover:bg-emerald-500 hover:scale-105 transition-all text-white border-none">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-14 text-base w-full sm:w-auto bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all shadow-lg">
                  <Link to="/features">
                    <span className="mr-2">🎤</span> Try Voice Assistant
                  </Link>
                </Button>

                {/* Pulsing Mic Animation Beside CTA */}
                <div className="relative flex items-center justify-center h-10 w-10 hidden sm:flex">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-emerald-400 rounded-full blur-sm"
                  />
                  <div className="relative bg-emerald-500/20 border border-emerald-400/50 backdrop-blur-sm rounded-full p-2.5">
                    <Mic className="h-4 w-4 text-emerald-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>



      {/* AI Chat Preview Section */}
      <section className="py-24 bg-card border-y">
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Talk to GramAI Like a Friend</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our Voice AI understands your natural language, asks the right questions, and finds your exact eligibility instantly.
            </p>
          </FadeIn>

          <div className="max-w-3xl mx-auto bg-background rounded-3xl p-6 md:p-10 shadow-2xl border">
            <div className="flex flex-col gap-6">
              <FadeIn delay={0.1} className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-3 max-w-[85%] text-lg shadow-sm">
                  <span className="text-2xl mr-2">👨🌾</span> నేను కరీంనగర్‌లో 3 ఎకరాల రైతును. నాకు ఏ పథకాలు ఉన్నాయి? <br />
                  <span className="text-sm opacity-80 mt-1 block">(I own 3 acres in Karimnagar. What schemes are available for me?)</span>
                </div>
              </FadeIn>

              <FadeIn delay={0.5} className="flex">
                <div className="bg-muted/50 border rounded-2xl rounded-tl-sm px-6 py-5 max-w-[90%] shadow-sm">
                  <div className="font-semibold text-lg mb-4 flex items-center gap-2 text-primary">
                    <span className="text-2xl">🤖</span> GramAI
                  </div>
                  <p className="text-foreground mb-4 text-lg">Based on your 3 acres in Karimnagar, you are eligible for:</p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 bg-background p-3 rounded-xl border shadow-sm">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                      <span className="font-medium text-lg">Rythu Bandhu (₹15,000/season)</span>
                    </li>
                    <li className="flex items-center gap-3 bg-background p-3 rounded-xl border shadow-sm">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                      <span className="font-medium text-lg">PM Kisan Samman Nidhi</span>
                    </li>
                    <li className="flex items-center gap-3 bg-background p-3 rounded-xl border shadow-sm">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                      <span className="font-medium text-lg">Crop Insurance (Pradhan Mantri Fasal Bima Yojana)</span>
                    </li>
                  </ul>
                  <Button className="w-full sm:w-auto rounded-full text-base h-12 px-8">Apply Now</Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <FadeIn className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Built for Every Citizen</h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              GramAI is designed to be accessible to everyone, regardless of technical expertise.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Tractor, title: "Farmers", desc: "Discover subsidies, crop insurance, and equipment grants.", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
              { icon: GraduationCap, title: "Students", desc: "Find scholarships and fee reimbursement eligibility instantly.", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
              { icon: Heart, title: "Senior Citizens", desc: "Voice-guided assistance for pensions and healthcare benefits.", color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
              { icon: Building2, title: "Gov Officers", desc: "Verify citizen eligibility quickly and reduce manual paperwork.", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" }
            ].map((user, i) => (
              <FadeIn key={user.title} delay={0.1 * i}>
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group bg-card">
                  <CardContent className="p-8">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${user.bg}`}>
                      <user.icon className={`h-8 w-8 ${user.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{user.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{user.desc}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-stone-900 text-stone-100 dark:bg-black rounded-[3rem] mx-4 md:mx-8 mb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <FadeIn className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">How GramAI Works</h2>
            <p className="text-xl text-stone-400 max-w-2xl mx-auto">Four simple steps to claim your benefits.</p>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: UserPlus, title: "1. Create Profile", desc: "Sign up securely and provide basic details." },
              { icon: Mic, title: "2. AI Understands You", desc: "Speak or type your current situation naturally." },
              { icon: Brain, title: "3. Get Matched", desc: "Our engine scans hundreds of schemes for matches." },
              { icon: FileCheck, title: "4. Apply Easily", desc: "Follow translated, step-by-step application guides." }
            ].map((step, i) => (
              <FadeIn key={step.title} delay={0.1 * i} className="text-center relative">
                <div className="mx-auto h-24 w-24 rounded-full bg-stone-800 border-4 border-stone-700 flex items-center justify-center mb-6 shadow-2xl relative z-10">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                {i !== 3 && <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-1 bg-stone-700 border-t-2 border-dashed border-stone-600"></div>}
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-stone-400 text-lg leading-relaxed">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 border-y bg-card">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { val: "350+", label: "Government Schemes" },
              { val: "10k+", label: "Citizens Supported" },
              { val: "33", label: "Districts Covered" },
              { val: "2", label: "Languages (TE/EN)" }
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={0.1 * i}>
                <div className="text-5xl font-extrabold text-primary mb-3">{stat.val}</div>
                <div className="text-lg font-medium text-muted-foreground">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32">
        <div className="container mx-auto px-4 max-w-3xl">
          <FadeIn className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Accordion type="single" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xl py-6">Is GramAI free to use?</AccordionTrigger>
                <AccordionContent className="text-lg text-muted-foreground pb-6">
                  Yes, GramAI is completely free for all citizens. Our goal is to ensure everyone has access to government benefits without any financial barrier.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-xl py-6">Do I need to type to use the app?</AccordionTrigger>
                <AccordionContent className="text-lg text-muted-foreground pb-6">
                  No! GramAI features a native voice assistant. You can simply tap the microphone icon and speak in Telugu. The AI will understand and reply to you.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-xl py-6">Is my data secure?</AccordionTrigger>
                <AccordionContent className="text-lg text-muted-foreground pb-6">
                  Absolutely. We use enterprise-grade security to protect your data. We only ask for information necessary to determine your scheme eligibility, and we never sell your data.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary -z-20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 -z-10"></div>
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-primary-foreground">Ready to claim your benefits?</h2>
            <p className="text-2xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto font-medium">
              Join thousands of citizens who have simplified their government interactions with GramAI.
            </p>
            <Button asChild size="lg" className="rounded-full px-12 h-20 text-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xl hover:scale-105 transition-transform">
              <Link to="/register">Create Free Account</Link>
            </Button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};
