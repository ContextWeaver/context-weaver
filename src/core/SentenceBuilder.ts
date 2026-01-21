// Sentence Builder System
// Builds grammatically correct sentences programmatically

import { Chance } from 'chance';

let nlp: any;
try {
  nlp = require('compromise');
} catch (e) {
  nlp = null;
}

export interface SentenceComponent {
  subject?: string;
  verb?: string;
  object?: string;
  complement?: string;
  adjective?: string;
  adverb?: string;
  preposition?: string;
  article?: string;
}

export interface SentenceStructure {
  pattern: 'svo' | 'sv' | 'svc' | 'svoo' | 'passive' | 'imperative' | 'exclamatory';
  components: SentenceComponent;
  modifiers?: {
    adjectives?: string[];
    adverbs?: string[];
  };
}

export class SentenceBuilder {
  private chance: Chance.Chance;

  constructor(chance?: Chance.Chance) {
    this.chance = chance || new Chance();
  }

  /**
   * Get appropriate article (a/an) for a word
   */
  private getArticle(word: string): string {
    if (nlp) {
      try {
        const doc = nlp(word);
        const article = doc.articles().out('text');
        if (article && (article.toLowerCase() === 'a' || article.toLowerCase() === 'an')) {
          return article.toLowerCase();
        }
      } catch (e) {
      }
    }
    
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const firstLetter = word.toLowerCase().charAt(0);
    
    if (vowels.includes(firstLetter)) {
      return 'an';
    }
    
    if (firstLetter === 'h') {
      const silentHWords = ['honor', 'honour', 'honest', 'hour', 'heir', 'herb'];
      if (silentHWords.some(w => word.toLowerCase().startsWith(w))) {
        return 'an';
      }
    }
    
    if (firstLetter === 'u') {
      const uAsConsonant = ['university', 'union', 'unicorn', 'uniform', 'unique', 'unit', 'unity', 'universe', 'usage', 'useful', 'usual', 'utensil', 'user', 'utopia', 'uranium'];
      if (uAsConsonant.some(w => word.toLowerCase().startsWith(w))) {
        return 'a';
      }
    }
    
    return 'a';
  }

  /**
   * Build a Subject-Verb-Object sentence
   */
  buildSVO(subject: string, verb: string, object: string, options?: {
    adjective?: string;
    adverb?: string;
    article?: string;
  }): string {
    const article = options?.article || this.getArticle(subject);
    const subjectWithArticle = subject.toLowerCase().startsWith('the ') || 
                               subject.toLowerCase().startsWith('a ') || 
                               subject.toLowerCase().startsWith('an ') ||
                               subject.toLowerCase().startsWith('your ') ||
                               subject.toLowerCase().startsWith('you ')
      ? subject
      : `${article} ${subject.toLowerCase()}`;
    
    let sentence = `${subjectWithArticle.charAt(0).toUpperCase() + subjectWithArticle.slice(1)}`;
    
    if (options?.adjective) {
      sentence += ` ${options.adjective.toLowerCase()}`;
    }
    
    sentence += ` ${verb}`;
    
    if (options?.adverb) {
      sentence += ` ${options.adverb.toLowerCase()}`;
    }
    
    const objectArticle = this.getArticle(object);
    const objectWithArticle = object.toLowerCase().startsWith('the ') || 
                              object.toLowerCase().startsWith('a ') || 
                              object.toLowerCase().startsWith('an ') ||
                              object.toLowerCase().startsWith('your ')
      ? object
      : `${objectArticle} ${object.toLowerCase()}`;
    
    sentence += ` ${objectWithArticle}.`;
    
    return sentence;
  }

