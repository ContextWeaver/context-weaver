# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.1] - 2026-01-20

### 🚀 Added
- **Infinite Extensibility**: Added index signature to `PlayerContext` allowing unlimited custom properties
- **Custom Handler System**: Register custom handlers for processing any context property
- **Automatic Property Processing**: Custom properties are automatically detected and processed without manual handler registration
- **Expanded Title Generation**: Significantly expanded vocabulary (150+ adjectives, 40+ nouns per type, 40+ suffixes) for 99%+ unique titles

### ✨ Improved
- **Description Coherence**: Fixed description generation to use proper sentence structures with noun extraction
- **Title Uniqueness**: Improved from ~19% to 99%+ unique titles across 1000 events
- **Custom Property Integration**: Custom properties automatically influence event generation (tags, event types, modifiers)

### 🔧 Changed
- **Context Analysis**: All custom properties are now preserved through the analysis cycle
- **Event Modifiers**: Custom properties automatically generate tags and influence event type preferences

## [3.0.2] - 2026-01-20

### 🐛 Fixed
- Fixed type safety in public API - replaced `any` types with proper `PlayerContext` and `Event` types
- Fixed cross-platform compatibility for `clean` script (now works on Windows, macOS, and Linux)
- Removed compiled files from source directory (`.js`, `.js.map`, `.d.ts`, `.d.ts.map` files)

### ✨ Improved
- Enabled TypeScript strict mode for better type safety and code quality
- Consolidated README documentation - removed duplicate sections
- Updated all version references to be consistent across the codebase
- Improved `.gitignore` to prevent compiled files from being committed

## [3.0.1] - 2026-01-19

### 🐛 Fixed
- Minor bug fixes and stability improvements
- Fixed template database adapter initialization issues
- Resolved world building system edge cases

### 📚 Documentation
- Updated API documentation
- Improved code examples

## [3.0.0] - 2026-01-19

### 🚀 Added

#### Database Integration
- **Pluggable Database Adapters**: Scalable storage with pluggable adapters for large-scale applications
- **Template Storage**: Store and retrieve templates from databases
- **Template Search**: Search templates in database with flexible query options
- **Memory Database Adapter**: Built-in in-memory database adapter for development and testing
- **Database Methods**: `storeTemplateInDatabase()`, `getTemplateFromDatabase()`, `searchTemplatesInDatabase()`

#### World Building System
- **Automated World Generation**: Generate complete game worlds with regions, factions, and history
- **Faction System**: Dynamic faction creation with power rankings and relationships
- **Historical Simulation**: Simulate world history over multiple years
- **World Methods**: `generateWorld()`, `simulateWorldYears()`, `getFactionPowerRanking()`, `getHistoricalEvents()`

#### Advanced Template Features
- **Conditional Templates**: Create templates with complex conditional logic
- **Template Composition**: Combine multiple templates with merge strategies
- **Template Inheritance**: Template inheritance and mixin support
- **Conditional Choices**: Dynamic choices based on player state and conditions

#### Performance Optimizations
- **Template Caching**: Advanced template caching for improved performance
- **Event Caching**: Cache generated events for faster retrieval
- **Parallel Generation**: Generate events in parallel with configurable thread count
- **Batched Processing**: Generate events in batches for memory efficiency
- **Performance Methods**: `generateEventsParallel()`, `generateEventsBatched()`

### 🔧 Changed
- **Architecture Refactoring**: Complete composition-based architecture overhaul
- **Modular Systems**: Improved separation of concerns with dependency injection
- **Type System**: Enhanced TypeScript type definitions throughout

### 📚 Documentation
- **Complete API Documentation**: Full TypeDoc reference for all new features
- **Usage Examples**: Comprehensive examples for database, world building, and advanced templates
- **Migration Guide**: Updated migration guide for v3.0.0

## [2.0.0] - 2026-01-11

### 🚀 Added

#### Template Library Expansion
- **Massive Template Library**: 429 professionally crafted event templates included
- **7 Complete Genres**: Fantasy, Sci-Fi, Horror, Historical, Modern, Cyberpunk, Space Opera
- **Quality Assurance**: All templates include proper difficulty, choices, and context requirements
- **NPM Package Inclusion**: All templates distributed with the package for immediate use

#### Custom Rule Engine
- **Advanced Rule Builder**: Create sophisticated conditional rules with visual interface
- **Dynamic Rule Evaluation**: Real-time rule processing with complex condition logic
- **Rule Effects System**: Modify event titles, choices, difficulty, and add custom tags
- **Rule Management**: Add, remove, and organize custom rules with persistence
- **Condition Types**: Support for stat requirements, location checks, time-based rules, and more

#### Theme Creator
- **Custom Theme Builder**: Design unique game worlds with training data
- **Pure Markov Mode**: Generate events using only custom training sentences
- **Theme Settings**: Configure rule engine, template library, and generation modes
- **Training Data Input**: Visual interface for entering theme-specific sentences
- **Theme Testing**: Test custom themes with real event generation

