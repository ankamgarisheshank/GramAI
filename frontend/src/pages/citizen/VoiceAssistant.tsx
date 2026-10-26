import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Loader2, Square, AlertCircle, Volume2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { VoiceAPI } from '../../lib/api';

export const VoiceAssistant = () => {
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [response, setResponse] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await handleAudioSubmission(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setState('listening');
      setErrorMsg('');
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMsg('Microphone access denied. Please allow microphone permissions.');
      setState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && state === 'listening') {
      mediaRecorder.current.stop();
      setState('processing');
    }
  };

  const handleAudioSubmission = async (blob: Blob) => {
    try {
      // 1. Transcribe Audio
      const transcribeRes = await VoiceAPI.transcribe(blob);
      const transcript = transcribeRes.data.data.transcript || "User asked a query";
      
      // 2. Send to Chat Engine
      const chatRes = await VoiceAPI.chat(transcript);
      const aiResponse = chatRes.data.data.response;
      setResponse(aiResponse);
      
      // 3. Synthesize Speech
      setState('speaking');
      try {
        const synthRes = await VoiceAPI.synthesize(aiResponse);
        if (synthRes.data?.data?.audio_base64) {
          const audio = new Audio("data:audio/wav;base64," + synthRes.data.data.audio_base64);
          audio.play();
          audio.onended = () => setState('idle');
          return; // Avoid setTimeout if we have audio playing
        }
      } catch (synthErr) {
        console.warn('TTS Failed', synthErr);
      }
      
      setTimeout(() => setState('idle'), 3000);
    } catch (e) {
      console.error('Processing error:', e);
      setErrorMsg('Error processing voice query. Please try again.');
      setState('error');
    }
  };

  const toggleRecording = () => {
    if (state === 'idle' || state === 'error') {
      startRecording();
    } else if (state === 'listening') {
      stopRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md flex flex-col items-center p-12 text-center shadow-xl border border-primary/20">
        <h2 className="text-2xl font-bold mb-8 text-primary">GramAI Assistant</h2>
        
        {state === 'error' && (
          <Alert variant="destructive" className="mb-6 w-full text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}
        
        <motion.button 
          onClick={toggleRecording}
          animate={{
            scale: state === 'listening' ? [1, 1.1, 1] : 1,
            backgroundColor: state === 'listening' ? '#ef4444' : state === 'speaking' ? '#10b981' : '#1D4ED8'
          }}
          transition={{ repeat: state === 'listening' ? Infinity : 0, duration: 1.5 }}
          className="w-32 h-32 rounded-full text-white flex items-center justify-center shadow-lg disabled:opacity-75 relative overflow-hidden"
          disabled={state === 'processing'}
        >
          {state === 'processing' ? (
            <Loader2 size={48} className="animate-spin" />
          ) : state === 'listening' ? (
            <Square size={36} fill="currentColor" />
          ) : state === 'speaking' ? (
            <Volume2 size={48} />
          ) : (
            <Mic size={48} />
          )}
        </motion.button>
        
        <p className="mt-8 text-lg font-medium text-muted-foreground h-8">
          {state === 'idle' && 'Tap to speak'}
          {state === 'listening' && 'Listening... Tap to stop'}
          {state === 'processing' && 'Thinking... (ఆలోచిస్తున్నాను)'}
          {state === 'speaking' && 'Speaking...'}
          {state === 'error' && 'Tap to try again'}
        </p>

        {response && state !== 'error' && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border w-full text-left">
            <p className="font-semibold text-primary mb-1">AI Response:</p>
            {response}
          </div>
        )}
      </Card>
    </div>
  );
};
