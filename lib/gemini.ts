import { GoogleGenerativeAI, Schema } from '@google/generative-ai';
import { AnalysisResult, BiasInstance } from '@/types/analysis';
import { buildAnalysisPrompt, RESPONSE_SCHEMA } from './prompts';

const MAX_TEXT_LENGTH = 65000;

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function cleanJson(str: string): string {
  let cleaned = str.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function getAvailableModels(apiKey: string): Promise<string[]> {
  const priority = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest'
  ];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const available: string[] = data.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''))
          // Filter out preview/experimental/omni/embed models that have zero free tier quota
          .filter((name: string) => 
            !name.includes('preview') && 
            !name.includes('omni') && 
            !name.includes('embed') &&
            !name.includes('imagen') &&
            !name.includes('exp')
          );
        
        // Match against preferred standard models first
        const matched = priority.filter(p => available.includes(p));
        if (matched.length > 0) return matched;
        if (available.length > 0) return available;
      }
    }
  } catch (e) {
    console.warn('Could not query models list:', e);
  }

  return priority;
}

export async function analyzeText(arg1: string, arg2: string): Promise<AnalysisResult> {
  // Support both (apiKey, text) and (text, apiKey)
  let apiKey = arg1;
  let text = arg2;
  if (arg1.length > 200 && arg2.length < 200) {
    apiKey = arg2;
    text = arg1;
  }

  apiKey = apiKey?.trim();
  if (!apiKey) {
    throw new Error('API key is required. Please set your Gemini API key in Settings.');
  }

  let textToAnalyze = text;
  if (text.length > MAX_TEXT_LENGTH) {
    console.warn(`Text truncated from ${text.length} to ${MAX_TEXT_LENGTH} characters.`);
    textToAnalyze = text.substring(0, MAX_TEXT_LENGTH);
  }

  const modelsToTry = await getAvailableModels(apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildAnalysisPrompt(textToAnalyze);

  let lastError: any = null;
  const attempted = new Set<string>();

  while (modelsToTry.length > 0) {
    const modelName = modelsToTry.shift()!;
    if (attempted.has(modelName)) continue;
    attempted.add(modelName);

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA as Schema,
          temperature: 0.1,
          topP: 0.8,
        }
      });

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleaned = cleanJson(rawText);
      const parsedData = JSON.parse(cleaned);

      const biases: BiasInstance[] = (parsedData.biases || []).map((bias: Omit<BiasInstance, 'id'>, idx: number) => {
        let hash = 0;
        const q = bias.quote || '';
        for (let i = 0; i < q.length; i++) {
          hash = ((hash << 5) - hash) + q.charCodeAt(i);
          hash |= 0;
        }
        return {
          ...bias,
          id: `b_${bias.type || 'bias'}_${Math.abs(hash)}_${idx}`
        };
      });

      return {
        neutralityScore: parsedData.neutralityScore ?? 50,
        summary: parsedData.summary || '',
        biases,
        rewrittenText: parsedData.rewrittenText || '',
        originalText: textToAnalyze
      };
    } catch (error: any) {
      console.warn(`Attempt with model "${modelName}" failed:`, error.message);
      lastError = error;

      // If this model has limit: 0 (restricted preview), continue to standard free models!
      if (error.message?.includes('limit: 0')) {
        continue;
      }

      // If Google suggests a specific model in the error message, queue it to try next!
      const suggestionMatch = error.message?.match(/use models\/([a-zA-Z0-9.-]+)/i);
      if (suggestionMatch && suggestionMatch[1] && !attempted.has(suggestionMatch[1])) {
        modelsToTry.unshift(suggestionMatch[1]);
      }

      // If error is 404 or deprecated model, continue trying other candidates
      if (error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('no longer available')) {
        continue;
      }

      // If error is invalid key, stop and throw immediately
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key. Please verify your key in Settings.');
      }
    }
  }

  // Format a friendly error message
  let displayMsg = lastError?.message || 'Failed to analyze text with Gemini.';
  if (displayMsg.includes('quota') || displayMsg.includes('429')) {
    displayMsg = 'Gemini API free quota limit reached. Please wait a minute and try again.';
  }
  throw new Error(displayMsg);
}