#### Event Economy System
- **User-Generated Content Sharing**: Theme and rule pack marketplace
- **Content Pack Creation**: Bundle themes and rules into complete configurations
- **Quality Metrics**: Automatic quality scoring for shared content
- **Export/Import System**: Easy sharing via JSON files

#### Cross-Platform Export
- **Unity C# Export**: Generate Unity ScriptableObject classes with full event data
- **Godot GDScript Export**: Create Godot Resource scripts with event implementations
- **TypeScript Export**: Strongly-typed event definitions for TypeScript projects
- **Export System**: Automated generation via `scripts/export-templates.js`
- **Working Integrations**: Direct code generation for Unity and Godot projects
- **Future Plans**: Unity Package Manager plugin and Godot Asset Library addon (planned)

#### Enhanced Web Demo
- **Complete Feature Integration**: All v2.0.0 features working together
- **Interactive Rule Engine**: Full rule creation and management interface
- **Theme Creator Interface**: Build and test custom themes visually
- **Mobile Responsive Design**: Optimized for all device sizes
- **Template Generation Tools**: CLI tools for generating events across 7 genres
- **Embedded Documentation**: Complete changelog and migration guide accessible in demo
- **Command-Line Demo**: Comprehensive demo.js showcasing all 21 features

#### Production-Ready Features
- **Stable API**: All methods properly implemented and tested
- **Error Handling**: Robust error handling throughout the system
- **Performance Optimizations**: Efficient event generation and rule evaluation
- **Cross-Browser Support**: Works in all modern browsers
- **CLI Tools**: Command-line utilities for content management and export
- **NPM Scripts**: Convenient npm commands for common operations
- **Global Installation**: Bin entries for global CLI tool access

### 🔧 Changed
- **Complete Architecture Overhaul**: Modular design with improved maintainability
- **Enhanced Browser Compatibility**: Works across all modern browsers
- **Performance Optimizations**: Efficient event generation and rule evaluation
- **Code Organization**: Better separation of concerns and cleaner architecture

### 🐛 Fixed
- **Rule Engine Functionality**: Fixed all rule creation and evaluation bugs
- **Event Generation**: Resolved fallback issues and improved template loading
- **NPC Relationships**: Implemented complete relationship system
- **Template System**: Fixed template loading and management issues
- **Method Compatibility**: Added all missing API methods and error handling
- **Demo Integration**: Fixed all web interface bugs and missing functionality

### 📚 Documentation
- **Complete README Overhaul**: Comprehensive feature documentation with examples
- **Production-Ready Demo**: Full web interface with all features working
- **API Documentation**: Complete method documentation and usage examples
- **Migration Guide**: Clear upgrade path from v1.x to v2.0.0
- **Integration Guides**: Unity, Godot, and TypeScript integration examples

## [1.3.0] - 2026-01-10

### 🚀 Added

#### Event Templates Library 📚
- **Genre-Specific Templates**: Pre-built event collections for fantasy, sci-fi, horror, and historical genres
- **Template Library System**: Load and use professionally crafted event templates
- **Template Generation**: `generateFromTemplate()` and `generateFromGenre()` methods
- **Template Management**: `getAvailableTemplates()` for discovering available content
- **Extensible Framework**: Easy to add new genres and templates
- **Quality Assurance**: All templates include proper difficulty, choices, and context requirements

### 📚 Documentation
- **Template Documentation**: Complete guide for using the template library
- **Genre Descriptions**: Detailed information about each template genre
- **API Examples**: Comprehensive usage examples for template functionality

## [1.2.0] - 2026-01-09

### 🚀 Added

#### Multi-Language Support 🌍
- **Translation System**: Complete internationalisation framework with locale support
- **Built-in Languages**: English (default), Spanish (`es`), French (`fr`)
- **Dynamic Language Switching**: `setLanguage()` method for runtime language changes
- **Custom Language Packs**: `loadLanguagePack()` for adding new languages
- **Variable Substitution**: Support for parameterised translations (`{{variable}}` syntax)
- **Cultural Adaptation**: Language-specific cultural context and formatting

#### Environmental Modifiers 🌤️
- **Weather Effects**: Rain, storm, snow, and clear weather modifiers
- **Seasonal Effects**: Spring, summer, autumn, winter environmental impacts
- **Modifier Stacking**: Combined weather and seasonal effects
- **Dynamic Event Modification**: Health drains, movement penalties, atmosphere changes
- **Configurable Modifiers**: Custom modifier creation and application

#### Event Dependencies 🔗
- **Prerequisite System**: Complex event unlocking requirements
- **Logical Operators**: AND/OR conditions for dependency chains
- **Multiple Dependency Types**:
  - `event_completed`: Require specific events to be finished
  - `stat_requirement`: Player stat thresholds (level, reputation, etc.)
  - `relationship_requirement`: NPC relationship requirements
  - `item_requirement`: Inventory-based prerequisites
