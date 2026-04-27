/**
 * Entity types for the screening exercise.
 *
 * Minimal representations of Actor and Place with only the fields
 * relevant to the exercise.
 *
 * Do not modify this file.
 */

import {
  type ActorID,
  type PlaceID,
} from './types';
import { type StatusEffects, createEffects, resetEffects } from '../effects/effects';

// ---------------------------------------------------------------------------
// Actor (relevant fields only)
// ---------------------------------------------------------------------------

export class Actor {
  id: ActorID = 0;
  name: string = '';
  location: PlaceID = 0;
  effects: StatusEffects = createEffects();

  init(id: ActorID, name: string, location: PlaceID): this {
    this.id = id;
    this.name = name;
    this.location = location;
    return this;
  }

  reset(): void {
    this.id = 0;
    this.name = '';
    this.location = 0;
    resetEffects(this.effects);
  }
}

// ---------------------------------------------------------------------------
// Place (relevant fields only)
// ---------------------------------------------------------------------------

export class Place {
  id: PlaceID = 0;

  init(id: PlaceID): this {
    this.id = id;
    return this;
  }

  reset(): void {
    this.id = 0;
  }
}
