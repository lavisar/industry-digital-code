# Status Effects System — Architectural Overview

## 1. Data Layout

Effects are stored as a **fixed-size array indexed by `EffectType` ordinal**. Each slot is an `EffectSlot` object containing `magnitude: number` and `expiry: number | null`.

```typescript
type EffectSlot = {
  magnitude: number;    // -1 = inactive, >= 0 = active
  expiry: number | null; // null = permanent, epoch seconds = expiry
};

type StatusEffects = {
  slots: EffectSlot[];
};
```

**Why fixed-size array instead of Map or dynamic array:**
- O(1) lookup for `isEffectActive` and `getEffectMagnitude` — no hash computation
- No object allocation on `applyEffect` / `clearEffect`
- Cache-friendly iteration order (dense, predictable)
- `EffectType` enum values are small integers (0–3), ideal as array indices

The array size equals `EFFECT_TYPE_COUNT` (number of `EffectType` enum members), so it is fixed at 4 slots regardless of how many effects are active.

---

## 2. Active / Inactive Distinction

An effect slot is **inactive** when `magnitude === -1` (sentinel value). An active slot has `magnitude >= 0`.

This avoids a separate boolean flag field and keeps the slot a simple 2-field object. Checking whether an effect is active is a single comparison.

---

## 3. Permanence

An effect with `expiry === null` is permanent — `tickEffects` only expires a slot when both:
- `magnitude !== -1` (active), AND
- `expiry !== null && expiry <= now`

---

## 4. tickEffects Allocation Strategy

`tickEffects` accepts a **pre-allocated output buffer** and writes expired effect type ordinals into it:

```typescript
export const tickEffects = (
  effects: StatusEffects,
  now: number,
  out: ExpiredEffectsBuffer,  // caller-provided, no allocation inside
): number => { ... }
```

The caller (the reducer) allocates the buffer once per `TICK_EFFECTS` command and reuses it across all actor ticks. Within `tickEffects`, no `push`, no `concat`, no `slice` — only a pre-sized indexed write:

```typescript
out[count] = i;  // direct indexed write into caller's buffer
```

This achieves **zero heap allocation on the hot path** of ticking every actor every frame.

---

## 5. Boundary Between Effects System and Reducer

`tickEffects` returns a **count of expired effect ordinals** written into the provided buffer. It does NOT:
- Call `context.declareEvent()`
- Touch `TransformerContext`
- Allocate anything

The **reducer** (`TICK_EFFECTS.ts`) owns the responsibility of:
1. Iterating `context.world.actors`
2. Calling `tickEffects(actor.effects, now, buffer)`
3. For each expired ordinal in `[0, count)`, calling `context.declareEvent(EffectDidEnd, ...)`

This separation keeps the effects system pure and testable without any context dependency.

---

## 6. Narrative Integration

The narrative renderer (`src/narrative.ts`) consumes two event classes:

| Event class | Fields read by renderer | Output example |
|---|---|---|
| `EffectDidStart` | `effectType`, `magnitude` | "Kael is afflicted with Poison (intensity 5)." |
| `EffectDidEnd` | `effectType` | "Poison on Kael has ended." |

Both fields are plain integers on the event objects. `EFFECT_LABELS[effectType]` converts the numeric ordinal to a human-readable string at render time — the labels table is defined alongside `EffectType` in `types.ts`.
