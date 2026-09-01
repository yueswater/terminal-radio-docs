/* Strings this site adds to the ones the theme already translates.

   Hexo reads translations from the theme's own languages directory, and this
   theme is an npm dependency, so anything written there would be lost on the
   next install. Setting them on the live i18n instance keeps them here. */

const STRINGS = {
  'zh-TW': {
    menu: { home: '首頁', source: '原始碼', pypi: '套件' },
    site: { other_language: 'English' },
  },
  en: {
    menu: { home: 'Home', source: 'Source', pypi: 'Package' },
    site: { other_language: '繁體中文' },
  },
};

hexo.on('generateBefore', () => {
  const i18n = hexo.theme.i18n;
  for (const [language, data] of Object.entries(STRINGS)) {
    i18n.set(language, Object.assign({}, i18n.get([language]), data));
  }
});
