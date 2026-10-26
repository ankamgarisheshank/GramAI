import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume2, X } from 'lucide-react';
import { Button } from '../ui/Button';

// Global declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceAssistantProps {
  onCommandMatch: (intent: string, text: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommandMatch }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("సహాయం కోసం మైక్ పై నొక్కండి. (Tap mic for help)");
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'te-IN'; // Telugu language support
      
      recognition.onstart = () => {
        setIsListening(true);
        setFeedback("నేను వింటున్నాను... (Listening...)");
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processCommand(text.toLowerCase());
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setFeedback("దయచేసి మళ్ళీ ప్రయత్నించండి. (Please try again)");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setFeedback("మీ బ్రౌజర్ లో వాయిస్ అసిస్టెంట్ పని చేయదు. (Voice not supported in this browser)");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const processCommand = (text: string) => {
    // Simple intent detection for Telugu and English
    if (text.includes("పథకాలు") || text.includes("schemes") || text.includes("ఏమి") || text.includes("అర్హత") || text.includes("what")) {
      setFeedback("మీకు అర్హత ఉన్న పథకాలు కింద చూపించబడ్డాయి. (Showing your eligible schemes)");
      onCommandMatch("SHOW_SCHEMES", text);
      
      // Provide audio feedback
      speakText("మీకు అర్హత ఉన్న పథకాలు ఇవిగో.", 'te-IN');
    } else {
      setFeedback("మళ్ళీ చెప్పండి. ఏ పథకాలు కావాలి? (Say again, which schemes do you want?)");
    }

    // Automatically reset UI after 5 seconds
    setTimeout(() => {
      setTranscript('');
      setFeedback("సహాయం కోసం మైక్ పై నొక్కండి. (Tap mic for help)");
    }, 5000);
  };

  const speakText = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-success to-primary text-white border-4 border-white/20 hover:scale-110 transition-transform z-50 flex items-center justify-center animate-[bounce_3s_ease-in-out_infinite]"
      >
        <Mic className="h-8 w-8" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-success to-primary p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          <span className="font-bold">Agri Voice Assistant</span>
        </div>
        <button onClick={() => { 
          setIsOpen(false); 
          recognitionRef.current?.stop(); 
          setTranscript('');
          setFeedback("సహాయం కోసం మైక్ పై నొక్కండి. (Tap mic for help)");
        }} className="hover:bg-white/20 rounded-full p-1 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-6 flex flex-col items-center">
        <button 
          onClick={toggleListening}
          className={`h-24 w-24 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isListening 
              ? 'bg-red-50 text-red-500 animate-pulse scale-110 shadow-red-200' 
              : 'bg-success/10 text-success hover:bg-success/20 hover:scale-105'
          }`}
        >
          {isListening ? <Loader2 className="h-10 w-10 animate-spin" /> : <Mic className="h-10 w-10" />}
        </button>
        
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm font-semibold text-primary">{feedback}</p>
          {transcript && (
            <div className="p-3 bg-muted/50 rounded-xl text-sm italic text-muted-foreground mt-2 border border-border/50">
              "{transcript}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
