/* The shared, full-width website chrome.

   Stellar remains responsible for Markdown, syntax highlighting and page
   metadata. The product site supplies its own navbar and footer so the brand
   is not squeezed into the theme's fixed-width documentation sidebar. */

const loadPalettes = require('../lib/palettes');

const NAVIGATION = {
  'zh-TW': {
    aria: '主要導覽',
    skip: '跳至主要內容',
    guide: '使用教學',
    about: '關於',
    license: '版權',
    language: 'English',
    languageCode: 'en',
    brand: '拾波',
    owner: '岳氏礦泉水',
    soundOn: '關閉轉場音效',
    soundOff: '開啟轉場音效',
    theme: '配色主題',
    toastTheme: '配色主題：',
    toastSoundOn: '轉場音效已開啟',
    toastSoundOff: '轉場音效已關閉',
    toastLanguage: '語言：繁體中文',
    toastShareX: '分享到 X',
    toastShareLine: '分享到 LINE',
    toastCopied: '已複製連結',
    toastCodeCopied: '複製成功',
    themeHint: '按 T 開啟',
    themeClose: '關閉',
    themeDefault: '預設',
    themeLight: '亮色',
    email: '聯絡我們',
    share: '分享',
    shareX: '分享到 X',
    shareLine: '分享到 LINE',
    shareCopy: '複製連結',
    shareCopied: '已複製',
  },
  en: {
    aria: 'Primary navigation',
    skip: 'Skip to main content',
    guide: 'Guide',
    about: 'About',
    license: 'License',
    language: '繁體中文',
    languageCode: 'zh-TW',
    brand: 'Wavepick',
    owner: 'Yueswater',
    soundOn: 'Mute transition sounds',
    soundOff: 'Enable transition sounds',
    theme: 'Colour theme',
    toastTheme: 'Theme: ',
    toastSoundOn: 'Transition sounds on',
    toastSoundOff: 'Transition sounds off',
    toastLanguage: 'Language: English',
    toastShareX: 'Sharing on X',
    toastShareLine: 'Sharing on LINE',
    toastCopied: 'Link copied',
    toastCodeCopied: 'Code copied',
    themeHint: 'Press T',
    themeClose: 'Close',
    themeDefault: 'Default',
    themeLight: 'Light',
    email: 'Contact Us',
    share: 'Share',
    shareX: 'Share on X',
    shareLine: 'Share on LINE',
    shareCopy: 'Copy link',
    shareCopied: 'Copied',
  },
};

/* Where this page will live. Taken from the page itself rather than read back
   out of its own markup: the meta tags are rewritten by another filter, and
   nothing orders the two. */
function publicPath(page) {
  if (!page || !page.path) return '/';
  return ('/' + String(page.path).replace(/index\.html$/, '')).replace(/\/{2,}/g, '/');
}

function navLink(url, label, currentPath) {
  const current = currentPath === url ? ' aria-current="page"' : '';
  return `<a href="${url}"${current}>${label}</a>`;
}

