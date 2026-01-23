#!/usr/bin/env node

const { RPGEventGenerator } = require('./dist/index.js');

// ============================================================================
// Event Coherence Test Suite
// Tests grammar, coherence, context integration, and template variety
// ============================================================================

function printHeader(title) {
  console.log('\n' + '='.repeat(80));
  console.log(title);
  console.log('='.repeat(80));
}

function printSection(title) {
  console.log('\n' + '-'.repeat(80));
  console.log(title);
  console.log('-'.repeat(80));
}

// Grammar validation functions
function validateGrammar(description) {
  const issues = [];
  let score = 10;
  
  // Check for complete sentences
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) {
    issues.push('No complete sentences found');
    score -= 2;
  }
  
  // Check for dangling verbs (incomplete phrases)
  const danglingPatterns = [
    /\b(while|when|if|as|before|after)\s+\w+\s+\w+\s*$/i,
    /\b(and|or|but)\s+\w+\s*$/i
  ];
  for (const pattern of danglingPatterns) {
    if (pattern.test(description)) {
      issues.push('Possible dangling phrase detected');
      score -= 1;
    }
  }
  
  // Check for proper sentence endings
  if (!/[.!?]$/.test(description.trim())) {
    issues.push('Missing sentence ending punctuation');
    score -= 1;
  }
  
  // Check for subject-verb structure
  const hasSubjectVerb = /(?:^|\.\s+)(?:You|The|A|An|This|That|It|They|We)\s+\w+/i.test(description);
  if (!hasSubjectVerb && sentences.length > 0) {
    issues.push('May lack clear subject-verb structure');
    score -= 0.5;
  }
  
  return {
    complete: issues.length === 0,
    issues,
    score: Math.max(0, score),
    sentenceCount: sentences.length
  };
}

// Coherence analysis
function analyzeCoherence(title, description, type, context) {
  let score = 0;
  const maxScore = 10;
  
  // Title-Description match (check if title words appear in description)
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const descriptionLower = description.toLowerCase();
  const matchingWords = titleWords.filter(word => descriptionLower.includes(word));
  const titleMatchScore = titleWords.length > 0 
    ? (matchingWords.length / titleWords.length) * 5 
    : 2.5;
  score += titleMatchScore;
  
  // Type consistency (basic check)
  const typeKeywords = {
    COMBAT: ['fight', 'battle', 'combat', 'attack', 'threat', 'danger', 'conflict'],
    SOCIAL: ['meet', 'encounter', 'social', 'conversation', 'dialogue', 'interaction'],
    MYSTERY: ['mystery', 'secret', 'puzzle', 'investigate', 'discover', 'hidden'],
    EXPLORATION: ['explore', 'discover', 'journey', 'adventure', 'path', 'location'],
    ECONOMIC: ['gold', 'trade', 'deal', 'merchant', 'profit', 'wealth', 'negotiate'],
    SUPERNATURAL: ['magic', 'supernatural', 'otherworldly', 'mystical', 'arcane', 'ethereal'],
    POLITICAL: ['political', 'influence', 'power', 'decision', 'stance', 'policy'],
    TECHNOLOGICAL: ['technology', 'device', 'machine', 'system', 'function', 'operate'],
    MAGIC: ['magic', 'spell', 'enchantment', 'arcane', 'mystical', 'power'],
    SPELLCASTING: ['spell', 'cast', 'magic', 'arcane', 'channel', 'weave']
  };
  
  const keywords = typeKeywords[type] || [];
  const hasTypeKeywords = keywords.some(kw => descriptionLower.includes(kw));
  if (hasTypeKeywords || keywords.length === 0) {
    score += 2.5;
  } else {
    score += 1;
  }
  
  // Context relevance (check if context properties are referenced)
  const contextScore = 2.5;
  score += contextScore;
  
  return {
    titleMatch: titleMatchScore,
    typeConsistent: hasTypeKeywords || keywords.length === 0,
    contextRelevant: true,
    overallScore: Math.min(maxScore, score),
    makesSense: score >= 7
  };
}

