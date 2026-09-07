/**
 * carousel.js — swipe/click-through image carousel.
 * Usage: window.Carousel.init(containerEl, items)
 *   items: [{src, title, caption}, ...]
 * containerEl should be an empty element with class "carousel".
 */
(function () {
  function el(tag, className, html) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function init(container, items) {
    if (!items || !items.length) return;

    let index = 0;
    const viewport = el('div', 'carousel-viewport');
    const track = el('div', 'carousel-track');

    const slides = items.map((item) => {
      const slide = el('div', 'carousel-slide');
      const frame = el('div', 'media-frame');
      const img = el('img');
      img.src = item.src;
      img.alt = item.title || '';
      img.loading = 'lazy';
      frame.appendChild(img);
      slide.appendChild(frame);
      track.appendChild(slide);
      return slide;
    });
    viewport.appendChild(track);
    container.appendChild(viewport);

    // prev/next controls
    const controls = el('div', 'carousel-controls');
    const prevBtn = el('button', 'carousel-btn', '&#8249;');
    const nextBtn = el('button', 'carousel-btn', '&#8250;');
    prevBtn.setAttribute('aria-label', 'Previous image');
    nextBtn.setAttribute('aria-label', 'Next image');
    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    container.appendChild(controls);

    // dot indicators
    const dotsWrap = el('div', 'carousel-dots');
    const dots = items.map((_, i) => {
      const dot = el('button', 'carousel-dot');
      dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
      return dot;
    });
    container.appendChild(dotsWrap);

    // caption (updates per-slide)
    const caption = el('div', 'carousel-caption');
    container.appendChild(caption);

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      const item = items[index];
      caption.innerHTML = '';
      if (item.title) caption.appendChild(el('div', 'block-caption-title', item.title));
      if (item.caption) caption.appendChild(el('p', 'block-caption-text', item.caption));
    }

    function goTo(i) {
      index = (i + items.length) % items.length;
      render();
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    // keyboard support when the carousel has focus
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    });

    // swipe / drag support
    let startX = 0, deltaX = 0, dragging = false;
    function dragStart(e) {
      dragging = true;
      startX = (e.touches ? e.touches[0] : e).clientX;
      track.style.transition = 'none';
    }
    function dragMove(e) {
      if (!dragging) return;
      deltaX = (e.touches ? e.touches[0] : e).clientX - startX;
      track.style.transform = `translateX(calc(-${index * 100}% + ${deltaX}px))`;
    }
    function dragEnd() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      const threshold = viewport.clientWidth * 0.15;
      if (deltaX > threshold) goTo(index - 1);
      else if (deltaX < -threshold) goTo(index + 1);
      else render();
      deltaX = 0;
    }
    track.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);
    track.addEventListener('touchstart', dragStart, { passive: true });
    track.addEventListener('touchmove', dragMove, { passive: true });
    track.addEventListener('touchend', dragEnd);

    render();
  }

  window.Carousel = { init };
})();
