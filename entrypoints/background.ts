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
      // Notify loading
      browser.runtime.sendMessage({ type: 'ANALYSIS_LOADING' }).catch(() => {});

      // Extract text from content script
      const extractedText = await browser.tabs.sendMessage(tabId, { type: 'EXTRACT_TEXT' });
      if (!extractedText || typeof extractedText !== 'string') {
        throw new Error('Failed to extract text from the page.');
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
      browser.runtime.sendMessage({ 
        type: 'ANALYSIS_ERROR', 
        error: error.message || 'An error occurred during analysis.' 
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
