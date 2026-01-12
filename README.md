# RPG Event Generator v2.0.2

A powerful procedural event generation system for creating narratives, events, and interactive experiences across games, stories, and applications.

## ✨ What's New in v2.0.2

- 🎨 **Theme Creator**: Build custom themes with your own training data
- 🧠 **Rule Engine**: Create conditional rules that modify event generation
- 🎲 **Pure Markov Mode**: Generate events purely from custom text (no templates)
- 🌐 **Cross-Platform Export**: Unity C#, Godot GDScript, TypeScript support
- 📚 **Template Library**: 429 professionally crafted event templates included across 7 genres (fantasy, sci-fi, horror, historical, modern, cyberpunk, space-opera)
- 🏗️ **Creative Tools**: Visual tools for event customization

## Installation

```bash
npm install rpg-event-generator
```

## Quick Start

```javascript
import { RPGEventGenerator, generateRPGEvent } from 'rpg-event-generator';

// Simple event generation
const event = generateRPGEvent({
  age: 25,
  gold: 500,
  influence: 15,
  career: 'merchant'
});

console.log(event.title);        // "Golden Opportunity"
console.log(event.description);  // Procedurally generated narrative
console.log(event.choices);      // Array of meaningful choices
```

## Demo

Run the included demo to see Context Weaver in action:

```bash
# Using npm script (recommended)
npm run demo

# Direct script call
node demo.js
```

This will demonstrate various features including event generation, chains, time progression, and customization options.

## Features

- **Infinite Event Generation**: Custom Markov chains create unique, contextual events
- **Player-Aware**: Events adapt to stats, career, relationships, reputation, and social standing
- **14+ Event Types**: Court scandals, noble duels, ancient curses, bandit kings, and more
- **Immersive Storytelling**: Rich narratives with atmospheric descriptions and meaningful consequences
- **Dynamic Difficulty Scaling**: Events automatically scale based on player power level
- **Thematic Training Sets**: Fantasy, sci-fi, and historical themes with cultural variants
- **Event Chains**: Multi-part story sequences with escalating consequences
- **Time-Based Events**: Seasonal changes and evolving long-term storylines
- **Modular Event System**: Create and manage custom templates, training data, and chains
- **Game Integration**: Proper save/load state management for real games
- **Comprehensive Testing**: 45+ automated tests ensuring reliability

### Enhanced Features (v1.2.0+)

- **Multi-Language Support**: Generate events in different languages with cultural adaptation
- **Event Dependencies**: Complex prerequisite systems for event triggering
- **Environmental Modifiers**: Weather, season, and location-based event modifications
- **NPC Relationships**: Dynamic character relationship networks and social consequences
- **Event Templates Library** (v1.3.0): Pre-built genre-specific event collections for fantasy, sci-fi, horror, and historical themes, with support for custom template creation

### Revolutionary Features (v2.0.1) 🎉

- **🎨 Theme Creator**: Design custom game worlds with your own training data and atmospheric text
- **🧠 Rule Engine**: Create sophisticated conditional rules that dynamically modify events based on player state, location, stats, and more
- **🎲 Pure Markov Mode**: Generate completely custom events using only your provided text - no templates required
- **💰 Event Economy**: User-generated content marketplace with theme sharing, rule packs, and quality metrics
- **📚 Template Library**: Generate hundreds of events across 7 genres using included CLI export tools
- **🌐 Cross-Platform Export**: Export events in JSON and TypeScript formats (Unity/Godot integration guides available)
- **⚙️ Creative Tools**: Visual interfaces for theme building, rule creation, and advanced customization

### Planned Engine Integrations (Future Release)

- **🎮 Unity Plugin**: Package Manager compatible integration (planned)
- **🎯 Godot Addon**: Asset Library compatible addon (planned)
- **🔗 Game Engine Guides**: Integration patterns and API examples available now

## Event Economy System 💰

The Event Economy enables **user-generated content sharing** and marketplace functionality for custom themes, rules, and content packs.

### Key Features

- **🎨 Theme Marketplace**: Save, share, and import custom themes with training data
- **🧠 Rule Pack Sharing**: Exchange collections of custom rules between users
- **📦 Content Packs**: Bundle themes and rules into complete game configurations
- **⭐ Quality Metrics**: Automatic quality scoring for shared content
- **📤 Export/Import**: Easy sharing via JSON files

### Basic Usage

