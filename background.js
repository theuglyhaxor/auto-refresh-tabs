let autoRefreshInterval = null;
let refreshingTabs = new Set();

function getRandomInterval() {
  return (Math.floor(Math.random() * 8) + 3) * 1000; // 3-10 seconds in milliseconds
}

function startAutoRefresh() {
  if (autoRefreshInterval) return;
  
  autoRefreshInterval = setInterval(() => {
    refreshingTabs.forEach(tabId => {
      chrome.tabs.get(tabId, tab => {
        if (chrome.runtime.lastError || !tab) {
          refreshingTabs.delete(tabId);
          return;
        }
        chrome.tabs.reload(tabId);
      });
    });
  }, getRandomInterval());
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleRefresh") {
    if (request.enabled) {
      refreshingTabs.add(request.tabId);
      startAutoRefresh();
    } else {
      refreshingTabs.delete(request.tabId);
      if (refreshingTabs.size === 0) {
        stopAutoRefresh();
      }
    }
    sendResponse({ success: true });
  } else if (request.action === "refreshAll") {
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.reload(tab.id);
      });
    });
    sendResponse({ success: true });
  }
});
