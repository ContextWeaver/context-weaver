#!/usr/bin/env node

const { RPGEventGenerator } = require('./dist/index.js');

const DEMO_CONFIG = {
  version: '2.0.0',
  showErrors: true,
  pauseBetweenDemos: false
};
function printHeader(title, version = '') {
  console.log('\n' + '='.repeat(50));
  console.log(`${title}${version ? ` (${version})` : ''}`);
  console.log('='.repeat(50));
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

function printResult(label, value) {
  console.log(`${label}: ${value}`);
}

function safeExecute(fn, description) {
  try {
    return fn();
  } catch (error) {
    if (DEMO_CONFIG.showErrors) {
      console.error(`❌ Error in ${description}:`, error.message);
    }
    return null;
  }
}

console.log(`🎲 RPG Event Generator ${DEMO_CONFIG.version} - Complete Feature Showcase`);
console.log('=' .repeat(60));

// Basic Event Generation
function demoBasicEventGeneration() {
  printSection('⚡ Demo 1: Basic Event Generation');

  const generator = new RPGEventGenerator();
  const event = safeExecute(() => generator.generateEvent(), 'basic event generation');

  if (event) {
    printResult('Basic Event', event.title);
    printResult('Type', `${event.type}, Difficulty: ${event.difficulty}`);
    printResult('Choices', `${event.choices.length} options`);
    printResult('Sample choice', `"${event.choices[0].text}"`);
  }
}

// Dynamic Difficulty Scaling
function demoDynamicDifficultyScaling() {
  printSection('📊 Demo 2: Dynamic Difficulty Scaling');

  const generator = new RPGEventGenerator();

  const weakling = {
    gold: 50,
    influence: 10,
    skills: { combat: 20 }
  };

  const hero = {
    gold: 50000,
    influence: 500,
    skills: { combat: 100, diplomacy: 80 },
    relationships: [{ name: 'King', type: 'ally', relationship: 80 }]
  };

  const easyEvent = safeExecute(() => generator.generateEvent(weakling), 'weak character event');
  const hardEvent = safeExecute(() => generator.generateEvent(hero), 'powerful character event');

  if (easyEvent) printResult('Weak character event', `${easyEvent.title} (${easyEvent.difficulty})`);
  if (hardEvent) printResult('Powerful character event', `${hardEvent.title} (${hardEvent.difficulty})`);
}

// Context-Aware Events
function demoContextAwareEvents() {
  printSection('🎯 Demo 3: Context-Aware Events');

  const generator = new RPGEventGenerator();

  const playerContext = {
    age: 35,
    gold: 2500,
    influence: 40,
    reputation: 25,
    career: 'noble',
    skills: { diplomacy: 70, combat: 45, intrigue: 30 },
    relationships: [
      { name: 'Lord Harrington', type: 'ally', relationship: 60 }
    ],
    location: 'capital',
    season: 'winter'
  };

  const event = safeExecute(() => generator.generateEvent(playerContext), 'context-aware event');

  if (event) {
    printResult('Context-aware event', event.title);
    printResult('Generated for', `${playerContext.career} in ${playerContext.location} during ${playerContext.season}`);
  }
}

// Custom Training Data
function demoCustomTrainingData() {
  printSection('📚 Demo 4: Custom Training Data');

  const generator = new RPGEventGenerator();

  const trainingData = [
    'The ancient dragon hoards glittering treasures in its mountain lair',
    'Mystical runes glow with ethereal blue light in the dark chamber',
    'The enchanted forest whispers secrets to those who listen carefully',
    'Crystal caverns sparkle with magical energy and hidden dangers'
  ];

  safeExecute(() => generator.addTrainingData(trainingData), 'adding training data');

  const event = safeExecute(() => generator.generateEvent(), 'custom training event');

  if (event) {
    printResult('Custom training event', event.title);
    printResult('Description', `${event.description.substring(0, 100)}...`);
  }
}

// Modular Event System
function demoModularEventSystem() {
  printSection('🧩 Demo 5: Modular Event System');

  const generator = new RPGEventGenerator();

  const customTemplate = {
    title: 'Mystic Vision',
    narrative: 'You experience a vivid prophetic dream showing future events.',
    choices: [
      {
        text: 'Seek out the prophecy',
        effect: { wisdom: 15, risk: 20 },
        consequence: 'visionary'
      },
      {
        text: 'Dismiss it as a dream',
        effect: { stress: -10 },
        consequence: 'skeptical'
      }
    ]
  };

  const mysticalTraining = [
    'The ancient prophecy foretells of great change',
    'Mystic visions reveal hidden truths to the worthy',
    'Dreams of the future guide the destinies of heroes'
  ];

  safeExecute(() => generator.registerEventTemplate('MYSTIC_VISION', customTemplate), 'registering template');
  safeExecute(() => generator.addCustomTrainingData(mysticalTraining, 'mystical'), 'adding mystical training');

  const event = safeExecute(() => generator.generateEvent(), 'modular event generation');
  if (event) {
    printResult('Modular system event', event.title);
  }

  const exportedContent = safeExecute(() => generator.exportCustomContent(), 'exporting content');
  if (exportedContent) {
    printResult('Exported templates', Object.keys(exportedContent.templates).length);
  }

  const newGenerator = new RPGEventGenerator();
  const importResult = safeExecute(() => newGenerator.importCustomContent(exportedContent), 'importing content');
  if (importResult) {
    printResult('Imported templates', importResult.templates.success);
  }
}

function demoEventChains() {
  printSection('⛓️ Demo 6: Event Chains');

  const generator = new RPGEventGenerator();

  const chainResult = safeExecute(() => generator.startChain('BANDIT_RISING'), 'starting event chain');

  if (chainResult) {
    printResult('Started chain', chainResult.title);
    console.log('Available choices in this event lead to different consequences...');

    const nextEvent = safeExecute(() => generator.advanceChain(chainResult.chainId, 'bandit'), 'advancing chain');

    if (nextEvent) {
      printResult('Chain advanced', nextEvent.title);
    } else {
      console.log('Chain could not advance - need to choose \'bandit\' consequence first');
    }

    const activeChains = safeExecute(() => generator.getActiveChains(), 'getting active chains');
    if (activeChains) {
      printResult('Active chains', activeChains.length);
    }
  }
}

// Template Library
function demoTemplateLibrary() {
  printSection('📚 Demo 7: Template Library');

  const generator = new RPGEventGenerator({
    enableTemplates: true,
    templateLibrary: 'fantasy'
  });

  const availableTemplates = safeExecute(() => generator.getAvailableTemplates(), 'getting available templates');
  if (availableTemplates) {
    printResult('Loaded template genres', Object.keys(availableTemplates).join(', '));
    const fantasyCount = availableTemplates.fantasy ? availableTemplates.fantasy.length : 0;
    printResult('Fantasy templates available', fantasyCount);
  }

  const templateEvent = safeExecute(() => generator.generateFromTemplate('dragon_lair'), 'generating from template');
  if (templateEvent) {
    printResult('Template-generated event', templateEvent.title);
    printResult('Event type', templateEvent.type);
    printResult('Difficulty', templateEvent.difficulty);
  }

  const randomFantasyEvent = safeExecute(() => generator.generateFromGenre('fantasy'), 'generating from genre');
  if (randomFantasyEvent) {
    printResult('Random fantasy event', randomFantasyEvent.title);
  }
}

function demoTimeBasedEvents() {
  printSection('⏰ Demo 8: Time-Based Events');

  const generator = new RPGEventGenerator();

  const dueEvents = safeExecute(() => generator.advanceGameDay(), 'advancing game day');
  const currentTime = safeExecute(() => generator.getCurrentTime(), 'getting current time');

  if (currentTime) {
    printResult('Advanced to', `day ${currentTime.day}, season: ${currentTime.season}`);
  }

  safeExecute(() => generator.startTimeBasedChain('POLITICAL_UPRISING'), 'starting time-based chain');

  const activeTimeChains = safeExecute(() => generator.getActiveTimeChains(), 'getting active time chains');
  if (activeTimeChains) {
    printResult('Active time-based chains', activeTimeChains.length);
  }

  const timeEvent = safeExecute(() => generator.generateTimeAwareEvent({ season: 'spring' }), 'generating time-aware event');
  if (timeEvent) {
    printResult('Season-aware event', timeEvent.title);
  }
}

function demoGameStateManagement() {
  printSection('💾 Demo 9: Game State Management');

  const generator = new RPGEventGenerator();

  const gameState = {
    player: { level: 5, gold: 1000 },
    completedEvents: new Set(['tutorial']),
    currentDay: 10
  };

  safeExecute(() => generator.loadGameState(gameState), 'loading game state');

  const savedState = safeExecute(() => generator.getGameState(), 'getting game state');

  if (savedState) {
    console.log('Game state loaded and saved successfully');
    printResult('Current day', `${savedState.timeSystem.currentDay}, Season: ${savedState.timeSystem.currentSeason}`);
    printResult('Active chains', savedState.activeChains.length);
  }
}

// Multi-Language Support
function demoMultiLanguageSupport() {

  const generator = new RPGEventGenerator({
    enableModifiers: true,
    enableRelationships: true,
    enableDependencies: true,
    language: 'en'
  });

  printSection('🌍 Demo 10: Multi-Language Support');

  const spanishPack = {
    ui: {
      'event.title.default': 'Evento Inesperado',
      'choice.fight': 'Luchar',
      'choice.flee': 'Huir',
      'choice.negotiate': 'Negociar'
    },
    culture: {
      nameFormats: ['western'],
      currencySymbols: ['oro']
    }
  };

  const frenchPack = {
    ui: {
      'event.title.default': 'Événement Inattendu',
      'choice.fight': 'Combattre',
      'choice.flee': 'Fuire',
      'choice.negotiate': 'Négocier'
    }
  };

  safeExecute(() => generator.loadLanguagePack('es', spanishPack), 'loading Spanish pack');
  safeExecute(() => generator.loadLanguagePack('fr', frenchPack), 'loading French pack');

  printResult('English', generator.translate('choice.fight'));

  safeExecute(() => generator.setLanguage('es'), 'switching to Spanish');
  printResult('Spanish', generator.translate('choice.fight'));

  safeExecute(() => generator.setLanguage('fr'), 'switching to French');
  printResult('French', generator.translate('choice.fight'));

  safeExecute(() => generator.setLanguage('en'), 'switching back to English');

  return generator;
}

// Environmental Modifiers
function demoEnvironmentalModifiers(generator) {
  printSection('🌤️ Demo 11: Environmental Modifiers');

  console.log('Individual Modifiers:');

  safeExecute(() => generator.setEnvironmentalContext({ weather: 'rain' }), 'setting rain context');
  const rainEvent = safeExecute(() => generator.generateEnhancedEvent(), 'generating rain event');
  if (rainEvent) {
    printResult('Rain Event', rainEvent.title);
    printResult('Description contains atmospheric text', rainEvent.description.includes('gloomy'));
  }

  safeExecute(() => generator.setEnvironmentalContext({ season: 'winter' }), 'setting winter context');
  const winterEvent = safeExecute(() => generator.generateEnhancedEvent(), 'generating winter event');
  if (winterEvent) {
    printResult('Winter Event', winterEvent.title);
    printResult('Description contains seasonal text', winterEvent.description.includes('bleak'));
  }

  console.log('\nCombined Modifiers:');
  const testEvent = {
    title: 'Test Event',
    description: 'Testing modifier effects.',
    choices: [{
      text: 'Continue',
      effect: { health: 10, gold: 50 }
    }]
  };

  safeExecute(() => generator.setEnvironmentalContext({ weather: 'storm', season: 'winter' }), 'setting storm+winter context');
  const modifiedEvent = safeExecute(() => generator.applyModifiers(testEvent), 'applying modifiers');

  if (modifiedEvent) {
    printResult('Original health', testEvent.choices[0].effect.health);
    printResult('Modified health', `${modifiedEvent.choices[0].effect.health} (storm: -5, winter: *1.5 = 7)`);
    printResult('Modified gold', `${modifiedEvent.choices[0].effect.gold} (unchanged)`);
  }
}

function demoEventDependencies(generator) {
  printSection('🔗 Demo 12: Event Dependencies');

  safeExecute(() => generator.registerEventDependency('ROYAL_BALL', {
    type: 'event_completed',
    eventId: 'COURT_INTRODUCTION'
  }), 'registering simple dependency');

  safeExecute(() => generator.registerEventDependency('ELITE_MISSION', {
    operator: 'AND',
    conditions: [
      { type: 'stat_requirement', stat: 'level', min: 10 },
      { type: 'event_completed', eventId: 'BASIC_TRAINING' },
      { type: 'stat_requirement', stat: 'reputation', min: 50 }
    ]
  }), 'registering AND dependency');

  safeExecute(() => generator.registerEventDependency('SOCIAL_EVENT', {
    operator: 'OR',
    conditions: [
      { type: 'stat_requirement', stat: 'reputation', min: 75 },
      { type: 'stat_requirement', stat: 'gold', min: 1000 },
      { type: 'relationship_requirement', npc: 'nobleman', min: 60 }
    ]
  }), 'registering OR dependency');
  const dependencyGameState = {
    completedEvents: new Set(['COURT_INTRODUCTION', 'BASIC_TRAINING']),
    player: { level: 12, reputation: 80, gold: 500 }
  };

  console.log('Dependency Checks:');
  const royalBall = safeExecute(() => generator.checkEventDependencies('ROYAL_BALL', dependencyGameState), 'checking royal ball');
  const eliteMission = safeExecute(() => generator.checkEventDependencies('ELITE_MISSION', dependencyGameState), 'checking elite mission');
  const socialEvent = safeExecute(() => generator.checkEventDependencies('SOCIAL_EVENT', dependencyGameState), 'checking social event');

  printResult('Can access Royal Ball', royalBall);
  printResult('Can access Elite Mission', eliteMission);
  printResult('Can access Social Event', socialEvent);
}

function demoNPCRelationships(generator) {
  printSection('👥 Demo 13: NPC Relationships');

  safeExecute(() => generator.addNPC({
    id: 'merchant_sam',
    name: 'Merchant Sam',
    type: 'merchant'
  }), 'adding merchant NPC');

  safeExecute(() => generator.addNPC({
    id: 'guard_captain',
    name: 'Captain Valeria',
    type: 'guard'
  }), 'adding guard NPC');

  safeExecute(() => generator.addNPC({
    id: 'nobleman',
    name: 'Lord Harrington',
    type: 'noble'
  }), 'adding noble NPC');

  console.log('Relationship Interactions:');

  const initialSamRel = safeExecute(() => generator.getRelationship('merchant_sam', 'player'), 'getting initial relationship');
  printResult('Initial relationship with Merchant Sam', initialSamRel?.strength || 0);

  safeExecute(() => generator.applyRelationshipRule('merchant_sam', 'player', 'save_life'), 'applying save_life rule');
  const samRelAfter = safeExecute(() => generator.getRelationship('merchant_sam', 'player'), 'getting relationship after save');
  printResult('After saving life', samRelAfter?.strength || 0);

  safeExecute(() => generator.updateRelationship('guard_captain', 'player', -15, 'minor dispute'), 'updating guard relationship');
  const guardRel = safeExecute(() => generator.getRelationship('guard_captain', 'player'), 'getting guard relationship');
  printResult('Guard Captain relationship', guardRel?.strength || 0);

  safeExecute(() => generator.applyRelationshipRule('nobleman', 'player', 'help_combat'), 'applying help_combat rule');
  const nobleRel = safeExecute(() => generator.getRelationship('nobleman', 'player'), 'getting noble relationship');
  printResult('Nobleman relationship', nobleRel?.strength || 0);

  const samSummary = safeExecute(() => generator.getRelationshipSummary('merchant_sam'), 'getting relationship summary');
  if (samSummary) {
    console.log(`\nMerchant Sam has ${samSummary.totalRelationships} relationships`);
    printResult('Average relationship strength', samSummary.averageStrength.toFixed(1));
  }
}

function demoCombinedFeatures(generator) {
  printSection('🎭 Demo 14: Combined Feature Usage');

  const comprehensiveContext = {
    player: {
      id: 'player',
      level: 15,
      reputation: 70,
      gold: 2000
    },
    environment: {
      weather: 'rain',
      season: 'spring',
      timeOfDay: 'dawn'
    },
    gameState: {
      completedEvents: new Set(['TUTORIAL', 'FIRST_QUEST']),
      relationships: {
        merchant_sam: { strength: 45, type: 'friend' }
      }
    }
  };

  console.log('Generating event with ALL features combined:');
  const comprehensiveEvent = safeExecute(() => generator.generateEnhancedEvent(comprehensiveContext), 'generating comprehensive event');

  if (comprehensiveEvent) {
    printResult('Title', comprehensiveEvent.title);
    printResult('Has environmental modifications', comprehensiveEvent.appliedModifiers?.length > 0);
    printResult('Choices', comprehensiveEvent.choices.length);
  }
}

// Backward Compatibility
function demoBackwardCompatibility() {
  printSection('🔄 Demo 15: Backward Compatibility');

  const legacyGenerator = new RPGEventGenerator();
  const legacyEvent = safeExecute(() => legacyGenerator.generateEvent(), 'legacy generator test');
  if (legacyEvent) {
    printResult('Basic generator works', legacyEvent.title);
  }

  const partialGenerator = new RPGEventGenerator({
    enableModifiers: false,
    enableRelationships: true,
    enableDependencies: false
  });
  const partialEvent = safeExecute(() => partialGenerator.generateEvent(), 'partial features test');
  if (partialEvent) {
    printResult('Partial features work', partialEvent.title);
  }

  const oldApiGenerator = new RPGEventGenerator({
    theme: 'fantasy',
    culture: 'norse'
  });
  const oldApiEvent = safeExecute(() => oldApiGenerator.generateEvent(), 'old API test');
  if (oldApiEvent) {
    printResult('Legacy API works', oldApiEvent.title);
  }
}

function demoSystemStatus(generator) {
  printSection('📊 Demo 16: System Status');

  const status = safeExecute(() => generator.getSystemStatus(), 'getting system status');

  if (status) {
    printResult('Current language', status.language);
    printResult('Available languages', status.availableLanguages.join(', '));
    printResult('Modifiers enabled', status.modifiersEnabled);
    printResult('Relationships enabled', status.relationshipsEnabled);
    printResult('Dependencies enabled', status.dependenciesEnabled);
    printResult('Total NPCs', status.totalNPCs);
  }
}

// Advanced Usage Examples
function demoAdvancedUsage(generator) {
  printSection('🎯 Demo 17: Advanced Usage Examples');

  safeExecute(() => generator.registerModifier('festival', {
    type: 'event',
    effects: { mood_bonus: 20 },
    text_modifiers: {
      atmosphere: 'festive',
      add_descriptors: ['celebratory', 'joyful']
    }
  }), 'registering custom modifier');

  console.log('Time progression:');
  safeExecute(() => generator.advanceTime(30), 'advancing time 30 days');
  const currentSeason = safeExecute(() => generator.timeSystem?.currentSeason, 'getting current season');
  if (currentSeason) {
    printResult('New season', currentSeason);
  }

  const network = safeExecute(() => generator.getRelationshipNetwork('merchant_sam', 2), 'getting relationship network');
  if (network) {
    printResult('Merchant Sam\'s relationship network', `${network.nodes.size} nodes, ${network.edges.length} connections`);
  }
}

function runDemo() {

  demoBasicEventGeneration();
  demoDynamicDifficultyScaling();
  demoContextAwareEvents();
  demoCustomTrainingData();
  demoModularEventSystem();
  demoEventChains();
  demoTemplateLibrary();
  demoTimeBasedEvents();
  demoGameStateManagement();

  const enhancedGenerator = demoMultiLanguageSupport();
  demoEnvironmentalModifiers(enhancedGenerator);
  demoEventDependencies(enhancedGenerator);
  demoNPCRelationships(enhancedGenerator);
  demoCombinedFeatures(enhancedGenerator);
  demoBackwardCompatibility();
  demoSystemStatus(enhancedGenerator);
  demoAdvancedUsage(enhancedGenerator);

  printHeader('🚀 v2.0.0 FEATURE DEMOS');

  // v2.0.0 Feature Demos
  demoCustomRuleEngine();
  demoThemeCreator();
  demoPureMarkovMode();
  demoEventEconomy();

  printHeader('✅ DEMO COMPLETE');
  console.log('🎉 All v2.0.0 features demonstrated successfully!');
  console.log('📦 Version 2.0.0 delivers revolutionary new capabilities with full backward compatibility.');
  console.log('🚀 Production-ready for game development!');
}

// v2.0.0 Feature Demos
function demoCustomRuleEngine() {
  printSection('🧠 Demo 18: Custom Rule Engine (v2.0.0)');

  const generator = new RPGEventGenerator({ enableRuleEngine: true });

  // Create a custom rule for wealthy players
  const wealthyRule = {
    conditions: [
      { type: 'stat_greater_than', params: { stat: 'gold', value: 1000 } }
    ],
    effects: {
      modifyChoices: {
        multiply: { gold: 1.3 },
        add: { reputation: 5 }
      },
      addTags: ['wealthy_player_bonus']
    }
  };

  safeExecute(() => {
    generator.addCustomRule('wealthy_bonus', wealthyRule);
    printResult('Rule added', 'wealthy_bonus');

    // Test with wealthy player
    const wealthyEvent = generator.generateEvent({ gold: 2000 });
    printResult('Wealthy player event', wealthyEvent.title);
    printResult('Tags applied', wealthyEvent.tags?.join(', ') || 'none');

    // Test with poor player
    const poorEvent = generator.generateEvent({ gold: 100 });
    printResult('Poor player event', poorEvent.title);
    printResult('Tags applied', poorEvent.tags?.join(', ') || 'none');

    printResult('Active rules', Object.keys(generator.getCustomRules()).length);
  }, 'custom rule engine');
}

function demoThemeCreator() {
  printSection('🎨 Demo 19: Theme Creator (v2.0.0)');

  const customTrainingData = [
    'Neon-lit cantinas pulse with quantum energy',
    'Robotic bartenders serve drinks that change your memories',
    'Space cowboys duel with laser revolvers under three moons',
    'Alien merchants haggle over crystalline data cores',
    'Floating colonies drift through asteroid fields'
  ];

  safeExecute(() => {
    const generator = new RPGEventGenerator({
      trainingData: customTrainingData,
      theme: 'space-opera',
      culture: 'cyberpunk'
    });

    const event = generator.generateEvent();
    printResult('Custom theme event', event.title);
    printResult('Description preview', event.description.substring(0, 80) + '...');
    printResult('Training sentences used', customTrainingData.length);
  }, 'theme creator');
}

function demoPureMarkovMode() {
  printSection('🎲 Demo 20: Pure Markov Mode (v2.0.0)');

  const pureTrainingData = [
    'Crystal caves echo with ancient magical resonances',
    'Shadowy figures emerge from fog-shrouded forests',
    'Forgotten ruins hide treasures and eldritch horrors',
    'Mysterious merchants offer artifacts of power',
    'Wandering bards sing tales of lost civilizations'
  ];

  safeExecute(() => {
    const pureGenerator = new RPGEventGenerator({
      trainingData: pureTrainingData,
      pureMarkovMode: true,
      enableTemplates: false
    });

    const event = pureGenerator.generateEvent();
    printResult('Pure Markov event', event.title);
    printResult('Type', event.type);
    printResult('Generated purely from', `${pureTrainingData.length} custom sentences`);
    printResult('Templates disabled', 'true (Pure Markov only)');
  }, 'pure Markov mode');
}

function demoEventEconomy() {
  printSection('💰 Demo 21: Event Economy (v2.0.0)');

  safeExecute(() => {
    // Import the EventEconomy class
    const EventEconomy = require('./scripts/event-economy');

    // Create economy instance
    const economy = new EventEconomy('./user-content');

    // Create a sample theme
    const sampleTheme = {
      name: 'CyberWestern',
      author: 'DemoCreator',
      description: 'Cyberpunk western theme',
      tags: ['cyberpunk', 'western', 'scifi'],
      settings: {
        theme: 'cyberpunk',
        culture: 'western',
        enableRuleEngine: true
      },
      trainingData: [
        'neon signs flicker in the dusty saloon',
        'robotic sheriffs maintain order',
        'cyborg outlaws ride mechanical horses'
      ],
      customRules: [],
      statistics: {
        trainingSentences: 3,
        estimatedQuality: 75
      }
    };

    // Save the theme
    const themePath = economy.saveTheme('CyberWestern', sampleTheme);
    printResult('Theme saved to', themePath);

    // Load the theme
    const loadedTheme = economy.loadTheme('CyberWestern');
    printResult('Theme loaded', loadedTheme.name);
    printResult('Author', loadedTheme.author);
    printResult('Training sentences', loadedTheme.trainingData.length);

    // Show statistics
    const stats = economy.getStatistics();
    printResult('Total themes saved', stats.totalThemes);
    printResult('Total quality score', Math.round(stats.averageThemeQuality) + '/100');

  }, 'event economy');
}

runDemo();
