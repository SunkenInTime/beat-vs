import { createDefaultTrack, paletteTemplates } from './defaults';
import type {
  BlockTemplate,
  ContainerType,
  LocatedBlock,
  ModifierBlock,
  ParsedContainerId,
  RepeatBlock,
  StepBlock,
  Track,
} from './types';

const insertAt = <T,>(items: T[], index: number, item: T): T[] => {
  const safeIndex = Math.max(0, Math.min(index, items.length));
  return [...items.slice(0, safeIndex), item, ...items.slice(safeIndex)];
};

const removeStepBlockRecursive = (
  blocks: StepBlock[],
  blockId: string,
): { nextBlocks: StepBlock[]; removed?: StepBlock } => {
  const directIndex = blocks.findIndex((block) => block.id === blockId);
  if (directIndex >= 0) {
    return {
      nextBlocks: [...blocks.slice(0, directIndex), ...blocks.slice(directIndex + 1)],
      removed: blocks[directIndex],
    };
  }

  let removed: StepBlock | undefined;
  const nextBlocks = blocks.map((block) => {
    if (block.kind !== 'repeat' || removed) {
      return block;
    }

    const result = removeStepBlockRecursive(block.children, blockId);
    if (!result.removed) {
      return block;
    }

    removed = result.removed;
    return {
      ...block,
      children: result.nextBlocks,
    };
  });

  return { nextBlocks, removed };
};

const insertIntoRepeat = (
  blocks: StepBlock[],
  repeatId: string,
  index: number,
  blockToInsert: StepBlock,
): StepBlock[] =>
  blocks.map((block) => {
    if (block.kind === 'repeat' && block.id === repeatId) {
      return {
        ...block,
        children: insertAt(block.children, index, blockToInsert),
      };
    }

    if (block.kind === 'repeat') {
      return {
        ...block,
        children: insertIntoRepeat(block.children, repeatId, index, blockToInsert),
      };
    }

    return block;
  });

const updateStepBlockRecursive = (
  blocks: StepBlock[],
  blockId: string,
  updater: (block: StepBlock) => StepBlock,
): StepBlock[] =>
  blocks.map((block) => {
    if (block.id === blockId) {
      return updater(block);
    }

    if (block.kind === 'repeat') {
      return {
        ...block,
        children: updateStepBlockRecursive(block.children, blockId, updater),
      };
    }

    return block;
  });

const findStepBlockRecursive = (blocks: StepBlock[], blockId: string): StepBlock | undefined => {
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }

    if (block.kind === 'repeat') {
      const nested = findStepBlockRecursive(block.children, blockId);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
};

const removeModifierBlock = (
  tracks: Track[],
  blockId: string,
): { nextTracks: Track[]; removed?: ModifierBlock } => {
  let removed: ModifierBlock | undefined;

  const nextTracks = tracks.map((track) => {
    const index = track.modifiers.findIndex((modifier) => modifier.id === blockId);
    if (index === -1) {
      return track;
    }

    removed = track.modifiers[index];
    return {
      ...track,
      modifiers: [...track.modifiers.slice(0, index), ...track.modifiers.slice(index + 1)],
    };
  });

  return { nextTracks, removed };
};

const createStepBlock = (template: Extract<BlockTemplate, { category: 'steps' }>): StepBlock => {
  const id = crypto.randomUUID();

  if (template.kind === 'sample' && template.sample) {
    return {
      id,
      kind: 'sample',
      sample: template.sample,
    };
  }

  if (template.kind === 'repeat') {
    return {
      id,
      kind: 'repeat',
      times: template.defaultTimes ?? 2,
      children: [],
    };
  }

  return {
    id,
    kind: 'rest',
  };
};

const createModifierBlock = (
  template: Extract<BlockTemplate, { category: 'modifiers' }>,
): ModifierBlock => ({
  id: crypto.randomUUID(),
  kind: template.kind,
  value: template.defaultValue,
});

export const makeStepsContainerId = (trackId: string) => `steps:${trackId}`;
export const makeRepeatContainerId = (trackId: string, repeatId: string) =>
  `repeat:${trackId}:${repeatId}`;
