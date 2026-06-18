import { H as Hls } from "./hls.js";

function setupPlayer(box) {
  var video = box.querySelector("video");
  var trigger = box.querySelector("[data-player-trigger]");
  var source = box.getAttribute("data-video-source");
  var hls = null;
  var initialized = false;

  function initialize() {
    if (initialized || !video || !source) {
      return;
    }
    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.load();
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal && hls) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
          }
        }
      });
    }
  }

  function playVideo() {
    initialize();
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener("click", function () {
      playVideo();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    box.classList.add("is-playing");
  });

  video.addEventListener("pause", function () {
    box.classList.remove("is-playing");
  });

  video.addEventListener("ended", function () {
    box.classList.remove("is-playing");
  });

  initialize();
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-video-source]").forEach(setupPlayer);
});
