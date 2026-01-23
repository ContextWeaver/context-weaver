// RPG Event Generator v4.0.0 - COMPLETE REBUILD
// Simple, reliable event generation with guaranteed coherent descriptions

import { Chance } from 'chance';
import { Event, PlayerContext, Choice, Effect, AnalyzedContext } from '../types';
import { IGeneratorCore } from '../interfaces';
import { ContextAnalyzer } from './ContextAnalyzer';

export interface GeneratorOptions {
  chance?: Chance.Chance;
  debug?: boolean;
}

export interface TrainingDataOptions {
  titles?: { [eventType: string]: string[] };
  descriptions?: { [eventType: string]: string[] };
  choices?: { [eventType: string]: string[] };
  texts?: string[];
}

export class GeneratorCore implements IGeneratorCore {
  private chance: Chance.Chance;
  private contextAnalyzer: ContextAnalyzer;
  private options: GeneratorOptions;

  private customTitles: { [theme: string]: { [type: string]: string[] } } = {};
  private customDescriptions: { [theme: string]: { [type: string]: string[] } } = {};
  private customChoices: { [theme: string]: { [type: string]: string[] } } = {};

  constructor(options: GeneratorOptions = {}) {
    this.options = options;
    this.chance = options.chance || new Chance();
    this.contextAnalyzer = new ContextAnalyzer();
  }

