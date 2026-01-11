/**
 * RPG Event Generator v2.0.0 - Browser-Compatible Version
 * Built for web demos and client-side usage
 */

// Use global Chance instance (loaded via CDN)
const Chance = window.Chance;

class SimpleMarkovGenerator {
  constructor(options = {}) {
    this.stateSize = options.stateSize || 2;
    this.data = [];
    this.chain = new Map();
  }

  addData(texts) {
    this.data = this.data.concat(texts);
    this.buildChain();
  }

  buildChain() {
    this.chain.clear();

    this.data.forEach(text => {
      const words = text.split(/\s+/);
      for (let i = 0; i <= words.length - this.stateSize; i++) {
        const state = words.slice(i, i + this.stateSize).join(' ');
        const nextWord = words[i + this.stateSize];

        if (!this.chain.has(state)) {
          this.chain.set(state, []);
        }
        if (nextWord) {
          this.chain.get(state).push(nextWord);
        }
      }
    });
  }

  generate(options = {}) {
    const minLength = options.minLength || 20;
    const maxLength = options.maxLength || 100;
    const maxTries = options.maxTries || 10;

    // If we have very little data, use a more direct approach
    if (this.data.length < 5) {
      return this.generateFromSmallDataset(minLength, maxLength);
    }

    for (let tries = 0; tries < maxTries; tries++) {
      const result = this.generateAttempt(minLength, maxLength);
      if (result) {
        return { string: result };
      }
    }

    const fragments = [];
    const numFragments = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < numFragments; i++) {
      const fragment = this.data[Math.floor(Math.random() * this.data.length)];
      if (fragment && !fragments.includes(fragment)) {
        fragments.push(fragment);
      }
    }

    let combined = fragments.join('. ');
    if (!combined.endsWith('.')) combined += '.';

    return { string: combined };
  }

  generateFromSmallDataset(minLength, maxLength) {
    // For small datasets, combine and modify the existing sentences
    const baseSentence = this.data[Math.floor(Math.random() * this.data.length)] || 'Something mysterious happened';

    // Simple word replacement or extension
    let result = baseSentence;

    // Try to extend the sentence by combining elements from other sentences
    if (this.data.length > 1) {
      const otherSentences = this.data.filter(s => s !== baseSentence);
      if (otherSentences.length > 0) {
        const otherSentence = otherSentences[Math.floor(Math.random() * otherSentences.length)];
        const otherWords = otherSentence.split(' ').slice(-3); // Take last 3 words
        result = baseSentence + ', and ' + otherWords.join(' ').toLowerCase();
      }
    }

    // Ensure it meets length requirements
    while (result.length < minLength && result.length < maxLength) {
      const extensions = [' It was quite unexpected', ' The circumstances were unusual', ' Everyone was surprised', ' Strange things were happening'];
      result += extensions[Math.floor(Math.random() * extensions.length)];
    }

    if (result.length > maxLength) {
      result = result.substring(0, maxLength - 3) + '...';
    }

    return { string: result };
  }

  generateAttempt(minLength, maxLength) {
    const states = Array.from(this.chain.keys());
    if (states.length === 0) return null;

    let currentState = states[Math.floor(Math.random() * states.length)];
    const words = currentState.split(' ');
    let attempts = 0;
    const maxAttempts = 100;

    while (words.join(' ').length < maxLength && attempts < maxAttempts) {
      const nextWords = this.chain.get(currentState);
      if (!nextWords || nextWords.length === 0) {

        const similarStates = states.filter(s => s.split(' ')[0] === words[words.length - 1]);
        if (similarStates.length > 0) {
          currentState = similarStates[Math.floor(Math.random() * similarStates.length)];

          const stateWords = currentState.split(' ');
          words.push(...stateWords.slice(1));
        } else {
          break;
        }
      } else {
        const nextWord = nextWords[Math.floor(Math.random() * nextWords.length)];
        words.push(nextWord);

        currentState = words.slice(-this.stateSize).join(' ');
      }
      attempts++;
    }

    const result = words.join(' ');

    let finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    if (!finalResult.endsWith('.') && !finalResult.endsWith('!') && !finalResult.endsWith('?')) {
      finalResult += '.';
    }

    return finalResult.length >= minLength && finalResult.length <= maxLength ? finalResult : null;
  }

  /**
   * Check if generated text is interesting enough to use
   * @private
   */
  isInterestingText(text) {
    const boringWords = ['ordinary', 'normal', 'regular', 'simple', 'plain', 'basic', 'usual', 'typical', 'common', 'standard', 'boring', 'mundane', 'dull'];
    const interestingWords = ['mysterious', 'ancient', 'powerful', 'dark', 'forbidden', 'legendary', 'cursed', 'magical', 'dramatic', 'intense', 'shadowy', 'forbidding', 'enchanted'];

    const lowerText = text.toLowerCase();

    if (boringWords.some(word => lowerText.includes(word))) {
      return false;
    }

    if (interestingWords.some(word => lowerText.includes(word))) {
      return true;
    }

    return text.split(' ').length > 8 && text.length > 60;
  }
}

