// RPG Event Generator v2.0.0 - Event Chain System
// Manages event chains, progression, and state

import { Chance } from 'chance';
import { ChainDefinition, Event, PlayerContext } from '../types';
import { IChainSystem } from '../interfaces';

export interface ActiveChain {
  id: string;
  definition: string;
  stage: number;
  playerContext: PlayerContext;
  completedStages: Set<number>;
  startedAt: number;
  nextEventTime?: number;
  nextEventTemplate?: string;
}

export interface ChainProgression {
  event: Event;
  chainId: string;
  stage: number;
  isComplete: boolean;
  nextStage?: number;
}

export class ChainSystem implements IChainSystem {
  private activeChains: Map<string, ActiveChain>;
  private chainDefinitions: Map<string, ChainDefinition>;
  private chance: Chance.Chance;

  constructor(chance: Chance.Chance = new Chance()) {
    this.activeChains = new Map();
    this.chainDefinitions = new Map();
    this.chance = chance;
    this.initializeChainDefinitions();
  }

  /**
   * Initialize built-in chain definitions
   */
  private initializeChainDefinitions(): void {
    const chains: Record<string, ChainDefinition> = {
      BANDIT_RISING: {
        name: 'Bandit Rising',
        description: 'A bandit gang grows from small raids to major threats',
        stages: [
          { day: 1, template: 'BANDIT_AMBUSH' },
          { day: 5, template: 'BANDIT_ARMY' },
          { day: 10, template: 'BANDIT_KING' }
        ]
      },

      COURT_SCANDAL_CHAIN: {
        name: 'Court Scandal',
        description: 'Political intrigue and scandal in the royal court',
        stages: [
          { day: 1, template: 'COURT_SCANDAL' },
          { day: 3, template: 'ROYAL_PURGE' },
          { day: 7, template: 'FINAL_RECKONING' }
        ]
      },

      CURSE_OF_THE_ARTIFACT: {
        name: 'Cursed Artifact',
        description: 'An ancient artifact brings doom to its possessor',
        stages: [
          { day: 1, template: 'ANCIENT_CURSE' },
          { day: 4, template: 'GHOSTLY_VISITATION' },
          { day: 8, template: 'FINAL_RECKONING' }
        ]
      },

      MERCHANT_EMPIRE: {
        name: 'Merchant Empire',
        description: 'Build a trading empire through shrewd deals',
        stages: [
          { day: 1, template: 'TRADE_OPPORTUNITY' },
          { day: 3, template: 'TRADE_WAR' },
          { day: 6, template: 'MARKET_CRASH' }
        ]
      }
    };

    // Convert to Map
    Object.entries(chains).forEach(([id, definition]) => {
      this.chainDefinitions.set(id, definition);
    });
  }

  /**
   * Start a new event chain
   */
  startChain(chainId: string, playerContext: PlayerContext = {}): Event | null {
    const chainDef = this.chainDefinitions.get(chainId);
    if (!chainDef) {
      console.warn(`Chain definition '${chainId}' not found`);
      return null;
    }

    const chain: ActiveChain = {
      id: `chain_${Date.now()}_${this.chance.guid().substring(0, 8)}`,
      definition: chainId,
      stage: 0,
      playerContext,
      completedStages: new Set(),
      startedAt: Date.now()
    };

    this.activeChains.set(chain.id, chain);

    return this.generateChainEvent(chain);
  }

  /**
   * Advance an existing chain based on player choice
   */
  advanceChain(chainId: string, choice: string): Event | null {
    const chain = this.activeChains.get(chainId);
    if (!chain) {
      console.warn(`Active chain '${chainId}' not found`);
      return null;
    }

    const chainDef = this.chainDefinitions.get(chain.definition);
    if (!chainDef) {
      console.warn(`Chain definition '${chain.definition}' not found`);
      return null;
    }

    // Mark current stage as completed
    chain.completedStages.add(chain.stage);

    // Determine next stage based on choice or progression
    const nextStage = this.determineNextStage(chain, choice, chainDef);
    if (nextStage === null) {
      // Chain is complete
      this.endChain(chainId);
      return null;
    }

    chain.stage = nextStage;

    // Check if chain should continue
    if (chain.stage >= chainDef.stages.length) {
      this.endChain(chainId);
      return null;
    }

    return this.generateChainEvent(chain);
  }

