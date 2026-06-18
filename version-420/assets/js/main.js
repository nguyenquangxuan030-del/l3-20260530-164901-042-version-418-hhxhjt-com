(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === active);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-filter-empty]");
      var urlKey = scope.getAttribute("data-url-search");

      if (urlKey && input) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get(urlKey);
        if (queryValue) {
          input.value = queryValue;
        }
      }

      function apply() {
        var keyword = input ? normalize(input.value) : "";
        var visible = 0;
        cards.forEach(function (card) {
          var matched = true;
          var searchText = normalize(card.getAttribute("data-search"));
          if (keyword && searchText.indexOf(keyword) === -1) {
            matched = false;
          }
          selects.forEach(function (select) {
            var key = select.getAttribute("data-filter-select");
            var value = normalize(select.value);
            if (value && normalize(card.getAttribute("data-" + key)) !== value) {
              matched = false;
            }
          });
          card.classList.toggle("is-hidden-card", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
