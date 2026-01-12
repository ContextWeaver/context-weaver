#!/usr/bin/env node

/**
 * Template Generation System for RPG Event Generator v2.0.0
 * Generates thousands of diverse, high-quality event templates
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  outputDir: path.join(__dirname, '..', 'templates'),
  targetCount: 100, // Start with 100 for Phase 1a
  genres: ['fantasy', 'sci-fi', 'horror', 'historical', 'modern', 'cyberpunk', 'space-opera']
};

const GENRE_MAPPING = {
  'sci-fi': 'sci-fi',
  'space-opera': 'space-opera',
  'cyberpunk': 'cyberpunk',
  'fantasy': 'fantasy',
  'horror': 'horror',
  'historical': 'historical',
  'modern': 'modern'
};

const EVENT_TYPES = {
  COMBAT: ['AMBUSH', 'DUEL', 'BATTLE', 'SIEGE', 'GUERRILLA', 'NAVAL'],
  SOCIAL: ['BANQUET', 'BETRAYAL', 'ROMANCE', 'DIPLOMACY', 'NEGOTIATION', 'ALLIANCE'],
  EXPLORATION: ['RUINS', 'CAVE', 'FOREST', 'MOUNTAIN', 'DESERT', 'ISLAND'],
  ECONOMIC: ['TRADE', 'BARGAIN', 'BLACK_MARKET', 'AUCTION', 'HEIST', 'CONTRACT'],
  MYSTERY: ['INVESTIGATION', 'CRYPTIC_MESSAGE', 'ANCIENT_ARTIFACT', 'STRANGE_OCCURRENCE'],
  SUPERNATURAL: ['CURSE', 'POSSESSION', 'PROPHECY', 'MAGICAL_CREATURE', 'RITUAL'],
  POLITICAL: ['COUP', 'ELECTION', 'ASSASSINATION', 'TREATY', 'CORRUPTION'],
  TECHNOLOGICAL: ['HACK', 'MALFUNCTION', 'INVENTION', 'AI_REBELLION', 'CYBER_ATTACK'],
  HORROR: ['HAUNTING', 'MONSTER', 'MADNESS', 'CULT', 'UNDEAD'],
  QUEST: ['RETRIEVAL', 'ESCORT', 'DELIVERY', 'RESCUE', 'HUNT']
};

const LOCATIONS = {
  fantasy: ['castle', 'village', 'forest', 'mountain', 'dungeon', 'tavern', 'market'],
  'sci-fi': ['spaceship', 'space-station', 'alien-planet', 'megacity', 'laboratory'],
  horror: ['mansion', 'graveyard', 'abandoned-mine', 'cursed-forest', 'haunted-town'],
  historical: ['palace', 'battlefield', 'trading-post', 'colonial-town', 'ancient-ruins'],
  modern: ['city', 'suburb', 'office', 'mall', 'apartment', 'park'],
  cyberpunk: ['megacity', 'underground', 'corporate-tower', 'neon-district'],
  'space-opera': ['starship', 'alien-world', 'space-station', 'wormhole']
};

const CAREERS = ['warrior', 'mage', 'merchant', 'noble', 'thief', 'priest', 'scholar', 'explorer', 'diplomat'];

function generateTitle(type, genre, location) {
  const templates = {
    COMBAT: [
      `Desperate ${type} at ${capitalize(location)}`,
      `${type} in the ${capitalize(location)}`,
      `Sudden ${type} Encounter`,
      `The ${type} of ${capitalize(location)}`
    ],
    SOCIAL: [
      `Unexpected ${type} Meeting`,
      `${type} at Court`,
      `Social ${type} in ${capitalize(location)}`,
      `The ${type} Gathering`
    ],
    EXPLORATION: [
      `Discovery in ${capitalize(location)}`,
      `Exploring the ${capitalize(location)}`,
      `Ancient ${capitalize(location)} Secrets`,
      `${capitalize(location)} Exploration`
    ],
    ECONOMIC: [
      `${type} Deal Gone Wrong`,
      `Economic ${type} Opportunity`,
      `The ${type} of ${capitalize(location)}`,
      `${type} Negotiations`
    ],
    MYSTERY: [
      `The Mystery of ${capitalize(location)}`,
      `Cryptic ${type} Message`,
      `${type} Investigation`,
      `Strange ${capitalize(location)} Occurrence`
    ],
    SUPERNATURAL: [
      `${type} in ${capitalize(location)}`,
      `Supernatural ${type} Event`,
      `The ${type} Manifestation`,
      `${capitalize(location)} ${type}`
    ],
    POLITICAL: [
      `Political ${type} Crisis`,
      `${type} in ${capitalize(location)}`,
      `The ${type} Conspiracy`,
      `${capitalize(location)} Intrigue`
    ],
    TECHNOLOGICAL: [
      `${type} Malfunction`,
      `Technological ${type} Crisis`,
      `${type} Breakthrough`,
      `The ${type} System`
    ],
    HORROR: [
      `Terrifying ${type} in ${capitalize(location)}`,
      `${type} Horror`,
      `The ${capitalize(location)} ${type}`,
      `${type} Nightmare`
    ],
    QUEST: [
      `${type} Mission`,
      `The ${type} Quest`,
      `${type} for Hire`,
      `${capitalize(location)} ${type}`
    ]
  };

  const category = Object.keys(EVENT_TYPES).find(cat => EVENT_TYPES[cat].includes(type)) || 'QUEST';
  const options = templates[category] || templates.QUEST;
  return capitalize(options[Math.floor(Math.random() * options.length)]);
}

function capitalize(str) {
  return str.split(' ').map(word => {
    const lowerWords = ['at', 'in', 'the', 'of', 'and', 'or', 'but', 'for', 'to', 'with', 'by', 'on', 'as', 'a', 'an'];
    if (lowerWords.includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

function generateNarrative(title, type, genre, location, difficulty) {
  const templates = {
    fantasy: [
      `As you traverse the ${location}, you stumble upon ${title.toLowerCase()}. The air grows thick with magic and mystery.`,
      `Legends speak of ${title.toLowerCase()} in the ${location}. Today, you face this ancient challenge.`,
      `The ${location} holds many secrets. Today you discover ${title.toLowerCase()}, testing your mettle as a hero.`,
      `Ancient runes glow as ${title.toLowerCase()} unfolds in the ${location}, awakening powers long dormant.`,
      `Crystal chimes echo through the ${location} as ${title.toLowerCase()} demands your attention.`
    ],
    'sci-fi': [
      `Your scanners detect unusual readings from ${title.toLowerCase()} in ${location}. The future of your mission hangs in the balance.`,
      `In the vast expanse of space, ${title.toLowerCase()} presents itself as both opportunity and danger.`,
      `Technological marvels surround you in ${location}. Suddenly, ${title.toLowerCase()} demands your immediate attention.`,
      `Holographic displays flicker as ${title.toLowerCase()} emerges from the digital void in ${location}.`,
      `Quantum fluctuations herald ${title.toLowerCase()} aboard your vessel in ${location}.`
    ],
    horror: [
      `Shadows whisper secrets in the ${location}. ${title.toLowerCase()} emerges from the darkness, chilling your very soul.`,
      `The ${location} has always been cursed. Now ${title.toLowerCase()} proves the legends true.`,
      `Terror grips your heart as ${title.toLowerCase()} manifests in the foreboding ${location}.`,
      `Eerie silence falls over the ${location} as ${title.toLowerCase()} begins its terrifying work.`,
      `Cold sweat beads on your brow as ${title.toLowerCase()} reveals itself in the ${location}.`
    ],
    historical: [
      `In the annals of history, ${title.toLowerCase()} in ${location} will be remembered as a pivotal moment.`,
      `The ${location} bears witness to ${title.toLowerCase()}, where politics and destiny collide.`,
      `Ancient traditions meet modern challenges in ${title.toLowerCase()} at the ${location}.`,
      `Royal decrees echo through the ${location} as ${title.toLowerCase()} unfolds before your eyes.`,
      `The weight of history presses upon you as ${title.toLowerCase()} occurs in the ${location}.`
    ],
    cyberpunk: [
      `Neon lights reflect off rain-slicked streets as ${title.toLowerCase()} unfolds in the ${location}.`,
      `Corporate towers loom overhead while ${title.toLowerCase()} demands your attention in ${location}.`,
      `The net comes alive with data streams heralding ${title.toLowerCase()} in the ${location}.`,
      `Chrome and circuitry surround you as ${title.toLowerCase()} emerges from the digital shadows.`,
      `Megacity sprawl provides the backdrop for ${title.toLowerCase()} in ${location}.`
    ],
    modern: [
      `City lights illuminate ${title.toLowerCase()} as it unfolds in the bustling ${location}.`,
      `Digital notifications ping as ${title.toLowerCase()} interrupts your day in ${location}.`,
      `Contemporary life takes an unexpected turn with ${title.toLowerCase()} in the ${location}.`,
      `Social media buzzes with rumors of ${title.toLowerCase()} occurring right now in ${location}.`,
      `Modern conveniences fail you as ${title.toLowerCase()} demands immediate attention.`
    ],
    'space-opera': [
      `Star fields twinkle as ${title.toLowerCase()} erupts across multiple systems from ${location}.`,
      `Imperial fleets maneuver while ${title.toLowerCase()} threatens galactic peace in ${location}.`,
      `Alien artifacts pulse with energy as ${title.toLowerCase()} unfolds in the ${location}.`,
      `Faster-than-light communications carry news of ${title.toLowerCase()} throughout the galaxy.`,
      `Cosmic forces align as ${title.toLowerCase()} manifests in the legendary ${location}.`
    ]
  };

  const mappedGenre = GENRE_MAPPING[genre] || 'fantasy';
  const genreTemplates = templates[mappedGenre] || templates.fantasy;
  return genreTemplates[Math.floor(Math.random() * genreTemplates.length)];
}

function generateChoices(type, difficulty) {
  const choiceTemplates = {
    COMBAT: [
      { text: "Fight bravely and face the challenge head-on", effect: { risk: 20, reward: 30 }, consequence: "brave_combat" },
      { text: "Use strategy and cunning to outmaneuver your opponent", effect: { strategy: 15, risk: 10 }, consequence: "strategic_combat" },
      { text: "Attempt to flee and live to fight another day", effect: { cowardice: 10, safety: 15 }, consequence: "retreat_combat" }
    ],
    SOCIAL: [
      { text: "Use diplomacy and charm to navigate the situation", effect: { influence: 20, reputation: 10 }, consequence: "diplomatic_social" },
      { text: "Assert your authority and take command", effect: { influence: 15, risk: 25 }, consequence: "authoritative_social" },
      { text: "Observe quietly and gather information", effect: { knowledge: 15, influence: -5 }, consequence: "observant_social" }
    ],
    EXPLORATION: [
      { text: "Carefully investigate and document your findings", effect: { knowledge: 20, time: 1 }, consequence: "thorough_exploration" },
      { text: "Quickly search for valuables and depart", effect: { gold: 15, risk: 10 }, consequence: "quick_exploration" },
      { text: "Set up camp and study the area thoroughly", effect: { knowledge: 25, time: 2 }, consequence: "extended_exploration" }
    ],
    ECONOMIC: [
      { text: "Negotiate shrewdly for the best deal", effect: { gold: 25, reputation: 5 }, consequence: "shrewd_negotiation" },
      { text: "Take the straightforward approach", effect: { gold: 15, risk: 5 }, consequence: "straightforward_deal" },
      { text: "Walk away and seek better opportunities", effect: { gold: -10, opportunity: 20 }, consequence: "walk_away_deal" }
    ]
  };

  const category = Object.keys(EVENT_TYPES).find(cat => EVENT_TYPES[cat].includes(type)) || 'QUEST';
  const choices = choiceTemplates[category] || choiceTemplates.EXPLORATION;

  const adjustedChoices = choices.map(choice => ({
    ...choice,
    effect: adjustForDifficulty(choice.effect, difficulty)
  }));

  return adjustedChoices;
}

function adjustForDifficulty(effect, difficulty) {
  const multipliers = {
    easy: { reward: 1.5, risk: 0.5, gold: 1.3 },
    normal: { reward: 1.0, risk: 1.0, gold: 1.0 },
    hard: { reward: 0.7, risk: 1.4, gold: 0.8 },
    legendary: { reward: 0.5, risk: 2.0, gold: 0.6 }
  };

  const mult = multipliers[difficulty] || multipliers.normal;
  const adjusted = {};

  for (const [key, value] of Object.entries(effect)) {
    if (typeof value === 'number') {
      if (key.includes('risk')) {
        adjusted[key] = Math.round(value * mult.risk);
      } else if (key.includes('gold')) {
        adjusted[key] = Math.round(value * mult.gold);
      } else if (key.includes('reward')) {
        adjusted[key] = Math.round(value * mult.reward);
      } else {
        adjusted[key] = value;
      }
    } else {
      adjusted[key] = value;
    }
  }

  return adjusted;
}

function generateTags(type, genre, location) {
  const baseTags = [genre, location.toLowerCase().replace(/-/g, '')];

  const typeTags = {
    COMBAT: ['battle', 'fight', 'combat', 'danger'],
    SOCIAL: ['people', 'conversation', 'relationship', 'diplomacy'],
    EXPLORATION: ['discovery', 'search', 'investigation', 'travel'],
    ECONOMIC: ['trade', 'money', 'business', 'commerce'],
    MYSTERY: ['puzzle', 'investigation', 'clue', 'secret'],
    SUPERNATURAL: ['magic', 'supernatural', 'mystical', 'otherworldly'],
    POLITICAL: ['politics', 'power', 'authority', 'government'],
    TECHNOLOGICAL: ['technology', 'science', 'innovation', 'mechanical'],
    HORROR: ['fear', 'terror', 'horror', 'nightmare'],
    QUEST: ['adventure', 'mission', 'task', 'objective']
  };

  const category = Object.keys(EVENT_TYPES).find(cat => EVENT_TYPES[cat].includes(type)) || 'QUEST';
  const categoryTags = typeTags[category] || typeTags.QUEST;

  return [...baseTags, ...categoryTags.slice(0, 2), type.toLowerCase()];
}

function generateContextRequirements(genre, location, difficulty) {
  const requirements = {
    location: location
  };

  if (difficulty === 'legendary' && Math.random() > 0.5) {
    requirements.career = CAREERS[Math.floor(Math.random() * CAREERS.length)];
  }

  if (difficulty === 'hard') {
    requirements.min_level = Math.floor(Math.random() * 5) + 3;
  } else if (difficulty === 'legendary') {
    requirements.min_level = Math.floor(Math.random() * 10) + 10;
  }

  return requirements;
}

function generateTemplate(id, genre) {
  const type = Object.values(EVENT_TYPES).flat()[Math.floor(Math.random() * Object.values(EVENT_TYPES).flat().length)];
  const location = LOCATIONS[genre][Math.floor(Math.random() * LOCATIONS[genre].length)];
  const difficulty = ['easy', 'normal', 'hard', 'legendary'][Math.floor(Math.random() * 4)];

  const title = generateTitle(type, genre, location);
  const narrative = generateNarrative(title, type, genre, location, difficulty);
  const choices = generateChoices(type, difficulty);
  const tags = generateTags(type, genre, location);
  const contextRequirements = generateContextRequirements(genre, location, difficulty);

  return {
    title,
    narrative,
    choices,
    difficulty,
    type,
    tags,
    context_requirements: contextRequirements
  };
}

function generateTemplates() {
  console.log(`🎲 Starting template generation for ${CONFIG.targetCount} templates...`);

  const templates = {};
  let generated = 0;

  CONFIG.genres.forEach(genre => {
    const genreDir = path.join(CONFIG.outputDir, genre);
    if (!fs.existsSync(genreDir)) {
      fs.mkdirSync(genreDir, { recursive: true });
    }
    templates[genre] = [];
  });

  while (generated < CONFIG.targetCount) {
    const genre = CONFIG.genres[Math.floor(Math.random() * CONFIG.genres.length)];
    const template = generateTemplate(generated + 1, genre);

    // Save individual template file
    const filename = `event_${generated + 1}.json`;
    const filepath = path.join(CONFIG.outputDir, genre, filename);
    fs.writeFileSync(filepath, JSON.stringify(template, null, 2));

    templates[genre].push(filename.replace('.json', ''));
    generated++;

    if (generated % 10 === 0) {
      console.log(`📝 Generated ${generated} templates...`);
    }
  }

  // Update index.json with all templates
  const indexPath = path.join(CONFIG.outputDir, 'index.json');

  // Read existing index or create new one
  let indexData;
  if (fs.existsSync(indexPath)) {
    indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } else {
    indexData = {
      version: "2.0.0",
      genres: {},
      totalTemplates: 0
    };
  }

  // Get all existing templates from file system
  const allGenres = fs.readdirSync(CONFIG.outputDir).filter(dir =>
    fs.statSync(path.join(CONFIG.outputDir, dir)).isDirectory()
  );

  let totalCount = 0;

  allGenres.forEach(genre => {
    const genrePath = path.join(CONFIG.outputDir, genre);
    const templateFiles = fs.readdirSync(genrePath).filter(file =>
      file.endsWith('.json') && !file.includes('index')
    );

    const templateIds = templateFiles.map(file => file.replace('.json', ''));

    if (!indexData.genres[genre]) {
      indexData.genres[genre] = {
        name: genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' '),
        description: genre === 'fantasy' ? 'Magical worlds, dragons, wizards, and epic quests' :
                   genre === 'sci-fi' ? 'Space exploration, advanced technology, alien encounters' :
                   genre === 'horror' ? 'Supernatural terror, psychological horror, dark secrets' :
                   genre === 'historical' ? 'Medieval politics, exploration, court intrigue' :
                   `Events in the ${genre} genre`,
        templates: []
      };
    }

    indexData.genres[genre].templates = templateIds;
    totalCount += templateIds.length;
  });

  indexData.totalTemplates = totalCount;
  indexData.version = "2.0.0";

  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));

  console.log(`✅ Successfully generated ${generated} templates across ${CONFIG.genres.length} genres!`);
  console.log(`📁 Templates saved to ${CONFIG.outputDir}`);
}

// Run generation if called directly
if (require.main === module) {
  generateTemplates();
}

module.exports = { generateTemplates, generateTemplate };
