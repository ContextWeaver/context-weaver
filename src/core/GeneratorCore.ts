// RPG Event Generator v2.0.0 - Core Generator
// Main event generation logic combining all components

import { Chance } from 'chance';
import { Event, PlayerContext, Choice, Effect, AnalyzedContext } from '../types';
import { IGeneratorCore } from '../interfaces';
import { MarkovEngine } from './MarkovEngine';
import { ContextAnalyzer } from './ContextAnalyzer';
import { DIFFICULTY_SETTINGS, DEFAULT_CONTEXT, TIME_CONSTANTS } from '../utils';

export interface GeneratorOptions {
  chance?: Chance.Chance;
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
  customRules?: { [key: string]: any };
}

export class GeneratorCore implements IGeneratorCore {
  private chance: Chance.Chance;
  private markovEngine: MarkovEngine;
  private contextAnalyzer: ContextAnalyzer;
  private options: GeneratorOptions;

  constructor(options: GeneratorOptions = {}) {
    this.options = options;
    this.chance = options.chance || new Chance();
    this.markovEngine = new MarkovEngine({ stateSize: options.stateSize });
    this.contextAnalyzer = new ContextAnalyzer();

    if (options.trainingData) {
      this.markovEngine.addData(options.trainingData);
    }
  }

  /**
   * Generate a complete event
   */
  generateEvent(playerContext: PlayerContext = {}): Event {
    const analyzedContext = this.contextAnalyzer.analyzeContext(playerContext);
    const contextModifiers = this.contextAnalyzer.getContextModifiers(analyzedContext);

    // Generate event components
    const id = this.generateEventId();
    const type = this.selectEventType(analyzedContext, contextModifiers.eventTypePreferences);
    const difficulty = this.calculateDifficulty(analyzedContext, contextModifiers.difficultyModifier);
    const title = this.generateTitle(type, analyzedContext);
    const description = this.generateDescription(title, type, analyzedContext);
    const choices = this.generateChoices(type, difficulty, analyzedContext, contextModifiers.rewardModifier);

    return {
      id,
      title,
      description,
      choices,
      type,
      context: playerContext,
      difficulty,
      tags: this.generateTags(type, analyzedContext)
    };
  }

  /**
   * Generate multiple events
   */
  generateEvents(playerContext: PlayerContext = {}, count: number = 1): Event[] {
    const events: Event[] = [];
    for (let i = 0; i < count; i++) {
      events.push(this.generateEvent(playerContext));
    }
    return events;
  }

