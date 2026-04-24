import { BlockCard } from './BlockCard';
import { DropSlot } from './DropSlot';
import { makeRepeatContainerId } from '../editor/tree';
import type { StepBlock } from '../editor/types';

interface StepSequenceProps {
  blocks: StepBlock[];
  containerId: string;
  trackId: string;
  trackColor: string;
  selectedBlockId?: string;
  activeBlockIds: Set<string>;
  nested?: boolean;
  onSelect: (blockId: string) => void;
}

export function StepSequence({
  blocks,
  containerId,
  trackId,
  trackColor,
  selectedBlockId,
  activeBlockIds,
  nested = false,
  onSelect,
}: StepSequenceProps) {
  const cellCount = Math.max(blocks.length + 1, nested ? 4 : 16);

  const content = (
    <div className="lane__grid" style={{ ['--lane-columns' as string]: cellCount }}>
      {Array.from({ length: cellCount }, (_, index) => {
        const block = blocks[index];
        const childContainerId =
          block?.kind === 'repeat' ? makeRepeatContainerId(trackId, block.id) : undefined;

        return (
          <DropSlot
            key={block?.id ?? `${containerId}-slot-${index}`}
            containerId={containerId}
            index={Math.min(index, blocks.length)}
            containerType="steps"
            className={`lane-cell ${block ? 'lane-cell--filled' : 'lane-cell--empty'}`}
          >
            {block ? (
              <BlockCard
                block={block}
                scope="steps"
                containerId={containerId}
                index={index}
                selected={selectedBlockId === block.id}
                playing={activeBlockIds.has(block.id)}
                accentColor={trackColor}
                onSelect={onSelect}
              >
                {block.kind === 'repeat' ? (
                  <StepSequence
                    blocks={block.children}
                    containerId={childContainerId!}
                    trackId={trackId}
                    trackColor={trackColor}
                    selectedBlockId={selectedBlockId}
                    activeBlockIds={activeBlockIds}
                    nested
                    onSelect={onSelect}
                  />
                ) : null}
              </BlockCard>
            ) : null}
          </DropSlot>
        );
      })}

      {blocks.length === 0 ? (
        <div className="lane__empty">
          {nested ? 'drop beats inside the repeat' : 'drop beat blocks onto the grid'}
        </div>
      ) : null}
    </div>
  );

  if (nested) {
    return <div className="lane-inner">{content}</div>;
  }

  return (
    <div className="lane lane--steps">
      <div className="lane__header">
        <span className="lane__label" data-kind="beats">
          Pattern
        </span>
      </div>
      <div className="lane__content">{content}</div>
    </div>
  );
}
