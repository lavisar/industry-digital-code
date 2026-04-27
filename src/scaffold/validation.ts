/**
 * Reducer composition wrappers.
 *
 * Higher-order functions that layer validation concerns onto reducers.
 * Each wrapper validates one concern, declares an error on failure, and
 * passes pre-validated entities to the next layer.
 *
 * Do not modify this file.
 */

import { type CommandInterface } from './command';
import { type TransformerContext } from './context';
import { type Actor, type Place } from './entity';
import { CommandType, ErrorCode } from './types';

// ---------------------------------------------------------------------------
// Transformer type
// ---------------------------------------------------------------------------

export type Transformer<TCommand extends CommandInterface> =
  (context: TransformerContext, command: TCommand) => TransformerContext;

// ---------------------------------------------------------------------------
// Validated reducer signature (receives actor + place from wrapper)
// ---------------------------------------------------------------------------

export type NeedsValidatedActorAndPlace<T> = T extends Transformer<infer TCommand>
  ? (context: TransformerContext, command: TCommand, actor: Actor, place: Place) => TransformerContext
  : never;

// ---------------------------------------------------------------------------
// withCommandType
// ---------------------------------------------------------------------------

export const withCommandType = <TCommand extends CommandInterface>(
  commandType: CommandType,
  reducer: Transformer<TCommand>,
): Transformer<TCommand> =>
  (context, command) => {
    if (command.type !== commandType) {
      return context;
    }
    return reducer(context, command);
  };

// ---------------------------------------------------------------------------
// withValidatedActorLocation
// ---------------------------------------------------------------------------

export const withValidatedActorLocation = <TCommand extends CommandInterface>(
  reducer: NeedsValidatedActorAndPlace<Transformer<TCommand>>,
): Transformer<TCommand> =>
  (context, command) => {
    const actor = context.world.actors.get(command.actor);
    if (!actor) {
      return context.declareError(command.id, ErrorCode.ACTOR_NOT_FOUND);
    }

    if (!actor.location) {
      return context.declareError(command.id, ErrorCode.ACTOR_NOT_FOUND_IN_PLACE);
    }

    const place = context.world.places.get(actor.location);
    if (!place) {
      return context.declareError(command.id, ErrorCode.PLACE_NOT_FOUND);
    }

    return reducer(context, command, actor, place);
  };
