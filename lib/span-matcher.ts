import { BiasInstance } from '@/types/analysis';

export function matchSpans(arg1: any, arg2: any): BiasInstance[] {
  const text: string = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : '');
  const biases: BiasInstance[] = Array.isArray(arg1) ? arg1 : (Array.isArray(arg2) ? arg2 : []);

  if (!text || !biases || biases.length === 0) return biases || [];

  return biases.map(bias => {
    if (!bias.quote) return bias;
    
    // 1. Exact match
    let startIndex = text.indexOf(bias.quote);
    
    // 2. Case-insensitive match if exact match fails
    if (startIndex === -1) {
      const lowerText = text.toLowerCase();
      const lowerQuote = bias.quote.toLowerCase();
      startIndex = lowerText.indexOf(lowerQuote);
    }

    // 3. Flexible whitespace / regex match
    if (startIndex === -1) {
      try {
        const words = bias.quote.trim().split(/\s+/).filter(Boolean);
        if (words.length > 0) {
          const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
          const re = new RegExp(escaped, 'i');
          const match = re.exec(text);
          if (match) {
            return {
              ...bias,
              startIndex: match.index,
              endIndex: match.index + match[0].length
            };
          }
        }
      } catch (e) {
        // Fall back gracefully
      }
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
