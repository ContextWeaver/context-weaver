// RPG Event Generator v3.1.0 - Main Entry Point
// Clean composition-based architecture with full backward compatibility

import { RPGEventGenerator as ModularRPGEventGenerator } from './RPGEventGenerator';
import type { PlayerContext, Event } from './types';

// Export the main class
export { ModularRPGEventGenerator as RPGEventGenerator };

// Re-export types (selective to avoid conflicts)
export type {
  Event,
  Choice,
  PlayerContext,
  Template,
  ChainDefinition,
  ChainStage,
  TimeBasedChain,
  TemplateCondition,
  ConditionalChoice,
  DynamicField,
  TemplateComposition,
  RuleDefinition,
  NPC,
  Relationship,
  RelationshipEntry,
  GameState,
  TimeSystem,
  EnvironmentalContext,
  Modifier,
  LanguagePack,
  ExportData,
  ImportResult,
  GeneratorOptions,
  DifficultySettings,
  DifficultyTier,
  ValidationResult,
  Effect,
  TimeInfo,
  AnalyzedContext,
  RuleCondition,
  RuleEffects
} from './types';

// Re-export additional types from modules
export type { MarkovOptions, MarkovResult } from './core';
export type { TemplateMetadata } from './templates';

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
export function generateRPGEvent(playerContext: PlayerContext = {}): Event {
  const generator = new ModularRPGEventGenerator();
  return generator.generateEvent(playerContext);
}