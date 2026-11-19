// Shared input state. Desktop uses the keyboard (keys); touch devices get an on-screen joystick and buttons.
(function setupInput() {
  const input = {
    keys: {},
    stick: { x: 0, y: 0, active: false },
    jump: false,
    superJump: false,
    rotate: 0,
    coarse: (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) || "ontouchstart" in window
  };
  window.PortfolioInput = input;
  if (!input.coarse) return;

  document.body.classList.add("touch");
  const ui = document.getElementById("ui");
  ui.insertAdjacentHTML("beforeend",
    '<div id="stick"><i id="knob"></i></div>' +
    '<div id="pad"><button id="jumpBtn" aria-label="Sauter">⤒<small>SAUT</small></button><button id="superBtn" aria-label="Super saut">⇪<small>SUPER</small></button></div>' +
    '<div id="turn"><button id="turnL" aria-label="Tourner à gauche">⟲</button><button id="turnR" aria-label="Tourner à droite">⟳</button></div>');

  const heldButtons = new Map();
  function updateButtons() {
    const held = new Set(heldButtons.values());
    input.jump = held.has("jumpBtn") || held.has("superBtn");
    input.superJump = held.has("superBtn");
    input.rotate = Number(held.has("turnL")) - Number(held.has("turnR"));
  }
  for (const id of ["jumpBtn", "superBtn", "turnL", "turnR"]) {
    const element = document.getElementById(id);
    element.addEventListener("pointerdown", event => {
      event.preventDefault();
      element.setPointerCapture(event.pointerId);
      heldButtons.set(event.pointerId, id);
      updateButtons();
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      element.addEventListener(type, event => {
        if (heldButtons.delete(event.pointerId)) updateButtons();
      });
    }
  }

  const stick = document.getElementById("stick");
  const knob = document.getElementById("knob");
  let stickPointer = null;
  function moveStick(event) {
    const box = stick.getBoundingClientRect();
    const radius = box.width / 2;
    let dx = event.clientX - (box.left + radius);
    let dy = event.clientY - (box.top + radius);
    const length = Math.hypot(dx, dy);
    if (length > radius) { dx = dx / length * radius; dy = dy / length * radius; }
    input.stick.x = dx / radius;
    input.stick.y = dy / radius;
    input.stick.active = Math.hypot(input.stick.x, input.stick.y) > .12;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  }
  function releaseStick(event) {
    if (event.pointerId !== stickPointer) return;
    stickPointer = null;
    input.stick.x = input.stick.y = 0;
    input.stick.active = false;
    knob.style.transform = "";
  }
  stick.addEventListener("pointerdown", event => {
    if (stickPointer !== null) return;
    event.preventDefault();
    stickPointer = event.pointerId;
    stick.setPointerCapture(event.pointerId);
    moveStick(event);
  });
  stick.addEventListener("pointermove", event => { if (event.pointerId === stickPointer) moveStick(event); });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => stick.addEventListener(type, releaseStick));

  // Restrict game gesture suppression to the canvas/controls, preserving HUD links and popup scrolling.
  const isGameTarget = target => target.closest("#cv, #ui");
  ["gesturestart", "gesturechange", "dblclick", "contextmenu"].forEach(type => document.addEventListener(type, event => {
    if (isGameTarget(event.target)) event.preventDefault();
  }));
  document.addEventListener("touchmove", event => {
    if (isGameTarget(event.target)) event.preventDefault();
  }, { passive: false });
})();
