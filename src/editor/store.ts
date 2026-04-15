import { create } from 'zustand';

import { defaultDocument } from './defaults';
import {
  createBlockFromTemplate,
  createTrack,
  findBlockById,
  insertBlockInContainer,
  moveBlockBetweenContainers,
  removeBlockFromTracks,
  updateModifierBlock,
  updateStepBlock,
} from './tree';
import type { DrumSample, EditorDocument, LocatedBlock, SlotTarget } from './types';

interface EditorState extends EditorDocument {
  selectedBlockId?: string;
  hydrate: (document: EditorDocument) => void;
  setTempo: (tempo: number) => void;
  addTrack: () => void;
  removeTrack: (trackId: string) => void;
  renameTrack: (trackId: string, name: string) => void;
  insertTemplate: (templateId: string, target: SlotTarget) => void;
  moveBlock: (
    blockId: string,
    target: SlotTarget,
    source?: { containerId: string; index: number },
  ) => void;
  deleteBlock: (blockId: string) => void;
  selectBlock: (blockId?: string) => void;
  updateSampleBlock: (blockId: string, sample: DrumSample) => void;
  updateRepeatBlock: (blockId: string, times: number) => void;
  updateModifierValue: (blockId: string, value: number) => void;
  getSelectedBlock: () => LocatedBlock | undefined;
}

const initialDocument = defaultDocument();

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialDocument,
  selectedBlockId: undefined,
  hydrate: (document) =>
    set({
      tempo: document.tempo,
      tracks: document.tracks,
      selectedBlockId: undefined,
    }),
  setTempo: (tempo) => set({ tempo: Math.max(40, Math.min(220, Math.round(tempo))) }),
  addTrack: () =>
    set((state) => ({
      tracks: [...state.tracks, createTrack(state.tracks.length)],
    })),
  removeTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.filter((track) => track.id !== trackId),
      selectedBlockId: undefined,
    })),
  renameTrack: (trackId, name) =>
    set((state) => ({
      tracks: state.tracks.map((track) => (track.id === trackId ? { ...track, name } : track)),
    })),
  insertTemplate: (templateId, target) =>
    set((state) => {
      const block = createBlockFromTemplate(templateId);
      if (!block) {
        return state;
      }

      return {
        tracks: insertBlockInContainer(state.tracks, target.containerId, target.index, block),
        selectedBlockId: block.id,
      };
    }),
  moveBlock: (blockId, target, source) =>
    set((state) => {
      let nextIndex = target.index;
      if (source && source.containerId === target.containerId && source.index < target.index) {
        nextIndex -= 1;
      }

      return {
        tracks: moveBlockBetweenContainers(state.tracks, blockId, target.containerId, nextIndex),
        selectedBlockId: blockId,
      };
    }),
  deleteBlock: (blockId) =>
    set((state) => {
      const result = removeBlockFromTracks(state.tracks, blockId);
      return {
        tracks: result.nextTracks,
        selectedBlockId: state.selectedBlockId === blockId ? undefined : state.selectedBlockId,
      };
    }),
  selectBlock: (blockId) => set({ selectedBlockId: blockId }),
  updateSampleBlock: (blockId, sample) =>
    set((state) => ({
      tracks: updateStepBlock(state.tracks, blockId, (block) =>
        block.kind === 'sample' ? { ...block, sample } : block,
      ),
    })),
  updateRepeatBlock: (blockId, times) =>
    set((state) => ({
      tracks: updateStepBlock(state.tracks, blockId, (block) =>
        block.kind === 'repeat' ? { ...block, times: Math.max(1, Math.round(times)) } : block,
      ),
    })),
  updateModifierValue: (blockId, value) =>
    set((state) => ({
      tracks: updateModifierBlock(state.tracks, blockId, (block) => ({
        ...block,
        value,
      })),
    })),
  getSelectedBlock: () => {
    const { selectedBlockId, tracks } = get();
    return selectedBlockId ? findBlockById(tracks, selectedBlockId) : undefined;
  },
}));
