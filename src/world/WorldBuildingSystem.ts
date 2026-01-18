// RPG Event Generator v2.0.0 - World Building System
// Automated world generation, faction management, and historical event simulation

import { WorldRegion, WorldFaction, HistoricalEvent, WorldLandmark, WorldResource, HistoricalConsequence } from '../types/world';
import { IWorldBuildingSystem } from '../interfaces';

export class WorldBuildingSystem implements IWorldBuildingSystem {
  private regions: Map<string, WorldRegion>;
  private factions: Map<string, WorldFaction>;
  private historicalEvents: HistoricalEvent[];
  private currentYear: number;

  constructor() {
    this.regions = new Map();
    this.factions = new Map();
    this.historicalEvents = [];
    this.currentYear = 1000;
  }

  generateWorld(seed?: number): { regions: WorldRegion[]; factions: WorldFaction[]; events: HistoricalEvent[] } {
    const regions = this.generateRegions(seed);
    const factions = this.generateFactions(regions);
    const events = this.generateInitialHistory(regions, factions);

    return { regions, factions, events };
  }

  private generateRegions(seed?: number): WorldRegion[] {
    const regions: WorldRegion[] = [];

    const continentNames = ['Eldoria', 'Drakoria', 'Sylvoria', 'Aquilon', 'Ignisia'];
    const kingdomNames = ['Northern Realms', 'Southern Kingdoms', 'Eastern Empire', 'Western Isles', 'Central Dominion'];

    continentNames.forEach((name, i) => {
      const continent: WorldRegion = {
        id: `continent_${i}`,
        name,
        type: 'continent',
        sub_regions: [],
        landmarks: [],
        resources: [],
        population: Math.floor(Math.random() * 10000000) + 5000000,
        culture: ['Human', 'Elven', 'Dwarven', 'Orcish'][Math.floor(Math.random() * 4)],
        climate: ['temperate', 'tropical', 'arctic', 'desert'][Math.floor(Math.random() * 4)],
        political_stability: Math.random() * 0.8 + 0.2,
        economic_prosperity: Math.random() * 0.8 + 0.2
      };

      for (let j = 0; j < 2 + Math.floor(Math.random() * 3); j++) {
        const kingdom: WorldRegion = {
          id: `kingdom_${i}_${j}`,
          name: `${kingdomNames[j % kingdomNames.length]} of ${name}`,
          type: 'kingdom',
          parent_region: continent.id,
          sub_regions: [],
          landmarks: this.generateLandmarks(2 + Math.floor(Math.random() * 3)),
          resources: this.generateResources(3 + Math.floor(Math.random() * 4)),
          population: Math.floor(Math.random() * 2000000) + 500000,
          culture: continent.culture,
          climate: continent.climate,
          political_stability: Math.max(0.1, continent.political_stability + (Math.random() - 0.5) * 0.4),
          economic_prosperity: Math.max(0.1, continent.economic_prosperity + (Math.random() - 0.5) * 0.4)
        };

        continent.sub_regions.push(kingdom.id);
        regions.push(kingdom);
      }

      regions.push(continent);
    });

    regions.forEach(region => this.regions.set(region.id, region));
    return Array.from(this.regions.values());
  }

  private generateLandmarks(count: number): WorldLandmark[] {
    const landmarkTypes: WorldLandmark['type'][] = ['castle', 'temple', 'ruins', 'mountain', 'forest', 'lake', 'monument'];
    const landmarks: WorldLandmark[] = [];

    for (let i = 0; i < count; i++) {
      landmarks.push({
        id: `landmark_${i}`,
        name: `Ancient ${landmarkTypes[i % landmarkTypes.length].charAt(0).toUpperCase() + landmarkTypes[i % landmarkTypes.length].slice(1)}`,
        type: landmarkTypes[i % landmarkTypes.length],
        significance: Math.random() * 10,
        description: `A significant ${landmarkTypes[i % landmarkTypes.length]} with historical importance.`,
        discovered: Math.random() > 0.3
      });
    }

    return landmarks;
  }

  private generateResources(count: number): WorldResource[] {
    const resourceTypes: WorldResource['type'][] = ['gold', 'iron', 'wood', 'grain', 'magic_crystals', 'herbs'];
    const resources: WorldResource[] = [];

    for (let i = 0; i < count; i++) {
      resources.push({
        type: resourceTypes[i % resourceTypes.length],
        abundance: Math.random() * 10,
        quality: Math.random() * 10
      });
    }

    return resources;
  }