  /**
   * Generate a complete event - CLEAN AND SIMPLE
   */
  generateEvent(playerContext: PlayerContext = {}): Event {
    const analyzedContext = this.contextAnalyzer.analyzeContext(playerContext);

    const id = this.generateEventId();
    const type = this.selectEventType(analyzedContext);
    const difficulty = this.calculateDifficulty(analyzedContext);

    const title = this.generateTitle(type, analyzedContext);
    const description = this.generateDescription(title, type, analyzedContext);

    const choices = this.generateChoices(type, difficulty, analyzedContext);

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

  /**
   * Add training data - allows users to extend the generator with custom content
   * Supports both simple text training and structured custom content
   */
  addTrainingData(data: string[] | TrainingDataOptions, theme: string = 'default'): void {
    if (typeof data === 'object' && !Array.isArray(data)) {
      const options = data as TrainingDataOptions;

      if (options.titles) {
        if (!this.customTitles[theme]) this.customTitles[theme] = {};
        Object.assign(this.customTitles[theme], options.titles);
      }

      if (options.descriptions) {
        if (!this.customDescriptions[theme]) this.customDescriptions[theme] = {};
        Object.assign(this.customDescriptions[theme], options.descriptions);
      }

      if (options.choices) {
        if (!this.customChoices[theme]) this.customChoices[theme] = {};
        Object.assign(this.customChoices[theme], options.choices);
      }

      if (options.texts) {
        this.processRawTrainingTexts(options.texts, theme);
      }

      return;
    }

    if (Array.isArray(data)) {
      this.processRawTrainingTexts(data, theme);
    }
  }

  /**
   * Process raw training texts for backward compatibility
   * 
   * @deprecated This method is a no-op for backward compatibility. The v4.0.0 architecture
   * uses structured content (titles, descriptions, choices) instead of raw text strings.
   * Use addTrainingData with structured options instead.
   * 
   * @param texts - Array of raw training text strings (not used)
   * @param theme - Theme identifier (not used)
   */
  private processRawTrainingTexts(texts: string[], theme: string): void {
    // No-op: v4.0.0 uses structured content (titles, descriptions, choices)
    // This method exists only for backward compatibility with the old API
    if (this.options.debug) {
      console.warn(`[GeneratorCore] Raw training texts are not supported in v4.0.0. Use structured content (titles, descriptions, choices) instead. Received ${texts.length} texts for theme '${theme}' which will be ignored.`);
    }
  }

  /**
   * Add contextual enhancements to descriptions based on player context
   * 
   * Adds prefixes for location (70% chance), weather (60%), time of day (50%),
   * and class/race (40%) to make descriptions more immersive.
   * 
   * @param description - Base description to enhance
   * @param context - Analyzed player context containing location, weather, timeOfDay, class, race
   * @returns Enhanced description with contextual prefixes when applicable
   */
  private addContextualEnhancements(description: string, context: AnalyzedContext): string {
    const contextEnhancements: string[] = [];

    if (context.location && this.chance.bool({ likelihood: 70 })) {
      const locationPrefixes = [
        `In the ${context.location}, `,
        `Deep within the ${context.location}, `,
        `From the heart of the ${context.location}, `,
        `At the edge of the ${context.location}, `,
        `Beneath the ${context.location}, `,
        `Above the ${context.location}, `,
        `Within the shadows of the ${context.location}, `,
        `Amidst the ruins of the ${context.location}, `,
        `At the center of the ${context.location}, `,
        `Surrounded by the ${context.location}, `
      ];
      contextEnhancements.push(this.chance.pickone(locationPrefixes));
    }

    if (context.weather && this.chance.bool({ likelihood: 60 })) {
      const weatherPrefixes = {
        sunny: [
          'Under the brilliant sun, ',
          'Beneath clear blue skies, ',
          'In the warm sunlight, ',
          'Bathed in golden daylight, '
        ],
        rainy: [
          'Through the pouring rain, ',
          'Amidst the stormy downpour, ',
          'In the relentless rain, ',
          'Under darkening clouds, '
        ],
        cloudy: [
          'Beneath overcast skies, ',
          'In the gloomy overcast, ',
          'Under clouded heavens, ',
          'Within the misty clouds, '
        ],
        snowy: [
          'Through the falling snow, ',
          'In the winter blizzard, ',
          'Amidst the snowstorm, ',
          'Under snow-laden skies, '
        ],
        stormy: [
          'During the raging storm, ',
          'Amidst thunder and lightning, ',
          'In the heart of the tempest, ',
          'Beneath storm-tossed skies, '
        ],
        foggy: [
          'Within the thick fog, ',
          'Through the mysterious mist, ',
          'In the enveloping haze, ',
          'Amidst the foggy shroud, '
        ],
        windy: [
          'Against the howling wind, ',
          'In the gusting breeze, ',
          'Amidst the windy gale, ',
          'Under blustering skies, '
        ]
      };
      const weatherOptions = weatherPrefixes[context.weather as keyof typeof weatherPrefixes] || ['In this weather, '];
      contextEnhancements.push(this.chance.pickone(weatherOptions));
    }

    if (context.timeOfDay && this.chance.bool({ likelihood: 50 })) {
      const timePrefixes = {
        dawn: [
          'At the break of dawn, ',
          'In the early morning light, ',
          'As the sun first rises, ',
          'During the dawn hours, '
        ],
        morning: [
          'In the morning hours, ',
          'During the bright morning, ',
          'Under the morning sun, ',
          'In the early daylight, '
        ],
        noon: [
          'At the height of noon, ',
          'Under the midday sun, ',
          'In the noon heat, ',
          'During midday brightness, '
        ],
        afternoon: [
          'In the afternoon light, ',
          'During the waning afternoon, ',
          'Under the afternoon sun, ',
          'In the late daylight, '
        ],
        dusk: [
          'As dusk approaches, ',
          'In the fading light, ',
          'During the evening twilight, ',
          'At dusk\'s edge, '
        ],
        evening: [
          'In the evening hours, ',
          'During the gathering darkness, ',
          'Under evening skies, ',
          'In the night\'s approach, '
        ],
        night: [
          'Deep in the night, ',
          'Under starry skies, ',
          'In the midnight hour, ',
          'During the dark night, '
        ],
        midnight: [
          'At the stroke of midnight, ',
          'In the dead of night, ',
          'During midnight darkness, ',
          'At the midnight hour, '
        ]
      };
      const timeOptions = timePrefixes[context.timeOfDay as keyof typeof timePrefixes] || ['At this hour, '];
      contextEnhancements.push(this.chance.pickone(timeOptions));
    }

    if ((context.class || context.race) && this.chance.bool({ likelihood: 40 })) {
      if (context.class) {
        const classContexts = {
          fighter: ['As a warrior, ', 'In your martial tradition, ', 'Drawing on your combat experience, '],
          mage: ['With your arcane knowledge, ', 'Using your magical insight, ', 'Through your spellcasting wisdom, '],
          rogue: ['With your cunning instincts, ', 'Using your stealthy experience, ', 'Drawing on your shadowy skills, '],
          cleric: ['Through your divine connection, ', 'With your spiritual guidance, ', 'Using your holy wisdom, '],
          necromancer: ['With your deathly arts, ', 'Through your necrotic knowledge, ', 'Using your dark magic, ']
        };
        const classOptions = classContexts[context.class as keyof typeof classContexts] || [`As a ${context.class}, `];
        contextEnhancements.push(this.chance.pickone(classOptions));
      } else if (context.race) {
        const raceContexts = {
          human: ['In the human tradition, ', 'Drawing on human ingenuity, ', 'With human determination, '],
          elf: ['With elven grace, ', 'Using elven wisdom, ', 'Through elven perception, '],
          dwarf: ['With dwarven strength, ', 'Using dwarven craftsmanship, ', 'Through dwarven endurance, '],
          halfling: ['With halfling luck, ', 'Using halfling cunning, ', 'Through halfling resourcefulness, '],
          orc: ['With orcish fury, ', 'Using orcish strength, ', 'Through orcish determination, ']
        };
        const raceOptions = raceContexts[context.race as keyof typeof raceContexts] || [`As a ${context.race}, `];
        contextEnhancements.push(this.chance.pickone(raceOptions));
      }
    }

    if (contextEnhancements.length > 0) {
      const selectedEnhancement = this.chance.pickone(contextEnhancements);
      description = selectedEnhancement + description.charAt(0).toLowerCase() + description.slice(1);
    }
    
    return description;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Select appropriate event type based on context
   * 
   * @param context - Analyzed player context (currently all types are equally likely)
   * @returns A randomly selected event type from the available types
   */
  private selectEventType(context: AnalyzedContext): string {
    const types = [
      'ADVENTURE', 'COMBAT', 'ECONOMIC', 'EXPLORATION', 'GUILD', 'MAGIC', 'MYSTERY',
      'POLITICAL', 'QUEST', 'SOCIAL', 'SPELLCASTING', 'SUPERNATURAL', 'TECHNOLOGICAL', 'UNDERWORLD'
    ];

    return this.chance.pickone(types);
  }

  /**
   * Calculate event difficulty based on player power level
   * 
   * @param context - Analyzed player context containing powerLevel
   * @returns Difficulty level: 'easy', 'moderate', 'hard', or 'extreme'
   */
  private calculateDifficulty(context: AnalyzedContext): string {
    const powerLevel = context.powerLevel || 50;

    if (powerLevel <= 25) return 'easy';
    if (powerLevel <= 50) return 'normal';
    if (powerLevel <= 75) return 'hard';
    return 'legendary';
  }

  /**
   * Generate event title from content library or custom themes
   * 
   * @param type - Event type (e.g., 'COMBAT', 'SOCIAL', 'MAGIC')
   * @param context - Analyzed player context for potential customization
   * @returns A randomly selected title matching the event type
   */
  private generateTitle(type: string, context: AnalyzedContext): string {
    // Check all available themes for custom titles, prioritizing 'default'
    const themesToCheck = ['default', ...Object.keys(this.customTitles).filter(k => k !== 'default')];
    
    for (const theme of themesToCheck) {
      const customThemeTitles = this.customTitles[theme];
      if (customThemeTitles && customThemeTitles[type] && customThemeTitles[type].length > 0) {
        return this.chance.pickone(customThemeTitles[type]);
      }
    }

    const titles: { [key: string]: string[] } = {
      COMBAT: [
        'Dangerous Encounter', 'Hostile Confrontation', 'Violent Clash', 'Deadly Battle',
        'Fierce Combat', 'Brutal Fight', 'Savage Struggle', 'Ruthless Conflict',
        'Armed Assault', 'Bloody Skirmish', 'Savage Attack', 'Lethal Ambush',
        'Merciless Onslaught', 'Vicious Brawl', 'Fatal Duel', 'Wicked Melee',
        'Barbaric Confrontation', 'Ferocious Battle', 'Grim Struggle', 'Dire Combat',
        'Treacherous Fight', 'Nasty Scuffle', 'Cruel Clash', 'Malicious Encounter',
        'Sinister Battle', 'Dark Confrontation', 'Evil Clash', 'Shadowy Fight',
        'Phantom Attack', 'Ghostly Assault', 'Spectral Battle', 'Ethereal Conflict',
        'Arcane Duel', 'Magical Combat', 'Enchanted Fight', 'Cursed Battle',
        'Divine Struggle', 'Holy War', 'Sacred Combat', 'Blessed Conflict',
        'Demonic Onslaught', 'Infernal Battle', 'Hellish Fight', 'Fiendish Assault',
        'Celestial Combat', 'Heavenly Clash', 'Angelic Battle', 'Divine Confrontation',
        'Elemental Fury', 'Primal Rage', 'Natural Assault', 'Wild Attack',
        'Beast Rampage', 'Monster Assault', 'Creature Attack', 'Wildlife Onslaught'
      ],
      SOCIAL: [
        'Unexpected Meeting', 'Friendly Conversation', 'Important Discussion', 'Social Gathering',
        'Personal Encounter', 'Meaningful Dialogue', 'Social Opportunity', 'Personal Interaction',
        'Noble Reception', 'Courtly Introduction', 'Diplomatic Exchange', 'Royal Audience',
        'Tavern Chat', 'Inn Conversation', 'Market Discussion', 'Street Encounter',
        'Scholarly Debate', 'Academic Discourse', 'Intellectual Exchange', 'Learned Discussion',
        'Romantic Rendezvous', 'Love Affair', 'Heartfelt Confession', 'Passionate Meeting',
        'Family Reunion', 'Blood Relation', 'Kinship Meeting', 'Ancestral Gathering',
        'Business Negotiation', 'Trade Discussion', 'Commercial Deal', 'Merchant Meeting',
        'Political Alliance', 'Diplomatic Summit', 'Treaty Discussion', 'Alliance Formation',
        'Religious Ceremony', 'Spiritual Gathering', 'Faith Discussion', 'Divine Meeting',
        'Military Briefing', 'Strategic Discussion', 'Tactical Meeting', 'Combat Planning',
        'Artistic Collaboration', 'Creative Partnership', 'Cultural Exchange', 'Performance Discussion',
        'Medical Consultation', 'Healing Session', 'Health Discussion', 'Wellness Meeting',
        'Legal Matter', 'Judicial Hearing', 'Court Proceeding', 'Justice Meeting',
        'Educational Session', 'Teaching Moment', 'Learning Discussion', 'Knowledge Exchange',
        'Exploration Planning', 'Adventure Discussion', 'Journey Meeting', 'Discovery Talk',
        'Mystical Revelation', 'Arcane Discussion', 'Magical Meeting', 'Supernatural Exchange'
      ],
      EXPLORATION: [
        'Hidden Discovery', 'Unknown Territory', 'Mysterious Location', 'Ancient Secret',
        'Forgotten Place', 'New Exploration', 'Hidden Path', 'Secret Location',
        'Lost Civilization', 'Ancient Ruins', 'Forgotten Temple', 'Buried Treasure',
        'Hidden Cave', 'Secret Passage', 'Concealed Chamber', 'Veiled Sanctuary',
        'Uncharted Island', 'Mysterious Peninsula', 'Unknown Continent', 'New World',
        'Deep Abyss', 'Bottomless Pit', 'Endless Cavern', 'Infinite Depths',
        'Floating Castle', 'Sky Palace', 'Cloud Citadel', 'Aerial Fortress',
        'Underwater City', 'Submerged Ruins', 'Aquatic Temple', 'Marine Sanctuary',
        'Volcanic Chamber', 'Lava Cave', 'Fire Temple', 'Inferno Depths',
        'Frozen Wasteland', 'Ice Palace', 'Snow Citadel', 'Glacial Chamber',
        'Enchanted Forest', 'Magical Grove', 'Fey Woodland', 'Arcane Thicket',
        'Desert Oasis', 'Sand Temple', 'Dune Palace', 'Mirage Chamber',
        'Mountain Peak', 'Summit Temple', 'Cliff Sanctuary', 'Alpine Citadel',
        'Jungle Ruin', 'Vine Temple', 'Tropical Palace', 'Rainforest Chamber',
        'Space Station', 'Orbital Platform', 'Cosmic Outpost', 'Stellar Citadel',
        'Time Rift', 'Temporal Anomaly', 'Chronal Chamber', 'Eternal Passage',
        'Pocket Dimension', 'Miniature World', 'Parallel Realm', 'Alternate Plane',
        'Crystal Cavern', 'Gem Chamber', 'Mineral Palace', 'Ore Citadel'
      ],
      ECONOMIC: [
        'Profitable Opportunity', 'Financial Deal', 'Business Venture', 'Economic Chance',
        'Wealth Opportunity', 'Trade Deal', 'Financial Gain', 'Business Opportunity',
        'Golden Investment', 'Lucrative Venture', 'Money-Making Scheme', 'Wealth-Building Deal',
        'Merchant Caravan', 'Trade Expedition', 'Commercial Journey', 'Business Voyage',
        'Bank Transaction', 'Financial Transfer', 'Monetary Exchange', 'Coin Deal',
        'Property Acquisition', 'Land Purchase', 'Estate Deal', 'Territory Sale',
        'Investment Portfolio', 'Asset Management', 'Wealth Preservation', 'Financial Planning',
        'Market Speculation', 'Stock Trading', 'Commodity Exchange', 'Goods Trading',
        'Loan Agreement', 'Credit Arrangement', 'Debt Settlement', 'Financial Obligation',
        'Inheritance Claim', 'Estate Distribution', 'Wealth Transfer', 'Fortune Division',
        'Auction House', 'Bidding War', 'Item Sale', 'Valuable Goods',
        'Treasure Appraisal', 'Gem Evaluation', 'Artifact Assessment', 'Valuable Discovery',
        'Smuggling Operation', 'Contraband Trade', 'Illegal Commerce', 'Black Market Deal',
        'Royal Tax', 'Government Levy', 'Economic Burden', 'Financial Obligation',
        'Mining Claim', 'Resource Extraction', 'Mineral Rights', 'Ore Discovery',
        'Farming Investment', 'Agricultural Venture', 'Crop Deal', 'Harvest Opportunity',
        'Art Commission', 'Creative Sale', 'Craftsmanship Deal', 'Artisan Opportunity',
        'Shipping Contract', 'Transportation Deal', 'Logistics Agreement', 'Supply Chain',
        'Bankruptcy Crisis', 'Financial Ruin', 'Economic Disaster', 'Wealth Loss'
      ],
      MYSTERY: [
        'Strange Occurrence', 'Mysterious Event', 'Puzzling Situation', 'Enigmatic Discovery',
        'Curious Mystery', 'Weird Phenomenon', 'Strange Mystery', 'Intriguing Puzzle',
        'Baffling Enigma', 'Confusing Riddle', 'Perplexing Problem', 'Cryptic Clue',
        'Hidden Message', 'Secret Code', 'Encoded Mystery', 'Veiled Secret',
        'Ghostly Apparition', 'Spectral Vision', 'Phantom Presence', 'Ethereal Mystery',
        'Ancient Prophecy', 'Forgotten Oracle', 'Mystic Prediction', 'Divine Riddle',
        'Cursed Artifact', 'Hexed Relic', 'Bewitched Object', 'Enchanted Mystery',
        'Disappearing Act', 'Vanishing Trick', 'Sudden Disappearance', 'Mysterious Vanishing',
        'Impossible Crime', 'Unsolvable Murder', 'Perfect Mystery', 'Crime Enigma',
        'Time Paradox', 'Temporal Anomaly', 'Chronal Mystery', 'Time Riddle',
        'Dimension Breach', 'Reality Tear', 'Planar Mystery', 'World Enigma',
        'Forbidden Knowledge', 'Secret Wisdom', 'Hidden Truth', 'Veiled Understanding',
        'Lost Civilization', 'Ancient Mystery', 'Forgotten People', 'Buried Secret',
        'Alien Artifact', 'Extraterrestrial Mystery', 'Cosmic Enigma', 'Stellar Riddle',
        'Psychic Phenomenon', 'Mental Mystery', 'Thought Enigma', 'Mind Riddle',
        'Supernatural Event', 'Paranormal Mystery', 'Occult Enigma', 'Arcane Riddle',
        'Cursed Location', 'Hexed Place', 'Bewitched Site', 'Enchanted Mystery',
        'Haunted Ground', 'Ghostly Place', 'Spectral Location', 'Phantom Site',
        'Mysterious Illness', 'Strange Disease', 'Enigmatic Affliction', 'Puzzling Plague',
        'Unexplained Death', 'Mysterious Demise', 'Strange Passing', 'Enigmatic End'
      ],
      SUPERNATURAL: [
        'Otherworldly Manifestation', 'Supernatural Event', 'Mystical Occurrence', 'Ethereal Presence',
        'Arcane Phenomenon', 'Supernatural Manifestation', 'Mystical Event', 'Otherworldly Occurrence',
        'Spectral Vision', 'Ghostly Apparition', 'Phantom Presence', 'Spirit Manifestation',
        'Divine Intervention', 'Heavenly Visit', 'Angelic Appearance', 'Celestial Event',
        'Demonic Possession', 'Infernal Invasion', 'Hellish Manifestation', 'Diabolic Event',
        'Elemental Fury', 'Nature Spirit', 'Wild Magic', 'Primal Force',
        'Time Distortion', 'Temporal Anomaly', 'Chronal Shift', 'Time Warp',
        'Reality Breach', 'Dimensional Tear', 'Planar Rift', 'World Fracture',
        'Soul Echo', 'Life Force', 'Spiritual Energy', 'Astral Projection',
        'Cursed Awakening', 'Hexed Revival', 'Bewitched Animation', 'Enchanted Life',
        'Prophetic Vision', 'Fateful Dream', 'Destiny Revelation', 'Oracle Message',
        'Blood Ritual', 'Sacrificial Ceremony', 'Dark Summoning', 'Necrotic Ritual',
        'Crystal Power', 'Gem Resonance', 'Mineral Magic', 'Stone Spirit',
        'Storm Summoning', 'Weather Control', 'Atmospheric Magic', 'Climate Shift',
        'Shadow Manipulation', 'Darkness Control', 'Void Energy', 'Abyss Power',
        'Light Manifestation', 'Radiant Energy', 'Holy Power', 'Divine Light',
        'Dream Invasion', 'Nightmare Realm', 'Sleep Magic', 'Mental Realm',
        'Mirror World', 'Reflection Magic', 'Duplicate Reality', 'Parallel Self',
        'Voice from Beyond', 'Ancient Whisper', 'Forgotten Echo', 'Lost Message',
        'Forbidden Power', 'Taboo Magic', 'Banned Ritual', 'Prohibited Force'
      ],
      POLITICAL: [
        'Political Intrigue', 'Diplomatic Matter', 'Political Situation', 'Governmental Affair',
        'Political Opportunity', 'Diplomatic Challenge', 'Political Matter', 'Governmental Issue',
        'Royal Decree', 'King\'s Command', 'Monarch\'s Order', 'Sovereign Directive',
        'Court Conspiracy', 'Palace Plot', 'Throne Intrigue', 'Royal Conspiracy',
        'Senate Session', 'Council Meeting', 'Parliament Debate', 'Assembly Gathering',
        'Election Campaign', 'Political Race', 'Leadership Contest', 'Power Struggle',
        'Treaty Negotiation', 'Peace Accord', 'Alliance Formation', 'Diplomatic Agreement',
        'Rebellion Threat', 'Revolutionary Movement', 'Uprising Plot', 'Insurrection Plan',
        'Assassination Attempt', 'Murder Plot', 'Regicide Scheme', 'Killing Conspiracy',
        'Succession Crisis', 'Throne Dispute', 'Heir Problem', 'Royal Inheritance',
        'Border Dispute', 'Territorial Conflict', 'Land Claim', 'Boundary Issue',
        'Trade Embargo', 'Economic Sanction', 'Commercial Blockade', 'Market Restriction',
        'Religious Conflict', 'Faith Dispute', 'Sectarian Division', 'Belief Conflict',
        'Military Alliance', 'Defense Pact', 'Strategic Partnership', 'Combat Coalition',
        'Tax Revolt', 'Economic Protest', 'Financial Rebellion', 'Revenue Dispute',
        'Corruption Scandal', 'Bribery Exposure', 'Graft Revelation', 'Embezzlement Affair',
        'Exile Decree', 'Banishment Order', 'Expulsion Command', 'Removal Directive',
        'Amnesty Proclamation', 'Pardon Declaration', 'Forgiveness Decree', 'Mercy Grant',
        'War Declaration', 'Battle Proclamation', 'Combat Announcement', 'Hostility Declaration',
        'Peace Treaty', 'Truce Agreement', 'Ceasefire Accord', 'Armistice Pact'
      ],
      TECHNOLOGICAL: [
        'Technological Discovery', 'Advanced Mechanism', 'Technical Innovation', 'Mechanical Wonder',
        'Technological Device', 'Advanced Technology', 'Technical Marvel', 'Mechanical Device',
        'Steam Engine', 'Power Machine', 'Automated Device', 'Clockwork Mechanism',
        'Electrical Invention', 'Power Grid', 'Energy System', 'Current Flow',
        'Communication Device', 'Message Machine', 'Signal Transmitter', 'Information Relay',
        'Transportation System', 'Travel Device', 'Movement Machine', 'Locomotion Engine',
        'Medical Technology', 'Healing Device', 'Surgical Machine', 'Health Apparatus',
        'Weapon System', 'Combat Technology', 'War Machine', 'Defense Device',
        'Computing Engine', 'Calculation Device', 'Logic Machine', 'Thinking Apparatus',
        'Observation Tool', 'Detection Device', 'Measurement Instrument', 'Analysis Machine',
        'Construction Equipment', 'Building Machine', 'Fabrication Device', 'Manufacturing Tool',
        'Agricultural Technology', 'Farming Machine', 'Harvest Device', 'Cultivation Tool',
        'Mining Equipment', 'Excavation Machine', 'Extraction Device', 'Resource Tool',
        'Navigation System', 'Direction Device', 'Guidance Machine', 'Location Tool',
        'Recording Technology', 'Memory Device', 'Storage Machine', 'Archive System',
        'Lighting System', 'Illumination Device', 'Brightness Machine', 'Glow Technology',
        'Heating Device', 'Temperature Control', 'Climate Machine', 'Thermal System',
        'Cooling Technology', 'Refrigeration Device', 'Cold Machine', 'Freezing System',
        'Flying Machine', 'Aviation Device', 'Flight Technology', 'Airborne System',
        'Submarine Vessel', 'Underwater Craft', 'Deep-Sea Machine', 'Aquatic Technology',
        'Space Technology', 'Orbital Device', 'Cosmic Machine', 'Stellar System'
      ],
      MAGIC: [
        'Magical Manifestation', 'Arcane Event', 'Magical Phenomenon', 'Spell Effect',
        'Magical Occurrence', 'Arcane Manifestation', 'Magical Event', 'Spell Phenomenon',
        'Enchantment Ritual', 'Spellcasting Ceremony', 'Magical Incantation', 'Arcane Ritual',
        'Potion Brewing', 'Elixir Creation', 'Alchemical Mixture', 'Magical Brew',
        'Rune Activation', 'Glyph Power', 'Symbol Magic', 'Sigil Energy',
        'Wand Waving', 'Staff Channeling', 'Rod Power', 'Scepter Command',
        'Crystal Focus', 'Gem Resonance', 'Stone Power', 'Mineral Magic',
        'Elemental Summoning', 'Nature Calling', 'Spirit Invocation', 'Force Manifestation',
        'Illusion Weaving', 'Deception Magic', 'False Reality', 'Trick Spell',
        'Transformation Magic', 'Shape Changing', 'Form Alteration', 'Metamorphosis Spell',
        'Healing Touch', 'Restoration Magic', 'Cure Spell', 'Mending Power',
        'Combat Magic', 'Battle Spells', 'War Enchantment', 'Fighting Sorcery',
        'Protection Ward', 'Defense Magic', 'Shield Spell', 'Guard Enchantment',
        'Divination Ritual', 'Fate Reading', 'Future Vision', 'Prophecy Magic',
        'Necromancy Practice', 'Death Magic', 'Soul Manipulation', 'Life Force Control',
        'Summoning Circle', 'Entity Calling', 'Being Invocation', 'Creature Manifestation',
        'Portal Opening', 'Gate Creation', 'Passage Magic', 'Travel Spell',
        'Weather Control', 'Climate Magic', 'Storm Calling', 'Atmospheric Power',
        'Mind Magic', 'Psychic Power', 'Thought Control', 'Mental Manipulation',
        'Shadow Magic', 'Darkness Power', 'Void Energy', 'Night Force',
        'Light Magic', 'Radiant Power', 'Glow Energy', 'Day Force'
      ],
      SPELLCASTING: [
        'Spellcasting Ritual', 'Magical Incantation', 'Arcane Casting', 'Spell Performance',
        'Magical Ritual', 'Arcane Incantation', 'Spell Ritual', 'Magical Performance',
        'Fireball Conjuration', 'Flame Spell', 'Inferno Casting', 'Blaze Ritual',
        'Ice Lance', 'Frost Spell', 'Cold Casting', 'Freeze Ritual',
        'Lightning Bolt', 'Storm Spell', 'Thunder Casting', 'Electric Ritual',
        'Earthquake Summoning', 'Tremor Spell', 'Ground Casting', 'Seismic Ritual',
        'Water Surge', 'Flood Spell', 'Wave Casting', 'Tidal Ritual',
        'Wind Gust', 'Air Spell', 'Breeze Casting', 'Gale Ritual',
        'Healing Wave', 'Cure Spell', 'Restoration Casting', 'Mending Ritual',
        'Protection Circle', 'Shield Spell', 'Defense Casting', 'Ward Ritual',
        'Invisibility Veil', 'Stealth Spell', 'Concealment Casting', 'Hidden Ritual',
        'Strength Boost', 'Power Spell', 'Enhancement Casting', 'Fortification Ritual',
        'Speed Burst', 'Haste Spell', 'Acceleration Casting', 'Swiftness Ritual',
        'Telekinesis', 'Mind Spell', 'Force Casting', 'Psychic Ritual',
        'Teleportation', 'Blink Spell', 'Travel Casting', 'Movement Ritual',
        'Illusion Creation', 'Deception Spell', 'False Casting', 'Trick Ritual',
        'Summoning Call', 'Entity Spell', 'Being Casting', 'Invocation Ritual',
        'Necrotic Touch', 'Death Spell', 'Decay Casting', 'Rot Ritual',
        'Divine Light', 'Holy Spell', 'Blessing Casting', 'Sacred Ritual',
        'Shadow Step', 'Dark Spell', 'Void Casting', 'Night Ritual',
        'Crystal Focus', 'Gem Spell', 'Mineral Casting', 'Stone Ritual'
      ],
      FIGHTER: [
        'Warrior Challenge', 'Combat Trial', 'Fighting Opportunity', 'Battle Chance',
        'Warrior Encounter', 'Combat Challenge', 'Fighting Trial', 'Battle Opportunity',
        'Arena Combat', 'Gladiator Fight', 'Colosseum Battle', 'Ring Challenge',
        'Duel Request', 'Single Combat', 'One-on-One Fight', 'Personal Challenge',
        'Tournament Entry', 'Competition Fight', 'Championship Battle', 'Contest Challenge',
        'Training Spar', 'Practice Fight', 'Drill Combat', 'Exercise Battle',
        'Weapon Mastery', 'Skill Demonstration', 'Technique Show', 'Combat Display',
        'Honor Duel', 'Reputation Fight', 'Prestige Battle', 'Glory Challenge',
        'Survival Test', 'Endurance Fight', 'Resilience Battle', 'Stamina Challenge',
        'Weapon Choice', 'Arm Selection', 'Equipment Fight', 'Gear Battle',
        'Style Demonstration', 'Fighting Method', 'Combat Technique', 'Battle Approach',
        'Strength Test', 'Power Fight', 'Force Battle', 'Might Challenge',
        'Speed Trial', 'Agility Fight', 'Quickness Battle', 'Swiftness Challenge',
        'Defense Drill', 'Guard Fight', 'Protection Battle', 'Shield Challenge',
        'Attack Practice', 'Offense Fight', 'Striking Battle', 'Assault Challenge',
        'Tactical Combat', 'Strategic Fight', 'Planned Battle', 'Methodical Challenge',
        'Unarmed Fight', 'Barehanded Combat', 'Fist Battle', 'Martial Challenge',
        'Armored Combat', 'Plate Fight', 'Heavy Battle', 'Armored Challenge',
        'Light Combat', 'Agile Fight', 'Swift Battle', 'Mobile Challenge',
        'Mounted Fight', 'Horse Combat', 'Cavalry Battle', 'Riding Challenge',
        'Team Combat', 'Group Fight', 'Squad Battle', 'Unit Challenge'
      ],
      GUILD: [
        'Guild Meeting', 'Organizational Matter', 'Guild Opportunity', 'Group Affair',
        'Guild Meeting', 'Organizational Issue', 'Guild Matter', 'Group Opportunity',
        'Apprentice Initiation', 'Membership Ceremony', 'Joining Ritual', 'Guild Induction',
        'Master Promotion', 'Rank Advancement', 'Status Elevation', 'Level Upgrading',
        'Craft Demonstration', 'Skill Display', 'Technique Show', 'Art Showcase',
        'Trade Negotiation', 'Business Deal', 'Commercial Agreement', 'Economic Pact',
        'Resource Allocation', 'Supply Distribution', 'Material Assignment', 'Goods Sharing',
        'Training Session', 'Skill Teaching', 'Knowledge Transfer', 'Education Meeting',
        'Quality Control', 'Standard Enforcement', 'Craft Regulation', 'Work Inspection',
        'Competition Event', 'Skill Contest', 'Craft Competition', 'Artisan Challenge',
        'Innovation Workshop', 'Creation Session', 'Design Meeting', 'Invention Gathering',
        'Heritage Celebration', 'Tradition Event', 'History Commemoration', 'Legacy Festival',
        'Charity Drive', 'Community Support', 'Aid Campaign', 'Help Initiative',
        'Dispute Resolution', 'Conflict Mediation', 'Problem Solving', 'Issue Settlement',
        'Expansion Planning', 'Growth Strategy', 'Development Meeting', 'Progress Session',
        'Security Briefing', 'Protection Meeting', 'Defense Planning', 'Safety Council',
        'Financial Review', 'Budget Meeting', 'Treasury Session', 'Fund Management',
        'Recruitment Drive', 'Member Search', 'Talent Acquisition', 'New Blood Initiative',
        'Technology Adoption', 'Tool Upgrade', 'Equipment Modernization', 'Gear Improvement',
        'Ethical Debate', 'Moral Discussion', 'Values Meeting', 'Principles Session',
        'International Relations', 'Alliance Building', 'Partnership Formation', 'Cooperation Pact'
      ],
      UNDERWORLD: [
        'Criminal Activity', 'Illegal Operation', 'Underground Deal', 'Criminal Matter',
        'Illegal Activity', 'Criminal Operation', 'Underground Affair', 'Illegal Matter',
        'Thieves Guild', 'Burglary Operation', 'Theft Mission', 'Robbery Assignment',
        'Smuggling Run', 'Contraband Transport', 'Illegal Cargo', 'Forbidden Goods',
        'Assassination Contract', 'Hit Job', 'Murder Assignment', 'Killing Contract',
        'Black Market', 'Illegal Trade', 'Underground Commerce', 'Shadow Economy',
        'Protection Racket', 'Extortion Scheme', 'Shakedown Operation', 'Intimidation Business',
        'Forgery Operation', 'Document Falsification', 'Fake Creation', 'Counterfeit Production',
        'Information Brokerage', 'Secret Trading', 'Whisper Network', 'Intelligence Sale',
        'Sabotage Mission', 'Disruption Operation', 'Destruction Assignment', 'Chaos Creation',
        'Kidnapping Plot', 'Abduction Scheme', 'Hostage Taking', 'Ransom Demand',
        'Fencing Operation', 'Stolen Goods', 'Hot Property', 'Illicit Merchandise',
        'Gambling Den', 'Illegal Betting', 'Underground Casino', 'Forbidden Gaming',
        'Drug Trade', 'Narcotics Operation', 'Substance Dealing', 'Addiction Business',
        'Weapon Smuggling', 'Arms Trafficking', 'Illegal Weapons', 'Forbidden Arms',
        'Slave Trade', 'Human Trafficking', 'Captive Dealing', 'Bondage Commerce',
        'Piracy Operation', 'Sea Robbery', 'Maritime Crime', 'Ocean Banditry',
        'Bandit Activity', 'Highway Robbery', 'Road Crime', 'Travel Banditry',
        'Poison Dealing', 'Toxin Trade', 'Venom Commerce', 'Death Substance',
        'Spy Network', 'Espionage Ring', 'Secret Agents', 'Covert Operations',
        'Terrorist Plot', 'Destruction Scheme', 'Chaos Planning', 'Anarchy Mission'
      ],
      NECROMANCER: [
        'Death Magic', 'Necrotic Ritual', 'Undead Summoning', 'Death Ritual',
        'Necrotic Magic', 'Death Summoning', 'Undead Ritual', 'Necrotic Ritual',
        'Skeleton Army', 'Bone Warrior', 'Death Knight', 'Bone Construct',
        'Zombie Horde', 'Flesh Golem', 'Corpse Animation', 'Dead Rising',
        'Ghost Summoning', 'Spirit Calling', 'Phantom Invocation', 'Spectral Army',
        'Wraith Creation', 'Soul Binding', 'Ethereal Servant', 'Ghostly Minion',
        'Lich Transformation', 'Immortal Ritual', 'Eternal Life', 'Deathless Power',
        'Soul Harvesting', 'Life Force', 'Vital Energy', 'Essence Collection',
        'Grave Robbery', 'Tomb Raiding', 'Cemetery Violation', 'Rest Disturbance',
        'Cursed Burial', 'Hexed Grave', 'Bewitched Tomb', 'Enchanted Resting Place',
        'Death Prophecy', 'Mortal Prediction', 'Fateful Vision', 'Doom Oracle',
        'Plague Spreading', 'Disease Magic', 'Contagion Ritual', 'Illness Curse',
        'Blood Magic', 'Vital Fluid', 'Life Essence', 'Crimson Power',
        'Bone Crafting', 'Skeleton Construction', 'Death Sculpting', 'Mortal Remains',
        'Soul Trapping', 'Spirit Imprisonment', 'Ghost Containment', 'Phantom Prison',
        'Death Worship', 'Necrotic Religion', 'Grave Cult', 'Tomb Faith',
        'Eternal Slumber', 'Final Rest', 'Death Sleep', 'Mortal End',
        'Reaper Calling', 'Death Messenger', 'Grim Summoning', 'Fate Weaver',
        'Shadow Realm', 'Death Plane', 'Grave World', 'Necrotic Dimension',
        'Life Extinction', 'Death Dominion', 'Mortal Cessation', 'Vital Termination',
        'Soul Consumption', 'Life Devouring', 'Essence Absorption', 'Vital Draining'
      ],
      MAGE: [
        'Arcane Study', 'Magical Research', 'Wizard Experiment', 'Arcane Experiment',
        'Magical Study', 'Wizard Research', 'Arcane Study', 'Magical Experiment',
        'Spell Research', 'Incantation Study', 'Ritual Investigation', 'Magic Analysis',
        'Potion Creation', 'Elixir Brewing', 'Alchemical Mixture', 'Formula Development',
        'Rune Carving', 'Glyph Inscription', 'Symbol Etching', 'Sigil Drawing',
        'Crystal Growing', 'Gem Cultivation', 'Stone Enhancement', 'Mineral Attunement',
        'Familiar Bonding', 'Spirit Companion', 'Magical Pet', 'Arcane Ally',
        'Tower Construction', 'Mage Spire', 'Wizard Tower', 'Arcane Citadel',
        'Library Expansion', 'Knowledge Collection', 'Book Acquisition', 'Lore Gathering',
        'Apprentice Training', 'Student Teaching', 'Magic Instruction', 'Spell Tutoring',
        'Artifact Creation', 'Magical Item', 'Enchanted Object', 'Mystic Device',
        'Portal Research', 'Gate Study', 'Dimension Investigation', 'Realm Exploration',
        'Elemental Mastery', 'Force Control', 'Energy Manipulation', 'Power Harnessing',
        'Time Study', 'Chronal Research', 'Temporal Experiment', 'Age Manipulation',
        'Mind Magic', 'Psychic Power', 'Thought Control', 'Mental Domination',
        'Illusion Crafting', 'False Reality', 'Deception Weaving', 'Trick Construction',
        'Summoning Practice', 'Entity Calling', 'Being Invocation', 'Creature Command',
        'Divination Session', 'Fate Reading', 'Future Vision', 'Prophecy Casting',
        'Enchantment Workshop', 'Spell Imbuement', 'Magic Infusion', 'Power Embedding',
        'Alchemy Laboratory', 'Transmutation Study', 'Substance Conversion', 'Matter Change',
        'Herbology Research', 'Plant Magic', 'Botanical Study', 'Flora Enchantment'
      ],
      ROGUE: [
        'Stealth Operation', 'Covert Mission', 'Sneaky Business', 'Covert Operation',
        'Stealth Mission', 'Sneaky Operation', 'Covert Business', 'Stealthy Mission',
        'Lockpicking Challenge', 'Door Opening', 'Security Bypass', 'Entry Violation',
        'Treasure Hunting', 'Loot Seeking', 'Valuable Acquisition', 'Wealth Discovery',
        'Trap Disarming', 'Hazard Removal', 'Danger Neutralization', 'Threat Elimination',
        'Guard Avoidance', 'Sentinel Evasion', 'Watchman Dodging', 'Patrol Circumvention',
        'Pickpocketing', 'Pocket Lifting', 'Wallet Acquisition', 'Coin Removal',
        'Burglary Job', 'House Breaking', 'Property Invasion', 'Residence Violation',
        'Assassination Target', 'Silent Killing', 'Quiet Elimination', 'Stealth Murder',
        'Sabotage Mission', 'Disruption Task', 'Interference Operation', 'Chaos Creation',
        'Espionage Assignment', 'Secret Gathering', 'Information Theft', 'Intelligence Acquisition',
        'Forgery Task', 'Document Falsification', 'Paper Counterfeiting', 'Record Alteration',
        'Poison Delivery', 'Toxin Administration', 'Venom Application', 'Death Substance',
        'Kidnapping Operation', 'Abduction Mission', 'Hostage Taking', 'Person Acquisition',
        'Blackmail Scheme', 'Extortion Plot', 'Compromise Operation', 'Leverage Creation',
        'Smuggling Route', 'Contraband Transport', 'Illegal Conveyance', 'Forbidden Movement',
        'Fence Contact', 'Stolen Goods', 'Hot Property', 'Illicit Merchandise',
        'Gambling Fix', 'Game Rigging', 'Bet Manipulation', 'Wager Control',
        'Information Broker', 'Secret Seller', 'Whisper Trader', 'Knowledge Merchant',
        'Thief Guild', 'Burglar Society', 'Criminal Brotherhood', 'Rogue Association'
      ],
      CLERIC: [
        'Divine Matter', 'Religious Affair', 'Sacred Business', 'Holy Matter',
        'Divine Affair', 'Religious Business', 'Sacred Affair', 'Holy Business',
        'Prayer Ceremony', 'Devotional Ritual', 'Worship Service', 'Faith Gathering',
        'Healing Ministry', 'Restoration Service', 'Cure Ministry', 'Health Blessing',
        'Exorcism Ritual', 'Demon Banishing', 'Evil Expulsion', 'Spirit Cleansing',
        'Blessing Ceremony', 'Divine Favor', 'Holy Anointing', 'Sacred Approval',
        'Funeral Service', 'Burial Ritual', 'Final Rites', 'Soul Passage',
        'Wedding Ceremony', 'Marriage Blessing', 'Union Sacrament', 'Holy Matrimony',
        'Baptism Ritual', 'Purification Ceremony', 'Spiritual Cleansing', 'Faith Initiation',
        'Confession Session', 'Sin Absolution', 'Guilt Forgiveness', 'Soul Cleansing',
        'Pilgrimage Journey', 'Holy Travel', 'Sacred Quest', 'Faithful Voyage',
        'Miracle Working', 'Divine Intervention', 'Holy Manifestation', 'Sacred Wonder',
        'Prophecy Interpretation', 'Divine Message', 'Oracle Reading', 'Fate Revelation',
        'Temple Maintenance', 'Sacred Building', 'Holy Structure', 'Divine Dwelling',
        'Scripture Study', 'Holy Text', 'Sacred Writing', 'Divine Word',
        'Charity Work', 'Almsgiving', 'Generous Giving', 'Compassion Service',
        'Missionary Work', 'Faith Spreading', 'Belief Teaching', 'Religion Propagation',
        'Meditation Practice', 'Contemplation', 'Spiritual Reflection', 'Mindful Prayer',
        'Sacrificial Offering', 'Divine Gift', 'Holy Sacrifice', 'Sacred Donation',
        'Divine Judgment', 'Righteous Verdict', 'Holy Justice', 'Sacred Law'
      ],
      ADVENTURE: [
        'Heroic Quest', 'Epic Journey', 'Legendary Expedition', 'Grand Adventure',
        'Daring Exploration', 'Brave Expedition', 'Courageous Quest', 'Valiant Journey',
        'Treasure Hunt', 'Wealth Discovery', 'Fortune Quest', 'Riches Expedition',
        'Ancient Mystery', 'Forgotten Secret', 'Lost Knowledge', 'Hidden Wisdom',
        'Monster Slaying', 'Beast Hunting', 'Creature Tracking', 'Wildlife Expedition',
        'Lost Civilization', 'Ancient Ruins', 'Forgotten Empire', 'Buried Kingdom',
        'Magical Artifact', 'Enchanted Relic', 'Mystical Treasure', 'Arcane Discovery',
        'Dragon Lair', 'Monster Den', 'Beast Habitat', 'Creature Domain',
        'Forbidden Temple', 'Sacred Shrine', 'Holy Sanctuary', 'Divine Chamber',
        'Underwater City', 'Sunken Kingdom', 'Aquatic Empire', 'Submerged Civilization',
        'Sky Castle', 'Floating Citadel', 'Aerial Fortress', 'Cloud Palace',
        'Time Portal', 'Chronal Gateway', 'Temporal Passage', 'Age Rift',
        'Dimension Door', 'Reality Gate', 'Planar Portal', 'World Bridge',
        'Legendary Weapon', 'Heroic Blade', 'Mythical Sword', 'Epic Artifact',
        'Ancient Prophecy', 'Fateful Prediction', 'Destined Quest', 'Chosen Journey',
        'Guardian Challenge', 'Protector Trial', 'Defender Quest', 'Sentinel Mission',
        'Elemental Trial', 'Nature Test', 'Force Challenge', 'Power Quest',
        'Spirit Journey', 'Soul Quest', 'Essence Expedition', 'Life Force Mission'
      ],
      QUEST: [
        'Sacred Mission', 'Divine Task', 'Holy Quest', 'Blessed Journey',
        'Royal Assignment', 'King\'s Command', 'Monarch\'s Request', 'Sovereign Mission',
        'Guild Contract', 'Professional Assignment', 'Trade Guild Quest', 'Craft Mission',
        'Personal Vendetta', 'Revenge Quest', 'Justice Mission', 'Retribution Journey',
        'Rescue Operation', 'Save Mission', 'Recovery Quest', 'Liberation Journey',
        'Investigation Task', 'Inquiry Mission', 'Research Quest', 'Discovery Journey',
        'Delivery Assignment', 'Transport Mission', 'Courier Quest', 'Delivery Journey',
        'Escort Duty', 'Protection Mission', 'Guardian Quest', 'Safeguard Journey',
        'Treasure Recovery', 'Artifact Retrieval', 'Relic Quest', 'Treasure Journey',
        'Monster Hunt', 'Beast Slaying', 'Creature Quest', 'Monster Journey',
        'Bandit Clearing', 'Outlaw Hunt', 'Criminal Quest', 'Thief Journey',
        'Diplomatic Mission', 'Peace Quest', 'Alliance Journey', 'Negotiation Task',
        'Spy Assignment', 'Intelligence Mission', 'Espionage Quest', 'Secret Journey',
        'Healing Pilgrimage', 'Cure Quest', 'Restoration Journey', 'Recovery Mission',
        'Knowledge Seeking', 'Wisdom Quest', 'Learning Journey', 'Education Mission',
        'Artifact Collection', 'Relic Gathering', 'Treasure Quest', 'Collection Journey',
        'Time-Sensitive Task', 'Urgent Mission', 'Deadline Quest', 'Rush Journey',
        'Multi-Stage Mission', 'Complex Quest', 'Extended Journey', 'Epic Mission',
        'Faction Alliance', 'Group Quest', 'Team Journey', 'Party Mission',
        'Solo Challenge', 'Personal Quest', 'Individual Journey', 'Lone Mission'
      ]
    };

    const typeTitles = titles[type] || ['Unexpected Event', 'Strange Occurrence', 'Curious Situation', 'Interesting Development'];
    return this.chance.pickone(typeTitles);
  }

  /**
   * Generate event description - SIMPLE AND RELIABLE
   * Direct mapping from event type to meaningful descriptions
   */
  /**
   * Generate event description with contextual enhancements
   * 
   * @param title - The event title (currently unused, reserved for future use)
   * @param type - Event type (e.g., 'COMBAT', 'SOCIAL', 'MAGIC')
   * @param context - Analyzed player context for contextual enhancements
   * @returns A description with optional location, weather, time, and class/race context
   */
  private generateDescription(
    title: string,
    type: string,
    context: AnalyzedContext
  ): string {
    // Check all available themes for custom descriptions, prioritizing 'default'
    const themesToCheck = ['default', ...Object.keys(this.customDescriptions).filter(k => k !== 'default')];
    
    for (const theme of themesToCheck) {
      const customThemeDescriptions = this.customDescriptions[theme];
      if (customThemeDescriptions && customThemeDescriptions[type] && customThemeDescriptions[type].length > 0) {
        let description = this.chance.pickone(customThemeDescriptions[type]);

        description = this.addContextualEnhancements(description, context);

        description = description.trim();
        if (!/[.!?]$/.test(description)) {
          description += '.';
        }

        return description;
      }
    }

    const descriptions: { [key: string]: string[] } = {
      COMBAT: [
        'The clash of steel echoes through the air as a heavily armed mercenary steps forward, eyes gleaming with battle lust and gold coins jingling in his purse.',
        'From the darkened alley, a pack of wild dogs with unnaturally sharp teeth and glowing red eyes launches itself at you with terrifying speed.',
        'A grizzled veteran warrior, his armor scarred from countless battles, raises his sword and bellows a challenge that shakes the very ground beneath your feet.',
        'Bandits emerge from the trees ahead, their leader twirling a wicked curved blade while his companions nock arrows to their bows with practiced ease.',
        'The air fills with the acrid stench of smoke as enemy soldiers pour from a breached fortress wall, their war cries rising to a deafening crescendo.',
        'A colossal troll lumbers into view, its massive club dragging grooves in the earth as it sniffs the air for fresh meat, its beady eyes locking onto you.',
        'Skeletal warriors rise from ancient burial mounds, their rusted weapons still sharp and their empty sockets burning with necromantic fire.',
        'The arena sands shift beneath your feet as gladiators from distant lands circle you, each armed with exotic weapons and fueled by the crowd\'s bloodlust.',
        'Thunder crashes as a storm giant descends from blackened clouds, wielding lightning like a whip and commanding the tempest itself in battle.',
        'Crystal golems emerge from the cavern walls, their faceted bodies refracting light into deadly prisms that can slice through armor like butter.',
        'A vampire lord emerges from his coffin at dusk, his cloak billowing like living shadow as he unleashes a horde of lesser undead upon the battlefield.',
        'Mechanical automatons march in perfect formation, their steam-powered limbs hissing as they unleash a barrage of alchemical explosives.',
        'The dragon\'s roar shakes the mountains as it swoops low, its scales gleaming like molten metal and its breath promising fiery annihilation.',
        'Barbarian hordes crest the hill, their painted faces contorted in rage as they charge with axes raised, their war chants drowning out all other sound.',
        'Elven archers materialize from the forest canopy, their arrows tipped with enchanted silver that can pierce magical defenses.',
        'Dwarven siege engines rumble forward, their massive ballistae loaded with enchanted bolts capable of shattering castle gates.',
        'Orc warlords clash their weapons against tribal shields, their guttural battle cries promising a fight to the death and beyond.',
        'Shadow assassins strike from the darkness, their poisoned blades leaving trails of inky blackness that devour light itself.',
        'Paladin knights charge on armored warhorses, their lances lowered and holy banners fluttering as they crusade against the forces of darkness.',
        'Pirate crews board your ship in a frenzy of cutlasses and pistols, their captain\'s hook gleaming wickedly in the moonlight.',
        'Beastmasters unleash their trained monstrosities - dire wolves, giant spiders, and mutated bears - all hungry for combat.',
        'Spellcasters duel in the skies above, hurling bolts of arcane energy that illuminate the battlefield with impossible colors.',
        'Time distortions ripple through the combat zone as chronomancers manipulate the flow of battle, aging weapons to dust or rejuvenating fallen allies.',
        'Elemental lords manifest in physical form, summoning hurricanes of fire, tidal waves of water, and avalanches of stone to crush their enemies.',
        'Psychic warriors invade your mind even as their physical forms clash, planting seeds of doubt and fear that weaken your resolve.',
        'Alien invaders descend in crystalline ships, their energy weapons humming with otherworldly power that defies conventional defense.',
        'Undead legions march with mechanical precision, their decaying forms augmented by alchemical treatments that grant unnatural strength.',
        'Fey warriors dance through the battlefield, their movements too graceful and swift for mortal eyes to follow, leaving trails of glittering magic.',
        'Demon princes tear through reality itself to enter the fray, their flaming weapons and hellish auras promising eternal torment.',
        'Celestial beings descend with wings of light, their divine weapons shining with the power of creation itself.',
        'Void entities seep through cracks in reality, their amorphous forms devouring matter and magic alike in their endless hunger.'
      ],
      SOCIAL: [
        'A elegantly dressed noblewoman approaches with graceful poise, her silk gown whispering against the floor as she extends a gloved hand bearing a sealed letter.',
        'Sweat beads on the brow of a frantic messenger who bursts through the tavern doors, gasping that he carries urgent news from the royal court.',
        'An elderly scholar with ink-stained fingers and spectacles perched on his nose beckons you closer, his voice barely containing his excitement over a remarkable discovery.',
        'A mysterious stranger in a hooded cloak slips a small, intricately carved box into your hand with a whispered warning about powerful forces at work.',
        'The innkeeper\'s daughter, her apron stained with flour and her cheeks flushed from the kitchen heat, pulls you aside with news of a secret meeting.',
        'A royal advisor, his robes embroidered with golden thread, requests a private audience to discuss matters of state that could change the kingdom\'s fate.',
        'Tavern regulars gather around you, their faces weathered by time and ale, sharing stories of legendary heroes and forgotten treasures.',
        'A foreign merchant, his accent thick and musical, offers exotic spices and silks while hinting at political unrest in distant lands.',
        'The town mayor hosts a lavish banquet in your honor, where nobles and commoners alike seek your favor and political alliance.',
        'A wandering bard strums his lute outside the inn, his songs telling of your exploits and drawing admirers who wish to join your cause.',
        'An alchemist demonstrates wondrous potions in the market square, offering you a partnership that could revolutionize healing and warfare.',
        'The captain of the guard seeks your counsel on a series of mysterious disappearances that threaten the city\'s peace.',
        'A beautiful enchantress invites you to her tower for tea, her eyes sparkling with curiosity about your adventures and magical potential.',
        'Guild masters from various crafts approach you with proposals for joint ventures that could make you wealthy beyond imagination.',
        'A retired general, his uniform still crisp despite his age, offers tactical advice and hints at a coming conflict that requires heroes.',
        'The high priestess of the temple requests your presence for a blessing ceremony that could grant you divine favor.',
        'A circus master with a twinkle in his eye offers you a starring role in his next performance, promising fame and fortune.',
        'Diplomatic envoys from rival nations compete for your allegiance, each offering alliances, gold, and political power.',
        'A renowned artist begs for the privilege of painting your portrait, claiming your legend deserves immortalization on canvas.',
        'The librarian of the great archive reveals ancient texts that speak of your destiny and offers to teach you forbidden knowledge.',
        'A pirate captain, his peg leg thumping against the dock, proposes a lucrative partnership in maritime adventures.',
        'The queen\'s personal attendant delivers an invitation to court, where royal favor could elevate your status immensely.',
        'A master thief offers his services for a heist that could topple a corrupt noble and redistribute wealth to the deserving.',
        'Scholars from the arcane academy invite you to present your findings, offering research grants and magical artifacts.',
        'A caravan master proposes joining his expedition to uncharted territories, promising glory and unimaginable discoveries.',
        'The head chef of the royal kitchen seeks your opinion on a new recipe that could become legendary throughout the land.',
        'A famous playwright offers to immortalize your deeds in a theatrical production that will tour every major city.',
        'Tribal elders from distant lands seek your mediation in an ancient conflict, offering ancestral artifacts as payment.',
        'A mysterious oracle appears in a dream, urging you to seek her out in the waking world for prophecies of great importance.',
        'The commander of the city watch requests your help investigating a conspiracy that threatens the very foundations of society.',
        'An eccentric inventor demonstrates flying machines and mechanical wonders, offering partnership in technological revolution.'
      ],
      EXPLORATION: [
        'Your torchlight catches the glint of gold in the depths of this ancient tomb, but as you approach, you realize the treasure is guarded by something far more valuable - and dangerous.',
        'The dense jungle canopy parts to reveal a vine-choked stone temple, its weathered carvings depicting scenes of forgotten gods and impossible magic.',
        'A narrow cave passage opens into a vast underground chamber where glowing crystals illuminate walls covered in bioluminescent fungi and strange, moving shadows.',
        'The abandoned castle towers loom against the stormy sky, their broken battlements hiding secrets that have waited centuries to be discovered.',
        'Your boots sink into the soft earth of this overgrown ruin, where the air hangs heavy with the scent of decaying magic and long-forgotten enchantments.',
        'The ocean depths reveal a sunken city of coral and pearl, where merfolk guard treasures that could buy kingdoms.',
        'A floating island drifts through the clouds above, its surface dotted with crystal spires and gardens that defy gravity.',
        'The desert sands part to reveal an underground oasis, complete with palm trees, freshwater springs, and a hidden civilization.',
        'Mountain peaks pierce the sky like jagged teeth, concealing monasteries where monks practice impossible feats of magic and meditation.',
        'The frozen tundra hides entrances to subterranean realms where fire elementals dance and warmth defies the endless cold.',
        'Volcanic calderas bubble with lava that forms intricate patterns, revealing maps to legendary weapons forged in dragonfire.',
        'Ancient forests whisper secrets to those who listen, their trees older than nations and wiser than the oldest sages.',
        'Crystal caverns refract light into rainbows that reveal hidden paths to pocket dimensions filled with impossible wonders.',
        'Shipwrecked vessels on stormy coasts contain logs that speak of islands where time flows differently and dreams become reality.',
        'The moonlit moors reveal standing stones that align with celestial events, opening portals to other worlds and times.',
        'Subterranean rivers carve through glowing geodes, leading to chambers where mineral spirits offer wisdom and power.',
        'Cloud palaces float in eternal twilight, home to sky nomads who trade in winds, weather, and aerial combat techniques.',
        'The deepest abysses contain bioluminescent ecosystems where creatures of nightmare and delight coexist in fragile balance.',
        'Magnetic anomalies in the northern wastes point to ancient alien crash sites, filled with technology beyond mortal comprehension.',
        'Sacred groves where the veil between worlds grows thin allow glimpses of faerie realms and their capricious inhabitants.',
        'The highest peaks reveal monasteries carved into the rock itself, where lamas teach enlightenment through impossible trials.',
        'Coral reefs form living cathedrals underwater, where sea spirits hoard knowledge of lost civilizations and sunken magic.',
        'Lightning-scarred plains hide entrances to storm elemental realms, where thunder beings forge weapons of pure electricity.',
        'The darkest swamps conceal voodoo temples where practitioners commune with spirits of earth, water, and transformation.',
        'Starlit deserts contain astronomical alignments that reveal stargates to other planets and cosmic mysteries.',
        'Ice caverns in glacial mountains preserve ancient libraries, their frozen tomes containing spells that could reshape reality.',
        'The heart of active volcanoes reveals fire temples where salamanders guard artifacts that control flame and destruction.',
        'Underground salt mines form crystalline labyrinths where mirror spirits create illusions of endless wealth and power.',
        'Jungle canopies hide aerial villages connected by vine bridges, home to tribes who commune with birds and weather spirits.',
        'The ocean floor reveals trenches where pressure has compressed matter into impossible densities, creating portals to other dimensions.',
        'Desert whirlwinds conceal entrances to sand element realms, where djinn offer wishes and terrible bargains.'
      ],
      ECONOMIC: [
        'A shrewd merchant with calculating eyes spreads a velvet cloth before you, displaying jewels that sparkle like captured starlight and whisper promises of wealth.',
        'The air in the bustling market square vibrates with opportunity as a caravan master offers you a share in a profitable trade route to distant lands.',
        'An alchemist\'s apprentice, her robes stained with mysterious substances, offers you a vial of glowing liquid that could revolutionize potion-making techniques.',
        'The bank vault door swings open to reveal stacks of gold coins and precious gems, but the vault keeper\'s nervous glances suggest not everything is as it seems.',
        'A land agent unfurls ancient property deeds showing ownership of fertile farmland, abandoned mines, and strategic border territories waiting to be claimed.',
        'The stock exchange buzzes with frantic activity as brokers offer you shares in revolutionary inventions that could change the world.',
        'A mining consortium proposes partnership in extracting rare minerals from dragon-guarded mountains, promising unimaginable profits.',
        'The royal treasury overflows with confiscated wealth, but the king offers you a finder\'s fee to locate even greater hoards.',
        'Shipping magnates compete for your investment in a new fleet that could dominate oceanic trade routes.',
        'An auction house displays legendary artifacts, their auctioneers promising that bidding could make you the richest person alive.',
        'The black market thrives in shadowed alleys, where forbidden goods and illicit services offer wealth beyond moral constraints.',
        'Agricultural barons offer shares in genetically enhanced crops that grow ten times faster and feed entire nations.',
        'The gambling halls of the rich and powerful invite you to high-stakes games where fortunes are won and lost in a single roll.',
        'Patent offices overflow with revolutionary inventions, their inventors seeking backers willing to risk everything for innovation.',
        'The slave markets of distant lands offer human capital for ambitious projects, though the ethics weigh heavily on the soul.',
        'Art collectors from around the world bid furiously for masterpieces that could appreciate in value for centuries.',
        'The weapon smiths\' guild offers exclusive contracts for arming armies, promising profits from both sides of every war.',
        'Magical artifact dealers display items of impossible power, their prices reflecting the lives that could be saved or lost.',
        'The spice merchants of the east offer monopoly rights to exotic flavors that could make you the culinary king of nations.',
        'Bank consortiums propose loans with interest rates that could either make you a tycoon or beggar you completely.',
        'The entertainment industry seeks investors for theaters and circuses that could become cultural institutions.',
        'Fur traders from frozen north offer pelts of mythical beasts, their rarity guaranteeing astronomical prices.',
        'The information brokers sell secrets that could manipulate markets, politics, and even the course of history.',
        'Construction guilds bid for massive projects - castles, cathedrals, and infrastructure that could employ thousands.',
        'The alchemical industry offers shares in potions that could extend life, enhance beauty, or grant impossible abilities.',
        'Pirate captains offer letters of marque for privateering ventures that blur the line between commerce and warfare.',
        'The fossil trade reveals ancient bones that could rewrite history, their value increasing with scholarly verification.',
        'Jewelry artisans offer custom pieces embedded with magic, their prices reflecting both craftsmanship and enchantment.',
        'The livestock breeders showcase genetically superior animals that could revolutionize farming and transportation.',
        'Underground fight clubs offer ownership stakes in gladiatorial combat, where champions become legends and legends become rich.',
        'The map makers\' guild sells charts to uncharted territories, their accuracy determining whether you return as hero or corpse.'
      ],
      MYSTERY: [
        'Blood-red symbols glow faintly on the ancient stone tablet, pulsing in rhythm with your heartbeat as if trying to communicate some urgent, unknowable message.',
        'The abandoned manor\'s windows stare at you like empty eye sockets, while strange whispers emanate from the locked attic, begging to be investigated.',
        'Your fingers brush against a hidden compartment in the antique desk, revealing a bundle of yellowed letters tied with faded ribbon and sealed with black wax.',
        'The full moon casts eerie shadows through the twisted trees as you discover fresh footprints that lead to a cliff edge and simply... stop.',
        'A child\'s doll lies abandoned in the muddy street, its porcelain face cracked and its glass eyes reflecting a wisdom far beyond its tiny form.',
        'The mirror reflects a figure that isn\'t there, its movements mimicking yours with increasing precision and malevolent intent.',
        'Ancient runes appear on your skin overnight, glowing with inner light and whispering secrets in languages you shouldn\'t understand.',
        'The town clock strikes thirteen times at midnight, and with each toll, reality seems to thin like worn fabric.',
        'A book in the library rearranges its pages when you\'re not looking, revealing chapters that weren\'t there before.',
        'Your shadow detaches itself during the eclipse, moving independently and leading you toward forbidden knowledge.',
        'The painting in the gallery ages before your eyes, its subjects changing expression from joy to terror in seconds.',
        'Footprints appear in fresh snow leading to nowhere, as if someone walked into the air itself and vanished.',
        'The music box plays a melody you\'ve never heard, yet somehow recognize from dreams you can\'t quite remember.',
        'Candles in the abandoned chapel light themselves at dusk, their flames dancing to an unheard rhythm.',
        'The well at the village center bubbles with water that tastes of salt and blood, though no sea lies nearby.',
        'Your reflection smiles when you don\'t, its teeth too sharp and its eyes too knowing for comfort.',
        'The forest path rearranges itself nightly, leading wanderers to places they never intended to visit.',
        'Coins found in the riverbed bear the faces of rulers who died centuries ago, yet the metal feels warm to the touch.',
        'The storm clouds form letters that spell out warnings in a script that changes meaning with each gust of wind.',
        'The old tree in the town square bleeds sap that smells of copper and forms patterns that predict future events.',
        'Whispers in empty rooms speak of events that haven\'t happened yet, their voices growing louder with each passing day.',
        'The cave paintings move when unobserved, their ancient artists adding new scenes to their prehistoric narratives.',
        'Your dreams begin bleeding into reality, with objects from your nightmares appearing in the waking world.',
        'The compass needle spins wildly in certain locations, pointing to truths that contradict known geography.',
        'The abandoned mine shaft echoes with the sounds of machinery that was never installed, yet functions perfectly.',
        'Flowers bloom in impossible colors during the new moon, their petals containing maps to hidden realms.',
        'The tavern sign creaks with voices that tell stories of patrons long dead, their tales growing more urgent.',
        'Frost forms patterns on windows that depict crimes not yet committed, their icy scenes melting with the dawn.',
        'The mountain peak shows different faces depending on the time of day, each revealing aspects of an impossible geography.',
        'Books in the restricted section rearrange themselves alphabetically by authors who never existed.',
        'The echo in the canyon repeats words you haven\'t spoken yet, their meaning becoming clearer with each repetition.'
      ],
      SUPERNATURAL: [
        'The mirror in the abandoned bedroom shows your reflection moving independently, its mouth opening in a silent scream as blood begins to trickle from its eyes.',
        'Ghostly apparitions drift through the ruined chapel walls, their translucent forms reaching toward you with fingers that pass through flesh like mist.',
        'The ancient tome on the pedestal opens itself, its pages turning with invisible hands to reveal spells that bend the very fabric of reality.',
        'A storm brews overhead despite the cloudless sky, and within the thunder you hear voices speaking in languages long dead to the mortal world.',
        'The statue in the town square animates at midnight, its stone eyes fixing upon you with an intelligence that suggests it has been watching for centuries.',
        'Angelic choirs manifest in the cathedral rafters, their ethereal songs promising salvation while shadows deepen in unholy corners.',
        'Demonic sigils burn themselves into the stone floor, each symbol representing a pact that could grant power at terrible cost.',
        'The veil between worlds thins at the crossroads, allowing glimpses of creatures that should not - and cannot - exist.',
        'Crystal balls fog with visions of alternate timelines, showing you choices that could reshape reality itself.',
        'Spectral hounds bay at the moonless sky, their howls opening rifts to the hunting grounds of forgotten gods.',
        'Blood rain falls from cloudless skies, each drop containing memories of those who died violently in this place.',
        'The ground splits open to reveal a bottomless abyss where stars shine in impossible constellations.',
        'Time loops manifest as ghostly figures repeating the same actions eternally, their faces masks of frozen horror.',
        'Elemental forces personify themselves as living beings of pure fire, water, earth, and air, demanding tribute.',
        'Prophetic dreams invade your sleep, showing futures that become real when you wake, changing with each decision.',
        'The dead rise from their graves at midnight, not as zombies, but as themselves - confused and seeking answers.',
        'Reality fractures like broken glass, revealing glimpses of other dimensions where physics bows to different laws.',
        'Cursed artifacts hum with contained power, their enchantments promising greatness while sowing seeds of doom.',
        'Fey circles appear in impossible locations - mountaintops, ocean floors, cloud banks - gateways to eternal revelry.',
        'The stars rearrange themselves into messages written in celestial script, foretelling events that defy mortal comprehension.',
        'Living shadows detach from their owners, gaining sentience and hunger for experiences they can never have.',
        'Ancient curses manifest as physical ailments that spread like contagion, carrying the weight of centuries.',
        'Divine interventions occur in mundane moments - water turning to wine, bread multiplying, wounds healing instantly.',
        'Psychic echoes reverberate through crowded streets, allowing you to hear thoughts that should remain private.',
        'The boundary between dream and reality dissolves, causing nightmares to manifest as tangible threats.',
        'Sacred geometry manifests in the architecture around you, revealing hidden chambers and divine purposes.',
        'Soul fragments litter the battlefield, each one a tiny echo of lives cut short, begging for completion.',
        'Weather patterns form words and symbols in the sky, communicating messages from entities beyond understanding.',
        'The laws of nature suspend themselves temporarily, allowing impossible feats like walking on air or breathing underwater.',
        'Memory spirits possess the living, forcing them to relive traumas from centuries past.',
        'Reality anchors fail, causing objects and people to phase in and out of existence at random intervals.'
      ],
      POLITICAL: [
        'The royal herald unfurls a crimson scroll bearing the king\'s seal, announcing a tournament that will decide the fate of disputed border territories.',
        'Whispers in the shadowed corners of the throne room speak of assassination plots, forbidden alliances, and betrayals that could shatter the kingdom.',
        'A foreign diplomat, his silken robes embroidered with golden thread, offers you a treaty that promises peace but demands unacceptable concessions.',
        'The town council convenes in emergency session, their faces pale as they discuss reports of monstrous creatures massing at the kingdom\'s borders.',
        'Ancient scrolls recovered from a forgotten archive reveal prophecies of royal bloodlines, hidden heirs, and conspiracies that span generations.',
        'The parliament descends into chaos as factions vie for control, their debates threatening to erupt into civil war.',
        'A rebel leader offers you command of guerrilla forces, promising glory and land reforms in exchange for your allegiance.',
        'The emperor\'s court buzzes with intrigue as concubines and advisors compete for influence over the aging monarch.',
        'Diplomatic cables reveal that neighboring nations are forming secret alliances that could isolate your homeland.',
        'The senate votes on war declarations, their decisions potentially dooming thousands to death for political gain.',
        'Corrupt officials auction government positions to the highest bidder, their greed threatening the nation\'s stability.',
        'Election campaigns turn violent as rival candidates employ assassins and smear campaigns to eliminate competition.',
        'The prime minister proposes controversial reforms that could either modernize the nation or tear it apart.',
        'Border disputes escalate as surveyors discover mineral-rich territories claimed by multiple nations.',
        'The chancellor\'s office leaks documents revealing widespread espionage that compromises national security.',
        'Tribal councils debate whether to ally with colonial powers or resist, their decisions affecting generations.',
        'The president\'s cabinet fractures over policy disagreements, creating opportunities for foreign manipulation.',
        'Revolutionary pamphlets circulate underground, their radical ideas inspiring both hope and terror among the populace.',
        'The governor issues emergency decrees that suspend civil liberties, claiming necessity in the face of crisis.',
        'International summits become battlegrounds of rhetoric, where words can start wars or prevent them.',
        'The monarch\'s illegitimate children emerge from hiding, each claiming the throne with forged documents.',
        'Political exiles return with foreign backing, threatening coups and destabilizing the current regime.',
        'The congress debates taxation policies that could either fund prosperity or incite widespread rebellion.',
        'Diplomatic immunity becomes a shield for spies and assassins, complicating international relations.',
        'The supreme court rules on constitutional matters that could redefine the balance of power in government.',
        'Military juntas seize control during times of crisis, promising order through authoritarian rule.',
        'The foreign minister negotiates trade agreements that favor certain industries while harming others.',
        'Election fraud allegations spark protests and investigations that threaten the legitimacy of government.',
        'The intelligence agency uncovers plots within plots, revealing that no one can be trusted completely.',
        'Colonial administrators struggle to maintain control as independence movements gain momentum.',
        'The treasury secretary proposes economic policies that could either stimulate growth or cause depression.'
      ],
      TECHNOLOGICAL: [
        'Gears grind and pistons hiss as a massive mechanical construct awakens, its crystal eyes focusing on you with artificial intelligence beyond mortal comprehension.',
        'The laboratory air hums with electricity as you discover a device that can manipulate time itself, bending seconds into minutes and minutes into hours.',
        'A network of glowing conduits pulses with energy, channeling power from sources that seem to draw from the very stars themselves.',
        'The mechanical arm extends with hydraulic precision, its metallic fingers capable of crafting objects with microscopic perfection.',
        'Strange symbols dance across crystal displays as you interface with a device that can predict future events with uncanny accuracy.',
        'Steam-powered automatons march in formation, their brass bodies gleaming as they execute commands with mechanical precision.',
        'The telegraph network crackles with messages from distant cities, revealing plots and opportunities in real-time.',
        'Clockwork hearts beat within mechanical chests, offering immortality through technology rather than magic.',
        'Flying machines soar through the clouds, their propellers chopping the air as pilots navigate by steam-powered compass.',
        'The printing press churns out revolutionary pamphlets, their words spreading ideas faster than any army could march.',
        'Submarine vessels lurk beneath the waves, their periscopes watching for targets in an underwater war.',
        'The phonograph captures voices from beyond the grave, preserving memories and secrets for eternity.',
        'Electric lights banish shadows from entire cities, illuminating secrets that once hid in darkness.',
        'The calculating engine solves complex equations in moments, predicting astronomical events and military strategies.',
        'Railroad networks span continents, carrying goods and people at speeds that shrink the world.',
        'The camera captures souls on photographic plates, revealing auras and emotions invisible to the naked eye.',
        'Telephones connect voices across vast distances, allowing conspirators to plot without ever meeting.',
        'The dynamo generates limitless power, fueling factories that produce goods beyond imagination.',
        'Airships float majestically above the clouds, their gas bags filled with explosive potential.',
        'The microscope reveals worlds within droplets, showing bacteria and viruses that threaten all life.',
        'Mechanical looms weave fabrics of impossible fineness, creating garments that protect against any element.',
        'The spectroscope analyzes light from distant stars, revealing the composition of celestial bodies.',
        'Powered exoskeletons grant superhuman strength, allowing workers to move mountains or build cathedrals.',
        'The wireless transmitter sends messages through the air itself, revolutionizing communication forever.',
        'Refrigeration machines preserve food indefinitely, ending famines and changing the nature of trade.',
        'The seismograph predicts earthquakes and volcanic eruptions, saving lives through technological prophecy.',
        'Steam hammers forge impossible alloys, creating metals stronger than any natural substance.',
        'The telescope peers into the depths of space, discovering planets and comets that defy ancient astronomy.',
        'Mechanical calculators balance complex ledgers in seconds, preventing fraud and ensuring fair commerce.',
        'The phonograph captures voices from beyond the grave, preserving memories and secrets for eternity.',
        'Powered streetcars revolutionize urban transport, connecting cities in ways never before possible.'
      ],
      MAGIC: [
        'Arcane runes float in the air like living fireflies, weaving complex spells that bend light and shadow to create impossible illusions.',
        'The enchanted forest breathes with magical life, its trees whispering secrets and its flowers blooming in colors that don\'t exist in nature.',
        'A staff topped with a glowing crystal channels raw magical energy, shaping it into bolts of lightning that dance across your fingertips.',
        'The air shimmers with residual magic as you discover the site where a powerful ritual was recently performed, leaving echoes of incredible power.',
        'Enchanted artifacts line the shelves of this hidden vault, each pulsing with contained magic that begs to be unleashed upon the world.',
        'The wizard\'s tower spirals into the clouds, its rooms expanding infinitely and containing libraries of spells from every conceivable reality.',
        'Potion bottles bubble with elixirs that can grant eternal youth, infinite wisdom, or transformations beyond imagination.',
        'A magical mirror shows not your reflection, but alternate versions of yourself from parallel lives you might have lived.',
        'The alchemist\'s laboratory contains philosopher\'s stones that transmute not just lead to gold, but thoughts to reality itself.',
        'Enchanted weapons sing in their scabbards, their blades forged in dragonfire and quenched in the tears of ancient gods.',
        'The summoning circle glows with otherworldly light as creatures from beyond the veil manifest, offering power and knowledge.',
        'Crystal formations in the cavern amplify magical energies, creating zones where spells become reality with mere thoughts.',
        'The grimoire writes itself as you read, adding new spells born from your deepest desires and darkest fears.',
        'Magical gardens bloom with flowers that sing, fruits that grant visions, and herbs that cure any ailment.',
        'The enchanted forge hammers magical metals that remember their shape, reforming weapons broken in battle.',
        'Aura readers interpret the colors of your soul, revealing potentials and curses that shape your destiny.',
        'Telekinetic forces move objects with invisible hands, building structures or crushing enemies with pure willpower.',
        'Divination pools show futures that shift with every decision, revealing the butterfly effect of your choices.',
        'Elemental bindings allow control of fire, water, earth, and air, commanding the fundamental forces of nature.',
        'The magical library contains books that transport readers to the worlds within their pages, living the stories they contain.',
        'Enchantment workshops imbue ordinary objects with extraordinary powers, from self-cleaning dishes to flying carpets.',
        'The astral plane opens before you, allowing travel through dreams and exploration of the collective unconscious.',
        'Rune stones arrange themselves in patterns that predict events, their ancient symbols holding the keys to fate.',
        'The potion brewer demonstrates elixirs that alter time perception, allowing hours to pass in seconds or seconds to last hours.',
        'Magical beasts offer bonds of companionship, their loyalties purchased with trust rather than gold.',
        'The spell forge combines different magics into hybrids, creating effects that bend multiple laws of reality simultaneously.',
        'Enchanted inks write contracts that enforce themselves, binding parties with magical consequences for breach.',
        'The crystal ball network connects seers worldwide, allowing instantaneous communication across any distance.',
        'Transformation chambers allow shapeshifting into any form, from dragons to mice to clouds of mist.',
        'The magical academy teaches spells that rewrite memories, alter emotions, and reshape personalities.',
        'Portal stones create gateways to anywhere imaginable, from the center of the earth to the heart of stars.'
      ],
      SPELLCASTING: [
        'A circle of glowing runes pulses with power as a master spellcaster channels energies from multiple elemental planes simultaneously.',
        'The air crackles with arcane electricity as complex incantations weave through the atmosphere, bending reality to the caster\'s will.',
        'Crystal orbs float in intricate patterns, focusing beams of magical energy that could level mountains or heal the gravest wounds.',
        'A spellbook lies open on the pedestal, its pages turning themselves as invisible forces practice casting spells of incredible complexity.',
        'The sorcerer\'s hands move in mesmerizing patterns, drawing power from ley lines and shaping it into effects that defy natural law.',
        'Fireballs erupt from outstretched palms, their flames dancing with unnatural colors as they seek out enemies with homing precision.',
        'Ice storms manifest from clear skies, coating battlefields in crystalline beauty while freezing foes in their tracks.',
        'Lightning arcs between fingertips, chaining through multiple targets and leaving trails of ozone and charred flesh.',
        'Earth spikes erupt from the ground like stony spears, impaling enemies with the fury of an awakened mountain.',
        'Healing waves pulse through crowds, mending wounds and curing diseases with the warmth of a mother\'s touch.',
        'Invisibility spells bend light around casters, rendering them ghosts in plain sight until they choose to strike.',
        'Telekinesis lifts boulders like feathers, hurling them at enemies or constructing fortifications in seconds.',
        'Illusion armies march across fields, their phantom soldiers creating chaos and confusion among real troops.',
        'Time bubbles slow enemies to a crawl while allies move at normal speed, creating devastating temporal advantages.',
        'Summoned elementals manifest as beings of pure force, their forms shifting between fire, water, earth, and air.',
        'Mind blasts shatter enemy wills, leaving them catatonic or turning allies against each other in confusion.',
        'Gravity wells pull enemies into crushing centers, compacting armor and bone with irresistible force.',
        'Portal spells create gateways for ambushes, allowing troops to appear behind enemy lines instantly.',
        'Weather manipulation calls down hurricanes or clears skies, controlling battlefields with atmospheric fury.',
        'Necrotic energy drains life from the living, transferring vitality to the caster in waves of dark power.',
        'Divine light sears undead hordes, their holy radiance burning away darkness and corruption.',
        'Shadow magic creates impenetrable darkness, hiding assassins and draining strength from those who enter.',
        'Crystal barriers spring up instantly, deflecting arrows and spells with refracting magical shields.',
        'Blood magic empowers spells with vital essence, creating effects limited only by the caster\'s willingness to pay.',
        'Rune magic etches symbols of power into reality itself, creating permanent magical effects that endure.',
        'Soul binding captures enemy spirits, preventing resurrection and creating permanent magical anchors.',
        'Chaos magic unleashes unpredictable effects, from beneficial boons to catastrophic wild magic surges.',
        'Order magic imposes structure on chaos, creating predictable zones where physics obeys strict rules.',
        'Life magic accelerates growth and healing, causing plants to entangle foes and wounds to close instantly.',
        'Death magic withers flesh and corrodes metal, aging enemies prematurely and weakening their weapons.',
        'Dream magic sends enemies into nightmares, their sleeping minds fighting battles that kill them in reality.'
      ],
      FIGHTER: [
        'The arena sands shift beneath your feet as a champion gladiator, his muscles rippling like coiled springs, raises his weapon in salute.',
        'Battle-scarred veterans form a shield wall, their disciplined formation unbreakable as they advance with deadly purpose.',
        'A master swordsman demonstrates techniques passed down through generations, his blade moving with the grace of a dancer and the precision of a surgeon.',
        'The training grounds echo with the clash of weapons as warriors hone their skills, their sweat mixing with the dust of countless battles.',
        'A tactical commander studies ancient battle maps, planning maneuvers that could turn the tide of legendary conflicts.',
        'Weapon masters duel with exotic arms from across the world, their styles blending into a symphony of lethal precision.',
        'Heavy infantry charges with spears lowered, their armored forms creating an unstoppable wall of steel and flesh.',
        'Light skirmishers harass enemy flanks, their javelins and bows keeping formations off balance and disorganized.',
        'Cavalry squadrons thunder across plains, their lances gleaming as they prepare to break enemy lines.',
        'Archers form firing lines, their arrows darkening the sky like an artificial storm cloud.',
        'Shield bearers lock together in tortoise formation, advancing slowly but inexorably toward victory.',
        'Berserkers enter battle trance, their rage granting inhuman strength and pain immunity.',
        'Duelists challenge champions to single combat, their honor and skill determining the outcome of larger battles.',
        'Siege engineers construct war machines, their catapults and ballistae capable of breaching any fortress.',
        'Scouts range ahead of main forces, mapping terrain and reporting enemy positions with deadly accuracy.',
        'Medics tend to the wounded on chaotic battlefields, their skills preserving lives amid the carnage.',
        'Quartermasters distribute weapons and armor, ensuring every soldier is equipped for the fight ahead.',
        'Drill instructors break recruits and rebuild them into disciplined fighting machines.',
        'Champions lead from the front, their heroic deeds inspiring allies and demoralizing enemies.',
        'Tacticians analyze enemy formations, finding weaknesses that can be exploited for decisive victory.',
        'Weapon smiths forge blades during lulls in battle, repairing damaged equipment and creating new tools.',
        'Standard bearers carry unit flags, their symbols representing honor, tradition, and unbreakable resolve.',
        'Sappers tunnel beneath enemy fortifications, undermining walls and creating surprise entrances.',
        'Mounted archers circle battlefields, raining death from horseback with impossible accuracy.',
        'Pikemen form hedgehog defenses, their long spears creating barriers that cavalry fears to approach.',
        'Fencing masters teach the art of the blade, their lessons turning street fighters into elegant killers.',
        'Wrestlers grapple with monstrous foes, using leverage and technique to overcome size differences.',
        'Martial artists demonstrate forms that combine combat with spiritual discipline and physical perfection.',
        'Gladiators train in various weapon combinations, mastering the tools of death from every culture.',
        'Survival instructors teach wilderness combat, turning forests and mountains into allied terrain.',
        'Honor guards protect leaders with their lives, their loyalty tested in the fires of battle.'
      ],
      GUILD: [
        'The guild hall\'s great oak doors swing open to reveal masters of various crafts, each demonstrating skills that could only be learned through decades of dedication.',
        'Apprentices scurry about the workshop, their hands skilled beyond their years as they craft items of remarkable quality and precision.',
        'The guildmaster sits enthroned behind his massive desk, surrounded by ledgers and artifacts that represent the accumulated wealth of generations.',
        'Skilled artisans demonstrate techniques that border on the magical, creating objects of such beauty and function that they seem impossible.',
        'The guild library contains tomes of forgotten knowledge, guarded by scholars who have dedicated their lives to preserving and advancing their craft.',
        'Master craftsmen showcase their lifework, from intricate jewelry to massive siege engines that could change the course of wars.',
        'Apprenticeship ceremonies bind young talents to masters, creating lineages of skill that span centuries.',
        'Quality inspectors examine finished works, ensuring that guild standards maintain the highest levels of excellence.',
        'Innovation workshops develop new techniques, pushing the boundaries of what\'s possible with traditional crafts.',
        'Trade negotiations establish pricing and territories, preventing destructive competition between guild members.',
        'Heritage museums display artifacts from guild history, reminding members of their noble traditions and responsibilities.',
        'Skill competitions pit masters against each other, their contests advancing the craft through friendly rivalry.',
        'Education programs teach the next generation, ensuring that ancient techniques survive into the future.',
        'Research divisions experiment with new materials and methods, discovering breakthroughs that revolutionize industries.',
        'Ethics committees judge member conduct, maintaining honor and integrity within the guild\'s ranks.',
        'Charitable foundations support aging masters and orphaned apprentices, creating a safety net for the entire community.',
        'Diplomatic corps negotiate with other guilds and governments, securing favorable conditions for members.',
        'Apprenticeship lotteries determine which masters receive which students, creating diverse skill lineages.',
        'Technology exchanges share innovations between related crafts, accelerating progress across industries.',
        'Retirement ceremonies honor masters who step down, their wisdom preserved in guild oral traditions.',
        'Mentorship programs pair experienced crafters with novices, ensuring knowledge transfer across generations.',
        'Quality certification programs guarantee authenticity, protecting consumers and guild reputation.',
        'Innovation grants fund risky experiments that might lead to revolutionary breakthroughs.',
        'Dispute resolution panels settle conflicts between members, maintaining harmony within the guild.',
        'Historical preservation societies maintain ancient techniques, ensuring traditional crafts don\'t disappear.',
        'Community outreach programs teach basic skills to the public, building goodwill and recruiting talent.',
        'Research libraries catalog every advancement, creating searchable databases of craft knowledge.',
        'Masterpiece competitions create showcases of exceptional work, attracting wealthy patrons and commissions.',
        'Apprenticeship contracts establish clear expectations, protecting both masters and students legally.',
        'Technology sharing agreements prevent monopolies, ensuring that innovations benefit the entire guild.',
        'Legacy programs honor deceased masters, their names and achievements recorded for eternity.'
      ],
      UNDERWORLD: [
        'Shadowy figures lurk in the alleyways, their faces obscured by hoods as they conduct business that would never see the light of day.',
        'The thieves\' guild operates from a network of hidden tunnels, their agents moving like ghosts through the city\'s underbelly.',
        'Contraband goods change hands in whispered conversations, each transaction carrying the weight of discovery and severe punishment.',
        'The criminal underworld pulses with illicit activity, from smuggling operations to protection rackets that span the entire city.',
        'Hidden dens of vice and villainy offer services that respectable society would never acknowledge, but desperately needs.',
        'Black market auctions sell forbidden artifacts, their sellers anonymous and their buyers desperate or wealthy.',
        'Assassins\' contracts are negotiated in smoke-filled rooms, their targets ranging from merchants to monarchs.',
        'Smugglers\' caravans move under cover of night, their cargo valuable enough to start wars if discovered.',
        'Protection rackets demand tribute from businesses, their enforcers making examples of those who refuse.',
        'Information brokers trade secrets like currency, their networks spanning from slums to royal courts.',
        'Fence operations launder stolen goods, turning hot property into legitimate merchandise.',
        'Pirate crews offer privateering commissions, their letters of marque blurring legal and illegal lines.',
        'Drug dens provide exotic substances, their dealers promising escape from reality\'s harsh demands.',
        'Gambling dens operate with loaded dice and marked cards, their house always winning in the end.',
        'Slave markets traffic in human lives, their auctions conducted in hidden chambers far from prying eyes.',
        'Weapon smugglers deal in illegal arms, their inventory ranging from poisoned daggers to siege engines.',
        'Forgery operations create false documents, their artists capable of duplicating any seal or signature.',
        'Burglary crews plan heists of legendary difficulty, their targets including banks, museums, and palaces.',
        'Extortion rings squeeze businesses dry, their threats backed by arson, sabotage, and worse.',
        'Kidnapping specialists offer ransom services, their victims chosen for wealth and political influence.',
        'Sabotage experts disrupt competitors, their methods ranging from industrial accidents to corporate espionage.',
        'Terrorist cells plan attacks for political gain, their ideologies as varied as their methods of destruction.',
        'Money launderers clean illicit gains, their complex schemes hiding wealth in legitimate enterprises.',
        'Hit squads eliminate problems permanently, their methods efficient and their discretion absolute.',
        'Contraband alchemists brew illegal potions, their elixirs promising power at the cost of addiction.',
        'Underground fighting pits stage illegal combats, their champions becoming legends in criminal circles.',
        'Bribery networks corrupt officials systematically, their webs of influence reaching into government.',
        'Smuggling tunnels honeycomb the city, their entrances hidden behind false walls and trap doors.',
        'Blackmail operations collect compromising information, their victims paying eternal silence.',
        'Rogue tax collectors skim from criminal enterprises, their protection costing more than official rates.',
        'Underground banks offer loans at predatory rates, their collateral often including lives and limbs.'
      ],
      NECROMANCER: [
        'Skeletal hands claw their way through the earth as a necromancer conducts a ritual to raise an army from the graveyard\'s silent residents.',
        'The air grows cold and heavy as necrotic energies swirl around the dark sorcerer, animating corpses with unholy life.',
        'Ancient tombs creak open as the dead rise to serve their new master, their empty eye sockets glowing with baleful light.',
        'A lich floats above his throne of bones, his skeletal fingers weaving spells that blur the line between life and death.',
        'Death magic saturates the air like a choking fog, raising legions of undead warriors to march under necrotic banners.',
        'Soul jars capture essence at the moment of death, their glowing contents containing memories and personalities intact.',
        'Bone golems assemble themselves from scattered remains, their joints grinding as they form protective guardians.',
        'Wailing spirits manifest as banshees, their screams capable of shattering stone and driving men to madness.',
        'Mummified priests rise from sarcophagi, their bandages inscribed with curses that activate upon disturbance.',
        'Zombie hordes shamble forward mindlessly, their decayed forms driven by necromantic will alone.',
        'Spectral warriors haunt battlefields, their ghostly blades passing through armor to strike the soul directly.',
        'Lich phylacteries hide in impossible locations, their destruction the only way to permanently end their masters.',
        'Death knights ride skeletal steeds, their cursed armor and weapons striking fear into the hearts of the living.',
        'Ghoul packs hunt in packs, their regenerative abilities making them terrifyingly persistent combatants.',
        'Wight lords command lesser undead, their intelligence and spellcasting making them strategic threats.',
        'Vampiric thralls serve their masters eternally, their bloodlust tempered by necromantic control.',
        'Bone naga slither from tombs, their serpentine forms combining undead resilience with arcane power.',
        'Death worms burrow through graveyards, their acidic blood dissolving both earth and enemy alike.',
        'Skeletal dragons soar on necrotic winds, their bony wings casting shadows that wither plant life below.',
        'Mummy lords awaken in pyramid depths, their curses bringing plagues and misfortune to violators.',
        'Ghost ships sail ethereal seas, their phantom crews seeking living sailors to join their cursed voyage.',
        'Bone collectors harvest remains systematically, their necromantic arts creating specialized undead servants.',
        'Soul forges bind spirits to weapons, creating blades that drink life force with every strike.',
        'Death altars pulse with stolen life energy, their power growing with each sacrifice made upon them.',
        'Necrotic storms rage around ritual sites, their lightning carrying fragments of trapped souls.',
        'Bone libraries contain grimoires written in marrow ink, their pages turning themselves to reveal secrets.',
        'Soul cages imprison powerful spirits, their rage fueling necromantic spells of incredible power.',
        'Death gardens grow crystalline flowers that bloom only in the presence of violent death.',
        'Lich academies teach the arts of undeath, their students progressing from corpses to immortal beings.',
        'Soul merchants trade in captured essences, their markets dealing in the currency of stolen lives.',
        'Necrotic beacons draw the dead like moths to flame, concentrating undead forces for massive assaults.'
      ],
      MAGE: [
        'Towering spires of arcane energy reach toward the heavens as a grand mage conducts experiments that bend the laws of physics itself.',
        'Crystal spheres float in complex orbital patterns, each containing miniature universes created through sheer magical willpower.',
        'The air shimmers with uncontrolled magic as apprentices practice spells that could accidentally rewrite reality itself.',
        'Ancient tomes levitate around the master mage, their pages turning as they absorb knowledge directly into his mind.',
        'The laboratory pulses with magical energy, containing devices that can manipulate matter at the atomic level through arcane means.',
        'Arcane academies teach the fundamentals of magic, their curriculums covering everything from basic cantrips to reality warping.',
        'Spell research laboratories develop new incantations, their experiments sometimes causing magical anomalies.',
        'Crystal libraries store knowledge in gem matrices, their information accessible only through magical means.',
        'Alchemy workshops combine magic with science, creating potions that bend natural laws.',
        'Enchantment forges imbue items with permanent magic, their products ranging from flying carpets to self-cleaning armor.',
        'Divination chambers allow glimpses of possible futures, their predictions becoming self-fulfilling prophecies.',
        'Teleportation circles connect distant locations, their magical gates allowing instantaneous travel.',
        'Elemental summoning chambers contain bound spirits, their powers available for spell enhancement.',
        'Rune carving studios create permanent magical effects, their symbols etched into reality itself.',
        'Familiar bonding rituals create lifelong magical partnerships, their bonds strengthening both parties.',
        'Spell component greenhouses grow magical herbs, their rare plants requiring specific conditions to thrive.',
        'Crystal growth chambers cultivate power sources, their gems storing magical energy for later use.',
        'Memory palaces store vast knowledge magically, their rooms containing perfect recollections of any subject.',
        'Illusion workshops create deceptive realities, their training grounds teaching mastery over perception.',
        'Transformation laboratories allow shapeshifting studies, their subjects practicing animal and object forms.',
        'Time manipulation chambers slow or accelerate local time, allowing research that would take years in hours.',
        'Gravity manipulation rooms defy physics, their floating platforms and weightless environments enabling unique experiments.',
        'Language decipherment studies unlock ancient magical texts, their translations revealing lost spells.',
        'Weather control observatories manipulate local climate, their mages commanding storms and sunshine.',
        'Portal research creates stable gateways to other planes, their explorers returning with exotic materials.',
        'Soul binding studies explore the connection between magic and life force, their ethics highly debated.',
        'Dimensional folding experiments create extra space, their pocket dimensions storing impossible amounts.',
        'Mind magic laboratories study thought and consciousness, their research bordering on mental domination.',
        'Energy manipulation workshops harness raw magical power, their experiments creating new forms of magic.',
        'Prophecy workshops train oracles and seers, their visions guiding magical research directions.',
        'Spell combination studies create hybrid magic, their results unpredictable but often revolutionary.'
      ],
      ROGUE: [
        'Silent footsteps echo through the shadows as a master thief demonstrates techniques that make him all but invisible in plain sight.',
        'Locks click open with delicate precision as skilled fingers manipulate tumblers and wards with the finesse of a surgeon.',
        'Traps are disarmed with surgical precision, each wire and pressure plate handled with the care of someone who values their life.',
        'The rogue moves through the crowd like a ghost, slipping purses and secrets with equal facility and without detection.',
        'Shadowy figures scale sheer walls with impossible grace, finding handholds where none should exist.',
        'Pickpocket schools teach the art of the light touch, their graduates able to steal thoughts along with coins.',
        'Burglary workshops train in breaking and entering, their students mastering every type of lock and alarm.',
        'Assassination techniques range from poison to politics, their practitioners ghosts in the corridors of power.',
        'Sabotage experts disable security systems, their work making heists possible or buildings collapse.',
        'Forgery ateliers create perfect duplicates, their artists copying seals, signatures, and even magical auras.',
        'Information networks span cities and nations, their whispers carrying secrets that topple governments.',
        'Smuggling tunnels honeycomb borders, their guides knowing every patrol pattern and hidden route.',
        'Gambling dens employ cheating techniques, their dealers stacking decks and loading dice with precision.',
        'Kidnapping specialists plan extractions flawlessly, their targets vanishing without a trace.',
        'Blackmail operations collect compromising evidence, their networks of informants creating leverage.',
        'Fence operations clean stolen goods, their experts knowing exactly what sells and for how much.',
        'Spy rings infiltrate organizations, their agents becoming trusted members while stealing secrets.',
        'Poison labs create undetectable toxins, their chemists mixing substances that mimic natural death.',
        'Disguise artists become anyone, their transformations so perfect they fool magical detection.',
        'Trap makers design devious devices, their mechanisms combining mechanical and magical elements.',
        'Escape artists teach breakout techniques, their methods working on any jail or magical binding.',
        'Surveillance experts track targets invisibly, their reports detailing habits, weaknesses, and opportunities.',
        'Weapon concealers hide armories in plain sight, their techniques making swords disappear into canes.',
        'Code breakers decipher encrypted messages, their minds unraveling the most complex ciphers.',
        'Shadow warriors train in darkness combat, their techniques allowing perfect vision in total black.',
        'Acrobatics schools teach impossible maneuvers, their graduates walking tightropes over sheer drops.',
        'Thievery museums display legendary heists, their exhibits teaching techniques to aspiring criminals.',
        'Interrogation experts extract information, their methods ranging from charm to coercion.',
        'Demolition specialists prepare explosives, their controlled blasts creating opportunities or diversions.',
        'Counterfeiting operations produce fake currency, their notes passing every magical and mundane test.',
        'Infiltration teams breach secure facilities, their members becoming part of the environment.'
      ],
      CLERIC: [
        'Divine light radiates from sacred symbols as a high priest conducts rituals that channel the power of the gods themselves.',
        'Holy water sizzles as it touches corrupted flesh, while sacred chants drive back the forces of darkness and decay.',
        'The temple air fills with the scent of incense and divine power as priests perform miracles that heal the body and soothe the soul.',
        'Sacred relics pulse with holy energy, their power capable of banishing demons or curing the most virulent plagues.',
        'The clerics chant in unison, their voices weaving a tapestry of divine magic that can reshape reality according to their faith.',
        'Cathedral choirs sing hymns that manifest as physical light, their music creating zones of protection and healing.',
        'Exorcism chambers contain bound demons, their priests practicing banishment rituals on willing test subjects.',
        'Healing wards treat the sick and injured, their divine magic curing diseases that mundane medicine cannot.',
        'Divination altars allow communion with deities, their priests receiving visions and prophecies directly.',
        'Blessing ceremonies imbue weapons and armor with divine power, making them effective against supernatural threats.',
        'Funeral rites guide souls to the afterlife, their ceremonies preventing undead creation and ensuring peace.',
        'Marriage sacraments bind couples in divine union, their vows magically enforced and spiritually blessed.',
        'Ordination ceremonies elevate priests to higher ranks, their new powers manifesting as visible auras.',
        'Confession booths absolve sins through divine forgiveness, their priests counseling and spiritually healing.',
        'Pilgrimage routes lead to holy sites, their travelers gaining divine favor through acts of devotion.',
        'Miracle working requires deep faith, their priests channeling deity power for impossible acts.',
        'Temple libraries contain sacred texts, their scholars interpreting divine will and ancient prophecies.',
        'Sacrificial altars accept offerings, their priests distributing blessings in exchange for devotion.',
        'Divine intervention calls upon gods directly, their answers ranging from subtle signs to cataclysmic events.',
        'Holy wars are declared against evil, their crusaders blessed with divine protection and strength.',
        'Sanctification rituals purify corrupted areas, their priests cleansing taint and restoring natural balance.',
        'Prayer circles amplify faith power, their combined devotion creating effects beyond individual capability.',
        'Divine judgment reveals truth and lies, their priests becoming living detectors of deception.',
        'Resurrection ceremonies restore life to the dead, their success depending on faith and divine favor.',
        'Temple guardians protect sacred sites, their combat training combining martial skill with divine power.',
        'Charity missions aid the poor and suffering, their priests distributing divine blessings along with material help.',
        'Prophecy interpretation guides communities, their seers translating divine messages for practical application.',
        'Divine crafting creates holy artifacts, their smiths and artisans blessed with supernatural skill.',
        'Faith healing soothes mind and body, their priests addressing spiritual causes of physical ailments.',
        'Temple politics navigate divine hierarchies, their priests managing relationships between gods and mortals.',
        'Divine magic research explores god-given powers, their scholars pushing boundaries of faith and magic.'
      ],
      ADVENTURE: [
        'The call of adventure beckons as ancient maps reveal forgotten paths leading to legendary destinations where heroes are forged and legends are born.',
        'Mysterious ruins emerge from the mists of time, their weathered stones whispering secrets of civilizations long lost to the sands of history.',
        'A legendary artifact pulses with otherworldly energy, promising unimaginable power to those brave enough to claim it from its ancient guardians.',
        'The wilderness calls with untamed fury, offering both peril and glory to those who dare venture into its uncharted depths and hidden wonders.',
        'Ancient prophecies speak of a chosen hero destined to undertake a journey that will reshape the world and define the course of history.',
        'Forgotten temples rise from jungle vines, their sacred chambers containing artifacts of power that could change the balance of nations.',
        'The ocean depths hide sunken cities of unimaginable wealth, guarded by creatures of nightmare and treasures beyond mortal comprehension.',
        'Skyward spires pierce the clouds, home to winged beings and floating citadels where the laws of physics bend to magical will.',
        'Time itself fractures in these ancient lands, creating pockets where past, present, and future collide in spectacular and dangerous ways.',
        'Elemental forces manifest as living entities, offering alliances, challenges, and powers that could tip the scales of any conflict.',
        'Spirit realms overlap with the mortal world in these sacred places, allowing communion with beings of pure thought and emotion.',
        'The very fabric of reality thins here, creating opportunities for planar travel and encounters with entities from other dimensions.',
        'Legendary beasts roam these wild lands, their hides containing materials that could forge weapons capable of slaying gods.',
        'Ancient curses and blessings intertwine in these locations, offering power at the cost of destiny and free will.',
        'The landscape itself seems alive, with trees that whisper secrets and stones that remember the touch of ancient heroes.',
        'Portals to other worlds shimmer in the air, offering shortcuts to distant lands or pathways to realms of unimaginable danger.',
        'Sacred groves contain the essence of nature itself, where druids and shamans can commune with the primal forces of creation.',
        'Volcanic forges in mountain hearts contain metals that can be shaped into artifacts of devastating power and beauty.',
        'Frozen wastes hide crystal caverns where time crystals allow glimpses of future events and alternate realities.',
        'Desert sands conceal buried pyramids containing mummies, treasures, and curses that have waited millennia for the unwary.',
        'Thunderstorms rage eternally in these storm-wracked peaks, where cloud giants hoard lightning-forged weapons of legend.',
        'Subterranean networks of caves connect the surface world to underworld realms, home to dwarves, dragons, and darker things.',
        'Floating islands drift through endless skies, containing gardens, castles, and creatures that have never touched the earth.',
        'Mirror lakes reflect not just the physical world, but alternate realities where different choices led to different fates.',
        'Crystal formations grow like living sculptures, their structures containing the accumulated wisdom of geological ages.',
        'Eternal flames burn in sacred hearths, their fires containing the essence of creation and capable of forging divine artifacts.',
        'Whispering winds carry messages from distant lands, speaking of opportunities, dangers, and destinies yet to be fulfilled.',
        'Ancient standing stones align with celestial events, creating moments when the barriers between worlds grow thin.',
        'Living forests contain trees that have witnessed the rise and fall of empires, their bark etched with the stories of ages.',
        'Coral castles rise from ocean depths, their chambers containing pearls that grant visions of the future and past.'
      ],
      QUEST: [
        'A royal decree summons you to undertake a perilous quest that could determine the fate of the kingdom and its people.',
        'The guild master presents a contract of legendary difficulty, promising wealth and glory to those who can complete its demands.',
        'An ancient prophecy foretells your role in a grand quest that will span continents and challenge the very gods themselves.',
        'A personal tragedy drives you to undertake a quest for vengeance, justice, or redemption that will test your limits.',
        'Diplomatic negotiations hinge on your ability to complete a dangerous quest that could prevent or ignite a war.',
        'A loved one\'s life depends on successfully completing this quest, adding emotional weight to every decision and action.',
        'The fate of an entire village rests on your shoulders as you undertake a quest to save them from impending doom.',
        'Arcane forces compel you to undertake a quest that could unravel the mysteries of magic itself.',
        'A legendary artifact can only be obtained through a quest of such difficulty that few have even attempted it.',
        'Time itself seems to run short as you undertake a quest with a deadline that could doom entire civilizations.',
        'Multiple factions compete to have you undertake their quest, each offering different rewards and complications.',
        'A dream visitation from a deity compels you to undertake a sacred quest that could elevate you to legendary status.',
        'The black market offers a quest of such profitability that it attracts adventurers from across the known world.',
        'A scholarly pursuit leads to a quest for knowledge so dangerous that it has claimed the lives of previous seekers.',
        'Environmental disasters can only be averted through a quest to find and activate ancient protective mechanisms.',
        'Rival adventurers challenge you to quests of increasing difficulty, turning the entire endeavor into a competition.',
        'A series of connected quests unfolds like a grand tapestry, each completion revealing the next piece of the puzzle.',
        'The quest requires assembling a team of specialists, each bringing unique skills to overcome different challenges.',
        'What begins as a simple task evolves into a complex quest spanning multiple continents and cultures.',
        'The quest\'s true nature is hidden, revealing itself gradually through clues, betrayals, and unexpected alliances.',
        'Ancient guardians test your worthiness at each stage of the quest, demanding wisdom as much as strength.',
        'The quest spans generations, requiring you to pass on knowledge and artifacts to ensure its completion.',
        'Multiple paths exist to complete the quest, each with different risks, rewards, and moral implications.',
        'The quest requires mastering new skills and abilities, transforming you as much as achieving the goal.',
        'Political intrigue complicates the quest, with various factions attempting to influence or sabotage your efforts.',
        'The natural world itself seems to oppose or aid your quest, with weather and wildlife playing crucial roles.',
        'Technological marvels encountered during the quest offer shortcuts but also present new dangers and temptations.',
        'The quest requires balancing multiple objectives, forcing difficult choices between competing priorities.',
        'Supernatural elements weave through the quest, blurring the lines between the physical and spiritual worlds.',
        'The quest\'s completion promises not just material rewards, but fundamental changes to your character and destiny.'
      ]
    };

    const typeDescriptions = descriptions[type] || [
      'A significant event occurs that requires your attention.',
      'You encounter a situation that demands consideration.',
      'An important matter presents itself for resolution.',
      'You face circumstances that require decisive action.',
      'A meaningful opportunity or challenge appears before you.'
    ];

    let description = this.chance.pickone(typeDescriptions);

    description = this.addContextualEnhancements(description, context);

    description = description.trim();
    if (!/[.!?]$/.test(description)) {
      description += '.';
    }

    return description;
  }

  /**
   * Generate event choices matching the event type and difficulty
   * 
   * @param type - Event type (e.g., 'COMBAT', 'SOCIAL', 'MAGIC')
   * @param difficulty - Difficulty level ('easy', 'moderate', 'hard', 'extreme')
   * @param context - Analyzed player context (currently unused, reserved for future use)
   * @returns Array of 2-4 choices with appropriate effects based on difficulty
   */
  private generateChoices(type: string, difficulty: string, context: AnalyzedContext): Choice[] {
    // Check all available themes for custom choices, prioritizing 'default'
    const themesToCheck = ['default', ...Object.keys(this.customChoices).filter(k => k !== 'default')];
    
    for (const theme of themesToCheck) {
      const customThemeChoices = this.customChoices[theme];
      if (customThemeChoices && customThemeChoices[type] && customThemeChoices[type].length > 0) {
        const texts = customThemeChoices[type];
        const choiceCount = Math.min(4, texts.length);
        const selectedTexts = this.chance.pickset(texts, choiceCount);

        return selectedTexts.map((text, index) => ({
          text,
          effect: this.generateChoiceEffect(type, difficulty, index)
        }));
      }
    }

    const choiceTexts: { [key: string]: string[] } = {
      COMBAT: [
        'Charge into battle', 'Fight bravely', 'Stand your ground', 'Press the attack',
        'Attempt to flee', 'Retreat strategically', 'Fall back', 'Withdraw to safety',
        'Negotiate peace', 'Parley with the enemy', 'Seek truce', 'Offer surrender terms',
        'Use tactical strategy', 'Flank the enemy', 'Set up ambush', 'Outmaneuver opponent',
        'Call for reinforcements', 'Signal allies', 'Summon backup', 'Request aid',
        'Use defensive formation', 'Build barricade', 'Take cover', 'Fortify position',
        'Counterattack', 'Exploit weakness', 'Seize opportunity', 'Strike decisively',
        'Intimidate enemy', 'Show force', 'Demonstrate power', 'Issue challenge',
        'Use terrain advantage', 'Fight from high ground', 'Control the battlefield', 'Dominate position',
        'Conserve energy', 'Wait for opening', 'Observe and learn', 'Bide your time',
        'Sacrifice for victory', 'Make last stand', 'Fight to the death', 'Never surrender',
        'Use hit-and-run tactics', 'Harass enemy', 'Wear them down', 'Attrition warfare',
        'Break enemy formation', 'Disrupt their lines', 'Cause chaos', 'Sow confusion'
      ],
      SOCIAL: [
        'Be diplomatic', 'Speak eloquently', 'Choose words carefully', 'Communicate respectfully',
        'Be assertive', 'Stand firm', 'Express confidence', 'Demand attention',
        'Listen carefully', 'Pay close attention', 'Show interest', 'Be attentive',
        'Change the subject', 'Redirect conversation', 'Shift focus', 'Alter direction',
        'Offer friendship', 'Extend hand of alliance', 'Build rapport', 'Create connection',
        'Express gratitude', 'Show appreciation', 'Give thanks', 'Acknowledge kindness',
        'Share information', 'Reveal knowledge', 'Provide insight', 'Offer wisdom',
        'Ask questions', 'Seek clarification', 'Inquire further', 'Request details',
        'Make small talk', 'Engage in pleasantries', 'Chat casually', 'Converse lightly',
        'Compliment others', 'Offer praise', 'Express admiration', 'Give respect',
        'Show empathy', 'Demonstrate understanding', 'Express sympathy', 'Share feelings',
        'Negotiate terms', 'Discuss conditions', 'Bargain effectively', 'Reach agreement',
        'Tell a story', 'Share anecdote', 'Narrate experience', 'Relate tale',
        'Offer assistance', 'Provide help', 'Lend support', 'Extend aid',
        'Express disagreement', 'Voice objection', 'State opposition', 'Raise concerns',
        'Make joke', 'Lighten mood', 'Use humor', 'Diffuse tension',
        'Give advice', 'Offer counsel', 'Provide guidance', 'Share wisdom',
        'Express curiosity', 'Show interest', 'Demonstrate intrigue', 'Reveal fascination',
        'Offer compromise', 'Find middle ground', 'Suggest solution', 'Propose alternative'
      ],
      EXPLORATION: [
        'Investigate thoroughly', 'Examine closely', 'Study carefully', 'Analyze deeply',
        'Proceed cautiously', 'Move carefully', 'Advance slowly', 'Tread lightly',
        'Call for help', 'Summon assistance', 'Request backup', 'Signal for aid',
        'Turn back', 'Retreat safely', 'Return to safety', 'Abandon exploration',
        'Map the area', 'Chart surroundings', 'Record findings', 'Document discovery',
        'Collect samples', 'Gather specimens', 'Take evidence', 'Secure artifacts',
        'Follow the trail', 'Track the path', 'Pursue the lead', 'Chase the clue',
        'Set up camp', 'Establish base', 'Create outpost', 'Build shelter',
        'Search for resources', 'Look for supplies', 'Find materials', 'Locate provisions',
        'Observe wildlife', 'Study creatures', 'Watch animals', 'Monitor behavior',
        'Examine ruins', 'Inspect ancient sites', 'Study architecture', 'Analyze structures',
        'Test the waters', 'Check depth', 'Assess danger', 'Gauge risk',
        'Mark the path', 'Leave trail markers', 'Create waypoints', 'Establish route',
        'Listen for sounds', 'Strain to hear', 'Detect noises', 'Perceive audio cues',
        'Look for signs', 'Search for clues', 'Find indicators', 'Discover evidence',
        'Climb higher', 'Scale elevation', 'Reach summit', 'Gain vantage point',
        'Dig deeper', 'Excavate site', 'Unearth artifacts', 'Reveal buried items',
        'Consult maps', 'Check charts', 'Reference guides', 'Study navigation aids',
        'Test the ground', 'Check stability', 'Assess terrain', 'Evaluate footing',
        'Observe weather', 'Monitor conditions', 'Watch sky', 'Track atmospheric changes',
        'Follow instincts', 'Trust intuition', 'Follow gut feeling', 'Rely on experience',
        'Document findings', 'Record observations', 'Note discoveries', 'Log information'
      ],
      ECONOMIC: [
        'Accept the deal', 'Agree to terms', 'Seal the agreement', 'Finalize contract',
        'Negotiate better terms', 'Bargain harder', 'Improve conditions', 'Refine agreement',
        'Decline politely', 'Politely refuse', 'Gracefully reject', 'Courteously decline',
        'Seek advice', 'Consult experts', 'Get counsel', 'Request guidance',
        'Invest heavily', 'Commit resources', 'Put up capital', 'Fund the venture',
        'Diversify portfolio', 'Spread investments', 'Balance risk', 'Hedge bets',
        'Cut losses', 'Abandon failing venture', 'Accept defeat', 'Withdraw investment',
        'Seek partnership', 'Find collaborators', 'Form alliance', 'Create joint venture',
        'Audit finances', 'Review accounts', 'Check books', 'Examine records',
        'Raise capital', 'Secure funding', 'Obtain loans', 'Generate revenue',
        'Reduce expenses', 'Cut costs', 'Trim budget', 'Economize operations',
        'Expand business', 'Grow enterprise', 'Scale operations', 'Increase market share',
        'Research market', 'Study trends', 'Analyze competition', 'Understand demand',
        'Price competitively', 'Set fair rates', 'Determine value', 'Establish pricing',
        'Build reputation', 'Establish trust', 'Create brand', 'Develop goodwill',
        'Network actively', 'Make connections', 'Build relationships', 'Expand contacts',
        'Manage risk', 'Assess threats', 'Plan contingencies', 'Prepare for uncertainty',
        'Track performance', 'Monitor results', 'Measure success', 'Evaluate outcomes',
        'Adapt strategy', 'Change approach', 'Modify plan', 'Adjust course',
        'Celebrate success', 'Reward achievement', 'Recognize effort', 'Honor accomplishment',
        'Learn from failure', 'Study mistakes', 'Analyze errors', 'Understand setbacks',
        'Plan for future', 'Prepare ahead', 'Anticipate needs', 'Forecast trends',
        'Delegate tasks', 'Assign responsibilities', 'Distribute work', 'Share load',
        'Innovate processes', 'Improve methods', 'Streamline operations', 'Enhance efficiency'
      ],
      MYSTERY: [
        'Investigate thoroughly', 'Examine evidence', 'Study clues', 'Analyze findings',
        'Ask questions', 'Inquire deeply', 'Seek answers', 'Probe for information',
        'Look for clues', 'Search for evidence', 'Find indicators', 'Discover hints',
        'Be cautious', 'Exercise care', 'Proceed carefully', 'Show prudence',
        'Follow the trail', 'Track the path', 'Pursue the lead', 'Chase the clue',
        'Interview witnesses', 'Question suspects', 'Gather testimony', 'Collect statements',
        'Examine crime scene', 'Study location', 'Analyze site', 'Inspect area',
        'Decode messages', 'Interpret symbols', 'Unravel codes', 'Break ciphers',
        'Research history', 'Study background', 'Investigate past', 'Examine records',
        'Test theories', 'Verify hypotheses', 'Validate ideas', 'Confirm suspicions',
        'Observe suspects', 'Watch carefully', 'Monitor activity', 'Track movements',
        'Gather intelligence', 'Collect information', 'Acquire knowledge', 'Build dossier',
        'Consult experts', 'Seek specialists', 'Get professional help', 'Request expertise',
        'Follow instincts', 'Trust intuition', 'Follow gut feeling', 'Rely on experience',
        'Document findings', 'Record observations', 'Note discoveries', 'Log information',
        'Connect the dots', 'Find patterns', 'Link evidence', 'Establish connections',
        'Challenge assumptions', 'Question beliefs', 'Test preconceptions', 'Verify facts',
        'Explore motives', 'Understand reasons', 'Analyze motivations', 'Examine causes',
        'Time the sequence', 'Establish timeline', 'Create chronology', 'Map events',
        'Test alibis', 'Verify stories', 'Check claims', 'Validate accounts',
        'Search for hidden meanings', 'Look for subtext', 'Find deeper significance', 'Uncover layers',
        'Compare evidence', 'Cross-reference data', 'Correlate findings', 'Match information',
        'Draw conclusions', 'Reach decisions', 'Form judgments', 'Make assessments',
        'Present findings', 'Share discoveries', 'Report results', 'Communicate conclusions',
        'Pursue justice', 'Seek resolution', 'Find closure', 'Achieve understanding'
      ],
      SUPERNATURAL: [
        'Approach carefully', 'Move cautiously', 'Advance slowly', 'Tread lightly',
        'Use protective magic', 'Cast wards', 'Create barriers', 'Establish protection',
        'Observe from distance', 'Watch remotely', 'Monitor safely', 'Study from afar',
        'Seek guidance', 'Request counsel', 'Ask for advice', 'Consult wisdom',
        'Perform ritual', 'Conduct ceremony', 'Execute rite', 'Complete ritual',
        'Invoke protection', 'Call for safety', 'Summon guardians', 'Request defense',
        'Study phenomenon', 'Examine occurrence', 'Analyze event', 'Investigate mystery',
        'Communicate with entity', 'Contact being', 'Reach out', 'Establish dialogue',
        'Offer tribute', 'Provide offering', 'Give sacrifice', 'Present gift',
        'Banish presence', 'Exorcise spirit', 'Remove entity', 'Eliminate threat',
        'Harness power', 'Channel energy', 'Control force', 'Direct influence',
        'Research lore', 'Study legends', 'Investigate myths', 'Examine traditions',
        'Consult oracle', 'Seek prophecy', 'Request vision', 'Ask for foresight',
        'Purify area', 'Cleanse space', 'Remove corruption', 'Eliminate taint',
        'Bind entity', 'Control spirit', 'Dominate being', 'Subjugate force',
        'Open portal', 'Create gateway', 'Establish connection', 'Form link',
        'Close breach', 'Seal rift', 'Repair tear', 'Fix damage',
        'Absorb energy', 'Draw power', 'Siphon force', 'Extract essence',
        'Transform reality', 'Alter existence', 'Change nature', 'Modify being',
        'Witness miracle', 'Observe wonder', 'Experience phenomenon', 'Encounter marvel',
        'Challenge authority', 'Question power', 'Test limits', 'Push boundaries',
        'Accept fate', 'Embrace destiny', 'Surrender to will', 'Submit to power',
        'Resist influence', 'Fight control', 'Oppose domination', 'Reject authority',
        'Embrace change', 'Accept transformation', 'Welcome alteration', 'Celebrate evolution',
        'Preserve balance', 'Maintain harmony', 'Keep equilibrium', 'Sustain order',
        'Disrupt order', 'Break harmony', 'Destroy balance', 'Cause chaos'
      ],
      POLITICAL: [
        'Support the proposal', 'Back the plan', 'Endorse the idea', 'Champion the cause',
        'Voice opposition', 'Express dissent', 'State disagreement', 'Raise objection',
        'Seek compromise', 'Find middle ground', 'Negotiate settlement', 'Reach agreement',
        'Abstain from voting', 'Decline participation', 'Choose neutrality', 'Remain impartial',
        'Lobby for change', 'Advocate reform', 'Push for progress', 'Campaign for improvement',
        'Form alliance', 'Create coalition', 'Build partnership', 'Establish union',
        'Challenge authority', 'Question leadership', 'Test power', 'Probe limits',
        'Exercise influence', 'Use connections', 'Leverage relationships', 'Apply pressure',
        'Gather support', 'Build consensus', 'Unite factions', 'Create majority',
        'Block legislation', 'Prevent passage', 'Obstruct progress', 'Halt advancement',
        'Propose amendment', 'Suggest changes', 'Offer modifications', 'Recommend alterations',
        'Conduct investigation', 'Launch inquiry', 'Initiate probe', 'Begin examination',
        'Issue decree', 'Proclaim edict', 'Announce policy', 'Declare position',
        'Negotiate treaty', 'Bargain agreement', 'Hammer out deal', 'Forge pact',
        'Address public', 'Speak to masses', 'Communicate with people', 'Reach citizens',
        'Consult advisors', 'Seek counsel', 'Request advice', 'Ask for guidance',
        'Monitor opposition', 'Watch rivals', 'Track enemies', 'Observe competition',
        'Build reputation', 'Establish credibility', 'Create image', 'Develop persona',
        'Navigate bureaucracy', 'Work the system', 'Manage paperwork', 'Handle administration',
        'Court favor', 'Seek patronage', 'Gain sponsorship', 'Win support',
        'Stage protest', 'Organize demonstration', 'Mobilize crowd', 'Lead march',
        'Conduct diplomacy', 'Practice statecraft', 'Exercise tact', 'Show finesse',
        'Manage crisis', 'Handle emergency', 'Control situation', 'Steer outcome',
        'Plan succession', 'Arrange transition', 'Prepare replacement', 'Design handover',
        'Exercise veto', 'Use blocking power', 'Apply restraint', 'Impose limitation',
        'Grant pardon', 'Offer clemency', 'Provide forgiveness', 'Extend mercy',
        'Declare war', 'Announce conflict', 'Proclaim hostilities', 'Start war',
        'Negotiate peace', 'Pursue armistice', 'Seek ceasefire', 'End hostilities'
      ],
      TECHNOLOGICAL: [
        'Activate the device', 'Start the machine', 'Power up system', 'Initialize equipment',
        'Examine the mechanism', 'Study the device', 'Analyze the machine', 'Inspect the apparatus',
        'Test functionality', 'Check operations', 'Verify performance', 'Assess capability',
        'Be careful', 'Exercise caution', 'Proceed safely', 'Show prudence',
        'Calibrate system', 'Adjust settings', 'Tune parameters', 'Fine-tune controls',
        'Debug the code', 'Fix programming', 'Resolve errors', 'Correct bugs',
        'Upgrade components', 'Improve hardware', 'Enhance systems', 'Boost performance',
        'Maintain equipment', 'Service machinery', 'Perform upkeep', 'Conduct repairs',
        'Research applications', 'Explore uses', 'Investigate potential', 'Study possibilities',
        'Document procedures', 'Record methods', 'Log processes', 'Note techniques',
        'Train operators', 'Teach usage', 'Instruct users', 'Educate personnel',
        'Scale production', 'Increase output', 'Expand capacity', 'Grow operations',
        'Automate process', 'Implement machines', 'Introduce automation', 'Create efficiency',
        'Monitor performance', 'Track metrics', 'Measure results', 'Analyze data',
        'Innovate design', 'Create new models', 'Develop prototypes', 'Build inventions',
        'Test safety', 'Verify security', 'Check reliability', 'Assess stability',
        'Integrate systems', 'Connect components', 'Link technologies', 'Unify platforms',
        'Optimize efficiency', 'Improve productivity', 'Enhance output', 'Maximize results',
        'Troubleshoot issues', 'Solve problems', 'Fix malfunctions', 'Resolve failures',
        'Reverse engineer', 'Study construction', 'Analyze design', 'Understand workings',
        'Patent invention', 'Protect intellectual property', 'Secure rights', 'Claim ownership',
        'Commercialize technology', 'Market invention', 'Sell product', 'Monetize creation',
        'Collaborate on research', 'Share knowledge', 'Pool expertise', 'Joint development',
        'Standardize processes', 'Establish protocols', 'Create guidelines', 'Set standards',
        'Recycle materials', 'Reuse components', 'Conserve resources', 'Reduce waste',
        'Upgrade infrastructure', 'Modernize systems', 'Update technology', 'Refresh equipment'
      ],
      MAGIC: [
        'Approach carefully', 'Move cautiously', 'Advance slowly', 'Tread lightly',
        'Use protective magic', 'Cast wards', 'Create barriers', 'Establish protection',
        'Observe from distance', 'Watch remotely', 'Monitor safely', 'Study from afar',
        'Seek guidance', 'Request counsel', 'Ask for advice', 'Consult wisdom',
        'Channel energy', 'Harness power', 'Draw mana', 'Gather essence',
        'Cast spell', 'Weave magic', 'Invoke power', 'Release energy',
        'Study runes', 'Examine symbols', 'Analyze glyphs', 'Investigate sigils',
        'Brew potion', 'Mix elixir', 'Create concoction', 'Prepare remedy',
        'Enchant item', 'Imbue object', 'Infuse magic', 'Empower artifact',
        'Summon familiar', 'Call companion', 'Invoke ally', 'Conjure helper',
        'Research spells', 'Study magic', 'Investigate arcane', 'Explore mysteries',
        'Meditate deeply', 'Contemplate magic', 'Reflect on power', 'Consider essence',
        'Practice incantation', 'Rehearse spell', 'Drill casting', 'Exercise magic',
        'Experiment with magic', 'Test theories', 'Try new spells', 'Explore possibilities',
        'Consult grimoire', 'Read spellbook', 'Study tome', 'Examine codex',
        'Craft wand', 'Create staff', 'Forge focus', 'Build tool',
        'Align with elements', 'Balance forces', 'Harmonize powers', 'Unite energies',
        'Purify ritual', 'Cleanse magic', 'Remove corruption', 'Eliminate taint',
        'Amplify spell', 'Strengthen magic', 'Boost power', 'Increase potency',
        'Control magic', 'Master power', 'Command energy', 'Dominate force',
        'Share knowledge', 'Teach magic', 'Instruct apprentice', 'Pass wisdom',
        'Discover new spell', 'Create incantation', 'Invent magic', 'Develop power',
        'Preserve magic', 'Maintain balance', 'Keep harmony', 'Sustain order',
        'Challenge magical limits', 'Push boundaries', 'Test extremes', 'Explore depths',
        'Accept magical cost', 'Pay the price', 'Bear the burden', 'Endure sacrifice',
        'Celebrate magic', 'Honor tradition', 'Respect power', 'Revere mystery',
        'Question magic', 'Challenge beliefs', 'Test assumptions', 'Doubt certainty',
        'Embrace magic', 'Accept power', 'Welcome mystery', 'Surrender to wonder'
      ],
      SPELLCASTING: [
        'Prepare incantation', 'Focus mind', 'Center energy', 'Gather will',
        'Cast fireball', 'Launch flame', 'Hurl blaze', 'Send inferno',
        'Summon ice lance', 'Call frost spear', 'Invoke cold weapon', 'Create ice projectile',
        'Release lightning', 'Unleash storm', 'Call thunder', 'Send electric bolt',
        'Cause earthquake', 'Shake ground', 'Rumble earth', 'Tremor terrain',
        'Surge water', 'Flood area', 'Drown zone', 'Submerge region',
        'Gust wind', 'Blow gale', 'Storm blast', 'Hurricane force',
        'Heal wounds', 'Restore health', 'Mend injuries', 'Cure damage',
        'Shield ally', 'Protect friend', 'Guard companion', 'Defend partner',
        'Invisibility cloak', 'Hide from sight', 'Become unseen', 'Vanish from view',
        'Telekinesis lift', 'Move by mind', 'Shift objects', 'Control matter',
        'Illusion create', 'Fabricate reality', 'Weave deception', 'Construct false image',
        'Portal open', 'Create gateway', 'Form passage', 'Build door',
        'Weather control', 'Command climate', 'Rule atmosphere', 'Dominate sky',
        'Necrotic drain', 'Sap life', 'Steal vitality', 'Extract essence',
        'Divine light', 'Radiate holiness', 'Glow with faith', 'Shine with purity',
        'Shadow step', 'Move through darkness', 'Travel in shade', 'Walk in gloom',
        'Crystal focus', 'Concentrate power', 'Channel through gem', 'Amplify with stone',
        'Blood magic', 'Power through life', 'Strength from essence', 'Force from vitality',
        'Rune activation', 'Awaken symbols', 'Empower glyphs', 'Charge sigils',
        'Elemental binding', 'Control natural forces', 'Master primal powers', 'Command elements',
        'Soul manipulation', 'Influence spirit', 'Control essence', 'Dominate soul',
        'Time distortion', 'Bend chronology', 'Warp duration', 'Alter flow',
        'Reality weave', 'Modify existence', 'Change fabric', 'Alter reality',
        'Mind reading', 'Sense thoughts', 'Perceive intentions', 'Read consciousness',
        'Body control', 'Master flesh', 'Command form', 'Dominate physique',
        'Energy manipulation', 'Control power', 'Direct force', 'Guide energy',
        'Summon creature', 'Call being', 'Invoke entity', 'Conjure presence',
        'Banish spirit', 'Exile entity', 'Remove presence', 'Eliminate being',
        'Enchant weapon', 'Imbue blade', 'Empower tool', 'Charge instrument',
        'Ward area', 'Protect space', 'Shield zone', 'Guard territory'
      ],
      FIGHTER: [
        'Charge forward', 'Rush enemy', 'Close distance', 'Engage directly',
        'Defend position', 'Hold ground', 'Maintain defense', 'Protect area',
        'Strike decisively', 'Attack with power', 'Deliver blow', 'Land hit',
        'Parry attack', 'Block strike', 'Deflect weapon', 'Counter blow',
        'Dodge swiftly', 'Evade attack', 'Sidestep danger', 'Avoid threat',
        'Counterattack', 'Exploit opening', 'Seize opportunity', 'Capitalize on error',
        'Press advantage', 'Maintain momentum', 'Keep pressure', 'Sustain attack',
        'Conserve energy', 'Pace yourself', 'Manage stamina', 'Preserve strength',
        'Feint attack', 'Fake strike', 'Mislead opponent', 'Deceive enemy',
        'Disarm foe', 'Remove weapon', 'Strip armament', 'Unarm opponent',
        'Grapple enemy', 'Wrestle opponent', 'Close combat', 'Fight in close quarters',
        'Use terrain', 'Leverage environment', 'Exploit surroundings', 'Utilize landscape',
        'Coordinate with allies', 'Work with team', 'Support comrades', 'Aid companions',
        'Intimidate opponent', 'Show dominance', 'Demonstrate strength', 'Project power',
        'Endure pain', 'Fight through injury', 'Ignore wounds', 'Push through pain',
        'Finish fight', 'End combat', 'Conclude battle', 'Resolve conflict',
        'Train harder', 'Practice technique', 'Hone skills', 'Improve form',
        'Study opponent', 'Analyze enemy', 'Learn weakness', 'Understand foe',
        'Adapt strategy', 'Change approach', 'Modify tactics', 'Adjust plan',
        'Lead by example', 'Inspire others', 'Motivate team', 'Encourage allies',
        'Accept defeat', 'Learn from loss', 'Grow from failure', 'Improve from setback',
        'Celebrate victory', 'Honor achievement', 'Recognize success', 'Value triumph',
        'Respect opponent', 'Honor adversary', 'Acknowledge skill', 'Value combat',
        'Seek fair fight', 'Demand honorable combat', 'Insist on rules', 'Require integrity',
        'Test limits', 'Push boundaries', 'Challenge self', 'Explore potential',
        'Master weapon', 'Perfect technique', 'Refine skill', 'Excel in combat',
        'Protect the weak', 'Defend vulnerable', 'Shield innocent', 'Guard helpless',
        'Fight for cause', 'Battle for belief', 'Combat for principle', 'Struggle for ideal',
        'Accept challenge', 'Welcome duel', 'Embrace combat', 'Enter fray willingly'
      ],
      GUILD: [
        'Accept membership', 'Join the guild', 'Become member', 'Enter organization',
        'Decline invitation', 'Reject offer', 'Refuse membership', 'Turn down guild',
        'Complete initiation', 'Pass trials', 'Finish apprenticeship', 'Graduate program',
        'Seek mentorship', 'Find master', 'Request guidance', 'Ask for teaching',
        'Contribute to guild', 'Aid organization', 'Support group', 'Help community',
        'Learn trade secrets', 'Study techniques', 'Master skills', 'Acquire knowledge',
        'Network with members', 'Build connections', 'Form alliances', 'Create relationships',
        'Participate in events', 'Join activities', 'Attend gatherings', 'Take part in ceremonies',
        'Advance in rank', 'Climb hierarchy', 'Gain status', 'Earn promotion',
        'Teach apprentices', 'Mentor newcomers', 'Share knowledge', 'Pass on wisdom',
        'Represent guild', 'Speak for organization', 'Act as ambassador', 'Serve as delegate',
        'Uphold traditions', 'Honor customs', 'Preserve heritage', 'Maintain legacy',
        'Innovate practices', 'Improve methods', 'Modernize techniques', 'Advance craft',
        'Resolve disputes', 'Settle conflicts', 'Mediate disagreements', 'Solve problems',
        'Manage resources', 'Oversee supplies', 'Control inventory', 'Handle materials',
        'Organize events', 'Plan activities', 'Coordinate gatherings', 'Arrange ceremonies',
        'Maintain standards', 'Enforce quality', 'Ensure excellence', 'Uphold requirements',
        'Expand influence', 'Grow power', 'Increase reach', 'Extend authority',
        'Form alliances', 'Create partnerships', 'Build coalitions', 'Establish unions',
        'Protect interests', 'Defend rights', 'Safeguard privileges', 'Preserve benefits',
        'Adapt to change', 'Embrace evolution', 'Accept progress', 'Welcome innovation',
        'Celebrate achievements', 'Honor successes', 'Recognize accomplishments', 'Value progress',
        'Support members', 'Aid colleagues', 'Help associates', 'Assist peers',
        'Foster community', 'Build fellowship', 'Create brotherhood', 'Establish sisterhood',
        'Preserve knowledge', 'Guard secrets', 'Protect wisdom', 'Safeguard lore',
        'Encourage excellence', 'Promote quality', 'Inspire mastery', 'Motivate perfection',
        'Navigate politics', 'Handle intrigue', 'Manage relationships', 'Control dynamics',
        'Balance tradition', 'Merge old and new', 'Harmonize past and present', 'Bridge eras',
        'Serve the craft', 'Honor the trade', 'Respect the profession', 'Value the skill',
        'Commit to growth', 'Dedicate to improvement', 'Devote to advancement', 'Pledge to progress'
      ],
      UNDERWORLD: [
        'Accept the job', 'Take the contract', 'Agree to work', 'Commit to task',
        'Negotiate price', 'Bargain fee', 'Set terms', 'Establish payment',
        'Refuse assignment', 'Decline job', 'Reject contract', 'Turn down work',
        'Plan heist', 'Organize robbery', 'Arrange theft', 'Coordinate crime',
        'Gather intelligence', 'Collect information', 'Acquire data', 'Obtain knowledge',
        'Assemble crew', 'Recruit team', 'Form gang', 'Build organization',
        'Establish alibi', 'Create cover', 'Forge identity', 'Build false persona',
        'Fence goods', 'Sell stolen items', 'Move merchandise', 'Liquidate assets',
        'Evade authorities', 'Avoid law', 'Escape pursuit', 'Shake tails',
        'Launder money', 'Clean funds', 'Legitimize wealth', 'Sanitize profits',
        'Eliminate witnesses', 'Silence informants', 'Remove threats', 'Neutralize dangers',
        'Build reputation', 'Establish credibility', 'Create fear', 'Gain respect',
        'Expand territory', 'Claim turf', 'Control area', 'Dominate region',
        'Form alliances', 'Create partnerships', 'Build coalitions', 'Establish pacts',
        'Betray associates', 'Double-cross partners', 'Break agreements', 'Violate trusts',
        'Collect debts', 'Extract payments', 'Enforce collections', 'Demand repayment',
        'Intimidate rivals', 'Threaten competition', 'Coerce opponents', 'Pressure enemies',
        'Run protection', 'Offer security', 'Provide safety', 'Guarantee protection',
        'Smuggle goods', 'Move contraband', 'Transport illegal items', 'Convey forbidden cargo',
        'Forge documents', 'Create fake papers', 'Manufacture false identities', 'Produce counterfeit',
        'Run gambling', 'Operate games', 'Manage betting', 'Control vice',
        'Traffic substances', 'Deal drugs', 'Move narcotics', 'Distribute chemicals',
        'Arrange kidnappings', 'Plan abductions', 'Organize hostage situations', 'Set up ransom demands',
        'Conduct sabotage', 'Perform disruption', 'Create chaos', 'Cause destruction',
        'Gather blackmail', 'Collect leverage', 'Acquire compromising information', 'Build dossiers',
        'Establish network', 'Build web of contacts', 'Create information channels', 'Form intelligence rings',
        'Manage operations', 'Oversee activities', 'Control enterprises', 'Direct organizations',
        'Adapt to heat', 'Handle pressure', 'Manage pursuit', 'Navigate danger',
        'Celebrate success', 'Enjoy victory', 'Savor triumph', 'Relish achievement',
        'Learn from failure', 'Study mistakes', 'Analyze setbacks', 'Understand failures',
        'Retire wealthy', 'Exit game', 'Cash out', 'Leave profession'
      ],
      NECROMANCER: [
        'Raise skeleton', 'Animate bones', 'Summon undead', 'Create bone warrior',
        'Summon wraith', 'Call spirit', 'Invoke ghost', 'Conjure phantom',
        'Create zombie', 'Animate corpse', 'Raise dead', 'Form flesh golem',
        'Bind soul', 'Capture essence', 'Trap spirit', 'Imprison consciousness',
        'Harvest life force', 'Drain vitality', 'Extract essence', 'Siphon life',
        'Command undead', 'Control minions', 'Direct servants', 'Guide creations',
        'Study death', 'Research mortality', 'Investigate afterlife', 'Explore demise',
        'Communicate with dead', 'Speak to spirits', 'Contact ghosts', 'Reach beyond',
        'Preserve corpse', 'Maintain body', 'Prevent decay', 'Halt decomposition',
        'Create phylactery', 'Forge soul vessel', 'Build life container', 'Construct essence holder',
        'Achieve lichdom', 'Become immortal', 'Attain undeath', 'Reach eternal life',
        'Control plague', 'Master disease', 'Command pestilence', 'Dominate sickness',
        'Manipulate souls', 'Influence spirits', 'Control essences', 'Dominate consciousness',
        'Create death knight', 'Forge dark champion', 'Build cursed warrior', 'Construct damned fighter',
        'Summon bone dragon', 'Call skeletal beast', 'Invoke osseous monster', 'Conjure bone horror',
        'Weave necrotic spells', 'Cast death magic', 'Invoke mortality', 'Channel demise',
        'Balance life and death', 'Maintain equilibrium', 'Keep harmony', 'Preserve balance',
        'Challenge death itself', 'Defy mortality', 'Oppose demise', 'Fight ending',
        'Embrace darkness', 'Accept shadow', 'Welcome void', 'Surrender to nothing',
        'Preserve knowledge', 'Maintain wisdom', 'Guard secrets', 'Protect forbidden lore',
        'Teach necromancy', 'Instruct in death', 'Educate in undeath', 'Train in mortality',
        'Experiment ethically', 'Test boundaries', 'Push limits', 'Explore extremes',
        'Serve greater purpose', 'Work for cause', 'Labor for goal', 'Strive for objective',
        'Question morality', 'Challenge ethics', 'Test beliefs', 'Examine principles',
        'Accept consequences', 'Bear burden', 'Carry weight', 'Endure responsibility',
        'Find peace', 'Achieve tranquility', 'Reach serenity', 'Attain calm',
        'Transcend limits', 'Surpass boundaries', 'Exceed expectations', 'Go beyond',
        'Master craft', 'Perfect art', 'Refine skill', 'Excel in necromancy',
        'Create legacy', 'Build heritage', 'Establish tradition', 'Found school',
        'Inspire fear', 'Instill terror', 'Generate dread', 'Produce horror',
        'Command respect', 'Demand reverence', 'Require obedience', 'Earn submission'
      ],
      MAGE: [
        'Study ancient tomes', 'Read forbidden texts', 'Examine arcane writings', 'Analyze mystical books',
        'Experiment with spells', 'Test incantations', 'Try new magic', 'Practice sorcery',
        'Research new magic', 'Investigate arcane', 'Explore mysteries', 'Discover secrets',
        'Consult with mentors', 'Seek guidance', 'Request advice', 'Ask for wisdom',
        'Attend academy', 'Join magical school', 'Enter arcane university', 'Study at institute',
        'Master element', 'Control natural force', 'Command primal power', 'Dominate element',
        'Create artifact', 'Forge magical item', 'Build enchanted object', 'Construct mystic device',
        'Summon familiar', 'Call magical companion', 'Invoke arcane ally', 'Conjure mystical helper',
        'Explore other planes', 'Visit different realms', 'Journey to other dimensions', 'Travel alternate worlds',
        'Teach apprentices', 'Instruct students', 'Educate novices', 'Train beginners',
        'Preserve knowledge', 'Maintain wisdom', 'Guard secrets', 'Protect lore',
        'Innovate magic', 'Create new spells', 'Develop techniques', 'Invent methods',
        'Collaborate with peers', 'Work with colleagues', 'Partner with equals', 'Cooperate with mages',
        'Challenge traditions', 'Question established ways', 'Test conventional wisdom', 'Examine norms',
        'Pursue forbidden knowledge', 'Seek banned wisdom', 'Hunt proscribed lore', 'Chase restricted secrets',
        'Balance power and wisdom', 'Maintain harmony', 'Keep equilibrium', 'Preserve balance',
        'Serve greater good', 'Work for benefit', 'Labor for improvement', 'Strive for progress',
        'Accept limitations', 'Recognize boundaries', 'Understand constraints', 'Appreciate limits',
        'Push magical boundaries', 'Expand arcane limits', 'Extend mystical horizons', 'Broaden magical scope',
        'Create spell focus', 'Craft power conduit', 'Build energy channel', 'Forge magic amplifier',
        'Study spell components', 'Research material needs', 'Investigate reagent requirements', 'Analyze ingredient demands',
        'Develop spell theory', 'Formulate magical principles', 'Establish arcane laws', 'Create mystical frameworks',
        'Test spell safety', 'Verify incantation security', 'Check magic stability', 'Assess spell reliability',
        'Document discoveries', 'Record findings', 'Log observations', 'Note breakthroughs',
        'Share knowledge', 'Disseminate wisdom', 'Spread understanding', 'Distribute insight',
        'Mentor young mages', 'Guide aspiring wizards', 'Counsel novice sorcerers', 'Advise budding arcanists',
        'Establish magical tradition', 'Found arcane school', 'Create mystical lineage', 'Build magical heritage',
        'Challenge magical dogma', 'Question established beliefs', 'Test arcane assumptions', 'Examine mystical tenets',
        'Explore ethical magic', 'Investigate moral sorcery', 'Study principled wizardry', 'Analyze virtuous arcanery',
        'Accept magical responsibility', 'Bear arcane burden', 'Carry mystical weight', 'Endure magical obligation',
        'Find magical balance', 'Achieve arcane harmony', 'Reach mystical equilibrium', 'Attain magical peace',
        'Transcend magical limits', 'Surpass arcane boundaries', 'Exceed mystical expectations', 'Go beyond magical constraints'
      ],
      ROGUE: [
        'Plan infiltration', 'Organize stealth entry', 'Arrange covert access', 'Coordinate secret entry',
        'Pick lock', 'Bypass security', 'Open sealed door', 'Defeat mechanism',
        'Move silently', 'Traverse quietly', 'Navigate without sound', 'Travel undetected',
        'Hide in shadows', 'Conceal presence', 'Avoid detection', 'Remain unseen',
        'Pick pocket', 'Lift valuables', 'Steal discretely', 'Remove items unnoticed',
        'Set trap', 'Prepare ambush', 'Create hazard', 'Establish danger zone',
        'Disarm trap', 'Neutralize hazard', 'Remove threat', 'Clear danger',
        'Climb wall', 'Scale obstacle', 'Ascend barrier', 'Overcome height',
        'Use disguise', 'Assume false identity', 'Adopt persona', 'Create deception',
        'Gather information', 'Collect intelligence', 'Acquire data', 'Obtain knowledge',
        'Tail target', 'Follow suspect', 'Track individual', 'Shadow person',
        'Forge document', 'Create fake paper', 'Manufacture false identity', 'Produce counterfeit',
        'Sabotage operation', 'Disrupt plans', 'Interfere with activities', 'Hinder progress',
        'Assassinate target', 'Eliminate individual', 'Remove threat', 'Neutralize danger',
        'Fence stolen goods', 'Sell hot merchandise', 'Move illicit items', 'Liquidate stolen property',
        'Run confidence game', 'Execute scam', 'Perform con', 'Conduct fraud',
        'Establish network', 'Build contacts', 'Create connections', 'Form alliances',
        'Learn new skill', 'Acquire technique', 'Master method', 'Perfect approach',
        'Test security', 'Probe defenses', 'Check vulnerabilities', 'Assess weaknesses',
        'Create diversion', 'Cause distraction', 'Generate confusion', 'Produce chaos',
        'Escape pursuit', 'Evade capture', 'Shake followers', 'Lose tails',
        'Blend into crowd', 'Disappear in masses', 'Vanity in groups', 'Hide among people',
        'Use terrain', 'Leverage environment', 'Exploit surroundings', 'Utilize landscape',
        'Time action', 'Coordinate timing', 'Synchronize effort', 'Align execution',
        'Adapt to situation', 'Adjust plan', 'Modify approach', 'Change strategy',
        'Minimize risk', 'Reduce danger', 'Lower exposure', 'Decrease vulnerability',
        'Maximize reward', 'Optimize gain', 'Increase profit', 'Enhance return',
        'Cover tracks', 'Erase evidence', 'Remove traces', 'Eliminate clues',
        'Establish alibi', 'Create cover story', 'Forge credibility', 'Build false trail',
        'Test loyalties', 'Verify trustworthiness', 'Check reliability', 'Assess dependability',
        'Betray associates', 'Double-cross partners', 'Break agreements', 'Violate trusts',
        'Maintain honor', 'Keep code', 'Preserve integrity', 'Uphold principles',
        'Retire wealthy', 'Exit game', 'Cash out', 'Leave profession'
      ],
      CLERIC: [
        'Pray for guidance', 'Seek divine wisdom', 'Request holy counsel', 'Ask for sacred advice',
        'Perform ritual', 'Conduct ceremony', 'Execute rite', 'Complete sacrament',
        'Heal the wounded', 'Restore health', 'Mend injuries', 'Cure afflictions',
        'Bless followers', 'Grant divine favor', 'Bestow holy protection', 'Provide sacred shield',
        'Exorcise demons', 'Banish evil spirits', 'Remove unclean entities', 'Eliminate dark forces',
        'Convert unbelievers', 'Bring faith to heathens', 'Spread divine word', 'Share sacred truth',
        'Conduct funeral', 'Perform burial rites', 'Guide soul to afterlife', 'Facilitate transition',
        'Marry couple', 'Perform wedding ceremony', 'Unite souls in holy bond', 'Sanctify union',
        'Baptize child', 'Perform christening', 'Welcome to faith', 'Initiate into religion',
        'Confess sins', 'Hear repentance', 'Absolve guilt', 'Grant forgiveness',
        'Preach sermon', 'Deliver divine message', 'Share holy wisdom', 'Communicate sacred truth',
        'Lead worship', 'Conduct service', 'Guide congregation', 'Direct devotion',
        'Study scriptures', 'Read holy texts', 'Examine sacred writings', 'Analyze divine word',
        'Meditate on faith', 'Contemplate divinity', 'Reflect on spirituality', 'Consider holiness',
        'Fast for purification', 'Deny flesh', 'Practice abstinence', 'Achieve spiritual clarity',
        'Pilgrimage to holy site', 'Journey to sacred place', 'Travel to divine location', 'Visit holy ground',
        'Build temple', 'Construct sacred space', 'Create place of worship', 'Establish holy site',
        'Ordain priest', 'Confer holy orders', 'Grant divine authority', 'Bestow sacred power',
        'Counsel troubled soul', 'Guide lost spirit', 'Help suffering person', 'Aid afflicted individual',
        'Perform miracle', 'Manifest divine power', 'Demonstrate holy might', 'Show sacred strength',
        'Challenge heresy', 'Oppose false doctrine', 'Combat wrong belief', 'Fight incorrect faith',
        'Preserve tradition', 'Maintain holy customs', 'Guard sacred practices', 'Protect divine rituals',
        'Interpret prophecy', 'Read divine signs', 'Understand holy omens', 'Decipher sacred messages',
        'Serve community', 'Aid congregation', 'Help followers', 'Support believers',
        'Teach faith', 'Instruct in beliefs', 'Educate in doctrine', 'Train in sacred ways',
        'Maintain purity', 'Preserve holiness', 'Keep sanctity', 'Guard divine essence',
        'Accept divine calling', 'Answer holy summons', 'Respond to sacred duty', 'Fulfill divine purpose',
        'Question faith', 'Test beliefs', 'Challenge doctrine', 'Examine sacred truths',
        'Deepen devotion', 'Strengthen faith', 'Intensify belief', 'Heighten spirituality',
        'Share divine love', 'Spread holy compassion', 'Distribute sacred mercy', 'Give divine kindness',
        'Confront evil', 'Face darkness', 'Oppose corruption', 'Battle malevolence',
        'Bring hope', 'Offer salvation', 'Provide redemption', 'Deliver deliverance',
        'Witness miracle', 'Observe divine act', 'Experience holy wonder', 'Encounter sacred marvel'
      ],
      ADVENTURE: [
        'Embark on the journey', 'Begin the expedition', 'Start the adventure', 'Commence the quest',
        'Gather supplies first', 'Prepare thoroughly', 'Stock up on equipment', 'Acquire provisions',
        'Recruit companions', 'Find allies', 'Assemble a team', 'Gather followers',
        'Study ancient maps', 'Research the route', 'Examine old charts', 'Review historical records',
        'Consult local experts', 'Seek knowledgeable guides', 'Find experienced mentors', 'Ask for advice',
        'Scout the area first', 'Reconnaissance mission', 'Survey the surroundings', 'Assess the terrain',
        'Set up a base camp', 'Establish headquarters', 'Create a safe haven', 'Build a forward position',
        'Follow mysterious clues', 'Pursue hidden leads', 'Chase enigmatic hints', 'Track secret signs',
        'Face the first challenge', 'Confront initial obstacle', 'Overcome opening trial', 'Surmount first barrier',
        'Discover hidden treasure', 'Unearth secret riches', 'Find concealed wealth', 'Locate buried fortune',
        'Battle legendary creatures', 'Fight mythical beasts', 'Combat ancient monsters', 'Confront primal horrors',
        'Solve ancient puzzles', 'Decipher forgotten riddles', 'Unravel mystic enigmas', 'Crack timeless codes',
        'Form unlikely alliances', 'Create unexpected partnerships', 'Forge strange friendships', 'Build odd coalitions',
        'Navigate treacherous terrain', 'Cross dangerous landscapes', 'Traverse perilous paths', 'Journey through hazards',
        'Harness elemental powers', 'Control natural forces', 'Master primal energies', 'Command elemental might',
        'Communicate with spirits', 'Speak to ethereal beings', 'Converse with otherworldly entities', 'Dialogue with ghosts',
        'Access hidden dimensions', 'Enter secret realms', 'Visit concealed worlds', 'Journey to parallel planes',
        'Forge legendary weapons', 'Craft mythical artifacts', 'Create epic equipment', 'Build heroic tools',
        'Fulfill ancient prophecies', 'Complete fateful predictions', 'Achieve destined outcomes', 'Realize legendary fates',
        'Challenge powerful guardians', 'Test mighty protectors', 'Confront ancient sentinels', 'Face legendary wardens',
        'Master new abilities', 'Learn powerful skills', 'Acquire mighty techniques', 'Gain legendary capabilities',
        'Transform through experience', 'Evolve through trials', 'Change through challenges', 'Grow through adversity',
        'Return as a legend', 'Come back as a hero', 'Return transformed', 'Come back changed',
        'Share the discoveries', 'Reveal the findings', 'Disclose the secrets', 'Publish the knowledge',
        'Protect the sacred sites', 'Safeguard holy places', 'Defend mystical locations', 'Shield magical areas',
        'Establish trade routes', 'Create commercial paths', 'Open economic avenues', 'Develop merchant highways',
        'Build monuments', 'Construct memorials', 'Erect lasting tributes', 'Create eternal markers',
        'Inspire future generations', 'Motivate coming heroes', 'Encourage future adventurers', 'Spark new legends'
      ],
      QUEST: [
        'Accept the quest immediately', 'Embrace the mission eagerly', 'Take on the task willingly', 'Accept the challenge gladly',
        'Negotiate better terms', 'Bargain for improved conditions', 'Haggle for better rewards', 'Discuss enhanced compensation',
        'Request time to prepare', 'Ask for preparation period', 'Demand setup time', 'Require planning phase',
        'Seek additional information', 'Request more details', 'Ask for clarification', 'Demand further explanation',
        'Consult trusted advisors', 'Seek wise counsel', 'Ask for expert advice', 'Request knowledgeable guidance',
        'Gather necessary resources', 'Collect required materials', 'Acquire essential supplies', 'Obtain needed equipment',
        'Assemble a capable team', 'Recruit skilled companions', 'Form an effective group', 'Build a competent party',
        'Research the quest history', 'Study the mission background', 'Investigate the task origins', 'Examine the quest context',
        'Plan the approach carefully', 'Strategize the method thoroughly', 'Devise a detailed plan', 'Create a comprehensive strategy',
        'Set intermediate goals', 'Establish milestone objectives', 'Define progress markers', 'Create achievement checkpoints',
        'Prepare contingency plans', 'Develop backup strategies', 'Create emergency responses', 'Form alternative approaches',
        'Begin the first phase', 'Start the initial stage', 'Commence the opening act', 'Initiate the first step',
        'Overcome initial obstacles', 'Surmount opening challenges', 'Conquer starting difficulties', 'Master beginning trials',
        'Solve the first puzzle', 'Crack the initial riddle', 'Unravel the opening mystery', 'Decode the first enigma',
        'Defeat early enemies', 'Overcome initial foes', 'Conquer starting adversaries', 'Master beginning opponents',
        'Acquire crucial information', 'Obtain vital intelligence', 'Gain essential knowledge', 'Secure important data',
        'Form key alliances', 'Create important partnerships', 'Establish crucial connections', 'Build vital relationships',
        'Navigate political complications', 'Handle diplomatic challenges', 'Manage political obstacles', 'Address governmental issues',
        'Survive environmental hazards', 'Endure natural dangers', 'Withstand elemental threats', 'Resist environmental perils',
        'Master new skills', 'Learn essential abilities', 'Acquire necessary techniques', 'Gain required competencies',
        'Adapt to unexpected changes', 'Adjust to unforeseen circumstances', 'Modify for unexpected developments', 'Flex for surprise elements',
        'Maintain team morale', 'Keep group spirits high', 'Preserve party motivation', 'Sustain team enthusiasm',
        'Manage limited resources', 'Handle scarce supplies', 'Administer constrained materials', 'Control restricted assets',
        'Make difficult moral choices', 'Face ethical dilemmas', 'Confront moral quandaries', 'Address philosophical decisions',
        'Push through exhaustion', 'Endure fatigue', 'Continue despite weariness', 'Persist through tiredness',
        'Celebrate small victories', 'Acknowledge minor successes', 'Recognize incremental achievements', 'Value partial accomplishments',
        'Adjust strategy dynamically', 'Modify approach flexibly', 'Change tactics adaptively', 'Evolve methods responsively',
        'Protect team members', 'Safeguard companions', 'Defend party members', 'Shield group allies',
        'Complete the quest successfully', 'Achieve quest objectives', 'Fulfill mission requirements', 'Accomplish quest goals',
        'Claim well-earned rewards', 'Receive deserved compensation', 'Accept rightful payment', 'Obtain earned prizes',
        'Share the glory', 'Distribute the fame', 'Spread the recognition', 'Broadcast the achievement',
        'Reflect on the journey', 'Contemplate the experience', 'Consider the adventure', 'Meditate on the quest'
      ]
    };

    const texts = choiceTexts[type] || ['Accept', 'Decline', 'Investigate', 'Wait'];
    const choiceCount = Math.min(4, texts.length);
    const selectedTexts = this.chance.pickset(texts, choiceCount);

    return selectedTexts.map((text, index) => ({
      text,
      effect: this.generateChoiceEffect(type, difficulty, index)
    }));
  }

  /**
   * Generate effect for a choice
   */
  /**
   * Generate effect for a choice based on its index
   * 
   * @param type - Event type (currently unused, reserved for future use)
   * @param difficulty - Difficulty level (currently unused, reserved for future use)
   * @param index - Choice index (0-3) determines which effect type to use
   * @returns Effect object with gold, health, experience, or reputation changes
   */
  private generateChoiceEffect(type: string, difficulty: string, index: number): Effect {
    const effects: Effect[] = [
      { gold: this.chance.integer({ min: -10, max: 50 }) },
      { health: this.chance.integer({ min: -5, max: 10 }) },
      { experience: this.chance.integer({ min: 0, max: 20 }) },
      { reputation: this.chance.integer({ min: -2, max: 5 }) }
    ];

    return effects[index % effects.length] || {};
  }

  /**
   * Generate tags for the event based on type and context
   * 
   * @param type - Event type (e.g., 'COMBAT', 'SOCIAL', 'MAGIC')
   * @param context - Analyzed player context for wealth tier tag
   * @returns Array of tag strings (always includes type, optionally includes wealth tier)
   */
  private generateTags(type: string, context: AnalyzedContext): string[] {
    const tags = [type.toLowerCase()];

    if (context.wealthTier && context.wealthTier !== 'moderate') {
      tags.push(context.wealthTier);
    }

    if (context.lifeStage && context.lifeStage !== 'adult') {
      tags.push(context.lifeStage);
    }

    if (context.careerPath && context.careerPath !== 'adventurer') {
      tags.push(context.careerPath.toLowerCase());
    }

    return tags;
  }
}