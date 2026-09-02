/* Publishes the palettes as a stylesheet, and applies the reader's choice
   before the first paint. The palettes themselves are computed in
   lib/palettes.js, which the page chrome also reads. */

const load = require('../lib/palettes');
const fs = require('fs');
const path = require('path');

hexo.extend.generator.register('palettes', () => {
  const { fallback, palettes } = load(hexo.source_dir);

  const rule = (selector, palette) =>
    [
      selector + ' {',
      ...Object.entries(palette.tokens).map(([name, value]) => `  ${name}: ${value};`),
      `  color-scheme: ${palette.dark ? 'dark' : 'light'};`,
      '}',
    ].join('\n');

  const css = palettes
    .map((palette) => {
      /* The default palette also answers to no attribute at all, so a page
         renders before any script has run. It is written as a :not() rather
         than a bare :root because Stellar states its own palette at that same
         weight; matching it lets load order decide, and this file is last. */
      const selectors = [`:root[data-palette='${palette.slug}']`];
      if (palette.slug === fallback) selectors.unshift(':root:not([data-palette])');
      return rule(selectors.join(',\n'), palette);
    })
    .join('\n\n');

  const mark = fs.readFileSync(path.join(hexo.source_dir, 'images/favicon.svg'), 'utf8');
  const favicon = (palette) =>
    mark
      .replace('#ff4d6d', palette.tokens['--radio-green'])
      .replace('#ff9f1c', palette.tokens['--radio-amber']);

  return [
    { path: 'css/palettes.css', data: css + '\n' },
    ...palettes.map((palette) => ({
      path: `images/favicons/${palette.slug}.svg`,
      data: favicon(palette),
    })),
  ];
});

hexo.extend.injector.register(
  'head_end',
  '<link rel="stylesheet" href="/css/palettes.css">',
  'default'
);

/* The stored choice is applied before the body is painted. Left to the main
   script it would land after the first frame, and every page would open in the
   default palette and then blink into the reader's own. */
hexo.extend.injector.register(
  'head_end',
  "<script>try{var p=localStorage.getItem('wavepick-palette');" +
    "if(p)document.documentElement.setAttribute('data-palette',p);}catch(e){}</script>",
  'default'
);
