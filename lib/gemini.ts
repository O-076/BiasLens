import { GoogleGenerativeAI, Schema } from '@google/generative-ai';
import { AnalysisResult, BiasInstance } from '@/types/analysis';
import { buildAnalysisPrompt, RESPONSE_SCHEMA } from './prompts';

const MAX_TEXT_LENGTH = 15000;

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function analyzeText(arg1: string, arg2: string): Promise<AnalysisResult> {
  // Support both (apiKey, text) and (text, apiKey)
  let apiKey = arg1;
  let text = arg2;
  if (arg1.length > 200 && arg2.length < 200) {
    apiKey = arg2;
    text = arg1;
  }

  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is required. Please set your Gemini API key in Settings.');
  }

  let textToAnalyze = text;
  if (text.length > MAX_TEXT_LENGTH) {
    console.warn(`Text truncated from ${text.length} to ${MAX_TEXT_LENGTH} characters.`);
    textToAnalyze = text.substring(0, MAX_TEXT_LENGTH);
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
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
