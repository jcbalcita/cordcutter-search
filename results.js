document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["search", "type"], data => {
    data.type === "movie" ? searchForMovie(data.search) : searchForShow(data.search)
  });
});

// Processes response to initial API call for matching TV show titles.
function processShowResults(results) {
  if (results.length > 0) {
    results.forEach(show => appendShowItem(show));
  } else {
    document.getElementById("results").textContent = "No results found."
  }
}

// Processes response to initial API call for matching movie titles.
function processMovieResults(results) {
  if (results.length > 0) {
    results.forEach(movie => appendMovieItem(movie));
  } else {
    document.getElementById("results").textContent = "No results found."
  }
}

function appendShowItem(show) {
  const resultEl = document.getElementById("initial-results");
  let image = document.createElement("img");
    image.src = show.artwork_208x117;
  let listItem = newListItem("initial");
    listItem.dataset.id = show.id;
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

// Renders `show` page for an individual TV show.
function displayShowDetail(show) {
  addPoster(show.artwork_304x171);
  addTitle(show.title, show.first_aired.slice(0, 4));
  getGeneralShowContent(show.id);
  getNumberOfSeasons(show.id);
}

// Renders `show` page for an individual movie.
function displayMovieDetail(movie) {
  addPoster(movie.poster_240x342);
  addTitle(movie.title, movie.release_year);

  if (noSources(movie)) {
    const sources = document.getElementById("sources");
    sources.textContent = "We were unable to find any non-purchase streams for this movie."
  }

  addFreeSources(movie.free_web_sources);
  addSubSources(movie.subscription_web_sources);
  addTVESources(movie.tv_everywhere_web_sources);
}


// Displays sources on which at least one episode of the TV show is available for streaming.
function receiveGeneralContent(generalContent) {
  const generalSources = document.getElementById("general-sources");

  if (generalContent.length === 0) {
    generalSources.textContent = "We were uanble to find any non-purchase streams for this show."
  } else {
    const linebreak = document.createElement("br");
    generalSources.textContent = `This show is available for streaming on the below platforms. For specific information and links, select a season.`
    generalSources.appendChild(linebreak);
    generalContent.forEach(source => appendGeneralSource(source));
  }
}

function appendGeneralSource(source) {
    const p = document.createElement("p");
    const type = source.type === "tv_everywhere" ? "Cable/Dish Login Required" : source.type
    p.innerHTML = `${source.display_name.bold()}  (${type})`;

    if (type !== "purchase") {
      const generalSources = document.getElementById("general-sources");
      generalSources.appendChild(p);
    }
}

// Displays links to specific episodes after a season button is clicked.
function createEpisodeList(results) {
  const episodeList = document.getElementById("episode-list");
  if (results.length === 0) {
    episodeList.textContent = "No episode information for this season. Sorry about that."
  } else {
    results.forEach(episode => newEpisodeItem(episode, episodeList));
  }
}

function newEpisodeItem(episode, episodeList) {
  const episodeLi = document.createElement("li");
    episodeLi.className = "episode-item";

  const episodeTitle = newSpan(`Episode ${episode.episode_number}:  ${episode.original_title}`)
  const linebreak = document.createElement("br");
  episodeLi.appendChild(episodeTitle);

  iterEpisodeSources(episode.free_web_sources, "free", episodeLi)
  iterEpisodeSources(episode.subscription_web_sources, "subscription", episodeLi)
  iterEpisodeSources(episode.tv_everywhere_web_sources, "tv_everywhere", episodeLi)
  iterEpisodeSources(episode.purchase_web_sources, "purchase", episodeLi)

  episodeList.insertBefore(episodeLi, episodeList.firstChild);
}

function iterEpisodeSources(sources, type, episodeLi) {
  const texts = {
    "free": "(free)",
    "subscription": "(sub)",
    "tv_everywhere": "(login required)",
  }

  if (sources.length === 0) {
    return;
  } else {
    sources.forEach(source => {
      let titleType = type === "purchase" ? `$${source.formats[0].price}` : texts[type]
      let link = document.createElement("a");
      link.href = source.link;
      link.textContent = `${source.display_name} ${titleType}`;
      episodeLi.appendChild(link);
    });
  }
}

function createSeasonList(showId, seasonNumbers) {
  if (seasonNumbers.length === 0) {
    return null;
  }
  seasonNumbers.forEach(seasonNum => newSeasonListItem(showId, seasonNum))
}

function newSeasonListItem(showId, seasonNum) {
  const seasonList = document.getElementById("season-list")
  const div = document.createElement("div");
    div.className = "chip";
    div.onclick = function() {
      const episodes = document.getElementById("episode-list");
        episodes.textContent = "";
      getSeasonInfo(showId, seasonNum);
    }
    div.textContent = `Season ${seasonNum}`

  seasonList.appendChild(div);
}

// Displays links to streams of an individual movie.
function noSources(movie) {
  if (movie.free_web_sources.length === 0 &&
      movie.subscription_web_sources.length === 0 &&
      movie.tv_everywhere_web_sources.length === 0) {
    return true;
  }
}

function addFreeSources(freeSources) {
  if (freeSources.length === 0) {
    return null;
  } else {
    const ul = newSourceList("Free:");

    freeSources.forEach(source => {
      addSource(source, ul);
    });
  }
}

// Adds "sub" sources, i.e. sources that require a subscription.
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

// Adds "TV everywhere" sources, i.e. sources that require an account with a cable or satellite TV service.
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
  const ul = document.createElement("ul");
  //  ul.classList.add("col", "s6");
  const h5 = document.createElement("h5");
   h5.textContent = type;

  ul.appendChild(h5);
  sources.appendChild(ul);
  return ul;
}

// TV/Movie shared functions: more code to be DRY'd and added here.
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
function newXHR(url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  return xhr;
}

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

function getShowById(id) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}`;

  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        displayShowDetail(xhr.response);
      }
    }
  };

  xhr.send();
}

function getGeneralShowContent(id) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/available_content`;

  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        receiveGeneralContent(xhr.response.results.web.episodes.all_sources)
      }
    }
  };

  xhr.send();
}

function getMovieById(id) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/movie/${id}`;
  const xhr = newXHR(url);

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        displayMovieDetail(xhr.response)
      }
    }
  };

  xhr.send();
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

function getSeasonInfo(id, season) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/episodes/${season}/1/25/all/web/true`;
  const xhr = newXHR(url);

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        createEpisodeList(xhr.response.results)
      }
    }
  };

  xhr.send();
}