/**
 * RPG Event Generator - Procedural event generation for RPG games
 * @class
 */
class RPGEventGenerator {
  /**
   * Create a new event generator
   * @param {Object} options - Configuration options
   * @param {number} options.stateSize - Markov chain state size (default: 2)
   * @param {Array} options.trainingData - Custom training data for Markov chains
   * @param {string} options.theme - Theme for event generation: 'fantasy', 'sci-fi', 'historical'
   * @param {string} options.culture - Cultural context within theme (optional)
   * @param {boolean} options.enableTemplates - Enable template library system (default: false)
   * @param {string} options.templateLibrary - Genre to load templates from: 'fantasy', 'sci-fi', 'horror', 'historical'
   */
  constructor(options = {}) {
    this.chance = new Chance();
    this.markovGenerator = new SimpleMarkovGenerator({
      stateSize: options.stateSize || 2
    });

    this.theme = options.theme !== undefined ? options.theme : 'fantasy';
    this.culture = options.culture;

    this.customTemplates = new Set();
    this.customChains = new Set();
    this.customTrainingData = {};
    this.trainingData = options.trainingData || [];

    this.enableDependencies = options.enableDependencies !== false;
    this.enableModifiers = options.enableModifiers !== false;
    this.enableRelationships = options.enableRelationships !== false;
    this.language = options.language || 'en';

    // Pure Markov Mode overrides template settings
    this.pureMarkovMode = options.pureMarkovMode || false;
    this.enableTemplates = this.pureMarkovMode ? false : (options.enableTemplates !== false);
    this.templateLibrary = this.pureMarkovMode ? null : (options.templateLibrary || null);
    this.loadedTemplates = new Map();

    // Rule Engine System (v2.0.0)
    this.enableRuleEngine = options.enableRuleEngine !== false;
    this.customRules = options.customRules || {};
    this.ruleEngine = this.initializeRuleEngine();

    // Pure Markov Mode (v2.0.0)
    this.pureMarkovMode = options.pureMarkovMode || false;

    this.initializeEnhancedFeatures(options);
    this.initializeTemplateSystem(options);
    this.initializeThemes();

    this.activeChains = new Map();
    this.chainDefinitions = this.initializeChainDefinitions();

    // NPC Relationship System (v1.2.0)
    this.npcs = new Map();
    this.relationships = new Map();

    // Template and Dependency System (v1.2.0)
    this.customTemplates = new Map();
    this.eventDependencies = new Map();

    // Time Management (v1.1.0)
    this.gameTime = { day: 1, season: 'spring', year: 1 };

    this.difficultySettings = {
      easy: { powerRange: [0, 50], rewardMultiplier: 1.5, penaltyMultiplier: 0.7 },
      normal: { powerRange: [25, 150], rewardMultiplier: 1.0, penaltyMultiplier: 1.0 },
      hard: { powerRange: [100, 300], rewardMultiplier: 0.8, penaltyMultiplier: 1.3 },
      legendary: { powerRange: [250, 1000], rewardMultiplier: 0.6, penaltyMultiplier: 1.6 }
    };

    this.timeSystem = {
      currentDay: 1,
      currentSeason: 'spring',
      gameYear: 1,
      timeBasedEvents: new Map()
    };
    const selectedTheme = options.theme || 'fantasy';
    const selectedCulture = options.culture;
    const themeTrainingData = this.getThemeTrainingData(selectedTheme, selectedCulture);
    const defaultTrainingData = options.trainingData || themeTrainingData;

    try {
      this.markovGenerator.addData(defaultTrainingData);
    } catch (error) {
      console.warn('Markov generator training failed:', error.message);
    }

    this.templates = {
      // Basic fallback templates for demo
      basic_encounter: {
        title: 'A Strange Encounter',
        narrative: 'While traveling through the wilderness, you encounter something unusual that captures your attention.',
        choices: [
          { text: 'Approach cautiously', effect: { knowledge: [5, 15] }, consequence: 'curious' },
          { text: 'Observe from a distance', effect: { wisdom: [5, 10] }, consequence: 'cautious' },
          { text: 'Turn back immediately', effect: { reputation: [-5, 5] }, consequence: 'timid' }
        ]
      },
      merchant_meeting: {
        title: 'Merchant Caravan',
        narrative: 'A caravan of merchants approaches, offering goods and information from distant lands.',
        choices: [
          { text: 'Trade with them', effect: { gold: [-20, 50], reputation: [5, 15] }, consequence: 'merchant' },
          { text: 'Ask for information', effect: { knowledge: [10, 25] }, consequence: 'inquisitive' },
          { text: 'Let them pass', effect: { gold: [0, 0] }, consequence: 'neutral' }
        ]
      },
      mysterious_ruins: {
        title: 'Ancient Ruins',
        narrative: 'You discover ancient ruins partially buried in the landscape, hinting at a civilization long gone.',
        choices: [
          { text: 'Explore the ruins', effect: { knowledge: [15, 30], risk: [10, 25] }, consequence: 'adventurous' },
          { text: 'Search for artifacts', effect: { gold: [20, 100], risk: [20, 40] }, consequence: 'greedy' },
          { text: 'Leave them undisturbed', effect: { wisdom: [5, 15] }, consequence: 'respectful' }
        ]
      },
      bandit_ambush: {
        title: 'Bandit Ambush',
        narrative: 'As you travel along a quiet road, bandits suddenly attack from the shadows!',
        choices: [
          { text: 'Fight back', effect: { reputation: [10, 20], risk: [30, 60] }, consequence: 'brave' },
          { text: 'Try to negotiate', effect: { gold: [-50, 0], reputation: [-10, 10] }, consequence: 'diplomatic' },
          { text: 'Run away', effect: { reputation: [-15, -5] }, consequence: 'cowardly' }
        ]
      },
      noble_request: {
        title: 'Noble\'s Request',
        narrative: 'A local noble approaches you with an urgent request that could bring reward or danger.',
        choices: [
          { text: 'Accept the quest', effect: { reputation: [20, 40], risk: [15, 35] }, consequence: 'heroic' },
          { text: 'Ask for payment first', effect: { gold: [50, 150], reputation: [-5, 5] }, consequence: 'mercenary' },
          { text: 'Decline politely', effect: { reputation: [0, 10] }, consequence: 'wise' }
        ]
      }
    };

    // Load templates if enabled
    if (this.enableTemplates) {
      if (this.templateLibrary) {
        this.loadTemplatesFromLibrary(this.templateLibrary);
      }
      // Always have basic templates available as fallback
      console.log(`Template system initialized with ${Object.keys(this.templates).length} templates`);
    }
  }

