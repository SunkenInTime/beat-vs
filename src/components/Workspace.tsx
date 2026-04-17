import { TrackView } from './TrackView';
import type { Track } from '../editor/types';

interface WorkspaceProps {
  tracks: Track[];
  selectedBlockId?: string;
  activeStepBlockIds: Set<string>;
  playheadProgress: number;
  isPlaying: boolean;
  onAddTrack: () => void;
  onRenameTrack: (trackId: string, name: string) => void;
  onRemoveTrack: (trackId: string) => void;
  onSelectBlock: (blockId: string) => void;
}

const BEAT_TICKS = [
  { label: '1', strong: true },
  { label: '·' },
  { label: '·' },
  { label: '·' },
  { label: '2', strong: true },
  { label: '·' },
  { label: '·' },
  { label: '·' },
  { label: '3', strong: true },
  { label: '·' },
  { label: '·' },
  { label: '·' },
  { label: '4', strong: true },
  { label: '·' },
  { label: '·' },
  { label: '·' },
];

export function Workspace({
  tracks,
  selectedBlockId,
  activeStepBlockIds,
  playheadProgress,
  isPlaying,
  onAddTrack,
  onRenameTrack,
  onRemoveTrack,
  onSelectBlock,
}: WorkspaceProps) {
  const playheadLeftPercent = Math.max(0, Math.min(100, playheadProgress * 100));

  return (
    <section className="workspace">
      <header className="workspace__header">
        <div className="workspace__title">
          <p className="panel__eyebrow">The arrangement</p>
          <h2>Mix · Stack · Loop</h2>
        </div>
        <div className="workspace__tools">
          <button className="add-track-btn" onClick={onAddTrack}>
            <span className="add-track-btn__plus">+</span>
            Add track
          </button>
        </div>
      </header>

      <div className="timeline">
        <div className="timeline__label">Timeline · 1 bar / 16 steps</div>
        <div className="timeline__ruler">
          {BEAT_TICKS.map((tick, idx) => (
            <span
              key={idx}
              className="timeline__tick"
              data-strong={tick.strong ? 'true' : 'false'}
            >
              {tick.strong ? tick.label : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="tracks-scroller">
        <span
          className="playhead"
          style={{ left: `calc(var(--mixer-width, 220px) + (100% - var(--mixer-width, 220px)) * ${playheadLeftPercent / 100})` }}
          data-hidden={isPlaying ? 'false' : 'true'}
          aria-hidden="true"
        />

        <div className="tracks-list">
          {tracks.map((track, index) => (
            <TrackView
              key={track.id}
              index={index}
              track={track}
              selectedBlockId={selectedBlockId}
              activeStepBlockIds={activeStepBlockIds}
              onSelectBlock={onSelectBlock}
              onRenameTrack={onRenameTrack}
              onRemoveTrack={onRemoveTrack}
            />
          ))}

          {tracks.length === 0 ? (
            <div className="workspace-empty">
              <p>Start by adding a track — each track is a layer in the stack.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
