// Grammar Rules Engine
// Defines grammar rules per event type and validates sentence generation

import { SentenceBuilder, SentenceStructure } from './SentenceBuilder';
import { Chance } from 'chance';

export interface GrammarRule {
  eventType: string;
  preferredPatterns: ('svo' | 'sv' | 'svc' | 'passive' | 'imperative')[];
  requiredComponents: {
    subject?: boolean;
    verb?: boolean;
    object?: boolean;
    complement?: boolean;
  };
  verbTense?: 'present' | 'past' | 'future';
  style?: 'formal' | 'casual' | 'dramatic' | 'neutral';
}

export interface EventTypeGrammarConfig {
  [eventType: string]: GrammarRule;
}

export class GrammarRulesEngine {
  private rules: EventTypeGrammarConfig;
  private sentenceBuilder: SentenceBuilder;
  private chance: Chance.Chance;

  constructor(sentenceBuilder: SentenceBuilder, chance?: Chance.Chance) {
    this.sentenceBuilder = sentenceBuilder;
    this.chance = chance || new Chance();
    this.rules = this.initializeDefaultRules();
  }

  /**
   * Initialize default grammar rules for each event type
   */
  private initializeDefaultRules(): EventTypeGrammarConfig {
    return {
      COMBAT: {
        eventType: 'COMBAT',
        preferredPatterns: ['svo', 'sv', 'passive'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'dramatic'
      },
      SOCIAL: {
        eventType: 'SOCIAL',
        preferredPatterns: ['svo', 'svc'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false,
          complement: false
        },
        verbTense: 'present',
        style: 'casual'
      },
      EXPLORATION: {
        eventType: 'EXPLORATION',
        preferredPatterns: ['svo', 'sv'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'neutral'
      },
      ECONOMIC: {
        eventType: 'ECONOMIC',
        preferredPatterns: ['svo', 'svc'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'formal'
      },
      MYSTERY: {
        eventType: 'MYSTERY',
        preferredPatterns: ['svo', 'sv', 'passive'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'dramatic'
      },
      SUPERNATURAL: {
        eventType: 'SUPERNATURAL',
        preferredPatterns: ['svo', 'sv', 'passive'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'dramatic'
      },
      POLITICAL: {
        eventType: 'POLITICAL',
        preferredPatterns: ['svo', 'svc'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'formal'
      },
      TECHNOLOGICAL: {
        eventType: 'TECHNOLOGICAL',
        preferredPatterns: ['svo', 'sv', 'passive'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'neutral'
      },
      MAGIC: {
        eventType: 'MAGIC',
        preferredPatterns: ['svo', 'sv', 'passive'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'dramatic'
      },
      SPELLCASTING: {
        eventType: 'SPELLCASTING',
        preferredPatterns: ['svo', 'sv'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'dramatic'
      },
      MENTORSHIP: {
        eventType: 'MENTORSHIP',
        preferredPatterns: ['svo', 'svc'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'casual'
      },
      FIGHTER: {
        eventType: 'FIGHTER',
        preferredPatterns: ['svo', 'sv'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'dramatic'
      },
      HUMAN: {
        eventType: 'HUMAN',
        preferredPatterns: ['svo', 'svc'],
        requiredComponents: {
          subject: true,
          verb: true,
          object: false
        },
        verbTense: 'present',
        style: 'casual'
      }
    };
  }

  /**
   * Get grammar rule for an event type
   */
  getRule(eventType: string): GrammarRule {
    return this.rules[eventType.toUpperCase()] || this.rules['EXPLORATION'];
  }

  /**
   * Validate a sentence structure against grammar rules
   */
  validateAgainstRules(sentence: string, eventType: string): boolean {
    const rule = this.getRule(eventType);
    
    if (!this.sentenceBuilder.validateStructure(sentence)) {
      return false;
    }
    
    return true;
  }

  /**
   * Suggest a sentence pattern based on event type
   */
  suggestPattern(eventType: string): 'svo' | 'sv' | 'svc' | 'passive' | 'imperative' {
    const rule = this.getRule(eventType);
    return this.chance.pickone(rule.preferredPatterns);
  }

  /**
   * Get style-appropriate modifiers
   */
  getStyleModifiers(eventType: string): {
    adjectives?: string[];
    adverbs?: string[];
  } {
    const rule = this.getRule(eventType);
    
    const styleModifiers: { [key: string]: { adjectives: string[], adverbs: string[] } } = {
      dramatic: {
        adjectives: ['sudden', 'unexpected', 'ominous', 'powerful', 'mysterious', 'intense', 'threatening', 'dangerous'],
        adverbs: ['suddenly', 'unexpectedly', 'dramatically', 'powerfully', 'intensely', 'menacingly']
      },
      casual: {
        adjectives: ['friendly', 'welcoming', 'pleasant', 'interesting', 'notable', 'curious'],
        adverbs: ['casually', 'friendly', 'pleasantly', 'interestingly']
      },
      formal: {
        adjectives: ['significant', 'important', 'notable', 'substantial', 'considerable'],
        adverbs: ['significantly', 'importantly', 'notably', 'substantially']
      },
      neutral: {
        adjectives: ['notable', 'interesting', 'unusual', 'distinct', 'particular'],
        adverbs: ['notably', 'interestingly', 'unusually', 'particularly']
      }
    };
    
    return styleModifiers[rule.style || 'neutral'] || styleModifiers.neutral;
  }

  /**
   * Add custom grammar rule
   */
  addRule(eventType: string, rule: GrammarRule): void {
    this.rules[eventType.toUpperCase()] = rule;
  }

  /**
   * Get all rules
   */
  getAllRules(): EventTypeGrammarConfig {
    return { ...this.rules };
  }
}
