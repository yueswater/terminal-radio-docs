/* The shared, full-width website chrome.

   Stellar remains responsible for Markdown, syntax highlighting and page
   metadata. The product site supplies its own navbar and footer so the brand
   is not squeezed into the theme's fixed-width documentation sidebar. */

const NAVIGATION = {
  'zh-TW': {
    aria: '主要導覽',
    skip: '跳至主要內容',
    home: '首頁',
    guide: '使用教學',
    about: '關於',
    license: '版權',
    language: 'English',
    languageCode: 'en',
    brand: '拾波',
    soundOn: '關閉轉場音效',
    soundOff: '開啟轉場音效',
  },
  en: {
    aria: 'Primary navigation',
    skip: 'Skip to main content',
    home: 'Home',
    guide: 'Guide',
    about: 'About',
    license: 'License',
    language: '繁體中文',
    languageCode: 'zh-TW',
    brand: 'Wavepick',
    soundOn: 'Mute transition sounds',
    soundOff: 'Enable transition sounds',
  },
};

function publicPath(html) {
  const match = html.match(/<meta property="og:url" content="([^"]+)">/);
  if (!match) return '/';
  try {
    return new URL(match[1]).pathname;
  } catch (_error) {
    return '/';
  }
}

function navLink(url, label, currentPath) {
  const current = currentPath === url ? ' aria-current="page"' : '';
  return `<a href="${url}"${current}>${label}</a>`;
}

