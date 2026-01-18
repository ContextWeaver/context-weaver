// RPG Event Generator v2.0.0 - Validation Utilities
// Centralized input validation and error checking

import { VALIDATION_CONSTANTS } from './constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate event title
 */
export function validateTitle(title: string): ValidationResult {
  const errors: string[] = [];

  if (!title || typeof title !== 'string') {
    errors.push('Title must be a non-empty string');
  } else {
    if (title.length < VALIDATION_CONSTANTS.MIN_TITLE_LENGTH) {
      errors.push(`Title must be at least ${VALIDATION_CONSTANTS.MIN_TITLE_LENGTH} characters`);
    }
    if (title.length > VALIDATION_CONSTANTS.MAX_TITLE_LENGTH) {
      errors.push(`Title must be at most ${VALIDATION_CONSTANTS.MAX_TITLE_LENGTH} characters`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate event description/narrative
 */
export function validateDescription(description: string): ValidationResult {
  const errors: string[] = [];

  if (!description || typeof description !== 'string') {
    errors.push('Description must be a non-empty string');
  } else {
    if (description.length < VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH) {
      errors.push(`Description must be at least ${VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH} characters`);
    }
    if (description.length > VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be at most ${VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate event choices
 */
export function validateChoices(choices: any[]): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(choices)) {
    errors.push('Choices must be an array');
    return { isValid: false, errors };
  }

  if (choices.length < VALIDATION_CONSTANTS.MIN_CHOICES_PER_EVENT) {
    errors.push(`Must have at least ${VALIDATION_CONSTANTS.MIN_CHOICES_PER_EVENT} choices`);
  }

  if (choices.length > VALIDATION_CONSTANTS.MAX_CHOICES_PER_EVENT) {
    errors.push(`Must have at most ${VALIDATION_CONSTANTS.MAX_CHOICES_PER_EVENT} choices`);
  }

  choices.forEach((choice, index) => {
    if (!choice || typeof choice !== 'object') {
      errors.push(`Choice ${index + 1} must be an object`);
    } else {
      if (!choice.text || typeof choice.text !== 'string') {
        errors.push(`Choice ${index + 1} must have a text property`);
      }
      if (!choice.effect || typeof choice.effect !== 'object') {
        errors.push(`Choice ${index + 1} must have an effect property`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate player context
 */
export function validatePlayerContext(context: any): ValidationResult {
  const errors: string[] = [];

  if (context && typeof context !== 'object') {
    errors.push('Player context must be an object');
    return { isValid: false, errors };
  }

  // Validate numeric fields
  const numericFields = ['age', 'gold', 'influence', 'wealth', 'reputation', 'health', 'level'];
  numericFields.forEach(field => {
    if (context[field] !== undefined && typeof context[field] !== 'number') {
      errors.push(`${field} must be a number`);
    }
  });

  // Validate string fields
  const stringFields = ['career'];
  stringFields.forEach(field => {
    if (context[field] !== undefined && typeof context[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate difficulty level
 */
export function validateDifficulty(difficulty: string): ValidationResult {
  const errors: string[] = [];
  const validDifficulties = ['easy', 'normal', 'hard', 'legendary'];

  if (!difficulty || typeof difficulty !== 'string') {
    errors.push('Difficulty must be a string');
  } else if (!validDifficulties.includes(difficulty)) {
    errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate template structure
 */
export function validateTemplate(template: any): ValidationResult {
  const errors: string[] = [];

  if (!template || typeof template !== 'object') {
    errors.push('Template must be an object');
    return { isValid: false, errors };
  }

  // Required fields
  const requiredFields = ['title', 'narrative', 'choices'];
  requiredFields.forEach(field => {
    if (!template[field]) {
      errors.push(`Template must have ${field}`);
    }
  });

  // Validate components
  if (template.title) {
    const titleValidation = validateTitle(template.title);
    if (!titleValidation.isValid) {
      errors.push(...titleValidation.errors);
    }
  }

  if (template.narrative) {
    const descValidation = validateDescription(template.narrative);
    if (!descValidation.isValid) {
      errors.push(...descValidation.errors);
    }
  }

  if (template.choices) {
    const choicesValidation = validateChoices(template.choices);
    if (!choicesValidation.isValid) {
      errors.push(...choicesValidation.errors);
    }
  }

  // Validate conditional choices
  if (template.conditional_choices) {
    template.conditional_choices.forEach((cc, index) => {
      if (cc.choice_index < 0 || cc.choice_index >= template.choices.length) {
        errors.push(`Conditional choice ${index} references invalid choice index ${cc.choice_index}`);
      }
      if (!cc.conditions || cc.conditions.length === 0) {
        errors.push(`Conditional choice ${index} must have at least one condition`);
      }
    });
  }

  // Validate dynamic fields
  if (template.dynamic_fields) {
    template.dynamic_fields.forEach((df, index) => {
      if (!df.field || !['title', 'narrative', 'choice_text'].includes(df.field)) {
        errors.push(`Dynamic field ${index} has invalid field type '${df.field}'`);
      }
      if (df.field === 'choice_text' && df.choice_index === undefined) {
        errors.push(`Dynamic field ${index} with field 'choice_text' must specify choice_index`);
      }
      if (df.field === 'choice_text' && df.choice_index !== undefined &&
          (df.choice_index < 0 || df.choice_index >= template.choices.length)) {
        errors.push(`Dynamic field ${index} references invalid choice index ${df.choice_index}`);
      }
      if (!df.conditions || df.conditions.length === 0) {
        errors.push(`Dynamic field ${index} must have at least one condition`);
      }
    });
  }

  // Validate composition
  if (template.composition) {
    template.composition.forEach((comp, index) => {
      if (!comp.template_id) {
        errors.push(`Composition ${index} must specify template_id`);
      }
      if (comp.merge_strategy && !['append', 'prepend', 'replace', 'merge'].includes(comp.merge_strategy)) {
        errors.push(`Composition ${index} has invalid merge_strategy '${comp.merge_strategy}'`);
      }
    });
  }

  if (template.difficulty) {
    const difficultyValidation = validateDifficulty(template.difficulty);
    if (!difficultyValidation.isValid) {
      errors.push(...difficultyValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate generator options
 */
export function validateGeneratorOptions(options: any): ValidationResult {
  const errors: string[] = [];

  if (options && typeof options !== 'object') {
    errors.push('Generator options must be an object');
    return { isValid: false, errors };
  }

  // Validate numeric options
  if (options.stateSize !== undefined) {
    if (typeof options.stateSize !== 'number' || options.stateSize < 1) {
      errors.push('stateSize must be a positive number');
    }
  }

  if (options.trainingData !== undefined) {
    if (!Array.isArray(options.trainingData)) {
      errors.push('trainingData must be an array');
    } else {
      options.trainingData.forEach((item: any, index: number) => {
        if (typeof item !== 'string') {
          errors.push(`trainingData[${index}] must be a string`);
        }
      });
    }
  }

  // Validate boolean options
  const booleanOptions = [
    'enableTemplates', 'enableDependencies', 'enableModifiers',
    'enableRelationships', 'pureMarkovMode', 'enableRuleEngine'
  ];

  booleanOptions.forEach(option => {
    if (options[option] !== undefined && typeof options[option] !== 'boolean') {
      errors.push(`${option} must be a boolean`);
    }
  });

  // Validate string options
  if (options.theme !== undefined && options.theme !== null && typeof options.theme !== 'string') {
    errors.push('theme must be a string or null');
  }

  if (options.culture !== undefined && options.culture !== null && typeof options.culture !== 'string') {
    errors.push('culture must be a string or null');
  }

  if (options.language !== undefined && typeof options.language !== 'string') {
    errors.push('language must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate file path
 */
export function validateFilePath(filepath: string): ValidationResult {
  const errors: string[] = [];

  if (!filepath || typeof filepath !== 'string') {
    errors.push('File path must be a non-empty string');
  } else {
    if (filepath.length > 260) { // Windows MAX_PATH
      errors.push('File path is too long');
    }

    // Check for invalid characters
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(filepath)) {
      errors.push('File path contains invalid characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate ID format
 */
export function validateId(id: string): ValidationResult {
  const errors: string[] = [];

  if (!id || typeof id !== 'string') {
    errors.push('ID must be a non-empty string');
  } else {
    if (id.length < 1 || id.length > 100) {
      errors.push('ID must be between 1 and 100 characters');
    }

    // Allow alphanumeric, hyphens, and underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      errors.push('ID must contain only letters, numbers, hyphens, and underscores');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}