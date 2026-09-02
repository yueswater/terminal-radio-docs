'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const modulePath = path.join(__dirname, '..', 'source', 'js', 'pixel-burst.js');
const stylesheet = fs.readFileSync(
  path.join(__dirname, '..', 'source', 'css', 'custom.css'),
  'utf8',
);
const { installPixelBurst } = require(modulePath);

function page({ reducedMotion = false, finePointer = true } = {}) {
  const dom = new JSDOM(`<!doctype html><style>${stylesheet}</style><body><button>Play</button></body>`, {
    pretendToBeVisual: true,
  });
  dom.window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : finePointer,
  });
  return dom;
}

{
  const dom = page();
  installPixelBurst(dom.window);
  const event = new dom.window.MouseEvent('pointerdown', {
    bubbles: true,
    button: 0,
    clientX: 42,
    clientY: 73,
  });
  dom.window.document.querySelector('button').dispatchEvent(event);

  const burst = dom.window.document.querySelector('.pixel-burst');
  assert.ok(burst, 'a primary pointer press should draw a burst');
  assert.equal(burst.getAttribute('aria-hidden'), 'true');
  assert.equal(burst.style.left, '42px');
  assert.equal(burst.style.top, '73px');
  assert.equal(burst.querySelectorAll('.pixel-burst__spark').length, 4);
  assert.equal(dom.window.getComputedStyle(burst).contain.includes('paint'), false,
    'a zero-sized burst origin must not clip sparks outside its paint box');

  dom.window.document.dispatchEvent(new dom.window.MouseEvent('pointermove', { bubbles: true }));
  assert.equal(dom.window.document.querySelectorAll('.pixel-burst').length, 1,
    'moving or dragging should not emit more sparks');

  burst.dispatchEvent(new dom.window.Event('animationend', { bubbles: true }));
  assert.equal(dom.window.document.querySelector('.pixel-burst'), null,
    'the burst should remove itself after its animation');
}

{
  const dom = page({ reducedMotion: true });
  installPixelBurst(dom.window);
  dom.window.document.dispatchEvent(new dom.window.MouseEvent('pointerdown', {
    bubbles: true,
    button: 0,
  }));
  assert.equal(dom.window.document.querySelector('.pixel-burst'), null,
    'reduced-motion readers should get no decorative burst');
}

{
  const dom = page();
  installPixelBurst(dom.window);
  dom.window.document.dispatchEvent(new dom.window.MouseEvent('pointerdown', {
    bubbles: true,
    button: 2,
  }));
  assert.equal(dom.window.document.querySelector('.pixel-burst'), null,
    'secondary clicks should not look like activation');
}

console.log('pixel burst: click, cleanup, and motion preference passed');
