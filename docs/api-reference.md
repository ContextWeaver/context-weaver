# API Reference

Complete API documentation for RPG Event Generator.

## 📋 Table of Contents

- [Constructor](#constructor)
- [Core Methods](#core-methods)
- [Event Chain Methods](#event-chain-methods)
- [Time Methods](#time-methods)
- [State Management](#state-management)
- [Template Methods](#template-methods)
- [Rule Engine Methods](#rule-engine-methods)
- [Relationship Methods](#relationship-methods)
- [Dependency Methods](#dependency-methods)
- [Modifier Methods](#modifier-methods)
- [Export Methods](#export-methods)
- [Utility Methods](#utility-methods)
- [Data Structures](#data-structures)

## Constructor

### `new RPGEventGenerator(options?)`

Creates a new RPG Event Generator instance.

#### Parameters
- `options` (Object, optional): Configuration options

#### Options
```javascript
{
  // Core Settings
  theme: 'fantasy',           // 'fantasy', 'sci-fi', 'historical'
  culture: 'medieval',        // Cultural variant within theme
  language: 'en',             // Default language: 'en', 'es', 'fr'

  // Feature Toggles
  enableRuleEngine: true,     // Enable conditional rules
  enableRelationships: true,  // Enable NPC relationships
  enableDependencies: true,   // Enable event dependencies
  enableModifiers: true,      // Enable environmental modifiers

  // Quality Settings
  minQualityScore: 75,        // Minimum quality threshold (0-100)
  maxComplexity: 8,           // Maximum event complexity
  enableQualityFiltering: true, // Filter low-quality events

  // Markov Settings
  markovOrder: 2,             // Markov chain order (1-4)
  creativity: 0.8,            // Randomness factor (0-1)

  // Debug Settings
  debug: false,               // Enable debug logging
  logLevel: 'info'            // 'error', 'warn', 'info', 'debug'
}
```

#### Example
```javascript
const generator = new RPGEventGenerator({
  theme: 'fantasy',
  culture: 'norse',
  enableRuleEngine: true,
  minQualityScore: 80
});
```

## Core Methods

### `generateEvent(playerContext?)`

Generates a single event based on player context.

#### Parameters
- `playerContext` (Object, optional): Player character data

#### Returns
- `Event`: Generated event object

#### Example
```javascript
const event = generator.generateEvent({
  age: 25,
  gold: 500,
  career: 'merchant',
  reputation: 45
});

console.log(event.title); // "Merchant's Dilemma"
```

### `generateEvents(playerContext, count)`

Generates multiple events.

#### Parameters
- `playerContext` (Object, optional): Player character data
- `count` (number): Number of events to generate

#### Returns
- `Event[]`: Array of generated events

#### Example
```javascript
const events = generator.generateEvents(playerContext, 5);
events.forEach(event => console.log(event.title));
```

### `generateRPGEvent(playerContext)`

Static method for quick event generation.

#### Parameters
- `playerContext` (Object, optional): Player character data

#### Returns
- `Event`: Generated event object

#### Example
```javascript
import { generateRPGEvent } from 'rpg-event-generator';
const event = generateRPGEvent({ level: 10 });
```

## Event Chain Methods

### `startChain(chainId)`

Starts a new event chain.

#### Parameters
- `chainId` (string): Identifier for the chain type

#### Returns
- `Event`: First event in the chain

#### Example
```javascript
const firstEvent = generator.startChain('MYSTERY_INVESTIGATION');
console.log(`Started chain: ${firstEvent.chainId}`);
```

### `advanceChain(chainId, choice)`

Advances an existing chain based on player choice.

#### Parameters
- `chainId` (string): Chain identifier
- `choice` (string): Player choice identifier

#### Returns
- `Event`: Next event in the chain

#### Example
```javascript
const nextEvent = generator.advanceChain('chain_123', 'investigate');
```

### `getActiveChains()`

Gets all currently active event chains.

#### Returns
- `string[]`: Array of active chain IDs

#### Example
```javascript
const activeChains = generator.getActiveChains();
console.log(`Active chains: ${activeChains.length}`);
```

## Time Methods

### `advanceGameDay()`

Advances the game time by one day and returns due events.

#### Returns
- `Event[]`: Array of time-triggered events

#### Example
```javascript
const dueEvents = generator.advanceGameDay();
dueEvents.forEach(event => handleTimeEvent(event));
```

### `startTimeBasedChain(chainId)`

Starts a time-evolving event chain.

#### Parameters
- `chainId` (string): Chain identifier

#### Example
```javascript
generator.startTimeBasedChain('POLITICAL_UPRISING');
```

### `getCurrentTime()`

Gets the current game time.

#### Returns
- `Object`: Current time state
  - `day` (number): Current day
  - `season` (string): Current season
  - `year` (number): Current year

#### Example
```javascript
const time = generator.getCurrentTime();
console.log(`Day ${time.day} of ${time.season}, Year ${time.year}`);
```

## State Management

### `getGameState()`

Exports the complete generator state for saving.

#### Returns
- `Object`: Complete game state

#### Example
```javascript
const saveData = generator.getGameState();
localStorage.setItem('gameSave', JSON.stringify(saveData));
```

### `loadGameState(state)`

Restores generator state from saved data.

#### Parameters
- `state` (Object): Previously saved game state

#### Example
```javascript
const saveData = JSON.parse(localStorage.getItem('gameSave'));
generator.loadGameState(saveData);
```

## Template Methods

### `registerEventTemplate(id, template)`

Registers a custom event template.

#### Parameters
- `id` (string): Template identifier
- `template` (Object): Template definition

#### Example
```javascript
generator.registerEventTemplate('CUSTOM_ENCOUNTER', {
  title: "Mysterious Stranger",
  narrative: "A hooded figure approaches...",
  choices: [
    { text: "Talk to them", effect: { reputation: 5 } },
    { text: "Ignore them", effect: {} }
  ]
});
```

### `generateFromTemplate(templateId)`

Generates an event from a registered template.

#### Parameters
- `templateId` (string): Template identifier

#### Returns
- `Event`: Generated event

#### Example
```javascript
const event = generator.generateFromTemplate('CUSTOM_ENCOUNTER');
```

### `exportCustomContent()`

Exports all custom templates, rules, and data.

#### Returns
- `Object`: Exported content

#### Example
```javascript
const content = generator.exportCustomContent();
fs.writeFileSync('custom-content.json', JSON.stringify(content));
```

### `importCustomContent(content)`

Imports custom content.

#### Parameters
- `content` (Object): Content to import

#### Returns
- `Object`: Import results

#### Example
```javascript
const content = JSON.parse(fs.readFileSync('custom-content.json'));
const result = generator.importCustomContent(content);
```

## Rule Engine Methods

### `addCustomRule(id, rule)`

Adds a custom conditional rule.

#### Parameters
- `id` (string): Rule identifier
- `rule` (Object): Rule definition

#### Example
```javascript
generator.addCustomRule('wealth_bonus', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'gold', value: 1000 } }
  ],
  effects: {
    modifyChoices: {
      multiply: { rewards: 1.5 }
    }
  }
});
```

### `removeCustomRule(id)`

Removes a custom rule.

#### Parameters
- `id` (string): Rule identifier

#### Example
```javascript
generator.removeCustomRule('wealth_bonus');
```

### `validateCustomRule(rule)`

Validates a rule definition.

#### Parameters
- `rule` (Object): Rule to validate

#### Returns
- `Object`: Validation result
  - `valid` (boolean): Whether rule is valid
  - `errors` (string[]): Validation errors

#### Example
```javascript
const validation = generator.validateCustomRule(myRule);
if (!validation.valid) {
  console.log('Rule errors:', validation.errors);
}
```

## Relationship Methods

### `addNPC(npcData)`

Adds an NPC to the relationship network.

#### Parameters
- `npcData` (Object): NPC definition
  - `id` (string): Unique identifier
  - `name` (string): Display name
  - `type` (string): NPC type
  - `faction` (string, optional): Faction affiliation

#### Example
```javascript
generator.addNPC({
  id: 'king_arthur',
  name: 'King Arthur',
  type: 'noble',
  faction: 'royalty'
});
```

### `updateRelationship(npcId, targetId, change, reason)`

Updates a relationship between characters.

#### Parameters
- `npcId` (string): First character ID
- `targetId` (string): Second character ID
- `change` (number): Relationship change (-100 to +100)
- `reason` (string): Reason for change

#### Example
```javascript
generator.updateRelationship('king_arthur', 'player', 25, 'saved_life');
```

### `getRelationship(npcId, targetId)`

Gets the current relationship between characters.

#### Parameters
- `npcId` (string): First character ID
- `targetId` (string): Second character ID

#### Returns
- `Object`: Relationship data
  - `strength` (number): Relationship strength
  - `type` (string): Relationship type
  - `reason` (string): Last change reason

#### Example
```javascript
const relationship = generator.getRelationship('king_arthur', 'player');
console.log(`Relationship: ${relationship.strength} (${relationship.type})`);
```

## Dependency Methods

### `registerEventDependency(eventId, dependency)`

Registers an event dependency.

#### Parameters
- `eventId` (string): Event identifier
- `dependency` (Object): Dependency definition

#### Example
```javascript
generator.registerEventDependency('ROYAL_AUDIENCE', {
  type: 'event_completed',
  eventId: 'COURT_INTRODUCTION'
});
```

### `checkDependencies(eventId, gameState)`

Checks if an event's dependencies are met.

#### Parameters
- `eventId` (string): Event identifier
- `gameState` (Object): Current game state

#### Returns
- `boolean`: Whether dependencies are met

#### Example
```javascript
const canTrigger = generator.checkDependencies('ROYAL_AUDIENCE', gameState);
```

### `getAvailableEvents(gameState)`

Gets all events that can currently trigger based on dependencies.

#### Parameters
- `gameState` (Object): Current game state

#### Returns
- `string[]`: Array of available event IDs

#### Example
```javascript
const available = generator.getAvailableEvents(gameState);
console.log(`Available events: ${available.length}`);
```

## Modifier Methods

### `setEnvironmentalContext(context)`

Sets the current environmental context.

#### Parameters
- `context` (Object): Environmental factors
  - `weather` (string): Weather condition
  - `season` (string): Season
  - `timeOfDay` (string): Time of day
  - `location` (string): Location type

#### Example
```javascript
generator.setEnvironmentalContext({
  weather: 'storm',
  season: 'winter',
  timeOfDay: 'night',
  location: 'mountain'
});
```

### `generateEnhancedEvent(options)`

Generates an event with environmental modifiers applied.

#### Parameters
- `options` (Object): Generation options
  - `environment` (Object): Environmental context
  - `player` (Object): Player context

#### Returns
- `Event`: Enhanced event

#### Example
```javascript
const enhancedEvent = generator.generateEnhancedEvent({
  environment: { weather: 'storm', season: 'winter' },
  player: playerContext
});
```

## Export Methods

### `exportForUnity(options)`

Exports events and templates for Unity.

#### Parameters
- `options` (Object): Export options
  - `namespace` (string): C# namespace
  - `outputPath` (string): Output directory

#### Returns
- `Promise<Object>`: Export results

#### Example
```javascript
await generator.exportForUnity({
  namespace: 'MyGame.Events',
  outputPath: './unity-scripts/'
});
```

### `exportForGodot(options)`

Exports events and templates for Godot.

#### Parameters
- `options` (Object): Export options
  - `outputPath` (string): Output directory
  - `includeResources` (boolean): Include Godot resources

#### Returns
- `Promise<Object>`: Export results

#### Example
```javascript
await generator.exportForGodot({
  outputPath: './godot-scripts/',
  includeResources: true
});
```

### `exportForTypeScript(options)`

Exports TypeScript definitions and interfaces.

#### Parameters
- `options` (Object): Export options
  - `outputPath` (string): Output directory
  - `generateInterfaces` (boolean): Generate TypeScript interfaces
  - `includeValidation` (boolean): Include validation schemas

#### Returns
- `Promise<Object>`: Export results

#### Example
```javascript
await generator.exportForTypeScript({
  outputPath: './types/',
  generateInterfaces: true,
  includeValidation: true
});
```

## Utility Methods

### `analyzeEventQuality(event)`

Analyzes the quality of a generated event.

#### Parameters
- `event` (Event): Event to analyze

#### Returns
- `Object`: Quality analysis
  - `score` (number): Quality score (0-100)
  - `issues` (string[]): Identified issues
  - `suggestions` (string[]): Improvement suggestions

#### Example
```javascript
const analysis = generator.analyzeEventQuality(event);
console.log(`Quality: ${analysis.score}/100`);
```

### `addCustomTrainingData(data, category)`

Adds custom training data for improved text generation.

#### Parameters
- `data` (string[]): Array of training sentences
- `category` (string, optional): Data category

#### Example
```javascript
generator.addCustomTrainingData([
  'The ancient castle stands silent against the stormy sky',
  'Mysterious runes glow with ethereal light',
  'A hooded figure emerges from the shadows'
], 'mystical');
```

### `generatePureMarkovEvent(options)`

Generates an event using only custom Markov chains.

#### Parameters
- `options` (Object): Generation options
  - `minLength` (number): Minimum description length
  - `maxLength` (number): Maximum description length
  - `theme` (string): Theme identifier

#### Returns
- `Event`: Pure Markov event

#### Example
```javascript
const markovEvent = generator.generatePureMarkovEvent({
  minLength: 100,
  maxLength: 300,
  theme: 'fantasy'
});
```

## Data Structures

### Event Object
```javascript
{
  id: "event_1704567890123_xyz789",    // Unique identifier
  title: "Event Title",                // Event headline
  description: "Detailed narrative...", // Full description
  type: "ENCOUNTER",                   // Event category
  difficulty: "normal",                // Difficulty level
  choices: [                           // Available choices
    {
      text: "Choice description",
      effect: {                        // Effects on player
        gold: 100,
        reputation: 5,
        health: -10
      },
      requirements: {                  // Requirements to choose
        level: 5,
        skill: "diplomacy"
      },
      consequence: "diplomatic"        // Story consequence
    }
  ],
  context: {                           // Generation context
    player_level: 10,
    location: "forest",
    time: "day"
  },
  tags: ["adventure", "social"],      // Content tags
  chainId: null,                      // Chain identifier if part of chain
  quality: 85                         // Quality score
}
```

### Player Context Object
```javascript
{
  // Basic Information
  name: "Character Name",
  age: 25,
  career: "merchant",

  // Statistics
  level: 10,
  gold: 500,
  reputation: 45,
  health: 100,

  // Skills (0-100 scale)
  skills: {
    combat: 60,
    diplomacy: 75,
    stealth: 40,
    magic: 20
  },

  // Current Situation
  location: "market_district",
  time_of_day: "afternoon",
  weather: "sunny",
  season: "spring",

  // Relationships
  relationships: [
    {
      name: "Guild Master",
      type: "mentor",
      strength: 70
    }
  ],

  // Inventory/Resources
  inventory: ["sword", "healing_potion"],
  completed_quests: ["village_help"],
  active_quests: ["dragon_slayer"]
}
```

### Rule Definition Object
```javascript
{
  conditions: [                        // Array of conditions
    {
      type: "stat_greater_than",       // Condition type
      params: {                        // Condition parameters
        stat: "level",
        value: 10
      }
    }
  ],
  effects: {                           // Effects to apply
    addTags: ["elite"],               // Add tags
    modifyChoices: {                  // Modify choices
      multiply: { rewards: 1.5 },     // Multiply effects
      add: { experience: 100 }        // Add flat bonuses
    },
    modifyEvent: {                    // Modify event properties
      difficulty: "hard",
      addChoices: [{                  // Add new choices
        text: "Elite action",
        effect: { reputation: 20 }
      }]
    }
  }
}
```

### Relationship Object
```javascript
{
  strength: 75,                       // Relationship strength (-100 to 100)
  type: "ally",                       // Relationship type
  reason: "saved_life",               // Last change reason
  history: [                          // Change history
    {
      change: 25,
      reason: "helped_in_battle",
      timestamp: 1704567890123
    }
  ],
  faction: "nobles",                  // Associated faction
  trust: 80,                          // Trust level
  influence: 60                       // Influence level
}
```

### Dependency Definition Object
```javascript
{
  // Simple dependency
  type: "event_completed",
  eventId: "INTRODUCTION_QUEST",

  // Complex dependency with operators
  operator: "AND",
  conditions: [
    {
      type: "stat_requirement",
      stat: "level",
      min: 10
    },
    {
      operator: "OR",
      conditions: [
        { type: "item_requirement", item: "magic_key" },
        { type: "relationship_requirement", npc: "gatekeeper", min: 50 }
      ]
    }
  ]
}
```