  /**
   * Build a Subject-Verb sentence (intransitive)
   */
  buildSV(subject: string, verb: string, options?: {
    adjective?: string;
    adverb?: string;
    complement?: string;
    article?: string;
  }): string {
    const article = options?.article || this.getArticle(subject);
    const subjectWithArticle = subject.toLowerCase().startsWith('the ') || 
                               subject.toLowerCase().startsWith('a ') || 
                               subject.toLowerCase().startsWith('an ') ||
                               subject.toLowerCase().startsWith('your ') ||
                               subject.toLowerCase().startsWith('you ')
      ? subject
      : `${article} ${subject.toLowerCase()}`;
    
    let sentence = `${subjectWithArticle.charAt(0).toUpperCase() + subjectWithArticle.slice(1)}`;
    
    if (options?.adjective) {
      sentence += ` ${options.adjective.toLowerCase()}`;
    }
    
    sentence += ` ${verb}`;
    
    if (options?.adverb) {
      sentence += ` ${options.adverb.toLowerCase()}`;
    }
    
    if (options?.complement) {
      sentence += ` ${options.complement}`;
    }
    
    sentence += '.';
    
    return sentence;
  }

  /**
   * Build a Subject-Verb-Complement sentence
   */
  buildSVC(subject: string, verb: string, complement: string, options?: {
    adjective?: string;
    adverb?: string;
    article?: string;
  }): string {
    const article = options?.article || this.getArticle(subject);
    const subjectWithArticle = subject.toLowerCase().startsWith('the ') || 
                               subject.toLowerCase().startsWith('a ') || 
                               subject.toLowerCase().startsWith('an ') ||
                               subject.toLowerCase().startsWith('your ') ||
                               subject.toLowerCase().startsWith('you ')
      ? subject
      : `${article} ${subject.toLowerCase()}`;
    
    let sentence = `${subjectWithArticle.charAt(0).toUpperCase() + subjectWithArticle.slice(1)}`;
    
    if (options?.adjective) {
      sentence += ` ${options.adjective.toLowerCase()}`;
    }
    
    sentence += ` ${verb} ${complement}.`;
    
    if (options?.adverb) {
      sentence = sentence.replace('.', ` ${options.adverb.toLowerCase()}.`);
    }
    
    return sentence;
  }

  /**
   * Build a sentence with clause combination
   */
  combineClauses(clause1: string, clause2: string, conjunction: 'and' | 'but' | 'or' | 'while' | 'as'): string {
    const cleanClause1 = clause1.trim().replace(/\.$/, '');
    const cleanClause2 = clause2.trim().replace(/\.$/, '');
    
    return `${cleanClause1} ${conjunction} ${cleanClause2}.`;
  }

  /**
   * Add modifiers to a sentence
   */
  addModifiers(sentence: string, modifiers: {
    adjectives?: string[];
    adverbs?: string[];
  }): string {
    let modified = sentence;
    
    if (modifiers.adjectives && modifiers.adjectives.length > 0) {
      const adj = this.chance.pickone(modifiers.adjectives);
      const words = modified.split(' ');
      const nounIndex = words.findIndex((w, i) => {
        if (i === 0) return false;
        const prev = words[i - 1].toLowerCase();
        return prev === 'a' || prev === 'an' || prev === 'the';
      });
      
      if (nounIndex > 0) {
        words.splice(nounIndex, 0, adj.toLowerCase());
        modified = words.join(' ');
      }
    }
    
    if (modifiers.adverbs && modifiers.adverbs.length > 0) {
      const adv = this.chance.pickone(modifiers.adverbs);
      const verbIndex = modified.search(/\b(is|are|was|were|has|have|had|do|does|did|will|would|could|should|may|might|can)\b/i);
      
      if (verbIndex > -1) {
        const beforeVerb = modified.substring(0, verbIndex).trim();
        const afterVerb = modified.substring(verbIndex).trim();
        const verbMatch = afterVerb.match(/^(\w+)/);
        if (verbMatch) {
          modified = `${beforeVerb} ${verbMatch[0]} ${adv.toLowerCase()} ${afterVerb.substring(verbMatch[0].length).trim()}`;
        }
      } else {
        const words = modified.split(' ');
        const verbPos = words.findIndex(w => {
          const lower = w.toLowerCase();
          return lower.length > 3 && !lower.match(/^(the|a|an|your|you|this|that|these|those)$/);
        });
        if (verbPos > 0 && verbPos < words.length - 1) {
          words.splice(verbPos + 1, 0, adv.toLowerCase());
          modified = words.join(' ');
        }
      }
    }
    
    return modified;
  }

