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

function noSources(movie) {
  if (movie.free_web_sources.length === 0 &&
      movie.subscription_web_sources.length === 0 &&
      movie.tv_everywhere_web_sources.length === 0) {
    return true;
  }
}

function displayShowDetail(show) {
  addPoster(show.artwork_304x171);
  addTitle(show.title, show.first_aired.slice(0, 4));
  getGeneralShowContent(show.id);
  getNumberOfSeasons(show.id);
}

function receiveGeneralContent(generalContent) {
  const generalSources = document.getElementById("general-sources");
  console.log(generalContent)
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
    episodeLi.appendChild(linebreak);


  if (episode.free_web_sources.length > 0) {
    let link = document.createElement("a");
      link.href = episode.free_web_sources[0].link
      link.textContent = `${episode.free_web_sources[0].display_name} (free)`;
    episodeLi.appendChild(link);
  }

  if (episode.subscription_web_sources.length > 0) {
    episode.subscription_web_sources.forEach(source =>{
      let link = document.createElement("a");
        link.href = source.link;
        link.target = "_blank";
        link.textContent = `${source.display_name} (sub)`
      episodeLi.appendChild(link);
    })
    episodeLi.appendChild(linebreak);
  }

  if (episode.tv_everywhere_web_sources.length > 0) {
    episode.tv_everywhere_web_sources.forEach(source =>{
      let link = document.createElement("a");
        link.href = source.link
        link.target = "_blank";
        link.textContent = `${source.display_name} (login required)`
      episodeLi.appendChild(link);
    })
    episodeLi.appendChild(linebreak);
  }

  if (episode.purchase_web_sources.length > 0) {
    episode.purchase_web_sources.forEach(source =>{
      let link = document.createElement("a");
        link.href = source.link
        link.target = "_blank";
        link.textContent = `${source.display_name} $${source.formats[0].price}`
      episodeLi.appendChild(link);
    })
  }

  episodes.appendChild(episodeLi);
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
  // addPurchaseSources(movie.purchase_web_sources);
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
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}`;

  const xhr = newXHR(url);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.response);
        displayShowDetail(xhr.response);
      }
    }
  };

  xhr.send();
}
// Request available content generally -- no links, no specifics
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
        const seasonNumbers = xhr.response.results.map(season => season.season_number);
        console.log(seasonNumbers);
        createSeasonList(id, seasonNumbers)
      }
    }
  };

  xhr.send();
}

// Request information on a specific season of a show
//{Base API URL} /show/ {id} /episodes/ {season} / {limit 1} / {limit 2} / {sources} / {platform} / {include links}
function getSeasonInfo(id, season) {
  const url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${id}/episodes/${season}/1/25/all/web/true`;
  const xhr = newXHR(url);

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.response);
        createEpisodeList(xhr.response.results)
      }
    }
  };

  xhr.send();
}