  private generateFactions(regions: WorldRegion[]): WorldFaction[] {
    const factions: WorldFaction[] = [];
    const factionTypes: WorldFaction['type'][] = ['kingdom', 'guild', 'cult', 'tribe', 'merchants', 'nobles'];

    regions.filter(r => r.type === 'kingdom').forEach((kingdom, i) => {
      const faction: WorldFaction = {
        id: `faction_${i}`,
        name: `${kingdom.name} ${factionTypes[i % factionTypes.length].charAt(0).toUpperCase() + factionTypes[i % factionTypes.length].slice(1)}`,
        type: factionTypes[i % factionTypes.length],
        leader: `Leader of ${kingdom.name}`,
        home_region: kingdom.id,
        influence: Math.random() * 10,
        reputation: Math.random() * 10 - 5,
        resources: {
          gold: Math.floor(Math.random() * 10000),
          influence: Math.floor(Math.random() * 100)
        },
        relationships: {},
        goals: ['Expand territory', 'Increase wealth', 'Gain political power']
      };

      factions.push(faction);
    });

    factions.forEach(faction => {
      factions.forEach(otherFaction => {
        if (faction.id !== otherFaction.id) {
          faction.relationships[otherFaction.id] = Math.random() * 10 - 5;
        }
      });
      this.factions.set(faction.id, faction);
    });

    return Array.from(this.factions.values());
  }

  private generateInitialHistory(regions: WorldRegion[], factions: WorldFaction[]): HistoricalEvent[] {
    const events: HistoricalEvent[] = [];

    for (let year = 800; year <= this.currentYear; year += 50 + Math.floor(Math.random() * 100)) {
      if (Math.random() > 0.7) {
        const event = this.generateHistoricalEvent(year, regions, factions);
        events.push(event);
        this.applyHistoricalConsequences(event);
      }
    }

    return events;
  }

