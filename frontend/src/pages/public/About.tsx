import React from 'react';
import { motion } from 'framer-motion';

export const About = () => {
  return (
    <div className="py-24 container mx-auto px-4 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">About GramAI</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
          <p className="text-xl leading-relaxed mb-6">
            GramAI was founded with a singular mission: to bridge the gap between government initiatives and the citizens they are meant to serve.
          </p>
          <p className="mb-6">
            In Telangana, hundreds of welfare schemes exist for farmers, students, and senior citizens, yet millions of rupees go unclaimed annually due to lack of awareness, language barriers, and complex application processes.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Our Vision</h2>
          <p className="mb-6">
            We envision a future where interacting with the government is as simple as sending a text message. By leveraging state-of-the-art Generative AI, Large Language Models (LLMs), and native Telugu voice recognition (Whisper), we are democratizing access to information.
          </p>
          <h2 className="text-2xl font-semibold text-foreground mt-12 mb-4">Technology</h2>
          <p className="mb-6">
            Built on a robust architecture utilizing Llama 3.2, LangChain, and ChromaDB for semantic search, GramAI understands the context of a citizen's query rather than just matching keywords. It asks clarifying questions and precisely computes eligibility criteria instantly.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
