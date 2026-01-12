const { Chance } = require('chance');

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
export class RPGEventGenerator {
  /**
   * Create a new event generator
   * @param {Object} options - Configuration options
   * @param {Chance} options.chance - Chance.js instance (optional, will create new if not provided)
   * @param {number} options.stateSize - Markov chain state size (default: 2)
   * @param {Array} options.trainingData - Custom training data for Markov chains
   * @param {string} options.theme - Theme for event generation: 'fantasy', 'sci-fi', 'historical'
   * @param {string} options.culture - Cultural context within theme (optional)
   * @param {boolean} options.enableTemplates - Enable template library system (default: false)
   * @param {string} options.templateLibrary - Genre to load templates from: 'fantasy', 'sci-fi', 'horror', 'historical'
   */
  constructor(options = {}) {
    this.chance = options.chance || new Chance();
    this.markovGenerator = new SimpleMarkovGenerator({
      stateSize: options.stateSize || 2
    });

    this.theme = options.theme !== undefined ? options.theme : 'fantasy';
    this.culture = options.culture;

    this.customTemplates = new Set();
    this.customChains = new Set();
    this.customTrainingData = {};

    this.enableDependencies = options.enableDependencies !== false;
    this.enableModifiers = options.enableModifiers !== false;
    this.enableRelationships = options.enableRelationships !== false;
    this.language = options.language || 'en';

    this.pureMarkovMode = options.pureMarkovMode || false;
    this.enableTemplates = this.pureMarkovMode ? false : (options.enableTemplates !== false);
    this.templateLibrary = this.pureMarkovMode ? null : (options.templateLibrary || null);
    this.loadedTemplates = new Map();

    this.enableRuleEngine = options.enableRuleEngine !== false;
    this.customRules = options.customRules || {};
    this.ruleEngine = this.initializeRuleEngine();

    this.pureMarkovMode = options.pureMarkovMode || false;

    this.initializeEnhancedFeatures(options);
    this.initializeTemplateSystem(options);
    this.initializeThemes();

    this.activeChains = new Map();
    this.chainDefinitions = this.initializeChainDefinitions();

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
      
      COURT_SCANDAL: {
        title: 'Court Scandal',
        narrative: 'Whispers of infidelity and betrayal rock the royal court, threatening to expose secrets that could topple kingdoms.',
        choices: [
          { text: 'Exploit the scandal for personal gain', effect: { influence: [15, 30], reputation: [-10, -5], karma: [-10, -5] }, consequence: 'court_manipulator' },
          { text: 'Help contain the scandal', effect: { influence: [5, 15], reputation: [10, 20], favor: 'royal' }, consequence: 'court_ally' },
          { text: 'Remain neutral and observe', effect: { influence: [0, 5] }, consequence: 'court_observer' }
        ]
      },

      NOBLE_DUEL: {
        title: 'Challenge of Honor',
        narrative: 'A noble of considerable standing has insulted your honor and demands satisfaction through single combat.',
        choices: [
          { text: 'Accept the duel immediately', effect: { reputation: [20, 40], health: [-20, -5] }, requirements: { combat_skill: 50 }, consequence: 'duelist' },
          { text: 'Demand a champion fight in your stead', effect: { gold: [-200, -100], reputation: [5, 15] }, consequence: 'strategist' },
          { text: 'Apologize and offer compensation', effect: { gold: [-500, -200], reputation: [-15, -5] }, consequence: 'diplomat' }
        ]
      },

      THIEVES_GUILD: {
        title: 'Shadows Call',
        narrative: 'The thieves\' guild has noticed your growing influence and extends an invitation to join their ranks.',
        choices: [
          { text: 'Accept their offer', effect: { gold: [100, 300], underworld_contacts: true }, consequence: 'guild_member' },
          { text: 'Negotiate better terms', effect: { influence: [10, 25], negotiation_success: [0.6, 0.9] }, consequence: 'guild_negotiator' },
          { text: 'Reject them firmly', effect: { reputation: [5, 15], underworld_enemies: true }, consequence: 'guild_enemy' }
        ]
      },

      BLACKMAIL_OPPORTUNITY: {
        title: 'Compromising Evidence',
        narrative: 'You\'ve discovered evidence that could ruin a powerful figure. How you handle this will define your character.',
        choices: [
          { text: 'Use it for blackmail', effect: { gold: [500, 1500], reputation: [-20, -10], karma: [-20, -10] }, consequence: 'blackmailer' },
          { text: 'Destroy the evidence', effect: { reputation: [15, 30], karma: [10, 20] }, consequence: 'honorable' },
          { text: 'Sell it to the highest bidder', effect: { gold: [200, 800], underworld_contacts: true }, consequence: 'information_broker' }
        ]
      },

      ANCIENT_CURSE: {
        title: 'Ancient Curse Awakens',
        narrative: 'An ancient artifact you touched has awakened a curse that now plagues your dreams and waking hours.',
        choices: [
          { text: 'Seek a priest\'s blessing', effect: { gold: [-100, -50], health: [10, 25], faith: [10, 20] }, consequence: 'blessed' },
          { text: 'Consult a witch or sorcerer', effect: { gold: [-300, -100], curse_lifted: [0.4, 0.7] }, consequence: 'occultist' },
          { text: 'Endure the curse\'s effects', effect: { health: [-15, -5], stress: [10, 25] }, consequence: 'cursed' }
        ]
      },

      GHOSTLY_VISITATION: {
        title: 'Spirit from the Past',
        narrative: 'The ghost of someone from your past appears, demanding justice or offering redemption.',
        choices: [
          { text: 'Help the spirit find peace', effect: { karma: [15, 30], stress: [5, 15] }, consequence: 'redeemer' },
          { text: 'Demand answers from the spirit', effect: { knowledge: [10, 25], stress: [10, 20] }, consequence: 'truth_seeker' },
          { text: 'Banish the spirit forcefully', effect: { karma: [-10, -5], stress: [15, 25] }, consequence: 'spirit_banisher' }
        ]
      },

      FORBIDDEN_LOVE: {
        title: 'Forbidden Romance',
        narrative: 'Your heart has been captured by someone utterly unsuitable - a married noble, a sworn enemy, or someone from a forbidden class.',
        choices: [
          { text: 'Pursue the romance secretly', effect: { happiness: [20, 40], stress: [10, 25], scandal_risk: [0.3, 0.7] }, consequence: 'secret_lover' },
          { text: 'End it before it begins', effect: { happiness: [-10, -5], reputation: [5, 10] }, consequence: 'disciplined' },
          { text: 'Confess everything publicly', effect: { reputation: [-30, -10], influence: [-15, -5], drama: true }, consequence: 'dramatic' }
        ]
      },

      FAMILY_SECRET: {
        title: 'Family Secret Revealed',
        narrative: 'A shocking family secret emerges that could destroy your lineage or elevate it to legendary status.',
        choices: [
          { text: 'Embrace the secret and use it', effect: { influence: [20, 40], family_legacy: true }, consequence: 'ambitious' },
          { text: 'Hide the secret at all costs', effect: { gold: [-500, -200], stress: [15, 30] }, consequence: 'protector' },
          { text: 'Reveal it to the world', effect: { reputation: [-25, 5], influence: [10, 30] }, consequence: 'truthful' }
        ]
      },

      LOST_CIVILIZATION: {
        title: 'Lost Civilization Discovered',
        narrative: 'Your explorations have led to the ruins of an ancient civilization, filled with treasures and dangers.',
        choices: [
          { text: 'Loot everything you can carry', effect: { gold: [1000, 3000], health: [-10, -30], cursed_item: [0.2, 0.5] }, consequence: 'treasure_hunter' },
          { text: 'Study the artifacts carefully', effect: { knowledge: [20, 40], influence: [10, 25] }, consequence: 'archaeologist' },
          { text: 'Leave the site undisturbed', effect: { karma: [10, 20], reputation: [5, 15] }, consequence: 'preserver' }
        ]
      },

      BANDIT_KING: {
        title: 'Bandit King\'s Challenge',
        narrative: 'The infamous bandit king blocks your path, offering you a choice: join his band or face certain death.',
        choices: [
          { text: 'Join the bandits', effect: { gold: [200, 500], reputation: [-30, -15], combat_skill: [5, 15] }, consequence: 'bandit' },
          { text: 'Challenge him to single combat', effect: { reputation: [20, 40], health: [-30, -10] }, requirements: { combat_skill: 60 }, consequence: 'hero' },
          { text: 'Bribe your way past', effect: { gold: [-400, -200], safe_passage: true }, consequence: 'diplomat' }
        ]
      },

      MARKET_CRASH: {
        title: 'Market Catastrophe',
        narrative: 'A sudden market crash threatens to wipe out fortunes across the kingdom, including your own investments.',
        choices: [
          { text: 'Sell everything immediately', effect: { gold: [-30, -10], market_recovery: true }, consequence: 'cautious_trader' },
          { text: 'Buy up distressed assets', effect: { gold: [-1000, 2000], risk: [0.4, 0.8] }, consequence: 'speculator' },
          { text: 'Hold and weather the storm', effect: { gold: [-50, 50], reputation: [10, 20] }, consequence: 'patient_investor' }
        ]
      },

      TRADE_WAR: {
        title: 'Trade War Escalates',
        narrative: 'Rival merchant houses have declared economic warfare, and you\'re caught in the middle.',
        choices: [
          { text: 'Form an alliance with one side', effect: { influence: [15, 30], gold: [200, 600] }, consequence: 'alliance_builder' },
          { text: 'Play both sides against each other', effect: { gold: [500, 1500], reputation: [-15, -5] }, consequence: 'manipulator' },
          { text: 'Stay neutral and wait it out', effect: { gold: [-100, 0], reputation: [5, 15] }, consequence: 'neutral_party' }
        ]
      },

      DESERTION_TEMPTATION: {
        title: 'Cowardice or Wisdom?',
        narrative: 'Your commanding officer leads your unit into certain slaughter. Desertion offers survival, but at the cost of honor.',
        choices: [
          { text: 'Desert and save yourself', effect: { health: [0, 10], reputation: [-40, -20], stress: [20, 40] }, consequence: 'deserter' },
          { text: 'Lead a mutiny against the commander', effect: { influence: [30, 60], reputation: [-20, 10] }, consequence: 'mutineer' },
          { text: 'Stand and fight with honor', effect: { reputation: [20, 40], health: [-40, -20] }, consequence: 'hero' }
        ]
      },

      MERCENARY_CONTRACT: {
        title: 'Lucrative but Dangerous',
        narrative: 'A wealthy patron offers you a mercenary contract that promises great wealth but involves fighting against impossible odds.',
        choices: [
          { text: 'Accept the contract', effect: { gold: [1000, 3000], health: [-30, -10], reputation: [10, 30] }, consequence: 'mercenary' },
          { text: 'Negotiate better terms', effect: { gold: [800, 2000], influence: [10, 25] }, consequence: 'negotiator' },
          { text: 'Decline the offer', effect: { reputation: [5, 15] }, consequence: 'prudent' }
        ]
      },

      BANDIT_AMBUSH: {
        title: 'Bandit Ambush',
        narrative: 'A small group of bandits springs an ambush on your caravan, demanding tribute or blood.',
        choices: [
          { text: 'Fight back fiercely', effect: { health: [-20, -5], reputation: [10, 25] }, consequence: 'hero' },
          { text: 'Pay the tribute', effect: { gold: [-200, -50], reputation: [-10, -5] }, consequence: 'prudent' },
          { text: 'Join the bandits', effect: { reputation: [-20, -10], combat_skill: [5, 10] }, consequence: 'bandit' }
        ]
      },

      BANDIT_ARMY: {
        title: 'Bandit Army Assembles',
        narrative: 'The bandit king has gathered a formidable army. Villages are burning, and the threat grows daily.',
        choices: [
          { text: 'Lead a militia to confront them', effect: { influence: [20, 40], health: [-40, -20] }, consequence: 'leader' },
          { text: 'Negotiate with the bandit king', effect: { gold: [-1000, -500], reputation: [-5, 10] }, consequence: 'diplomat' },
          { text: 'Flee to safer lands', effect: { influence: [-15, -5], stress: [-10, -5] }, consequence: 'refugee' }
        ]
      },

      ASSASSINATION_PLOT: {
        title: 'Assassination Plot Uncovered',
        narrative: 'Your investigation has revealed a plot to assassinate a high-ranking noble. The conspirators know you\'re onto them.',
        choices: [
          { text: 'Alert the authorities immediately', effect: { influence: [15, 30], reputation: [10, 20] }, consequence: 'hero' },
          { text: 'Confront the conspirators yourself', effect: { health: [-30, -10], reputation: [20, 35] }, consequence: 'investigator' },
          { text: 'Use this information for personal gain', effect: { gold: [500, 1500], reputation: [-25, -10] }, consequence: 'blackmailer' }
        ]
      },

      ROYAL_PURGE: {
        title: 'Royal Purge',
        narrative: 'The scandal has triggered a royal purge. Accusations fly, and no one is safe from suspicion.',
        choices: [
          { text: 'Stand your ground and proclaim innocence', effect: { reputation: [15, 30], influence: [10, 25] }, consequence: 'innocent' },
          { text: 'Flee into exile', effect: { influence: [-50, -20], stress: [10, 25] }, consequence: 'exile' },
          { text: 'Testify against others to save yourself', effect: { reputation: [-30, -15], karma: [-20, -10] }, consequence: 'betrayer' }
        ]
      },

      TRADE_OPPORTUNITY: {
        title: 'Rare Trade Opportunity',
        narrative: 'A lucrative trade route has opened up, but it requires significant initial investment.',
        choices: [
          { text: 'Invest heavily in the venture', effect: { gold: [-2000, -1000], influence: [10, 25] }, consequence: 'invest' },
          { text: 'Take a calculated risk with moderate investment', effect: { gold: [-500, -200], influence: [5, 15] }, consequence: 'moderate' },
          { text: 'Pass on the opportunity', effect: { reputation: [-5, 0] }, consequence: 'cautious' }
        ]
      },

      FINAL_RECKONING: {
        title: 'Final Reckoning',
        narrative: 'The cursed artifact demands its final price. The entity bound to it appears before you.',
        choices: [
          { text: 'Destroy the artifact', effect: { health: [-50, -20], karma: [30, 50] }, consequence: 'destroyer' },
          { text: 'Bargain with the entity', effect: { influence: [20, 40], health: [-20, -10] }, consequence: 'diplomat' },
          { text: 'Accept the curse as your own', effect: { power_level: [50, 100], health: [-30, -15] }, consequence: 'cursed' }
        ]
      },

      BLOOMING_ROMANCE: {
        title: 'Spring Blossoms',
        narrative: 'The spring air carries the sweet scent of blooming flowers, and romance fills the atmosphere.',
        choices: [
          { text: 'Pursue a romantic interest', effect: { happiness: [20, 40], relationships: [1, 2] }, consequence: 'romantic' },
          { text: 'Focus on personal growth', effect: { wisdom: [10, 25], stress: [-10, -5] }, consequence: 'introspective' },
          { text: 'Throw a garden party', effect: { influence: [10, 20], gold: [-50, -20] }, consequence: 'social' }
        ]
      },

      SPRING_FESTIVAL: {
        title: 'Festival of Renewal',
        narrative: 'The village celebrates the spring festival with flowers, music, and joyous gatherings.',
        choices: [
          { text: 'Participate in the celebrations', effect: { happiness: [15, 30], reputation: [5, 15] }, consequence: 'festive' },
          { text: 'Help organize the festival', effect: { influence: [15, 25], gold: [-30, -10] }, consequence: 'organizer' },
          { text: 'Use the crowds for business', effect: { gold: [20, 50], reputation: [-5, 5] }, consequence: 'merchant' }
        ]
      },

      SUMMER_TOURNAMENT: {
        title: 'Grand Tournament',
        narrative: 'Warriors from across the land gather for the annual summer tournament, testing their skills in combat.',
        choices: [
          { text: 'Enter the tournament', effect: { reputation: [20, 40], health: [-20, -5] }, consequence: 'competitor' },
          { text: 'Sponsor a contestant', effect: { influence: [10, 20], gold: [-100, -50] }, consequence: 'patron' },
          { text: 'Watch and learn', effect: { combat_skill: [5, 15], reputation: [5, 10] }, consequence: 'spectator' }
        ]
      },

      HARVEST_FESTIVAL: {
        title: 'Harvest Celebration',
        narrative: 'The autumn harvest brings bounty and gratitude, celebrated with feasts and thanksgiving.',
        choices: [
          { text: 'Contribute to the harvest', effect: { karma: [10, 20], community_relations: [15, 25] }, consequence: 'contributor' },
          { text: 'Host a harvest feast', effect: { influence: [20, 30], gold: [-80, -40] }, consequence: 'host' },
          { text: 'Trade harvest goods', effect: { gold: [50, 100], influence: [5, 15] }, consequence: 'trader' }
        ]
      },

      WINTER_SOLSTICE: {
        title: 'Winter Solstice Ritual',
        narrative: 'The longest night brings reflection and hope as the sun begins its return journey.',
        choices: [
          { text: 'Participate in solstice rituals', effect: { faith: [10, 25], stress: [-15, -5] }, consequence: 'spiritual' },
          { text: 'Host a solstice gathering', effect: { influence: [15, 25], warmth: [20, 40] }, consequence: 'community' },
          { text: 'Contemplate the turning year', effect: { wisdom: [15, 30], insight: [10, 20] }, consequence: 'philosophical' }
        ]
      },

      RUMORS_OF_DISSENT: {
        title: 'Whispers of Unrest',
        narrative: 'Rumors of dissatisfaction with the current regime begin circulating through the streets.',
        choices: [
          { text: 'Investigate the rumors', effect: { influence: [5, 15], risk: [10, 20] }, consequence: 'investigator' },
          { text: 'Ignore the gossip', effect: { stress: [-5, 0] }, consequence: 'apathetic' },
          { text: 'Spread counter-rumors', effect: { reputation: [-10, -5], influence: [5, 10] }, consequence: 'loyalist' }
        ]
      },

      MARKET_UNREST: {
        title: 'Market Instability',
        narrative: 'Traders report unusual fluctuations in market prices and growing uncertainty among merchants.',
        choices: [
          { text: 'Invest in stable goods', effect: { gold: [-200, -100], security: [20, 40] }, consequence: 'conservative' },
          { text: 'Speculate on market changes', effect: { gold: [-100, 300], risk: [30, 50] }, consequence: 'speculator' },
          { text: 'Diversify your holdings', effect: { gold: [-50, -20], stability: [15, 25] }, consequence: 'balanced' }
        ]
      },

      STRANGE_OCCURRENCES: {
        title: 'Unexplained Phenomena',
        narrative: 'Strange lights in the sky and unexplained events begin occurring with increasing frequency.',
        choices: [
          { text: 'Investigate the phenomena', effect: { knowledge: [10, 25], risk: [10, 20] }, consequence: 'curious' },
          { text: 'Consult local experts', effect: { gold: [-30, -10], insight: [15, 30] }, consequence: 'scholarly' },
          { text: 'Dismiss as superstition', effect: { stress: [-10, -5] }, consequence: 'skeptical' }
        ]
      }
    };
  }

  /**
   * Generate a rich, contextual event based on player state
   * @param {Object} playerContext - Player stats and state
   * @returns {Object} Generated event with deep narrative
   */
  generateEvent(playerContext = {}) {
    const context = this.analyzeContext(playerContext);

    let event;

    if (this.pureMarkovMode) {
      event = this.generatePureMarkovEvent(context);
    } else {
      const template = this.selectTemplate(context);

      const scaledChoices = this.scaleEffectsForDifficulty(
        this.generateContextualChoices(template.choices, context),
        context
      );

      event = {
        id: `event_${Date.now()}_${this.chance.guid().substring(0, 8)}`,
        title: this.generateDynamicTitle(template, context),
        description: this.generateRichDescription(template, context),
        narrative: template.narrative,
        choices: scaledChoices,
        type: Object.keys(this.templates).find(key => this.templates[key] === template),
        consequence: null,
        context: context,
        urgency: this.calculateUrgency(template, context),
        theme: this.determineTheme(template, context),
        difficulty: this.calculateDifficultyTier(context.power_level || 0),
        tags: template.tags || []
      };
    }

    // Apply custom rules if rule engine is enabled
    if (this.enableRuleEngine) {
      event = this.applyCustomRules(event, context);
    }

    return event;
  }

  /**
   * Generate an event purely from Markov chains (v2.0.0)
   * @param {Object} context - Generation context
   * @returns {Object} Generated event
   */
  generatePureMarkovEvent(context) {
    try {
      const titleGenerated = this.markovGenerator.generate({
        minLength: 15,
        maxLength: 40,
        maxTries: 10
      });

      let title = titleGenerated && titleGenerated.string ?
        titleGenerated.string.trim().charAt(0).toUpperCase() + titleGenerated.string.trim().slice(1) : 'Mysterious Occurrence';

      if (title.length > 35) {
        title = title.substring(0, 32) + '...';
      }

      const narrativeGenerated = this.markovGenerator.generate({
        minLength: 50,
        maxLength: 120,
        maxTries: 15
      });

      const narrative = narrativeGenerated && narrativeGenerated.string ?
        narrativeGenerated.string : 'Something extraordinary has occurred that demands your attention.';

      const descriptionGenerated = this.markovGenerator.generate({
        minLength: 30,
        maxLength: 80,
        maxTries: 10
      });

      let description = narrative;
      if (descriptionGenerated && descriptionGenerated.string &&
          descriptionGenerated.string.length > 20) {
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
        difficulty: this.calculateDifficultyTier(context.power_level || 0),
        tags: []
      };
    } catch (error) {
      console.warn('Pure Markov generation failed, falling back to template:', error.message);
      return this.generateTemplateBasedEvent(context);
    }
  }

  /**
   * Generate choices for pure Markov events
   * @param {Object} context - Generation context
   * @returns {Array} Generated choices
   */
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

      if (this.chance.bool({ likelihood: 60 })) {
        effects.gold = this.chance.integer({ min: -50, max: 100 });
      }

      if (this.chance.bool({ likelihood: 40 })) {
        effects.reputation = this.chance.integer({ min: -10, max: 20 });
      }

      if (this.chance.bool({ likelihood: 30 })) {
        effects.knowledge = this.chance.integer({ min: 5, max: 25 });
      }

      return {
        text: text,
        effect: effects,
        consequence: `markov_choice_${index}`
      };
    });
  }

  /**
   * Fallback method for pure Markov generation failures
   * @param {Object} context - Generation context
   * @returns {Object} Generated event
   */
  generateTemplateBasedEvent(context) {
    const template = this.selectTemplate(context);

    const scaledChoices = this.scaleEffectsForDifficulty(
      this.generateContextualChoices(template.choices, context),
      context
    );

    return {
      id: `event_${Date.now()}_${this.chance.guid().substring(0, 8)}`,
      title: this.generateDynamicTitle(template, context),
      description: this.generateRichDescription(template, context),
      narrative: template.narrative,
      choices: scaledChoices,
      type: Object.keys(this.templates).find(key => this.templates[key] === template),
      consequence: null,
      context: context,
      urgency: this.calculateUrgency(template, context),
      theme: this.determineTheme(template, context),
      difficulty: this.calculateDifficultyTier(context.power_level || 0)
    };
  }

  /**
   * Apply custom rules to an event (v2.0.0)
   * @param {Object} event - The generated event
   * @param {Object} context - The generation context
   * @returns {Object} Modified event with rules applied
   */
  applyCustomRules(event, context) {
    let modifiedEvent = event;

    for (const [ruleName, rule] of Object.entries(this.customRules)) {
      if (this.ruleEngine.evaluateRule(context, rule)) {
        modifiedEvent = this.ruleEngine.applyRuleEffects(modifiedEvent, rule, context);
      }
    }

    return modifiedEvent;
  }

  /**
   * Add a custom rule to the rule engine (v2.0.0)
   * @param {string} name - Unique rule name
   * @param {Object} rule - Rule definition
   * @param {Array} rule.conditions - Array of condition objects
   * @param {Object} rule.effects - Effects to apply when conditions are met
   */
  addCustomRule(name, rule) {
    this.customRules[name] = rule;
  }

  /**
   * Remove a custom rule (v2.0.0)
   * @param {string} name - Rule name to remove
   */
  removeCustomRule(name) {
    if (this.customRules[name]) {
      delete this.customRules[name];
    }
  }

  /**
   * Get all custom rules (v2.0.0)
   * @returns {Object} All custom rules
   */
  getCustomRules() {
    return { ...this.customRules };
  }

  /**
   * Clear all custom rules (v2.0.0)
   */
  clearCustomRules() {
    this.customRules = {};
  }

  /**
   * Validate a custom rule definition (v2.0.0)
   * @param {Object} rule - Rule to validate
   * @returns {Object} Validation result { valid: boolean, errors: Array }
   */
  validateCustomRule(rule) {
    const errors = [];

    if (!rule || typeof rule !== 'object') {
      errors.push('Rule must be an object');
      return { valid: false, errors };
    }

    if (rule.conditions && !Array.isArray(rule.conditions)) {
      errors.push('Conditions must be an array');
    }

    if (rule.effects && typeof rule.effects !== 'object') {
      errors.push('Effects must be an object');
    }

    if (rule.conditions && Array.isArray(rule.conditions)) {
      rule.conditions.forEach((condition, index) => {
        if (!condition.type) {
          errors.push(`Condition ${index} missing type`);
        }
        if (!this.ruleEngine.conditionEvaluators[condition.type]) {
          errors.push(`Condition ${index} has unknown type: ${condition.type}`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate multiple events at once
   * @param {Object} playerContext - Player stats and state
   * @param {number} count - Number of events to generate
   * @returns {Array} Array of generated events
   */
  generateEvents(playerContext = {}, count = 1) {
    const events = [];
    for (let i = 0; i < count; i++) {
      events.push(this.generateEvent(playerContext));
    }
    return events;
  }

  /**
   * Initialize thematic training data sets
   * @private
   */
  /**
   * Initialize enhanced features based on options
   * @private
   * @param {Object} options - Constructor options
   */
  initializeEnhancedFeatures(options) {
    this.locales = new Map();
    this.dependencies = new Map();
    this.modifiers = new Map();
    this.relationships = new Map();
    this.activeModifiers = new Set();

    this.loadDefaultLocale();

    if (this.enableModifiers) {
      this.initializeBuiltInModifiers();
    }

    if (this.enableRelationships) {
      this.initializeRelationshipRules();
    }
  }

  /**
   * Initialize the custom rule engine system (v2.0.0)
   */
  initializeRuleEngine() {
    const ruleEngine = {
      rules: new Map(),
      evaluators: new Map(),
      conditions: new Map(),

      conditionEvaluators: {},

      evaluateCondition: function(context, condition) {
        const evaluator = this.conditionEvaluators[condition.type];
        if (!evaluator) {
          console.warn(`Unknown condition type: ${condition.type}`);
          return false;
        }
        return evaluator(context, condition.params || {}, this);
      },

      initializeConditionEvaluators: function() {
        const self = this;
        this.conditionEvaluators = {
          stat_greater_than: (context, params) => {
            const stat = context.player?.[params.stat] || context[params.stat] || 0;
            return stat > params.value;
          },
          stat_less_than: (context, params) => {
            const stat = context.player?.[params.stat] || context[params.stat] || 0;
            return stat < params.value;
          },
          stat_between: (context, params) => {
            const stat = context.player?.[params.stat] || context[params.stat] || 0;
            return stat >= params.min && stat <= params.max;
          },
          has_item: (context, params) => {
            return context.player?.inventory?.includes(params.item) || false;
          },
          location_is: (context, params) => {
            return context.location === params.location;
          },
          season_is: (context, params) => {
            return context.season === params.season;
          },
          career_is: (context, params) => {
            return (context.player?.career || context.career) === params.career;
          },
          time_greater_than: (context, params) => {
            return (context.time?.day || 0) > params.days;
          },
          relationship_status: (context, params) => {
            const relationship = context.relationships?.find(r => r.name === params.npc);
            if (!relationship) return false;
            return relationship.relationship >= params.min && relationship.relationship <= params.max;
          },
          random_chance: (context, params) => {
            return Math.random() < params.probability;
          },
          and: (context, params, ruleEngine) => {
            return params.conditions.every(condition =>
              ruleEngine.evaluateCondition(context, condition)
            );
          },
          or: (context, params, ruleEngine) => {
            return params.conditions.some(condition =>
              ruleEngine.evaluateCondition(context, condition)
            );
          },
          not: (context, params, ruleEngine) => {
            return !ruleEngine.evaluateCondition(context, params.condition);
          }
        };
      },

      evaluateRule: function(context, rule) {
        if (!rule.conditions || rule.conditions.length === 0) {
          return true;
        }

        return rule.conditions.every(condition =>
          this.evaluateCondition(context, condition)
        );
      },

      applyRuleEffects: function(event, rule, context) {
        if (!rule.effects) return event;

        const modifiedEvent = JSON.parse(JSON.stringify(event));

        if (rule.effects.modifyChoices) {
          modifiedEvent.choices = modifiedEvent.choices.map(choice => ({
            ...choice,
            effect: this.applyEffectModifiers(choice.effect, rule.effects.modifyChoices, context)
          }));
        }

        if (rule.effects.addChoices) {
          modifiedEvent.choices = [...modifiedEvent.choices, ...rule.effects.addChoices];
        }

        if (rule.effects.modifyTitle) {
          modifiedEvent.title = this.applyTextModifiers(modifiedEvent.title, rule.effects.modifyTitle, context);
        }

        if (rule.effects.modifyNarrative) {
          modifiedEvent.narrative = this.applyTextModifiers(modifiedEvent.narrative, rule.effects.modifyNarrative, context);
        }

        if (rule.effects.setDifficulty) {
          modifiedEvent.difficulty = rule.effects.setDifficulty;
        }

        if (rule.effects.addTags) {
          if (!modifiedEvent.tags) modifiedEvent.tags = [];
          modifiedEvent.tags = [...modifiedEvent.tags, ...rule.effects.addTags];
        }

        return modifiedEvent;
      },

      applyEffectModifiers: function(effect, modifiers, context) {
        const modified = { ...effect };

        if (modifiers.multiply) {
          Object.keys(modifiers.multiply).forEach(key => {
            if (modified[key] !== undefined) {
              if (Array.isArray(modified[key])) {
                modified[key] = modified[key].map(val => Math.round(val * modifiers.multiply[key]));
              } else {
                modified[key] = Math.round(modified[key] * modifiers.multiply[key]);
              }
            }
          });
        }

        if (modifiers.add) {
          Object.keys(modifiers.add).forEach(key => {
            if (modified[key] !== undefined) {
              if (Array.isArray(modified[key])) {
                modified[key] = modified[key].map(val => val + modifiers.add[key]);
              } else {
                modified[key] = modified[key] + modifiers.add[key];
              }
            } else {
              modified[key] = modifiers.add[key];
            }
          });
        }

        return modified;
      },

      applyTextModifiers: function(text, modifiers, context) {
        let modifiedText = text;

        if (modifiers.replace) {
          Object.keys(modifiers.replace).forEach(pattern => {
            const replacement = modifiers.replace[pattern];
            modifiedText = modifiedText.replace(new RegExp(pattern, 'g'), replacement);
          });
        }

        if (modifiers.append) {
          modifiedText += modifiers.append;
        }

        if (modifiers.prepend) {
          modifiedText = modifiers.prepend + modifiedText;
        }

        return modifiedText;
      }
    };

    ruleEngine.initializeConditionEvaluators();

    return ruleEngine;
  }

  initializeTemplateSystem(options) {
    if (this.enableTemplates && this.templateLibrary) {
      try {
        this.loadTemplateLibrary(this.templateLibrary);
      } catch (error) {
        console.warn('Failed to load template library:', error.message);
      }
    }
  }

  loadTemplateLibrary(genre) {
    try {
      const fs = require('fs');
      const path = require('path');

      const templatesDir = path.join(__dirname, '..', 'templates');
      const genreDir = path.join(templatesDir, genre);

      if (!fs.existsSync(genreDir)) {
        console.warn(`Template genre '${genre}' not found`);
        return;
      }

      const files = fs.readdirSync(genreDir);
      let loadedCount = 0;

      files.forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(genreDir, file);
            const templateData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const templateId = path.basename(file, '.json');

            this.loadedTemplates.set(`${genre}:${templateId}`, templateData);
            loadedCount++;
          } catch (error) {
            console.warn(`Failed to load template ${file}:`, error.message);
          }
        }
      });

    } catch (error) {
      console.warn('Template loading failed:', error.message);
    }
  }

  generateFromTemplate(templateId, context = {}) {
    const fullTemplateId = this.templateLibrary ? `${this.templateLibrary}:${templateId}` : templateId;
    const template = this.loadedTemplates.get(fullTemplateId);

    if (!template) {
      throw new Error(`Template '${fullTemplateId}' not found`);
    }

    const event = {
      title: template.title,
      description: template.narrative,
      choices: template.choices.map(choice => ({
        text: choice.text,
        effect: choice.effect || {},
        consequence: choice.consequence
      })),
      type: template.type,
      difficulty: template.difficulty,
      tags: template.tags || []
    };

    return this.applyContextEnhancements(event, context);
  }

  generateFromGenre(genre, context = {}) {
    if (!this.loadedTemplates.size) {
      throw new Error('No templates loaded. Call loadTemplateLibrary() first.');
    }

    const genreTemplates = Array.from(this.loadedTemplates.entries())
      .filter(([key]) => key.startsWith(`${genre}:`));

    if (!genreTemplates.length) {
      throw new Error(`No templates found for genre '${genre}'`);
    }

    const randomTemplate = this.chance.pickone(genreTemplates);
    const template = randomTemplate[1];

    const event = {
      title: template.title,
      description: template.narrative,
      choices: template.choices.map(choice => ({
        text: choice.text,
        effect: choice.effect || {},
        consequence: choice.consequence
      })),
      type: template.type,
      difficulty: template.difficulty,
      tags: template.tags || []
    };

    return this.applyContextEnhancements(event, context);
  }

  getAvailableTemplates() {
    const templates = {};
    this.loadedTemplates.forEach((template, key) => {
      const [genre, id] = key.split(':');
      if (!templates[genre]) {
        templates[genre] = [];
      }
      templates[genre].push({
        id,
        title: template.title,
        difficulty: template.difficulty,
        type: template.type,
        tags: template.tags
      });
    });
    return templates;
  }

  applyContextEnhancements(event, context) {
    if (context.player) {
      event.playerContext = context.player;
    }
    if (context.environment) {
      event.environment = context.environment;
    }
    return event;
  }

  initializeThemes() {
    this.themes = {
      fantasy: [
        'The royal court is abuzz with whispers of scandal and betrayal',
        'A noble lord approaches you with a proposition that could change your destiny',
        'Court politics have reached a fever pitch as alliances shift like desert sands',
        'The king\'s advisors plot in shadowed corners while the court dances obliviously',
        'A mysterious letter arrives sealed with wax from a noble house you don\'t recognize',

        'The thieves\' guild has put out a contract that bears your name',
        'Shadowy figures lurk in alleyways, watching your every move',
        'The black market thrives under the cover of night, offering forbidden luxuries',
        'A notorious crime lord has taken an interest in your activities',
        'Corrupt guards demand tribute while turning a blind eye to greater crimes',

        'Strange runes appear on your bedroom wall, glowing with ethereal light',
        'An ancient prophecy speaks of a hero who matches your description exactly',
        'Ghostly apparitions warn of impending doom in fevered dreams',
        'A witch in the woods offers you power beyond mortal comprehension',
        'Cursed artifacts surface in the market, promising great power at terrible cost',

        'Your past sins come back to haunt you in the most unexpected ways',
        'A long-lost relative appears with a tale that shakes your world',
        'Your reputation draws admirers and enemies in equal measure',
        'A betrayal cuts deeper than any blade, leaving scars on your soul',
        'Love and ambition war within your heart as opportunities arise',

        'Ancient ruins whisper secrets to those brave enough to listen',
        'A dragon\'s hoard lies hidden, protected by trials and tribulations',
        'Bandits rule the roads, but their leader seems oddly familiar',
        'A legendary artifact calls to you from across distant lands',
        'The wilderness holds both peril and promise for the bold adventurer',

        'Romantic entanglements complicate your carefully laid plans',
        'Old friends become new enemies as loyalties are tested',
        'Family secrets emerge that threaten to destroy everything you hold dear',
        'Mentors offer wisdom that comes with strings attached',
        'Rivals emerge from unexpected places, challenging your hard-won position',

        'The market crashes send shockwaves through the merchant class',
        'A get-rich-quick scheme promises fortunes but demands your soul',
        'Trade wars erupt between rival merchant houses',
        'Investment opportunities arise that could make or break your fortune',
        'Black market deals offer power but carry the weight of damnation',

        'War drums beat as kingdoms prepare for inevitable conflict',
        'Desertion offers freedom but brands you a coward forever',
        'A duel of honor is proposed, with your reputation on the line',
        'Mercenary companies seek captains brave enough to lead them',
        'Battle scars tell stories of glory and horror in equal measure',

        'The veil between worlds thins, allowing magic to seep into reality',
        'Curses and blessings intertwine in ways you never expected',
        'Ancient bloodlines awaken powers dormant for generations',
        'Rituals performed in secret grant power at terrible personal cost',
        'The stars themselves seem to conspire in your favor or against you',

        'Winter\'s cruel bite forces desperate measures from the populace',
        'Spring\'s renewal brings both hope and dangerous new beginnings',
        'Summer tournaments test the mettle of warriors and nobles alike',
        'Autumn harvests reveal secrets long buried in the fields',
        'The changing seasons mirror the turmoil in your own life',

        'What seems like a blessing reveals itself as a curse in disguise',
        'Enemies become allies, and allies become your greatest threat',
        'The path of righteousness leads to ruin, while villainy brings reward',
        'Fate itself seems to take notice of your actions, for good or ill',
        'The world bends around you as your choices reshape reality itself'
      ],

      'sci-fi': [
        'Megacorporations wage shadow wars through proxy conflicts and data manipulation',
        'Neural implants malfunction, flooding your mind with corporate secrets',
        'A black-market AI offers forbidden knowledge at the cost of your sanity',
        'Corporate espionage turns deadly when rival agents converge on your location',
        'Whistleblower data reveals systemic corruption in the highest levels of power',

        'Hackers breach your personal network, exposing vulnerabilities you never knew existed',
        'Street gangs control the undercity with drone swarms and illegal augmentations',
        'The dark web pulses with illegal tech trades and forbidden experiments',
        'Corporate bounty hunters track you through the neon-lit sprawl',
        'Data runners risk everything for the ultimate information score',

        'Alien artifacts whisper secrets from beyond the galactic rim',
        'Space pirates demand tribute or face the void of decompression',
        'Ancient derelict ships hold treasures and horrors from forgotten eras',
        'Wormhole anomalies bend reality, creating unpredictable temporal events',
        'Colony worlds rebel against Earth\'s iron-fisted governance',

        'Sentient AIs manipulate events from within the global network',
        'Nanobot swarms escape containment, evolving beyond their programming',
        'Virtual reality simulations bleed into the real world disastrously',
        'Genetic engineering experiments create monstrous hybrid beings',
        'Quantum computers predict the future, but at what cost to free will?',

        'Social credit systems reward compliance and punish deviation',
        'Surveillance drones watch every move, every transaction, every thought',
        'Rebellions simmer beneath the surface of totalitarian control',
        'Resource wars rage over the last viable mining asteroids',
        'Climate engineering projects backfire spectacularly',

        'Implant malfunctions cause vivid hallucinations and system crashes',
        'Identity theft becomes literal as someone steals your digital consciousness',
        'Memory wipes erase crucial knowledge, leaving you vulnerable',
        'Cybernetic enhancements demand maintenance that costs more than you can afford',
        'Neural links create unintended telepathic connections with strangers',

        'Cryptocurrency markets crash, wiping out fortunes in digital dust',
        'Hostile takeovers turn friendly acquisitions into bloody boardroom coups',
        'Trade wars erupt between orbital habitats and planetary governments',
        'Investment opportunities in black-market tech promise riches or ruin',
        'Corporate espionage turns personal when family members are leveraged',

        'Drone wars rage in the skies above abandoned cities',
        'Cyber warfare disables entire infrastructure networks',
        'Private military companies offer their services to the highest bidder',
        'Nuclear deterrence fails when EMP weapons render missiles useless',
        'Bioterrorism releases engineered plagues upon unsuspecting populations',

        'Government cover-ups hide the truth about alien visitations',
        'Time travel experiments create paradoxical timeline fractures',
        'Parallel dimensions bleed through, creating impossible phenomena',
        'Ancient alien technology reactivates with catastrophic consequences',
        'Conspiracy theories prove true, but the reality is far worse',

        'Terraforming projects unleash ancient microbes from the soil',
        'Climate control systems fail, creating unpredictable weather patterns',
        'Asteroid mining operations awaken dormant extraterrestrial threats',
        'Ocean acidification drives aquatic mutations to the surface',
        'Atmospheric processors malfunction, creating toxic breathing conditions'
      ],

      historical: [
        'The king\'s advisors plot in shadowed corners of the great hall',
        'Noble houses form secret alliances against the crown',
        'Whispers of heresy spread through the royal court like wildfire',
        'A foreign diplomat offers treacherous propositions under diplomatic immunity',
        'Court jesters hide dangerous truths behind masks of folly',

        'Armies mass at the borders, their banners fluttering in the wind of war',
        'Siege engines pound ancient walls as defenders hold the line',
        'Cavalry charges break enemy formations in clouds of dust and blood',
        'Naval blockades starve cities into submission or desperate rebellion',
        'Mercenary companies switch sides based on the highest bidder',

        'New World expeditions return with gold and strange diseases',
        'Ancient artifacts surface from archaeological digs, rewriting history',
        'Trade caravans brave bandits and harsh terrains for exotic goods',
        'Mapping expeditions chart unknown territories and hostile natives',
        'Scientific discoveries challenge religious doctrines and established truths',

        'Peasant revolts spread like contagion through the countryside',
        'Guilds clash over trade monopolies and apprenticeship rights',
        'Religious schisms divide communities along ideological lines',
        'Women maneuver within restrictive social structures for power and influence',
        'Immigrants bring new customs that clash with traditional ways',

        'Market monopolies drive independent merchants to desperation',
        'Banking houses manipulate currency values for political gain',
        'Trade embargoes create black markets and smuggling operations',
        'Agricultural failures lead to famines and social unrest',
        'Colonial exploitation enriches the crown while impoverishing subjects',

        'Treaty negotiations mask underlying territorial ambitions',
        'Spy networks weave webs of deception across national borders',
        'Succession crises threaten to plunge nations into civil war',
        'Diplomatic incidents escalate into full-scale military conflicts',
        'Royal marriages forge alliances that crumble under stress',

        'Inquisitions root out heresy with fire and torture',
        'Crusades call warriors to distant lands for faith and glory',
        'Reformation movements challenge the authority of established churches',
        'Cult leaders promise salvation through devotion and sacrifice',
        'Religious relics inspire pilgrimages and bloody conflicts',

        'Family feuds span generations, poisoning bloodlines with vengeance',
        'Scandals rock aristocratic families, threatening social standing',
        'Personal ambitions clash with familial duties and expectations',
        'Love affairs defy social conventions and familial arrangements',
        'Betrayals cut deeper than any blade, leaving lasting scars',

        'Plagues sweep through densely packed cities, claiming thousands',
        'Famines force desperate migrations and social breakdowns',
        'Natural disasters reveal underlying social and political tensions',
        'Harsh winters test the limits of human endurance and charity',
        'Droughts drive conflicts over dwindling water resources',

        'Scientific discoveries revolutionize warfare and exploration',
        'Technological innovations disrupt traditional crafts and livelihoods',
        'Medical breakthroughs save lives but challenge religious views',
        'Educational reforms open knowledge to new social classes',
        'Engineering marvels push the boundaries of human capability'
      ]
    };

    this.cultures = {
      fantasy: {
        norse: [
          'The longships sail into the fjord under the northern lights',
          'Runes carved in ancient stone whisper forgotten secrets',
          'The mead hall echoes with tales of heroic deeds and tragic fates',
          'Berserkers rage through the village leaving destruction in their wake',
          'The gods themselves seem to take notice of mortal affairs',
          'Viking raiders demand tribute or face the wrath of the axe',
          'Shamanic visions reveal the threads of fate woven by the Norns',
          'The sacred grove hides a portal to the realm of the Aesir',
          'Blood oaths bind warriors to quests of honor and vengeance',
          'Thunder rolls as Thor\'s hammer strikes down the unworthy'
        ],
        arabian: [
          'The desert winds carry secrets from across the golden sands',
          'The sultan\'s palace gleams with marble and precious gems',
          'Caravans traverse ancient trade routes laden with exotic spices',
          'Djinn emerge from bottles granting wishes with treacherous twists',
          'The bazaar bustles with merchants hawking forbidden artifacts',
          'Flying carpets soar above the minarets of ancient cities',
          'Oasis springs hide treasures guarded by serpentine efreet',
          'Bedouin tribes honor ancient codes of hospitality and revenge',
          'The caliph\'s viziers plot intricate webs of palace intrigue',
          'Magic lamps hold genies bound by oaths older than the desert'
        ],
        celtic: [
          'The ancient stone circles hum with druidic power',
          'Mists roll in from the moors carrying spectral visitors',
          'The high king\'s court debates matters of honor and clan loyalty',
          'Leprechauns guard pots of gold at the end of rainbows',
          'Banshees wail warnings of impending doom from castle towers',
          'The green hills hide fairy mounds and trooping fae',
          'Druidic circles perform rituals beneath the full moon',
          'Clan tartans flutter as warriors clash in honorable combat',
          'The sidhe court offers dangerous bargains to mortal visitors',
          'Standing stones mark portals to the otherworld'
        ],
        asian: [
          'The imperial court buzzes with whispers of dynastic intrigue',
          'Paper lanterns float on mist-shrouded temple lakes',
          'The great wall stands as both protector and prison',
          'Dragon spirits guard ancestral treasures in mountain monasteries',
          'Tea ceremonies reveal secrets shared only with trusted allies',
          'Samurai honor demands seppuku for failures of duty',
          'The emperor\'s astronomers chart the movements of celestial dragons',
          'Rice paddies hide the entrances to underworld spirit realms',
          'Calligraphy brushes write prophecies on silk scrolls',
          'The five elements balance or clash in matters of fate and fortune'
        ]
      },

      'sci-fi': {
        cyberpunk: [
          'Neon lights reflect off rain-slicked streets in the megacity sprawl',
          'Corporate security forces patrol the undercity with neural implants',
          'Black market clinics offer experimental augmentations at deadly prices',
          'Data runners jack into the net, risking their minds for digital secrets',
          'Street gangs control territory with drone swarms and illegal tech',
          'Megacorporations wage proxy wars through shell companies and hackers',
          'Neural lace interfaces blur the line between human and machine',
          'The undergrid pulses with illegal transmissions and rebel broadcasts',
          'Synthcoke dealers promise escape from the corporate grind',
          'Rogue AIs manifest as ghosts in the machine, manipulating events'
        ],
        space_opera: [
          'Star destroyers cast shadows across colonized planets',
          'The galactic senate debates matters of interstellar diplomacy',
          'Smugglers navigate asteroid fields laden with contraband cargo',
          'Alien ambassadors negotiate treaties in crystalline council chambers',
          'Hyperspace routes hide pirate ambushes and temporal anomalies',
          'The emperor\'s new clothes are actually powered armor',
          'Jedi knights wield lightsabers in duels of honor and destiny',
          'Space stations orbit gas giants, hubs of trade and intrigue',
          'The force guides the worthy through trials of wisdom and combat',
          'Rebel alliances form in the shadows of imperial domination'
        ],
        post_apocalyptic: [
          'Mutated creatures roam the irradiated wastelands',
          'Vault dwellers emerge from underground bunkers into harsh sunlight',
          'Caravan masters trade caps for water and ammunition',
          'Super mutants patrol ruined highways in power armor',
          'The brotherhood preserves technology as holy relics',
          'Ghoul settlements offer sanctuary at the cost of sanity',
          'Deathclaws stalk the ruins of pre-war cities',
          'Enclave remnants cling to old world ideologies',
          'Wasteland doctors perform surgery with scavenged medical supplies',
          'Tribal shamans commune with the spirits of the old world'
        ]
      },

      historical: {
        medieval: [
          'Knights joust in tournament fields beneath colorful pennants',
          'The castle keep stands as bastion against siege engines',
          'Peasant revolts spread like wildfire through feudal lands',
          'The black death claims lives across town and countryside',
          'Alchemists in hidden laboratories seek the philosopher\'s stone',
          'Crusader armies march under banners of faith and conquest',
          'Courtly love complicates matters of honor and duty',
          'The Magna Carta is sealed with wax and noble promises',
          'Witch hunters burn heretics at public stake executions',
          'Guild masters guard trade secrets with jealous vigilance'
        ],
        victorian: [
          'Steam engines power the industrial revolution across soot-stained cities',
          'The British Empire spans continents with colonial ambitions',
          'Social reformers challenge the rigid class structures of society',
          'Spiritualists commune with the dead in dimly lit seances',
          'Jack the Ripper stalks the fog-shrouded streets of Whitechapel',
          'The industrialists build empires on coal and child labor',
          'Suffragettes demand voting rights through peaceful protest',
          'Opium dens offer escape from the pressures of imperial duty',
          'The great exhibition showcases marvels of modern invention',
          'Darwin\'s theories challenge religious doctrines of creation'
        ],
        ancient_roman: [
          'Gladiators fight for glory in the Colosseum\'s sandy arena',
          'The Roman Senate debates matters of republic and empire',
          'Barbarian hordes threaten the borders of civilized lands',
          'The aqueducts carry water across vast engineering marvels',
          'Political assassinations reshape the corridors of power',
          'Slave revolts challenge the foundations of imperial society',
          'The gods demand tribute through elaborate public ceremonies',
          'Military legions march under eagles forged in sacred fires',
          'Patrician families feud over matters of honor and inheritance',
          'The imperial palace echoes with plots and betrayals'
        ]
      }
    };

    this.seasonalEvents = {
      spring: {
        templates: ['BLOOMING_ROMANCE', 'SPRING_FESTIVAL', 'NEW_BEGINNINGS'],
        modifiers: { happiness: 1.2, romance_events: 1.5, renewal_events: 2.0 }
      },
      summer: {
        templates: ['SUMMER_TOURNAMENT', 'BEACH_FESTIVAL', 'HARVEST_PREP'],
        modifiers: { health: 1.1, activity_events: 1.3, celebration_events: 1.8 }
      },
      autumn: {
        templates: ['HARVEST_FESTIVAL', 'AUTUMN_HUNT', 'WINTER_PREP'],
        modifiers: { wealth: 1.3, preparation_events: 1.6, scarcity_events: 1.2 }
      },
      winter: {
        templates: ['WINTER_SOLSTICE', 'HOLIDAY_CELEBRATION', 'SURVIVAL_CHALLENGE'],
        modifiers: { stress: 1.4, survival_events: 1.8, warmth_events: 2.0, scarcity_events: 1.5 }
      }
    };

    this.timeBasedEventChains = {
      POLITICAL_UPRISING: {
        name: 'Political Uprising',
        description: 'A rebellion builds against oppressive rule',
        stages: [
          { day: 1, template: 'RUMORS_OF_DISSENT' },
          { day: 7, template: 'PUBLIC_PROTESTS' },
          { day: 14, template: 'OPEN_REBELLION' },
          { day: 21, template: 'REVOLUTIONARY_CLIMAX' }
        ]
      },
      ECONOMIC_COLLAPSE: {
        name: 'Economic Collapse',
        description: 'A financial crisis spirals out of control',
        stages: [
          { day: 1, template: 'MARKET_UNREST' },
          { day: 5, template: 'BANK_RUN' },
          { day: 10, template: 'ECONOMIC_CRISIS' },
          { day: 15, template: 'SOCIAL_UNREST' }
        ]
      },
      MYSTICAL_AWAKENING: {
        name: 'Mystical Awakening',
        description: 'Ancient powers stir and manifest',
        stages: [
          { day: 1, template: 'STRANGE_OCCURRENCES' },
          { day: 3, template: 'MAGICAL_SURGES' },
          { day: 7, template: 'ARCANE_MANIFESTATION' },
          { day: 10, template: 'MYSTICAL_CLIMAX' }
        ]
      }
    };
  }

  /**
   * Get training data for a specific theme and culture
   * @param {string} theme - The theme to get training data for
   * @param {string} culture - The cultural variant (optional)
   * @returns {Array} Training data for the specified theme/culture
   * @private
   */
  getThemeTrainingData(theme, culture) {
    const baseThemeData = this.themes[theme] || this.themes.fantasy;

    if (!culture || !this.cultures[theme] || !this.cultures[theme][culture]) {
      return baseThemeData;
    }

    const culturalData = this.cultures[theme][culture];
    const blendRatio = 0.6;

    const baseCount = Math.floor(baseThemeData.length * blendRatio);
    const cultureCount = Math.floor(culturalData.length * (1 - blendRatio));

    const blendedData = [
      ...baseThemeData.slice(0, baseCount),
      ...culturalData.slice(0, cultureCount)
    ];

    return this.chance.shuffle(blendedData);
  }

  /**
   * Initialize event chain definitions
   * @private
   */
  initializeChainDefinitions() {
    return {
      BANDIT_RISING: {
        name: 'Bandit Rising',
        description: 'A bandit threat that escalates over time',
        stages: [
          {
            template: 'BANDIT_AMBUSH',
            delay: 0,
            triggerNext: { choice: 'bandit', delay: 3 }
          },
          {
            template: 'BANDIT_KING',
            delay: 3,
            triggerNext: { choice: 'hero', delay: 5 }
          },
          {
            template: 'BANDIT_ARMY',
            delay: 5
          }
        ]
      },

      COURT_SCANDAL_CHAIN: {
        name: 'Royal Scandal',
        description: 'A court intrigue that unfolds in multiple acts',
        stages: [
          {
            template: 'COURT_SCANDAL',
            delay: 0,
            triggerNext: { choice: 'investigator', delay: 2 }
          },
          {
            template: 'ASSASSINATION_PLOT',
            delay: 2,
            triggerNext: { choice: 'intervene', delay: 4 }
          },
          {
            template: 'ROYAL_PURGE',
            delay: 4
          }
        ]
      },

      CURSE_OF_THE_ARTIFACT: {
        name: 'Cursed Artifact',
        description: 'An ancient curse that manifests in stages',
        stages: [
          {
            template: 'ANCIENT_CURSE',
            delay: 0,
            triggerNext: { automatic: true, delay: 2 }
          },
          {
            template: 'GHOSTLY_VISITATION',
            delay: 2,
            triggerNext: { automatic: true, delay: 3 }
          },
          {
            template: 'FINAL_RECKONING',
            delay: 3
          }
        ]
      },

      MERCHANT_EMPIRE: {
        name: 'Rising Merchant Empire',
        description: 'Building a trade empire with escalating opportunities',
        stages: [
          {
            template: 'TRADE_OPPORTUNITY',
            delay: 0,
            triggerNext: { choice: 'invest', delay: 4 }
          },
          {
            template: 'MARKET_CRASH',
            delay: 4,
            triggerNext: { choice: 'rebuild', delay: 6 }
          },
          {
            template: 'TRADE_WAR',
            delay: 6
          }
        ]
      }
    };
  }

  /**
   * Start an event chain
   * @param {string} chainId - ID of the chain to start
   * @param {Object} playerContext - Player context
   * @returns {Object|null} First event in the chain or null
   */
  startChain(chainId, playerContext = {}) {
    const chainDef = this.chainDefinitions[chainId];
    if (!chainDef) return null;

    const chain = {
      id: `chain_${Date.now()}_${this.chance.guid().substring(0, 8)}`,
      definition: chainId,
      stage: 0,
      startTime: Date.now(),
      playerContext: { ...playerContext }
    };

    this.activeChains.set(chain.id, chain);

    return this.generateChainEvent(chain);
  }

  /**
   * Generate an event from an active chain
   * @param {Object} chain - Chain object
   * @returns {Object|null} Generated event or null
   */
  generateChainEvent(chain) {
    const chainDef = this.chainDefinitions[chain.definition];
    if (!chainDef || chain.stage >= chainDef.stages.length) return null;

    const stage = chainDef.stages[chain.stage];
    const template = this.templates[stage.template];

    if (!template) return null;

    const context = this.analyzeContext(chain.playerContext);

    return {
      id: `event_${chain.id}_${chain.stage}`,
      title: this.generateDynamicTitle(template, context),
      description: this.generateRichDescription(template, context),
      narrative: template.narrative,
      choices: this.generateContextualChoices(template.choices, context),
      type: stage.template,
      consequence: null,
      context: context,
      urgency: this.calculateUrgency(template, context),
      theme: this.determineTheme(template, context),
      chainId: chain.id,
      chainStage: chain.stage,
      isChainEvent: true
    };
  }

  /**
   * Advance an event chain based on player choice
   * @param {string} chainId - Chain ID
   * @param {string} choice - Player choice consequence
   * @returns {Object|null} Next event in chain or null
   */
  advanceChain(chainId, choice) {
    const chain = this.activeChains.get(chainId);
    if (!chain) return null;

    const chainDef = this.chainDefinitions[chain.definition];
    const currentStage = chainDef.stages[chain.stage];

    if (currentStage.triggerNext && currentStage.triggerNext.choice === choice) {
      chain.stage++;
      chain.playerContext = { ...chain.playerContext, lastChoice: choice };

      if (chain.stage < chainDef.stages.length) {
        chain.nextEventTime = this.timeSystem.currentDay + currentStage.triggerNext.delay;
        chain.nextEventTemplate = chainDef.stages[chain.stage].template;
      }

      return this.generateChainEvent(chain);
    }

    return null;
  }

  /**
   * Get all active chains
   * @returns {Array} Array of active chain objects
   */
  getActiveChains() {
    return Array.from(this.activeChains.values());
  }

  /**
   * End a chain
   * @param {string} chainId - Chain ID to end
   */
  endChain(chainId) {
    this.activeChains.delete(chainId);
  }

  /**
   * Advance game time and trigger time-based events
   * @param {number} days - Number of days to advance (default: 1)
   * @returns {Array} Array of time-based events triggered
   */
  advanceTime(days = 1) {
    const triggeredEvents = [];

    for (let i = 0; i < days; i++) {
      this.timeSystem.currentDay++;

      const seasonLength = 90;
      const seasonIndex = Math.floor((this.timeSystem.currentDay - 1) / seasonLength) % 4;
      const seasons = ['spring', 'summer', 'autumn', 'winter'];
      const newSeason = seasons[seasonIndex];

      if (newSeason !== this.timeSystem.currentSeason) {
        this.timeSystem.currentSeason = newSeason;
        triggeredEvents.push({
          type: 'seasonal_change',
          season: newSeason,
          day: this.timeSystem.currentDay
        });
      }

      const dayEvents = this.checkTimeBasedEventTriggers();
      triggeredEvents.push(...dayEvents);
    }

    return triggeredEvents;
  }

  /**
   * Check for time-based event triggers
   * @returns {Array} Array of triggered events
   * @private
   */
  checkTimeBasedEventTriggers() {
    const triggeredEvents = [];

    for (const [chainId, chainData] of this.timeSystem.timeBasedEvents.entries()) {
      const daysSinceStart = this.timeSystem.currentDay - chainData.startDay;

      for (const stage of chainData.chain.stages) {
        if (stage.day === daysSinceStart && !chainData.completedStages.includes(stage.day)) {
          chainData.completedStages.push(stage.day);

          const event = {
            type: 'time_based_chain',
            chainId: chainId,
            stage: stage,
            day: this.timeSystem.currentDay,
            template: this.templates[stage.template]
          };

          triggeredEvents.push(event);
          break;
        }
      }
    }

    if (this.chance.bool({ likelihood: 10 })) {
      const seasonalData = this.seasonalEvents[this.timeSystem.currentSeason];
      if (seasonalData && seasonalData.templates.length > 0) {
        const randomTemplate = this.chance.pickone(seasonalData.templates);
        if (this.templates[randomTemplate]) {
          triggeredEvents.push({
            type: 'seasonal_random',
            season: this.timeSystem.currentSeason,
            template: this.templates[randomTemplate],
            day: this.timeSystem.currentDay
          });
        }
      }
    }

    return triggeredEvents;
  }

  /**
   * Start a time-based event chain
   * @param {string} chainName - Name of the chain to start
   * @returns {boolean} Success status
   */
  startTimeBasedChain(chainName) {
    const chain = this.timeBasedEventChains[chainName];
    if (!chain) return false;

    const chainId = `time_chain_${Date.now()}_${this.chance.guid().substring(0, 8)}`;

    this.timeSystem.timeBasedEvents.set(chainId, {
      definition: chainName,
      stage: 0,
      startDay: this.timeSystem.currentDay,
      completedStages: new Set()
    });

    return true;
  }

  /**
   * Get current game time information
   * @returns {Object} Time system state
   */
  getCurrentTime() {
    return {
      day: this.timeSystem.currentDay,
      season: this.timeSystem.currentSeason,
      year: Math.ceil(this.timeSystem.currentDay / 360),
      seasonalModifiers: this.seasonalEvents[this.timeSystem.currentSeason]?.modifiers || {}
    };
  }

  /**
   * Advance to the next game day and process any due time-based events
   * @returns {Array} Array of events that are now ready to trigger
   */
  advanceGameDay() {
    this.timeSystem.currentDay++;

    const seasonLength = 90;
    const seasonIndex = Math.floor((this.timeSystem.currentDay - 1) / seasonLength) % 4;
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const newSeason = seasons[seasonIndex];

    if (newSeason !== this.timeSystem.currentSeason) {
      this.timeSystem.currentSeason = newSeason;
    }

    const dueEvents = [];
    for (const [chainId, chainData] of this.timeSystem.timeBasedEvents.entries()) {
      const chainDef = this.timeBasedEventChains[chainData.definition];
      if (!chainDef) continue;

      const daysSinceStart = this.timeSystem.currentDay - chainData.startDay;
      for (let i = chainData.stage; i < chainDef.stages.length; i++) {
        const stage = chainDef.stages[i];
        if (stage.day <= daysSinceStart && !chainData.completedStages.has(i)) {
          const event = {
            type: 'time_based_chain',
            chainId: chainId,
            template: this.templates[stage.template],
            day: this.timeSystem.currentDay,
            chainStage: i,
            stageDay: stage.day
          };

          dueEvents.push(event);
          chainData.completedStages.add(i);
          chainData.stage = Math.max(chainData.stage, i + 1);
        }
      }
    }

    if (this.chance.bool({ likelihood: 10 })) {
      const seasonalData = this.seasonalEvents[this.timeSystem.currentSeason];
      if (seasonalData && seasonalData.templates.length > 0) {
        const randomTemplate = this.chance.pickone(seasonalData.templates);
        if (this.templates[randomTemplate]) {
          dueEvents.push({
            type: 'seasonal_random',
            season: this.timeSystem.currentSeason,
            template: this.templates[randomTemplate],
            day: this.timeSystem.currentDay
          });
        }
      }
    }

    return dueEvents;
  }

  /**
   * Get all currently active time-based chains with their status
   * @returns {Array} Array of chain status objects
   */
  getActiveTimeChains() {
    const activeChains = [];
    for (const [chainId, chainData] of this.timeSystem.timeBasedEvents.entries()) {
      const chainDef = this.timeBasedEventChains[chainData.definition];
      if (chainDef) {
        activeChains.push({
          id: chainId,
          name: chainDef.name,
          description: chainDef.description,
          currentStage: chainData.stage,
          totalStages: chainDef.stages.length,
          nextEventDay: chainData.nextEventTime || null,
          nextEventTemplate: chainData.nextEventTemplate || null,
          startDay: chainData.startDay,
          daysActive: this.timeSystem.currentDay - chainData.startDay
        });
      }
    }
    return activeChains;
  }

  /**
   * Get game state for saving (includes time system and active chains)
   * @returns {Object} Serializable game state
   */
  getGameState() {
    return {
      timeSystem: {
        currentDay: this.timeSystem.currentDay,
        currentSeason: this.timeSystem.currentSeason,
        gameYear: Math.ceil(this.timeSystem.currentDay / 360)
      },
      activeChains: Array.from(this.timeSystem.timeBasedEvents.entries()).map(([id, data]) => ({
        id,
        definition: data.definition,
        stage: data.stage,
        startDay: data.startDay,
        nextEventTime: data.nextEventTime || null,
        nextEventTemplate: data.nextEventTemplate || null,
        completedStages: [...data.completedStages]
      })),
      theme: this.theme,
      culture: this.culture
    };
  }

  /**
   * Load game state (restores time system and active chains)
   * @param {Object} gameState - State object from getGameState()
   * @returns {boolean} Success status
   */
  loadGameState(gameState) {
    try {
      if (gameState.timeSystem) {
        this.timeSystem.currentDay = gameState.timeSystem.currentDay || 1;
        this.timeSystem.currentSeason = gameState.timeSystem.currentSeason || 'spring';
        this.timeSystem.gameYear = gameState.timeSystem.gameYear || 1;
      }

      this.timeSystem.timeBasedEvents.clear();
      if (gameState.activeChains) {
        gameState.activeChains.forEach(chainData => {
          this.timeSystem.timeBasedEvents.set(chainData.id, {
            definition: chainData.definition,
            stage: chainData.stage,
            startDay: chainData.startDay,
            nextEventTime: chainData.nextEventTime,
            nextEventTemplate: chainData.nextEventTemplate,
            completedStages: new Set(chainData.completedStages || [])
          });
        });
      }

      if (gameState.theme) this.theme = gameState.theme;
      if (gameState.culture) this.culture = gameState.culture;

      return true;
    } catch (error) {
      console.warn('Failed to load game state:', error.message);
      return false;
    }
  }

  /**
   * Generate a time-aware event that considers current season and time-based factors
   * @param {Object} playerContext - Player context
   * @returns {Object} Generated event with time awareness
   */
  generateTimeAwareEvent(playerContext = {}) {
    const context = this.analyzeContext(playerContext);
    const currentTime = this.getCurrentTime();

    const seasonalMods = currentTime.seasonalModifiers;
    Object.keys(seasonalMods).forEach(key => {
      if (context[key] !== undefined) {
        context[key] *= seasonalMods[key];
      }
    });

    const template = this.selectTemplate(context);

    const scaledChoices = this.scaleEffectsForDifficulty(
      this.generateContextualChoices(template.choices, context),
      context
    );

    return {
      id: `event_${Date.now()}_${this.chance.guid().substring(0, 8)}`,
      title: this.generateDynamicTitle(template, context),
      description: this.generateRichDescription(template, context),
      narrative: template.narrative,
      choices: scaledChoices,
      type: Object.keys(this.templates).find(key => this.templates[key] === template),
      consequence: null,
      context: context,
      urgency: this.calculateUrgency(template, context),
      theme: this.determineTheme(template, context),
      difficulty: this.calculateDifficultyTier(context.power_level || 0),
      timeInfo: currentTime
    };
  }

  /**
   * Register a custom event template
   * @param {string} templateId - Unique identifier for the template
   * @param {Object} template - Event template object
   * @param {string} template.title - Event title
   * @param {string} template.narrative - Event description
   * @param {Array} template.choices - Array of choice objects
   * @param {boolean} override - Whether to override existing template
   * @returns {boolean} Success status
   */
  registerEventTemplate(templateId, template, override = false) {
    if (!templateId || typeof templateId !== 'string') {
      console.warn('Invalid template ID provided');
      return false;
    }

    if (!template || !template.title || !template.narrative || !Array.isArray(template.choices)) {
      console.warn('Invalid template structure. Required: title, narrative, choices[]');
      return false;
    }

    if (this.templates[templateId] && !override) {
      console.warn(`Template '${templateId}' already exists. Use override=true to replace it.`);
      return false;
    }

    for (const choice of template.choices) {
      if (!choice.text || typeof choice.text !== 'string') {
        console.warn(`Invalid choice structure in template '${templateId}': missing 'text'`);
        return false;
      }
    }

    this.templates[templateId] = {
      title: template.title,
      narrative: template.narrative,
      choices: template.choices
    };

    if (!this.customTemplates) {
      this.customTemplates = new Set();
    }
    this.customTemplates.add(templateId);

    return true;
  }

  /**
   * Unregister a custom event template
   * @param {string} templateId - Template ID to remove
   * @returns {boolean} Success status
   */
  unregisterEventTemplate(templateId) {
    if (!this.customTemplates || !this.customTemplates.has(templateId)) {
      console.warn(`Template '${templateId}' is not a registered custom template`);
      return false;
    }

    delete this.templates[templateId];
    this.customTemplates.delete(templateId);
    return true;
  }

  /**
   * Get all registered custom templates
   * @returns {Array} Array of custom template IDs
   */
  getCustomTemplates() {
    return this.customTemplates ? Array.from(this.customTemplates) : [];
  }

  /**
   * Add custom training data for Markov chain generation
   * @param {Array|string} data - Training data (array of strings or single string)
   * @param {string} category - Category name for organization
   * @returns {boolean} Success status
   */
  addCustomTrainingData(data, category) {
    if (category === undefined) category = 'custom';

    if (!data) return false;

    if (!this.customTrainingData) {
      this.customTrainingData = {};
    }

    if (!this.customTrainingData[category]) {
      this.customTrainingData[category] = [];
    }

    const dataArray = Array.isArray(data) ? data : [data];
    const validData = dataArray.filter(function(item) {
      return typeof item === 'string' && item.trim().length > 0;
    });

    if (validData.length === 0) return false;

    this.customTrainingData[category] = this.customTrainingData[category].concat(validData);

    try {
      const allData = this.getCombinedTrainingData();
      this.markovGenerator.addData(allData);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove custom training data
   * @param {string} category - Category to remove (removes all data in category)
   * @returns {boolean} Success status
   */
  removeTrainingData(category) {
    if (!this.customTrainingData || !this.customTrainingData[category]) {
      console.warn(`Training data category '${category}' not found`);
      return false;
    }

    delete this.customTrainingData[category];

    const allData = this.getCombinedTrainingData();
    try {
      this.markovGenerator.addData(allData);
    } catch (error) {
      console.warn('Failed to retrain Markov generator after removal:', error.message);
      return false;
    }

    return true;
  }

  /**
   * Get combined training data (base + custom)
   * @returns {Array} Combined training data array
   * @private
   */
  getCombinedTrainingData() {
    let combinedData = [];

    const themeData = this.getThemeTrainingData(this.theme || 'fantasy', this.culture);
    combinedData.push(...themeData);

    if (this.customTrainingData) {
      Object.values(this.customTrainingData).forEach(categoryData => {
        combinedData.push(...categoryData);
      });
    }

    return combinedData;
  }

  /**
   * Register a custom event chain
   * @param {string} chainId - Unique identifier for the chain
   * @param {Object} chainConfig - Chain configuration
   * @param {string} chainConfig.name - Display name for the chain
   * @param {string} chainConfig.description - Chain description
   * @param {Array} chainConfig.stages - Array of stage objects
   * @param {boolean} override - Whether to override existing chain
   * @returns {boolean} Success status
   */
  registerEventChain(chainId, chainConfig, override = false) {
    if (!chainId || typeof chainId !== 'string') {
      console.warn('Invalid chain ID provided');
      return false;
    }

    if (!chainConfig || !chainConfig.name || !chainConfig.description || !Array.isArray(chainConfig.stages)) {
      console.warn('Invalid chain configuration. Required: name, description, stages[]');
      return false;
    }

    if (this.timeBasedEventChains[chainId] && !override) {
      console.warn(`Chain '${chainId}' already exists. Use override=true to replace it.`);
      return false;
    }

    for (let i = 0; i < chainConfig.stages.length; i++) {
      const stage = chainConfig.stages[i];
      if (!stage.day || !stage.template) {
        console.warn(`Invalid stage ${i} in chain '${chainId}': missing 'day' or 'template'`);
        return false;
      }

      if (!this.templates[stage.template]) {
        console.warn(`Template '${stage.template}' in chain '${chainId}' does not exist`);
        return false;
      }
    }

    this.timeBasedEventChains[chainId] = {
      name: chainConfig.name,
      description: chainConfig.description,
      stages: chainConfig.stages
    };

    if (!this.customChains) {
      this.customChains = new Set();
    }
    this.customChains.add(chainId);

    return true;
  }

  /**
   * Unregister a custom event chain
   * @param {string} chainId - Chain ID to remove
   * @returns {boolean} Success status
   */
  unregisterEventChain(chainId) {
    if (!this.customChains || !this.customChains.has(chainId)) {
      console.warn(`Chain '${chainId}' is not a registered custom chain`);
      return false;
    }

    delete this.timeBasedEventChains[chainId];
    this.customChains.delete(chainId);

    for (const [instanceId, chainData] of this.timeSystem.timeBasedEvents.entries()) {
      if (chainData.chain === this.timeBasedEventChains[chainId]) {
        this.timeSystem.timeBasedEvents.delete(instanceId);
      }
    }

    return true;
  }

  /**
   * Get all registered custom chains
   * @returns {Array} Array of custom chain IDs
   */
  getCustomChains() {
    return this.customChains ? Array.from(this.customChains) : [];
  }

  /**
   * Export all custom content for backup/sharing
   * @returns {Object} Exported custom content
   */
  exportCustomContent() {
    return {
      templates: Array.from(this.customTemplates || []).reduce((obj, id) => {
        obj[id] = this.templates[id];
        return obj;
      }, {}),
      trainingData: this.customTrainingData || {},
      chains: Array.from(this.customChains || []).reduce((obj, id) => {
        obj[id] = this.timeBasedEventChains[id];
        return obj;
      }, {})
    };
  }

  /**
   * Import custom content from export
   * @param {Object} content - Exported custom content
   * @param {boolean} override - Whether to override existing content
   * @returns {Object} Import results
   */
  importCustomContent(content, override = false) {
    const results = {
      templates: { success: 0, failed: 0 },
      trainingData: { success: 0, failed: 0 },
      chains: { success: 0, failed: 0 }
    };

    if (content.templates) {
      Object.entries(content.templates).forEach(([id, template]) => {
        if (this.registerEventTemplate(id, template, override)) {
          results.templates.success++;
        } else {
          results.templates.failed++;
        }
      });
    }

    if (content.trainingData) {
      Object.entries(content.trainingData).forEach(([category, data]) => {
        if (this.addCustomTrainingData(data, category)) {
          results.trainingData.success++;
        } else {
          results.trainingData.failed++;
        }
      });
    }

    if (content.chains) {
      Object.entries(content.chains).forEach(([id, chain]) => {
        if (this.registerEventChain(id, chain, override)) {
          results.chains.success++;
        } else {
          results.chains.failed++;
        }
      });
    }

    return results;
  }

  /**
   * Analyze and enrich player context for sophisticated event generation
   * @private
   */
  analyzeContext(playerContext) {
    const ctx = playerContext || {};

    const context = {
      age: ctx.age || 16,
      wealth: ctx.gold || 0,
      influence: ctx.influence || 0,
      reputation: ctx.reputation || 0,
      career: ctx.career || null,
      skills: ctx.skills || {},
      relationships: ctx.relationships || [],
      location: ctx.location || this.generateLocation(),
      season: ctx.season || this.timeSystem.currentSeason,
      health: ctx.health || 100,
      stress: ctx.stress || 0,
      happiness: ctx.happiness || 50,
      karma: ctx.karma || 0,
      faith: ctx.faith || 0,
      vices: ctx.vices || [],
      secrets: ctx.secrets || [],
      ambitions: ctx.ambitions || []
    };

    context.social_standing = this.calculateSocialStanding(context);
    context.power_level = this.calculatePowerLevel(context);
    context.life_experience = this.calculateLifeExperience(context);

    return context;
  }

  /**
   * Calculate social standing based on various factors
   * @private
   */
  calculateSocialStanding(context) {
    let standing = 0;
    standing += context.influence * 0.4;
    standing += context.reputation * 0.3;
    standing += (context.wealth / 100) * 0.3;

    if (context.career && context.career.toLowerCase().includes('noble')) {
      standing += 20;
    }

    return Math.max(0, Math.min(100, standing));
  }

  /**
   * Calculate overall power level
   * @private
   */
  calculatePowerLevel(context) {
    let power = 0;
    power += context.influence * 0.3;
    power += context.wealth / 100 * 0.2;
    power += Object.values(context.skills).reduce((sum, skill) => sum + skill, 0) / 10 * 0.2;
    power += context.relationships.length * 5 * 0.1;
    power += (100 - context.stress) * 0.2;

    return Math.max(0, power);
  }

  /**
   * Calculate appropriate difficulty tier based on player power level
   * @param {number} powerLevel - Player's calculated power level
   * @returns {string} Difficulty tier ('easy', 'normal', 'hard', 'legendary')
   */
  calculateDifficultyTier(powerLevel) {
    if (powerLevel <= 50) return 'easy';
    if (powerLevel <= 150) return 'normal';
    if (powerLevel <= 300) return 'hard';
    return 'legendary';
  }

  /**
   * Scale event effects based on difficulty and player power level
   * @param {Array} choices - Event choices with effects
   * @param {Object} context - Player context
   * @returns {Array} Scaled choices
   */
  scaleEffectsForDifficulty(choices, context) {
    const powerLevel = context.power_level || 0;
    const difficultyTier = this.calculateDifficultyTier(powerLevel);
    const settings = this.difficultySettings[difficultyTier];

    return choices.map(choice => {
      const scaledChoice = { ...choice };

      if (choice.effect) {
        scaledChoice.effect = { ...choice.effect };

        Object.keys(scaledChoice.effect).forEach(key => {
          const value = scaledChoice.effect[key];
          if (Array.isArray(value)) {
            if (key.includes('gold') || key.includes('influence') || key.includes('reputation') ||
                key.includes('knowledge') || key.includes('karma')) {
              scaledChoice.effect[key] = value.map(v => Math.round(v * settings.rewardMultiplier));
            } else if (key.includes('health') || key.includes('stress')) {
              scaledChoice.effect[key] = value.map(v => Math.round(v * settings.penaltyMultiplier));
            }
          }
        });
      }

      return scaledChoice;
    });
  }

  /**
   * Adjust template weights based on appropriate challenge level
   * @param {Object} baseWeights - Base template weights
   * @param {Object} context - Player context
   * @returns {Object} Adjusted weights
   */
  adjustWeightsForDifficulty(baseWeights, context) {
    const powerLevel = context.power_level || 0;
    const difficultyTier = this.calculateDifficultyTier(powerLevel);

    const challengeRatings = {
      COURT_SCANDAL: 3,
      NOBLE_DUEL: 4,
      THIEVES_GUILD: 5,
      BLACKMAIL_OPPORTUNITY: 4,
      ANCIENT_CURSE: 6,
      GHOSTLY_VISITATION: 5,
      FORBIDDEN_LOVE: 3,
      FAMILY_SECRET: 3,
      LOST_CIVILIZATION: 7,
      BANDIT_KING: 6,
      MARKET_CRASH: 4,
      TRADE_WAR: 5,
      DESERTION_TEMPTATION: 2,
      MERCENARY_CONTRACT: 5
    };

    const adjustedWeights = { ...baseWeights };

    Object.keys(adjustedWeights).forEach(templateKey => {
      const rating = challengeRatings[templateKey] || 5;
      const powerRatio = powerLevel / 100;

      if (rating < powerRatio + 2) {
        adjustedWeights[templateKey] *= 0.5;
      } else if (rating >= powerRatio + 2 && rating <= powerRatio + 5) {
        adjustedWeights[templateKey] *= 1.5;
      } else if (rating > powerRatio + 6) {
        adjustedWeights[templateKey] *= 0.3;
      }
    });

    return adjustedWeights;
  }

  /**
   * Calculate life experience factor
   * @private
   */
  calculateLifeExperience(context) {
    let experience = context.age * 0.5;

    experience += Object.values(context.skills).reduce((sum, skill) => sum + skill, 0) * 0.1;

    experience += context.relationships.length * 2;
    experience += context.ambitions.length * 3;

    return experience;
  }

  /**
   * Generate a random location for context
   * @private
   */
  generateLocation() {
    const locations = [
      'capital', 'border town', 'coastal city', 'mountain village',
      'forest outpost', 'desert caravan stop', 'riverside settlement',
      'island fortress', 'underground city', 'floating market'
    ];
    return this.chance.pickone(locations);
  }

  /**
   * Select the most appropriate template based on rich context analysis
   * @private
   */
  selectTemplate(context) {
    const templateKeys = Object.keys(this.templates);
    const weights = this.calculateTemplateWeights(context, templateKeys);

    const selectedKey = this.chance.weighted(templateKeys, weights);
    return this.templates[selectedKey];
  }

  /**
   * Calculate dynamic weights for template selection based on context
   * @private
   */
  calculateTemplateWeights(context, templateKeys) {
    const baseWeights = {};

    templateKeys.forEach(key => {
      const template = this.templates[key];
      baseWeights[key] = this.getBaseWeightForTemplate(key, context);
    });

    this.applyContextModifiers(baseWeights, context);
    const difficultyAdjustedWeights = this.adjustWeightsForDifficulty(baseWeights, context);

    const totalWeight = Object.values(difficultyAdjustedWeights).reduce((sum, w) => sum + w, 0);
    const normalizedWeights = Object.values(difficultyAdjustedWeights).map(w => w / totalWeight);

    return normalizedWeights;
  }

  /**
   * Get base weight for a template type
   * @private
   */
  getBaseWeightForTemplate(templateKey, context) {
    const weights = {
      COURT_SCANDAL: 0.08,
      NOBLE_DUEL: 0.06,
      THIEVES_GUILD: 0.07,
      BLACKMAIL_OPPORTUNITY: 0.05,
      ANCIENT_CURSE: 0.04,
      GHOSTLY_VISITATION: 0.03,
      FORBIDDEN_LOVE: 0.06,
      FAMILY_SECRET: 0.04,
      LOST_CIVILIZATION: 0.05,
      BANDIT_KING: 0.07,
      MARKET_CRASH: 0.06,
      TRADE_WAR: 0.05,
      DESERTION_TEMPTATION: 0.03,
      MERCENARY_CONTRACT: 0.04
    };

    return weights[templateKey] || 0.05;
  }

  /**
   * Apply context-based modifiers to template weights
   * @private
   */
  applyContextModifiers(weights, context) {

    if (context.career) {
      const career = context.career.toLowerCase();
      if (career.includes('noble') || career.includes('court')) {
        weights.COURT_SCANDAL *= 2.5;
        weights.NOBLE_DUEL *= 2.0;
        weights.FORBIDDEN_LOVE *= 1.8;
      }
      if (career.includes('merchant') || career.includes('trade')) {
        weights.MARKET_CRASH *= 2.2;
        weights.TRADE_WAR *= 2.0;
        weights.BLACKMAIL_OPPORTUNITY *= 1.5;
      }
      if (career.includes('thief') || career.includes('criminal')) {
        weights.THIEVES_GUILD *= 2.5;
        weights.BLACKMAIL_OPPORTUNITY *= 2.0;
      }
      if (career.includes('warrior') || career.includes('knight')) {
        weights.NOBLE_DUEL *= 2.2;
        weights.MERCENARY_CONTRACT *= 1.8;
        weights.DESERTION_TEMPTATION *= 1.5;
      }
    }

    if (context.age < 25) {
      weights.FORBIDDEN_LOVE *= 1.6;
      weights.FAMILY_SECRET *= 1.4;
    } else if (context.age > 50) {
      weights.GHOSTLY_VISITATION *= 1.8;
      weights.FAMILY_SECRET *= 1.6;
    }

    if (context.wealth > 1000) {
      weights.MARKET_CRASH *= 1.8;
      weights.TRADE_WAR *= 1.6;
      weights.BLACKMAIL_OPPORTUNITY *= 1.4;
    }

    if (context.influence > 50) {
      weights.COURT_SCANDAL *= 2.0;
      weights.NOBLE_DUEL *= 1.8;
    }

    if (context.skills.combat > 60) {
      weights.NOBLE_DUEL *= 1.6;
      weights.MERCENARY_CONTRACT *= 1.4;
    }
    if (context.skills.diplomacy > 60) {
      weights.COURT_SCANDAL *= 1.5;
      weights.FORBIDDEN_LOVE *= 1.3;
    }
    if (context.skills.thievery > 60) {
      weights.THIEVES_GUILD *= 1.7;
      weights.BLACKMAIL_OPPORTUNITY *= 1.5;
    }

    if (context.reputation < -20) {
      weights.THIEVES_GUILD *= 1.8;
      weights.BLACKMAIL_OPPORTUNITY *= 2.0;
    }

    if (context.relationships && context.relationships.length > 3) {
      weights.FORBIDDEN_LOVE *= 1.4;
      weights.FAMILY_SECRET *= 1.6;
      weights.COURT_SCANDAL *= 1.3;
    }

    if (context.season === 'winter') {
      weights.GHOSTLY_VISITATION *= 1.5;
      weights.ANCIENT_CURSE *= 1.3;
    }
  }

  /**
   * Generate dynamic, context-aware title
   * @private
   */
  generateDynamicTitle(template, context) {
    const titleModifiers = {
      dramatic: ['Shocking', 'Unbelievable', 'Extraordinary', 'Monumental'],
      urgent: ['Critical', 'Immediate', 'Pressing', 'Urgent'],
      mysterious: ['Enigmatic', 'Puzzling', 'Curious', 'Intriguing'],
      personal: ['Intimate', 'Personal', 'Private', 'Close'],
      dangerous: ['Perilous', 'Dangerous', 'Risky', 'Treacherous']
    };

    let modifierType = 'dramatic';
    const templateKey = Object.keys(this.templates).find(key => this.templates[key] === template);

    if (templateKey.includes('SCANDAL') || templateKey.includes('DUEL') || templateKey.includes('CRASH')) {
      modifierType = 'urgent';
    } else if (templateKey.includes('CURSE') || templateKey.includes('GHOST') || templateKey.includes('SECRET')) {
      modifierType = 'mysterious';
    } else if (templateKey.includes('LOVE') || templateKey.includes('FAMILY')) {
      modifierType = 'personal';
    } else if (templateKey.includes('BANDIT') || templateKey.includes('DESERTION') || templateKey.includes('MERCENARY')) {
      modifierType = 'dangerous';
    }

    const modifier = this.chance.pickone(titleModifiers[modifierType]);
    return `${modifier} ${template.title}`;
  }

  /**
   * Generate rich, contextual description with personality
   * @private
   */
  generateRichDescription(template, context) {
    try {

      let description = template.narrative;

      const generated = this.markovGenerator.generate({
        minLength: 30,
        maxLength: 80,
        allowDuplicates: false,
        maxTries: 5
      });

      if (generated && generated.string &&
          generated.string.length > 40 &&
          generated.string.split(' ').length > 6 &&
          !this.data.some(training => training === generated.string) &&
          this.isInterestingText(generated.string)) {

        description = generated.string + '. ' + description.charAt(0).toLowerCase() + description.slice(1);
      }

      const contextAdditions = this.generateContextAdditions(template, context);
      if (contextAdditions.length > 0) {
        description += ' ' + this.chance.pickone(contextAdditions);
      }

      if (this.chance.bool({ likelihood: 40 })) {
        const consequenceHint = this.generateConsequenceHint(template, context);
        if (consequenceHint) {
          description += ' ' + consequenceHint;
        }
      }

      return description;
    } catch (error) {
      const templateType = this.mapTemplateToType(template.type || Object.keys(this.templates).find(key => this.templates[key] === template));
      return this.getFallbackDescription(templateType);
    }
  }

  /**
   * Generate contextual additions to descriptions
   * @private
   */
  generateContextAdditions(template, context) {
    const additions = [];

    if (context.career) {
      const career = context.career.toLowerCase();
      if (career.includes('noble') || career.includes('court')) {
        additions.push('Your position in court makes this matter particularly sensitive.');
        additions.push('The royal family\'s involvement complicates everything.');
      }
      if (career.includes('merchant')) {
        additions.push('Your business interests are directly affected by this development.');
        additions.push('The merchant guilds are already positioning themselves.');
      }
      if (career.includes('warrior') || career.includes('knight')) {
        additions.push('Your martial prowess could turn the tide of this situation.');
        additions.push('The battlefield calls, and honor demands a response.');
      }
    }

    if (context.age < 25) {
      additions.push('At your young age, this experience could shape your entire future.');
    } else if (context.age > 60) {
      additions.push('With age comes wisdom, but also the weight of past decisions.');
    }

    if (context.relationships && context.relationships.length > 0) {
      additions.push('Your personal connections may influence how this unfolds.');
      additions.push('Someone you know is intimately involved in this matter.');
    }

    if (context.season) {
      const seasonAdditions = {
        winter: 'The harsh winter weather makes resolution all the more urgent.',
        spring: 'Spring\'s renewal brings hope, but also unpredictable change.',
        summer: 'Summer\'s heat mirrors the intensity of the situation.',
        autumn: 'Autumn\'s harvest season reminds us that all things must end.'
      };
      if (seasonAdditions[context.season]) {
        additions.push(seasonAdditions[context.season]);
      }
    }

    return additions;
  }

  /**
   * Generate subtle hints about potential consequences
   * @private
   */
  generateConsequenceHint(template, context) {
    const hints = [
      'The choices you make here will echo through your future.',
      'This decision carries weight beyond what you can immediately see.',
      'Your response will define how others perceive you.',
      'The consequences of this moment will be felt for years to come.',
      'Choose wisely, for the wrong path leads to ruin.',
      'This crossroads will determine your destiny.'
    ];

    const hintChance = Math.min(0.4, (context.influence + Math.abs(context.reputation)) / 200);
    if (this.chance.bool({ likelihood: hintChance * 100 })) {
      return this.chance.pickone(hints);
    }

    return null;
  }

  /**
   * Generate choices that adapt to player context and have meaningful consequences
   * @private
   */
  generateContextualChoices(templateChoices, context) {
    return templateChoices.map(choice => {
      const resolvedChoice = { ...choice };

      resolvedChoice.effect = this.resolveEffects(choice.effect, context);

      resolvedChoice.text = this.enhanceChoiceText(choice.text, context);

      if (choice.consequence) {
        resolvedChoice.consequence = choice.consequence;
      }

      return resolvedChoice;
    });
  }

  /**
   * Resolve effect ranges to specific values based on context
   * @private
   */
  resolveEffects(effectRanges, context) {
    const resolved = {};

    Object.entries(effectRanges).forEach(([key, value]) => {
      if (Array.isArray(value)) {

        let min = value[0];
        let max = value[1];

        const multiplier = this.getContextMultiplier(key, context);
        min = Math.round(min * multiplier);
        max = Math.round(max * multiplier);

        if (min > max) {
          [min, max] = [max, min];
        }

        resolved[key] = this.chance.integer({ min, max });
      } else if (typeof value === 'number') {

        resolved[key] = value;
      } else {

        resolved[key] = value;
      }
    });

    return resolved;
  }

  /**
   * Get context multiplier for effects
   * @private
   */
  getContextMultiplier(effectKey, context) {
    let multiplier = 1.0;

    switch (effectKey) {
      case 'influence':
      case 'reputation':

      if (context.influence > 30) multiplier *= 1.2;
        if (context.reputation > 20) multiplier *= 1.1;
        break;
      case 'gold':

      if (context.wealth > 500) multiplier *= 1.3;
        if (context.wealth < 100) multiplier *= 0.8;
        break;
      case 'health':

        break;
      case 'stress':
      case 'happiness':

      if (context.age > 40) multiplier *= 1.1;
        break;
    }

    return multiplier;
  }

  /**
   * Enhance choice text with contextual details
   * @private
   */
  enhanceChoiceText(baseText, context) {

    const enhancements = [];

    if (context.career && this.chance.bool({ likelihood: 20 })) {
      const career = context.career.toLowerCase();
      if (career.includes('noble')) {
        enhancements.push(' (with noble dignity)');
      } else if (career.includes('merchant')) {
        enhancements.push(' (calculating the profits)');
      } else if (career.includes('warrior')) {
        enhancements.push(' (with martial resolve)');
      }
    }

    if (enhancements.length > 0) {
      return baseText + this.chance.pickone(enhancements);
    }

    return baseText;
  }

  /**
   * Calculate event urgency based on template and context
   * @private
   */
  calculateUrgency(template, context) {
    let urgency = 'normal';

    if (template.title.toLowerCase().includes('critical') ||
        template.title.toLowerCase().includes('urgent') ||
        template.narrative.toLowerCase().includes('immediately')) {
      urgency = 'high';
    }

    if (context.health < 30 || context.wealth < 50) {
      urgency = 'high';
    }

    if (context.influence > 70) {
      urgency = 'high';
    }

    return urgency;
  }

  /**
   * Determine the thematic category of the event
   * @private
   */
  determineTheme(template, context) {
    const templateKey = Object.keys(this.templates).find(key => this.templates[key] === template);

    if (templateKey.includes('COURT') || templateKey.includes('NOBLE')) {
      return 'political';
    } else if (templateKey.includes('THIEF') || templateKey.includes('BLACKMAIL')) {
      return 'criminal';
    } else if (templateKey.includes('CURSE') || templateKey.includes('GHOST')) {
      return 'supernatural';
    } else if (templateKey.includes('LOVE') || templateKey.includes('FAMILY')) {
      return 'personal';
    } else if (templateKey.includes('CIVILIZATION') || templateKey.includes('BANDIT')) {
      return 'adventure';
    } else if (templateKey.includes('MARKET') || templateKey.includes('TRADE')) {
      return 'economic';
    } else if (templateKey.includes('DESERTION') || templateKey.includes('MERCENARY')) {
      return 'military';
    }

    return 'general';
  }

  /**
   * Generate contextual choices with resolved effects
   * @private
   */
  generateChoices(baseChoices, context) {
    return baseChoices.map(choice => ({
      ...choice,
      effect: this.resolveEffect(choice.effect, context)
    }));
  }

  /**
   * Resolve dynamic effects (ranges become specific numbers)
   * @private
   */
  resolveEffect(effect, context) {
    const resolved = {};

    Object.entries(effect).forEach(([key, value]) => {
      if (Array.isArray(value)) {

        resolved[key] = this.chance.integer({ min: value[0], max: value[1] });
      } else {
        resolved[key] = value;
      }
    });

    if (context.wealth >= 1000 && resolved.gold > 0) {
      resolved.gold = Math.floor(resolved.gold * 1.5);
    }

    return resolved;
  }

  /**
   * Generate a random location
   * @private
   */
  generateLocation() {
    const locations = ['village', 'town', 'city', 'castle', 'forest', 'mountains', 'coast', 'desert'];
    return this.chance.pickone(locations);
  }

  /**
   * Map template ID to fallback type
   * @param {string} templateId - Template identifier
   * @returns {string} Fallback type
   * @private
   */
  mapTemplateToType(templateId) {
    if (!templateId) return 'ENCOUNTER';

    const typeMapping = {
      'COURT_SCANDAL': 'ENCOUNTER',
      'NOBLE_DUEL': 'CHALLENGE',
      'FORBIDDEN_LOVE': 'ENCOUNTER',
      'FAMILY_SECRET': 'MYSTERY',

      'THIEVES_GUILD': 'CHALLENGE',
      'BLACKMAIL_OPPORTUNITY': 'OPPORTUNITY',

      'ANCIENT_CURSE': 'MYSTERY',
      'GHOSTLY_VISITATION': 'MYSTERY',

      'LOST_CIVILIZATION': 'MYSTERY',
      'BANDIT_KING': 'CHALLENGE',

      'MARKET_CRASH': 'CHALLENGE',
      'TRADE_WAR': 'CHALLENGE',
      'MERCENARY_CONTRACT': 'OPPORTUNITY',

      'DESERTION_TEMPTATION': 'CHALLENGE'
    };

    return typeMapping[templateId] || 'ENCOUNTER';
  }

  /**
   * Get fallback description if Markov generation fails
   * @private
   */
  getFallbackDescription(templateType) {
    const professions = ['merchant', 'warrior', 'mage', 'noble', 'thief', 'priest', 'blacksmith', 'alchemist'];
    const products = ['sword', 'potion', 'artifact', 'weapon', 'armor', 'tool', 'gem', 'scroll'];
    const locations = ['village', 'town', 'city', 'castle', 'forest', 'mountain', 'ruins'];

    const fallbacks = {
      ENCOUNTER: `A ${this.chance.pickone(professions)} approaches you with an unusual proposition.`,
      OPPORTUNITY: `A rare ${this.chance.pickone(products)} has become available at an exceptional price.`,
      CHALLENGE: `A ${this.chance.pickone(professions)} challenges your position in the community.`,
      MYSTERY: `Strange occurrences have been reported near ${this.chance.pickone(locations)}.`
    };

    return fallbacks[templateType] || fallbacks.ENCOUNTER;
  }

  /**
   * Add custom training data for Markov generation
   * @param {Array} data - Array of strings to train on
   */
  addTrainingData(data) {
    try {
      this.markovGenerator.addData(data);
    } catch (error) {
      console.warn('Failed to add training data:', error.message);
    }
  }

  /**
   * Reset the Markov generator with new data
   * @param {Array} data - Array of strings to train on
   */
  resetTrainingData(data) {
    this.markovGenerator = new SimpleMarkovGenerator({ stateSize: 2 });
    this.addTrainingData(data);
  }


  /**
   * Load default English locale
   * @private
   */
  loadDefaultLocale() {
    this.locales.set('en', {
      templates: {},
      trainingData: [],
      ui: {
        'event.title.default': 'Unexpected Event',
        'event.description.default': 'Something unexpected occurs...',
        'choice.accept': 'Accept',
        'choice.decline': 'Decline',
        'choice.fight': 'Fight',
        'choice.flee': 'Flee',
        'choice.negotiate': 'Negotiate'
      },
      culture: {
        nameFormats: ['western'],
        dateFormats: ['MM/DD/YYYY'],
        currencySymbols: ['$'],
        honorifics: ['Sir', 'Lady', 'Lord']
      }
    });
  }

  /**
   * Load a language pack
   * @param {string} language - Language code
   * @param {Object} languagePack - Language pack data
   */
  loadLanguagePack(language, languagePack) {
    this.locales.set(language, languagePack);
  }

  /**
   * Set the current language
   * @param {string} language - Language code
   */
  setLanguage(language) {
    if (this.locales.has(language)) {
      this.language = language;
    } else {
      console.warn(`Language '${language}' not loaded, staying with '${this.language}'`);
    }
  }

  /**
   * Get translated text
   * @param {string} key - Translation key
   * @param {Object} variables - Substitution variables
   * @returns {string} Translated text
   */
  translate(key, variables = {}) {
    const locale = this.locales.get(this.language) || this.locales.get('en');
    if (!locale || !locale.ui[key]) {
      return key;
    }

    let text = locale.ui[key];
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`{{${varKey}}}`, 'g'), value);
    });

    return text;
  }

  /**
   * Initialize built-in modifiers
   * @private
   */
  initializeBuiltInModifiers() {
    this.modifiers.set('rain', {
      type: 'weather',
      effects: {
        visibility: 0.7,
        movement_penalty: 0.2,
        encounter_rate: 0.8,
        health_drain: 2
      },
      text_modifiers: {
        atmosphere: 'dismal',
        add_descriptors: ['wet', 'rainy']
      }
    });

    this.modifiers.set('storm', {
      type: 'weather',
      effects: {
        visibility: 0.4,
        movement_penalty: 0.5,
        encounter_rate: 1.3,
        health_drain: 5
      },
      text_modifiers: {
        atmosphere: 'chaotic',
        add_descriptors: ['thunderous', 'tempestuous']
      }
    });

    this.modifiers.set('winter', {
      type: 'season',
      effects: {
        cold_modifier: 1.5,
        movement_penalty: 0.2
      },
      text_modifiers: {
        add_descriptors: ['frozen', 'harsh'],
        atmosphere: 'bleak'
      }
    });

    this.modifiers.set('summer', {
      type: 'season',
      effects: {
        heat_modifier: 1.3,
        energy_bonus: 10
      },
      text_modifiers: {
        add_descriptors: ['sunny', 'warm'],
        atmosphere: 'energetic'
      }
    });
  }

  /**
   * Activate environmental modifiers
   * @param {Object} context - Environmental context
   */
  setEnvironmentalContext(context) {
    if (!this.enableModifiers) return;

    this.activeModifiers.clear();

    if (context.weather && this.modifiers.has(context.weather)) {
      this.activeModifiers.add(context.weather);
    }

    if (context.season && this.modifiers.has(context.season)) {
      this.activeModifiers.add(context.season);
    }
  }

  /**
   * Apply active modifiers to an event
   * @param {Object} event - Event to modify
   * @returns {Object} Modified event
   */
  applyModifiers(event) {
    if (!this.enableModifiers || this.activeModifiers.size === 0) {
      return event;
    }

    let modifiedEvent = { ...event };

    const modifierOrder = ['storm', 'rain', 'winter', 'summer', 'spring', 'autumn'];
    const orderedModifiers = Array.from(this.activeModifiers).sort((a, b) => {
      const aIndex = modifierOrder.indexOf(a);
      const bIndex = modifierOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    for (const modifierId of orderedModifiers) {
      const modifier = this.modifiers.get(modifierId);
      if (modifier) {
        modifiedEvent = this.applySingleModifier(modifiedEvent, modifier);
      }
    }

    return modifiedEvent;
  }

  /**
   * Apply a single modifier to an event
   * @private
   * @param {Object} event - Event to modify
   * @param {Object} modifier - Modifier to apply
   * @returns {Object} Modified event
   */
  applySingleModifier(event, modifier) {
    const modifiedEvent = { ...event };

    if (modifier.effects && modifiedEvent.choices) {
      modifiedEvent.choices = modifiedEvent.choices.map(choice => {
        const modifiedChoice = { ...choice, effect: { ...choice.effect } };

        if (modifier.effects.movement_penalty && modifiedChoice.effect.movement !== undefined) {
          modifiedChoice.effect.movement *= (1 - modifier.effects.movement_penalty);
        }

        if (modifier.effects.health_drain) {
          modifiedChoice.effect.health = (modifiedChoice.effect.health || 0) - modifier.effects.health_drain;
        }

        if (modifier.effects.cold_modifier && modifiedChoice.effect.health !== undefined) {
          modifiedChoice.effect.health = Math.floor(modifiedChoice.effect.health * modifier.effects.cold_modifier);
        }

        return modifiedChoice;
      });
    }

    if (modifier.text_modifiers) {
      if (modifier.text_modifiers.atmosphere) {
        const atmospheres = {
          'dismal': ' under gloomy skies',
          'chaotic': ' amidst the chaos',
          'bleak': ' in the bleak cold',
          'energetic': ' with vibrant energy'
        };
        const atmosphereText = atmospheres[modifier.text_modifiers.atmosphere];
        if (atmosphereText && !modifiedEvent.description.includes(atmosphereText)) {
          modifiedEvent.description += atmosphereText;
        }
      }
    }

    return modifiedEvent;
  }

  /**
   * Register an event dependency
   * @param {string} eventId - Event identifier
   * @param {Object} dependencyConfig - Dependency configuration
   */
  registerEventDependency(eventId, dependencyConfig) {
    if (!this.enableDependencies) {
      console.warn('Dependencies feature is disabled');
      return;
    }
    this.dependencies.set(eventId, dependencyConfig);
  }

  /**
   * Check if event dependencies are met
   * @param {string} eventId - Event identifier
   * @param {Object} gameState - Current game state
   * @returns {boolean} True if dependencies are met
   */
  checkEventDependencies(eventId, gameState) {
    if (!this.enableDependencies) return true;

    const dependency = this.dependencies.get(eventId);
    if (!dependency) return true;

    return this.evaluateDependencyCondition(dependency, gameState);
  }

  /**
   * Evaluate a dependency condition
   * @private
   * @param {Object} condition - Condition to evaluate
   * @param {Object} gameState - Current game state
   * @returns {boolean} Evaluation result
   */
  evaluateDependencyCondition(condition, gameState) {
    if (condition.operator) {
      return this.evaluateDependencyOperator(condition, gameState);
    }

    return this.evaluateSingleDependency(condition, gameState);
  }

  /**
   * Evaluate operator-based dependency conditions
   * @private
   * @param {Object} condition - Operator condition
   * @param {Object} gameState - Current game state
   * @returns {boolean} Evaluation result
   */
  evaluateDependencyOperator(condition, gameState) {
    const { operator, conditions } = condition;

    switch (operator.toUpperCase()) {
      case 'AND':
        return conditions.every(cond => this.evaluateDependencyCondition(cond, gameState));
      case 'OR':
        return conditions.some(cond => this.evaluateDependencyCondition(cond, gameState));
      default:
        return false;
    }
  }

  /**
   * Evaluate a single dependency condition
   * @private
   * @param {Object} condition - Single condition
   * @param {Object} gameState - Current game state
   * @returns {boolean} Evaluation result
   */
  evaluateSingleDependency(condition, gameState) {
    const { type } = condition;

    switch (type) {
      case 'event_completed':
        const completedEvents = gameState.completedEvents || new Set();
        return condition.eventIds ?
          condition.eventIds.every(id => completedEvents.has(id)) :
          completedEvents.has(condition.eventId);

      case 'stat_requirement':
        const playerStats = gameState.player || {};
        const statValue = playerStats[condition.stat] || 0;
        const minReq = condition.min || 0;
        const maxReq = condition.max;
        return statValue >= minReq && (maxReq === undefined || statValue <= maxReq);

      default:
        return false;
    }
  }

  /**
   * Initialize relationship rules
   * @private
   */
  initializeRelationshipRules() {
    this.relationshipRules = new Map();
    this.relationshipRules.set('help_combat', { change: 15, reason: 'aided in battle' });
    this.relationshipRules.set('save_life', { change: 25, reason: 'life saved' });
    this.relationshipRules.set('betray_trust', { change: -30, reason: 'betrayed trust' });
  }

  /**
   * Add an NPC to the relationship system
   * @param {Object} npcConfig - NPC configuration
   */
  addNPC(npcConfig) {
    if (!this.enableRelationships) {
      console.warn('Relationships feature is disabled');
      return;
    }

    this.relationships.set(npcConfig.id, {
      id: npcConfig.id,
      name: npcConfig.name,
      type: npcConfig.type,
      relationships: new Map(),
      history: [],
      createdAt: Date.now()
    });
  }

  /**
   * Update NPC relationship
   * @param {string} npcId - NPC identifier
   * @param {string} targetId - Target NPC (usually player)
   * @param {number} change - Relationship change
   * @param {string} reason - Reason for change
   */
  updateRelationship(npcId, targetId, change, reason) {
    if (!this.enableRelationships) return;

    const npc = this.relationships.get(npcId);
    if (!npc) return;

    if (!npc.relationships.has(targetId)) {
      npc.relationships.set(targetId, { strength: 0, type: 'acquaintance' });
    }

    const relationship = npc.relationships.get(targetId);
    relationship.strength = Math.max(-100, Math.min(100, relationship.strength + change));

    npc.history.push({
      timestamp: Date.now(),
      targetId,
      change,
      newStrength: relationship.strength,
      reason
    });
  }

  /**
   * Apply relationship evolution rule
   * @param {string} npcId - NPC affected
   * @param {string} targetId - Target NPC
   * @param {string} ruleId - Evolution rule
   */
  applyRelationshipRule(npcId, targetId, ruleId) {
    if (!this.enableRelationships) return;

    const rule = this.relationshipRules.get(ruleId);
    if (rule) {
      this.updateRelationship(npcId, targetId, rule.change, rule.reason);
    }
  }

  /**
   * Get relationship data between two NPCs
   * @param {string} npcId - NPC identifier
   * @param {string} targetId - Target NPC
   * @returns {Object} Relationship data or null
   */
  getRelationship(npcId, targetId) {
    if (!this.enableRelationships) return null;
    const npc = this.relationships.get(npcId);
    if (!npc) return null;
    return npc.relationships.get(targetId) || null;
  }

  /**
   * Enhanced event generation with all features
   * @param {Object} context - Generation context
   * @returns {Object} Generated event
   */
  generateEnhancedEvent(context = {}) {
    const event = this.generateEvent(context.player || context);

    let enhancedEvent = event;

    if (this.enableModifiers) {
      this.setEnvironmentalContext(context.environment || {});
      enhancedEvent = this.applyModifiers(event);
    }

    if (this.enableDependencies && context.gameState) {
    }

    if (this.enableRelationships && context.player) {
      enhancedEvent = this.addRelationshipContext(enhancedEvent, context.player);
    }

    return enhancedEvent;
  }

  /**
   * Get relationship data between two NPCs
   * @param {string} npcId - NPC identifier
   * @param {string} targetId - Target NPC
   * @returns {Object} Relationship data or null
   */
  getRelationship(npcId, targetId) {
    if (!this.enableRelationships) return null;
    const npc = this.relationships.get(npcId);
    if (!npc) return null;
    return npc.relationships.get(targetId) || null;
  }

  /**
   * Get relationship summary for an NPC
   * @param {string} npcId - NPC identifier
   * @returns {Object} Relationship summary
   */
  getRelationshipSummary(npcId) {
    if (!this.enableRelationships) return { totalRelationships: 0, averageStrength: 0, allyCount: 0, enemyCount: 0, neutralCount: 0 };

    const npc = this.relationships.get(npcId);
    if (!npc) return { totalRelationships: 0, averageStrength: 0, allyCount: 0, enemyCount: 0, neutralCount: 0 };

    const relationships = Array.from(npc.relationships.values());
    const summary = {
      totalRelationships: relationships.length,
      averageStrength: 0,
      allyCount: 0,
      enemyCount: 0,
      neutralCount: 0
    };

    if (relationships.length > 0) {
      const totalStrength = relationships.reduce((sum, rel) => sum + rel.strength, 0);
      summary.averageStrength = totalStrength / relationships.length;

      relationships.forEach(rel => {
        if (rel.strength > 50) summary.allyCount++;
        else if (rel.strength < -30) summary.enemyCount++;
        else summary.neutralCount++;
      });
    }

    return summary;
  }

  /**
   * Get relationship network around an NPC
   * @param {string} npcId - Central NPC
   * @param {number} depth - Network depth (default: 1)
   * @returns {Object} Relationship network
   */
  getRelationshipNetwork(npcId, depth = 1) {
    if (!this.enableRelationships) return { nodes: new Map(), edges: [] };

    const network = {
      center: npcId,
      nodes: new Map(),
      edges: []
    };

    const visited = new Set();
    const queue = [{ id: npcId, currentDepth: 0 }];

    while (queue.length > 0) {
      const { id, currentDepth } = queue.shift();

      if (visited.has(id) || currentDepth > depth) continue;
      visited.add(id);

      const npc = this.relationships.get(id);
      if (!npc) continue;

      network.nodes.set(id, {
        id,
        name: npc.name,
        type: npc.type,
        relationshipCount: npc.relationships.size
      });

      for (const [targetId, relationship] of npc.relationships) {
        network.edges.push({
          source: id,
          target: targetId,
          type: relationship.type,
          strength: relationship.strength,
          trust: relationship.trust || 50,
          respect: relationship.respect || 50
        });

        if (!visited.has(targetId) && currentDepth < depth) {
          queue.push({ id: targetId, currentDepth: currentDepth + 1 });
        }
      }
    }

    return network;
  }

  /**
   * Register a custom modifier
   * @param {string} modifierId - Modifier identifier
   * @param {Object} modifierConfig - Modifier configuration
   */
  registerModifier(modifierId, modifierConfig) {
    if (!this.enableModifiers) {
      console.warn('Modifiers feature is disabled');
      return;
    }
    this.modifiers.set(modifierId, {
      id: modifierId,
      ...modifierConfig,
      registeredAt: Date.now()
    });
  }

  /**
   * Get system status information
   * @returns {Object} System status
   */
  getSystemStatus() {
    return {
      version: '2.0.0',
      language: this.language,
      availableLanguages: Array.from(this.locales.keys()),
      modifiersEnabled: this.enableModifiers,
      relationshipsEnabled: this.enableRelationships,
      dependenciesEnabled: this.enableDependencies,
      totalNPCs: this.enableRelationships ? this.relationships.size : 0,
      activeModifiers: this.enableModifiers ? Array.from(this.activeModifiers) : [],
      totalLocales: this.locales.size,
      timeSystem: {
        currentDay: this.timeSystem.currentDay,
        currentSeason: this.timeSystem.currentSeason
      }
    };
  }

  /**
   * Add relationship context to event
   * @private
   * @param {Object} event - Event to enhance
   * @param {Object} player - Player data
   * @returns {Object} Enhanced event
   */
  addRelationshipContext(event, player) {
    const enhancedEvent = { ...event };

    if (event.npcs && event.npcs.length > 0) {
      event.npcs.forEach(npcId => {
        const npc = this.relationships.get(npcId);
        if (npc) {
          const playerRel = npc.relationships.get('player');
          if (playerRel && playerRel.strength > 50) {
            enhancedEvent.description = enhancedEvent.description.replace(
              new RegExp(npcId, 'gi'),
              `your ally ${npcId}`
            );
          }
        }
      });
    }

    return enhancedEvent;
  }
}

function generateRPGEvent(playerContext = {}) {
  const generator = new RPGEventGenerator();
  return generator.generateEvent(playerContext);
}

module.exports = {
  RPGEventGenerator: RPGEventGenerator,
  generateRPGEvent: generateRPGEvent
};
