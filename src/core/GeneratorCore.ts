// RPG Event Generator v3.0.0 - Core Generator
// Main event generation logic combining all components

import { Chance } from 'chance';
import { Event, PlayerContext, Choice, Effect, AnalyzedContext } from '../types';
import { IGeneratorCore } from '../interfaces';
import { MarkovEngine } from './MarkovEngine';
import { ContextAnalyzer } from './ContextAnalyzer';
import { SentenceBuilder } from './SentenceBuilder';
import { GrammarRulesEngine } from './GrammarRulesEngine';
import { DescriptionFragmentLibrary } from './DescriptionFragmentLibrary';
import { DIFFICULTY_SETTINGS, DEFAULT_CONTEXT, TIME_CONSTANTS } from '../utils';

let nlp: any;
try {
  nlp = require('compromise');
} catch (e) {
  nlp = null;
}

let natural: any;
try {
  natural = require('natural');
} catch (e) {
  natural = null;
}

export interface GeneratorOptions {
  chance?: Chance.Chance;
  stateSize?: number;
  trainingData?: string[];
  theme?: string | null;
  culture?: string | null;
  enableTemplates?: boolean;
  templateLibrary?: string | null;
  enableDependencies?: boolean;
  enableModifiers?: boolean;
  enableRelationships?: boolean;
  language?: string;
  pureMarkovMode?: boolean;
  enableRuleEngine?: boolean;
  customRules?: { [key: string]: any };
  debug?: boolean;
}

export class GeneratorCore implements IGeneratorCore {
  private chance: Chance.Chance;
  private markovEngine: MarkovEngine;
  private contextAnalyzer: ContextAnalyzer;
  private sentenceBuilder: SentenceBuilder;
  private grammarRulesEngine: GrammarRulesEngine;
  private fragmentLibrary: DescriptionFragmentLibrary;
  private options: GeneratorOptions;
  private useSentenceBuilder: boolean;

  constructor(options: GeneratorOptions = {}) {
    this.options = options;
    this.chance = options.chance || new Chance();
    this.markovEngine = new MarkovEngine({ stateSize: options.stateSize });
    this.contextAnalyzer = new ContextAnalyzer();
    
    this.sentenceBuilder = new SentenceBuilder(this.chance);
    this.grammarRulesEngine = new GrammarRulesEngine(this.sentenceBuilder, this.chance);
    this.fragmentLibrary = new DescriptionFragmentLibrary(this.chance);
    
    this.useSentenceBuilder = options.enableRuleEngine !== false;

    if (options.trainingData) {
      this.markovEngine.addData(options.trainingData);
    }
  }