```javascript
const EventEconomy = require('./scripts/event-economy');

// Initialize the system
const economy = new EventEconomy('./my-user-content');

// Save a custom theme
const themeData = {
  author: 'YourName',
  description: 'Cyberpunk western theme',
  tags: ['cyberpunk', 'western', 'scifi'],
  theme: 'cyberpunk',
  culture: 'western',
  trainingData: [
    'neon signs flicker in the dusty saloon',
    'robotic sheriffs patrol the asteroid streets',
    'cyborg outlaws ride mechanical horses'
  ],
  enableRuleEngine: true,
  customRules: [] // your custom rules here
};

const filepath = economy.saveTheme('CyberWestern', themeData);
console.log(`Theme saved to: ${filepath}); // ./my-user-content/themes/cyberwestern.json

// List available themes
const themes = economy.listThemes();
console.log('Available themes:', themes);

// Load and use a theme
const loadedTheme = economy.loadTheme('CyberWestern');
// Use with generator...
```

### CLI Tools

The Event Economy includes command-line tools for content management:

```bash
# Using npm scripts (recommended)
npm run economy:list
npm run economy:stats

# Using direct script calls
node scripts/event-economy.js list-themes
node scripts/event-economy.js stats

# Save a theme (API integration needed)
node scripts/event-economy.js save-theme "MyTheme"
```

For global installation, you can also use:
```bash
npx rpg-events list-themes
npx rpg-export unity fantasy
```

### Content Pack Creation

```javascript
// Create a complete content pack
const packData = {
  author: 'ContentCreator',
  description: 'Complete cyberpunk western adventure pack',
  theme: themeData, // include your theme
  rulePacks: ['combat-rules', 'dialogue-rules'] // reference rule packs
};

