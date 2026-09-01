/* Render authored pages without an index generator.

   The third-party hexo-generator-page package imports an undeclared runtime
   dependency and makes clean installs fail. This site only needs Hexo's
   normal page collection mapped to public paths, so the generator is small
   enough to keep here and test through the generated site. */

hexo.extend.generator.register('authored-pages', (locals) =>
  locals.pages.filter((page) => page.source?.endsWith('.md')).map((page) => ({
    path: page.path,
    data: page,
    layout: ['page'],
  }))
);
