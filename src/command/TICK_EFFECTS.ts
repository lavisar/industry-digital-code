/**
 * TICK_EFFECTS command and reducer.
 *
 * The command advances the status effects clock. The reducer walks every
 * actor in the world, ticks their effects,
 * and declares an EffectDidEnd event for every effect that expired.
 *
 * The command class is provided. Implement the reducer.
 */

import {
  CommandType,
  AbstractCommand,
  type Transformer,
  type TransformerContext,
  withCommandType,
} from '../scaffold';

// Import your implementations:
// import { tickEffects } from '../effects/effects';
// import { EffectDidEnd } from '../effects/events';

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export class TickEffectsCommand extends AbstractCommand<CommandType.TICK_EFFECTS> {
  readonly type = CommandType.TICK_EFFECTS;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Implement the reducer:
 *
 *   1. Walk every actor in the world.
 *   2. Call tickEffects on each actor's effects container.
 *   3. Declare an EffectDidEnd event for every effect that expired.
 *   4. Return context.
 */
const reducerCore: Transformer<TickEffectsCommand> = (
  context, command,
): TransformerContext => {
  // Implement me
  return context;
};

export const reducer: Transformer<TickEffectsCommand> =
  withCommandType(CommandType.TICK_EFFECTS, reducerCore);
