// RPG Event Generator v4.0.0 - Context Analyzer
// Analyzes player context and adapts event generation accordingly

import { PlayerContext, AnalyzedContext } from '../types';
import { IContextAnalyzer } from '../interfaces';
import { DEFAULT_CONTEXT } from '../utils';

export type ContextHandler = (
  context: PlayerContext,
  analyzedContext: AnalyzedContext
) => {
  difficultyModifier?: number;
  rewardModifier?: number;
  eventTypePreferences?: string[];
  customTags?: string[];
  [key: string]: any;
};

export class ContextAnalyzer implements IContextAnalyzer {
  private customHandlers: Map<string, ContextHandler> = new Map();
  private knownProperties: Set<string> = new Set([
    'age', 'gold', 'influence', 'wealth', 'skills', 'level', 'reputation',
    'power_level', 'career', 'health', 'tags', 'relationships', 'location',
    'season', 'stress', 'happiness', 'karma', 'faith', 'vices', 'secrets',
    'ambitions', 'social_standing', 'life_experience', 'knowledge'
  ]);

  registerHandler(propertyName: string, handler: ContextHandler): void {
    this.customHandlers.set(propertyName, handler);
  }

  unregisterHandler(propertyName: string): boolean {
    return this.customHandlers.delete(propertyName);
  }

  getHandlers(): string[] {
    return Array.from(this.customHandlers.keys());
  }
  /**
   * Analyze and normalize player context
   */
  analyzeContext(playerContext: PlayerContext = {}): AnalyzedContext {
    const ctx = { ...DEFAULT_CONTEXT, ...playerContext };

    const analyzed: AnalyzedContext = {
      ...ctx,
      powerLevel: this.calculatePowerLevel(ctx),
      wealthTier: this.determineWealthTier(ctx.gold || 0),
      influenceTier: this.determineInfluenceTier(ctx.influence || 0),
      skillProfile: this.analyzeSkills(ctx),
      lifeStage: this.determineLifeStage(ctx.age || DEFAULT_CONTEXT.AGE),
      careerPath: ctx.career || 'adventurer',
      personality: this.inferPersonality(ctx)
    };

    return analyzed;
  }

  /**
   * Calculate overall power level from various stats
   */
  private calculatePowerLevel(ctx: PlayerContext): number {
    const level = ctx.level || 1;
    const gold = ctx.gold || 0;
    const influence = ctx.influence || 0;
    const health = ctx.health || 100;

    // Normalize and combine factors
    const levelScore = Math.min(level / 20, 1) * 25; // Max 25 points
    const goldScore = Math.min(Math.log10(gold + 1) / 6, 1) * 25; // Max 25 points (log scale)
    const influenceScore = Math.min(influence / 100, 1) * 25; // Max 25 points
    const healthScore = (health / 100) * 25; // Max 25 points

    return Math.round(levelScore + goldScore + influenceScore + healthScore);
  }

  /**
   * Determine wealth tier based on gold amount
   */
  private determineWealthTier(gold: number): 'poor' | 'moderate' | 'wealthy' | 'rich' {
    if (gold < 100) return 'poor';
    if (gold < 1000) return 'moderate';
    if (gold < 10000) return 'wealthy';
    return 'rich';
  }

  /**
   * Determine influence tier
   */
  private determineInfluenceTier(influence: number): 'low' | 'medium' | 'high' | 'elite' {
    if (influence < 10) return 'low';
    if (influence < 50) return 'medium';
    if (influence < 100) return 'high';
    return 'elite';
  }

  /**
   * Analyze skill profile from available data
   */
  private analyzeSkills(ctx: PlayerContext): AnalyzedContext['skillProfile'] {
    const skills = ctx.skills || {};

    return {
      combat: skills.combat || skills.fighting || skills.weaponry || 10,
      social: skills.diplomacy || skills.social || skills.charisma || 10,
      magic: skills.magic || skills.spellcasting || skills.sorcery || 10,
      technical: skills.technical || skills.engineering || skills.crafting || 10
    };
  }

  /**
   * Determine life stage based on age
   */
  private determineLifeStage(age: number): AnalyzedContext['lifeStage'] {
    if (age < 18) return 'youth';
    if (age < 35) return 'adult';
    if (age < 60) return 'experienced';
    return 'elder';
  }

