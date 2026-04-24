import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

import type { ContainerType } from '../editor/types';

interface DropSlotProps {
  containerId: string;
  index: number;
  containerType: ContainerType;
  className?: string;
  children?: ReactNode;
}

export function DropSlot({
  containerId,
  index,
  containerType,
  className,
  children,
}: DropSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${containerId}-${index}`,
    data: {
      dropType: 'slot',
      containerId,
      index,
      containerType,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={['drop-slot', className, isOver ? 'is-over' : ''].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
