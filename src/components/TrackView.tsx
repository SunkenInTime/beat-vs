import { ModifierLane } from './ModifierLane';
import { StepSequence } from './StepSequence';
import { makeModifiersContainerId, makeStepsContainerId } from '../editor/tree';
import type { Track } from '../editor/types';

interface TrackViewProps {
  track: Track;
  selectedBlockId?: string;
  onSelectBlock: (blockId: string) => void;
  onRenameTrack: (trackId: string, name: string) => void;
  onRemoveTrack: (trackId: string) => void;
}

export function TrackView({
  track,
  selectedBlockId,
  onSelectBlock,
  onRenameTrack,
  onRemoveTrack,
}: TrackViewProps) {
  return (
    <article className="track-card" style={{ borderColor: track.color }}>
      <header className="track-card__header">
        <div>
          <label className="track-name-field">
            <span>Track</span>
            <input
              value={track.name}
              onChange={(event) => onRenameTrack(track.id, event.target.value)}
            />
          </label>
          <small>Arrange steps left-to-right, then stack tracks together.</small>
        </div>

        <button className="ghost-button" onClick={() => onRemoveTrack(track.id)}>
          Remove track
        </button>
      </header>

      <div className="track-card__section">
        <div className="track-card__label">
          <h3>Pattern</h3>
          <p>Beat blocks snap together into Strudel mini notation.</p>
        </div>
        <StepSequence
          blocks={track.steps}
          containerId={makeStepsContainerId(track.id)}
          trackId={track.id}
          trackColor={track.color}
          selectedBlockId={selectedBlockId}
          onSelect={onSelectBlock}
        />
      </div>

      <div className="track-card__section">
        <div className="track-card__label">
          <h3>Modifiers</h3>
          <p>These compile into chained Strudel methods.</p>
        </div>
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
