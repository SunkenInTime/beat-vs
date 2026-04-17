interface TransportControlsProps {
  tempo: number;
  isPlaying: boolean;
  isLoading: boolean;
  statusMessage: string;
  statusState: 'idle' | 'loading' | 'playing' | 'error';
  onTempoChange: (tempo: number) => void;
  onPlay: () => void;
  onStop: () => void;
}

const METER_BARS = 14;

export function TransportControls({
  tempo,
  isPlaying,
  isLoading,
  statusMessage,
  statusState,
  onTempoChange,
  onPlay,
  onStop,
}: TransportControlsProps) {
  return (
    <section className="transport-card">
      <div className="transport-stack">
        <div className="transport-buttons">
          <button
            className="transport-btn transport-btn--play"
            onClick={onPlay}
            disabled={isLoading}
          >
            {isLoading ? 'Booting…' : isPlaying ? '↻ Restart' : '▶ Play'}
          </button>
          <button className="transport-btn transport-btn--stop" onClick={onStop}>
            ■ Stop
          </button>
        </div>

        <div className="bpm-readout">
          <div>
            <div className="bpm-readout__digits">{tempo}</div>
            <span className="bpm-readout__label">BPM</span>
          </div>
          <label className="bpm-readout__slider">
            <span className="bpm-readout__label">Tempo</span>
            <input
              type="range"
              min={40}
              max={220}
              value={tempo}
              onChange={(event) => onTempoChange(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="status-line" data-state={statusState}>
          <span className="status-line__dot" />
          <span>{statusMessage}</span>
        </div>
      </div>

      <div className="transport-meter" aria-hidden="true">
        <span className="transport-meter__label">Output</span>
        <div className="transport-meter__bars">
          {Array.from({ length: METER_BARS }).map((_, idx) => (
            <span
              key={idx}
              className={`transport-meter__bar ${isPlaying ? 'is-live' : ''}`}
              style={{ animationDelay: `${idx * 55}ms` }}
            />
          ))}
        </div>
        <span className="transport-meter__label">
          {isPlaying ? 'live' : '—'}
        </span>
      </div>
    </section>
  );
}
