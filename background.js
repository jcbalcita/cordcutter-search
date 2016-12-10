chrome.contextMenus.create({
  title: "Search by SHOW title",
  contexts:["selection"],
  onclick: function(e) {
    chrome.storage.local.set({ search: encodeURIComponent(e.selectionText.slice(0, 75)), type: "show" },
    () => chrome.tabs.create({ url: "results.html" }));
  }
});

chrome.contextMenus.create({
  title: "Search by MOVIE title",
  contexts:["selection"],
  onclick: function(e) {
    chrome.storage.local.set({ search: encodeURIComponent(e.selectionText.slice(0, 75)), type: "movie" },
    () => chrome.tabs.create({ url: "results.html" }));
  }
});
