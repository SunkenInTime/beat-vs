import { useDroppable } from '@dnd-kit/core';

import type { ContainerType } from '../editor/types';

interface DropSlotProps {
  containerId: string;
  index: number;
  containerType: ContainerType;
}

export function DropSlot({ containerId, index, containerType }: DropSlotProps) {
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
      className={`drop-slot ${isOver ? 'is-over' : ''}`}
      aria-hidden="true"
    />
  );
}
