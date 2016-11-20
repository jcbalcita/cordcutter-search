chrome.contextMenus.create({
 title: "Search by SHOW title",
 contexts:["selection"],
 onclick: searchShow
});

chrome.contextMenus.create({
 title: "Search by MOVIE title",
 contexts:["selection"],
 onclick: searchMovie
});

const searchShow = e => {
  
}

const searchMovie= e => {

}
