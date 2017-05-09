document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["search", "type"], data => {
    data.type === "movie" ? searchForMovie(data.search) : searchForShow(data.search);
  });
});

function processShowResults(results) {
  if (results.length > 0) {
    results.forEach(show => appendShowItem(show));
  } else {
    document.getElementById("results").textContent = "No results found.";
  }
}

function processMovieResults(results) {
  if (results.length > 0) {
    results.forEach(movie => appendMovieItem(movie));
  } else {
    document.getElementById("results").textContent = "No results found.";
  }
}

function appendShowItem(show) {
  const resultEl = document.getElementById("initial-results");
  const image = document.createElement("img");
  image.src = show.artwork_208x117;
  const listItem = newListItem("initial");
  listItem.appendChild(image);
  listItem.appendChild(newSpan(show.title));

  listItem.onclick = function() {
    resultEl.textContent = "";
    getShowById(show.id);
  }

  listItem.classList.add("collection-item", "avatar");
  resultEl.appendChild(listItem);
}

function appendMovieItem(movie) {
  const resultEl = document.getElementById("initial-results");

  const img = document.createElement("img");
  img.src = movie.poster_120x171;
  img.classList.add("square");
  const listItem = newListItem("initial");
  listItem.classList.add("collection-item", "avatar");

  listItem.onclick = function() {
    resultEl.textContent = "";
    getMovieById(movie.id);
  }

  listItem.appendChild(img);
  listItem.appendChild(newSpan(`${movie.title} (${movie.release_year})`));
  resultEl.appendChild(listItem);
}

function newListItem(type) {
  const a = document.createElement("a");
  a.className = type === "initial" ? "list-item" : "source-item";
  return a;
}

function newSpan(content) {
  const span = document.createElement("span");
  span.textContent = content;
  span.classList.add("title", "right");
  return span;
}

function displayShowDetail(show) {
  addPoster(show.artwork_304x171);
  addTitle(show.title, show.first_aired.slice(0, 4));
  getNumberOfSeasons(show.id);
}

function displayMovieDetail(movie) {
  addPoster(movie.poster_240x342);
  addTitle(movie.title, movie.release_year);

  if (noSources(movie)) {
    const sources = document.getElementById("sources");
    sources.textContent = "We were unable to find any non-purchase streams for this movie."
  }

  addMovieSources(movie.free_web_sources, "free");
  addMovieSources(movie.subscription_web_sources, "sub");
  addMovieSources(movie.tv_everywhere_web_sources, "tve");
  addMovieSources(movie.purchase_web_sources, "purchase");
}

function noSources(movie) {
  if (movie.free_web_sources.length === 0 &&
      movie.subscription_web_sources.length === 0 &&
      movie.tv_everywhere_web_sources.length === 0 &&
      movie.purchase_web_sources.length === 0) {
    return true;
  }
}

function createEpisodeList(results) {
  const episodeList = document.getElementById("episode-list");
   episodeList.classList.add("collapsible");
  if (results.length === 0) {
    episodeList.textContent = "No episode information for this season. Sorry about that."
  } else {
    results.forEach(episode => newEpisodeItem(episode, episodeList));
  }
}

function newEpisodeItem(episode, episodeList) {
  const episodeLi = document.createElement("li");
  const episodeHeader = document.createElement("div");
   episodeHeader.className = "collapsible-header";
   episodeHeader.textContent = `Episode ${episode.episode_number}:  ${episode.original_title}`
  const episodeBody = document.createElement("div");
   episodeBody.className = "collapsible-body";

  episodeLi.appendChild(episodeHeader);
  episodeLi.appendChild(episodeBody);

  iterEpisodeSources(episode.free_web_sources, "free", episodeBody)
  iterEpisodeSources(episode.subscription_web_sources, "subscription", episodeBody)
  iterEpisodeSources(episode.tv_everywhere_web_sources, "tv_everywhere", episodeBody)
  iterEpisodeSources(episode.purchase_web_sources, "purchase", episodeBody)

  episodeList.insertBefore(episodeLi, episodeList.firstChild);
}

function iterEpisodeSources(sources, type, episodeBody) {
  const texts = {
    "free": "(free)",
    "subscription": "(subscription)",
    "tv_everywhere": "(login required)",
  }

  if (sources.length === 0) {
    return;
  } else {
    sources.forEach(source => {
      let titleType = type === "purchase" ? `$${source.formats[0].price}` : texts[type]
      let link = document.createElement("a");
       link.className = "episode-link";
       link.href = source.link;
       link.textContent = `${source.display_name} ${titleType}`;
      episodeBody.appendChild(link);
    });
  }
}

