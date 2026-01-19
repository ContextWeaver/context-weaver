// RPG Event Generator v3.0.0 - Relationship System
// Manages NPC relationships, social dynamics, and social interactions

import { NPC, Relationship, PlayerContext } from '../types';
import { IRelationshipSystem } from '../interfaces';
import { randomInt } from '../utils';

export interface RelationshipRule {
  id: string;
  change: number;
  reason: string;
  conditions?: {
    npcType?: string;
    relationshipStrength?: { min?: number; max?: number };
    context?: string[];
  };
}

export interface RelationshipNetwork {
  nodes: Map<string, {
    id: string;
    name: string;
    type: string;
    strength: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
    strength: number;
    type: 'ally' | 'enemy' | 'neutral' | 'acquaintance';
  }>;
}

export interface RelationshipSummary {
  totalRelationships: number;
  averageStrength: number;
  allyCount: number;
  enemyCount: number;
  neutralCount: number;
  strongestAlly?: { id: string; name: string; strength: number };
  strongestEnemy?: { id: string; name: string; strength: number };
}

export class RelationshipSystem implements IRelationshipSystem {
  private relationships: Map<string, NPC>;
  private relationshipRules: Map<string, RelationshipRule>;
  private maxRelationshipStrength: number = 100;
  private minRelationshipStrength: number = -100;

  constructor() {
    this.relationships = new Map();
    this.relationshipRules = new Map();
    this.initializeDefaultRules();
  }

  /**
   * Initialize default relationship rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: RelationshipRule[] = [
      {
        id: 'save_life',
        change: 25,
        reason: 'Saved their life in battle',
        conditions: { context: ['combat', 'danger'] }
      },
      {
        id: 'betrayal',
        change: -30,
        reason: 'Betrayed their trust',
        conditions: { context: ['deception', 'backstab'] }
      },
      {
        id: 'gift_valuable',
        change: 15,
        reason: 'Received a valuable gift',
        conditions: { context: ['gift', 'trade'] }
      },
      {
        id: 'insult_public',
        change: -20,
        reason: 'Publicly insulted them',
        conditions: { context: ['social', 'public'] }
      },
      {
        id: 'help_quest',
        change: 20,
        reason: 'Helped complete a quest',
        conditions: { context: ['quest', 'adventure'] }
      },
      {
        id: 'help_combat',
        change: 15,
        reason: 'Helped in combat',
        conditions: { context: ['combat', 'battle'] }
      },
      {
        id: 'fail_promise',
        change: -15,
        reason: 'Failed to keep a promise',
        conditions: { context: ['trust', 'promise'] }
      }
    ];

    defaultRules.forEach(rule => {
      this.relationshipRules.set(rule.id, rule);
    });
  }

  /**
   * Add an NPC to the relationship system
   */
  addNPC(npcConfig: Omit<NPC, 'relationships'>): void {
    const npc: NPC = {
      ...npcConfig,
      relationships: new Map()
    };

    // Initialize relationship with player if not specified
    if (!npc.relationships.has('player')) {
      npc.relationships.set('player', {
        strength: 0,
        type: 'neutral',
        history: []
      });
    }

    this.relationships.set(npcConfig.id, npc);
  }

  /**
   * Update relationship between two NPCs
   */
  updateRelationship(
    npcId: string,
    targetId: string,
    change: number,
    reason: string
  ): void {
    const npc = this.relationships.get(npcId);
    if (!npc) {
      console.warn(`NPC '${npcId}' not found in relationship system`);
      return;
    }

    let relationship = npc.relationships.get(targetId);
    if (!relationship) {
      relationship = {
        strength: 0,
        type: 'neutral',
        history: []
      };
      npc.relationships.set(targetId, relationship);
    }

    // Apply change with bounds checking
    const oldStrength = relationship.strength;
    relationship.strength = Math.max(
      this.minRelationshipStrength,
      Math.min(this.maxRelationshipStrength, relationship.strength + change)
    );

    // Update relationship type based on strength
    relationship.type = this.calculateRelationshipType(relationship.strength);

    // Add history entry
    relationship.history.push({
      change,
      reason,
      timestamp: new Date()
    });

    // Log significant changes
    const strengthDiff = relationship.strength - oldStrength;
    if (Math.abs(strengthDiff) >= 10) {
      console.log(`Relationship ${npcId} -> ${targetId}: ${oldStrength} -> ${relationship.strength} (${strengthDiff > 0 ? '+' : ''}${strengthDiff}) - ${reason}`);
    }
  }

  /**
   * Apply a relationship rule
   */
  applyRelationshipRule(npcId: string, targetId: string, ruleId: string): void {
    const rule = this.relationshipRules.get(ruleId);
    if (!rule) {
      console.warn(`Relationship rule '${ruleId}' not found`);
      return;
    }

    // Check if rule conditions are met (simplified for now)
    this.updateRelationship(npcId, targetId, rule.change, rule.reason);
  }

  /**
   * Get relationship between two NPCs
   */
  getRelationship(npcId: string, targetId: string): Relationship | null {
    const npc = this.relationships.get(npcId);
    if (!npc) return null;

    return npc.relationships.get(targetId) || null;
  }

