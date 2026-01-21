// Description Fragment Library
// Pre-written, grammatically correct fragments organized by event type and context

import { Chance } from 'chance';

export interface Fragment {
  text: string;
  type: 'opening' | 'middle' | 'closing' | 'standalone';
  requiresSubject?: boolean;
  requiresObject?: boolean;
  eventTypes?: string[];
}

export interface FragmentLibrary {
  [eventType: string]: {
    openings: Fragment[];
    middles: Fragment[];
    closings: Fragment[];
    standalones: Fragment[];
  };
}

export class DescriptionFragmentLibrary {
  private library: FragmentLibrary;
  private chance: Chance.Chance;

  constructor(chance?: Chance.Chance) {
    this.chance = chance || new Chance();
    this.library = this.initializeLibrary();
  }

  /**
   * Initialize the fragment library with pre-written fragments
   */
  private initializeLibrary(): FragmentLibrary {
    const baseLibrary: FragmentLibrary = {
      COMBAT: {
        openings: [
          { text: 'blocks your path', type: 'opening', requiresSubject: true },
          { text: 'threatens you', type: 'opening', requiresSubject: true },
          { text: 'confronts you', type: 'opening', requiresSubject: true },
          { text: 'challenges you', type: 'opening', requiresSubject: true },
          { text: 'engages you', type: 'opening', requiresSubject: true }
        ],
        middles: [
          { text: 'and demands your attention', type: 'middle' },
          { text: 'requiring immediate action', type: 'middle' },
          { text: 'creating a dangerous situation', type: 'middle' },
          { text: 'forcing you to make a decision', type: 'middle' }
        ],
        closings: [
          { text: 'This situation cannot be ignored.', type: 'closing' },
          { text: 'You must respond quickly.', type: 'closing' },
          { text: 'The danger is immediate.', type: 'closing' }
        ],
        standalones: [
          { text: 'A threat emerges that requires your immediate attention.', type: 'standalone' },
          { text: 'You find yourself in a dangerous confrontation.', type: 'standalone' },
          { text: 'Combat is unavoidable.', type: 'standalone' }
        ]
      },
      SOCIAL: {
        openings: [
          { text: 'approaches you', type: 'opening', requiresSubject: true },
          { text: 'greets you', type: 'opening', requiresSubject: true },
          { text: 'seeks your attention', type: 'opening', requiresSubject: true },
          { text: 'offers an opportunity', type: 'opening', requiresSubject: true }
        ],
        middles: [
          { text: 'and presents an interesting situation', type: 'middle' },
          { text: 'creating a social opportunity', type: 'middle' },
          { text: 'offering new possibilities', type: 'middle' }
        ],
        closings: [
          { text: 'This could be beneficial.', type: 'closing' },
          { text: 'Social connections matter here.', type: 'closing' },
          { text: 'An opportunity for interaction.', type: 'closing' }
        ],
        standalones: [
          { text: 'A social gathering presents itself.', type: 'standalone' },
          { text: 'You encounter an interesting social situation.', type: 'standalone' },
          { text: 'An opportunity for networking arises.', type: 'standalone' }
        ]
      },
      EXPLORATION: {
        openings: [
          { text: 'appears before you', type: 'opening', requiresSubject: true },
          { text: 'lies ahead', type: 'opening', requiresSubject: true },
          { text: 'awaits discovery', type: 'opening', requiresSubject: true },
          { text: 'beckons you forward', type: 'opening', requiresSubject: true }
        ],
        middles: [
          { text: 'promising new discoveries', type: 'middle' },
          { text: 'offering unknown possibilities', type: 'middle' },
          { text: 'hiding secrets within', type: 'middle' }
        ],
        closings: [
          { text: 'What will you find?', type: 'closing' },
          { text: 'Adventure awaits.', type: 'closing' },
          { text: 'The path forward is clear.', type: 'closing' }
        ],
        standalones: [
          { text: 'A new area reveals itself for exploration.', type: 'standalone' },
          { text: 'You discover something worth investigating.', type: 'standalone' },
          { text: 'An unexplored path opens before you.', type: 'standalone' }
        ]
      },
      ECONOMIC: {
        openings: [
          { text: 'presents a financial opportunity', type: 'opening', requiresSubject: true },
          { text: 'offers a deal', type: 'opening', requiresSubject: true },
          { text: 'requires investment', type: 'opening', requiresSubject: true }
        ],
        middles: [
          { text: 'with potential for profit', type: 'middle' },
          { text: 'creating economic implications', type: 'middle' },
          { text: 'offering financial benefits', type: 'middle' }
        ],
        closings: [
          { text: 'Wealth could be gained here.', type: 'closing' },
          { text: 'A wise investment might pay off.', type: 'closing' },
          { text: 'Economic opportunity knocks.', type: 'closing' }
        ],
        standalones: [
          { text: 'A business opportunity presents itself.', type: 'standalone' },
          { text: 'You encounter a potential financial gain.', type: 'standalone' },
          { text: 'An economic situation requires your attention.', type: 'standalone' }
        ]
      },
      MYSTERY: {
        openings: [
          { text: 'puzzles you', type: 'opening', requiresSubject: true },
          { text: 'raises questions', type: 'opening', requiresSubject: true },
          { text: 'demands investigation', type: 'opening', requiresSubject: true },
          { text: 'hides secrets', type: 'opening', requiresSubject: true }
        ],
        middles: [
          { text: 'with no clear explanation', type: 'middle' },
          { text: 'creating an intriguing mystery', type: 'middle' },
          { text: 'leaving you curious', type: 'middle' }
        ],
        closings: [
          { text: 'The truth remains hidden.', type: 'closing' },
          { text: 'Answers await discovery.', type: 'closing' },
          { text: 'A mystery to be solved.', type: 'closing' }
        ],
        standalones: [
          { text: 'Something mysterious catches your attention.', type: 'standalone' },
          { text: 'A puzzling situation presents itself.', type: 'standalone' },
          { text: 'An enigma awaits investigation.', type: 'standalone' }
        ]
      },
      SUPERNATURAL: {
        openings: [
          { text: 'manifests before you', type: 'opening', requiresSubject: true },
          { text: 'emerges from the void', type: 'opening', requiresSubject: true },
          { text: 'defies explanation', type: 'opening', requiresSubject: true },
          { text: 'transcends reality', type: 'opening', requiresSubject: true }
        ],
        middles: [
          { text: 'with otherworldly power', type: 'middle' },
          { text: 'creating an unnatural presence', type: 'middle' },
          { text: 'bending the laws of nature', type: 'middle' }
        ],
        closings: [
          { text: 'The supernatural is at work.', type: 'closing' },
          { text: 'Reality bends around this.', type: 'closing' },
          { text: 'Something beyond understanding.', type: 'closing' }
        ],
        standalones: [
          { text: 'A supernatural phenomenon occurs.', type: 'standalone' },
          { text: 'You witness something beyond normal.', type: 'standalone' },
          { text: 'An otherworldly event takes place.', type: 'standalone' }
        ]
      },
      SPELLCASTING: {
        openings: [
          { text: 'channels energy', type: 'opening', requiresSubject: true },
          { text: 'weaves spells', type: 'opening', requiresSubject: true },
          { text: 'manifests magic', type: 'opening', requiresSubject: true },
          { text: 'draws upon power', type: 'opening', requiresSubject: true }
        ],
        middles: [
          { text: 'with arcane precision', type: 'middle' },
          { text: 'creating magical effects', type: 'middle' },
          { text: 'harnessing mystical forces', type: 'middle' }
        ],
        closings: [
          { text: 'Magic is in the air.', type: 'closing' },
          { text: 'Arcane power flows here.', type: 'closing' },
          { text: 'The weave responds to this.', type: 'closing' }
        ],
        standalones: [
          { text: 'A magical event unfolds before you.', type: 'standalone' },
          { text: 'You sense powerful magic at work.', type: 'standalone' },
          { text: 'An arcane phenomenon manifests.', type: 'standalone' }
        ]
      }
    };

    const defaultFragments: {
      openings: Fragment[];
      middles: Fragment[];
      closings: Fragment[];
      standalones: Fragment[];
    } = {
      openings: [
        { text: 'appears', type: 'opening' as const, requiresSubject: true },
        { text: 'develops', type: 'opening' as const, requiresSubject: true },
        { text: 'emerges', type: 'opening' as const, requiresSubject: true }
      ],
      middles: [
        { text: 'and requires your attention', type: 'middle' as const },
        { text: 'creating a new situation', type: 'middle' as const }
      ],
      closings: [
        { text: 'This needs your response.', type: 'closing' as const },
        { text: 'Action is required.', type: 'closing' as const }
      ],
      standalones: [
        { text: 'A situation presents itself.', type: 'standalone' as const },
        { text: 'Something requires your attention.', type: 'standalone' as const }
      ]
    };

    const allEventTypes = ['COMBAT', 'SOCIAL', 'EXPLORATION', 'ECONOMIC', 'MYSTERY', 'SUPERNATURAL', 'SPELLCASTING', 
                          'POLITICAL', 'TECHNOLOGICAL', 'MAGIC', 'MENTORSHIP', 'FIGHTER', 'HUMAN'];

    allEventTypes.forEach(type => {
      if (!baseLibrary[type]) {
        baseLibrary[type] = defaultFragments;
      }
    });

    return baseLibrary;
  }

