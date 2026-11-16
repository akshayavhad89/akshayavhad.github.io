(() => {
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  let selected;
  try {
    selected = localStorage.getItem("akshay-portfolio-theme");
  } catch {
    // The page also works when storage is disabled.
  }
  const theme = selected === "dark" || selected === "light" ? selected : (system.matches ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
})();

