# Template Creation Guide

## Overview

Templates are the core of the RPG Event Generator. They define the structure, content, and behavior of generated events. This guide will walk you through creating effective templates for your RPG campaigns.

## Basic Template Structure

Every template must have these required fields:

```json
{
  "id": "unique_template_id",
  "title": "Event Title",
  "narrative": "The main story text of the event",
  "choices": [
    {
      "text": "Choice description",
      "effect": {
        "gold": 10,
        "reputation": -5
      }
    }
  ]
}
```

## Template Fields

### Required Fields

- **`id`**: Unique identifier for the template
- **`title`**: Display title for the event
- **`narrative`**: Main descriptive text
- **`choices`**: Array of player choices (minimum 2, maximum 8 recommended)

### Optional Fields

- **`type`**: Category ("combat", "social", "economic", "exploration", etc.)
- **`difficulty`**: Difficulty level ("easy", "normal", "hard", "legendary")
- **`tags`**: Array of descriptive tags for organization
- **`conditions`**: Requirements for the template to be used
- **`conditional_choices`**: Choices that appear based on conditions
- **`dynamic_fields`**: Fields that change based on context
- **`composition`**: Rules for combining with other templates
- **`extends`**: Parent template to inherit from
- **`mixins`**: Array of templates to mix behaviors from

## Choice Effects

Choices can have various effects on the game state:

```json
{
  "text": "Accept the merchant's offer",
  "effect": {
    "gold": -50,
    "items": ["healing_potion"],
    "reputation": 10,
    "relationships": {
      "merchant_guild": 5
    },
    "flags": ["merchant_favor"],
    "stats": {
      "charisma": 1
    }
  }
}
```

## Conditional Templates

Use conditions to control when templates appear:

```json
{
  "id": "dragon_encounter",
  "title": "Ancient Dragon",
  "conditions": [
    {
      "type": "stat_requirement",
      "field": "level",
      "operator": "gte",
      "value": 15
    },
    {
      "type": "has_tag",
      "tag": "dragon_quest_started"
    }
  ],
  "narrative": "A massive dragon blocks your path...",
  "choices": [...]
}
```

## Conditional Choices

Choices that only appear under certain conditions:

```json
{
  "id": "merchant_encounter",
  "title": "Market Merchant",
  "narrative": "A merchant offers you a special deal.",
  "choices": [
    {
      "text": "Buy the item",
      "effect": { "gold": -100, "items": ["magic_sword"] }
    }
  ],
  "conditional_choices": [
    {
      "condition": {
        "type": "stat_requirement",
        "field": "charisma",
        "operator": "gte",
        "value": 15
      },
      "choice": {
        "text": "Negotiate a better price",
        "effect": { "gold": -75, "items": ["magic_sword"] }
      }
    }
  ]
}
```

## Dynamic Fields

Fields that adapt based on player context:

```json
{
  "id": "personalized_greeting",
  "title": "Personal Greeting",
  "dynamic_fields": [
    {
      "field": "narrative",
      "template": "Hello {{player_name}}, {{greeting_based_on_time}}!",
      "context_mapping": {
        "player_name": "player.name",
        "greeting_based_on_time": {
          "condition": {
            "type": "time_of_day",
            "period": "morning"
          },
          "true": "good morning",
          "false": "good evening"
        }
      }
    }
  ],
  "narrative": "Hello {{player_name}}, {{greeting_based_on_time}}!",
  "choices": [...]
}
```

## Template Composition

Combine multiple templates dynamically:

```json
{
  "id": "composed_event",
  "title": "Complex Event",
  "narrative": "This event combines multiple scenarios.",
  "composition": [
    {
      "template_id": "weather_component",
      "merge_strategy": "append_narrative",
      "conditions": [
        {
          "type": "random_chance",
          "probability": 0.7
        }
      ]
    },
    {
      "template_id": "npc_component",
      "merge_strategy": "add_choices",
      "priority": 10
    }
  ],
  "choices": [...]
}
```

## Template Inheritance

Extend existing templates:

