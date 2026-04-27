/**
 * Effect type definitions.
 *
 * Add your effect type values to the EffectType enum.
 * The README specifies that POISONED must be one of them.
 */

export enum EffectType {
  POISONED = 0,
  STUNNED = 1,
  WEAKENED = 2,
  BLESSED = 3,
}

/** Total number of effect types. */
export const EFFECT_TYPE_COUNT = Object.keys(EffectType).length / 2;

/**
 * Display labels for effect types, consumed by the narrative renderer.
 *
 * The narrative fixture (src/narrative.ts) accesses this via bracket notation:
 *
 *   EFFECT_LABELS[effectType]
 *
 * Populate this alongside your EffectType enum.
 */
export const EFFECT_LABELS: Record<number, string> = {
  [EffectType.POISONED]: 'Poison',
  [EffectType.STUNNED]: 'Stun',
  [EffectType.WEAKENED]: 'Weakness',
  [EffectType.BLESSED]: 'Blessing',
};
