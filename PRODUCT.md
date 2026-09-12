# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Critical readers, students, journalists, researchers, and everyday news consumers reading articles, opinion pieces, political speeches, and social media posts who want to detect manipulative framing, emotional appeals, and cognitive biases in real time.

## Product Purpose

BiasLens transforms passive reading into active, critical analysis. It inspects any webpage or user-supplied text with AI to identify 13 distinct types of cognitive biases, provides an objective Neutrality Index, and offers balanced rewrites that strip manipulation while retaining core factual information.

## Positioning

Unlike conventional fact-checking tools that verify true/false factual claims or generic sentiment analyzers, BiasLens focuses on *rhetorical and cognitive manipulation*—the psychological techniques, framing devices, and logical fallacies used to influence perception.

## Operating Context

Runs as a persistent browser side panel (380–450px width) right beside the content being consumed. Users interact with it during active reading sessions. Demands high information density, rapid scanning, clear typography, and zero visual clutter.

## Capabilities and Constraints

- Chrome Extension Manifest V3 with Side Panel API
- AI analysis powered by Google Gemini (structured JSON output)
- On-page DOM annotation and highlight injection
- Manual text analysis mode with pre-loaded educational examples
- Offline fallback / local storage for API credentials and preferences
- Responsive dark/light theme designed for ambient reading conditions

## Brand Commitments

- Name: BiasLens
- Tagline: "See through the bias"
- Tone: Analytical, objective, calm, authoritative, precise (like a specialized financial or scientific instrument, not an AI chatbot or marketing gimmick)

## Evidence on Hand

- Working Chrome extension codebase with WXT, React 18, Tailwind CSS, Recharts, and Lucide icons
- Real examples of biased journalism, opinion writing, and social commentary
- Full taxonomy of 13 cognitive biases with definitions, color mappings, and mitigation advice

## Product Principles

1. **Editorial Precision over AI Slop**: No decorative gradients, no meaningless progress rings, no nested card soup. Every pixel serves legibility and analytical utility.
2. **Immediate Comprehension**: Users must grasp the neutrality level, primary bias category, and critical excerpts in under three seconds.
3. **Respect the Reading Surface**: As a companion side panel, the interface must never shout or distract from the source material.
4. **Actionable Neutrality**: Don't just critique the bias—demonstrate how the thought can be stated fairly and objectively.

## Accessibility & Inclusion

- WCAG AA contrast ratio (≥4.5:1 for body and data text)
- Color is never the sole indicator of bias severity or type (labels and symbols accompany all metrics)
- Clear focus states and keyboard navigation for all interactive controls
