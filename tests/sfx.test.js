'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const modulePath = path.join(__dirname, '..', 'source', 'js', 'transition-sfx.js');
assert.ok(fs.existsSync(modulePath), 'the transition SFX module should exist');

const { SIGNALS, morseDuration, scheduleTransitionSounds } = require(modulePath);

assert.deepEqual(SIGNALS, {
  search: '-.-.-',
  success: '...-.',
});
assert.equal(morseDuration(SIGNALS.search, 0.022), 0.33);
assert.equal(morseDuration(SIGNALS.success, 0.022), 0.242);

class AudioParamFake {
  constructor() {
    this.events = [];
  }

  setValueAtTime(value, time) {
    this.events.push({ method: 'set', value, time });
  }

  linearRampToValueAtTime(value, time) {
    this.events.push({ method: 'ramp', value, time });
  }
}

class OscillatorFake {
  constructor() {
    this.frequency = new AudioParamFake();
    this.starts = [];
    this.stops = [];
  }

  connect(target) {
    this.target = target;
  }

  start(time) {
    this.starts.push(time);
  }

  stop(time) {
    this.stops.push(time);
  }
}

class GainFake {
  constructor() {
    this.gain = new AudioParamFake();
  }

  connect(target) {
    this.target = target;
  }
}

const context = {
  currentTime: 5,
  destination: {},
  oscillators: [],
  gains: [],
  createOscillator() {
    const oscillator = new OscillatorFake();
    this.oscillators.push(oscillator);
    return oscillator;
  },
  createGain() {
    const gain = new GainFake();
    this.gains.push(gain);
    return gain;
  },
};

const endAt = scheduleTransitionSounds(context, 5);
assert.equal(context.oscillators.length, 2);
assert.deepEqual(
  context.oscillators.map((oscillator) => oscillator.frequency.events[0].value),
  [620, 880],
);
assert.deepEqual(
  context.oscillators.map((oscillator) => oscillator.type),
  ['sine', 'sine'],
);
assert.equal(context.oscillators[0].starts[0], 5);
assert.ok(context.oscillators[1].starts[0] > context.oscillators[0].stops[0]);
assert.equal(Number(endAt.toFixed(3)), 5.638);

console.log('transition SFX: Morse timing and tones passed');
