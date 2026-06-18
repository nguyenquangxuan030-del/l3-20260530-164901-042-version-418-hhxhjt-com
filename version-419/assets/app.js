document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-missing");
    });
  });

  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-target") || "0"));
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(document.querySelector(".site-search") && document.querySelector(".site-search").value);
    var yearFilter = normalize(document.querySelector('[data-filter="year"]') && document.querySelector('[data-filter="year"]').value);
    var kindFilter = normalize(document.querySelector('[data-filter="kind"]') && document.querySelector('[data-filter="kind"]').value);

    document.querySelectorAll(".searchable-item").forEach(function (item) {
      var text = normalize(item.getAttribute("data-search"));
      var year = normalize(item.getAttribute("data-year"));
      var kind = normalize(item.getAttribute("data-kind"));
      var queryMatch = !query || text.indexOf(query) !== -1;
      var yearMatch = !yearFilter || year.indexOf(yearFilter) !== -1;
      var kindMatch = !kindFilter || kind.indexOf(kindFilter) !== -1;
      item.hidden = !(queryMatch && yearMatch && kindMatch);
    });
  }

  document.querySelectorAll(".site-search, .filter-select").forEach(function (control) {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });

  document.querySelectorAll(".video-player-card").forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-toggle");

    if (!video || !button) {
      return;
    }

    var stream = button.getAttribute("data-stream") || "";
    var prepared = false;
    var hlsObject = null;

    function attachStream() {
      if (prepared) {
        video.play().catch(function () {});
        return;
      }

      prepared = true;
      box.classList.add("is-ready");
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsObject = new window.Hls();
        hlsObject.loadSource(stream);
        hlsObject.attachMedia(video);
        hlsObject.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = stream;
      video.play().catch(function () {});
    }

    button.addEventListener("click", attachStream);
    video.addEventListener("click", function () {
      if (!prepared) {
        attachStream();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsObject && typeof hlsObject.destroy === "function") {
        hlsObject.destroy();
      }
    });
  });
});
