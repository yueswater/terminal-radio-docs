/* The sitemap and robots.txt.

   Written here rather than taken from a plugin because every page has a
   translation, and the sitemap is where a search engine is told so: each entry
   lists both languages, so neither is mistaken for a duplicate of the other.

   The site is small and entirely static, so the sitemap is generated from the
   pages Hexo already knows about rather than from a crawl. */

function escape(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function counterpart(path, english) {
  return english ? path.replace(/^\/en(?=\/|$)/, '') || '/' : `/en${path}`;
}

hexo.extend.generator.register('sitemap', function (locals) {
  const base = hexo.config.url.replace(/\/$/, '') + '/';
  const pages = locals.pages
    .filter((page) => String(page.path).endsWith('.html'))
    .sort((left, right) => String(left.path).localeCompare(String(right.path)));

  const entries = pages.map((page) => {
    const here = ('/' + String(page.path).replace(/index\.html$/, '')).replace(/\/{2,}/g, '/');
    const english = String(page.lang || '') === 'en';
    const there = counterpart(here, english);
    const updated = page.updated || page.date;

    const alternates = [
      `      <xhtml:link rel="alternate" hreflang="${english ? 'en' : 'zh-Hant'}" href="${escape(new URL(here, base).href)}"/>`,
      `      <xhtml:link rel="alternate" hreflang="${english ? 'zh-Hant' : 'en'}" href="${escape(new URL(there, base).href)}"/>`,
    ].join('\n');

    return [
      '   <url>',
      `      <loc>${escape(new URL(here, base).href)}</loc>`,
      updated ? `      <lastmod>${updated.toISOString().slice(0, 10)}</lastmod>` : null,
      // The home pages are the way in; the rest sit a step behind them.
      `      <priority>${here === '/' || here === '/en/' ? '1.0' : '0.8'}</priority>`,
      alternates,
      '   </url>',
    ]
      .filter(Boolean)
      .join('\n');
  });

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries.join('\n'),
    '</urlset>',
    '',
  ].join('\n');

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap.xml', base).href}`,
    '',
  ].join('\n');

  return [
    { path: 'sitemap.xml', data: sitemap },
    { path: 'robots.txt', data: robots },
  ];
});
