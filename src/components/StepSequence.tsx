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
  const content = (
    <>
      <DropSlot containerId={containerId} index={0} containerType="steps" />

      {blocks.length === 0 ? (
        <div className="lane__empty">
          {nested ? 'drop beats inside the repeat' : 'drop beat blocks onto the grid'}
        </div>
      ) : (
        blocks.map((block, index) => {
          const childContainerId =
            block.kind === 'repeat' ? makeRepeatContainerId(trackId, block.id) : undefined;

          return (
            <div key={block.id} className="sequence-item">
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
              <DropSlot containerId={containerId} index={index + 1} containerType="steps" />
            </div>
          );
        })
      )}
    </>
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
