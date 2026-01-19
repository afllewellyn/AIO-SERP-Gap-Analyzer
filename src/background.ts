// Background script for AIO Gap Analyzer
chrome.runtime.onMessage.addListener((message, _, __) => {
  if (message.action === 'storeAIOData') {
    // Store AI Overview data
    chrome.storage.local.set({
      aioData: message.data
    }).then(() => {
      console.log('AI Overview data stored:', message.data);
    }).catch((error) => {
      console.error('Failed to store AI Overview data:', error);
    });
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AIO Gap Analyzer extension installed');
});

// Handle side panel opening
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch((error) => {
  console.error('Failed to set side panel behavior:', error);
});
