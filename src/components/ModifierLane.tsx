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
  const cellCount = Math.max(blocks.length + 1, 16);

  return (
    <div className="lane lane--modifiers">
      <div className="lane__header">
        <span className="lane__label" data-kind="fx">
          FX Chain
        </span>
      </div>
      <div className="lane__content">
        <div className="lane__grid" style={{ ['--lane-columns' as string]: cellCount }}>
          {Array.from({ length: cellCount }, (_, index) => {
            const block = blocks[index];

            return (
              <DropSlot
                key={block?.id ?? `${containerId}-slot-${index}`}
                containerId={containerId}
                index={Math.min(index, blocks.length)}
                containerType="modifiers"
                className={`lane-cell ${block ? 'lane-cell--filled' : 'lane-cell--empty'}`}
              >
                {block ? (
                  <BlockCard
                    block={block}
                    scope="modifiers"
                    containerId={containerId}
                    index={index}
                    selected={selectedBlockId === block.id}
                    accentColor={trackColor}
                    onSelect={onSelect}
                  />
                ) : null}
              </DropSlot>
            );
          })}

          {blocks.length === 0 ? (
            <div className="lane__empty">drop fx to shape this track</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