  /**
   * Determine the next stage in a chain
   */
  private determineNextStage(
    chain: ActiveChain,
    choice: string,
    chainDef: ChainDefinition
  ): number | null {
    const currentStage = chainDef.stages[chain.stage];

    // Check for conditional progression
    if (currentStage.triggerNext) {
      if (currentStage.triggerNext.choice === choice ||
          currentStage.triggerNext.automatic) {
        // Calculate next stage based on delay
        const daysSinceStart = Math.floor((Date.now() - chain.startedAt) / (24 * 60 * 60 * 1000));
        const targetDay = daysSinceStart + currentStage.triggerNext.delay;

        // Find the stage that matches this target day
        for (let i = chain.stage + 1; i < chainDef.stages.length; i++) {
          if (chainDef.stages[i].day && chainDef.stages[i].day! >= targetDay) {
            return i;
          }
        }
      }
    }

    // Default: advance to next stage
    return chain.stage + 1;
  }

  /**
   * Generate an event for the current stage of a chain
   */
  private generateChainEvent(chain: ActiveChain): Event | null {
    const chainDef = this.chainDefinitions.get(chain.definition);
    if (!chainDef || chain.stage >= chainDef.stages.length) {
      return null;
    }

    const currentStage = chainDef.stages[chain.stage];
    const template = currentStage.template;

    // Create event with chain metadata
    return {
      id: `event_${chain.id}_${chain.stage}`,
      title: `${chainDef.name} - Stage ${chain.stage + 1}`,
      description: `Part of the ${chainDef.name} storyline. ${chainDef.description}`,
      choices: [], // This would be filled by the template system
      type: template,
      context: chain.playerContext,
      chainId: chain.id,
      tags: ['chain_event', chain.definition.toLowerCase()]
    };
  }

  /**
   * End a chain and clean up
   */
  endChain(chainId: string): void {
    this.activeChains.delete(chainId);
  }

  /**
   * Get all currently active chains
   */
  getActiveChains(): ActiveChain[] {
    return Array.from(this.activeChains.values());
  }

  /**
   * Get detailed information about a specific chain
   */
  getChainInfo(chainId: string): ActiveChain | null {
    return this.activeChains.get(chainId) || null;
  }

  /**
   * Register a custom chain definition
   */
  registerChain(chainId: string, definition: ChainDefinition): boolean {
    if (this.chainDefinitions.has(chainId)) {
      console.warn(`Chain definition '${chainId}' already exists`);
      return false;
    }

    this.chainDefinitions.set(chainId, definition);
    return true;
  }

  /**
   * Unregister a custom chain definition
   */
  unregisterChain(chainId: string): boolean {
    if (!this.chainDefinitions.has(chainId)) {
      console.warn(`Chain definition '${chainId}' not found`);
      return false;
    }

    // Check if any active chains use this definition
    const activeChainsUsing = Array.from(this.activeChains.values())
      .filter(chain => chain.definition === chainId);

    if (activeChainsUsing.length > 0) {
      console.warn(`Cannot unregister chain '${chainId}' - ${activeChainsUsing.length} active chains using it`);
      return false;
    }

    this.chainDefinitions.delete(chainId);
    return true;
  }

  /**
   * Get all available chain definitions
   */
  getAvailableChains(): { [id: string]: ChainDefinition } {
    const result: { [id: string]: ChainDefinition } = {};
    this.chainDefinitions.forEach((definition, id) => {
      result[id] = definition;
    });
    return result;
  }

  /**
   * Force advance a chain to a specific stage (for testing/debugging)
   */
  forceAdvanceChain(chainId: string, targetStage: number): boolean {
    const chain = this.activeChains.get(chainId);
    if (!chain) {
      console.warn(`Active chain '${chainId}' not found`);
      return false;
    }

    const chainDef = this.chainDefinitions.get(chain.definition);
    if (!chainDef) {
      console.warn(`Chain definition '${chain.definition}' not found`);
      return false;
    }

    if (targetStage < 0 || targetStage >= chainDef.stages.length) {
      console.warn(`Invalid target stage ${targetStage} for chain with ${chainDef.stages.length} stages`);
      return false;
    }

    chain.stage = targetStage;
    return true;
  }

  /**
   * Get chain system statistics
   */
  getStats(): {
    activeChains: number;
    totalDefinitions: number;
    customDefinitions: number;
  } {
    const builtinChains = ['BANDIT_RISING', 'COURT_SCANDAL_CHAIN', 'CURSE_OF_THE_ARTIFACT', 'MERCHANT_EMPIRE'];
    const customDefinitions = Array.from(this.chainDefinitions.keys())
      .filter(id => !builtinChains.includes(id)).length;

    return {
      activeChains: this.activeChains.size,
      totalDefinitions: this.chainDefinitions.size,
      customDefinitions
    };
  }
}