const packPath = economy.createContentPack('CyberWesternAdventure', packData);
```

### File Formats

#### Theme Files (`themes/*.json`)
```json
{
  "name": "CyberWestern",
  "version": "1.0.0",
  "author": "YourName",
  "description": "Cyberpunk western theme",
  "tags": ["cyberpunk", "western"],
  "settings": {
    "theme": "cyberpunk",
    "culture": "western",
    "enableRuleEngine": true,
    "pureMarkovMode": false
  },
  "trainingData": ["sentence 1", "sentence 2"],
  "customRules": [],
  "statistics": {
    "trainingSentences": 2,
    "estimatedQuality": 85
  }
}
```

#### Rule Pack Files (`rules/*.json`)
```json
{
  "name": "CombatRules",
  "rules": [
    {
      "name": "weak_enemy_bonus",
      "conditions": [
        {"type": "stat_less_than", "stat": "level", "value": 5}
      ],
      "effects": [
        {"type": "modify_difficulty", "value": -1}
      ]
    }
  ]
}
```

### Quality Metrics

Themes are automatically scored on:
- **Training Data Quality**: Sentence variety and length
- **Rule Complexity**: Advanced rule usage
- **Completeness**: All required fields present
- **Metadata**: Author info, tags, descriptions

### Integration with Generator

```javascript
// Load theme and apply to generator
const theme = economy.loadTheme('CyberWestern');
const generator = new RPGEventGenerator({
  theme: theme.settings.theme,
  culture: theme.settings.culture,
  trainingData: theme.trainingData,
  customRules: theme.customRules,
  enableRuleEngine: theme.settings.enableRuleEngine
});

// Generate events with custom theme
const event = generator.generateEvent();
```

## Usage Guide

### Basic Event Generation

```javascript
const generator = new RPGEventGenerator();
const event = generator.generateEvent();

console.log(event);
// {
//   id: "event_1704567890123_xyz789",
//   title: "Perilous Bandit King's Challenge",
//   description: "Generated narrative based on Markov chains...",
//   choices: [
//     { text: "Fight back", effect: { health: -20, reputation: 25 } },
//     { text: "Pay tribute", effect: { gold: -200, safe_passage: true } }
//   ],
//   type: "BANDIT_KING",
//   difficulty: "normal"
// }
```

### Context-Aware Events

```javascript
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

const event = generator.generateEvent(playerContext);
// Generates events appropriate to noble career, high influence, winter season
```

### Custom Training Data

Enhance text generation with your own story fragments:

```javascript
const customTrainingData = [
  'In the shadowed alleys of the ancient city',
  'The dragon\'s roar echoes through the misty mountains',
  'Elven merchants display their enchanted crystal wares',
  'A dwarven smith forges weapons of legendary power',
  'The tavern overflows with adventurers and mysterious strangers',
  'Ancient runes glow with ethereal magical energy',
  'The enchanted forest whispers secrets to those who listen carefully'
];

const generator = new RPGEventGenerator({
  trainingData: customTrainingData
});

// Events will now incorporate your custom story elements
const event = generator.generateEvent();
// May generate: "In the shadowed alleys of the ancient city, a mysterious stranger approaches..."
```

### Thematic Training Sets

```javascript
// Fantasy (default) - knights, magic, dragons
const fantasyGen = new RPGEventGenerator({ theme: 'fantasy' });

// Fantasy with Norse culture - vikings, runes, fjords
const norseGen = new RPGEventGenerator({
  theme: 'fantasy',
  culture: 'norse'
});
const norseEvent = norseGen.generateEvent();
// Generates: "The longships sail into the fjord under the northern lights..."

// Sci-fi - corporations, AI, space exploration
const sciFiGen = new RPGEventGenerator({ theme: 'sci-fi' });

// Cyberpunk sci-fi - neon cities, megacorps, hackers
const cyberpunkGen = new RPGEventGenerator({
  theme: 'sci-fi',
  culture: 'cyberpunk'
});
const cyberEvent = cyberpunkGen.generateEvent();
// Generates: "Neon lights reflect off rain-slicked streets in the megacity sprawl..."

// Historical - medieval politics, exploration, warfare
const historicalGen = new RPGEventGenerator({ theme: 'historical' });

// Victorian historical - industrial revolution, social reform
const victorianGen = new RPGEventGenerator({
  theme: 'historical',
  culture: 'victorian'
});
const victorianEvent = victorianGen.generateEvent();
// Generates: "Steam engines power the industrial revolution across soot-stained cities..."
```

### Event Chains

```javascript
// Start a multi-part storyline
const generator = new RPGEventGenerator();
const firstEvent = generator.startChain('BANDIT_RISING');

console.log(firstEvent.title); // "Treacherous Bandit Ambush"
console.log(firstEvent.chainId); // "chain_1704567890123_xyz789"

// Advance chain based on player choice
const nextEvent = generator.advanceChain(firstEvent.chainId, 'hero');
console.log(nextEvent.title); // "Perilous Bandit King's Challenge"

// Check active chains
const activeChains = generator.getActiveChains();
console.log(`Active chains: ${activeChains.length}`);

// Available built-in chains:
// - BANDIT_RISING: Highway robbery escalating to kingdom threat
// - COURT_SCANDAL_CHAIN: Royal intrigue with multiple betrayals
// - CURSE_OF_THE_ARTIFACT: Ancient curse with escalating effects
// - MERCHANT_EMPIRE: Trade empire building with setbacks
```

### Time-Based Events

```javascript
// Advance game time and handle due events
const dueEvents = generator.advanceGameDay();

dueEvents.forEach(event => {
  if (event.type === 'time_based_chain') {
    const chainData = generator.timeSystem.timeBasedEvents.get(event.chainId);
    const gameEvent = generator.generateChainEvent(chainData);
    // Add to your game's event system
  }
});

// Start evolving storylines
generator.startTimeBasedChain('POLITICAL_UPRISING');
// - Day 1: Whispers of dissent appear
// - Day 7: Public protests erupt
// - Day 14: Open rebellion begins
// - Day 21: Revolutionary climax

// Check current game time
const currentTime = generator.getCurrentTime();
console.log(`Day ${currentTime.day}, Season: ${currentTime.season}`);
```

### Multi-Language Support

Generate events in different languages with cultural adaptation:

```javascript
const generator = new RPGEventGenerator({
  language: 'es',  // Spanish events
  theme: 'fantasy'
});

// Load additional language packs
generator.loadLanguagePack('fr', frenchTranslations);
generator.setLanguage('fr');

// Events now generate in French
const event = generator.generateEvent();
console.log(event.title); // "Embuscade de Brigands"
```

### Environmental Modifiers

Weather, season, and location affect event generation:

```javascript
const generator = new RPGEventGenerator({ enableModifiers: true });

// Set environmental context
generator.setEnvironmentalContext({
  weather: 'storm',
  season: 'winter',
  timeOfDay: 'night'
});

// Events adapt to harsh winter storm conditions
const event = generator.generateEnhancedEvent({
  environment: { weather: 'storm', season: 'winter' }
});
```

### Event Dependencies

Complex prerequisite systems control when events can occur:

```javascript
// Register event dependencies
generator.registerEventDependency('ROYAL_WEDDING', {
  type: 'event_completed',
  eventId: 'COURT_INTRODUCTION'
});

generator.registerEventDependency('ADVANCED_QUEST', {
  operator: 'AND',
  conditions: [
    { type: 'stat_requirement', stat: 'level', min: 5 },
    { type: 'event_completed', eventId: 'BASIC_QUEST' }
  ]
});

// Only generate events whose dependencies are met
const gameState = { completedEvents: new Set(['COURT_INTRODUCTION']) };
const event = generator.generateEnhancedEvent({ gameState });
```

### NPC Relationship Networks

Dynamic character relationships that evolve based on player actions:

```javascript
const generator = new RPGEventGenerator({ enableRelationships: true });

// Add NPCs to the relationship network
generator.addNPC({
  id: 'king_arthur',
  name: 'King Arthur',
  type: 'noble'
});

// Update relationships based on player actions
generator.applyRelationshipRule('king_arthur', 'player', 'save_life');
// Relationship with king improves significantly

generator.updateRelationship('merchant_john', 'player', -10, 'stole goods');
// Relationship with merchant deteriorates

// Generate events that consider relationship context
const event = generator.generateEnhancedEvent({
  player: { id: 'player' }
});
```

### Event Templates Library (v1.3.0)

Use the included library of 429 professionally crafted event templates across 7 genres:

```javascript
const generator = new RPGEventGenerator({
  enableTemplates: true,
  templateLibrary: 'fantasy'  // Load fantasy templates
});

// Generate from specific template
const dragonEvent = generator.generateFromTemplate('dragon_lair');
console.log(dragonEvent.title); // "Ancient Dragon's Lair"

// Generate random event from genre
const fantasyEvent = generator.generateFromGenre('fantasy');

// Discover available templates
const availableTemplates = generator.getAvailableTemplates();
console.log(Object.keys(availableTemplates)); // ['fantasy', 'sci-fi', etc.]
```

You can also export templates to other formats using CLI tools:

```bash
# Export templates for different engines
npm run export:unity fantasy        # Unity C# ScriptableObjects
npm run export:godot cyberpunk      # Godot GDScript Resources
npm run export:typescript space-opera # TypeScript interfaces
```

Each template includes:
- **Rich narratives** with atmospheric descriptions
- **Multiple meaningful choices** with consequences
- **Difficulty scaling** and context requirements
- **Professional quality** event design

**Available genres**: 'fantasy', 'sci-fi', 'horror', 'historical', 'modern', 'cyberpunk', 'space-opera'

#### Custom Template Creation
Add your own templates to the library system:

```javascript
// Create a custom template
const myTemplate = {
  title: 'Space Station Malfunction',
  narrative: 'Critical system failure detected. Alarms blare throughout the station.',
  choices: [
    {
      text: 'Attempt emergency repair',
      effect: { risk: 30, engineering: 20 },
      consequence: 'repair_attempt'
    },
    {
      text: 'Abandon the station',
      effect: { survival: 10, resources: -50 },
      consequence: 'abandon_station'
    }
  ],
  type: 'TECHNICAL_CRISIS',
  difficulty: 'hard',
  tags: ['space', 'technology', 'emergency']
};

// Add to your game's template collection
// Templates can be saved as JSON files in custom directories
```

### Modular Event System

```javascript
// Register custom event templates
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

generator.registerEventTemplate('MYSTIC_VISION', customTemplate);

// Add custom training data for better text generation
generator.addCustomTrainingData([
  'The ancient prophecy foretells of great change',
  'Mystic visions reveal hidden truths to the worthy',
  'Dreams of the future guide the destinies of heroes'
], 'mystical');

// Create custom event chains
const visionChain = {
  name: 'Prophetic Journey',
  description: 'A chain of events triggered by mystic visions',
  stages: [
    { day: 1, template: 'MYSTIC_VISION' },
    { day: 5, template: 'ANCIENT_RUINS' },
    { day: 10, template: 'FINAL_PROPHECY' }
  ]
};

generator.registerEventChain('PROPHECY_CHAIN', visionChain);

// Export/import custom content for sharing
const customContent = generator.exportCustomContent();
console.log('Exported:', Object.keys(customContent.templates).length, 'templates');

const newGenerator = new RPGEventGenerator();
const importResult = newGenerator.importCustomContent(customContent);
console.log('Imported:', importResult.templates.success, 'templates');
```

### Dynamic Difficulty Scaling

Events automatically scale based on player power level:

```javascript
// Weak character (easy difficulty)
const weakling = {
  gold: 50,
  influence: 10,
  skills: { combat: 20 }
};
const easyEvent = generator.generateEvent(weakling);
console.log(`Difficulty: ${easyEvent.difficulty}`); // "easy"
// Effects scaled for beginners: higher rewards, lower penalties

// Powerful character (hard difficulty)
const hero = {
  gold: 50000,
  influence: 500,
  skills: { combat: 100, diplomacy: 80 },
  relationships: [{ name: 'King', type: 'ally', relationship: 80 }]
};
const hardEvent = generator.generateEvent(hero);
console.log(`Difficulty: ${hardEvent.difficulty}`); // "hard"
// Effects scaled for challenge: lower rewards, higher penalties

// Legendary character (legendary difficulty)
const godlike = {
  gold: 200000,
  influence: 1000,
  skills: { combat: 200, diplomacy: 150 },
  age: 120,
  reputation: 95
};
const epicEvent = generator.generateEvent(godlike);
console.log(`Difficulty: ${epicEvent.difficulty}`); // "legendary"
// Effects scaled for epic gameplay: minimal rewards, maximum penalties
```

**Difficulty Tiers:**
- **Easy** (Power 0-50): Generous rewards, forgiving penalties
- **Normal** (Power 25-150): Standard scaling, balanced challenges
- **Hard** (Power 100-300): Reduced rewards, harsher penalties
- **Legendary** (Power 250+): Minimal rewards, extreme challenges

## 🔧 API Reference

### Constructor Options

```javascript
const generator = new RPGEventGenerator({
  // Core options
  stateSize: 2,           // Markov chain state size (default: 2)
  trainingData: [...],     // Custom training data array
  theme: 'fantasy',        // 'fantasy', 'sci-fi', 'historical'
  culture: 'norse',        // Cultural variant within theme

  // Enhanced features (all enabled by default)
  enableDependencies: true,    // Complex event prerequisites
  enableModifiers: true,       // Weather/season/location modifiers
  enableRelationships: true,   // NPC relationship networks
  language: 'en'               // Default language for events
});
```

### Core Methods

- `generateEvent(playerContext)` - Generate single event
- `generateEvents(playerContext, count)` - Generate multiple events
- `generateTimeAwareEvent(playerContext)` - Generate season-aware event

### Event Chain Methods

- `startChain(chainId)` - Start choice-based event chain
- `advanceChain(chainId, choice)` - Advance chain based on choice
- `getActiveChains()` - Get all active chains

### Time-Based Methods

- `advanceGameDay()` - Advance time and return due events
- `startTimeBasedChain(chainId)` - Start time-evolving chain
- `getCurrentTime()` - Get current game time/season
- `getActiveTimeChains()` - Get active time-based chains

### Game State Methods

- `getGameState()` - Export complete game state
- `loadGameState(state)` - Import saved game state

### Modular Methods

- `registerEventTemplate(id, template)` - Add custom event template
- `addCustomTrainingData(data, category)` - Add custom training data
- `registerEventChain(id, chainConfig)` - Add custom event chain
- `exportCustomContent()` - Export custom templates/chains/data
- `importCustomContent(content)` - Import custom content

### Player Context Object

```javascript
{
  age: number,                    // Player age
  gold: number,                   // Player wealth
  influence: number,              // Political/social influence
  reputation: number,             // Social reputation
  career: string,                 // Player's career/job ('noble', 'merchant', 'warrior', etc.)
  skills: {                       // Skill levels object
    combat: number,               // 0-100 scale
    diplomacy: number,
    intrigue: number,
    magic: number,
    survival: number
  },
  relationships: [{               // Array of NPC relationships
    name: string,                 // NPC name
    type: string,                 // 'friend', 'lover', 'ally', 'enemy', 'rival'
    relationship: number          // Relationship strength (0-100)
  }],
  location: string,               // Current location ('capital', 'village', 'forest', etc.)
  season: string                  // Current season ('spring', 'summer', 'autumn', 'winter')
}
```

### Complete Event Object Structure

```javascript
{
  id: "event_1704567890123_xyz789",    // Unique event identifier
  title: "Perilous Bandit King's Challenge", // Dynamic, context-aware title
  description: "The infamous bandit king blocks your path, offering you a choice...", // Rich procedural description
  narrative: "The infamous bandit king blocks your path, offering you a choice: join his band or face certain death.",
  choices: [
    {
      text: "Join the bandits",
      effect: { gold: 375, reputation: -23, combat_skill: 12 },
      consequence: "bandit"
    },
    {
      text: "Challenge him to single combat",
      effect: { reputation: 32, health: -18 },
      requirements: { combat_skill: 60 },
      consequence: "hero"
    },
    {
      text: "Bribe your way past",
      effect: { gold: -320, safe_passage: true },
      consequence: "diplomat"
    }
  ],
  type: "BANDIT_KING",
  consequence: null,
  context: { /* Full context used for generation */ },
  urgency: "normal",
  theme: "adventure",
  difficulty: "normal"

}
```

## 🎨 v2.0.0 Theme Creator

Create completely custom game worlds with your own atmospheric text and storytelling style.

### Custom Theme Creation

```javascript
const generator = new RPGEventGenerator({
  trainingData: [
    'Space cowboys patrol asteroid fields on mechanical horses',
    'Neon-lit cantinas echo with the hum of quantum pianos',
    'Laser revolvers fire streams of pure starlight',
    'Alien saloons serve drinks that change your memories',
    'Robotic sheriffs maintain order in floating colonies'
  ],
  theme: 'sci-fi',
  culture: 'western'
});

