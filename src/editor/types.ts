export type DrumSample = 'bd' | 'sd' | 'hh' | 'cp' | 'oh' | 'lt' | 'mt';

export type StepBlock =
  | SampleBlock
  | RestBlock
  | RepeatBlock;

export interface SampleBlock {
  id: string;
  kind: 'sample';
  sample: DrumSample;
}

export interface RestBlock {
  id: string;
  kind: 'rest';
}

export interface RepeatBlock {
  id: string;
  kind: 'repeat';
  times: number;
  children: StepBlock[];
}

export type ModifierKind = 'gain' | 'fast' | 'slow' | 'pan';

export interface ModifierBlock {
  id: string;
  kind: ModifierKind;
  value: number;
}

export interface Track {
  id: string;
  name: string;
  color: string;
  steps: StepBlock[];
  modifiers: ModifierBlock[];
}

export interface EditorDocument {
  tempo: number;
  tracks: Track[];
}

export type StepTemplateKind = 'sample' | 'rest' | 'repeat';
export type ModifierTemplateKind = ModifierKind;

export interface StepTemplate {
  id: string;
  category: 'steps';
  label: string;
  kind: StepTemplateKind;
  sample?: DrumSample;
  defaultTimes?: number;
}

export interface ModifierTemplate {
  id: string;
  category: 'modifiers';
  label: string;
  kind: ModifierTemplateKind;
  defaultValue: number;
}

export type BlockTemplate = StepTemplate | ModifierTemplate;

export interface SlotTarget {
  containerId: string;
  index: number;
}

export type ContainerType = 'steps' | 'modifiers';

export interface ParsedContainerId {
  type: ContainerType;
  trackId: string;
  repeatId?: string;
}

export type LocatedBlock =
  | { scope: 'step'; block: StepBlock }
  | { scope: 'modifier'; block: ModifierBlock };
