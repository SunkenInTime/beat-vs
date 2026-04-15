interface TransportControlsProps {
  tempo: number;
  isPlaying: boolean;
  isLoading: boolean;
  statusMessage: string;
  onTempoChange: (tempo: number) => void;
  onPlay: () => void;
  onStop: () => void;
}

export function TransportControls({
  tempo,
  isPlaying,
  isLoading,
  statusMessage,
  onTempoChange,
  onPlay,
  onStop,
}: TransportControlsProps) {
  return (
    <section className="transport-card">
      <div className="transport-buttons">
        <button className="primary-button" onClick={onPlay} disabled={isLoading}>
          {isLoading ? 'Loading samples...' : isPlaying ? 'Restart' : 'Play'}
        </button>
        <button className="secondary-button" onClick={onStop}>
          Stop
        </button>
      </div>

      <label className="tempo-control">
        <span>Tempo: {tempo} BPM</span>
        <input
          type="range"
          min={40}
          max={220}
          value={tempo}
          onChange={(event) => onTempoChange(Number(event.target.value))}
        />
      </label>

      <p className="status-text">{statusMessage}</p>
    </section>
  );
}
