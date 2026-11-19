// Resolve against this script rather than the domain: supports GitHub Pages project sites.
(function () {
  "use strict";
  const root = new URL("../", document.currentScript.src);
  // A local folder opens a directory listing, so name the HTML file explicitly.
  const page = root.protocol === "file:" ? "index.html" : "";
  window.PortfolioRoutes = Object.freeze({
    root: new URL(page, root).href,
    island: new URL("island/" + page, root).href,
    asset: path => new URL(path, root).href
  });
})();
