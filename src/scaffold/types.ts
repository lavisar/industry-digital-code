/**
 * Scaffold types for the screening exercise.
 *
 * These types are a minimal, self-contained subset of the production codebase.
 * Do not modify this file.
 */

// ---------------------------------------------------------------------------
// Identity types
// ---------------------------------------------------------------------------

export type ActorID = number;
export type PlaceID = number;

/**
 * Command ID -- a 4-element integer tuple used for causal tracing.
 * Treat as opaque; pass through from caller to events/errors.
 */
export type CommandID = [number, number, number, number];

// ---------------------------------------------------------------------------
// Timestamp
// ---------------------------------------------------------------------------

/**
 * Epoch timestamp: [epochSeconds, milliseconds (0--999)].
 */
export type SmiTimestamp = [number, number];

export const createSmiTimestamp = (): SmiTimestamp => [0, 0];

// ---------------------------------------------------------------------------
// Poolable
// ---------------------------------------------------------------------------

export interface Poolable {
  reset(): void;
}

// ---------------------------------------------------------------------------
// Arena (object pool interface)
// ---------------------------------------------------------------------------

/**
 * Arena for recycling poolable objects. Acquired instances are returned via
 * reset() at the end of a batch -- no per-object deallocation during the
 * pipeline cycle.
 */
export interface ArenaInterface {
  acquireInstance<T extends Poolable>(Class: new () => T): T;
}

/**
 * Null arena -- allocates fresh instances via `new`. Functional for tests
 * and single-use contexts where pooling is unnecessary.
 */
export class NullArena implements ArenaInterface {
  acquireInstance<T extends Poolable>(Class: new () => T): T {
    return new Class();
  }
}

// ---------------------------------------------------------------------------
// Effect types (defined in src/effects/types.ts -- re-exported here)
// ---------------------------------------------------------------------------

export { EffectType } from '../effects/types';

// ---------------------------------------------------------------------------
// Command types
// ---------------------------------------------------------------------------

export enum CommandType {
  TICK_EFFECTS,
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export enum EventType {
  EFFECT_DID_START,
  EFFECT_DID_END,
}

/** Total number of EventType members. Used to pre-allocate per-type arrays. */
export const EVENT_TYPE_COUNT = Object.keys(EventType).length / 2;

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export enum ErrorCode {
  ACTOR_NOT_FOUND,
  ACTOR_NOT_FOUND_IN_PLACE,
  PLACE_NOT_FOUND,
}
