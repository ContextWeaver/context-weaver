# Customization Guide

Learn how to customize RPG Event Generator for your specific game, application, or project.

## 🎨 Custom Training Data

### Understanding Training Data

Training data teaches the generator your game's specific language, tone, and content style. The more relevant training data you provide, the better the generated events will match your game's world.

### Basic Training Data Addition
```javascript
const generator = new RPGEventGenerator();

// Add training sentences
generator.addCustomTrainingData([
  'The ancient castle looms over the misty valley',
  'Elven archers patrol the enchanted forest borders',
  'Dwarven forges echo through mountain halls',
  'Mystical runes glow with otherworldly power',
  'The tavern fills with adventurers seeking glory'
]);

// Generate events with custom flavor
const event = generator.generateEvent();
console.log(event.description);
// Output incorporates your training data style
```

### Thematic Training Sets
```javascript
// Cyberpunk training data
const cyberpunkData = [
  'Neon lights reflect off rain-slicked streets',
  'Corporate skyscrapers pierce the smog-filled sky',
  'Hackers navigate the digital underworld',
  'Augmented mercenaries patrol the megacity',
  'Virtual reality overlays blend with reality',
  'Drone swarms patrol restricted airspaces'
];

// Fantasy training data
const fantasyData = [
  'Ancient dragons slumber in mountain lairs',
  'Elven rangers track through enchanted woods',
  'Dwarven smiths craft legendary artifacts',
  'Mystical portals connect distant realms',
  'Heroic knights uphold codes of honor'
];

// Historical training data
const historicalData = [
  'Medieval castles dominate strategic valleys',
  'Knightly orders protect sacred relics',
  'Royal courts intrigue with political maneuvering',
  'Peasant revolts challenge feudal authority',
  'Trade caravans cross dangerous frontiers'
];

generator.addCustomTrainingData(cyberpunkData, 'cyberpunk');
generator.addCustomTrainingData(fantasyData, 'fantasy');
generator.addCustomTrainingData(historicalData, 'historical');
```

### Context-Specific Training
```javascript
// Location-based training
const forestTraining = [
  'Ancient trees whisper forgotten secrets',
  'Sunlight filters through canopy leaves',
  'Forest paths twist through undergrowth',
  'Wild animals observe from hidden thickets',
  'Moss-covered stones mark ancient trails'
];

const urbanTraining = [
  'Cobblestone streets bustle with merchants',
  'Cathedral bells toll through narrow alleys',
  'Market stalls overflow with exotic goods',
  'City guards patrol well-traveled roads',
  'Taverns echo with traveler tales'
];

// Add with context categories
generator.addCustomTrainingData(forestTraining, 'location_forest');
generator.addCustomTrainingData(urbanTraining, 'location_urban');
```

## 📝 Custom Templates

### Template Structure
```javascript
const customTemplate = {
  // Basic information
  title: "Custom Event Title",
  narrative: "Detailed story description with {placeholders}",
  type: "ENCOUNTER",  // Event category

  // Choices and consequences
  choices: [
    {
      text: "Choice description",
      effect: {
        gold: 100,
        reputation: 5,
        health: -10
      },
      requirements: {
        level: 5,
        skill: "diplomacy"
      },
      consequence: "diplomatic_success"
    }
  ],

  // Metadata
  tags: ["adventure", "social", "combat"],
  difficulty: "normal",

  // Contextual requirements
  context_requirements: {
    location: "forest",
    time_of_day: "day",
    player_level: { min: 3, max: 15 }
  }
};
```

### Dynamic Templates with Placeholders
```javascript
const dynamicTemplate = {
  title: "The {creature} of {location}",
  narrative: "As you travel through the {terrain}, a {creature} {action} you. Its {feature} {verb} in the {lighting}.",
  choices: [
    {
      text: "Fight the {creature}",
      effect: { combat_experience: 10 }
    },
    {
      text: "Attempt to {interaction} with it",
      effect: { reputation: 5 }
    }
  ]
};

// Template variables for randomization
const templateVars = {
  creature: ["dragon", "troll", "bandit", "spirit", "merchant"],
  location: ["mountains", "forest", "desert", "castle"],
  terrain: ["dense forest", "rocky cliffs", "sandy dunes", "mountain pass"],
  action: ["blocks your path", "demands tribute", "offers assistance", "attacks suddenly"],
  feature: ["scales", "eyes", "claws", "aura"],
  verb: ["gleam", "glow", "pulse", "shimmer"],
  lighting: ["moonlight", "sunlight", "torchlight", "starlight"],
  interaction: ["communicate", "bargain", "reason", "intimidate"]
};
```

