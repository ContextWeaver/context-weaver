// RPG Event Generator v3.0.0 - Environmental System
// Manages weather, seasonal, and environmental modifiers

import { Chance } from 'chance';
import { IEnvironmentalSystem } from '../interfaces';

export interface EnvironmentalContext {
  weather?: string;
  season?: string;
  timeOfDay?: string;
  location?: string;
  climate?: string;
}

export interface Modifier {
  id: string;
  type: 'weather' | 'season' | 'location' | 'time' | 'climate';
  effects: {
    health_drain?: number;
    movement_penalty?: number;
    cold_modifier?: number;
    heat_modifier?: number;
    energy_bonus?: number;
    visibility?: number;
    encounter_rate?: number;
  };
  text_modifiers: {
    atmosphere?: string;
    add_descriptors?: string[];
    replace?: { [key: string]: string };
    append?: string;
    prepend?: string;
  };
  registeredAt?: number;
}

export interface ModifiedEvent {
  id: string;
  title: string;
  description: string;
  choices: any[];
  type: string;
  context: any;
  difficulty?: string;
  tags?: string[];
  environmentalEffects?: {
    appliedModifiers: string[];
    netEffects: { [key: string]: number };
  };
}

export class EnvironmentalSystem implements IEnvironmentalSystem {
  private modifiers: Map<string, Modifier>;
  private activeModifiers: Set<string>;
  private chance: Chance.Chance;

  constructor(chance: Chance.Chance = new Chance()) {
    this.modifiers = new Map();
    this.activeModifiers = new Set();
    this.chance = chance;
    this.initializeBuiltInModifiers();
  }

  /**
   * Initialize built-in environmental modifiers
   */
  private initializeBuiltInModifiers(): void {
    // Weather modifiers
    this.modifiers.set('rain', {
      id: 'rain',
      type: 'weather',
      effects: {
        health_drain: 2,
        movement_penalty: 0.1,
        visibility: 0.8
      },
      text_modifiers: {
        atmosphere: 'dismal',
        add_descriptors: ['wet', 'rainy']
      }
    });

    this.modifiers.set('storm', {
      id: 'storm',
      type: 'weather',
      effects: {
        health_drain: 5,
        movement_penalty: 0.3,
        visibility: 0.5,
        encounter_rate: 0.7
      },
      text_modifiers: {
        atmosphere: 'chaotic',
        add_descriptors: ['thunderous', 'tempestuous']
      }
    });

    // Seasonal modifiers
    this.modifiers.set('winter', {
      id: 'winter',
      type: 'season',
      effects: {
        cold_modifier: 1.5,
        movement_penalty: 0.2,
        energy_bonus: -5
      },
      text_modifiers: {
        add_descriptors: ['frozen', 'harsh'],
        atmosphere: 'bleak'
      }
    });

    this.modifiers.set('summer', {
      id: 'summer',
      type: 'season',
      effects: {
        heat_modifier: 1.3,
        energy_bonus: 10,
        encounter_rate: 1.2
      },
      text_modifiers: {
        add_descriptors: ['sunny', 'warm'],
        atmosphere: 'energetic'
      }
    });

    // Time-based modifiers
    this.modifiers.set('night', {
      id: 'night',
      type: 'time',
      effects: {
        visibility: 0.6,
        encounter_rate: 0.8
      },
      text_modifiers: {
        atmosphere: 'shadowy',
        add_descriptors: ['dark', 'mysterious']
      }
    });

    this.modifiers.set('dawn', {
      id: 'dawn',
      type: 'time',
      effects: {
        energy_bonus: 5,
        visibility: 0.9
      },
      text_modifiers: {
        atmosphere: 'hopeful',
        add_descriptors: ['fresh', 'new']
      }
    });
  }

  /**
   * Set environmental context and activate appropriate modifiers
   */
  setEnvironmentalContext(context: EnvironmentalContext): void {
    this.activeModifiers.clear();

    // Activate weather modifier
    if (context.weather && this.modifiers.has(context.weather)) {
      this.activeModifiers.add(context.weather);
    }

    // Activate seasonal modifier
    if (context.season && this.modifiers.has(context.season)) {
      this.activeModifiers.add(context.season);
    }

    // Activate time-based modifier
    if (context.timeOfDay && this.modifiers.has(context.timeOfDay)) {
      this.activeModifiers.add(context.timeOfDay);
    }
  }

