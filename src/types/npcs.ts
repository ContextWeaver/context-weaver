// NPC and relationship types for RPG Event Generator
// Social dynamics and character management

export interface NPC {
  id: string;
  name: string;
  type: string;
  history?: RelationshipEntry[];
  relationships?: Map<string, Relationship>;
  createdAt?: Date;
}

export interface RelationshipEntry {
  change: number;
  reason: string;
  timestamp?: Date;
}

export interface Relationship {
  strength: number;
  type: string;
  history: RelationshipEntry[];
  trust?: number;
  respect?: number;
}