  private generateHistoricalEvent(year: number, regions: WorldRegion[], factions: WorldFaction[]): HistoricalEvent {
    const eventTypes: HistoricalEvent['type'][] = ['war', 'alliance', 'discovery', 'disaster', 'ascension', 'fall', 'plague', 'famine', 'revolution', 'invasion', 'treaty', 'betrayal'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const numFactions = Math.max(1, Math.min(4, Math.floor(Math.random() * 3) + 1));
    const involvedFactions = factions
      .sort(() => Math.random() - 0.5)
      .slice(0, numFactions);

    const affectedRegions = regions
      .filter(r => involvedFactions.some(f => f.home_region === r.id || r.sub_regions.includes(f.home_region)))
      .map(r => r.id);

    const event: HistoricalEvent = {
      id: `event_${year}_${Math.random().toString(36).substr(2, 9)}`,
      year,
      title: this.generateEventTitle(eventType, involvedFactions),
      description: this.generateEventDescription(eventType, involvedFactions),
      type: eventType,
      regions_affected: affectedRegions,
      factions_involved: involvedFactions.map(f => f.id),
      consequences: this.generateAdvancedConsequences(eventType, involvedFactions, affectedRegions, regions),
      significance: this.calculateEventSignificance(eventType, involvedFactions.length, affectedRegions.length)
    };

    return event;
  }

  private generateEventTitle(type: HistoricalEvent['type'], factions: WorldFaction[]): string {
    const factionName = factions[0]?.name || 'Unknown';
    const secondaryFaction = factions[1]?.name || 'Unknown';

    switch (type) {
      case 'war': return factions.length > 1 ? `${factionName} vs ${secondaryFaction} War` : `${factionName} Conquest`;
      case 'alliance': return `${factionName} Alliance`;
      case 'discovery': return `${factionName} Discovery`;
      case 'disaster': return `${factionName} Disaster`;
      case 'ascension': return `${factionName} Ascension`;
      case 'fall': return `${factionName} Fall`;
      case 'plague': return `The ${factionName} Plague`;
      case 'famine': return `${factionName} Famine`;
      case 'revolution': return `${factionName} Revolution`;
      case 'invasion': return `${factionName} Invasion`;
      case 'treaty': return `${factionName} Treaty`;
      case 'betrayal': return factions.length > 1 ? `${factionName} Betrays ${secondaryFaction}` : `${factionName} Betrayal`;
      default: return `${factionName} Event`;
    }
  }

  private generateEventDescription(type: HistoricalEvent['type'], factions: WorldFaction[]): string {
    const factionName = factions[0]?.name || 'Unknown';
    const secondaryFaction = factions[1]?.name || 'Unknown';

    switch (type) {
      case 'war': return factions.length > 1 ?
        `${factionName} and ${secondaryFaction} clashed in a brutal conflict that lasted for years, with neither side gaining a decisive victory.` :
        `${factionName} waged war against neighboring territories, conquering new lands and expanding their influence.`;
      case 'alliance': return `${factionName} formed a powerful alliance with neighboring factions, creating a bloc that dominated regional politics.`;
      case 'discovery': return `${factionName} made groundbreaking discoveries in ancient ruins, unlocking powerful artifacts and knowledge.`;
      case 'disaster': return `A catastrophic disaster struck ${factionName}, destroying infrastructure and claiming countless lives.`;
      case 'ascension': return `Through cunning diplomacy and military prowess, ${factionName} rose from obscurity to become a major power.`;
      case 'fall': return `${factionName} suffered a dramatic decline due to corruption, military defeats, and economic collapse.`;
      case 'plague': return `A devastating plague swept through ${factionName}'s territories, decimating the population and weakening their society.`;
      case 'famine': return `Severe famine gripped ${factionName}, causing widespread starvation and social unrest.`;
      case 'revolution': return `The people of ${factionName} rose up in revolution, overthrowing the ruling class and establishing a new order.`;
      case 'invasion': return `${factionName} suffered a devastating invasion that destroyed their armies and occupied their lands.`;
      case 'treaty': return `${factionName} negotiated a historic treaty that brought peace and prosperity to the region.`;
      case 'betrayal': return factions.length > 1 ?
        `${factionName} betrayed their longtime ally ${secondaryFaction}, shattering trust and igniting new conflicts.` :
        `${factionName} suffered a catastrophic betrayal from within their own ranks.`;
      default: return `${factionName} experienced a significant historical event that shaped their destiny.`;
    }
  }

  private generateConsequences(type: HistoricalEvent['type'], factions: WorldFaction[], regions: string[]): HistoricalConsequence[] {
    const allRegions = Array.from(this.regions.values());
    return this.generateAdvancedConsequences(type, factions, regions, allRegions);
  }

  private generateAdvancedConsequences(eventType: HistoricalEvent['type'], factions: WorldFaction[], regions: string[], allRegions: WorldRegion[]): HistoricalConsequence[] {
    const consequences: HistoricalConsequence[] = [];

    factions.forEach(faction => {
      const baseChange = Math.random() - 0.5;

      switch (eventType) {
        case 'war':
          consequences.push({
            type: 'faction_change',
            target_id: faction.id,
            property: 'influence',
            old_value: faction.influence,
            new_value: Math.max(0, faction.influence + baseChange * 8)
          });
          consequences.push({
            type: 'faction_change',
            target_id: faction.id,
            property: 'reputation',
            old_value: faction.reputation,
            new_value: Math.max(-5, Math.min(5, faction.reputation + baseChange * 3))
          });
          break;

        case 'alliance':
          consequences.push({
            type: 'faction_change',
            target_id: faction.id,
            property: 'influence',
            old_value: faction.influence,
            new_value: Math.max(0, faction.influence + Math.abs(baseChange) * 3)
          });
          consequences.push({
            type: 'faction_change',
            target_id: faction.id,
            property: 'reputation',
            old_value: faction.reputation,
            new_value: Math.max(-5, Math.min(5, faction.reputation + Math.abs(baseChange) * 2))
          });
          break;

        case 'discovery':
          consequences.push({
            type: 'faction_change',
            target_id: faction.id,
            property: 'resources.gold',
            old_value: faction.resources.gold,
            new_value: faction.resources.gold + Math.floor(Math.random() * 10000)
          });
          consequences.push({
            type: 'faction_change',
            target_id: faction.id,
            property: 'influence',
            old_value: faction.influence,
            new_value: Math.max(0, faction.influence + Math.abs(baseChange) * 4)
          });
          break;

        case 'disaster':
        case 'plague':
        case 'famine':
          const populationRegion = allRegions.find(r => r.id === faction.home_region);
          if (populationRegion) {
            const populationLoss = Math.floor(populationRegion.population * (0.05 + Math.random() * 0.15));
            consequences.push({
              type: 'region_change',
              target_id: faction.home_region,
              property: 'population',
              old_value: populationRegion.population,
              new_value: Math.max(1000, populationRegion.population - populationLoss)
            });
          }
          consequences.push({
            type: 'faction_change',
            target_id: faction.id,
            property: 'influence',
            old_value: faction.influence,
            new_value: Math.max(0, faction.influence - Math.abs(baseChange) * 3)
          });
          break;

        case 'revolution':
          consequences.push({
            type: 'faction_change',
            target_id: faction.id,
            property: 'influence',
            old_value: faction.influence,
            new_value: Math.max(0, faction.influence + baseChange * 6)
          });
          break;

        case 'betrayal':
          consequences.push({
            type: 'faction_change',
            target_id: faction.id,
            property: 'reputation',
            old_value: faction.reputation,
            new_value: Math.max(-5, faction.reputation - Math.abs(baseChange) * 4)
          });
          break;
      }
    });

    // Add regional consequences for certain events
    if (['disaster', 'plague', 'famine', 'invasion'].includes(eventType)) {
      regions.forEach(regionId => {
        const region = allRegions.find(r => r.id === regionId);
        if (region) {
          consequences.push({
            type: 'region_change',
            target_id: regionId,
            property: 'political_stability',
            old_value: region.political_stability,
            new_value: Math.max(0.1, region.political_stability - Math.random() * 0.3)
          });
        }
      });
    }

    return consequences;
  }

  private applyHistoricalConsequences(event: HistoricalEvent): void {
    event.consequences.forEach(consequence => {
      switch (consequence.type) {
        case 'faction_change':
          const faction = this.factions.get(consequence.target_id);
          if (faction) {
            if (consequence.property.includes('.')) {
              const [obj, prop] = consequence.property.split('.');
              if (obj === 'resources') {
                faction.resources[prop] = consequence.new_value;
              }
            } else {
              (faction as any)[consequence.property] = consequence.new_value;
            }
          }
          break;
        case 'region_change':
          const region = this.regions.get(consequence.target_id);
          if (region) {
            (region as any)[consequence.property] = consequence.new_value;
          }
          break;
      }
    });
  }

  getRegion(id: string): WorldRegion | undefined {
    return this.regions.get(id);
  }

  getFaction(id: string): WorldFaction | undefined {
    return this.factions.get(id);
  }

  getAllRegions(): WorldRegion[] {
    return Array.from(this.regions.values());
  }

  getAllFactions(): WorldFaction[] {
    return Array.from(this.factions.values());
  }

  getHistoricalEvents(): HistoricalEvent[] {
    return [...this.historicalEvents];
  }

  simulateYears(years: number): HistoricalEvent[] {
    const newEvents: HistoricalEvent[] = [];

    for (let i = 0; i < years; i++) {
      this.currentYear++;

      if (Math.random() > 0.8) {
        const event = this.generateHistoricalEvent(
          this.currentYear,
          Array.from(this.regions.values()),
          Array.from(this.factions.values())
        );
        newEvents.push(event);
        this.historicalEvents.push(event);
        this.applyHistoricalConsequences(event);
      }
    }

    return newEvents;
  }

  getFactionRelationships(factionId: string): { [factionId: string]: number } {
    const faction = this.factions.get(factionId);
    return faction?.relationships || {};
  }

  getFactionAllies(factionId: string): string[] {
    const relationships = this.getFactionRelationships(factionId);
    return Object.entries(relationships)
      .filter(([_, value]) => value > 3)
      .map(([id, _]) => id);
  }

  getFactionEnemies(factionId: string): string[] {
    const relationships = this.getFactionRelationships(factionId);
    return Object.entries(relationships)
      .filter(([_, value]) => value < -3)
      .map(([id, _]) => id);
  }

  getFactionDiplomacyStatus(factionId1: string, factionId2: string): 'ally' | 'neutral' | 'rival' | 'enemy' | 'unknown' {
    const faction1 = this.factions.get(factionId1);
    const faction2 = this.factions.get(factionId2);

    if (!faction1 || !faction2) return 'unknown';

    const relationship = faction1.relationships[factionId2];
    if (relationship === undefined) return 'unknown';

    if (relationship > 4) return 'ally';
    if (relationship > 1) return 'neutral';
    if (relationship > -2) return 'rival';
    return 'enemy';
  }

  calculateFactionInfluence(factionId: string): number {
    const faction = this.factions.get(factionId);
    if (!faction) return 0;

    let influence = faction.influence;

    // Add influence from allies
    const allies = this.getFactionAllies(factionId);
    allies.forEach(allyId => {
      const ally = this.factions.get(allyId);
      if (ally) influence += ally.influence * 0.3;
    });

    // Subtract influence from enemies
    const enemies = this.getFactionEnemies(factionId);
    enemies.forEach(enemyId => {
      const enemy = this.factions.get(enemyId);
      if (enemy) influence -= enemy.influence * 0.2;
    });

    return Math.max(0, influence);
  }

  getFactionTradeRoutes(factionId: string): { partner: string; volume: number; type: string }[] {
    const faction = this.factions.get(factionId);
    if (!faction) return [];

    const routes: { partner: string; volume: number; type: string }[] = [];

    Object.entries(faction.relationships).forEach(([partnerId, relationship]) => {
      if (relationship > 0) {
        const partner = this.factions.get(partnerId);
        if (partner) {
          const volume = Math.floor((relationship + 5) * 10);
          const types = ['goods', 'resources', 'magic', 'information'];
          const type = types[Math.floor(Math.random() * types.length)];

          routes.push({ partner: partner.name, volume, type });
        }
      }
    });

    return routes;
  }

  getFactionPowerRanking(): { factionId: string; name: string; power: number }[] {
    const rankings = Array.from(this.factions.values()).map(faction => ({
      factionId: faction.id,
      name: faction.name,
      power: this.calculateFactionInfluence(faction.id) + faction.resources.gold * 0.01
    }));

    return rankings.sort((a, b) => b.power - a.power);
  }

  getFactionGoals(factionId: string): string[] {
    const faction = this.factions.get(factionId);
    return faction?.goals || [];
  }

  updateFactionRelationship(factionId1: string, factionId2: string, change: number): boolean {
    const faction1 = this.factions.get(factionId1);
    const faction2 = this.factions.get(factionId2);

    if (!faction1 || !faction2) return false;

    const current = faction1.relationships[factionId2] || 0;
    faction1.relationships[factionId2] = Math.max(-10, Math.min(10, current + change));
    faction2.relationships[factionId1] = faction1.relationships[factionId2];

    return true;
  }

  getFactionNetwork(factionId: string, depth: number = 2): any {
    const faction = this.factions.get(factionId);
    if (!faction) return null;

    const network: any = {
      faction: faction,
      allies: [],
      enemies: [],
      neutrals: []
    };

    if (depth > 0) {
      network.allies = this.getFactionAllies(factionId).map(id => this.getFactionNetwork(id, depth - 1)).filter(Boolean);
      network.enemies = this.getFactionEnemies(factionId).map(id => this.getFactionNetwork(id, depth - 1)).filter(Boolean);

      const allRelationships = Object.keys(faction.relationships);
      const alliesAndEnemies = new Set([...network.allies.map((f: any) => f.faction.id), ...network.enemies.map((f: any) => f.faction.id)]);
      network.neutrals = allRelationships
        .filter(id => !alliesAndEnemies.has(id))
        .map(id => this.factions.get(id))
        .filter(Boolean);
    }

    return network;
  }

  private calculateEventSignificance(eventType: HistoricalEvent['type'], factionCount: number, regionCount: number): number {
    let baseSignificance = 5;

    const typeMultipliers: { [key: string]: number } = {
      'war': 8,
      'alliance': 6,
      'discovery': 7,
      'disaster': 9,
      'plague': 10,
      'revolution': 9,
      'invasion': 8,
      'fall': 7,
      'ascension': 7,
      'treaty': 5,
      'betrayal': 6,
      'famine': 7
    };

    baseSignificance *= typeMultipliers[eventType] || 5;
    baseSignificance *= (1 + (factionCount - 1) * 0.5);
    baseSignificance *= (1 + (regionCount - 1) * 0.3);

    return Math.min(10, Math.max(1, baseSignificance + (Math.random() - 0.5) * 2));
  }

  getRegionResources(regionId: string): WorldResource[] {
    const region = this.regions.get(regionId);
    return region?.resources || [];
  }

  getWorldStats(): {
    totalRegions: number;
    totalFactions: number;
    totalHistoricalEvents: number;
    averageStability: number;
    averageProsperity: number;
  } {
    const regions = Array.from(this.regions.values());
    const factions = Array.from(this.factions.values());

    return {
      totalRegions: regions.length,
      totalFactions: factions.length,
      totalHistoricalEvents: this.historicalEvents.length,
      averageStability: regions.reduce((sum, r) => sum + r.political_stability, 0) / regions.length,
      averageProsperity: regions.reduce((sum, r) => sum + r.economic_prosperity, 0) / regions.length
    };
  }
}