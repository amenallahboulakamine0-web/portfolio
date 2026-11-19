// Station text comes exclusively from the shared portfolio data; layouts remain game-only.
(function () {
  "use strict";
  const data = window.PortfolioData;
  const routes = window.PortfolioRoutes;
  if (!data || !routes) throw new Error("Shared portfolio data unavailable");
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const tags = values => values.map(value => `<span class="tag">${escape(value)}</span>`).join("");
  const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join("")}</ul>`;
  const link = item => {
    const href = item.route === "island" ? routes.island : item.profileKey ? data.profile[item.profileKey] : item.href;
    const target = new URL(href, routes.root);
    return `<a href="${escape(target.href)}"${target.origin !== new URL(routes.root).origin ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escape(item.label)}</a>`;
  };
  const render = {
    about: () => data.about.paragraphs.map(text => `<p>${escape(text)}</p>`).join(""),
    skills: () => data.skills.groups.map(group => `<h3>${escape(group.title)}</h3>${tags(group.items.map(item => item.label))}`).join(""),
    projects: () => data.projects.items.map(project => `<details class="project-item"><summary><span>${escape(project.title)}</span><small>${escape(project.tags.join(" · "))}</small></summary><p>${escape(project.description)}</p>${list(project.details)}<div class="lk">${project.links.map(link).join(" ")}</div></details>`).join(""),
    experience: () => data.experience.items.map(item => `<div class="pc"><h3>${escape(item.title)}</h3><p>${escape(item.meta)}</p><p>${escape(item.summary)}</p>${list(item.achievements)}</div>`).join(""),
    education: () => data.education.map(item => `<div class="pc"><h3>${escape(item.school)}</h3><p>${escape(item.qualification)} · ${escape(item.location)} · ${escape(item.dates)}</p></div>`).join(""),
    languages: () => `<h3>Langues</h3>${tags(data.languages.map(item => `${item.name} — ${item.level}`))}<h3>Méthodologie</h3>${tags(data.methodology)}`,
    contact: () => `<p>${escape(data.recruitment.contract)} · ${escape(data.recruitment.role)}</p><p>${escape(data.recruitment.location)}</p><p><a href="tel:${escape(data.profile.phone)}">${escape(data.profile.phone)}</a></p><div class="lk">${link({label:"Email",href:`mailto:${data.profile.email}`})} ${data.contact.links.map(link).join(" ")}<a href="${escape(routes.asset(data.cv.href))}" download="${escape(data.cv.filename)}">${escape(data.cv.label)}</a></div>`
  };
  const WORLD = {
  courseWidth: 720,
  courseHeight: 450,
  courseBorder: 10,
  ballRadius: 7,
  cupRadius: 13,
  maxShotSpeed: 720,
  maxShotPull: 130,
  restitution: 0.85,
  hillLayers: [1, .7, .4],
  hillStep: 6,
  progressKey: "hahiIslandV4",
  islandWidth: 5040,
  islandHeight: 3780,
  islandCenterX: 2520,
  islandCenterZ: 1900,
  spawnX: 220,
  spawnZ: 1860,
  courseOrigins: [[300, 1700], [800, 500], [500, 2900], [3300, 600], [3800, 1900], [3000, 2900], [1620, 300]]
};
  if (COURSE_LAYOUTS.length !== data.island.stations.length) throw new Error("Station/course count mismatch");
  const HOLES = data.island.stations.map((station, index) => ({
    walls: [], circles: [], ramps: [], hills: [], hazards: [], movers: [], tunnels: [], bridges: [], safe: null,
    groundY: 0, emissive: false, hazardColor: 0x3aa0ff,
    ...COURSE_LAYOUTS[index],
    title: station.title,
    get html() { return `<h2>${escape(station.title)}</h2>${render[station.section]()}`; },
    origin: WORLD.courseOrigins[index]
  }));
  // Heights in course-local X/Z coordinates, shared by meshes and golf physics.
  const fairwayY = hole => hole.groundY + 2 + .2;
  function surfaceYAt(hole, x, z) {
    let rise = hole.bridges.some(([bx, bz, w, d]) =>
      x >= bx && x <= bx + w && z >= bz && z <= bz + d) ? 2 : 0;
    for (const hill of hole.hills) {
      const distance = Math.hypot(x - hill.x, z - hill.y);
      WORLD.hillLayers.forEach((factor, layer) => {
        if (distance <= hill.r * factor) rise = Math.max(rise, (layer + 1) * WORLD.hillStep);
      });
    }
    return fairwayY(hole) + rise;
  }
  function tunnelPosts(tunnel) {
    const posts = [];
    for (const x of [tunnel.x, tunnel.x + tunnel.width - 8]) {
      for (const z of [tunnel.y, tunnel.y + tunnel.depth - 8]) posts.push([x, z, 8, 8]);
    }
    return posts;
  }
  window.PortfolioContent = { WORLD, HOLES, fairwayY, surfaceYAt, tunnelPosts };
})();
