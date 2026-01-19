// RPG Event Generator v3.0.0 - Memory Database Adapter
// In-memory implementation for template storage and retrieval

import { IDatabaseAdapter } from '../interfaces';

export class MemoryDatabaseAdapter implements IDatabaseAdapter {
  private templates: Map<string, { template: any; metadata: any; created: Date; updated: Date }> = new Map();
  private connected: boolean = false;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async storeTemplate(id: string, template: any, metadata: any = {}): Promise<void> {
    const now = new Date();
    const existing = this.templates.get(id);

    this.templates.set(id, {
      template,
      metadata: { ...metadata, id },
      created: existing?.created || now,
      updated: now
    });
  }

  async getTemplate(id: string): Promise<any | null> {
    const entry = this.templates.get(id);
    return entry ? entry.template : null;
  }

  async getAllTemplates(): Promise<any[]> {
    return Array.from(this.templates.values()).map(entry => entry.template);
  }

  async searchTemplates(query: any): Promise<any[]> {
    const results: any[] = [];

    for (const [id, entry] of this.templates) {
      let matches = true;

      // Simple query matching
      if (query.tags && entry.template.tags) {
        const templateTags = new Set(entry.template.tags);
        const queryTags = new Set(query.tags);
        if (!query.tags.some((tag: string) => templateTags.has(tag))) {
          matches = false;
        }
      }

      if (query.type && entry.template.type !== query.type) {
        matches = false;
      }

      if (query.difficulty && entry.template.difficulty !== query.difficulty) {
        matches = false;
      }

      if (query.title_contains && !entry.template.title.toLowerCase().includes(query.title_contains.toLowerCase())) {
        matches = false;
      }

      if (matches) {
        results.push(entry.template);
      }
    }

    return results;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  async getTemplateCount(): Promise<number> {
    return this.templates.size;
  }

  async clearAllTemplates(): Promise<void> {
    this.templates.clear();
  }
}