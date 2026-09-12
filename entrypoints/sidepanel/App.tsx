import React, { useState, useEffect } from 'react';
import { AnalysisResult, BiasType, ExtensionMessage } from '@/types/analysis';
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
import { AlertCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { browser } from 'wxt/browser';
import { EXAMPLE_TEXTS } from '@/lib/examples';

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
    let key = apiKey;
    if (!key) {
      const res = await browser.storage.local.get('biaslens_api_key');
      if (res.biaslens_api_key) {
        key = res.biaslens_api_key;
        setApiKey(key);
      }
    }

    if (!key) {
      setShowSettings(true);
      return;
    }
    
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        setStatus('loading');
        setError(null);
        browser.runtime.sendMessage({ type: 'ANALYZE_PAGE', tabId: tab.id });
      } else {
        setError('Active browser tab could not be resolved');
        setStatus('error');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to analyze page');
      setStatus('error');
    }
  };

  const handleAnalyzeText = async () => {
    let key = apiKey;
    if (!key) {
      const res = await browser.storage.local.get('biaslens_api_key');
      if (res.biaslens_api_key) {
        key = res.biaslens_api_key;
        setApiKey(key);
      }
    }

    if (!key) {
      setShowSettings(true);
      return;
    }
    
    if (!inputText.trim()) return;
    
    setStatus('loading');
    setError(null);
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
    <div className="flex flex-col min-h-screen relative bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--text-primary)] selection:text-[var(--bg-primary)]">
      <Header 
        darkMode={darkMode} 
        onToggleDarkMode={handleToggleDarkMode}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      <main className="flex-1 p-4 sm:p-5 overflow-y-auto">
        {showSettings ? (
          <Settings 
            apiKey={apiKey} 
            onSave={handleSaveApiKey} 
            onClose={() => setShowSettings(false)} 
          />
        ) : (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            
            {status === 'idle' && (
              <div className="animate-fade-in space-y-6">
                <AnalysisControls 
                  mode={mode} 
                  onModeChange={setMode} 
                  onAnalyzePage={handleAnalyzePage}
                  isLoading={status === 'loading'}
                />
                
                {mode === 'text' && (
                  <TextInput 
                    value={inputText} 
                    onChange={setInputText} 
                    onAnalyze={handleAnalyzeText}
                    isLoading={status === 'loading'}
                    examples={EXAMPLE_TEXTS}
                  />
                )}
              </div>
            )}

            {status === 'loading' && <LoadingState />}

            {status === 'error' && (
              <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] text-center animate-fade-in space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Analysis Interrupted</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs leading-relaxed">{error}</p>
                </div>
                <button 
                  onClick={resetAnalysis}
                  className="mt-2 px-3.5 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-primary)] border border-[var(--border)] rounded-md transition-colors text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            )}

            {status === 'success' && result && (
              <div className="animate-fade-in space-y-6 pb-8">
                {/* Header Action Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                      Audit Complete
                    </span>
                    <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                      Cognitive Bias Assessment
                    </h2>
                  </div>
                  <button 
                    onClick={resetAnalysis}
                    className="text-xs font-medium px-2.5 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-md transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Audit</span>
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
                      onBiasClick={(bias) => setExpandedBiasId(expandedBiasId === bias.id ? null : bias.id)} 
                    />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                          Flagged Rhetorical Instances
                        </h3>
                        <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                          {result.biases.filter(b => !activeFilter || b.type === activeFilter).length} of {result.biases.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
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
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={13} />
                      Neutrality Verified
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">No significant bias patterns detected</p>
                    <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                      The analyzed passage maintains high journalistic detachment, presenting balanced viewpoints without notable loaded language or fallacious framing.
                    </p>
                  </div>
                )}

                <RewritePanel 
                  originalText={result.originalText} 
                  rewrittenText={result.rewrittenText} 
                  biases={result.biases}
                />
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
