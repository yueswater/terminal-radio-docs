/* Add the site stylesheet to every page.

   Injected rather than written into the theme, so that the theme stays an
   ordinary npm dependency that can be upgraded without losing this. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const stylesheet = fs.readFileSync(path.join(hexo.source_dir, 'css/custom.css'));
const version = crypto.createHash('sha256').update(stylesheet).digest('hex').slice(0, 12);

hexo.extend.injector.register(
  'head_end',
  `<link rel="stylesheet" href="/css/custom.css?v=${version}">`,
  'default'
);
