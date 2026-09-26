import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
} from 'lucide-react';
import { queryAssistant } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedEventIds?: string[];
}

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_0',
      sender: 'assistant',
      text: 'Hello, I am GuardianX, your home safety intelligence assistant. You can speak to me or type your question about home activity, door status, or recent incidents.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!voiceSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await queryAssistant(query);
      const assistantMsg: Message = {
        id: `msg_resp_${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString(),
        relatedEventIds: response.relatedEventIds,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Read aloud via SpeechSynthesis if supported & enabled
      if (speechSynthesisActive && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(response.answer);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: 'GuardianX could not reach the Bedrock model. Please verify server connectivity.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQueries = [
    'What happened today?',
    'Is anyone at the door?',
    'Are there any important events?',
    'What happened near the entrance?',
    'Show me recent incidents.',
    "Give me a summary of today's activity.",
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Bedrock Conversational Layer
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">
            ASK GUARDIANX
          </h1>
        </div>

        {/* Audio feedback toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeechSynthesisActive(!speechSynthesisActive)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono transition-all ${
              speechSynthesisActive
                ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                : 'border-white/10 bg-slate-900 text-slate-400'
            }`}
          >
            {speechSynthesisActive ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Voice Speech: {speechSynthesisActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-mono whitespace-nowrap">Suggested:</span>
        {suggestedQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="whitespace-nowrap rounded-lg border border-white/10 bg-slate-900/60 hover:border-cyan-500/40 px-3 py-1 text-slate-300 transition-all hover:text-white"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="rounded-2xl glass-panel border border-white/10 flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-slate-950 font-medium'
                      : 'bg-slate-900/80 text-slate-100 border border-white/10 shadow-lg'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] font-mono mt-2 ${
                      isUser ? 'text-slate-900/70' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl bg-slate-900/80 p-3 text-xs font-mono text-purple-300 border border-purple-500/20">
                GuardianX is analyzing home telemetry...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/10 bg-slate-950/80 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`rounded-xl p-3 transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}

            <input
              type="text"
              placeholder={isListening ? 'Listening to speech...' : "Ask a question about today's home activity..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold p-3 transition-all"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
