import { WorldEvent, EventType, type CommandID, type ActorID, type PlaceID } from '@scaffold';
import { type EffectType } from './types';

/**
 * EffectDidStart and EffectDidEnd event classes.
 *
 * TODO: Implement these classes.
 *
 * Remember:
 *   - Events extend WorldEvent.
 *   - Events carry integer fields, not narrative strings.
 *   - init() populates fields from positional args (trace is always first).
 *   - reset() restores every mutable field to its initial value.
 *
 * The narrative renderer (src/narrative.ts) reads fields directly from your
 * events. It expects:
 *
 *   EffectDidStart: effectType (number), magnitude (number)
 *   EffectDidEnd:   effectType (number)
 */

export class EffectDidStart extends WorldEvent {
  readonly type = EventType.EFFECT_DID_START;
  effectType: number = 0;
  magnitude: number = 0;

  init(
    trace: CommandID,
    actor: ActorID,
    location: PlaceID,
    effectType: EffectType,
    magnitude: number,
  ): this {
    this.trace = trace;
    this.actor = actor;
    this.location = location;
    this.effectType = effectType;
    this.magnitude = magnitude;
    return this;
  }

  reset(): void {
    super.reset();
    this.effectType = 0;
    this.magnitude = 0;
  }
}

export class EffectDidEnd extends WorldEvent {
  readonly type = EventType.EFFECT_DID_END;
  effectType: number = 0;

  init(
    trace: CommandID,
    actor: ActorID,
    location: PlaceID,
    effectType: EffectType,
  ): this {
    this.trace = trace;
    this.actor = actor;
    this.location = location;
    this.effectType = effectType;
    return this;
  }

  reset(): void {
    super.reset();
    this.effectType = 0;
  }
}
