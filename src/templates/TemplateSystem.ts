// RPG Event Generator v2.0.0 - Template System
// Manages template loading, registration, and generation

import * as fs from 'fs';
import * as path from 'path';
import { Template, PlayerContext, Event, TemplateCondition, ConditionalChoice, DynamicField, Choice, TemplateComposition } from '../types';
import { ITemplateSystem, ITemplateDatabase } from '../interfaces';
import { validateTemplate } from '../utils';

export interface TemplateGenerationContext extends PlayerContext {
  environment?: {
    weather?: string;
    season?: string;
    location?: string;
  };
  gameState?: {
    difficulty?: string;
    timePressure?: boolean;
  };
  inventory?: string[];
  quests?: string[];
  relationships?: { [key: string]: number };
  customConditions?: { [key: string]: (value: any, context: TemplateGenerationContext) => boolean };
  // Additional context properties for template processing
  perception?: number;
  charisma?: number;
}

export interface TemplateMetadata {
  title: string;
  type?: string;
  difficulty?: string;
  tags?: string[];
}

export interface TemplateLibrary {
  [genre: string]: { [id: string]: TemplateMetadata };
}

export class TemplateSystem implements ITemplateSystem {
  private customTemplates: Set<string>;
  private loadedTemplates: Map<string, Template>;
  private templateLibrary: string | null;
  private processedTemplateCache: Map<string, Template>;
  private generationCache: Map<string, Event>;
  private database: ITemplateDatabase | null = null;

  constructor(templateLibrary: string | null = null) {
    this.customTemplates = new Set();
    this.loadedTemplates = new Map();
    this.templateLibrary = templateLibrary;
    this.processedTemplateCache = new Map();
    this.generationCache = new Map();
  }

  setDatabase(database: ITemplateDatabase): void {
    this.database = database;
  }

  async loadTemplatesFromDatabase(): Promise<void> {
    if (!this.database) return;

    try {
      const templates = await this.database.getAllTemplates();
      templates.forEach(template => {
        if (template.id) {
          this.loadedTemplates.set(`custom:${template.id}`, template);
          this.customTemplates.add(template.id);
        }
      });
    } catch (error) {
      console.warn('Failed to load templates from database:', error);
    }
  }

  async saveTemplateToDatabase(templateId: string): Promise<void> {
    if (!this.database) return;

    const template = this.loadedTemplates.get(`custom:${templateId}`);
    if (template) {
      try {
        await this.database.storeTemplate(template);
      } catch (error) {
        console.warn(`Failed to save template ${templateId} to database:`, error);
      }
    }
  }

  async searchDatabase(criteria: any): Promise<Template[]> {
    if (!this.database) return [];

    try {
      return await this.database.searchTemplates(criteria);
    } catch (error) {
      console.warn('Database search failed:', error);
      return [];
    }
  }

  /**
   * Load templates from a specific genre directory
   */
  loadTemplateLibrary(genre: string): void {
    try {
      // Handle both development (src/) and compiled (dist/) environments
      const isCompiled = __dirname.includes('dist');
      const templatesDir = isCompiled
        ? path.join(__dirname, '..', '..', '..', 'templates')
        : path.join(__dirname, '..', '..', 'templates');
      const genreDir = path.join(templatesDir, genre);

      if (!fs.existsSync(genreDir)) {
        console.warn(`Template genre '${genre}' not found`);
        return;
      }

      const files = fs.readdirSync(genreDir);
      let loadedCount = 0;

      files.forEach(file => {
        if (path.extname(file) === '.json') {
          try {
            const filePath = path.join(genreDir, file);
            const templateData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            const templateId = path.basename(file, '.json');
            this.loadedTemplates.set(`${genre}:${templateId}`, templateData);
            loadedCount++;
          } catch (error) {
            console.warn(`Failed to load template ${file}:`, (error as Error).message);
          }
        }
      });

      console.log(`Loaded ${loadedCount} templates from genre '${genre}'`);
    } catch (error) {
      console.warn(`Failed to load template library '${genre}':`, (error as Error).message);
    }
  }