### Template Collections
```javascript
// Create themed template collections
const dungeonTemplates = {
  TRAPPED_CHEST: {
    title: "Cursed Treasure Chest",
    narrative: "You discover an ornate chest trapped with {trap_type}. {warning_sign} alerts you to danger.",
    choices: [
      { text: "Carefully disarm the trap", effect: { gold: 200 }, requirements: { skill: "traps" } },
      { text: "Force it open", effect: { health: -20, gold: 100 } },
      { text: "Leave it alone", effect: {} }
    ],
    tags: ["treasure", "trap", "dungeon"]
  },

  SKELETON_AMBUSH: {
    title: "Undead Guardians",
    narrative: "Skeletal warriors emerge from wall niches, their {weapon} raised to attack.",
    choices: [
      { text: "Fight the skeletons", effect: { combat_experience: 15 } },
      { text: "Use turn undead ability", effect: { mana: -30 }, requirements: { class: "cleric" } },
      { text: "Flee the chamber", effect: { reputation: -5 } }
    ],
    tags: ["undead", "combat", "dungeon"]
  }
};

// Register all templates
Object.entries(dungeonTemplates).forEach(([id, template]) => {
  generator.registerEventTemplate(id, template);
});
```

## 🎭 Custom Rules Engine

### Rule Categories

#### Character-Based Rules
```javascript
// Class-specific abilities
generator.addCustomRule('warrior_rage', {
  conditions: [
    { type: 'career_equals', params: { career: 'warrior' } },
    { type: 'health_below_percentage', params: { percentage: 50 } }
  ],
  effects: {
    modifyChoices: {
      add: {
        text: "Enter battle rage (+50% damage, -25% defense)",
        effect: { damage_multiplier: 1.5, defense_multiplier: 0.75, duration: 3 }
      }
    }
  }
});

// Race-specific traits
generator.addCustomRule('elven_grace', {
  conditions: [
    { type: 'race_equals', params: { race: 'elf' } }
  ],
  effects: {
    modifyEvent: {
      addTags: ['graceful', 'agile']
    },
    modifyChoices: {
      multiply: { stealth: 1.3, perception: 1.2 }
    }
  }
});
```

#### Location-Based Rules
```javascript
// Urban environment rules
generator.addCustomRule('city_savvy', {
  conditions: [
    { type: 'location_contains', params: { location: 'city' } },
    { type: 'stat_greater_than', params: { stat: 'intelligence', value: 60 } }
  ],
  effects: {
    modifyChoices: {
      add: {
        text: "Navigate the urban underworld",
        effect: { information: true, contacts: 1 }
      }
    }
  }
});

// Wilderness survival rules
generator.addCustomRule('forest_lore', {
  conditions: [
    { type: 'location_contains', params: { location: 'forest' } },
    { type: 'skill_greater_than', params: { skill: 'survival', value: 50 } }
  ],
  effects: {
    addTags: ['foraging_opportunity', 'hidden_paths'],
    modifyChoices: {
      add: {
        text: "Find edible plants and herbs",
        effect: { health: 10, herbs_collected: 3 }
      }
    }
  }
});
```

#### Time-Based Rules
```javascript
// Seasonal effects
generator.addCustomRule('winter_hardship', {
  conditions: [
    { type: 'season_equals', params: { season: 'winter' } },
    { type: 'location_exposed', params: { location: 'outdoor' } }
  ],
  effects: {
    modifyEvent: {
      description: "The biting cold makes every action more difficult.",
      difficulty: 'increased'
    },
    modifyChoices: {
      multiply: { movement: 0.8, warmth_cost: 1.5 }
    }
  }
});

// Time of day effects
generator.addCustomRule('night_vision', {
  conditions: [
    { type: 'time_range', params: { start: '20:00', end: '06:00' } },
    { type: 'race_in', params: { races: ['elf', 'half-elf'] } }
  ],
  effects: {
    modifyChoices: {
      multiply: { perception: 1.4, stealth: 1.2 }
    }
  }
});
```

