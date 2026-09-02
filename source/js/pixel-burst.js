'use strict';

(function exposePixelBurst(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;

  if (root && root.document) {
    const start = () => api.installPixelBurst(root);
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  }
})(typeof window === 'undefined' ? null : window, function pixelBurstModule() {
  const SPARK_COUNT = 4;

  function createBurst(win, x, y) {
    const burst = win.document.createElement('span');
    burst.className = 'pixel-burst';
    burst.setAttribute('aria-hidden', 'true');
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;

    for (let index = 0; index < SPARK_COUNT; index += 1) {
      const spark = win.document.createElement('i');
      spark.className = 'pixel-burst__spark';
      burst.appendChild(spark);
    }

    win.document.body.appendChild(burst);

    let expiry = 0;
    const remove = () => {
      if (expiry) win.clearTimeout(expiry);
      burst.remove();
    };
    burst.addEventListener('animationend', remove, { once: true });
    expiry = win.setTimeout(remove, 440);

    return burst;
  }

  function installPixelBurst(win) {
    if (!win || !win.document || typeof win.matchMedia !== 'function') return () => {};
    if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
    if (!win.matchMedia('(pointer: fine)').matches) return () => {};

    const draw = (event) => {
      if (event.button !== 0) return;
      createBurst(win, event.clientX, event.clientY);
    };

    win.document.addEventListener('pointerdown', draw, { passive: true });
    return () => win.document.removeEventListener('pointerdown', draw);
  }

  return { createBurst, installPixelBurst };
});
