# Time Systems

Context Weaver includes sophisticated time management for creating evolving narratives, seasonal content, and time-based events.

## Overview

The time system enables:
- **Seasonal content** that changes with the calendar
- **Time-based events** that trigger after delays
- **Evolving narratives** that develop over extended periods
- **Temporal context** for all content generation

## Basic Time Management

### Current Time

```javascript
// Get current game world time
const currentTime = generator.getCurrentTime();

console.log(`Day ${currentTime.day}, Season: ${currentTime.season}`);
// "Day 15, Season: winter"
```

### Advancing Time

```javascript
// Advance by one day
const events = generator.advanceGameDay();

// Process any time-triggered events
events.forEach(event => {
  if (event.type === 'seasonal_change') {
    // Handle season transitions
    updateSeasonalContent(event.season);
  } else if (event.type === 'time_based_chain') {
    // Handle story progression
    advanceStory(event.chainId);
  }
});
```

## Seasonal Content

### Automatic Seasonal Adaptation

Content automatically adapts to seasons:

```javascript
// Winter content
generator.setEnvironmentalContext({ season: 'winter' });
const winterEvent = generator.generateContent();
// May include: "snowfall", "harsh cold", "winter preparations"

generator.setEnvironmentalContext({ season: 'summer' });
const summerEvent = generator.generateContent();
// May include: "scorching heat", "abundant harvests", "travel season"
```

### Seasonal Templates

```javascript
// Generate season-specific content
const seasonalTemplates = {
  spring: ['blooming_flowers', 'spring_rains', 'new_growth'],
  summer: ['heat_waves', 'festivals', 'travel'],
  autumn: ['falling_leaves', 'harvest_time', 'cooling_weather'],
  winter: ['snow_storms', 'holiday_celebrations', 'survival_challenges']
};

const season = generator.getCurrentTime().season;
const seasonTemplates = seasonalTemplates[season];
const seasonalEvent = generator.generateFromGenre(seasonTemplates[0]);
```

## Time-Based Events

### Scheduled Events

Create events that trigger after time delays:

```javascript
// Schedule an event for 7 days from now
generator.scheduleEvent({
  type: 'custom_event',
  title: 'Delayed Revelation',
  delay: 7,  // days
  data: { revelation: 'ancient_secret' }
});

// Advance time to trigger events
const triggeredEvents = generator.advanceGameDay();
// Returns array of events that should trigger today
```

### Time-Based Chains

Chains that unfold over extended periods:

```javascript
// Start a long-term storyline
generator.startTimeBasedChain('political_uprising');

// The chain develops over time:
// Day 1: Whispers of dissent appear
// Day 7: Public protests erupt
// Day 14: Open rebellion begins
// Day 21: Revolutionary climax
```

### Recurring Events

```javascript
// Set up recurring events
generator.addRecurringEvent({
  id: 'monthly_report',
  interval: 30,  // days
  title: 'Monthly Business Report',
  description: 'Time for your monthly performance review...'
});

// Events automatically trigger at intervals
```

## Temporal Context

### Time-Aware Generation

All content considers temporal factors:

```javascript
const context = {
  currentDay: 45,
  season: 'autumn',
  timeOfDay: 'evening',
  year: 1247
};

const timeAwareContent = generator.generateTimeAwareContent(context);
// Content reflects autumn evening atmosphere in year 1247
```

### Historical Context

Content can reference past events:

```javascript
// Record important events
generator.recordHistoricalEvent({
  day: 30,
  title: 'Great Battle of Eldergrove',
  significance: 'major_war'
});

// Future content can reference this
const futureEvent = generator.generateContent();
// May include: "In the wake of the Great Battle..."
```

## Advanced Time Features

### Time Dilation

Speed up or slow down time for different scenarios:

```javascript
// Normal time flow
generator.setTimeScale(1.0);  // Real-time

// Accelerated time for fast-forwarding
generator.setTimeScale(7.0);  // 7 days per real day

// Slow motion for dramatic events
generator.setTimeScale(0.1);  // Extended time perception
```

### Multiple Time Streams

Handle parallel timelines:

```javascript
// Create separate time contexts
const mainTimeline = generator.createTimeline('main_story');
const flashbackTimeline = generator.createTimeline('flashback', {
  offset: -365  // 1 year in the past
});

// Generate content in different timelines
const presentEvent = generator.generateContent({}, mainTimeline);
const pastEvent = generator.generateContent({}, flashbackTimeline);
```