  /**
   * Generate an event from a specific template
   */
  generateFromTemplate(templateId: string, context: TemplateGenerationContext = {}): Event | null {
    // Try different template ID formats
    let template: Template | undefined;

    // First try as a custom template
    if (this.customTemplates.has(templateId)) {
      template = this.loadedTemplates.get(`custom:${templateId}`);
    }

    // If not found and we have a template library, try library format
    if (!template && this.templateLibrary) {
      const libraryTemplateId = `${this.templateLibrary}:${templateId}`;
      template = this.loadedTemplates.get(libraryTemplateId);
    }

    // If still not found, try direct lookup (for backward compatibility)
    if (!template) {
      template = this.loadedTemplates.get(templateId);
    }

    if (!template) {
      console.warn(`Template '${templateId}' not found`);
      return null;
    }

    // Set template ID for caching
    const templateWithId = { ...template, id: templateId };
    return this.processTemplate(templateWithId, context);
  }

  /**
   * Generate a random event from a specific genre
   */
  generateFromGenre(genre: string, context: TemplateGenerationContext = {}): Event | null {
    if (!this.loadedTemplates.size) {
      console.warn('No templates loaded');
      return null;
    }

    const genreTemplates = Array.from(this.loadedTemplates.entries())
      .filter(([key]) => key.startsWith(`${genre}:`));

    if (genreTemplates.length === 0) {
      console.warn(`No templates found for genre '${genre}'`);
      return null;
    }

    const [templateId, template] = genreTemplates[Math.floor(Math.random() * genreTemplates.length)];
    return this.processTemplate(template, context);
  }

  /**
   * Evaluate a template condition against player context
   */
  private evaluateCondition(condition: TemplateCondition, context: TemplateGenerationContext): boolean {
    const { type, operator, field, value, negate = false } = condition;
    let result = false;

    switch (type) {
      case 'stat_requirement':
        const statValue = context[field] || 0;
        switch (operator) {
          case 'gte': result = statValue >= value; break;
          case 'lte': result = statValue <= value; break;
          case 'gt': result = statValue > value; break;
          case 'lt': result = statValue < value; break;
          case 'eq': result = statValue === value; break;
          case 'neq': result = statValue !== value; break;
        }
        break;

      case 'item_requirement':
        const inventory = context.inventory || [];
        switch (operator) {
          case 'has': result = inventory.includes(value); break;
          case 'not_has': result = !inventory.includes(value); break;
        }
        break;

      case 'relationship_requirement':
        const relationships = context.relationships || {};
        const relValue = relationships[field] || 0;
        switch (operator) {
          case 'gte': result = relValue >= value; break;
          case 'lte': result = relValue <= value; break;
          case 'gt': result = relValue > value; break;
          case 'lt': result = relValue < value; break;
          case 'eq': result = relValue === value; break;
          case 'neq': result = relValue !== value; break;
        }
        break;

      case 'quest_requirement':
        const quests = context.quests || [];
        switch (operator) {
          case 'has': result = quests.includes(value); break;
          case 'not_has': result = !quests.includes(value); break;
        }
        break;

      case 'custom':
        // Allow custom condition evaluation via context
        if (context.customConditions && typeof context.customConditions[field] === 'function') {
          result = context.customConditions[field](value, context);
        }
        break;
    }

    return negate ? !result : result;
  }

  /**
   * Evaluate complex conditions with AND/OR logic
   */
  private evaluateConditions(conditions: TemplateCondition[], context: TemplateGenerationContext): boolean {
    if (!conditions || conditions.length === 0) return true;

    // Check if this is a compound condition (AND/OR)
    const compoundCondition = conditions.find(c => c.operator === 'and' || c.operator === 'or');
    if (compoundCondition) {
      if (compoundCondition.operator === 'and') {
        return conditions.every(c => c.operator === 'and' || this.evaluateCondition(c, context));
      } else if (compoundCondition.operator === 'or') {
        return conditions.some(c => c.operator === 'or' || this.evaluateCondition(c, context));
      }
    }

    // Simple condition evaluation
    return conditions.every(condition => this.evaluateCondition(condition, context));
  }