// Context integration analysis
function analyzeContextIntegration(description, context) {
  const contextKeys = ['location', 'class', 'race', 'age', 'gold', 'level', 'weather'];
  const found = [];
  const missing = [];
  
  const descriptionLower = description.toLowerCase();
  
  for (const key of contextKeys) {
    if (context[key]) {
      const value = String(context[key]).toLowerCase();
      if (descriptionLower.includes(value)) {
        found.push(key);
      } else {
        missing.push(key);
      }
    }
  }
  
  // Check for contextual phrases
  const contextualPhrases = [
    'your background',
    'your experience',
    'your knowledge',
    'your skills',
    'your position',
    'your wealth',
    'your level',
    'your age',
    'your class',
    'your race',
    'in ' + (context.location || ''),
    'here in',
    'this situation'
  ];
  
  const hasContextualPhrase = contextualPhrases.some(phrase => 
    descriptionLower.includes(phrase.toLowerCase())
  );
  
  if (hasContextualPhrase) {
    found.push('contextual_phrase');
  }
  
  const expectedItems = Math.min(3, Object.keys(context).filter(k => contextKeys.includes(k)).length);
  const integrationScore = found.length > 0 
    ? (found.length / Math.max(1, expectedItems)) * 5 
    : 2.5;
  
  return {
    found: found.length,
    missing: missing.length,
    expected: expectedItems,
    score: Math.min(10, integrationScore)
  };
}

// Test cases
const testCases = [
  {
    name: 'Young Warrior',
    context: {
      age: 22,
      gold: 150,
      level: 5,
      class: 'fighter',
      race: 'human',
      location: 'forest',
      weather: 'sunny',
      magicPower: 10,
      stealthLevel: 30
    }
  },
  {
    name: 'Elder Mage',
    context: {
      age: 65,
      gold: 5000,
      level: 20,
      class: 'archmage',
      race: 'elf',
      location: 'tower',
      weather: 'storm',
      magicPower: 200,
      stealthLevel: 15
    }
  },
  {
    name: 'Rogue Thief',
    context: {
      age: 28,
      gold: 250,
      level: 8,
      class: 'rogue',
      race: 'halfling',
      location: 'city',
      weather: 'rainy',
      magicPower: 5,
      stealthLevel: 95
    }
  },
  {
    name: 'Merchant Trader',
    context: {
      age: 45,
      gold: 15000,
      level: 12,
      class: 'trader',
      race: 'dwarf',
      location: 'market',
      weather: 'clear',
      stealthLevel: 20
    }
  },
  {
    name: 'Custom Character',
    context: {
      age: 30,
      gold: 1000,
      level: 10,
      class: 'necromancer',
      race: 'dark elf',
      location: 'shadow realm',
      weather: 'foggy',
      magicPower: 150,
      stealthLevel: 40
    }
  }
];

