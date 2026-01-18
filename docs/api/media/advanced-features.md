# Advanced Features

Explore the powerful advanced features of RPG Event Generator for complex, dynamic content generation.

## 🧠 Rule Engine

The Rule Engine allows you to create conditional logic that dynamically modifies events based on player state, location, stats, and other factors.

### Basic Rule Creation
```javascript
const generator = new RPGEventGenerator({
  enableRuleEngine: true
});

// Create a wealth-based rule
generator.addCustomRule('wealth_bonus', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'gold', value: 1000 } }
  ],
  effects: {
    addTags: ['wealthy'],
    modifyChoices: {
      multiply: { rewards: 1.5 },
      add: { reputation: 5 }
    }
  }
});

// Test the rule
const wealthyPlayer = { gold: 1500, reputation: 50 };
const event = generator.generateEvent(wealthyPlayer);
// Event will have enhanced rewards due to wealth rule
```

### Advanced Rule Conditions

#### Statistical Conditions
```javascript
// Multiple stat requirements
generator.addCustomRule('elite_warrior', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'strength', value: 80 } },
    { type: 'stat_greater_than', params: { stat: 'combat_skill', value: 70 } },
    { type: 'career_equals', params: { career: 'warrior' } }
  ],
  effects: {
    addTags: ['elite_warrior'],
    modifyEvent: {
      difficulty: 'legendary',
      addChoices: [{
        text: "Execute perfect combat maneuver",
        effect: { reputation: 20, combat_skill: 5 }
      }]
    }
  }
});
```

#### Location-Based Rules
```javascript
generator.addCustomRule('forest_explorer', {
  conditions: [
    { type: 'location_contains', params: { location: 'forest' } },
    { type: 'stat_greater_than', params: { stat: 'survival', value: 60 } }
  ],
  effects: {
    modifyChoices: {
      add: {
        text: "Use survival skills to find hidden path",
        effect: { gold: 100, reputation: 10 }
      }
    }
  }
});
```

#### Time-Based Rules
```javascript
generator.addCustomRule('night_owl', {
  conditions: [
    { type: 'time_range', params: { start: '22:00', end: '06:00' } },
    { type: 'stat_greater_than', params: { stat: 'perception', value: 70 } }
  ],
  effects: {
    addTags: ['night_vision'],
    modifyEvent: {
      description: "Your keen senses detect something unusual in the darkness..."
    }
  }
});
```

### Complex Rule Logic
```javascript
// OR conditions
generator.addCustomRule('versatile_hero', {
  conditions: [
    {
      type: 'OR',
      conditions: [
        { type: 'stat_greater_than', params: { stat: 'magic', value: 80 } },
        { type: 'stat_greater_than', params: { stat: 'combat', value: 80 } }
      ]
    }
  ],
  effects: {
    addTags: ['versatile'],
    modifyChoices: {
      multiply: { experience: 1.3 }
    }
  }
});
```

## 🌤️ Environmental Modifiers

Environmental modifiers adapt events based on weather, season, time of day, and location.

### Weather Effects
```javascript
const generator = new RPGEventGenerator({
  enableModifiers: true
});

// Set environmental context
generator.setEnvironmentalContext({
  weather: 'storm',
  season: 'winter',
  timeOfDay: 'night',
  location: 'mountain_pass'
});

// Generate weather-aware event
const harshEvent = generator.generateEnhancedEvent({
  environment: { weather: 'storm', season: 'winter' }
});

console.log(`🌧️ ${harshEvent.title}`);
// May include storm-related challenges or opportunities
```

### Modifier Stacking
```javascript
// Combine multiple environmental factors
const complexEnvironment = {
  weather: 'fog',
  season: 'autumn',
  timeOfDay: 'dusk',
  terrain: 'swamp',
  visibility: 'poor'
};

const atmosphericEvent = generator.generateEnhancedEvent({
  environment: complexEnvironment,
  player: {
    perception: 75,
    survival: 60
  }
});
```

### Custom Modifiers
```javascript
// Add custom environmental factors
generator.addEnvironmentalModifier('magical_storm', {
  effects: {
    mana_regeneration: 2.0,  // Double mana regen
    spell_power: 1.5,        // 50% more powerful spells
    random_events: ['magical_surge', 'elemental_manifestation']
  },
  duration: 3,  // Lasts 3 turns/events
  rarity: 'rare'
});
```

## 👥 NPC Relationship Networks

Dynamic character relationships that evolve based on player actions and influence events.

