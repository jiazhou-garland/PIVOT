(() => {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".reading-progress span");
  const themeButton = document.querySelector(".theme-toggle");
  const copyButton = document.querySelector("[data-copy]");

  const stored = (() => {
    try {
      return localStorage.getItem("pivot-theme");
    } catch (_) {
      return null;
    }
  })();
  if (!stored) {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "dark" : "light";
  }
  const syncTheme = () => {
    const dark = root.dataset.theme === "dark";
    if (themeButton) {
      themeButton.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#171714" : "#f8f6f0");
  };
  syncTheme();

  themeButton?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("pivot-theme", root.dataset.theme);
    } catch (_) {}
    syncTheme();
  });

  const onScroll = () => {
    const scrolled = window.scrollY > 8;
    header?.classList.toggle("is-scrolled", scrolled);
    if (progress) {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${height > 0 ? (window.scrollY / height) * 100 : 0}%`;
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const reveals = document.querySelectorAll(".reveal");
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
    reveals.forEach((node) => observer.observe(node));
  } else {
    reveals.forEach((node) => node.classList.add("is-visible"));
  }

  // Step chips removed from the Teaser (now an HTML5 video). Keep diagnosis note intact.

  document.querySelectorAll("[data-switch]").forEach((group) => {
    const name = group.dataset.switch;
    const buttons = group.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((other) => {
          const on = other === button;
          other.setAttribute("aria-pressed", on ? "true" : "false");
        });
        document.querySelectorAll(`[data-view="${name}"]`).forEach((panel) => {
          panel.hidden = panel.dataset.value !== button.dataset.value;
        });
      });
    });
  });

  copyButton?.addEventListener("click", async () => {
    const target = document.querySelector(copyButton.dataset.copy);
    if (!target) return;
    const text = target.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    const previous = copyButton.textContent;
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = previous;
    }, 1400);
  });
})();
