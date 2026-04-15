import { BlockCard } from './BlockCard';
import { DropSlot } from './DropSlot';
import type { ModifierBlock } from '../editor/types';

interface ModifierLaneProps {
  blocks: ModifierBlock[];
  containerId: string;
  trackColor: string;
  selectedBlockId?: string;
  onSelect: (blockId: string) => void;
}

export function ModifierLane({
  blocks,
  containerId,
  trackColor,
  selectedBlockId,
  onSelect,
}: ModifierLaneProps) {
  return (
    <div className="modifier-lane">
      <DropSlot containerId={containerId} index={0} containerType="modifiers" />

      {blocks.length === 0 ? (
        <div className="empty-container-hint empty-container-hint--modifier">
          Drop modifier blocks here
        </div>
      ) : (
        blocks.map((block, index) => (
          <div key={block.id} className="sequence-item">
            <BlockCard
              block={block}
              scope="modifiers"
              containerId={containerId}
              index={index}
              selected={selectedBlockId === block.id}
              accentColor={trackColor}
              onSelect={onSelect}
            />
            <DropSlot containerId={containerId} index={index + 1} containerType="modifiers" />
          </div>
        ))
      )}
    </div>
  );
}