  /**
   * Apply conditional logic to template choices
   */
  private applyConditionalChoices(template: Template, context: TemplateGenerationContext): Choice[] {
    if (!template.conditional_choices) return template.choices;

    const filteredChoices = template.choices.map((choice, index) => {
      const conditionalChoice = template.conditional_choices?.find(cc => cc.choice_index === index);

      if (!conditionalChoice) return choice;

      const conditionsMet = this.evaluateConditions(conditionalChoice.conditions, context);
      const shouldShow = conditionalChoice.show_when !== false ? conditionsMet : !conditionsMet;

      return shouldShow ? choice : null;
    }).filter(choice => choice !== null) as Choice[];

    // Ensure we have at least one choice
    if (filteredChoices.length === 0) {
      // Add a default fallback choice
      filteredChoices.push({
        text: 'Continue...',
        effect: {}
      });
    }

    return filteredChoices;
  }

  /**
   * Resolve template inheritance and mixins
   */
  private getTemplateCacheKey(templateId: string, context?: TemplateGenerationContext): string {
    if (!context) return `template:${templateId}`;

    // Create a cache key based on relevant context properties that affect template processing
    const contextKey = [
      context.level || 'any',
      context.reputation || 'any',
      context.gold || 'any',
      context.perception || 'any',
      context.charisma || 'any'
    ].join('|');

    return `template:${templateId}:${contextKey}`;
  }

  private getGenerationCacheKey(templateId: string, context: TemplateGenerationContext): string {
    // Create a deterministic cache key for event generation
    const contextKey = JSON.stringify({
      level: context.level,
      reputation: context.reputation,
      gold: context.gold,
      perception: context.perception,
      charisma: context.charisma,
      relationships: context.relationships,
      quests: context.quests,
      inventory: context.inventory
    });

    return `generation:${templateId}:${contextKey}`;
  }

  private resolveTemplateInheritance(template: Template): Template {
    let resolved = { ...template };

    // Handle multiple inheritance with resolution order
    if (template.extends) {
      const parentIds = Array.isArray(template.extends) ? template.extends : [template.extends];
      const inheritanceChain = this.buildInheritanceChain(parentIds);

      // Apply inheritance from base to derived (reverse order for proper overriding)
      for (const parentId of inheritanceChain.reverse()) {
        const parentTemplate = this.loadedTemplates.get(`custom:${parentId}`) ||
                              this.loadedTemplates.get(parentId);
        if (parentTemplate) {
          // Resolve parent inheritance first (recursive)
          const resolvedParent = this.resolveTemplateInheritance(parentTemplate);
          resolved = this.mergeTemplates(resolvedParent, resolved);
        }
      }
    }

    // Handle mixins with advanced strategies
    if (template.mixins) {
      for (const mixinId of template.mixins) {
        const mixinTemplate = this.loadedTemplates.get(`custom:${mixinId}`) ||
                             this.loadedTemplates.get(mixinId);
        if (mixinTemplate) {
          resolved = this.applyAdvancedMixin(resolved, mixinTemplate);
        }
      }
    }

    return resolved;
  }

  /**
   * Apply dynamic composition to template
   */
  private applyTemplateComposition(template: Template, context: TemplateGenerationContext): Template {
    if (!template.composition) return template;

    let composed = { ...template };

    // Sort compositions by priority
    const sortedCompositions = [...template.composition].sort((a, b) => (a.priority || 0) - (b.priority || 0));

    for (const composition of sortedCompositions) {
      // Check if composition conditions are met
      if (composition.conditions && !this.evaluateConditions(composition.conditions, context)) {
        continue;
      }

      const componentTemplate = this.loadedTemplates.get(`custom:${composition.template_id}`) ||
                               this.loadedTemplates.get(composition.template_id);

      if (componentTemplate) {
        composed = this.applyComposition(composed, componentTemplate, composition);
      }
    }

    return composed;
  }

  /**
   * Merge parent template with child template (inheritance)
   */
  private mergeTemplates(parent: Template, child: Template): Template {
    return {
      ...parent,
      ...child,
      choices: [...(parent.choices || []), ...(child.choices || [])],
      tags: [...(parent.tags || []), ...(child.tags || [])],
      conditions: child.conditions || parent.conditions,
      conditional_choices: child.conditional_choices || parent.conditional_choices,
      dynamic_fields: child.dynamic_fields || parent.dynamic_fields,
      composition: child.composition || parent.composition
    };
  }

