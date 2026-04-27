/**
 * TICK_EFFECTS command and reducer.
 */

import {
  CommandType,
  AbstractCommand,
  type Transformer,
  type TransformerContext,
  withCommandType,
} from '../scaffold';

import { tickEffects, EXPIRED_EFFECTS_BUFFER_SIZE, type ExpiredEffectsBuffer } from '../effects/effects';
import { EffectDidEnd } from '../effects/events';

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

export class TickEffectsCommand extends AbstractCommand<CommandType.TICK_EFFECTS> {
  readonly type = CommandType.TICK_EFFECTS;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const reducerCore: Transformer<TickEffectsCommand> = (
  context, command,
): TransformerContext => {
  const now = context.timestamp[0];
  const expiredBuffer: ExpiredEffectsBuffer = [];

  // Pre-size the buffer to avoid dynamic growth during tick
  for (let i = 0; i < EXPIRED_EFFECTS_BUFFER_SIZE; i++) {
    expiredBuffer.push(0);
  }

  for (const actor of context.world.actors.values()) {
    const count = tickEffects(actor.effects, now, expiredBuffer);
    for (let i = 0; i < count; i++) {
      const effectType = expiredBuffer[i]!;
      context.declareEvent(
        EffectDidEnd,
        command.id,
        actor.id,
        actor.location,
        effectType,
      );
    }
  }

  return context;
};

export const reducer: Transformer<TickEffectsCommand> =
  withCommandType(CommandType.TICK_EFFECTS, reducerCore);
