// Content script to detect Google AI Overviews
(() => {
  'use strict';

  let lastQuery = '';
  let isMonitoring = false;

  // Function to extract search query from URL
  function getSearchQuery(): string {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') || '';
  }

  // Function to detect AI Overview containers
  function findAIOverviewContainer(): Element | null {
    // Look for common AI Overview selectors (these may change over time)
    const selectors = [
      '[data-attrid="ai-overview"]',
      '[data-ved*="ai-overview"]',
      '.ai-overview',
      '#ai-overview',
      '[jsname*="ai-overview"]',
      // More generic selectors based on observed patterns
      'div[data-ved]:has([data-attrid*="organic-result"])',
      // Look for containers with specific text patterns
      'div:contains("AI Overview")',
      'div:contains("AI-Generated Overview")',
    ];

    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          // Additional checks to confirm it's an AI Overview
          if (isLikelyAIOverview(element)) {
            return element;
          }
        }
      } catch (e) {
        // Invalid selector, continue
      }
    }

    // Fallback: look for elements with AI Overview-like content
    const allDivs = document.querySelectorAll('div');
    for (const div of allDivs) {
      if (isLikelyAIOverview(div)) {
        return div;
      }
    }

    return null;
  }

  // Function to check if an element is likely an AI Overview
  function isLikelyAIOverview(element: Element): boolean {
    const text = element.textContent?.toLowerCase() || '';

    // Check for AI Overview indicators
    const aiIndicators = [
      'ai overview',
      'ai-generated overview',
      'artificial intelligence',
      'ai-powered',
    ];

    const hasAIIndicator = aiIndicators.some(indicator => text.includes(indicator));

    // Check for structured content typical of AI Overviews
    const hasStructuredContent = element.querySelectorAll('h3, h4, p, ul, ol').length > 2;

    // Check for citation links (common in AI Overviews)
    const hasCitations = element.querySelectorAll('a[href*="google.com/url"]').length > 0;

    return hasAIIndicator || (hasStructuredContent && hasCitations);
  }

  // Function to extract AI Overview text
  function extractAIOverviewText(container: Element): string {
    // Remove citation links and other clutter
    const clonedContainer = container.cloneNode(true) as Element;

    // Remove citation superscripts and links
    clonedContainer.querySelectorAll('sup, .citation, [role="link"]').forEach(el => el.remove());

    // Remove scripts/styles that can pollute the extracted text
    clonedContainer.querySelectorAll('script, style, noscript').forEach(el => el.remove());

    // Remove Google-specific elements
    clonedContainer.querySelectorAll('[data-ved], [jsname], [jscontroller]').forEach(el => el.remove());

    // Extract clean text
    const text = clonedContainer.textContent?.trim() || '';

    // Clean up extra whitespace
    return text.replace(/\s+/g, ' ').trim();
  }

  // Function to extract cited sources
  function extractCitedSources(container: Element): string[] {
    const sources: string[] = [];
    const links = container.querySelectorAll('a[href]');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('google.com/url')) {
        try {
          const url = new URL(href);
          const actualUrl = url.searchParams.get('url') || url.searchParams.get('q');
          if (actualUrl) {
            sources.push(actualUrl);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    return [...new Set(sources)]; // Remove duplicates
  }

  // Function to store AI Overview data
  function storeAIOverviewData(query: string, aiOverviewText: string, citedSources: string[]) {
    const data = {
      query,
      aiOverviewText,
      citedSources,
      timestamp: new Date().toISOString(),
    };

    chrome.runtime.sendMessage({
      action: 'storeAIOData',
      data,
    });
  }

  // Function to check for AI Overview
  function checkForAIOverview() {
    const currentQuery = getSearchQuery();

    if (!currentQuery || currentQuery === lastQuery) {
      return; // No change in query
    }

    lastQuery = currentQuery;

    // Wait a bit for the page to load
    setTimeout(() => {
      const aiContainer = findAIOverviewContainer();

      if (aiContainer) {
        const aiOverviewText = extractAIOverviewText(aiContainer);
        const citedSources = extractCitedSources(aiContainer);

        if (aiOverviewText.length > 50) { // Minimum length check
          console.log('AI Overview detected:', { query: currentQuery, text: aiOverviewText.substring(0, 100) + '...' });
          storeAIOverviewData(currentQuery, aiOverviewText, citedSources);
        }
      }
    }, 2000); // Wait 2 seconds for dynamic content to load
  }

  // Start monitoring
  function startMonitoring() {
    if (isMonitoring) return;
    isMonitoring = true;

    // Check immediately
    checkForAIOverview();

    // Set up observers for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if new content was added that might contain AI Overview
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.matches && (
                element.matches('[data-attrid*="ai"]') ||
                element.matches('[data-ved]') ||
                element.textContent?.toLowerCase().includes('ai overview')
              )) {
                shouldCheck = true;
                break;
              }
            }
          }
        }
      });

      if (shouldCheck) {
        setTimeout(checkForAIOverview, 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMonitoring);
  } else {
    startMonitoring();
  }

  // Also check when URL changes (SPA navigation)
  let currentUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      lastQuery = ''; // Reset to allow re-detection on same query
      setTimeout(checkForAIOverview, 1000);
    }
  }, 1000);
})();