### Basic Relationship Setup
```javascript
const socialGenerator = new RPGEventGenerator({
  enableRelationships: true
});

// Add NPCs to the network
socialGenerator.addNPC({
  id: 'king_arthur',
  name: 'King Arthur',
  type: 'noble',
  faction: 'royalty'
});

socialGenerator.addNPC({
  id: 'merchant_john',
  name: 'Merchant John',
  type: 'merchant',
  faction: 'guild'
});

// Connect relationships
socialGenerator.addRelationship('king_arthur', 'merchant_john', {
  type: 'acquaintance',
  strength: 30,
  reason: 'trade_deals'
});
```

### Relationship Evolution
```javascript
// Player actions affect relationships
socialGenerator.applyRelationshipRule('king_arthur', 'player', 'save_life');
// Relationship with king improves significantly (+25)

socialGenerator.updateRelationship('merchant_john', 'player', -15, 'bargain_too_hard');
// Relationship with merchant deteriorates

// Generate relationship-aware events
const socialEvent = socialGenerator.generateEnhancedEvent({
  player: { id: 'player' },
  relationships: true
});
```

### Built-in Evolution Rules
```javascript
// Predefined relationship changes
const evolutionRules = {
  'save_life': { change: +25, description: 'Saved their life in battle' },
  'betray_trust': { change: -40, description: 'Broke a solemn promise' },
  'give_generous_gift': { change: +15, description: 'Gave a valuable gift' },
  'public_humiliation': { change: -30, description: 'Embarrassed them publicly' },
  'prove_loyalty': { change: +20, description: 'Demonstrated unwavering loyalty' }
};

// Apply predefined rule
socialGenerator.applyRelationshipRule('ally_character', 'player', 'prove_loyalty');
```

### Relationship Analysis
```javascript
// Analyze relationship network
const networkAnalysis = socialGenerator.analyzeRelationships('player');

console.log('Relationship Summary:');
console.log(`Total connections: ${networkAnalysis.totalConnections}`);
console.log(`Strongest ally: ${networkAnalysis.strongestAlly.name} (${networkAnalysis.strongestAlly.strength})`);
console.log(`Biggest rival: ${networkAnalysis.biggestRival.name} (${networkAnalysis.biggestRival.strength})`);

// Get relationship suggestions
const suggestions = socialGenerator.getRelationshipSuggestions('player');
console.log('Suggested actions:', suggestions);
```

## 🔗 Event Dependencies

Complex prerequisite systems that control when events can occur.

### Basic Dependencies
```javascript
const dependencyGenerator = new RPGEventGenerator({
  enableDependencies: true
});

// Simple event requirement
dependencyGenerator.registerEventDependency('ROYAL_AUDIENCE', {
  type: 'event_completed',
  eventId: 'COURT_INTRODUCTION'
});

// Complex requirements
dependencyGenerator.registerEventDependency('MASTER_QUEST', {
  operator: 'AND',
  conditions: [
    { type: 'stat_requirement', stat: 'level', min: 20 },
    { type: 'event_completed', eventId: 'APPRENTICE_QUEST' },
    { type: 'item_requirement', item: 'master_key' },
    {
      operator: 'OR',
      conditions: [
        { type: 'stat_requirement', stat: 'reputation', min: 80 },
        { type: 'relationship_requirement', npc: 'guild_master', min: 60 }
      ]
    }
  ]
});
```

### Dynamic Dependency Checking
```javascript
// Check if event can trigger
const gameState = {
  completedEvents: new Set(['APPRENTICE_QUEST', 'COURT_INTRODUCTION']),
  playerStats: { level: 25, reputation: 85 },
  inventory: new Set(['master_key']),
  relationships: { guild_master: 70 }
};

const canTriggerMasterQuest = dependencyGenerator.checkDependencies('MASTER_QUEST', gameState);
console.log(`Can start master quest: ${canTriggerMasterQuest}`);

// Get available events based on dependencies
const availableEvents = dependencyGenerator.getAvailableEvents(gameState);
console.log(`Available events: ${availableEvents.length}`);
```

### Progressive Unlocking
```javascript
// Story progression system
const storyDependencies = {
  'VILLAGE_HELP': {
    type: 'location_visited',
    location: 'starting_village'
  },
  'FOREST_QUEST': {
    dependencies: ['VILLAGE_HELP'],
    type: 'quest_chain_start'
  },
  'CITY_ACCESS': {
    operator: 'AND',
    conditions: [
      { type: 'event_completed', eventId: 'FOREST_QUEST' },
      { type: 'stat_requirement', stat: 'level', min: 5 }
    ]
  }
};

// Register all story dependencies
Object.entries(storyDependencies).forEach(([eventId, config]) => {
  dependencyGenerator.registerEventDependency(eventId, config);
});
```