  /**
   * Generate a complete event
   */
  generateEvent(playerContext: PlayerContext = {}): Event {
    const analyzedContext = this.contextAnalyzer.analyzeContext(playerContext);
    const contextModifiers = this.contextAnalyzer.getContextModifiers(analyzedContext);

    const id = this.generateEventId();
    const type = this.selectEventType(analyzedContext, contextModifiers.eventTypePreferences);
    const difficulty = this.calculateDifficulty(analyzedContext, contextModifiers.difficultyModifier);
    
    const generationContext = {
      type,
      analyzedContext,
      contextModifiers,
      difficulty
    };
    
    let title = this.generateTitle(type, analyzedContext, generationContext);
    let description = this.generateDescription(title, type, analyzedContext, generationContext);
    
    let coherenceAttempts = 0;
    const maxCoherenceAttempts = 3;
    while (!this.validateCoherence(title, description, type) && coherenceAttempts < maxCoherenceAttempts) {
      title = this.generateTitle(type, analyzedContext, generationContext);
      description = this.generateDescription(title, type, analyzedContext, generationContext);
      coherenceAttempts++;
    }
    
    const choices = this.generateChoices(type, difficulty, analyzedContext, contextModifiers.rewardModifier);

    return {
      id,
      title,
      description,
      choices,
      type,
      context: playerContext,
      difficulty,
      tags: this.generateTags(type, analyzedContext)
    };
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

  addTrainingData(texts: string[], theme?: string): void {
    this.markovEngine.addData(texts, theme);
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Select appropriate event type based on context
   */
  private selectEventType(
    context: AnalyzedContext,
    preferences: string[]
  ): string {
    const baseTypes = [
      'COMBAT', 'SOCIAL', 'EXPLORATION', 'ECONOMIC',
      'MYSTERY', 'SUPERNATURAL', 'POLITICAL', 'TECHNOLOGICAL'
    ];

    let typePool = [...baseTypes];
    if (preferences.length > 0) {
      typePool = [...preferences, ...baseTypes];
    }

    return this.chance.pickone(typePool);
  }

  /**
   * Calculate event difficulty
   */
  private calculateDifficulty(
    context: AnalyzedContext,
    modifier: number = 0
  ): string {
    const powerLevel = context.powerLevel + modifier;

    if (powerLevel <= DIFFICULTY_SETTINGS.easy.powerRange[1]) return 'easy';
    if (powerLevel <= DIFFICULTY_SETTINGS.normal.powerRange[1]) return 'normal';
    if (powerLevel <= DIFFICULTY_SETTINGS.hard.powerRange[1]) return 'hard';
    return 'legendary';
  }

  /**
   * Generate event title with context awareness
   */
  private generateTitle(
    type: string, 
    context: AnalyzedContext,
    generationContext?: any
  ): string {
    const customProps = Object.keys(context).filter(k => 
      !['age', 'gold', 'influence', 'wealth', 'skills', 'level', 'reputation', 'power_level', 
        'career', 'health', 'tags', 'relationships', 'location', 'season', 'stress', 'happiness', 
        'karma', 'faith', 'vices', 'secrets', 'ambitions', 'social_standing', 'life_experience', 
        'knowledge', 'powerLevel', 'wealthTier', 'influenceTier', 'skillProfile', 'lifeStage', 
        'careerPath', 'personality'].includes(k)
    );

    const markovStats = this.markovEngine.getStats();
    let adjective: string;
    let noun: string;

    if (markovStats.totalTransitions > 0) {
      const markovResult = this.markovEngine.generateContextual(
        { powerLevel: context.powerLevel, complexity: 5 },
        generationContext?.theme
      );
      
      const words = markovResult.string.split(/\s+/).filter(w => w.length > 3);
      if (words.length >= 2) {
        noun = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        adjective = words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase();
      } else if (words.length === 1) {
        noun = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        adjective = this.generateMeaningfulAdjective(context);
      } else {
        adjective = this.generateMeaningfulAdjective(context);
        noun = this.generateMeaningfulNoun(type, context);
      }
    } else {
      adjective = this.generateMeaningfulAdjective(context);
      noun = this.generateMeaningfulNoun(type, context);
    }

    let title = `${adjective} ${noun}`;

    if (customProps.length > 0 && this.chance.bool({ likelihood: 20 })) {
      const randomProp = this.chance.pickone(customProps);
      const propValue = context[randomProp];
      if (typeof propValue === 'string' && propValue.length > 0 && propValue.length < 10 && propValue.split(/\s+/).length === 1 && !propValue.includes(' ')) {
        title = `${adjective} ${propValue.charAt(0).toUpperCase() + propValue.slice(1)} ${noun}`;
      } else if (typeof propValue === 'number' && propValue > 0 && propValue < 1000 && this.chance.bool({ likelihood: 10 })) {
        title = `${adjective} ${noun} of ${propValue}`;
      }
    }

    const titleWords = title.split(/\s+/);
    if (titleWords.length <= 3 && this.chance.bool({ likelihood: 25 })) {
      const locationWords = ['Shadows', 'Darkness', 'Light', 'Fate', 'Destiny', 'Honor', 'Glory', 'Doom', 'Hope', 'Despair'];
      const suffixTemplates = [
        ` in the ${this.chance.pickone(locationWords)}`,
        ` of ${this.chance.pickone(locationWords)}`,
        ` ${this.chance.pickone(['Revealed', 'Awakened', 'Unleashed', 'Rising', 'Lost', 'Found', 'Hidden', 'Forgotten'])}`
      ];
      title += this.chance.pickone(suffixTemplates);
    }

    const finalTitleWords = title.split(/\s+/);
    if (finalTitleWords.length > 4) {
      title = `${adjective} ${noun}`;
      if (this.chance.bool({ likelihood: 30 })) {
        title += ` ${this.chance.pickone(['Revealed', 'Awakened', 'Unleashed', 'Rising', 'Lost', 'Found', 'Hidden'])}`;
      }
    }

    return title;
  }

  private generateMeaningfulAdjective(context: AnalyzedContext): string {
    const baseAdjectives = [
      'Unexpected', 'Mysterious', 'Dangerous', 'Lucrative', 'Critical', 'Extraordinary',
      'Strange', 'Perilous', 'Profitable', 'Urgent', 'Remarkable', 'Unusual',
      'Fascinating', 'Troublesome', 'Rewarding', 'Important', 'Notable', 'Rare',
      'Intriguing', 'Hazardous', 'Valuable', 'Significant', 'Exceptional', 'Unique',
      'Compelling', 'Risky', 'Beneficial', 'Crucial', 'Memorable', 'Uncommon',
      'Forgotten', 'Hidden', 'Ancient', 'Legendary', 'Powerful', 'Mystical',
      'Eerie', 'Enigmatic', 'Formidable', 'Glorious', 'Haunting', 'Immense',
      'Jarring', 'Keen', 'Luminous', 'Majestic', 'Noble', 'Ominous',
      'Pristine', 'Quiet', 'Radiant', 'Savage', 'Terrifying', 'Unfathomable',
      'Vicious', 'Wondrous', 'Xenial', 'Yearning', 'Zealous', 'Abandoned',
      'Bewildering', 'Cunning', 'Dreadful', 'Elegant', 'Fierce', 'Grim',
      'Harmonious', 'Incredible', 'Jubilant', 'Knightly', 'Lethal', 'Magnificent',
      'Nefarious', 'Obedient', 'Peculiar', 'Quixotic', 'Ruthless', 'Serene',
      'Titanic', 'Unbreakable', 'Vengeful', 'Wicked', 'Xenophobic', 'Yielding',
      'Zealous', 'Abysmal', 'Brilliant', 'Cursed', 'Divine', 'Eternal',
      'Furious', 'Glorious', 'Hollow', 'Infinite', 'Jaded', 'Kingly',
      'Lonely', 'Mighty', 'Noble', 'Oracular', 'Proud', 'Quiet',
      'Raging', 'Sacred', 'Tainted', 'Unholy', 'Vast', 'Wise',
      'Xeric', 'Youthful', 'Zany', 'Awe-inspiring', 'Breathtaking', 'Captivating',
      'Daunting', 'Enthralling', 'Formidable', 'Gripping', 'Hypnotic', 'Intense',
      'Jaw-dropping', 'Kaleidoscopic', 'Lavish', 'Mesmerizing', 'Numinous', 'Overwhelming',
      'Phenomenal', 'Quaking', 'Riveting', 'Stunning', 'Transcendent', 'Unforgettable',
      'Vibrant', 'Whimsical', 'Xenodochial', 'Yearning', 'Zestful'
    ];

    let adjectives = [...baseAdjectives];

    if (context.wealthTier === 'poor') {
      adjectives.push('Desperate', 'Urgent', 'Dire', 'Critical', 'Necessary', 'Destitute', 'Impoverished', 'Beggared', 'Penniless', 'Needy');
    } else if (context.wealthTier === 'rich') {
      adjectives.push('Luxurious', 'Exclusive', 'Prestigious', 'Elite', 'Opulent', 'Refined', 'Affluent', 'Prosperous', 'Wealthy', 'Sumptuous');
    }
    
    if (context.lifeStage === 'elder') {
      adjectives.push('Ancient', 'Forgotten', 'Legendary', 'Timeless', 'Historic', 'Venerable', 'Aged', 'Hoary', 'Antiquated', 'Timeworn');
    } else if (context.lifeStage === 'youth') {
      adjectives.push('New', 'Fresh', 'Bold', 'Energetic', 'Vibrant', 'Dynamic', 'Youthful', 'Spirited', 'Vigorous', 'Brisk');
    }

    return this.chance.pickone(adjectives);
  }

  private generateMeaningfulNoun(type: string, context: AnalyzedContext): string {
    const typeNouns: { [key: string]: string[] } = {
      COMBAT: [
        'Battle', 'Confrontation', 'Clash', 'Skirmish', 'Duel', 'Fight', 'War', 'Conflict', 'Struggle', 'Showdown',
        'Combat', 'Engagement', 'Encounter', 'Assault', 'Attack', 'Charge', 'Offensive', 'Defense', 'Siege', 'Raid',
        'Ambush', 'Melee', 'Brawl', 'Scuffle', 'Tussle', 'Fray', 'Hostility', 'Aggression', 'Violence', 'Carnage',
        'Massacre', 'Slaughter', 'Bloodshed', 'Conquest', 'Victory', 'Defeat', 'Retreat', 'Standoff', 'Truce', 'Armistice'
      ],
      SOCIAL: [
        'Gathering', 'Meeting', 'Encounter', 'Assembly', 'Convention', 'Summit', 'Reunion', 'Festival', 'Celebration', 'Reception',
        'Party', 'Soiree', 'Banquet', 'Feast', 'Gala', 'Ball', 'Masquerade', 'Revelry', 'Merrymaking', 'Festivity',
        'Conference', 'Symposium', 'Forum', 'Debate', 'Discussion', 'Dialogue', 'Conversation', 'Exchange', 'Interaction', 'Connection',
        'Alliance', 'Partnership', 'Friendship', 'Companionship', 'Camaraderie', 'Fellowship', 'Brotherhood', 'Sisterhood', 'Community', 'Society'
      ],
      EXPLORATION: [
        'Discovery', 'Journey', 'Expedition', 'Exploration', 'Voyage', 'Quest', 'Adventure', 'Pilgrimage', 'Odyssey', 'Trek',
        'Travel', 'Wander', 'Roam', 'Roaming', 'Roaming', 'Venture', 'Excursion', 'Tour', 'Trip', 'Passage',
        'Trail', 'Path', 'Route', 'Course', 'Way', 'Track', 'Road', 'Highway', 'Pathway', 'Passageway',
        'Expedition', 'Mission', 'Crusade', 'Campaign', 'Venture', 'Enterprise', 'Undertaking', 'Pursuit', 'Search', 'Hunt'
      ],
      ECONOMIC: [
        'Opportunity', 'Transaction', 'Deal', 'Exchange', 'Trade', 'Negotiation', 'Bargain', 'Contract', 'Agreement', 'Partnership',
        'Business', 'Commerce', 'Market', 'Bazaar', 'Auction', 'Sale', 'Purchase', 'Acquisition', 'Investment', 'Venture',
        'Enterprise', 'Company', 'Corporation', 'Firm', 'Establishment', 'Operation', 'Industry', 'Commerce', 'Trade', 'Business',
        'Wealth', 'Fortune', 'Treasure', 'Riches', 'Assets', 'Resources', 'Capital', 'Funds', 'Finance', 'Economy'
      ],
      MYSTERY: [
        'Mystery', 'Enigma', 'Puzzle', 'Riddle', 'Secret', 'Conundrum', 'Intrigue', 'Case', 'Investigation', 'Inquiry',
        'Puzzle', 'Problem', 'Question', 'Dilemma', 'Paradox', 'Contradiction', 'Anomaly', 'Aberration', 'Oddity', 'Curiosity',
        'Secret', 'Confidentiality', 'Privacy', 'Secrecy', 'Covert', 'Hidden', 'Concealed', 'Obscured', 'Veiled', 'Shrouded',
        'Investigation', 'Examination', 'Inspection', 'Analysis', 'Study', 'Research', 'Probe', 'Inquiry', 'Search', 'Hunt'
      ],
      SUPERNATURAL: [
        'Phenomenon', 'Manifestation', 'Vision', 'Curse', 'Omen', 'Prophecy', 'Miracle', 'Portent', 'Sign', 'Revelation',
        'Apparition', 'Specter', 'Phantom', 'Ghost', 'Spirit', 'Wraith', 'Phantasm', 'Shade', 'Shadow', 'Presence',
        'Magic', 'Sorcery', 'Witchcraft', 'Wizardry', 'Enchantment', 'Spell', 'Charm', 'Hex', 'Incantation', 'Ritual',
        'Divination', 'Prophecy', 'Prediction', 'Foretelling', 'Augury', 'Omen', 'Portent', 'Sign', 'Harbinger', 'Herald'
      ],
      POLITICAL: [
        'Affair', 'Intrigue', 'Scheme', 'Conspiracy', 'Plot', 'Alliance', 'Treaty', 'Summit', 'Crisis', 'Scandal',
        'Diplomacy', 'Negotiation', 'Mediation', 'Arbitration', 'Conciliation', 'Reconciliation', 'Settlement', 'Accord', 'Pact', 'Compact',
        'Government', 'Administration', 'Regime', 'Authority', 'Power', 'Rule', 'Governance', 'Leadership', 'Command', 'Control',
        'Election', 'Campaign', 'Vote', 'Ballot', 'Poll', 'Referendum', 'Plebiscite', 'Selection', 'Choice', 'Decision'
      ],
      TECHNOLOGICAL: [
        'Innovation', 'Malfunction', 'Breakthrough', 'System', 'Device', 'Invention', 'Machine', 'Apparatus', 'Contraption', 'Mechanism',
        'Technology', 'Gadget', 'Tool', 'Instrument', 'Implement', 'Appliance', 'Equipment', 'Hardware', 'Software', 'Firmware',
        'Automation', 'Mechanization', 'Computerization', 'Digitization', 'Modernization', 'Upgrade', 'Enhancement', 'Improvement', 'Advancement', 'Progress',
        'Engine', 'Motor', 'Generator', 'Transformer', 'Converter', 'Processor', 'Controller', 'Regulator', 'Modulator', 'Amplifier'
      ],
      MAGIC: [
        'Spell', 'Ritual', 'Enchantment', 'Conjuration', 'Incantation', 'Sorcery', 'Wizardry', 'Arcana', 'Mysticism', 'Thaumaturgy',
        'Magic', 'Magick', 'Witchcraft', 'Necromancy', 'Alchemy', 'Divination', 'Summoning', 'Invocation', 'Evocation', 'Conjuring',
        'Enchantment', 'Charm', 'Hex', 'Curse', 'Blessing', 'Benediction', 'Invocation', 'Prayer', 'Supplication', 'Appeal',
        'Artifact', 'Relic', 'Talisman', 'Amulet', 'Charm', 'Trinket', 'Bauble', 'Ornament', 'Jewel', 'Gem'
      ],
      SPELLCASTING: [
        'Casting', 'Invocation', 'Evocation', 'Summoning', 'Channeling', 'Weaving', 'Manipulation', 'Control', 'Mastery', 'Art',
        'Magic', 'Sorcery', 'Wizardry', 'Witchcraft', 'Necromancy', 'Alchemy', 'Enchantment', 'Conjuration', 'Incantation', 'Ritual',
        'Power', 'Energy', 'Force', 'Mana', 'Essence', 'Aura', 'Aether', 'Ether', 'Quintessence', 'Spirit',
        'Technique', 'Method', 'Practice', 'Discipline', 'School', 'Tradition', 'Path', 'Way', 'Style', 'Form'
      ]
    };

    let nouns = typeNouns[type] || [
      'Occurrence', 'Situation', 'Happening', 'Incident', 'Affair',
      'Episode', 'Experience', 'Encounter', 'Circumstance', 'Condition', 'State',
      'Matter', 'Issue', 'Case', 'Subject', 'Topic', 'Theme', 'Motif', 'Element',
      'Challenge', 'Opportunity', 'Quest', 'Mission', 'Task', 'Venture'
    ];

    const customProps = Object.keys(context).filter(k => 
      !['age', 'gold', 'influence', 'wealth', 'skills', 'level', 'reputation', 'power_level', 
        'career', 'health', 'tags', 'relationships', 'location', 'season', 'stress', 'happiness', 
        'karma', 'faith', 'vices', 'secrets', 'ambitions', 'social_standing', 'life_experience', 
        'knowledge', 'powerLevel', 'wealthTier', 'influenceTier', 'skillProfile', 'lifeStage', 
        'careerPath', 'personality'].includes(k)
    );

    if (customProps.length > 0 && this.chance.bool({ likelihood: 30 })) {
      const randomProp = this.chance.pickone(customProps);
      const propValue = context[randomProp];
      if (typeof propValue === 'string' && propValue.length > 0 && propValue.length < 15) {
        nouns.push(propValue.charAt(0).toUpperCase() + propValue.slice(1));
      }
    }

    return this.chance.pickone(nouns);
  }

  /**
   * Categorize noun by semantic type
   */
  private categorizeNoun(noun: string): 'physical' | 'abstract' | 'event' | 'place' {
    const nounLower = noun.toLowerCase();
    
    const abstractNouns = new Set([
      'rule', 'law', 'principle', 'concept', 'idea', 'notion', 'theory', 'philosophy',
      'situation', 'circumstance', 'condition', 'state', 'matter', 'issue', 'case',
      'subject', 'topic', 'theme', 'motif', 'element', 'aspect', 'factor',
      'challenge', 'opportunity', 'quest', 'mission', 'task', 'venture', 'endeavor',
      'occurrence', 'happening', 'incident', 'affair', 'episode', 'experience',
      'encounter', 'event', 'phenomenon', 'development', 'change', 'shift',
      'method', 'technique', 'practice', 'discipline', 'way', 'path', 'approach',
      'commerce', 'trade', 'business', 'deal', 'transaction', 'agreement',
      'leadership', 'conspiracy', 'alliance', 'pact', 'treaty', 'accord'
    ]);
    
    const eventNouns = new Set([
      'melee', 'battle', 'combat', 'fight', 'conflict', 'skirmish', 'clash',
      'conquest', 'invasion', 'siege', 'raid', 'assault', 'attack',
      'celebration', 'festival', 'feast', 'gala', 'party', 'gathering',
      'ceremony', 'ritual', 'rite', 'tradition', 'custom',
      'crusade', 'campaign', 'expedition', 'journey', 'voyage', 'adventure'
    ]);
    
    const placeNouns = new Set([
      'tower', 'castle', 'fortress', 'keep', 'stronghold',
      'forest', 'woods', 'grove', 'clearing',
      'city', 'town', 'village', 'settlement',
      'temple', 'shrine', 'sanctuary', 'cathedral',
      'cave', 'cavern', 'tunnel', 'passage',
      'market', 'bazaar', 'square', 'plaza'
    ]);
    
    if (abstractNouns.has(nounLower)) return 'abstract';
    if (eventNouns.has(nounLower)) return 'event';
    if (placeNouns.has(nounLower)) return 'place';
    return 'physical';
  }

  /**
   * Generate event description - SIMPLIFIED VERSION
   * Just use the title with simple, safe templates
   */
  private generateDescription(
    title: string,
    type: string,
    context: AnalyzedContext,
    generationContext?: any
  ): string {
    const titleLower = title.toLowerCase();
    const firstWord = title.split(/\s+/)[0].toLowerCase();
    const article = this.getArticle(firstWord);
    
    const safeTemplates = [
      `${title} requires your attention.`,
      `You encounter ${article} ${titleLower} that requires your attention.`,
      `${title} presents itself before you.`,
      `You face ${article} ${titleLower} that needs your response.`,
      `${title} demands your attention.`
    ];
    
    let description = this.chance.pickone(safeTemplates);
    
    const titleWords = title.split(/\s+/);
    const lastWord = titleWords[titleWords.length - 1];
    const noun = lastWord || titleWords[0];
    
    description = this.addContextualDetails(description, context, type, noun);
    
    return description;
  }

  /**
   * Generate description using SentenceBuilder system
   */
  private generateWithSentenceBuilder(
    noun: string,
    adjective: string,
    type: string,
    context: AnalyzedContext
  ): string {
    const rule = this.grammarRulesEngine.getRule(type);
    const pattern = this.grammarRulesEngine.suggestPattern(type);
    const styleModifiers = this.grammarRulesEngine.getStyleModifiers(type);
    
    const actionThat = this.getActionForType(type, 'that');
    const actionSubject = this.getActionForType(type, 'subject');
    
    let description = '';
    
    if (this.chance.bool({ likelihood: 40 })) {
      const fragmentDescription = this.fragmentLibrary.combineFragments(
        noun,
        adjective,
        type,
        {
          useOpening: true,
          useMiddle: this.chance.bool({ likelihood: 60 }),
          useClosing: this.chance.bool({ likelihood: 70 })
        }
      );
      if (fragmentDescription) {
        description = fragmentDescription;
      }
    }
    
    if (!description) {
      switch (pattern) {
        case 'svo':
          const objectPhrases = [
            'your path',
            'your attention',
            'a response',
            'your decision',
            'your action'
          ];
          const objectPhrase = this.chance.pickone(objectPhrases);
          description = this.sentenceBuilder.buildSVO(
            `${adjective.toLowerCase()} ${noun.toLowerCase()}`,
            actionSubject.split(' ')[0],
            objectPhrase,
            {
              adjective: this.chance.pickone(styleModifiers.adjectives || []),
              adverb: this.chance.pickone(styleModifiers.adverbs || [])
            }
          );
          break;
          
        case 'sv':
          description = this.sentenceBuilder.buildSV(
            `the ${adjective.toLowerCase()} ${noun.toLowerCase()}`,
            actionSubject.split(' ')[0],
            {
              complement: this.chance.pickone([
                'and requires your attention',
                'demanding a response',
                'needing your decision'
              ]),
              adjective: this.chance.pickone(styleModifiers.adjectives || []),
              adverb: this.chance.pickone(styleModifiers.adverbs || [])
            }
          );
          break;
          
        case 'svc':
          description = this.sentenceBuilder.buildSVC(
            `the ${adjective.toLowerCase()} ${noun.toLowerCase()}`,
            actionSubject.split(' ')[0],
            this.chance.pickone([
              'a challenge',
              'an opportunity',
              'a situation',
              'a dilemma'
            ]),
            {
              adjective: this.chance.pickone(styleModifiers.adjectives || []),
              adverb: this.chance.pickone(styleModifiers.adverbs || [])
            }
          );
          break;
          
        case 'passive':
          const passiveVerbs = ['confronted', 'challenged', 'threatened', 'presented', 'offered'];
          description = this.sentenceBuilder.buildFromStructure({
            pattern: 'passive',
            components: {
              object: `${adjective.toLowerCase()} ${noun.toLowerCase()}`,
              verb: this.chance.pickone(passiveVerbs),
              complement: 'by this situation'
            },
            modifiers: styleModifiers
          });
          break;
          
        default:
          description = this.fragmentLibrary.combineFragments(noun, adjective, type);
      }
    }
    
    if (this.chance.bool({ likelihood: 30 })) {
      const closingFragment = this.fragmentLibrary.getFragment(type, 'closing');
      if (closingFragment) {
        description = this.sentenceBuilder.combineClauses(
          description.replace(/\.$/, ''),
          closingFragment.text.replace(/\.$/, ''),
          this.chance.pickone(['and', 'but', 'while'])
        );
      }
    }
    
    return description;
  }

  private extractNounFromTitle(titleWords: string[], type?: string): string {
    const titleText = titleWords.join(' ');
    
    const genericNouns = new Set(['happening', 'occurrence', 'event', 'thing', 'stuff', 'matter', 'issue', 'case', 'situation', 'circumstance']);
    
    if (nlp) {
      try {
        const doc = nlp(titleText);
        const nouns = doc.nouns().out('array');
        
        if (nouns.length > 0) {
          const typeNounWhitelists = this.getTypeNounWhitelists();
          const whitelist = type && typeNounWhitelists[type] ? typeNounWhitelists[type] : [];
          
          for (const noun of nouns) {
            const nounLower = noun.toLowerCase();
            
            if (genericNouns.has(nounLower) && whitelist.length > 0) {
              continue;
            }
            
            if (whitelist.length > 0) {
              const matchesWhitelist = whitelist.some(wlNoun => 
                nounLower === wlNoun || nounLower.includes(wlNoun) || wlNoun.includes(nounLower)
              );
              if (matchesWhitelist) {
                return noun.charAt(0).toUpperCase() + noun.slice(1);
              }
            }
            
            if (noun.length >= 4 && !genericNouns.has(nounLower)) {
              return noun.charAt(0).toUpperCase() + noun.slice(1);
            }
          }
          
          for (const noun of nouns) {
            const nounLower = noun.toLowerCase();
            if (!genericNouns.has(nounLower) && noun.length >= 3) {
              return noun.charAt(0).toUpperCase() + noun.slice(1);
            }
          }
        }
      } catch (e) {
      }
    }

    const skipWords = new Set([
      'in', 'the', 'of', 'a', 'an', 'and', 'or', 'but', 'with', 'from', 'to', 'for',
      'beyond', 'revealed', 'awakened', 'unleashed', 'rising', 'falling', 'eternal',
      'lost', 'found', 'hidden', 'forbidden', 'sacred', 'cursed', 'blessed', 'ancient',
      'new', 'old', 'dark', 'light', 'shadow', 'flame', 'storm', 'wind', 'earth',
      'sea', 'sky', 'star', 'moon', 'sun', 'dawn', 'dusk', 'night', 'day',
      'winter', 'spring', 'summer', 'autumn', 'your', 'you', 'this', 'that', 'these', 'those',
      'directs', 'seeking', 'demanding', 'requiring', 'blocking', 'offering', 'creating', 'presenting'
    ]);

    const verbEndings = ['ed', 'ing', 'es', 's'];
    const adjectiveEndings = ['ful', 'less', 'ous', 'ive', 'ic', 'al', 'y'];
    
    const typeNounWhitelists = this.getTypeNounWhitelists();
    const whitelist = type && typeNounWhitelists[type] ? typeNounWhitelists[type] : [];
    
    for (let i = titleWords.length - 1; i >= 0; i--) {
      const word = titleWords[i];
      const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, '');
      
      if (skipWords.has(wordLower) || wordLower.length < 3) {
        continue;
      }

      const isLikelyVerb = verbEndings.some(ending => wordLower.endsWith(ending)) && wordLower.length > 5;
      const isLikelyAdjective = adjectiveEndings.some(ending => wordLower.endsWith(ending));
      
      if (isLikelyVerb && !isLikelyAdjective) {
        continue;
      }

      if (whitelist.length > 0) {
        const matchesWhitelist = whitelist.some(noun => 
          wordLower === noun || wordLower.includes(noun) || noun.includes(wordLower)
        );
        if (matchesWhitelist) {
          return word.replace(/[.,!?;:]/g, '');
        }
      }

      if (wordLower.length >= 4 && !isLikelyVerb && !genericNouns.has(wordLower)) {
        return word.replace(/[.,!?;:]/g, '');
      }
    }

    const ofIndex = titleWords.findIndex(w => w.toLowerCase() === 'of');
    if (ofIndex > 0 && ofIndex < titleWords.length - 1) {
      const beforeOf = titleWords[ofIndex - 1].toLowerCase().replace(/[.,!?;:]/g, '');
      if (beforeOf.length >= 4 && !skipWords.has(beforeOf) && !genericNouns.has(beforeOf)) {
        return titleWords[ofIndex - 1].replace(/[.,!?;:]/g, '');
      }
    }
    
    for (let i = titleWords.length - 1; i >= 0; i--) {
      const word = titleWords[i];
      const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, '');
      if (wordLower.length >= 4 && !skipWords.has(wordLower) && !genericNouns.has(wordLower)) {
        const nextWord = i > 0 ? titleWords[i - 1].toLowerCase() : '';
        if (nextWord !== 'of') {
          return word.replace(/[.,!?;:]/g, '');
        }
      }
    }

    const fallbackNouns = ['encounter', 'situation', 'circumstance', 'development', 'incident', 'affair', 'challenge', 'opportunity'];
    const selectedNoun = type && typeNounWhitelists[type] && typeNounWhitelists[type].length > 0
      ? typeNounWhitelists[type][0]
      : this.chance.pickone(fallbackNouns);
    return selectedNoun.charAt(0).toUpperCase() + selectedNoun.slice(1);
  }