// Events will incorporate your custom atmosphere
const event = generator.generateEvent({
  career: 'gunslinger',
  location: 'asteroid-town'
});
```

### Pure Markov Mode

Generate events using only your custom training data - completely bypassing templates.

```javascript
const pureGenerator = new RPGEventGenerator({
  trainingData: [
    'Crystal caves echo with ancient magic',
    'Shadowy figures move through fog-shrouded forests',
    'Forgotten ruins hide treasures and traps',
    'Mysterious merchants offer enchanted artifacts',
    'Wandering bards sing tales of lost kingdoms'
  ],
  pureMarkovMode: true,  // No templates used
  enableTemplates: false
});

// Generates events purely from your text
const event = pureGenerator.generateEvent();
// Type: "MARKOV_GENERATED"
// Title: "Crystal caves echo with ancient magic."
// Description: Generated purely from your atmospheric training sentences
```

## 🧠 v2.0.0 Rule Engine

Create intelligent, conditional rules that modify events based on player state and game context.

### Basic Rule Creation

```javascript
const generator = new RPGEventGenerator({
  enableRuleEngine: true
});

// Add a wealthy player bonus
generator.addCustomRule('wealthy_bonus', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'gold', value: 1000 } }
  ],
  effects: {
    addTags: ['wealthy_player'],
    modifyChoices: {
      multiply: { gold: 1.3 },  // 30% more gold rewards
      add: { reputation: 5 }    // Bonus reputation
    }
  }
});