  /**
   * Build a sentence from a structure definition
   */
  buildFromStructure(structure: SentenceStructure): string {
    const { pattern, components, modifiers } = structure;
    
    let sentence = '';
    
    switch (pattern) {
      case 'svo':
        if (components.subject && components.verb && components.object) {
          sentence = this.buildSVO(
            components.subject,
            components.verb,
            components.object,
            {
              adjective: components.adjective,
              adverb: components.adverb,
              article: components.article
            }
          );
        }
        break;
        
      case 'sv':
        if (components.subject && components.verb) {
          sentence = this.buildSV(
            components.subject,
            components.verb,
            {
              adjective: components.adjective,
              adverb: components.adverb,
              complement: components.complement,
              article: components.article
            }
          );
        }
        break;
        
      case 'svc':
        if (components.subject && components.verb && components.complement) {
          sentence = this.buildSVC(
            components.subject,
            components.verb,
            components.complement,
            {
              adjective: components.adjective,
              adverb: components.adverb,
              article: components.article
            }
          );
        }
        break;
        
      case 'passive':
        if (components.object && components.verb) {
          const article = components.article || this.getArticle(components.object);
          const objectWithArticle = components.object.toLowerCase().startsWith('the ') || 
                                     components.object.toLowerCase().startsWith('a ') || 
                                     components.object.toLowerCase().startsWith('an ')
            ? components.object
            : `${article} ${components.object.toLowerCase()}`;
          
          sentence = `${objectWithArticle.charAt(0).toUpperCase() + objectWithArticle.slice(1)}`;
          if (components.adjective) {
            sentence += ` ${components.adjective.toLowerCase()}`;
          }
          sentence += ` ${components.verb}${components.complement ? ' ' + components.complement : ''}.`;
        }
        break;
        
      case 'imperative':
        if (components.verb) {
          sentence = `${components.verb.charAt(0).toUpperCase() + components.verb.slice(1)}`;
          if (components.object) {
            const objectArticle = this.getArticle(components.object);
            const objectWithArticle = components.object.toLowerCase().startsWith('the ') || 
                                       components.object.toLowerCase().startsWith('a ') || 
                                       components.object.toLowerCase().startsWith('an ')
              ? components.object
              : `${objectArticle} ${components.object.toLowerCase()}`;
            sentence += ` ${objectWithArticle}`;
          }
          sentence += '.';
        }
        break;
        
      case 'exclamatory':
        if (components.subject && components.verb) {
          const article = components.article || this.getArticle(components.subject);
          const subjectWithArticle = components.subject.toLowerCase().startsWith('the ') || 
                                     components.subject.toLowerCase().startsWith('a ') || 
                                     components.subject.toLowerCase().startsWith('an ')
            ? components.subject
            : `${article} ${components.subject.toLowerCase()}`;
          
          sentence = `What ${subjectWithArticle} ${components.verb}!`;
        }
        break;
    }
    
    if (modifiers && sentence) {
      sentence = this.addModifiers(sentence, modifiers);
    }
    
    return sentence;
  }

  /**
   * Validate sentence structure
   */
  validateStructure(sentence: string): boolean {
    if (!sentence || sentence.trim().length === 0) {
      return false;
    }
    
    if (!sentence.match(/[.!?]$/)) {
      return false;
    }
    
    if (nlp) {
      try {
        const doc = nlp(sentence);
        const hasSubject = doc.nouns().length > 0 || doc.match('#Pronoun').length > 0;
        const hasVerb = doc.verbs().length > 0;
        
        if (!hasSubject || !hasVerb) {
          return false;
        }
      } catch (e) {
      }
    }
    
    return true;
  }
}