  private getTypeNounWhitelists(): { [key: string]: string[] } {
    return {
      COMBAT: ['battle', 'confrontation', 'clash', 'skirmish', 'duel', 'fight', 'war', 'conflict', 'struggle', 'showdown', 'combat', 'engagement', 'encounter', 'assault', 'attack', 'charge', 'offensive', 'defense', 'siege', 'raid', 'ambush', 'melee', 'brawl', 'scuffle', 'tussle', 'fray', 'hostility', 'aggression', 'violence', 'carnage', 'massacre', 'slaughter', 'bloodshed', 'conquest', 'victory', 'defeat', 'retreat', 'standoff', 'truce', 'armistice'],
      SOCIAL: ['gathering', 'meeting', 'encounter', 'assembly', 'convention', 'summit', 'reunion', 'festival', 'celebration', 'reception', 'party', 'soiree', 'banquet', 'feast', 'gala', 'ball', 'masquerade', 'revelry', 'merrymaking', 'festivity', 'conference', 'symposium', 'forum', 'debate', 'discussion', 'dialogue', 'conversation', 'exchange', 'interaction', 'connection', 'alliance', 'partnership', 'friendship', 'companionship', 'camaraderie', 'fellowship', 'brotherhood', 'sisterhood', 'community', 'society'],
      EXPLORATION: ['discovery', 'journey', 'expedition', 'exploration', 'voyage', 'quest', 'adventure', 'pilgrimage', 'odyssey', 'trek', 'travel', 'wander', 'roaming', 'venture', 'excursion', 'tour', 'trip', 'passage', 'trail', 'path', 'route', 'course', 'way', 'track', 'road', 'highway', 'pathway', 'passageway', 'mission', 'crusade', 'campaign', 'enterprise', 'undertaking', 'pursuit', 'search', 'hunt'],
      ECONOMIC: ['opportunity', 'transaction', 'deal', 'exchange', 'trade', 'negotiation', 'bargain', 'contract', 'agreement', 'partnership', 'business', 'commerce', 'market', 'bazaar', 'auction', 'sale', 'purchase', 'acquisition', 'investment', 'venture', 'enterprise', 'company', 'corporation', 'firm', 'establishment', 'operation', 'industry', 'wealth', 'fortune', 'treasure', 'riches', 'assets', 'resources', 'capital', 'funds', 'finance', 'economy'],
      MYSTERY: ['mystery', 'enigma', 'puzzle', 'riddle', 'secret', 'conundrum', 'intrigue', 'case', 'investigation', 'inquiry', 'problem', 'question', 'dilemma', 'paradox', 'contradiction', 'anomaly', 'aberration', 'oddity', 'curiosity', 'confidentiality', 'privacy', 'secrecy', 'examination', 'inspection', 'analysis', 'study', 'research', 'probe', 'search'],
      SUPERNATURAL: ['phenomenon', 'manifestation', 'vision', 'curse', 'omen', 'prophecy', 'miracle', 'portent', 'sign', 'revelation', 'apparition', 'specter', 'phantom', 'ghost', 'spirit', 'wraith', 'phantasm', 'shade', 'shadow', 'presence', 'magic', 'sorcery', 'witchcraft', 'wizardry', 'enchantment', 'spell', 'charm', 'hex', 'incantation', 'ritual', 'divination', 'prediction', 'foretelling', 'augury', 'harbinger', 'herald'],
      POLITICAL: ['affair', 'intrigue', 'scheme', 'conspiracy', 'plot', 'alliance', 'treaty', 'summit', 'crisis', 'scandal', 'diplomacy', 'mediation', 'arbitration', 'conciliation', 'reconciliation', 'settlement', 'accord', 'pact', 'compact', 'government', 'administration', 'regime', 'authority', 'power', 'rule', 'governance', 'leadership', 'command', 'control', 'election', 'campaign', 'vote', 'ballot', 'poll', 'referendum', 'plebiscite', 'selection', 'choice', 'decision'],
      TECHNOLOGICAL: ['innovation', 'malfunction', 'breakthrough', 'system', 'device', 'invention', 'machine', 'apparatus', 'contraption', 'mechanism', 'technology', 'gadget', 'tool', 'instrument', 'implement', 'appliance', 'equipment', 'hardware', 'software', 'firmware', 'automation', 'mechanization', 'computerization', 'digitization', 'modernization', 'upgrade', 'enhancement', 'improvement', 'advancement', 'progress', 'engine', 'motor', 'generator', 'transformer', 'converter', 'processor', 'controller', 'regulator', 'modulator', 'amplifier'],
      MAGIC: ['spell', 'ritual', 'enchantment', 'conjuration', 'incantation', 'sorcery', 'wizardry', 'arcana', 'mysticism', 'thaumaturgy', 'magic', 'magick', 'witchcraft', 'necromancy', 'alchemy', 'divination', 'summoning', 'invocation', 'evocation', 'conjuring', 'charm', 'hex', 'curse', 'blessing', 'benediction', 'prayer', 'supplication', 'appeal', 'artifact', 'relic', 'talisman', 'amulet', 'trinket', 'bauble', 'ornament', 'jewel', 'gem'],
      SPELLCASTING: ['casting', 'invocation', 'evocation', 'summoning', 'channeling', 'weaving', 'manipulation', 'control', 'mastery', 'art', 'power', 'energy', 'force', 'mana', 'essence', 'aura', 'aether', 'ether', 'quintessence', 'spirit', 'technique', 'method', 'practice', 'discipline', 'school', 'tradition', 'path', 'way', 'style', 'form']
    };
  }