  /**
   * Apply all active modifiers to an event
   */
  applyModifiers(event: any): ModifiedEvent {
    let modifiedEvent = { ...event };

    // Order modifiers for consistent application
    const modifierOrder = ['storm', 'rain', 'winter', 'summer', 'night', 'dawn'];
    const orderedModifiers = Array.from(this.activeModifiers).sort((a, b) => {
      const aIndex = modifierOrder.indexOf(a);
      const bIndex = modifierOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    const appliedModifiers: string[] = [];
    const netEffects: { [key: string]: number } = {};

    for (const modifierId of orderedModifiers) {
      const modifier = this.modifiers.get(modifierId);
      if (modifier) {
        modifiedEvent = this.applySingleModifier(modifiedEvent, modifier);
        appliedModifiers.push(modifierId);

        // Track net effects for debugging
        Object.entries(modifier.effects).forEach(([key, value]) => {
          if (typeof value === 'number') {
            netEffects[key] = (netEffects[key] || 0) + value;
          }
        });
      }
    }

    // Add environmental metadata
    modifiedEvent.environmentalEffects = {
      appliedModifiers,
      netEffects
    };

    return modifiedEvent;
  }

  /**
   * Apply a single modifier to an event
   */
  private applySingleModifier(event: any, modifier: Modifier): any {
    const modifiedEvent = { ...event };

    // Apply numerical effects to choices
    if (modifier.effects && modifiedEvent.choices) {
      modifiedEvent.choices = modifiedEvent.choices.map((choice: any) => {
        const modifiedChoice = { ...choice, effect: { ...choice.effect } };

        // Movement penalties
        if (modifier.effects.movement_penalty && modifiedChoice.effect.movement !== undefined) {
          modifiedChoice.effect.movement *= (1 - modifier.effects.movement_penalty);
        }

        // Health effects
        if (modifier.effects.health_drain) {
          modifiedChoice.effect.health = (modifiedChoice.effect.health || 0) - modifier.effects.health_drain;
        }

        if (modifier.effects.cold_modifier && modifiedChoice.effect.health !== undefined) {
          modifiedChoice.effect.health = Math.floor(modifiedChoice.effect.health * modifier.effects.cold_modifier);
        }

        if (modifier.effects.heat_modifier && modifiedChoice.effect.health !== undefined) {
          modifiedChoice.effect.health = Math.floor(modifiedChoice.effect.health * modifier.effects.heat_modifier);
        }

        // Energy effects
        if (modifier.effects.energy_bonus) {
          modifiedChoice.effect.energy = (modifiedChoice.effect.energy || 0) + modifier.effects.energy_bonus;
        }

        // Visibility effects (could affect stealth/detection)
        if (modifier.effects.visibility && modifiedChoice.effect.visibility !== undefined) {
          modifiedChoice.effect.visibility *= modifier.effects.visibility;
        }

        return modifiedChoice;
      });
    }

    // Apply text modifications
    if (modifier.text_modifiers) {
      this.applyTextModifiers(modifiedEvent, modifier.text_modifiers);
    }

    return modifiedEvent;
  }

  /**
   * Apply text modifications to event description
   */
  private applyTextModifiers(event: any, textModifiers: Modifier['text_modifiers']): void {
    if (!textModifiers) return;

    // Atmosphere modifications
    if (textModifiers.atmosphere) {
      const atmospheres: { [key: string]: string } = {
        'dismal': ' under gloomy skies',
        'chaotic': ' amidst the raging chaos',
        'bleak': ' in the harsh winter cold',
        'energetic': ' filled with summer vitality',
        'shadowy': ' shrouded in darkness',
        'hopeful': ' at the break of dawn'
      };

      const atmosphereText = atmospheres[textModifiers.atmosphere];
      if (atmosphereText && !event.description.includes(atmosphereText)) {
        event.description += atmosphereText;
      }
    }

    // Add descriptors
    if (textModifiers.add_descriptors && textModifiers.add_descriptors.length > 0) {
      const descriptor = this.chance.pickone(textModifiers.add_descriptors);
      // Simple insertion - could be made more sophisticated
      event.description = event.description.replace(/\b(the|a)\b/i, `$1 ${descriptor}`);
    }

    // Replace text patterns
    if (textModifiers.replace) {
      Object.entries(textModifiers.replace).forEach(([pattern, replacement]) => {
        event.description = event.description.replace(new RegExp(pattern, 'g'), replacement);
      });
    }

    // Append/prepend text
    if (textModifiers.append) {
      event.description += textModifiers.append;
    }

    if (textModifiers.prepend) {
      event.description = textModifiers.prepend + event.description;
    }
  }

  /**
   * Register a custom environmental modifier
   */
  registerModifier(modifierId: string, modifierConfig: Omit<Modifier, 'id' | 'registeredAt'>): void {
    if (this.modifiers.has(modifierId)) {
      console.warn(`Modifier '${modifierId}' already exists`);
      return;
    }

    this.modifiers.set(modifierId, {
      id: modifierId,
      ...modifierConfig,
      registeredAt: Date.now()
    });
  }

  /**
   * Unregister a custom modifier
   */
  unregisterModifier(modifierId: string): boolean {
    if (!this.modifiers.has(modifierId)) {
      console.warn(`Modifier '${modifierId}' not found`);
      return false;
    }

    this.modifiers.delete(modifierId);
    this.activeModifiers.delete(modifierId);
    return true;
  }

  /**
   * Get all registered modifiers
   */
  getModifiers(): { [id: string]: Modifier } {
    const result: { [id: string]: Modifier } = {};
    this.modifiers.forEach((modifier, id) => {
      result[id] = modifier;
    });
    return result;
  }

  /**
   * Get currently active modifiers
   */
  getActiveModifiers(): string[] {
    return Array.from(this.activeModifiers);
  }

  /**
   * Check if a modifier is active
   */
  isModifierActive(modifierId: string): boolean {
    return this.activeModifiers.has(modifierId);
  }

  /**
   * Clear all active modifiers
   */
  clearActiveModifiers(): void {
    this.activeModifiers.clear();
  }

  /**
   * Get environmental system statistics
   */
  getStats(): {
    totalModifiers: number;
    activeModifiers: number;
    modifierTypes: { [type: string]: number };
  } {
    const types: { [type: string]: number } = {};
    this.modifiers.forEach(modifier => {
      types[modifier.type] = (types[modifier.type] || 0) + 1;
    });

    return {
      totalModifiers: this.modifiers.size,
      activeModifiers: this.activeModifiers.size,
      modifierTypes: types
    };
  }
}