  /**
   * Build inheritance chain to resolve multiple inheritance conflicts
   */
  private buildInheritanceChain(parentIds: string[]): string[] {
    const chain: string[] = [];
    const visited = new Set<string>();

    const processParents = (ids: string[]) => {
      for (const id of ids) {
        if (!visited.has(id)) {
          visited.add(id);

          // Check if parent has its own parents
          const parentTemplate = this.loadedTemplates.get(`custom:${id}`) ||
                                this.loadedTemplates.get(id);
          if (parentTemplate?.extends) {
            const grandParentIds = Array.isArray(parentTemplate.extends) ?
                                  parentTemplate.extends : [parentTemplate.extends];
            processParents(grandParentIds);
          }

          chain.push(id);
        }
      }
    };

    processParents(parentIds);
    return chain;
  }

  /**
   * Apply mixin to template
   */
  private applyMixin(template: Template, mixin: Template): Template {
    return {
      ...template,
      choices: [...(template.choices || []), ...(mixin.choices || [])],
      tags: [...(template.tags || []), ...(mixin.tags || [])],
      conditions: template.conditions || mixin.conditions,
      conditional_choices: template.conditional_choices || mixin.conditional_choices,
      dynamic_fields: template.dynamic_fields || mixin.dynamic_fields
    };
  }

  /**
   * Apply advanced mixin with conflict resolution
   */
  private applyAdvancedMixin(template: Template, mixin: Template): Template {
    return {
      ...mixin, // Start with mixin properties
      ...template, // Override with template properties
      choices: this.resolveChoiceConflicts(template.choices || [], mixin.choices || []),
      tags: [...new Set([...(mixin.tags || []), ...(template.tags || [])])], // Unique tags
      conditions: template.conditions || mixin.conditions,
      conditional_choices: template.conditional_choices || mixin.conditional_choices,
      dynamic_fields: template.dynamic_fields || mixin.dynamic_fields,
      extends: template.extends,
      mixins: template.mixins,
      composition: template.composition
    };
  }

  /**
   * Resolve choice conflicts in multiple inheritance/mixins
   */
  private resolveChoiceConflicts(templateChoices: Choice[], mixinChoices: Choice[]): Choice[] {
    const allChoices = [...templateChoices, ...mixinChoices];
    const uniqueChoices = new Map<string, Choice>();

    // Use choice text as key for uniqueness
    allChoices.forEach(choice => {
      if (!uniqueChoices.has(choice.text)) {
        uniqueChoices.set(choice.text, choice);
      }
    });

    return Array.from(uniqueChoices.values());
  }

  /**
   * Apply composition to template
   */
  private applyComposition(template: Template, component: Template, composition: TemplateComposition): Template {
    const strategy = composition.merge_strategy || 'append';

    switch (strategy) {
      case 'append':
        return {
          ...template,
          choices: [...(template.choices || []), ...(component.choices || [])],
          tags: [...(template.tags || []), ...(component.tags || [])]
        };

      case 'prepend':
        return {
          ...template,
          choices: [...(component.choices || []), ...(template.choices || [])],
          tags: [...(component.tags || []), ...(template.tags || [])]
        };

      case 'replace':
        return {
          ...template,
          ...component
        };

      case 'merge':
      default:
        return {
          ...template,
          ...component,
          choices: [...(template.choices || []), ...(component.choices || [])],
          tags: [...(template.tags || []), ...(component.tags || [])]
        };
    }
  }

  /**
   * Apply dynamic fields to template
   */
  private applyDynamicFields(template: Template, context: TemplateGenerationContext): Template {
    if (!template.dynamic_fields) return template;

    const result = { ...template };

    template.dynamic_fields.forEach(dynamicField => {
      const conditionsMet = this.evaluateConditions(dynamicField.conditions, context);
      const newValue = conditionsMet ? dynamicField.value_if_true : (dynamicField.value_if_false || '');

      switch (dynamicField.field) {
        case 'title':
          result.title = newValue || result.title;
          break;
        case 'narrative':
          result.narrative = newValue || result.narrative;
          break;
        case 'choice_text':
          if (dynamicField.choice_index !== undefined && result.choices[dynamicField.choice_index]) {
            result.choices[dynamicField.choice_index].text = newValue || result.choices[dynamicField.choice_index].text;
          }
          break;
      }
    });

    return result;
  }

