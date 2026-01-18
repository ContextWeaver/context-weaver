// Rule engine types for RPG Event Generator
// Conditional logic and effect systems

export interface RuleCondition {
  type: string;
  params: { [key: string]: any };
}

export interface RuleEffects {
  addTags?: string[];
  modifyTitle?: { append?: string; prepend?: string };
  modifyDescription?: { append?: string; prepend?: string };
  adjustEffects?: { [key: string]: number };
}

export interface RuleDefinition {
  conditions: RuleCondition[];
  effects: RuleEffects;
}