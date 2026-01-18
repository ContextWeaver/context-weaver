// RPG Event Generator v2.0.0 - Difficulty Scaler
// Manages dynamic difficulty scaling based on player power and context

import { PlayerContext, Choice, Effect } from '../types';
import { IDifficultyScaler } from '../interfaces';
import { DIFFICULTY_SETTINGS } from '../utils';

export interface DifficultyTier {
  name: 'easy' | 'normal' | 'hard' | 'legendary';
  powerRange: [number, number];
  rewardMultiplier: number;
  penaltyMultiplier: number;
  description: string;
}

export interface ScaledChoice extends Choice {
  originalEffect?: Effect;
  scalingFactors?: {
    rewardMultiplier: number;
    penaltyMultiplier: number;
    difficultyTier: string;
  };
}

export interface DifficultyAnalysis {
  playerPowerLevel: number;
  recommendedTier: DifficultyTier;
  scalingFactors: {
    reward: number;
    penalty: number;
    challenge: number;
  };
  adaptiveSuggestions: string[];
}

export class DifficultyScaler implements IDifficultyScaler {
  private difficultyTiers: DifficultyTier[];

  constructor() {
    this.difficultyTiers = [
      {
        name: 'easy',
        powerRange: DIFFICULTY_SETTINGS.easy.powerRange,
        rewardMultiplier: DIFFICULTY_SETTINGS.easy.rewardMultiplier,
        penaltyMultiplier: DIFFICULTY_SETTINGS.easy.penaltyMultiplier,
        description: 'Suitable for new or low-power players'
      },
      {
        name: 'normal',
        powerRange: DIFFICULTY_SETTINGS.normal.powerRange,
        rewardMultiplier: DIFFICULTY_SETTINGS.normal.rewardMultiplier,
        penaltyMultiplier: DIFFICULTY_SETTINGS.normal.penaltyMultiplier,
        description: 'Balanced challenge for experienced players'
      },
      {
        name: 'hard',
        powerRange: DIFFICULTY_SETTINGS.hard.powerRange,
        rewardMultiplier: DIFFICULTY_SETTINGS.hard.rewardMultiplier,
        penaltyMultiplier: DIFFICULTY_SETTINGS.hard.penaltyMultiplier,
        description: 'Challenging for skilled players'
      },
      {
        name: 'legendary',
        powerRange: DIFFICULTY_SETTINGS.legendary.powerRange,
        rewardMultiplier: DIFFICULTY_SETTINGS.legendary.rewardMultiplier,
        penaltyMultiplier: DIFFICULTY_SETTINGS.legendary.penaltyMultiplier,
        description: 'Extreme challenge for master players'
      }
    ];
  }

  /**
   * Calculate player's power level from context
   */
  calculatePowerLevel(context: PlayerContext): number {
    const level = context.level || 1;
    const gold = context.gold || 0;
    const influence = context.influence || 0;
    const health = context.health || 100;

    // Normalize and combine factors
    const levelScore = Math.min(level / 20, 1) * 25; // Max 25 points
    const goldScore = Math.min(Math.log10(gold + 1) / 6, 1) * 25; // Max 25 points (log scale)
    const influenceScore = Math.min(influence / 100, 1) * 25; // Max 25 points
    const healthScore = (health / 100) * 25; // Max 25 points

    return Math.round(levelScore + goldScore + influenceScore + healthScore);
  }

  /**
   * Determine difficulty tier based on power level
   */
  calculateDifficultyTier(powerLevel: number): DifficultyTier {
    // Find the appropriate tier based on power level
    for (const tier of this.difficultyTiers) {
      if (powerLevel >= tier.powerRange[0] && powerLevel <= tier.powerRange[1]) {
        return tier;
      }
    }

    // Fallback: find closest tier
    let closestTier = this.difficultyTiers[0];
    let minDistance = Math.abs(powerLevel - (closestTier.powerRange[0] + closestTier.powerRange[1]) / 2);

    for (const tier of this.difficultyTiers.slice(1)) {
      const distance = Math.abs(powerLevel - (tier.powerRange[0] + tier.powerRange[1]) / 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestTier = tier;
      }
    }

    return closestTier;
  }

