import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useEffect, useMemo, useRef, useState } from 'react';

import { CodePreview } from './components/CodePreview';
import { InspectorPanel } from './components/InspectorPanel';
import { Palette } from './components/Palette';
import { TransportControls } from './components/TransportControls';
import { Workspace } from './components/Workspace';
import { compileDocument } from './editor/compiler';
import { paletteTemplates } from './editor/defaults';
import { findBlockById, getContainerType } from './editor/tree';
import { useEditorStore } from './editor/store';
import { strudelEngine } from './engine/strudelEngine';
import { localDraftPersistence } from './sync/persistence';

type ActiveDrag =
  | {
      dragType: 'template';
      label: string;
      templateId: string;
      category: 'steps' | 'modifiers';
    }
  | {
      dragType: 'block';
      label: string;
      blockId: string;
      scope: 'steps' | 'modifiers';
      containerId: string;
      index: number;
    };

interface SlotData {
  dropType: 'slot';
  containerId: string;
  index: number;
  containerType: 'steps' | 'modifiers';
}

export default function App() {
  const tempo = useEditorStore((state) => state.tempo);
  const tracks = useEditorStore((state) => state.tracks);
  const selectedBlockId = useEditorStore((state) => state.selectedBlockId);
  const hydrate = useEditorStore((state) => state.hydrate);
  const setTempo = useEditorStore((state) => state.setTempo);
  const addTrack = useEditorStore((state) => state.addTrack);
  const removeTrack = useEditorStore((state) => state.removeTrack);
  const renameTrack = useEditorStore((state) => state.renameTrack);
  const insertTemplate = useEditorStore((state) => state.insertTemplate);
  const moveBlock = useEditorStore((state) => state.moveBlock);
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const selectBlock = useEditorStore((state) => state.selectBlock);
  const updateSampleBlock = useEditorStore((state) => state.updateSampleBlock);
  const updateRepeatBlock = useEditorStore((state) => state.updateRepeatBlock);
  const updateModifierValue = useEditorStore((state) => state.updateModifierValue);

  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Press play to unlock audio and load Strudel drum samples.',
  );
  const lastPlayedCodeRef = useRef<string | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );

  const document = useMemo(() => ({ tempo, tracks }), [tempo, tracks]);
  const compiledCode = useMemo(() => compileDocument(document), [document]);
  const selectedBlock = useMemo(
    () => (selectedBlockId ? findBlockById(tracks, selectedBlockId) : undefined),
    [selectedBlockId, tracks],
  );

  useEffect(() => {
    const saved = localDraftPersistence.load();
    if (saved) {
      hydrate(saved);
    }
    setIsLoaded(true);
  }, [hydrate]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localDraftPersistence.save(document);
  }, [document, isLoaded]);

  useEffect(() => {
    if (!isPlaying || lastPlayedCodeRef.current === compiledCode) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void runPlayback(compiledCode);
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [compiledCode, isPlaying]);

  useEffect(() => () => strudelEngine.stop(), []);

  const runPlayback = async (code: string) => {
    setIsLoading(true);
    setStatusMessage('Initializing Strudel and evaluating the generated code...');

    try {
      await strudelEngine.play(code);
      lastPlayedCodeRef.current = code;
      setIsPlaying(true);
      setStatusMessage('Playing the compiled Strudel pattern.');
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
      setStatusMessage('Playback failed. Check the console and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    void runPlayback(compiledCode);
  };

  const handleStop = () => {
    strudelEngine.stop();
    lastPlayedCodeRef.current = undefined;
    setIsPlaying(false);
    setStatusMessage('Stopped.');
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as ActiveDrag | undefined;
    setActiveDrag(data ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeData = event.active.data.current as ActiveDrag | undefined;
    const overData = event.over?.data.current as SlotData | undefined;
    setActiveDrag(null);

    if (!activeData || overData?.dropType !== 'slot') {
      return;
    }

    if (activeData.dragType === 'template') {
      const expectedType = activeData.category === 'steps' ? 'steps' : 'modifiers';
      if (expectedType !== overData.containerType) {
        return;
      }

      insertTemplate(activeData.templateId, {
        containerId: overData.containerId,
        index: overData.index,
      });
      return;
    }

    if (activeData.scope !== getContainerType(overData.containerId)) {
      return;
    }

    moveBlock(
      activeData.blockId,
      { containerId: overData.containerId, index: overData.index },
      { containerId: activeData.containerId, index: activeData.index },
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app-shell">
        <header className="hero-card">
          <div>
            <p className="eyebrow">React + TypeScript + real Strudel</p>
            <h1>Beat VS</h1>
            <p className="hero-copy">
              Build live beats with Scratch-style blocks, then compile them into actual Strudel
              code under the hood.
            </p>
          </div>
          <TransportControls
            tempo={tempo}
            isPlaying={isPlaying}
            isLoading={isLoading}
            statusMessage={statusMessage}
            onTempoChange={setTempo}
            onPlay={handlePlay}
            onStop={handleStop}
          />
        </header>

        <main className="layout-grid">
          <aside className="left-rail">
            <Palette templates={paletteTemplates} />
          </aside>

          <section
            className="center-rail"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                selectBlock(undefined);
              }
            }}
          >
            <Workspace
              tracks={tracks}
              selectedBlockId={selectedBlockId}
              onAddTrack={addTrack}
              onRenameTrack={renameTrack}
              onRemoveTrack={removeTrack}
              onSelectBlock={(blockId) => selectBlock(blockId)}
            />
          </section>

          <aside className="right-rail">
            <InspectorPanel
              selectedBlock={selectedBlock}
              onUpdateSample={updateSampleBlock}
              onUpdateRepeat={updateRepeatBlock}
              onUpdateModifier={updateModifierValue}
              onDelete={deleteBlock}
            />
            <CodePreview code={compiledCode} />
          </aside>
        </main>
      </div>

      <DragOverlay>
        {activeDrag ? <div className="drag-overlay">{activeDrag.label}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
