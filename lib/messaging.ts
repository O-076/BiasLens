import { ExtensionMessage } from '@/types/analysis';
import { browser } from 'wxt/browser';

export async function sendToBackground(message: ExtensionMessage): Promise<any> {
  try {
    return await browser.runtime.sendMessage(message);
  } catch (error) {
    console.error('Failed to send message to background:', error);
    throw error;
  }
}

export async function sendToTab(tabId: number, message: ExtensionMessage): Promise<any> {
  try {
    return await browser.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.error(`Failed to send message to tab ${tabId}:`, error);
    throw error;
  }
}

export function onMessage(handler: (message: ExtensionMessage, sender: any) => void | Promise<any>): void {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const result = handler(message as ExtensionMessage, sender);
    
    if (result instanceof Promise) {
      result.then(sendResponse).catch((error) => {
        console.error('Message handler error:', error);
        sendResponse({ error: error.message });
      });
      return true; // Indicates async response
    } else {
      sendResponse(result);
      return false; // Sync response
    }
  });
}
