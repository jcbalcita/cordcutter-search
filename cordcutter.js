// Search by show title
// ********************
// {Base API URL} /search/title/ {TRIPLE url encoded show name} / {"exact" or "fuzzy"}
let showSearch = encodeURIComponent('mr. robot!');
let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/search/title/${showSearch}`;
let xhr = new XMLHttpRequest();

xhr.open('GET', url, true);
xhr.responseType = 'json';

xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(xhr.response);
            // do moar stuff here
        }
    }
};

xhr.send();

// Search by movie title
// *********************
// {Base API URL} /search/movie/title/ {TRIPLE url encoded show name} / {"exact" or "fuzzy"}

let movieSearch = encodeURIComponent('goodfellas ');
let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/search/movie/title/${movieSearch}`;
let xhr = new XMLHttpRequest();

xhr.open('GET', url, true);
xhr.responseType = 'json';

xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(xhr.response);
            // do moar stuff here
        }
    }
};

xhr.send();


// Request information on show by ID
// **********************************
let showId = '17205'
let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${showId}/available_content`;
let xhr = new XMLHttpRequest();

xhr.open('GET', url, true);
xhr.responseType = 'json';

xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(xhr.response);
            // do moar stuff here
        }
    }
};

xhr.send();

// Request information on movie by ID
// **********************************
let movieId = '50362'
let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/movie/${movieId}`;
let xhr = new XMLHttpRequest();

xhr.open('GET', url, true);
xhr.responseType = 'json';

xhr.onload = function () {
  if (xhr.readyState === xhr.DONE) {
    if (xhr.status === 200) {
      console.log(xhr.response);
      // do moar stuff here
    }
  }
};

xhr.send();

// Request how many seasons a show has
// *************************************************
// Doesn't give much information -- probably only useful to find out
// number of seasons... then creating a link for fetching each season.
let showId = '17205';
let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${showId}/seasons`;
let xhr = new XMLHttpRequest();

xhr.open('GET', url, true);
xhr.responseType = 'json';

xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(xhr.response);
            // do moar stuff here
        }
    }
};

xhr.send();

// Request information on a specific season of a show
// **************************************************
//{Base API URL} /show/ {id} /episodes/ {season} / {limit 1} / {limit 2} / {sources} / {platform} / {include links}

let showId = '17205';
let season = '1';
let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/${showId}/episodes/${season}/1/25/all/all/true`;
let xhr = new XMLHttpRequest();

xhr.open('GET', url, true);
xhr.responseType = 'json';

xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(xhr.response);
            // do moar stuff here
        }
    }
};

xhr.send();
