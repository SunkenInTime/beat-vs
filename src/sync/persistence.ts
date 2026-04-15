import type { EditorDocument } from '../editor/types';

export interface EditorPersistence {
  load(): EditorDocument | null;
  save(document: EditorDocument): void;
}

export class LocalDraftPersistence implements EditorPersistence {
  constructor(private readonly storageKey: string) {}

  load(): EditorDocument | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as EditorDocument) : null;
    } catch (error) {
      console.warn('Failed to restore local beat draft.', error);
      return null;
    }
  }

  save(document: EditorDocument): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(document));
    } catch (error) {
      console.warn('Failed to save local beat draft.', error);
    }
  }
}

export const localDraftPersistence = new LocalDraftPersistence('beat-vs:draft');
