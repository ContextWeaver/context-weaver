# Constructor Options Reference

Complete reference for all Context Weaver constructor parameters and configuration options.

## Constructor Signature

```javascript
const generator = new ContextWeaver(options);
```

## Core Options

### `stateSize: number` (default: 2)
Controls Markov chain complexity and memory.

```javascript
// Simple chains (faster, less coherent)
const simple = new ContextWeaver({ stateSize: 1 });

// Balanced (recommended)
const balanced = new ContextWeaver({ stateSize: 2 });

// Complex (slower, more coherent)
const complex = new ContextWeaver({ stateSize: 3 });
```

**Effects:**
- **1**: Fast, creative, potentially repetitive
- **2**: Balanced performance and coherence
- **3+**: Slower, more coherent, less creative

### `trainingData: string[]` (default: [])
Custom text corpus for content generation.

```javascript
const generator = new ContextWeaver({
  trainingData: [
    'The corporate strategy meeting dragged on for hours.',
    'Market analysis revealed unexpected opportunities.',
    'Team collaboration produced innovative solutions.',
    'Customer feedback drove product improvements.'
  ]
});
```

**Best practices:**
- 500-2000 sentences for good results
- Domain-specific content
- Diverse writing styles
- High-quality, coherent text

### `theme: string` (default: 'fantasy')
Content domain and style.

```javascript
// Available themes
const themes = [
  'fantasy',    // Medieval fantasy
  'sci-fi',     // Science fiction
  'business',   // Corporate/professional
  'education',  // Learning/educational
  'modern',     // Contemporary settings
  'horror',     // Supernatural horror
  'historical'  // Historical periods
];

const generator = new ContextWeaver({ theme: 'business' });
```

### `culture: string` (default: theme-specific)
Cultural variant within theme.

```javascript
const generator = new ContextWeaver({
  theme: 'fantasy',
  culture: 'norse'  // Vikings, runes, fjords
});

const cyberpunk = new ContextWeaver({
  theme: 'sci-fi',
  culture: 'cyberpunk'  // Neon cities, hackers
});
```

## Quality Controls

### `minQualityScore: number` (0-100, default: 50)
Minimum acceptable content quality.

```javascript
const generator = new ContextWeaver({
  minQualityScore: 75  // Only accept high-quality content
});
```

### `maxComplexity: number` (default: 10)
Maximum complexity score.

```javascript
const generator = new ContextWeaver({
  maxComplexity: 5  // Simpler content for beginners
});
```

### `enableQualityFiltering: boolean` (default: true)
Filter out low-quality content.

```javascript
const generator = new ContextWeaver({
  enableQualityFiltering: false  // Accept all generated content
});
```

## Performance Options

### `maxTrainingSentences: number` (default: 5000)
Limit training data size.

```javascript
const generator = new ContextWeaver({
  maxTrainingSentences: 1000  // Smaller dataset for faster startup
});
```

### `enableMemoryOptimization: boolean` (default: false)
Optimize memory usage.

```javascript
const generator = new ContextWeaver({
  enableMemoryOptimization: true  // Better for large-scale deployments
});
```

## Feature Toggles

### `enableRuleEngine: boolean` (default: false)
Enable conditional content modification.

```javascript
const generator = new ContextWeaver({
  enableRuleEngine: true
});

// Now you can add rules
generator.addCustomRule('vip_bonus', ruleDefinition);
```

### `enableModifiers: boolean` (default: false)
Enable environmental modifiers.

```javascript
const generator = new ContextWeaver({
  enableModifiers: true
});

// Environmental context affects generation
generator.setEnvironmentalContext({
  weather: 'storm',
  season: 'winter'
});
```

### `enableRelationships: boolean` (default: false)
Enable NPC relationship tracking.

```javascript
const generator = new ContextWeaver({
  enableRelationships: true
});

// Add relationship-aware content
generator.addNPC({
  id: 'mentor',
  name: 'Sage Advisor',
  relationship: 60
});
```

### `enableTemplates: boolean` (default: false)
Enable template system.