### Advanced Rule Logic
```javascript
// Complex multi-condition rules
generator.addCustomRule('master_adventurer', {
  conditions: [
    {
      type: 'AND',
      conditions: [
        { type: 'stat_greater_than', params: { stat: 'level', value: 15 } },
        { type: 'stat_greater_than', params: { stat: 'reputation', value: 70 } },
        {
          type: 'OR',
          conditions: [
            { type: 'skill_greater_than', params: { skill: 'combat', value: 80 } },
            { type: 'skill_greater_than', params: { skill: 'magic', value: 80 } }
          ]
        }
      ]
    }
  ],
  effects: {
    addTags: ['legendary_hero'],
    modifyEvent: {
      addChoices: [{
        text: "Demonstrate legendary ability",
        effect: { inspiration: 50, followers: 1 }
      }]
    }
  }
});
```

## 🌍 Cultural and Thematic Customization

### Creating Custom Cultures
```javascript
// Norse-inspired culture
const norseCulture = {
  name: 'norse',
  language_patterns: [
    'fjords', 'longships', 'valhalla', 'runes', 'berserker',
    'mead halls', 'skadi', 'jotunheim', 'valkyries'
  ],
  social_structure: {
    ruler: 'jarl',
    warrior: 'berserker',
    priest: 'godi',
    merchant: 'karl'
  },
  values: ['honor', 'strength', 'loyalty', 'fate']
};

// Apply culture to generator
generator.setCulture(norseCulture);

// Generate culturally appropriate events
const norseEvent = generator.generateEvent({
  culture: 'norse',
  location: 'fjord_village'
});
```

### Custom Theme Creation
```javascript
const spaceOperaTheme = {
  name: 'space_opera',
  trainingData: [
    'Starships cruise through asteroid fields',
    'Alien empires clash in galactic wars',
    'Cybernetic implants enhance human capabilities',
    'Wormhole gates connect distant star systems',
    'Space pirates plunder cargo vessels',
    'Diplomatic negotiations prevent interstellar conflicts'
  ],
  eventTypes: {
    TRADE_DISPUTE: 'Interstellar trade conflicts',
    PIRATE_ATTACK: 'Space piracy encounters',
    DIPLOMATIC_INCIDENT: 'Alien diplomatic situations',
    EXPLORATION_DISCOVERY: 'New world discoveries'
  },
  characterClasses: {
    SPACEMARINE: 'Elite space combat specialist',
    DIPLOMAT: 'Interstellar negotiator',
    ENGINEER: 'Starship maintenance expert',
    SCOUT: 'Exploration and reconnaissance'
  }
};

// Apply custom theme
generator.applyCustomTheme(spaceOperaTheme);
```

## 🎨 Visual and Atmospheric Customization

### Tone and Style Settings
```javascript
// Dark fantasy theme
generator.setTone({
  darkness: 0.8,        // 0-1 scale
  mystery: 0.9,         // How mysterious events are
  violence: 0.6,        // Violence level
  humor: 0.2,          // Humor level
  romance: 0.4         // Romance level
});

// Descriptive style preferences
generator.setStyle({
  verbosity: 'detailed',    // 'brief', 'normal', 'detailed'
  formality: 'medieval',    // 'modern', 'medieval', 'formal'
  perspective: 'second',    // 'first', 'second', 'third'
  tense: 'present'          // 'past', 'present', 'future'
});
```

### Custom Event Types
```javascript
// Define new event categories
generator.addEventType('PSIONIC_ENCOUNTER', {
  description: 'Mental or psychic phenomena',
  common_locations: ['ancient_ruins', 'dream_realms'],
  typical_difficulty: 'hard',
  associated_skills: ['willpower', 'intelligence']
});

generator.addEventType('TECHNOMANCY', {
  description: 'Magical manipulation of technology',
  common_locations: ['cyber_labs', 'quantum_realm'],
  typical_difficulty: 'legendary',
  associated_skills: ['hacking', 'arcana']
});
```

## 🔧 Advanced Configuration

### Markov Chain Customization
```javascript
const advancedGenerator = new RPGEventGenerator({
  // Markov chain settings
  markovOrder: 3,              // Higher = more coherent, less varied
  creativity: 0.6,             // Lower = more predictable, higher = more creative
  minSentenceLength: 10,       // Minimum words per sentence
  maxSentenceLength: 25,       // Maximum words per sentence

  // Quality settings
  minQualityScore: 80,         // Quality threshold
  autoRegenerate: true,        // Auto-regenerate low quality events
  qualityWeights: {
    coherence: 0.4,            // How coherent the text is
    relevance: 0.3,            // How relevant to context
    engagement: 0.3            // How engaging the content is
  }
});
```

