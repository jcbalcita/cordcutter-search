//*********************************************************************
// READY SIGNAL
//*********************************************************************

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["search", "type"], data => {
    data.type === "movie" ? searchForMovie(data.search) : searchForShow(data.search)
  });
});

//*********************************************************************
// INITIAL SEARCH
//*********************************************************************
function processShowResults(results) {
  if (results.length > 0) {
    results.forEach(show => appendShowItem(show));
  } else {
    document.getElementById("results").textContent = "No results found."
  }
}

function processMovieResults(results) {
  if (results.length > 0) {
    results.forEach(movie => appendMovieItem(movie));
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
    listItem.appendChild(image);
    listItem.appendChild(newSpan(show.title));

    listItem.onclick = function() {
      resultEl.textContent = "";
      getShowById(show.id);
    }

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

//*********************************************************************
// SHOW/MOVIE DETAIL
//*********************************************************************
function displayShowDetail(show) {
  addPoster(show.artwork_304x171);
  addTitle(show.title, show.first_aired.slice(0, 4));
  getGeneralShowContent(show.id);
  getNumberOfSeasons(show.id);
}

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


//************************
// TV SHOW GENERAL CONTENT
//************************
function receiveGeneralContent(generalContent) {
  const generalSources = document.getElementById("general-sources");

  if (generalContent.length === 0) {
    generalSources.textContent = "We were uanble to find any non-purchase streams for this show."
  } else {
    let linebreak = document.createElement("br");
    generalSources.textContent = `This show is available for streaming on the below platforms. For specific information and links, select a season.`
    generalSources.appendChild(linebreak);
    generalContent.forEach(source => appendGeneralSource(source));
  }
}

function appendGeneralSource(source) {
    p = document.createElement("p");
    let type = source.type === "tv_everywhere" ? "Cable/Dish Login Required" : source.type
    p.innerHTML = `${source.display_name.bold()}  (${type})`;

    if (type !== "purchase") {
      const generalSources = document.getElementById("general-sources");
      generalSources.appendChild(p);
    }
}

//*********************
// TV SHOW EPISODES
//*********************
function createEpisodeList(results) {
  const episodes = document.getElementById("episode-list");
  if (results.length === 0) {
    episodes.textContent = "No episode information for this season. Sorry about that."
  } else {
    results.forEach(episode => newEpisodeItem(episode, episodes));
  }
}

function newEpisodeItem(episode, episodes) {
  const episodeLi = document.createElement("li");
    episodeLi.className = "episode-item";

  const episodeTitle = newSpan(`Episode ${episode.episode_number}:  ${episode.original_title}`)
  const linebreak = document.createElement("br");
    episodeLi.appendChild(episodeTitle);

  iterEpisodeSources(episode.free_web_sources, "free", episodeLi)
  iterEpisodeSources(episode.subscription_web_sources, "subscription", episodeLi)
  iterEpisodeSources(episode.tv_everywhere_web_sources, "tv_everywhere", episodeLi)
  iterEpisodeSources(episode.purchase_web_sources, "purchase", episodeLi)

  episodes.insertBefore(episodeLi, episodes.firstChild);
}

function iterEpisodeSources(sources, type, episodeLi) {
  const texts = {
    "free": "(free)",
    "subscription": "(sub)",
    "tv_everywhere": "(login required)",
  }

  if (sources.length === 0) {
    return
  } else {

    sources.forEach(source => {
      let titleType = type === "purchase" ? `$${source.formats[0].price}` : texts[type]
      let link = document.createElement("a");
        link.href = source.link;
        link.target = "_blank";
        link.textContent = `${source.display_name} ${titleType}`;
      episodeLi.appendChild(link);
    });
  }
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

//*********************
// MOVIE SOURCES
//*********************
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
  const hasLogo = ["Netflix", "Amazon Prime", "Hulu"]
  const li = newListItem("source");
  const a = document.createElement("a");
    a.href = source.link;
    a.className = "source-link";
    a.target = "_blank";
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
    ul.className = "source-list";
  const h4 = document.createElement("h4");
    h4.textContent = type;

  ul.appendChild(h4);
  sources.appendChild(ul);
  return ul;
}

//****************************
// SHOW/MOVIE SHARED FUNCTIONS
//****************************
function addTitle(title, year) {
  const detail = document.getElementById("item-detail");
  const yearString = year.toString();
  const h3 = document.createElement("h3");
    h3.textContent = `${title}  (${yearString})`
    h3.className = "movie-title"

  detail.appendChild(h3);
}

function addPoster(poster) {
  const detail = document.getElementById("item-detail");
  let img = document.createElement("img");
    img.src = poster;
    img.className = "poster"

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