  // Pure Markov Mode methods (v2.0.0)
  generatePureMarkovEvent(context = {}) {
    try {
      const titleGenerated = this.markovGenerator.generate({
        minLength: 15, maxLength: 40, maxTries: 10
      });
      let title = titleGenerated && titleGenerated.string ?
        titleGenerated.string.trim().charAt(0).toUpperCase() + titleGenerated.string.trim().slice(1) : 'Mysterious Occurrence';
      if (title.length > 35) { title = title.substring(0, 32) + '...'; }

      const narrativeGenerated = this.markovGenerator.generate({
        minLength: 50, maxLength: 120, maxTries: 15
      });
      const narrative = narrativeGenerated && narrativeGenerated.string ?
        narrativeGenerated.string : 'Something extraordinary has occurred that demands your attention.';

      const descriptionGenerated = this.markovGenerator.generate({
        minLength: 30, maxLength: 80, maxTries: 10
      });
      let description = narrative;
      if (descriptionGenerated && descriptionGenerated.string && descriptionGenerated.string.length > 20) {
        description = descriptionGenerated.string + '. ' + narrative.charAt(0).toLowerCase() + narrative.slice(1);
      }

      const choices = this.generateMarkovChoices(context);

      return {
        id: `event_${Date.now()}_${this.chance.guid().substring(0, 8)}`,
        title: title,
        description: description,
        narrative: narrative,
        choices: choices,
        type: 'MARKOV_GENERATED',
        consequence: null,
        context: context,
        urgency: 'normal',
        theme: 'custom',
        difficulty: 'normal',
        tags: ['markov', 'generated']
      };
    } catch (error) {
      console.error("Pure Markov generation failed:", error);
      return this.generateFallbackEvent();
    }
  }

