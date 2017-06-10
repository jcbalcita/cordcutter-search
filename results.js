class Main {
  constructor(apiCaller) {
    this.movieHandler = new MovieHandler(apiCaller);
    this.showHandler = new ShowHandler(apiCaller);
  }
}

class MediaHandler {
  constructor() {
    this.baseUrl = "http://localhost:4000/api/";
  }

  addTitle(title, year) {
    const yearString = year.toString();
    const h4 = $("<h4/>", {
      text: `${title}  (${yearString})`,
      "class": "movie-title center"
    });
    $("#item-detail").append(h4);
  }

  addPoster(posterSource) {
    const img = $("<img/>", {
      "src": posterSource,
      "class": "center"
    });
    $("#item-detail").append(img);
  }

  addOverview(overview) {
    const p = $("<p/>", {
      text: overview,
      "class": "left-align"
    });
    $("#item-detail").append(p);
  }

  searchForShow(searchString) {
    $.ajax({
      url: `${this.baseUrl}shows?search_string=${searchString}`,
      type: 'GET',
      success: response => this.processSearchResults(response)
    });
  }

  searchForMovie(searchString) {
    $("#loading").text("Loading...");
    $.ajax({
      url: `${this.baseUrl}movies?search_string=${searchString}`,
      type: 'GET',
      success: response => this.processSearchResults(response)
    });
  }

  getShowById(id) {
    $.ajax({
      url: `${this.baseUrl}shows/${id}`,
      type: 'GET',
      success: response => this.displayShowDetail(response)
    });
  }

  getMovieById(id) {
    $.ajax({
      url: `${this.baseUrl}movies/${id}`,
      type: 'GET',
      success: response => this.displayMovieDetail(response)
    });
  }

  getSeasonById(showId, seasonId) {
    $.ajax({
      url: `${this.baseUrl}shows/${showId}/season/${seasonId}`,
      type: 'GET',
      success: response => this.createEpisodeList(response)
    });
  }
}

class MovieHandler extends MediaHandler {
  constructor(apiCaller) {
    super(apiCaller);
    this.sourceTypes = {
      "free": "Free:",
      "sub": "Subscription:",
      "tve": "TV Everywhere:",
      "purchase": "Purchase:"
    };
    this.hasLogo = ["Netflix", "Amazon Prime", "Hulu"];
  }

  processSearchResults(results) {
    $("#loading").empty();
    if (results.length === 0) {
      $("#results").text("No results found.");
      return;
    }
    results.forEach(item => this.appendResultItem(item));
  }

  appendResultItem(item) {
    const image = $("<img/>", {
      "class": "square",
      "src": item.poster_120x171
    });
    const title = $("<span/>", {
      "class": "title right",
      text: `${item.title} (${item.release_year})`
    });
    const listItem = $("<a/>", {
      "class": "collection-item avatar list-item"
    });

    listItem.click(() => {
      $("#initial-results").text("")
      this.getMovieById(item.id);
    });
    listItem.append(image, title);
    $("#initial-results").append(listItem);
  }

  displayMovieDetail(movie) {
    console.log(JSON.stringify(movie, null, 4))
    this.addMovieDisplay(movie.display);
    this.addMovieSources(movie.sources);

    if (this.noSources(movie)) {
      $("#sources").text("We were unable to find any streams for this movie.");
      return;
    }

    const sourceTypes = Object.keys(movie.sources);
    sourceTypes.forEach(type => addMovieSources(movie.sources[type], type));
  }

  addMovieDisplay(display) {
    this.addPoster(display.poster);
    this.addTitle(display.title, display.release_year);
    this.addOverview(display.overview);
  }

  noSources(movie) {
    movie.sources.free.length === 0 &&
    movie.sources.subscription.length === 0 &&
    movie.sources.tv_everywhere.length === 0 &&
    movie.sources.purchase.length === 0
  }

  addMovieSources(sources, type) {
    if (sources.length === 0) { return; }
    const ul = this.createSourceList(this.sourceTypes[type]);
    sources.forEach(source => this.addMovieSource(source, ul));
  }

