import type { EditorDocument } from '../editor/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStepBlock = (value: unknown): boolean => {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.kind !== 'string') {
    return false;
  }

  if (value.kind === 'sample') {
    return typeof value.sample === 'string';
  }

  if (value.kind === 'rest') {
    return true;
  }

  if (value.kind === 'repeat') {
    return (
      typeof value.times === 'number' &&
      Array.isArray(value.children) &&
      value.children.every((child) => isStepBlock(child))
    );
  }

  return false;
};

const isModifierBlock = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.kind === 'string' &&
  typeof value.value === 'number';

const isTrack = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.color === 'string' &&
  Array.isArray(value.steps) &&
  value.steps.every((step) => isStepBlock(step)) &&
  Array.isArray(value.modifiers) &&
  value.modifiers.every((modifier) => isModifierBlock(modifier));

const isEditorDocument = (value: unknown): value is EditorDocument =>
  isRecord(value) &&
  typeof value.tempo === 'number' &&
  Array.isArray(value.tracks) &&
  value.tracks.every((track) => isTrack(track));

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
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!isEditorDocument(parsed)) {
        console.warn('Ignoring invalid saved beat draft.');
        window.localStorage.removeItem(this.storageKey);
        return null;
      }

      return parsed;
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
