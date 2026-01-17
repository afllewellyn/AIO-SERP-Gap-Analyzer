import React, { useState, useEffect } from 'react';
import './sidepanel.css';

interface AnalysisResult {
  summary: string;
  missingTopics: string[];
  missingEntities: string[];
  recommendedSections: Array<{
    title: string;
    whatToInclude: string;
    whereToPlace: string;
  }>;
  suggestedSnippets: string[];
  priorityActions: Array<{
    action: string;
    rationale: string;
  }>;
  risksAndCaveats: string[];
  timestamp: string;
  query: string;
}

interface AIOData {
  query: string;
  aiOverviewText: string;
  citedSources: string[];
  timestamp: string;
}

const SidePanel: React.FC = () => {
  const [aioData, setAioData] = useState<AIOData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // Load stored data
    chrome.storage.local.get(['aioData', 'analysisResult'], (result) => {
      if (result.aioData) {
        setAioData(result.aioData);
      }
      if (result.analysisResult) {
        setAnalysisResult(result.analysisResult);
      }
    });
  }, []);

  const handleCopyAIO = () => {
    if (aioData?.aiOverviewText) {
      navigator.clipboard.writeText(aioData.aiOverviewText);
    }
  };

  const handleCopyRecommendations = () => {
    if (analysisResult) {
      const text = `
Summary: ${analysisResult.summary}

Missing Topics:
${analysisResult.missingTopics.map(topic => `- ${topic}`).join('\n')}

Missing Entities:
${analysisResult.missingEntities.map(entity => `- ${entity}`).join('\n')}

Recommended Sections:
${analysisResult.recommendedSections.map(section =>
  `${section.title}: ${section.whatToInclude} (${section.whereToPlace})`
).join('\n')}

Suggested Snippets:
${analysisResult.suggestedSnippets.map(snippet => `- ${snippet}`).join('\n')}

Priority Actions:
${analysisResult.priorityActions.map(action =>
  `${action.action} (${action.rationale})`
).join('\n')}

Risks and Caveats:
${analysisResult.risksAndCaveats.map(risk => `- ${risk}`).join('\n')}
      `.trim();
      navigator.clipboard.writeText(text);
    }
  };

  const handleClear = () => {
    chrome.storage.local.remove(['aioData', 'analysisResult']);
    setAioData(null);
    setAnalysisResult(null);
  };

  return (
    <div className="sidepanel">
      <header>
        <h1>AIO Gap Analysis</h1>
        {analysisResult && (
          <div className="metadata">
            <div>Query: {analysisResult.query}</div>
            <div>Analyzed: {new Date(analysisResult.timestamp).toLocaleString()}</div>
          </div>
        )}
      </header>

      <div className="content">
        <div className="section">
          <div className="section-header">
            <h2>AI Overview Text</h2>
            <button onClick={handleCopyAIO} className="copy-btn">
              Copy AIO
            </button>
          </div>
          <textarea
            className="scrollable-text"
            value={aioData?.aiOverviewText || 'No AI Overview detected yet'}
            readOnly
          />
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Gap Analysis Recommendations</h2>
            <button onClick={handleCopyRecommendations} className="copy-btn">
              Copy Recommendations
            </button>
          </div>
          <textarea
            className="scrollable-text"
            value={analysisResult ? formatAnalysisResult(analysisResult) : 'No analysis results yet. Run gap analysis from the popup.'}
            readOnly
          />
        </div>
      </div>

      <footer>
        <button onClick={handleClear} className="clear-btn">
          Clear All Data
        </button>
      </footer>
    </div>
  );
};

function formatAnalysisResult(result: AnalysisResult): string {
  return `
SUMMARY:
${result.summary}

MISSING TOPICS:
${result.missingTopics.map(topic => `• ${topic}`).join('\n')}

MISSING ENTITIES:
${result.missingEntities.map(entity => `• ${entity}`).join('\n')}

RECOMMENDED SECTIONS:
${result.recommendedSections.map(section =>
  `• ${section.title}: ${section.whatToInclude} (Place: ${section.whereToPlace})`
).join('\n')}

SUGGESTED SNIPPETS:
${result.suggestedSnippets.map(snippet => `• ${snippet}`).join('\n')}

PRIORITY ACTIONS:
${result.priorityActions.map(action =>
  `• ${action.action} - ${action.rationale}`
).join('\n')}

RISKS AND CAVEATS:
${result.risksAndCaveats.map(risk => `• ${risk}`).join('\n')}
  `.trim();
}

export default SidePanel;
