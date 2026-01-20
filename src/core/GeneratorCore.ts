// RPG Event Generator v3.0.0 - Core Generator
// Main event generation logic combining all components

import { Chance } from 'chance';
import { Event, PlayerContext, Choice, Effect, AnalyzedContext } from '../types';
import { IGeneratorCore } from '../interfaces';
import { MarkovEngine } from './MarkovEngine';
import { ContextAnalyzer } from './ContextAnalyzer';
import { DIFFICULTY_SETTINGS, DEFAULT_CONTEXT, TIME_CONSTANTS } from '../utils';

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
  debug?: boolean; // Enable debug logging
}

export class GeneratorCore implements IGeneratorCore {
  private chance: Chance.Chance;
  private markovEngine: MarkovEngine;
  private contextAnalyzer: ContextAnalyzer;
  private options: GeneratorOptions;

  constructor(options: GeneratorOptions = {}) {
    this.options = options;
    this.chance = options.chance || new Chance();
    this.markovEngine = new MarkovEngine({ stateSize: options.stateSize });
    this.contextAnalyzer = new ContextAnalyzer();

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
    
    // Generate title and description with shared context to ensure coherence
    const generationContext = {
      type,
      analyzedContext,
      contextModifiers,
      difficulty
    };
    
    let title = this.generateTitle(type, analyzedContext, generationContext);
    let description = this.generateDescription(title, type, analyzedContext, generationContext);
    
    // Validate coherence and regenerate if needed
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

    if (customProps.length > 0 && this.chance.bool({ likelihood: 40 })) {
      const randomProp = this.chance.pickone(customProps);
      const propValue = context[randomProp];
      if (typeof propValue === 'string' && propValue.length > 0 && propValue.length < 15) {
        title = `${adjective} ${propValue.charAt(0).toUpperCase() + propValue.slice(1)} ${noun}`;
      } else if (typeof propValue === 'number' && propValue > 0 && this.chance.bool({ likelihood: 25 })) {
        title = `${adjective} ${noun} of ${propValue}`;
      }
    }

    if (this.chance.bool({ likelihood: 25 })) {
      const suffixNoun = this.generateMeaningfulNoun(type, context);
      const suffixTemplates = [
        ` in the ${suffixNoun}`, ` of ${suffixNoun}`, ` ${suffixNoun}`, ` Beyond ${suffixNoun}`,
        ` ${suffixNoun} Revealed`, ` ${suffixNoun} Awakened`, ` ${suffixNoun} Unleashed`,
        ` ${suffixNoun} Rising`, ` ${suffixNoun} Falling`, ` ${suffixNoun} Eternal`,
        ` ${suffixNoun} Lost`, ` ${suffixNoun} Found`, ` ${suffixNoun} Hidden`,
        ` ${suffixNoun} Forbidden`, ` ${suffixNoun} Sacred`, ` ${suffixNoun} Cursed`,
        ` ${suffixNoun} Blessed`, ` ${suffixNoun} Ancient`, ` ${suffixNoun} New`,
        ` ${suffixNoun} Old`, ` ${suffixNoun} Dark`, ` ${suffixNoun} Light`,
        ` ${suffixNoun} Shadow`, ` ${suffixNoun} Flame`, ` ${suffixNoun} Storm`,
        ` ${suffixNoun} Wind`, ` ${suffixNoun} Earth`, ` ${suffixNoun} Sea`,
        ` ${suffixNoun} Sky`, ` ${suffixNoun} Star`, ` ${suffixNoun} Moon`,
        ` ${suffixNoun} Sun`, ` ${suffixNoun} Dawn`, ` ${suffixNoun} Dusk`,
        ` ${suffixNoun} Night`, ` ${suffixNoun} Day`, ` ${suffixNoun} Winter`,
        ` ${suffixNoun} Spring`, ` ${suffixNoun} Summer`, ` ${suffixNoun} Autumn`
      ];
      title += this.chance.pickone(suffixTemplates);
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
      'Event', 'Occurrence', 'Situation', 'Happening', 'Incident', 'Affair',
      'Episode', 'Experience', 'Encounter', 'Circumstance', 'Condition', 'State',
      'Matter', 'Issue', 'Case', 'Subject', 'Topic', 'Theme', 'Motif', 'Element'
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
   * Generate event description with coherence to title and context awareness
   */
  private generateDescription(
    title: string,
    type: string,
    context: AnalyzedContext,
    generationContext?: any
  ): string {
    const titleWords = title.split(/\s+/);
    const noun = this.extractNounFromTitle(titleWords);
    const adjective = titleWords[0];
    
    const article = this.getArticle(noun);
    const descriptionTemplates = [
      `You encounter ${article} ${noun.toLowerCase()} that ${this.getActionForType(type)}.`,
      `A ${adjective.toLowerCase()} ${noun.toLowerCase()} ${this.getActionForType(type)} before you.`,
      `The ${noun.toLowerCase()} ${this.getActionForType(type)} in an unexpected way.`,
      `An opportunity involving ${article} ${noun.toLowerCase()} ${this.getActionForType(type)}.`,
      `You discover ${article} ${noun.toLowerCase()} that ${this.getActionForType(type)}.`,
      `A ${adjective.toLowerCase()} ${noun.toLowerCase()} ${this.getActionForType(type)} requiring your attention.`,
      `The ${noun.toLowerCase()} ${this.getActionForType(type)} and demands a response.`,
      `You find yourself facing ${article} ${noun.toLowerCase()} that ${this.getActionForType(type)}.`,
      `An ${adjective.toLowerCase()} ${noun.toLowerCase()} ${this.getActionForType(type)} in your path.`,
      `The ${noun.toLowerCase()} ${this.getActionForType(type)} with ${adjective.toLowerCase()} implications.`
    ];

    let description = this.chance.pickone(descriptionTemplates);

    const markovStats = this.markovEngine.getStats();
    if (markovStats.totalTransitions > 0) {
      const markovContext = {
        powerLevel: context.powerLevel,
        complexity: context.powerLevel > 50 ? 80 : 50,
        type: type.toLowerCase(),
        titleKeywords: [noun.toLowerCase(), adjective.toLowerCase()]
      };
      
      const markovResult = this.markovEngine.generateContextual(markovContext, type.toLowerCase());
      if (markovResult.string.length > 20) {
        description += ' ' + markovResult.string;
      }
    }

    if (context.wealthTier === 'poor' && this.chance.bool({ likelihood: 30 })) {
      description += ' Your limited resources make this particularly challenging.';
    }

    if (context.wealthTier === 'rich' && this.chance.bool({ likelihood: 20 })) {
      description += ' Your wealth and influence may open doors that others cannot access.';
    }

    if (context.lifeStage === 'elder' && this.chance.bool({ likelihood: 20 })) {
      description += ' Drawing on your extensive experience may prove valuable here.';
    }

    if (context.lifeStage === 'youth' && this.chance.bool({ likelihood: 20 })) {
      description += ' Your youthful energy and enthusiasm could be an advantage.';
    }

    if (type === 'COMBAT' && context.skillProfile.combat > 50) {
      description += ' Your combat expertise gives you an edge in this situation.';
    }

    if (type === 'SOCIAL' && context.skillProfile.social > 50) {
      description += ' Your social skills may help navigate this encounter.';
    }

    return description;
  }

  private extractNounFromTitle(titleWords: string[]): string {
    const skipWords = ['in', 'the', 'of', 'beyond', 'revealed', 'awakened', 'unleashed', 'rising', 'falling', 'eternal', 'lost', 'found', 'hidden', 'forbidden', 'sacred', 'cursed', 'blessed', 'ancient', 'new', 'old', 'dark', 'light', 'shadow', 'flame', 'storm', 'wind', 'earth', 'sea', 'sky', 'star', 'moon', 'sun', 'dawn', 'dusk', 'night', 'day', 'winter', 'spring', 'summer', 'autumn'];
    
    for (let i = titleWords.length - 1; i >= 0; i--) {
      const word = titleWords[i];
      if (word.length > 3 && !skipWords.includes(word.toLowerCase())) {
        return word;
      }
    }
    
    return titleWords[titleWords.length - 1] || 'Event';
  }

  private getArticle(word: string): string {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const firstLetter = word.toLowerCase().charAt(0);
    return vowels.includes(firstLetter) ? 'an' : 'a';
  }

  private getActionForType(type: string): string {
    const actions: { [key: string]: string[] } = {
      COMBAT: ['threatens', 'challenges', 'confronts', 'attacks', 'menaces', 'assaults', 'engages', 'battles', 'fights', 'wars'],
      SOCIAL: ['approaches', 'greets', 'welcomes', 'invites', 'requests', 'offers', 'proposes', 'suggests', 'presents', 'introduces'],
      EXPLORATION: ['appears', 'emerges', 'reveals', 'unfolds', 'develops', 'progresses', 'advances', 'unveils', 'displays', 'shows'],
      ECONOMIC: ['offers', 'presents', 'proposes', 'suggests', 'provides', 'delivers', 'supplies', 'furnishes', 'grants', 'bestows'],
      MYSTERY: ['puzzles', 'confuses', 'bewilders', 'perplexes', 'baffles', 'mystifies', 'intrigues', 'fascinates', 'captivates', 'enthralls'],
      SUPERNATURAL: ['manifests', 'appears', 'materializes', 'emerges', 'reveals', 'unfolds', 'transforms', 'changes', 'shifts', 'alters'],
      POLITICAL: ['develops', 'unfolds', 'progresses', 'advances', 'evolves', 'transforms', 'changes', 'shifts', 'moves', 'proceeds'],
      TECHNOLOGICAL: ['activates', 'functions', 'operates', 'works', 'runs', 'performs', 'executes', 'processes', 'handles', 'manages'],
      MAGIC: ['glows', 'shimmers', 'pulses', 'radiates', 'emanates', 'flows', 'surges', 'waves', 'ripples', 'vibrates'],
      SPELLCASTING: ['channels', 'weaves', 'manipulates', 'controls', 'directs', 'guides', 'shapes', 'forms', 'creates', 'generates']
    };

    const typeActions = actions[type] || ['occurs', 'happens', 'takes place', 'unfolds', 'develops', 'progresses'];
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
    const choiceTexts = {
      COMBAT: ['Fight bravely', 'Attempt to flee', 'Negotiate', 'Use strategy'],
      SOCIAL: ['Be diplomatic', 'Be assertive', 'Listen carefully', 'Change the subject'],
      EXPLORATION: ['Investigate', 'Proceed cautiously', 'Call for help', 'Turn back'],
      ECONOMIC: ['Accept the deal', 'Negotiate better terms', 'Decline politely', 'Make a counteroffer']
    };

    const texts = choiceTexts[type as keyof typeof choiceTexts] || ['Accept', 'Decline', 'Investigate', 'Ignore'];
    const text = texts[index % texts.length];

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
   * Validate coherence between title and description
   */
  private validateCoherence(title: string, description: string, type: string): boolean {
    // Basic coherence checks
    const titleWords = title.toLowerCase().split(/\s+/);
    const descriptionLower = description.toLowerCase();
    
    // Check if description contains at least one meaningful word from title
    const meaningfulTitleWords = titleWords.filter(w => w.length > 3);
    if (meaningfulTitleWords.length > 0) {
      const hasCommonWord = meaningfulTitleWords.some(word => descriptionLower.includes(word));
      if (!hasCommonWord && meaningfulTitleWords.length > 1) {
        // Allow if at least one word matches
        return false;
      }
    }
    
    // Check if description is not too generic
    const genericPhrases = ['something happened', 'an event occurs', 'you find yourself'];
    const isTooGeneric = genericPhrases.some(phrase => descriptionLower.includes(phrase));
    if (isTooGeneric) {
      return false;
    }
    
    // Check minimum length
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