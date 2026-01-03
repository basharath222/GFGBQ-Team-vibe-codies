
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

  const renderHighlightedText = () => {
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];
    const sortedClaims = [...result.claims].sort((a, b) => a.startIndex - b.startIndex);

    sortedClaims.forEach((claim, idx) => {
      if (claim.startIndex > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{originalText.substring(lastIndex, claim.startIndex)}</span>);
      }

      // STRICT COLOR MAPPING FROM PROMPT
      // GREEN: Verified
      // ORANGE: Unverifiable / Doubtful
      // RED: Hallucination / Fake
      const statusColors = {
        verified: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', // GREEN
        hallucination: 'bg-red-500/20 border-red-500/40 text-red-400',       // RED
        doubtful: 'bg-orange-500/20 border-orange-500/40 text-orange-400',   // ORANGE
        unverifiable: 'bg-orange-500/20 border-orange-500/40 text-orange-400', // ORANGE
        checking: 'bg-blue-500/20 border-blue-500/40 text-blue-400 animate-pulse',
      };

      parts.push(
        <span
          key={`claim-${claim.id}`}
          onClick={() => setSelectedClaimId(claim.id)}
          className={`cursor-pointer px-1 py-0.5 rounded border-b-2 transition-all hover:brightness-125 font-medium ${
            selectedClaimId === claim.id ? 'ring-2 ring-white/20 scale-[1.02]' : ''
          } ${statusColors[claim.status]}`}
        >
          {claim.originalText}
        </span>
      );

      lastIndex = claim.endIndex;
    });

    if (lastIndex < originalText.length) {
      parts.push(<span key="text-last">{originalText.substring(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dashboard Section */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest">
            Jan 2026 Engine
          </div>
          <ScoreChart score={result.trustScore} />
          
          <div className="mt-8 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Summary</h3>
            <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-cyan-500/50 pl-4 py-1">
              {result.summary}
            </p>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-400 uppercase">Verified</span>
              <span className="text-lg font-bold text-emerald-400">{result.claims.filter(c => c.status === 'verified').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <span className="text-xs font-bold text-orange-400 uppercase">Doubtful / Unknown</span>
              <span className="text-lg font-bold text-orange-400">{result.claims.filter(c => c.status === 'doubtful' || c.status === 'unverifiable').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <span className="text-xs font-bold text-red-400 uppercase">Hallucinations</span>
              <span className="text-lg font-bold text-red-400">{result.claims.filter(c => c.status === 'hallucination').length}</span>
            </div>
          </div>
        </div>

        {/* Selected Claim Detail */}
        {selectedClaim && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">Claim Insight</h3>
              <div className={`text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter ${
                selectedClaim.status === 'verified' ? 'bg-emerald-500 text-slate-950' :
                selectedClaim.status === 'hallucination' ? 'bg-red-500 text-slate-950' :
                'bg-orange-500 text-slate-950'
              }`}>
                {selectedClaim.status === 'verified' ? 'GREEN: VERIFIED' : 
                 selectedClaim.status === 'hallucination' ? 'RED: HALLUCINATION' : 
                 'ORANGE: UNVERIFIABLE'}
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-slate-950 rounded border border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Atomic Claim</h4>
              <p className="text-sm font-mono text-cyan-400 leading-relaxed italic">
                "{selectedClaim.claim}"
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Jan 2026 Evidence Snippet</h4>
                <div className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded border border-slate-800">
                  {selectedClaim.evidence || "No current data found. Search results as of Jan 2026 do not confirm this."}
                </div>
              </div>

              {selectedClaim.sources && selectedClaim.sources.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Triangulation Sources ({selectedClaim.sources.length})</h4>
                  <ul className="space-y-2">
                    {selectedClaim.sources.map((source, i) => (
                      <li key={i}>
                        <a 
                          href={source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-2 group truncate"
                        >
                          <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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

      {/* Main Transcript Section */}
      <div className="lg:col-span-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl h-full flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <h3 className="font-bold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              VERISYNTH COLOR-CODED TRANSCRIPT
            </h3>
            <div className="flex gap-4 text-[10px] font-bold">
              <span className="text-emerald-400">GREEN: VERIFIED</span>
              <span className="text-orange-400">ORANGE: DOUBTFUL</span>
              <span className="text-red-400">RED: FAKE</span>
            </div>
          </div>
          <div className="p-8 flex-1 custom-scrollbar overflow-y-auto leading-[2.2] text-slate-300 text-lg font-light tracking-wide whitespace-pre-wrap selection:bg-cyan-500/30">
            {renderHighlightedText()}
          </div>
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">SECURE REAL-TIME GROUNDING PROTOCOL v4.2</span>
            <span className="text-[10px] text-red-500 font-black animate-pulse uppercase tracking-widest">January 2026 Archive Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