  /**
   * Get a random fragment of a specific type for an event type
   */
  getFragment(eventType: string, fragmentType: 'opening' | 'middle' | 'closing' | 'standalone'): Fragment | null {
    const eventFragments = this.library[eventType.toUpperCase()] || this.library['EXPLORATION'];
    const fragments = eventFragments[fragmentType + 's' as keyof typeof eventFragments] as Fragment[];
    
    if (!fragments || fragments.length === 0) {
      return null;
    }
    
    return this.chance.pickone(fragments);
  }

  /**
   * Combine fragments into a complete description
   */
  combineFragments(subject: string, adjective: string, eventType: string, options?: {
    useOpening?: boolean;
    useMiddle?: boolean;
    useClosing?: boolean;
  }): string {
    const useOpening = options?.useOpening !== false;
    const useMiddle = options?.useMiddle !== false;
    const useClosing = options?.useClosing !== false;

    let description = '';

    if (useOpening) {
      const opening = this.getFragment(eventType, 'opening');
      if (opening) {
        const article = this.getArticle(adjective);
        description = `The ${adjective.toLowerCase()} ${subject.toLowerCase()} ${opening.text}`;
      }
    }

    if (useMiddle && description) {
      const middle = this.getFragment(eventType, 'middle');
      if (middle) {
        description += `, ${middle.text}`;
      }
    }

    if (useClosing) {
      const closing = this.getFragment(eventType, 'closing');
      if (closing) {
        if (description) {
          description += `. ${closing.text}`;
        } else {
          description = closing.text;
        }
      }
    }

    if (!description) {
      const standalone = this.getFragment(eventType, 'standalone');
      if (standalone) {
        description = standalone.text;
      } else {
        description = `The ${adjective.toLowerCase()} ${subject.toLowerCase()} requires your attention.`;
      }
    }

    return description;
  }

  /**
   * Get article for a word
   */
  private getArticle(word: string): string {
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
    
    return 'a';
  }

  /**
   * Add custom fragments
   */
  addFragments(eventType: string, fragments: {
    openings?: Fragment[];
    middles?: Fragment[];
    closings?: Fragment[];
    standalones?: Fragment[];
  }): void {
    const type = eventType.toUpperCase();
    if (!this.library[type]) {
      this.library[type] = {
        openings: [],
        middles: [],
        closings: [],
        standalones: []
      };
    }

    if (fragments.openings) {
      this.library[type].openings.push(...fragments.openings);
    }
    if (fragments.middles) {
      this.library[type].middles.push(...fragments.middles);
    }
    if (fragments.closings) {
      this.library[type].closings.push(...fragments.closings);
    }
    if (fragments.standalones) {
      this.library[type].standalones.push(...fragments.standalones);
    }
  }
}
