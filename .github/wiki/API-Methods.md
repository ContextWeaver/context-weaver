# API Methods Reference

Complete reference for all Context Weaver methods and their parameters.

## 📋 Constructor Options

### Basic Configuration

```javascript
const generator = new ContextWeaver({
  // Core settings
  stateSize: 2,                    // Markov chain state size (1-4, default: 2)
  trainingData: [...],             // Array of training sentences
  theme: 'business',               // Content theme ('business', 'education', 'fantasy', etc.)
  culture: 'corporate',            // Cultural variant within theme

  // Quality controls
  minQualityScore: 50,             // Minimum quality score (0-100, default: 50)
  maxComplexity: 10,               // Maximum complexity score (default: 10)
  enableQualityFiltering: true,    // Filter low-quality content (default: true)

  // Performance
  maxTrainingSentences: 5000,      // Limit training data size (default: 5000)
  enableMemoryOptimization: false, // Optimize memory usage (default: false)

  // Features
  enableRuleEngine: true,          // Enable custom rules (default: false)
  enableModifiers: true,           // Enable environmental modifiers (default: false)
  enableRelationships: true,       // Enable NPC relationships (default: false)
  enableTemplates: true,           // Enable template system (default: false)
  pureMarkovMode: false,           // Generate without templates (default: false)

  // Content control
  language: 'en',                  // Output language (default: 'en')
  templateLibrary: null,           // Load specific template genre
  customRules: {},                 // Pre-load custom rules object

  // Advanced
  chance: customChance,            // Custom Chance.js instance (optional)
  debug: false,                    // Enable debug logging (default: false)
  logLevel: 'info'                 // Log level ('error', 'warn', 'info', 'debug')
});
```

## 🎯 Content Generation Methods

### `generateContent(context?)`

Generate a single piece of context-aware content.

**Parameters:**
- `context` (Object, optional): User context for content adaptation

**Returns:** Content object with interactive elements

**Example:**
```javascript
const content = generator.generateContent({
  experience: 25,
  engagement: 500,
  influence: 15,
  profile: 'professional'
});

console.log(content.title);        // Generated title
console.log(content.description);  // Narrative description
console.log(content.choices);      // Array of interactive choices
```

### `generateMultiple(context?, count)`

Generate multiple content items in batch.

**Parameters:**
- `context` (Object, optional): User context for adaptation
- `count` (Number): Number of items to generate (1-50)

**Returns:** Array of content objects

**Example:**
```javascript
const contentBatch = generator.generateMultiple(userContext, 5);

contentBatch.forEach((content, index) => {
  console.log(`${index + 1}. ${content.title}`);
});
```

### `generateTimeAwareContent(context?)`

Generate content that adapts to temporal factors.

**Parameters:**
- `context` (Object): User context including time/season data

**Returns:** Time-aware content object

**Example:**
```javascript
const seasonalContent = generator.generateTimeAwareContent({
  ...userContext,
  season: 'winter',
  timeOfDay: 'night'
});
```

## 🧠 Rule Engine Methods

### `addCustomRule(name, ruleDefinition)`

Add a custom rule for content modification.

**Parameters:**
- `name` (String): Unique rule identifier
- `ruleDefinition` (Object): Rule configuration

**Rule Definition Structure:**
```javascript
{
  conditions: [
    {
      type: 'stat_greater_than',     // Condition type
      params: { stat: 'level', value: 5 }
    }
  ],
  effects: {
    addTags: ['vip_user'],           // Add tags to content
    modifyChoices: {                 // Modify choice effects
      multiply: { rewards: 1.5 },    // Multiply effects
      add: { reputation: 10 }        // Add flat bonuses
    },
    setDifficulty: 'hard',           // Override difficulty
    modifyTitle: { append: ' (VIP)' } // Modify title
  },
  priority: 10                       // Rule priority (higher = processed later)
}
```

**Example:**
```javascript
generator.addCustomRule('vip_bonus', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'engagement', value: 1000 } }
  ],
  effects: {
    addTags: ['premium'],
    modifyChoices: {
      multiply: { influence: 1.3 },
      add: { reputation: 5 }
    }
  }
});
```

### `removeCustomRule(name)`

Remove a custom rule.

**Parameters:**
- `name` (String): Rule identifier to remove

**Returns:** Boolean indicating success

### `getCustomRules()`

Get all active custom rules.

**Returns:** Object mapping rule names to rule definitions

### `clearCustomRules()`

Remove all custom rules.

### `validateCustomRule(rule)`

Validate a rule definition.

**Parameters:**
- `rule` (Object): Rule definition to validate

**Returns:**
```javascript
{
  valid: true|false,
  errors: ['Error message 1', 'Error message 2']
}
```

## 📚 Template Methods

### `generateFromTemplate(templateId)`

Generate content from a specific template.

**Parameters:**
- `templateId` (String): Template identifier

**Returns:** Template-based content object

### `generateFromGenre(genre)`

Generate content from a random template in a genre.

**Parameters:**
- `genre` (String): Template genre ('fantasy', 'business', etc.)

**Returns:** Genre-based content object

### `getAvailableTemplates()`

Get all available templates organized by genre.

**Returns:** Object mapping genres to template arrays

### `registerEventTemplate(id, template)`

Add a custom template.

**Parameters:**
- `id` (String): Template identifier
- `template` (Object): Template definition

