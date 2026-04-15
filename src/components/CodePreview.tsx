interface CodePreviewProps {
  code: string;
}

export function CodePreview({ code }: CodePreviewProps) {
  return (
    <section className="panel code-panel">
      <div className="panel__header">
        <h2>Generated Strudel code</h2>
        <p>The visual editor compiles directly into runnable Strudel.</p>
      </div>

      <pre className="code-preview">
        <code>{code}</code>
      </pre>
    </section>
  );
}
