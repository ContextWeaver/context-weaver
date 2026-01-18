// Template system types for RPG Event Generator
// Template definitions and chain management

import { Choice } from './events';

export interface Template {
  id?: string; // Added for caching purposes
  title: string;
  narrative: string;
  choices: Choice[];
  type?: string;
  difficulty?: string;
  tags?: string[];
  context_requirements?: { [key: string]: any };
  // Conditional logic support
  conditions?: TemplateCondition[];
  conditional_choices?: ConditionalChoice[];
  dynamic_fields?: DynamicField[];
  // Composition support
  extends?: string | string[];
  mixins?: string[];
  composition?: TemplateComposition[];
}

export interface TemplateCondition {
  type: 'stat_requirement' | 'item_requirement' | 'relationship_requirement' | 'quest_requirement' | 'custom';
  operator: 'gte' | 'lte' | 'eq' | 'neq' | 'gt' | 'lt' | 'has' | 'not_has' | 'and' | 'or';
  field: string;
  value: any;
  negate?: boolean;
}

export interface ConditionalChoice {
  choice_index: number;
  conditions: TemplateCondition[];
  show_when?: boolean; // true = show when conditions met, false = hide when conditions met
}

export interface DynamicField {
  field: 'title' | 'narrative' | 'choice_text';
  choice_index?: number; // for choice_text field
  conditions: TemplateCondition[];
  value_if_true: string;
  value_if_false?: string;
}

export interface TemplateComposition {
  template_id: string;
  priority?: number;
  merge_strategy?: 'append' | 'prepend' | 'replace' | 'merge';
  field_mappings?: { [sourceField: string]: string };
  conditions?: TemplateCondition[];
}

export interface ChainDefinition {
  name: string;
  description: string;
  stages: ChainStage[];
}

export interface ChainStage {
  day?: number;
  delay?: number;
  template: string;
  triggerNext?: {
    choice?: string;
    automatic?: boolean;
    delay: number;
  };
}

export interface TimeBasedChain {
  name: string;
  description: string;
  stages: ChainStage[];
  currentStage?: number;
  active: boolean;
}