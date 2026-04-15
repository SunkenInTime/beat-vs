import type { EditorDocument, ModifierBlock, StepBlock, Track } from './types';

const compileSteps = (blocks: StepBlock[]): string => {
  if (blocks.length === 0) {
    return '~';
  }

  return blocks
    .map((block) => {
      if (block.kind === 'sample') {
        return block.sample;
      }

      if (block.kind === 'rest') {
        return '~';
      }

      const nested = compileSteps(block.children);
      return `[${nested}]*${Math.max(1, block.times)}`;
    })
    .join(' ');
};

const compileModifier = (modifier: ModifierBlock): string => {
  if (modifier.kind === 'pan') {
    return `.pan(${modifier.value})`;
  }

  if (modifier.kind === 'gain') {
    return `.gain(${modifier.value})`;
  }

  return `.${modifier.kind}(${modifier.value})`;
};

const compileTrack = (track: Track): string => {
  const sequence = compileSteps(track.steps);
  const modifiers = track.modifiers.map(compileModifier).join('');
  return `s(${JSON.stringify(sequence)})${modifiers}`;
};

export const compilePatternOnly = (document: EditorDocument): string => {
  if (document.tracks.length === 0) {
    return 's("~")';
  }

  if (document.tracks.length === 1) {
    return compileTrack(document.tracks[0]);
  }

  const body = document.tracks.map((track) => `  ${compileTrack(track)}`).join(',\n');
  return `stack(\n${body}\n)`;
};

export const compileDocument = (document: EditorDocument): string =>
  `setcpm(${document.tempo})\n${compilePatternOnly(document)}`;