// Events for wealthy players get enhanced
const wealthyEvent = generator.generateEvent({ gold: 2000 });
console.log(wealthyEvent.tags); // Includes 'wealthy_player'
```

### Advanced Rule Conditions

```javascript
// Complex conditional logic
generator.addCustomRule('noble_intrigue', {
  conditions: [
    { type: 'and', params: {
      conditions: [
        { type: 'career_is', params: { career: 'noble' } },
        { type: 'location_is', params: { location: 'castle' } },
        { type: 'stat_greater_than', params: { stat: 'influence', value: 50 } }
      ]
    }}
  ],
  effects: {
    modifyTitle: { append: ' (Royal Privilege)' },
    setDifficulty: 'hard',
    addTags: ['noble_bonus', 'court_influence']
  }
});

// Available condition types:
// - stat_greater_than, stat_less_than, stat_between
// - location_is, season_is, career_is, time_greater_than
// - has_item, relationship_status
// - random_chance
// - and, or, not (for combining conditions)
```

### Rule Management

```javascript
// Validate rules before adding
const rule = { /* your rule */ };
const validation = generator.validateCustomRule(rule);
if (validation.valid) {
  generator.addCustomRule('my_rule', rule);
} else {
  console.log('Rule errors:', validation.errors);
}

// Manage rules
console.log(generator.getCustomRules());  // View all rules
generator.removeCustomRule('my_rule');    // Remove specific rule
generator.clearCustomRules();             // Remove all rules
```

## 🌐 v2.0.0 Cross-Platform Export

Export your events directly to game engines.

### Unity Integration

```javascript
// Programmatic export
const exporter = require('./scripts/export-templates.js');
exporter.exportTemplates('unity', 'fantasy');

