# Template System

Context Weaver's template system provides structured content generation with reusable, customizable templates for consistent, high-quality output.

## What are Templates?

Templates are **pre-defined content structures** that ensure consistent formatting and behavior while allowing procedural generation within those structures.

Unlike free-form Markov generation, templates provide:
- **Predictable structure** - Consistent content format
- **Configurable parameters** - Dynamic content insertion
- **Quality assurance** - Professional content standards
- **Reusability** - Use the same template across projects

## Template Structure

```javascript
const template = {
  // Unique identifier
  id: 'business_decision',

  // Human-readable title (can include variables)
  title: 'Strategic ${industry} Investment Opportunity',

  // Main narrative (supports variable substitution)
  narrative: `Your ${companyType} company has identified a promising investment
  opportunity in the ${industry} sector. Market analysis shows ${marketData}
  potential growth, but the investment requires ${investmentAmount}.`,

  // Interactive choices
  choices: [
    {
      text: 'Proceed with full investment',
      effect: { budget: -investmentAmount, growth: 25, risk: 30 },
      consequence: 'aggressive_growth'
    },
    {
      text: 'Conduct further due diligence',
      effect: { time: -5, information: 20 },
      consequence: 'cautious_approach'
    },
    {
      text: 'Seek partnership investment',
      effect: { budget: -(investmentAmount * 0.6), growth: 15, risk: 15, partnerships: 1 },
      consequence: 'collaborative_growth'
    }
  ],

  // Metadata
  type: 'BUSINESS_DECISION',
  difficulty: 'medium',
  theme: 'business',
  tags: ['investment', 'strategy', 'growth'],

  // Optional requirements
  requirements: {
    minLevel: 5,
    requiredTags: ['business_focus']
  }
};
```

## Using Built-in Templates

### Available Template Genres

```javascript
// Fantasy templates
const fantasyTemplates = generator.getAvailableTemplates().fantasy;
// ['dragon_encounter', 'castle_intrigue', 'magic_quest', ...]

// Business templates
const businessTemplates = generator.getAvailableTemplates().business;
// ['merger_decision', 'market_expansion', 'budget_crisis', ...]

// Sci-fi templates
const sciFiTemplates = generator.getAvailableTemplates()['sci-fi'];
// ['space_battle', 'alien_first_contact', 'cyber_intrusion', ...]
```

### Generating from Templates

```javascript
// Generate from specific template
const dragonEvent = generator.generateFromTemplate('dragon_encounter');

// Generate from genre (random template)
const fantasyEvent = generator.generateFromGenre('fantasy');
const businessEvent = generator.generateFromGenre('business');
```

### Template with Context

```javascript
// Context enhances template generation
const userContext = {
  experience: 75,
  profile: 'executive',
  industry: 'technology',
  companySize: 'enterprise'
};

const contextualEvent = generator.generateFromTemplate('market_expansion', {
  variables: {
    industry: userContext.industry,
    companySize: userContext.companySize
  },
  context: userContext  // Used for rule processing
});
```

## Creating Custom Templates

### Manual Template Creation

```javascript
const customTemplate = {
  id: 'custom_training_scenario',
  title: '${traineeName} faces ${scenarioType} challenge',
  narrative: `During ${trainingModule} training, ${traineeName} encounters
  a ${scenarioType} situation requiring quick thinking and proper procedures.`,

  choices: [
    {
      text: 'Follow established procedures exactly',
      effect: { compliance: 20, time: -2, stress: -10 },
      consequence: 'by_the_book'
    },
    {
      text: 'Adapt procedures to the situation',
      effect: { innovation: 15, risk: 10, effectiveness: 25 },
      consequence: 'creative_solution'
    },
    {
      text: 'Seek guidance from supervisor',
      effect: { collaboration: 20, time: -5, confidence: 10 },
      consequence: 'team_approach'
    }
  ],

  type: 'TRAINING_SCENARIO',
  difficulty: 'medium',
  theme: 'education',
  tags: ['training', 'procedures', 'decision-making']
};

// Register the template
generator.registerEventTemplate('custom_training', customTemplate);

// Use immediately
const trainingEvent = generator.generateFromTemplate('custom_training');
```

### Template Variables

```javascript
const variableTemplate = {
  title: '${character} discovers ${artifact}',
  narrative: `${character} stumbles upon ${artifact} in the ${location}.
  The ${artifact} ${artifactCondition} and seems to ${artifactEffect}.`,

  choices: [
    {
      text: 'Carefully examine ${artifact}',
      effect: { knowledge: 15, risk: '${riskLevel}' }
    },
    {
      text: 'Take ${artifact} immediately',
      effect: { possession: 1, risk: '${riskLevel * 2}' }
    }
  ]
};

// Generate with variable substitution
const event = generator.generateFromTemplate(variableTemplate.id, {
  variables: {
    character: 'Elara the Explorer',
    artifact: 'Ancient Crystal',
    location: 'Forgotten Temple',
    artifactCondition: 'glows with ethereal light',
    artifactEffect: 'pulse with unknown energy',
    riskLevel: 25
  }
});
```

## Template Libraries

### Creating Template Collections

```javascript
// Define a library of related templates
const customerServiceTemplates = {
  complaint_handling: {
    title: 'Customer Service Challenge',
    narrative: 'A customer contacts support with a ${complaintType} issue...',
    // ... template definition
  },

  product_recommendation: {
    title: 'Product Recommendation Scenario',
    narrative: 'A customer is looking for ${productCategory} recommendations...',
    // ... template definition
  },

  upsell_opportunity: {
    title: 'Upsell Opportunity',
    narrative: 'During checkout, customer shows interest in ${relatedProduct}...',
    // ... template definition
  }
};

// Register entire library
Object.entries(customerServiceTemplates).forEach(([id, template]) => {
  generator.registerEventTemplate(id, template);
});
```

