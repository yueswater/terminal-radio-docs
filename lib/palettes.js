/* The colour palettes, taken from the radio itself.

   `source/_data/themes.yml` is a copy of the file the terminal app loads at
   startup, so the site wears exactly the palettes a listener can cycle through
   with the t key. Refresh it with `make themes`.

   That file carries the eleven colours Textual needs. A web page needs a few
   more — a hairline, a muted grey, a pressed-button shadow — so they are
   derived here from the ones the app does define, by the same ratios that
   related the site's original hand-written palette to the sonic theme. Deriving
   rather than listing them means a palette added upstream needs no work here. */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Display names. The keys are the app's, which are slugs; these are what a
// reader sees. English keeps the upstream project's own name wherever the
// palette came from one, so anyone who recognises Gruvbox or Nord still does.
const NAMES = {
  sonic: { 'zh-TW': '磷光', en: 'Sonic' },
  midnight: { 'zh-TW': '夜航', en: 'Tokyo Night' },
  gruvbox: { 'zh-TW': '唱紋', en: 'Gruvbox' },
  nord: { 'zh-TW': '霜弦', en: 'Nord' },
  paper: { 'zh-TW': '素頁', en: 'Paper' },
  dracula: { 'zh-TW': '紫宴', en: 'Dracula' },
  catppuccin: { 'zh-TW': '薄荷墨', en: 'Catppuccin Mocha' },
  'rose-pine': { 'zh-TW': '薔薇暮', en: 'Rosé Pine' },
  everforest: { 'zh-TW': '苔雨', en: 'Everforest' },
  'solarized-dark': { 'zh-TW': '潛波', en: 'Solarized Dark' },
  'solarized-light': { 'zh-TW': '晨箋', en: 'Solarized Light' },
  monokai: { 'zh-TW': '霓響', en: 'Monokai' },
  'ayu-mirage': { 'zh-TW': '晚照', en: 'Ayu Mirage' },
  latte: { 'zh-TW': '霽白', en: 'Catppuccin Latte' },
  'night-eaves': { 'zh-TW': '夜簷', en: 'Night Eaves' },
};

function channels(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;
  return [0, 2, 4].map((at) => parseInt(full.slice(at, at + 2), 16));
}

function hex(rgb) {
  return '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function mix(from, to, amount) {
  const left = channels(from);
  const right = channels(to);
  return hex(left.map((c, at) => c + (right[at] - c) * amount));
}

function hsl(value) {
  const [red, green, blue] = channels(value).map((c) => c / 255);
  const high = Math.max(red, green, blue);
  const low = Math.min(red, green, blue);
  const span = high - low;
  const light = (high + low) / 2;
  let hue = 0;
  if (span) {
    if (high === red) hue = ((green - blue) / span) % 6;
    else if (high === green) hue = (blue - red) / span + 2;
    else hue = (red - green) / span + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  const saturation = span ? span / (1 - Math.abs(2 * light - 1)) : 0;
  return {
    hue: hue.toFixed(2) + 'deg',
    saturation: (saturation * 100).toFixed(2) + '%',
    light: (light * 100).toFixed(2) + '%',
  };
}

function tokens(theme) {
  const { background, foreground, surface, panel, primary } = theme;
  // Emphasised text: away from the page, whichever way that is. On a light
  // palette this darkens, which is why the site cannot simply say white.
  const strong = mix(foreground, theme.dark ? '#ffffff' : '#000000', 0.4);

  return {
    '--background': background,
    '--foreground': foreground,
    '--foreground-strong': strong,
    '--card': surface,
    '--block': panel,
    '--radio-green': primary,
    '--radio-blue': theme.secondary || primary,
    '--radio-amber': theme.accent || primary,
    '--text-code': theme.accent || primary,
    '--radio-red': theme.error || primary,
    // A hairline is the panel lifted a little towards the text.
    '--radio-line': mix(panel, foreground, 0.08),
    // Muted text sits about three fifths of the way from page to text.
    '--radio-muted': mix(background, foreground, 0.6),
    // The pixel shadow under a button is its own colour, in shade.
    '--radio-green-shadow': mix(primary, '#000000', 0.43),
    // Translucent layers need the parts, not the colour: rgba() cannot take a
    // hex variable, and the navbar, the glow and the scan lines all want one.
    '--background-rgb': channels(background).join(', '),
    '--foreground-rgb': channels(foreground).join(', '),
    '--foreground-strong-rgb': channels(strong).join(', '),
    '--radio-green-rgb': channels(primary).join(', '),
    '--radio-amber-rgb': channels(theme.accent || primary).join(', '),
    '--radio-blue-rgb': channels(theme.secondary || primary).join(', '),
  };
}

/* Stellar renders the article body, and it colours it from its own set of
   variables. Left alone they stay on the theme's built-in dark palette, so a
   chosen palette would repaint the chrome and leave the prose behind — the bar
   beside a heading is Stellar's --theme, and its body text is white at a fixed
   alpha, which a light palette turns invisible.

   Everything below is therefore Stellar's vocabulary, answered in the
   palette's colours. Its translucent shades are rebuilt over the palette's own
   ink and paper, so they lighten or darken in whichever direction the palette
   runs. */
function stellar(palette) {
  const { hue, saturation, light } = hsl(palette['--radio-green']);
  const ink = (alpha) => `rgba(var(--foreground-rgb), ${alpha})`;
  const paper = (alpha) => `rgba(var(--background-rgb), ${alpha})`;

  return {
    // --theme-a10/a20/a30 are built from these three, so overriding the parts
    // carries the whole family across.
    '--hue': hue,
    '--sat': saturation,
    '--light': light,
    '--theme': 'var(--radio-green)',
    '--accent': 'var(--radio-amber)',
    '--link': 'var(--radio-blue)',
    '--link-a20': 'rgba(var(--radio-blue-rgb), 0.2)',
    '--item-theme': 'var(--radio-green)',
    '--text': 'var(--foreground-strong)',
    '--text-reverse': 'var(--background)',
    '--text-p1': ink(0.88),
    '--text-p2': ink(0.76),
    '--text-p3': ink(0.58),
    '--text-p4': ink(0.46),
    '--text-meta': ink(0.28),
    '--text-code': 'var(--radio-amber)',
    '--text-a10': ink(0.1),
    '--text-a20': ink(0.2),
    '--bg-a20': paper(0.2),
    '--bg-a50': paper(0.5),
    '--bg-a60': paper(0.6),
    '--bg-a75': paper(0.75),
    '--bg-a100': paper(1),
    '--block-border': 'var(--radio-line)',
  };
}

function load(sourceDir) {
  const file = path.join(sourceDir, '_data', 'themes.yml');
  const parsed = yaml.load(fs.readFileSync(file, 'utf8'));
  const palettes = parsed.themes.map((theme) => ({
    slug: theme.name,
    dark: theme.dark !== false,
    names: NAMES[theme.name] || { 'zh-TW': theme.name, en: theme.name },
    tokens: tokens(theme),
  }));
  palettes.forEach((palette) => {
    palette.tokens = { ...palette.tokens, ...stellar(palette.tokens) };
  });
  return { fallback: parsed.default, palettes };
}

module.exports = load;
