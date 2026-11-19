// Only the island document references this loader; the standard route loads no game code.
(function () {
  "use strict";
  const entry = new URL("../", document.currentScript.src);
  const routes = window.PortfolioRoutes;
  const data = window.PortfolioData;
  const current = new URL(location.href).pathname;
  if (current !== entry.pathname && current !== new URL("index.html", entry).pathname) return;

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Script unavailable: " + source));
      document.head.appendChild(script);
    });
  }

  // Populate navigation before any network request or WebGL initialization.
  if (data && routes) {
    document.getElementById("island-back").href = routes.root;
    const cv = document.getElementById("island-cv");
    cv.href = routes.asset(data.cv.href);
    cv.download = data.cv.filename;
    document.getElementById("island-contact").href = `mailto:${data.profile.email}`;
    document.getElementById("island-profile-tagline").textContent = data.profile.tagline;
    document.getElementById("island-recruitment").textContent = data.recruitment.cta;
    document.title = `${data.profile.name} — Sky Island Portfolio`;
  }

  window.PortfolioIslandReady = (async () => {
    try {
      if (!data || !routes) throw new Error("Shared portfolio setup unavailable");
      document.querySelector("#mirror h1").textContent = data.profile.name;
      await loadScript(new URL("vendor/three-r128.min.js", entry).href);
      for (const file of ["courses.js", "content.js", "world.js", "touch.js", "game.js", "main.js"]) {
        await loadScript(new URL("js/" + file, entry).href);
      }
    } catch (error) {
      console.error(error);
      document.getElementById("loading")?.remove();
      const box = document.createElement("div");
      box.id = "fatal";
      box.setAttribute("role", "alert");
      const message = document.createElement("p");
      message.textContent = "Le monde 3D est indisponible. Vous pouvez consulter le portfolio classique.";
      const back = document.createElement("a");
      back.href = document.getElementById("island-back").href;
      back.textContent = "Retour au portfolio";
      box.append(message, back);
      document.body.appendChild(box);
    }
  })();
})();