hexo.extend.filter.register('after_render:html', (html, data) => {
  const page = data && (data.page || data);
  const english = /<html lang="en"/.test(html);
  const locale = english ? 'en' : 'zh-TW';
  const text = NAVIGATION[locale];
  const root = english ? '/en/' : '/';
  const prefix = english ? '/en' : '';
  const path = publicPath(page);
  const translatedPath = english
    ? path.replace(/^\/en(?=\/|$)/, '') || '/'
    : `/en${path}`;
  const landing = /class="site-hero"/.test(html);

  // Icons are inlined rather than fetched so they inherit the colour of the
  // control they sit in, and cost no second request.
  const icon = (name) =>
    require('fs')
      .readFileSync(require('path').join(hexo.source_dir, 'images/icons/' + name + '.svg'), 'utf8')
      .replace(/\n\s*/g, '')
      .replace('<svg ', '<svg aria-hidden="true" focusable="false" ');

  const navbar = `
    <a class="skip-link" href="#main">${text.skip}</a>
    <header class="site-navbar">
      <div class="site-navbar__inner">
        <a class="site-brand" href="${root}" aria-label="${text.brand}">
          <span class="site-brand__mark" aria-hidden="true"></span>
          <span class="site-brand__name">${text.brand}</span>
        </a>
        <nav class="site-nav" aria-label="${text.aria}">
          ${navLink(`${prefix}/docs/`, text.guide, path)}
          ${navLink(`${prefix}/about/`, text.about, path)}
          ${navLink(`${prefix}/license/`, text.license, path)}
        </nav>
        <div class="site-navbar__tools">
          <button class="navbar-tool palette-toggle" type="button" aria-expanded="false" aria-controls="palette-sheet" aria-label="${text.theme}" title="${text.theme}">${icon('palette')}</button>
          <button class="navbar-tool sound-toggle" type="button" aria-pressed="true" aria-label="${text.soundOn}" title="${text.soundOn}" data-enabled-label="${text.soundOn}" data-disabled-label="${text.soundOff}">
            <span class="sound-toggle__on">${icon('sound-on')}</span>
            <span class="sound-toggle__off">${icon('sound-off')}</span>
          </button>
          <a class="navbar-tool language-switch" href="${translatedPath}" lang="${text.languageCode}" hreflang="${text.languageCode}" aria-label="${text.language}" title="${text.language}">${icon('globe')}</a>
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

  /* Sharing sits at the end of the piece being shared, where a reader who has
     finished it is. The landing page has nothing to have read, so it carries
     no share row at all. */
  const shareUrl = new URL(publicPath(page), hexo.config.url).href;
  const shareText = `${text.brand} — ${hexo.config.description || ''}`.trim();
  const share = landing ? '' : `
        <div class="page-share" role="group" aria-label="${text.share}">
          <span class="page-share__label">${text.share}</span>
          <a class="page-share__link" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}"
             target="_blank" rel="noopener" data-share-toast="${text.toastShareX}" aria-label="${text.shareX}" title="${text.shareX}">${icon('x')}</a>
          <a class="page-share__link" href="https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}"
             target="_blank" rel="noopener" data-share-toast="${text.toastShareLine}" aria-label="${text.shareLine}" title="${text.shareLine}">${icon('line')}</a>
          <button class="page-share__link" type="button" data-share-copy="${shareUrl}"
                  data-copied="${text.shareCopied}" aria-label="${text.shareCopy}" title="${text.shareCopy}">${icon('link')}</button>
        </div>`;

  // Picking a theme rises from the bottom of the window rather than dropping
  // out of the navbar: fourteen palettes with swatches need the room, and a
  // sheet reaches the thumb on a phone.
  const { fallback, palettes } = loadPalettes(hexo.source_dir);
  const paletteMarks = Object.fromEntries(
    palettes.map((palette) => [palette.slug, `/images/favicons/${palette.slug}.svg`])
  );
  const options = palettes
    .map((palette) => {
      const name = palette.names[locale];
      const other = palette.names[english ? 'zh-TW' : 'en'];
      const tags = [
        palette.slug === fallback ? `<span class="palette-option__tag">${text.themeDefault}</span>` : '',
        palette.dark ? '' : `<span class="palette-option__tag">${text.themeLight}</span>`,
      ].join('');
      const swatch = ['--background', '--radio-green', '--radio-blue', '--radio-amber']
        .map((token) => `<i style="background:${palette.tokens[token]}"></i>`)
        .join('');
      return `
            <li>
              <button class="palette-option" type="button" role="radio" aria-checked="false" data-palette="${palette.slug}" style="border-color:${palette.tokens['--radio-line']}">
                <span class="palette-option__swatch" aria-hidden="true">${swatch}</span>
                <span class="palette-option__label">
                  <span class="palette-option__name">${name}</span>
                  <span class="palette-option__alt">${other}</span>
                </span>
                ${tags}
              </button>
            </li>`;
    })
    .join('');

  // A control that changes something invisible — a stored preference, a window
  // opening elsewhere — says so here. role=status announces it without stealing
  // focus from whatever was just pressed.
  const toast = `
    <div class="site-toast" role="status" aria-live="polite" hidden>
      <span class="site-toast__text"></span>
    </div>`;

  const paletteSheet = `
    <div class="palette-sheet" id="palette-sheet" hidden>
      <div class="palette-sheet__scrim" data-palette-dismiss></div>
      <div class="palette-sheet__panel" role="dialog" aria-modal="true" aria-label="${text.theme}">
        <div class="palette-sheet__head">
          <span class="palette-sheet__title">${text.theme}</span>
          <span class="palette-sheet__hint">${text.themeHint}</span>
          <button class="palette-sheet__close" type="button" data-palette-dismiss aria-label="${text.themeClose}" title="${text.themeClose}">&times;</button>
        </div>
        <ul class="palette-list" role="radiogroup" aria-label="${text.theme}">${options}
        </ul>
      </div>
    </div>`;

  /* Stamped at build time rather than read from the reader's clock: a crawler
     and someone with a wrong date both see the year the site was published,
     and the page needs no script to say it. */
  const year = new Date().getFullYear();

  const footer = `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <span>© <a href="https://yueswater.com" target="_blank" rel="noopener">${year} ${text.owner}</a></span>
        <span class="site-footer__links">
          <a class="site-footer__contact" href="mailto:contact@yueswater.com">${icon('mail')}${text.email}</a>
          <a href="https://github.com/yueswater/terminal-radio">${icon('github')}GitHub</a>
          <a href="https://pypi.org/project/radiotui-tw/">${icon('python')}PyPI</a>
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
          showToast(soundEnabled
            ? ${JSON.stringify(text.toastSoundOn)}
            : ${JSON.stringify(text.toastSoundOff)});
        });
      }

      /* Moving across the hero tunes the dial. The reader's pointer takes over
         the sweep's position while it is inside; leaving hands it back to the
         animation. Only where there is a real pointer to follow — a finger
         gives one position at a time and nothing to track between. */
      const hero = document.querySelector('.site-hero');
      if (hero && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
        hero.addEventListener('pointermove', (event) => {
          const box = hero.getBoundingClientRect();
          if (!box.width) return;
          const across = ((event.clientX - box.left) / box.width) * 100;
          hero.style.setProperty('--tune', Math.min(100, Math.max(0, across)).toFixed(1) + '%');
          hero.classList.add('is-tuning');
        });
        hero.addEventListener('pointerleave', () => hero.classList.remove('is-tuning'));
      }

      const toastBox = document.querySelector('.site-toast');
      const toastText = toastBox && toastBox.querySelector('.site-toast__text');
      let toastHold = 0;
      let toastSettle = 0;

      const showToast = (message) => {
        if (!toastBox || !toastText) return;
        window.clearTimeout(toastHold);
        window.clearTimeout(toastSettle);
        toastText.textContent = message;
        toastBox.hidden = false;
        // The unhidden state has to be committed before the class that animates
        // it, or there is nothing to move from. Forced by reading a layout
        // value rather than by a frame callback, which a browser is free to
        // withhold from a tab it is not painting.
        void toastBox.offsetHeight;
        toastBox.classList.add('is-visible');
        toastHold = window.setTimeout(() => {
          toastBox.classList.remove('is-visible');
          toastSettle = window.setTimeout(() => { toastBox.hidden = true; }, 240);
        }, 2400);
      };

      // Stellar owns the code-copy button, but its generic HUD does not share
      // the site's palette or motion. Route only that success message through
      // Wavepick's toast and leave every other theme notification untouched.
      document.addEventListener('DOMContentLoaded', () => {
        if (typeof hud === 'undefined' || !hud || typeof hud.toast !== 'function') return;
        const stellarToast = hud.toast;
        hud.toast = (message, duration) => {
          if (typeof ctx !== 'undefined' && ctx.copycode && message === ctx.copycode.toast) {
            showToast(${JSON.stringify(text.toastCodeCopied)});
            return;
          }
          stellarToast(message, duration);
        };
      }, { once: true });

      // Switching language is a navigation, and the transition covers the
      // screen on the way out, so the word arrives with the new page instead.
      const languageToastKey = 'wavepick-language-toast';
      try {
        if (sessionStorage.getItem(languageToastKey)) {
          sessionStorage.removeItem(languageToastKey);
          showToast(${JSON.stringify(text.toastLanguage)});
        }
      } catch (_error) {}

      // The palette sheet. The choice itself is applied in the head, before the
      // first paint; everything here is the picking of it.
      const paletteKey = 'wavepick-palette';
      const paletteSheet = document.getElementById('palette-sheet');
      const paletteToggle = document.querySelector('.palette-toggle');
      const paletteOptions = Array.from(document.querySelectorAll('.palette-option'));
      const paletteFallback = ${JSON.stringify(fallback)};
      const paletteMarks = ${JSON.stringify(paletteMarks)};
      let paletteReturnFocus = null;
      let paletteSettle = 0;

      const currentPalette = () =>
        document.documentElement.getAttribute('data-palette') || paletteFallback;

      const markPalette = () => {
        const chosen = currentPalette();
        paletteOptions.forEach((option) => {
          const active = option.dataset.palette === chosen;
          option.setAttribute('aria-checked', String(active));
          option.classList.toggle('is-active', active);
          // Only the chosen one stays in the tab order, the way a radio group
          // behaves; the arrow keys reach the rest.
          option.tabIndex = active ? 0 : -1;
        });
        if (!paletteOptions.some((option) => option.tabIndex === 0) && paletteOptions[0]) {
          paletteOptions[0].tabIndex = 0;
        }
      };

      const updatePaletteBrand = (slug) => {
        const favicon = document.getElementById('site-favicon');
        if (favicon) favicon.href = paletteMarks[slug] || paletteMarks[paletteFallback];
      };

      const applyPalette = (slug) => {
        const root = document.documentElement;
        // Transitions off for the swap itself; see the stylesheet for why.
        root.setAttribute('data-palette-switching', '');
        root.setAttribute('data-palette', slug);
        // Reading a computed value forces the new colours to be worked out while
        // the suspension still holds. It is then held past the paint by the
        // clock rather than by a frame callback: a callback can run before the
        // frame is drawn, the transitions rearm, and the stale colour survives.
        window.getComputedStyle(root).backgroundColor;
        window.clearTimeout(paletteSettle);
        paletteSettle = window.setTimeout(
          () => root.removeAttribute('data-palette-switching'),
          150
        );
        try { localStorage.setItem(paletteKey, slug); } catch (_error) {}
        updatePaletteBrand(slug);
        markPalette();
        const named = document.querySelector(
          '.palette-option[data-palette="' + slug + '"] .palette-option__name'
        );
        showToast(${JSON.stringify(text.toastTheme)} + (named ? named.textContent : slug));
      };

      const paletteIsOpen = () => Boolean(paletteSheet && !paletteSheet.hidden);

      const openPalette = () => {
        if (!paletteSheet || paletteIsOpen()) return;
        paletteReturnFocus = document.activeElement;
        paletteSheet.hidden = false;
        // Committed before the class that animates it, for the same reason the
        // toast is: a frame callback is not guaranteed to run.
        void paletteSheet.offsetHeight;
        paletteSheet.classList.add('is-open');
        if (paletteToggle) paletteToggle.setAttribute('aria-expanded', 'true');
        const active = paletteOptions.find((option) => option.classList.contains('is-active'));
        (active || paletteOptions[0] || paletteSheet).focus({ preventScroll: true });
      };

      const closePalette = () => {
        if (!paletteSheet || !paletteIsOpen()) return;
        paletteSheet.classList.remove('is-open');
        if (paletteToggle) paletteToggle.setAttribute('aria-expanded', 'false');
        const settle = () => { paletteSheet.hidden = true; };
        if (reducedMotion) settle();
        else window.setTimeout(settle, 220);
        if (paletteReturnFocus && paletteReturnFocus.focus) {
          paletteReturnFocus.focus({ preventScroll: true });
        }
        paletteReturnFocus = null;
      };

      updatePaletteBrand(currentPalette());
      markPalette();

      const languageSwitch = document.querySelector('.language-switch');
      if (languageSwitch) {
        languageSwitch.addEventListener('click', () => {
          try { sessionStorage.setItem(languageToastKey, '1'); } catch (_error) {}
        });
      }

      if (paletteToggle) {
        paletteToggle.addEventListener('click', () => {
          if (paletteIsOpen()) closePalette();
          else openPalette();
        });
      }

      paletteOptions.forEach((option, at) => {
        option.addEventListener('click', () => applyPalette(option.dataset.palette));
        option.addEventListener('keydown', (event) => {
          const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
          if (!step) return;
          event.preventDefault();
          const next = paletteOptions[(at + step + paletteOptions.length) % paletteOptions.length];
          next.focus();
          applyPalette(next.dataset.palette);
        });
      });

      document.querySelectorAll('[data-palette-dismiss]').forEach((control) => {
        control.addEventListener('click', closePalette);
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && paletteIsOpen()) {
          closePalette();
          return;
        }
        // t opens the sheet, the same key the radio itself cycles themes with.
        // Not while a modifier is held, and not while somebody is typing.
        if (event.key !== 't' && event.key !== 'T') return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        const focused = document.activeElement;
        if (focused && (focused.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(focused.tagName))) {
          return;
        }
        event.preventDefault();
        if (paletteIsOpen()) closePalette();
        else openPalette();
      });

      // The share links open a window somewhere else, which a pop-up blocker
      // may swallow; saying what was asked for is the only sign on this page.
      document.querySelectorAll('[data-share-toast]').forEach((link) => {
        link.addEventListener('click', () => showToast(link.dataset.shareToast));
      });

      // Copying gives no sign of having worked unless the button says so.
      document.querySelectorAll('[data-share-copy]').forEach((button) => {
        button.addEventListener('click', async () => {
          const link = button.dataset.shareCopy;
          try {
            await navigator.clipboard.writeText(link);
          } catch (_error) {
            const field = document.createElement('textarea');
            field.value = link;
            field.setAttribute('readonly', '');
            field.style.position = 'fixed';
            field.style.opacity = '0';
            document.body.appendChild(field);
            field.select();
            try { document.execCommand('copy'); } catch (_ignored) {}
            document.body.removeChild(field);
          }
          button.classList.add('is-copied');
          button.setAttribute('title', button.dataset.copied);
          showToast(${JSON.stringify(text.toastCopied)});
          window.setTimeout(() => {
            button.classList.remove('is-copied');
            button.setAttribute('title', button.getAttribute('aria-label'));
          }, 1600);
        });
      });

      const playTransitionSound = () => {
        if (!soundEnabled || !window.WavepickTransitionSfx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        try {
          if (!audioContext || audioContext.state === 'closed') {
            audioContext = new AudioContextClass();
          }
          const askedAt = Date.now();
          const schedule = () => {
            /* Only ever queue sound on a clock that is running. A suspended
               context does not advance its own time, so notes written onto one
               wait there and then all fire at the instant it starts — which is
               the reader's next click, on something else entirely.

               And a request that had to wait for permission is stale by the
               time it arrives: the page it belonged to is long since tuned in.
               Letting it go is the point, not a shortcoming. */
            if (!audioContext || audioContext.state !== 'running') return;
            if (Date.now() - askedAt > 400) return;
            window.WavepickTransitionSfx.scheduleTransitionSounds(
              audioContext,
              audioContext.currentTime + 0.015,
            );
          };
          if (audioContext.state === 'running') schedule();
          else audioContext.resume().then(schedule, () => {});
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

      /* A page tunes in when it was reached from a link on this site, and also
         when it was reloaded: pressing refresh is the reader asking for the
         page again, and it should arrive the same way. A reload leaves no note
         behind, so it is read off the navigation entry instead.

         A reload carries its own sound, because nothing played it on the way
         out — there was no way out. Whether it is heard is the browser's call:
         a document that has not been touched yet is usually not allowed to
         start audio, and the attempt then fails quietly. Arriving from a link
         stays silent, since the page that was left played both signals. */
      const reloaded = (() => {
        try {
          const [entry] = performance.getEntriesByType('navigation');
          return Boolean(entry) && entry.type === 'reload';
        } catch (_error) {
          return false;
        }
      })();

      let arrived = reloaded;
      try {
        if (sessionStorage.getItem(transitionKey)) {
          sessionStorage.removeItem(transitionKey);
          arrived = true;
        }
      } catch (_error) {}

      if (arrived && !reducedMotion) {
        document.body.classList.add('is-page-entering');
        window.setTimeout(() => document.body.classList.remove('is-page-entering'), 600);
        if (reloaded) playTransitionSound();
      }

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

  /* The licence page announces itself as a broadcast: the heading sits on a
     tuning scale, with a mast at each end putting it on the air.

     Built here rather than written into the two Markdown files so the masts can
     be inlined and take the palette's colours, and so both languages get it
     from one place. Only the heading is replaced; its text is the page's own. */
  const isLicense = /\/license\/$/.test(path);
  const banner = (heading) => `
    <div class="page-banner">
      <span class="page-banner__mast">${icon('antenna')}</span>
      <div class="page-banner__dial">${heading}</div>
      <span class="page-banner__mast">${icon('antenna')}</span>
    </div>`;
  const headingPattern = isLicense
    ? /<h1 class="text title">[\s\S]*?<\/h1>/
    : /<h1(?![^>]*class)[^>]*>[\s\S]*?<\/h1>/;

  const favicon = `<link id="site-favicon" rel="icon" href="${paletteMarks[fallback]}" type="image/svg+xml">
    <script>try{var paletteMarks=${JSON.stringify(paletteMarks)};var p=localStorage.getItem('wavepick-palette');var f=document.getElementById('site-favicon');if(f&&paletteMarks[p])f.href=paletteMarks[p];}catch(e){}</script>`;

  return html
    .replace('</head>', `${favicon}\n</head>`)
    .replace(headingPattern, (heading) => (isLicense ? banner(heading) : heading))
    .replace('<body>', `<body class="${landing ? 'is-landing' : 'is-content'}">${navbar}${transitionLayer}`)
    .replace('</article>', `${share}</article>`)
    .replace('<div class="scripts">', `${footer}${paletteSheet}${toast}<script src="/js/transition-sfx.js"></script><script src="/js/pixel-burst.js"></script>${siteScript}<div class="scripts">`)
    .replace(/<a class="cap-action" onclick="sidebar\.toggleTOC\(\)">[\s\S]*?<\/a>/g, '')
    .replace('<a class="top" onclick="util.scrollTop()">', '<a class="top" data-scroll-top>');
});
