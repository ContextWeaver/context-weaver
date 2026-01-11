# Event Chains

Create multi-part story sequences with interconnected events and escalating consequences.

## What are Event Chains?

Event chains link multiple related events together, creating narrative arcs with persistent consequences and evolving storylines.

## Basic Chain Creation

```javascript
// Start a chain
const firstEvent = generator.startChain('BANDIT_RISING');

// The chain begins
console.log(firstEvent.title); // "Treacherous Bandit Ambush"

// Advance based on choice
const nextEvent = generator.advanceChain(firstEvent.chainId, 'hero');
// Continues the bandit storyline
```

## Chain Types

### Built-in Chains

- **BANDIT_RISING**: Highway robbery escalating to kingdom threat
- **COURT_SCANDAL**: Royal intrigue with betrayals
- **POLITICAL_UPRISING**: Social unrest building to revolution
- **MERCHANT_EMPIRE**: Business growth with setbacks

### Custom Chains

```javascript
const customChain = {
  id: 'career_progression',
  events: [
    {
      id: 'first_job',
      title: 'Your First Job',
      choices: [
        { text: 'Work hard', consequence: 'promotion' },
        { text: 'Slack off', consequence: 'fired' }
      ]
    },
    {
      id: 'promotion',
      title: 'Career Advancement',
      requirements: { previousChoice: 'promotion' }
      // Only accessible after working hard
    }
  ]
};

generator.registerEventChain('career_progression', customChain);
```

## Chain Management

```javascript
// Check active chains
const activeChains = generator.getActiveChains();

// Get chain progress
const chainStatus = generator.getChainStatus(chainId);

// Force complete a chain
generator.completeChain(chainId);
```

## Advanced Features

### Conditional Branching

Chains can branch based on player choices:

```javascript
const branchingChain = {
  events: [
    {
      id: 'initial_choice',
      branches: {
        'heroic': 'hero_path',
        'diplomatic': 'diplomat_path',
        'aggressive': 'warrior_path'
      }
    }
  ]
};
```

### Time-Based Progression

Chains that unfold over time:

```javascript
generator.startTimeBasedChain('political_uprising');
// Day 1: Whispers of dissent
// Day 7: Public protests
// Day 14: Open rebellion
```

---

*Comprehensive event chain documentation coming soon.*
