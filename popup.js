document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleButton');

  // Send message to toggle highlighting
  toggleButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleHighlighting' }, (response) => {
        console.log(response.message);
      });
    });
  });

  // Retrieve highlighting state from local storage
  chrome.storage.local.get('highlightingEnabled', (data) => {
    const highlightingEnabled = data.highlightingEnabled || false;
    toggleButton.checked = highlightingEnabled;
  });
});
