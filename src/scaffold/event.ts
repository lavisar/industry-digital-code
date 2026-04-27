/**
 * WorldEvent abstract base class.
 *
 * All domain events extend this. Events are structured facts about what
 * happened in the game world. They carry integer fields and passthrough strings.
 * They contain no business logic, no side effects, and no rendered narrative.
 *
 * Do not modify this file.
 */

import {
  type Poolable,
  type EventType,
  type CommandID,
  type ActorID,
  type PlaceID,
} from './types';

export abstract class WorldEvent implements Poolable {
  abstract readonly type: EventType;

  epoch: number = 0;
  sequence: number = 0;
  trace: CommandID = [0, 0, 0, 0];
  actor: ActorID = 0;
  target: ActorID = 0;
  location: PlaceID = 0;

  reset(): void {
    this.epoch = 0;
    this.sequence = 0;
    this.trace = [0, 0, 0, 0];
    this.actor = 0;
    this.target = 0;
    this.location = 0;
  }

  abstract init(trace: CommandID, ...args: any[]): this;
}
