import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties, ReactNode } from 'react';

import type { ModifierBlock, StepBlock } from '../editor/types';

const getBlockText = (block: StepBlock | ModifierBlock): { title: string; subtitle: string } => {
  if ('value' in block) {
    const label =
      block.kind === 'gain'
        ? `Gain ${block.value.toFixed(2)}`
        : block.kind === 'pan'
          ? `Pan ${block.value.toFixed(2)}`
          : `${block.kind === 'fast' ? 'Fast' : 'Slow'} ${block.value.toFixed(2)}`;
    return { title: label, subtitle: 'Track modifier' };
  }

  if (block.kind === 'sample') {
    return { title: block.sample, subtitle: 'Drum sample' };
  }

  if (block.kind === 'rest') {
    return { title: 'Rest', subtitle: 'Silence' };
  }

  return { title: `Repeat x${block.times}`, subtitle: 'Nested pattern' };
};

interface BlockCardProps {
  block: StepBlock | ModifierBlock;
  scope: 'steps' | 'modifiers';
  containerId: string;
  index: number;
  selected: boolean;
  accentColor?: string;
  children?: ReactNode;
  onSelect: (blockId: string) => void;
}

export function BlockCard({
  block,
  scope,
  containerId,
  index,
  selected,
  accentColor,
  children,
  onSelect,
}: BlockCardProps) {
  const { title, subtitle } = getBlockText(block);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block-${block.id}`,
    data: {
      dragType: 'block',
      blockId: block.id,
      scope,
      containerId,
      index,
      label: title,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    borderColor: selected && accentColor ? accentColor : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className={`block-card block-card--${scope} block-card--${block.kind} ${
        isDragging ? 'is-dragging' : ''
      } ${selected ? 'is-selected' : ''}`}
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(block.id);
      }}
      {...listeners}
      {...attributes}
    >
      <div className="block-card__header">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      {children}
    </div>
  );
}
