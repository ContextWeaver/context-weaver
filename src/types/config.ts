// Configuration and utility types for RPG Event Generator
// Generator options, export/import, validation, and system configuration

import { Template, ChainDefinition } from './templates';
import { NPC } from './npcs';
import { EventDependency } from './events';
import { RuleDefinition } from './rules';
import { AIEnhancementOptions } from '../ai';

// Generator configuration
export interface GeneratorOptions {
  chance?: any; // Chance.js instance
  stateSize?: number;
  trainingData?: string[];
  theme?: string | null;
  culture?: string | null;
  enableTemplates?: boolean;
  templateLibrary?: string | null;
  enableDependencies?: boolean;
  enableModifiers?: boolean;
  enableRelationships?: boolean;
  language?: string;
  pureMarkovMode?: boolean;
  enableRuleEngine?: boolean;
  customRules?: { [key: string]: RuleDefinition };
  aiEnhancement?: AIEnhancementOptions;
  enableDatabase?: boolean;
  databaseAdapter?: any;
  debug?: boolean; // Enable debug logging
}

// Markov generator types
export interface MarkovOptions {
  stateSize?: number;
  minLength?: number;
  maxLength?: number;
  maxTries?: number;
  allowDuplicates?: boolean;
}

// Export/import types
export interface ExportData {
  templates: { [key: string]: Template };
  trainingData: { [key: string]: string[] };
  chains: { [key: string]: ChainDefinition };
  rules?: { [key: string]: RuleDefinition };
  npcs?: { [key: string]: NPC };
}

export interface ImportResult {
  templates: { success: number; failed: string[] };
  trainingData: { success: number; failed: string[] };
  chains: { success: number; failed: string[] };
  rules?: { success: number; failed: string[] };
  npcs?: { success: number; failed: string[] };
}

// Difficulty and scaling types
export interface DifficultyTier {
  powerRange: [number, number];
  rewardMultiplier: number;
  penaltyMultiplier: number;
}

export interface DifficultySettings {
  easy: DifficultyTier;
  normal: DifficultyTier;
  hard: DifficultyTier;
  legendary: DifficultyTier;
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}


// Theme and culture types
export interface ThemeData {
  name: string;
  version: string;
  created: string;
  author: string;
  description: string;
  tags: string[];
  license: string;
  settings: Partial<GeneratorOptions>;
  trainingData: string[];
  templates?: { [key: string]: Template };
  chains?: { [key: string]: ChainDefinition };
  rules?: { [key: string]: RuleDefinition };
}