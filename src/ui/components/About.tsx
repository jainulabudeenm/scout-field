/**
 * Shown before the first run, and from the About button after that. A stranger
 * installing this from the Community has no idea what it does or what comes back,
 * and the panel is the only place they will look.
 */
export default function About({
  needsKey,
  onOpenSettings,
  onClose,
}: {
  needsKey: boolean;
  onOpenSettings: () => void;
  onClose: () => void;
}) {
  return (
    <section className="about">
      <header className="about-head">
        <h2>What Scout does</h2>
        <button className="ghost small" onClick={onClose}>
          Hide
        </button>
      </header>

      <p>
        Select a frame. Scout evaluates it and draws the findings on your canvas, next to the
        design, numbered and boxed on the element each one is about.
      </p>

      <h3>When to use it</h3>
      <ul>
        <li>Before you hand a screen to engineering</li>
        <li>Before a design review, so the discussion starts past the obvious</li>
        <li>When you inherit a screen somebody else made</li>
        <li>On a competitor's screen, to see it with fresh eyes</li>
      </ul>

      <h3>What it checks</h3>
      <ol className="layers">
        <li>
          <strong>Nielsen's 10 usability heuristics.</strong> The standard checklist for whether an
          interface makes sense to the person using it.
        </li>
        <li>
          <strong>WCAG 2.1 AA.</strong> The accessibility standard most companies are held to.
          Contrast, labels, focus, text size.
        </li>
        <li>
          <strong>Platform rules.</strong> Apple's Human Interface Guidelines, Material 3, or web,
          picked from your screen.
        </li>
      </ol>
      <p className="muted">
        A <strong>lens</strong> is an optional fourth layer: your own product's principles. It adds
        findings the general layers cannot see, and raises the severity of ones that matter more in
        your product. Settings has four starting points you can edit.
      </p>

      <h3>What you get back</h3>
      <ul>
        <li>
          <strong>A copy of your frame</strong> beside the original, with a numbered box on each
          finding. Your original is never touched.
        </li>
        <li>
          <strong>A report in this panel.</strong> Each finding has a headline, a severity from 0 to
          4, what to do about it, and a crop of the element.
        </li>
        <li>
          <strong>A report board</strong> built as a Figma frame, so you can share it without
          sharing the plugin.
        </li>
        <li>
          <strong>Export</strong> as rich text, markdown or JSON.
        </li>
      </ul>

      <h3>How a finding reads</h3>
      <pre className="sample">{`3  Sev 3  ·  Nielsen H4 Consistency and standards
   The back arrow returns to the list, not to the
   previous screen, so a user who arrived from
   search loses their results.

   What to do: return to the previous screen.
   Keep "back to list" as a separate control.

   H4 Consistency and standards means people should
   not have to wonder whether different words or
   actions mean the same thing.`}</pre>
      <p className="muted">
        Every finding explains the rule it cites in plain words, so a product manager or a
        researcher can act on it without knowing the framework.
      </p>

      <h3>Before you start</h3>
      <p>
        Scout runs on your own API key, so nobody else pays for your evaluations. A free Gemini key
        takes about a minute at <strong>aistudio.google.com/apikey</strong>. It is stored on this
        computer and sent only to the model you choose.
      </p>
      {needsKey && (
        <button className="primary" onClick={onOpenSettings}>
          Add your API key
        </button>
      )}
      <p className="muted">One run takes 90 to 160 seconds. That is normal, not a hang.</p>
    </section>
  );
}
