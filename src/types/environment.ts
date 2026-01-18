// Environmental types for RPG Event Generator
// Weather, seasonal, and modifier systems

import { Choice, Effect } from './events';

export interface EnvironmentalContext {
  weather?: string;
  season?: string;
  timeOfDay?: string;
}

export interface Modifier {
  name: string;
  description: string;
  effects: {
    description?: (text: string) => string;
    choices?: (choices: Choice[]) => Choice[];
    visibility?: any;
    cold_modifier?: any;
    heat_modifier?: any;
    movement_penalty?: any;
    energy_bonus?: any;
  };
}