  private getArticle(word: string): string {
    if (nlp) {
      try {
        const doc = nlp(word);
        const article = doc.articles().out('text');
        if (article && (article.toLowerCase() === 'a' || article.toLowerCase() === 'an')) {
          return article.toLowerCase();
        }
      } catch (e) {
      }
    }
    
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const firstLetter = word.toLowerCase().charAt(0);
    
    if (vowels.includes(firstLetter)) {
      return 'an';
    }
    
    if (firstLetter === 'h') {
      const silentHWords = ['honor', 'honour', 'honest', 'hour', 'heir', 'herb'];
      if (silentHWords.some(w => word.toLowerCase().startsWith(w))) {
        return 'an';
      }
    }
    
    if (firstLetter === 'u') {
      const uAsConsonant = ['university', 'union', 'unicorn', 'uniform', 'unique', 'unit', 'unity', 'universe', 'usage', 'useful', 'usual', 'utensil', 'user', 'utopia', 'uranium'];
      if (uAsConsonant.some(w => word.toLowerCase().startsWith(w))) {
        return 'a';
      }
    }
    
    return 'a';
  }


  private getActionForType(type: string, context?: 'that' | 'subject' | 'gerund'): string {
    const actions: { [key: string]: { that: string[], subject: string[], gerund: string[] } } = {
      COMBAT: {
        that: ['threatens you', 'challenges you', 'confronts you', 'blocks your path', 'menaces you', 'assaults you', 'engages you', 'attacks you', 'demands your attention', 'requires a response'],
        subject: ['threatens you', 'challenges you', 'confronts you', 'blocks your path', 'menaces you', 'assaults you', 'engages you', 'attacks you'],
        gerund: ['threatening you', 'challenging you', 'confronting you', 'blocking your path', 'menacing you', 'assaulting you', 'engaging you', 'attacking you']
      },
      SOCIAL: {
        that: ['approaches you', 'greets you', 'welcomes you', 'invites you', 'requests your attention', 'offers an opportunity', 'proposes a deal', 'presents itself', 'seeks your involvement', 'awaits your response'],
        subject: ['approaches you', 'greets you', 'welcomes you', 'invites you', 'requests your attention', 'offers an opportunity', 'proposes a deal', 'presents itself'],
        gerund: ['approaching you', 'greeting you', 'welcoming you', 'inviting you', 'requesting your attention', 'offering an opportunity', 'proposing a deal', 'presenting itself']
      },
      EXPLORATION: {
        that: ['appears before you', 'emerges from the shadows', 'reveals itself', 'unfolds before you', 'blocks your path', 'awaits discovery', 'beckons to you', 'calls for investigation'],
        subject: ['appears before you', 'emerges from the shadows', 'reveals itself', 'unfolds before you', 'blocks your path', 'awaits discovery'],
        gerund: ['appearing before you', 'emerging from the shadows', 'revealing itself', 'unfolding before you', 'blocking your path', 'awaiting discovery']
      },
      ECONOMIC: {
        that: ['offers an opportunity', 'presents a deal', 'proposes a transaction', 'suggests a trade', 'provides options', 'delivers a proposal', 'becomes available', 'promises potential gain', 'requires a decision'],
        subject: ['offers an opportunity', 'presents a deal', 'proposes a transaction', 'suggests a trade', 'provides options', 'delivers a proposal', 'becomes available'],
        gerund: ['offering an opportunity', 'presenting a deal', 'proposing a transaction', 'suggesting a trade', 'providing options', 'delivering a proposal', 'becoming available']
      },
      MYSTERY: {
        that: ['puzzles you', 'confuses you', 'bewilders you', 'intrigues you', 'fascinates you', 'captivates you', 'demands investigation', 'requires careful examination', 'calls for answers'],
        subject: ['puzzles you', 'confuses you', 'bewilders you', 'intrigues you', 'fascinates you', 'captivates you', 'demands investigation'],
        gerund: ['puzzling you', 'confusing you', 'bewildering you', 'intriguing you', 'fascinating you', 'captivating you', 'demanding investigation']
      },
      SUPERNATURAL: {
        that: ['manifests before you', 'appears suddenly', 'materializes', 'emerges from the void', 'reveals itself', 'transforms the area', 'radiates otherworldly energy', 'defies natural explanation'],
        subject: ['manifests before you', 'appears suddenly', 'materializes', 'emerges from the void', 'reveals itself', 'transforms the area'],
        gerund: ['manifesting before you', 'appearing suddenly', 'materializing', 'emerging from the void', 'revealing itself', 'transforming the area']
      },
      POLITICAL: {
        that: ['develops around you', 'unfolds before you', 'progresses rapidly', 'advances quickly', 'evolves', 'requires your attention', 'demands your involvement', 'calls for a decision'],
        subject: ['develops around you', 'unfolds before you', 'progresses rapidly', 'advances quickly', 'evolves', 'requires your attention'],
        gerund: ['developing around you', 'unfolding before you', 'progressing rapidly', 'advancing quickly', 'evolving', 'requiring your attention']
      },
      TECHNOLOGICAL: {
        that: ['activates suddenly', 'begins functioning', 'starts operating', 'comes to life', 'performs its task', 'executes its program', 'processes data', 'requires your interaction', 'awaits your command'],
        subject: ['activates suddenly', 'begins functioning', 'starts operating', 'comes to life', 'performs its task', 'executes its program', 'processes data'],
        gerund: ['activating suddenly', 'beginning to function', 'starting to operate', 'coming to life', 'performing its task', 'executing its program', 'processing data']
      },
      MAGIC: {
        that: ['glows with power', 'shimmers mysteriously', 'pulses with energy', 'radiates magic', 'emanates power', 'flows with energy', 'surges with power', 'demands your attention', 'calls to you'],
        subject: ['glows with power', 'shimmers mysteriously', 'pulses with energy', 'radiates magic', 'emanates power', 'flows with energy', 'surges with power'],
        gerund: ['glowing with power', 'shimmering mysteriously', 'pulsing with energy', 'radiating magic', 'emanating power', 'flowing with energy', 'surging with power']
      },
      SPELLCASTING: {
        that: ['channels energy', 'weaves spells', 'manipulates magic', 'controls the flow', 'directs power', 'shapes reality', 'forms enchantments', 'requires your focus', 'demands precision'],
        subject: ['channels energy', 'weaves spells', 'manipulates magic', 'controls the flow', 'directs power', 'shapes reality', 'forms enchantments'],
        gerund: ['channeling energy', 'weaving spells', 'manipulating magic', 'controlling the flow', 'directing power', 'shaping reality', 'forming enchantments']
      }
    };

    const contextType = context || 'that';
    const typeActions = actions[type]?.[contextType] || 
      (contextType === 'that' ? ['takes place', 'unfolds', 'develops', 'requires your attention', 'demands consideration', 'calls for action'] :
       contextType === 'subject' ? ['takes place', 'unfolds', 'develops', 'emerges', 'arises'] :
       ['taking place', 'unfolding', 'developing', 'emerging', 'arising']);
    
    return this.chance.pickone(typeActions);
  }

  private getActionPastForType(type: string): string {
    const actions: { [key: string]: string[] } = {
      COMBAT: ['demanding', 'requiring', 'needing'],
      SOCIAL: ['seeking', 'requesting', 'offering'],
      EXPLORATION: ['awaiting', 'promising', 'hiding'],
      ECONOMIC: ['offering', 'presenting', 'promising'],
      MYSTERY: ['hiding', 'concealing', 'revealing'],
      SUPERNATURAL: ['emanating', 'radiating', 'pulsing'],
      POLITICAL: ['developing', 'unfolding', 'progressing'],
      TECHNOLOGICAL: ['functioning', 'operating', 'processing'],
      MAGIC: ['glowing', 'shimmering', 'pulsing'],
      SPELLCASTING: ['channeling', 'weaving', 'manipulating']
    };

    const typeActions = actions[type] || ['awaiting', 'requiring', 'needing'];
    return this.chance.pickone(typeActions);
  }

  /**
   * Generate event choices
   */
  private generateChoices(
    type: string,
    difficulty: string,
    context: AnalyzedContext,
    rewardModifier: number
  ): Choice[] {
    const choiceCount = this.chance.integer({ min: 2, max: 4 });
    const choices: Choice[] = [];

    for (let i = 0; i < choiceCount; i++) {
      choices.push(this.generateChoice(type, difficulty, context, rewardModifier, i));
    }

    return choices;
  }

