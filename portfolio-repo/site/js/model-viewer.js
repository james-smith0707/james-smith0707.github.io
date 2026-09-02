/**
 * model-viewer.js
 * Renders a rotating STL model into any element with [data-model-src].
 * Auto-rotates when idle; drag/touch to orbit manually.
 *
 * Usage in HTML:
 *   <div class="model-block" data-model-src="media/projects/x/part.stl"></div>
 *
 * Requires (loaded before this file, see index.html / project.html):
 *   three.min.js
 *   STLLoader.js
 */
(function () {
  function initViewer(container) {
    const src = container.getAttribute('data-model-src');
    if (!src || typeof THREE === 'undefined') return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 5000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // lighting — flat, technical, not dramatic
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(1, 1, 1);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x235789, 0.4);
    rim.position.set(-1, -0.5, -1);
    scene.add(rim);

    const material = new THREE.MeshStandardMaterial({
      color: 0xedeff1,
      metalness: 0.15,
      roughness: 0.55,
    });

    const group = new THREE.Group();
    scene.add(group);

    const loader = new THREE.STLLoader();
    loader.load(
      src,
      function (geometry) {
        geometry.center();
        geometry.computeBoundingSphere();
        const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 1;
        const scale = radius > 0 ? 30 / radius : 1;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.setScalar(scale);
        group.add(mesh);
        camera.position.set(0, 0, 90);
      },
      undefined,
      function (err) {
        container.innerHTML =
          '<div style="color:#EDEFF1;font-family:monospace;font-size:0.75rem;padding:14px;opacity:0.6;">Model failed to load — check data-model-src path.</div>';
        console.warn('STL load error for', src, err);
      }
    );

    // ---- interaction: auto-rotate, pause + orbit on drag ----
    let autoRotate = true;
    let dragging = false;
    let lastX = 0, lastY = 0;
    let idleTimer = null;

    function resumeAutoRotateAfterIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { autoRotate = true; }, 2500);
    }

    function onPointerDown(e) {
      dragging = true;
      autoRotate = false;
      const p = e.touches ? e.touches[0] : e;
      lastX = p.clientX; lastY = p.clientY;
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - lastX;
      const dy = p.clientY - lastY;
      lastX = p.clientX; lastY = p.clientY;
      group.rotation.y += dx * 0.01;
      group.rotation.x += dy * 0.01;
    }
    function onPointerUp() {
      dragging = false;
      resumeAutoRotateAfterIdle();
    }

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    renderer.domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    function animate() {
      requestAnimationFrame(animate);
      if (autoRotate) group.rotation.y += 0.006;
      renderer.render(scene, camera);
    }
    animate();

    // responsive resize
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth, h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);
  }

  // Lazy-init: only spin up WebGL for models actually scrolled into view.
  function observeAndInit() {
    const targets = document.querySelectorAll('[data-model-src]');
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            initViewer(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px' }
    );
    targets.forEach((el) => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAndInit);
  } else {
    observeAndInit();
  }

  // Exposed so pages that inject blocks dynamically (project.html) can
  // trigger a re-scan for newly-added [data-model-src] elements.
  window.ModelViewer = { scan: observeAndInit };
})();
