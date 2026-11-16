const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const themeColour = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let manualTheme = false;

try {
  const stored = localStorage.getItem("akshay-portfolio-theme");
  manualTheme = stored === "light" || stored === "dark";
} catch {
  // A manual choice still applies for this page visit.
}

function showTheme(theme) {
  root.dataset.theme = theme;
  themeButton.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
  themeColour.content = theme === "dark" ? "#17212c" : "#f6f8fa";
}

showTheme(root.dataset.theme || (systemTheme.matches ? "dark" : "light"));
themeButton.hidden = false;
themeButton.addEventListener("click", () => {
  const theme = root.dataset.theme === "dark" ? "light" : "dark";
  manualTheme = true;
  showTheme(theme);
  try {
    localStorage.setItem("akshay-portfolio-theme", theme);
  } catch {
    // A manual choice still applies for this page visit.
  }
});
systemTheme.addEventListener("change", ({ matches }) => {
  if (!manualTheme) showTheme(matches ? "dark" : "light");
});

const header = document.querySelector(".header");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".header-nav");
const navLinks = [...nav.querySelectorAll("a")];
const mobileLayout = window.matchMedia("(max-width: 840px)");

function setMenu(open) {
  nav.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

header.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) setMenu(false);
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!mobileLayout.matches) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    setMenu(false);
    if (location.hash !== link.hash) history.pushState(null, "", link.hash);
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
    target.scrollIntoView();
  });
});

mobileLayout.addEventListener("change", () => setMenu(false));
menuButton.hidden = false;
root.dataset.enhanced = "true";

const filters = document.querySelector(".publication-filters");
const publications = [...document.querySelectorAll(".publication")];
const status = document.querySelector("#publication-status");

filters.hidden = false;
filters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  const type = button.dataset.filter;
  filters.querySelectorAll("button").forEach((item) => {
    item.setAttribute("aria-pressed", String(item === button));
  });
  let count = 0;
  publications.forEach((publication) => {
    publication.hidden = type !== "all" && publication.dataset.type !== type;
    if (!publication.hidden) count += 1;
  });
  status.textContent = count + (count === 1 ? " publication shown" : " publications shown");
});

const sections = navLinks.map((link) => document.querySelector(link.hash));

function highlightSection() {
  const readingLine = header.getBoundingClientRect().bottom + 85;
  const active = sections.find((section) => {
    const box = section.getBoundingClientRect();
    return box.top <= readingLine && box.bottom > readingLine;
  });
  navLinks.forEach((link) => {
    if (active && link.hash === "#" + active.id) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

let framePending = false;
function scheduleHighlight() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(() => {
    framePending = false;
    highlightSection();
  });
}

window.addEventListener("scroll", scheduleHighlight, { passive: true });
window.addEventListener("resize", scheduleHighlight);
highlightSection();

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add("visible");
      observer.unobserve(target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".section-heading, .education, .contact-panel").forEach((element) => {
    if (element.getBoundingClientRect().top <= window.innerHeight) return;
    element.classList.add("reveal");
    observer.observe(element);
  });
}

