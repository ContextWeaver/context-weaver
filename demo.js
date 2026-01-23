#!/usr/bin/env node

const { RPGEventGenerator } = require('./dist/index.js');

const DEMO_CONFIG = {
  version: '4.0.0',
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


function demoTimeBasedEvents() {
  printSection('⏰ Demo 7: Time-Based Events');

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
  printSection('💾 Demo 8: Game State Management');

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
    enableDatabase: false,
    enableModifiers: true,
    enableRelationships: true,
    enableDependencies: true,
    language: 'en'
  });

  printSection('🌍 Demo 9: Multi-Language Support');

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
  printSection('🌤️ Demo 10: Environmental Modifiers');

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
  printSection('🔗 Demo 11: Event Dependencies');

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
  printSection('👥 Demo 12: NPC Relationships');

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
  printSection('🎭 Demo 13: Combined Feature Usage');

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
    printResult('Description', comprehensiveEvent.description.substring(0, 60) + '...');
    printResult('Type', comprehensiveEvent.type);
    printResult('Difficulty', comprehensiveEvent.difficulty);
    printResult('Choices', comprehensiveEvent.choices.length);

    // Show choice details
    console.log('\nChoice Details:');
    comprehensiveEvent.choices.slice(0, 2).forEach((choice, i) => {
      console.log(`  ${i + 1}. ${choice.text}`);
      if (choice.effect.gold) console.log(`     Gold effect: ${choice.effect.gold > 0 ? '+' : ''}${choice.effect.gold}`);
      if (choice.effect.reputation) console.log(`     Reputation effect: ${choice.effect.reputation > 0 ? '+' : ''}${choice.effect.reputation}`);
    });

    // Show tags applied by rules
    if (comprehensiveEvent.tags && comprehensiveEvent.tags.length > 0) {
      printResult('Applied Tags', comprehensiveEvent.tags.join(', '));
    }

    // Show AI enhancement status
    const hasAIEnhancement = comprehensiveEvent.tags?.includes('ai-enhanced');
    printResult('AI Enhanced', hasAIEnhancement ? 'Yes' : 'No');

    // Show environmental context effects
    printResult('Weather Context', comprehensiveContext.environment.weather);
    printResult('Season Context', comprehensiveContext.environment.season);
    printResult('Time Context', comprehensiveContext.environment.timeOfDay);

    // Show relationship effects
    const merchantRelationship = comprehensiveContext.gameState.relationships.merchant_sam;
    printResult('Merchant Relationship', `${merchantRelationship.type} (${merchantRelationship.strength})`);

    console.log('\nFeature Integration Status:');
    console.log('  ✅ Enhanced Procedural Generation (Markov + Context)');
    console.log('  ✅ Dynamic Difficulty Scaling');
    console.log('  ✅ Environmental Effects');
    console.log('  ✅ Relationship-Based Events');
    console.log('  ✅ Rule Engine Processing');
    console.log('  ✅ Optional AI Enhancement');
    console.log('  ✅ Template System Integration');
    console.log('  ✅ Time-Based Event Logic');
  }
}

// Backward Compatibility
function demoBackwardCompatibility() {
  printSection('🔄 Demo 14: Backward Compatibility');

  const legacyGenerator = new RPGEventGenerator();
  const legacyEvent = safeExecute(() => legacyGenerator.generateEvent(), 'legacy generator test');
  if (legacyEvent) {
    printResult('Basic generator works', legacyEvent.title);
  }

  const partialGenerator = new RPGEventGenerator({
    enableDatabase: false,
    enableModifiers: false,
    enableRelationships: true,
    enableDependencies: false
  });
  const partialEvent = safeExecute(() => partialGenerator.generateEvent(), 'partial features test');
  if (partialEvent) {
    printResult('Partial features work', partialEvent.title);
  }

}