- **Dependency Validation**: Runtime checking of event availability

#### NPC Relationship Networks 👥
- **Dynamic Relationships**: Strength-based NPC relationships (-100 to +100)
- **Relationship Evolution**: Automatic relationship changes based on player actions
- **Built-in Evolution Rules**: Predefined rules for common interactions (save_life, betray_trust, etc.)
- **Custom Relationship Rules**: Extensible system for adding new interaction types
- **Relationship Tracking**: History and analytics for NPC relationships
- **Network Analysis**: Relationship web visualisation and analysis

#### Enhanced Event Generation 🎭
- **Combined Feature Integration**: All new systems work together seamlessly
- **Contextual Enhancements**: Events adapt based on environmental, relational, and dependency context
- **Performance Optimisations**: Efficient caching and processing for complex scenarios

### 🔧 Changed
- **Improved Code Organisation**: Better separation of concerns with modular architecture
- **Enhanced Error Handling**: More robust error handling throughout the system
- **Performance Improvements**: Optimised event generation and modifier application

### 🐛 Fixed
- **Event Chain Advancement**: Fixed chain progression logic using correct chain IDs
- **Modifier Application**: Corrected modifier effect calculations and stacking
- **Test Coverage**: Comprehensive test suite covering all new features (69 tests total)

### 📚 Documentation
- **Complete README Overhaul**: Comprehensive feature documentation with examples
- **Enhanced Demo**: Full demonstration of all v1.0.0 and v1.2.0 features
- **API Documentation**: Detailed JSDoc comments for all new methods
- **Migration Guide**: Backward compatibility notes and upgrade instructions

### 🔒 Security
- **Input Validation**: Enhanced validation for all new input parameters
- **Safe Defaults**: Conservative defaults for all new features (opt-in by default)

## [1.1.4] - 2026-01-09

### 🐛 Fixed
- Minor bug fixes and stability improvements

### 📚 Documentation
- Updated installation instructions
- Improved code examples

## [1.1.3] - 2026-01-09

### 🐛 Fixed
- Markov chain generation edge cases
- Template validation improvements

## [1.1.2] - 2026-01-09

### ➕ Added
- Additional event templates
- Enhanced difficulty scaling

## [1.1.1] - 2026-01-09

### 🐛 Fixed
- Template loading performance
- Memory usage optimisations

## [1.1.0] - 2026-01-08

### 🚀 Added
- **Event Chains**: Multi-part story sequences with `startChain()` and `advanceChain()`
- **Time-Based Events**: Seasonal events and time-evolving chains
- **Game State Management**: Save/load functionality with `getGameState()` and `loadGameState()`

### ➕ Added
- **Modular Event System**: Custom templates, training data, and export/import
- **Dynamic Difficulty Scaling**: Events scale based on player power level
- **Enhanced Context Awareness**: More sophisticated player state analysis

## [1.0.0] - 2026-01-08

### 🚀 Added
- **Core Event Generation**: Basic procedural event creation with Markov chains
- **Player-Aware Events**: Events adapt to player stats, career, and relationships
- **14+ Event Types**: Comprehensive set of adventure, social, and economic events
- **Text Generation**: Custom training data for enhanced narrative quality
- **Difficulty Scaling**: Basic power-based event adjustment
- **Game Integration**: Save/load state support

### 📚 Documentation
- Complete README with usage examples
- API reference documentation
- Integration guides for different game engines

---

## 📋 Version Numbering

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

## 🎯 Migration Guide

### From 1.2.x to 1.3.0

All changes in v1.3.0 are **backwards compatible**. The template library is opt-in:

```javascript
// Before (still works)
const generator = new RPGEventGenerator();

// With template library
const generator = new RPGEventGenerator({
  enableTemplates: true,
  templateLibrary: 'fantasy'  // Load fantasy templates
});

// Generate from templates
const dragonEvent = generator.generateFromTemplate('dragon_lair');
const fantasyEvent = generator.generateFromGenre('fantasy');
```

### New Constructor Options

```javascript
const generator = new RPGEventGenerator({
  // Core options (v1.0.0+)
  theme: 'fantasy',
  culture: 'norse',
  trainingData: [...],

  // Enhanced options (v1.2.0+)
  enableModifiers: true,
  enableRelationships: true,
  enableDependencies: true,
  language: 'en',

  // New options (v1.3.0+)
  enableTemplates: true,      // Enable template library
  templateLibrary: 'fantasy'  // Genre to load: 'fantasy', 'sci-fi', 'horror', 'historical'
});
```

---

**Legend:**
- 🚀 **Added** for new features
- ➕ **Added** for smaller additions
- 🔧 **Changed** for changes in existing functionality
- 🐛 **Fixed** for any bug fixes
- 📚 **Documentation** for documentation updates
- 🔒 **Security** for security-related changes
