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
          background-color: color-mix(in srgb, var(--bl-color) 16%, transparent);
          cursor: pointer;
          border-radius: 2px;
          padding: 1px 2px;
          margin: 0 1px;
          transition: background-color 0.15s ease;
          display: inline;
        }
        biaslens-highlight:hover {
          background-color: color-mix(in srgb, var(--bl-color) 35%, transparent);
        }
        biaslens-tooltip {
          position: absolute;
          background: #090d16;
          color: #f1f5f9;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 11px;
          max-width: 320px;
          z-index: 2147483647;
          pointer-events: none;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
          line-height: 1.45;
          font-family: system-ui, -apple-system, sans-serif;
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
        }
        .biaslens-tooltip-title {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
          color: var(--bl-color);
        }
        .biaslens-tooltip-explanation {
          color: #cbd5e1;
          margin-bottom: 5px;
          font-size: 11px;
        }
        .biaslens-tooltip-alt {
          font-size: 10.5px;
          color: #94a3b8;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 4px;
          margin-top: 4px;
        }
      `;
      document.head.appendChild(style);
    }

    function createTooltip() {
      if (tooltipElement && document.body.contains(tooltipElement)) return;
      tooltipElement = document.createElement('biaslens-tooltip');
      document.body.appendChild(tooltipElement);
      tooltipElement.style.display = 'none';
    }

    function extractPageText(): string {
      const candidateSelectors = [
        '#mw-content-text .mw-parser-output', // Wikipedia main article content
        '#mw-content-text',
        'article',
        'main',
        '[role="main"]',
        '.article-body',
        '.story-body',
        '.post-content',
        '.entry-content',
        '.content'
      ];

      let selectedElement: HTMLElement | null = null;
      for (const selector of candidateSelectors) {
        const el = document.querySelector(selector);
        if (el instanceof HTMLElement) {
          const textLen = (el.innerText || el.textContent || '').trim().length;
          if (textLen > 300) {
            selectedElement = el;
            break;
          }
        }
      }

      const rootElement = selectedElement || document.body;

      // Clone so we can strip noise without mutating the live webpage DOM
      const clone = rootElement.cloneNode(true) as HTMLElement;

      const noiseSelectors = [
        'script', 'style', 'noscript', 'iframe', 'svg',
        'nav', 'header', 'footer', 'aside',
        '[role="navigation"]', '[role="banner"]', '[role="complementary"]',
        '.toc', '#toc', '.vector-toc', '#vector-toc-pinned-container',
        '.mw-editsection', '.mw-jump-link', '.reflist', '.navbox', '.infobox',
        '.reference', 'sup.reference',
        '.ad', '.advertisement', '.social-share', '.share-buttons',
        '.comments', '#comments', '.newsletter-signup', '.cookie-banner',
        '.sidebar', '#sidebar', '.widget'
      ];

      const noiseElements = clone.querySelectorAll(noiseSelectors.join(','));
      noiseElements.forEach(el => el.remove());

      // Render offscreen to get authentic layout-aware innerText with paragraph linebreaks
      const sandbox = document.createElement('div');
      sandbox.style.position = 'absolute';
      sandbox.style.left = '-99999px';
      sandbox.style.top = '-99999px';
      sandbox.style.visibility = 'hidden';
      sandbox.appendChild(clone);
      document.body.appendChild(sandbox);

      let text = sandbox.innerText || clone.textContent || '';
      sandbox.remove();

      // Clean up whitespace
      text = text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();

      // Fallback to body text if extracted container was too empty
      if (text.length < 200 && rootElement !== document.body) {
        const bodyClone = document.body.cloneNode(true) as HTMLElement;
        bodyClone.querySelectorAll(noiseSelectors.join(',')).forEach(el => el.remove());
        text = (bodyClone.innerText || bodyClone.textContent || '').trim();
      }

      return text;
    }

    function wrapTextNodeMatch(textNode: Text, index: number, length: number, bias: BiasInstance): HTMLElement | null {
      try {
        if (!textNode.nodeValue || index < 0 || length <= 0) return null;
        if (index + length > textNode.nodeValue.length) return null;

        const matchNode = textNode.splitText(index);
        matchNode.splitText(length);

        const highlight = document.createElement('biaslens-highlight');
        const color = getBiasColor(bias.type);
        highlight.style.setProperty('--bl-color', color);
        highlight.dataset.biasType = bias.type;
        highlight.dataset.biasId = bias.id;
        highlight.dataset.explanation = bias.explanation;
        
        highlight.textContent = matchNode.nodeValue;
        matchNode.parentNode?.replaceChild(highlight, matchNode);

        // Tooltip event handlers
        highlight.addEventListener('mouseenter', (e) => {
          if (!tooltipElement) return;
          const target = e.target as HTMLElement;
          const rect = target.getBoundingClientRect();
          
          const title = getBiasTypeLabel(bias.type);
          tooltipElement.innerHTML = `
            <div class="biaslens-tooltip-title" style="--bl-color: ${color}">${title}</div>
            <div class="biaslens-tooltip-explanation">${bias.explanation}</div>
            ${bias.suggestion ? `<div class="biaslens-tooltip-alt"><strong>Suggestion:</strong> ${bias.suggestion}</div>` : ''}
          `;
          
          tooltipElement.style.display = 'block';
          
          const top = rect.top + window.scrollY - tooltipElement.offsetHeight - 8;
          const left = rect.left + window.scrollX;
          tooltipElement.style.top = `${Math.max(0, top)}px`;
          tooltipElement.style.left = `${Math.max(8, Math.min(left, window.innerWidth - 330))}px`;
        });

        highlight.addEventListener('mouseleave', () => {
          if (tooltipElement) {
            tooltipElement.style.display = 'none';
          }
        });

        return highlight;
      } catch (e) {
        console.warn('Failed to wrap text node:', e);
        return null;
      }
    }

    function highlightBiases(biases: BiasInstance[], originalText: string) {
      clearHighlights();
      injectStyles();
      createTooltip();

      biases.forEach(bias => {
        if (!bias.quote || bias.quote.trim().length < 3) return;
        const cleanQuote = bias.quote.trim();
        const normalizedQuote = cleanQuote.replace(/\s+/g, ' ');

        let matched = false;

        // Strategy 1: Direct single TextNode match (fast path)
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const tag = parent.tagName;
              if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'BIASLENS-HIGHLIGHT' || tag === 'BIASLENS-TOOLTIP') {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );

        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (!node.nodeValue) continue;
          const idx = node.nodeValue.indexOf(cleanQuote);
          if (idx !== -1) {
            wrapTextNodeMatch(node as Text, idx, cleanQuote.length, bias);
            matched = true;
            break;
          }
        }

        if (matched) return;

        // Strategy 2: Cross-element match within container elements (e.g. quotes containing links or citations)
        const candidateBlocks = document.querySelectorAll('p, li, blockquote, h1, h2, h3, h4, h5, h6, dd, td, section, div');
        for (const block of Array.from(candidateBlocks)) {
          if (block.closest('biaslens-tooltip') || block.tagName === 'SCRIPT' || block.tagName === 'STYLE') continue;

          const blockText = (block.textContent || '').replace(/\s+/g, ' ');
          if (!blockText.includes(normalizedQuote)) continue;

          // Collect child text nodes
          const textNodes: Text[] = [];
          const blockWalker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
            acceptNode: (n) => {
              const p = n.parentElement;
              if (!p || p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.tagName === 'BIASLENS-HIGHLIGHT') {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          });

          let tn: Node | null;
          while ((tn = blockWalker.nextNode())) {
            if (tn.nodeValue) textNodes.push(tn as Text);
          }

          if (textNodes.length === 0) continue;

          // Map text nodes to character positions in cumulative text
          let cumulative = '';
          const nodeRanges: { node: Text; start: number; end: number }[] = [];
          for (const t of textNodes) {
            const val = t.nodeValue || '';
            const start = cumulative.length;
            cumulative += val;
            nodeRanges.push({ node: t, start, end: start + val.length });
          }

          // Locate match in cumulative text
          let startIdx = cumulative.indexOf(cleanQuote);
          let matchLen = cleanQuote.length;

          if (startIdx === -1) {
            // Flexible regex match for whitespace differences
            const words = cleanQuote.split(/\s+/).filter(Boolean);
            if (words.length > 0) {
              const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
              try {
                const reg = new RegExp(escaped, 'i');
                const m = reg.exec(cumulative);
                if (m) {
                  startIdx = m.index;
                  matchLen = m[0].length;
                }
              } catch (e) {}
            }
          }

          if (startIdx !== -1) {
            const endIdx = startIdx + matchLen;
            const nodesToWrap: { node: Text; startInNode: number; lengthInNode: number }[] = [];

            for (const nr of nodeRanges) {
              const overlapStart = Math.max(startIdx, nr.start);
              const overlapEnd = Math.min(endIdx, nr.end);
              if (overlapStart < overlapEnd) {
                nodesToWrap.push({
                  node: nr.node,
                  startInNode: overlapStart - nr.start,
                  lengthInNode: overlapEnd - overlapStart
                });
              }
            }

            // Wrap backwards to maintain valid text offsets
            for (let i = nodesToWrap.length - 1; i >= 0; i--) {
              const item = nodesToWrap[i];
              wrapTextNodeMatch(item.node, item.startInNode, item.lengthInNode, bias);
            }

            matched = true;
            break;
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
