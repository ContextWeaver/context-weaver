// Feature system interfaces for dependency injection
// Defines contracts for template, chain, rule, and other systems

export interface ITemplateSystem {
  loadTemplateLibrary(genre: string): void;
  registerTemplate(id: string, template: any): boolean;
  unregisterTemplate(id: string): boolean;
  generateFromTemplate(id: string, context?: any): any;
  generateFromGenre(genre: string, context?: any): any;
  getAvailableTemplates(): any;
  getCustomTemplates(): string[];
  clearAllCaches(): void;
  getCacheStats(): any;
}

export interface IChainSystem {
  registerChain(id: string, chain: any): boolean;
  startChain(id: string, context?: any): any;
  advanceChain(id: string, choice: string): any;
  endChain(id: string): void;
  getActiveChains(): any[];
  getAvailableChains(): any;
}

export interface IRuleEngine {
  addRule(name: string, rule: any): void;
  removeRule(name: string): boolean;
  getRules(): any;
  validateRule(rule: any): any;
  processEvent(event: any, context: any): any;
}

export interface IEnvironmentalSystem {
  setEnvironmentalContext(context: any): void;
  registerModifier(id: string, config: any): void;
  applyModifiers(event: any): any;
  getActiveModifiers(): string[];
}

export interface ITimeSystem {
  getCurrentTime(): any;
  advanceDay(): any[];
  advanceDays(days: number): any[];
  startTimeBasedChain(name: string): boolean;
  getActiveTimeChains(): any[];
  getState(): any;
  loadState(state: any): void;
}

export interface IRelationshipSystem {
  addNPC(config: any): void;
  updateRelationship(npcId: string, targetId: string, change: number, reason: string): void;
  getRelationship(npcId: string, targetId: string): any;
  applyRelationshipRule(npcId: string, targetId: string, ruleId: string): void;
  getAllNPCs(): any[];
  removeNPC(npcId: string): boolean;
  getStats(): any;
}

export interface ILocalizationSystem {
  loadLanguagePack(language: string, pack: any): void;
  setLanguage(language: string): boolean;
  translate(key: string, variables?: any): string;
  getCurrentLanguage(): string;
  getAvailableLanguages(): string[];
}

export interface IWorldBuildingSystem {
  generateWorld(seed?: number): any;
  getRegion(id: string): any;
  getFaction(id: string): any;
  getAllRegions(): any[];
  getAllFactions(): any[];
  getHistoricalEvents(): any[];
  simulateYears(years: number): any[];
  getFactionRelationships(factionId: string): any;
  getRegionResources(regionId: string): any[];
  getWorldStats(): any;
  getFactionAllies(factionId: string): string[];
  getFactionEnemies(factionId: string): string[];
  getFactionDiplomacyStatus(factionId1: string, factionId2: string): string;
  calculateFactionInfluence(factionId: string): number;
  getFactionTradeRoutes(factionId: string): any[];
  getFactionPowerRanking(): any[];
  getFactionGoals(factionId: string): string[];
  updateFactionRelationship(factionId1: string, factionId2: string, change: number): boolean;
  getFactionNetwork(factionId: string, depth?: number): any;
}

export interface IDatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  storeTemplate(id: string, template: any, metadata?: any): Promise<void>;
  getTemplate(id: string): Promise<any | null>;
  getAllTemplates(): Promise<any[]>;
  searchTemplates(query: any): Promise<any[]>;
  deleteTemplate(id: string): Promise<boolean>;
  getTemplateCount(): Promise<number>;
  clearAllTemplates(): Promise<void>;
}

export interface ITemplateDatabase {
  initialize(adapter: IDatabaseAdapter): Promise<void>;
  storeTemplate(template: any): Promise<void>;
  getTemplate(id: string): Promise<any | null>;
  getAllTemplates(): Promise<any[]>;
  searchTemplates(criteria: any): Promise<any[]>;
  getTemplatesByTag(tags: string[]): Promise<any[]>;
  getTemplatesByType(type: string): Promise<any[]>;
  getRandomTemplates(count: number, criteria?: any): Promise<any[]>;
  deleteTemplate(id: string): Promise<boolean>;
  getStats(): Promise<any>;
}