// Creates: templates/unity/fantasy/event_1.cs
// Result: Event1.cs - Unity ScriptableObject
```

```bash
# Using npm scripts
npm run export:unity fantasy

# Direct script call
node scripts/export-templates.js unity fantasy
```

### Godot Integration

```javascript
// Export for Godot
const exporter = require('./scripts/export-templates.js');
exporter.exportTemplates('godot', 'cyberpunk');

// Creates: templates/godot/cyberpunk/event_1.gd
// Result: Event1.gd - Godot Resource script
```

```bash
# Using npm scripts
npm run export:godot cyberpunk

# Direct script call
node scripts/export-templates.js godot cyberpunk
```

### TypeScript Support

```javascript
// Export as TypeScript interfaces
const exporter = require('./scripts/export-templates.js');
exporter.exportTemplates('typescript', 'space-opera');

// Creates: templates/typescript/space-opera/event_1.ts
// Result: Strongly-typed event definitions
```

```bash
# Using npm scripts
npm run export:typescript space-opera

# Direct script call
node scripts/export-templates.js typescript space-opera
```

## 📊 v2.0.0 Enhanced Template Library

Generate 400+ professionally crafted events across 7 genres:

- **Fantasy**: Knights, dragons, magic, medieval politics
- **Sci-Fi**: Space exploration, technology, alien encounters
- **Horror**: Supernatural terror, psychological horror
- **Historical**: Medieval courts, exploration, diplomacy
- **Modern**: Contemporary settings, urban adventures
- **Cyberpunk**: Neon cities, hackers, megacorporations
- **Space Opera**: Galactic empires, starships, cosmic conflicts

### Template Integration

```javascript
// Load genre-specific templates
const fantasyGen = new RPGEventGenerator({
  enableTemplates: true,
  templateLibrary: 'fantasy'
});

