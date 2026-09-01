(function attachTransitionSfx(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WavepickTransitionSfx = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createTransitionSfx() {
  'use strict';

  const SIGNALS = Object.freeze({
    search: '-.-.-',
    success: '...-.',
  });

  function morseDuration(pattern, unit) {
    const signalUnits = Array.from(pattern).reduce(
      (total, signal) => total + (signal === '-' ? 3 : 1),
      0,
    );
    const gapUnits = Math.max(0, pattern.length - 1);
    return Number(((signalUnits + gapUnits) * unit).toFixed(6));
  }

  function scheduleMorse(context, pattern, startAt, options) {
    const { frequency, gain: level, unit } = options;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const attack = Math.min(0.004, unit / 4);
    let cursor = startAt;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startAt);
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0, startAt);

    Array.from(pattern).forEach((signal, index) => {
      const duration = (signal === '-' ? 3 : 1) * unit;
      const end = cursor + duration;
      gain.gain.setValueAtTime(0, cursor);
      gain.gain.linearRampToValueAtTime(level, cursor + attack);
      gain.gain.setValueAtTime(level, Math.max(cursor + attack, end - attack));
      gain.gain.linearRampToValueAtTime(0, end);
      cursor = end;
      if (index < pattern.length - 1) cursor += unit;
    });

    oscillator.start(startAt);
    oscillator.stop(cursor + 0.01);
    return Number(cursor.toFixed(6));
  }

  function scheduleTransitionSounds(context, startAt = context.currentTime + 0.015) {
    const unit = 0.022;
    const searchEnd = scheduleMorse(context, SIGNALS.search, startAt, {
      frequency: 620,
      gain: 0.035,
      unit,
    });
    return scheduleMorse(context, SIGNALS.success, searchEnd + unit * 3, {
      frequency: 880,
      gain: 0.055,
      unit,
    });
  }

  return {
    SIGNALS,
    morseDuration,
    scheduleTransitionSounds,
  };
}));
