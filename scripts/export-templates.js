#!/usr/bin/env node

/**
 * Cross-Platform Template Export System for RPG Event Generator v2.0.0
 * Exports templates in formats compatible with different game engines
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  inputDir: path.join(__dirname, '..', 'templates'),
  outputDir: path.join(__dirname, '..', 'exports'),
  formats: ['unity', 'godot', 'json', 'typescript']
};

if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

const formatConverters = {
  /**
   * Unity ScriptableObject format
   */
  unity: (template, filename) => {
    const className = toPascalCase(filename.replace('.json', ''));
    const choices = template.choices.map((choice, index) => `
      public Choice choice${index + 1} = new Choice() {
        text = "${choice.text}",
        consequence = "${choice.consequence}",
        effects = new Dictionary<string, float>() {
          ${Object.entries(choice.effect).map(([key, value]) => `{"${key}", ${value}}`).join(',\n          ')}
        }
      };`).join('');

    return `[CreateAssetMenu(fileName = "${className}", menuName = "RPG Events/${className}")]
public class ${className} : EventTemplate
{
    public string title = "${template.title}";
    public string narrative = @"${template.narrative}";
    public string type = "${template.type}";
    public string difficulty = "${template.difficulty}";
    public string[] tags = { ${template.tags.map(tag => `"${tag}"`).join(', ')} };
    public Dictionary<string, string> contextRequirements = new Dictionary<string, string>() {
      ${Object.entries(template.context_requirements || {}).map(([key, value]) => `{"${key}", "${value}"}`).join(',\n      ')}
    };${choices}

    public override void ExecuteEvent()
    {
        // Event execution logic here
        Debug.Log($"Executing event: {title}");
    }
}`;
  },

  /**
   * Godot Resource format (GDScript)
   */
  godot: (template, filename) => {
    const className = toPascalCase(filename.replace('.json', ''));
    const choices = template.choices.map((choice, index) => `
var choice_${index + 1} = {
  "text": "${choice.text}",
  "consequence": "${choice.consequence}",
  "effect": {
    ${Object.entries(choice.effect).map(([key, value]) => `"${key}": ${value}`).join(',\n    ')}
  }
}`).join('');

    return `extends Resource
class_name ${className}

export var title: String = "${template.title}"
export var narrative: String = """${template.narrative}"""
export var type: String = "${template.type}"
export var difficulty: String = "${template.difficulty}"
export var tags: Array = ${JSON.stringify(template.tags)}
export var context_requirements: Dictionary = ${JSON.stringify(template.context_requirements || {})}${choices}

func execute_event():
  # Event execution logic here
  print("Executing event: " + title)
  return choices`;
  },

  /**
   * TypeScript interface format
   */
  typescript: (template, filename) => {
    const interfaceName = toPascalCase(filename.replace('.json', ''));
    const choices = template.choices.map((choice, index) => `
  choice${index + 1}: {
    text: "${choice.text}",
    consequence: "${choice.consequence}",
    effect: {
      ${Object.entries(choice.effect).map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`).join(',\n      ')}
    }
  }`).join(',');

    return `export interface ${interfaceName} {
  title: "${template.title}";
  narrative: "${template.narrative}";
  type: "${template.type}";
  difficulty: "${template.difficulty}";
  tags: ${JSON.stringify(template.tags)};${choices}
  contextRequirements: ${JSON.stringify(template.context_requirements || {})};
}

export const ${toCamelCase(interfaceName)}: ${interfaceName} = {
  title: "${template.title}",
  narrative: "${template.narrative}",
  type: "${template.type}",
  difficulty: "${template.difficulty}",
  tags: ${JSON.stringify(template.tags)},${template.choices.map((choice, index) => `
  choice${index + 1}: {
    text: "${choice.text}",
    consequence: "${choice.consequence}",
    effect: {
      ${Object.entries(choice.effect).map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`).join(',\n      ')}
    }
  }`).join(',')}
  contextRequirements: ${JSON.stringify(template.context_requirements || {})}
};`;
  },

  /**
   * Clean JSON format (default)
   */
  json: (template, filename) => {
    return JSON.stringify(template, null, 2);
  }
};

function toPascalCase(str) {
  return str
    .replace(/[-_](.)/g, (_, letter) => letter.toUpperCase())
    .replace(/^(.)/, (_, letter) => letter.toUpperCase());
}

function toCamelCase(str) {
  return str
    .replace(/[-_](.)/g, (_, letter) => letter.toUpperCase())
    .replace(/^(.)/, (_, letter) => letter.toLowerCase());
}

