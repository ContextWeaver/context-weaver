#!/usr/bin/env node

/**
 * Event Economy System for RPG Event Generator v2.0.0
 * User-generated content sharing and marketplace foundation
 */

const fs = require('fs');
const path = require('path');

class EventEconomy {
    constructor(storagePath = './user-content') {
        this.storagePath = storagePath;
        this.themesPath = path.join(storagePath, 'themes');
        this.rulesPath = path.join(storagePath, 'rules');
        this.packsPath = path.join(storagePath, 'packs');

        this.initializeDirectories();
    }

    initializeDirectories() {
        [this.storagePath, this.themesPath, this.rulesPath, this.packsPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    saveTheme(themeName, themeData) {
        const theme = {
            name: themeName,
            version: '1.0.0',
            created: new Date().toISOString(),
            author: themeData.author || 'Anonymous',
            description: themeData.description || '',
            tags: themeData.tags || [],
            license: themeData.license || 'MIT',

            // Generator settings - use existing settings if available, otherwise create from properties
            settings: themeData.settings || {
                theme: themeData.theme,
                culture: themeData.culture,
                enableRuleEngine: themeData.enableRuleEngine,
                enableTemplates: themeData.enableTemplates,
                pureMarkovMode: themeData.pureMarkovMode
            },

            // Content
            trainingData: themeData.trainingData || [],
            customRules: themeData.customRules || [],

            // Metadata
            statistics: {
                trainingSentences: themeData.trainingData?.length || 0,
                customRules: themeData.customRules?.length || 0,
                estimatedQuality: this.calculateThemeQuality(themeData)
            }
        };

        const filename = this.sanitizeFilename(themeName) + '.json';
        const filepath = path.join(this.themesPath, filename);

        fs.writeFileSync(filepath, JSON.stringify(theme, null, 2));
        console.log(`✅ Theme "${themeName}" saved to ${filepath}`);
        return filepath;
    }

    loadTheme(themeName) {
        const filename = this.sanitizeFilename(themeName) + '.json';
        const filepath = path.join(this.themesPath, filename);

        if (!fs.existsSync(filepath)) {
            throw new Error(`Theme "${themeName}" not found`);
        }

        const themeData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        console.log(`✅ Theme "${themeName}" loaded`);
        return themeData;
    }

    listThemes() {
        const files = fs.readdirSync(this.themesPath).filter(f => f.endsWith('.json'));
        return files.map(filename => {
            const filepath = path.join(this.themesPath, filename);
            const theme = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            return {
                name: theme.name,
                author: theme.author,
                description: theme.description,
                tags: theme.tags,
                version: theme.version,
                created: theme.created,
                quality: theme.statistics?.estimatedQuality || 0
            };
        });
    }

    deleteTheme(themeName) {
        const filename = this.sanitizeFilename(themeName) + '.json';
        const filepath = path.join(this.themesPath, filename);

        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log(`🗑️ Theme "${themeName}" deleted`);
            return true;
        }
        return false;
    }

    saveRulePack(packName, ruleData) {
        const pack = {
            name: packName,
            version: '1.0.0',
            created: new Date().toISOString(),
            author: ruleData.author || 'Anonymous',
            description: ruleData.description || '',
            tags: ruleData.tags || ['rules'],

            rules: ruleData.rules || [],

            statistics: {
                totalRules: ruleData.rules?.length || 0,
                conditionTypes: this.analyzeRuleConditions(ruleData.rules || [])
            }
        };

        const filename = this.sanitizeFilename(packName) + '.json';
        const filepath = path.join(this.rulesPath, filename);

        fs.writeFileSync(filepath, JSON.stringify(pack, null, 2));
        console.log(`✅ Rule pack "${packName}" saved to ${filepath}`);
        return filepath;
    }

    loadRulePack(packName) {
        const filename = this.sanitizeFilename(packName) + '.json';
        const filepath = path.join(this.rulesPath, filename);

        if (!fs.existsSync(filepath)) {
            throw new Error(`Rule pack "${packName}" not found`);
        }

        const packData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        console.log(`✅ Rule pack "${packName}" loaded`);
        return packData;
    }

    createContentPack(packName, packData) {
        const pack = {
            name: packName,
            version: '1.0.0',
            created: new Date().toISOString(),
            author: packData.author || 'Anonymous',
            description: packData.description || '',
            tags: packData.tags || ['content-pack'],

            // Include theme and rules
            theme: packData.theme,
            rulePacks: packData.rulePacks || [],

            // Metadata
            statistics: {
                totalThemes: packData.theme ? 1 : 0,
                totalRulePacks: packData.rulePacks?.length || 0,
                estimatedValue: this.calculatePackValue(packData)
            }
        };

        const filename = this.sanitizeFilename(packName) + '.json';
        const filepath = path.join(this.packsPath, filename);

        fs.writeFileSync(filepath, JSON.stringify(pack, null, 2));
        console.log(`✅ Content pack "${packName}" created`);
        return filepath;
    }

    exportTheme(themeName, exportPath = null) {
        const theme = this.loadTheme(themeName);
        const exportFilePath = exportPath || `${this.sanitizeFilename(themeName)}_export.json`;

        fs.writeFileSync(exportFilePath, JSON.stringify(theme, null, 2));
        console.log(`📤 Theme "${themeName}" exported to ${exportFilePath}`);
        return exportFilePath;
    }

    importTheme(importPath) {
        if (!fs.existsSync(importPath)) {
            throw new Error(`Import file not found: ${importPath}`);
        }

        const themeData = JSON.parse(fs.readFileSync(importPath, 'utf8'));

        // Validate theme structure
        if (!themeData.name || !themeData.settings) {
            throw new Error('Invalid theme file structure');
        }

        // Save imported theme
        const savedPath = this.saveTheme(themeData.name + '_imported', {
            ...themeData,
            imported: true,
            originalPath: importPath
        });

        console.log(`📥 Theme "${themeData.name}" imported successfully`);
        return savedPath;
    }

    sanitizeFilename(name) {
        return name.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
    }

    calculateThemeQuality(themeData) {
        let score = 0;

        const trainingCount = themeData.trainingData?.length || 0;
        score += Math.min(trainingCount * 2, 40); // Max 40 points for training data

        const ruleCount = themeData.customRules?.length || 0;
        score += Math.min(ruleCount * 5, 30); // Max 30 points for rules

        if (themeData.description && themeData.description.length > 20) {
            score += 15;
        }

        if (themeData.tags && themeData.tags.length > 0) {
            score += 15;
        }

        return Math.min(score, 100);
    }

    analyzeRuleConditions(rules) {
        const conditionTypes = {};

        rules.forEach(rule => {
            if (rule.conditions) {
                rule.conditions.forEach(condition => {
                    const type = condition.type || 'unknown';
                    conditionTypes[type] = (conditionTypes[type] || 0) + 1;
                });
            }
        });

        return conditionTypes;
    }

    calculatePackValue(packData) {
        let value = 0;

        if (packData.theme) {
            value += this.calculateThemeQuality(packData.theme);
        }

        if (packData.rulePacks) {
            packData.rulePacks.forEach(rules => {
                value += (rules.length || 0) * 10;
            });
        }

        return Math.min(value, 1000);
    }

    searchContent(query, type = 'all') {
        const results = [];

        if (type === 'all' || type === 'themes') {
            const themes = this.listThemes();
            themes.forEach(theme => {
                if (this.matchesQuery(theme, query)) {
                    results.push({ type: 'theme', ...theme });
                }
            });
        }

        if (type === 'all' || type === 'rules') {
            const ruleFiles = fs.readdirSync(this.rulesPath).filter(f => f.endsWith('.json'));
            ruleFiles.forEach(filename => {
                const filepath = path.join(this.rulesPath, filename);
                const pack = JSON.parse(fs.readFileSync(filepath, 'utf8'));

                if (this.matchesQuery(pack, query)) {
                    results.push({ type: 'rule-pack', ...pack });
                }
            });
        }

        return results;
    }

    matchesQuery(item, query) {
        const searchText = query.toLowerCase();
        return (
            item.name?.toLowerCase().includes(searchText) ||
            item.description?.toLowerCase().includes(searchText) ||
            item.tags?.some(tag => tag.toLowerCase().includes(searchText)) ||
            item.author?.toLowerCase().includes(searchText)
        );
    }

    getStatistics() {
        const themes = this.listThemes();
        const ruleFiles = fs.readdirSync(this.rulesPath).filter(f => f.endsWith('.json'));
        const packs = fs.readdirSync(this.packsPath).filter(f => f.endsWith('.json'));

        return {
            totalThemes: themes.length,
            totalRulePacks: ruleFiles.length,
            totalContentPacks: packs.length,
            averageThemeQuality: themes.length > 0 ?
                themes.reduce((sum, t) => sum + (t.quality || 0), 0) / themes.length : 0,
            popularTags: this.getPopularTags(themes),
            lastUpdated: new Date().toISOString()
        };
    }

    getPopularTags(themes) {
        const tagCounts = {};

        themes.forEach(theme => {
            theme.tags?.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
    }
}

function main() {
    const economy = new EventEconomy();

    const command = process.argv[2];
    const args = process.argv.slice(3);

    try {
        switch (command) {
            case 'list-themes':
                console.log('Available themes:');
                economy.listThemes().forEach(theme => {
                    console.log(`  - ${theme.name} by ${theme.author} (Quality: ${theme.quality}/100)`);
                });
                break;

            case 'save-theme':
                if (args.length < 1) {
                    console.log('Usage: node event-economy.js save-theme <theme-name> [description]');
                    return;
                }
                // This would need theme data - just showing the API
                console.log('Theme saving API ready - integrate with your generator');
                break;

            case 'stats':
                const stats = economy.getStatistics();
                console.log('Event Economy Statistics:');
                console.log(`  Themes: ${stats.totalThemes}`);
                console.log(`  Rule Packs: ${stats.totalRulePacks}`);
                console.log(`  Content Packs: ${stats.totalContentPacks}`);
                console.log(`  Average Quality: ${stats.averageThemeQuality.toFixed(1)}/100`);
                break;

            default:
                console.log('Event Economy System v2.0.0');
                console.log('');
                console.log('Commands:');
                console.log('  list-themes    - List all saved themes');
                console.log('  save-theme     - Save a theme (API ready)');
                console.log('  stats          - Show system statistics');
                break;
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Export for use in other modules
module.exports = EventEconomy;

// Run CLI if called directly
if (require.main === module) {
    main();
}
