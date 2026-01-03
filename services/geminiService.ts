
import { GoogleGenAI, Type } from "@google/genai";
import { FactualClaim, VerificationResult, VerificationStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const ANALYSIS_MODEL = 'gemini-3-pro-preview';

/**
 * Extracts atomic, verifiable factual claims from raw text.
 */
export async function extractClaims(text: string): Promise<FactualClaim[]> {
  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: `Act as VeriSynth AI. Identify every atomic, verifiable factual assertion (names, dates, statistics, event descriptions) in the following text. 
    Ignore opinions or subjective statements.
    
    For each assertion, extract:
    1. The exact substring from the text (originalText).
    2. The core factual claim (claim).
    
    Return the data as a JSON array.
    
    Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            claim: { type: Type.STRING },
          },
          required: ["originalText", "claim"],
        },
      },
    },
  });

  const rawClaims = JSON.parse(response.text || '[]');
  
  return rawClaims.map((c: any, index: number) => {
    const startIndex = text.indexOf(c.originalText);
    return {
      id: `claim-${index}`,
      originalText: c.originalText,
      claim: c.claim,
      status: 'checking',
      startIndex: startIndex,
      endIndex: startIndex !== -1 ? startIndex + c.originalText.length : -1,
    };
  }).filter((c: FactualClaim) => c.startIndex !== -1);
}

/**
 * Verifies a claim using Zero-Shot Real-Time Grounding (Jan 2026).
 */
export async function verifyClaim(claim: FactualClaim): Promise<FactualClaim> {
  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: `Verify this claim: "${claim.claim}"`,
      config: {
        systemInstruction: `Act as VeriSynth AI Hallucination Detection Engine.
        Current Time: January 2026.
        
        VERIFICATION PROTOCOL:
        1. REAL-TIME SEARCH: Use live web data. Prioritize official news (AP, BBC, Reuters, Hindu), gov databases, and peer-reviewed journals.
        2. TRIANGULATION:
           - VERIFIED (Green): Confirmed by at least TWO independent, reputable sources.
           - DOUBTFUL (Orange): Found in only ONE reputable source.
           - UNVERIFIABLE (Orange): Search results as of Jan 2026 do not confirm this (no data found).
           - HALLUCINATION/FAKE (Red): Explicitly contradicted by reliable sources OR zero substantiation for high-impact claims (like accidents).
        3. SELF-CORRECTION: If social media rumors (e.g. accidents) are not confirmed by official reports of safety, flag as High-Confidence Hallucination.
        
        RESPONSE FORMAT:
        You MUST include a "status" field in your response text chosen from: "verified", "doubtful", "unverifiable", or "hallucination".
        Provide the evidence snippet and list of sources used.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string | undefined): uri is string => !!uri);

    let status: VerificationStatus = 'unverifiable';
    const lowerText = text.toLowerCase();
    
    // Explicit status mapping based on instruction adherence
    if (lowerText.includes('verified')) status = 'verified';
    else if (lowerText.includes('hallucination') || lowerText.includes('fake')) status = 'hallucination';
    else if (lowerText.includes('doubtful')) status = 'doubtful';
    else if (lowerText.includes('unverifiable')) status = 'unverifiable';

    return {
      ...claim,
      status,
      evidence: text,
      sources: Array.from(new Set(sources)),
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      ...claim,
      status: 'unverifiable',
      explanation: 'System timeout or grounding error.',
    };
  }
}

export async function analyzeText(text: string): Promise<VerificationResult> {
  const claims = await extractClaims(text);
  const verifiedClaims = await Promise.all(claims.map(verifyClaim));

  const verifiedCount = verifiedClaims.filter(c => c.status === 'verified').length;
  const totalClaims = verifiedClaims.length;
  
  // Calculate trust score strictly
  // Verified = 100%, Doubtful/Unverifiable = 20%, Hallucination = 0%
  let totalPoints = 0;
  verifiedClaims.forEach(c => {
    if (c.status === 'verified') totalPoints += 100;
    else if (c.status === 'doubtful' || c.status === 'unverifiable') totalPoints += 20;
  });
  
  const trustScore = totalClaims > 0 ? Math.round(totalPoints / totalClaims) : 100;

  const summaryResponse = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: `As VeriSynth AI (Jan 2026), provide a structured summary of this text's reliability:
    ${JSON.stringify(verifiedClaims.map(c => ({ claim: c.claim, status: c.status })))}`,
  });

  return {
    trustScore,
    claims: verifiedClaims,
    summary: summaryResponse.text || "Summary unavailable.",
  };
}
