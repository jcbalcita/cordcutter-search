let searchString;

chrome.contextMenus.create({
  id: "search-show",
  title: "Search by SHOW title",
  contexts:["selection"],
  onclick: function(e) {
    chrome.tabs.create({ url: "results.html" });
    searchString = e.selectionText;
}});

chrome.contextMenus.create({
  id: "search-movie",
  title: "Search by MOVIE title",
  contexts:["selection"],
  onclick: function(e) {
    cchrome.tabs.create({ url: "results.html" });
    searchString = e.selectionText;
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // sent from another content script, intended for saving source
    if(request.action === 'putSource') {
        source = request.source;
        chrome.tabs.create({ url: 'newtab.html' });
    }
    // sent from newtab-contentscript, to get the source
    if(request.action === 'getResults') {

        sendResponse({ source: searchString });
    }
});


//
// function printResults(searchString) {
//   const results = document.getElementById("search-results");
//   results.innerHTML = searchString;
// }
