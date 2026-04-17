import type { ReactNode } from 'react';

import type { BlockTemplate, DrumSample, ModifierBlock, StepBlock } from '../editor/types';

type BlockTone = 'beats' | 'control' | 'modifiers' | 'rest';
type BlockShape = 'stack' | 'c';

interface BlockPart {
  type: 'label' | 'field';
  value: string;
}

export interface ScratchBlockData {
  tone: BlockTone;
  shape: BlockShape;
  parts: BlockPart[];
}

interface ScratchBlockProps {
  data: ScratchBlockData;
  className?: string;
  dragging?: boolean;
  selected?: boolean;
  playing?: boolean;
  children?: ReactNode;
}

const sampleLabels: Record<DrumSample, string> = {
  bd: 'kick',
  sd: 'snare',
  hh: 'hat',
  cp: 'clap',
  oh: 'open',
  lt: 'low',
  mt: 'mid',
};

const formatValue = (value: number) => {
  if (Math.abs(value) >= 10 || Number.isInteger(value)) {
    return String(Number(value.toFixed(0)));
  }

  return value.toFixed(value < 1 ? 2 : 1).replace(/\.0$/, '');
};

const modifierParts = (block: ModifierBlock): BlockPart[] => {
  if (block.kind === 'gain') {
    return [
      { type: 'label', value: 'gain' },
      { type: 'field', value: formatValue(block.value) },
    ];
  }

  if (block.kind === 'pan') {
    return [
      { type: 'label', value: 'pan' },
      { type: 'field', value: formatValue(block.value) },
    ];
  }

  if (block.kind === 'fast') {
    return [
      { type: 'label', value: 'fast' },
      { type: 'field', value: `x${formatValue(block.value)}` },
    ];
  }

  return [
    { type: 'label', value: 'slow' },
    { type: 'field', value: `x${formatValue(block.value)}` },
  ];
};

export const getScratchBlockDataFromBlock = (
  block: StepBlock | ModifierBlock,
): ScratchBlockData => {
  if ('value' in block) {
    return {
      tone: 'modifiers',
      shape: 'stack',
      parts: modifierParts(block),
    };
  }

  if (block.kind === 'sample') {
    return {
      tone: 'beats',
      shape: 'stack',
      parts: [{ type: 'field', value: sampleLabels[block.sample] }],
    };
  }

  if (block.kind === 'rest') {
    return {
      tone: 'rest',
      shape: 'stack',
      parts: [{ type: 'label', value: 'rest' }],
    };
  }

  return {
    tone: 'control',
    shape: 'c',
    parts: [
      { type: 'label', value: 'repeat' },
      { type: 'field', value: `x${block.times}` },
    ],
  };
};

export const getScratchBlockDataFromTemplate = (template: BlockTemplate): ScratchBlockData => {
  if (template.category === 'modifiers') {
    return {
      tone: 'modifiers',
      shape: 'stack',
      parts: modifierParts({
        id: template.id,
        kind: template.kind,
        value: template.defaultValue,
      }),
    };
  }

  if (template.kind === 'sample' && template.sample) {
    return {
      tone: 'beats',
      shape: 'stack',
      parts: [{ type: 'field', value: sampleLabels[template.sample] }],
    };
  }

  if (template.kind === 'repeat') {
    return {
      tone: 'control',
      shape: 'c',
      parts: [
        { type: 'label', value: 'repeat' },
        { type: 'field', value: `x${template.defaultTimes ?? 2}` },
      ],
    };
  }

  return {
    tone: 'rest',
    shape: 'stack',
    parts: [{ type: 'label', value: 'rest' }],
  };
};

export function ScratchBlock({
  data,
  className,
  dragging = false,
  selected = false,
  playing = false,
  children,
}: ScratchBlockProps) {
  const classes = [
    'scratch-block',
    `scratch-block--${data.shape}`,
    `scratch-block--${data.tone}`,
    dragging ? 'is-dragging' : '',
    selected ? 'is-selected' : '',
    playing ? 'is-playing' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="scratch-block__surface">
        <div className="scratch-block__row">
          {data.parts.map((part, index) => (
            <span
              key={`${part.type}-${part.value}-${index}`}
              className={`scratch-block__part scratch-block__part--${part.type}`}
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>

      {children ? <div className="scratch-block__mouth">{children}</div> : null}
    </div>
  );
}
