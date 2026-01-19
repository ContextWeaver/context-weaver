// RPG Event Generator v3.0.0 - Time System
// Manages game time, seasons, and time-based events

import { Chance } from 'chance';
import { TIME_CONSTANTS } from '../utils';
import { ITimeSystem } from '../interfaces';

export interface TimeSystemState {
  currentDay: number;
  currentSeason: string;
  gameYear: number;
  timeBasedEvents: Map<string, TimeBasedChain>;
}

export interface TimeBasedChain {
  definition: string;
  stage: number;
  startDay: number;
  completedStages: Set<number>;
  nextEventTime?: number;
  nextEventTemplate?: string;
}

export interface SeasonalData {
  templates: string[];
  modifiers: {
    health?: number;
    morale?: number;
    trade?: number;
    travel?: number;
  };
}

export interface TimeInfo {
  day: number;
  season: string;
  year: number;
  seasonalModifiers: { [key: string]: any };
}

export interface TimeEvent {
  type: 'seasonal_change' | 'time_based_chain' | 'seasonal_random';
  chainId?: string;
  season?: string;
  day: number;
  template?: any;
  stage?: number;
  stageDay?: number;
  chainStage?: number;
}

export class TimeSystem implements ITimeSystem {
  private state: TimeSystemState;
  private seasonalEvents: Map<string, SeasonalData>;
  private timeBasedEventChains: Map<string, any>; // Chain definitions
  private chance: Chance.Chance;

  constructor(chance: Chance.Chance = new Chance()) {
    this.chance = chance;
    this.state = {
      currentDay: TIME_CONSTANTS.STARTING_DAY,
      currentSeason: TIME_CONSTANTS.STARTING_SEASON,
      gameYear: TIME_CONSTANTS.STARTING_YEAR,
      timeBasedEvents: new Map()
    };

    this.seasonalEvents = new Map();
    this.timeBasedEventChains = new Map();
    this.initializeSeasonalEvents();
    this.initializeTimeBasedChains();
  }

  /**
   * Initialize seasonal event data
   */
  private initializeSeasonalEvents(): void {
    this.seasonalEvents.set('spring', {
      templates: ['BLOOMING_ROMANCE', 'SPRING_FESTIVAL', 'NEW_BEGINNINGS'],
      modifiers: {
        health: 5,
        morale: 10,
        trade: 0,
        travel: 5
      }
    });

    this.seasonalEvents.set('summer', {
      templates: ['SUMMER_TOURNAMENT', 'HARVEST_PREPARATION', 'BEACH_FESTIVAL'],
      modifiers: {
        health: 0,
        morale: 5,
        trade: 10,
        travel: 10
      }
    });

    this.seasonalEvents.set('autumn', {
      templates: ['HARVEST_FESTIVAL', 'POLITICAL_INTRIGUE', 'MERCHANT_CARAVAN'],
      modifiers: {
        health: -5,
        morale: 0,
        trade: 15,
        travel: 0
      }
    });

    this.seasonalEvents.set('winter', {
      templates: ['WINTER_SOLSTICE', 'NOBLE_BALL', 'BANDIT_ACTIVITY'],
      modifiers: {
        health: -10,
        morale: -10,
        trade: -5,
        travel: -15
      }
    });
  }

  /**
   * Initialize time-based chain definitions
   */
  private initializeTimeBasedChains(): void {
    this.timeBasedEventChains.set('POLITICAL_UPRISING', {
      name: 'Political Uprising',
      description: 'Growing discontent leads to revolution',
      stages: [
        { day: 1, template: 'RUMORS_OF_DISSENT' },
        { day: 7, template: 'MARKET_UNREST' },
        { day: 14, template: 'ROYAL_PURGE' },
        { day: 21, template: 'FINAL_RECKONING' }
      ]
    });

    this.timeBasedEventChains.set('MERCHANT_GUILD_WAR', {
      name: 'Merchant Guild War',
      description: 'Competing merchant factions battle for dominance',
      stages: [
        { day: 1, template: 'TRADE_DISPUTE' },
        { day: 5, template: 'BLACKMAIL_OPPORTUNITY' },
        { day: 10, template: 'TRADE_WAR' },
        { day: 15, template: 'MARKET_CRASH' }
      ]
    });
  }

  /**
   * Get current time information
   */
  getCurrentTime(): TimeInfo {
    return {
      day: this.state.currentDay,
      season: this.state.currentSeason,
      year: Math.ceil(this.state.currentDay / TIME_CONSTANTS.DAYS_PER_YEAR),
      seasonalModifiers: this.seasonalEvents.get(this.state.currentSeason)?.modifiers || {}
    };
  }

  /**
   * Advance game time by one day
   */
  advanceDay(): TimeEvent[] {
    this.state.currentDay++;

    const triggeredEvents: TimeEvent[] = [];

    // Check for season change
    this.updateSeason(triggeredEvents);

    // Check time-based chain events
    this.checkTimeBasedEvents(triggeredEvents);

    // Random seasonal events
    this.checkSeasonalRandomEvents(triggeredEvents);

    return triggeredEvents;
  }

  /**
   * Advance game time by multiple days
   */
  advanceDays(days: number): TimeEvent[] {
    const allEvents: TimeEvent[] = [];

    for (let i = 0; i < days; i++) {
      const dayEvents = this.advanceDay();
      allEvents.push(...dayEvents);
    }

    return allEvents;
  }