  generateMarkovChoices(context) {
    const choiceTemplates = [
      'Embrace this opportunity and see where it leads',
      'Approach cautiously and assess the situation',
      'Seek advice from others before proceeding',
      'Take immediate action to resolve the matter',
      'Observe and learn from this experience',
      'Decline involvement and move on',
      'Investigate further to understand better',
      'Trust your instincts and follow your heart'
    ];
    const numChoices = this.chance.integer({ min: 2, max: 4 });
    const selectedChoices = this.chance.pickset(choiceTemplates, numChoices);
    return selectedChoices.map((text, index) => {
      const effects = {};
      if (this.chance.bool({ likelihood: 60 })) { effects.gold = this.chance.integer({ min: -50, max: 100 }); }
      if (this.chance.bool({ likelihood: 40 })) { effects.reputation = this.chance.integer({ min: -10, max: 20 }); }
      if (this.chance.bool({ likelihood: 30 })) { effects.knowledge = this.chance.integer({ min: 5, max: 25 }); }
      return { text: text, effect: effects, consequence: `markov_choice_${index}` };
    });
  }

  // Main generation method with v2.0.0 features
  generateEvent(playerContext = {}) {
    // v2.0.0 compatibility: check for pure Markov mode
    if (this.pureMarkovMode) {
      return this.generatePureMarkovEvent(playerContext);
    }

    // Apply custom rules if rule engine is enabled
    if (this.enableRuleEngine && this.customRules && Object.keys(this.customRules).length > 0) {
      return this.generateEventWithRules(playerContext);
    }

    // Fall back to template-based generation
    return this.generateTemplateBasedEvent(playerContext);
  }

  // Rule Engine methods
  initializeRuleEngine() {
    return {
      evaluateCondition: (condition, context) => this.evaluateCondition(condition, context),
      applyRuleEffects: (event, rule) => this.applyRuleEffects(event, rule)
    };
  }

  evaluateCondition(condition, context) {
    try {
      switch (condition.type) {
        case 'stat_greater_than':
          return context[condition.stat] > condition.value;
        case 'stat_less_than':
          return context[condition.stat] < condition.value;
        case 'stat_between':
          return context[condition.stat] >= condition.min && context[condition.stat] <= condition.max;
        case 'has_tag':
          return context.tags && context.tags.includes(condition.tag);
        case 'location_equals':
          return context.location === condition.location;
        case 'time_season':
          return this.timeSystem.currentSeason === condition.season;
        default:
          return false;
      }
    } catch (error) {
      console.warn('Rule condition evaluation failed:', error);
      return false;
    }
  }

