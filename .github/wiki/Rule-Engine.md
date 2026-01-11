# Rule Engine

Context Weaver's intelligent rule engine allows you to create conditional logic that dynamically modifies content generation based on user state, environmental factors, and custom conditions.

## What is the Rule Engine?

The rule engine processes **conditions** and applies **effects** to modify generated content. Rules act like intelligent filters that enhance, modify, or replace content based on specific criteria.

## Basic Rule Structure

```javascript
const rule = {
  conditions: [
    // IF conditions (all must be true)
    { type: 'stat_greater_than', params: { stat: 'level', value: 5 } }
  ],
  effects: {
    // THEN effects (applied when conditions met)
    addTags: ['high_level'],
    modifyChoices: {
      multiply: { rewards: 1.5 },
      add: { reputation: 10 }
    }
  },
  priority: 10  // Optional: higher numbers = processed later
};

generator.addCustomRule('vip_bonus', rule);
```

## Condition Types

### Statistical Conditions

```javascript
// Numeric comparisons
{ type: 'stat_greater_than', params: { stat: 'experience', value: 100 } }
{ type: 'stat_less_than', params: { stat: 'health', value: 50 } }
{ type: 'stat_equals', params: { stat: 'career', value: 'merchant' } }
{ type: 'stat_between', params: { stat: 'level', min: 5, max: 15 } }

// Profile conditions
{ type: 'profile_is', params: { profile: 'executive' } }
{ type: 'career_is', params: { career: 'warrior' } }
{ type: 'domain_is', params: { domain: 'business' } }
```

### Environmental Conditions

```javascript
// Time and season
{ type: 'season_is', params: { season: 'winter' } }
{ type: 'time_of_day', params: { timeOfDay: 'night' } }

// Location and context
{ type: 'location_is', params: { location: 'castle' } }
{ type: 'weather_is', params: { weather: 'storm' } }
```

### Complex Conditions

```javascript
// Logical operators
{
  type: 'and',
  params: {
    conditions: [
      { type: 'stat_greater_than', params: { stat: 'level', value: 10 } },
      { type: 'career_is', params: { career: 'noble' } }
    ]
  }
}

{
  type: 'or',
  params: {
    conditions: [
      { type: 'stat_greater_than', params: { stat: 'influence', value: 80 } },
      { type: 'profile_is', params: { profile: 'vip' } }
    ]
  }
}

{
  type: 'not',
  params: {
    condition: { type: 'stat_less_than', params: { stat: 'reputation', value: 20 } }
  }
}
```

## Effect Types

### Content Modification

```javascript
effects: {
  // Add metadata tags
  addTags: ['premium', 'urgent', 'educational'],

  // Modify choice effects
  modifyChoices: {
    multiply: { gold: 1.5, experience: 2.0 },  // Multiply rewards
    add: { reputation: 10, influence: 5 },     // Add flat bonuses
    set: { difficulty: 'hard' }                // Override values
  },

  // Modify content properties
  setDifficulty: 'legendary',
  modifyTitle: { prepend: '[URGENT] ', append: ' (Priority)' },
  setTheme: 'corporate',
  setCulture: 'executive'
}
```

### Conditional Effects

```javascript
effects: {
  // Apply effects only to certain choice types
  modifyChoices: {
    filter: { type: 'combat' },  // Only modify combat choices
    multiply: { damage: 1.3 }
  },

  // Random chance effects
  randomEffect: {
    chance: 0.3,  // 30% chance
    effect: { addTags: ['lucky_break'] }
  }
}
```

## Rule Management

### Adding Rules

```javascript
// Add with auto-generated ID
generator.addCustomRule(ruleDefinition);

// Add with custom ID
generator.addCustomRule('executive_bonus', ruleDefinition);

// Add multiple rules
const rules = {
  'beginner_help': beginnerRule,
  'expert_challenge': expertRule,
  'seasonal_bonus': seasonalRule
};

Object.entries(rules).forEach(([id, rule]) => {
  generator.addCustomRule(id, rule);
});
```

### Managing Rules

```javascript
// List all rules
const allRules = generator.getCustomRules();
console.log('Active rules:', Object.keys(allRules));

// Check if rule exists
const hasRule = generator.hasCustomRule('vip_bonus');

// Get specific rule
const vipRule = generator.getCustomRule('vip_bonus');

// Update rule
generator.updateCustomRule('vip_bonus', newRuleDefinition);

// Remove rule
generator.removeCustomRule('vip_bonus');

// Clear all rules
generator.clearCustomRules();
```

### Rule Priority

```javascript
// Rules process in priority order (higher = later)
generator.addCustomRule('base_modifier', baseRule, { priority: 10 });
generator.addCustomRule('vip_override', vipRule, { priority: 20 });  // Processes after base
generator.addCustomRule('emergency_override', emergencyRule, { priority: 100 });  // Processes last
```

## Practical Examples

### Experience-Based Difficulty

