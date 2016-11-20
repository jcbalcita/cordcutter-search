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

## Features and Functionality

Cordcutter Search provides its users with an easy, convenient way to find out if a show is available for streaming.

There are two ways for a user to get stream info regarding a movie or TV show.  
- Selecting the text title on the webpage, right-clicking, and clicking on the appropriate option, which fires off the search.
- Clicking on the extension's icon, which opens up a tab containing an HTML form in which the user can manually type in the title by which to search.

### Preliminary Plans

#### Outline / Manifest

In the `manifest.json` file, I plan to declare the following:

```javascript
{
  "manifest_version": 2,

  "name": "Cordcutter Search",
  "description": "For cordcutters who constantly ask - 'where can I stream it?'",
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

I declare a `background.js` file that contains the code for creating and firing the context menus.  I also declare the permissions for access to the active tab, context menus, Chrome's storage feature, and the GuideBox API.  The file `popup.html` will render the search form and the results, if any.

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
