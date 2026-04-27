/**
 * Tests for the effects system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  type ActorID,
  type CommandID,
  EffectType,
  EventType,
  createTransformerContext,
  type TransformerContext,
  type SmiTimestamp,
  Actor,
  Place,
} from '../scaffold';

import {
  createEffects,
  applyEffect,
  applyPermanentEffect,
  applyTimedEffect,
  clearEffect,
  resetEffects,
  isEffectActive,
  getEffectMagnitude,
  tickEffects,
  type StatusEffects,
  EXPIRED_EFFECTS_BUFFER_SIZE,
} from './effects';
import { renderEffectStart, renderEffectEnd } from '../narrative';
import { EffectDidStart, EffectDidEnd } from './events';

const ACTOR_ID: ActorID = 1;
const TRACE: CommandID = [1, 0, 0, 0];

// context.timestamp defaults to [1_740_000_060, 500]
const NOW_SEC = 1_740_000_060;
const NOW_MS = 500;

describe('effects data structure', () => {
  let effects: StatusEffects;

  beforeEach(() => {
    effects = createEffects();
  });

  it('should return a new container on each call (no shared state)', () => {
    const effects1 = createEffects();
    const effects2 = createEffects();
    expect(effects1).not.toBe(effects2);
  });

  describe('applyEffect + query', () => {
    it('should activate an effect after applyEffect', () => {
      applyEffect(effects, EffectType.POISONED, 5, NOW_SEC + 100);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
    });

    it('should report correct magnitude after applyEffect', () => {
      applyEffect(effects, EffectType.POISONED, 5, NOW_SEC + 100);
      expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(5);
    });

    it('should report magnitude 0 for inactive effect', () => {
      expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(0);
    });
  });

  describe('applyPermanentEffect', () => {
    it('should activate an effect permanently', () => {
      applyPermanentEffect(effects, EffectType.POISONED, 3);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
      expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(3);
    });
  });

  describe('clearEffect', () => {
    it('should deactivate an active effect', () => {
      applyEffect(effects, EffectType.POISONED, 5, NOW_SEC + 100);
      clearEffect(effects, EffectType.POISONED);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
      expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(0);
    });

    it('should be idempotent (clearing already-inactive is safe)', () => {
      clearEffect(effects, EffectType.POISONED);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
    });
  });

  describe('resetEffects', () => {
    it('should clear all effects', () => {
      applyEffect(effects, EffectType.POISONED, 5, NOW_SEC + 100);
      applyEffect(effects, EffectType.STUNNED, 2, NOW_SEC + 50);
      resetEffects(effects);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
      expect(isEffectActive(effects, EffectType.STUNNED)).toBe(false);
    });
  });

  describe('no duplicates', () => {
    it('should overwrite same effect type instead of creating a duplicate', () => {
      applyEffect(effects, EffectType.POISONED, 5, NOW_SEC + 100);
      applyEffect(effects, EffectType.POISONED, 10, NOW_SEC + 200);
      expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
      expect(getEffectMagnitude(effects, EffectType.POISONED)).toBe(10);
    });
  });
});

describe('tickEffects', () => {
  let effects: StatusEffects;

  beforeEach(() => {
    effects = createEffects();
  });

  const makeBuffer = (): number[] => {
    const buf: number[] = [];
    for (let i = 0; i < EXPIRED_EFFECTS_BUFFER_SIZE; i++) buf.push(0);
    return buf;
  };

  it('effect not yet expired (now < expiry) — should not expire', () => {
    applyEffect(effects, EffectType.POISONED, 5, NOW_SEC + 100);
    const buf = makeBuffer();
    const count = tickEffects(effects, NOW_SEC, buf);
    expect(count).toBe(0);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
  });

  it('effect exactly at expiry (now === expiry) — should expire', () => {
    applyEffect(effects, EffectType.POISONED, 5, NOW_SEC);
    const buf = makeBuffer();
    const count = tickEffects(effects, NOW_SEC, buf);
    expect(count).toBe(1);
    expect(buf[0]).toBe(EffectType.POISONED);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
  });

  it('effect past expiry (now > expiry) — should expire', () => {
    applyEffect(effects, EffectType.POISONED, 5, NOW_SEC - 1);
    const buf = makeBuffer();
    const count = tickEffects(effects, NOW_SEC, buf);
    expect(count).toBe(1);
    expect(buf[0]).toBe(EffectType.POISONED);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
  });

  it('permanent effect should never expire', () => {
    applyPermanentEffect(effects, EffectType.POISONED, 5);
    const buf = makeBuffer();
    const count = tickEffects(effects, NOW_SEC + 1_000_000, buf);
    expect(count).toBe(0);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(true);
  });

  it('multiple effects — only expired one is reported', () => {
    applyEffect(effects, EffectType.POISONED, 5, NOW_SEC - 1);  // expired
    applyEffect(effects, EffectType.STUNNED, 2, NOW_SEC + 100);  // not expired
    const buf = makeBuffer();
    const count = tickEffects(effects, NOW_SEC, buf);
    expect(count).toBe(1);
    expect(buf[0]).toBe(EffectType.POISONED);
    expect(isEffectActive(effects, EffectType.POISONED)).toBe(false);
    expect(isEffectActive(effects, EffectType.STUNNED)).toBe(true);
  });

  it('multiple expired effects on same actor', () => {
    applyEffect(effects, EffectType.POISONED, 5, NOW_SEC - 1);
    applyEffect(effects, EffectType.STUNNED, 2, NOW_SEC - 2);
    const buf = makeBuffer();
    const count = tickEffects(effects, NOW_SEC, buf);
    expect(count).toBe(2);
    // The order matches EffectType ordinals (POISONED=0, STUNNED=1)
    expect(buf[0]).toBe(EffectType.POISONED);
    expect(buf[1]).toBe(EffectType.STUNNED);
  });
});

describe('narrative integration', () => {
  it('EffectDidStart carries correct fields for renderEffectStart', () => {
    const event = new EffectDidStart();
    event.init(TRACE, ACTOR_ID, 10, EffectType.POISONED, 5);
    const rendered = renderEffectStart('Kael', event);
    expect(rendered).toBe('Kael is afflicted with Poison (intensity 5).');
  });

  it('EffectDidEnd carries correct fields for renderEffectEnd', () => {
    const event = new EffectDidEnd();
    event.init(TRACE, ACTOR_ID, 10, EffectType.POISONED);
    const rendered = renderEffectEnd('Kael', event);
    expect(rendered).toBe('Poison on Kael has ended.');
  });
});
