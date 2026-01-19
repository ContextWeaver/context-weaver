// RPG Event Generator v3.0.0 - Rule Engine
// Advanced conditional logic system for dynamic event modification

import { PlayerContext, Event, Effect } from '../types';
import { IRuleEngine } from '../interfaces';

export interface RuleCondition {
  type: string;
  params: { [key: string]: any };
}

export interface RuleEffects {
  addTags?: string[];
  modifyTitle?: {
    append?: string;
    prepend?: string;
    replace?: string;
  };
  modifyDescription?: {
    append?: string;
    prepend?: string;
    replace?: string;
  };
  adjustEffects?: { [key: string]: number };
  modifyDifficulty?: string;
  setUrgency?: number;
  addContext?: { [key: string]: any };
}

export interface RuleDefinition {
  id?: string;
  conditions: RuleCondition[];
  effects: RuleEffects;
  priority?: number;
  enabled?: boolean;
  name?: string;
  description?: string;
}

export interface RuleValidationResult {
  valid: boolean;
  errors: string[];
}

export class RuleEngine implements IRuleEngine {
  private rules: Map<string, RuleDefinition>;
  private conditionEvaluators: Map<string, Function>;
  private effectApplicators: Map<string, Function>;
  private ruleDefinitions: Map<string, RuleDefinition> = new Map();

  constructor() {
    this.rules = new Map();
    this.conditionEvaluators = new Map();
    this.effectApplicators = new Map();
    this.initializeConditionEvaluators();
    this.initializeEffectApplicators();
  }

  /**
   * Initialize built-in condition evaluators
   */
  private initializeConditionEvaluators(): void {
    this.conditionEvaluators.set('stat_greater_than', (context: PlayerContext, params: any) => {
      const statValue = this.getNestedValue(context, params.stat);
      return typeof statValue === 'number' && statValue > params.value;
    });

    this.conditionEvaluators.set('stat_less_than', (context: PlayerContext, params: any) => {
      const statValue = this.getNestedValue(context, params.stat);
      return typeof statValue === 'number' && statValue < params.value;
    });

    this.conditionEvaluators.set('stat_equals', (context: PlayerContext, params: any) => {
      const statValue = this.getNestedValue(context, params.stat);
      return statValue === params.value;
    });

    this.conditionEvaluators.set('has_tag', (context: PlayerContext, params: any) => {
      const tags = context.tags || [];
      return tags.includes(params.tag);
    });

    this.conditionEvaluators.set('career_is', (context: PlayerContext, params: any) => {
      return context.career === params.career;
    });

    this.conditionEvaluators.set('season_is', (context: PlayerContext, params: any) => {
      const season = this.getNestedValue(context, 'environment.season') ||
                    this.getNestedValue(context, 'season');
      return season === params.season;
    });

    this.conditionEvaluators.set('weather_is', (context: PlayerContext, params: any) => {
      const weather = this.getNestedValue(context, 'environment.weather') ||
                     this.getNestedValue(context, 'weather');
      return weather === params.weather;
    });

    this.conditionEvaluators.set('random_chance', (context: PlayerContext, params: any) => {
      return Math.random() < params.probability;
    });

    this.conditionEvaluators.set('and', (context: PlayerContext, params: any) => {
      return params.conditions.every((condition: RuleCondition) =>
        this.evaluateCondition(context, condition)
      );
    });

    this.conditionEvaluators.set('or', (context: PlayerContext, params: any) => {
      return params.conditions.some((condition: RuleCondition) =>
        this.evaluateCondition(context, condition)
      );
    });

    // Additional condition evaluators for demo compatibility
    this.conditionEvaluators.set('event_completed', (context: PlayerContext, params: any) => {
      // For demo purposes, assume events are completed
      // In a full implementation, this would check game state
      return true;
    });

    this.conditionEvaluators.set('stat_requirement', (context: PlayerContext, condition: any) => {
      const field = condition.field || condition.stat;
      const statValue = context[field] || 0;
      const operator = condition.operator || 'gte';
      const value = condition.value || condition.min || 0;

      switch (operator) {
        case 'gte': return statValue >= value;
        case 'gt': return statValue > value;
        case 'lte': return statValue <= value;
        case 'lt': return statValue < value;
        case 'eq': return statValue === value;
        case 'ne': return statValue !== value;
        default: return false;
      }
    });

    this.conditionEvaluators.set('relationship_requirement', (context: PlayerContext, condition: any) => {
      // For demo purposes, check relationships in context
      const relationships = context.relationships || {};
      const npcRelation = relationships[condition.npc] || 0;
      return typeof npcRelation === 'object' ? npcRelation.strength >= (condition.min || 0) : npcRelation >= (condition.min || 0);
    });

    this.conditionEvaluators.set('undefined', (context: PlayerContext, params: any) => {
      // Placeholder for undefined conditions
      return false;
    });

    this.conditionEvaluators.set('not', (context: PlayerContext, params: any) => {
      return !this.evaluateCondition(context, params.condition);
    });
  }

