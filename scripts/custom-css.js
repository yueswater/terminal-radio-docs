/* Add the site stylesheet to every page.

   Injected rather than written into the theme, so that the theme stays an
   ordinary npm dependency that can be upgraded without losing this. */
hexo.extend.injector.register(
  'head_end',
  '<link rel="stylesheet" href="/css/custom.css">',
  'default'
);
