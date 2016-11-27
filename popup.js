chrome.runtime.sendMessage({ action: 'getResults' }, function(response) {
  if (response.type === "show") {
    searchForShow(response.source);
  } else if (response.type === "movie") {
    searchForMovie(response.source);
  }
});

const hasLogo = ["Netflix", "Amazon Prime", "Hulu"]

function processShowResults(results) {
  if (results.length > 0) {
    results.forEach(show => appendShowItem(show));
    console.log(results);
  } else {
    document.getElementById("results").textContent = "No results found."
  }
}

function processMovieResults(results) {
  if (results.length > 0) {
    results.forEach(movie => appendMovieItem(movie));
    console.log(results);
  } else {
    document.getElementById("results").textContent = "No results found."
  }
}

function appendShowItem(show) {
  const resultEl = document.getElementById("initial-results-ul");
  let image = document.createElement("img");
    image.src = show.artwork_208x117;
  let listItem = newListItem("initial");
    listItem.dataset.id = show.id;
    listItem.onclick = getShowById.bind(this, show.id);
    listItem.appendChild(image);
    listItem.appendChild(newSpan(show.title));

  resultEl.appendChild(listItem);
}

function appendMovieItem(movie) {
  const resultEl = document.getElementById("initial-results-ul");
  let img = document.createElement("img");
    img.src = movie.poster_120x171;
  let listItem = newListItem("initial");
    listItem.dataset.id = movie.id;
    listItem.onclick = function() {
      resultEl.textContent = "";
      getMovieById(movie.id);
    }

  listItem.appendChild(img);
  listItem.appendChild(newSpan(`${movie.title} (${movie.release_year})`));

  resultEl.appendChild(listItem);
}

function newListItem(type) {
  const li = document.createElement("li");
  li.className = type === "initial" ? "list-item" : "source-item";
  return li;
}

function newSpan(content) {
  const span = document.createElement("span");
  span.textContent = content;
  return span;
}

function newSourceList(type) {
  const sources = document.getElementById("sources")
  const ul = document.createElement("ul");
    ul.className = "source-list";
  const h4 = document.createElement("h4");
    h4.textContent = type;

  ul.appendChild(h4);
  sources.appendChild(ul);
  return ul;
}

function displayMovieDetail(movie) {
  addMoviePoster(movie.poster_240x342);
  addMovieTitle(movie.title, movie.release_year);
  // addFreeSources(movie.free_web_sources);
  addSubSources(movie.subscription_web_sources);
  addTVESources(movie.tv_everywhere_web_sources);
  // addPurchaseSources(movie.purchase_web_sources);
}

function addFreeSources(freeSources) {

}

function addSubSources(subSources) {
  if (subSources.length === 0) {
    return null;
  } else {
    const ul = newSourceList("Subscription:");

    subSources.forEach(source => {
      addSource(source, ul);
    });
  }
}

function addTVESources(tveSources) {
  if (tveSources.length === 0) {
    return null;
  } else {
    const ul = newSourceList("Cable/Dish Login Required:");

    tveSources.forEach(source => {
      addSource(source, ul);
    });
  }
}

function addSource(source, sourceList) {
  const li = newListItem("source");
  const a = document.createElement("a");
    a.href = source.link;
    a.className = "source-link"
    li.appendChild(a);

    if (hasLogo.includes(source.display_name)) {
      const img = document.createElement("img");
        let sourceName = source.display_name.split(" ")[0].toLowerCase();
        img.src = `assets/${sourceName}.png`;
        img.className = "logo";
        a.appendChild(img);
    } else {
      a.textContent = source.display_name
    }
  sourceList.appendChild(li);
}


// function displayShowDetail(show) {
//
// }

function addMovieTitle(title, year) {
  const detail = document.getElementById("item-detail");
  const yearString = year.toString();
  const h3 = document.createElement("h3");
    h3.textContent = `${title}  (${yearString})`
    h3.className = "movie-title"

  detail.appendChild(h3);
}

function addMoviePoster(poster) {
  const detail = document.getElementById("item-detail");
  let img = document.createElement("img");
    img.src = poster;
    img.className = "movie-poster"

  detail.appendChild(img);
}


//
// API CALLS, i.e. SEARCHES!
//

function newXHR(url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  return xhr;
}

// Search by show title
// {Base API URL} /search/title/ {TRIPLE url encoded show name} / {"exact" or "fuzzy"}
function searchForShow(searchString) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/search/title/${searchString}`;
  document.getElementById("loading").textContent = "Loading..."

  let xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        document.getElementById("loading").textContent = ""
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
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/search/movie/title/${searchString}`;
  document.getElementById("loading").textContent = "Loading..."

  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        document.getElementById("loading").textContent = ""
        processMovieResults(xhr.response.results);
      }
    }
  };

  xhr.send();
}

// Request information on show by ID
function getShowById(id) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/available_content`;

  const xhr = newXHR(url);
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
function getMovieById(id) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/movie/${id}`;
  const xhr = newXHR(url);

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
function getNumberOfSeasons(id) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/seasons`;
  const xhr = newXHR(url);

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
//{Base API URL} /show/ {id} /episodes/ {season} / {limit 1} / {limit 2} / {sources} / {platform} / {include links}
function getSeasonInfo(id, season) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/episodes/${season}/1/25/all/all/true`;
  const xhr = newXHR(url);

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
