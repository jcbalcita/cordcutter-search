document.addEventListener("DOMContentLoaded", () => {
  const movieButton = document.getElementById("set-movie")
  const showButton = document.getElementById("set-show")
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input")

  chrome.storage.local.get("type", data => {
    if (data.type === "movie") {
      movieButton.className = "set-button-selected";
      showButton.className = "set-button";
    } else if (data.type === "show") {
      showButton.className = "set-button-selected";
      movieButton.className = "set-button";
    } else {
      chrome.storage.local.set({ type: "movie" }, (),
      () => movieButton.className = "set-button-selected");
    }
  });

  movieButton.onclick = function() {
    chrome.storage.local.set({ type: "movie" }, () => {
      this.className = "set-button-selected";
      showButton.className = "set-button";
    });
  }

  showButton.onclick = function() {
    chrome.storage.local.set({ type: "show" }, () => {
      this.className = "set-button-selected";
      movieButton.className = "set-button";
    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    errors = document.getElementById("errors")

    if (input.value) {
      errors.textContent = ""
      chrome.storage.local.set({ search: encodeURIComponent(input.value.slice(0, 75)) },
      () => chrome.tabs.create({ url: "results.html" }));
    } else {
      errors.textContent = "Search field can't be blank."
    }
  });
});
