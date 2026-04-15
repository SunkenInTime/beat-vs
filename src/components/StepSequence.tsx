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
  nested?: boolean;
  onSelect: (blockId: string) => void;
}

export function StepSequence({
  blocks,
  containerId,
  trackId,
  trackColor,
  selectedBlockId,
  nested = false,
  onSelect,
}: StepSequenceProps) {
  return (
    <div className={`step-sequence ${nested ? 'step-sequence--nested' : ''}`}>
      <DropSlot containerId={containerId} index={0} containerType="steps" />

      {blocks.length === 0 ? (
        <div className="empty-container-hint">Drop beat blocks here</div>
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
                accentColor={trackColor}
                onSelect={onSelect}
              >
                {block.kind === 'repeat' ? (
                  <div className="repeat-block-body">
                    <StepSequence
                      blocks={block.children}
                      containerId={childContainerId!}
                      trackId={trackId}
                      trackColor={trackColor}
                      selectedBlockId={selectedBlockId}
                      nested
                      onSelect={onSelect}
                    />
                  </div>
                ) : null}
              </BlockCard>
              <DropSlot containerId={containerId} index={index + 1} containerType="steps" />
            </div>
          );
        })
      )}
    </div>
  );
}
