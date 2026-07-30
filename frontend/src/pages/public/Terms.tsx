import React from 'react';
import { motion } from 'framer-motion';

export const Terms = () => {
  return (
    <div className="py-24 container mx-auto px-4 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: July 21, 2026</p>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>1. Agreement to Terms</h2>
          <p>
            By viewing or using this Website, which can be accessed at gramai.in, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on GramAI's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>

          <h2>3. Disclaimer regarding Government Affiliation</h2>
          <p>
            GramAI is an independent platform that aggregates and recommends government schemes. We are not an official government entity, nor do we guarantee the approval or disbursement of any benefits. Final eligibility is determined solely by the respective government departments.
          </p>

          <h2>4. Accuracy of Information</h2>
          <p>
            While we strive to keep our AI engine and knowledge base updated with the latest scheme guidelines, the materials appearing on GramAI's Website could include technical, typographical, or photographic errors. GramAI does not warrant that any of the materials on its Website are accurate, complete, or current.
          </p>

          <h2>5. Limitations</h2>
          <p>
            In no event shall GramAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GramAI's Website.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
