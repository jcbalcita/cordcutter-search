let searchString;
let searchType;
let currentSource = false;

chrome.contextMenus.create({
  id: "search-show",
  title: "Search by SHOW title",
  contexts:["selection"],
  onclick: function(e) {
    chrome.tabs.create({ url: "results.html" });
    searchString = encodeURIComponent(e.selectionText);
    searchType = "show"
}});

chrome.contextMenus.create({
  id: "search-movie",
  title: "Search by MOVIE title",
  contexts:["selection"],
  onclick: function(e) {
    chrome.tabs.create({ url: "results.html" });
    searchString = encodeURIComponent(e.selectionText);
    searchType = "movie"
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getResults') {
    sendResponse({ source: searchString, type: searchType });
  }
});