  /**
   * Update season if needed
   */
  private updateSeason(triggeredEvents: TimeEvent[]): void {
    const seasonIndex = Math.floor((this.state.currentDay - 1) / TIME_CONSTANTS.SEASON_LENGTH) % 4;
    const newSeason = TIME_CONSTANTS.SEASONS[seasonIndex];

    if (newSeason !== this.state.currentSeason) {
      this.state.currentSeason = newSeason;
      triggeredEvents.push({
        type: 'seasonal_change',
        season: newSeason,
        day: this.state.currentDay
      });
    }
  }

  /**
   * Check for time-based chain events
   */
  private checkTimeBasedEvents(triggeredEvents: TimeEvent[]): void {
    for (const [chainId, chainData] of this.state.timeBasedEvents.entries()) {
      const daysSinceStart = this.state.currentDay - chainData.startDay;

      for (const stage of this.timeBasedEventChains.get(chainData.definition)?.stages || []) {
        if (stage.day === daysSinceStart && !chainData.completedStages.has(stage.day)) {
          chainData.completedStages.add(stage.day);

          triggeredEvents.push({
            type: 'time_based_chain',
            chainId: chainId,
            stage: stage,
            day: this.state.currentDay,
            template: stage.template
          });
          break;
        }
      }
    }
  }

  /**
   * Check for random seasonal events
   */
  private checkSeasonalRandomEvents(triggeredEvents: TimeEvent[]): void {
    if (this.chance.bool({ likelihood: 10 })) { // 10% chance per day
      const seasonalData = this.seasonalEvents.get(this.state.currentSeason);
      if (seasonalData && seasonalData.templates.length > 0) {
        const randomTemplate = this.chance.pickone(seasonalData.templates);
        triggeredEvents.push({
          type: 'seasonal_random',
          season: this.state.currentSeason,
          template: randomTemplate,
          day: this.state.currentDay
        });
      }
    }
  }

  /**
   * Start a time-based event chain
   */
  startTimeBasedChain(chainName: string): boolean {
    if (!this.timeBasedEventChains.has(chainName)) {
      console.warn(`Time-based chain '${chainName}' not found`);
      return false;
    }

    const chainId = `time_chain_${Date.now()}_${this.chance.guid().substring(0, 8)}`;

    this.state.timeBasedEvents.set(chainId, {
      definition: chainName,
      stage: 0,
      startDay: this.state.currentDay,
      completedStages: new Set()
    });

    return true;
  }

  /**
   * Get all active time-based chains
   */
  getActiveTimeChains(): any[] {
    const activeChains: any[] = [];

    for (const [chainId, chainData] of this.state.timeBasedEvents.entries()) {
      const chainDef = this.timeBasedEventChains.get(chainData.definition);
      if (chainDef) {
        activeChains.push({
          id: chainId,
          name: chainDef.name,
          description: chainDef.description,
          currentStage: chainData.stage,
          totalStages: chainDef.stages.length,
          daysActive: this.state.currentDay - chainData.startDay,
          nextEventDay: chainData.nextEventTime,
          nextEventTemplate: chainData.nextEventTemplate
        });
      }
    }

    return activeChains;
  }

  /**
   * End a time-based chain
   */
  endTimeBasedChain(chainId: string): void {
    this.state.timeBasedEvents.delete(chainId);
  }

  /**
   * Set the current time (for loading saved games)
   */
  setTime(day: number, season: string): void {
    this.state.currentDay = day;
    this.state.currentSeason = season;
    this.state.gameYear = Math.ceil(day / TIME_CONSTANTS.DAYS_PER_YEAR);
  }

  /**
   * Get time system state for saving
   */
  getState(): TimeSystemState {
    return {
      currentDay: this.state.currentDay,
      currentSeason: this.state.currentSeason,
      gameYear: this.state.gameYear,
      timeBasedEvents: new Map(this.state.timeBasedEvents)
    };
  }

  /**
   * Load time system state
   */
  loadState(state: Partial<TimeSystemState>): void {
    if (state.currentDay) this.state.currentDay = state.currentDay;
    if (state.currentSeason) this.state.currentSeason = state.currentSeason;
    if (state.gameYear) this.state.gameYear = state.gameYear;
    if (state.timeBasedEvents) this.state.timeBasedEvents = new Map(state.timeBasedEvents);
  }

  /**
   * Add custom seasonal event data
   */
  addSeasonalData(season: string, data: SeasonalData): void {
    this.seasonalEvents.set(season, data);
  }

  /**
   * Add custom time-based chain
   */
  addTimeBasedChain(name: string, chain: any): void {
    this.timeBasedEventChains.set(name, chain);
  }

  /**
   * Get seasonal data for a specific season
   */
  getSeasonalData(season: string): SeasonalData | null {
    return this.seasonalEvents.get(season) || null;
  }

  /**
   * Get time system statistics
   */
  getStats(): {
    currentDay: number;
    currentSeason: string;
    activeChains: number;
    availableChains: number;
    seasonsConfigured: number;
  } {
    return {
      currentDay: this.state.currentDay,
      currentSeason: this.state.currentSeason,
      activeChains: this.state.timeBasedEvents.size,
      availableChains: this.timeBasedEventChains.size,
      seasonsConfigured: this.seasonalEvents.size
    };
  }
}