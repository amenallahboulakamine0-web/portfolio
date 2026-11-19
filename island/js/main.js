(function startPortfolio() {
  function showFatal(message) {
    const box = document.createElement("div");
    box.id = "fatal";
    box.textContent = message;
    document.body.appendChild(box);
    const loading = document.getElementById("loading");
    if (loading) loading.remove();
  }

  try {
    const { HOLES, WORLD } = window.PortfolioContent;
    const { createWorld } = window.PortfolioWorld;
    const { startGame } = window.PortfolioGame;
    const THREE = window.THREE;

    if (!THREE) throw new Error("Three.js did not load.");

    const world = createWorld(THREE, WORLD, HOLES);
    world.cv.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      showFatal("Le rendu 3D a été interrompu. Rechargez la page.");
    });
    startGame(THREE, WORLD, HOLES, world);
  } catch (error) {
    console.error(error);
    showFatal("Impossible de démarrer le monde 3D (WebGL requis). Rechargez la page ou essayez un autre navigateur.");
  }
})();
