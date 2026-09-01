# terminal-radio website

The site for [terminal-radio](https://github.com/yueswater/terminal-radio),
published at <https://wavepick.yueswater.com>.

Hexo with the [Stellar](https://github.com/xaoxuu/hexo-theme-stellar) theme,
restyled with the palette the terminal interface itself uses, so the site and
the program agree on what the thing looks like. Dark only, for now.

## Running it

```sh
make install    # dependencies
make preview    # live reload while writing, at :4000
make build      # generate into public/
make serve      # serve exactly what was generated
```

`make preview PORT=5000` moves it.

## Where things are

| Path | What |
| --- | --- |
| `source/index.md` | Home page, Traditional Chinese |
| `source/en/index.md` | Home page, English |
| `source/css/custom.css` | The palette and the pixel faces |
| `scripts/i18n.js` | Strings the theme does not already translate |
| `scripts/custom-css.js` | Adds the stylesheet to every page |
| `_config.stellar.yml` | Theme settings that differ from its defaults |
| `vendor/` | Font licences |

The theme is an ordinary npm dependency rather than a copy in the repository,
so it can be upgraded. Everything this site changes about it lives in the two
scripts and the stylesheet.

## Fonts

Pixel faces, one per script, each drawing only what it has glyphs for. See
[`vendor/README.md`](vendor/README.md) for licences and how to update them.

## Deployment

GitHub Pages, built by `.github/workflows/pages.yml`. Pages must be set to
deploy from GitHub Actions rather than from a branch: left on a branch it runs
Jekyll over the repository, which cannot build a Hexo site and fails.

The workflow runs `tests/site.sh`, which generates the site as part of checking
it, so what is tested is what is published. `source/CNAME` carries the custom
domain into `public/`.

`vercel.json` is kept for the alternative: Vercel builds this repository as it
stands, with no workflow at all.

## Licence

MIT, except the fonts under `source/fonts/`, which keep their own licences.
