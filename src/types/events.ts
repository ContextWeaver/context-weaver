// Event-related types for RPG Event Generator
// Core event, choice, and player context definitions

export interface Effect {
  [key: string]: number | [number, number] | boolean | string;
}

export interface Choice {
  text: string;
  effect: Effect;
  consequence?: string;
  requirements?: { [key: string]: number };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
  type: string;
  context: PlayerContext;
  difficulty?: string;
  tags?: string[];
  chainId?: string;
  timeInfo?: TimeInfo;
  playerContext?: any;
  environment?: any;
}

export interface PlayerContext {
  age?: number;
  gold?: number;
  influence?: number;
  wealth?: number;
  skills?: { [key: string]: number };
  level?: number;
  reputation?: number;
  power_level?: number;
  career?: string;
  health?: number;
  tags?: string[];
  relationships?: any;
  location?: any;
  season?: any;
  stress?: number;
  happiness?: number;
  karma?: number;
  faith?: number;
  vices?: any;
  secrets?: any;
  ambitions?: any;
  social_standing?: any;
  life_experience?: any;
  knowledge?: any;
  [key: string]: any;
}

export interface TimeInfo {
  season: string;
  day: number;
  year?: number;
}

export interface GameState {
  timeSystem: TimeSystem;
  activeChains: Map<string, any>;
  completedEvents: Set<string>;
  player: PlayerContext;
  gameState?: any;
}

export interface TimeSystem {
  currentDay: number;
  currentSeason: string;
  gameYear: number;
  timeBasedEvents: Map<string, any>;
}

// Event dependency types
export interface EventDependency {
  type: string;
  eventId?: string;
  stat?: string;
  min?: number;
  operator?: 'AND' | 'OR';
  conditions?: EventDependency[];
}

// Context analysis types
export interface AnalyzedContext extends PlayerContext {
  powerLevel: number;
  wealthTier: 'poor' | 'moderate' | 'wealthy' | 'rich';
  influenceTier: 'low' | 'medium' | 'high' | 'elite';
  skillProfile: {
    combat: number;
    social: number;
    magic: number;
    technical: number;
  };
  lifeStage: 'youth' | 'adult' | 'experienced' | 'elder';
  careerPath: string;
  personality: {
    riskTolerance: number;
    socialPreference: number;
    ambitionLevel: number;
  };
}