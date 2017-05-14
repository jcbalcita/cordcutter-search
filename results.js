document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["search", "type"], data => {
    data.type === "movie" ? searchForMovie(data.search) : searchForShow(data.search);
  });
});

function processShowResults(results) {
  $("#loading").empty();
  if (results.length > 0) {
    results.forEach(show => appendResultItem(show, "show"));
  } else {
    $("#results").text("No results found.");
  }
}

function processMovieResults(results) {
  $("#loading").empty();
  if (results.length > 0) {
    results.forEach(movie => appendResultItem(movie, "movie"));
  } else {
    $("#results").text("No results found.");
  }
}

function appendResultItem(item, type) {
  const image = $("<img/>", {"class": "square"});
  const title = $("<span/>");
  const listItem = $("<li/>", {
    "class": "collection-item avatar list-item"
  });

  if (type === "movie") {
    image.src(item.poster_120x171);
    title.text(`${item.title} (${item.release_year})`);
    listItem.click(() => {
      resultEl.empty();
      getMovieById(item.id);
    });
  } else if (type === "show") {
    image.src(item.artwork_208x117);
    title.text(item.title);
    listItem.click(() => {
      resultEl.empty();
      getShowById(item.id);
    });
  }

  listItem.append(image, title);
  $("#initial-results").append(listItem);
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
    $("#sources").text("We were unable to find any streams for this movie.");
    return;
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
  const episodeList = $("#episode-list");
  episodeList.addClass("collapsible");
  if (results.length === 0) {
    episodeList.text("No episode information for this season. Sorry about that.");
  } else {
    results.forEach(episode => newEpisodeItem(episode, episodeList));
  }
}

function newEpisodeItem(episode, episodeList) {
  const episodeLi = $("<li/>");
  const episodeHeader = $("<div/>", {
    text: `Episode ${episode.episode_number}:  ${episode.original_title}`,
    "class": "collapsible-header"
  });
  const episodeBody = $("<div/>", {"class": "collapsible-body"});
  episodeLi.append(episodeHeader, episodeBody);

  iterEpisodeSources(episode.free_web_sources, "free", episodeBody);
  iterEpisodeSources(episode.subscription_web_sources, "subscription", episodeBody);
  iterEpisodeSources(episode.tv_everywhere_web_sources, "tv_everywhere", episodeBody);
  iterEpisodeSources(episode.purchase_web_sources, "purchase", episodeBody);

  episodeList.prepend(episodeLi);
}

function iterEpisodeSources(sources, type, episodeBody) {
  const texts = {
    "free": "(free)",
    "subscription": "(subscription)",
    "tv_everywhere": "(login required)",
  }

  if (sources.length === 0) {
    return;
  }

  sources.forEach(source => {
    let titleType = type === "purchase" ? `$${source.formats[0].price}` : texts[type]
    const link = ("<a/>", {
      href: source.link,
      text: `${source.display_name} ${titleType}`,
      "class": "episode-link";
    });
    episodeBody.append(link);
  });
}

function createSeasonList(showId, seasonNumbers) {
  if (seasonNumbers.length === 0) {
    return;
  }
  seasonNumbers.forEach(seasonNum => newSeasonListItem(showId, seasonNum))
}

function newSeasonListItem(showId, seasonNum) {
  const seasonList = $("#season-list");
  const div = $("<div/>", {
    text: `Season ${seasonNum}`,
    "class": "chip blue",
    click: () => {
      $("#episode-list").empty();
      getSeasonInfo(showId, seasonNum)
    }
  });
  seasonList.append(div);
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
  }

  const ul = createSourceList(types[type]);
  sources.forEach(source => addMovieSource(source, ul));
}

function addMovieSource(source, sourceList) {
  const hasLogo = ["Netflix", "Amazon Prime", "Hulu"]
  const listItem = $("<li/>", {"class": "list-item"});
  const a = $("<a/>", {
    href: source.link,
    "class": "source-link"
  });
  listItem.append(a);

  if (hasLogo.includes(source.display_name)) {
    let sourceName = source.display_name.split(" ")[0].toLowerCase();
    const img = $("<img/>", {
      src: `assets/${sourceName}.png`,
      "class": "logo"
    });
    a.append(img);
  } else {
    a.text(source.display_name);
  }

  sourceList.appendChild(li);
}

function createSourceList(type) {
  $("#sources").addClass("collection");
  const ul = $("<ul/>", {"class": "collection-item"});
  const h5 = $("<h5/>", {text: type});
  ul.append(h5);
  $("#sources").append(ul);
  return ul;
}

function addTitle(title, year) {
  const yearString = year.toString();
  const h4 = $("<h4/>", {
    text: `${title}  (${yearString})`,
    "class": "movie-title center"
  });
  $("#detail").append(h4);
}

function addPoster(poster) {
  const img = $("<img/>", {
    src: poster,
    "class": "center"
  });
  $("item-detail").append(img);
}

//*********************************************************************
// API CALL FUNCTIONS
//*********************************************************************
const baseUrl = "http://tbd.com/";

function searchForShow(searchString) {
  $("#loading").text("Loading...");
  $.ajax({
      url: `${baseUrl}show?search_string=${searchString}`,
      type: 'GET',
      success: response => processShowResults(response.results);
  });
}

function searchForMovie(searchString) {
  $("#loading").text("Loading...");
  $.ajax({
      url: `${baseUrl}movie?search_string=${searchString}`,
      type: 'GET',
      success: response => processMovieResults(response.results);
  });
}

function getShowById(id) {
  $.ajax({
      url: `${baseUrl}/show/${id}`;
      type: 'GET',
      success: response => displayShowDetail(response);
  });
}

function getMovieById(id) {
  $.ajax({
      url: `${baseUrl}/movie/${id}`;
      type: 'GET',
      success: response => displayMovieDetail(response)
  });
}

function getSeasonById(showId, seasonId) {
  $.ajax({
      url: `${baseUrl}/show/${showId}/season/${seasonId}`;
      type: 'GET',
      success: response => createEpisodeList(response);
  });
}
