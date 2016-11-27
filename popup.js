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
  let listItem = newListItem();
  let image = document.createElement("img");
  image.src = show.artwork_208x117;

  listItem.dataset.id = show.id;
  listItem.onclick = getShowById.bind(this, show.id);

  listItem.appendChild(image);
  listItem.appendChild(newSpan(show.title));

  resultEl.appendChild(listItem);
}

function appendMovieItem(movie) {
  const resultEl = document.getElementById("initial-results-ul");
  let listItem = newListItem();
  let image = document.createElement("img");
  image.src = movie.poster_120x171;

  listItem.dataset.id = movie.id;
  listItem.onclick = function() {
    resultEl.innerHTML = "";
    getMovieById(movie.id);
  }

  listItem.appendChild(image);
  listItem.appendChild(newSpan(`${movie.title} (${movie.release_year})`));

  resultEl.appendChild(listItem);
}

function newListItem() {
  const li = document.createElement("li");
  li.className = "list-item";
  return li;
}

function newSpan(content) {
  const span = document.createElement("span");
  span.innerHTML = content;
  return span;
}

function displayMovieDetail(movie) {
  addMoviePoster(movie.poster_240x342);
  addMovieOverview(movie.overview);
}

function displayShowDetail(show) {

}

function addMoviePoster(poster) {
  const detail = document.getElementById("item-detail");
  let img = document.createElement("img");
  img.src = poster;
  img.className = "movie-poster"

  detail.appendChild(img);
}

function addMovieOverview(overview) {
  const detail = document.getElementById("item-detail");
  let div = document.createElement("div");
  div.className = "movie-overview"
  div.innerHTML = overview;

  detail.appendChild(div)
}
// *******************************
// SEARCHES

function newXHR(url) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  return xhr
}

// Search by show title
// ********************
// {Base API URL} /search/title/ {TRIPLE url encoded show name} / {"exact" or "fuzzy"}

function searchForShow(searchString) {
  let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/search/title/${searchString}`;
  document.getElementById("loading").innerHTML = "Loading..."

  let xhr = newXHR(url);
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
  document.getElementById("loading").innerHTML = "Loading..."

  let xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        document.getElementById("loading").innerHTML = ""
        processMovieResults(xhr.response.results);
      }
    }
  };

  xhr.send();
}


// Request information on show by ID
// **********************************
function getShowById(id) {
  let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/available_content`;

  let xhr = newXHR(url);
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
  let xhr = newXHR(url);

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.response);
        displayMovieDetail(xhr.response)
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
  let xhr = newXHR(url);

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
  let xhr = newXHR(url);

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
