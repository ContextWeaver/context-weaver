// World building and historical simulation types
// Defines structures for regions, factions, and historical events

export interface WorldRegion {
  id: string;
  name: string;
  type: 'continent' | 'kingdom' | 'province' | 'city' | 'village' | 'wilderness';
  parent_region?: string;
  sub_regions: string[];
  landmarks: WorldLandmark[];
  resources: WorldResource[];
  population: number;
  culture: string;
  climate: string;
  political_stability: number;
  economic_prosperity: number;
}

export interface WorldLandmark {
  id: string;
  name: string;
  type: 'castle' | 'temple' | 'ruins' | 'mountain' | 'forest' | 'lake' | 'monument';
  significance: number;
  description: string;
  discovered: boolean;
}

export interface WorldResource {
  type: 'gold' | 'iron' | 'wood' | 'grain' | 'magic_crystals' | 'herbs';
  abundance: number;
  quality: number;
}

export interface WorldFaction {
  id: string;
  name: string;
  type: 'kingdom' | 'guild' | 'cult' | 'tribe' | 'merchants' | 'nobles';
  leader: string;
  home_region: string;
  influence: number;
  reputation: number;
  resources: { [key: string]: number };
  relationships: { [factionId: string]: number };
  goals: string[];
}

export interface HistoricalEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  type: 'war' | 'alliance' | 'discovery' | 'disaster' | 'ascension' | 'fall' | 'plague' | 'famine' | 'revolution' | 'invasion' | 'treaty' | 'betrayal';
  regions_affected: string[];
  factions_involved: string[];
  consequences: HistoricalConsequence[];
  significance: number;
}

export interface HistoricalConsequence {
  type: 'region_change' | 'faction_change' | 'resource_change' | 'relationship_change';
  target_id: string;
  property: string;
  old_value: any;
  new_value: any;
}