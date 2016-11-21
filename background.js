chrome.contextMenus.create({
  id: "search-show",
  title: "Search by SHOW title",
  contexts:["selection"],
  onclick: function(e) {
    console.log(encodeURIComponent(e.selectionText));
  }
});

chrome.contextMenus.create({
  id: "search-movie",
  title: "Search by MOVIE title",
  contexts:["selection"],
  onclick: function(e) {
   console.log(encodeURIComponent(e.selectionText));
  }
});
