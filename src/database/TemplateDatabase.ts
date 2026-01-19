// RPG Event Generator v3.0.0 - Template Database System
// Database integration for scalable template management

import { ITemplateDatabase, IDatabaseAdapter } from '../interfaces';
import { Template } from '../types';

export class TemplateDatabase implements ITemplateDatabase {
  private adapter: IDatabaseAdapter | null = null;
  private initialized: boolean = false;

  async initialize(adapter: IDatabaseAdapter): Promise<void> {
    this.adapter = adapter;
    await this.adapter.connect();
    this.initialized = true;
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.adapter) {
      throw new Error('TemplateDatabase not initialized. Call initialize() first.');
    }
  }

  async storeTemplate(template: Template): Promise<void> {
    this.ensureInitialized();

    if (!template.id) {
      throw new Error('Template must have an id to be stored in database');
    }

    const metadata = {
      tags: template.tags || [],
      type: template.type,
      difficulty: template.difficulty,
      hasConditions: !!(template.conditions?.length),
      hasComposition: !!(template.composition?.length),
      extends: template.extends,
      mixins: template.mixins
    };

    await this.adapter!.storeTemplate(template.id, template, metadata);
  }

  async getTemplate(id: string): Promise<Template | null> {
    this.ensureInitialized();
    return await this.adapter!.getTemplate(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    this.ensureInitialized();
    return await this.adapter!.getAllTemplates();
  }

  async searchTemplates(criteria: any): Promise<Template[]> {
    this.ensureInitialized();
    return await this.adapter!.searchTemplates(criteria);
  }

  async getTemplatesByTag(tags: string[]): Promise<Template[]> {
    this.ensureInitialized();
    return await this.adapter!.searchTemplates({ tags });
  }

  async getTemplatesByType(type: string): Promise<Template[]> {
    this.ensureInitialized();
    return await this.adapter!.searchTemplates({ type });
  }

  async getRandomTemplates(count: number, criteria: any = {}): Promise<Template[]> {
    this.ensureInitialized();

    let candidates = await this.adapter!.searchTemplates(criteria);

    // Shuffle and return requested count
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    return candidates.slice(0, count);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    this.ensureInitialized();
    return await this.adapter!.deleteTemplate(id);
  }

  async getStats(): Promise<any> {
    this.ensureInitialized();

    const templates = await this.adapter!.getAllTemplates();
    const stats = {
      totalTemplates: templates.length,
      templatesByType: {} as { [key: string]: number },
      templatesByDifficulty: {} as { [key: string]: number },
      templatesWithConditions: 0,
      templatesWithComposition: 0,
      templatesWithInheritance: 0,
      averageChoices: 0
    };

    templates.forEach(template => {
      // Count by type
      const type = template.type || 'unknown';
      stats.templatesByType[type] = (stats.templatesByType[type] || 0) + 1;

      // Count by difficulty
      const difficulty = template.difficulty || 'normal';
      stats.templatesByDifficulty[difficulty] = (stats.templatesByDifficulty[difficulty] || 0) + 1;

      // Special features
      if (template.conditions?.length) stats.templatesWithConditions++;
      if (template.composition?.length) stats.templatesWithComposition++;
      if (template.extends || template.mixins) stats.templatesWithInheritance++;

      // Average choices
      stats.averageChoices += template.choices?.length || 0;
    });

    stats.averageChoices = stats.totalTemplates > 0 ? stats.averageChoices / stats.totalTemplates : 0;

    return stats;
  }

  async bulkStoreTemplates(templates: Template[]): Promise<void> {
    this.ensureInitialized();

    for (const template of templates) {
      await this.storeTemplate(template);
    }
  }

  async bulkDeleteTemplates(ids: string[]): Promise<void> {
    this.ensureInitialized();

    for (const id of ids) {
      await this.adapter!.deleteTemplate(id);
    }
  }

  async findSimilarTemplates(templateId: string, limit: number = 5): Promise<Template[]> {
    this.ensureInitialized();

    const template = await this.getTemplate(templateId);
    if (!template) return [];

    const criteria = {
      type: template.type,
      tags: template.tags?.slice(0, 2) // Use first 2 tags for similarity
    };

    const similar = await this.searchTemplates(criteria);
    return similar.filter(t => t.id !== templateId).slice(0, limit);
  }

  async getTemplatesByComplexity(minChoices: number = 0, maxChoices: number = Infinity): Promise<Template[]> {
    this.ensureInitialized();

    const allTemplates = await this.adapter!.getAllTemplates();
    return allTemplates.filter(template =>
      template.choices &&
      template.choices.length >= minChoices &&
      template.choices.length <= maxChoices
    );
  }

  async getTemplateUsageStats(): Promise<{ [templateId: string]: number }> {
    // This would typically track actual usage in a real database
    // For now, return empty stats as we don't have usage tracking yet
    return {};
  }
}