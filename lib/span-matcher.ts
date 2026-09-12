import { BiasInstance } from '@/types/analysis';

export function matchSpans(text: string, biases: BiasInstance[]): BiasInstance[] {
  return biases.map(bias => {
    if (!bias.quote) return bias;
    
    // Exact match
    let startIndex = text.indexOf(bias.quote);
    
    // Case-insensitive match if exact match fails
    if (startIndex === -1) {
      const lowerText = text.toLowerCase();
      const lowerQuote = bias.quote.toLowerCase();
      startIndex = lowerText.indexOf(lowerQuote);
    }
    
    if (startIndex !== -1) {
      const endIndex = startIndex + bias.quote.length;
      return {
        ...bias,
        startIndex,
        endIndex
      };
    }
    
    return bias;
  });
}