  applyCustomRules(event, context) {
    if (!this.enableRuleEngine || !this.customRules) return event;

    const modifiedEvent = { ...event };

    Object.values(this.customRules).forEach(rule => {
      if (rule.conditions && rule.conditions.length > 0) {
        const conditionsMet = rule.conditions.every(cond => this.evaluateCondition(cond, context));

        if (conditionsMet) {
          this.applyRuleEffects(modifiedEvent, rule);
        }
      }
    });

    return modifiedEvent;
  }

  applyRuleEffects(event, rule) {
    if (rule.effects) {
      Object.keys(rule.effects).forEach(key => {
        if (key === 'addTags' && rule.effects[key]) {
          if (!event.tags) event.tags = [];
          if (Array.isArray(rule.effects[key])) {
            event.tags.push(...rule.effects[key]);
          } else {
            event.tags.push(rule.effects[key]);
          }
        } else if (key === 'setTitle' && rule.effects[key]) {
          event.title = rule.effects[key];
        } else if (key === 'modifyNarrative' && rule.effects[key]) {
          event.narrative = rule.effects[key];
        }
      });
    }
  }

  generateEventWithRules(context) {
    let event = this.generateTemplateBasedEvent(context);
    return this.applyCustomRules(event, context);
  }

  // Template-based generation (original functionality)
  generateTemplateBasedEvent(context = {}) {
    const templateKeys = Object.keys(this.templates);
    if (templateKeys.length === 0) {
      return this.generateFallbackEvent();
    }

    const templateKey = this.chance.pickone(templateKeys);
    const template = this.templates[templateKey];

    const event = {
      id: `event_${Date.now()}_${this.chance.guid().substring(0, 8)}`,
      title: template.title,
      description: template.narrative,
      narrative: template.narrative,
      choices: template.choices.map(choice => ({
        text: choice.text,
        effect: choice.effect,
        consequence: choice.consequence
      })),
      type: 'TEMPLATE_BASED',
      consequence: null,
      context: context,
      urgency: this.chance.pickone(['low', 'normal', 'high', 'critical']),
      theme: this.theme,
      difficulty: this.chance.pickone(['easy', 'normal', 'hard', 'legendary']),
      tags: ['fantasy', 'template']
    };

    return event;
  }

  generateFallbackEvent() {
    return {
      id: `fallback_${Date.now()}`,
      title: 'A Mysterious Occurrence',
      description: 'Something unexpected has happened in your world.',
      narrative: 'Something unexpected has happened in your world.',
      choices: [
        { text: 'Investigate', effect: {}, consequence: 'investigate' },
        { text: 'Ignore it', effect: {}, consequence: 'ignore' }
      ],
      type: 'FALLBACK',
      consequence: null,
      context: {},
      urgency: 'normal',
      theme: this.theme || 'fantasy',
      difficulty: 'normal',
      tags: ['fallback']
    };
  }

  // Template loading methods
  loadTemplatesFromLibrary(genre) {
    // In browser environment, we'll load templates dynamically
    // This is a simplified version - in a real implementation, you'd fetch from templates/
    console.log(`Loading templates for genre: ${genre}`);
  }

