# Basic Usage Guide

This guide covers the fundamental concepts and usage patterns for Context Weaver.

## 🎯 Core Concepts

### What is Context Weaver?

Context Weaver is a **procedural content generation engine** that creates dynamic, context-aware narratives and interactive experiences. Unlike traditional random content generators, Context Weaver adapts its output based on user state, preferences, and environmental factors.

### Key Features

- **🎲 Markov Chain Generation**: Creates coherent text using statistical patterns
- **🎭 Context Awareness**: Content adapts to user profile, history, and state
- **🧠 Rule Engine**: Conditional logic for intelligent content modification
- **📚 Template System**: Structured content generation with reusable templates
- **🌐 Multi-Platform**: Works in Node.js, browsers, Unity, Godot, and more

## 🚀 Your First Content Generator

### Basic Setup

```javascript
// Import Context Weaver
import { ContextWeaver } from 'content-weaver';

// Create a generator instance
const generator = new ContextWeaver();

// Generate your first content
const content = generator.generateContent();

console.log(content.title);        // "Strategic Opportunity"
console.log(content.description);  // Generated narrative
console.log(content.choices);      // Interactive options
```

### Understanding the Output

Context Weaver generates structured content objects:

```javascript
{
  id: "content_1704567890123_xyz789",    // Unique identifier
  title: "Strategic Business Opportunity", // Human-readable title
  description: "A detailed narrative describing the scenario...",
  choices: [                           // Interactive options
    {
      text: "Accept the proposal",
      effect: { engagement: 20, influence: 15 },
      consequence: "cooperative_approach"
    },
    {
      text: "Request more information",
      effect: { knowledge: 10, time: -5 },
      consequence: "cautious_approach"
    }
  ],
  type: "BUSINESS_OPPORTUNITY",        // Content category
  difficulty: "medium",                // Complexity level
  theme: "professional",               // Content theme
  context: { /* Full context used */ }
}
```

## 🎭 Context-Aware Generation

### User Profiles

Make content adapt to different user types:

```javascript
// Executive user
const executiveContext = {
  experience: 35,
  engagement: 2500,
  influence: 40,
  reputation: 25,
  profile: 'executive',
  skills: { leadership: 75, negotiation: 60 },
  domain: 'business'
};

const executiveContent = generator.generateContent(executiveContext);
// Generates boardroom-level business scenarios

// Student user
const studentContext = {
  experience: 2,
  engagement: 150,
  influence: 5,
  reputation: 10,
  profile: 'student',
  skills: { learning: 60, creativity: 45 },
  domain: 'education'
};

const studentContent = generator.generateContent(studentContext);
// Generates educational, beginner-friendly content
```

### Environmental Context

Content adapts to settings and conditions:

```javascript
const generator = new ContextWeaver({ enableModifiers: true });

// Set environmental factors
generator.setEnvironmentalContext({
  weather: 'storm',
  season: 'winter',
  timeOfDay: 'night',
  location: 'urban'
});

// Content will incorporate stormy winter night atmosphere
const atmosphericContent = generator.generateContent({
  profile: 'detective',
  domain: 'mystery'
});
```

## 📝 Custom Training Data

### Basic Custom Content

Enhance generation with your own text:

```javascript
const customGenerator = new ContextWeaver({
  trainingData: [
    'Innovation drives business success in competitive markets',
    'Strategic partnerships create mutual growth opportunities',
    'Data-driven decisions lead to better business outcomes',
    'Customer feedback shapes product development strategies',
    'Market research reveals emerging trends and opportunities'
  ]
});

const businessContent = customGenerator.generateContent();
// Content will incorporate your business terminology and concepts
```

### Thematic Training

Create domain-specific content:

```javascript
// Sci-fi training data
const sciFiGenerator = new ContextWeaver({
  theme: 'sci-fi',
  trainingData: [
    'Neural interfaces connect minds to the galactic network',
    'Quantum drives propel starships through hyperspace',
    'AI companions provide wisdom and strategic guidance',
    'Alien artifacts hold ancient technological secrets',
    'Cybernetic enhancements grant superhuman abilities'
  ]
});

// Fantasy training data
const fantasyGenerator = new ContextWeaver({
  theme: 'fantasy',
  trainingData: [
    'Ancient runes glow with mystical energy',
    'Elven archers strike from impossible distances',
    'Dragon fire illuminates the midnight sky',
    'Enchanted forests whisper forgotten secrets',
    'Dwarven forges craft legendary weapons of power'
  ]
});
```

## 🎲 Multiple Content Types

### Single Content Items

```javascript
// Generate one piece of content
const singleContent = generator.generateContent(userContext);
console.log(singleContent.title);
```

### Multiple Content Items

```javascript
// Generate a batch of content
const contentBatch = generator.generateMultiple(userContext, 5);

// Process each item
contentBatch.forEach((content, index) => {
  console.log(`${index + 1}. ${content.title}`);
});
```

### Time-Aware Content

```javascript
// Content that changes with time
const timeAwareContent = generator.generateTimeAwareContent({
  ...userContext,
  season: 'winter',
  timeOfDay: 'night'
});
```

## 🧠 Rule Engine Basics

### Simple Conditional Rules