function exportTemplates(format = 'json', genre = null) {
  console.log(`🚀 Starting template export in ${format.toUpperCase()} format...`);

  const genres = genre ? [genre] : fs.readdirSync(CONFIG.inputDir).filter(dir =>
    fs.statSync(path.join(CONFIG.inputDir, dir)).isDirectory()
  );

  let exportedCount = 0;

  genres.forEach(genreDir => {
    const genrePath = path.join(CONFIG.inputDir, genreDir);
    if (!fs.statSync(genrePath).isDirectory()) return;

    const outputGenreDir = path.join(CONFIG.outputDir, format, genreDir);
    if (!fs.existsSync(outputGenreDir)) {
      fs.mkdirSync(outputGenreDir, { recursive: true });
    }

    const templateFiles = fs.readdirSync(genrePath).filter(file =>
      file.endsWith('.json') && !file.includes('index')
    );

    templateFiles.forEach(filename => {
      try {
        const templatePath = path.join(genrePath, filename);
        const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

        const converter = formatConverters[format];
        if (!converter) {
          console.error(`❌ Unknown format: ${format}`);
          return;
        }

        const convertedContent = converter(template, filename);

        let outputFilename;
        switch (format) {
          case 'unity':
            outputFilename = filename.replace('.json', '.cs');
            break;
          case 'godot':
            outputFilename = filename.replace('.json', '.gd');
            break;
          case 'typescript':
            outputFilename = filename.replace('.json', '.ts');
            break;
          default:
            outputFilename = filename;
        }

        const outputPath = path.join(outputGenreDir, outputFilename);
        fs.writeFileSync(outputPath, convertedContent);

        exportedCount++;
      } catch (error) {
        console.error(`❌ Error exporting ${filename}:`, error.message);
      }
    });
  });

  console.log(`✅ Successfully exported ${exportedCount} templates in ${format.toUpperCase()} format!`);
  console.log(`📁 Output directory: ${path.join(CONFIG.outputDir, format)}`);
}

function exportIndexFiles() {
  console.log(`📋 Generating index files for all formats...`);

  CONFIG.formats.forEach(format => {
    const formatDir = path.join(CONFIG.outputDir, format);

    if (!fs.existsSync(formatDir)) {
      fs.mkdirSync(formatDir, { recursive: true });
    }

    if (format === 'json') {
      const sourceIndex = path.join(CONFIG.inputDir, 'index.json');
      const destIndex = path.join(formatDir, 'index.json');
      if (fs.existsSync(sourceIndex)) {
        fs.copyFileSync(sourceIndex, destIndex);
      }
    } else {
      const indexContent = generateIndexForFormat(format);
      fs.writeFileSync(path.join(formatDir, 'index.txt'), indexContent);
    }
  });

  console.log(`✅ Index files generated for all formats`);
}

function generateIndexForFormat(format) {
  const genres = fs.readdirSync(CONFIG.inputDir).filter(dir =>
    fs.statSync(path.join(CONFIG.inputDir, dir)).isDirectory()
  );

  let content = `RPG Event Generator v2.0.0 - ${format.toUpperCase()} Export Index\n`;
  content += '='.repeat(50) + '\n\n';

  genres.forEach(genre => {
    const genrePath = path.join(CONFIG.outputDir, format, genre);
    if (fs.existsSync(genrePath)) {
      const files = fs.readdirSync(genrePath).filter(file =>
        file.endsWith(getExtensionForFormat(format))
      );

      content += `${genre.toUpperCase()} (${files.length} templates):\n`;
      files.forEach(file => {
        content += `  - ${file}\n`;
      });
      content += '\n';
    }
  });

  return content;
}

function getExtensionForFormat(format) {
  switch (format) {
    case 'unity': return '.cs';
    case 'godot': return '.gd';
    case 'typescript': return '.ts';
    default: return '.json';
  }
}

function main() {
  const args = process.argv.slice(2);
  const format = args[0] || 'json';
  const genre = args[1] || null;

  if (!CONFIG.formats.includes(format)) {
    console.error(`❌ Unsupported format: ${format}`);
    console.log(`📋 Supported formats: ${CONFIG.formats.join(', ')}`);
    process.exit(1);
  }

  exportTemplates(format, genre);
  exportIndexFiles();
}

if (require.main === module) {
  main();
}

module.exports = { exportTemplates, exportIndexFiles };
