import { EffectType, EFFECT_TYPE_COUNT } from './types';

// ---------------------------------------------------------------------------
// Internal slot types
// ---------------------------------------------------------------------------

/** One effect slot: active if magnitude !== -1, otherwise inactive. */
interface EffectSlot {
  magnitude: number;   // -1 = inactive, >= 0 = active
  expiry: number | null; // null = permanent, epoch seconds = expiry
}

/** Pre-allocated buffer for returning expired effect types from tickEffects. */
export type ExpiredEffectsBuffer = number[];

/** Maximum capacity of the expired effects buffer (max one per effect type). */
export const EXPIRED_EFFECTS_BUFFER_SIZE = EFFECT_TYPE_COUNT;

// ---------------------------------------------------------------------------
// StatusEffects container
// ---------------------------------------------------------------------------

export type StatusEffects = {
  /** Fixed-size array indexed by EffectType ordinal. */
  slots: EffectSlot[];
};

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

/** Sentinel value marking an inactive effect slot. */
const INACTIVE_MAG = -1;

/** Duration for temporary effects (5 minutes in seconds). */
const DEFAULT_DURATION_SEC = 300;

// ---------------------------------------------------------------------------
// Creation / reset (required by scaffold -- do not change arity)
// ---------------------------------------------------------------------------

export const createEffects = (): StatusEffects => {
  const slots: EffectSlot[] = [];
  for (let i = 0; i < EFFECT_TYPE_COUNT; i++) {
    slots.push({ magnitude: INACTIVE_MAG, expiry: null });
  }
  return { slots };
};

export const resetEffects = (effects: StatusEffects): void => {
  for (let i = 0; i < EFFECT_TYPE_COUNT; i++) {
    effects.slots[i]!.magnitude = INACTIVE_MAG;
    effects.slots[i]!.expiry = null;
  }
};

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/** Returns true if the given effect type is currently active. */
export const isEffectActive = (effects: StatusEffects, type: EffectType): boolean => {
  const slot = effects.slots[type]!;
  return slot.magnitude !== INACTIVE_MAG;
};

/** Returns the magnitude of an active effect, or 0 if inactive. */
export const getEffectMagnitude = (effects: StatusEffects, type: EffectType): number => {
  const slot = effects.slots[type]!;
  return slot.magnitude !== INACTIVE_MAG ? slot.magnitude : 0;
};

// ---------------------------------------------------------------------------
// Apply / clear
// ---------------------------------------------------------------------------

/**
 * Apply a timed effect with a default duration.
 * If the effect type is already active, it is overwritten.
 */
export const applyEffect = (
  effects: StatusEffects,
  type: EffectType,
  magnitude: number,
  expiry: number,
): void => {
  effects.slots[type]!.magnitude = magnitude;
  effects.slots[type]!.expiry = expiry;
};

/**
 * Apply a permanent effect (no expiry).
 * If the effect type is already active, it is overwritten.
 */
export const applyPermanentEffect = (
  effects: StatusEffects,
  type: EffectType,
  magnitude: number,
): void => {
  effects.slots[type]!.magnitude = magnitude;
  effects.slots[type]!.expiry = null;
};

/**
 * Deactivate a single effect by type.
 */
export const clearEffect = (effects: StatusEffects, type: EffectType): void => {
  effects.slots[type]!.magnitude = INACTIVE_MAG;
  effects.slots[type]!.expiry = null;
};

// ---------------------------------------------------------------------------
// tickEffects -- zero allocation on hot path
// ---------------------------------------------------------------------------

/**
 * Tick all timed effects, expiring any whose expiry <= now.
 *
 * Expired effect types are written into the provided `out` buffer.
 * Returns the number of expired effects written (0..n, clamped to buffer size).
 *
 * The caller (reducer) allocates the buffer once and reuses it per call,
 * so no heap allocation occurs on the hot path inside this function.
 */
export const tickEffects = (
  effects: StatusEffects,
  now: number,
  out: ExpiredEffectsBuffer,
): number => {
  let count = 0;
  for (let i = 0; i < EFFECT_TYPE_COUNT; i++) {
    const slot = effects.slots[i]!;
    if (slot.magnitude === INACTIVE_MAG) continue;
    if (slot.expiry !== null && slot.expiry <= now) {
      // Expire this effect
      if (count < out.length) {
        out[count] = i;
      }
      count++;
      slot.magnitude = INACTIVE_MAG;
      slot.expiry = null;
    }
  }
  return count;
};

// ---------------------------------------------------------------------------
// Convenience factory for the standard 5-minute duration
// (Not required by scaffold; useful for tests and typical usage.)
// ---------------------------------------------------------------------------

/**
 * Apply a timed effect with a default duration (5 minutes).
 */
export const applyTimedEffect = (
  effects: StatusEffects,
  type: EffectType,
  magnitude: number,
  now: number,
): void => {
  applyEffect(effects, type, magnitude, now + DEFAULT_DURATION_SEC);
};