  // Theme and training data methods
  initializeThemes() {
    this.themes = {
      fantasy: {
        defaultCulture: 'medieval',
        cultures: ['medieval', 'viking', 'elven', 'dwarven'],
        trainingData: [
          'The ancient castle stood on the hill overlooking the valley',
          'A wizard appeared from thin air with a flash of light',
          'The dragon swooped down from the mountains',
          'Magic flowed through the air like electricity',
          'The knight drew his sword and charged forward'
        ]
      },
      'sci-fi': {
        defaultCulture: 'cyberpunk',
        cultures: ['cyberpunk', 'space-opera', 'post-apocalyptic'],
        trainingData: [
          'The spaceship hurtled through the void of space',
          'Neural implants glowed with data streams',
          'Aliens invaded the colony on Mars',
          'Quantum computers predicted the future',
          'Time travel created a paradox in reality'
        ]
      },
      historical: {
        defaultCulture: 'renaissance',
        cultures: ['renaissance', 'victorian', 'ancient-rome'],
        trainingData: [
          'The king summoned his court to the throne room',
          'Ships sailed across the vast ocean',
          'The plague swept through the city streets',
          'Revolutionaries plotted in secret meetings',
          'Empires rose and fell with the tides of war'
        ]
      },
      horror: {
        defaultCulture: 'gothic',
        cultures: ['gothic', 'modern', 'supernatural'],
        trainingData: [
          'Shadows moved in the corners of the room',
          'A ghostly figure appeared in the mirror',
          'Blood stained the ancient stone floors',
          'Whispers echoed through the empty halls',
          'The curse awakened from its long slumber'
        ]
      }
    };
  }

  getThemeTrainingData(theme, culture) {
    const themeData = this.themes[theme];
    if (!themeData) return ['Something mysterious happened'];

    const selectedCulture = culture || themeData.defaultCulture;
    return themeData.trainingData || ['Something mysterious happened'];
  }

  // Enhanced features initialization
  initializeEnhancedFeatures(options) {
    // Placeholder for enhanced features
  }

  initializeTemplateSystem(options) {
    // Placeholder for template system
  }

  initializeChainDefinitions() {
    return new Map();
  }

  // NPC Relationship System Methods (v1.2.0)
  /**
   * Add an NPC to the relationship system
   * @param {Object} npc - NPC configuration
   * @param {string} npc.id - Unique identifier for the NPC
   * @param {string} npc.name - Display name of the NPC
   * @param {string} npc.type - Type of NPC (noble, merchant, etc.)
   */
  addNPC(npc) {
    if (!this.npcs) {
      this.npcs = new Map();
    }
    if (!this.relationships) {
      this.relationships = new Map();
    }

    this.npcs.set(npc.id, {
      id: npc.id,
      name: npc.name,
      type: npc.type || 'unknown',
      relationships: new Map()
    });

    console.log(`Added NPC: ${npc.name} (${npc.id})`);
  }

  /**
   * Update relationship between two entities
   * @param {string} fromId - ID of the first entity
   * @param {string} toId - ID of the second entity
   * @param {number} strength - Relationship strength (-100 to 100)
   * @param {string} reason - Reason for the relationship change
   */
  updateRelationship(fromId, toId, strength, reason = '') {
    if (!this.relationships) {
      this.relationships = new Map();
    }

    const key = `${fromId}-${toId}`;
    const currentStrength = this.relationships.get(key) || 0;

    // Clamp strength between -100 and 100
    const newStrength = Math.max(-100, Math.min(100, currentStrength + strength));

    this.relationships.set(key, newStrength);

    // Also update reverse relationship if NPCs exist
    if (this.npcs && this.npcs.has(fromId) && this.npcs.has(toId)) {
      const fromNpc = this.npcs.get(fromId);
      const toNpc = this.npcs.get(toId);

      fromNpc.relationships.set(toId, newStrength);
      toNpc.relationships.set(fromId, newStrength);
    }

    console.log(`Updated relationship ${fromId} -> ${toId}: ${currentStrength} -> ${newStrength} (${reason})`);
  }

  /**
   * Get relationship strength between two entities
   * @param {string} fromId - ID of the first entity
   * @param {string} toId - ID of the second entity
   * @returns {number} Relationship strength (-100 to 100)
   */
  getRelationship(fromId, toId) {
    if (!this.relationships) return 0;
    return this.relationships.get(`${fromId}-${toId}`) || 0;
  }

