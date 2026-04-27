/**
 * Tests for the TICK_EFFECTS reducer.
 *
 * Write your tests here. The describe block and beforeEach are provided
 * as a starting point -- you write the test cases.
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

// Import your implementations:
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

  // TODO: Write your tests here.
});
