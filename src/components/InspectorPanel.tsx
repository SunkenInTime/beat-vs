import type { DrumSample, LocatedBlock } from '../editor/types';

const drumSamples: DrumSample[] = ['bd', 'sd', 'hh', 'cp', 'oh', 'lt', 'mt'];

interface InspectorPanelProps {
  selectedBlock?: LocatedBlock;
  onUpdateSample: (blockId: string, sample: DrumSample) => void;
  onUpdateRepeat: (blockId: string, times: number) => void;
  onUpdateModifier: (blockId: string, value: number) => void;
  onDelete: (blockId: string) => void;
}

export function InspectorPanel({
  selectedBlock,
  onUpdateSample,
  onUpdateRepeat,
  onUpdateModifier,
  onDelete,
}: InspectorPanelProps) {
  return (
    <section className="panel inspector-panel">
      <div className="panel__header">
        <h2>Inspector</h2>
        <p>Select a block to edit its values.</p>
      </div>

      {!selectedBlock ? (
        <div className="inspector-empty">
          <p>Click any block in the workspace to tweak it here.</p>
        </div>
      ) : null}

      {selectedBlock?.scope === 'step' && selectedBlock.block.kind === 'sample' ? (
        <div className="inspector-fields">
          <label>
            <span>Sample</span>
            <select
              value={selectedBlock.block.sample}
              onChange={(event) =>
                onUpdateSample(selectedBlock.block.id, event.target.value as DrumSample)
              }
            >
              {drumSamples.map((sample) => (
                <option key={sample} value={sample}>
                  {sample}
                </option>
              ))}
            </select>
          </label>
          <button className="danger-button" onClick={() => onDelete(selectedBlock.block.id)}>
            Delete block
          </button>
        </div>
      ) : null}

      {selectedBlock?.scope === 'step' && selectedBlock.block.kind === 'repeat' ? (
        <div className="inspector-fields">
          <label>
            <span>Repeat count</span>
            <input
              type="number"
              min={1}
              max={16}
              value={selectedBlock.block.times}
              onChange={(event) => onUpdateRepeat(selectedBlock.block.id, Number(event.target.value))}
            />
          </label>
          <button className="danger-button" onClick={() => onDelete(selectedBlock.block.id)}>
            Delete block
          </button>
        </div>
      ) : null}

      {selectedBlock?.scope === 'step' && selectedBlock.block.kind === 'rest' ? (
        <div className="inspector-fields">
          <p>Rest blocks add silence inside the pattern.</p>
          <button className="danger-button" onClick={() => onDelete(selectedBlock.block.id)}>
            Delete block
          </button>
        </div>
      ) : null}

      {selectedBlock?.scope === 'modifier' ? (
        <div className="inspector-fields">
          <label>
            <span>Value</span>
            <input
              type="number"
              step={selectedBlock.block.kind === 'pan' || selectedBlock.block.kind === 'gain' ? 0.05 : 0.25}
              min={selectedBlock.block.kind === 'pan' ? 0 : 0.1}
              max={selectedBlock.block.kind === 'pan' ? 1 : 8}
              value={selectedBlock.block.value}
              onChange={(event) =>
                onUpdateModifier(selectedBlock.block.id, Number(event.target.value))
              }
            />
          </label>
          <button className="danger-button" onClick={() => onDelete(selectedBlock.block.id)}>
            Delete block
          </button>
        </div>
      ) : null}
    </section>
  );
}
