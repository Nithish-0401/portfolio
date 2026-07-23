(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("no-js");

  /* =========================================================
     LENIS SMOOTH SCROLL
  ========================================================== */
  let lenis;
  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* =========================================================
     HEADER SCROLL STATE
  ========================================================== */
  const header = document.getElementById("site-header");
  const onScrollHeader = () => {
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* =========================================================
     MOBILE NAV TOGGLE
  ========================================================== */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* =========================================================
     SMOOTH SCROLL FOR ANCHOR LINKS
  ========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -72 });
      } else {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* =========================================================
     ACTIVE NAV HIGHLIGHT (IntersectionObserver)
  ========================================================== */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav__menu a");

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.nav === id);
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  /* =========================================================
     BACK TO TOP
  ========================================================== */
  const backToTop = document.getElementById("backToTop");
  backToTop.addEventListener("click", () => {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }
  });

  /* =========================================================
     FOOTER YEAR
  ========================================================== */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* =========================================================
     GSAP ANIMATIONS
  ========================================================== */
  if (window.gsap) {
    gsap.registerPlugin(window.ScrollTrigger);

    /* --- Hero entrance timeline --- */
    const heroTl = gsap.timeline({
      defaults: { ease: "power3.out", duration: 0.9 },
      delay: 0.1,
    });

    heroTl
      .to(".eyebrow__line", { scaleX: 1, duration: 0.6, ease: "power3.out" }, 0)
      .from(".hero .eyebrow", { opacity: 0, y: 16 }, 0)
      .from(".hero__headline", { opacity: 0, y: 28 }, 0.1)
      .from(".hero__sub", { opacity: 0, y: 20 }, 0.25)
      .from(".hero__actions .btn", { opacity: 0, y: 16, stagger: 0.12 }, 0.4)
      .from(".badge-row .badge", { opacity: 0, y: 12, stagger: 0.06 }, 0.55)
      .from(
        ".hero__photo-wrap",
        { opacity: 0, scale: 0.92, duration: 1 },
        0.15
      )
      .from(
        ".hero__ring",
        { opacity: 0, scale: 0.85, duration: 1.1 },
        0.2
      )
      .from(
        ".hero__shape",
        { opacity: 0, scale: 0.6, stagger: 0.1, duration: 0.8 },
        0.35
      );

    /* --- Scroll-triggered reveals --- */
    const revealUp = (selector, opts = {}) => {
      document.querySelectorAll(selector).forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
          ...opts,
        });
      });
    };

    revealUp(".reveal-up");

    document.querySelectorAll(".eyebrow.reveal-line").forEach((el) => {
      const line = document.createElement("span");
      line.className = "eyebrow__line";
      line.setAttribute("aria-hidden", "true");
      el.prepend(line);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
      tl.to(line, { scaleX: 1, duration: 0.5, ease: "power3.out" }).from(
        el,
        { opacity: 0, x: -12, duration: 0.5, ease: "power3.out" },
        0
      );
    });

    /* --- Staggered grids --- */
    const staggerGroup = (selector) => {
      const group = document.querySelectorAll(selector);
      if (!group.length) return;
      gsap.from(group, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: group[0].closest("section"),
          start: "top 78%",
          once: true,
        },
      });
    };
    staggerGroup(".skill-card");
    staggerGroup(".project-card");
    staggerGroup(".education-card");
    staggerGroup(".stat-card");

    /* --- Stat counters --- */
    document.querySelectorAll(".stat-card__value[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const isDecimal = String(el.dataset.count).includes(".");
      const counter = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            val: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = isDecimal
                ? counter.val.toFixed(2)
                : Math.round(counter.val);
            },
            onComplete: () => {
              el.textContent =
                (isDecimal ? target.toFixed(2) : target) + suffix;
            },
          });
        },
      });
    });
  }

  /* =========================================================
     CONTACT FORM — VALIDATION + MAILTO
  ========================================================== */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  const fields = ["name", "email", "subject", "message"];

  const validators = {
    name: (v) => v.trim().length > 0,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    subject: (v) => v.trim().length > 0,
    message: (v) => v.trim().length > 0,
  };

  const errorMessages = {
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    subject: "Please enter a subject.",
    message: "Please enter a message.",
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";

    let isValid = true;

    fields.forEach((name) => {
      const input = document.getElementById(name);
      const errorEl = document.getElementById(`${name}Error`);
      const value = input.value;

      if (!validators[name](value)) {
        isValid = false;
        input.closest(".form-field").classList.add("has-error");
        errorEl.textContent = errorMessages[name];
      } else {
        input.closest(".form-field").classList.remove("has-error");
        errorEl.textContent = "";
      }
    });

    if (!isValid) {
      status.textContent = "Please fix the highlighted fields.";
      return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailtoLink = `mailto:nithish4105@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
    status.textContent = "Opening your email client...";
  });
})();