  addTrainingData(texts: string[], theme?: string): void {
    this.markovEngine.addData(texts, theme);
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Select appropriate event type based on context
   */
  private selectEventType(
    context: AnalyzedContext,
    preferences: string[]
  ): string {
    // Base event types
    const baseTypes = [
      'COMBAT', 'SOCIAL', 'EXPLORATION', 'ECONOMIC',
      'MYSTERY', 'SUPERNATURAL', 'POLITICAL', 'TECHNOLOGICAL'
    ];

    // Weight preferences higher
    let typePool = [...baseTypes];
    if (preferences.length > 0) {
      typePool = [...preferences, ...baseTypes]; // Add preferences multiple times
    }

    return this.chance.pickone(typePool);
  }

  /**
   * Calculate event difficulty
   */
  private calculateDifficulty(
    context: AnalyzedContext,
    modifier: number = 0
  ): string {
    const powerLevel = context.powerLevel + modifier;

    if (powerLevel <= DIFFICULTY_SETTINGS.easy.powerRange[1]) return 'easy';
    if (powerLevel <= DIFFICULTY_SETTINGS.normal.powerRange[1]) return 'normal';
    if (powerLevel <= DIFFICULTY_SETTINGS.hard.powerRange[1]) return 'hard';
    return 'legendary';
  }

  /**
   * Generate event title
   */
  private generateTitle(type: string, context: AnalyzedContext): string {
    const typeWords = {
      COMBAT: ['Battle', 'Confrontation', 'Clash', 'Skirmish'],
      SOCIAL: ['Gathering', 'Meeting', 'Encounter', 'Assembly'],
      EXPLORATION: ['Discovery', 'Journey', 'Expedition', 'Exploration'],
      ECONOMIC: ['Opportunity', 'Transaction', 'Deal', 'Exchange'],
      MYSTERY: ['Mystery', 'Enigma', 'Puzzle', 'Riddle'],
      SUPERNATURAL: ['Phenomenon', 'Manifestation', 'Vision', 'Curse'],
      POLITICAL: ['Affair', 'Intrigue', 'Scheme', 'Conspiracy'],
      TECHNOLOGICAL: ['Innovation', 'Malfunction', 'Breakthrough', 'System']
    };

    const adjectives = ['Unexpected', 'Mysterious', 'Dangerous', 'Lucrative', 'Critical', 'Extraordinary'];
    const nouns = typeWords[type as keyof typeof typeWords] || ['Event'];

    const adjective = this.chance.pickone(adjectives);
    const noun = this.chance.pickone(nouns);

    return `${adjective} ${noun}`;
  }

  /**
   * Generate event description
   */
  private generateDescription(
    title: string,
    type: string,
    context: AnalyzedContext
  ): string {
    // Use Markov chain to generate base description
    const markovResult = this.markovEngine.generate({
      minLength: 50,
      maxLength: 150
    });

    let description = markovResult.string;

    // Add context-specific elements
    if (context.wealthTier === 'poor' && this.chance.bool({ likelihood: 30 })) {
      description += ' Your limited resources make this particularly challenging.';
    }

    if (context.lifeStage === 'elder' && this.chance.bool({ likelihood: 20 })) {
      description += ' Drawing on your extensive experience may prove valuable here.';
    }

    return description;
  }

  /**
   * Generate event choices
   */
  private generateChoices(
    type: string,
    difficulty: string,
    context: AnalyzedContext,
    rewardModifier: number
  ): Choice[] {
    const choiceCount = this.chance.integer({ min: 2, max: 4 });
    const choices: Choice[] = [];

    for (let i = 0; i < choiceCount; i++) {
      choices.push(this.generateChoice(type, difficulty, context, rewardModifier, i));
    }

    return choices;
  }

  /**
   * Generate a single choice
   */
  private generateChoice(
    type: string,
    difficulty: string,
    context: AnalyzedContext,
    rewardModifier: number,
    index: number
  ): Choice {
    const choiceTexts = {
      COMBAT: ['Fight bravely', 'Attempt to flee', 'Negotiate', 'Use strategy'],
      SOCIAL: ['Be diplomatic', 'Be assertive', 'Listen carefully', 'Change the subject'],
      EXPLORATION: ['Investigate', 'Proceed cautiously', 'Call for help', 'Turn back'],
      ECONOMIC: ['Accept the deal', 'Negotiate better terms', 'Decline politely', 'Make a counteroffer']
    };

    const texts = choiceTexts[type as keyof typeof choiceTexts] || ['Accept', 'Decline', 'Investigate', 'Ignore'];
    const text = texts[index % texts.length];

    const effect = this.generateChoiceEffect(type, difficulty, context, rewardModifier);

    return {
      text,
      effect
    };
  }

  /**
   * Generate effect for a choice
   */
  private generateChoiceEffect(
    type: string,
    difficulty: string,
    context: AnalyzedContext,
    rewardModifier: number
  ): Effect {
    const effect: Effect = {};

    // Base effects based on type and difficulty
    const difficultyMultiplier = this.getDifficultyMultiplier(difficulty);

    switch (type) {
      case 'COMBAT':
        effect.health = Math.round(this.chance.integer({ min: -20, max: 10 }) * difficultyMultiplier);
        if (this.chance.bool({ likelihood: 30 })) {
          effect.gold = Math.round(this.chance.integer({ min: 0, max: 100 }) * rewardModifier);
        }
        break;

      case 'SOCIAL':
        effect.reputation = Math.round(this.chance.integer({ min: -10, max: 15 }) * difficultyMultiplier);
        if (this.chance.bool({ likelihood: 40 })) {
          effect.influence = Math.round(this.chance.integer({ min: 0, max: 20 }) * rewardModifier);
        }
        break;

      case 'ECONOMIC':
        effect.gold = Math.round(this.chance.integer({ min: -50, max: 200 }) * difficultyMultiplier * rewardModifier);
        if (this.chance.bool({ likelihood: 25 })) {
          effect.reputation = Math.round(this.chance.integer({ min: -5, max: 10 }));
        }
        break;

      case 'EXPLORATION':
        if (this.chance.bool({ likelihood: 60 })) {
          effect.gold = Math.round(this.chance.integer({ min: 0, max: 150 }) * rewardModifier);
        }
        if (this.chance.bool({ likelihood: 20 })) {
          effect.health = Math.round(this.chance.integer({ min: -15, max: 0 }));
        }
        break;

      default:
        // Generic effect
        effect.gold = Math.round(this.chance.integer({ min: -20, max: 50 }) * difficultyMultiplier);
        break;
    }

    return effect;
  }

  /**
   * Get difficulty multiplier for effects
   */
  private getDifficultyMultiplier(difficulty: string): number {
    const settings = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS];
    return settings ? settings.rewardMultiplier : 1.0;
  }

  /**
   * Generate tags for the event
   */
  private generateTags(type: string, context: AnalyzedContext): string[] {
    const tags = [type.toLowerCase()];

    // Add context-based tags
    if (context.wealthTier !== 'moderate') {
      tags.push(context.wealthTier);
    }

    if (context.lifeStage !== 'adult') {
      tags.push(context.lifeStage);
    }

    if (context.careerPath && context.careerPath !== 'adventurer') {
      tags.push(context.careerPath.toLowerCase());
    }

    // Add random thematic tags
    const thematicTags = ['adventure', 'danger', 'opportunity', 'intrigue', 'discovery'];
    if (this.chance.bool({ likelihood: 40 })) {
      tags.push(this.chance.pickone(thematicTags));
    }

    return tags;
  }

  /**
   * Update generator with new training data
   */
  updateTrainingData(texts: string[]): void {
    this.markovEngine.addData(texts);
  }

  /**
   * Get generator statistics
   */
  getStats(): {
    markovStats: any;
    contextAnalysisEnabled: boolean;
    options: GeneratorOptions;
  } {
    return {
      markovStats: this.markovEngine.getStats(),
      contextAnalysisEnabled: true,
      options: this.options
    };
  }
}