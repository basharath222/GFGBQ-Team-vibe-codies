
import React, { useState } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import ResultDisplay from './components/ResultDisplay';
import { AnalysisState } from './types';
import { analyzeText } from './services/geminiService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const handleAnalyze = async (text: string) => {
    setInputText(text);
    setAnalysis({ isAnalyzing: true, result: null, error: null });
    
    try {
      const result = await analyzeText(text);
      setAnalysis({ isAnalyzing: false, result, error: null });
    } catch (err: any) {
      console.error(err);
      setAnalysis({ 
        isAnalyzing: false, 
        result: null, 
        error: err.message || "An unexpected error occurred during verification." 
      });
    }
  };

  const handleReset = () => {
    setAnalysis({ isAnalyzing: false, result: null, error: null });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Verify Truth in the Age of <span className="text-cyan-400">Synthesis</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            VeriSynth AI extracts factual claims and validates them against real-time 
            search data to protect your research from hallucinations and fake citations.
          </p>
        </div>

        {!analysis.result && !analysis.isAnalyzing ? (
          <div className="max-w-5xl mx-auto">
            <InputArea onAnalyze={handleAnalyze} isAnalyzing={analysis.isAnalyzing} />
            
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.414 1.414a2 2 0 001.414 0l1.414-1.414a2 2 0 000-1.414l-1.414-1.414z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3L22 4" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Claim Extraction</h3>
                <p className="text-sm text-slate-400">Advanced NLP identifying factual assertions that require real-world validation.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Live Verification</h3>
                <p className="text-sm text-slate-400">Direct integration with Google Search grounding for up-to-the-minute factual accuracy.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2">Link Validator</h3>
                <p className="text-sm text-slate-400">Deep-checking cited URLs to ensure sources are live and relevant to the context.</p>
              </div>
            </div>
          </div>
        ) : analysis.isAnalyzing ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-8 text-xl font-medium text-slate-300 animate-pulse">Running Factual Verification Loop...</p>
            <p className="mt-2 text-sm text-slate-500 italic">Querying live web sources and cross-referencing claims...</p>
          </div>
        ) : analysis.result ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Analyze New Text
              </button>
              <div className="text-xs text-slate-500">
                Found {analysis.result.claims.length} claims in {inputText.length} characters
              </div>
            </div>
            <ResultDisplay originalText={inputText} result={analysis.result} />
          </div>
        ) : analysis.error ? (
          <div className="max-w-2xl mx-auto p-8 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Verification Error</h3>
            <p className="text-slate-400 mb-6">{analysis.error}</p>
            <button 
              onClick={handleReset}
              className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
            >
              Try Again
            </button>
          </div>
        ) : null}
      </main>

      <footer className="py-8 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© 2024 VeriSynth AI. Advanced Hallucination Detection Engine.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-cyan-400">Terms of Service</a>
            <a href="#" className="hover:text-cyan-400">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400">API Access</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
