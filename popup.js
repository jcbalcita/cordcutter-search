document.addEventListener("DOMContentLoaded", () => {
  const movieButton = $("#set-movie");
  const showButton = $("#set-show");
  const form = $("#search-form");
  const input = $("#search-input");

  chrome.storage.local.get("type", data => {
    if (data.type === "movie") {
      movieButton.removeClass("lighten-4");
      showButton.addClass("lighten-4");
    } else if (data.type === "show") {
      showButton.removeClass("lighten-4");
      movieButton.addClass("lighten-4");
    } else {
      chrome.storage.local.set({ type: "movie" });
      movieButton.removeClass("lighten-4");
    }
  });

  movieButton.click(() => {
    chrome.storage.local.set({ type: "movie" }, () => {
      movieButton.removeClass("lighten-4");
      showButton.addClass("lighten-4");
      input.focus();
    });
  });

  showButton.click(() => {
    chrome.storage.local.set({ type: "show" }, () => {
      showButton.removeClass("lighten-4");
      movieButton.addClass("lighten-4");
      input.focus();
    });
  });

  form.submit(e => {
    e.preventDefault();
    const errors = $("#errors");
    if($.trim(input.val()).length > 0) {
      errors.text("");
      chrome.storage.local.set({ search: encodeURIComponent(input.val().slice(0, 75)) }, () => {
        chrome.tabs.create({ url: "results.html" });
      });
    } else {
      errors.text("Search field can't be blank.");
      input.val("");
    }
  });

});
