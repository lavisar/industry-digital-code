/**
 * AbstractCommand base class.
 *
 * All concrete commands extend this. Commands are the structured input
 * to the Transformation stage.
 *
 * Do not modify this file.
 */

import {
  type Poolable,
  type CommandType,
  type CommandID,
  type ActorID,
  type PlaceID,
} from './types';

export type CommandInterface<T extends CommandType = CommandType> = Poolable & {
  readonly type: T;
  id: CommandID;
  actor: ActorID;
  location: PlaceID;
};

export abstract class AbstractCommand<T extends CommandType>
  implements CommandInterface<T>
{
  abstract readonly type: T;
  id: CommandID = [0, 0, 0, 0];
  actor: ActorID = 0;
  location: PlaceID = 0;

  reset(): void {
    this.id[0] = 0; this.id[1] = 0; this.id[2] = 0; this.id[3] = 0;
    this.actor = 0;
    this.location = 0;
  }
}