  addMovieSource(source, sourceList) {
    const listItem = $("<li/>", {"class": "list-item"});
    const a = $("<a/>", {
      href: source.link,
      "class": "source-link"
    });
    listItem.append(a);

    if (this.hasLogo.includes(source.display_name)) {
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

  createSourceList(type) {
    $("#sources").addClass("collection");
    const ul = $("<ul/>", {"class": "collection-item"});
    const h5 = $("<h5/>", {text: type});
    ul.append(h5);
    $("#sources").append(ul);
    return ul;
  }
}


class ShowHandler extends MediaHandler {
  constructor() {
    super();
    this.sourceTypes = {
      "free": "(Free)",
      "subscription": "(Subscription)",
      "tv_everywhere": "(TV Everywhere)",
    }
  }

  processSearchResults(results) {
    $("#loading").empty();
    if (results.length === 0) {
      $("#results").text("No results found.");
      return;
    }
    results.forEach(item => this.appendResultItem(item));
  }

  appendResultItem(item) {
    const image = $("<img/>", {
      "class": "square",
      "src": item.artwork_208x117
    });
    const title = $("<span/>", {
      "class": "title right",
      text: item.title
    });
    const listItem = $("<a/>", {
      "class": "collection-item avatar list-item",
    });

    listItem.click(() => {
      $("#initial-results").text("")
      this.getShowById(item.id, this.displayShowDetail.bind(this));
    });

    listItem.append(image, title);
    $("#initial-results").append(listItem);
}

  displayShowDetail(show) {
    this.addShowDisplay(show.display);
    this.addGeneralContent(show.content);
    this.createSeasonList(show.id, show.seasons);
    console.log("season 1");
  }

  addShowDisplay(display) {
    this.addPoster(display.artwork);
    this.addTitle(display.title, display.first_aired.slice(0, 4));
    this.addOverview(display.overview);
  }

  addGeneralContent(content) {
    const generalSources = $("#general-sources");
    if (content.length === 0) {
      generalSources.text("We were uanble to find any streams for this show.");
      return;
    }
    generalSources.append($("<br/>"));
    content.forEach(source => {
      if (source.type !== "purchase") { this.appendGeneralSource(source); }
    });
  }

  createSeasonList(showId, seasonNumbers) {
    if (!seasonNumbers || seasonNumbers.length === 0) { return; }
    seasonNumbers.forEach(seasonNum => this.newSeasonListItem(showId, seasonNum));
  }

  appendGeneralSource(source) {
    const type = source.type === "tv_everywhere" ? "Cable/Dish Login Required" : source.type
    const p = $("<p/>", {
      html: `${source.display_name.bold()}  (${type})`
    });
    $("#general-sources").append(p);
  }

  newSeasonListItem(showId, seasonNum) {
    const div = $("<div/>", {
      text: `Season ${seasonNum}`,
      "class": "chip blue",
      click: () => {
        $("#episode-list").text("");
        this.getSeasonById(showId, seasonNum, this.createEpisodeList)
      }
    });
    $("#season-list").append(div);
  }

  createEpisodeList(results) {
    const episodeList = $("#episode-list");
    episodeList.addClass("collapsible");
    if (results.length === 0) {
      episodeList.text("No episode information for this season. Sorry about that.");
      return;
    }
    results.forEach(episode => this.newEpisodeItem(episode, episodeList));
  }

  newEpisodeItem(episode, episodeList) {
    const episodeLi = $("<li/>");
    const episodeHeader = $("<div/>", {
      text: `Episode ${episode.episode_number}:  ${episode.original_title}`,
      "class": "collapsible-header"
    });
    const episodeBody = $("<div/>", {"class": "collapsible-body"});
    episodeLi.append(episodeHeader, episodeBody);

    this.iterEpisodeSources(episode.free_web_sources, "free", episodeBody);
    this.iterEpisodeSources(episode.subscription_web_sources, "subscription", episodeBody);
    this.iterEpisodeSources(episode.tv_everywhere_web_sources, "tv_everywhere", episodeBody);
    this.iterEpisodeSources(episode.purchase_web_sources, "purchase", episodeBody);

    episodeList.prepend(episodeLi);
  }

  iterEpisodeSources(sources, type, episodeBody) {
    if (sources.length === 0) { return; }

    sources.forEach(source => {
      let titleType = type === "purchase" ? `$${source.formats[0].price}` : this.sourceTypes[type]
      const link = $("<a/>", {
        "href": source.link,
        text: `${source.display_name} ${titleType}`,
        "class": "episode-link"
      });
      episodeBody.append(link);
    });
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const main = new Main();
  chrome.storage.local.get(["search", "type"], data => {
    data.type === "movie" ?
      main.movieHandler.searchForMovie(data.search) :
      main.showHandler.searchForShow(data.search);
  });
});
