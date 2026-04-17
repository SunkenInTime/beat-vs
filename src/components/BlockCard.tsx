import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties, ReactNode } from 'react';

import type { ModifierBlock, StepBlock } from '../editor/types';
import { ScratchBlock, getScratchBlockDataFromBlock } from './ScratchBlock';

interface BlockCardProps {
  block: StepBlock | ModifierBlock;
  scope: 'steps' | 'modifiers';
  containerId: string;
  index: number;
  selected: boolean;
  playing?: boolean;
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
  playing = false,
  accentColor,
  children,
  onSelect,
}: BlockCardProps) {
  const preview = getScratchBlockDataFromBlock(block);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block-${block.id}`,
    data: {
      dragType: 'block',
      blockId: block.id,
      scope,
      containerId,
      index,
      preview,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    '--block-accent': selected && accentColor ? accentColor : undefined,
  } as CSSProperties;

  return (
    <div
      ref={setNodeRef}
      className="block-card"
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(block.id);
      }}
      {...listeners}
      {...attributes}
    >
      <ScratchBlock data={preview} dragging={isDragging} selected={selected} playing={playing}>
        {children}
      </ScratchBlock>
    </div>
  );
}
