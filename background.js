let searchString;
let searchType;

chrome.contextMenus.create({
  title: "Search by SHOW title",
  contexts:["selection"],
  onclick: function(e) {
    chrome.storage.local.set({ search: encodeURIComponent(e.selectionText), type: "show" },
    () => {
      chrome.tabs.create({ url: "results.html" })
    });
  }
});

chrome.contextMenus.create({
  title: "Search by MOVIE title",
  contexts:["selection"],
  onclick: function(e) {
    chrome.storage.local.set({ search: encodeURIComponent(e.selectionText), type: "movie" },
    () => {
      chrome.tabs.create({ url: "results.html" })
    });
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getResults') {
    sendResponse({ source: searchString, type: searchType });
  }
});
