# Cordcutter Search

A Chrome extension that allows users, via the [GuideBox API](http://www.guidebox.com), to find out if a show or movie is available for licensed streaming on the web.

## MVP

- [ ] Has clickable icon that opens `popup.html`, which in turn renders a functional "search by title" form.
- [ ] Grabs selected text from the page and fires off API requests to GuideBox via context menus.
- [ ] Allows users to search by show or movie title and find out on which websites the show is available for streaming.
- [ ] Allows user to check if a specific season of a show is available for streaming.

### Bonus

- [ ] Users can specify the platform (_i.e._, iOS, Android, or Web) for the stream search.
- [ ] Users can specify the service (_e.g._, Hulu, Netflix, _etc._) for the stream search.
- [ ] Users can view _n_ number of old searches and bookmarked shows/movies.

## Features and Functionality

Cordcutter Search provides its users with an easy, convenient way to find out if a show is available for streaming.

There are two ways for a user to get stream info regarding a movie or TV show.  
- Selecting the text title on the webpage, right-clicking, and clicking on the appropriate option, which fires off the search.
- Clicking on the extension's icon, which opens up a tab containing an HTML form in which the user can manually type in the title by which to search.

### Preliminary Plans

#### Manifest

In the `manifest.json` file, I plan to declare the following:

```javascript
{
  "manifest_version": 2,

  "name": "Cordcutter Search",
  "description": "For cordcutters who have to constantly ask - 'where can I stream it?'",
  "version": "0.1",
  "background": {
    "scripts": ["background.js"]
  },
  "browser_action": {
    "default_icon": "cordcutter.png",
    "default_title": "Cordcutter Search"
  },
  "permissions": [
    "activeTab",
    "contextMenus",
    "storage",
    "http://*.guidebox.com"
  ]
}
```

I declare a `background.js` file that contains the code for creating and firing the context menus.  I also declare the permissions for access to the active tab, context menus, Chrome's storage feature (for bonus), and the GuideBox API.  The file `popup.html` will render the search form and the results, if any.

#### Context Menus

I plan to create the appropriate context menus within `background.js` in the following manner:

```javascript
chrome.contextMenus.create({
 title: "Search by SHOW title",
 contexts:["selection"],
 onclick: searchShow
});

chrome.contextMenus.create({
 title: "Search by MOVIE title",
 contexts:["selection"],
 onclick: searchMovie
});
```

## Implementation and Timeline

### Day 0
- [x] Write up the `manifest.json` file.
- [x] Research how to add context menus and write the appropriate code to create them.
- [x] Sign up for GuideBox API, and make XML requests in the console to make sure I understand how to make a call and the format of the response.

### Day 1
- Document the URL structure for all API calls to GuideBox that my extension will need.
  + Search by show title
  + Search by movie title
  + Request information on show by ID
  + Request information on movie by ID
  + Request information on specific season of a show
- Declare an icon for my extension, get the icon to appear and open popup.html when clicked on.

### Day 2
- Write the `handleClick` functions for the context menu items, and make sure fire off functional API calls by console logging the results.
- Write outline for `popup.html`.
  + Forms for "Search by movie title" and "Search by show title"
  + Declare DOM element with the id "search-results" in which to display matching show/movie title, year, and genre.
  + Declare DOM Element with the id "item-detail" in which to display information on a single show or movie – if show, streaming information on specific seasons.
- Successfully grab element by ID and change its contents using vanilla JavaScript.

### Day 3
- Figure out how to coordinate the context menu actions in `background.js` with `cordcutter.js` and `popup.html`.

### Day 4
- Both the search form in `popup.html` and the context menu items fire off the appropriate API call and send the results to `popup.html`.
- `popup.html` displays the API response in plain JSON format.

### Day 5
- Style `popup.html` to display results and information in a presentable, intuitive manner.
- General bugfixing.

### Day 6 and beyond
- Bugfixing and refactoring as needed.
- Add bonus features.
