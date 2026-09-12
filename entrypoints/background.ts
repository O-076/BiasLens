import { defineBackground } from 'wxt/sandbox';
import { analyzeText } from '@/lib/gemini';
import { matchSpans } from '@/lib/span-matcher';
import { ExtensionMessage } from '@/types/analysis';

export default defineBackground(() => {
  // Setup side panel behavior on install
  browser.runtime.onInstalled.addListener(() => {
    // Open side panel when extension icon is clicked
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
    }

    // Create context menu item
    browser.contextMenus.create({
      id: 'analyze-selection',
      title: 'Analyze with BiasLens',
      contexts: ['selection'],
    });
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'analyze-selection' && info.selectionText) {
      if (tab?.id) {
        // First open the side panel if we can (Chrome only)
        if (chrome.sidePanel && chrome.sidePanel.open) {
          try {
            await chrome.sidePanel.open({ tabId: tab.id });
          } catch (e) {
            console.error('Failed to open side panel:', e);
          }
        }

        // Delay slightly to give sidepanel time to load and start listening
        setTimeout(() => {
          handleTextAnalysis(info.selectionText!, tab.id!);
        }, 500);
      }
    }
  });

  // Handle messages from side panel and content scripts
  browser.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === 'ANALYZE_PAGE') {
      handlePageAnalysis(message.tabId);
      return true; // Indicate we will send a response asynchronously
    } else if (message.type === 'ANALYZE_TEXT') {
      handleTextAnalysis(message.text);
      return true;
    }
    return false;
  });

  async function handlePageAnalysis(tabId: number) {
    try {
      // Check active tab URL first
      const tab = await browser.tabs.get(tabId);
      const url = tab.url || '';

      if (!url || url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:') || url.startsWith('chrome-extension://')) {
        throw new Error('Cannot analyze browser internal pages. Please switch to a public webpage (e.g. a news article, blog, or Wikipedia) or use the "Paste Text" tab.');
      }

      // Notify loading
      browser.runtime.sendMessage({ type: 'ANALYSIS_LOADING' }).catch(() => {});

      // Extract text from content script, with fallback injection
      let extractedText: string | null = null;
      try {
        extractedText = await browser.tabs.sendMessage(tabId, { type: 'EXTRACT_TEXT' });
      } catch (connErr) {
        // Tab was likely opened before extension was loaded/reloaded.
        // Try programmatic injection using chrome.scripting
        if (chrome.scripting && chrome.scripting.executeScript) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId },
              files: ['content-scripts/content.js']
            });
            await new Promise(r => setTimeout(r, 150));
            extractedText = await browser.tabs.sendMessage(tabId, { type: 'EXTRACT_TEXT' });
          } catch (injectErr) {
            console.warn('Script injection failed:', injectErr);
          }
        }
      }

      if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length === 0) {
        throw new Error('Could not extract text from this page. Please refresh the page tab (F5) and try again, or use "Paste Text".');
      }

      // Get API key
      const storage = await browser.storage.local.get('biaslens_api_key');
      const apiKey = storage.biaslens_api_key;
      if (!apiKey) {
        throw new Error('API key not found. Please set your Gemini API key in the settings.');
      }

      // Analyze text
      const result = await analyzeText(apiKey, extractedText);
      
      // Match spans
      const matchedResult = {
        ...result,
        biases: matchSpans(extractedText, result.biases)
      };

      // Send result back to side panel
      browser.runtime.sendMessage({ type: 'ANALYSIS_RESULT', result: matchedResult }).catch(() => {});

      // Highlight biases on the page
      browser.tabs.sendMessage(tabId, { 
        type: 'HIGHLIGHT_BIASES', 
        biases: matchedResult.biases,
        originalText: extractedText
      }).catch(console.error);

    } catch (error: any) {
      console.error('Page analysis error:', error);
      let userMsg = error.message || 'An error occurred during analysis.';
      if (userMsg.includes('Could not establish connection')) {
        userMsg = 'Cannot connect to this tab. Please refresh the page tab (F5) and try again, or use "Paste Text".';
      }
      browser.runtime.sendMessage({ 
        type: 'ANALYSIS_ERROR', 
        error: userMsg
      }).catch(() => {});
    }
  }

  async function handleTextAnalysis(text: string, tabId?: number) {
    try {
      // Notify loading
      browser.runtime.sendMessage({ type: 'ANALYSIS_LOADING' }).catch(() => {});

      // Get API key
      const storage = await browser.storage.local.get('biaslens_api_key');
      const apiKey = storage.biaslens_api_key;
      if (!apiKey) {
        throw new Error('API key not found. Please set your Gemini API key in the settings.');
      }

      // Analyze text
      const result = await analyzeText(apiKey, text);
      
      // Match spans
      const matchedResult = {
        ...result,
        biases: matchSpans(text, result.biases)
      };

      // Send result back to side panel
      browser.runtime.sendMessage({ type: 'ANALYSIS_RESULT', result: matchedResult }).catch(() => {});

      // If triggered from context menu on a page, try to highlight
      if (tabId) {
        browser.tabs.sendMessage(tabId, { 
          type: 'HIGHLIGHT_BIASES', 
          biases: matchedResult.biases,
          originalText: text
        }).catch(() => {
           // Content script might not be injected, ignore
        });
      }

    } catch (error: any) {
      console.error('Text analysis error:', error);
      browser.runtime.sendMessage({ 
        type: 'ANALYSIS_ERROR', 
        error: error.message || 'An error occurred during analysis.' 
      }).catch(() => {});
    }
  }
});
