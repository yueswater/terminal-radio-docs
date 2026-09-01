/* Browser tab titles read "page | site", and the home page is just the site.

   The theme joins them with a hyphen and has no setting for it, so the title
   element is rewritten on the way out. Only the element is touched, never the
   page body. */
hexo.extend.filter.register('after_render:html', (html) =>
  html.replace(/<title>([^<]*)<\/title>/, (whole, text) => {
    const sourceName = hexo.config.title;
    const siteName = /<html lang="en"/.test(html)
      ? 'Wavepick — Taiwan Radio'
      : '拾波 —— 臺灣廣播';
    const page = text.endsWith(` - ${sourceName}`)
      ? text.slice(0, -` - ${sourceName}`.length)
      : text;
    // A home page whose source title is the project slug adds no useful prefix.
    return page === sourceName
      ? `<title>${siteName}</title>`
      : `<title>${page} | ${siteName}</title>`;
  })
);
