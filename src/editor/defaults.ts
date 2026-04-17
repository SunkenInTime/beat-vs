import type { BlockTemplate, DrumSample, EditorDocument, ModifierKind, Track } from './types';
import { createId } from './id';

const sample = (value: DrumSample) => ({
  id: createId(),
  kind: 'sample' as const,
  sample: value,
});

const rest = () => ({
  id: createId(),
  kind: 'rest' as const,
});

const repeat = (times: number, children: Track['steps'][number][]) => ({
  id: createId(),
  kind: 'repeat' as const,
  times,
  children,
});

const modifier = (kind: ModifierKind, value: number) => ({
  id: createId(),
  kind,
  value,
});

export const paletteTemplates: BlockTemplate[] = [
  { id: 'kick', category: 'steps', label: 'Kick', kind: 'sample', sample: 'bd' },
  { id: 'snare', category: 'steps', label: 'Snare', kind: 'sample', sample: 'sd' },
  { id: 'hat', category: 'steps', label: 'Hat', kind: 'sample', sample: 'hh' },
  { id: 'clap', category: 'steps', label: 'Clap', kind: 'sample', sample: 'cp' },
  { id: 'open-hat', category: 'steps', label: 'Open Hat', kind: 'sample', sample: 'oh' },
  { id: 'low-tom', category: 'steps', label: 'Low Tom', kind: 'sample', sample: 'lt' },
  { id: 'mid-tom', category: 'steps', label: 'Mid Tom', kind: 'sample', sample: 'mt' },
  { id: 'rest', category: 'steps', label: 'Rest', kind: 'rest' },
  { id: 'repeat', category: 'steps', label: 'Repeat x2', kind: 'repeat', defaultTimes: 2 },
  { id: 'gain', category: 'modifiers', label: 'Gain', kind: 'gain', defaultValue: 0.95 },
  { id: 'fast', category: 'modifiers', label: 'Fast x2', kind: 'fast', defaultValue: 2 },
  { id: 'slow', category: 'modifiers', label: 'Slow x2', kind: 'slow', defaultValue: 2 },
  { id: 'pan', category: 'modifiers', label: 'Pan', kind: 'pan', defaultValue: 0.5 },
];

export const createDefaultTrack = (index: number): Track => ({
  id: createId(),
  name: index === 0 ? 'Main groove' : `Track ${index + 1}`,
  color: index % 2 === 0 ? '#8b5cf6' : '#0ea5e9',
  steps:
    index === 0
      ? [
          sample('bd'),
          sample('hh'),
          sample('sd'),
          sample('hh'),
          repeat(2, [sample('bd'), sample('hh')]),
        ]
      : [rest()],
  modifiers: index === 0 ? [modifier('gain', 0.9)] : [modifier('pan', 0.65)],
});

export const defaultDocument = (): EditorDocument => ({
  tempo: 120,
  tracks: [
    {
      id: createId(),
      name: 'Kick / Snare',
      color: '#8b5cf6',
      steps: [
        sample('bd'),
        sample('hh'),
        sample('sd'),
        sample('hh'),
        repeat(2, [sample('bd'), sample('hh')]),
      ],
      modifiers: [modifier('gain', 0.95)],
    },
    {
      id: createId(),
      name: 'Clap accents',
      color: '#0ea5e9',
      steps: [rest(), rest(), sample('cp'), rest()],
      modifiers: [modifier('gain', 0.7), modifier('pan', 0.35)],
    },
  ],
});
