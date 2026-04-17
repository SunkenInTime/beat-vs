interface CodePreviewProps {
  code: string;
}

export function CodePreview({ code }: CodePreviewProps) {
  return (
    <section className="panel code-panel">
      <div className="code-panel__header">
        <div>
          <p className="panel__eyebrow">Output · strudel.cc</p>
          <h2 className="panel__title">Compiled pattern</h2>
        </div>
        <div className="code-panel__chips" aria-hidden="true">
          <span className="code-panel__chip" />
          <span className="code-panel__chip" />
          <span className="code-panel__chip" />
        </div>
      </div>

      <pre className="code-preview">
        <code>{code}</code>
      </pre>
    </section>
  );
}