```json
{
  "id": "advanced_dragon",
  "extends": "basic_dragon",
  "difficulty": "legendary",
  "dynamic_fields": [
    {
      "field": "narrative",
      "template": "An ancient, massive {{color}} dragon appears!"
    }
  ],
  "conditional_choices": [
    {
      "condition": {
        "type": "has_item",
        "item": "dragon_scale"
      },
      "choice": {
        "text": "Show the dragon scale",
        "effect": { "reputation": 20 }
      }
    }
  ]
}
```

## Template Mixins

Mix in behaviors from other templates:

```json
{
  "id": "merchant_with_weather",
  "title": "Weather-Affected Merchant",
  "narrative": "You encounter a merchant during {{weather_conditions}}.",
  "mixins": [
    "merchant_dialogue",
    "weather_descriptions"
  ],
  "choices": [...]
}
```

## Best Practices

### Content Guidelines

1. **Clear Choices**: Each choice should have distinct, meaningful consequences
2. **Balanced Difficulty**: Match template difficulty to intended player level
3. **Descriptive Tags**: Use consistent tagging for organization
4. **Modular Design**: Create reusable components that can be mixed

### Technical Guidelines

1. **Unique IDs**: Use descriptive, unique identifiers
2. **Reasonable Length**: Keep narratives concise but descriptive
3. **Effect Balance**: Ensure effects are meaningful but not overpowering
4. **Condition Logic**: Test conditional logic thoroughly

### Organization Tips

1. **Categorize by Type**: Use consistent type categories
2. **Tag Strategically**: Use tags for filtering and organization
3. **Version Control**: Keep track of template versions
4. **Documentation**: Comment complex templates

## Example Templates

### Simple Combat Encounter

```json
{
  "id": "goblin_ambush",
  "title": "Goblin Ambush",
  "type": "combat",
  "difficulty": "easy",
  "tags": ["combat", "goblins", "ambush"],
  "narrative": "A group of goblins springs from the bushes, weapons raised!",
  "choices": [
    {
      "text": "Fight the goblins",
      "effect": {
        "health": -10,
        "experience": 25,
        "gold": 15
      }
    },
    {
      "text": "Try to flee",
      "effect": {
        "health": -5,
        "reputation": -5
      }
    },
    {
      "text": "Intimidate them",
      "effect": {
        "gold": 10,
        "reputation": 5
      }
    }
  ]
}
```

### Conditional Social Encounter

```json
{
  "id": "noble_invitation",
  "title": "Noble's Invitation",
  "type": "social",
  "difficulty": "normal",
  "tags": ["social", "nobility", "invitation"],
  "conditions": [
    {
      "type": "stat_requirement",
      "field": "reputation",
      "operator": "gte",
      "value": 50
    }
  ],
  "narrative": "A noble's messenger approaches with an invitation to a grand ball.",
  "choices": [
    {
      "text": "Accept the invitation",
      "effect": {
        "reputation": 15,
        "flags": ["noble_connections"]
      }
    },
    {
      "text": "Politely decline",
      "effect": {
        "reputation": 5
      }
    }
  ],
  "conditional_choices": [
    {
      "condition": {
        "type": "has_item",
        "item": "formal_attire"
      },
      "choice": {
        "text": "Attend in your finest clothes",
        "effect": {
          "reputation": 25,
          "relationships": {
            "noble_families": 10
          }
        }
      }
    }
  ]
}
```

## Loading Templates

Once created, templates can be loaded in several ways:

```javascript
// Individual template loading
generator.registerTemplate('my_template', templateData);

// Bulk loading from files
generator.loadTemplatesFromDirectory('./my-templates/');

// Database integration
await generator.storeTemplateInDatabase(templateData);
```

## Testing Templates

Always test your templates thoroughly:

```javascript
// Test basic generation
const event = generator.generateFromTemplate('my_template_id');

// Test with specific context
const eventWithContext = generator.generateFromTemplate('my_template_id', {
  level: 10,
  charisma: 15,
  gold: 500
});

// Validate template structure
const validation = generator.validateTemplate(templateData);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
```