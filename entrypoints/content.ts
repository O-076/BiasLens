import { defineContentScript } from 'wxt/sandbox';
import { getBiasColor, getBiasTypeLabel } from '@/lib/bias-taxonomy';
import { BiasInstance, ExtensionMessage } from '@/types/analysis';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let tooltipElement: HTMLElement | null = null;

    function injectStyles() {
      if (document.getElementById('biaslens-styles')) return;

      const style = document.createElement('style');
      style.id = 'biaslens-styles';
      style.textContent = `
        biaslens-highlight {
          border-bottom: 2px solid var(--bl-color);
          background-color: color-mix(in srgb, var(--bl-color) 12%, transparent);
          cursor: pointer;
          border-radius: 2px;
          padding: 0 1px;
          transition: background-color 0.15s;
        }
        biaslens-highlight:hover {
          background-color: color-mix(in srgb, var(--bl-color) 30%, transparent);
        }
        biaslens-tooltip {
          position: absolute;
          background: #1e293b;
          color: #f1f5f9;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          max-width: 280px;
          z-index: 999999;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          line-height: 1.4;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .biaslens-tooltip-title {
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--bl-color);
        }
      `;
      document.head.appendChild(style);
    }

    function createTooltip() {
      if (tooltipElement) return;
      tooltipElement = document.createElement('biaslens-tooltip');
      document.body.appendChild(tooltipElement);
      tooltipElement.style.display = 'none';
    }

    function extractPageText(): string {
      const selectors = ['article', '[role="main"]', '.post-content', '.article-body', '.entry-content', 'main'];
      let mainElement: HTMLElement | null = null;

      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el instanceof HTMLElement) {
          mainElement = el;
          break;
        }
      }

      const textSource = mainElement || document.body;
      let text = textSource.innerText;
      
      // Clean up
      text = text.replace(/\n{3,}/g, '\n\n').trim();
      return text;
    }

    function highlightBiases(biases: BiasInstance[], originalText: string) {
      clearHighlights();
      injectStyles();
      createTooltip();

      biases.forEach(bias => {
        if (!bias.quote) return;

        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              if (node.parentElement && 
                 (node.parentElement.tagName === 'SCRIPT' || 
                  node.parentElement.tagName === 'STYLE' || 
                  node.parentElement.tagName === 'BIASLENS-HIGHLIGHT')) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );

        let node;
        while ((node = walker.nextNode())) {
          if (!node.nodeValue) continue;
          
          const index = node.nodeValue.indexOf(bias.quote);
          if (index !== -1) {
            const textNode = node as Text;
            const matchNode = textNode.splitText(index);
            matchNode.splitText(bias.quote.length);

            const highlight = document.createElement('biaslens-highlight');
            const color = getBiasColor(bias.type);
            highlight.style.setProperty('--bl-color', color);
            highlight.dataset.biasType = bias.type;
            highlight.dataset.biasId = bias.id;
            highlight.dataset.explanation = bias.explanation;
            
            highlight.textContent = matchNode.nodeValue;
            matchNode.parentNode?.replaceChild(highlight, matchNode);

            // Add events
            highlight.addEventListener('mouseenter', (e) => {
              if (!tooltipElement) return;
              const target = e.target as HTMLElement;
              const rect = target.getBoundingClientRect();
              
              const title = getBiasTypeLabel(bias.type);
              tooltipElement.innerHTML = `<div class="biaslens-tooltip-title" style="--bl-color: ${color}">${title}</div><div>${bias.explanation.substring(0, 100)}${bias.explanation.length > 100 ? '...' : ''}</div>`;
              
              tooltipElement.style.display = 'block';
              
              // Position tooltip
              const top = rect.top + window.scrollY - tooltipElement.offsetHeight - 8;
              const left = rect.left + window.scrollX;
              tooltipElement.style.top = `${Math.max(0, top)}px`;
              tooltipElement.style.left = `${left}px`;
            });

            highlight.addEventListener('mouseleave', () => {
              if (tooltipElement) {
                tooltipElement.style.display = 'none';
              }
            });

            break; // Stop after first match for this quote to avoid highlighting everywhere if it's generic
          }
        }
      });
    }

    function clearHighlights() {
      const highlights = document.querySelectorAll('biaslens-highlight');
      highlights.forEach(highlight => {
        const text = document.createTextNode(highlight.textContent || '');
        highlight.parentNode?.replaceChild(text, highlight);
      });
      if (tooltipElement) {
        tooltipElement.style.display = 'none';
      }
    }

    browser.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
      if (message.type === 'EXTRACT_TEXT') {
        sendResponse(extractPageText());
      } else if (message.type === 'HIGHLIGHT_BIASES') {
        highlightBiases(message.biases, message.originalText);
      } else if (message.type === 'CLEAR_HIGHLIGHTS') {
        clearHighlights();
      }
    });
  }
});
