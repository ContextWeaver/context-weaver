// RPG Event Generator v4.0.0 - Main Orchestrator Class
// Composition-based architecture using dependency injection
// This replaces the monolithic index.ts with a clean orchestration layer

import { Chance } from 'chance';
import { VERSION } from './utils/version';
import {
  Event,
  PlayerContext,
  GeneratorOptions,
  ExportData,
  ImportResult,
  GameState,
  AnalyzedContext
} from './types';

// Import all modular systems
import {
  GeneratorCore,
  MarkovEngine,
  ContextAnalyzer,
  DifficultyScaler
} from './core';

import { TemplateSystem } from './templates';
import { ChainSystem } from './chains';
import { RuleEngine } from './rules';
import { EnvironmentalSystem } from './environment';
import { TimeSystem } from './time';
import { RelationshipSystem } from './relationships';
import { LocalizationSystem } from './localization';
import { AIEnhancer } from './ai';
import { WorldBuildingSystem } from './world';
import { TemplateDatabase } from './database';
import { MemoryDatabaseAdapter } from './database/MemoryDatabaseAdapter';

let Worker: any, isMainThread: any, parentPort: any, workerData: any;
let pathModule: any, osModule: any;

try {
  const workerThreads = require('worker_threads');
  Worker = workerThreads.Worker;
  isMainThread = workerThreads.isMainThread;
  parentPort = workerThreads.parentPort;
  workerData = workerThreads.workerData;

  pathModule = require('path');
  osModule = require('os');
} catch (e) {
  Worker = null;
  isMainThread = true;
  parentPort = null;
  workerData = null;
  pathModule = null;
  osModule = null;
}

export class RPGEventGenerator {
  private generatorCore: GeneratorCore;
  private markovEngine: MarkovEngine;
  private contextAnalyzer: ContextAnalyzer;
  private difficultyScaler: DifficultyScaler;

  private templateSystem: TemplateSystem;
  private chainSystem: ChainSystem;
  private ruleEngine: RuleEngine;
  private environmentalSystem: EnvironmentalSystem;
  private timeSystem: TimeSystem;
  private relationshipSystem: RelationshipSystem;
  private localizationSystem: LocalizationSystem;
  private aiEnhancer: AIEnhancer;
  private worldBuildingSystem: WorldBuildingSystem;
  private templateDatabase: TemplateDatabase | null = null;

  private options: GeneratorOptions;
  private chance: Chance.Chance;

  private enableTemplates: boolean;
  private enableDependencies: boolean;
  private _enableModifiers: boolean;
  private _enableRelationships: boolean;
  private pureMarkovMode: boolean;
  private _enableRuleEngine: boolean;

  constructor(options: GeneratorOptions = {}) {
    this.options = options;
    this.chance = options.chance || new Chance();

    // Validate configuration
    const validationResult = this.validateConfig(options);
    if (!validationResult.isValid && validationResult.warnings.length > 0) {
      console.warn('Configuration warnings:', validationResult.warnings);
    }

    this.enableTemplates = options.enableTemplates !== false;
    this.enableDependencies = options.enableDependencies !== false;
    this._enableModifiers = options.enableModifiers !== false;
    this._enableRelationships = options.enableRelationships !== false;
    this._enableRuleEngine = options.enableRuleEngine !== false;
    this.pureMarkovMode = options.pureMarkovMode || false;

    this.markovEngine = new MarkovEngine({ stateSize: options.stateSize });
    this.contextAnalyzer = new ContextAnalyzer();
    this.difficultyScaler = new DifficultyScaler();
    this.generatorCore = new GeneratorCore({
      ...options,
      chance: this.chance
    });

    this.templateSystem = new TemplateSystem(options.templateLibrary);
    this.chainSystem = new ChainSystem(this.chance);
    this.ruleEngine = new RuleEngine();
    this.environmentalSystem = new EnvironmentalSystem(this.chance);
    this.timeSystem = new TimeSystem(this.chance);
    this.relationshipSystem = new RelationshipSystem();
    this.localizationSystem = new LocalizationSystem(options.language);
    this.aiEnhancer = new AIEnhancer(options.aiEnhancement);
    this.worldBuildingSystem = new WorldBuildingSystem();

    if (options.enableDatabase !== false) {
      if (!options.databaseAdapter || options.databaseAdapter instanceof MemoryDatabaseAdapter) {
        this.initializeDatabaseSync(options.databaseAdapter);
      } else {
        this.initializeDatabase(options.databaseAdapter);
      }
    }

    this.initializeSystems(options);

    if (options.trainingData) {
      this.markovEngine.addData(options.trainingData);
      if (options.debug) {
        console.log(`[RPGEventGenerator] Loaded ${options.trainingData.length} training data entries`);
      }
    }
  }

