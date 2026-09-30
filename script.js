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

  const steps = document.querySelectorAll(".step-chip");
  const note = document.querySelector("[data-step-note]");
  const notes = {
    0: ["Still recoverable", "Feasible = 1. Vanilla GRPO stays flat; PIVOT has not yet peaked."],
    1: ["Still recoverable", "Feasible = 1. The box is free—the failure can still be undone."],
    2: ["Last chance", "Feasible = 1 at t*−1. One more push will pin the box to the wall."],
    3: ["Pivot step diagnosis", "“Up” pins the box against the wall. PIVOT extracts a 3-panel visual context [t*−1, t*, t*+1] to update policy weights without simulator resets."],
    4: ["Already unrecoverable", "Feasible = 0 after t*. Restoring one step late gives almost nothing back."],
    5: ["Terminal step T", "Vanilla GRPO still assigns one flat advantage; PIVOT already concentrated credit at t*."],
  };
  steps.forEach((chip) => {
    chip.addEventListener("click", () => {
      steps.forEach((other) => {
        other.classList.toggle("is-current", other === chip);
        other.setAttribute("aria-pressed", other === chip ? "true" : "false");
      });
      const pair = notes[chip.dataset.step];
      if (note && pair) note.innerHTML = `<strong>${pair[0]}.</strong> ${pair[1]}`;
    });
  });

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
