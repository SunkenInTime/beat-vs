import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import type { BlockTemplate } from '../editor/types';

interface PaletteProps {
  templates: BlockTemplate[];
}

function TemplateChip({ template }: { template: BlockTemplate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template-${template.id}`,
    data: {
      dragType: 'template',
      templateId: template.id,
      category: template.category,
      label: template.label,
    },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`block-chip block-chip--${template.category} ${isDragging ? 'is-dragging' : ''}`}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
    >
      <span className="block-chip__label">{template.label}</span>
      <span className="block-chip__meta">
        {template.category === 'steps' ? 'Pattern block' : 'Modifier'}
      </span>
    </button>
  );
}

export function Palette({ templates }: PaletteProps) {
  const stepTemplates = templates.filter((template) => template.category === 'steps');
  const modifierTemplates = templates.filter((template) => template.category === 'modifiers');

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Palette</h2>
        <p>Drag blocks into tracks, repeat loops, or modifier lanes.</p>
      </div>

      <div className="palette-group">
        <h3>Beat blocks</h3>
        <div className="palette-grid">
          {stepTemplates.map((template) => (
            <TemplateChip key={template.id} template={template} />
          ))}
        </div>
      </div>

      <div className="palette-group">
        <h3>Modifier blocks</h3>
        <div className="palette-grid">
          {modifierTemplates.map((template) => (
            <TemplateChip key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}
