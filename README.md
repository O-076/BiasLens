# 🔍 BiasLens — AI-Powered Cognitive Bias Detector

> **See through the bias.** A Chrome extension that analyzes any webpage or text for cognitive biases in real-time, highlights manipulative language directly on the page, and provides a detailed bias report with a neutral rewrite.

![BiasLens Demo](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome&logoColor=white)
![AI Powered](https://img.shields.io/badge/AI-Gemini%202.5-orange?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 Project Description

In an era of information overload, we consume thousands of words daily from news articles, social media posts, and opinion pieces — much of it subtly shaped by cognitive biases and manipulative language. Most people can't identify when they're being psychologically influenced because biases are invisible by design.

**BiasLens** is a Chrome browser extension that makes the invisible visible. With one click, it analyzes any webpage you're reading and:

- **Highlights biases directly on the page** with color-coded annotations — so you see exactly which sentences are manipulative while reading the original content
- **Detects 13 types of cognitive biases** including framing, loaded language, appeal to emotion, false dichotomy, ad hominem, appeal to authority, bandwagon effect, straw man, slippery slope, hasty generalization, cherry picking, false causation, and whataboutism
- **Scores neutrality (0-100)** with an animated gauge and radar chart showing the distribution of bias types
- **Generates a neutral rewrite** of the entire text, removing bias while preserving factual content
- **Explains each bias** with what it is, why the specific text is biased, and a neutral alternative

Unlike existing fact-checkers that focus on true/false claims, BiasLens targets the subtle psychological techniques that shape perception — the framing, the loaded words, the logical fallacies. It's a tool for critical thinking in your browser.

Built with Google's Gemini 2.5 Flash AI model for fast, accurate analysis, BiasLens is designed to be a daily companion for anyone who wants to read the web with clearer eyes.

## 🚀 Features

| Feature | Description |
|---|---|
| 🌐 **Analyze Any Page** | One-click analysis of any webpage you're reading |
| 📋 **Paste Text Mode** | Manually paste any text for analysis |
| 🖱️ **Right-Click Analysis** | Select text → right-click → "Analyze with BiasLens" |
| 🎨 **On-Page Highlighting** | Biases highlighted directly on the webpage with unique colors per type |
| 📊 **Bias Report Card** | Neutrality score gauge + radar chart + summary statistics |
| 📝 **Neutral Rewrite** | AI-generated unbiased version with diff view |
| 💡 **Bias Explanations** | Detailed cards explaining each detected bias with neutral alternatives |
| 🌙 **Dark Mode** | Full dark/light mode support |
| 🔒 **Privacy-First** | API key stored locally, no data sent to third parties |

## 🛠️ Tech Stack

- **Extension Framework:** [WXT](https://wxt.dev/) (Vite-based browser extension toolkit)
- **UI:** React 18 + TypeScript + Tailwind CSS
- **AI/ML:** Google Gemini 2.5 Flash (structured output for reliable JSON responses)
- **Charts:** Recharts (radar chart for bias distribution)
- **Icons:** Lucide React
- **Architecture:** Manifest V3, Background Service Worker, Content Scripts, Side Panel API

## 📦 Installation

### From Source (Developer Mode)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/biaslens.git
   cd biaslens
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load in Chrome:**
   - Open `chrome://extensions`
   - Enable **Developer mode** (top right toggle)
   - Click **Load unpacked**
   - Select the `.output/chrome-mv3` folder

5. **Set your API key:**
   - Click the BiasLens extension icon to open the side panel
   - Click the ⚙️ settings gear
   - Paste your Gemini API key (get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey))
   - Click Save

### Development Mode

```bash
npm run dev
```

This starts WXT in dev mode with hot module replacement. The extension auto-reloads on code changes.

## 🎯 How to Use

1. **Navigate** to any news article, blog post, or opinion piece
2. **Click** the BiasLens icon in your toolbar — the side panel opens
3. **Click "Analyze This Page"** — watch biases light up on the page!
4. **Explore** the bias report: score, radar chart, individual bias cards
5. **Read** the neutral rewrite to see the text without manipulation

**Alternative:** Select any text on a page → right-click → "Analyze with BiasLens"

## 🏗️ Architecture

```
Extension Icon Click
        │
        ▼
   Side Panel (React)  ◄──────────────────────────┐
   ├── Analyze Page btn                            │
   │       │                                        │
   │       ▼                                        │
   │  Background Service Worker                     │
   │  ├── Receives request                          │
   │  ├── Sends EXTRACT_TEXT → Content Script        │
   │  ├── Content Script returns page text           │
   │  ├── Calls Gemini API                           │
   │  ├── Runs span matching                         │
   │  ├── Sends ANALYSIS_RESULT ──────────────────►  │
   │  └── Sends HIGHLIGHT_BIASES → Content Script   │
   │                                                │
   │  Content Script                                │
   │  ├── Receives bias data                        │
   │  ├── Walks DOM tree                            │
   │  ├── Wraps biased text in <biaslens-highlight> │
   │  └── Shows tooltips on hover                   │
   │                                                │
   Side Panel renders results                       │
   ├── Report Card (score + radar chart)            │
   ├── Bias Cards (explanations)                    │
   └── Neutral Rewrite                              │
```

## 👥 Team Members

- **[Your Name]** — Solo Developer

## 🤖 AI Tools Disclosure

| Tool | How It Was Used |
|---|---|
| **Google Gemini 2.5 Flash** | Core AI engine — analyzes text for cognitive biases, generates structured JSON output with bias annotations, neutrality scoring, and neutral rewrites. This is the primary AI/ML integration. |
| **Antigravity (Claude)** | Used as an AI coding assistant during development for code generation, architecture planning, and debugging. |

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built for [HyperBloom Hacks](https://hyperbloom-hacks.devpost.com/) 2026* 🌱
