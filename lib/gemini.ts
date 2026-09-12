import { GoogleGenerativeAI, Schema } from '@google/generative-ai';
import { AnalysisResult, BiasInstance } from '@/types/analysis';
import { buildAnalysisPrompt, RESPONSE_SCHEMA } from './prompts';

const MAX_TEXT_LENGTH = 15000;

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function analyzeText(apiKey: string, text: string): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  let textToAnalyze = text;
  if (text.length > MAX_TEXT_LENGTH) {
    console.warn(`Text truncated from ${text.length} to ${MAX_TEXT_LENGTH} characters.`);
    textToAnalyze = text.substring(0, MAX_TEXT_LENGTH);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA as Schema,
    }
  });

  try {
    const prompt = buildAnalysisPrompt(textToAnalyze);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const parsedData = JSON.parse(responseText);
    
    // Add IDs and original text
    const biases: BiasInstance[] = (parsedData.biases || []).map((bias: Omit<BiasInstance, 'id'>) => ({
      ...bias,
      id: generateId()
    }));

    return {
      neutralityScore: parsedData.neutralityScore ?? 50,
      summary: parsedData.summary || '',
      biases,
      rewrittenText: parsedData.rewrittenText || '',
      originalText: textToAnalyze
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to analyze text');
  }
}