  /**
   * Generate a single choice
   */
  private generateChoice(
    type: string,
    difficulty: string,
    context: AnalyzedContext,
    rewardModifier: number,
    index: number
  ): Choice {
    const typeMapping: { [key: string]: string } = {
      UNDERWORLD: 'COMBAT',
      CRIMINAL: 'COMBAT',
      THIEF: 'COMBAT',
      ASSASSIN: 'COMBAT',
      GUILD: 'SOCIAL',
      MAGIC: 'SUPERNATURAL',
      SPELLCASTING: 'SUPERNATURAL',
      ENCHANTED: 'SUPERNATURAL',
      ARCHMAGE: 'SUPERNATURAL',
      WIZARD: 'SUPERNATURAL',
      MAGE: 'SUPERNATURAL',
      NECROMANCER: 'SUPERNATURAL',
      PALADIN: 'COMBAT',
      WARRIOR: 'COMBAT',
      FIGHTER: 'COMBAT',
      ROGUE: 'COMBAT',
      RANGER: 'EXPLORATION',
      DRUID: 'SUPERNATURAL',
      CLERIC: 'SOCIAL',
      BARD: 'SOCIAL',
      MONK: 'COMBAT',
      BARBARIAN: 'COMBAT',
      HUMAN: 'SOCIAL',
      ELF: 'SUPERNATURAL',
      'DARK ELF': 'SUPERNATURAL',
      DWARF: 'ECONOMIC',
      HALFLING: 'SOCIAL',
      GNOME: 'TECHNOLOGICAL',
      ORC: 'COMBAT',
      DRAGONBORN: 'COMBAT',
      TIEFLING: 'SUPERNATURAL'
    };

    const baseType = typeMapping[type] || type;

    const choiceTexts: { [key: string]: string[] } = {
      COMBAT: [
        'Fight bravely', 'Attempt to flee', 'Negotiate', 'Use strategy',
        'Stand your ground', 'Retreat tactically', 'Call for backup', 'Use your weapon',
        'Challenge directly', 'Look for advantage', 'Distract and strike', 'Form a defensive position'
      ],
      SOCIAL: [
        'Be diplomatic', 'Be assertive', 'Listen carefully', 'Change the subject',
        'Offer assistance', 'Share information', 'Request help', 'Propose an alliance',
        'Show respect', 'Make a joke', 'Ask questions', 'Share your story'
      ],
      EXPLORATION: [
        'Investigate', 'Proceed cautiously', 'Call for help', 'Turn back',
        'Examine closely', 'Take notes', 'Mark the location', 'Gather resources',
        'Press forward', 'Search thoroughly', 'Document findings', 'Set up camp'
      ],
      ECONOMIC: [
        'Accept the deal', 'Negotiate better terms', 'Decline politely', 'Make a counteroffer',
        'Request more information', 'Ask for guarantees', 'Propose payment plan', 'Offer trade instead',
        'Seek better price', 'Accept with conditions', 'Walk away', 'Request time to think'
      ],
      MYSTERY: [
        'Investigate thoroughly', 'Ask questions', 'Examine evidence', 'Seek expert opinion',
        'Follow the clues', 'Document everything', 'Share your findings', 'Keep it secret',
        'Report to authorities', 'Form a theory', 'Test your hypothesis', 'Gather more information'
      ],
      SUPERNATURAL: [
        'Approach carefully', 'Use protective magic', 'Observe from distance', 'Seek guidance',
        'Attempt communication', 'Prepare for danger', 'Call upon allies', 'Use holy protection',
        'Document the phenomenon', 'Retreat safely', 'Attempt to banish', 'Study the manifestation'
      ],
      POLITICAL: [
        'Support the proposal', 'Voice opposition', 'Seek compromise', 'Gather support',
        'Form an alliance', 'Remain neutral', 'Leverage influence', 'Request favors',
        'Make a speech', 'Negotiate terms', 'Build consensus', 'Take a stand'
      ],
      TECHNOLOGICAL: [
        'Activate the device', 'Examine the mechanism', 'Test functionality', 'Seek expert help',
        'Attempt repair', 'Document the system', 'Use with caution', 'Study the design',
        'Upgrade components', 'Troubleshoot issues', 'Optimize performance', 'Shut down safely'
      ],
      MAGIC: [
        'Channel the energy', 'Study the spell', 'Attempt to learn', 'Use protective wards',
        'Combine with other magic', 'Enhance the effect', 'Control the flow', 'Dispel if dangerous',
        'Document the ritual', 'Share knowledge', 'Experiment carefully', 'Seek guidance'
      ],
      SPELLCASTING: [
        'Cast the spell', 'Modify the incantation', 'Increase power', 'Focus precisely',
        'Combine elements', 'Channel safely', 'Enhance effect', 'Control carefully',
        'Practice the gesture', 'Refine the words', 'Balance the energy', 'Complete the ritual'
      ]
    };

    const baseTexts = choiceTexts[baseType] || [
      'Accept', 'Decline', 'Investigate', 'Ignore',
      'Proceed', 'Retreat', 'Observe', 'Act'
    ];

    let text: string;
    if (index < baseTexts.length) {
      text = baseTexts[index];
    } else {
      const actionVerbs = ['Act', 'Respond', 'Decide', 'Choose', 'Proceed', 'Engage', 'Interact', 'React'];
      const actionNouns = ['carefully', 'boldly', 'wisely', 'quickly', 'cautiously', 'confidently'];
      text = `${this.chance.pickone(actionVerbs)} ${this.chance.pickone(actionNouns)}`;
    }

    const effect = this.generateChoiceEffect(type, difficulty, context, rewardModifier);

    return {
      text,
      effect
    };
  }

  /**
   * Generate effect for a choice
   */
  private generateChoiceEffect(
    type: string,
    difficulty: string,
    context: AnalyzedContext,
    rewardModifier: number
  ): Effect {
    const effect: Effect = {};

    const difficultyMultiplier = this.getDifficultyMultiplier(difficulty);

    switch (type) {
      case 'COMBAT':
        effect.health = Math.round(this.chance.integer({ min: -20, max: 10 }) * difficultyMultiplier);
        if (this.chance.bool({ likelihood: 30 })) {
          effect.gold = Math.round(this.chance.integer({ min: 0, max: 100 }) * rewardModifier);
        }
        break;

      case 'SOCIAL':
        effect.reputation = Math.round(this.chance.integer({ min: -10, max: 15 }) * difficultyMultiplier);
        if (this.chance.bool({ likelihood: 40 })) {
          effect.influence = Math.round(this.chance.integer({ min: 0, max: 20 }) * rewardModifier);
        }
        break;

      case 'ECONOMIC':
        effect.gold = Math.round(this.chance.integer({ min: -50, max: 200 }) * difficultyMultiplier * rewardModifier);
        if (this.chance.bool({ likelihood: 25 })) {
          effect.reputation = Math.round(this.chance.integer({ min: -5, max: 10 }));
        }
        break;

      case 'EXPLORATION':
        if (this.chance.bool({ likelihood: 60 })) {
          effect.gold = Math.round(this.chance.integer({ min: 0, max: 150 }) * rewardModifier);
        }
        if (this.chance.bool({ likelihood: 20 })) {
          effect.health = Math.round(this.chance.integer({ min: -15, max: 0 }));
        }
        break;

      default:  
        effect.gold = Math.round(this.chance.integer({ min: -20, max: 50 }) * difficultyMultiplier);
        break;
    }

    return effect;
  }