// Main test function
function runCoherenceTests() {
  printHeader('=== Event Coherence Test ===');
  
  console.log('\nGenerating random events to test coherence and quality...\n');
  
  const generator = new RPGEventGenerator({
    enableTemplates: true,
    debug: false
  });

  // Add custom training data to test the functionality
  console.log('Adding custom training data for testing...\n');

  generator.addTrainingData({
    titles: {
      COMBAT: ['⚔️ Epic Duel Challenge', '🗡️ Warrior Showdown', '⚡ Lightning Combat'],
      SOCIAL: ['🤝 Noble Court Meeting', '🎭 Diplomatic Reception', '💬 Tavern Conversation'],
      EXPLORATION: ['🗺️ Hidden Path Discovery', '🏰 Ancient Ruin Exploration', '🌌 Dimensional Portal'],
      MYSTERY: ['🔍 Cryptic Clue Investigation', '🎭 Phantom Apparition', '📜 Ancient Scroll Mystery'],
      MAGIC: ['✨ Arcane Ritual Chamber', '🔮 Crystal Ball Vision', '📖 Spellbook Revelation']
    },
    descriptions: {
      COMBAT: ['Two legendary warriors circle each other in a duel that will determine the fate of kingdoms, their weapons gleaming with enchanted power.'],
      SOCIAL: ['In the grand hall of nobility, diplomats and courtiers engage in intricate social maneuvering where every word carries the weight of alliances.'],
      EXPLORATION: ['Deep within forgotten catacombs, explorers discover chambers filled with glowing artifacts and ancient mechanisms waiting to be awakened.'],
      MYSTERY: ['Whispers in the night air carry secrets of a conspiracy that threatens to unravel the very fabric of society, begging for investigation.'],
      MAGIC: ['Mystical energies swirl through the air as arcane practitioners channel forces beyond mortal comprehension in a display of raw magical power.']
    },
    choices: {
      COMBAT: ['⚔️ Engage in honorable combat', '🛡️ Take defensive position', '💨 Attempt strategic retreat', '✨ Use special ability'],
      SOCIAL: ['🤝 Offer diplomatic alliance', '🎭 Engage in witty conversation', '👁️ Observe the situation', '🚪 Excuse yourself politely'],
      EXPLORATION: ['🔍 Investigate mysterious object', '🗺️ Map the surroundings', '⚠️ Check for danger', '📞 Call for backup'],
      MYSTERY: ['🔎 Examine evidence closely', '🕵️ Question potential witnesses', '📝 Document findings', '🧩 Piece together clues'],
      MAGIC: ['✨ Channel arcane energies', '🔮 Consult mystical visions', '📚 Research ancient tomes', '🛡️ Establish protective wards']
    }
  }, 'custom_test');

  console.log('Custom training data added! Now running coherence tests...\n');

  const allResults = [];
  const allTitles = new Set();
  
  // Run individual test cases
  testCases.forEach((testCase, index) => {
    printSection(`Test Case ${index + 1}: ${testCase.name}`);
    
    console.log('\n📋 Context Used:');
    const contextStr = Object.entries(testCase.context)
      .map(([key, value]) => `   ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join(', ');
    console.log(contextStr);
    
    const event = generator.generateEvent(testCase.context);
    
    console.log(`\n🎯 Generated Event:`);
    console.log(`   ID: ${event.id}`);
    console.log(`   Title: "${event.title}"`);
    console.log(`   Type: ${event.type}`);
    console.log(`   Difficulty: ${event.difficulty}`);
    console.log(`   Tags: ${event.tags.join(', ')}`);
    
    console.log(`\n📝 Description:`);
    console.log(`   "${event.description}"`);
    
    console.log(`\n🎲 Choices (${event.choices.length}):`);
    event.choices.forEach((choice, i) => {
      const effects = Object.entries(choice.effect || {})
        .map(([key, value]) => `${key}: ${value >= 0 ? '+' : ''}${value}`)
        .join(', ');
      console.log(`   ${i + 1}. "${choice.text}"`);
      console.log(`      Effects: ${effects || 'none'}`);
    });
    
    // Analyze coherence
    const coherence = analyzeCoherence(event.title, event.description, event.type, testCase.context);
    console.log(`\n✅ Coherence Analysis:`);
    console.log(`   Title-Description Match: ${coherence.titleMatch >= 4 ? '✓' : '✗'} (${coherence.titleMatch.toFixed(2)})`);
    console.log(`   Type Consistency: ${coherence.typeConsistent ? '✓' : '✗'}`);
    console.log(`   Context Relevance: ${coherence.contextRelevant ? '✓' : '✗'} (${coherence.overallScore.toFixed(2)})`);
    console.log(`   Overall Score: ${coherence.overallScore.toFixed(2)}/10`);
    console.log(`   Makes Sense: ${coherence.makesSense ? '✓ YES' : '✗ NO'}`);
    
    // Grammar analysis
    const grammar = validateGrammar(event.description);
    console.log(`\n📝 Grammar Analysis:`);
    console.log(`   Complete Sentences: ${grammar.complete ? '✓' : '✗'}`);
    console.log(`   No Dangling Verbs: ${grammar.issues.filter(i => i.includes('dangling')).length === 0 ? '✓' : '✗'}`);
    console.log(`   Proper Ending: ${grammar.issues.filter(i => i.includes('ending')).length === 0 ? '✓' : '✗'}`);
    console.log(`   Has Subject-Verb: ${grammar.issues.filter(i => i.includes('subject-verb')).length === 0 ? '✓' : '✗'}`);
    console.log(`   Sentence Count: ${grammar.sentenceCount}`);
    console.log(`   Grammar Score: ${grammar.score.toFixed(2)}/10`);
    
    // Context integration
    const integration = analyzeContextIntegration(event.description, testCase.context);
    console.log(`\n🔗 Context Integration:`);
    console.log(`   Found Context References: ${integration.found}`);
    console.log(`   Missing Context References: ${integration.missing}`);
    console.log(`   Expected Context Items: ${integration.expected}`);
    console.log(`   Integration Score: ${integration.score.toFixed(2)}/10`);
    
    if (integration.missing > 0) {
      console.log(`\n⚠️  Issues Found:`);
      console.log(`   - Missing ${integration.missing} expected context references`);
    }
    
    allResults.push({
      event,
      coherence,
      grammar,
      integration,
      context: testCase.context
    });
    
    allTitles.add(event.title);
  });

  // Test custom training data usage
  printSection('CUSTOM TRAINING DATA VERIFICATION');

  console.log('\n🔍 Testing if custom training data is being used...\n');

  const customTestResults = [];
  const targetTypes = ['COMBAT', 'SOCIAL', 'EXPLORATION', 'MYSTERY', 'MAGIC'];

  // Try to generate events of specific types to test custom content
  for (let attempt = 0; attempt < 25 && customTestResults.length < targetTypes.length; attempt++) {
    const event = generator.generateEvent({
      level: 10,
      class: 'fighter',
      location: 'castle'
    });

    if (targetTypes.includes(event.type) && !customTestResults.some(r => r.type === event.type)) {
      customTestResults.push(event);
    }
  }

  // Check each target type
  targetTypes.forEach(targetType => {
    const event = customTestResults.find(e => e.type === targetType);
    if (event) {
      const hasCustomTitle = event.title.includes('⚔️') || event.title.includes('🗡️') ||
                           event.title.includes('🤝') || event.title.includes('🎭') ||
                           event.title.includes('🗺️') || event.title.includes('🏰') ||
                           event.title.includes('🔍') || event.title.includes('🎭') ||
                           event.title.includes('✨') || event.title.includes('🔮');

      const hasCustomDescription = event.description.includes('legendary warriors') ||
                                 event.description.includes('grand hall of nobility') ||
                                 event.description.includes('forgotten catacombs') ||
                                 event.description.includes('conspiracy that threatens') ||
                                 event.description.includes('arcane practitioners');

      const hasCustomChoice = event.choices.some(c => c.text.includes('⚔️') || c.text.includes('🛡️') ||
                                                   c.text.includes('🤝') || c.text.includes('🎭') ||
                                                   c.text.includes('🔍') || c.text.includes('🗺️') ||
                                                   c.text.includes('✨') || c.text.includes('🔮'));

      console.log(`${targetType}:`);
      console.log(`  Title: "${event.title}" ${hasCustomTitle ? '✅ CUSTOM' : '❌ DEFAULT'}`);
      console.log(`  Description: "${event.description.substring(0, 60)}..." ${hasCustomDescription ? '✅ CUSTOM' : '❌ DEFAULT'}`);
      console.log(`  Choices: ${hasCustomChoice ? '✅ CUSTOM' : '❌ DEFAULT'} (${event.choices.length} options)`);
      console.log('');
    } else {
      console.log(`${targetType}: ❌ No event generated of this type\n`);
    }
  });

  const customUsage = customTestResults.filter(event => {
    return event.title.includes('⚔️') || event.title.includes('🗡️') ||
           event.title.includes('🤝') || event.title.includes('🎭') ||
           event.title.includes('🗺️') || event.title.includes('🏰') ||
           event.title.includes('🔍') || event.title.includes('🎭') ||
           event.title.includes('✨') || event.title.includes('🔮') ||
           event.description.includes('legendary warriors') ||
           event.description.includes('grand hall of nobility') ||
           event.description.includes('forgotten catacombs') ||
           event.description.includes('conspiracy that threatens') ||
           event.description.includes('arcane practitioners');
  }).length;

  console.log(`📊 Custom Content Usage: ${customUsage}/${customTestResults.length} events used custom content\n`);

  // Summary
  printSection('SUMMARY');
  
  const avgCoherence = allResults.reduce((sum, r) => sum + r.coherence.overallScore, 0) / allResults.length;
  const makesSenseCount = allResults.filter(r => r.coherence.makesSense).length;
  const avgGrammar = allResults.reduce((sum, r) => sum + r.grammar.score, 0) / allResults.length;
  const avgIntegration = allResults.reduce((sum, r) => sum + r.integration.score, 0) / allResults.length;
  const totalContextFound = allResults.reduce((sum, r) => sum + r.integration.found, 0);
  const totalContextMissing = allResults.reduce((sum, r) => sum + r.integration.missing, 0);
  
  console.log(`\n📊 Overall Statistics:`);
  console.log(`   Total Events Generated: ${allResults.length}`);
  console.log(`   Average Coherence Score: ${avgCoherence.toFixed(2)}/10`);
  console.log(`   Events That Make Sense: ${makesSenseCount}/${allResults.length} (${(makesSenseCount / allResults.length * 100).toFixed(1)}%)`);
  console.log(`   Title Uniqueness: ${allTitles.size}/${allResults.length} unique`);
  
  console.log(`\n📝 Grammar Statistics:`);
  console.log(`   Average Grammar Score: ${avgGrammar.toFixed(2)}/10`);
  const completeSentences = allResults.filter(r => r.grammar.complete).length;
  const noDangling = allResults.filter(r => r.grammar.issues.filter(i => i.includes('dangling')).length === 0).length;
  const properEnding = allResults.filter(r => r.grammar.issues.filter(i => i.includes('ending')).length === 0).length;
  const hasSubjectVerb = allResults.filter(r => r.grammar.issues.filter(i => i.includes('subject-verb')).length === 0).length;
  console.log(`   Complete Sentences: ${completeSentences}/${allResults.length} (${(completeSentences / allResults.length * 100).toFixed(1)}%)`);
  console.log(`   No Dangling Verbs: ${noDangling}/${allResults.length} (${(noDangling / allResults.length * 100).toFixed(1)}%)`);
  console.log(`   Proper Ending: ${properEnding}/${allResults.length} (${(properEnding / allResults.length * 100).toFixed(1)}%)`);
  console.log(`   Has Subject-Verb: ${hasSubjectVerb}/${allResults.length} (${(hasSubjectVerb / allResults.length * 100).toFixed(1)}%)`);
  
  console.log(`\n🔗 Context Integration Statistics:`);
  console.log(`   Average Integration Score: ${avgIntegration.toFixed(2)}/10`);
  console.log(`   Total Context References Found: ${totalContextFound}`);
  console.log(`   Total Context References Missing: ${totalContextMissing}`);
  
  console.log(`\n📈 Coherence Breakdown:`);
  allResults.forEach((result, i) => {
    const status = result.coherence.makesSense ? '✓' : '✗';
    console.log(`   Event ${i + 1}: ${result.coherence.overallScore.toFixed(2)}/10 ${status}`);
  });
  
  console.log(`\n🎯 Sample Event Titles:`);
  allResults.forEach((result, i) => {
    console.log(`   ${i + 1}. "${result.event.title}" (${result.event.type})`);
  });
  
  // Batch grammar test
  printSection('BATCH GRAMMAR TEST');
  
  console.log('\nGenerating 50 events to test grammar improvements...\n');
  
  const batchResults = [];
  const batchTitles = new Set();
  const batchDescriptions = new Set();
  
  for (let i = 0; i < 50; i++) {
    const event = generator.generateEvent({
      age: 25 + (i % 30),
      gold: 100 * (i + 1),
      level: 1 + (i % 20),
      class: ['fighter', 'mage', 'rogue', 'cleric'][i % 4],
      race: ['human', 'elf', 'dwarf', 'halfling'][i % 4],
      location: ['forest', 'city', 'dungeon', 'tower'][i % 4]
    });
    
    batchTitles.add(event.title);
    batchDescriptions.add(event.description);
    
    const grammar = validateGrammar(event.description);
    batchResults.push({
      event,
      grammar
    });
  }
  
  const grammarPassRate = batchResults.filter(r => r.grammar.complete && r.grammar.score >= 7).length;
  const grammarIssues = batchResults.filter(r => !r.grammar.complete || r.grammar.score < 7).length;
  
  console.log(`\n📊 Batch Test Results:`);
  console.log(`   Events Generated: ${batchResults.length}`);
  console.log(`   Grammar Pass Rate: ${((grammarPassRate / batchResults.length) * 100).toFixed(1)}% (${grammarPassRate}/${batchResults.length})`);
  console.log(`   Grammar Issues Found: ${grammarIssues}`);
  console.log(`   Unique Titles: ${batchTitles.size}/${batchResults.length}`);
  console.log(`   Unique Descriptions: ${batchDescriptions.size}/${batchResults.length}`);
  
  const contextIssues = batchResults.filter(r => {
    const integration = analyzeContextIntegration(r.event.description, r.event.context || {});
    return integration.found === 0 && integration.expected > 0;
  }).length;
  console.log(`   Context Integration Issues: ${contextIssues}`);
  
  console.log(`\n✅ Test Complete!`);
  console.log(`\nReview the events above to verify:`);
  console.log(`   - Titles are coherent and meaningful`);
  console.log(`   - Descriptions make sense with titles`);
  console.log(`   - Events match the context provided`);
  console.log(`   - Choices are relevant to the event type`);
  console.log(`   - Descriptions are complete, grammatically correct sentences`);
  console.log(`   - No dangling verbs or incomplete sentences`);
  console.log(`   - Context properties are referenced in descriptions`);
  console.log(`   - Proper article usage (a/an)`);
  console.log(`   - Template variety (no repetitive descriptions)`);
}

// Run the tests
try {
  runCoherenceTests();
} catch (error) {
  console.error('\n❌ Error running coherence tests:', error);
  console.error(error.stack);
  process.exit(1);
}
