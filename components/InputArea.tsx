
import React, { useState } from 'react';

interface InputAreaProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  const handleQuickAction = (t: string) => {
    setText(t);
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste AI-generated text or claims here for verification..."
          className="relative w-full h-64 p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none font-mono text-sm custom-scrollbar"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleQuickAction("The global market for quantum computing is expected to reach $1.3 trillion by 2030 according to McKinsey.")}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-all"
          >
            Example Claim
          </button>
          <button 
            onClick={() => handleQuickAction("Elon Musk was the first person to walk on Mars in 2023, using a SpaceX Starship.")}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-all"
          >
            Example Hallucination
          </button>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || !text.trim()}
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing claims...
            </>
          ) : (
            'Verify Sources'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;