```javascript
const smartGenerator = new ContextWeaver({ enableRuleEngine: true });

// Add a rule for high-engagement users
smartGenerator.addCustomRule('high_engagement_bonus', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'engagement', value: 1000 } }
  ],
  effects: {
    addTags: ['vip_user'],
    modifyChoices: {
      multiply: { influence: 1.5 },  // 50% more influence rewards
      add: { reputation: 10 }        // Bonus reputation
    }
  }
});

// VIP users get enhanced content
const vipContent = smartGenerator.generateContent({
  engagement: 1500,  // Triggers the rule
  profile: 'premium'
});
```

## 📊 Quality and Statistics

### Content Quality Metrics

```javascript
const content = generator.generateContent();

// Check quality metrics
console.log('Quality Score:', content.qualityScore);
console.log('Complexity:', content.complexity);
console.log('Engagement Potential:', content.engagementRating);
```

### Generation Statistics

```javascript
// Get generator stats
const stats = generator.getStats();
console.log('Total Generations:', stats.totalGenerations);
console.log('Average Quality:', stats.averageQuality);
console.log('Active Rules:', stats.activeRules);
```

## 🔄 Error Handling

### Basic Error Handling

```javascript
try {
  const content = generator.generateContent(userContext);

  if (!content || !content.title) {
    throw new Error('Content generation failed');
  }

  // Process content
  displayContent(content);

} catch (error) {
  console.error('Content generation error:', error.message);

  // Fallback content
  const fallbackContent = {
    title: 'Default Scenario',
    description: 'A basic interactive scenario.',
    choices: [
      { text: 'Continue', effect: {}, consequence: 'continue' }
    ]
  };

  displayContent(fallbackContent);
}
```

### Validation

```javascript
// Validate user context before generation
function validateContext(context) {
  const required = ['experience', 'engagement', 'profile'];

  for (const field of required) {
    if (!(field in context)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (context.experience < 0 || context.experience > 100) {
    throw new Error('Experience must be between 0-100');
  }

  return true;
}

// Safe generation
const userContext = { experience: 25, engagement: 500, profile: 'standard' };
validateContext(userContext);
const content = generator.generateContent(userContext);
```

## 🎮 Interactive Examples

### Simple Choice Handler

```javascript
function handleChoice(content, choiceIndex) {
  const choice = content.choices[choiceIndex];

  if (!choice) {
    console.error('Invalid choice index');
    return;
  }

  // Apply choice effects
  applyEffects(choice.effect);

  // Generate follow-up content based on consequence
  const nextContext = {
    ...userContext,
    previousChoice: choice.consequence,
    consequenceHistory: [...(userContext.consequenceHistory || []), choice.consequence]
  };

  const followUpContent = generator.generateContent(nextContext);
  displayContent(followUpContent);
}

// Usage
const content = generator.generateContent(userContext);
displayContent(content);

// When user clicks choice 0
handleChoice(content, 0);
```

### Content Chain Creation

```javascript
// Create a simple story chain
function createStoryChain(startingContext) {
  const story = [];
  let currentContext = startingContext;
  let continueStory = true;

  while (continueStory && story.length < 5) {
    const content = generator.generateContent(currentContext);
    story.push(content);

    // Simple logic to continue or stop
    const hasEndingChoice = content.choices.some(choice =>
      choice.consequence.includes('ending') ||
      choice.consequence.includes('conclusion')
    );

    if (hasEndingChoice || Math.random() < 0.3) {
      continueStory = false;
    } else {
      // Continue with modified context
      currentContext = {
        ...currentContext,
        storyProgress: story.length,
        previousContent: content.id
      };
    }
  }

  return story;
}

// Generate a 3-5 part story
const storyChain = createStoryChain({
  experience: 20,
  engagement: 300,
  profile: 'adventurer',
  theme: 'fantasy'
});

storyChain.forEach((content, index) => {
  console.log(`Part ${index + 1}: ${content.title}`);
});
```

## 🧪 Testing Your Setup

### Basic Functionality Test

```javascript
// Test script
const { ContextWeaver } = require('content-weaver');

function testBasicFunctionality() {
  console.log('🧪 Testing Context Weaver...');

  try {
    // Test 1: Basic instantiation
    const generator = new ContextWeaver();
    console.log('✅ Generator created successfully');

    // Test 2: Basic content generation
    const content = generator.generateContent();
    if (content && content.title) {
      console.log('✅ Content generated:', content.title);
    } else {
      throw new Error('Content generation failed');
    }

    // Test 3: Context-aware generation
    const contextualContent = generator.generateContent({
      experience: 10,
      engagement: 100,
      profile: 'beginner'
    });
    console.log('✅ Contextual content generated');

    console.log('🎉 All tests passed! Context Weaver is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBasicFunctionality();
```

## 📚 Next Steps

Now that you understand the basics:

1. **[Installation Guide](Installation.md)** - Advanced setup options
2. **[Context Awareness](Context-Awareness.md)** - Deep dive into adaptive content
3. **[Rule Engine](Rule-Engine.md)** - Advanced conditional logic
4. **[Template System](Template-System.md)** - Custom content structures
5. **[API Reference](API-Methods.md)** - Complete method documentation

## 🆘 Need Help?

- **[FAQ](FAQ.md)** - Common questions and answers
- **[Troubleshooting](Troubleshooting.md)** - Solutions to common issues
- **[GitHub Issues](https://github.com/ContextWeaver/context-weaver/issues)** - Report bugs or request features

---

**Ready to create dynamic, context-aware content?** Context Weaver makes it easy to generate personalized experiences that adapt to your users' needs and preferences. 🚀
