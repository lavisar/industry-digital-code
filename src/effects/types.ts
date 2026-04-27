/**
 * Effect type definitions.
 *
 * Add your effect type values to the EffectType enum.
 * The README specifies that POISONED must be one of them.
 */

export enum EffectType {
  POISONED,
  STUNNED,
  WEAKENED,
  BLESSED,
}

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
