
import React, { useState } from 'react';
import { FactualClaim, VerificationResult } from '../types';
import ScoreChart from './ScoreChart';

interface ResultDisplayProps {
  originalText: string;
  result: VerificationResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalText, result }) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const selectedClaim = result.claims.find(c => c.id === selectedClaimId);

  // Helper to render text with highlighting
  const renderHighlightedText = () => {
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];
    
    // Sort claims by start index to process sequentially
    const sortedClaims = [...result.claims].sort((a, b) => a.startIndex - b.startIndex);

    sortedClaims.forEach((claim, idx) => {
      // Add plain text before the claim
      if (claim.startIndex > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{originalText.substring(lastIndex, claim.startIndex)}</span>);
      }

      // Add highlighted claim
      const statusColors = {
        verified: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
        hallucination: 'bg-red-500/20 border-red-500/40 text-red-400',
        unverifiable: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
        checking: 'bg-slate-500/20 border-slate-500/40 text-slate-400 animate-pulse',
      };

      parts.push(
        <span
          key={`claim-${claim.id}`}
          onClick={() => setSelectedClaimId(claim.id)}
          className={`cursor-pointer px-1 py-0.5 rounded border-b-2 transition-all hover:brightness-125 ${
            selectedClaimId === claim.id ? 'ring-2 ring-white/20 scale-[1.02]' : ''
          } ${statusColors[claim.status]}`}
        >
          {claim.originalText}
        </span>
      );

      lastIndex = claim.endIndex;
    });

    // Add remaining text
    if (lastIndex < originalText.length) {
      parts.push(<span key="text-last">{originalText.substring(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dashboard Section */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <ScoreChart score={result.trustScore} />
          
          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Analysis Summary</h3>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "{result.summary}"
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 p-3 rounded-lg text-center border border-slate-700/50">
              <span className="block text-xl font-bold text-emerald-400">{result.claims.filter(c => c.status === 'verified').length}</span>
              <span className="text-[10px] text-slate-500 font-medium">VERIFIED</span>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg text-center border border-slate-700/50">
              <span className="block text-xl font-bold text-red-400">{result.claims.filter(c => c.status === 'hallucination').length}</span>
              <span className="text-[10px] text-slate-500 font-medium">FAKES</span>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg text-center border border-slate-700/50">
              <span className="block text-xl font-bold text-amber-400">{result.claims.filter(c => c.status === 'unverifiable').length}</span>
              <span className="text-[10px] text-slate-500 font-medium">DOUBTFUL</span>
            </div>
          </div>
        </div>

        {/* Selected Claim Detail */}
        {selectedClaim && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-white text-lg">Verification Logic</h3>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                selectedClaim.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' :
                selectedClaim.status === 'hallucination' ? 'bg-red-500/10 text-red-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                {selectedClaim.status}
              </span>
            </div>
            
            <p className="text-sm text-slate-400 mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono italic">
              "{selectedClaim.claim}"
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Evidence Snippet</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedClaim.evidence || "No evidence snippet available."}
                </p>
              </div>

              {selectedClaim.sources && selectedClaim.sources.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Sources</h4>
                  <ul className="space-y-2">
                    {selectedClaim.sources.slice(0, 3).map((source, i) => (
                      <li key={i}>
                        <a 
                          href={source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group truncate max-w-full"
                        >
                          <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="truncate">{source}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Text Section */}
      <div className="lg:col-span-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl h-full flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-300">Analysis Transcript</h3>
            <span className="text-[10px] text-slate-500 font-mono">VeriSynth Model v3.0</span>
          </div>
          <div className="p-8 flex-1 custom-scrollbar overflow-y-auto leading-loose text-slate-300 text-lg font-light tracking-wide whitespace-pre-wrap">
            {renderHighlightedText()}
          </div>
          <div className="p-4 bg-slate-950/30 border-t border-slate-800 text-[10px] text-slate-500 flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Hallucination
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Unverifiable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
