(() => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  const revealEls = document.querySelectorAll(".reveal, .service");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach((el, index) => {
      if (el.classList.contains("service")) {
        el.style.transitionDelay = `${Math.min(index * 0.06, 0.36)}s`;
      }
      observer.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const reelStage = document.querySelector(".reel__stage");
  const beforeVideo = document.querySelector(".reel__video--before");
  const afterVideo = document.querySelector(".reel__video--after");
  const reelToggle = document.querySelector(".reel__toggle");
  const TARGET_SECONDS = 4;

  if (reelStage && beforeVideo && afterVideo && reelToggle) {
    let playing = false;
    let runId = 0;
    let gapTimer = 0;
    let cancelClip = null;

    const setActive = (video) => {
      beforeVideo.closest(".reel__panel").classList.toggle("is-active", video === beforeVideo);
      afterVideo.closest(".reel__panel").classList.toggle("is-active", video === afterVideo);
    };

    const fitToTarget = (video) => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      video.playbackRate = Math.min(3, Math.max(0.5, duration / TARGET_SECONDS));
    };

    const prepare = (video) =>
      new Promise((resolve) => {
        const ready = () => {
          fitToTarget(video);
          video.currentTime = 0;
          resolve();
        };
        if (video.readyState >= 1) ready();
        else video.addEventListener("loadedmetadata", ready, { once: true });
      });

    const playClip = (video, id) =>
      new Promise(async (resolve) => {
        if (id !== runId) return resolve();
        await prepare(video);
        if (id !== runId) return resolve();
        setActive(video);

        const finish = () => {
          video.removeEventListener("ended", finish);
          cancelClip = null;
          resolve();
        };

        cancelClip = finish;
        video.addEventListener("ended", finish);
        try {
          await video.play();
        } catch {
          finish();
        }
      });

    const stopAll = () => {
      runId += 1;
      window.clearTimeout(gapTimer);
      if (cancelClip) cancelClip();
      beforeVideo.pause();
      afterVideo.pause();
      beforeVideo.closest(".reel__panel").classList.remove("is-active");
      afterVideo.closest(".reel__panel").classList.remove("is-active");
    };

    const wait = (ms, id) =>
      new Promise((resolve) => {
        gapTimer = window.setTimeout(() => resolve(id === runId), ms);
      });

    const runSequence = async (id) => {
      while (playing && id === runId) {
        await playClip(beforeVideo, id);
        if (!playing || id !== runId) break;
        beforeVideo.pause();
        if (!(await wait(120, id))) break;
        await playClip(afterVideo, id);
        if (!playing || id !== runId) break;
        afterVideo.pause();
        if (!(await wait(500, id))) break;
      }
    };

    const setPlaying = (next) => {
      if (next === playing) return;
      playing = next;
      reelToggle.setAttribute("aria-pressed", String(playing));
      reelToggle.textContent = playing ? "Pause sequence" : "Play sequence";
      if (playing) {
        const id = ++runId;
        runSequence(id);
      } else {
        stopAll();
      }
    };

    reelToggle.addEventListener("click", () => setPlaying(!playing));

    if ("IntersectionObserver" in window) {
      const reelObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!playing) setPlaying(true);
            } else if (playing) {
              setPlaying(false);
            }
          });
        },
        { threshold: 0.45 }
      );
      reelObserver.observe(reelStage);
    }
  }
})();