## 🎲 Pure Markov Mode

Generate completely custom events using only your provided text data, without predefined templates.

### Basic Pure Markov Generation
```javascript
const markovGenerator = new RPGEventGenerator();

// Add custom training data
markovGenerator.addCustomTrainingData([
  'In the shadowed alleys of the ancient city',
  'The dragon\'s roar echoes through the misty mountains',
  'Elven merchants display their enchanted crystal wares',
  'A dwarven smith forges weapons of legendary power',
  'The tavern overflows with adventurers and mysterious strangers',
  'Ancient runes glow with ethereal magical energy',
  'The enchanted forest whispers secrets to those who listen carefully'
], 'fantasy');

// Generate pure Markov event
const pureEvent = markovGenerator.generatePureMarkovEvent({
  minLength: 50,
  maxLength: 200,
  theme: 'fantasy'
});

console.log(`🎲 Pure Markov Event:`);
console.log(`Title: ${pureEvent.title}`);
console.log(`Description: ${pureEvent.description}`);
console.log(`Words used: ${pureEvent.wordCount}`);
```

### Advanced Markov Configuration
```javascript
const advancedMarkov = new RPGEventGenerator({
  markovOrder: 3,  // Higher order = more coherent but less varied
  creativity: 0.7, // Balance between training data and randomness
  enableTemplates: false  // Pure Markov only
});

// Generate with specific constraints
const constrainedEvent = advancedMarkov.generatePureMarkovEvent({
  seedWords: ['mysterious', 'ancient', 'powerful'],
  forbiddenWords: ['boring', 'generic'],
  style: 'epic_fantasy',
  tone: 'mysterious'
});
```

## 📚 Template Library Integration

While templates are no longer included, you can create and manage your own template system.

### Custom Template Creation
```javascript
// Define custom event template
const customTemplate = {
  title: "Mystical Vision",
  narrative: "You experience a vivid prophetic dream showing future events. The vision reveals {prophecy} and urges you to {action}.",
  choices: [
    {
      text: "Seek out the prophecy",
      effect: { wisdom: 15, risk: 20 },
      consequence: "visionary"
    },
    {
      text: "Dismiss it as a dream",
      effect: { stress: -10 },
      consequence: "skeptical"
    }
  ],
  tags: ['mystical', 'prophecy', 'dream'],
  context_requirements: {
    wisdom: { min: 30 },
    spirituality: { min: 20 }
  }
};

// Register the template
generator.registerEventTemplate('MYSTICAL_VISION', customTemplate);

// Use the template
const visionEvent = generator.generateFromTemplate('MYSTICAL_VISION');
```

### Template Collections
```javascript
// Create themed template collections
const urbanTemplates = {
  STREET_MUGGING: {
    title: "Back Alley Ambush",
    narrative: "As you walk through the dimly lit streets, shadowy figures emerge from the darkness...",
    // ... template definition
  },
  MARKET_CHAOS: {
    title: "Market Frenzy",
    narrative: "The marketplace erupts into chaos as traders and customers clash over a disputed deal...",
    // ... template definition
  }
};

// Register collection
Object.entries(urbanTemplates).forEach(([id, template]) => {
  generator.registerEventTemplate(id, template);
});
```

## 🎨 Theme Creator

Design custom game worlds with your own training data and atmospheric text.

### Custom Theme Building
```javascript
const themeGenerator = new RPGEventGenerator();

// Create a cyberpunk western theme
const cyberWesternTheme = {
  name: 'CyberWestern',
  author: 'GameDev',
  description: 'Blending Wild West with cyberpunk aesthetics',

  // Custom training data
  trainingData: [
    'neon signs flicker in the dusty saloon',
    'robotic sheriffs patrol the asteroid streets',
    'cyborg outlaws ride mechanical horses through digital canyons',
    'holographic wanted posters advertise bounty hunters',
    'steam-powered AI assistants serve whiskey in crystal glasses'
  ],

  // Theme configuration
  enableRuleEngine: true,
  enableRelationships: true,
  customRules: [],

  // Atmospheric settings
  tone: 'gritty',
  style: 'western_cyberpunk',
  colorPalette: ['neon_blue', 'rust_orange', 'chrome_silver']
};

// Apply the theme
themeGenerator.applyTheme(cyberWesternTheme);

// Generate events in this custom world
const cyberWesternEvent = themeGenerator.generateEvent({
  role: 'bounty_hunter',
  location: 'saloon_district',
  tech_level: 'high'
});
```

