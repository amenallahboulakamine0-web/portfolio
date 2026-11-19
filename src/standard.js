// Standard-page rendering only: no game imports, preloads, or initialization.
(function () {
  'use strict';
  const data = window.PortfolioData;
  const routes = window.PortfolioRoutes;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const asset = path => escape(routes.asset(path));
  const tags = values => values.map(value => `<span class="tech-tag">${escape(value)}</span>`).join('');
  const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>`;
  const title = (id, section) => `<div class="section-title"><h2 id="${id}-title">${escape(section.title)}</h2><p>${escape(section.subtitle)}</p></div>`;
  const section = (id, content) => { document.querySelector(`#${id} > .container`).innerHTML = title(id, data[id]) + content; };
  const link = item => {
    const href = item.route === 'island' ? routes.island : item.profileKey ? data.profile[item.profileKey] : item.href;
    const external = new URL(href, routes.root).origin !== new URL(routes.root).origin;
    return `<a href="${escape(new URL(href, routes.root).href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(item.label)}</a>`;
  };
  const cvLink = (label = data.cv.label) => `<a href="${asset(data.cv.href)}" download="${escape(data.cv.filename)}">${escape(label)}</a>`;

  document.querySelector('#profile-content').innerHTML = `
    <img src="${asset(data.profile.portrait)}" alt="${escape(data.profile.name)}" class="profile" width="180" height="180">
    <h1>${escape(data.profile.name)}</h1><p class="tagline">${escape(data.profile.tagline)}</p>
    <div class="cta-container"><a href="${asset('internship.html')}" class="stage-cta">${escape(data.recruitment.cta)}</a></div>
    <div class="header-badges">${data.profile.badges.map(badge => `<div class="badge">${escape(badge)}</div>`).join('')}</div>
    <div class="header-links">${data.profile.links.map(item => item.type === 'cv' ? cvLink(item.label) : link(item)).join('')}</div>`;
  document.getElementById('island-invitation').innerHTML = `<a class="btn island-cta" href="${escape(routes.island)}" aria-describedby="island-subtitle">${escape(data.interactive.cta)}</a><p id="island-subtitle">${escape(data.interactive.subtitle)}</p>`;

  section('about', `<div class="about-content"><div class="about-text"><h3>${escape(data.about.heading)}</h3>${data.about.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}<a href="#contact" class="btn">Me contacter</a></div></div>`);
  section('experience', data.experience.items.map(item => `<article class="experience-card"><div class="experience-meta">${escape(item.meta)}</div><h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p><div class="project-tech">${tags(item.tags)}</div>${list(item.achievements)}</article>`).join(''));
  section('skills', `<div class="skills-grid-wrapper">${data.skills.groups.map(group => `<div class="skill-group"><h3>${escape(group.title)}</h3><div class="skill-grid">${group.items.map(item => `<div class="skill-card"><img src="${asset(item.icon)}" class="skill-icon" alt="" width="30" height="30" loading="lazy"><span>${escape(item.label)}</span></div>`).join('')}</div></div>`).join('')}</div>`);
  section('projects', `<div class="projects-container">${data.projects.items.map(project => `
    <article class="project-card${project.featured ? ' featured-project' : ''}" data-project="${escape(project.id)}">
      ${project.image ? `<div class="project-image"><img src="${asset(project.image.src)}" alt="${escape(project.image.alt)}" width="960" height="480" loading="lazy" decoding="async"></div>` : '<div class="project-image island-project-banner" aria-hidden="true"><span>SKY<br>ISLAND</span><span class="island-project-mark">3D</span></div>'}
      <div class="project-content"><p class="project-context">${escape(project.context)}</p><h3>${escape(project.title)}</h3><div class="project-tech">${tags(project.tags)}</div><p>${escape(project.description)}</p><p class="project-proof"><strong>Compétences mobilisées :</strong> ${escape(project.skills)}</p><details class="project-details"><summary>Voir les détails</summary>${list(project.details)}</details>${project.links.map(item => `<div class="project-source">${link(item)}</div>`).join('')}</div>
    </article>`).join('')}</div>`);
  section('certificates', `<div class="certificates-container">${data.certificates.items.map(item => `<article class="certificate-card"><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><img src="${asset(item.image)}" alt="${escape(item.title)}" class="certificate-image" width="300" height="210" loading="lazy"><div class="certificate-link">${link(item.link)}</div></article>`).join('')}</div>`);
  section('contact', `<div class="contact-container"><div class="contact-info"><div class="contact-item"><div class="contact-details"><h3>Localisation</h3><p>${escape(data.recruitment.location)}</p></div></div><div class="contact-item"><div class="contact-details"><h3>Email</h3><a href="mailto:${escape(data.profile.email)}">${escape(data.profile.email)}</a></div></div><div class="contact-item"><div class="contact-details"><h3>Réseaux sociaux</h3><div class="contact-social-links">${data.contact.links.map(link).join('')}</div></div></div></div></div>`);
  document.querySelectorAll('[data-portfolio-cv]').forEach(anchor => { anchor.href = routes.asset(data.cv.href); anchor.download = data.cv.filename; });
  document.querySelectorAll('[data-portfolio-contact]').forEach(anchor => { anchor.href = `mailto:${data.profile.email}`; });
})();
