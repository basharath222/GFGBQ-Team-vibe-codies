
export type VerificationStatus = 'verified' | 'hallucination' | 'unverifiable' | 'checking';

export interface FactualClaim {
  id: string;
  originalText: string;
  claim: string;
  status: VerificationStatus;
  evidence?: string;
  sources?: string[];
  explanation?: string;
  startIndex: number;
  endIndex: number;
}

export interface VerificationResult {
  trustScore: number;
  claims: FactualClaim[];
  summary: string;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: VerificationResult | null;
  error: string | null;
}
