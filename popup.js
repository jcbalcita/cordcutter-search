chrome.runtime.sendMessage({ action: 'getResults' }, function(response) {
  if (response.type === "show") {
    searchForShow(response.source);
  } else if (response.type === "movie") {
    searchForMovie(response.source);
  }
});

function processShowResults(results) {
  if (results.length > 0) {
    results.forEach(show => appendShowItem(show));
    console.log(results);
  } else {
    document.getElementById("results").innerHTML = "No results found."
  }
}

function processMovieResults(results) {
  if (results.length > 0) {
    results.forEach(movie => appendMovieItem(movie));
    console.log(results);
  } else {
    document.getElementById("results").innerHTML = "No results found."
  }
}

function appendShowItem(show) {
  const resultEl = document.getElementById("initial-results-ul");
  let listItem = document.createElement("li");
  let image = document.createElement("img");
  image.src = show.artwork_208x117;

  listItem.className = "list-item";
  listItem.dataset.id = show.id;
  listItem.onclick = getShowById.bind(this, show.id);

  listItem.appendChild(image);
  listItem.appendChild(newSpan(show.title));

  resultEl.appendChild(listItem);
}

function appendMovieItem(movie) {
  const resultEl = document.getElementById("initial-results-ul");
  let listItem = document.createElement("li");
  let image = document.createElement("img");
  image.src = movie.poster_120x171;

  listItem.className = "list-item";
  listItem.dataset.id = movie.id;
  listItem.onclick = getMovieById.bind(this, movie.id);

  listItem.appendChild(image);
  listItem.appendChild(newSpan(`${movie.title} (${movie.release_year})`));

  resultEl.appendChild(listItem);
}

function newSpan(item) {
  const span = document.createElement("span");
  span.innerHTML = item;
  return span;
}

// Search by show title
// ********************
// {Base API URL} /search/title/ {TRIPLE url encoded show name} / {"exact" or "fuzzy"}

function searchForShow(searchString) {
  let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/search/title/${searchString}`;
  let xhr = new XMLHttpRequest();

  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  document.getElementById("loading").innerHTML = "Loading..."


  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        document.getElementById("loading").innerHTML = ""
        processShowResults(xhr.response.results);
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
        processMovieResults(xhr.response.results);
      } else {
        document.getElementById("initial-results").innerHTML = "Loading..."
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
        // 
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