// Generate from specific genre
const fantasyEvent = fantasyGen.generateFromGenre('fantasy');
const horrorEvent = fantasyGen.generateFromTemplate('haunted_mansion');

// Available templates
console.log(fantasyGen.getAvailableTemplates());
// { fantasy: [...], sci-fi: [...], horror: [...], etc. }
```

## 🎯 v2.0.0 API Reference

### Constructor Options (v2.0.0 additions)

```javascript
const generator = new RPGEventGenerator({
  // v1.x options still supported
  theme: 'fantasy',
  culture: 'norse',
  trainingData: [...],
  enableModifiers: true,

  // v2.0.0 new options
  enableRuleEngine: true,     // Enable custom rules system
  customRules: {},           // Pre-load custom rules
  pureMarkovMode: false,     // Generate purely from training data
  templateLibrary: null,     // Load specific template genre
  chance: new Chance()        // Custom Chance.js instance (optional)
});
```

### New Methods (v2.0.0)

```javascript
// Rule Engine
generator.addCustomRule(name, ruleDefinition);
generator.removeCustomRule(name);
generator.getCustomRules();
generator.clearCustomRules();
generator.validateCustomRule(rule);

// Template System
generator.generateFromTemplate(templateId);
generator.generateFromGenre(genre);
generator.getAvailableTemplates();

// Export System (via export-templates.js)
exporter.exportTemplates('unity', 'fantasy');
exporter.exportTemplates('godot', 'cyberpunk');
exporter.exportTemplates('typescript', 'space-opera');
```

## 🔄 v2.0.0 Migration Guide

### From v1.x to v2.0.0

**✅ Fully Backward Compatible**
- All existing code continues to work unchanged
- v1.x features remain fully functional
- No breaking changes to existing API

**🚀 New Features are Opt-in**
```javascript
// v1.x code - still works perfectly
const generator = new RPGEventGenerator();

// v2.0.0 enhancements - opt-in only
const enhancedGenerator = new RPGEventGenerator({
  enableRuleEngine: true,     // New feature
  pureMarkovMode: false,      // New feature
  templateLibrary: 'fantasy'  // Enhanced feature
});
```

**📈 Performance Improvements**
- Optimized rule evaluation
- Efficient template loading
- Better memory management for large template libraries

**🎲 Custom Randomness Control**
```javascript
// For games that need deterministic randomness or custom seeding
const customChance = new Chance('your-seed-here');
const generator = new RPGEventGenerator({
  chance: customChance  // Optional: pass your own Chance instance
});

// For testing with predictable results
const testChance = new Chance(12345);  // Always same results
const testGenerator = new RPGEventGenerator({
  chance: testChance
});
```

## 🎮 Game Integration

### Real-Time Strategy Integration

```javascript
function onNewGameDay() {
  const dueEvents = generator.advanceGameDay();

  dueEvents.forEach(event => {
    if (event.type === 'time_based_chain') {
      const chainData = generator.timeSystem.timeBasedEvents.get(event.chainId);
      const gameEvent = generator.generateChainEvent(chainData);
      triggerInGameEvent(gameEvent);
    } else if (event.type === 'seasonal_random') {
      const seasonalEvent = generator.generateTimeAwareEvent(playerContext);
      triggerInGameEvent(seasonalEvent);
    }
  });
}
```

### React Game Integration

```javascript
import React, { useState, useEffect } from 'react';
import { RPGEventGenerator } from 'rpg-event-generator';

