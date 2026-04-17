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
import { Palette } from './components/Palette';
import { TransportControls } from './components/TransportControls';
import { Workspace } from './components/Workspace';
import { ScratchBlock, type ScratchBlockData } from './components/ScratchBlock';
import { compileDocument } from './editor/compiler';
import { paletteTemplates } from './editor/defaults';
import { getContainerType } from './editor/tree';
import { useEditorStore } from './editor/store';
import type { StepBlock, Track } from './editor/types';
import { strudelEngine } from './engine/strudelEngine';
import { localDraftPersistence } from './sync/persistence';

type ActiveDrag =
  | {
      dragType: 'template';
      templateId: string;
      category: 'steps' | 'modifiers';
      preview: ScratchBlockData;
    }
  | {
      dragType: 'block';
      blockId: string;
      scope: 'steps' | 'modifiers';
      containerId: string;
      index: number;
      preview: ScratchBlockData;
    };

interface SlotData {
  dropType: 'slot';
  containerId: string;
  index: number;
  containerType: 'steps' | 'modifiers';
}

interface PaletteDeleteData {
  dropType: 'palette-delete';
}

interface TimelineStep {
  blockId: string;
  parentRepeatIds: string[];
}

const flattenStepTimeline = (
  blocks: StepBlock[],
  parentRepeatIds: string[] = [],
): TimelineStep[] =>
  blocks.flatMap((block) => {
    if (block.kind === 'repeat') {
      const repeatCount = Math.max(1, block.times);
      return Array.from({ length: repeatCount }, () =>
        flattenStepTimeline(block.children, [...parentRepeatIds, block.id]),
      ).flat();
    }

    return [{ blockId: block.id, parentRepeatIds }];
  });

const getActiveStepIdsForTrack = (track: Track, cycleProgress: number): string[] => {
  const timeline = flattenStepTimeline(track.steps);
  if (timeline.length === 0) {
    return [];
  }

  const stepIndex = Math.floor(cycleProgress * timeline.length) % timeline.length;
  const activeStep = timeline[stepIndex];
  return [activeStep.blockId, ...activeStep.parentRepeatIds];
};

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

  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackClockMs, setPlaybackClockMs] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    'Press play to unlock audio and load drum samples.',
  );
  const [statusState, setStatusState] = useState<'idle' | 'loading' | 'playing' | 'error'>(
    'idle',
  );
  const lastPlayedCodeRef = useRef<string | undefined>(undefined);
  const playbackStartedAtRef = useRef<number | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );

  const document = useMemo(() => ({ tempo, tracks }), [tempo, tracks]);
  const compiledCode = useMemo(() => compileDocument(document), [document]);

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

  useEffect(() => {
    if (!isPlaying || playbackStartedAtRef.current === undefined) {
      return;
    }

    const tick = () => setPlaybackClockMs(performance.now());
    tick();
    const intervalId = window.setInterval(tick, 45);

    return () => window.clearInterval(intervalId);
  }, [isPlaying]);

  const cycleProgress = useMemo(() => {
    if (!isPlaying || playbackStartedAtRef.current === undefined) {
      return 0;
    }

    const cycleDurationMs = 60_000 / Math.max(1, tempo);
    const elapsedMs = Math.max(0, playbackClockMs - playbackStartedAtRef.current);
    return (elapsedMs % cycleDurationMs) / cycleDurationMs;
  }, [isPlaying, playbackClockMs, tempo]);

  const activeStepBlockIds = useMemo(() => {
    if (!isPlaying || playbackStartedAtRef.current === undefined) {
      return new Set<string>();
    }

    const activeIds = new Set<string>();
    tracks.forEach((track) => {
      getActiveStepIdsForTrack(track, cycleProgress).forEach((blockId) => activeIds.add(blockId));
    });

    return activeIds;
  }, [isPlaying, cycleProgress, tracks]);

  const runPlayback = async (code: string) => {
    setIsLoading(true);
    setStatusMessage('Booting Strudel · evaluating pattern…');
    setStatusState('loading');

    try {
      await strudelEngine.play(code);
      lastPlayedCodeRef.current = code;
      playbackStartedAtRef.current = performance.now();
      setPlaybackClockMs(playbackStartedAtRef.current);
      setIsPlaying(true);
      setStatusMessage('Live · pattern playing');
      setStatusState('playing');
    } catch (error) {
      console.error(error);
      playbackStartedAtRef.current = undefined;
      setPlaybackClockMs(0);
      setIsPlaying(false);
      setStatusMessage('Playback failed — check the console.');
      setStatusState('error');
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
    playbackStartedAtRef.current = undefined;
    setPlaybackClockMs(0);
    setIsPlaying(false);
    setStatusMessage('Stopped.');
    setStatusState('idle');
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as ActiveDrag | undefined;
    setActiveDrag(data ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeData = event.active.data.current as ActiveDrag | undefined;
    const overData = event.over?.data.current as SlotData | PaletteDeleteData | undefined;
    setActiveDrag(null);

    if (!activeData || !overData) {
      return;
    }

    if (overData.dropType === 'palette-delete') {
      if (activeData.dragType === 'block') {
        deleteBlock(activeData.blockId);
      }
      return;
    }

    if (overData.dropType !== 'slot') {
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
      <div className={`app-shell ${activeDrag ? 'is-dragging' : ''}`}>
        <header className="masthead">
          <div className="masthead__brand">
            <p className="masthead__tag">React · TypeScript · Strudel Engine</p>
            <h1 className="masthead__title">
              BEAT<span className="accent">·</span>VS
            </h1>
            <p className="masthead__copy">
              A Scratch-style block language wired into a DAW timeline. Snap puzzle-blocks into
              tracks, stack them as layers, and let the compiler fire live Strudel patterns.
            </p>
          </div>

          <TransportControls
            tempo={tempo}
            isPlaying={isPlaying}
            isLoading={isLoading}
            statusMessage={statusMessage}
            statusState={statusState}
            onTempoChange={setTempo}
            onPlay={handlePlay}
            onStop={handleStop}
          />
        </header>

        <main
          className="layout-grid"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              selectBlock(undefined);
            }
          }}
        >
          <aside className="left-rail">
            <Palette templates={paletteTemplates} />
          </aside>

          <section className="center-rail">
            <Workspace
              tracks={tracks}
              selectedBlockId={selectedBlockId}
              activeStepBlockIds={activeStepBlockIds}
              playheadProgress={cycleProgress}
              isPlaying={isPlaying}
              onAddTrack={addTrack}
              onRenameTrack={renameTrack}
              onRemoveTrack={removeTrack}
              onSelectBlock={(blockId) => selectBlock(blockId)}
            />
          </section>
        </main>

        <section className="code-section">
          <CodePreview code={compiledCode} />
        </section>
      </div>

      <DragOverlay>
        {activeDrag ? (
          <div className="drag-overlay">
            <ScratchBlock data={activeDrag.preview} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
