function createWorld(THREE, CONFIG, HOLES) {
  const {
    courseWidth: CW,
    courseHeight: CH,
    ballRadius: R,
    islandWidth: IW,
    islandHeight: IH,
    islandCenterX: RX,
    islandCenterZ: BZ,
    spawnX: SPX,
    spawnZ: SPZ,
    courseOrigins: O,
    hillLayers: HILL_LAYERS,
    hillStep: HILL_STEP
  } = CONFIG;
  const $ = id => document.getElementById(id);
  const cv = $("cv");
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1.6, 1, 12000);
  const world = new THREE.Group();
  const ray = new THREE.Raycaster();
  const golfPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2);
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hitPoint = new THREE.Vector3();
  const sway = [];
  const floors = [];
  const flags = [];
  const platforms = [];
  const obstacles = [];
  let randomSeed = 11;

  function resize() {
    const width = window.innerWidth || 800;
    const height = window.innerHeight || 500;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function makeCanvasTexture(width, height, draw) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext("2d"), width, height);
    return new THREE.CanvasTexture(canvas);
  }

  const materials = {};
  const material = (color, emissive = false) => {
    const key = `${color}_${emissive ? 1 : 0}`;
    return materials[key] || (materials[key] = new THREE.MeshStandardMaterial({
      color,
      roughness: .8,
      emissive: emissive ? color : 0,
      emissiveIntensity: emissive ? .5 : 0
    }));
  };
  const BoxGeometry = THREE.BoxGeometry;
  const UNIT_BOX = new BoxGeometry(1, 1, 1);
  const UNIT_CYLINDER = new THREE.CylinderGeometry(1, 1, 1, 14);
  const staticBuckets = new Map();

  function addBox(width, height, depth, color, x, y, z, emissive = false) {
    const mesh = new THREE.Mesh(UNIT_BOX, Array.isArray(color) ? color : material(color, emissive));
    mesh.scale.set(width, height, depth);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    world.add(mesh);
    return mesh;
  }

  // Static boxes are grouped by material and 700-unit chunk, then merged into one mesh per group.
  function addStatic(width, height, depth, color, x, y, z, emissive = false) {
    if (Array.isArray(color)) return addBox(width, height, depth, color, x, y, z, emissive);
    const key = `${color}|${emissive ? 1 : 0}|${Math.floor(x / 700)}|${Math.floor(z / 700)}`;
    let bucket = staticBuckets.get(key);
    if (!bucket) staticBuckets.set(key, bucket = { color, emissive, boxes: [] });
    bucket.boxes.push([width, height, depth, x, y, z]);
    return null;
  }

  function flushStatic() {
    const basePositions = UNIT_BOX.attributes.position.array;
    const baseNormals = UNIT_BOX.attributes.normal.array;
    const baseIndex = UNIT_BOX.index.array;
    staticBuckets.forEach(({ color, emissive, boxes }) => {
      const positions = new Float32Array(boxes.length * 72);
      const normals = new Float32Array(boxes.length * 72);
      const indices = new Uint32Array(boxes.length * 36);
      boxes.forEach(([width, height, depth, x, y, z], box) => {
        for (let vertex = 0; vertex < 24; vertex++) {
          const at = box * 72 + vertex * 3;
          positions[at] = basePositions[vertex * 3] * width + x;
          positions[at + 1] = basePositions[vertex * 3 + 1] * height + y;
          positions[at + 2] = basePositions[vertex * 3 + 2] * depth + z;
          normals[at] = baseNormals[vertex * 3];
          normals[at + 1] = baseNormals[vertex * 3 + 1];
          normals[at + 2] = baseNormals[vertex * 3 + 2];
        }
        for (let k = 0; k < 36; k++) indices[box * 36 + k] = baseIndex[k] + box * 24;
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      geometry.computeBoundingSphere();
      const mesh = new THREE.Mesh(geometry, material(color, emissive));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      world.add(mesh);
    });
    staticBuckets.clear();
  }

  function random() {
    randomSeed = randomSeed * 16807 % 2147483647;
    return randomSeed / 2147483647;
  }

  function isBlocked(x, z, playerHeight = 0) {
    return (Math.abs(x - RX) < 80 && Math.abs(z - BZ) > 60 && playerHeight < 40)
      || obstacles.some(obstacle =>
        Math.abs(x - obstacle.x) < obstacle.halfWidth
        && Math.abs(z - obstacle.z) < obstacle.halfDepth
        && playerHeight < obstacle.topY
      );
  }

  function addCollisionArea(x, z, halfWidth, halfDepth, topY = Infinity) {
    obstacles.push({ x, z, halfWidth, halfDepth, topY });
  }

  const isNearCourse = (x, z, margin) => O.some(([originX, originZ]) =>
    x > originX - margin
      && x < originX + CW + margin
      && z > originZ - margin
      && z < originZ + CH + margin
  );

  const overlapsCourseSafety = (x, z, halfWidth, halfDepth) => O.some(([originX, originZ]) =>
    x + halfWidth > originX - 44
      && x - halfWidth < originX + CW + 44
      && z + halfDepth > originZ - 44
      && z - halfDepth < originZ + CH + 44
  );

  window.addEventListener("resize", resize);
  resize();

  scene.background = makeCanvasTexture(4, 512, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#4f9dff");
    gradient.addColorStop(.55, "#bfe3ff");
    gradient.addColorStop(1, "#fff1d6");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  });
  scene.fog = new THREE.Fog(0xcfe8ff, 2800, 8000);
  scene.add(world, new THREE.HemisphereLight(0xffffff, 0x88a0c0, .85));

  const sun = new THREE.DirectionalLight(0xfff2cc, .95);
  sun.position.set(700, 1000, 1500);
  sun.target.position.set(1000, 0, 750);
  sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, {
    left: -900,
    right: 900,
    top: 700,
    bottom: -700,
    near: 10,
    far: 3500
  });
  scene.add(sun, sun.target);

  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(260, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff1a8, fog: false })
  );
  sunDisc.position.set(2600, 1800, -5200);
  scene.add(sunDisc);

  // Build the floating island as one instanced mesh to keep rendering inexpensive.
  {
    const cellSize = 70;
    const columns = 72;
    const rows = 54;
    const layers = 8;
    const cellKey = (layer, column, row) => (layer * 100 + row) * 100 + column;
    const filled = new Set();
    for (let layer = 0; layer < layers; layer++) {
      const inset = Math.floor(layer * 1.7);
      for (let row = inset; row < rows - inset; row++) {
        for (let column = inset; column < columns - inset; column++) {
          const edge = column === inset || row === inset || column === columns - inset - 1 || row === rows - inset - 1;
          const x = column * cellSize + cellSize / 2;
          if (layer > 0 && edge && random() < .3) continue;
          if (layer === 0 && Math.abs(x - RX) < cellSize) continue;
          filled.add(cellKey(layer, column, row));
        }
      }
    }
    // Only cubes with at least one visible face are drawn (the interior is never seen).
    const visible = [];
    filled.forEach(key => {
      const column = key % 100;
      const row = Math.floor(key / 100) % 100;
      const layer = Math.floor(key / 10000);
      const exposed = layer === 0 || layer === layers - 1
        || !filled.has(cellKey(layer - 1, column, row)) || !filled.has(cellKey(layer + 1, column, row))
        || !filled.has(cellKey(layer, column - 1, row)) || !filled.has(cellKey(layer, column + 1, row))
        || !filled.has(cellKey(layer, column, row - 1)) || !filled.has(cellKey(layer, column, row + 1));
      if (exposed) visible.push([layer, column, row]);
    });
    const island = new THREE.InstancedMesh(
      new BoxGeometry(cellSize, cellSize, cellSize),
      new THREE.MeshStandardMaterial({ roughness: .95 }),
      visible.length
    );
    const color = new THREE.Color();
    const matrix = new THREE.Matrix4();
    visible.forEach(([layer, column, row], count) => {
      matrix.setPosition(column * cellSize + cellSize / 2, -cellSize / 2 - layer * cellSize, row * cellSize + cellSize / 2);
      island.setMatrixAt(count, matrix);
      color.setHex(layer === 0 ? 0x5fd36a : layer < 3 ? 0x8b5a2b : layer < 6 ? 0x7d8590 : 0x59616d)
        .offsetHSL(0, 0, (random() - .5) * .09);
      island.setColorAt(count, color);
    });
    island.castShadow = true;
    island.receiveShadow = true;
    scene.add(island);
  }

  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x3aa0ff,
    transparent: true,
    opacity: .8,
    roughness: .2
  });
  const water = addBox(140, 60, IH, Array(6).fill(waterMaterial), RX, -40, IH / 2);

  function addTree(x, z, scale = 1, y = 0) {
    const footprint = 22 * scale;
    if (overlapsCourseSafety(x, z, footprint, footprint)) return null;
    const treeGroup = new THREE.Group();
    const addPart = (width, height, depth, color, partY) => {
      const mesh = new THREE.Mesh(UNIT_BOX, material(color));
      mesh.scale.set(width, height, depth);
      mesh.position.y = partY;
      mesh.castShadow = true;
      treeGroup.add(mesh);
    };
    addPart(10 * scale, 30 * scale, 10 * scale, 0x6b4423, 15 * scale);
    addPart(40 * scale, 26 * scale, 40 * scale, 0x2e9e57, 42 * scale);
    addPart(26 * scale, 20 * scale, 26 * scale, 0x39b868, 62 * scale);
    treeGroup.position.set(x, y, z);
    treeGroup.userData.phase = random() * 6;
    world.add(treeGroup);
    sway.push(treeGroup);
    addCollisionArea(x, z, 14 * scale, 14 * scale, 72 * scale);
  }

  function addRock(x, z, size) {
    const footprint = size * .55;
    if (overlapsCourseSafety(x, z, footprint, footprint)) return null;
    addStatic(size, size * .7, size, 0x8a929c, x, size * .35, z);
    addCollisionArea(x, z, footprint, footprint, size * .7);
  }

  const windowTexture = makeCanvasTexture(64, 128, (context, width, height) => {
    context.fillStyle = "#9fb3c8";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#ffe9a8";
    for (let row = 0; row < 6; row++) {
      for (let column = 0; column < 3; column++) {
        context.fillRect(8 + column * 19, 8 + row * 20, 12, 12);
      }
    }
  });
  const windowMaterial = () => new THREE.MeshStandardMaterial({ map: windowTexture, roughness: .8 });

  function addBuilding(x, z, width, depth, height, roofColor) {
    if (overlapsCourseSafety(x, z, width / 2 + 8, depth / 2 + 8)) return null;
    const windows = windowMaterial();
    addStatic(width, height, depth, [
      windows, windows, material(roofColor || 0x6d7b8a), material(0x555), windows, windows
    ], x, height / 2, z);
    platforms.push({ x, z, w: width, d: depth, y: height });
    addCollisionArea(x, z, width / 2, depth / 2, height);
  }

  function placeAroundCourse(index, count, margin, callback) {
    const [originX, originZ] = O[index];
    const perimeter = 2 * (CW + CH + 4 * margin);
    for (let item = 0; item < count; item++) {
      let distance = (item + .5) / count * perimeter;
      let x;
      let z;
      if (distance < CW + 2 * margin) {
        x = originX - margin + distance;
        z = originZ - margin;
      } else if ((distance -= CW + 2 * margin) < CH + 2 * margin) {
        x = originX + CW + margin;
        z = originZ - margin + distance;
      } else if ((distance -= CH + 2 * margin) < CW + 2 * margin) {
        x = originX + CW + margin - distance;
        z = originZ + CH + margin;
      } else {
        distance -= CW + 2 * margin;
        x = originX - margin;
        z = originZ + CH + margin - distance;
      }
      callback(x, z, item);
    }
  }

  function addSign(x, y, z, text, rotationY = 0) {
    const texture = makeCanvasTexture(256, 80, context => {
      context.fillStyle = "#f5e6c8";
      context.fillRect(0, 0, 256, 80);
      context.fillStyle = "#10223a";
      context.textAlign = "center";
      context.font = "800 27px system-ui,sans-serif";
      context.fillText(text, 128, 50);
    });
    addStatic(6, 40, 6, 0x6b4423, x, y / 2, z);
    const sign = addBox(100, 32, 5, [0, 1, 2, 3, 4, 5].map(face =>
      face === 4 ? new THREE.MeshBasicMaterial({ map: texture }) : material(0x8b6b3a)
    ), x, y + 12, z);
    sign.rotation.y = rotationY;
  }

  const rampTexture = makeCanvasTexture(128, 64, (context, width, height) => {
    context.fillStyle = "#174b49";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#f5d36b";
    context.font = "bold 34px system-ui,sans-serif";
    context.textAlign = "center";
    context.fillText("›  ›  ›", width / 2, 43);
  });

  const movers = [];
  const HILL_SHADES = [0x3f9a55, 0x56b36a, 0x7fd18a];

  // Course surfaces, rails, obstacles, hazards, tees, cups, and flags are built together.
  HOLES.forEach((hole, index) => {
    const [originX, originZ] = hole.origin;
    const groundY = hole.groundY;
    const surfaceY = groundY + 2;
    const borderWidth = 28;
    const borderHeight = 60;
    const centerX = originX + CW / 2;
    const centerZ = originZ + CH / 2;
    const pads = hole.safe || [[0, 0, CW, CH]];

    pads.forEach(([x, z, width, depth]) => {
      const padX = originX + x + width / 2;
      const padZ = originZ + z + depth / 2;
      addStatic(width + (hole.safe ? 0 : 80), 14, depth + (hole.safe ? 0 : 80), 0x6b7a8a, padX, groundY - 7, padZ);
      addStatic(width + (hole.safe ? 0 : 80), 4, depth + (hole.safe ? 0 : 80), 0x7d8590, padX, groundY, padZ);
      if (hole.safe && groundY > 0) addStatic(Math.min(width, 90) * .6, groundY, Math.min(depth, 90) * .6, 0x7d8590, padX, groundY / 2 - 7, padZ);
      const floor = addBox(width, 2, depth, hole.colors[0], padX, groundY + 1, padZ);
      floor.userData.hole = index;
      floors.push(floor);
    });

    [
      [centerX, originZ - 40 + borderWidth / 2, CW + 80, borderWidth],
      [centerX, originZ + CH + 40 - borderWidth / 2, CW + 80, borderWidth],
      [originX - 40 + borderWidth / 2, centerZ, borderWidth, CH + 80],
      [originX + CW + 40 - borderWidth / 2, centerZ, borderWidth, CH + 80]
    ].forEach(([x, z, width, depth]) => {
      addStatic(width, borderHeight, depth, 0x5a6b7a, x, groundY + borderHeight / 2, z);
      addCollisionArea(x, z, width / 2, depth / 2, groundY + borderHeight);
    });

    hole.walls.forEach(([x, z, width, height]) => {
      addStatic(width, 16, height, hole.colors[1], originX + x + width / 2, surfaceY + 8, originZ + z + height / 2, hole.emissive);
    });
    hole.circles.forEach(([x, z, radius, bounce = 1]) => {
      const bumper = bounce > 1;
      const obstacle = new THREE.Mesh(UNIT_CYLINDER, material(bumper ? 0xffd166 : 0xf2f6fb, bumper));
      obstacle.scale.set(radius, 16, radius);
      obstacle.position.set(originX + x, surfaceY + 8, originZ + z);
      obstacle.castShadow = true;
      world.add(obstacle);
    });
    hole.hills.forEach(hill => {
      HILL_LAYERS.forEach((factor, layer) => {
        const mound = new THREE.Mesh(UNIT_CYLINDER, material(HILL_SHADES[layer]));
        mound.scale.set(hill.r * factor, HILL_STEP, hill.r * factor);
        mound.position.set(originX + hill.x, surfaceY + HILL_STEP * (layer + .5), originZ + hill.y);
        mound.castShadow = true;
        mound.receiveShadow = true;
        world.add(mound);
      });
    });
    hole.hazards.forEach(([x, z, width, depth]) => {
      addStatic(width, 1, depth, hole.hazardColor, originX + x + width / 2, surfaceY + .1, originZ + z + depth / 2, true);
    });
    hole.bridges.forEach(([x, z, width, depth]) => {
      addStatic(width, 2, depth, 0x9b6a3a, originX + x + width / 2, surfaceY + 1, originZ + z + depth / 2);
    });
    hole.ramps.forEach(ramp => {
      const surface = new THREE.Mesh(
        new THREE.PlaneGeometry(ramp.width, ramp.depth),
        new THREE.MeshBasicMaterial({ map: rampTexture, transparent: true, side: THREE.DoubleSide })
      );
      surface.rotation.x = -Math.PI / 2;
      surface.rotation.y = -Math.atan2(ramp.direction[1], ramp.direction[0]);
      surface.position.set(originX + ramp.x + ramp.width / 2, surfaceY + 2.6, originZ + ramp.y + ramp.depth / 2);
      world.add(surface);
    });
    hole.tunnels.forEach(tunnel => {
      const tunnelX = originX + tunnel.x + tunnel.width / 2;
      const tunnelZ = originZ + tunnel.y + tunnel.depth / 2;
      addStatic(8, 28, 8, hole.colors[1], originX + tunnel.x + 4, surfaceY + 14, tunnelZ - tunnel.depth / 2 + 4, hole.emissive);
      addStatic(8, 28, 8, hole.colors[1], originX + tunnel.x + tunnel.width - 4, surfaceY + 14, tunnelZ - tunnel.depth / 2 + 4, hole.emissive);
      addStatic(8, 28, 8, hole.colors[1], originX + tunnel.x + 4, surfaceY + 14, tunnelZ + tunnel.depth / 2 - 4, hole.emissive);
      addStatic(8, 28, 8, hole.colors[1], originX + tunnel.x + tunnel.width - 4, surfaceY + 14, tunnelZ + tunnel.depth / 2 - 4, hole.emissive);
      addStatic(tunnel.width, 6, tunnel.depth, hole.colors[1], tunnelX, surfaceY + 31, tunnelZ, hole.emissive);
    });
    hole.movers.forEach(mover => {
      const mesh = addBox(mover.w, 16, mover.h, 0xd9534f, 0, groundY + 10, 0, true);
      movers.push({ hole: index, mover, mesh });
    });

    const tee = new THREE.Mesh(new THREE.RingGeometry(8, 12, 24), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    tee.rotation.x = -Math.PI / 2;
    tee.position.set(originX + hole.tee[0], surfaceY + .3, originZ + hole.tee[1]);
    world.add(tee);

    const cup = new THREE.Mesh(new THREE.CircleGeometry(CONFIG.cupRadius, 28), new THREE.MeshBasicMaterial({ color: 0 }));
    cup.rotation.x = -Math.PI / 2;
    cup.position.set(originX + hole.cup[0], surfaceY + .4, originZ + hole.cup[1]);
    world.add(cup);
    addStatic(3, 46, 3, 0xffffff, originX + hole.cup[0], surfaceY + 23, originZ + hole.cup[1]);

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 15),
      new THREE.MeshBasicMaterial({ color: 0xff4d4d, side: THREE.DoubleSide })
    );
    flag.position.set(originX + hole.cup[0] + 12, surfaceY + 38, originZ + hole.cup[1]);
    world.add(flag);
    flags.push(flag);
    addSign(originX + 30, groundY + borderHeight + 16, originZ - 70, hole.title.split(" &")[0].toUpperCase());
  });

  function addBridge(x1, z1, x2, z2, color, y) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    const angle = Math.atan2(dz, dx);
    const bridgeY = y || -45;
    const centerX = (x1 + x2) / 2;
    const centerZ = (z1 + z2) / 2;
    const bridge = addBox(length, 10, 90, color || 0x8b6b3a, centerX, bridgeY, centerZ);
    bridge.rotation.y = -angle;

    [-1, 1].forEach(side => {
      const rail = addBox(length, 6, 6, 0x6b4423, centerX, bridgeY + 7, centerZ);
      rail.rotation.y = -angle;
      rail.position.x += side * Math.cos(angle + Math.PI / 2) * 44;
      rail.position.z += side * Math.sin(angle + Math.PI / 2) * 44;
    });
    platforms.push({ x: centerX, z: centerZ, w: length, d: 90, y: bridgeY + 5 });
  }

  const courseCenters = O.map(([x, z]) => [x + CW / 2, z + CH / 2]);
  const connections = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [0, 3], [2, 5], [1, 4]];
  connections.forEach(([start, end]) => {
    addBridge(courseCenters[start][0], courseCenters[start][1], courseCenters[end][0], courseCenters[end][1]);
  });

  {
    const [originX, originZ] = O[0];
    for (let index = 0; index < 40; index++) {
      const angle = random() * Math.PI * 2;
      const radius = 280 + random() * 340;
      const x = originX + CW / 2 + Math.cos(angle) * radius;
      const z = originZ + CH / 2 + Math.sin(angle) * radius;
      if (!isNearCourse(x, z, 140)) addTree(x, z, .7 + random() * .9);
    }
    for (let index = 0; index < 8; index++) {
      const angle = index / 8 * Math.PI * 2;
      addRock(originX + CW / 2 + Math.cos(angle) * 220, originZ + CH / 2 + Math.sin(angle) * 220, 16);
    }
  }

  {
    const [originX, originZ] = O[1];
    for (let index = 0; index < 14; index++) {
      const angle = index / 14 * Math.PI * 2;
      const radius = 300 + ((index * 37) % 120);
      const x = originX + CW / 2 + Math.cos(angle) * radius;
      const z = originZ + CH / 2 + Math.sin(angle) * radius;
      addStatic(28, 60 + ((index * 23) % 50), 28, 0x2b3a55, x, 40, z);
      addStatic(30, 4, 30, 0x00e5ff, x, 70 + ((index * 7) % 9), z, true);
    }
    addStatic(20, 180, 20, 0x0b1c2e, originX + CW / 2, 90, originZ + CH / 2);
    addStatic(24, 4, 24, 0x3dffb0, originX + CW / 2, 185, originZ + CH / 2, true);
    for (let index = 0; index < 6; index++) {
      const angle = index / 6 * Math.PI * 2;
      addStatic(12, 12, 12, 0x00e5ff,
        originX + CW / 2 + Math.cos(angle) * 160,
        120 + Math.sin(index * 1.7) * 20,
        originZ + CH / 2 + Math.sin(angle) * 160,
        true
      );
    }
  }

  {
    const [originX, originZ] = O[2];
    addBuilding(originX - 200, originZ - 140, 70, 70, 90, 0xc0392b);
    addBuilding(originX + CW + 200, originZ - 140, 70, 70, 110, 0x6d7b8a);
    addBuilding(originX - 200, originZ + CH + 140, 70, 70, 80, 0x6d7b8a);
    addBuilding(originX + CW + 200, originZ + CH + 140, 70, 70, 100, 0xc0392b);
    const fountain = new THREE.Mesh(new THREE.CylinderGeometry(30, 34, 14, 16), material(0xdfe6ee));
    fountain.position.set(originX + CW / 2, 7, originZ + CH / 2);
    fountain.castShadow = true;
    world.add(fountain);
    addStatic(6, 40, 6, 0x9fb3c8, originX + CW / 2, 30, originZ + CH / 2);
    for (let index = 0; index < 10; index++) {
      addTree(originX - 180 + index * 70, originZ - 180, .8);
      addTree(originX - 180 + index * 70, originZ + CH + 180, .8);
    }
  }

  {
    const [originX, originZ] = O[3];
    addBuilding(originX + 300, originZ - 100, 90, 90, 140, 0x2c3e50);
    addBuilding(originX - 200, originZ + CH + 80, 70, 70, 100, 0x34495e);
    for (let index = 0; index < 6; index++) {
      addStatic(4, 2, 50, 0xffffff, originX - 160 + index * 40, 1, originZ + CH + 200);
    }
    addStatic(60, 50, 6, 0x88ccee, originX + 300, 25, originZ - 150, true);
  }

  {
    // Place des langues : greetings in the four languages listed in the portfolio, methodology signs behind the course.
    const [originX, originZ] = O[5];
    ["Hello", "Bonjour", "مرحبا", "Hallo"].forEach((word, i) => addSign(originX + 90 + i * 180, 56, originZ + CH + 90, word));
    ["POO", "ALGO", "TESTS", "ÉQUIPE"].forEach((word, i) => addSign(originX + 90 + i * 180, 56, originZ - 150, word));
    [[-120, 40], [CW + 120, 40], [-120, CH - 40], [CW + 120, CH - 40]].forEach(([offsetX, offsetZ], i) => {
      for (let level = 0; level < 3 - (i % 2); level++) {
        addStatic(40, 40, 40, [0xff6f61, 0x4cc9f0, 0xffd166, 0x7bd88f][(i + level) % 4], originX + offsetX, 20 + level * 40, originZ + offsetZ);
      }
    });
  }

  const secretRoom = {};
  {
    const [originX, originZ] = O[5];
    const centerX = originX + CW / 2;
    const centerZ = originZ + CH / 2 - 520;
    const stone = 0x5a4a3a;
    secretRoom.x = centerX + 70;
    secretRoom.z = centerZ - 45;
    secretRoom.y = 78;

    addStatic(16, 210, 180, stone, centerX - 112, 105, centerZ);
    addStatic(16, 210, 180, stone, centerX + 112, 105, centerZ);
    addStatic(240, 210, 16, 0x4a3a2a, centerX, 105, centerZ - 82);
    addStatic(68, 160, 16, stone, centerX - 78, 80, centerZ + 82);
    addStatic(68, 160, 16, stone, centerX + 78, 80, centerZ + 82);
    addStatic(240, 12, 180, 0x3a3029, centerX, 214, centerZ);
    addCollisionArea(centerX - 112, centerZ, 8, 90, 210);
    addCollisionArea(centerX + 112, centerZ, 8, 90, 210);
    addCollisionArea(centerX, centerZ - 82, 112, 8, 210);
    addCollisionArea(centerX - 78, centerZ + 82, 34, 8, 160);
    addCollisionArea(centerX + 78, centerZ + 82, 34, 8, 160);

    [
      { x: centerX - 60, z: centerZ + 62, y: 14 },
      { x: centerX - 20, z: centerZ + 20, y: 34 },
      { x: centerX + 24, z: centerZ - 20, y: 54 },
      { x: secretRoom.x, z: secretRoom.z, y: 74 }
    ].forEach(step => {
      addStatic(70, 8, 70, step.y > 60 ? 0x79634a : 0x6b5a4a, step.x, step.y, step.z);
      platforms.push({ x: step.x, z: step.z, w: 70, d: 70, y: step.y + 4 });
    });

    for (let index = 0; index < 7; index++) {
      const angle = index / 7 * Math.PI * 2;
      const crystal = new THREE.Mesh(
        new THREE.ConeGeometry(6, 30, 5),
        material(index % 2 ? 0x9b59b6 : 0x00e5ff, true)
      );
      crystal.position.set(centerX + Math.cos(angle) * 145, 15, centerZ + Math.sin(angle) * 145);
      crystal.rotation.z = Math.sin(angle) * .3;
      crystal.castShadow = true;
      world.add(crystal);
    }
  }

  {
    const centerX = 2700;
    const centerZ = 1260;
    addStatic(120, 8, 120, 0x3dffb0, centerX, 4, centerZ, true);
    addStatic(14, 310, 14, 0x3dffb0, centerX, 155, centerZ, true);
    [55, 110, 165, 220, 275].forEach((height, index) => {
      const angle = index * Math.PI * .72;
      const x = centerX + Math.cos(angle) * 145;
      const z = centerZ + Math.sin(angle) * 145;
      addStatic(82, 10, 82, 0xdfe6ee, x, height, z);
      platforms.push({ x, z, w: 82, d: 82, y: height + 5 });
      addStatic(4, 26, 4, 0xffffff, x, height + 18, z);
      addStatic(18, 4, 18, 0xffd166, x, height - 8, z, true);
    });
    addStatic(120, 12, 120, 0xffd166, centerX, 318, centerZ);
    platforms.push({ x: centerX, z: centerZ, w: 120, d: 120, y: 324 });
    addStatic(6, 60, 6, 0xffffff, centerX + 42, 354, centerZ + 42);
    addStatic(90, 10, 90, 0x84d7c5, centerX + 30, 396, centerZ + 30, true);
    platforms.push({ x: centerX + 30, z: centerZ + 30, w: 90, d: 90, y: 401 });
  }

  for (let index = 0; index < 170; index++) {
    const x = 60 + random() * (IW - 120);
    const z = 60 + random() * (IH - 120);
    if (!isNearCourse(x, z, 150) && !isBlocked(x, z) && Math.hypot(x - SPX, z - SPZ) > 120) {
      if (index % 3) addTree(x, z, .7 + random() * .7);
      else addRock(x, z, 14 + random() * 18);
    }
  }

  [[700, 2200], [2400, 900], [4200, 2600], [1500, 3300]].forEach(([x, z]) => {
    for (let step = 0; step < 5; step++) {
      const y = 60 + step * 70;
      addStatic(70, 8, 70, 0xc08457, x, y, z);
      platforms.push({ x, z, w: 70, d: 70, y: y + 4 });
      if (step < 4) addBox(70, 8, 70, 0x8b5a2b, x + 55, y + 35, z + 55);
    }
  });

  addStatic(220, 4, 140, 0x8b5a2b, RX, 0, BZ);
  [-64, 64].forEach(offset => addBox(220, 14, 6, 0x6b4423, RX, 9, BZ + offset));

  function addHill(x, z, width, height, color) {
    for (let layer = 0; layer < 4; layer++) {
      const scale = 1 - layer * .22;
      addStatic(width * scale, height / 4, width * scale, layer > 2 ? 0xf0f4f8 : color,
        x, height / 8 + layer * height / 4, z);
    }
    addCollisionArea(x, z, width / 2 * .85, width / 2 * .85, height);
  }

  addHill(1500, 1200, 320, 240, 0x4a9a55);
  addHill(3350, 1550, 260, 200, 0x7d8590);
  addHill(450, 900, 220, 160, 0x4a9a55);
  addHill(4400, 3200, 280, 220, 0x7d8590);
  addHill(2000, 3300, 240, 170, 0x4a9a55);
  placeAroundCourse(1, 18, 60, (x, z) => addTree(x, z, .9 + random() * .5));
  placeAroundCourse(0, 7, 60, (x, z) => random() < .5 ? addTree(x, z, 1) : addRock(x, z, 18));
  placeAroundCourse(2, 8, 58, (x, z, index) => {
    addStatic(28, 60 + random() * 50, 28, 0x2b3a55, x, 40, z);
    addStatic(30, 4, 30, 0x00e5ff, x, 70 + index * 3, z, true);
  });
  placeAroundCourse(3, 6, 65, (x, z, index) => addBuilding(x, z, 44, 44, 60 + (index * 23 % 50), index % 2 ? 0xc0392b : 0x6d7b8a));
  placeAroundCourse(4, 4, 60, (x, z) => addTree(x, z, .8));

  {
    // Billboard: 900 x 300 panel on two posts, unlit so the text stays readable from far away.
  const signTexture = makeCanvasTexture(2048, 683, (context, width, height) => {
    context.fillStyle = "#10223a";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#ffd166";
    context.lineWidth = 28;
    context.strokeRect(14, 14, width - 28, height - 28);
    context.textAlign = "center";
    context.fillStyle = "#ffffff";
    context.font = "700 112px system-ui,sans-serif";
    context.fillText("JE RECHERCHE", width / 2, 170);
    context.fillStyle = "#ffd166";
    context.font = "900 196px system-ui,sans-serif";
    context.fillText("UNE ALTERNANCE", width / 2, 365);
    context.fillStyle = "#ffffff";
    context.font = "600 92px system-ui,sans-serif";
    context.fillText(window.PortfolioData.recruitment.role, width / 2, 493);
    context.fillStyle = "#3ddc84";
    context.font = "600 72px system-ui,sans-serif";
    context.fillText(window.PortfolioData.recruitment.location, width / 2, 600);
  });
  {
    const billboardX = 700;
    const billboardZ = 1420;
    [-380, 380].forEach(offset => addStatic(18, 270, 18, 0x6b4423, billboardX + offset, 135, billboardZ));
    const frameMaterial = material(0x10223a);
    addBox(900, 300, 16, [
      frameMaterial, frameMaterial, frameMaterial, frameMaterial,
      new THREE.MeshBasicMaterial({ map: signTexture }), frameMaterial
    ], billboardX, 420, billboardZ);
    addStatic(916, 10, 26, 0xffd166, billboardX, 576, billboardZ);
    [-300, 0, 300].forEach(offset => addStatic(40, 8, 40, 0xffd166, billboardX + offset, 582, billboardZ + 24, true));
  }
  }

  const robot = new THREE.Group();
  {
    const addRobotPart = (width, height, depth, color, x, y, z, emissive = false) => {
      const mesh = new THREE.Mesh(UNIT_BOX, material(color, emissive));
      mesh.scale.set(width, height, depth);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      robot.add(mesh);
      return mesh;
    };
    robot.userData.head = addRobotPart(18, 14, 14, 0xdfe6ee, 0, 42, 0);
    addRobotPart(20, 24, 14, 0xaab4c2, 0, 22, 0);
    addRobotPart(4, 4, 2, 0x00e5ff, -4, 43, 8, true);
    addRobotPart(4, 4, 2, 0x00e5ff, 4, 43, 8, true);
    addRobotPart(2, 8, 2, 0xdfe6ee, 0, 53, 0);
    robot.position.set(600, 0, 1610);
    world.add(robot);

    const speechTexture = makeCanvasTexture(512, 150, (context, width, height) => {
      context.fillStyle = "#fff";
      context.beginPath();
      context.moveTo(20, 10);
      context.lineTo(width - 20, 10);
      context.lineTo(width - 20, 100);
      context.lineTo(width / 2 + 10, 100);
      context.lineTo(width / 2, 135);
      context.lineTo(width / 2 - 16, 100);
      context.lineTo(20, 100);
      context.fill();
      context.fillStyle = "#10223a";
      context.textAlign = "center";
      context.font = "700 30px system-ui,sans-serif";
      context.fillText("Have you tried turning it", width / 2, 50);
      context.fillText("off and on again?", width / 2, 86);
    });
    const speech = new THREE.Sprite(new THREE.SpriteMaterial({ map: speechTexture }));
    speech.scale.set(120, 35, 1);
    speech.position.set(600, 92, 1655);
    world.add(speech);
  }

  const easterEgg = new THREE.Group();
  {
    const addEggPart = (width, height, depth, color, x, y, z, emissive = false) => {
      const mesh = new THREE.Mesh(UNIT_BOX, material(color, emissive));
      mesh.scale.set(width, height, depth);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      easterEgg.add(mesh);
    };
    addEggPart(14, 14, 14, 0xffd166, 0, 7, 0, true);
    addEggPart(4, 4, 20, 0xffd166, 0, 7, 0);
    addEggPart(20, 4, 4, 0xffd166, 0, 7, 0);
    easterEgg.position.set(secretRoom.x, secretRoom.y, secretRoom.z);
    easterEgg.userData.baseY = secretRoom.y;
    easterEgg.visible = false;
    world.add(easterEgg);
  }

  function createVoxelHuman(skin) {
    const character = new THREE.Group();
    const addPart = (width, height, depth, color, x, y, z) => {
      const mesh = new THREE.Mesh(UNIT_BOX, material(color));
      mesh.scale.set(width, height, depth);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      character.add(mesh);
      return mesh;
    };
    const legs = [
      addPart(7, 16, 7, skin.trousers, -4, 8, 0),
      addPart(7, 16, 7, skin.trousers, 4, 8, 0)
    ];
    addPart(8, 5, 9, skin.boots, -4, 2, 1);
    addPart(8, 5, 9, skin.boots, 4, 2, 1);
    addPart(15, 17, 9, skin.jacket, 0, 24, 0);
    addPart(3, 16, 10, skin.accent, 0, 24, 5);
    addPart(9, 18, 8, skin.pack, 0, 25, -8);
    const leftArm = addPart(5, 15, 6, skin.jacket, -10, 24, 0);
    const rightArm = addPart(5, 15, 6, skin.jacket, 10, 24, 0);
    addPart(5, 5, 6, skin.skin, -10, 15, 0);
    addPart(5, 5, 6, skin.skin, 10, 15, 0);
    addPart(12, 12, 12, skin.skin, 0, 41, 0);
    addPart(13, 5, 14, skin.hair, 0, 48, -1);
    addPart(14, 4, 14, skin.accent, 0, 51, -1);
    addPart(2, 2, 1, 0x10223a, -3, 42, 6);
    addPart(2, 2, 1, 0x10223a, 3, 42, 6);
    addPart(5, 1, 1, 0x8b3a2a, 0, 38, 6);
    return { group: character, legs, leftArm, rightArm };
  }

  const playerSkin = createVoxelHuman({
    skin: 0xf1c27d,
    hair: 0x2b1d17,
    jacket: 0x168b88,
    accent: 0xffd166,
    trousers: 0x29394f,
    boots: 0x68422b,
    pack: 0x8b5a3c
  });
  const avatar = playerSkin.group;
  const legs = playerSkin.legs;
  const leftArm = playerSkin.leftArm;
  const rightArm = playerSkin.rightArm;
  avatar.scale.setScalar(1.5);
  scene.add(avatar);

  const characters = [
    { x: 760, z: 1420, skin: { skin: 0x9d6749, hair: 0x1e2024, jacket: 0x2d6f8f, accent: 0xe9bd62, trousers: 0x3d4654, boots: 0x3b2e28, pack: 0x9b6540 } },
    { x: 2960, z: 1540, skin: { skin: 0xe2b58a, hair: 0x5a3526, jacket: 0xb95d48, accent: 0xf2d38b, trousers: 0x394b43, boots: 0x463323, pack: 0x456d64 } },
    { x: 4600, z: 2460, skin: { skin: 0xb97856, hair: 0x24222a, jacket: 0x596bb2, accent: 0x84d7c5, trousers: 0x333b53, boots: 0x302b34, pack: 0x704c91 } }
  ].map(({ x, z, skin }) => {
    const person = createVoxelHuman(skin);
    person.group.position.set(x, 0, z);
    person.group.rotation.y = Math.PI * .15;
    scene.add(person.group);
    return person.group;
  });

  const golfBall = new THREE.Mesh(new THREE.SphereGeometry(R, 14, 10), material(0xffffff));
  golfBall.castShadow = true;
  scene.add(golfBall);
  const teeBalls = HOLES.map(hole => {
    const teeBall = new THREE.Mesh(new THREE.SphereGeometry(R, 14, 10), material(0xffffff));
    teeBall.position.set(hole.origin[0] + hole.tee[0], hole.groundY + 2 + R, hole.origin[1] + hole.tee[1]);
    scene.add(teeBall);
    return teeBall;
  });
  const shotDots = Array.from({ length: 14 }, () => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    dot.visible = false;
    scene.add(dot);
    return dot;
  });

  flushStatic();

  return {
    cv,
    renderer,
    scene,
    camera,
    world,
    ray,
    golfPlane,
    groundPlane,
    hitPoint,
    water,
    sway,
    floors,
    flags,
    platforms,
    obstacles,
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
    resize,
    isBlocked
  };
}

window.PortfolioWorld = { createWorld };