  /**
   * Scale choice effects based on difficulty
   */
  scaleEffectsForDifficulty(choices: Choice[], context: PlayerContext): ScaledChoice[] {
    const powerLevel = context.power_level || this.calculatePowerLevel(context);
    const difficultyTier = this.calculateDifficultyTier(powerLevel);

    return choices.map(choice => {
      const scaledChoice: ScaledChoice = { ...choice };

      if (choice.effect) {
        scaledChoice.originalEffect = { ...choice.effect };
        scaledChoice.effect = this.scaleEffect(choice.effect, difficultyTier);
        scaledChoice.scalingFactors = {
          rewardMultiplier: difficultyTier.rewardMultiplier,
          penaltyMultiplier: difficultyTier.penaltyMultiplier,
          difficultyTier: difficultyTier.name
        };
      }

      return scaledChoice;
    });
  }

  /**
   * Scale a single effect based on difficulty tier
   */
  private scaleEffect(effect: Effect, difficultyTier: DifficultyTier): Effect {
    const scaledEffect: Effect = {};

    Object.entries(effect).forEach(([key, value]) => {
      if (typeof value === 'number') {
        // Positive values (rewards) get multiplied by reward multiplier
        // Negative values (penalties) get multiplied by penalty multiplier
        if (value >= 0) {
          scaledEffect[key] = Math.round(value * difficultyTier.rewardMultiplier);
        } else {
          scaledEffect[key] = Math.round(value * difficultyTier.penaltyMultiplier);
        }
      } else if (Array.isArray(value) && value.length === 2) {
        // Handle range arrays [min, max]
        const [min, max] = value;
        if (typeof min === 'number' && typeof max === 'number') {
          scaledEffect[key] = [
            min >= 0 ? Math.round(min * difficultyTier.rewardMultiplier) : Math.round(min * difficultyTier.penaltyMultiplier),
            max >= 0 ? Math.round(max * difficultyTier.rewardMultiplier) : Math.round(max * difficultyTier.penaltyMultiplier)
          ] as [number, number];
        } else {
          scaledEffect[key] = value;
        }
      } else {
        // Non-numeric values pass through unchanged
        scaledEffect[key] = value;
      }
    });

    return scaledEffect;
  }

  /**
   * Analyze difficulty for a given context
   */
  analyzeDifficulty(context: PlayerContext): DifficultyAnalysis {
    const playerPowerLevel = context.power_level || this.calculatePowerLevel(context);
    const recommendedTier = this.calculateDifficultyTier(playerPowerLevel);

    const scalingFactors = {
      reward: recommendedTier.rewardMultiplier,
      penalty: recommendedTier.penaltyMultiplier,
      challenge: 1 / recommendedTier.rewardMultiplier // Inverse of reward for challenge level
    };

    const adaptiveSuggestions = this.generateAdaptiveSuggestions(playerPowerLevel, recommendedTier);

    return {
      playerPowerLevel,
      recommendedTier,
      scalingFactors,
      adaptiveSuggestions
    };
  }

  /**
   * Generate adaptive suggestions based on player power
   */
  private generateAdaptiveSuggestions(powerLevel: number, tier: DifficultyTier): string[] {
    const suggestions: string[] = [];

    if (tier.name === 'easy' && powerLevel > tier.powerRange[1]) {
      suggestions.push('Consider increasing difficulty for better rewards');
      suggestions.push('Try harder challenges to maximize gold gains');
    } else if (tier.name === 'legendary' && powerLevel < tier.powerRange[0]) {
      suggestions.push('This content may be too difficult - consider easier alternatives');
      suggestions.push('Build up more resources before attempting legendary challenges');
    }

    if (powerLevel < 25) {
      suggestions.push('Focus on low-risk, high-reward opportunities');
    } else if (powerLevel > 200) {
      suggestions.push('Seek out legendary challenges for maximum rewards');
    }

    return suggestions;
  }