function createSeasonList(showId, seasonNumbers) {
  if (seasonNumbers.length === 0) {
    return;
  }
  seasonNumbers.forEach(seasonNum => newSeasonListItem(showId, seasonNum))
}

function newSeasonListItem(showId, seasonNum) {
  const seasonList = document.getElementById("season-list")
  const div = document.createElement("div");
    div.classList.add("chip", "blue");
    div.onclick = function() {
      const episodes = document.getElementById("episode-list");
        episodes.textContent = "";
      getSeasonInfo(showId, seasonNum);
    }
    div.textContent = `Season ${seasonNum}`

  seasonList.appendChild(div);
}

function addMovieSources(sources, type) {
  const types = {
    "free": "Free:",
    "sub": "Subscription:",
    "tve": "Cable/Dish Login Required:",
    "purchase": "Purchase:"
  }

  if (sources.length === 0) {
    return;
  } else {
    const ul = newSourceList(types[type]);
    ul.classList.add("collection-item");
    sources.forEach(source => {
      addMovieSource(source, ul)
    });
  }
}

function addMovieSource(source, sourceList) {
  const hasLogo = ["Netflix", "Amazon Prime", "Hulu"]
  const li = newListItem("source");
  const a = document.createElement("a");
  a.href = source.link;
  a.className = "source-link";
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

function newSourceList(type) {
  const sources = document.getElementById("sources")
  sources.classList.add("collection");
  const ul = document.createElement("ul");
  const h5 = document.createElement("h5");
  h5.textContent = type;
  ul.appendChild(h5);
  sources.appendChild(ul);
  return ul;
}

function addTitle(title, year) {
  const detail = document.getElementById("item-detail");
  const yearString = year.toString();
  const h4 = document.createElement("h4");
    h4.textContent = `${title}  (${yearString})`
    h4.classList.add("movie-title", "center");
  detail.appendChild(h4);
}

function addPoster(poster) {
  const detail = document.getElementById("item-detail");
  const img = document.createElement("img");
    img.src = poster;
    img.classList.add("center");
  detail.appendChild(img);
}

//*********************************************************************
// API CALL FUNCTIONS
//*********************************************************************

const baseUrl = "https://api-public.guidebox.com/v2";
const apiKey = "api_key=rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL";
const movieQuery = "/search?type=movie&field=title&query=";
const showQuery = "/search?type=show&field=title&query=";

function newXHR(url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  return xhr;
}

function searchForShow(searchString) {
  document.getElementById("loading").textContent = "Loading..."
  const url = `${baseUrl}${showQuery}${searchString}&${apiKey}`;
  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE && xhr.status === 200) {
      document.getElementById("loading").textContent = ""
      processShowResults(xhr.response.results);
    }
  };
  xhr.send();
}

function searchForMovie(searchString) {
  document.getElementById("loading").textContent = "Loading..."
  const url = `${baseUrl}${movieQuery}${searchString}&${apiKey}`;
  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE && xhr.status === 200) {
      document.getElementById("loading").textContent = ""
      processMovieResults(xhr.response.results);
    }
  };
  xhr.send();
}

function getShowById(id) {
  const url = `${baseUrl}/shows/${id}?${apiKey}`;
  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE && xhr.status === 200) {
      displayShowDetail(xhr.response);
    }
  };
  xhr.send();
}

function getMovieById(id) {
  const url = `${baseUrl}/movies/${id}?${apiKey}`;
  console.log(url);
  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE && xhr.status === 200) {
      displayMovieDetail(xhr.response)
    }
  };
  xhr.send();
}

function getNumberOfSeasons(id) {
  const url = `${baseUrl}/shows/${id}/seasons?${apiKey}`;
  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE && xhr.status === 200) {
      const seasonNumbers = xhr.response.results.map(season => season.season_number);
      createSeasonList(id, seasonNumbers)
    }
  };
  xhr.send();
}

function getSeasonInfo(id, season) {
  const url = `${baseUrl}/shows/${id}/episodes?season=${season}&${apiKey}&include_links=true`;
  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE && xhr.status === 200) {
      createEpisodeList(xhr.response.results);
    }
  };
  xhr.send();
}