### Time-Based Rules

Rules that activate based on temporal conditions:

```javascript
// Seasonal rule
generator.addCustomRule('winter_hardship', {
  conditions: [
    { type: 'season_is', params: { season: 'winter' } },
    { type: 'stat_less_than', params: { stat: 'supplies', value: 20 } }
  ],
  effects: {
    addTags: ['famine_risk', 'cold_weather'],
    modifyChoices: {
      multiply: { survival_difficulty: 1.5 }
    }
  }
});

// Time-sensitive rule
generator.addCustomRule('deadline_pressure', {
  conditions: [
    { type: 'days_remaining', params: { deadline: 'tax_season', days: 7 } }
  ],
  effects: {
    addTags: ['urgent', 'time_pressure'],
    modifyTitle: { append: ' (Deadline Approaching!)' }
  }
});
```

## Time System Configuration

### Custom Calendar Systems

```javascript
// Define custom calendar
generator.setCalendarSystem({
  seasons: ['growth', 'harvest', 'dormancy', 'bloom'],
  daysPerSeason: 91,
  hoursPerDay: 24,
  specialDates: {
    '91': 'Festival of First Harvest',
    '273': 'Winter Solstice Celebration'
  }
});
```

### Time Zone Handling

```javascript
// Handle multiple time zones
generator.setTimeZone('eastern');
const easternTime = generator.getCurrentTime();

generator.setTimeZone('pacific');
const pacificTime = generator.getCurrentTime();

// Events can trigger based on local time
```

## Performance Considerations

### Time System Optimization

```javascript
// Limit active time-based events
generator.setMaxScheduledEvents(100);

// Archive old historical events
generator.archiveOldEvents(365);  // Older than 1 year

// Batch time updates for performance
generator.batchTimeUpdates(() => {
  // Multiple time operations
  generator.advanceGameDay();
  generator.advanceGameDay();
  generator.advanceGameDay();
});
```

### Memory Management

```javascript
// Clean up completed chains
const completedChains = generator.getCompletedChains();
completedChains.forEach(chainId => {
  generator.archiveChain(chainId);
});

// Clear old scheduled events
generator.clearExpiredEvents();
```

## Integration Examples

### Game Time Management

```javascript
class GameTimeManager {
  constructor(generator) {
    this.generator = generator;
    this.gameSpeed = 1.0;  // 1 real second = 1 game hour
  }

  update(deltaTime) {
    // Convert real time to game time
    const gameTimeDelta = deltaTime * this.gameSpeed;

    // Advance game time
    while (gameTimeDelta >= 3600) {  // 1 hour = 3600 seconds
      this.generator.advanceGameDay();
      gameTimeDelta -= 3600;
    }

    // Process triggered events
    const events = this.generator.getTriggeredEvents();
    events.forEach(event => {
      this.handleTimeEvent(event);
    });
  }

  handleTimeEvent(event) {
    switch (event.type) {
      case 'seasonal_change':
        this.updateSeasonalContent(event.season);
        break;
      case 'story_progression':
        this.advanceStory(event.chainId);
        break;
      case 'recurring_event':
        this.triggerRecurringEvent(event.id);
        break;
    }
  }
}
```

### Business Simulation

```javascript
// Quarterly business cycles
generator.addRecurringEvent({
  id: 'quarterly_review',
  interval: 91,  // ~3 months
  title: 'Quarterly Business Review',
  description: 'Time to analyze quarterly performance and plan ahead...'
});

// Market cycles
generator.addRecurringEvent({
  id: 'market_cycle',
  interval: 180,  // ~6 months
  title: 'Market Cycle Shift',
  description: 'Market conditions are changing. Adapt your strategy...'
});
```

---

## Time System API Reference

| Method | Description |
|--------|-------------|
| `getCurrentTime()` | Get current game world time |
| `advanceGameDay()` | Advance time by one day |
| `setEnvironmentalContext()` | Set seasonal/temporal context |
| `scheduleEvent()` | Schedule future event |
| `startTimeBasedChain()` | Start time-evolving chain |
| `addRecurringEvent()` | Add recurring event |
| `setTimeScale()` | Control time flow rate |
| `createTimeline()` | Create parallel timeline |

*Comprehensive time system documentation with more advanced features coming soon.*
