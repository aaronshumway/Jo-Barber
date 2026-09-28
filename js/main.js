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
  const reelVideos = [...document.querySelectorAll(".reel__video")];
  const reelToggle = document.querySelector(".reel__toggle");
  const TARGET_SECONDS = 4;
  const LOOP_PAUSE_MS = 500;

  if (reelStage && reelVideos.length && reelToggle) {
    let playing = false;
    let restartTimer = 0;
    let endedCount = 0;

    // Clips have different lengths, so each gets its own rate to finish together.
    const fitToTarget = (video) => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      video.playbackRate = Math.min(3, Math.max(0.5, duration / TARGET_SECONDS));
    };

    const whenReady = (video) =>
      new Promise((resolve) => {
        if (video.readyState >= 1) resolve();
        else video.addEventListener("loadedmetadata", resolve, { once: true });
      });

    const startTogether = async () => {
      await Promise.all(reelVideos.map(whenReady));
      if (!playing) return;
      endedCount = 0;
      reelVideos.forEach((video) => {
        fitToTarget(video);
        video.currentTime = 0;
      });
      reelVideos.forEach((video) => video.play().catch(() => {}));
    };

    reelVideos.forEach((video) => {
      video.addEventListener("ended", () => {
        endedCount += 1;
        if (endedCount < reelVideos.length || !playing) return;
        restartTimer = window.setTimeout(startTogether, LOOP_PAUSE_MS);
      });
    });

    const setPlaying = (next) => {
      if (next === playing) return;
      playing = next;
      reelToggle.setAttribute("aria-pressed", String(playing));
      reelToggle.textContent = playing ? "Pause" : "Play";
      window.clearTimeout(restartTimer);
      if (playing) {
        startTogether();
      } else {
        reelVideos.forEach((video) => video.pause());
      }
    };

    reelToggle.addEventListener("click", () => setPlaying(!playing));

    if ("IntersectionObserver" in window) {
      const reelObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setPlaying(entry.isIntersecting);
          });
        },
        { threshold: 0.45 }
      );
      reelObserver.observe(reelStage);
    } else {
      setPlaying(true);
    }
  }
})();