  /**
   * Infer personality traits from context
   */
  private inferPersonality(ctx: PlayerContext): AnalyzedContext['personality'] {
    const career = ctx.career || '';
    const gold = ctx.gold || 0;
    const influence = ctx.influence || 0;

    // Risk tolerance based on wealth and career
    let riskTolerance = 0.5; // Medium risk default
    if (gold > 5000) riskTolerance += 0.2; // Wealthy = more risk tolerant
    if (career.includes('warrior') || career.includes('thief')) riskTolerance += 0.2;
    if (career.includes('priest') || career.includes('scholar')) riskTolerance -= 0.2;

    // Social preference based on influence and career
    let socialPreference = 0.5;
    if (influence > 50) socialPreference += 0.3;
    if (career.includes('noble') || career.includes('merchant')) socialPreference += 0.2;
    if (career.includes('hermit') || career.includes('warrior')) socialPreference -= 0.2;

    // Ambition level based on influence and wealth goals
    let ambitionLevel = 0.5;
    if (influence > 30) ambitionLevel += 0.2;
    if (gold > 2000) ambitionLevel += 0.2;
    if (ctx.age && ctx.age > 50) ambitionLevel -= 0.1; // Elders less ambitious

    return {
      riskTolerance: Math.max(0, Math.min(1, riskTolerance)),
      socialPreference: Math.max(0, Math.min(1, socialPreference)),
      ambitionLevel: Math.max(0, Math.min(1, ambitionLevel))
    };
  }

