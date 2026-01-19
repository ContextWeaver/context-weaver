// RPG Event Generator v3.0.0 - Context Analyzer
// Analyzes player context and adapts event generation accordingly

import { PlayerContext, AnalyzedContext } from '../types';
import { IContextAnalyzer } from '../interfaces';
import { DEFAULT_CONTEXT } from '../utils';

export class ContextAnalyzer implements IContextAnalyzer {
  /**
   * Analyze and normalize player context
   */
  analyzeContext(playerContext: PlayerContext = {}): AnalyzedContext {
    const ctx = { ...DEFAULT_CONTEXT, ...playerContext };

    return {
      ...ctx,
      powerLevel: this.calculatePowerLevel(ctx),
      wealthTier: this.determineWealthTier(ctx.gold || 0),
      influenceTier: this.determineInfluenceTier(ctx.influence || 0),
      skillProfile: this.analyzeSkills(ctx),
      lifeStage: this.determineLifeStage(ctx.age || DEFAULT_CONTEXT.AGE),
      careerPath: ctx.career || 'adventurer',
      personality: this.inferPersonality(ctx)
    };
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
  } {
    const { wealthTier, influenceTier, lifeStage, personality } = analyzedContext;

    let difficultyModifier = 0;
    let rewardModifier = 1.0;
    const eventTypePreferences: string[] = [];

    // Wealth-based modifiers
    switch (wealthTier) {
      case 'poor':
        difficultyModifier += 0.2; // Harder events for poor players
        rewardModifier *= 1.3; // Better rewards
        eventTypePreferences.push('ECONOMIC', 'QUEST');
        break;
      case 'rich':
        difficultyModifier -= 0.1; // Easier events for rich players
        eventTypePreferences.push('POLITICAL', 'SOCIAL');
        break;
    }

    // Influence-based modifiers
    switch (influenceTier) {
      case 'elite':
        eventTypePreferences.push('POLITICAL', 'ROYAL');
        break;
      case 'low':
        eventTypePreferences.push('GUILD', 'UNDERWORLD');
        break;
    }

    // Life stage modifiers
    switch (lifeStage) {
      case 'youth':
        difficultyModifier -= 0.1; // Easier for young
        eventTypePreferences.push('ADVENTURE', 'EXPLORATION');
        break;
      case 'elder':
        difficultyModifier += 0.1; // Harder for elders
        eventTypePreferences.push('POLITICAL', 'MENTORSHIP');
        break;
    }

    // Personality modifiers
    if (personality.riskTolerance > 0.7) {
      eventTypePreferences.push('COMBAT', 'DANGER');
    }
    if (personality.socialPreference > 0.7) {
      eventTypePreferences.push('SOCIAL', 'DIPLOMACY');
    }

    return {
      difficultyModifier,
      rewardModifier,
      eventTypePreferences
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