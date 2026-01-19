// RPG Event Generator v3.0.0 - Main Entry Point
// Clean composition-based architecture with full backward compatibility

import { RPGEventGenerator as ModularRPGEventGenerator } from './RPGEventGenerator';

// Export the main class
export { ModularRPGEventGenerator as RPGEventGenerator };

// Re-export types (selective to avoid conflicts)
export type {
  Event,
  Choice,
  PlayerContext,
  Template,
  ChainDefinition,
  RuleDefinition,
  NPC,
  Relationship,
  TimeBasedChain,
  GameState,
  TimeSystem,
  EnvironmentalContext,
  Modifier,
  LanguagePack,
  ExportData,
  ImportResult,
  DifficultySettings,
  ValidationResult,
  Effect,
  TimeInfo
} from './types';

// Re-export utility functions
export * from './utils';

// Re-export individual systems for advanced usage
export * from './core';
export * from './templates';
export * from './chains';
export * from './rules';
export * from './environment';
export * from './time';
export * from './relationships';
export * from './localization';

/**
 * Convenience function for generating a single RPG event
 * @param playerContext - Player context information
 * @returns Generated event
 */
export function generateRPGEvent(playerContext: any = {}): any {
  const generator = new ModularRPGEventGenerator();
  return generator.generateEvent(playerContext);
}