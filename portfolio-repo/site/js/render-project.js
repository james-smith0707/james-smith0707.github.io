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

  // ---- video play_type handling ----------------------------------
  // automatic: autoplay + loop, muted (browser autoplay policy)
  // once:      plays a single time when scrolled into view, then stops
  // button:    shows a play-button overlay; playback starts on click
  // boomerang: plays forward, then scrubs back to the start, repeats
  const lazyPlayObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          if (video.dataset.playType === 'once') lazyPlayObserver.unobserve(video);
        } else if (video.dataset.playType !== 'once') {
          video.pause();
        }
      });
    },
    { threshold: 0.4 }
  );

  function setupBoomerang(video) {
    let reversing = false;
    const step = 1 / 30; // seconds per manual-scrub frame, ~30fps reverse
    function reverseTick() {
      if (!reversing) return;
      if (video.currentTime <= 0.02) {
        reversing = false;
        video.currentTime = 0;
        video.play().catch(() => {});
        return;
      }
      video.currentTime = Math.max(0, video.currentTime - step);
      requestAnimationFrame(reverseTick);
    }
    video.addEventListener('ended', () => {
      reversing = true;
      requestAnimationFrame(reverseTick);
    });
  }

  function applyPlayType(video, playType) {
    video.dataset.playType = playType || 'automatic';
    video.muted = true;
    video.playsInline = true;

    if (playType === 'button') {
      video.controls = false;
      video.loop = true;
      return; // playback starts on user click — wired up by caller
    }
    if (playType === 'once') {
      video.controls = true;
      video.loop = false;
      lazyPlayObserver.observe(video);
      return;
    }
    if (playType === 'boomerang') {
      video.controls = false;
      video.loop = false;
      video.autoplay = true;
      setupBoomerang(video);
      lazyPlayObserver.observe(video);
      return;
    }
    // "automatic" (default)
    video.controls = true;
    video.loop = true;
    video.autoplay = true;
    lazyPlayObserver.observe(video);
  }

  function buildVideoEl(data) {
    const video = el('video');
    video.src = data.src;
    if (data.poster) video.poster = data.poster;
    applyPlayType(video, data.play_type);

    if (data.play_type === 'button') {
      const wrap = el('div', 'video-wrap');
      wrap.appendChild(video);
      const btn = el('button', 'video-play-btn');
      btn.setAttribute('aria-label', 'Play video');
      const icon = el('div', 'play-icon', '&#9654;');
      btn.appendChild(icon);
      btn.addEventListener('click', () => {
        video.controls = true;
        video.play().catch(() => {});
        btn.remove();
      });
      wrap.appendChild(btn);
      return wrap;
    }
    return video;
  }

  function frame(mediaEl) {
    const f = el('div', 'media-frame');
    f.appendChild(mediaEl);
    return f;
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
      wrap.appendChild(frame(img));
    } else if (mainMedia.type === 'video') {
      wrap.appendChild(frame(buildVideoEl(mainMedia)));
    } else if (mainMedia.type === 'stl') {
      const modelDiv = el('div', 'model-block');
      modelDiv.setAttribute('data-model-src', mainMedia.src);
      if (mainMedia.background) modelDiv.setAttribute('data-model-bg', mainMedia.background);
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
      wrap.classList.add('block-text');
      if (block.title) wrap.appendChild(el('div', 'block-title', block.title));
      const p = el('p');
      p.textContent = block.content.trim();
      wrap.appendChild(p);
      return wrap;
    }

    if (block.type === 'photo') {
      const img = el('img');
      img.src = block.src;
      img.alt = block.title || '';
      img.loading = 'lazy';
      wrap.appendChild(frame(img));
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
        figure.appendChild(frame(img));
        if (item.title) figure.appendChild(el('div', 'block-caption-title', item.title));
        if (item.caption) figure.appendChild(el('p', 'block-caption-text', item.caption));
        item_wrap.appendChild(figure);
        grid.appendChild(item_wrap);
      });
      wrap.appendChild(grid);
      return wrap;
    }

    if (block.type === 'carousel') {
      if (block.title) wrap.appendChild(el('div', 'carousel-heading', block.title));
      const carouselEl = el('div', 'carousel');
      wrap.appendChild(carouselEl);
      // deferred: needs to be in the DOM first for width measurements,
      // so caller triggers Carousel.init after appending (see main()).
      wrap.dataset.pendingCarousel = 'true';
      wrap._carouselItems = block.items || [];
      wrap._carouselEl = carouselEl;
      return wrap;
    }

    if (block.type === 'video') {
      wrap.appendChild(frame(buildVideoEl(block)));
      if (block.title) wrap.appendChild(el('div', 'block-caption-title', block.title));
      if (block.caption) wrap.appendChild(el('p', 'block-caption-text', block.caption));
      return wrap;
    }

    if (block.type === 'stl') {
      const modelDiv = el('div', 'model-block');
      modelDiv.setAttribute('data-model-src', block.src);
      if (block.background) modelDiv.setAttribute('data-model-bg', block.background);
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
        const pendingCarousels = [];
        (project.blocks || []).forEach((block) => {
          const rendered = renderBlock(block);
          bodyEl.appendChild(rendered);
          if (rendered.dataset && rendered.dataset.pendingCarousel) pendingCarousels.push(rendered);
        });

        // Now that carousel containers are in the DOM (and have a real
        // width), initialize each one.
        pendingCarousels.forEach((wrap) => {
          if (window.Carousel) window.Carousel.init(wrap._carouselEl, wrap._carouselItems);
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
