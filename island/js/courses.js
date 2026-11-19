// Course layouts in local course coordinates (720 x 450). Geometry only; text lives in content.js.
// walls [x,y,w,h] · circles [x,y,r,bounce] (bounce > 1 = bumper) · ramps = boost pads · hills = stepped mounds that deflect the ball
// hazards = water/lava (ball returns to its last resting spot) · safe = whitelist of platforms (everything else is void)
// movers = sliding doors/gates · tunnels/bridges = visual roofs and plank decks
const COURSE_LAYOUTS = [
  { // 1 · À propos — gentle intro: one wall to bank around, bumpers, a mound near the cup
    tee: [60, 225], cup: [650, 225], colors: [0x4ccf6a, 0xb9814a],
    walls: [[330, 130, 24, 190], [190, 10, 22, 85], [470, 355, 22, 85]],
    circles: [[470, 120, 28, 1.3], [200, 340, 24, 1]],
    ramps: [{ x: 90, y: 300, width: 100, depth: 80, direction: [0, -1], strength: 240 }],
    hills: [{ x: 570, y: 320, r: 70, strength: 420 }]
  },
  { // 2 · Compétences — forest river crossed by a plank bridge, log wall with a narrow shortcut gap
    tee: [60, 235], cup: [640, 110], colors: [0x3fbf6f, 0x8b5a2b], hazardColor: 0x3aa0ff,
    walls: [[520, 10, 22, 80], [520, 126, 22, 84]],
    circles: [[160, 120, 26, 1], [160, 340, 26, 1], [460, 350, 30, 1]],
    hazards: [[300, 10, 110, 185], [300, 275, 110, 165]],
    bridges: [[300, 195, 110, 80]],
    ramps: [{ x: 420, y: 195, width: 80, depth: 80, direction: [1, 0], strength: 200 }],
    hills: [{ x: 590, y: 330, r: 80, strength: 380 }]
  },
  { // 3 · Projets — circuit board: serpentine traces, charged nodes, short-circuit lava, shortcut gap in trace 2
    tee: [60, 100], cup: [640, 350], colors: [0x2fb9a0, 0x2d8cff], emissive: true, hazardColor: 0xff5a1f,
    walls: [[170, 10, 22, 290], [330, 150, 22, 150], [330, 340, 22, 100], [490, 10, 22, 280]],
    circles: [[270, 415, 22, 1.4], [420, 35, 22, 1.4], [580, 380, 22, 1.4]],
    hazards: [[360, 390, 100, 50]],
    ramps: [{ x: 200, y: 300, width: 100, depth: 90, direction: [0, -1], strength: 300 }, { x: 360, y: 60, width: 100, depth: 90, direction: [0, 1], strength: 300 }],
    tunnels: [{ x: 200, y: 180, width: 110, depth: 90 }]
  },
  { // 4 · Expérience — office: sliding doors, meeting room, window gap shortcut
    tee: [60, 225], cup: [650, 225], colors: [0x7fd36b, 0xe8eef5],
    walls: [[130, 10, 22, 170], [130, 270, 22, 170], [300, 10, 22, 50], [300, 96, 22, 64], [300, 290, 22, 150], [500, 10, 22, 120], [500, 320, 22, 120]],
    movers: [
      { axis: "y", x: 300, y: 0, w: 22, h: 70, from: 160, to: 220, speed: 1.6, phase: 0 },
      { axis: "y", x: 500, y: 0, w: 22, h: 90, from: 130, to: 230, speed: 2.4, phase: 1.5 }
    ],
    circles: [[410, 225, 26, 1], [410, 110, 16, 1], [410, 340, 16, 1]],
    ramps: [{ x: 530, y: 180, width: 100, depth: 90, direction: [-1, 0], strength: 200 }]
  },
  { // 5 · Formation — campus: bookshelf zig-zag, fountain pond, grassy knoll
    tee: [60, 60], cup: [650, 390], colors: [0x58c46a, 0xf2b134], hazardColor: 0x3aa0ff,
    walls: [[150, 110, 230, 22], [330, 240, 230, 22], [560, 110, 22, 130]],
    circles: [[100, 300, 24, 1], [640, 320, 24, 1]],
    hazards: [[250, 320, 160, 100]],
    hills: [{ x: 650, y: 170, r: 60, strength: 450 }],
    ramps: [{ x: 60, y: 170, width: 90, depth: 100, direction: [1, 0.3], strength: 260 }]
  },
  { // 6 · Langues & Méthode — plaza: four language bumpers, two pits, central mound
    tee: [60, 225], cup: [650, 225], colors: [0x35b354, 0xffffff], hazardColor: 0x1b1b3a,
    walls: [[250, 150, 22, 150], [470, 150, 22, 150]],
    circles: [[150, 100, 26, 1.5], [150, 350, 26, 1.5], [580, 100, 26, 1.5], [580, 350, 26, 1.5]],
    hazards: [[300, 10, 120, 90], [300, 350, 120, 90]],
    hills: [{ x: 360, y: 225, r: 70, strength: 480 }]
  },
  { // 7 · Contact — sky course: platforms over the void, plank bridges, a timing gate, long-shot shortcut
    tee: [60, 225], cup: [665, 110], colors: [0x7a5cd6, 0xff6fd8], emissive: true, groundY: 120,
    safe: [[10, 130, 190, 190], [200, 205, 120, 40], [320, 140, 130, 170], [365, 70, 40, 70], [330, 10, 200, 60], [530, 25, 100, 30], [630, 10, 80, 210]],
    bridges: [[200, 205, 120, 40], [365, 70, 40, 70], [530, 25, 100, 30]],
    circles: [[395, 258, 16, 1.4]],
    movers: [{ axis: "y", x: 575, y: 0, w: 14, h: 40, from: 5, to: 60, speed: 2.6, phase: 0 }],
    ramps: [{ x: 340, y: 150, width: 90, depth: 70, direction: [0, -1], strength: 240 }]
  }
];