### Theme Sharing and Export
```javascript
// Export theme for sharing
const exportedTheme = themeGenerator.exportTheme('CyberWestern');
const themeJson = JSON.stringify(exportedTheme, null, 2);

// Save to file
fs.writeFileSync('themes/cyberwestern.json', themeJson);

// Import shared theme
const sharedTheme = JSON.parse(fs.readFileSync('themes/cyberwestern.json'));
themeGenerator.importTheme(sharedTheme);
```

## 🌐 Cross-Platform Export

Export events and templates for use in different game engines and platforms.

### Unity C# Export
```javascript
const unityGenerator = new RPGEventGenerator();

// Generate and export for Unity
const events = await unityGenerator.exportForUnity({
  namespace: 'MyGame.Events',
  outputPath: './unity-assets/scripts/events/',
  includeTemplates: true
});

// Creates C# files like:
/*
// MyEvent.cs
using UnityEngine;
using MyGame.Events;

public class MyEvent : EventTemplate
{
    public string title = "Ancient Mystery";
    public string narrative = "You discover an ancient artifact...";
    public Choice[] choices = new Choice[] {
        new Choice { text = "Investigate", effect = new Effect { knowledge = 10 } },
        new Choice { text = "Leave it", effect = new Effect { sanity = -5 } }
    };
}
*/
```

### Godot GDScript Export
```javascript
const godotGenerator = new RPGEventGenerator();

// Export for Godot
await godotGenerator.exportForGodot({
  outputPath: './godot-scripts/events/',
  includeResources: true
});

// Creates GDScript files:
/*
# AncientMystery.gd
extends EventTemplate

export var title: String = "Ancient Mystery"
export var narrative: String = "You discover an ancient artifact..."
export var choices: Array = [
    {
        "text": "Investigate",
        "effect": { "knowledge": 10 }
    },
    {
        "text": "Leave it",
        "effect": { "sanity": -5 }
    }
]
*/
```

### TypeScript/JavaScript Export
```javascript
const tsGenerator = new RPGEventGenerator();

// Export as TypeScript interfaces
await tsGenerator.exportForTypeScript({
  outputPath: './typescript-types/',
  generateInterfaces: true,
  includeValidation: true
});

// Creates type definitions:
/*
export interface GameEvent {
  id: string;
  title: string;
  narrative: string;
  type: EventType;
  difficulty: Difficulty;
  choices: Choice[];
  context?: EventContext;
}

export interface Choice {
  text: string;
  effect?: Effect;
  requirements?: Requirements;
  consequence?: string;
}
*/
```

## 🧪 Quality Metrics and Analysis

Built-in tools for analyzing and improving event quality.

### Quality Scoring
```javascript
const qualityAnalyzer = new RPGEventGenerator();

// Analyze event quality
const eventAnalysis = qualityAnalyzer.analyzeEventQuality(generatedEvent);

console.log(`Quality Score: ${eventAnalysis.score}/100`);
console.log(`Issues Found: ${eventAnalysis.issues.length}`);
console.log(`Suggestions: ${eventAnalysis.suggestions.join(', ')}`);

// Quality criteria:
console.log(`Narrative Length: ${eventAnalysis.narrativeLength}`);    // Ideal: 100-300 chars
console.log(`Choice Balance: ${eventAnalysis.choiceBalance}`);       // Ideal: 2-4 choices
console.log(`Consequence Clarity: ${eventAnalysis.consequenceClarity}`); // Clear outcomes
console.log(`Context Relevance: ${eventAnalysis.contextRelevance}`); // Matches player state
```

### Batch Quality Analysis
```javascript
// Analyze multiple events
const events = Array.from({ length: 50 }, () =>
  generator.generateEvent(playerContext)
);

const batchAnalysis = qualityAnalyzer.analyzeEventBatch(events);

console.log(`Average Quality: ${batchAnalysis.averageScore}`);
console.log(`Best Event: ${batchAnalysis.bestEvent.title}`);
console.log(`Quality Distribution:`, batchAnalysis.scoreDistribution);
console.log(`Common Issues:`, batchAnalysis.commonIssues);
```

### Automated Quality Improvement
```javascript
// Set quality thresholds
const qualityGenerator = new RPGEventGenerator({
  minQualityScore: 75,
  enableQualityFiltering: true,
  autoImproveQuality: true
});

// Generator will automatically regenerate low-quality events
const highQualityEvent = qualityGenerator.generateEvent(playerContext);
// Guaranteed to meet quality standards
```
