function ui() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduce-motion: reduce)"
  ).matches;

  /* Email link copy-to-clipboard */
  const emailLink = document.getElementById("email-link");
  if (emailLink) {
    emailLink.addEventListener("click", (e) => {
      e.preventDefault();
      const email = "work@felipefs.dev";
      const abbr = emailLink.querySelector("abbr");
      navigator.clipboard.writeText(email).then(() => {
        const originalText = abbr.textContent;
        abbr.textContent = originalText + " (copied)";
        setTimeout(() => {
          abbr.textContent = originalText;
        }, 2000);
      }).catch(() => {
        /* Fallback: open mailto if clipboard fails */
        window.location.href = "mailto:" + email;
      });
    });
  }

  const navLinks = Array.from(
    document.querySelectorAll(".nav-list a[href^='#']")
  );

  const navTargets = navLinks.map((link) => {
    const id = (link.getAttribute("href") || "").replace("#", "");
    return { id, link };
  });

  const setActiveNav = (activeId) => {
    navTargets.forEach(({ id, link }) => {
      link.classList.toggle("active", id === activeId);
    });
  };

  if (navTargets.length > 0) {
    const updateActiveFromHash = () => {
      const hashId = (window.location.hash || "#about").replace("#", "");
      const hasMatch = navTargets.some((item) => item.id === hashId);
      setActiveNav(hasMatch ? hashId : navTargets[0].id);
    };

    updateActiveFromHash();

    navTargets.forEach(({ id, link }) => {
      link.addEventListener("click", () => {
        setActiveNav(id);
      });
    });

    window.addEventListener("hashchange", updateActiveFromHash);
  }

  const heroImage = document.querySelector(".hero-image");

  if (heroImage && !prefersReducedMotion) {
    const maxTilt = 7;

    heroImage.addEventListener("mousemove", (event) => {
      const rect = heroImage.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateX = (y / rect.height - 0.5) * -(maxTilt * 2);
      const rotateY = (x / rect.width - 0.5) * (maxTilt * 2);

      heroImage.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    heroImage.addEventListener("mouseleave", () => {
      heroImage.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  const cursorGlow = document.querySelector(".cursor-glow");

  if (cursorGlow && !prefersReducedMotion) {
    let glowTimeout;

    const updateGlowPosition = (event) => {
      const x = event.clientX;
      const y = event.clientY;

      cursorGlow.style.left = x + "px";
      cursorGlow.style.top = y + "px";
      cursorGlow.style.opacity = "1";

      clearTimeout(glowTimeout);
      glowTimeout = setTimeout(() => {
        cursorGlow.style.opacity = "0";
      }, 1000);
    };

    document.addEventListener("mousemove", updateGlowPosition);
    document.addEventListener("mouseleave", () => {
      cursorGlow.style.opacity = "0";
      clearTimeout(glowTimeout);
    });
  }

  const timelineTrack = document.getElementById("timeline-track");
  const previousTimelineButton = document.querySelector(
    "[data-timeline-nav='prev']"
  );
  const nextTimelineButton = document.querySelector("[data-timeline-nav='next']");

  if (timelineTrack) {
    const getScrollStep = () => {
      // Mobile (< 768px): 1 card width (~240px)
      // Desktop (≥ 768px): 2 cards width (~540px)
      const isMobile = window.innerWidth < 768;
      const cardCount = isMobile ? 1 : 2;
      
      // Average card width is ~270px (clamp 240-300px), use 280 as safe middle ground
      return cardCount * 280;
    };

    const scrollTrack = (direction) => {
      timelineTrack.scrollBy({
        left: direction * getScrollStep(),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    };

    if (previousTimelineButton) {
      previousTimelineButton.addEventListener("click", () => {
        scrollTrack(-1);
      });
    }

    if (nextTimelineButton) {
      nextTimelineButton.addEventListener("click", () => {
        scrollTrack(1);
      });
    }

    timelineTrack.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollTrack(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollTrack(1);
      }
    });

    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let lastDragX = 0;
    let dragVelocity = 0;
    let dragDistance = 0;

    const startDrag = (clientX) => {
      isDragging = true;
      dragStartX = clientX;
      lastDragX = clientX;
      dragStartScrollLeft = timelineTrack.scrollLeft;
      dragVelocity = 0;
      dragDistance = 0;
      timelineTrack.classList.add("is-dragging");
    };

    const updateDrag = (clientX) => {
      if (!isDragging) return;

      const delta = clientX - dragStartX;
      dragDistance = Math.abs(delta);
      dragVelocity = clientX - lastDragX;
      lastDragX = clientX;
      
      timelineTrack.scrollLeft = dragStartScrollLeft - delta;
    };

    const endDrag = () => {
      if (!isDragging) return;

      isDragging = false;
      timelineTrack.classList.remove("is-dragging");

      // Only snap if drag was minimal (not a swipe)
      // If user dragged significantly, let momentum carry then snap
      const snapDelay = dragDistance > 10 ? 200 : 0;

      setTimeout(() => {
        snapToNearestCard();
      }, snapDelay);
    };

    const snapToNearestCard = () => {
      const cards = Array.from(timelineTrack.querySelectorAll(".timeline-item"));
      if (cards.length === 0) return;

      const trackLeftEdge = timelineTrack.scrollLeft;
      const trackCenter = trackLeftEdge + timelineTrack.clientWidth / 2;

      let nearestCard = cards[0];
      let minDistance = Math.abs(nearestCard.offsetLeft + nearestCard.offsetWidth / 2 - trackCenter);

      cards.forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - trackCenter);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCard = card;
        }
      });

      const targetScroll = nearestCard.offsetLeft - (timelineTrack.clientWidth / 2 - nearestCard.offsetWidth / 2);
      timelineTrack.scrollTo({
        left: targetScroll,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    };

    /* Update shadow visibility based on scroll position */
    const leftFade = document.querySelector(".timeline-fade-left");
    const rightFade = document.querySelector(".timeline-fade-right");

    const updateFades = () => {
      const scrollLeft = timelineTrack.scrollLeft;
      const maxScroll = timelineTrack.scrollWidth - timelineTrack.clientWidth;

      // Show left fade if scrolled more than 8px from start
      if (leftFade) {
        leftFade.classList.toggle("visible", scrollLeft > 8);
      }

      // Show right fade if not at the end (more than 8px from max)
      if (rightFade) {
        rightFade.classList.toggle("visible", scrollLeft < maxScroll - 8);
      }
    };

    updateFades();
    timelineTrack.addEventListener("scroll", updateFades);

    // Mouse events
    timelineTrack.addEventListener("mousedown", (event) => {
      startDrag(event.clientX);
    });

    timelineTrack.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    window.addEventListener("mousemove", (event) => {
      updateDrag(event.clientX);
    });

    window.addEventListener("mouseup", endDrag);
    timelineTrack.addEventListener("mouseleave", endDrag);

    // Touch events
    timelineTrack.addEventListener("touchstart", (event) => {
      startDrag(event.touches[0].clientX);
    });

    window.addEventListener("touchmove", (event) => {
      updateDrag(event.touches[0].clientX);
    });

    window.addEventListener("touchend", endDrag);

    // Prevent clicks after drag
    timelineTrack.addEventListener("click", (event) => {
      if (dragDistance > 5) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }

  const reposGrid = document.getElementById("repos-grid");

  /* Accessibility easter egg - keyboard user reward */
  const easterEggMessages = [
    "a11y.hint.initial",
    "a11y.hint.discovery",
    "a11y.hint.philosophy",
    "a11y.hint.intention"
  ];
  
  let tabCount = 0;
  let messageIndex = 0;
  const easterEggEl = document.querySelector(".a11y-easter-egg");

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      /* First tab press - add keyboard user class */
      if (tabCount === 0) {
        document.body.classList.add("is-keyboard-user");
      }

      tabCount++;

      if (easterEggEl) {
        /* Show first message at 6 tabs, then cycle through every 2 tabs */
        if (tabCount >= 6 && (tabCount - 6) % 2 === 0) {
          messageIndex = Math.floor((tabCount - 6) / 2) % easterEggMessages.length;
          const i18nKey = easterEggMessages[messageIndex];
          
          /* Get current language from document or default to 'en' */
          const currentLang = document.documentElement.lang || 'en';
          
          /* Try to get translated text, fallback to English */
          const translations = window.i18nData ? window.i18nData[currentLang] : null;
          const translatedText = translations ? translations[i18nKey] : null;
          
          if (translatedText) {
            easterEggEl.textContent = translatedText;
          }
          easterEggEl.setAttribute("data-message-index", messageIndex);
        }
      }
    }
  });
}

ui();