  /**
   * Get all NPCs
   * @returns {Map} Map of all NPCs
   */
  getNPCs() {
    return this.npcs || new Map();
  }

  /**
   * Get all relationships
   * @returns {Map} Map of all relationships
   */
  getRelationships() {
    return this.relationships || new Map();
  }

  // Template and Dependency Methods (v1.2.0)
  /**
   * Register a custom event template
   * @param {string} templateId - Unique identifier for the template
   * @param {Object} template - Template configuration
   */
  registerEventTemplate(templateId, template) {
    if (!this.customTemplates) {
      this.customTemplates = new Map();
    }
    this.customTemplates.set(templateId, template);
    console.log(`Registered custom template: ${templateId}`);
  }

  /**
   * Register an event dependency
   * @param {string} eventId - ID of the event that has dependencies
   * @param {Object} dependency - Dependency configuration
   */
  registerEventDependency(eventId, dependency) {
    if (!this.eventDependencies) {
      this.eventDependencies = new Map();
    }
    this.eventDependencies.set(eventId, dependency);
    console.log(`Registered dependency for event: ${eventId}`);
  }

  // Time Management Methods (v1.1.0)
  /**
   * Get current game time
   * @returns {Object} Current time state
   */
  getCurrentTime() {
    if (!this.gameTime) {
      this.gameTime = { day: 1, season: 'spring', year: 1 };
    }
    return this.gameTime;
  }

  /**
   * Advance game time by one day
   * @returns {Array} Array of events that became available due to time advancement
   */
  advanceGameDay() {
    if (!this.gameTime) {
      this.gameTime = { day: 1, season: 'spring', year: 1 };
    }

    this.gameTime.day += 1;

    // Advance season every 30 days
    const daysInSeason = 30;
    if (this.gameTime.day > daysInSeason) {
      this.gameTime.day = 1;
      const seasons = ['spring', 'summer', 'autumn', 'winter'];
      const currentSeasonIndex = seasons.indexOf(this.gameTime.season);
      this.gameTime.season = seasons[(currentSeasonIndex + 1) % 4];

      // Advance year if winter ends
      if (this.gameTime.season === 'spring') {
        this.gameTime.year += 1;
      }
    }

    console.log(`Advanced time to: Day ${this.gameTime.day}, ${this.gameTime.season}, Year ${this.gameTime.year}`);

    // Return any time-based events that became available
    return [];
  }

  // Event Chain Methods (v1.1.0)
  /**
   * Start a new event chain
   * @param {string} chainId - ID of the chain to start
   * @param {Object} context - Player context
   * @returns {Object|null} First event in the chain or null if chain not found
   */
  startChain(chainId, context = {}) {
    const chainDefinition = this.chainDefinitions.get(chainId);
    if (!chainDefinition) {
      console.warn(`Chain definition not found: ${chainId}`);
      return null;
    }

    const chainState = {
      id: chainId,
      currentStep: 0,
      started: new Date().toISOString(),
      context: context
    };

    this.activeChains.set(chainId, chainState);

    // Return the first event in the chain
    const firstEvent = this.generateEvent(context);
    firstEvent.chainId = chainId;
    firstEvent.chainStep = 0;
    firstEvent.isChainStart = true;

    console.log(`Started chain: ${chainId}`);
    return firstEvent;
  }

  /**
   * Advance an existing event chain
   * @param {string} chainId - ID of the chain to advance
   * @param {string} choice - Player's choice that affects chain progression
   * @returns {Object|null} Next event in chain or null if chain ended
   */
  advanceChain(chainId, choice = '') {
    const chainState = this.activeChains.get(chainId);
    if (!chainState) {
      console.warn(`Active chain not found: ${chainId}`);
      return null;
    }

    chainState.currentStep += 1;

    // Generate next event in chain
    const context = chainState.context || {};
    const nextEvent = this.generateEvent(context);

    if (nextEvent) {
      nextEvent.chainId = chainId;
      nextEvent.chainStep = chainState.currentStep;
      nextEvent.isChainContinuation = true;
    }

    // Check if chain should end (simplified logic)
    if (chainState.currentStep >= 3) { // End after 3 steps for demo
      this.activeChains.delete(chainId);
      if (nextEvent) {
        nextEvent.isChainEnd = true;
      }
      console.log(`Ended chain: ${chainId}`);
    }

    return nextEvent;
  }

