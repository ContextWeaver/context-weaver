// RPG Event Generator v3.0.0 - Core Generator
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
  debug?: boolean; // Enable debug logging
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

    const id = this.generateEventId();
    const type = this.selectEventType(analyzedContext, contextModifiers.eventTypePreferences);
    const difficulty = this.calculateDifficulty(analyzedContext, contextModifiers.difficultyModifier);
    
    // Generate title and description with shared context to ensure coherence
    const generationContext = {
      type,
      analyzedContext,
      contextModifiers,
      difficulty
    };
    
    let title = this.generateTitle(type, analyzedContext, generationContext);
    let description = this.generateDescription(title, type, analyzedContext, generationContext);
    
    // Validate coherence and regenerate if needed
    let coherenceAttempts = 0;
    const maxCoherenceAttempts = 3;
    while (!this.validateCoherence(title, description, type) && coherenceAttempts < maxCoherenceAttempts) {
      title = this.generateTitle(type, analyzedContext, generationContext);
      description = this.generateDescription(title, type, analyzedContext, generationContext);
      coherenceAttempts++;
    }
    
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
    const baseTypes = [
      'COMBAT', 'SOCIAL', 'EXPLORATION', 'ECONOMIC',
      'MYSTERY', 'SUPERNATURAL', 'POLITICAL', 'TECHNOLOGICAL'
    ];

    let typePool = [...baseTypes];
    if (preferences.length > 0) {
      typePool = [...preferences, ...baseTypes];
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
   * Generate event title with context awareness
   */
  private generateTitle(
    type: string, 
    context: AnalyzedContext,
    generationContext?: any
  ): string {
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

    // Context-aware adjective selection
    let adjectives = ['Unexpected', 'Mysterious', 'Dangerous', 'Lucrative', 'Critical', 'Extraordinary'];
    
    // Adjust adjectives based on context
    if (context.wealthTier === 'poor') {
      adjectives = ['Desperate', 'Urgent', 'Risky', ...adjectives];
    }
    if (context.wealthTier === 'rich') {
      adjectives = ['Luxurious', 'Exclusive', 'Prestigious', ...adjectives];
    }
    if (context.lifeStage === 'elder') {
      adjectives = ['Ancient', 'Forgotten', 'Legendary', ...adjectives];
    }
    if (context.lifeStage === 'youth') {
      adjectives = ['New', 'Fresh', 'Bold', ...adjectives];
    }
    
    // Try to use training data for title generation if available
    const markovStats = this.markovEngine.getStats();
    if (markovStats.totalTransitions > 0) {
      // Use Markov chain to generate a title-like phrase
      const markovResult = this.markovEngine.generateContextual(
        { powerLevel: context.powerLevel, complexity: 5 },
        generationContext?.theme
      );
      
      // Extract key words from Markov result for title
      const words = markovResult.string.split(/\s+/).filter(w => w.length > 3);
      if (words.length > 0) {
        const markovNoun = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        const adjective = this.chance.pickone(adjectives);
        return `${adjective} ${markovNoun}`;
      }
    }

    const nouns = typeWords[type as keyof typeof typeWords] || ['Event'];
    const adjective = this.chance.pickone(adjectives);
    const noun = this.chance.pickone(nouns);

    return `${adjective} ${noun}`;
  }

  /**
   * Generate event description with coherence to title and context awareness
   */
  private generateDescription(
    title: string,
    type: string,
    context: AnalyzedContext,
    generationContext?: any
  ): string {
    // Extract key words from title to ensure coherence
    const titleWords = title.toLowerCase().split(/\s+/);
    const titleKeywords = titleWords.filter(w => w.length > 4); // Focus on meaningful words
    
    // Use contextual generation with theme based on title and type
    const theme = generationContext?.theme || type.toLowerCase();
    
    // Generate description using contextual Markov generation
    const markovContext = {
      powerLevel: context.powerLevel,
      complexity: context.powerLevel > 50 ? 80 : 50,
      type: type.toLowerCase(),
      titleKeywords: titleKeywords
    };
    
    const markovResult = this.markovEngine.generateContextual(markovContext, theme);
    let description = markovResult.string;

    // Ensure description references title concepts for coherence
    if (titleKeywords.length > 0 && !description.toLowerCase().includes(titleKeywords[0])) {
      // Try to incorporate title concept into description
      const titleConcept = titleKeywords[0];
      if (description.length < 100) {
        description = `This ${titleConcept} presents a significant challenge. ${description}`;
      }
    }

    // Context-aware additions
    if (context.wealthTier === 'poor' && this.chance.bool({ likelihood: 30 })) {
      description += ' Your limited resources make this particularly challenging.';
    }

    if (context.wealthTier === 'rich' && this.chance.bool({ likelihood: 20 })) {
      description += ' Your wealth and influence may open doors that others cannot access.';
    }

    if (context.lifeStage === 'elder' && this.chance.bool({ likelihood: 20 })) {
      description += ' Drawing on your extensive experience may prove valuable here.';
    }

    if (context.lifeStage === 'youth' && this.chance.bool({ likelihood: 20 })) {
      description += ' Your youthful energy and enthusiasm could be an advantage.';
    }

    // Type-specific context additions
    if (type === 'COMBAT' && context.skillProfile.combat > 50) {
      description += ' Your combat expertise gives you an edge in this situation.';
    }

    if (type === 'SOCIAL' && context.skillProfile.social > 50) {
      description += ' Your social skills may help navigate this encounter.';
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
   * Validate coherence between title and description
   */
  private validateCoherence(title: string, description: string, type: string): boolean {
    // Basic coherence checks
    const titleWords = title.toLowerCase().split(/\s+/);
    const descriptionLower = description.toLowerCase();
    
    // Check if description contains at least one meaningful word from title
    const meaningfulTitleWords = titleWords.filter(w => w.length > 3);
    if (meaningfulTitleWords.length > 0) {
      const hasCommonWord = meaningfulTitleWords.some(word => descriptionLower.includes(word));
      if (!hasCommonWord && meaningfulTitleWords.length > 1) {
        // Allow if at least one word matches
        return false;
      }
    }
    
    // Check if description is not too generic
    const genericPhrases = ['something happened', 'an event occurs', 'you find yourself'];
    const isTooGeneric = genericPhrases.some(phrase => descriptionLower.includes(phrase));
    if (isTooGeneric) {
      return false;
    }
    
    // Check minimum length
    if (description.length < 20) {
      return false;
    }
    
    return true;
  }

  /**
   * Generate tags for the event
   */
  private generateTags(type: string, context: AnalyzedContext): string[] {
    const tags = [type.toLowerCase()];

    if (context.wealthTier !== 'moderate') {
      tags.push(context.wealthTier);
    }

    if (context.lifeStage !== 'adult') {
      tags.push(context.lifeStage);
    }

    if (context.careerPath && context.careerPath !== 'adventurer') {
      tags.push(context.careerPath.toLowerCase());
    }

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