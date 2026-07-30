import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { VoiceAPI } from '../../lib/api';

export const VoiceAssistant = () => {
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [response, setResponse] = useState<string>('');

  const handleClick = async () => {
    if (state === 'idle') {
      setState('listening');
      // Simulate listening delay
      setTimeout(async () => {
        setState('processing');
        try {
            // Integration Call
            const chatRes = await VoiceAPI.chat("Mock user voice query");
            setResponse(chatRes.data.data.response);
            setState('speaking');
            setTimeout(() => setState('idle'), 3000);
        } catch (e) {
            setResponse("Error connecting to AI Engine.");
            setState('idle');
        }
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md flex flex-col items-center p-12 text-center shadow-xl border border-primary/20">
        <h2 className="text-2xl font-bold mb-8 text-primary">GramAI Assistant</h2>
        
        <motion.button 
          onClick={handleClick}
          animate={{
            scale: state === 'listening' ? [1, 1.1, 1] : 1,
            backgroundColor: state === 'listening' ? '#F59E0B' : '#1D4ED8'
          }}
          transition={{ repeat: state === 'listening' ? Infinity : 0, duration: 1.5 }}
          className="w-32 h-32 rounded-full text-white flex items-center justify-center shadow-lg disabled:opacity-75"
          disabled={state === 'processing' || state === 'speaking'}
        >
          {state === 'processing' ? <Loader2 size={48} className="animate-spin" /> : <Mic size={48} />}
        </motion.button>
        
        <p className="mt-8 text-lg font-medium text-slate-700 h-8">
          {state === 'idle' && 'Tap to speak'}
          {state === 'listening' && 'Listening... (వింటున్నాను)'}
          {state === 'processing' && 'Thinking... (ఆలోచిస్తున్నాను)'}
          {state === 'speaking' && 'Speaking...'}
        </p>

        {response && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
                {response}
            </div>
        )}
      </Card>
    </div>
  );
};