  // Enhanced Event Generation (v1.2.0)
  /**
   * Generate an enhanced event with all features enabled
   * @param {Object} context - Player and environment context
   * @returns {Object} Generated event with enhancements
   */
  generateEnhancedEvent(context = {}) {
    // Use the standard generateEvent but add enhancements
    const event = this.generateEvent(context);

    // Add relationship context if NPCs exist
    if (this.npcs && this.npcs.size > 0 && context.player) {
      event.relationshipContext = {};
      for (const [npcId, npc] of this.npcs) {
        const relationship = this.getRelationship(context.player.id || 'player', npcId);
        if (relationship !== 0) {
          event.relationshipContext[npcId] = {
            name: npc.name,
            relationship: relationship,
            type: npc.type
          };
        }
      }
    }

    // Add time context
    const currentTime = this.getCurrentTime();
    event.timeContext = {
      day: currentTime.day,
      season: currentTime.season,
      year: currentTime.year
    };

    return event;
  }

  // Rule Engine Methods (v2.0.0)
  /**
   * Add a custom rule to the rule engine
   * @param {string} ruleName - Name of the rule
   * @param {Object} rule - Rule configuration with conditions and effects
   */
  addCustomRule(ruleName, rule) {
    this.customRules[ruleName] = rule;
    console.log(`Added custom rule: ${ruleName}`, rule);
  }

  /**
   * Get all custom rules
   * @returns {Object} Object containing all custom rules
   */
  getCustomRules() {
    return this.customRules;
  }

  /**
   * Remove a custom rule
   * @param {string} ruleName - Name of the rule to remove
   */
  removeCustomRule(ruleName) {
    if (this.customRules[ruleName]) {
      delete this.customRules[ruleName];
      console.log(`Removed custom rule: ${ruleName}`);
    }
  }

  /**
   * Clear all custom rules
   */
  clearCustomRules() {
    this.customRules = {};
    console.log('Cleared all custom rules');
  }

  /**
   * Initialize the rule engine system
   * @returns {Object} Rule engine configuration
   */
  initializeRuleEngine() {
    return {
      enabled: this.enableRuleEngine,
      rules: this.customRules,
      evaluateRule: (rule, context) => {
        // Basic rule evaluation - check if conditions are met
        if (!rule.conditions || rule.conditions.length === 0) {
          return false;
        }

        // For now, just check if any condition matches (OR logic)
        // This can be expanded to support complex AND/OR logic
        return rule.conditions.some(condition => {
          switch (condition.type) {
            case 'stat_greater_than':
              return context.player && context.player[condition.params.stat] > condition.params.value;
            case 'stat_less_than':
              return context.player && context.player[condition.params.stat] < condition.params.value;
            case 'stat_between':
              return context.player &&
                context.player[condition.params.stat] >= condition.params.min &&
                context.player[condition.params.stat] <= condition.params.max;
            case 'location_is':
              return context.environment && context.environment.location === condition.params.location;
            case 'season_is':
              return context.environment && context.environment.season === condition.params.season;
            case 'career_is':
              return context.player && context.player.career === condition.params.career;
            case 'time_greater_than':
              return context.time && context.time.day > condition.params.days;
            case 'has_item':
              return context.player && context.player.inventory &&
                context.player.inventory.includes(condition.params.item);
            case 'random_chance':
              return Math.random() < condition.params.probability;
            default:
              return false;
          }
        });
      }
    };
  }
}

// Make available globally for browser use
window.RPGEventGenerator = RPGEventGenerator;