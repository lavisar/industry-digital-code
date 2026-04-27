/**
 * Tests for the TICK_EFFECTS reducer.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  type ActorID,
  type PlaceID,
  type CommandID,
  EffectType,
  EventType,
  createTransformerContext,
  type TransformerContext,
  Actor,
  Place,
  type SmiTimestamp,
} from '../scaffold';

import { TickEffectsCommand, reducer } from './TICK_EFFECTS';
import { applyEffect, applyPermanentEffect, isEffectActive } from '../effects/effects';
import { EffectDidEnd } from '../effects/events';
import { renderEffectEnd } from '../narrative';

const PLACE_ID: PlaceID = 10;
const TRACE: CommandID = [1, 0, 0, 0];

// context.timestamp defaults to [1_740_000_060, 500]
const NOW_SEC = 1_740_000_060;
const NOW_MS = 500;

describe('TICK_EFFECTS reducer', () => {
  let context: TransformerContext;
  let command: TickEffectsCommand;
  let place: Place;

  beforeEach(() => {
    context = createTransformerContext();
    command = new TickEffectsCommand();
    command.id = TRACE;

    place = new Place().init(PLACE_ID);
    context.world.places.set(PLACE_ID, place);
  });

  it('should return context', () => {
    const result = reducer(context, command);
    expect(result).toBe(context);
  });

  describe('no actors', () => {
    it('should declare no events when world has no actors', () => {
      reducer(context, command);
      expect(context.getDeclaredEvents()).toHaveLength(0);
    });
  });

  describe('actor with no active effects', () => {
    it('should declare no events when actor has no effects', () => {
      const actor = new Actor().init(1, 'Kael', PLACE_ID);
      context.world.actors.set(actor.id, actor);
      reducer(context, command);
      expect(context.getDeclaredEvents()).toHaveLength(0);
    });
  });

  describe('actor with permanent effect', () => {
    it('should not declare EffectDidEnd for a permanent effect', () => {
      const actor = new Actor().init(1, 'Kael', PLACE_ID);
      context.world.actors.set(actor.id, actor);
      applyPermanentEffect(actor.effects, EffectType.POISONED, 5);
      reducer(context, command);
      const events = context.getDeclaredEventsByType(EventType.EFFECT_DID_END);
      expect(events).toHaveLength(0);
      expect(isEffectActive(actor.effects, EffectType.POISONED)).toBe(true);
    });
  });

  describe('actor with timed effect not yet expired', () => {
    it('should not declare EffectDidEnd when now < expiry', () => {
      const actor = new Actor().init(1, 'Kael', PLACE_ID);
      context.world.actors.set(actor.id, actor);
      applyEffect(actor.effects, EffectType.POISONED, 5, NOW_SEC + 100);
      reducer(context, command);
      const events = context.getDeclaredEventsByType(EventType.EFFECT_DID_END);
      expect(events).toHaveLength(0);
      expect(isEffectActive(actor.effects, EffectType.POISONED)).toBe(true);
    });
  });

  describe('actor with expired effect', () => {
    it('should declare one EffectDidEnd with correct effectType', () => {
      const actor = new Actor().init(1, 'Kael', PLACE_ID);
      context.world.actors.set(actor.id, actor);
      applyEffect(actor.effects, EffectType.POISONED, 5, NOW_SEC - 1);
      reducer(context, command);
      const events = context.getDeclaredEventsByType(EventType.EFFECT_DID_END);
      expect(events).toHaveLength(1);
      const ev = events[0] as EffectDidEnd;
      expect(ev.effectType).toBe(EffectType.POISONED);
    });

    it('effect is deactivated after tick', () => {
      const actor = new Actor().init(1, 'Kael', PLACE_ID);
      context.world.actors.set(actor.id, actor);
      applyEffect(actor.effects, EffectType.POISONED, 5, NOW_SEC - 1);
      reducer(context, command);
      expect(isEffectActive(actor.effects, EffectType.POISONED)).toBe(false);
    });
  });

  describe('multiple actors', () => {
    it('only expired effects declare events', () => {
      const actor1 = new Actor().init(1, 'Kael', PLACE_ID);
      const actor2 = new Actor().init(2, 'Mira', PLACE_ID);
      context.world.actors.set(actor1.id, actor1);
      context.world.actors.set(actor2.id, actor2);

      // Kael: expired
      applyEffect(actor1.effects, EffectType.POISONED, 5, NOW_SEC - 1);
      // Mira: not expired
      applyEffect(actor2.effects, EffectType.STUNNED, 2, NOW_SEC + 100);

      reducer(context, command);

      const events = context.getDeclaredEventsByType(EventType.EFFECT_DID_END);
      expect(events).toHaveLength(1);
      const ev = events[0] as EffectDidEnd;
      expect(ev.effectType).toBe(EffectType.POISONED);
    });
  });

  describe('multiple expired effects on one actor', () => {
    it('should declare one EffectDidEnd per expired effect', () => {
      const actor = new Actor().init(1, 'Kael', PLACE_ID);
      context.world.actors.set(actor.id, actor);
      applyEffect(actor.effects, EffectType.POISONED, 5, NOW_SEC - 1);
      applyEffect(actor.effects, EffectType.STUNNED, 2, NOW_SEC - 2);
      reducer(context, command);
      const events = context.getDeclaredEventsByType(EventType.EFFECT_DID_END);
      expect(events).toHaveLength(2);
      const effectTypes = (events as EffectDidEnd[]).map(e => e.effectType);
      expect(effectTypes).toContain(EffectType.POISONED);
      expect(effectTypes).toContain(EffectType.STUNNED);
    });
  });
});
