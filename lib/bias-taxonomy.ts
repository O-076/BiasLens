import { BiasType, BiasTypeInfo } from '@/types/analysis';

export const BIAS_TYPES: BiasTypeInfo[] = [
  {
    id: 'framing',
    label: 'Framing',
    color: '#3b82f6',
    icon: 'Frame',
    shortDescription: 'Presenting information to influence perception.',
    description: 'Framing involves presenting information in a way that influences how the audience interprets it. This can be done by emphasizing certain aspects of a situation while downplaying others.'
  },
  {
    id: 'loaded_language',
    label: 'Loaded Language',
    color: '#f59e0b',
    icon: 'MessageSquareWarning',
    shortDescription: 'Words with strong emotional implications.',
    description: 'Loaded language uses words with strong positive or negative connotations to influence an audience, rather than relying on neutral, objective facts.'
  },
  {
    id: 'appeal_to_emotion',
    label: 'Appeal to Emotion',
    color: '#f43f5e',
    icon: 'Flame',
    shortDescription: 'Manipulating emotions instead of using valid logic.',
    description: 'This bias occurs when an argument relies on manipulating the audience\'s emotions, such as fear, pity, or joy, rather than using valid reasoning or evidence.'
  },
  {
    id: 'false_dichotomy',
    label: 'False Dichotomy',
    color: '#f97316',
    icon: 'Split',
    shortDescription: 'Presenting only two options when more exist.',
    description: 'A false dichotomy incorrectly limits options to just two mutually exclusive choices, ignoring other possibilities, nuances, or middle grounds.'
  },
  {
    id: 'ad_hominem',
    label: 'Ad Hominem',
    color: '#a855f7',
    icon: 'UserX',
    shortDescription: 'Attacking the person instead of the argument.',
    description: 'Ad hominem occurs when someone attacks the character, motive, or other attribute of the person making an argument, rather than addressing the substance of the argument itself.'
  },
  {
    id: 'appeal_to_authority',
    label: 'Appeal to Authority',
    color: '#14b8a6',
    icon: 'Award',
    shortDescription: 'Claiming something is true because an authority said it.',
    description: 'This involves asserting that a claim is true simply because an authority figure or expert made it, regardless of whether the authority is relevant or provides valid evidence.'
  },
  {
    id: 'bandwagon',
    label: 'Bandwagon Effect',
    color: '#06b6d4',
    icon: 'Users',
    shortDescription: 'Believing something because many others do.',
    description: 'The bandwagon effect is the tendency to adopt a belief or behavior simply because many other people are doing so, rather than based on individual evaluation.'
  },
  {
    id: 'straw_man',
    label: 'Straw Man',
    color: '#6366f1',
    icon: 'Ghost',
    shortDescription: 'Misrepresenting an argument to make it easier to attack.',
    description: 'A straw man fallacy occurs when someone misrepresents an opponent\'s argument by exaggerating, mischaracterizing, or oversimplifying it, making it easier to defeat.'
  },
  {
    id: 'slippery_slope',
    label: 'Slippery Slope',
    color: '#ef4444',
    icon: 'TrendingDown',
    shortDescription: 'Assuming a small step will lead to a chain of extreme events.',
    description: 'The slippery slope fallacy assumes that a relatively small first step will inevitably lead to a chain of related, typically negative, events, without sufficient evidence.'
  },
  {
    id: 'hasty_generalization',
    label: 'Hasty Generalization',
    color: '#22c55e',
    icon: 'FastForward',
    shortDescription: 'Drawing a broad conclusion from a small sample.',
    description: 'A hasty generalization is a conclusion drawn from an insufficient or unrepresentative sample size, failing to consider all the variables or exceptions.'
  },
  {
    id: 'cherry_picking',
    label: 'Cherry Picking',
    color: '#eab308',
    icon: 'Cherry',
    shortDescription: 'Selecting only data that supports a particular position.',
    description: 'Cherry picking involves selectively presenting only the evidence or data that supports a specific argument or conclusion, while ignoring contradictory or unfavorable information.'
  },
  {
    id: 'false_causation',
    label: 'False Causation',
    color: '#ec4899',
    icon: 'Link',
    shortDescription: 'Assuming that because two things happened together, one caused the other.',
    description: 'False causation (or post hoc ergo propter hoc) is the incorrect assumption that simply because two events occurred sequentially or together, one must have caused the other.'
  },
  {
    id: 'whataboutism',
    label: 'Whataboutism',
    color: '#8b5cf6',
    icon: 'Repeat',
    shortDescription: 'Deflecting criticism by pointing to someone else\'s faults.',
    description: 'Whataboutism is a logical fallacy that attempts to discredit an opponent\'s position by charging them with hypocrisy without directly refuting or disproving their argument.'
  }
];

export function getBiasInfo(type: BiasType): BiasTypeInfo {
  const info = BIAS_TYPES.find(b => b.id === type);
  if (!info) {
    throw new Error(`Unknown bias type: ${type}`);
  }
  return info;
}

export function getBiasColor(type: BiasType): string {
  try {
    return getBiasInfo(type).color;
  } catch {
    return '#94a3b8'; // Default fallback color
  }
}

export const SEVERITY_COLORS = {
  low: '#fbbf24',    // amber-400
  medium: '#f97316', // orange-500
  high: '#ef4444'    // red-500
};

export function getBiasTypeLabel(type: BiasType): string {
  try {
    return getBiasInfo(type).label;
  } catch {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
