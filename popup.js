document.addEventListener('DOMContentLoaded', () => {
  const refreshTabsBtn = document.getElementById('refreshTabs');
  const toggleRefreshBtn = document.getElementById('toggleRefresh');
  const tabList = document.getElementById('tabList');
  let refreshingTabs = new Set();

  function updateTabList() {
    chrome.tabs.query({}, tabs => {
      tabList.innerHTML = '';
      tabs.forEach(tab => {
        const tabItem = document.createElement('div');
        tabItem.className = 'tab-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = refreshingTabs.has(tab.id);
        checkbox.addEventListener('change', () => {
          chrome.runtime.sendMessage({
            action: 'toggleRefresh',
            tabId: tab.id,
            enabled: checkbox.checked
          }, response => {
            if (response.success) {
              if (checkbox.checked) {
                refreshingTabs.add(tab.id);
              } else {
                refreshingTabs.delete(tab.id);
              }
              updateToggleButton();
            }
          });
        });
        const label = document.createElement('span');
        label.textContent = tab.title || tab.url;
        tabItem.appendChild(checkbox);
        tabItem.appendChild(label);
        tabList.appendChild(tabItem);
      });
    });
  }

  function updateToggleButton() {
    toggleRefreshBtn.textContent = refreshingTabs.size > 0 ? 'Stop Auto-Refresh' : 'Start Auto-Refresh';
  }

  refreshTabsBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'refreshAll' });
  });

  toggleRefreshBtn.addEventListener('click', () => {
    const tabsToToggle = Array.from(document.querySelectorAll('#tabList input[type="checkbox"]:checked'));
    tabsToToggle.forEach(checkbox => {
      const tabId = parseInt(checkbox.parentElement.dataset.tabId);
      chrome.runtime.sendMessage({
        action: 'toggleRefresh',
        tabId: tabId,
        enabled: !refreshingTabs.has(tabId)
      }, response => {
        if (response.success) {
          if (refreshingTabs.has(tabId)) {
            refreshingTabs.delete(tabId);
          } else {
            refreshingTabs.add(tabId);
          }
          updateToggleButton();
          updateTabList();
        }
      });
    });
  });

  updateTabList();
});