export const makeModifiersContainerId = (trackId: string) => `modifiers:${trackId}`;

export const parseContainerId = (containerId: string): ParsedContainerId => {
  const [prefix, trackId, repeatId] = containerId.split(':');

  if (prefix === 'steps') {
    return { type: 'steps', trackId };
  }

  if (prefix === 'repeat') {
    return { type: 'steps', trackId, repeatId };
  }

  return { type: 'modifiers', trackId };
};

export const createTrack = (trackCount: number): Track => createDefaultTrack(trackCount);

export const createBlockFromTemplate = (templateId: string): StepBlock | ModifierBlock | undefined => {
  const template = paletteTemplates.find((entry) => entry.id === templateId);
  if (!template) {
    return undefined;
  }

  if (template.category === 'steps') {
    return createStepBlock(template);
  }

  return createModifierBlock(template);
};

export const insertBlockInContainer = (
  tracks: Track[],
  containerId: string,
  index: number,
  block: StepBlock | ModifierBlock,
): Track[] => {
  const parsed = parseContainerId(containerId);

  return tracks.map((track) => {
    if (track.id !== parsed.trackId) {
      return track;
    }

    if (parsed.type === 'modifiers' && 'value' in block) {
      return {
        ...track,
        modifiers: insertAt(track.modifiers, index, block),
      };
    }

    if (parsed.type === 'steps' && !('value' in block)) {
      if (!parsed.repeatId) {
        return {
          ...track,
          steps: insertAt(track.steps, index, block),
        };
      }

      return {
        ...track,
        steps: insertIntoRepeat(track.steps, parsed.repeatId, index, block),
      };
    }

    return track;
  });
};

export const removeBlockFromTracks = (
  tracks: Track[],
  blockId: string,
): { nextTracks: Track[]; removed?: StepBlock | ModifierBlock; scope?: ContainerType } => {
  for (const track of tracks) {
    const result = removeStepBlockRecursive(track.steps, blockId);
    if (result.removed) {
      return {
        nextTracks: tracks.map((candidate) =>
          candidate.id === track.id ? { ...candidate, steps: result.nextBlocks } : candidate,
        ),
        removed: result.removed,
        scope: 'steps',
      };
    }
  }

  const modifierResult = removeModifierBlock(tracks, blockId);
  if (modifierResult.removed) {
    return {
      nextTracks: modifierResult.nextTracks,
      removed: modifierResult.removed,
      scope: 'modifiers',
    };
  }

  return { nextTracks: tracks };
};

export const moveBlockBetweenContainers = (
  tracks: Track[],
  blockId: string,
  targetContainerId: string,
  index: number,
): Track[] => {
  const removed = removeBlockFromTracks(tracks, blockId);
  if (!removed.removed) {
    return tracks;
  }

  return insertBlockInContainer(removed.nextTracks, targetContainerId, index, removed.removed);
};

export const updateStepBlock = (
  tracks: Track[],
  blockId: string,
  updater: (block: StepBlock) => StepBlock,
): Track[] =>
  tracks.map((track) => ({
    ...track,
    steps: updateStepBlockRecursive(track.steps, blockId, updater),
  }));

export const updateModifierBlock = (
  tracks: Track[],
  blockId: string,
  updater: (block: ModifierBlock) => ModifierBlock,
): Track[] =>
  tracks.map((track) => ({
    ...track,
    modifiers: track.modifiers.map((modifier) =>
      modifier.id === blockId ? updater(modifier) : modifier,
    ),
  }));

export const findBlockById = (tracks: Track[], blockId: string): LocatedBlock | undefined => {
  for (const track of tracks) {
    const stepBlock = findStepBlockRecursive(track.steps, blockId);
    if (stepBlock) {
      return { scope: 'step', block: stepBlock };
    }

    const modifierBlock = track.modifiers.find((modifier) => modifier.id === blockId);
    if (modifierBlock) {
      return { scope: 'modifier', block: modifierBlock };
    }
  }

  return undefined;
};

export const getContainerType = (containerId: string): ContainerType => parseContainerId(containerId).type;

export const isRepeatBlock = (block: StepBlock): block is RepeatBlock => block.kind === 'repeat';
