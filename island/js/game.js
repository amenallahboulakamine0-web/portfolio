function startGame(THREE, CONFIG, HOLES, world) {
  const $ = id => document.getElementById(id);
  const {
    courseWidth: COURSE_WIDTH,
    courseHeight: COURSE_HEIGHT,
    courseBorder: COURSE_BORDER,
    ballRadius: BALL_RADIUS,
    cupRadius: CUP_RADIUS,
    maxShotSpeed: MAX_SHOT_SPEED,
    maxShotPull: MAX_SHOT_PULL,
    restitution: RESTITUTION,
    progressKey: PROGRESS_KEY,
    islandWidth: ISLAND_WIDTH,
    islandHeight: ISLAND_HEIGHT,
    islandCenterX: ISLAND_CENTER_X,
    islandCenterZ: ISLAND_CENTER_Z,
    spawnX: SPAWN_X,
    spawnZ: SPAWN_Z,
    hillLayers: HILL_LAYERS,
    hillStep: HILL_STEP
  } = CONFIG;
  const {
    cv,
    renderer,
    scene,
    camera,
    ray,
    golfPlane,
    groundPlane,
    hitPoint,
    water,
    sway,
    floors,
    flags,
    platforms,
    movers,
    robot,
    characters,
    easterEgg,
    avatar,
    legs,
    leftArm,
    rightArm,
    golfBall,
    teeBalls,
    shotDots,
    sun,
    isBlocked
  } = world;

  const completedHoles = loadProgress();
  const input = window.PortfolioInput;
  const keys = input.keys;
  const pointers = new Map();
  let currentHole = 0;
  let golfBallState = { x: 0, y: 0, vx: 0, vy: 0 };
  let ballMoving = false;
  let ballSunk = false;
  let sinkProgress = 0;
  let sinkStart = null;
  let dragPosition = null;
  let animationTime = 0;
  let walkingBlend = 0;
  let overlayOpen = false;
  let overlayKind = "";
  let started = false;
  let ready = false;
  let mode = "explore";
  let autoRotate = false;
  let playerHeight = 0;
  let playerVerticalSpeed = 0;
  let onGround = true;
  let jumpCooldown = 0;
  let easterEggFound = hasFoundEasterEgg();
  let targetPosition = null;
  let aiming = false;
  let pointerMovement = 0;
  let pinchDistance = 0;
  let lastFrameTime = 0;
  let frame = 0;
  let lastSafe = { x: 0, y: 0 };
  let toastTimer = 0;
  let loadingHidden = false;
  let lastHint = "";

  const explorerCamera = { theta: 0, phi: .3, distance: 4300, x: 2520, y: -100, z: 1890 };
  const currentCamera = { ...explorerCamera };
  const golfCamera = { theta: 0, phi: .7, distance: 240, x: 0, y: 0, z: 0 };
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const angleDifference = (from, to) => ((to - from + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  const ballSpeed = () => Math.hypot(golfBallState.vx, golfBallState.vy);

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY));
      if (Array.isArray(saved) && saved.length === HOLES.length) return saved.map(Boolean);
    } catch (error) {
      // Storage may be unavailable for local or restricted pages.
    }
    return Array(HOLES.length).fill(false);
  }

  function hasFoundEasterEgg() {
    try {
      return localStorage.getItem(`${PROGRESS_KEY}_egg`) === "1";
    } catch (error) {
      return false;
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(completedHoles));
    } catch (error) {
      // Progress remains available for the current session if storage is blocked.
    }
  }

  function hillOffset(hole, x, y) {
    let height = 0;
    for (const hill of hole.hills) {
      const distance = Math.hypot(x - hill.x, y - hill.y);
      HILL_LAYERS.forEach((factor, layer) => {
        if (distance < hill.r * factor) height = Math.max(height, (layer + 1) * HILL_STEP);
      });
    }
    return height;
  }

  function ballWorldPosition(x = golfBallState.x, y = golfBallState.y) {
    const hole = HOLES[currentHole];
    return {
      x: hole.origin[0] + x,
      y: hole.groundY + 2 + BALL_RADIUS + hillOffset(hole, x, y),
      z: hole.origin[1] + y
    };
  }

  function moverRect(mover) {
    const t = .5 + .5 * Math.sin(animationTime * mover.speed + mover.phase);
    const position = mover.from + (mover.to - mover.from) * t;
    return mover.axis === "x" ? [position, mover.y, mover.w, mover.h] : [mover.x, position, mover.w, mover.h];
  }

  const insideRect = (rect, x, y) => x >= rect[0] && x <= rect[0] + rect[2] && y >= rect[1] && y <= rect[1] + rect[3];

  function isFallen(hole, x, y) {
    return hole.hazards.some(rect => insideRect(rect, x, y)) || (hole.safe !== null && !hole.safe.some(rect => insideRect(rect, x, y)));
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("on"), 2600);
  }

  function resetBall(index) {
    currentHole = index;
    const hole = HOLES[index];
    golfBallState = { x: hole.tee[0], y: hole.tee[1], vx: 0, vy: 0 };
    lastSafe = { x: hole.tee[0], y: hole.tee[1] };
    ballMoving = false;
    ballSunk = false;
    sinkProgress = 0;
    dragPosition = null;
    golfPlane.constant = -(hole.groundY + 2);
  }

  function nearestHole() {
    let index = 0;
    let distance = Infinity;
    HOLES.forEach((hole, holeIndex) => {
      const holeDistance = Math.hypot(
        explorerCamera.x - (hole.origin[0] + COURSE_WIDTH / 2),
        explorerCamera.z - (hole.origin[1] + COURSE_HEIGHT / 2)
      );
      if (holeDistance < distance) {
        distance = holeDistance;
        index = holeIndex;
      }
    });
    return { index, distance };
  }

  function aimGolfCamera() {
    const hole = HOLES[currentHole];
    golfCamera.theta = Math.atan2(
      -(hole.cup[0] - golfBallState.x),
      -(hole.cup[1] - golfBallState.y)
    );
    golfCamera.phi = .7;
    golfCamera.distance = 240;
  }

  function setMode(nextMode) {
    mode = nextMode;
    $("gb").classList.toggle("on", mode === "golf");
    document.body.classList.toggle("golf-mode", mode === "golf");
    if (mode === "golf") {
      aimGolfCamera();
      return;
    }
    const position = ballWorldPosition();
    explorerCamera.x = position.x;
    explorerCamera.z = position.z;
    explorerCamera.y = 14;
    explorerCamera.distance = clamp(explorerCamera.distance, 380, 800);
    targetPosition = null;
  }

  function playHole(index) {
    resetBall(index);
    setMode("golf");
  }

  function toggleGolfMode() {
    if (!ready || overlayOpen) return;
    if (mode === "golf") {
      setMode("explore");
      return;
    }
    const { index, distance } = nearestHole();
    const hole = HOLES[index];
    if (distance <= COURSE_WIDTH * .8) {
      playHole(index);
      return;
    }
    targetPosition = { x: hole.origin[0] - 60, z: hole.origin[1] + COURSE_HEIGHT / 2 };
    showToast(`Trou le plus proche : ${hole.title} (~${Math.round(distance / 10)} m) · marche automatique`);
  }

  function updateCamera(deltaTime) {
    const targetCamera = mode === "golf" ? golfCamera : explorerCamera;
    const fit = camera.aspect < 1 ? Math.min(1.9, .8 / camera.aspect) : 1;
    if (mode === "golf") {
      const position = ballWorldPosition();
      golfCamera.x = position.x;
      golfCamera.y = position.y;
      golfCamera.z = position.z;
    } else if (autoRotate && ready) {
      explorerCamera.theta += deltaTime * .05;
    }

    const easing = 1 - Math.exp(-deltaTime * (mode === "golf" ? 5 : 3));
    currentCamera.theta += angleDifference(currentCamera.theta, targetCamera.theta) * easing;
    currentCamera.phi += (targetCamera.phi - currentCamera.phi) * easing;
    currentCamera.distance += (targetCamera.distance - currentCamera.distance) * easing;
    currentCamera.x += (targetCamera.x - currentCamera.x) * easing;
    currentCamera.y += (targetCamera.y - currentCamera.y) * easing;
    currentCamera.z += (targetCamera.z - currentCamera.z) * easing;

    camera.position.set(
      currentCamera.x + currentCamera.distance * fit * Math.sin(currentCamera.theta) * Math.cos(currentCamera.phi),
      currentCamera.y + currentCamera.distance * fit * Math.sin(currentCamera.phi),
      currentCamera.z + currentCamera.distance * fit * Math.cos(currentCamera.theta) * Math.cos(currentCamera.phi)
    );
    camera.lookAt(currentCamera.x, currentCamera.y, currentCamera.z);
  }

  function showOverlay(html, kind = "") {
    const overlay = $("ov");
    overlay.innerHTML = `<div class="box">${html}</div>`;
    overlay.classList.add("on");
    overlayOpen = true;
    overlayKind = kind;
    dragPosition = null;
  }

  function hideOverlay() {
    $("ov").classList.remove("on");
    $("ov").innerHTML = "";
    overlayOpen = false;
    if (overlayKind === "sink") {
      const holeIndex = currentHole;
      resetBall(holeIndex);
      setMode("explore");
    }
    overlayKind = "";
  }

  function finishHole() {
    completedHoles[currentHole] = true;
    saveProgress();
    flags[currentHole].material.color.setHex(0x3ddc84);
    showOverlay(
      `<div class="kick">Zone découverte</div>${HOLES[currentHole].html}<div class="acts"><button class="btn" data-act="close">Continuer l'exploration</button></div>`,
      "sink"
    );
  }

  function showHole(index) {
    showOverlay(
      `<div class="kick">Zone</div>${HOLES[index].html}<div class="acts"><button class="btn" data-act="play" data-i="${index}">Rejouer</button><button class="btn g" data-act="close">Fermer</button></div>`,
      "view"
    );
  }

  function showEasterEgg() {
    easterEggFound = true;
    try {
      localStorage.setItem(`${PROGRESS_KEY}_egg`, "1");
    } catch (error) {
      // Finding the easter egg still works for the current session.
    }
    showOverlay(
      `<div class="kick">Découverte rare</div><h2>Bien joué</h2><p>Tu as trouvé quelque chose qui n'était pas destiné à être trouvé.</p><div class="acts"><button class="btn" data-act="close">Fermer</button></div>`,
      "egg"
    );
  }

  function openExperience() {
    if (started) return;
    started = true;
    $("mirror").classList.add("up");
    $("ui").classList.add("on");
    autoRotate = false;
    explorerCamera.x = SPAWN_X;
    explorerCamera.z = SPAWN_Z;
    explorerCamera.y = 14;
    explorerCamera.distance = 560;
    explorerCamera.phi = .4;
    explorerCamera.theta = -.35;
    setTimeout(() => { ready = true; }, 1800);
  }

  function normalizedPointer(event) {
    const bounds = cv.getBoundingClientRect();
    return new THREE.Vector2(
      (event.clientX - bounds.left) / bounds.width * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    );
  }

  function golfPositionFromPointer(event) {
    ray.setFromCamera(normalizedPointer(event), camera);
    if (!ray.ray.intersectPlane(golfPlane, hitPoint)) return null;
    const hole = HOLES[currentHole];
    return { x: hitPoint.x - hole.origin[0], y: hitPoint.z - hole.origin[1] };
  }

  function moveExplorer(dx, dz) {
    const nextX = clamp(explorerCamera.x + dx, 40, ISLAND_WIDTH - 40);
    const nextZ = clamp(explorerCamera.z + dz, 40, ISLAND_HEIGHT - 40);
    if (!isBlocked(nextX, explorerCamera.z, playerHeight)) explorerCamera.x = nextX;
    if (!isBlocked(explorerCamera.x, nextZ, playerHeight)) explorerCamera.z = nextZ;
  }

  function beginPointer(event) {
    if (!ready || overlayOpen) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, button: event.button });
    pointerMovement = 0;
    autoRotate = false;
    try {
      cv.setPointerCapture(event.pointerId);
    } catch (error) {
      // Pointer capture is unavailable in a few embedded browser contexts.
    }

    if (pointers.size === 2) {
      aiming = false;
      dragPosition = null;
      const [first, second] = [...pointers.values()];
      pinchDistance = Math.hypot(first.x - second.x, first.y - second.y);
    } else if (mode === "golf" && event.button === 0 && !ballMoving && !ballSunk) {
      const position = golfPositionFromPointer(event);
      if (position) {
        aiming = true;
        dragPosition = position;
      }
    }
    event.preventDefault();
  }

  function movePointer(event) {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    const deltaX = event.clientX - pointer.x;
    const deltaY = event.clientY - pointer.y;
    pointerMovement += Math.abs(deltaX) + Math.abs(deltaY);

    if (pointers.size === 2) {
      const otherPointer = [...pointers.entries()].find(([id]) => id !== event.pointerId)[1];
      const distance = Math.hypot(event.clientX - otherPointer.x, event.clientY - otherPointer.y);
      const targetCamera = mode === "golf" ? golfCamera : explorerCamera;
      if (pinchDistance > 0) {
        targetCamera.distance = clamp(
          targetCamera.distance * pinchDistance / distance,
          mode === "golf" ? 120 : 300,
          mode === "golf" ? 700 : 4500
        );
      }
      pinchDistance = distance;

      if (mode === "golf") {
        targetCamera.theta -= deltaX * .004;
      } else {
        moveExplorer(
          -Math.cos(explorerCamera.theta) * deltaX * explorerCamera.distance / 900 * .5
            + Math.sin(explorerCamera.theta) * deltaY * explorerCamera.distance / 900 * .5,
          Math.sin(explorerCamera.theta) * deltaX * explorerCamera.distance / 900 * .5
            + Math.cos(explorerCamera.theta) * deltaY * explorerCamera.distance / 900 * .5
        );
      }
    } else if (aiming) {
      const position = golfPositionFromPointer(event);
      if (position) dragPosition = position;
    } else {
      const targetCamera = mode === "golf" ? golfCamera : explorerCamera;
      if (event.shiftKey || pointer.button === 2) {
        if (mode === "explore") {
          moveExplorer(
            -Math.cos(explorerCamera.theta) * deltaX * explorerCamera.distance / 900
              + Math.sin(explorerCamera.theta) * deltaY * explorerCamera.distance / 900,
            Math.sin(explorerCamera.theta) * deltaX * explorerCamera.distance / 900
              + Math.cos(explorerCamera.theta) * deltaY * explorerCamera.distance / 900
          );
        }
      } else {
        targetCamera.theta -= deltaX * .006;
        targetCamera.phi = clamp(targetCamera.phi + deltaY * .005, mode === "golf" ? .15 : .1, 1.5);
      }
    }

    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  function releasePointer(event, cancelled) {
    const pointer = pointers.get(event.pointerId);
    if (!pointer) return;
    pointers.delete(event.pointerId);
    pinchDistance = 0;

    if (aiming) {
      aiming = false;
      const position = dragPosition;
      dragPosition = null;
      if (!cancelled && position && !ballMoving && !ballSunk) {
        const deltaX = golfBallState.x - position.x;
        const deltaY = golfBallState.y - position.y;
        const length = Math.hypot(deltaX, deltaY);
        if (length >= 8) {
          const power = Math.min(length, MAX_SHOT_PULL) / MAX_SHOT_PULL;
          golfBallState.vx = deltaX / length * power * MAX_SHOT_SPEED;
          golfBallState.vy = deltaY / length * power * MAX_SHOT_SPEED;
          ballMoving = true;
        }
      }
      return;
    }

    if (!cancelled && pointerMovement < 6 && pointers.size === 0 && mode === "explore" && pointer.button === 0) {
      ray.setFromCamera(normalizedPointer(event), camera);
      const ballHit = ray.intersectObject(golfBall)[0];
      if (ballHit) {
        playHole(currentHole);
        return;
      }
      const floorHit = ray.intersectObjects(floors)[0];
      if (floorHit) {
        const holeIndex = floorHit.object.userData.hole;
        if (completedHoles[holeIndex]) showHole(holeIndex);
        else playHole(holeIndex);
      } else if (ray.ray.intersectPlane(groundPlane, hitPoint)) {
        targetPosition = { x: hitPoint.x, z: hitPoint.z };
      }
    }
  }

  function resolveBallHit(normalX, normalY, penetration, restitution = RESTITUTION) {
    golfBallState.x += normalX * penetration;
    golfBallState.y += normalY * penetration;
    const normalSpeed = golfBallState.vx * normalX + golfBallState.vy * normalY;
    if (normalSpeed < 0) {
      golfBallState.vx -= (1 + restitution) * normalSpeed * normalX;
      golfBallState.vy -= (1 + restitution) * normalSpeed * normalY;
    }
  }

  function collideBall() {
    const hole = HOLES[currentHole];
    const rectangles = hole.walls.slice();
    hole.movers.forEach(mover => rectangles.push(moverRect(mover)));

    for (const [x, y, width, height] of rectangles) {
      const closestX = Math.max(x, Math.min(golfBallState.x, x + width));
      const closestY = Math.max(y, Math.min(golfBallState.y, y + height));
      const deltaX = golfBallState.x - closestX;
      const deltaY = golfBallState.y - closestY;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;
      if (distanceSquared >= BALL_RADIUS * BALL_RADIUS) continue;

      if (distanceSquared > 1e-6) {
        const distance = Math.sqrt(distanceSquared);
        resolveBallHit(deltaX / distance, deltaY / distance, BALL_RADIUS - distance);
      } else {
        const left = golfBallState.x - x;
        const right = x + width - golfBallState.x;
        const top = golfBallState.y - y;
        const bottom = y + height - golfBallState.y;
        const nearest = Math.min(left, right, top, bottom);
        if (nearest === left) resolveBallHit(-1, 0, left + BALL_RADIUS);
        else if (nearest === right) resolveBallHit(1, 0, right + BALL_RADIUS);
        else if (nearest === top) resolveBallHit(0, -1, top + BALL_RADIUS);
        else resolveBallHit(0, 1, bottom + BALL_RADIUS);
      }
    }

    for (const [x, y, radius, bounce = 1] of hole.circles) {
      const deltaX = golfBallState.x - x;
      const deltaY = golfBallState.y - y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < radius + BALL_RADIUS) {
        resolveBallHit(distance ? deltaX / distance : 1, distance ? deltaY / distance : 0, radius + BALL_RADIUS - distance, RESTITUTION * bounce);
      }
    }

    if (golfBallState.x < COURSE_BORDER + BALL_RADIUS) {
      golfBallState.x = COURSE_BORDER + BALL_RADIUS;
      if (golfBallState.vx < 0) golfBallState.vx = -golfBallState.vx * RESTITUTION;
    }
    if (golfBallState.x > COURSE_WIDTH - COURSE_BORDER - BALL_RADIUS) {
      golfBallState.x = COURSE_WIDTH - COURSE_BORDER - BALL_RADIUS;
      if (golfBallState.vx > 0) golfBallState.vx = -golfBallState.vx * RESTITUTION;
    }
    if (golfBallState.y < COURSE_BORDER + BALL_RADIUS) {
      golfBallState.y = COURSE_BORDER + BALL_RADIUS;
      if (golfBallState.vy < 0) golfBallState.vy = -golfBallState.vy * RESTITUTION;
    }
    if (golfBallState.y > COURSE_HEIGHT - COURSE_BORDER - BALL_RADIUS) {
      golfBallState.y = COURSE_HEIGHT - COURSE_BORDER - BALL_RADIUS;
      if (golfBallState.vy > 0) golfBallState.vy = -golfBallState.vy * RESTITUTION;
    }
  }

  function stepBall(deltaTime) {
    const ramps = HOLES[currentHole].ramps;
    for (const ramp of ramps) {
      if (golfBallState.x >= ramp.x && golfBallState.x <= ramp.x + ramp.width
        && golfBallState.y >= ramp.y && golfBallState.y <= ramp.y + ramp.depth) {
        golfBallState.vx += ramp.direction[0] * ramp.strength * deltaTime;
        golfBallState.vy += ramp.direction[1] * ramp.strength * deltaTime;
      }
    }
    for (const hill of HOLES[currentHole].hills) {
      const offsetX = golfBallState.x - hill.x;
      const offsetY = golfBallState.y - hill.y;
      const distance = Math.hypot(offsetX, offsetY);
      if (distance < hill.r && distance > 1e-3) {
        const push = hill.strength * (1 - distance / hill.r) * deltaTime;
        golfBallState.vx += offsetX / distance * push;
        golfBallState.vy += offsetY / distance * push;
      }
    }
    golfBallState.x += golfBallState.vx * deltaTime;
    golfBallState.y += golfBallState.vy * deltaTime;
    const speed = ballSpeed();
    if (speed > 0) {
      const nextSpeed = Math.max(0, speed * Math.pow(.35, deltaTime) - 40 * deltaTime);
      const ratio = nextSpeed / speed;
      golfBallState.vx *= ratio;
      golfBallState.vy *= ratio;
    }
    collideBall();
    if (isFallen(HOLES[currentHole], golfBallState.x, golfBallState.y)) {
      golfBallState.x = lastSafe.x;
      golfBallState.y = lastSafe.y;
      golfBallState.vx = 0;
      golfBallState.vy = 0;
      ballMoving = false;
      showToast(HOLES[currentHole].safe ? "Dans le vide ! La balle revient à son dernier point." : "Plouf ! La balle revient à son dernier point.");
      return;
    }

    const cup = HOLES[currentHole].cup;
    const deltaX = cup[0] - golfBallState.x;
    const deltaY = cup[1] - golfBallState.y;
    const distance = Math.hypot(deltaX, deltaY);
    const speedAfterCollision = ballSpeed();
    if (distance < CUP_RADIUS + 2 && speedAfterCollision < 450) {
      ballSunk = true;
      sinkProgress = 0;
      sinkStart = { x: golfBallState.x, y: golfBallState.y };
      golfBallState.vx = 0;
      golfBallState.vy = 0;
      ballMoving = false;
    } else if (distance < CUP_RADIUS + 12 && speedAfterCollision < 240 && distance > 0) {
      golfBallState.vx += deltaX / distance * 500 * deltaTime;
      golfBallState.vy += deltaY / distance * 500 * deltaTime;
    }
  }

  function updateGolf(deltaTime) {
    if (ballSunk) {
      sinkProgress += deltaTime / .35;
      if (sinkProgress >= 1) {
        sinkProgress = 1;
        if (!overlayOpen) finishHole();
      }
      return;
    }
    if (ballMoving) {
      const substeps = Math.max(1, Math.ceil(ballSpeed() * deltaTime / 3));
      const stepDuration = deltaTime / substeps;
      for (let index = 0; index < substeps && ballMoving && !ballSunk; index++) stepBall(stepDuration);
      if (ballSpeed() < 14) {
        golfBallState.vx = 0;
        golfBallState.vy = 0;
        ballMoving = false;
        lastSafe = { x: golfBallState.x, y: golfBallState.y };
      }
    } else {
      collideBall();
    }
  }

  function groundHeightAt(x, z, heightLimit) {
    let groundHeight = 0;
    for (const platform of platforms) {
      if (Math.abs(x - platform.x) < platform.w / 2
        && Math.abs(z - platform.z) < platform.d / 2
        && platform.y > groundHeight
        && platform.y <= heightLimit) {
        groundHeight = platform.y;
      }
    }
    HOLES.forEach(hole => {
      if (Math.abs(x - (hole.origin[0] + COURSE_WIDTH / 2)) < COURSE_WIDTH / 2 + 40
        && Math.abs(z - (hole.origin[1] + COURSE_HEIGHT / 2)) < COURSE_HEIGHT / 2 + 40
        && hole.groundY + 2 > groundHeight
        && hole.groundY + 2 <= heightLimit) {
        groundHeight = hole.groundY + 2;
      }
    });
    return groundHeight;
  }

  function updatePlayer(deltaTime) {
    if (mode !== "explore" || !started) return;
    if (onGround) {
      playerHeight = groundHeightAt(explorerCamera.x, explorerCamera.z, playerHeight + 3);
      playerVerticalSpeed = 0;
    }
    if (jumpCooldown > 0) jumpCooldown -= deltaTime;
    if ((keys[" "] || keys.spacebar || input.jump) && onGround && jumpCooldown <= 0) {
      playerVerticalSpeed = (keys.shift || input.superJump) ? 300 : 160;
      onGround = false;
      jumpCooldown = .25;
    }
    playerVerticalSpeed -= 180 * deltaTime;
    const previousHeight = playerHeight;
    const nextHeight = previousHeight + playerVerticalSpeed * deltaTime;
    const groundHeight = groundHeightAt(explorerCamera.x, explorerCamera.z, previousHeight + 3);
    if (playerVerticalSpeed <= 0 && previousHeight >= groundHeight && nextHeight <= groundHeight) {
      playerHeight = groundHeight;
      playerVerticalSpeed = 0;
      onGround = true;
    } else {
      playerHeight = nextHeight;
      onGround = false;
    }
    $("jumpbar").style.opacity = onGround ? 0 : 1;
    $("jumpfill").style.width = `${clamp((playerHeight - groundHeight) / 120, 0, 1) * 100}%`;

    if (!easterEggFound
      && Math.hypot(explorerCamera.x - easterEgg.position.x, explorerCamera.z - easterEgg.position.z) < 40
      && Math.abs(playerHeight - easterEgg.position.y) < 40) {
      showEasterEgg();
    }
  }

  function updateExplorer(deltaTime) {
    const movementSpeed = 640 * deltaTime * (explorerCamera.distance / 1500 + .3);
    let forward = 0;
    let right = 0;
    let deltaX = 0;
    let deltaZ = 0;
    if (keys.w || keys.arrowup || keys.z) forward = 1;
    if (keys.s || keys.arrowdown) forward = -1;
    if (keys.d || keys.arrowright) right = 1;
    if (keys.a || keys.arrowleft || keys.q) right = -1;
    if (input.stick.active) {
      forward = -input.stick.y;
      right = input.stick.x;
    }

    if (forward || right) {
      targetPosition = null;
      deltaX = -Math.sin(explorerCamera.theta) * forward + Math.cos(explorerCamera.theta) * right;
      deltaZ = -Math.cos(explorerCamera.theta) * forward - Math.sin(explorerCamera.theta) * right;
    } else if (targetPosition) {
      const targetX = targetPosition.x - explorerCamera.x;
      const targetZ = targetPosition.z - explorerCamera.z;
      const length = Math.hypot(targetX, targetZ);
      if (length < 14) targetPosition = null;
      else {
        deltaX = targetX / length;
        deltaZ = targetZ / length;
      }
    }

    const isMoving = deltaX || deltaZ;
    if (isMoving) {
      autoRotate = false;
      const previousX = explorerCamera.x;
      const previousZ = explorerCamera.z;
      moveExplorer(deltaX * movementSpeed, deltaZ * movementSpeed);
      if (Math.abs(explorerCamera.x - previousX) + Math.abs(explorerCamera.z - previousZ) < 1e-3) targetPosition = null;
      avatar.rotation.y += angleDifference(avatar.rotation.y, Math.atan2(deltaX, deltaZ)) * Math.min(1, deltaTime * 10);
    }

    walkingBlend += ((isMoving ? 1 : 0) - walkingBlend) * Math.min(1, deltaTime * 10);
    legs[0].rotation.x = Math.sin(animationTime * 11) * .8 * walkingBlend;
    legs[1].rotation.x = -legs[0].rotation.x;
    leftArm.rotation.x = -legs[0].rotation.x * .7;
    rightArm.rotation.x = -legs[1].rotation.x * .7;
  }

  function updateGolfWhenActive(deltaTime) {
    if (!overlayOpen || ballSunk && sinkProgress < 1) updateGolf(deltaTime);
  }

  function updateDecorVisibility() {
    sway.forEach(tree => {
      tree.visible = Math.hypot(tree.position.x - camera.position.x, tree.position.z - camera.position.z) < 2600;
    });
  }

  function updateMovingObjects(deltaTime) {
    movers.forEach(({ hole: holeIndex, mover, mesh }) => {
      const hole = HOLES[holeIndex];
      const [x, y, width, height] = moverRect(mover);
      mesh.position.set(hole.origin[0] + x + width / 2, hole.groundY + 10, hole.origin[1] + y + height / 2);
    });

    if (frame % 12 === 0) updateDecorVisibility();
    sway.forEach(tree => {
      if (!tree.visible) return;
      tree.rotation.z = Math.sin(animationTime * 1.2 + tree.userData.phase) * .025;
      tree.rotation.x = Math.cos(animationTime + tree.userData.phase) * .02;
    });
    robot.userData.head.rotation.y = Math.sin(animationTime * 1.3) * .5;
    robot.position.y = Math.sin(animationTime * 2) * 1.2;
    characters.forEach((character, index) => {
      character.position.y = Math.sin(animationTime * 1.2 + index * 2) * .6;
    });
    easterEgg.rotation.y += deltaTime * 1.5;
    easterEgg.position.y = easterEgg.userData.baseY + Math.sin(animationTime * 2) * 3;
    sun.target.position.set(currentCamera.x, 0, currentCamera.z);
    sun.position.set(currentCamera.x + 700 + Math.sin(animationTime * .05) * 300, 1000, currentCamera.z + 1500);
    water.material.opacity = .75 + .06 * Math.sin(animationTime * 1.5);
  }

  function updateGolfVisuals() {
    const hole = HOLES[currentHole];
    let x = golfBallState.x;
    let y = golfBallState.y;
    let scale = 1;
    if (ballSunk) {
      x = sinkStart.x + (hole.cup[0] - sinkStart.x) * sinkProgress;
      y = sinkStart.y + (hole.cup[1] - sinkStart.y) * sinkProgress;
      scale = 1 - .9 * sinkProgress;
    }
    const position = ballWorldPosition(x, y);
    golfBall.scale.setScalar(scale);
    golfBall.position.set(position.x, position.y - BALL_RADIUS * (1 - scale), position.z);
    teeBalls.forEach((teeBall, index) => { teeBall.visible = index !== currentHole; });
  }

  function updateShotPreview() {
    shotDots.forEach(dot => { dot.visible = false; });
    let power = 0;
    if (aiming && dragPosition && !ballMoving && !ballSunk) {
      const deltaX = golfBallState.x - dragPosition.x;
      const deltaY = golfBallState.y - dragPosition.y;
      const length = Math.hypot(deltaX, deltaY);
      if (length >= 8) {
        power = Math.min(length, MAX_SHOT_PULL) / MAX_SHOT_PULL;
        const directionX = deltaX / length;
        const directionY = deltaY / length;
        const dotCount = Math.ceil(power * 14);
        for (let index = 0; index < dotCount; index++) {
          const position = ballWorldPosition(
            golfBallState.x + directionX * (18 + index * 10),
            golfBallState.y + directionY * (18 + index * 10)
          );
          shotDots[index].visible = true;
          shotDots[index].position.set(position.x, position.y - 1, position.z);
          shotDots[index].material.color.setHSL((1 - power) / 3, .85, .58);
        }
      }
    }
    $("pwi").style.width = `${power * 100}%`;
    $("pwb").style.opacity = power > 0 ? 1 : 0;
  }

  function updateHint() {
    const touch = input.coarse;
    let text = "";
    if (ready && !overlayOpen) {
      if (mode === "golf") {
        text = touch ? "GLISSEZ POUR VISER · RELÂCHEZ POUR TIRER · ◀ ▶ POUR TOURNER" : "GLISSEZ · RELÂCHEZ POUR TIRER · Q/E POUR TOURNER · ⛳ POUR SORTIR";
      } else {
        const { index, distance } = nearestHole();
        if (distance <= COURSE_WIDTH * .8) text = `${touch ? "⛳" : "G / ⛳"} POUR JOUER : ${HOLES[index].title.toUpperCase()}`;
        else text = touch ? "JOYSTICK POUR MARCHER · SAUT / SUPER SAUT · GLISSER POUR REGARDER" : "WASD MARCHER · ESPACE SAUTER · SHIFT+ESPACE SUPER SAUT · SOURIS REGARDER";
      }
    }
    if (text !== lastHint) {
      lastHint = text;
      $("hint").textContent = text;
    }
  }

  function drawFrame(deltaTime) {
    if (mode === "explore") {
      updateExplorer(deltaTime);
    } else {
      const turn = (keys.q ? 1 : 0) - (keys.e ? 1 : 0) + input.rotate;
      golfCamera.theta += turn * deltaTime * 1.6;
    }

    updatePlayer(deltaTime);
    explorerCamera.y = playerHeight + 14;
    avatar.visible = mode === "explore" && started;
    const onCentralDeck = Math.abs(explorerCamera.x - ISLAND_CENTER_X) < 110 && Math.abs(explorerCamera.z - ISLAND_CENTER_Z) < 60;
    avatar.position.set(explorerCamera.x, playerHeight + (onCentralDeck ? 4 : 0), explorerCamera.z);
    updateMovingObjects(deltaTime);
    updateGolfVisuals();
    updateCamera(deltaTime);
    updateShotPreview();
    updateHint();
    renderer.shadowMap.needsUpdate = frame % 2 === 0;
    renderer.render(scene, camera);
  }

  function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);
    frame++;
    const deltaTime = Math.min(Math.max((timestamp - lastFrameTime) / 1000, 0), 1 / 30);
    lastFrameTime = timestamp;
    animationTime += deltaTime;
    updateGolfWhenActive(deltaTime);
    drawFrame(deltaTime);
    if (!loadingHidden) {
      loadingHidden = true;
      const loading = $("loading");
      if (loading) loading.remove();
    }
  }

  function handleClick(event) {
    if (!event.target || !event.target.closest) return;
    if (event.target.closest("#mirror")) {
      openExperience();
      return;
    }
    if (event.target.closest("#gb")) {
      toggleGolfMode();
      return;
    }
    const button = event.target.closest("[data-act]");
    if (!button) return;
    if (button.dataset.act === "close") hideOverlay();
    else if (button.dataset.act === "play") {
      hideOverlay();
      playHole(+button.dataset.i);
    }
  }

  function handleKeyDown(event) {
    if (event.target.closest("#island-hud, #ov a, #ov button")) return;
    const key = event.key.toLowerCase();
    keys[key] = true;
    if (!started && (key === "enter" || key === " ")) {
      openExperience();
      return;
    }
    if (key === "escape") hideOverlay();
    else if (key === "g" && !event.repeat) toggleGolfMode();
    if (key === " " || key.startsWith("arrow")) event.preventDefault();
  }

  function handleKeyUp(event) {
    keys[event.key.toLowerCase()] = false;
  }

  function handleMouseMove(event) {
    const panel = document.querySelector(".panel");
    if (!started && panel) {
      panel.style.setProperty("--ry", `${(event.clientX / innerWidth - .5) * 10}deg`);
      panel.style.setProperty("--rx", `${-(event.clientY / innerHeight - .5) * 8}deg`);
    }
  }

  cv.addEventListener("contextmenu", event => event.preventDefault());
  cv.addEventListener("pointerdown", beginPointer);
  cv.addEventListener("pointermove", movePointer);
  cv.addEventListener("pointerup", event => releasePointer(event, false));
  cv.addEventListener("pointercancel", event => releasePointer(event, true));
  cv.addEventListener("wheel", event => {
    if (!ready || overlayOpen) return;
    event.preventDefault();
    autoRotate = false;
    const targetCamera = mode === "golf" ? golfCamera : explorerCamera;
    targetCamera.distance = clamp(
      targetCamera.distance * (1 + Math.sign(event.deltaY) * .1),
      mode === "golf" ? 120 : 300,
      mode === "golf" ? 700 : 4500
    );
  }, { passive: false });
  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", () => {
    for (const key of Object.keys(keys)) delete keys[key];
  });
  document.addEventListener("mousemove", handleMouseMove);

  completedHoles.forEach((isComplete, index) => {
    if (isComplete) flags[index].material.color.setHex(0x3ddc84);
  });
  resetBall(0);
  setTimeout(openExperience, 7000);
  requestAnimationFrame(gameLoop);
}

window.PortfolioGame = { startGame };
