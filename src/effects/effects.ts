/**
 * Status effects system.
 *
 * Design the data representation and implement the functions listed below.
 * The README describes what each function does. You design the signatures.
 *
 * The scaffold (src/scaffold/entity.ts) depends on three exports from this
 * file. Do not rename them or change their arity:
 *
 *   - StatusEffects   (type)
 *   - createEffects() (no arguments, returns StatusEffects)
 *   - resetEffects(effects: StatusEffects): void
 *
 * Everything else -- data layout, field design, parameter lists, return
 * types, helpers -- is yours to design.
 */

// ---------------------------------------------------------------------------
// Data representation
// ---------------------------------------------------------------------------

// TODO: Design your StatusEffects type.
export type StatusEffects = {};

// ---------------------------------------------------------------------------
// Creation / reset (required by scaffold -- do not change arity)
// ---------------------------------------------------------------------------

/** Create a new, empty effects container. All effects inactive. */
export const createEffects = (): StatusEffects => {
  // TODO: implement
  return {} as StatusEffects;
};

/** Clear all effects in an existing container. */
export const resetEffects = (effects: StatusEffects): void => {
  // TODO: implement
};

// ---------------------------------------------------------------------------
// Operations (see README for the full list)
// ---------------------------------------------------------------------------

// TODO: implement