  /**
   * Get context-based event modifiers
   */
  getContextModifiers(analyzedContext: AnalyzedContext): {
    difficultyModifier: number;
    rewardModifier: number;
    eventTypePreferences: string[];
    customTags?: string[];
    [key: string]: any;
  } {
    const { wealthTier, influenceTier, lifeStage, personality } = analyzedContext;

    let difficultyModifier = 0;
    let rewardModifier = 1.0;
    const eventTypePreferences: string[] = [];
    const customTags: string[] = [];
    const customModifiers: { [key: string]: any } = {};

    switch (wealthTier) {
      case 'poor':
        difficultyModifier += 0.2;
        rewardModifier *= 1.3;
        eventTypePreferences.push('ECONOMIC', 'QUEST');
        break;
      case 'rich':
        difficultyModifier -= 0.1;
        eventTypePreferences.push('POLITICAL', 'SOCIAL');
        break;
    }

    switch (influenceTier) {
      case 'elite':
        eventTypePreferences.push('POLITICAL', 'ROYAL');
        break;
      case 'low':
        eventTypePreferences.push('GUILD', 'UNDERWORLD');
        break;
    }

    switch (lifeStage) {
      case 'youth':
        difficultyModifier -= 0.1;
        eventTypePreferences.push('ADVENTURE', 'EXPLORATION');
        break;
      case 'elder':
        difficultyModifier += 0.1;
        eventTypePreferences.push('POLITICAL', 'MENTORSHIP');
        break;
    }

    if (personality.riskTolerance > 0.7) {
      eventTypePreferences.push('COMBAT', 'DANGER');
    }
    if (personality.socialPreference > 0.7) {
      eventTypePreferences.push('SOCIAL', 'DIPLOMACY');
    }

    Object.keys(analyzedContext).forEach(key => {
      if (!this.knownProperties.has(key) && 
          !['powerLevel', 'wealthTier', 'influenceTier', 'skillProfile', 'lifeStage', 'careerPath', 'personality'].includes(key)) {
        const value = analyzedContext[key];
        
        if (typeof value === 'number' && value > 0) {
          const keyLower = key.toLowerCase();
          if (keyLower.includes('magic') || keyLower.includes('mana') || keyLower.includes('spell')) {
            eventTypePreferences.push('MAGIC', 'SPELLCASTING');
            customTags.push(key.toUpperCase());
          } else if (keyLower.includes('stealth') || keyLower.includes('agility') || keyLower.includes('speed')) {
            const normalizedValue = Math.min(value / 100, 1);
            difficultyModifier -= normalizedValue * 0.05;
            rewardModifier *= (1 + normalizedValue * 0.2);
            customTags.push(key.toUpperCase());
          } else if (keyLower.includes('reputation') || keyLower.includes('fame') || keyLower.includes('honor')) {
            if (value > 50) {
              eventTypePreferences.push('POLITICAL', 'SOCIAL');
            } else if (value < -50) {
              eventTypePreferences.push('UNDERWORLD', 'CRIMINAL');
            }
            customTags.push(key.toUpperCase());
          } else if (keyLower.includes('power') || keyLower.includes('strength') || (keyLower.includes('level') && !keyLower.includes('stealth'))) {
            const normalizedValue = Math.min(value / 100, 1);
            difficultyModifier += normalizedValue * 0.1;
            customTags.push(key.toUpperCase());
          }
        } else if (typeof value === 'string' && value.length > 0) {
          if (key.toLowerCase().includes('class') || key.toLowerCase().includes('race') || key.toLowerCase().includes('profession')) {
            customTags.push(value.toUpperCase().replace(/\s+/g, '_'));
            eventTypePreferences.push(value.toUpperCase());
          } else if (key.toLowerCase().includes('location') || key.toLowerCase().includes('biome') || key.toLowerCase().includes('region')) {
            customTags.push(value.toUpperCase().replace(/\s+/g, '_'));
          } else if (key.toLowerCase().includes('weather') || key.toLowerCase().includes('season') || key.toLowerCase().includes('time')) {
            customTags.push(value.toUpperCase().replace(/\s+/g, '_'));
          }
        } else if (Array.isArray(value) && value.length > 0) {
          if (key.toLowerCase().includes('inventory') || key.toLowerCase().includes('items')) {
            customTags.push('HAS_ITEMS');
            value.forEach(item => {
              if (typeof item === 'string') {
                customTags.push(item.toUpperCase().replace(/\s+/g, '_'));
              }
            });
          } else if (key.toLowerCase().includes('tags') || key.toLowerCase().includes('labels')) {
            customTags.push(...value.map(v => String(v).toUpperCase().replace(/\s+/g, '_')));
          }
        } else if (typeof value === 'object' && value !== null) {
          customTags.push(key.toUpperCase());
          Object.keys(value).forEach(subKey => {
            const subValue = value[subKey];
            if (typeof subValue === 'number' && subValue > 0) {
              customModifiers[`${key}_${subKey}`] = subValue;
            } else if (typeof subValue === 'string') {
              customTags.push(`${key}_${subKey}`.toUpperCase().replace(/\s+/g, '_'));
            }
          });
        } else {
          customTags.push(key.toUpperCase());
          if (value !== null && value !== undefined) {
            customModifiers[key] = value;
          }
        }
      }
    });

    this.customHandlers.forEach((handler, propertyName) => {
      try {
        const result = handler(analyzedContext, analyzedContext);
        
        if (result.difficultyModifier !== undefined) {
          difficultyModifier += result.difficultyModifier;
        }
        if (result.rewardModifier !== undefined) {
          rewardModifier *= result.rewardModifier;
        }
        if (result.eventTypePreferences) {
          eventTypePreferences.push(...result.eventTypePreferences);
        }
        if (result.customTags) {
          customTags.push(...result.customTags);
        }
        
        Object.keys(result).forEach(key => {
          if (!['difficultyModifier', 'rewardModifier', 'eventTypePreferences', 'customTags'].includes(key)) {
            customModifiers[key] = result[key];
          }
        });
      } catch (error) {
        console.warn(`Error in custom context handler for ${propertyName}:`, error);
      }
    });

    return {
      difficultyModifier,
      rewardModifier,
      eventTypePreferences,
      ...(customTags.length > 0 && { customTags }),
      ...customModifiers
    };
  }

  /**
   * Validate context data
   */
  validateContext(context: PlayerContext): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (context.age !== undefined && (context.age < 0 || context.age > 200)) {
      errors.push('Age must be between 0 and 200');
    }

    if (context.gold !== undefined && context.gold < 0) {
      errors.push('Gold cannot be negative');
    }

    if (context.influence !== undefined && (context.influence < 0 || context.influence > 200)) {
      errors.push('Influence must be between 0 and 200');
    }

    if (context.health !== undefined && (context.health < 0 || context.health > 200)) {
      errors.push('Health must be between 0 and 200');
    }

    if (context.reputation !== undefined && (context.reputation < -100 || context.reputation > 100)) {
      errors.push('Reputation must be between -100 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}