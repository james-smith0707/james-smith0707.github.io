/**
 * render-project.js — project detail page script.
 * Reads ?slug=<project-slug> from the URL, finds that project in
 * data/projects.json, and renders its blocks IN THE ORDER GIVEN in the
 * YAML file — this is what makes block order (gallery, then photo, then
 * text, then photo...) fully author-controlled per project.
 */
(function () {
  async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to fetch ' + path);
    return res.json();
  }

  function el(tag, className, html) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function renderTitleBlock(project) {
    const dl = el('dl');
    const rows = [
      ['DATES', project.dates],
      ['TAGS', (project.tags || []).join(', ')],
      ['TOOLS', (project.tools || []).join(', ')],
    ];
    rows.forEach(([label, value]) => {
      if (!value) return;
      dl.appendChild(el('dt', null, label));
      dl.appendChild(el('dd', null, value));
    });
    const wrap = el('div', 'title-block');
    wrap.appendChild(dl);
    return wrap;
  }

  function renderMainMedia(mainMedia) {
    if (!mainMedia) return null;
    const wrap = el('div', 'block');
    if (mainMedia.type === 'image') {
      const img = el('img');
      img.src = mainMedia.src;
      img.alt = mainMedia.title || '';
      wrap.appendChild(img);
    } else if (mainMedia.type === 'video') {
      const video = el('video');
      video.src = mainMedia.src;
      video.controls = true;
      if (mainMedia.poster) video.poster = mainMedia.poster;
      wrap.appendChild(video);
    } else if (mainMedia.type === 'stl') {
      const modelDiv = el('div', 'model-block');
      modelDiv.setAttribute('data-model-src', mainMedia.src);
      modelDiv.appendChild(el('div', 'model-hint', 'DRAG TO ROTATE'));
      wrap.appendChild(modelDiv);
    }
    if (mainMedia.title) wrap.appendChild(el('div', 'block-caption-title', mainMedia.title));
    if (mainMedia.caption) wrap.appendChild(el('p', 'block-caption-text', mainMedia.caption));
    return wrap;
  }

  function renderBlock(block) {
    const wrap = el('div', 'block block-' + block.type);

    if (block.type === 'text') {
      const p = el('p');
      p.textContent = block.content.trim();
      wrap.classList.add('block-text');
      wrap.appendChild(p);
      return wrap;
    }

    if (block.type === 'photo') {
      const img = el('img');
      img.src = block.src;
      img.alt = block.title || '';
      img.loading = 'lazy';
      wrap.appendChild(img);
      if (block.title) wrap.appendChild(el('div', 'block-caption-title', block.title));
      if (block.caption) wrap.appendChild(el('p', 'block-caption-text', block.caption));
      return wrap;
    }

    if (block.type === 'gallery') {
      if (block.title) wrap.appendChild(el('div', 'gallery-heading', block.title));
      const grid = el('div', 'gallery-grid');
      (block.items || []).forEach((item) => {
        const item_wrap = el('div', 'gallery-item');
        const figure = el('figure');
        const img = el('img');
        img.src = item.src;
        img.alt = item.title || '';
        img.loading = 'lazy';
        figure.appendChild(img);
        if (item.title) figure.appendChild(el('div', 'block-caption-title', item.title));
        if (item.caption) figure.appendChild(el('p', 'block-caption-text', item.caption));
        item_wrap.appendChild(figure);
        grid.appendChild(item_wrap);
      });
      wrap.appendChild(grid);
      return wrap;
    }

    if (block.type === 'video') {
      const video = el('video');
      video.src = block.src;
      video.controls = true;
      if (block.poster) video.poster = block.poster;
      wrap.appendChild(video);
      if (block.title) wrap.appendChild(el('div', 'block-caption-title', block.title));
      if (block.caption) wrap.appendChild(el('p', 'block-caption-text', block.caption));
      return wrap;
    }

    if (block.type === 'stl') {
      const modelDiv = el('div', 'model-block');
      modelDiv.setAttribute('data-model-src', block.src);
      modelDiv.appendChild(el('div', 'model-hint', 'DRAG TO ROTATE'));
      wrap.appendChild(modelDiv);
      if (block.title) wrap.appendChild(el('div', 'block-caption-title', block.title));
      if (block.caption) wrap.appendChild(el('p', 'block-caption-text', block.caption));
      return wrap;
    }

    return wrap;
  }

  async function main() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const headerEl = document.querySelector('[data-project-header]');
    const bodyEl = document.querySelector('[data-project-body]');

    if (!slug) {
      if (bodyEl) bodyEl.innerHTML = '<p>No project specified.</p>';
      return;
    }

    try {
      const projects = await fetchJSON('data/projects.json');
      const project = projects.find((p) => p.slug === slug);
      if (!project) {
        if (bodyEl) bodyEl.innerHTML = `<p>Project "${slug}" not found.</p>`;
        return;
      }

      document.title = project.title;

      if (headerEl) {
        headerEl.innerHTML = '';
        headerEl.appendChild(el('h1', null, project.title));
        if (project.subtitle) headerEl.appendChild(el('p', 'subtitle', project.subtitle));
        headerEl.appendChild(renderTitleBlock(project));
        const summary = el('p', null, project.short_description);
        summary.style.marginTop = '20px';
        summary.style.maxWidth = '68ch';
        headerEl.appendChild(summary);

        if (project.links) {
          const linksWrap = el('div', 'hero-links');
          linksWrap.style.marginTop = '14px';
          Object.entries(project.links).forEach(([label, href]) => {
            const a = el('a', null, label.charAt(0).toUpperCase() + label.slice(1));
            a.href = href;
            a.target = '_blank';
            a.rel = 'noopener';
            linksWrap.appendChild(a);
          });
          headerEl.appendChild(linksWrap);
        }
      }

      if (bodyEl) {
        bodyEl.innerHTML = '';
        const mainMediaEl = renderMainMedia(project.main_media);
        if (mainMediaEl) bodyEl.appendChild(mainMediaEl);

        // Ordered exactly as authored in the YAML file's `blocks:` list —
        // this is the "gallery, then photo, then text, then photo..." control.
        (project.blocks || []).forEach((block) => {
          bodyEl.appendChild(renderBlock(block));
        });
      }

      if (window.ModelViewer) window.ModelViewer.scan();
    } catch (err) {
      console.error(err);
      if (bodyEl) bodyEl.innerHTML = '<p>Could not load project.</p>';
    }
  }

  main();
})();