```javascript
const generator = new ContextWeaver({
  enableTemplates: true
});

// Use predefined templates
const event = generator.generateFromTemplate('business_deal');
```

### `pureMarkovMode: boolean` (default: false)
Generate without templates (training data only).

```javascript
const generator = new ContextWeaver({
  pureMarkovMode: true,
  trainingData: customData
});

// Pure Markov generation
const content = generator.generateContent();
```

## Content Options

### `language: string` (default: 'en')
Output language.

```javascript
const generator = new ContextWeaver({
  language: 'es'  // Spanish content
});

const spanishContent = generator.generateContent();
```

### `templateLibrary: string|null` (default: null)
Load specific template collection.

```javascript
const generator = new ContextWeaver({
  enableTemplates: true,
  templateLibrary: 'business'  // Load business templates
});
```

### `customRules: object` (default: {})
Pre-load custom rules.

```javascript
const rules = {
  vip_bonus: { /* rule definition */ },
  beginner_help: { /* rule definition */ }
};

const generator = new ContextWeaver({
  enableRuleEngine: true,
  customRules: rules  // Rules available immediately
});
```

## Advanced Options

### `chance: Chance` (default: new Chance())
Custom random number generator.

```javascript
import Chance from 'chance';

const seededGenerator = new Chance(12345);  // Deterministic results

const generator = new ContextWeaver({
  chance: seededGenerator
});
```

### `debug: boolean` (default: false)
Enable debug logging.

```javascript
const generator = new ContextWeaver({
  debug: true
});

// Debug info included in generated content
const content = generator.generateContent();
console.log(content._debug);
```

### `logLevel: string` (default: 'info')
Logging verbosity.

```javascript
const generator = new ContextWeaver({
  logLevel: 'verbose'  // 'error', 'warn', 'info', 'debug', 'verbose'
});
```

## Configuration Examples

### Basic Gaming Setup
```javascript
const gameGenerator = new ContextWeaver({
  theme: 'fantasy',
  stateSize: 2,
  enableModifiers: true,
  enableRelationships: true
});
```

### Business Training
```javascript
const businessGenerator = new ContextWeaver({
  theme: 'business',
  culture: 'corporate',
  enableRuleEngine: true,
  enableTemplates: true,
  minQualityScore: 70
});
```

### Educational Content
```javascript
const educationGenerator = new ContextWeaver({
  theme: 'education',
  enableTemplates: true,
  maxComplexity: 3,  // Keep it simple for students
  language: 'en'
});
```

### High-Performance Production
```javascript
const productionGenerator = new ContextWeaver({
  maxTrainingSentences: 2000,
  enableMemoryOptimization: true,
  enableQualityFiltering: true,
  minQualityScore: 60
});
```

### Creative Writing
```javascript
const creativeGenerator = new ContextWeaver({
  pureMarkovMode: true,
  stateSize: 3,
  enableQualityFiltering: false,  // Allow all creativity
  trainingData: customLiteraryData
});
```

## Validation

### Check Configuration
```javascript
const generator = new ContextWeaver(options);

// Validate the configuration
const validation = generator.validateConfiguration();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

### Get Current Config
```javascript
const config = generator.getConfiguration();
console.log('Current settings:', config);
```

## Troubleshooting

### Common Configuration Issues

**"Content generation is too slow"**
```javascript
// Solution: Optimize performance
const generator = new ContextWeaver({
  stateSize: 1,  // Reduce complexity
  maxTrainingSentences: 1000,  // Smaller dataset
  enableMemoryOptimization: true
});
```

**"Content quality is poor"**
```javascript
// Solution: Improve quality controls
const generator = new ContextWeaver({
  minQualityScore: 75,
  trainingData: highQualityData,  // Better training data
  stateSize: 3  // More coherent
});
```

**"Memory usage is too high"**
```javascript
// Solution: Optimize memory
const generator = new ContextWeaver({
  maxTrainingSentences: 1000,
  enableMemoryOptimization: true,
  enableQualityFiltering: true
});
```

---

**Need help configuring Context Weaver?** Check the [Basic Usage Guide](Basic-Usage.md) or [FAQ](FAQ.md) for more examples.
