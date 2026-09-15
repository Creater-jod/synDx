import React, { useState } from 'react';
import { DoctorCaseReview } from '../../types/syndx';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  activeCase?: DoctorCaseReview | null;
}

export const ChatQueryPanel: React.FC<Props> = ({ activeCase }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello Doctor. I am SynDx AI Assistant powered by Gemini. You can ask me natural language queries about patient cases, rare disease clinical guidelines, or adverse drug reaction correlations.`
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
          text: 'SynDx Local Assistant: Unable to reach Gemini cloud route. For Gaucher Type 1 and Fabry Disease, enzyme replacement therapy (ERT) requires monitoring liver transaminases (ALT/AST) and platelet recovery.'
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
    <div className="bg-[#F0EEE9] border-2 border-[#141414] p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#141414] pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2A5C82]" />
          <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414]">
            Doctor AI Natural Language Query Console (Gemini 3.6 Flash)
          </h3>
        </div>
        {activeCase && (
          <span className="text-[10px] text-white font-mono font-bold bg-[#141414] px-2 py-0.5">
            Active Context: {activeCase.patientCode}
          </span>
        )}
      </div>

      {/* Suggested Quick Queries */}
      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
        <button
          onClick={() => handlePresetQuery('What are the key differential markers between Gaucher Type 1 and Niemann-Pick?')}
          className="bg-white hover:bg-[#E4E3E0] text-[#141414] font-bold px-2.5 py-1 border border-[#141414]"
        >
          🔍 Gaucher vs Niemann-Pick differential
        </button>
        <button
          onClick={() => handlePresetQuery('Is ALT elevation common 14 days after Imiglucerase ERT start?')}
          className="bg-white hover:bg-[#E4E3E0] text-[#141414] font-bold px-2.5 py-1 border border-[#141414]"
        >
          💊 Imiglucerase ERT liver transaminase risk
        </button>
      </div>

      {/* Messages Thread */}
      <div className="bg-white border border-[#141414] p-3 space-y-3 max-h-[220px] overflow-y-auto text-xs">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="p-1 bg-[#141414] text-white shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            )}
            <div
              className={`p-2.5 max-w-[85%] leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-[#141414] text-white font-mono text-[11px] font-bold border-[#141414]'
                  : 'bg-[#F0EEE9] text-[#141414] font-serif italic text-xs border-[#141414]'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="p-1 bg-[#2A5C82] text-white shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2A5C82] p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting Gemini AI knowledge base...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendPrompt} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI query about rare diseases, drug interactions, or active case..."
          className="flex-1 bg-white border border-[#141414] p-2 text-xs font-mono text-[#141414] focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#141414] hover:bg-[#2A5C82] text-white font-mono font-bold uppercase px-4 py-2 text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5 text-[#FF6321]" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