**Template Structure:**
```javascript
{
  title: 'Template Title',
  narrative: 'Template description with {variable} placeholders',
  choices: [
    {
      text: 'Choice description',
      effect: { stat: +10, otherStat: -5 },
      consequence: 'choice_result'
    }
  ],
  type: 'TEMPLATE_TYPE',
  difficulty: 'medium',
  tags: ['tag1', 'tag2'],
  requirements: { minLevel: 5 }  // Optional requirements
}
```

## 🌍 Environmental Methods

### `setEnvironmentalContext(context)`

Set environmental factors for content generation.

**Parameters:**
- `context` (Object): Environmental settings

**Environmental Context:**
```javascript
{
  weather: 'storm',        // 'clear', 'rain', 'storm', 'snow'
  season: 'winter',        // 'spring', 'summer', 'autumn', 'winter'
  timeOfDay: 'night',      // 'dawn', 'morning', 'day', 'evening', 'night'
  location: 'urban',       // 'urban', 'rural', 'forest', 'mountain', etc.
  temperature: 'cold',     // 'freezing', 'cold', 'mild', 'warm', 'hot'
  crowdDensity: 'sparse'   // 'empty', 'sparse', 'moderate', 'crowded'
}
```

**Example:**
```javascript
generator.setEnvironmentalContext({
  weather: 'storm',
  season: 'winter',
  timeOfDay: 'night',
  location: 'mountain'
});
```

## 🔗 Chain Methods

### `startChain(chainId)`

Start an interactive content chain.

**Parameters:**
- `chainId` (String): Chain identifier

**Returns:** First content in the chain

### `advanceChain(chainId, choice)`

Advance a chain based on user choice.

**Parameters:**
- `chainId` (String): Active chain identifier
- `choice` (String): User's choice identifier

**Returns:** Next content in the chain

### `getActiveChains()`

Get all currently active chains.

**Returns:** Array of active chain objects

## ⏰ Time Methods

### `advanceGameDay()`

Advance the game world by one day.

**Returns:** Array of time-triggered events

### `startTimeBasedChain(chainId)`

Start a chain that unfolds over time.

**Parameters:**
- `chainId` (String): Chain identifier

### `getCurrentTime()`

Get current game world time.

**Returns:**
```javascript
{
  day: 15,
  season: 'winter',
  year: 1250,
  timeOfDay: 'afternoon'
}
```

### `getActiveTimeChains()`

Get all active time-based chains.

**Returns:** Array of time chain objects

## 💾 Persistence Methods

### `getGameState()`

Export complete generator state for saving.

**Returns:** Serializable state object

### `loadGameState(state)`

Import saved generator state.

**Parameters:**
- `state` (Object): Previously exported state

**Example:**
```javascript
// Save game
const gameState = generator.getGameState();
localStorage.setItem('gameSave', JSON.stringify(gameState));

// Load game
const savedState = JSON.parse(localStorage.getItem('gameSave'));
generator.loadGameState(savedState);
```

## 🔧 Utility Methods

### `getStats()`

Get generation statistics and performance metrics.

**Returns:**
```javascript
{
  totalGenerations: 150,
  averageQuality: 78.5,
  activeRules: 3,
  memoryUsage: 245760,  // bytes
  cacheHits: 45,
  cacheMisses: 12
}
```

### `clearCaches()`

Clear internal caches for fresh generation.

### `getTrainingData()`

Get current training data array.

**Returns:** Array of training sentences

### `addCustomTrainingData(data, category?)`

Add additional training data.

**Parameters:**
- `data` (Array): Array of training sentences
- `category` (String, optional): Category for organization

## 📊 Quality Methods

### `analyzeContent(content)`

Analyze content quality and characteristics.

**Parameters:**
- `content` (Object): Content object to analyze

**Returns:**
```javascript
{
  qualityScore: 85,
  complexity: 7.2,
  engagement: 92,
  coherence: 78,
  diversity: 65,
  readability: 71
}
```

### `getQualityReport()`

Generate a comprehensive quality report.

**Returns:** Detailed quality metrics object

## 🐛 Debug Methods

### `enableDebug()`

Enable debug logging and detailed output.

### `disableDebug()`

Disable debug logging.

### `getDebugInfo()`

Get current debug information.

**Returns:** Debug state and recent operations

---

## 📋 Method Categories

| Category | Methods |
|----------|---------|
| **Generation** | `generateContent`, `generateMultiple`, `generateTimeAwareContent` |
| **Rules** | `addCustomRule`, `removeCustomRule`, `getCustomRules`, `validateCustomRule` |
| **Templates** | `generateFromTemplate`, `generateFromGenre`, `getAvailableTemplates`, `registerEventTemplate` |
| **Environment** | `setEnvironmentalContext` |
| **Chains** | `startChain`, `advanceChain`, `getActiveChains` |
| **Time** | `advanceGameDay`, `startTimeBasedChain`, `getCurrentTime` |
| **Persistence** | `getGameState`, `loadGameState` |
| **Utilities** | `getStats`, `clearCaches`, `getTrainingData` |
| **Quality** | `analyzeContent`, `getQualityReport` |
| **Debug** | `enableDebug`, `disableDebug`, `getDebugInfo` |

## 🔗 Related Documentation

- **[Constructor Options](API-Constructor.md)** - Detailed constructor configuration
- **[Event Objects](API-Events.md)** - Understanding generated content structure
- **[Rule Conditions](Rule-Engine.md)** - Complete rule condition reference
- **[Template System](Template-System.md)** - Template creation and management

---

**Need help with a specific method?** Check the [Troubleshooting Guide](Troubleshooting.md) or [open an issue](https://github.com/ContextWeaver/context-weaver/issues)! 🚀
