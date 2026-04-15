import { TrackView } from './TrackView';
import type { Track } from '../editor/types';

interface WorkspaceProps {
  tracks: Track[];
  selectedBlockId?: string;
  onAddTrack: () => void;
  onRenameTrack: (trackId: string, name: string) => void;
  onRemoveTrack: (trackId: string) => void;
  onSelectBlock: (blockId: string) => void;
}

export function Workspace({
  tracks,
  selectedBlockId,
  onAddTrack,
  onRenameTrack,
  onRemoveTrack,
  onSelectBlock,
}: WorkspaceProps) {
  return (
    <section className="panel workspace-panel">
      <div className="panel__header panel__header--workspace">
        <div>
          <h2>Workspace</h2>
          <p>Build layered beats with nested loops and modifier chains.</p>
        </div>
        <button className="primary-button" onClick={onAddTrack}>
          Add track
        </button>
      </div>

      <div className="workspace-list">
        {tracks.map((track) => (
          <TrackView
            key={track.id}
            track={track}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onRenameTrack={onRenameTrack}
            onRemoveTrack={onRemoveTrack}
          />
        ))}

        {tracks.length === 0 ? (
          <div className="workspace-empty">
            <p>Create a track, then drag blocks in to begin your pattern.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
