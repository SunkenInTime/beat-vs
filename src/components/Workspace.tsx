import { StepSequence } from './StepSequence';
import { makeStepsContainerId } from '../editor/tree';
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
  { label: '' },
  { label: '' },
  { label: '' },
  { label: '2', strong: true },
  { label: '' },
  { label: '' },
  { label: '' },
  { label: '3', strong: true },
  { label: '' },
  { label: '' },
  { label: '' },
  { label: '4', strong: true },
  { label: '' },
  { label: '' },
  { label: '' },
];

const CANVAS_ROWS = 8;

export function Workspace({
  tracks,
  selectedBlockId,
  activeStepBlockIds,
  playheadProgress,
  isPlaying,
  onAddTrack,
  onSelectBlock,
}: WorkspaceProps) {
  const playheadLeftPercent = Math.max(0, Math.min(100, playheadProgress * 100));
  const rows = Array.from({ length: Math.max(CANVAS_ROWS, tracks.length) }, (_, index) => ({
    index,
    track: tracks[index],
  }));

  return (
    <section className="workspace">
      <header className="workspace__header">
        <div className="workspace__title">
          <p className="panel__eyebrow">Tile canvas</p>
          <h2>Arrange from left to right</h2>
        </div>
        <div className="workspace__tools">
          <button className="add-track-btn" onClick={onAddTrack}>
            <span className="add-track-btn__plus">+</span>
            Add row
          </button>
        </div>
      </header>

      <div className="timeline">
        <div className="timeline__label">Time</div>
        <div className="timeline__ruler">
          {BEAT_TICKS.map((tick, idx) => (
            <span
              key={idx}
              className="timeline__tick"
              data-strong={tick.strong ? 'true' : 'false'}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      <div className="tracks-scroller canvas-scroller">
        <span
          className="playhead"
          style={{
            left: `calc(var(--canvas-label-width, 78px) + (100% - var(--canvas-label-width, 78px)) * ${
              playheadLeftPercent / 100
            })`,
          }}
          data-hidden={isPlaying ? 'false' : 'true'}
          aria-hidden="true"
        />

        <div className="canvas-grid">
          {rows.map(({ track, index }) => (
            <div
              key={track?.id ?? `empty-row-${index}`}
              className={`canvas-row ${track ? 'canvas-row--active' : 'canvas-row--empty'}`}
              style={{
                ['--track-color' as string]: track?.color ?? 'rgba(255, 255, 255, 0.18)',
              }}
            >
              <div className="canvas-row__label">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              {track ? (
                <StepSequence
                  blocks={track.steps}
                  containerId={makeStepsContainerId(track.id)}
                  trackId={track.id}
                  trackColor={track.color}
                  selectedBlockId={selectedBlockId}
                  activeBlockIds={activeStepBlockIds}
                  onSelect={onSelectBlock}
                />
              ) : (
                <div className="canvas-row__empty" aria-hidden="true" />
              )}
            </div>
          ))}

          {tracks.length === 0 ? (
            <div className="workspace-empty">
              <p>Add a row, then drop beat nodes anywhere on the tile grid.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
