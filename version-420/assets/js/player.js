(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupPlayer(video) {
    var source = video.getAttribute("data-stream");
    var shell = video.closest(".player-shell");
    var cover = shell ? shell.querySelector(".player-cover") : null;
    var hls = null;
    var loaded = false;
    var pendingPlay = false;

    function hideCover() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    function requestPlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function load() {
      if (loaded || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pendingPlay) {
            requestPlay();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = source;
      }
    }

    function start() {
      pendingPlay = true;
      hideCover();
      load();
      requestPlay();
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        start();
      }
    });
    video.addEventListener("play", hideCover);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(setupPlayer);
  });
})();