  /**
   * Initialize built-in effect applicators
   */
  private initializeEffectApplicators(): void {
    this.effectApplicators.set('addTags', (event: Event, params: string[]) => {
      if (!event.tags) event.tags = [];
      event.tags.push(...params);
    });

    this.effectApplicators.set('modifyTitle', (event: Event, params: any) => {
      if (params.append) event.title += params.append;
      if (params.prepend) event.title = params.prepend + event.title;
      if (params.replace) event.title = params.replace;
    });

    this.effectApplicators.set('modifyDescription', (event: Event, params: any) => {
      if (params.append) event.description += params.append;
      if (params.prepend) event.description = params.prepend + event.description;
      if (params.replace) event.description = params.replace;
    });

    this.effectApplicators.set('adjustEffects', (event: Event, params: { [key: string]: number }) => {
      event.choices.forEach(choice => {
        if (choice.effect) {
          Object.keys(params).forEach(effectKey => {
            if (choice.effect[effectKey] !== undefined && typeof choice.effect[effectKey] === 'number') {
              (choice.effect[effectKey] as number) += params[effectKey];
            }
          });
        }
      });
    });

    this.effectApplicators.set('modifyDifficulty', (event: Event, params: string) => {
      event.difficulty = params;
    });

    this.effectApplicators.set('setUrgency', (event: Event, params: number) => {
      // Add urgency to event metadata
      (event as any).urgency = params;
    });

    this.effectApplicators.set('addContext', (event: Event, params: { [key: string]: any }) => {
      Object.assign(event.context, params);
    });

    // Additional effect applicators for demo compatibility
    this.effectApplicators.set('modifyChoices', (event: Event, params: any) => {
      // Modify choice effects as expected by demo
      event.choices.forEach((choice: any) => {
        if (params.multiply) {
          Object.entries(params.multiply).forEach(([key, multiplier]: [string, any]) => {
            if (choice.effect[key]) {
              choice.effect[key] = Math.round(choice.effect[key] * multiplier);
            }
          });
        }
        if (params.add) {
          Object.entries(params.add).forEach(([key, value]: [string, any]) => {
            choice.effect[key] = (choice.effect[key] || 0) + value;
          });
        }
      });
    });
  }

  // ===== RULE MANAGEMENT METHODS =====

  registerRule(ruleOrId: string | RuleDefinition, rule?: RuleDefinition): boolean {
    let ruleId: string;
    let ruleData: RuleDefinition;

    if (typeof ruleOrId === 'string') {
      // registerRule(id, rule)
      ruleId = ruleOrId;
      ruleData = rule!;
    } else {
      // registerRule(rule) - extract id from rule
      ruleData = ruleOrId;
      ruleId = ruleData.id || 'unnamed_rule_' + Date.now();
    }

    if (this.ruleDefinitions.has(ruleId)) {
      return false; // Rule already exists
    }

    // Validate the rule
    const validation = this.validateRule(ruleData);
    if (!validation.valid) {
      return false;
    }

    this.ruleDefinitions.set(ruleId, { ...ruleData, id: ruleId });
    return true;
  }

  getRule(id: string): RuleDefinition | null {
    return this.ruleDefinitions.get(id) || null;
  }

  getAllRules(): RuleDefinition[] {
    return Array.from(this.ruleDefinitions.values());
  }

  unregisterRule(id: string): boolean {
    return this.ruleDefinitions.delete(id);
  }

  getRuleCount(): number {
    return this.ruleDefinitions.size;
  }

  clearAllRules(): void {
    this.ruleDefinitions.clear();
  }

  // ===== CONDITION EVALUATION METHODS =====

  /**
   * Evaluate a single condition (overloaded for test compatibility)
   */
  evaluateCondition(conditionOrContext: any, contextOrCondition?: any): boolean {
    // Handle overloaded signature: evaluateCondition(condition, context) or evaluateCondition(context, condition)
    let condition: RuleCondition;
    let context: PlayerContext;

    if (conditionOrContext && typeof conditionOrContext === 'object' && conditionOrContext.type) {
      // First parameter is condition, second is context
      condition = conditionOrContext;
      context = contextOrCondition;
    } else {
      // First parameter is context, second is condition (original API)
      context = conditionOrContext;
      condition = contextOrCondition;
    }

    const evaluator = this.conditionEvaluators.get(condition.type);
    if (!evaluator) {
      console.warn(`Unknown condition type: ${condition.type}`);
      return false;
    }

    try {
      return evaluator(context, condition.params || {});
    } catch (error) {
      console.warn(`Error evaluating condition ${condition.type}:`, error);
      return false;
    }
  }