  /**
   * Get relationship summary for an NPC
   */
  getRelationshipSummary(npcId: string): RelationshipSummary {
    const npc = this.relationships.get(npcId);
    if (!npc) {
      return {
        totalRelationships: 0,
        averageStrength: 0,
        allyCount: 0,
        enemyCount: 0,
        neutralCount: 0
      };
    }

    const relationships = Array.from(npc.relationships.values());
    const totalRelationships = relationships.length;

    if (totalRelationships === 0) {
      return {
        totalRelationships: 0,
        averageStrength: 0,
        allyCount: 0,
        enemyCount: 0,
        neutralCount: 0
      };
    }

    const totalStrength = relationships.reduce((sum, rel) => sum + rel.strength, 0);
    const averageStrength = totalStrength / totalRelationships;

    let allyCount = 0;
    let enemyCount = 0;
    let neutralCount = 0;
    let strongestAlly: { id: string; name: string; strength: number } | undefined;
    let strongestEnemy: { id: string; name: string; strength: number } | undefined;

    // Find the target NPC for relationship analysis
    for (const [targetId, relationship] of npc.relationships) {
      const targetNpc = this.relationships.get(targetId);
      const targetName = targetNpc?.name || targetId;

      switch (relationship.type) {
        case 'ally':
        case 'friend':
          allyCount++;
          if (!strongestAlly || relationship.strength > strongestAlly.strength) {
            strongestAlly = { id: targetId, name: targetName, strength: relationship.strength };
          }
          break;
        case 'enemy':
        case 'rival':
          enemyCount++;
          if (!strongestEnemy || relationship.strength < strongestEnemy.strength) {
            strongestEnemy = { id: targetId, name: targetName, strength: relationship.strength };
          }
          break;
        default:
          neutralCount++;
          break;
      }
    }

    return {
      totalRelationships,
      averageStrength: Math.round(averageStrength * 100) / 100,
      allyCount,
      enemyCount,
      neutralCount,
      strongestAlly,
      strongestEnemy
    };
  }

  /**
   * Get relationship network for an NPC
   */
  getRelationshipNetwork(npcId: string, depth: number = 1): RelationshipNetwork {
    const network: RelationshipNetwork = {
      nodes: new Map(),
      edges: []
    };

    const npc = this.relationships.get(npcId);
    if (!npc) return network;

    const visited = new Set<string>();
    const queue = [{ id: npcId, currentDepth: 0 }];

    while (queue.length > 0) {
      const { id, currentDepth } = queue.shift()!;
      if (visited.has(id) || currentDepth > depth) continue;

      visited.add(id);
      const currentNpc = this.relationships.get(id);
      if (!currentNpc) continue;

      // Add node
      network.nodes.set(id, {
        id,
        name: currentNpc.name,
        type: currentNpc.type,
        strength: currentNpc.relationships.get('player')?.strength || 0
      });

      // Add edges and queue next level
      if (currentDepth < depth) {
        for (const [targetId, relationship] of currentNpc.relationships) {
          if (!visited.has(targetId)) {
            network.edges.push({
              from: id,
              to: targetId,
              strength: relationship.strength,
              type: relationship.type as any
            });

            queue.push({ id: targetId, currentDepth: currentDepth + 1 });
          }
        }
      }
    }

    return network;
  }

  /**
   * Calculate relationship type based on strength
   */
  private calculateRelationshipType(strength: number): string {
    if (strength >= 50) return 'ally';
    if (strength >= 20) return 'friend';
    if (strength <= -50) return 'enemy';
    if (strength <= -20) return 'rival';
    if (strength >= 10) return 'acquaintance';
    if (strength <= -10) return 'unfriendly';
    return 'neutral';
  }

  /**
   * Add a custom relationship rule
   */
  addRelationshipRule(rule: RelationshipRule): void {
    this.relationshipRules.set(rule.id, rule);
  }

  /**
   * Remove a relationship rule
   */
  removeRelationshipRule(ruleId: string): boolean {
    return this.relationshipRules.delete(ruleId);
  }

  /**
   * Get all NPCs
   */
  getAllNPCs(): NPC[] {
    return Array.from(this.relationships.values());
  }

  /**
   * Remove an NPC from the relationship system
   */
  removeNPC(npcId: string): boolean {
    // Clean up relationships from other NPCs
    for (const npc of this.relationships.values()) {
      npc.relationships.delete(npcId);
    }

    return this.relationships.delete(npcId);
  }

  /**
   * Generate contextual relationship effects for events
   */
  generateRelationshipEffects(context: PlayerContext): {
    availableNPCs: string[];
    relationshipModifiers: { [npcId: string]: number };
    socialContext: string[];
  } {
    const availableNPCs: string[] = [];
    const relationshipModifiers: { [npcId: string]: number } = {};
    const socialContext: string[] = [];

    for (const [npcId, npc] of this.relationships) {
      const playerRel = npc.relationships.get('player');
      if (playerRel) {
        availableNPCs.push(npcId);
        relationshipModifiers[npcId] = playerRel.strength;

        // Add social context based on relationship strength
        if (playerRel.strength >= 30) {
          socialContext.push('trusted_ally');
        } else if (playerRel.strength <= -30) {
          socialContext.push('bitter_enemy');
        } else if (playerRel.strength >= 10) {
          socialContext.push('friendly_acquaintance');
        }
      }
    }

    return {
      availableNPCs,
      relationshipModifiers,
      socialContext
    };
  }

  /**
   * Get relationship system statistics
   */
  getStats(): {
    totalNPCs: number;
    totalRelationships: number;
    averageRelationshipsPerNPC: number;
    relationshipTypes: { [type: string]: number };
  } {
    const totalNPCs = this.relationships.size;
    let totalRelationships = 0;
    const relationshipTypes: { [type: string]: number } = {};

    for (const npc of this.relationships.values()) {
      totalRelationships += npc.relationships.size;

      for (const relationship of npc.relationships.values()) {
        relationshipTypes[relationship.type] = (relationshipTypes[relationship.type] || 0) + 1;
      }
    }

    return {
      totalNPCs,
      totalRelationships,
      averageRelationshipsPerNPC: totalNPCs > 0 ? totalRelationships / totalNPCs : 0,
      relationshipTypes
    };
  }
}