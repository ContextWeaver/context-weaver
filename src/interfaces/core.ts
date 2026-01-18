// Core system interfaces for dependency injection
// Defines contracts for generation, analysis, and scaling systems

import { Event, PlayerContext, AnalyzedContext } from '../types';

export interface IGeneratorCore {
  generateEvent(playerContext: any): Event;
  generateEvents(playerContext: any, count: number): Event[];
  addTrainingData(texts: string[], theme?: string): void;
}

export interface IMarkovEngine {
  addData(texts: string[]): void;
  generate(options?: any): any;
  getStats(): any;
  clear(): void;
}

export interface IContextAnalyzer {
  analyzeContext(context: PlayerContext): AnalyzedContext;
}

export interface IDifficultyScaler {
  calculatePowerLevel(context: PlayerContext): number;
  calculateDifficultyTier(powerLevel: number): any;
  scaleEffectsForDifficulty(choices: any[], context: PlayerContext): any[];
  analyzeDifficulty(context: PlayerContext): any;
}