### Template Inheritance

```javascript
// Base template
const baseScenario = {
  type: 'INTERACTIVE_SCENARIO',
  difficulty: 'medium',
  choices: [
    { text: 'Option A', effect: { score: 10 } },
    { text: 'Option B', effect: { score: 5 } },
    { text: 'Option C', effect: { score: 1 } }
  ]
};

// Specialized templates
const quizTemplate = Object.assign({}, baseScenario, {
  id: 'educational_quiz',
  title: 'Knowledge Check: ${topic}',
  narrative: 'Test your understanding of ${topic}...',
  theme: 'education'
});

const gameTemplate = Object.assign({}, baseScenario, {
  id: 'strategy_decision',
  title: 'Strategic Choice: ${situation}',
  narrative: 'Your faction faces ${situation}...',
  theme: 'gaming'
});
```

## Advanced Template Features

### Conditional Templates

```javascript
const adaptiveTemplate = {
  title: '${userLevel > 10 ? "Advanced" : "Beginner"} ${challengeType} Challenge',

  choices: [
    {
      text: 'Standard approach',
      effect: { score: 10 }
    },
    // Conditional choice based on user level
    ...(userLevel > 15 ? [{
      text: 'Expert technique (unlocked)',
      effect: { score: 25, mastery: 5 }
    }] : [])
  ]
};
```

### Template Validation

```javascript
// Validate template structure
function validateTemplate(template) {
  const required = ['id', 'title', 'narrative', 'choices'];

  for (const field of required) {
    if (!template[field]) {
      throw new Error(`Template missing required field: ${field}`);
    }
  }

  if (!Array.isArray(template.choices) || template.choices.length === 0) {
    throw new Error('Template must have at least one choice');
  }

  return true;
}

// Safe template registration
try {
  validateTemplate(customTemplate);
  generator.registerEventTemplate(customTemplate.id, customTemplate);
} catch (error) {
  console.error('Template validation failed:', error.message);
}
```

### Template Performance

```javascript
// Pre-compile templates for better performance
const compiledTemplates = {};

function compileTemplate(template) {
  // Pre-process variables, validate structure, optimize lookups
  return {
    ...template,
    compiled: true,
    variableRegex: /\$\{([^}]+)\}/g,
    choiceCount: template.choices.length
  };
}

// Compile on registration
generator.registerEventTemplate = ((originalMethod) => {
  return function(id, template) {
    const compiled = compileTemplate(template);
    return originalMethod.call(this, id, compiled);
  };
})(generator.registerEventTemplate);
```

## Template Management

### Listing Templates

```javascript
// Get all templates
const allTemplates = generator.getAvailableTemplates();
console.log('Available genres:', Object.keys(allTemplates));

// Get templates by genre
const fantasyTemplates = allTemplates.fantasy;
console.log('Fantasy templates:', Object.keys(fantasyTemplates));

// Search templates by tags
function findTemplatesByTag(tag) {
  const results = [];
  Object.values(allTemplates).forEach(genre => {
    Object.values(genre).forEach(template => {
      if (template.tags && template.tags.includes(tag)) {
        results.push(template);
      }
    });
  });
  return results;
}

const combatTemplates = findTemplatesByTag('combat');
```

### Template Statistics

```javascript
// Get template usage statistics
const stats = generator.getTemplateStats();
console.log('Most used template:', stats.mostUsed);
console.log('Template hit rate:', stats.hitRate);
console.log('Average generation time:', stats.averageTime);
```

## Exporting and Importing Templates

### Export Templates

```javascript
// Export single template
const templateData = generator.exportTemplate('dragon_encounter');

// Export entire genre
const fantasyTemplates = generator.exportGenre('fantasy');

// Export all custom templates
const customTemplates = generator.exportCustomTemplates();

// Save to file
const fs = require('fs');
fs.writeFileSync('my-templates.json', JSON.stringify(customTemplates, null, 2));
```

### Import Templates

```javascript
// Import from file
const importedTemplates = JSON.parse(fs.readFileSync('shared-templates.json'));

// Register imported templates
generator.importTemplates(importedTemplates);

// Validate imports
const importResult = generator.importTemplates(importedTemplates);
console.log('Successfully imported:', importResult.successful);
console.log('Failed imports:', importResult.failed);
```

## Best Practices

### Template Design Principles

1. **Clear Objectives** - Each template should have a specific purpose
2. **Balanced Choices** - Provide meaningful, distinct options
3. **Appropriate Difficulty** - Match complexity to intended audience
4. **Flexible Variables** - Use variables for customization
5. **Comprehensive Effects** - Include meaningful consequences

### Performance Optimization

1. **Limit Template Count** - Too many templates slow lookups
2. **Pre-compile Variables** - Process variables during registration
3. **Cache Generated Content** - Reuse similar scenarios
4. **Lazy Loading** - Load templates on demand

### Maintenance

1. **Version Templates** - Track template changes
2. **Document Dependencies** - Note required context variables
3. **Test Thoroughly** - Validate all choice paths
4. **Regular Updates** - Refresh content periodically

---

**Next:** Learn about [Event Chains](Event-Chains.md) or explore [Time Systems](Time-Systems.md)
