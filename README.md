**DEFUNCT**

As with Cordcutter API, this is now defunct because the once-free API that I used is now $1000/month. Bummer!

# Cordcutter Search

A Chrome extension that allows users, via the [GuideBox API](http://www.guidebox.com), to find out if a show or movie is available for licensed streaming on the web.

## Functionality

Cordcutter Search provides its users with an easy, convenient way to find out if a show is available for streaming.

There are two ways a user can get stream info on a movie or TV show:
- Selecting the text title on the webpage, right-clicking, and clicking on the appropriate option, which fires off the search.
- Clicking on the extension's icon, which opens up a tab containing an HTML form in which the user can manually type in the title by which to search.

## ~~Coming Soon~~ Now Functional
- Elixir/Phoenix app that processes the calls to the Guidebox API and will provide the direct endpoint for the extension.
  - Passes data to the extension on a need-to-know basis rather than the entire Guidebox response.
