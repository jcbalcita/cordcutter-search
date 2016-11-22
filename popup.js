chrome.runtime.sendMessage({ action: 'getResults' }, function(response) {
  if (response.type === "show") {
    searchForShow(response.source);
  }
});

// Search by show title
// ********************
// {Base API URL} /search/title/ {TRIPLE url encoded show name} / {"exact" or "fuzzy"}

function searchForShow(searchString) {
  let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/search/title/${searchString}`;
  let xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        const resultEl = document.getElementById("search-results");
        const titles = xhr.response.results.map(show => show.title);
        console.log(xhr.response.results);
        resultEl.innerHTML = titles;
      }
    }
  };
  xhr.send();
}


// Search by movie title
// *********************
// {Base API URL} /search/movie/title/ {TRIPLE url encoded show name} / {"exact" or "fuzzy"}
function searchForMovie(searchString) {
  let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/search/movie/title/${searchString}`;
  let xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.response);
        // do moar stuff here
      }
    }
  };

  xhr.send();
}


// Request information on show by ID
// **********************************
function getShowById(id) {
  let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/available_content`;
  let xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.response);
        // do moar stuff here
      }
    }
  };

  xhr.send();
}

// Request information on movie by ID
// **********************************
function getMovieById(id) {
  let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/movie/${id}`;
  let xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.response);
        // do moar stuff here
      }
    }
  };

  xhr.send();
}

// Request how many seasons a show has
// *************************************************
// Doesn't give much information -- probably only useful to find out
// number of seasons... then creating a link for fetching each season.
function getNumberOfSeasons(id) {
  let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/seasons`;
  let xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.response);
        // do moar stuff here
      }
    }
  };

  xhr.send();
}

// Request information on a specific season of a show
// **************************************************
//{Base API URL} /show/ {id} /episodes/ {season} / {limit 1} / {limit 2} / {sources} / {platform} / {include links}
function getSeasonInfo(id, season) {
  let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/episodes/${season}/1/25/all/all/true`;
  let xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.response);
        // do moar stuff here
      }
    }
  };

  xhr.send();
}