  /**
   * Adjust event weights based on player difficulty
   */
  adjustWeightsForDifficulty(baseWeights: { [key: string]: number }, context: PlayerContext): { [key: string]: number } {
    const powerLevel = context.power_level || this.calculatePowerLevel(context);
    const difficultyTier = this.calculateDifficultyTier(powerLevel);

    const adjustedWeights: { [key: string]: number } = {};

    // Apply difficulty-based weight adjustments
    Object.entries(baseWeights).forEach(([eventType, baseWeight]) => {
      let adjustedWeight = baseWeight;

      // Challenge ratings for different event types (1-10 scale)
      const challengeRatings: { [key: string]: number } = {
        'COURT_SCANDAL': 3,
        'NOBLE_DUEL': 4,
        'THIEVES_GUILD': 2,
        'BLACKMAIL_OPPORTUNITY': 5,
        'ANCIENT_CURSE': 8,
        'GHOSTLY_VISITATION': 6,
        'FORBIDDEN_LOVE': 3,
        'FAMILY_SECRET': 4,
        'LOST_CIVILIZATION': 7,
        'BANDIT_KING': 9,
        'MARKET_CRASH': 6,
        'TRADE_WAR': 7,
        'DESERTION_TEMPTATION': 5,
        'MERCENARY_CONTRACT': 4,
        'BLOOMING_ROMANCE': 1,
        'SPRING_FESTIVAL': 1,
        'SUMMER_TOURNAMENT': 3,
        'HARVEST_FESTIVAL': 2,
        'WINTER_SOLSTICE': 2,
        'BANDIT_AMBUSH': 5,
        'BANDIT_ARMY': 8,
        'ASSASSINATION_PLOT': 9,
        'ROYAL_PURGE': 10,
        'TRADE_OPPORTUNITY': 2,
        'FINAL_RECKONING': 10,
        'RUMORS_OF_DISSENT': 3,
        'MARKET_UNREST': 4
      };

      const challengeRating = challengeRatings[eventType] || 5;

      // Adjust weight based on difficulty preference
      if (difficultyTier.name === 'easy' && challengeRating > 6) {
        adjustedWeight *= 0.3; // Reduce very hard events for easy players
      } else if (difficultyTier.name === 'legendary' && challengeRating < 4) {
        adjustedWeight *= 0.5; // Reduce very easy events for legendary players
      }

      adjustedWeights[eventType] = Math.max(0, adjustedWeight);
    });

    return adjustedWeights;
  }

  /**
   * Get all difficulty tiers
   */
  getDifficultyTiers(): DifficultyTier[] {
    return [...this.difficultyTiers];
  }

  /**
   * Add a custom difficulty tier
   */
  addDifficultyTier(tier: DifficultyTier): void {
    // Validate the tier
    if (!tier.name || !tier.powerRange || tier.powerRange.length !== 2) {
      throw new Error('Invalid difficulty tier configuration');
    }

    // Remove existing tier with same name if it exists
    this.difficultyTiers = this.difficultyTiers.filter(t => t.name !== tier.name);
    this.difficultyTiers.push(tier);

    // Sort by power range
    this.difficultyTiers.sort((a, b) => a.powerRange[0] - b.powerRange[0]);
  }

  /**
   * Remove a difficulty tier
   */
  removeDifficultyTier(tierName: string): boolean {
    const initialLength = this.difficultyTiers.length;
    this.difficultyTiers = this.difficultyTiers.filter(t => t.name !== tierName);
    return this.difficultyTiers.length < initialLength;
  }

  /**
   * Get difficulty statistics
   */
  getStats(): {
    totalTiers: number;
    tierNames: string[];
    powerLevelRanges: { [tier: string]: [number, number] };
  } {
    const tierNames = this.difficultyTiers.map(t => t.name);
    const powerLevelRanges: { [tier: string]: [number, number] } = {};

    this.difficultyTiers.forEach(tier => {
      powerLevelRanges[tier.name] = tier.powerRange;
    });

    return {
      totalTiers: this.difficultyTiers.length,
      tierNames,
      powerLevelRanges
    };
  }
}