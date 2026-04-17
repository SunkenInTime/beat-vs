import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import type { BlockTemplate } from '../editor/types';
import { ScratchBlock, getScratchBlockDataFromTemplate } from './ScratchBlock';

interface PaletteProps {
  templates: BlockTemplate[];
}

function TemplateChip({ template }: { template: BlockTemplate }) {
  const preview = getScratchBlockDataFromTemplate(template);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template-${template.id}`,
    data: {
      dragType: 'template',
      templateId: template.id,
      category: template.category,
      preview,
    },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="palette-chip"
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
    >
      <ScratchBlock data={preview} dragging={isDragging} />
    </button>
  );
}

export function Palette({ templates }: PaletteProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'palette-delete-target',
    data: {
      dropType: 'palette-delete',
    },
  });

  const stepTemplates = templates.filter((template) => template.category === 'steps');
  const modifierTemplates = templates.filter((template) => template.category === 'modifiers');

  return (
    <section
      ref={setNodeRef}
      className={`panel palette ${isOver ? 'palette-delete-over' : ''}`}
    >
      <div className="panel__header">
        <p className="panel__eyebrow">Block drawer</p>
        <h2 className="panel__title">Sound Palette</h2>
        <p className="panel__subtitle">Drag blocks into a track. Drag them back here to trash.</p>
      </div>

      <div className="palette-group">
        <h3 className="palette-group__title">Drums</h3>
        <div className="palette-grid">
          {stepTemplates.map((template) => (
            <TemplateChip key={template.id} template={template} />
          ))}
        </div>
      </div>

      <div className="palette-group">
        <h3 className="palette-group__title">FX / Modifiers</h3>
        <div className="palette-grid">
          {modifierTemplates.map((template) => (
            <TemplateChip key={template.id} template={template} />
          ))}
        </div>
      </div>

      <p className="palette-hint">
        pro tip · drop a <strong>repeat</strong> block then drag beats inside it to loop a phrase.
      </p>
    </section>
  );
}
