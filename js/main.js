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

  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const slides = [...carousel.querySelectorAll("[data-slide]")];
    const dotsWrap = carousel.querySelector("[data-dots]");
    const count = slides.length;
    const AUTO_MS = 6000;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let autoTimer = 0;

    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel__dot";
      dot.setAttribute("aria-label", `Show review ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
      return dot;
    });

    const render = () => {
      slides.forEach((slide, i) => {
        let offset = i - index;
        if (offset > count / 2) offset -= count;
        if (offset < -count / 2) offset += count;
        slide.dataset.pos =
          Math.abs(offset) <= 1 ? String(offset) : offset > 0 ? "far-next" : "far-prev";
        slide.setAttribute("aria-hidden", String(offset !== 0));
      });
      dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));
    };

    const goTo = (next) => {
      index = (next + count) % count;
      render();
      restartAuto();
    };

    const restartAuto = () => {
      window.clearInterval(autoTimer);
      if (!reduceMotion) autoTimer = window.setInterval(() => goTo(index + 1), AUTO_MS);
    };

    carousel.querySelector("[data-prev]").addEventListener("click", () => goTo(index - 1));
    carousel.querySelector("[data-next]").addEventListener("click", () => goTo(index + 1));

    let justSwiped = false;

    slides.forEach((slide) => {
      slide.addEventListener("click", () => {
        if (justSwiped) return;
        if (slide.dataset.pos === "-1") goTo(index - 1);
        if (slide.dataset.pos === "1") goTo(index + 1);
      });
    });

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === "ArrowRight") goTo(index + 1);
    });

    let startX = null;
    const track = carousel.querySelector(".carousel__track");
    track.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
    });
    track.addEventListener("pointerup", (event) => {
      if (startX === null) return;
      const delta = event.clientX - startX;
      startX = null;
      justSwiped = Math.abs(delta) > 40;
      if (justSwiped) {
        goTo(delta < 0 ? index + 1 : index - 1);
        window.setTimeout(() => {
          justSwiped = false;
        }, 0);
      }
    });

    carousel.addEventListener("mouseenter", () => window.clearInterval(autoTimer));
    carousel.addEventListener("mouseleave", restartAuto);
    carousel.addEventListener("focusin", () => window.clearInterval(autoTimer));
    carousel.addEventListener("focusout", restartAuto);

    render();
    restartAuto();
  }
})();