```javascript
// Beginner players get easier content
generator.addCustomRule('beginner_assistance', {
  conditions: [
    { type: 'stat_less_than', params: { stat: 'experience', value: 50 } }
  ],
  effects: {
    setDifficulty: 'easy',
    modifyChoices: {
      multiply: { rewards: 1.2 },  // 20% bonus
      multiply: { penalties: 0.8 } // 20% penalty reduction
    },
    addTags: ['tutorial', 'guided']
  }
});

// Expert players get challenging content
generator.addCustomRule('expert_challenge', {
  conditions: [
    { type: 'stat_greater_than', params: { stat: 'experience', value: 200 } }
  ],
  effects: {
    setDifficulty: 'hard',
    modifyChoices: {
      multiply: { rewards: 0.9 },  // 10% penalty
      multiply: { penalties: 1.3 } // 30% increased penalties
    },
    addTags: ['challenging', 'strategic']
  }
});
```

### Seasonal Content

```javascript
// Winter events get colder themes
generator.addCustomRule('winter_themes', {
  conditions: [
    { type: 'season_is', params: { season: 'winter' } }
  ],
  effects: {
    setTheme: 'fantasy',
    setCulture: 'norse',
    modifyTitle: { append: ' (Winter)' },
    addTags: ['cold', 'frost', 'winter']
  }
});

// Summer events get warmer themes
generator.addCustomRule('summer_themes', {
  conditions: [
    { type: 'season_is', params: { season: 'summer' } }
  ],
  effects: {
    setTheme: 'fantasy',
    setCulture: 'medieval',
    modifyTitle: { append: ' (Summer)' },
    addTags: ['warm', 'sunny', 'summer']
  }
});
```

### VIP Customer Experience

```javascript
generator.addCustomRule('vip_experience', {
  conditions: [
    {
      type: 'or',
      params: {
        conditions: [
          { type: 'profile_is', params: { profile: 'premium' } },
          { type: 'stat_greater_than', params: { stat: 'engagement', value: 500 } },
          { type: 'stat_greater_than', params: { stat: 'reputation', value: 80 } }
        ]
      }
    }
  ],
  effects: {
    addTags: ['vip', 'premium', 'priority'],
    modifyChoices: {
      multiply: { rewards: 1.5 },
      add: { influence: 15, reputation: 5 }
    },
    modifyTitle: { prepend: '⭐ ' },
    setDifficulty: 'medium'  // Ensure appropriate challenge
  }
});
```

## Advanced Rule Patterns

### Chain Reactions

```javascript
// First rule triggers secondary effects
generator.addCustomRule('chain_starter', {
  conditions: [{ type: 'stat_greater_than', params: { stat: 'momentum', value: 10 } }],
  effects: {
    addTags: ['chain_reaction'],
    modifyChoices: { add: { momentum: -5 } }  // Consume momentum
  }
});

// Secondary rule activates
generator.addCustomRule('chain_followup', {
  conditions: [
    { type: 'has_tag', params: { tag: 'chain_reaction' } },
    { type: 'random_chance', params: { chance: 0.7 } }
  ],
  effects: {
    modifyTitle: { append: ' (Chain Reaction!)' },
    multiply: { rewards: 2.0 }
  }
});
```

### Time-Based Rules

```javascript
// Rules that change over time
generator.addCustomRule('time_sensitive', {
  conditions: [
    { type: 'time_greater_than', params: { days: 30 } },  // After 30 days
    { type: 'stat_greater_than', params: { stat: 'loyalty', value: 60 } }
  ],
  effects: {
    addTags: ['loyal_customer'],
    modifyChoices: {
      add: { loyalty_bonus: 25 }
    }
  }
});
```

## Debugging Rules

### Rule Validation

```javascript
const rule = { /* your rule */ };
const validation = generator.validateCustomRule(rule);

if (!validation.valid) {
  console.error('Rule validation errors:', validation.errors);
}
```

### Rule Execution Tracing

```javascript
// Enable debug mode
const generator = new ContextWeaver({ debug: true });

// Generate content
const content = generator.generateContent(context);

// Check which rules applied
console.log('Applied rules:', content._debug.appliedRules);
console.log('Failed rules:', content._debug.failedRules);
console.log('Rule execution order:', content._debug.ruleOrder);
```

## Performance Considerations

### Rule Optimization

```javascript
// Prefer simple conditions over complex ones
// ✅ Good
{ type: 'stat_greater_than', params: { stat: 'level', value: 10 } }

// ❌ Avoid (slower)
{
  type: 'and',
  params: {
    conditions: [
      { type: 'stat_greater_than', params: { stat: 'level', value: 5 } },
      { type: 'stat_less_than', params: { stat: 'level', value: 20 } }
    ]
  }
}
```

### Rule Limits

- **Light usage**: < 50 rules (negligible performance impact)
- **Moderate usage**: 50-200 rules (minimal impact)
- **Heavy usage**: 200+ rules (consider optimization)

## Common Issues

### Rules Not Applying

**Check:**
1. Condition syntax is correct
2. Stat names match context properties
3. Rule priority isn't being overridden
4. Debug mode shows rule execution

### Conflicting Rules

**Solutions:**
1. Use specific conditions to avoid overlap
2. Adjust rule priorities
3. Combine rules with logical operators
4. Use tags to create rule dependencies

### Performance Problems

**Optimize:**
1. Simplify complex conditions
2. Reduce number of rules
3. Cache frequently used rule results
4. Use rule priorities to skip unnecessary processing

---

**Next:** Learn about the [Template System](Template-System.md) or explore [Event Chains](Event-Chains.md)
