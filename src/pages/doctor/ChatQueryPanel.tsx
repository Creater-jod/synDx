import React, { useState } from 'react';
import { DoctorCaseReview } from '../../types/syndx';
import { Bot, Send, User, Sparkles, Loader2, Search, Pill } from 'lucide-react';

interface Props {
  activeCase?: DoctorCaseReview | null;
}

export const ChatQueryPanel: React.FC<Props> = ({ activeCase }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello Doctor. I am the SynDx Clinical AI Assistant powered by Gemini. You can ask me natural language queries about active patient cases, rare disease guidelines, or adverse drug reaction correlations.`
    }
  ]);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userText = prompt.trim();
    setPrompt('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          context: activeCase ? {
            patientCode: activeCase.patientCode,
            type: activeCase.type,
            summary: activeCase.summary,
            tier: activeCase.tier,
            details: activeCase.details
          } : null
        })
      });

      const data = await res.json();
      const aiText = data.text || data.fallbackText || 'SynDx Assistant: Completed processing request.';
      setMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'SynDx Local Assistant: Unable to reach cloud route. For Gaucher Type 1 and Fabry Disease, enzyme replacement therapy (ERT) requires monitoring liver transaminases (ALT/AST) and platelet recovery.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetQuery = (queryText: string) => {
    setPrompt(queryText);
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-4 sm:p-5 backdrop-blur-xl space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Physician AI Clinical Query Console
          </h3>
        </div>
        {activeCase && (
          <span className="text-[10px] text-teal-300 font-mono font-bold border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 rounded-full">
            Context: {activeCase.patientCode}
          </span>
        )}
      </div>

      {/* Suggested Quick Queries */}
      <div className="flex flex-wrap gap-2 text-[11px] font-mono">
        <button
          onClick={() => handlePresetQuery('What are the key differential markers between Gaucher Type 1 and Niemann-Pick?')}
          className="rounded-lg border border-slate-700/80 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 flex items-center gap-1.5 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-teal-400" />
          <span>Gaucher vs Niemann-Pick differential</span>
        </button>
        <button
          onClick={() => handlePresetQuery('Is ALT elevation common 14 days after Imiglucerase ERT start?')}
          className="rounded-lg border border-slate-700/80 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 flex items-center gap-1.5 transition-colors"
        >
          <Pill className="w-3.5 h-3.5 text-orange-400" />
          <span>Imiglucerase ERT transaminase risk</span>
        </button>
      </div>

      {/* Messages Thread */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-3 max-h-[240px] overflow-y-auto text-xs custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-teal-500/15 border border-teal-500/40 text-teal-200'
                  : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting clinical model...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendPrompt} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a clinical question about this case or guideline..."
          className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 font-mono"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 hover:brightness-105 disabled:opacity-40 transition-all flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