  /**
   * Validate configuration options
   */
  private validateConfig(options: GeneratorOptions): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check for conflicting options
    if (options.pureMarkovMode && options.enableTemplates) {
      warnings.push('pureMarkovMode is enabled but enableTemplates is also true. Templates will be ignored.');
    }

    if (options.pureMarkovMode && options.enableRelationships) {
      warnings.push('pureMarkovMode is enabled but enableRelationships is also true. Relationships will be ignored.');
    }

    // Check for missing dependencies
    if (options.enableTemplates && !options.templateLibrary && !options.trainingData) {
      warnings.push('enableTemplates is true but no templateLibrary or trainingData provided. Template generation may be limited.');
    }

    if (options.enableRelationships && !options.enableModifiers) {
      warnings.push('enableRelationships is true but enableModifiers is false. Some relationship features may not work properly.');
    }

    // Validate state size
    if (options.stateSize !== undefined && (options.stateSize < 1 || options.stateSize > 5)) {
      warnings.push(`stateSize should be between 1 and 5, got ${options.stateSize}. Using default value.`);
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Initialize all systems with provided options
   */
  private initializeSystems(options: GeneratorOptions): void {
    if (this.enableTemplates && options.templateLibrary && !this.pureMarkovMode) {
      this.templateSystem.loadTemplateLibrary(options.templateLibrary);
    }

    this.localizationSystem.loadLanguagePack('en', {
      ui: {
        'event.title.default': 'Unexpected Event',
        'event.description.default': 'Something unexpected happened.',
        'choice.fight': 'Fight',
        'choice.flee': 'Flee',
        'choice.negotiate': 'Negotiate',
        'choice.accept': 'Accept',
        'choice.decline': 'Decline',
        'choice.investigate': 'Investigate',
        'choice.ignore': 'Ignore'
      }
    });
  }

  // ===== CORE GENERATION METHODS =====

  /**
   * Generate a single event
   */
  generateEvent(playerContext: PlayerContext = {}): Event {
    const analyzedContext = this.contextAnalyzer.analyzeContext(playerContext);
    
    // Debug logging if enabled
    if (this.options.debug) {
      console.log('[RPGEventGenerator] Generating event with context:', {
        level: analyzedContext.level,
        powerLevel: analyzedContext.powerLevel,
        wealthTier: analyzedContext.wealthTier,
        lifeStage: analyzedContext.lifeStage,
        careerPath: analyzedContext.careerPath
      });
    }

    // If templates are enabled, try to use a matching template first
    let event: Event;
    let usedTemplate = false;
    
    if (this.enableTemplates && !this.pureMarkovMode) {
      const templateEvent = this.tryGenerateFromTemplate(playerContext, analyzedContext);
      if (templateEvent) {
        event = templateEvent;
        usedTemplate = true;
        if (this.options.debug) {
          console.log('[RPGEventGenerator] Generated event from template');
        }
      } else {
        // Fall back to core generation if no template matched
        event = this.generatorCore.generateEvent(playerContext);
        if (this.options.debug) {
          console.log('[RPGEventGenerator] Generated event using core generator (content library)');
        }
      }
    } else {
      // Use core generation directly
      event = this.generatorCore.generateEvent(playerContext);
      if (this.options.debug) {
        console.log('[RPGEventGenerator] Generated event using core generator (content library)');
      }
    }

    // Ensure context is properly set
    event.context = playerContext;
    
    // Debug logging for generated event
    if (this.options.debug) {
      console.log('[RPGEventGenerator] Generated event:', {
        id: event.id,
        title: event.title,
        type: event.type,
        difficulty: event.difficulty,
        usedTemplate,
        descriptionLength: event.description.length,
        choicesCount: event.choices.length
      });
    }

    if (this.enableModifiers) {
      const currentTime = this.timeSystem.getCurrentTime();
      const environmentalContext = {
        weather: 'clear',
        season: currentTime.season,
        timeOfDay: 'day'
      };
      this.environmentalSystem.setEnvironmentalContext(environmentalContext);
      const modifiedEvent = this.environmentalSystem.applyModifiers(event);
      if (modifiedEvent) {
        event = modifiedEvent;
      }
    }

    if (this.enableRuleEngine) {
      const processedEvent = this.ruleEngine.processEvent(event, analyzedContext);
      if (processedEvent) {
        event = processedEvent;
      }
    }

    if (this.aiEnhancer.isEnabled() && this.aiEnhancer.isAvailable()) {
      try {
        const aiContext = {
          playerLevel: analyzedContext.level,
          playerClass: analyzedContext.career,
          currentLocation: analyzedContext.location,
          recentEvents: [],
          storyTone: 'neutral' as const,
          genre: 'fantasy'
        };

        const enhancedEvent = this.aiEnhancer.enhanceEvent(event, aiContext);
        if (enhancedEvent) {
          event = enhancedEvent;
        }
      } catch {
      }
    }

    if (this.localizationSystem.getCurrentLanguage() !== 'en') {
      event.title = this.localizationSystem.translate(event.title);
      event.description = this.localizationSystem.translate(event.description);
    }

    return event;
  }

  /**
   * Try to generate an event from a matching template
   */
  private tryGenerateFromTemplate(
    playerContext: PlayerContext,
    analyzedContext: AnalyzedContext
  ): Event | null {
    if (!this.templateSystem) return null;

    const loadedTemplates = this.templateSystem.getLoadedTemplates();
    if (loadedTemplates.size === 0) return null;

    // Find templates that match the context
    const matchingTemplates: string[] = [];
    
    for (const [templateId, template] of loadedTemplates.entries()) {
      // Check if template matches context requirements
      if (this.templateMatchesContext(template, analyzedContext)) {
        matchingTemplates.push(templateId);
      }
    }

    if (matchingTemplates.length > 0) {
      // Select a random matching template
      const selectedTemplateId = this.chance.pickone(matchingTemplates);
      const templateContext = {
        ...playerContext,
        level: analyzedContext.level,
        powerLevel: analyzedContext.powerLevel,
        wealthTier: analyzedContext.wealthTier,
        lifeStage: analyzedContext.lifeStage
      };
      
      return this.templateSystem.generateFromTemplate(selectedTemplateId, templateContext);
    }

    return null;
  }

  /**
   * Check if a template matches the player context
   */
  private templateMatchesContext(template: any, context: AnalyzedContext): boolean {
    // If template has no context requirements, it matches
    if (!template.context_requirements || !template.context_requirements.length) {
      return true;
    }

    // Check each requirement
    for (const requirement of template.context_requirements) {
      if (requirement.type === 'level' && context.level !== undefined) {
        if (requirement.min && context.level < requirement.min) return false;
        if (requirement.max && context.level > requirement.max) return false;
      }
      
      if (requirement.type === 'power_level' && context.powerLevel !== undefined) {
        if (requirement.min && context.powerLevel < requirement.min) return false;
        if (requirement.max && context.powerLevel > requirement.max) return false;
      }
      
      if (requirement.type === 'wealth_tier' && context.wealthTier) {
        if (requirement.value && context.wealthTier !== requirement.value) return false;
      }
    }

    return true;
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

  /**
   * Generate event from specific template (supports custom templates)
   */
  generateFromTemplate(templateId: string, context: PlayerContext = {}): Event | null {
    return this.templateSystem.generateFromTemplate(templateId, context);
  }

  /**
   * Generate random event from genre (backward compatibility - removed)
   */
  generateFromGenre(genre: string, context: PlayerContext = {}): Event | null {
    return null;
  }

  // ===== TEMPLATE SYSTEM METHODS =====

  /**
   * Register a custom template
   */
  registerEventTemplate(templateId: string, template: any): boolean {
    return this.templateSystem.registerTemplate(templateId, template);
  }

  /**
   * Unregister a custom template
   */
  unregisterEventTemplate(templateId: string): boolean {
    return this.templateSystem.unregisterTemplate(templateId);
  }

  /**
   * Get list of custom templates
   */
  getCustomTemplates(): string[] {
    return this.templateSystem.getCustomTemplates();
  }

  /**
   * Get available templates by genre (pre-built library removed)
   */
  getAvailableTemplates(): any {
    return {};
  }

  // ===== EVENT CHAIN METHODS =====

  /**
   * Start an event chain
   */
  startChain(chainId: string, playerContext: PlayerContext = {}): Event | null {
    return this.chainSystem.startChain(chainId, playerContext);
  }

  /**
   * Advance an event chain
   */
  advanceChain(chainId: string, choice: string): Event | null {
    return this.chainSystem.advanceChain(chainId, choice);
  }

  /**
   * Get active chains
   */
  getActiveChains(): any[] {
    return this.chainSystem.getActiveChains();
  }

  /**
   * End a chain
   */
  endChain(chainId: string): void {
    this.chainSystem.endChain(chainId);
  }

  // ===== RULE ENGINE METHODS =====

  /**
   * Add a custom rule
   */
  addCustomRule(name: string, rule: any): void {
    if (!this.enableRuleEngine) {
      console.warn('Rule engine is disabled');
      return;
    }

    this.ruleEngine.addRule(name, rule);
  }

  /**
   * Remove a custom rule
   */
  removeCustomRule(name: string): boolean {
    if (!this.enableRuleEngine) return false;
    return this.ruleEngine.removeRule(name);
  }

  /**
   * Get custom rules
   */
  getCustomRules(): any {
    if (!this.enableRuleEngine) return {};
    return this.ruleEngine.getRules();
  }

  /**
   * Validate a custom rule
   */
  validateCustomRule(rule: any): { isValid: boolean; errors: string[] } {
    if (!this.enableRuleEngine) {
      return { isValid: false, errors: ['Rule engine is disabled'] };
    }

    const result = this.ruleEngine.validateRule(rule);
    return { isValid: result.valid, errors: result.errors };
  }

  // ===== ENVIRONMENTAL SYSTEM METHODS =====

  /**
   * Set environmental context
   */
  setEnvironmentalContext(context: any): void {
    if (!this.enableModifiers) {
      console.warn('Environmental modifiers are disabled');
      return;
    }

    this.environmentalSystem.setEnvironmentalContext(context);
  }

  /**
   * Register custom environmental modifier
   */
  registerModifier(modifierId: string, modifierConfig: any): void {
    if (!this.enableModifiers) {
      console.warn('Environmental modifiers are disabled');
      return;
    }

    this.environmentalSystem.registerModifier(modifierId, modifierConfig);
  }

  // ===== TIME SYSTEM METHODS =====

  /**
   * Get current time information
   */
  getCurrentTime(): any {
    return this.timeSystem.getCurrentTime();
  }

  /**
   * Advance game time by one day
   */
  advanceGameDay(): any[] {
    return this.timeSystem.advanceDay();
  }

  /**
   * Advance game time by multiple days
   */
  advanceGameDays(days: number): any[] {
    return this.timeSystem.advanceDays(days);
  }

  /**
   * Start a time-based chain
   */
  startTimeBasedChain(chainName: string): boolean {
    return this.timeSystem.startTimeBasedChain(chainName);
  }

  /**
   * Get active time chains
   */
  getActiveTimeChains(): any[] {
    return this.timeSystem.getActiveTimeChains();
  }

  // ===== RELATIONSHIP SYSTEM METHODS =====

  /**
   * Add an NPC to the relationship system
   */
  addNPC(npcConfig: any): void {
    if (!this.enableRelationships) {
      console.warn('Relationships feature is disabled');
      return;
    }

    this.relationshipSystem.addNPC(npcConfig);
  }

  /**
   * Update relationship between NPCs
   */
  updateRelationship(npcId: string, targetId: string, change: number, reason: string): void {
    if (!this.enableRelationships) return;
    this.relationshipSystem.updateRelationship(npcId, targetId, change, reason);
  }

  /**
   * Get relationship between NPCs
   */
  getRelationship(npcId: string, targetId: string): any {
    if (!this.enableRelationships) return null;
    return this.relationshipSystem.getRelationship(npcId, targetId);
  }

  /**
   * Apply relationship rule
   */
  applyRelationshipRule(npcId: string, targetId: string, ruleId: string): void {
    if (!this.enableRelationships) return;
    this.relationshipSystem.applyRelationshipRule(npcId, targetId, ruleId);
  }

  // ===== LOCALIZATION METHODS =====

  /**
   * Load a language pack
   */
  loadLanguagePack(language: string, languagePack: any): void {
    this.localizationSystem.loadLanguagePack(language, languagePack);
  }

  /**
   * Set current language
   */
  setLanguage(language: string): boolean {
    return this.localizationSystem.setLanguage(language);
  }

  /**
   * Get translated text
   */
  translate(key: string, variables: any = {}): string {
    return this.localizationSystem.translate(key, variables);
  }

  // ===== PERSISTENCE METHODS =====

  /**
   * Export custom content
   */
  exportCustomContent(): ExportData {
    const npcs: { [key: string]: any } = {};
    if (this.enableRelationships) {
      const npcArray = this.relationshipSystem.getAllNPCs();
      npcArray.forEach(npc => {
        npcs[npc.id] = npc;
      });
    }

    const templates: { [key: string]: any } = {};
    if (this.enableTemplates) {
      this.templateSystem.getLoadedTemplates().forEach((template, id) => {
        templates[id] = template;
      });
    }

    return {
      templates,
      trainingData: {},
      chains: this.chainSystem.getAvailableChains(),
      rules: this._enableRuleEngine ? this.ruleEngine.getRules() : {},
      npcs
    };
  }

  /**
   * Import custom content
   */
  importCustomContent(data: ExportData): ImportResult {
    const results: ImportResult = {
      templates: { success: 0, failed: [] },
      trainingData: { success: 0, failed: [] },
      chains: { success: 0, failed: [] },
      rules: { success: 0, failed: [] },
      npcs: { success: 0, failed: [] }
    };

    if (data.templates && this.enableTemplates) {
      results.templates.success = 1;
    }

    if (data.chains) {
      Object.entries(data.chains).forEach(([id, chain]) => {
        try {
          this.chainSystem.registerChain(id, chain);
          results.chains.success++;
        } catch (error) {
          results.chains.failed.push(id);
        }
      });
    }

    if (data.rules && this.enableRuleEngine) {
      if (!results.rules) {
        results.rules = { success: 0, failed: [] };
      }
      Object.entries(data.rules).forEach(([name, rule]) => {
        try {
          this.ruleEngine.addRule(name, rule);
          results.rules!.success++;
        } catch (error) {
          results.rules!.failed.push(name);
        }
      });
    }

    if (data.npcs && this.enableRelationships) {
      if (!results.npcs) {
        results.npcs = { success: 0, failed: [] };
      }
      Object.values(data.npcs).forEach(npc => {
        try {
          this.relationshipSystem.addNPC(npc);
          results.npcs!.success++;
        } catch (error) {
          results.npcs!.failed.push(npc.id || 'unknown');
        }
      });
    }

    return results;
  }

  get enableRuleEngine(): boolean { return this._enableRuleEngine; }
  get enableModifiers(): boolean { return this._enableModifiers; }
  get enableRelationships(): boolean { return this._enableRelationships; }

  /**
   * Get system statistics
   */
  getSystemStatus(): any {
    return {
      version: VERSION,
      language: this.localizationSystem.getCurrentLanguage(),
      availableLanguages: this.localizationSystem.getAvailableLanguages(),
      modifiersEnabled: this._enableModifiers,
      relationshipsEnabled: this._enableRelationships,
      dependenciesEnabled: this.enableDependencies,
      totalNPCs: this._enableRelationships ? this.relationshipSystem.getStats().totalNPCs : 0,
      activeModifiers: this._enableModifiers ? this.environmentalSystem.getActiveModifiers() : [],
      totalLocales: this.localizationSystem.getStats().loadedLanguagePacks,
      timeSystem: {
        currentDay: this.timeSystem.getCurrentTime().day,
        currentSeason: this.timeSystem.getCurrentTime().season
      },
      activeChains: this.chainSystem.getActiveChains().length
    };
  }

  /**
   * Get game state for saving
   */
  getGameState(): GameState {
    const activeChains = new Map<string, any>();
    this.chainSystem.getActiveChains().forEach(chain => {
      activeChains.set(chain.id, {
        definition: chain.definition,
        stage: chain.stage
      });
    });

    return {
      timeSystem: this.timeSystem.getState(),
      activeChains,
      completedEvents: new Set(),
      player: {},
      gameState: {}
    };
  }

  /**
   * Load game state
   */
  loadGameState(gameState: GameState): boolean {
    try {
      if (gameState.timeSystem) {
        this.timeSystem.loadState(gameState.timeSystem);
      }

      if (gameState.activeChains) {
      }

      return true;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return false;
    }
  }

  // ===== BACKWARD COMPATIBILITY METHODS =====

  addTrainingData(texts: string[]): void {
    this.generatorCore.addTrainingData(texts);
    if (this.options.debug) {
      console.log(`[RPGEventGenerator] Added ${texts.length} training data entries`);
    }
  }

  addCustomTrainingData(texts: string[], theme?: string): void {
    this.generatorCore.addTrainingData(texts, theme);
    if (this.options.debug) {
      console.log(`[RPGEventGenerator] Added ${texts.length} custom training data entries${theme ? ` with theme '${theme}'` : ''}`);
    }
  }

  generateTimeAwareEvent(context: PlayerContext = {}): Event {
    return this.generateEvent({
      ...context,
      season: this.timeSystem.getCurrentTime().season
    });
  }

  generateEnhancedEvent(context: PlayerContext = {}, options?: any): Event {
    const enhancedContext = {
      ...context,
      complexity: options?.complexity || 1
    };
    return this.generateEvent(enhancedContext);
  }

  applyModifiers(event: Event, modifiers?: any[]): Event {
    if (!this.enableModifiers || !modifiers) return event;
    return this.environmentalSystem.applyModifiers(event);
  }

  registerEventDependency(eventId: string, dependency: any): void {
    if (!this.enableRuleEngine) return;

    const conditions = dependency.operator && dependency.conditions
      ? dependency.conditions
      : [dependency];

    const rule: any = {
      conditions: conditions,
      effects: { addTags: ['dependency-met'] }
    };

    this.ruleEngine.addRule(`dependency-${eventId}`, rule);
  }

  checkEventDependencies(eventId: string, playerState?: any): boolean {
    if (!this.enableRuleEngine) return true;
    const rules = this.ruleEngine.getRules();
    return !!rules[`dependency-${eventId}`];
  }

  getRelationshipSummary(npcId: string): any {
    if (!this.enableRelationships) {
      return { totalRelationships: 0, averageStrength: 0, allyCount: 0, enemyCount: 0, neutralCount: 0 };
    }
    return this.relationshipSystem.getRelationshipSummary(npcId);
  }

  advanceTime(days: number): any[] {
    return this.timeSystem.advanceDays(days);
  }

  getRelationshipNetwork(npcId: string, depth: number = 1): any {
    if (!this.enableRelationships) return { nodes: [], edges: [] };
    return this.relationshipSystem.getRelationshipNetwork(npcId, depth);
  }

  // ===== BACKWARD COMPATIBILITY METHODS =====

  /**
   * Scale effects for difficulty (backward compatibility - stub)
   */
  scaleEffectsForDifficulty(effects: any, difficulty: string): any {
    return effects;
  }

  /**
   * Calculate difficulty tier (backward compatibility - stub)
   */
  calculateDifficultyTier(powerLevel: number): string {
    return 'normal';
  }

  /**
   * Register event chain (backward compatibility)
   */
  registerEventChain(id: string, chain: any): boolean {
    return this.chainSystem.registerChain(id, chain);
  }

  /**
   * Clear custom rules (backward compatibility - stub)
   */
  clearCustomRules(): void {
    // Stub implementation - do nothing
  }

  // ===== CACHE MANAGEMENT METHODS =====

  /**
   * Clear all template caches
   */
  clearTemplateCaches(): void {
    this.templateSystem.clearAllCaches();
  }

  /**
   * Get template cache statistics
   */
  getTemplateCacheStats(): { processedTemplates: number; generatedEvents: number } {
    return this.templateSystem.getCacheStats();
  }

  // ===== WORLD BUILDING METHODS =====

  generateWorld(seed?: number): any {
    return this.worldBuildingSystem.generateWorld(seed);
  }

  getWorldRegion(id: string): any {
    return this.worldBuildingSystem.getRegion(id);
  }

  getWorldFaction(id: string): any {
    return this.worldBuildingSystem.getFaction(id);
  }

  getAllWorldRegions(): any[] {
    return this.worldBuildingSystem.getAllRegions();
  }

  getAllWorldFactions(): any[] {
    return this.worldBuildingSystem.getAllFactions();
  }

  getHistoricalEvents(): any[] {
    return this.worldBuildingSystem.getHistoricalEvents();
  }

  simulateWorldYears(years: number): any[] {
    return this.worldBuildingSystem.simulateYears(years);
  }

  getFactionRelationships(factionId: string): any {
    return this.worldBuildingSystem.getFactionRelationships(factionId);
  }

  getRegionResources(regionId: string): any[] {
    return this.worldBuildingSystem.getRegionResources(regionId);
  }

  getWorldStats(): any {
    return this.worldBuildingSystem.getWorldStats();
  }

  getFactionAllies(factionId: string): string[] {
    return this.worldBuildingSystem.getFactionAllies(factionId);
  }

  getFactionEnemies(factionId: string): string[] {
    return this.worldBuildingSystem.getFactionEnemies(factionId);
  }

  getFactionDiplomacyStatus(factionId1: string, factionId2: string): string {
    return this.worldBuildingSystem.getFactionDiplomacyStatus(factionId1, factionId2);
  }

  calculateFactionInfluence(factionId: string): number {
    return this.worldBuildingSystem.calculateFactionInfluence(factionId);
  }

  getFactionTradeRoutes(factionId: string): any[] {
    return this.worldBuildingSystem.getFactionTradeRoutes(factionId);
  }

  getFactionPowerRanking(): any[] {
    return this.worldBuildingSystem.getFactionPowerRanking();
  }

  getFactionGoals(factionId: string): string[] {
    return this.worldBuildingSystem.getFactionGoals(factionId);
  }

  updateFactionRelationship(factionId1: string, factionId2: string, change: number): boolean {
    return this.worldBuildingSystem.updateFactionRelationship(factionId1, factionId2, change);
  }

  getFactionNetwork(factionId: string, depth?: number): any {
    return this.worldBuildingSystem.getFactionNetwork(factionId, depth);
  }

  // ===== PARALLEL GENERATION METHODS =====

  /**
   * Generate multiple events in parallel using Web Workers (if available)
   * 
   * Falls back to sequential generation if:
   * - Web Workers are not supported in the environment
   * - Worker spawning fails
   * 
   * @param count - Number of events to generate
   * @param context - Player context for event generation
   * @param options - Options including maxWorkers (defaults to min of CPU count and 4)
   * @returns Promise resolving to array of generated events
   * @throws Never throws; always falls back to sequential generation on error
   */
  async generateEventsParallel(count: number, context: PlayerContext = {}, options: { maxWorkers?: number } = {}): Promise<Event[]> {
    if (!Worker || !osModule) {
      if (this.options.debug) {
        console.warn('[RPGEventGenerator] Parallel generation not supported in this environment. Falling back to sequential generation.');
      }
      return this.generateEventsSequential(count, context);
    }

    try {
      const maxWorkers = options.maxWorkers || Math.min(osModule.cpus().length, 4);
      const eventsPerWorker = Math.ceil(count / maxWorkers);

      const workerPromises: Promise<Event[]>[] = [];

      for (let i = 0; i < maxWorkers; i++) {
        const startIndex = i * eventsPerWorker;
        const endIndex = Math.min((i + 1) * eventsPerWorker, count);
        const workerCount = endIndex - startIndex;

        if (workerCount > 0) {
          workerPromises.push(this.spawnEventGenerationWorker(workerCount, context));
        }
      }

      const workerResults = await Promise.all(workerPromises);
      const allEvents = workerResults.flat();

      return allEvents.slice(0, count);
    } catch (error) {
      if (this.options.debug) {
        console.warn('[RPGEventGenerator] Worker loading failed, falling back to sequential generation:', error instanceof Error ? error.message : String(error));
      }
      return this.generateEventsSequential(count, context);
    }
  }

  /**
   * Generate multiple events sequentially
   * 
   * @param count - Number of events to generate
   * @param context - Player context for event generation
   * @returns Promise resolving to array of generated events
   */
  private generateEventsSequential(count: number, context: PlayerContext): Promise<Event[]> {
    const events: Event[] = [];
    for (let i = 0; i < count; i++) {
      const event = this.generateEvent(context);
      events.push(event);
    }
    return Promise.resolve(events);
  }

  private async spawnEventGenerationWorker(count: number, context: PlayerContext): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      if (!Worker || !pathModule) {
        reject(new Error('Worker threads not supported in this environment'));
        return;
      }

      const workerPath = pathModule.join(__dirname, 'workers', 'event-generator-worker.js');

      const worker = new Worker(workerPath, {
        workerData: {
          count,
          context,
          options: this.options
        }
      });

      worker.on('message', (events: Event[]) => {
        resolve(events);
      });

      worker.on('error', (error: Error) => {
        reject(error);
      });

      worker.on('exit', (code: number) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  generateEventsBatched(count: number, context: PlayerContext = {}, batchSize: number = 10): Event[] {
    const events: Event[] = [];
    const batches = Math.ceil(count / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const remaining = count - events.length;
      const currentBatchSize = Math.min(batchSize, remaining);

      for (let i = 0; i < currentBatchSize; i++) {
        const event = this.generateEvent(context);
        events.push(event);
      }

      if (batch < batches - 1) {
      }
    }

    return events;
  }

  // ===== DATABASE METHODS =====

  private async initializeDatabase(adapter?: any): Promise<void> {
    try {
      const databaseAdapter = adapter || new MemoryDatabaseAdapter();
      this.templateDatabase = new TemplateDatabase();
      await this.templateDatabase.initialize(databaseAdapter);
      this.templateSystem.setDatabase(this.templateDatabase);

      await this.templateSystem.loadTemplatesFromDatabase();
    } catch (error) {
      console.warn('Database initialization failed, continuing without database:', error);
    }
  }

  private initializeDatabaseSync(adapter?: any): void {
    try {
      const databaseAdapter = adapter || new MemoryDatabaseAdapter();
      this.templateDatabase = new TemplateDatabase();
      if (databaseAdapter instanceof MemoryDatabaseAdapter) {
        databaseAdapter.connect();
        this.templateDatabase.initialize(databaseAdapter).then(() => {
          this.templateSystem.setDatabase(this.templateDatabase!);
          this.templateSystem.loadTemplatesFromDatabase();
        }).catch(error => {
          console.warn('Database initialization failed:', error);
        });
      }
    } catch (error) {
      console.warn('Database sync initialization failed, continuing without database:', error);
    }
  }

  async storeTemplateInDatabase(template: any): Promise<void> {
    if (!this.templateDatabase) {
      throw new Error('Database not initialized. Enable database in constructor options.');
    }

    await this.templateDatabase.storeTemplate(template);
  }

  async getTemplateFromDatabase(id: string): Promise<any | null> {
    if (!this.templateDatabase) {
      throw new Error('Database not initialized. Enable database in constructor options.');
    }

    return await this.templateDatabase.getTemplate(id);
  }

  async searchTemplatesInDatabase(criteria: any): Promise<any[]> {
    if (!this.templateDatabase) {
      throw new Error('Database not initialized. Enable database in constructor options.');
    }

    return await this.templateDatabase.searchTemplates(criteria);
  }

  async getTemplatesByTags(tags: string[]): Promise<any[]> {
    if (!this.templateDatabase) {
      throw new Error('Database not initialized. Enable database in constructor options.');
    }

    return await this.templateDatabase.getTemplatesByTag(tags);
  }

  async getRandomTemplatesFromDatabase(count: number, criteria?: any): Promise<any[]> {
    if (!this.templateDatabase) {
      throw new Error('Database not initialized. Enable database in constructor options.');
    }

    return await this.templateDatabase.getRandomTemplates(count, criteria);
  }

  async getDatabaseStats(): Promise<any> {
    if (!this.templateDatabase) {
      throw new Error('Database not initialized. Enable database in constructor options.');
    }

    return await this.templateDatabase.getStats();
  }

  /**
   * Check if running in a Node.js environment (for testing)
   */
  get isNodeEnv(): boolean {
    return !!(Worker && osModule && pathModule);
  }

  /**
   * Get optimal worker count based on environment (for testing)
   */
  getOptimalWorkerCount(): number {
    if (!Worker || !osModule) {
      return 1;
    }
    return Math.min(osModule.cpus().length, 4);
  }
}