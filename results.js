document.addEventListener("DOMContentLoaded", () => {
  const apiCaller = new ApiCaller();
  const main = new Main(apiCaller);

  chrome.storage.local.get(["search", "type"], data => {
    data.type === "movie" ?
      main.movieHandler.apiCaller.searchForMovie(data.search) :
      main.showHanlder.apiCaller.searchForShow(data.search);
  });
});

class Main {
  constructor(apiCaller) {
    this.movieHandler = new MovieHandler(apiCaller);
    this.showHandler = new ShowHandler(apiCaller);
  }
}

class MediaHandler {
  constructor(apiCaller) {
    this.apiCaller = apiCaller;
  }

  processSearchResults(results, type) {
    $("#loading").empty();
    if (results.length === 0) {
      $("#results").text("No results found.");
      return;
    }
    results.forEach(item => this.appendResultItem(item, type));
  }

  appendResultItem(item, type) {
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
        this.apiCaller.getMovieById(item.id);
      });
    } else if (type === "show") {
      image.attr("src", item.artwork_208x117);
      title.text(item.title);
      listItem.click(() => {
        $("#initial-results").text("")
        this.apiCaller.getShowById(item.id);
      });
    }

    listItem.append(image, title);
    $("#initial-results").append(listItem);
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

  displayMovieDetail(movie) {
    this.addMovieDisplay(movie.display);
    this.addMovieSources(movie.sources);

    if (this.noSources(movie)) {
      $("#sources").text("We were unable to find any streams for this movie.");
      return;
    }

    this.addMovieSources(movie.sources.free, "free");
    this.addMovieSources(movie.sources.subscription, "sub");
    this.addMovieSources(movie.sources.tv_everywhere, "tve");
    this.addMovieSources(movie.sources.purchase, "purchase");
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
  constructor(apiCaller) {
    super(apiCaller);
    this.sourceTypes = {
      "free": "(Free)",
      "subscription": "(Subscription)",
      "tv_everywhere": "(TV Everywhere)",
    }
  }

  displayShowDetail(show) {
    this.addShowDisplay(show.display);
    this.addGeneralContent(show.content);
    this.createSeasonList(show.id, show.seasons);
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
    if (seasonNumbers.length === 0) { return; }
    seasonNumbers.forEach(seasonNum => this.newSeasonListItem(showId, seasonNum))
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
        this.apiCaller.getSeasonById(showId, seasonNum)
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


class ApiCaller {
  constructor() {
    this.baseUrl = "http://wwww.cordcutter.io/api/";
  }

  searchForShow() {
    $("#loading").text("Loading...");
    $.ajax({
      url: `${this.baseUrl}shows?search_string=${searchString}`,
      type: 'GET',
      success: response => this.processSearchResults(response, "show")
    });
  }

  searchForMovie(searchString) {
    $("#loading").text("Loading...");
    $.ajax({
      url: `${this.baseUrl}movies?search_string=${searchString}`,
      type: 'GET',
      success: response => this.processSearchResults(response, "movie")
    });
  }

  function searchForMovie(searchString) {
    $("#loading").text("Loading...");
    $.ajax({
      url: `${this.baseUrl}movies?search_string=${searchString}`,
      type: 'GET',
      success: response => this.processSearchResults(response, "movie")
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
