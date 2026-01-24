import React, { useState, useEffect } from 'react';
import './popup.css';

interface AIOData {
  query: string;
  aiOverviewText: string;
  citedSources: string[];
  timestamp: string;
}

const Popup: React.FC = () => {
  const [status, setStatus] = useState<'no-aio' | 'aio-detected'>('no-aio');
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [blogUrl, setBlogUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aioData, setAioData] = useState<AIOData | null>(null);

  useEffect(() => {
    // Check for stored AIO data
    chrome.storage.local.get(['aioData'], (result: { aioData?: AIOData }) => {
      const stored = result.aioData;
      if (stored) {
        setAioData(stored);
        setStatus('aio-detected');
        setCurrentQuery(stored.query);
      }
    });

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.aioData?.newValue) {
        const stored = changes.aioData.newValue as AIOData;
        setAioData(stored);
        setStatus('aio-detected');
        setCurrentQuery(stored.query);
      }
      if (changes.aioData?.newValue === undefined) {
        setAioData(null);
        setStatus('no-aio');
        setCurrentQuery('');
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // Get current tab URL to pre-fill blog URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (url && !url.includes('google.com')) {
        setBlogUrl(url);
      }

      // Trigger a fresh AI Overview check only on Google tabs.
      if (tabs[0]?.id != null && url && url.includes('google.')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'checkAIO' }, () => {
          if (chrome.runtime.lastError) {
            // Ignore missing receiver errors on non-injected pages.
          }
        });
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleRunAnalysis = async () => {
    if (!blogUrl.trim() || !aioData) return;

    setIsLoading(true);
    try {
      // Call the Vercel backend API
      const response = await fetch('https://aio-serp-gap-analyzer.vercel.app/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: aioData.query,
          aiOverviewText: aioData.aiOverviewText,
          citedSources: aioData.citedSources,
          blogUrl: blogUrl.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded or quota exhausted. Please try again later.');
        }
        throw new Error('Analysis failed');
      }

      const result = await response.json();

      // Store the analysis result
      await chrome.storage.local.set({
        analysisResult: {
          ...result,
          timestamp: new Date().toISOString(),
          query: aioData.query,
        }
      });

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSidePanel = async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id != null) {
      chrome.sidePanel.open({ tabId: activeTab.id });
    }
  };

  const handleClear = () => {
    chrome.storage.local.remove(['aioData', 'analysisResult']);
    setAioData(null);
    setStatus('no-aio');
    setCurrentQuery('');
    setBlogUrl('');
  };

  return (
    <div className="popup">
      <div className="status">
        <div className={`status-indicator ${status}`}>
          {status === 'aio-detected' ? '✓ AI Overview detected' : 'No AI Overview detected'}
        </div>
        {currentQuery && (
          <div className="query">Query: {currentQuery}</div>
        )}
      </div>

      <div className="form">
        <label htmlFor="blogUrl">Blog/Article URL:</label>
        <input
          id="blogUrl"
          type="url"
          value={blogUrl}
          onChange={(e) => setBlogUrl(e.target.value)}
          placeholder="https://example.com/blog-post"
          disabled={!aioData}
        />

        <div className="buttons">
          <button
            onClick={handleRunAnalysis}
            disabled={!aioData || !blogUrl.trim() || isLoading}
            className="primary"
          >
            {isLoading ? 'Running...' : 'Run Gap Analysis'}
          </button>

          <button onClick={handleOpenSidePanel} className="secondary">
            Open Side Panel
          </button>
        </div>

        <button onClick={handleClear} className="clear">
          Clear Stored Data
        </button>
      </div>
    </div>
  );
};

export default Popup;