  /**
   * Process a template into an event
   */
  private processTemplate(template: Template, context: TemplateGenerationContext): Event {
    // Check generation cache first
    const generationCacheKey = this.getGenerationCacheKey(template.id || 'unknown', context);
    const cachedEvent = this.generationCache.get(generationCacheKey);
    if (cachedEvent) {
      // Return cached event with new unique ID
      return {
        ...cachedEvent,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }

    // Check processed template cache
    const templateCacheKey = this.getTemplateCacheKey(template.id || 'unknown', context);
    let processedTemplate = this.processedTemplateCache.get(templateCacheKey);

    if (!processedTemplate) {
      // Resolve inheritance and mixins
      const inheritedTemplate = this.resolveTemplateInheritance(template);

      // Apply dynamic composition
      const composedTemplate = this.applyTemplateComposition(inheritedTemplate, context);

      // Apply dynamic fields based on conditions
      processedTemplate = this.applyDynamicFields(composedTemplate, context);

      // Apply context-based modifications
      processedTemplate = this.applyContextModifications(processedTemplate, context);

      // Cache the processed template
      this.processedTemplateCache.set(templateCacheKey, processedTemplate);
    }

    // Apply conditional choices (must be done per generation since it depends on context)
    const finalChoices = this.applyConditionalChoices(processedTemplate, context);

    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: processedTemplate.title,
      description: processedTemplate.narrative,
      choices: finalChoices,
      type: processedTemplate.type || 'TEMPLATE_EVENT',
      context,
      difficulty: processedTemplate.difficulty,
      tags: processedTemplate.tags
    };

    // Cache the generated event
    this.generationCache.set(generationCacheKey, event);

    return event;
  }

  /**
   * Apply context-based modifications to template
   */
  private applyContextModifications(template: Template, context: TemplateGenerationContext): Template {
    const modified = { ...template };

    // Apply environmental modifications
    if (context.environment?.weather) {
      modified.narrative = this.applyWeatherEffects(modified.narrative, context.environment.weather);
    }

    if (context.environment?.season) {
      modified.narrative = this.applySeasonEffects(modified.narrative, context.environment.season);
    }

    // Apply difficulty scaling
    if (context.gameState?.difficulty) {
      modified.choices = this.scaleChoicesForDifficulty(modified.choices, context.gameState.difficulty);
    }

    return modified;
  }

  /**
   * Apply weather effects to narrative
   */
  private applyWeatherEffects(narrative: string, weather: string): string {
    const weatherEffects = {
      rain: 'through the pouring rain',
      storm: 'amidst the raging storm',
      snow: 'through the falling snow',
      fog: 'in the thick fog',
      clear: 'under the clear sky'
    };

    const effect = weatherEffects[weather as keyof typeof weatherEffects];
    if (effect) {
      // Simple insertion - could be made more sophisticated
      return narrative.replace(/through the/, `through the ${effect.replace('through the ', '')} and`);
    }

    return narrative;
  }

  /**
   * Apply seasonal effects to narrative
   */
  private applySeasonEffects(narrative: string, season: string): string {
    const seasonEffects = {
      spring: 'in the blooming spring',
      summer: 'in the hot summer',
      autumn: 'in the colorful autumn',
      winter: 'in the cold winter'
    };

    const effect = seasonEffects[season as keyof typeof seasonEffects];
    if (effect) {
      return narrative.replace(/in the/, effect + ' in the');
    }

    return narrative;
  }

  /**
   * Scale choices based on difficulty
   */
  private scaleChoicesForDifficulty(choices: any[], difficulty: string): any[] {
    const difficultyMultipliers = {
      easy: { reward: 1.2, penalty: 0.8 },
      normal: { reward: 1.0, penalty: 1.0 },
      hard: { reward: 0.8, penalty: 1.3 },
      legendary: { reward: 0.6, penalty: 1.5 }
    };

    const multiplier = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] ||
                      difficultyMultipliers.normal;

