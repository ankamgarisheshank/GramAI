import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Search, Shield, Zap, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

const features = [
  {
    title: "Native Voice Assistant",
    description: "Speak in natural Telugu or English. Our AI uses Whisper to transcribe and Piper to synthesize natural responses.",
    icon: Mic,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Semantic Scheme Matching",
    description: "We don't just use keyword search. Our RAG engine understands the meaning behind your query to find the perfect scheme.",
    icon: Search,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Instant Eligibility Engine",
    description: "Provide your profile details once, and instantly see a personalized dashboard of schemes you definitely qualify for.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "Privacy First",
    description: "Your data is secure. We use enterprise-grade PostgreSQL and strictly adhere to data protection guidelines.",
    icon: Shield,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Always Up-to-Date",
    description: "Our knowledge base is constantly synced with official government releases, ensuring you never miss a new initiative.",
    icon: Clock,
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  },
  {
    title: "Multilingual Documents",
    description: "Read scheme guidelines, required documents, and application steps in clear, translated Telugu.",
    icon: BookOpen,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10"
  }
];

export const Features = () => {
  return (
    <div className="py-24 container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
        >
          Powerful features for <br />seamless access.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground"
        >
          GramAI combines cutting-edge AI with a beautifully simple interface to solve the complexities of government bureaucracy.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full border-none shadow-md hover:shadow-xl transition-shadow bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