  /**
   * Get difficulty multiplier for effects
   */
  private getDifficultyMultiplier(difficulty: string): number {
    const settings = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS];
    return settings ? settings.rewardMultiplier : 1.0;
  }

  /**
   * Remove duplicate consecutive words from description
   */
  private removeDuplicateWords(description: string): string {
    let fixed = description;
    
    const brokenHyphenPattern = /\b(\w+)-\s+\1-(\w+)\b/gi;
    fixed = fixed.replace(brokenHyphenPattern, '$1-$2');
    
    const brokenHyphenPattern2 = /\b(\w+)-\s+(\w+)-(\w+)\b/gi;
    fixed = fixed.replace(brokenHyphenPattern2, (_match, part1, part2, part3) => {
      const part1Lower = part1.toLowerCase();
      const part2Lower = part2.toLowerCase();
      if (part2Lower.startsWith(part1Lower) || part1Lower === part2Lower.substring(0, Math.min(part1Lower.length, part2Lower.length))) {
        return `${part1}-${part3}`;
      }
      return `${part1}-${part2}-${part3}`;
    });
    
    const brokenHyphenPattern3 = /\b(\w+)-\s+(\w+)\b/gi;
    fixed = fixed.replace(brokenHyphenPattern3, (match, part1, part2) => {
      const part1Lower = part1.toLowerCase();
      const part2Lower = part2.toLowerCase();
      if (part2Lower.startsWith(part1Lower) || part1Lower === part2Lower.substring(0, Math.min(part1Lower.length, 4))) {
        return `${part1}-${part2}`;
      }
      return match;
    });
    
    const brokenHyphenPattern4 = /\b(\w+)-\s+\1-(\w+)\b/gi;
    fixed = fixed.replace(brokenHyphenPattern4, '$1-$2');
    
    const brokenHyphenPattern5 = /\b(\w+)-\s+(\w+)-(\w+)\b/gi;
    fixed = fixed.replace(brokenHyphenPattern5, (match, part1, part2, part3) => {
      if (part2.toLowerCase().startsWith(part1.toLowerCase())) {
        return `${part1}-${part3}`;
      }
      return match;
    });
    
    const consecutiveDuplicate = /\b(\w{4,})\s+\1\b/gi;
    fixed = fixed.replace(consecutiveDuplicate, (match, word) => {
      return word;
    });
    
    const consecutiveDuplicate2 = /\b(a|an|the)\s+(\w{4,})\s+\2\b/gi;
    fixed = fixed.replace(consecutiveDuplicate2, (match, article, word) => {
      return `${article} ${word}`;
    });
    
    const words = fixed.split(/\s+/);
    const result: string[] = [];
    const seenWords = new Map<string, number>();
    
    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i].toLowerCase().replace(/[.,!?;:]/g, '');
      const prevWord = i > 0 ? words[i - 1].toLowerCase().replace(/[.,!?;:]/g, '') : '';
      const prevWordOriginal = i > 0 ? words[i - 1] : '';
      const isStartOfSentence = i === 0 || /[.!?]\s*$/.test(prevWordOriginal);
      const isHyphenated = words[i].includes('-');
      
      if (currentWord.length > 3 && !isHyphenated) {
        if (currentWord === prevWord) {
          continue;
        }
        
        const count = seenWords.get(currentWord) || 0;
        if (count > 0 && !isStartOfSentence) {
          continue;
        }
        if (!isStartOfSentence) {
          seenWords.set(currentWord, count + 1);
        }
      }
      
      result.push(words[i]);
    }
    
    fixed = result.join(' ');
    
    const duplicatePatterns = [
      /\b(\w{4,})\s+\w+\s+\1\b/gi,
      /\b(\w+)\s+\1\s+\w+\b/gi,
      /\b\w+\s+(\w{4,})\s+\1\b/gi,
      /\b(\w{4,})\s+(\w+)\s+\1\b/gi,
      /\b(\w{4,})\s+\1\b/gi
    ];
    
    for (const pattern of duplicatePatterns) {
      fixed = fixed.replace(pattern, (match) => {
        const words = match.split(/\s+/);
        const uniqueWords: string[] = [];
        const seen = new Set<string>();
        
        for (const word of words) {
          const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, '');
          if (wordLower.length > 3 && !seen.has(wordLower)) {
            seen.add(wordLower);
            uniqueWords.push(word);
          } else if (wordLower.length <= 3) {
            uniqueWords.push(word);
          }
        }
        
        return uniqueWords.join(' ');
      });
    }
    
    return fixed;
  }

  /**
   * Fix word order issues (noun before adjective)
   */
  private fixWordOrder(description: string, adjective: string, noun: string): string {
    const adjLower = adjective.toLowerCase();
    const nounLower = noun.toLowerCase();
    
    const wrongOrderPattern = new RegExp(`\\b(an?|the)\\s+${nounLower}\\s+${adjLower}\\b`, 'gi');
    description = description.replace(wrongOrderPattern, (_match, article) => {
      return `${article} ${adjLower} ${nounLower}`;
    });
    
    const wrongOrderPattern2 = new RegExp(`\\b(an?|the)\\s+${nounLower}\\s+(\\w+)\\s+${adjLower}\\b`, 'gi');
    description = description.replace(wrongOrderPattern2, (_match, article, middle) => {
      return `${article} ${adjLower} ${nounLower} ${middle}`;
    });
    
    const wrongOrderPattern3 = new RegExp(`\\bThe\\s+${nounLower}\\s+${adjLower}\\b`, 'gi');
    description = description.replace(wrongOrderPattern3, () => {
      return `The ${adjLower} ${nounLower}`;
    });
    
    const duplicateNounPattern = new RegExp(`\\b(an?|the)\\s+${nounLower}\\s+\\w+\\s+${nounLower}\\b`, 'gi');
    description = description.replace(duplicateNounPattern, (_match, article) => {
      return `${article} ${adjLower} ${nounLower}`;
    });
    
    const duplicateNounPattern2 = new RegExp(`\\b(an?|the|The)\\s+${nounLower}\\s+${nounLower}\\b`, 'gi');
    description = description.replace(duplicateNounPattern2, (_match, article) => {
      const art = article.toLowerCase() === 'the' ? 'The' : article;
      return `${art} ${adjLower} ${nounLower}`;
    });
    
    const duplicateNounPattern3 = new RegExp(`\\b(an?|the)\\s+${nounLower}\\s+${adjLower}\\s+${nounLower}\\b`, 'gi');
    description = description.replace(duplicateNounPattern3, (_match, article) => {
      return `${article} ${adjLower} ${nounLower}`;
    });
    
    const duplicateNounPattern4 = new RegExp(`\\b(an?|the)\\s+${nounLower}\\s+\\w+\\s+${nounLower}\\b`, 'gi');
    description = description.replace(duplicateNounPattern4, (_match, article) => {
      return `${article} ${adjLower} ${nounLower}`;
    });
    
    const wrongOrderPattern4 = new RegExp(`\\b(an?|the|The|A)\\s+${nounLower}\\s+(captivating|overwhelming|tainted|uncommon|mighty|quiet|ruthless|wicked|yielding|serene|lavish|unbreakable|sacred|kingly|fierce|mysterious|ancient|powerful|extraordinary|radiant|wise|nefarious|crucial|jaded|furious|pristine|formidable|wealthy|numinous|glorious|ominous|transcendent)\\b`, 'gi');
    description = description.replace(wrongOrderPattern4, (_match, article, adj) => {
      const art = article.toLowerCase() === 'the' ? 'The' : (article.toLowerCase() === 'a' ? 'A' : article);
      return `${art} ${adj} ${nounLower}`;
    });
    
    const commonAdjectives = ['wicked', 'yielding', 'serene', 'lavish', 'unbreakable', 'sacred', 'kingly', 'fierce', 'mysterious', 'ancient', 'powerful', 'extraordinary', 'radiant', 'wise', 'overwhelming', 'nefarious', 'crucial', 'commerce', 'mission', 'jaded', 'furious', 'pristine', 'formidable', 'wealthy', 'numinous', 'glorious', 'ominous', 'transcendent', 'captivating', 'tainted', 'uncommon', 'mighty', 'quiet', 'ruthless'];
    for (const adj of commonAdjectives) {
      if (adj === nounLower) continue;
      const pattern = new RegExp(`\\b(an?|the|The)\\s+${nounLower}\\s+${adj}\\b`, 'gi');
      description = description.replace(pattern, (_match, article) => {
        const art = article.toLowerCase() === 'the' ? 'The' : article;
        return `${art} ${adj} ${nounLower}`;
      });
    }
    
    const anyNounBeforeAdj = new RegExp(`\\b(an?|the|The)\\s+(${nounLower}|commerce|mission|poll|feast|benediction|intrigue|leadership|conspiracy|crusade|assault|brawl|battle|combat|gala|blessing|wander|quest|forum|convention|contract|software|struggle|confrontation|topic)\\s+(wicked|yielding|serene|lavish|unbreakable|sacred|kingly|fierce|mysterious|ancient|powerful|extraordinary|radiant|wise|overwhelming|nefarious|crucial|jaded|furious|pristine|formidable|wealthy|numinous|glorious|ominous|transcendent|captivating|tainted|uncommon|mighty|quiet|ruthless)\\b`, 'gi');
    description = description.replace(anyNounBeforeAdj, (_match, article, nounWord, adjWord) => {
      const art = article.toLowerCase() === 'the' ? 'The' : article;
      return `${art} ${adjWord} ${nounWord}`;
    });
    
    const brokenHyphen = /\b(\w+)-\s+\1-(\w+)\b/gi;
    description = description.replace(brokenHyphen, '$1-$2');
    
    const brokenHyphen2 = /\b(\w+)-\s+(\w+)-(\w+)\b/gi;
    description = description.replace(brokenHyphen2, (match, part1, part2, part3) => {
      const part1Lower = part1.toLowerCase();
      const part2Lower = part2.toLowerCase();
      if (part2Lower.startsWith(part1Lower) || part1Lower === part2Lower.substring(0, Math.min(part1Lower.length, part2Lower.length))) {
        return `${part1}-${part3}`;
      }
      return `${part1}-${part2}-${part3}`;
    });
    
    const brokenHyphen3 = /\b(\w+)-\s+(\w+)\b/gi;
    description = description.replace(brokenHyphen3, (match, part1, part2) => {
      const part1Lower = part1.toLowerCase();
      const part2Lower = part2.toLowerCase();
      if (part2Lower.startsWith(part1Lower) || part1Lower === part2Lower.substring(0, Math.min(part1Lower.length, 4))) {
        return `${part1}-${part2}`;
      }
      return match;
    });
    
    const brokenHyphen4 = /\b(\w+)-\s+\1-(\w+)\b/gi;
    description = description.replace(brokenHyphen4, '$1-$2');
    
    const brokenHyphen5 = /\b(\w+)-\s+(\w+)-(\w+)\b/gi;
    description = description.replace(brokenHyphen5, (match, part1, part2, part3) => {
      if (part2.toLowerCase().startsWith(part1.toLowerCase())) {
        return `${part1}-${part3}`;
      }
      return match;
    });
    
    const duplicateAfterArticle = /\b(an?|the)\s+(\w{4,})\s+\2\b/gi;
    let prevDescription = '';
    while (description !== prevDescription) {
      prevDescription = description;
      description = description.replace(duplicateAfterArticle, (match, article, word) => {
        return `${article} ${word}`;
      });
    }
    
    const consecutiveDuplicate = /\b(\w{4,})\s+\1\b/gi;
    description = description.replace(consecutiveDuplicate, '$1');
    
    const brokenPhrase = /\bthis\s+of\s+(\w+)/gi;
    description = description.replace(brokenPhrase, (_match, word) => {
      return `this ${nounLower} ${word}`;
    });
    
    return description;
  }

  /**
   * Fix redundant phrases like "happening happens", "occurrence occurs"
   */
  private fixRedundantPhrases(description: string, noun: string): string {
    const nounLower = noun.toLowerCase();
    const nounRoot = nounLower.replace(/ing$|s$|ed$|tion$/, '');
    
    const redundantPatterns = [
      { pattern: new RegExp(`\\b${nounLower}\\s+happens\\b`, 'gi'), replacement: 'unfolds' },
      { pattern: new RegExp(`\\b${nounLower}\\s+occurs\\b`, 'gi'), replacement: 'develops' },
      { pattern: new RegExp(`\\b${nounLower}\\s+${nounRoot}s\\b`, 'gi'), replacement: 'unfolds' },
      { pattern: new RegExp(`\\b${nounLower}\\s+${nounRoot}ing\\b`, 'gi'), replacement: 'develops' },
      { pattern: /\bhappening\s+happens\b/gi, replacement: 'unfolds' },
      { pattern: /\boccurrence\s+occurs\b/gi, replacement: 'develops' },
      { pattern: /\bevent\s+happens\b/gi, replacement: 'unfolds' },
      { pattern: /\bsituation\s+occurs\b/gi, replacement: 'develops' },
      { pattern: /\b(\w+)\s+\1s\b/gi, replacement: 'unfolds' },
      { pattern: /\b(\w+ing)\s+\1\b/gi, replacement: 'develops' }
    ];
    
    let fixed = description;
    const replacements = ['unfolds', 'develops', 'emerges', 'arises', 'takes shape', 'manifests', 'comes to pass', 'takes place'];
    
    for (const { pattern, replacement } of redundantPatterns) {
      if (pattern.test(fixed)) {
        fixed = fixed.replace(pattern, (match) => {
          const words = match.split(/\s+/);
          const selectedReplacement = words[0].toLowerCase() === 'happening' || words[0].toLowerCase() === 'occurrence' 
            ? replacement 
            : this.chance.pickone(replacements);
          return words[0] + ' ' + selectedReplacement;
        });
      }
    }
    
    return fixed;
  }

  /**
   * Add contextual details to description based on player context
   */
  private addContextualDetails(
    description: string,
    context: AnalyzedContext,
    type: string,
    noun: string
  ): string {
    const contextDetails: string[] = [];
    const skipWords = new Set(['in', 'the', 'of', 'a', 'an', 'and', 'or', 'but', 'with', 'from', 'to', 'for']);

    if (context.wealthTier === 'poor' && this.chance.bool({ likelihood: 30 })) {
      const poorDetails = [
        'Your limited resources make this particularly challenging.',
        'Given your financial constraints, this situation requires careful consideration.',
        'Your modest means add an extra layer of difficulty to this encounter.',
        'With your current financial situation, this presents a significant challenge.'
      ];
      contextDetails.push(this.chance.pickone(poorDetails));
    }

    if (context.wealthTier === 'rich' && this.chance.bool({ likelihood: 20 })) {
      const richDetails = [
        'Your wealth and influence may open doors that others cannot access.',
        'Your financial resources could provide unique advantages here.',
        'Given your substantial means, you have options that many would not.',
        'Your wealth might offer solutions that are unavailable to most.'
      ];
      contextDetails.push(this.chance.pickone(richDetails));
    }

    if (context.wealthTier === 'wealthy' && this.chance.bool({ likelihood: 15 })) {
      contextDetails.push('Your comfortable financial position gives you some flexibility in how to approach this.');
    }

    if (context.lifeStage === 'elder' && this.chance.bool({ likelihood: 25 })) {
      const elderDetails = [
        'Drawing on your extensive experience may prove valuable here.',
        'Your years of wisdom could be an asset in this situation.',
        'Your long life has taught you to recognize patterns others might miss.',
        'With your accumulated knowledge, you see nuances that younger eyes might overlook.'
      ];
      contextDetails.push(this.chance.pickone(elderDetails));
    }

    if (context.lifeStage === 'youth' && this.chance.bool({ likelihood: 25 })) {
      const youthDetails = [
        'Your youthful energy and enthusiasm could be an advantage.',
        'Your fresh perspective might reveal solutions others have overlooked.',
        'Your inexperience could be a liability, but your adaptability might compensate.',
        'Your youth brings both risks and opportunities to this situation.'
      ];
      contextDetails.push(this.chance.pickone(youthDetails));
    }

    if (context.lifeStage === 'experienced' && this.chance.bool({ likelihood: 15 })) {
      contextDetails.push('Your experience has prepared you for situations like this.');
    }

    if (context.careerPath && context.careerPath !== 'adventurer') {
      const career = context.careerPath.toLowerCase();
      if (this.chance.bool({ likelihood: 20 })) {
        const careerDetails: { [key: string]: string[] } = {
          warrior: ['Your training as a warrior has prepared you for this moment.', 'Your combat expertise gives you an edge in this situation.'],
          mage: ['Your arcane knowledge might prove useful here.', 'Your magical training could provide unique insights.'],
          rogue: ['Your skills in stealth and cunning may serve you well.', 'Your experience with deception could be valuable.'],
          cleric: ['Your faith and divine connection might guide you.', 'Your healing abilities could prove crucial.'],
          ranger: ['Your knowledge of the wilderness could be helpful.', 'Your tracking skills might reveal important details.'],
          bard: ['Your charisma and social skills may help navigate this.', 'Your ability to read people could be an advantage.'],
          paladin: ['Your sense of justice and honor will guide your response.', 'Your divine purpose might be tested here.'],
          merchant: ['Your business acumen could turn this into an opportunity.', 'Your negotiation skills might prove valuable.'],
          scholar: ['Your extensive knowledge might provide crucial insights.', 'Your research skills could uncover important information.'],
          noble: ['Your social standing might influence how others perceive this.', 'Your connections and influence could be useful.']
        };

        if (careerDetails[career]) {
          contextDetails.push(this.chance.pickone(careerDetails[career]));
        } else {
          contextDetails.push(`Your background as ${this.getArticle(career)} ${career} might be relevant here.`);
        }
      }
    }

    if (type === 'COMBAT' && context.skillProfile.combat > 50) {
      const combatDetails = [
        'Your combat expertise gives you an edge in this situation.',
        'Your training in battle has prepared you for this confrontation.',
        'Your martial skills could prove decisive here.',
        'Your experience in combat helps you assess the threat level.'
      ];
      contextDetails.push(this.chance.pickone(combatDetails));
    }

    if (type === 'SOCIAL' && context.skillProfile.social > 50) {
      const socialDetails = [
        'Your social skills may help navigate this encounter.',
        'Your charisma and interpersonal abilities could be valuable.',
        'Your ability to read people might give you an advantage.',
        'Your social experience helps you understand the dynamics at play.'
      ];
      contextDetails.push(this.chance.pickone(socialDetails));
    }

    if (type === 'SUPERNATURAL' && context.skillProfile.magic > 50) {
      const magicDetails = [
        'Your magical knowledge might help you understand what is happening.',
        'Your arcane training could provide insights into this phenomenon.',
        'Your connection to mystical forces might be relevant here.',
        'Your experience with the supernatural helps you recognize the signs.'
      ];
      contextDetails.push(this.chance.pickone(magicDetails));
    }

    if (type === 'TECHNOLOGICAL' && context.skillProfile.technical > 50) {
      const techDetails = [
        'Your technical expertise might help you understand this system.',
        'Your knowledge of technology could prove useful here.',
        'Your experience with machines helps you assess the situation.',
        'Your technical skills might reveal solutions others would miss.'
      ];
      contextDetails.push(this.chance.pickone(techDetails));
    }

    if (context.level && context.level > 10) {
      if (this.chance.bool({ likelihood: 15 })) {
        contextDetails.push(`At level ${context.level}, you've faced similar challenges before.`);
      }
    }

    if (context.level && context.level < 5) {
      if (this.chance.bool({ likelihood: 20 })) {
        contextDetails.push('Your relative inexperience makes this situation more daunting.');
      }
    }

    if (context.location && typeof context.location === 'string') {
      if (this.chance.bool({ likelihood: 15 })) {
        const location = context.location.toLowerCase();
        const nounLower = (noun || '').toLowerCase().trim();
        const skipWords = new Set(['in', 'the', 'of', 'a', 'an', 'and', 'or', 'but', 'with', 'from', 'to', 'for', 'wondrous', 'luminous', 'pristine', 'ruthless', 'furious', 'hollow', 'unforgettable', 'oracular', 'titanic', 'xenophobic', 'beneficial', 'unfathomable', 'quiet', 'infinite', 'ancient', 'mighty', 'transcendent', 'glorious', 'ominous']);
        if (nounLower && nounLower.length > 2 && nounLower !== 'of' && !skipWords.has(nounLower) && nounLower.length < 30 && !nounLower.endsWith('ing') && !nounLower.endsWith('ed')) {
          contextDetails.push(`Here in ${location}, this ${nounLower} takes on added significance.`);
        } else {
          contextDetails.push(`Here in ${location}, this situation takes on added significance.`);
        }
      }
    }

    if (context.season && typeof context.season === 'string') {
      if (this.chance.bool({ likelihood: 10 })) {
        const season = context.season.toLowerCase();
        const seasonDetails: { [key: string]: string[] } = {
          spring: ['The spring air seems to enhance the energy of this moment.', 'The renewal of spring adds a hopeful note to this situation.'],
          summer: ['The summer heat makes this encounter feel more intense.', 'The long summer days seem to stretch this moment.'],
          autumn: ['The autumn atmosphere adds a sense of change to this encounter.', 'The falling leaves seem to mark this moment.'],
          fall: ['The autumn atmosphere adds a sense of change to this encounter.', 'The falling leaves seem to mark this moment.'],
          winter: ['The winter chill seems to make this situation more stark.', 'The cold winter air adds urgency to this encounter.']
        };
        if (seasonDetails[season]) {
          contextDetails.push(this.chance.pickone(seasonDetails[season]));
        }
      }
    }

    if (context.influenceTier === 'elite' && this.chance.bool({ likelihood: 15 })) {
      contextDetails.push('Your elite status and connections might provide unique opportunities here.');
    }

    if (context.influenceTier === 'low' && this.chance.bool({ likelihood: 15 })) {
      contextDetails.push('Your lack of influence means you must rely on your own skills and wits.');
    }

    if (context.health !== undefined && context.health < 30) {
      if (this.chance.bool({ likelihood: 20 })) {
        contextDetails.push('Your weakened state makes this situation more dangerous.');
      }
    }

    if (context.health !== undefined && context.health > 80) {
      if (this.chance.bool({ likelihood: 10 })) {
        contextDetails.push('Your excellent health gives you confidence in facing this challenge.');
      }
    }

    if (context.stress !== undefined && context.stress > 70) {
      if (this.chance.bool({ likelihood: 20 })) {
        contextDetails.push('Your high stress level makes it harder to think clearly about this situation.');
      }
    }

    if (context.relationships && typeof context.relationships === 'object') {
      const relationshipCount = Object.keys(context.relationships).length;
      if (relationshipCount > 5 && this.chance.bool({ likelihood: 10 })) {
        contextDetails.push('Your network of relationships might provide support or complications.');
      }
    }

    if (contextDetails.length > 0) {
      const selectedDetails = this.chance.pickset(contextDetails, this.chance.integer({ min: 1, max: Math.min(2, contextDetails.length) }));
      description += ' ' + selectedDetails.join(' ');
    }

    return description;
  }

  /**
   * Validate sentence grammar and completeness
   */
  private validateFinalDescription(description: string, adjective: string, noun: string): { valid: boolean; reason?: string } {
    const descLower = description.toLowerCase();
    const adjLower = adjective.toLowerCase();
    const nounLower = noun.toLowerCase();
    
    const wrongOrderPattern = new RegExp(`\\b(an?|the)\\s+${nounLower}\\s+${adjLower}\\b`, 'i');
    if (wrongOrderPattern.test(description)) {
      return { valid: false, reason: 'noun before adjective' };
    }
    
    const wrongOrderPattern2 = new RegExp(`\\b(an?|the)\\s+${nounLower}\\s+\\w+\\s+${adjLower}\\b`, 'i');
    if (wrongOrderPattern2.test(description)) {
      return { valid: false, reason: 'noun before adjective with word between' };
    }
    
    const wrongOrderPattern3 = new RegExp(`\\bThe\\s+${nounLower}\\s+${adjLower}\\b`, 'i');
    if (wrongOrderPattern3.test(description)) {
      return { valid: false, reason: 'The noun adjective - wrong order' };
    }
    
    const commonAdjectives = ['sacred', 'kingly', 'fierce', 'mysterious', 'ancient', 'powerful', 'extraordinary', 'radiant', 'wise', 'overwhelming', 'nefarious', 'crucial', 'awe-inspiring', 'awe', 'inspiring', 'wicked', 'yielding', 'serene', 'lavish', 'unbreakable'];
    for (const adj of commonAdjectives) {
      const wrongOrderPattern = new RegExp(`\\b(an?|the)\\s+\\w{4,}\\s+${adj}\\b`, 'i');
      if (wrongOrderPattern.test(description) && !description.toLowerCase().match(new RegExp(`\\b(an?|the)\\s+${adj}\\s+\\w+\\b`, 'i'))) {
        return { valid: false, reason: `adjective ${adj} after noun` };
      }
    }
    
    const duplicatePattern = new RegExp(`\\b${nounLower}\\s+\\w+\\s+${nounLower}\\b`, 'i');
    if (duplicatePattern.test(description)) {
      return { valid: false, reason: 'duplicate noun' };
    }
    
    const duplicatePattern2 = new RegExp(`\\b(an?|the)\\s+${nounLower}\\s+\\w+\\s+${nounLower}\\b`, 'i');
    if (duplicatePattern2.test(description)) {
      return { valid: false, reason: 'duplicate noun with article' };
    }
    
    const duplicatePattern3 = new RegExp(`\\b(an?|the)\\s+${nounLower}\\s+${adjLower}\\s+${nounLower}\\b`, 'i');
    if (duplicatePattern3.test(description)) {
      return { valid: false, reason: 'duplicate noun with adjective between' };
    }
    
    const brokenHyphenPattern = /\b\w+-\s+\w+/i;
    if (brokenHyphenPattern.test(description)) {
      return { valid: false, reason: 'broken hyphenated word' };
    }
    
    const brokenHyphenPattern2 = /\b(\w+)-\s+\1-/i;
    if (brokenHyphenPattern2.test(description)) {
      return { valid: false, reason: 'broken hyphenated word with duplicate' };
    }
    
    const brokenPhrasePattern = /\bthis\s+of\s+\w+/i;
    if (brokenPhrasePattern.test(description)) {
      return { valid: false, reason: 'broken phrase: this of' };
    }
    
    const wrongArticlePattern = /\b(an\s+[bcdfghjklmnpqrstvwxyz][a-z]{3,}|a\s+[aeiou][a-z]{3,})/i;
    if (wrongArticlePattern.test(description)) {
      return { valid: false, reason: 'wrong article' };
    }
    
    return { valid: true };
  }

  private validateSentence(sentence: string): boolean {
    if (!sentence || sentence.trim().length === 0) {
      return false;
    }

    const trimmed = sentence.trim();
    
    if (trimmed.length < 10) {
      return false;
    }

    if (!trimmed.match(/[.!?]$/)) {
      return false;
    }

    if (natural && natural.SentenceTokenizer) {
      try {
        const tokenizer = new natural.SentenceTokenizer();
        const naturalSentences = tokenizer.tokenize(trimmed);
        
        if (naturalSentences.length === 0) {
          return false;
        }

        for (const sent of naturalSentences) {
          const words = sent.trim().split(/\s+/);
          if (words.length < 3) {
            return false;
          }
          
          if (natural && natural.PorterStemmer) {
            try {
              const stemmer = natural.PorterStemmer;
              const hasVerb = words.some((word: string) => {
                const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, '');
                if (wordLower.length < 2) return false;
                
                const verbEndings = ['ed', 'ing', 'es', 's'];
                const hasVerbEnding = verbEndings.some(ending => wordLower.endsWith(ending));
                const isCommonVerb = ['is', 'are', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must'].includes(wordLower);
                
                if (hasVerbEnding || isCommonVerb) {
                  try {
                    const stemmed = stemmer.stem(wordLower);
                    return stemmed !== wordLower || hasVerbEnding || isCommonVerb;
                  } catch (e) {
                    return hasVerbEnding || isCommonVerb;
                  }
                }
                return false;
              });
              
              if (!hasVerb && words.length < 5) {
                return false;
              }
            } catch (e) {
            }
          }
        }
      } catch (e) {
      }
    }

    if (nlp) {
      try {
        const doc = nlp(trimmed);
        const sentences = doc.sentences();
        
        if (sentences.length === 0) {
          return false;
        }

        for (let i = 0; i < sentences.length; i++) {
          const sent = sentences.eq(i);
          const hasSubject = sent.match('#Noun').length > 0 || sent.match('#Pronoun').length > 0;
          const hasVerb = sent.match('#Verb').length > 0;
          
          if (!hasSubject || !hasVerb) {
            return false;
          }
        }
      } catch (e) {
      }
    }

    const words = trimmed.split(/\s+/).map(w => w.toLowerCase().replace(/[.,!?;:]/g, ''));
    const seenWords = new Map<string, number>();
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length > 3) {
        const count = seenWords.get(word) || 0;
        if (count > 0) {
          return false;
        }
        seenWords.set(word, count + 1);
      }
    }
    
    const duplicateWordPatterns = [
      /\b(\w{4,})\s+\1\b/i,
      /\b(\w{4,})\s+\w+\s+\1\b/i,
      /\b\w+\s+(\w{4,})\s+\1\b/i
    ];
    
    for (const pattern of duplicateWordPatterns) {
      if (pattern.test(trimmed)) {
        return false;
      }
    }
    
    const incorrectWordOrderPattern = /\b(an?|the)\s+(\w{4,})\s+(extraordinary|mysterious|unexpected|intriguing|significant|notable|strange|unusual|powerful|dangerous|ancient|mystical|magical|dark|bright|large|small|great|huge|tiny|massive|enormous|immense|vast|colossal|gigantic|titanic|mighty|fierce|savage|brutal|vicious|deadly|lethal|fatal|mortal|immortal|eternal|infinite|endless|boundless|limitless|unlimited|countless|numerous|plentiful|abundant|copious|profuse|excessive|extreme|intense|severe|harsh|rigorous|strict|stern|austere|ascetic|spartan|frugal|parsimonious|stingy|miserly|avaricious|greedy|covetous|rapacious|voracious|insatiable|unquenchable|unappeasable|inexorable|relentless|unrelenting|unremitting|incessant|ceaseless|continuous|constant|perpetual|everlasting|unending|interminable|protracted|prolonged|extended|lengthy|long|short|brief|concise|succinct|terse|laconic|pithy|compact|condensed|compressed|abbreviated|abridged|curtailed|truncated|wise|radiant)\b/i;
    if (incorrectWordOrderPattern.test(trimmed)) {
      return false;
    }
    
    const verbLikeInWrongPlace = /\b(an?|the)\s+\w+\s+\w+\s+(revealed|awakened|unleashed|rising|falling|directs|seeking|demanding|requiring|blocking|offering|creating|presenting)\s+/i;
    if (verbLikeInWrongPlace.test(trimmed)) {
      return false;
    }
    
    const nounBeforeAdjective = /\b(an?|the)\s+(\w{4,})\s+(radiant|wise|extraordinary|mysterious|unexpected|intriguing|significant|notable|strange|unusual|powerful|dangerous|ancient|mystical|magical|dark|bright|large|small|great|huge|tiny|massive|enormous|immense|vast|colossal|gigantic|titanic|mighty|fierce|savage|brutal|vicious|deadly|lethal|fatal|mortal|immortal|eternal|infinite|endless|boundless|limitless|unlimited|countless|numerous|plentiful|abundant|copious|profuse|excessive|extreme|intense|severe|harsh|rigorous|strict|stern|austere|ascetic|spartan|frugal|parsimonious|stingy|miserly|avaricious|greedy|covetous|rapacious|voracious|insatiable|unquenchable|unappeasable|inexorable|relentless|unrelenting|unremitting|incessant|ceaseless|continuous|constant|perpetual|everlasting|unending|interminable|protracted|prolonged|extended|lengthy|long|short|brief|concise|succinct|terse|laconic|pithy|compact|condensed|compressed|abbreviated|abridged|curtailed|truncated|sacred|kingly|nefarious|crucial|awe-inspiring|awe|inspiring)\s+\w+/i;
    if (nounBeforeAdjective.test(trimmed)) {
      return false;
    }
    
    const brokenHyphen = /\b\w+-\s+\w+/i;
    if (brokenHyphen.test(trimmed)) {
      return false;
    }
    
    const brokenPhrase = /\bthis\s+of\s+\w+/i;
    if (brokenPhrase.test(trimmed)) {
      return false;
    }
    
    const redundantBeforeYou = /\b\w+\s+before\s+you\s+before\s+you\b/i;
    if (redundantBeforeYou.test(trimmed)) {
      return false;
    }

    const redundantPhrases = [
      /\bhappening\s+happens\b/i,
      /\boccurrence\s+occurs\b/i,
      /\bevent\s+happens\b/i,
      /\bsituation\s+occurs\b/i,
      /\b(\w+)\s+\1s\b/i,
      /\b(\w+ing)\s+\1\b/i
    ];
    
    for (const pattern of redundantPhrases) {
      if (pattern.test(trimmed)) {
        return false;
      }
    }

    const incompletePatterns = [
      /that\s+(handles|reveals|progresses|develops|occurs|happens|unfolds|begins|starts|ends|finishes)\.$/i,
      /involving\s+\w+\s+(handles|reveals|progresses|develops|occurs|happens|unfolds|begins|starts|ends|finishes)\.$/i,
      /with\s+(cursed|blessed|ancient|new|old|dark|light)\s+(implications|consequences|results)\.$/i,
      /\w+\s+(that|which)\s+(handles|reveals|progresses|develops|occurs|happens|unfolds|begins|starts|ends|finishes)\.$/i
    ];

    for (const pattern of incompletePatterns) {
      if (pattern.test(trimmed)) {
        return false;
      }
    }

    const danglingVerbPattern = /(handles|reveals|progresses|develops|occurs|happens|unfolds|begins|starts|ends|finishes)\.$/i;
    if (danglingVerbPattern.test(trimmed)) {
      const lastWords = trimmed.split(/\s+/).slice(-3).map(w => w.toLowerCase());
      const hasObject = lastWords.some(w => 
        !['that', 'which', 'who', 'what', 'where', 'when', 'why', 'how'].includes(w) &&
        w.length > 2
      );
      if (!hasObject) {
        return false;
      }
    }

    let sentences: string[] = [];
    if (natural && natural.SentenceTokenizer) {
      try {
        const tokenizer = new natural.SentenceTokenizer();
        const tokenized = tokenizer.tokenize(trimmed);
        if (tokenized && tokenized.length > 0) {
          sentences = tokenized;
        } else {
          sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
        }
      } catch (e) {
        sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
      }
    } else {
      sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
    }
    
    for (const sent of sentences) {
      const words = sent.trim().split(/\s+/);
      if (words.length < 3) {
        return false;
      }

      const commonVerbs = /\b(is|are|was|were|has|have|had|do|does|did|will|would|can|could|should|may|might|must|be|been|being|become|becomes|became|get|gets|got|go|goes|went|come|comes|came|see|sees|saw|know|knows|knew|think|thinks|thought|take|takes|took|make|makes|made|give|gives|gave|find|finds|found|tell|tells|told|ask|asks|asked|work|works|worked|call|calls|called|try|tries|tried|use|uses|used|need|needs|needed|want|wants|wanted|feel|feels|felt|seem|seems|seemed|leave|leaves|left|put|puts|mean|means|meant|keep|keeps|kept|let|lets|begin|begins|began|begun|help|helps|helped|show|shows|showed|shown|hear|hears|heard|play|plays|played|run|runs|ran|move|moves|moved|live|lives|lived|believe|believes|believed|bring|brings|brought|happen|happens|happened|write|writes|wrote|written|sit|sits|sat|stand|stands|stood|lose|loses|lost|pay|pays|paid|meet|meets|met|include|includes|included|continue|continues|continued|set|sets|learn|learns|learned|change|changes|changed|lead|leads|led|understand|understands|understood|watch|watches|watched|follow|follows|followed|stop|stops|stopped|create|creates|created|speak|speaks|spoke|spoken|read|reads|spend|spends|spent|grow|grows|grew|grown|open|opens|opened|walk|walks|walked|win|wins|won|teach|teaches|taught|offer|offers|offered|remember|remembers|remembered|consider|considers|considered|appear|appears|appeared|buy|buys|bought|serve|serves|served|die|dies|died|send|sends|sent|build|builds|built|stay|stays|stayed|fall|falls|fell|fallen|cut|cuts|reach|reaches|reached|kill|kills|killed|raise|raises|raised|pass|passes|passed|sell|sells|sold|decide|decides|decided|return|returns|returned|explain|explains|explained|join|joins|joined|expect|expects|expected|suggest|suggests|suggested|allow|allows|allowed|add|adds|added|produce|produces|produced|ensure|ensures|ensured|refer|refers|referred|discuss|discusses|discussed|agree|agrees|agreed|improve|improves|improved|reduce|reduces|reduced|establish|establishes|established|claim|claims|claimed|require|requires|required|indicate|indicates|indicated|design|designs|designed|suppose|supposes|supposed|maintain|maintains|maintained|determine|determines|determined|prepare|prepares|prepared|achieve|achieves|achieved|seek|seeks|sought|obtain|obtains|obtained|occur|occurs|occurred|involve|involves|involved|represent|represents|represented|publish|publishes|published|recognize|recognizes|recognized|describe|describes|described|compare|compares|compared|identify|identifies|identified|choose|chooses|chose|chosen|develop|develops|developed|report|reports|reported|result|results|resulted|threatens|challenges|confronts|blocks|menaces|assaults|engages|attacks|approaches|greets|welcomes|invites|requests|offers|proposes|presents|appears|emerges|reveals|unfolds|awaits|suggests|provides|delivers|becomes|puzzles|confuses|bewilders|intrigues|fascinates|captivates|demands|manifests|materializes|transforms|progresses|advances|evolves|activates|functions|operates|performs|executes|processes|glows|shimmers|pulses|radiates|emanates|flows|surges|channels|weaves|manipulates|controls|directs|shapes|forms)\b/i;
      const hasVerb = commonVerbs.test(sent);
      
      if (!hasVerb && words.length < 5) {
        return false;
      }

      if (hasVerb) {
        const subjectVerbAgreementPatterns = [
          /\b(they|these|those|we|you)\s+(is|was|has|does)\b/i,
          /\b(he|she|it|this|that|one)\s+(are|were|have|do)\b/i,
          /\b(things|items|events|situations|people|characters)\s+(is|was|has|does)\b/i,
          /\b(thing|item|event|situation|person|character)\s+(are|were|have|do)\b/i
        ];

        for (const pattern of subjectVerbAgreementPatterns) {
          if (pattern.test(sent)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Validate coherence between title and description
   */
  private validateCoherence(title: string, description: string, type: string): boolean {
    const titleWords = title.toLowerCase().split(/\s+/);
    const descriptionLower = description.toLowerCase();
    
    const meaningfulTitleWords = titleWords.filter(w => w.length > 3);
    if (meaningfulTitleWords.length > 0) {
      const hasCommonWord = meaningfulTitleWords.some(word => descriptionLower.includes(word));
      if (!hasCommonWord && meaningfulTitleWords.length > 1) {
        return false;
      }
    }
    
    const genericPhrases = ['something happened', 'an event occurs', 'you find yourself'];
    const isTooGeneric = genericPhrases.some(phrase => descriptionLower.includes(phrase));
    if (isTooGeneric) {
      return false;
    }
    
    if (description.length < 20) {
      return false;
    }
    
    return true;
  }

  /**
   * Generate tags for the event
   */
  private generateTags(type: string, context: AnalyzedContext): string[] {
    const tags = [type.toLowerCase()];

    if (context.wealthTier !== 'moderate') {
      tags.push(context.wealthTier);
    }

    if (context.lifeStage !== 'adult') {
      tags.push(context.lifeStage);
    }

    if (context.careerPath && context.careerPath !== 'adventurer') {
      tags.push(context.careerPath.toLowerCase());
    }

    const thematicTags = ['adventure', 'danger', 'opportunity', 'intrigue', 'discovery'];
    if (this.chance.bool({ likelihood: 40 })) {
      tags.push(this.chance.pickone(thematicTags));
    }

    return tags;
  }

  /**
   * Update generator with new training data
   */
  updateTrainingData(texts: string[]): void {
    this.markovEngine.addData(texts);
  }

  /**
   * Get generator statistics
   */
  getStats(): {
    markovStats: any;
    contextAnalysisEnabled: boolean;
    options: GeneratorOptions;
  } {
    return {
      markovStats: this.markovEngine.getStats(),
      contextAnalysisEnabled: true,
      options: this.options
    };
  }
}