function GameEventSystem({ playerStats }) {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [generator] = useState(() => new RPGEventGenerator());

  useEffect(() => {
    // Generate event when time advances
    const event = generator.generateEvent(playerStats);
    setCurrentEvent(event);
  }, [playerStats, generator]);

  const handleChoice = (choiceIndex) => {
    const choice = currentEvent.choices[choiceIndex];
    // Apply effects to player stats
    applyEffects(choice.effect);
    setCurrentEvent(null); // Clear event
  };

  if (!currentEvent) return <div>No active events</div>;

  return (
    <div className="event-dialog">
      <h2>{currentEvent.title}</h2>
      <p>{currentEvent.description}</p>
      <div className="choices">
        {currentEvent.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleChoice(index)}
            className="choice-button"
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Redux Integration

```javascript
// Action Types
export const GENERATE_EVENT = 'GENERATE_EVENT';
export const RESOLVE_EVENT = 'RESOLVE_EVENT';
export const ADVANCE_GAME_DAY = 'ADVANCE_GAME_DAY';

// Action Creators
export const generateEvent = (playerContext) => ({
  type: GENERATE_EVENT,
  payload: { playerContext }
});

export const resolveEvent = (eventId, choiceIndex) => ({
  type: RESOLVE_EVENT,
  payload: { eventId, choiceIndex }
});

export const advanceGameDay = () => ({
  type: ADVANCE_GAME_DAY
});

// Reducer
const initialState = {
  generator: new RPGEventGenerator(),
  currentEvent: null,
  gameTime: { day: 1, season: 'spring' }
};

const eventReducer = (state = initialState, action) => {
  switch (action.type) {
    case GENERATE_EVENT:
      const event = state.generator.generateEvent(action.payload.playerContext);
      return { ...state, currentEvent: event };

    case RESOLVE_EVENT:
      // Apply choice effects to player state
      const choice = state.currentEvent.choices[action.payload.choiceIndex];
      const newPlayerState = applyChoiceEffects(choice.effect);
      return {
        ...state,
        currentEvent: null,
        playerState: newPlayerState
      };

    case ADVANCE_GAME_DAY:
      const dueEvents = state.generator.advanceGameDay();
      return {
        ...state,
        gameTime: state.generator.getCurrentTime(),
        dueEvents: dueEvents
      };

    default:
      return state;
  }
};
```

### Save/Load System

```javascript
// Save complete game state
function saveGame(playerState) {
  const gameState = {
    player: playerState,
    events: generator.getGameState(),
    timestamp: Date.now()
  };

  localStorage.setItem('rpgGameSave', JSON.stringify(gameState));
  console.log('Game saved successfully');
}

// Load complete game state
function loadGame() {
  try {
    const savedGame = JSON.parse(localStorage.getItem('rpgGameSave'));
    if (!savedGame) return false;

    // Restore generator state
    generator.loadGameState(savedGame.events);

    // Restore player state
    return savedGame.player;

  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}
```

## 🧪 Testing

```bash
npm test
```

**Comprehensive test coverage (70+ tests):**
- ✅ Core event generation and validation
- ✅ Context adaptation and player responsiveness
- ✅ Thematic systems and cultural variants
- ✅ Event chains and multi-stage progression
- ✅ Dynamic difficulty scaling
- ✅ Time systems and seasonal mechanics
- ✅ Modular features and custom content
- ✅ Edge cases and error handling
- ✅ Game state persistence and integration
- ✅ **Event Economy system (25+ tests)**
  - Theme saving/loading/export/import
  - Rule pack management
  - Content pack creation
  - Quality metrics and statistics
  - File I/O operations and validation

## 🎯 Event Types

### Court & Political
- **Court Scandal**: Royal intrigue with betrayal and scandal
- **Noble Duel**: Honour challenges and duels of reputation
- **Market Crash**: Economic disasters affecting trade
- **Trade War**: Merchant rivalries and economic warfare

### Criminal Underworld
- **Thieves' Guild**: Criminal organisation recruitment
- **Blackmail Opportunity**: Leverage compromising information
- **Bandit King Challenge**: Highway robbery confrontations

### Supernatural & Mysterious
- **Ancient Curse**: Cursed artefacts and afflictions
- **Ghostly Visitation**: Spirits seeking justice
- **Lost Civilisation**: Archaeological discoveries

### Personal & Dramatic
- **Forbidden Love**: Romance across social boundaries
- **Family Secret**: Hidden lineage revelations
- **Desertion Temptation**: Military loyalty crises
- **Mercenary Contract**: Dangerous employment opportunities

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, and pull requests.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ContextWeaver/context-weaver.git
cd rpg-event-generator

# Install dependencies
npm install

# Run tests
npm test

# Run demo
npm run demo

# Build for distribution
npm run build
```

### Guidelines

- **Issues**: Use the GitHub issue tracker for bugs and feature requests
- **Pull Requests**: Please include tests for new features and bug fixes
- **Code Style**: Follow existing code style and conventions
- **Documentation**: Update README and code comments as needed

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Chance.js](https://chancejs.com/) for random number generation
- Custom Markov chain implementation for procedural text generation

---

**Weave infinite narratives with Context Weaver!** 🧵📚✨
