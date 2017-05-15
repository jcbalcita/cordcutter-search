document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["search", "type"], data => {
    data.type === "movie" ? searchForMovie(data.search) : searchForShow(data.search);
  });
});

function processSearchResults(results, type) {
  $("#loading").empty();
  if (results.length === 0) {
    $("#results").text("No results found.");
    return;
  }
  results.forEach(item => appendResultItem(item, type));
}

function appendResultItem(item, type) {
  const image = $("<img/>", {"class": "square"});
  const title = $("<span/>", {"class": "title right"});
  const listItem = $("<a/>", {
    "class": "collection-item avatar list-item"
  });

  if (type === "movie") {
    image.attr("src", item.poster_120x171);
    title.text(`${item.title} (${item.release_year})`);
    listItem.click(() => {
      $("#initial-results").text("")
      getMovieById(item.id);
    });
  } else if (type === "show") {
    image.attr("src", item.artwork_208x117);
    title.text(item.title);
    listItem.click(() => {
      $("#initial-results").text("")
      getShowById(item.id);
    });
  }

  listItem.append(image, title);
  $("#initial-results").append(listItem);
}

function displayShowDetail(show) {
  addDisplay(show.display);
  addGeneralContent(show.content);
  createSeasonList(show.id, show.seasons);
}

function addDisplay(display) {
  addPoster(display.artwork);
  addTitle(display.title, display.first_aired.slice(0, 4));
  addOverview(display.overview);
}

function addGeneralContent(content) {
  const generalSources = $("#general-sources");
  if (content.length === 0) {
    generalSources.text("We were uanble to find any streams for this show.");
    return;
  }
  generalSources.append($("<br/>"));
  content.forEach(source => {
    if (source.type !== "purchase") { appendGeneralSource(source); }
  });
}

function appendGeneralSource(source) {
  const type = source.type === "tv_everywhere" ? "Cable/Dish Login Required" : source.type
  const p = $("<p/>", {
    html: `${source.display_name.bold()}  (${type})`
  });
  $("#general-sources").append(p);
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
  movie.free_web_sources.length === 0 &&
  movie.subscription_web_sources.length === 0 &&
  movie.tv_everywhere_web_sources.length === 0 &&
  movie.purchase_web_sources.length === 0
}

function createEpisodeList(results) {
  const episodeList = $("#episode-list");
  episodeList.addClass("collapsible");
  if (results.length === 0) {
    episodeList.text("No episode information for this season. Sorry about that.");
    return;
  }
  results.forEach(episode => newEpisodeItem(episode, episodeList));
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
    "free": "(Free)",
    "subscription": "(Subscription)",
    "tv_everywhere": "(TV Everywhere)",
  }
  if (sources.length === 0) { return; }

  sources.forEach(source => {
    let titleType = type === "purchase" ? `$${source.formats[0].price}` : texts[type]
    const link = $("<a/>", {
      "href": source.link,
      text: `${source.display_name} ${titleType}`,
      "class": "episode-link"
    });
    episodeBody.append(link);
  });
}

function createSeasonList(showId, seasonNumbers) {
  if (seasonNumbers.length === 0) { return; }
  seasonNumbers.forEach(seasonNum => newSeasonListItem(showId, seasonNum))
}

function newSeasonListItem(showId, seasonNum) {
  const div = $("<div/>", {
    text: `Season ${seasonNum}`,
    "class": "chip blue",
    click: () => {
      $("#episode-list").text("");
      getSeasonById(showId, seasonNum)
    }
  });
  $("#season-list").append(div);
}

function addMovieSources(sources, type) {
  const types = {
    "free": "Free:",
    "sub": "Subscription:",
    "tve": "TV Everywhere:",
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

  sourceList.append(a);
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
  $("#item-detail").append(h4);
}

function addPoster(poster) {
  const img = $("<img/>", {
    "src": poster,
    "class": "center"
  });
  $("#item-detail").append(img);
}

function addOverview(overview) {
  const p = $("<p/>", {
    text: overview,
    "class": "left-align"
  });
  $("#item-detail").append(p);
}

//*********************************************************************
// API CALL FUNCTIONS
//*********************************************************************
const baseUrl = "http://localhost:4000/api/";

function searchForShow(searchString) {
  $("#loading").text("Loading...");
  $.ajax({
      url: `${baseUrl}shows?search_string=${searchString}`,
      type: 'GET',
      success: response => processSearchResults(response, "show")
  });
}

function searchForMovie(searchString) {
  $("#loading").text("Loading...");
  $.ajax({
      url: `${baseUrl}movies?search_string=${searchString}`,
      type: 'GET',
      success: response => processSearchResults(response, "movie")
  });
}

function getShowById(id) {
  console.log("GET SHOW BY ID");
  $.ajax({
      url: `${baseUrl}shows/${id}`,
      type: 'GET',
      success: response => displayShowDetail(response)
  });
}

function getMovieById(id) {
  $.ajax({
      url: `${baseUrl}movies/${id}`,
      type: 'GET',
      success: response => displayMovieDetail(response)
  });
}

function getSeasonById(showId, seasonId) {
  $.ajax({
      url: `${baseUrl}shows/${showId}/season/${seasonId}`,
      type: 'GET',
      success: response => createEpisodeList(response)
  });
}
