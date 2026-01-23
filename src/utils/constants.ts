// RPG Event Generator v4.0.0 - Constants and Configuration
// This file contains all magic numbers, default values, and configuration constants

// Core generation constants
export const GENERATION_DEFAULTS = {
  MIN_LENGTH: 20,
  MAX_LENGTH: 100,
  MAX_TRIES: 10,
  STATE_SIZE: 2,
  MAX_ATTEMPTS: 100,
  NUM_FRAGMENTS: 2
} as const;

// Time system constants
export const TIME_CONSTANTS = {
  SEASON_LENGTH: 90, // days per season
  DAYS_PER_YEAR: 360,
  SEASONS: ['spring', 'summer', 'autumn', 'winter'] as const,
  STARTING_DAY: 1,
  STARTING_SEASON: 'spring',
  STARTING_YEAR: 1
} as const;

// Difficulty scaling constants
export const DIFFICULTY_SETTINGS = {
  easy: {
    powerRange: [0, 39] as [number, number],
    rewardMultiplier: 1.5,
    penaltyMultiplier: 0.7
  },
  normal: {
    powerRange: [40, 79] as [number, number],
    rewardMultiplier: 1.0,
    penaltyMultiplier: 1.0
  },
  hard: {
    powerRange: [80, 94] as [number, number],
    rewardMultiplier: 0.8,
    penaltyMultiplier: 1.3
  },
  legendary: {
    powerRange: [95, 100] as [number, number],
    rewardMultiplier: 0.6,
    penaltyMultiplier: 1.6
  }
} as const;

// Default player context values
export const DEFAULT_CONTEXT = {
  AGE: 16,
  WEALTH: 0,
  INFLUENCE: 0,
  REPUTATION: 0,
  HEALTH: 100,
  LEVEL: 1,
  POWER_LEVEL: 25
} as const;

// Environmental modifier probabilities and effects
export const ENVIRONMENTAL_CONSTANTS = {
  SEASONAL_EVENT_CHANCE: 10, // 10% chance per day
  WEATHER_CHANGE_CHANCE: 5,  // 5% chance per day
  CLIMATE_EXTREMES_MULTIPLIER: 1.5,
  WINTER_HEALTH_PENALTY: -5,
  STORM_MOVEMENT_PENALTY: -10
} as const;

// Chain system constants
export const CHAIN_CONSTANTS = {
  MAX_ACTIVE_CHAINS: 5,
  CHAIN_TIMEOUT_DAYS: 30,
  DEFAULT_CHAIN_DELAY: 3
} as const;

// Template system constants
export const TEMPLATE_CONSTANTS = {
  MAX_TEMPLATES_PER_GENRE: 1000,
  TEMPLATE_CACHE_SIZE: 100,
  TEMPLATE_VALIDATION_TIMEOUT: 5000
} as const;

// NPC relationship constants
export const RELATIONSHIP_CONSTANTS = {
  MAX_RELATIONSHIP_STRENGTH: 100,
  MIN_RELATIONSHIP_STRENGTH: -100,
  DEFAULT_RELATIONSHIP_STRENGTH: 0,
  RELATIONSHIP_DECAY_RATE: 0.1, // per day
  RELATIONSHIP_IMPROVEMENT_RATE: 5
} as const;

// Localization constants
export const LOCALIZATION_CONSTANTS = {
  DEFAULT_LANGUAGE: 'en',
  FALLBACK_LANGUAGE: 'en',
  MAX_TRANSLATION_CACHE_SIZE: 1000
} as const;

// Rule engine constants
export const RULE_CONSTANTS = {
  MAX_RULES_PER_GENERATOR: 100,
  RULE_EXECUTION_TIMEOUT: 1000,
  MAX_CONDITIONS_PER_RULE: 10
} as const;

// Performance constants
export const PERFORMANCE_CONSTANTS = {
  MAX_EVENTS_PER_SESSION: 1000,
  CACHE_TTL_SECONDS: 3600,
  BATCH_SIZE_LIMIT: 50
} as const;

// File system constants
export const FILE_CONSTANTS = {
  TEMPLATE_FILE_EXTENSION: '.json',
  EXPORT_FILE_EXTENSION: '.json',
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  BACKUP_RETENTION_DAYS: 30
} as const;

// Probability constants
export const PROBABILITY_CONSTANTS = {
  RANDOM_EVENT_CHANCE: 0.3,
  CHAIN_TRIGGER_CHANCE: 0.2,
  RELATIONSHIP_CHANGE_CHANCE: 0.15,
  ENVIRONMENTAL_EFFECT_CHANCE: 0.25
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_CHOICES_PER_EVENT: 5,
  MIN_CHOICES_PER_EVENT: 2
} as const;

// Logging constants
export const LOG_CONSTANTS = {
  LOG_LEVELS: ['debug', 'info', 'warn', 'error'] as const,
  DEFAULT_LOG_LEVEL: 'info',
  MAX_LOG_ENTRIES: 10000,
  LOG_RETENTION_DAYS: 7
} as const;