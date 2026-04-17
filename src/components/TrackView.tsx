import { useMemo, useState } from 'react';

import { ModifierLane } from './ModifierLane';
import { StepSequence } from './StepSequence';
import { makeModifiersContainerId, makeStepsContainerId } from '../editor/tree';
import type { StepBlock, Track } from '../editor/types';

interface TrackViewProps {
  track: Track;
  index: number;
  selectedBlockId?: string;
  activeStepBlockIds: Set<string>;
  onSelectBlock: (blockId: string) => void;
  onRenameTrack: (trackId: string, name: string) => void;
  onRemoveTrack: (trackId: string) => void;
}

const countSteps = (blocks: StepBlock[]): number =>
  blocks.reduce((total, block) => {
    if (block.kind === 'repeat') {
      return total + Math.max(1, block.times) * countSteps(block.children);
    }

    return total + 1;
  }, 0);

export function TrackView({
  track,
  index,
  selectedBlockId,
  activeStepBlockIds,
  onSelectBlock,
  onRenameTrack,
  onRemoveTrack,
}: TrackViewProps) {
  const [mute, setMute] = useState(false);
  const [solo, setSolo] = useState(false);

  const stepCount = useMemo(() => countSteps(track.steps), [track.steps]);
  const fxCount = track.modifiers.length;
  const stepSummary = `${stepCount} step${stepCount === 1 ? '' : 's'}`;
  const fxSummary = `${fxCount} block${fxCount === 1 ? '' : 's'}`;

  return (
    <article
      className="track-card"
      style={{ ['--track-color' as string]: track.color }}
    >
      <aside className="track-mixer">
        <div className="track-mixer__top">
          <span className="track-index">T{String(index + 1).padStart(2, '0')}</span>
          <div className="track-actions">
            <button
              type="button"
              className={`track-chip ${mute ? 'is-active' : ''}`}
              data-toggle="mute"
              onClick={() => setMute((prev) => !prev)}
            >
              M
            </button>
            <button
              type="button"
              className={`track-chip ${solo ? 'is-active' : ''}`}
              data-toggle="solo"
              onClick={() => setSolo((prev) => !prev)}
            >
              S
            </button>
            <button
              type="button"
              className="track-chip"
              data-toggle="remove"
              onClick={() => onRemoveTrack(track.id)}
              aria-label="Remove track"
              title="Remove track"
            >
              ×
            </button>
          </div>
        </div>

        <div className="track-name-field">
          <label htmlFor={`track-name-${track.id}`}>Track name</label>
          <input
            id={`track-name-${track.id}`}
            value={track.name}
            onChange={(event) => onRenameTrack(track.id, event.target.value)}
          />
        </div>

        <dl className="track-meta">
          <div className="track-meta__stat">
            <dt>Pattern</dt>
            <dd>{stepSummary}</dd>
          </div>
          <div className="track-meta__stat">
            <dt>FX Chain</dt>
            <dd>{fxSummary}</dd>
          </div>
        </dl>
      </aside>

      <div className="track-lanes">
        <StepSequence
          blocks={track.steps}
          containerId={makeStepsContainerId(track.id)}
          trackId={track.id}
          trackColor={track.color}
          selectedBlockId={selectedBlockId}
          activeBlockIds={activeStepBlockIds}
          onSelect={onSelectBlock}
        />

        <ModifierLane
          blocks={track.modifiers}
          containerId={makeModifiersContainerId(track.id)}
          trackColor={track.color}
          selectedBlockId={selectedBlockId}
          onSelect={onSelectBlock}
        />
      </div>
    </article>
  );
}
