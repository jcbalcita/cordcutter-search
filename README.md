# Cordcutter Search

A Chrome extension that allows users, via the [GuideBox API](http://www.guidebox.com), to find out if a show or movie is available for licensed streaming on the web.

## Features Checklist

- [x] Has clickable icon that opens `popup.html`, which in turn renders a functional "search by title" form.
- [x] Grabs selected text from the page and fires off API requests to GuideBox via context menus.
- [x] Allows users to search by show or movie title and find out on which websites the show is available for streaming.
- [x] Allows user to check if a specific season of a show is available for streaming.
- [x] Provides links to watch specific episodes.

## Functionality

Cordcutter Search provides its users with an easy, convenient way to find out if a show is available for streaming.

There are two ways a user can get stream info on a movie or TV show:
- Selecting the text title on the webpage, right-clicking, and clicking on the appropriate option, which fires off the search.
- Clicking on the extension's icon, which opens up a tab containing an HTML form in which the user can manually type in the title by which to search.

### Search Feature

Both the search form and context menus work by setting the search type (either "movie" or "show") and the search string into Chrome's local storage, then opening up the `results.html` page.

Once the DOM elements in `results.html` are loaded, `results.js` fires off a `chrome.storage.local.get` request with a callback function that fires off the appropriate API XMLHttpRequest.

```javascript
// background.js
chrome.contextMenus.create({
  title: "Search by SHOW title",
  contexts:["selection"],
  onclick: function(e) {
    chrome.storage.local.set({ search: encodeURIComponent(e.selectionText), type: "show" },
    () => chrome.tabs.create({ url: "results.html" }));
  }
});

chrome.contextMenus.create({
  title: "Search by MOVIE title",
  contexts:["selection"],
  onclick: function(e) {
    chrome.storage.local.set({ search: encodeURIComponent(e.selectionText), type: "movie" },
    () => chrome.tabs.create({ url: "results.html" }));
  }
});

// popup.js
movieButton.onclick = function() {
  chrome.storage.local.set({ type: "movie" });
  this.className = "set-button-selected";
  showButton.className = "set-button";
}

showButton.onclick = function() {
  chrome.storage.local.set({ type: "show" });
  this.className = "set-button-selected";
  movieButton.className = "set-button";
}

form.addEventListener("submit", e => {
  e.preventDefault();
  chrome.storage.local.set({ search: input.value },
  () => chrome.tabs.create({ url: "results.html" }));
});
```

#### Search Form

`popup.html` contains an input element in which users can type in search terms.  There are two buttons above that changes the search type between "movie" and "show."

![alt text](http://res.cloudinary.com/jcbalcita/image/upload/v1480795373/Screen_Shot_2016-12-03_at_10.36.40_jahoex.png)

#### Context Menu Search

Users can also search by highlighting text on the page, then right-clicking to access the extension's context menu options.

![alt text](http://res.cloudinary.com/jcbalcita/image/upload/v1480640192/Screen_Shot_2016-12-01_at_16.55.59_pzpqtk.png)

### Search results

Results of the search are displayed in a new tab.  Each item in the list is an `<li>` element with an `onclick` function that fires off an API call to retreive information on that particular show.

![alt text](http://res.cloudinary.com/jcbalcita/image/upload/v1480654395/Screen_Shot_2016-12-01_at_20.52.26_hgjapp.png)

### Detail page

The detail page displays a list of where the show is available for streaming generally, and also provides buttons for each season.  When a specific season is clicked, the user is given direct links to specific episodes.

![alt text](http://res.cloudinary.com/jcbalcita/image/upload/v1480640501/Screen_Shot_2016-12-01_at_17.01.19_gp1smg.png)

The detail page is the most complex portion of the extension and contains multiple API calls due to the way show information is stored by the GuideBox API.
1. Get show by ID
  - Retrieves movie poster, title, and other gneral information
2. Available streaming sources for the show generally
  - Retrieves available source names (contains no other information)
3. Number of seasons
  - Retrieves the season numbers for the seasons available for streaming.
  - A button is created for each season with an `onclick` function that fires off an API call using the show's ID and the season number.
4. Once the season button is clicked, it fires off another API call that displays a list of episodes containing links to watch that specific episode.

```javascript
function displayShowDetail(show) {
  addPoster(show.artwork_304x171);
  addTitle(show.title, show.first_aired.slice(0, 4));
  getGeneralShowContent(show.id);
  getNumberOfSeasons(show.id);
}

function getNumberOfSeasons(id) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/seasons`;
  const xhr = newXHR(url);

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        const seasonNumbers = xhr.response.results.map(season => season.season_number);
        createSeasonList(id, seasonNumbers)
      }
    }
  };

  xhr.send();
}

function createSeasonList(showId, seasonNumbers) {
  if (seasonNumbers.length === 0) {
    return null;
  }
  const seasonDetail = document.getElementById("season-detail");
  seasonNumbers.forEach(seasonNum => newSeasonListItem(showId, seasonNum))
}

function newSeasonListItem(showId, seasonNum) {
  const seasonList = document.getElementById("season-list")
  const li = document.createElement("li");
    li.className = "season-list-item";
    li.onclick = function() {
      const episodes = document.getElementById("episode-list");
        episodes.textContent = "";
      getSeasonInfo(showId, seasonNum);
    }
    li.textContent = `Season ${seasonNum}`

  seasonList.appendChild(li);
}
```
