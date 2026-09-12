import React, { useState, useEffect } from 'react';
import { AnalysisResult, BiasType, BiasInstance, ExtensionMessage } from '@/types/analysis';
import { Settings } from '@/components/Settings';
import { Header } from '@/components/Header';
import { AnalysisControls } from '@/components/AnalysisControls';
import { TextInput } from '@/components/TextInput';
import { LoadingState } from '@/components/LoadingState';
import { ReportCard } from '@/components/ReportCard';
import { BiasLegend } from '@/components/BiasLegend';
import { AnalysisView } from '@/components/AnalysisView';
import { BiasCard } from '@/components/BiasCard';
import { RewritePanel } from '@/components/RewritePanel';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { browser } from 'wxt/browser';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const [mode, setMode] = useState<'page' | 'text'>('page');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [activeFilter, setActiveFilter] = useState<BiasType | null>(null);
  const [expandedBiasId, setExpandedBiasId] = useState<string | null>(null);

  useEffect(() => {
    // Load preferences
    browser.storage.local.get(['biaslens_api_key', 'biaslens_dark_mode']).then((res) => {
      if (res.biaslens_api_key) setApiKey(res.biaslens_api_key);
      if (res.biaslens_dark_mode) {
        setDarkMode(res.biaslens_dark_mode);
      }
    });

    // Message listener
    const handleMessage = (message: ExtensionMessage) => {
      if (message.type === 'ANALYSIS_LOADING') {
        setStatus('loading');
        setError(null);
      } else if (message.type === 'ANALYSIS_RESULT') {
        setResult(message.result);
        setStatus('success');
      } else if (message.type === 'ANALYSIS_ERROR') {
        setError(message.error);
        setStatus('error');
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAnalyzePage = async () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        setStatus('loading');
        browser.runtime.sendMessage({ type: 'ANALYZE_PAGE', tabId: tab.id });
      } else {
        setError('Could not find active tab');
        setStatus('error');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to analyze page');
      setStatus('error');
    }
  };

  const handleAnalyzeText = () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    
    if (!inputText.trim()) return;
    
    setStatus('loading');
    browser.runtime.sendMessage({ type: 'ANALYZE_TEXT', text: inputText });
  };

  const handleSaveApiKey = async (key: string) => {
    setApiKey(key);
    await browser.storage.local.set({ biaslens_api_key: key });
    setShowSettings(false);
  };

  const handleToggleDarkMode = async () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    await browser.storage.local.set({ biaslens_dark_mode: newVal });
  };

  const resetAnalysis = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setActiveFilter(null);
    setExpandedBiasId(null);
    // Try to clear highlights on active tab
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) {
        browser.tabs.sendMessage(tab.id, { type: 'CLEAR_HIGHLIGHTS' }).catch(() => {});
      }
    });
  };

  const detectedTypes = result ? Array.from(new Set(result.biases.map(b => b.type))) : [];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      <Header 
        darkMode={darkMode} 
        onToggleDarkMode={handleToggleDarkMode}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      <main className="flex-1 p-4 overflow-y-auto">
        {showSettings ? (
          <Settings apiKey={apiKey} onSave={handleSaveApiKey} />
        ) : (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            
            {status === 'idle' && (
              <div className="animate-fade-in space-y-6">
                <AnalysisControls 
                  mode={mode} 
                  onModeChange={setMode} 
                  onAnalyzePage={handleAnalyzePage}
                  onAnalyzeText={handleAnalyzeText}
                  isTextEmpty={!inputText.trim()}
                />
                
                {mode === 'text' && (
                  <TextInput value={inputText} onChange={setInputText} />
                )}
              </div>
            )}

            {status === 'loading' && <LoadingState />}

            {status === 'error' && (
              <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] text-center animate-fade-in">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
                <p className="text-[var(--text-secondary)] mb-6">{error}</p>
                <button 
                  onClick={resetAnalysis}
                  className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--border)] rounded-md transition-colors font-medium flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            )}

            {status === 'success' && result && (
              <div className="animate-fade-in space-y-8 pb-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Analysis Results</h2>
                  <button 
                    onClick={resetAnalysis}
                    className="text-sm px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--border)] border border-[var(--border)] rounded-md transition-colors"
                  >
                    New Analysis
                  </button>
                </div>

                <ReportCard result={result} />
                
                {result.biases.length > 0 ? (
                  <>
                    <BiasLegend 
                      detectedTypes={detectedTypes} 
                      activeFilter={activeFilter} 
                      onFilterChange={setActiveFilter} 
                    />
                    
                    <AnalysisView 
                      result={result} 
                      activeFilter={activeFilter} 
                      onBiasClick={(id) => setExpandedBiasId(expandedBiasId === id ? null : id)} 
                    />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b border-[var(--border)] pb-2">Detected Biases</h3>
                      {result.biases
                        .filter(b => !activeFilter || b.type === activeFilter)
                        .map((bias) => (
                          <BiasCard 
                            key={bias.id} 
                            bias={bias} 
                            isExpanded={expandedBiasId === bias.id}
                            onToggle={() => setExpandedBiasId(expandedBiasId === bias.id ? null : bias.id)}
                          />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] text-center">
                    <p className="text-lg font-medium text-green-500 mb-2">No significant biases detected!</p>
                    <p className="text-[var(--text-secondary)]">The analyzed text appears to be highly neutral and objective.</p>
                  </div>
                )}

                <RewritePanel 
                  originalText={result.originalText} 
                  rewrittenText={result.rewrittenText} 
                />
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
