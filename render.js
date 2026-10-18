(async function () {
  let content;
  try {
    const res = await fetch('content.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    content = await res.json();
  } catch (err) {
    console.error('Could not load content.json:', err);
    return;
  }
  window.siteContent = content;

  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), content);

  const icons = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    help: '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
    check: '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
    info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
    cart: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
    tick: '<polyline points="20 6 9 17 4 12"></polyline>'
  };

  const svg = (name, size) =>
    `<svg${size ? ` width="${size}" height="${size}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;

  const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const mount = (selector, html) => { document.querySelector(selector).innerHTML = html; };

  // Static bindings: data-text, data-placeholder, data-aria-label
  const bindings = [
    ['data-text', (el, v) => { el.textContent = v; }],
    ['data-placeholder', (el, v) => { el.placeholder = v; }],
    ['data-aria-label', (el, v) => { el.setAttribute('aria-label', v); }]
  ];
  bindings.forEach(([name, apply]) => {
    document.querySelectorAll(`[${name}]`).forEach((el) => {
      const path = el.getAttribute(name);
      const value = get(path);
      if (value === undefined) {
        console.warn(`content.json: missing "${path}"`);
        return;
      }
      apply(el, value);
    });
  });

  document.title = content.meta.title;
  document.querySelector('meta[name="description"]').content = content.meta.description;
  document.documentElement.lang = content.meta.lang;

  // Callouts: content is a string, an array of strings, or {title, content} lead-in paragraphs
  const paragraph = (p) =>
    typeof p === 'string' ? `<p>${p}</p>` : `<p><strong>${p.title}</strong> ${p.content}</p>`;
  document.querySelectorAll('[data-callout]').forEach((el) => {
    const d = get(el.dataset.callout);
    if (d.type) el.classList.add(`callout-${d.type}`);
    el.innerHTML =
      `<div class="callout-header"><span class="callout-icon">${d.icon}</span><div class="callout-title">${d.title}</div></div>` +
      [].concat(d.content).map(paragraph).join('');
  });

  document.querySelectorAll('[data-paragraphs]').forEach((el) => {
    el.innerHTML = get(el.dataset.paragraphs).map(paragraph).join('');
  });

  mount('#navLinks', content.navigation.links.map((l, i) =>
    `<a href="#${l.id}" class="nav-link${i === 0 ? ' active' : ''}">${svg(l.icon)}${l.label}</a>`).join(''));

  mount('#heroStats', content.hero.stats.map((s) =>
    `<div class="stat-card"><div class="stat-number">${s.number}</div><div class="stat-label">${s.label}</div></div>`).join(''));

  mount('#heroActions', content.hero.actions.map((a) =>
    `<a href="${a.href}" class="action-btn action-btn-${a.type}">${svg(a.icon, 18)}${a.label}</a>`).join(''));

  mount('#conceptsGrid', content.keyConcepts.concepts.map((c) =>
    `<div class="concept-card"><div class="concept-icon-box">${c.icon}</div><div class="concept-title">${c.title}</div><div class="concept-description">${c.description}</div></div>`).join(''));

  mount('#whoGrid', content.whoGuidelines.ageGroups.map((g) =>
    `<div class="who-card">
      <div class="who-card-header"><span class="who-age-badge">${g.age}</span><span class="who-rule-tag who-tag-${g.tag.type}">${g.tag.label}</span></div>
      <div class="who-card-body">
        <div class="who-main-rule"><span>${g.icon}</span> ${g.rule}</div>
        <p>${g.description}</p>
        <div class="who-bullets-box">
          <div class="who-bullets-title">${g.reasons.title}</div>
          <ul class="who-list">${g.reasons.items.map((i) => `<li>${svg('tick')}${i}</li>`).join('')}</ul>
        </div>
      </div>
    </div>`).join(''));

  const sources = content.whoGuidelines.officialSources.items;
  mount('#whoSources', sources.map((s, i) =>
    `<li${i < sources.length - 1 ? ' style="margin-bottom: 0.75rem;"' : ''}><strong>${s.title}</strong>${s.year ? ` (${s.year})` : ''}${s.note ? ` ${s.note}` : ''}<br><a href="${attr(s.url)}" target="_blank" rel="noopener" class="resource-link">${s.linkLabel}</a></li>`).join(''));

  mount('#booksGrid', content.books.items.map((b) =>
    `<article class="book-card" data-title="${attr(b.searchTerms)}">
      <span class="book-badge">${b.badge}</span>
      <div class="book-title">${b.title}</div>
      <div class="book-author">${b.author}</div>
      <div class="book-description">${b.description}</div>
      <div class="book-links">${b.links.map((l) =>
        `<a href="${attr(l.url)}" class="book-link" target="_blank" rel="noopener">${svg(l.icon)}${l.label}</a>`).join('')}</div>
    </article>`).join(''));

  mount('#authorsGrid', content.thinkers.items.map((t) =>
    `<div class="author-card">
      <div class="author-avatar"${t.specialGradient ? ' style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%);"' : ''}>${t.initials}</div>
      <div class="author-info"><div class="author-name">${t.name}</div><div class="author-specialty">${t.specialty}</div><div class="author-bio">${t.bio}</div></div>
    </div>`).join(''));

  mount('#resourcesList', content.research.items.map((r) =>
    `<article class="resource-card">
      <div class="resource-header"><div class="resource-title">${r.title}</div><span class="resource-badge">${r.badge}</span></div>
      <div class="resource-description">${r.description}</div>
      ${r.url ? `<div><a href="${attr(r.url)}" class="resource-link" target="_blank" rel="noopener">${r.linkLabel}${svg('external')}</a></div>` : ''}
    </article>`).join(''));

  mount('#practicalGrid', content.practical.sections.map((s) =>
    `<div class="practical-card">
      <div class="practical-card-header"><div class="practical-card-icon">${s.icon}</div><div class="practical-card-title">${s.title}</div></div>
      <ul class="tips-list">${s.tips.map((t, i) =>
        `<li class="tip-item"><span class="tip-number">${i + 1}</span><div class="tip-content"><strong>${t.title}</strong>${t.content}</div></li>`).join('')}</ul>
    </div>`).join(''));

  // app.js queries rendered elements on load, so it must run after rendering
  const script = document.createElement('script');
  script.src = 'app.js';
  document.body.appendChild(script);
})();
