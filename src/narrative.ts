/**
 * Narrative renderer -- client-side fixture.
 *
 * DO NOT MODIFY THIS FILE.
 *
 * In production, the client receives WorldEvents and renders player-facing
 * text from their integer fields and a locale table. This module simulates
 * that renderer for testing purposes.
 *
 * The renderer reads fields directly from your event objects. The intersection
 * types below declare which fields each renderer expects. Your EffectDidStart
 * and EffectDidEnd classes must carry these fields (as integers) for the
 * renderer to produce correct output.
 *
 * Display labels are resolved from EFFECT_LABELS via bracket notation:
 *
 *   EFFECT_LABELS[event.effectType]
 */

import { type WorldEvent } from '@scaffold';
import { EFFECT_LABELS } from './effects/types';

/**
 * Renders a narrative string when an effect starts.
 *
 * Reads from the event: effectType (number), magnitude (number).
 *
 * Expected output example:
 *   "Kael is afflicted with Poison (intensity 5)."
 */
export const renderEffectStart = (
  actorName: string,
  event: WorldEvent & { effectType: number; magnitude: number },
): string =>
  `${actorName} is afflicted with ${EFFECT_LABELS[event.effectType]} (intensity ${event.magnitude}).`;

/**
 * Renders a narrative string when an effect ends.
 *
 * Reads from the event: effectType (number).
 *
 * Expected output example:
 *   "Poison on Kael has ended."
 */
export const renderEffectEnd = (
  actorName: string,
  event: WorldEvent & { effectType: number },
): string =>
  `${EFFECT_LABELS[event.effectType]} on ${actorName} has ended.`;