hexo.extend.filter.register('after_render:html', (html) => {
  const english = /<html lang="en"/.test(html);
  const locale = english ? 'en' : 'zh-TW';
  const text = NAVIGATION[locale];
  const root = english ? '/en/' : '/';
  const prefix = english ? '/en' : '';
  const path = publicPath(html);
  const translatedPath = english
    ? path.replace(/^\/en(?=\/|$)/, '') || '/'
    : `/en${path}`;
  const landing = /class="site-hero"/.test(html);

  const navbar = `
    <a class="skip-link" href="#main">${text.skip}</a>
    <header class="site-navbar">
      <div class="site-navbar__inner">
        <a class="site-brand" href="${root}" aria-label="terminal-radio">
          <img no-lazy src="/images/favicon.svg" width="36" height="36" alt="">
          <span class="site-brand__name">${text.brand}</span>
        </a>
        <nav class="site-nav" aria-label="${text.aria}">
          ${navLink(root, text.home, path)}
          ${navLink(`${prefix}/docs/`, text.guide, path)}
          ${navLink(`${prefix}/about/`, text.about, path)}
          ${navLink(`${prefix}/license/`, text.license, path)}
        </nav>
        <div class="site-navbar__tools">
          <button class="sound-toggle" type="button" aria-pressed="true" aria-label="${text.soundOn}" title="${text.soundOn}" data-enabled-label="${text.soundOn}" data-disabled-label="${text.soundOff}">SFX</button>
          <a class="language-switch" href="${translatedPath}" lang="${text.languageCode}" hreflang="${text.languageCode}" aria-label="${text.language}" title="${text.language}">
            <span class="language-switch__label" aria-hidden="true">${english ? '中' : 'EN'}</span>
          </a>
        </div>
      </div>
    </header>`;

  const transitionLayer = `
    <div class="page-transition" aria-hidden="true">
      <div class="tuning-display">
        <div class="tuning-label">${english ? 'TUNING WAVE' : '正在調頻'}<span class="tuning-dots">...</span></div>
        <div class="tuning-wave">
          ${'<span></span>'.repeat(15)}
        </div>
        <div class="tuning-frequency">${english ? 'SEARCHING SIGNAL' : '搜尋訊號'}</div>
      </div>
    </div>`;

  const footer = `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <span>© <a href="https://yueswater.com" target="_blank" rel="noopener">2026 Anthony Sung</a></span>
        <span class="site-footer__links">
          <a href="${prefix}/license/">MIT</a>
          <a href="https://github.com/yueswater/terminal-radio">GitHub</a>
          <a href="https://pypi.org/project/radiotui-tw/">PyPI</a>
        </span>
      </div>
    </footer>`;

  const siteScript = `<script>
    (() => {
      const navbar = document.querySelector('.site-navbar');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const soundToggle = document.querySelector('.sound-toggle');
      const soundPreferenceKey = 'wavepick-transition-sfx';
      let soundEnabled = true;
      let audioContext = null;

      try { soundEnabled = localStorage.getItem(soundPreferenceKey) !== 'off'; } catch (_error) {}

      const syncSoundToggle = () => {
        if (!soundToggle) return;
        const label = soundEnabled
          ? soundToggle.dataset.enabledLabel
          : soundToggle.dataset.disabledLabel;
        soundToggle.classList.toggle('is-muted', !soundEnabled);
        soundToggle.setAttribute('aria-pressed', String(soundEnabled));
        soundToggle.setAttribute('aria-label', label);
        soundToggle.setAttribute('title', label);
      };
      syncSoundToggle();

      if (soundToggle) {
        soundToggle.addEventListener('click', () => {
          soundEnabled = !soundEnabled;
          try {
            localStorage.setItem(soundPreferenceKey, soundEnabled ? 'on' : 'off');
          } catch (_error) {}
          syncSoundToggle();
        });
      }

      const playTransitionSound = () => {
        if (!soundEnabled || !window.WavepickTransitionSfx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        try {
          if (!audioContext || audioContext.state === 'closed') {
            audioContext = new AudioContextClass();
          }
          if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
          window.WavepickTransitionSfx.scheduleTransitionSounds(
            audioContext,
            audioContext.currentTime + 0.015,
          );
        } catch (_error) {
          // Audio is decorative; navigation remains reliable when a browser
          // or user policy blocks Web Audio.
        }
      };

      // Stellar makes <body> the scroll container, but its height can still
      // equal the viewport while this inline script is initialising. Resolve
      // it when used instead of caching the wrong element at startup.
      const getScrollContainer = () => {
        const bodyOverflow = getComputedStyle(document.body).overflowY;
        return /auto|scroll/.test(bodyOverflow)
          ? document.body
          : document.scrollingElement;
      };
      const getScrollTop = () => {
        const container = getScrollContainer();
        return container ? container.scrollTop : window.scrollY;
      };
      const getDocumentTop = (element) => element.getBoundingClientRect().top + getScrollTop();
      let scrollFrame = null;

      const maxScrollTop = (container) => Math.max(0,
        container.scrollHeight - container.clientHeight);
      const clampScrollTop = (container, top) => Math.min(
        maxScrollTop(container), Math.max(0, top));

      function animateScrollTo(top, duration = 360, steps = 12) {
        const container = getScrollContainer();
        if (!container) return;
        if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);

        const start = container.scrollTop;
        const destination = clampScrollTop(container, top);
        if (reducedMotion || Math.abs(destination - start) < 2) {
          container.scrollTop = destination;
          scrollFrame = null;
          return;
        }

        const startedAt = performance.now();
        const tick = (now) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const stepped = Math.min(1, Math.floor(eased * steps) / steps);
          const position = start + (destination - start) * stepped;
          // A four-pixel grid keeps motion visibly digital without making
          // trackpads feel unresponsive.
          container.scrollTop = Math.round(position / 4) * 4;
          if (progress < 1) scrollFrame = requestAnimationFrame(tick);
          else {
            container.scrollTop = destination;
            scrollFrame = null;
          }
        };
        scrollFrame = requestAnimationFrame(tick);
      }

      const syncNavbar = () => navbar && navbar.classList.toggle('is-scrolled', getScrollTop() > 8);
      syncNavbar();
      document.addEventListener('scroll', syncNavbar, { capture: true, passive: true });
      window.addEventListener('scroll', syncNavbar, { passive: true });

      function initToc() {
        const links = Array.from(document.querySelectorAll('#data-toc a.toc-link'));
        const entries = links.map((link) => {
          const href = link.getAttribute('href') || '';
          if (!href.startsWith('#')) return null;
          let id = href.slice(1);
          try { id = decodeURIComponent(id); } catch (_error) {}
          const heading = document.getElementById(id);
          return heading ? { link, heading, href } : null;
        }).filter(Boolean);
        if (!entries.length) return;

        const readingOffset = () => (navbar ? navbar.offsetHeight : 0) + 24;
        let frame = null;
        const updateActive = () => {
          frame = null;
          const readingLine = getScrollTop() + readingOffset() + 4;
          let current = entries[0];
          for (const entry of entries) {
            const headingTop = getDocumentTop(entry.heading);
            if (headingTop <= readingLine) current = entry;
            else break;
          }
          for (const entry of entries) {
            const active = entry === current;
            entry.link.classList.remove('active');
            entry.link.classList.toggle('is-reading', active);
            if (active) entry.link.setAttribute('aria-current', 'location');
            else entry.link.removeAttribute('aria-current');
          }
        };
        const scheduleUpdate = () => {
          if (frame === null) frame = requestAnimationFrame(updateActive);
        };

        document.addEventListener('click', (event) => {
          const link = event.target.closest('#data-toc a.toc-link');
          if (!link) return;
          const entry = entries.find((item) => item.link === link);
          if (!entry) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          const top = getDocumentTop(entry.heading) - readingOffset();
          animateScrollTo(top, 440, 14);
          history.pushState(null, '', entry.href);
          requestAnimationFrame(updateActive);
        }, true);

        document.addEventListener('scroll', scheduleUpdate, { capture: true, passive: true });
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate, { passive: true });
        updateActive();
      }
      initToc();

      document.addEventListener('click', (event) => {
        const control = event.target.closest('[data-scroll-top]');
        if (!control) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        animateScrollTo(0, 440, 14);
        history.replaceState(null, '', location.pathname + location.search);
      }, true);

      const transitionKey = 'wavepick-transition';
      try {
        if (!reducedMotion && sessionStorage.getItem(transitionKey)) {
          sessionStorage.removeItem(transitionKey);
          document.body.classList.add('is-page-entering');
          window.setTimeout(() => document.body.classList.remove('is-page-entering'), 600);
        }
      } catch (_error) {}

      document.addEventListener('click', (event) => {
        if (reducedMotion || event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a[href]');
        if (!link || link.hasAttribute('download') || link.target === '_blank') return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        const destination = new URL(link.href, window.location.href);
        if (destination.origin !== window.location.origin || destination.href === window.location.href) return;
        event.preventDefault();
        if (document.body.classList.contains('is-page-leaving')) return;
        document.body.classList.add('is-page-leaving');
        playTransitionSound();
        try { sessionStorage.setItem('wavepick-transition', '1'); } catch (_error) {}
        window.setTimeout(() => window.location.assign(destination.href), 680);
      }, true);
    })();
  </script>`;

  return html
    .replace('</head>', '<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">\n</head>')
    .replace('<body>', `<body class="${landing ? 'is-landing' : 'is-content'}">${navbar}${transitionLayer}`)
    .replace('<div class="scripts">', `${footer}<script src="/js/transition-sfx.js"></script>${siteScript}<div class="scripts">`)
    .replace(/<a class="cap-action" onclick="sidebar\.toggleTOC\(\)">[\s\S]*?<\/a>/g, '')
    .replace('<a class="top" onclick="util.scrollTop()">', '<a class="top" data-scroll-top>');
});
