document.addEventListener("DOMContentLoaded", () => {
  const movieButton = document.getElementById("set-movie")
  const showButton = document.getElementById("set-show")
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input")

  chrome.storage.local.get("type", data => {
    if (data.type === "movie") {
      movieButton.classList.remove("lighten-4");
      showButton.classList.add("lighten-4");
    } else if (data.type === "show") {
      showButton.classList.remove("lighten-4");
      movieButton.classList.add("lighten-4");
    } else {
      chrome.storage.local.set({ type: "movie" });
      movieButton.classList.remove("lighten-4");
    }
  });

  movieButton.onclick = function() {
    chrome.storage.local.set({ type: "movie" }, () => {
      this.classList.remove("lighten-4");
      showButton.classList.add("lighten-4");
      focus(input);
    });
  }

  showButton.onclick = function() {
    chrome.storage.local.set({ type: "show" }, () => {
      this.classList.remove("lighten-4");
      movieButton.classList.add("lighten-4");
      focus(input);
    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const errors = document.getElementById("errors")

    if (input.value) {
      errors.textContent = ""
      chrome.storage.local.set({ search: encodeURIComponent(input.value.slice(0, 75)) },
      () => chrome.tabs.create({ url: "results.html" }));
    } else {
      errors.textContent = "Search field can't be blank."
    }
  });

  focus(input);

  function focus(inputForm) {
    inputForm.select();
    inputForm.focus();
  }  
});