### Custom Validation Rules
```javascript
// Add custom content validation
generator.addValidationRule('no_profanity', (event) => {
  const profaneWords = ['curse_word_1', 'curse_word_2'];
  const hasProfanity = profaneWords.some(word =>
    event.title.includes(word) || event.description.includes(word)
  );
  return !hasProfanity;
});

generator.addValidationRule('appropriate_difficulty', (event, context) => {
  const playerLevel = context.level || 1;
  const eventDifficulty = ['easy', 'normal', 'hard', 'legendary'].indexOf(event.difficulty);

  // Event shouldn't be too easy or hard for player level
  const appropriateRange = Math.max(0, eventDifficulty - 1) <= playerLevel / 5;
  return appropriateRange;
});
```

## 📊 Analytics and Optimization

### Event Generation Analytics
```javascript
// Track generation statistics
const analytics = {
  totalGenerated: 0,
  averageQuality: 0,
  commonThemes: {},
  performanceMetrics: {}
};

generator.on('eventGenerated', (event) => {
  analytics.totalGenerated++;

  // Track quality scores
  analytics.averageQuality = (analytics.averageQuality + event.quality) / 2;

  // Track common themes
  event.tags.forEach(tag => {
    analytics.commonThemes[tag] = (analytics.commonThemes[tag] || 0) + 1;
  });
});

// Performance monitoring
generator.on('generationComplete', (duration) => {
  analytics.performanceMetrics.lastGenerationTime = duration;

  if (duration > 100) {
    console.warn(`Slow generation detected: ${duration}ms`);
  }
});
```

### A/B Testing Customizations
```javascript
// Test different training data sets
const testConfigurations = {
  A: {
    trainingData: conciseTrainingData,
    markovOrder: 2,
    creativity: 0.7
  },
  B: {
    trainingData: verboseTrainingData,
    markovOrder: 3,
    creativity: 0.5
  }
};

function runABTest(iterations = 100) {
  const results = { A: [], B: [] };

  for (let i = 0; i < iterations; i++) {
    // Test configuration A
    generator.applyConfiguration(testConfigurations.A);
    const eventA = generator.generateEvent(testContext);
    results.A.push(analyzeEventQuality(eventA));

    // Test configuration B
    generator.applyConfiguration(testConfigurations.B);
    const eventB = generator.generateEvent(testContext);
    results.B.push(analyzeEventQuality(eventB));
  }

  return {
    averageQualityA: results.A.reduce((a, b) => a + b.quality, 0) / results.A.length,
    averageQualityB: results.B.reduce((a, b) => a + b.quality, 0) / results.B.length
  };
}
```

## 🚀 Performance Optimization

### Caching Strategies
```javascript
class EventCache {
  constructor(generator, maxSize = 1000) {
    this.generator = generator;
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  getEvent(key, context) {
    const cacheKey = this.generateKey(key, context);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const event = this.generator.generateEvent(context);
    this.setEvent(cacheKey, event);
    return event;
  }

  setEvent(key, event) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, event);
  }

  generateKey(baseKey, context) {
    // Create deterministic key from context
    const relevantKeys = ['level', 'location', 'career'];
    const contextHash = relevantKeys
      .map(key => context[key])
      .filter(Boolean)
      .join('_');

    return `${baseKey}_${contextHash}`;
  }
}

// Usage
const eventCache = new EventCache(generator);
const cachedEvent = eventCache.getEvent('village_encounter', playerContext);
```

### Precomputation
```javascript
// Pre-generate common event types
class EventPrecomputer {
  constructor(generator, eventTypes = [], count = 50) {
    this.generator = generator;
    this.precomputed = {};

    eventTypes.forEach(type => {
      this.precomputed[type] = [];
      for (let i = 0; i < count; i++) {
        const event = generator.generateEvent({ type });
        this.precomputed[type].push(event);
      }
    });
  }

  getEvent(type, context) {
    const events = this.precomputed[type] || [];
    if (events.length === 0) {
      return this.generator.generateEvent(context);
    }

    // Find best matching precomputed event
    const bestMatch = events.reduce((best, event) => {
      const bestScore = this.calculateMatchScore(best, context);
      const currentScore = this.calculateMatchScore(event, context);
      return currentScore > bestScore ? event : best;
    });

    return bestMatch;
  }

  calculateMatchScore(event, context) {
    // Implement scoring based on context relevance
    let score = 0;
    // Add scoring logic here
    return score;
  }
}
```