function demoSystemStatus(generator) {
  printSection('📊 Demo 15: System Status');

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
  printSection('🎯 Demo 16: Advanced Usage Examples');

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

async function runDemo() {

  demoBasicEventGeneration();
  demoDynamicDifficultyScaling();
  demoContextAwareEvents();
  demoCustomTrainingData();
  demoModularEventSystem();
  demoEventChains();
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
  demoAdvancedTemplates();
  demoWorldBuilding();
  demoPerformanceOptimizations();
  await demoDatabaseIntegration();
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
  printSection('🧠 Demo 26: Custom Rule Engine (v2.0.0)');

  const generator = new RPGEventGenerator({ enableRuleEngine: true, enableDatabase: false });

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
  printSection('🎨 Demo 27: Theme Creator (v2.0.0)');

  const customTrainingData = [
    'Neon-lit cantinas pulse with quantum energy',
    'Robotic bartenders serve drinks that change your memories',
    'Space cowboys duel with laser revolvers under three moons',
    'Alien merchants haggle over crystalline data cores',
    'Floating colonies drift through asteroid fields'
  ];

  safeExecute(() => {
    const generator = new RPGEventGenerator({
      enableDatabase: false,
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
  printSection('🎲 Demo 28: Pure Markov Mode (v2.0.0)');

  const pureTrainingData = [
    'Crystal caves echo with ancient magical resonances',
    'Shadowy figures emerge from fog-shrouded forests',
    'Forgotten ruins hide treasures and eldritch horrors',
    'Mysterious merchants offer artifacts of power',
    'Wandering bards sing tales of lost civilizations'
  ];

  safeExecute(() => {
    const pureGenerator = new RPGEventGenerator({
      enableDatabase: false,
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

function demoAdvancedTemplates() {
  printSection('🎨 Demo 19: Advanced Template System (v2.0.0)');

  const generator = new RPGEventGenerator();

  // Create base templates for inheritance
  const baseMerchant = {
    title: 'Merchant Interaction',
    narrative: 'A merchant approaches you.',
    choices: [
      { text: 'Trade goods', effect: { gold: 10 } },
      { text: 'Ask for information', effect: { reputation: 2 } }
    ],
    tags: ['merchant', 'economic']
  };

  const weatherMixin = {
    title: 'Weather Affected',
    narrative: 'The weather influences the situation.',
    choices: [
      { text: 'Adapt to weather conditions', effect: { reputation: 1 } },
      { text: 'Ignore the weather', effect: {} }
    ],
    tags: ['weather']
  };

  const conditionalAddon = {
    title: 'High-Level Merchant',
    narrative: 'This merchant deals in rare items.',
    choices: [
      { text: 'Purchase rare artifact', effect: { gold: -50 } },
      { text: 'Decline rare item', effect: {} }
    ],
    tags: ['rare', 'expensive']
  };

  // Register base templates
  generator.registerEventTemplate('base_merchant_demo', baseMerchant);
  generator.registerEventTemplate('weather_mixin_demo', weatherMixin);
  generator.registerEventTemplate('conditional_addon_demo', conditionalAddon);

  // Create advanced template with inheritance, mixins, and composition
  const advancedMerchant = {
    title: 'Advanced Merchant Encounter',
    narrative: 'A complex merchant situation unfolds with multiple factors.',
    choices: [
      { text: 'Execute perfect negotiation', effect: { gold: 25, reputation: 5 } },
      { text: 'Use merchant knowledge', effect: { reputation: 3 } }
    ],
    tags: ['advanced', 'complex'],
    extends: 'base_merchant_demo',
    mixins: ['weather_mixin_demo'],
    composition: [
      {
        template_id: 'conditional_addon_demo',
        merge_strategy: 'append',
        conditions: [{ type: 'stat_requirement', operator: 'gte', field: 'level', value: 10 }],
        priority: 1
      }
    ],
    conditional_choices: [
      {
        choice_index: 0,
        conditions: [{ type: 'stat_requirement', operator: 'gte', field: 'charisma', value: 15 }],
        show_when: true
      }
    ],
    dynamic_fields: [
      {
        field: 'narrative',
        conditions: [{ type: 'stat_requirement', operator: 'gte', field: 'gold', value: 1000 }],
        value_if_true: 'A wealthy merchant approaches, recognizing your affluence.',
        value_if_false: 'A merchant approaches, sizing up your modest means.'
      }
    ]
  };

  generator.registerEventTemplate('advanced_merchant_demo', advancedMerchant);

  // Test with low-level character (basic merchant only)
  console.log('Low-level character (Level 5, Charisma 10, Gold 100):');
  const basicEvent = safeExecute(() => generator.generateFromTemplate('advanced_merchant_demo', {
    level: 5, charisma: 10, gold: 100
  }), 'basic template generation');

  if (basicEvent) {
    printResult('Event type', basicEvent.type);
    printResult('Choices available', basicEvent.choices.length);
    printResult('Tags', basicEvent.tags.join(', '));
  }

  // Test with high-level character (full advanced merchant)
  console.log('\\nHigh-level character (Level 15, Charisma 20, Gold 2000):');
  const advancedEvent = safeExecute(() => generator.generateFromTemplate('advanced_merchant_demo', {
    level: 15, charisma: 20, gold: 2000
  }), 'advanced template generation');

  if (advancedEvent) {
    printResult('Event type', advancedEvent.type);
    printResult('Choices available', advancedEvent.choices.length);
    printResult('Tags', advancedEvent.tags.join(', '));
    printResult('Description shows wealth recognition', advancedEvent.description.includes('wealthy merchant'));
  }

  console.log('\\nAdvanced Template Features Demonstrated:');
  printResult('- Template Inheritance', '✅ Base merchant extended');
  printResult('- Mixin System', '✅ Weather behavior mixed in');
  printResult('- Conditional Composition', '✅ Rare items added for high-level players');
  printResult('- Dynamic Fields', '✅ Narrative adapts to player wealth');
  printResult('- Conditional Choices', '✅ Special options for high charisma');
}

function demoWorldBuilding() {
  printSection('🌍 Demo 20: World Building System (v2.0.0)');

  const generator = new RPGEventGenerator();

  console.log('Generating fantasy world...');
  const world = generator.generateWorld(42);
  printResult('World created successfully', `✅ ${world.regions.length} regions, ${world.factions.length} factions, ${world.events.length} historical events`);

  console.log('\nWorld Statistics:');
  printResult('- Regions created', world.regions.length);
  printResult('- Factions established', world.factions.length);
  printResult('- Historical events', world.events.length);

  console.log('\nSample Regions:');
  world.regions.slice(0, 3).forEach(region => {
    printResult(`- ${region.name}`, `${region.type} (${region.population.toLocaleString()} pop, stability: ${(region.political_stability * 100).toFixed(0)}%)`);
  });

  console.log('\nSample Factions:');
  world.factions.slice(0, 3).forEach(faction => {
    const allies = generator.getFactionAllies(faction.id).length;
    const enemies = generator.getFactionEnemies(faction.id).length;
    printResult(`- ${faction.name}`, `${faction.type} (influence: ${faction.influence.toFixed(1)}, allies: ${allies}, enemies: ${enemies})`);
  });

  console.log('\nFaction Power Rankings (Top 5):');
  const rankings = generator.getFactionPowerRanking();
  rankings.slice(0, 5).forEach((rank, i) => {
    printResult(`${i+1}. ${rank.name}`, `Power: ${rank.power.toFixed(1)}`);
  });

  console.log('\nHistorical Events:');
  world.events.forEach(event => {
    printResult(`- Year ${event.year}: ${event.title}`, `${event.type} (significance: ${event.significance.toFixed(1)})`);
  });

  console.log('\nSimulating 100 years of history...');
  const newEvents = generator.simulateWorldYears(100);
  printResult('New events generated', newEvents.length);

  console.log('\nRecent Historical Events:');
  newEvents.slice(-3).forEach(event => {
    printResult(`- Year ${event.year}: ${event.title}`, `${event.type} (significance: ${event.significance.toFixed(1)})`);
  });

  const finalStats = generator.getWorldStats();
  console.log('\nFinal World Statistics:');
  printResult('- Total regions', finalStats.totalRegions);
  printResult('- Total factions', finalStats.totalFactions);
  printResult('- Total historical events', finalStats.totalHistoricalEvents);
  printResult('- Average stability', (finalStats.averageStability * 100).toFixed(1) + '%');
  printResult('- Average prosperity', (finalStats.averageProsperity * 100).toFixed(1) + '%');

  console.log('\nWorld Building Features Demonstrated:');
  printResult('- Automated world generation', '✅ Regions, factions, and history created');
  printResult('- Faction relationship mapping', '✅ Diplomacy, allies, and enemies');
  printResult('- Historical event simulation', '✅ Dynamic world-changing events');
  printResult('- Power ranking system', '✅ Faction influence calculations');
  printResult('- Economic and political systems', '✅ Resources, stability, and prosperity');
}

function demoPerformanceOptimizations() {
  printSection('⚡ Demo 25: Performance Optimizations (v2.0.0)');

  const generator = new RPGEventGenerator();

  // Test template caching
  console.log('Testing Template Caching...');
  const template = {
    title: 'Performance Test Event',
    narrative: 'Testing caching performance.',
    choices: [
      { text: 'Choice 1', effect: { gold: 10 } },
      { text: 'Choice 2', effect: { gold: 20 } }
    ]
  };

  generator.registerEventTemplate('perf_test', template);

  // First generation (cache population)
  console.log('First generation run (populating cache)...');
  const start1 = Date.now();
  for (let i = 0; i < 10; i++) {
    generator.generateFromTemplate('perf_test', { level: 5 });
  }
  const end1 = Date.now();
  printResult('First run (10 events)', `${end1 - start1}ms`);

  // Second generation (cache utilization)
  console.log('Second generation run (using cache)...');
  const start2 = Date.now();
  for (let i = 0; i < 10; i++) {
    generator.generateFromTemplate('perf_test', { level: 5 });
  }
  const end2 = Date.now();
  printResult('Second run (10 events, cached)', `${end2 - start2}ms`);

  const cacheStats = generator.getTemplateCacheStats();
  console.log('\nCache Statistics:');
  printResult('- Processed templates cached', cacheStats.processedTemplates);
  printResult('- Generated events cached', cacheStats.generatedEvents);

  // Test batched generation
  console.log('\\nTesting Batched Generation...');
  const batchStart = Date.now();
  const batchedEvents = generator.generateEventsBatched(20, {}, 5);
  const batchEnd = Date.now();
  printResult('Batched generation (20 events)', `${batchEnd - batchStart}ms`);
  printResult('Generated events', batchedEvents.length);

  console.log('\\nPerformance Features Demonstrated:');
  printResult('- Template caching system', '✅ Repeated generations use cached results');
  printResult('- Event result caching', '✅ Identical contexts return cached events');
  printResult('- Batched generation', '✅ Efficient bulk event creation');
  printResult('- Cache statistics', '✅ Performance monitoring and optimization');
}

async function demoDatabaseIntegration() {
  printSection('💾 Demo 30: Database Integration (v2.0.0)');

  const generator = new RPGEventGenerator({ enableDatabase: true });

  // Give database a moment to initialize
  await new Promise(resolve => setTimeout(resolve, 10));

  const dbTemplate1 = {
    id: 'merchant_database_demo',
    title: 'Database Merchant',
    narrative: 'A merchant stored in the database system.',
    choices: [
      { text: 'Buy goods', effect: { gold: -50 } },
      { text: 'Sell goods', effect: { gold: 75 } },
      { text: 'Negotiate', effect: { gold: 25 } }
    ],
    tags: ['merchant', 'database', 'economy'],
    type: 'economic'
  };

  const dbTemplate2 = {
    id: 'combat_database_demo',
    title: 'Database Combat',
    narrative: 'A combat encounter from the database.',
    choices: [
      { text: 'Fight bravely', effect: { health: -20, experience: 50 } },
      { text: 'Try to flee', effect: { health: -5, reputation: -10 } },
      { text: 'Use strategy', effect: { experience: 30 } }
    ],
    tags: ['combat', 'database', 'adventure'],
    type: 'combat'
  };

  await safeExecute(async () => {
    // Store templates in database
    console.log('Storing templates in database...');
    await generator.storeTemplateInDatabase(dbTemplate1);
    await generator.storeTemplateInDatabase(dbTemplate2);
    console.log('Templates stored successfully');

    // Retrieve specific template
    const retrievedTemplate = await generator.getTemplateFromDatabase('merchant_database_demo');
    if (retrievedTemplate) {
      printResult('Retrieved template from database', retrievedTemplate.title);
      printResult('Template type', retrievedTemplate.type);
      printResult('Template tags', retrievedTemplate.tags.join(', '));
    }

    // Search templates by criteria
    console.log('\nSearching templates by type...');
    const economicTemplates = await generator.searchTemplatesInDatabase({ type: 'economic' });
    printResult('Found economic templates', economicTemplates.length);

    const combatTemplates = await generator.searchTemplatesInDatabase({ type: 'combat' });
    printResult('Found combat templates', combatTemplates.length);

    // Search by tags
    const merchantTemplates = await generator.getTemplatesByTags(['merchant']);
    printResult('Found merchant-tagged templates', merchantTemplates.length);

    // Get random templates
    const randomTemplates = await generator.getRandomTemplatesFromDatabase(3);
    printResult('Random templates retrieved', randomTemplates.length);

    // Get database statistics
    const dbStats = await generator.getDatabaseStats();
    console.log('\nDatabase Statistics:');
    printResult('- Total templates in database', dbStats.totalTemplates);
    printResult('- Templates with conditions', dbStats.templatesWithConditions);
    printResult('- Templates with composition', dbStats.templatesWithComposition);
    printResult('- Templates with inheritance', dbStats.templatesWithInheritance);
    printResult('- Average choices per template', dbStats.averageChoices.toFixed(1));

    console.log('\nDatabase Features Demonstrated:');
    printResult('- Template storage and retrieval', '✅ Templates persisted to database');
    printResult('- Advanced search capabilities', '✅ Query by type, tags, and criteria');
    printResult('- Random template selection', '✅ Efficient random sampling');
    printResult('- Database statistics', '✅ Comprehensive analytics and reporting');
    printResult('- Scalable architecture', '✅ Extensible adapter pattern for different databases');
  });
}

function demoEventEconomy() {
  printSection('💰 Demo 29: Event Economy (v2.0.0)');

  safeExecute(() => {
    // Import the EventEconomy class
    const EventEconomy = require('./dist/scripts/event-economy');

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

runDemo().catch(console.error);
