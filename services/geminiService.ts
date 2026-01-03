
import { GoogleGenAI, Type } from "@google/genai";
import { FactualClaim, VerificationResult, VerificationStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const CLAIM_EXTRACTION_MODEL = 'gemini-3-pro-preview';

/**
 * Extracts factual claims from raw text.
 */
export async function extractClaims(text: string): Promise<FactualClaim[]> {
  const response = await ai.models.generateContent({
    model: CLAIM_EXTRACTION_MODEL,
    contents: `Identify every specific factual assertion in the following text. 
    For each assertion, extract:
    1. The exact substring from the text (originalText).
    2. The core factual claim made (claim).
    
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
 * Verifies a single claim using Google Search grounding.
 */
export async function verifyClaim(claim: FactualClaim): Promise<FactualClaim> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Verify the following factual claim using web search: "${claim.claim}"
      
      Determine if it is:
      1. Verified (Highly accurate according to reliable sources)
      2. Hallucination (Explicitly contradicted or completely unsubstantiated)
      3. Unverifiable (Insufficient evidence or broken links mentioned)
      
      Provide a brief evidence summary and a list of source URLs.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string | undefined): uri is string => !!uri);

    // Heuristic for status determination based on model text
    let status: VerificationStatus = 'unverifiable';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('verified') || lowerText.includes('accurate') || lowerText.includes('correct')) {
      status = 'verified';
    } else if (lowerText.includes('hallucination') || lowerText.includes('false') || lowerText.includes('incorrect') || lowerText.includes('misleading')) {
      status = 'hallucination';
    }

    return {
      ...claim,
      status,
      evidence: text,
      sources,
    };
  } catch (error) {
    console.error("Verification failed for claim:", claim.claim, error);
    return {
      ...claim,
      status: 'unverifiable',
      explanation: 'Search verification failed due to network or API constraints.',
    };
  }
}

/**
 * Full analysis pipeline.
 */
export async function analyzeText(text: string): Promise<VerificationResult> {
  if (!text.trim()) {
    throw new Error("Input text is empty");
  }

  // Phase 1: Extraction
  const claims = await extractClaims(text);
  
  // Phase 2: Concurrent Verification
  const verifiedClaims = await Promise.all(claims.map(verifyClaim));

  // Phase 3: Aggregation
  const verifiedCount = verifiedClaims.filter(c => c.status === 'verified').length;
  const totalClaims = verifiedClaims.length;
  const trustScore = totalClaims > 0 ? Math.round((verifiedCount / totalClaims) * 100) : 100;

  const summaryResponse = await ai.models.generateContent({
    model: CLAIM_EXTRACTION_MODEL,
    contents: `Provide a high-level summary of the reliability of this text based on these verification results:
    ${JSON.stringify(verifiedClaims.map(c => ({ claim: c.claim, status: c.status })))}`,
  });

  return {
    trustScore,
    claims: verifiedClaims,
    summary: summaryResponse.text || "Summary unavailable.",
  };
}