  /**
   * Evaluate multiple conditions with AND/OR logic
   */
  evaluateConditions(conditions: RuleCondition[], logic: 'AND' | 'OR', context: PlayerContext): boolean {
    if (conditions.length === 0) return true;

    for (const condition of conditions) {
      const result = this.evaluateCondition(condition, context);
      if (logic === 'AND' && !result) return false;
      if (logic === 'OR' && result) return true;
    }

    return logic === 'AND'; // All AND conditions passed, or no OR conditions passed
  }

  // ===== RULE EVALUATION METHODS =====

  /**
   * Evaluate rules and apply effects to event
   */
  evaluateRules(event: Event, context: PlayerContext): boolean {
    let rulesApplied = false;

    for (const [ruleId, rule] of this.ruleDefinitions) {
      if (this.evaluateRule(context, rule)) {
        this.applyRuleEffects(event, rule, context);
        rulesApplied = true;
      }
    }

    return rulesApplied;
  }

  // ===== EFFECT APPLICATION METHODS =====

  /**
   * Apply a single effect to an event
   */
  applyEffect(effect: any, event: Event): void {
    if (effect.type === 'modify_choices' && effect.add_choice) {
      if (!event.choices) event.choices = [];
      event.choices.push(effect.add_choice);
    }
    // Add other effect types as needed
  }

  /**
   * Evaluate a single condition (original method signature)
   */

  /**
   * Evaluate all conditions in a rule
   */
  evaluateRule(context: PlayerContext, rule: RuleDefinition): boolean {
    if (!rule.enabled && rule.enabled !== undefined) {
      return false;
    }

    // All conditions must be true (AND logic)
    return rule.conditions.every(condition => this.evaluateCondition(context, condition));
  }

  /**
   * Apply rule effects to an event
   */
  applyRuleEffects(event: Event, rule: RuleDefinition, context: PlayerContext): Event {
    const modifiedEvent = { ...event };

    Object.entries(rule.effects).forEach(([effectType, effectParams]) => {
      const applicator = this.effectApplicators.get(effectType);
      if (applicator) {
        try {
          applicator(modifiedEvent, effectParams);
        } catch (error) {
          console.warn(`Error applying effect ${effectType}:`, (error as Error).message);
        }
      } else {
        console.warn(`Unknown effect type: ${effectType}`);
      }
    });

    return modifiedEvent;
  }

  /**
   * Add a custom rule
   */
  addRule(name: string, rule: RuleDefinition): void {
    this.rules.set(name, rule);
  }

  /**
   * Remove a custom rule
   */
  removeRule(name: string): boolean {
    return this.rules.delete(name);
  }

  /**
   * Get all custom rules
   */
  getRules(): { [name: string]: RuleDefinition } {
    const result: { [name: string]: RuleDefinition } = {};
    this.rules.forEach((rule, name) => {
      result[name] = rule;
    });
    return result;
  }

  /**
   * Clear all custom rules
   */
  clearRules(): void {
    this.rules.clear();
  }

  /**
   * Validate a rule definition
   */
  validateRule(rule: RuleDefinition): RuleValidationResult {
    const errors: string[] = [];

    if (!rule || typeof rule !== 'object') {
      errors.push('Rule must be an object');
      return { valid: false, errors };
    }

    if (!rule.conditions || !Array.isArray(rule.conditions)) {
      errors.push('Rule must have conditions array');
    } else {
      rule.conditions.forEach((condition, index) => {
        if (!condition.type) {
          errors.push(`Condition ${index} missing type`);
        }
        if (!this.conditionEvaluators.has(condition.type)) {
          errors.push(`Condition ${index} has unknown type: ${condition.type}`);
        }
      });
    }

    if (!rule.effects || typeof rule.effects !== 'object') {
      errors.push('Rule must have effects object');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Add a custom condition evaluator
   */
  addConditionEvaluator(type: string, evaluator: Function): void {
    this.conditionEvaluators.set(type, evaluator);
  }

  /**
   * Add a custom effect applicator
   */
  addEffectApplicator(type: string, applicator: Function): void {
    this.effectApplicators.set(type, applicator);
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Process an event through all applicable rules
   */
  processEvent(event: Event, context: PlayerContext): Event {
    let processedEvent = event;

    // Sort rules by priority (higher priority first)
    const sortedRules = Array.from(this.rules.entries())
      .sort(([, a], [, b]) => (b.priority || 0) - (a.priority || 0));

    for (const [ruleName, rule] of sortedRules) {
      if (this.evaluateRule(context, rule)) {
        processedEvent = this.applyRuleEffects(processedEvent, rule, context);
      }
    }

    return processedEvent;
  }

  /**
   * Get rule engine statistics
   */
  getStats(): {
    totalRules: number;
    conditionTypes: number;
    effectTypes: number;
  } {
    return {
      totalRules: this.rules.size,
      conditionTypes: this.conditionEvaluators.size,
      effectTypes: this.effectApplicators.size
    };
  }
}