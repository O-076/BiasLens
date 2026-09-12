export type BiasType =
  | 'framing'
  | 'loaded_language'
  | 'appeal_to_emotion'
  | 'false_dichotomy'
  | 'ad_hominem'
  | 'appeal_to_authority'
  | 'bandwagon'
  | 'straw_man'
  | 'slippery_slope'
  | 'hasty_generalization'
  | 'cherry_picking'
  | 'false_causation'
  | 'whataboutism';

export interface BiasInstance {
  id: string;
  type: BiasType;
  severity: 'low' | 'medium' | 'high';
  quote: string;
  explanation: string;
  suggestion: string;
  startIndex?: number;
  endIndex?: number;
}

export interface AnalysisResult {
  neutralityScore: number;
  summary: string;
  biases: BiasInstance[];
  rewrittenText: string;
  originalText: string;
}

export interface BiasTypeInfo {
  id: BiasType;
  label: string;
  color: string;
  icon: string;
  shortDescription: string;
  description: string;
}

export type ExtensionMessage =
  | { type: 'ANALYZE_PAGE'; tabId: number }
  | { type: 'ANALYZE_TEXT'; text: string }
  | { type: 'EXTRACT_TEXT' }
  | { type: 'HIGHLIGHT_BIASES'; biases: BiasInstance[]; originalText: string }
  | { type: 'CLEAR_HIGHLIGHTS' }
  | { type: 'ANALYSIS_RESULT'; result: AnalysisResult }
  | { type: 'ANALYSIS_ERROR'; error: string }
  | { type: 'ANALYSIS_LOADING' };

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';
