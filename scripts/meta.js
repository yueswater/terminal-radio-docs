/* What a search engine and a chat app see.

   The theme writes its own set of these, built from the site title and from
   whatever text it can scrape off the page, which on a landing page is the
   button labels. They are removed and written here instead, from the
   description each page states about itself.

   Every page exists in two languages, so each one points at the other with
   hreflang and both point at the Chinese page as the default. Without that,
   a search engine treats them as competing copies and picks one. */

const SITE = {
  'zh-TW': {
    name: '拾波',
    locale: 'zh_TW',
    otherLocale: 'en_US',
  },
  en: {
    name: 'Wavepick',
    locale: 'en_US',
    otherLocale: 'zh_TW',
  },
};

const OG_IMAGE = '/images/og.png';

function escape(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absolute(base, path) {
  return new URL(path, base).href;
}

/* The Chinese pages live at the root and the English ones under /en/, so one
   is the other with that segment added or removed. */
function counterpart(path, english) {
  return english ? path.replace(/^\/en(?=\/|$)/, '') || '/' : `/en${path}`;
}

hexo.extend.filter.register('after_render:html', function (html, data) {
  const page = data && (data.page || data);
  if (!page || !page.path) {
    return html;
  }

  const config = hexo.config;
  const base = config.url.replace(/\/$/, '') + '/';
  const english = String(page.lang || '') === 'en';
  const site = english ? SITE.en : SITE['zh-TW'];

  const here = ('/' + String(page.path).replace(/index\.html$/, '')).replace(/\/{2,}/g, '/');
  const there = counterpart(here, english);

  const title = page.title && page.title !== config.title ? page.title : site.name;
  const description = page.description || config.description;

  const tags = [
    `<link rel="canonical" href="${escape(absolute(base, here))}">`,
    `<link rel="alternate" hreflang="${english ? 'en' : 'zh-Hant'}" href="${escape(absolute(base, here))}">`,
    `<link rel="alternate" hreflang="${english ? 'zh-Hant' : 'en'}" href="${escape(absolute(base, there))}">`,
    `<link rel="alternate" hreflang="x-default" href="${escape(absolute(base, english ? there : here))}">`,
    `<meta name="description" content="${escape(description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escape(site.name)}">`,
    `<meta property="og:title" content="${escape(title)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${escape(absolute(base, here))}">`,
    `<meta property="og:locale" content="${site.locale}">`,
    `<meta property="og:locale:alternate" content="${site.otherLocale}">`,
    `<meta property="og:image" content="${escape(absolute(base, OG_IMAGE))}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escape(site.name)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(title)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${escape(absolute(base, OG_IMAGE))}">`,
  ].join('\n');

  return html
    .replace(/\s*<meta (?:property="og:|name="twitter:)[^>]*>/g, '')
    .replace(/\s*<meta name="description"[^>]*>/g, '')
    .replace(/\s*<link rel="canonical"[^>]*>/g, '')
    .replace('</head>', `${tags}\n</head>`);
});
