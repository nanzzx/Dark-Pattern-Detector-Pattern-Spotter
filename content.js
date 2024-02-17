// Get the current website's hostname
// const site = window.location.hostname;
// alert("Hello, The dark patterns in "+site+" is being detected and highlighted."
// )
// Inject CSS
const style = document.createElement('style');
style.textContent = `
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255,0,0, 1);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(204,169,44, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(204,169,44, 0);
  }
}

.highlighter {
  animation: pulse 2s infinite;
  border: 2px solid red;
  background-color:red;
}`;
document.head.appendChild(style);

let highlightingEnabled = false;
let highlightInterval;

//--------------------------------------------------------------UI------------------------------------------------------------------------

let checkboxAlertShown = false;
function highlightcomponents() {
  const divsWithCheckbox = document.querySelectorAll('div > input[type="checkbox"]');
  divsWithCheckbox.forEach(checkbox => {
    const parentDiv = checkbox.parentElement;
    if (!parentDiv.classList.contains('highlighter')) {
      parentDiv.classList.add('highlighter');
    }  
  });

  const labels = document.querySelectorAll('label');
  labels.forEach(label => {
    const checkbox = label.querySelector("input[type='checkbox']");
    if (checkbox) {
      const parentDiv = label.parentElement;
      const containingTags = ['li', 'ul', 'section'];
      let shouldHighlight = true;
      containingTags.forEach(tag => {
        if (parentDiv.closest(tag)) {
          shouldHighlight = false;
        }
      });
      if (shouldHighlight) {
        if (!checkboxAlertShown) {
          alert("There are DARK PATTERNS on this page, and those are highlighted. HAVE A SAFE SHOPPING!");
          checkboxAlertShown = true;
        }
        if (highlightingEnabled && !parentDiv.classList.contains('highlighter')) {
          parentDiv.classList.add("highlighter");
        }
      }
    }
  });

  highlightButtons(); // Call the new function to highlight buttons
}

function stopHighlighting() {
  highlightingEnabled = false;
  clearInterval(highlightInterval);
  highlightcomponents();
}

function startHighlighting() {
  highlightingEnabled = true;
  highlightcomponents();
  highlightInterval = setInterval(highlightcomponents, 1000);
}

// Retrieve highlighting state from local storage
chrome.storage.local.get('highlightingEnabled', (data) => {
  highlightingEnabled = data.highlightingEnabled || false;
  if (highlightingEnabled) {
    startHighlighting();
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleHighlighting') {
    if (highlightingEnabled) {
      stopHighlighting();
      sendResponse({ message: 'Highlighting disabled.' });
    } else {
      startHighlighting();
      sendResponse({ message: 'Highlighting enabled.' });
    }
    // Save highlighting state to local storage
    chrome.storage.local.set({ highlightingEnabled });
    sendResponse({}); // close the sendResponse function
  }
});

//--------------------------------------------------------------BUTTONS------------------------------------------------------------------------

// Add new listener for message
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.highlight) {
    highlightButtons();
  }
});

function highlightButtons() {
  var buttons = document.querySelectorAll('button');
  buttons.forEach(function(button) {
    var buttonText = button.textContent.toLowerCase();
    if (buttonText.includes('agree') || buttonText.includes('allow') || buttonText.includes('accept') || buttonText.includes('subscribe')) {
      button.classList.add('highlighter');
    }
  });
}

//--------------------------------------------------------------WORDS------------------------------------------------------------------------

// This script will run on all webpages to highlight occurrences of specific terms.
const searchTerms = ["frequently bought together","Convenience Fee","agree","Only few left","Hurry","disclaimer","fee","view all products"];
const highlightColor = "yellow";

// Constructing the regular expression to match all the search terms
const regex = new RegExp(`\\b(${searchTerms.join("|")})\\b`, "gi");

// Function to recursively traverse and highlight text nodes
function highlightTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const replacedText = text.replace(regex, '<span class="highlighter">$&</span>');
        if (replacedText !== text) {
            const span = document.createElement('span');
            span.innerHTML = replacedText;
            node.parentNode.replaceChild(span, node);
        }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
        // Recursively process child nodes of element nodes
        node.childNodes.forEach(childNode => highlightTextNodes(childNode));
    }
}

// Highlight terms within anchor tags
function highlightAnchorTags() {
    document.querySelectorAll('a').forEach(anchor => {
        anchor.innerHTML = anchor.innerHTML.replace(regex, '<span class="highlighter">$&</span>');
    });
}

// Check if the current URL matches any of the patterns for search pages
function isSearchPage(url) {
    // Define an array of search page patterns
    const searchPagePatterns = [
        /google\.com\/search/,
        /bing\.com\/search/,
        // Add more patterns as needed for other search engines
    ];

    // Check if the current URL matches any of the search page patterns
    return searchPagePatterns.some(pattern => pattern.test(url));
}

// Execute the highlighting logic only if it's not a search page
if (!isSearchPage(window.location.href)) {
    // Start highlighting from the body element
    highlightTextNodes(document.body);
    // Highlight terms within anchor tags
    highlightAnchorTags();

    // Create a style element to add the CSS rules for highlighting
    const highlightColor = "red";
    const style = document.createElement('style');
    style.textContent = `.highlighter { background-color: ${highlightColor}; }`;
    document.head.appendChild(style);
    
    const highlightWords = document.querySelectorAll('.highlighter-word');
    highlightWords.forEach(word => {
      word.style.backgroundColor = highlightColor;
    });
}
