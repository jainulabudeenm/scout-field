import { LAYER_LABEL, severityOf } from '../shared/severity';
import type { EvalResult, Finding } from './api';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const ORDER: Finding['layer'][] = ['nielsen', 'wcag', 'platform', 'lens'];

function grouped(result: EvalResult) {
  return ORDER.map((layer) => ({
    layer,
    heading:
      layer === 'lens'
        ? result.findings.find((f) => f.layer === 'lens')?.lens || 'Lens'
        : LAYER_LABEL[layer],
    items: result.findings.filter((f) => f.layer === layer).sort((a, b) => b.severity - a.severity),
  })).filter((g) => g.items.length > 0);
}

/** Rich text with the crops inline, for pasting into Docs, Notion, or Slides. */
export function toHtml(result: EvalResult): string {
  const numbering = new Map(result.findings.map((f, i) => [f.id, i + 1]));
  const parts: string[] = [];

  parts.push(`<h1>Screen eval: ${escape(result.screen_name)}</h1>`);
  parts.push(
    `<p><em>${escape([result.screen_type, result.platform, ...result.lenses_applied].filter(Boolean).join(' · '))}</em></p>`,
  );

  if (result.assumptions.length > 0) {
    parts.push('<h2>Assumptions</h2><ul>');
    for (const a of result.assumptions) parts.push(`<li>${escape(a)}</li>`);
    parts.push('</ul>');
  }
  if (result.whats_working.length > 0) {
    parts.push("<h2>What's working</h2><ul>");
    for (const w of result.whats_working) parts.push(`<li>${escape(w)}</li>`);
    parts.push('</ul>');
  }

  parts.push('<h2>Findings</h2>');
  for (const group of grouped(result)) {
    parts.push(`<h3>${escape(group.heading)}</h3>`);
    for (const f of group.items) {
      const sev = severityOf(f.severity);
      parts.push(
        `<p><strong>${numbering.get(f.id)}. [Sev ${f.severity} ${escape(sev.label)}] ${escape(f.ref)}, ${escape(f.headline)}</strong>` +
          `${f.estimated ? ' <em>(estimated position)</em>' : ''}</p>`,
      );
      parts.push(`<p><em>${escape(f.ref_meaning)}</em></p>`);
      if (f.crop) parts.push(`<p><img src="${f.crop}" alt="${escape(f.element)}" /></p>`);
      parts.push(
        '<ul>' +
          `<li><strong>Element:</strong> ${escape(f.element)}</li>` +
          `<li><strong>What was seen:</strong> ${escape(f.observation)}</li>` +
          `<li><strong>Why it matters:</strong> ${escape(f.why_it_matters)}</li>` +
          `<li><strong>Fix:</strong> ${escape(f.recommendation)}</li>` +
          `<li><strong>Effort:</strong> ${f.effort}</li>` +
          (f.also_touches.length ? `<li><strong>Also touches:</strong> ${escape(f.also_touches.join('; '))}</li>` : '') +
          '</ul>',
      );
    }
  }

  if (result.prioritised.length > 0) {
    parts.push('<h2>Fix these first</h2><ol>');
    for (const p of result.prioritised) parts.push(`<li>${escape(p)}</li>`);
    parts.push('</ol>');
  }
  if (result.open_questions.length > 0) {
    parts.push('<h2>Open questions</h2><ol>');
    for (const q of result.open_questions) parts.push(`<li>${escape(q)}</li>`);
    parts.push('</ol>');
  }
  return parts.join('\n');
}

/** Plain text fallback, and what lands if the target strips HTML. */
export function toPlain(result: EvalResult): string {
  return result.report_markdown || toHtml(result).replace(/<[^>]+>/g, '');
}

/** Last resort: a hidden selection plus execCommand still works where the async API is blocked. */
function copyViaSelection(html: string, plain: string): boolean {
  const holder = document.createElement('div');
  holder.contentEditable = 'true';
  holder.innerHTML = html;
  holder.setAttribute('style', 'position:fixed;left:-9999px;top:0;opacity:0;');
  document.body.appendChild(holder);
  try {
    const range = document.createRange();
    range.selectNodeContents(holder);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    const ok = document.execCommand('copy');
    selection?.removeAllRanges();
    if (ok) return true;
  } catch {
    /* fall through */
  } finally {
    holder.remove();
  }
  try {
    const box = document.createElement('textarea');
    box.value = plain;
    box.setAttribute('style', 'position:fixed;left:-9999px;top:0;');
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand('copy');
    box.remove();
    return ok;
  } catch {
    return false;
  }
}

export async function copyRichText(result: EvalResult): Promise<string> {
  const html = toHtml(result);
  const plain = toPlain(result);

  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      return 'Copied with images. Paste into Docs.';
    }
  } catch {
    /* try the next route */
  }

  if (copyViaSelection(html, plain)) return 'Copied with images. Paste into Docs.';

  try {
    await navigator.clipboard.writeText(plain);
    return 'Copied as plain text, without images.';
  } catch {
    return 'Copy is blocked here. Use Markdown to download instead.';
  }
}

/**
 * The plugin iframe is sandboxed, so a download can be refused. Fall back to
 * the clipboard rather than failing silently.
 */
export async function download(filename: string, content: string, mime: string): Promise<string> {
  try {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 2000);
    return `Saved ${filename}`;
  } catch {
    try {
      await navigator.clipboard.writeText(content);
      return 'Download blocked, copied to clipboard instead';
    } catch {
      return 'Download blocked';
    }
  }
}
