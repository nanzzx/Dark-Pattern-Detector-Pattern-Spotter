// background.js

function onInstalled() {
  chrome.contextMenus.create({
    id: "findComponent",
    title: "Find this web component",
    contexts: ["all"]
  });
}

// Add listener for onInstalled event
chrome.runtime.onInstalled.addListener(onInstalled);

// Add listener for contextMenus.onClicked event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "findComponent") {
    chrome.tabs.sendMessage(tab.id, { action: "findLibrary" });
  }
});

// Add listener for runtime.onMessage event
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "openTab") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("popup.html"),
      active: true,
      openerTabId: sender.tab.id
    }, (newTab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(tabId, { action: "displayData", data: request.data });
        }
      });
    });
  }
});