    return choices.map(choice => ({
      ...choice,
      effect: this.scaleEffect(choice.effect, multiplier)
    }));
  }

  /**
   * Scale effect values based on difficulty
   */
  private scaleEffect(effect: any, multiplier: { reward: number; penalty: number }): any {
    if (!effect || typeof effect !== 'object') return effect;

    const scaled: any = {};

    for (const [key, value] of Object.entries(effect)) {
      if (typeof value === 'number') {
        // Positive values (rewards) get multiplied by reward multiplier
        // Negative values (penalties) get multiplied by penalty multiplier
        scaled[key] = value >= 0 ?
          Math.round(value * multiplier.reward) :
          Math.round(value * multiplier.penalty);
      } else {
        scaled[key] = value;
      }
    }

    return scaled;
  }

  /**
   * Register a custom template
   */
  registerTemplate(templateId: string, template: Template): boolean {
    if (!validateTemplate(template).isValid) {
      console.warn(`Invalid template structure for '${templateId}'`);
      return false;
    }

    if (this.customTemplates.has(templateId)) {
      console.warn(`Template '${templateId}' already exists. Use override=true to replace it.`);
      return false;
    }

    this.customTemplates.add(templateId);
    // Store in loaded templates for easy access
    this.loadedTemplates.set(`custom:${templateId}`, template);

    // Clear caches since template was modified
    this.clearTemplateCaches(templateId);

    return true;
  }

  /**
   * Unregister a custom template
   */
  unregisterTemplate(templateId: string): boolean {
    if (!this.customTemplates.has(templateId)) {
      console.warn(`Template '${templateId}' is not a registered custom template`);
      return false;
    }

    this.loadedTemplates.delete(`custom:${templateId}`);
    this.customTemplates.delete(templateId);
    return true;
  }

  /**
   * Get list of custom templates
   */
  getCustomTemplates(): string[] {
    return Array.from(this.customTemplates);
  }

  /**
   * Get available templates organized by genre
   */
  getAvailableTemplates(): TemplateLibrary {
    const templates: TemplateLibrary = {};

    this.loadedTemplates.forEach((template, key) => {
      const [genre, id] = key.split(':');
      if (!templates[genre]) {
        templates[genre] = {};
      }
      templates[genre][id] = {
        title: template.title,
        type: template.type,
        difficulty: template.difficulty,
        tags: template.tags
      };
    });

    return templates;
  }

  /**
   * Get all loaded templates as a flat map
   */
  getLoadedTemplates(): Map<string, Template> {
    return new Map(this.loadedTemplates);
  }

  /**
   * Check if a template exists
   */
  hasTemplate(templateId: string): boolean {
    const fullTemplateId = this.templateLibrary ? `${this.templateLibrary}:${templateId}` : templateId;
    return this.loadedTemplates.has(fullTemplateId);
  }

  /**
   * Get template statistics
   */
  getStats(): {
    customTemplates: number;
    loadedTemplates: number;
    genres: string[];
    templateLibrary: string | null;
  } {
    const genres = Array.from(new Set(
      Array.from(this.loadedTemplates.keys())
        .map(key => key.split(':')[0])
    ));

    return {
      customTemplates: this.customTemplates.size,
      loadedTemplates: this.loadedTemplates.size,
      genres,
      templateLibrary: this.templateLibrary
    };
  }

  /**
   * Clear caches related to a specific template
   */
  private clearTemplateCaches(templateId: string): void {
    // Clear processed template cache entries for this template
    for (const [key] of this.processedTemplateCache) {
      if (key.includes(`template:${templateId}`)) {
        this.processedTemplateCache.delete(key);
      }
    }

    // Clear generation cache entries for this template
    for (const [key] of this.generationCache) {
      if (key.includes(`generation:${templateId}`)) {
        this.generationCache.delete(key);
      }
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.processedTemplateCache.clear();
    this.generationCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { processedTemplates: number; generatedEvents: number } {
    return {
      processedTemplates: this.processedTemplateCache.size,
      generatedEvents: this.generationCache.size
    };
  }
}