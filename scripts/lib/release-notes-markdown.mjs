// The markdown RELEASE_NOTES.md is written in, read into structure.
//
// Trimmed from justdummies.io's release-notes-markdown.mjs for a single-locale site:
// same grammar (`## <version> — <date>`, an optional `_italic_` summary paragraph,
// then `### Rubric` blocks of `- ` bullets), same "not a markdown parser" scope —
// it knows the block forms this file uses and no others.
import { posix } from 'node:path';

export function releaseNotesReader({ refuse, resolveLink }) {
  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeQuotes(text) {
    return text.replace(/"/g, '&quot;');
  }

  function inlineHtml(markdown) {
    const escaped = escapeHtml(markdown.replace(/\0/g, ''));

    const codes = [];
    const coded = escaped.replace(/`([^`]+)`/g, (_match, code) => `\0${codes.push(escapeQuotes(code)) - 1}\0`);

    const bolded = coded.replace(/\*\*([^*]+)\*\*/g, (_match, text) => `<strong>${text}</strong>`);
    const italicised = bolded.replace(/\*([^*]+)\*/g, (_match, text) => `<em>${text}</em>`);

    const linked = italicised.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, href) => {
      const link = resolveLink(href, { absolute: /^https?:\/\//.test(href) });
      const away = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escapeQuotes(link.href)}"${away}>${text}</a>`;
    });

    return linked.replace(/\0(\d+)\0/g, (_match, index) => `<code>${codes[Number(index)]}</code>`);
  }

  function paragraphHtml(paragraph) {
    const italic = /^_(.+)_$/.exec(paragraph.trim());
    return italic === null ? inlineHtml(paragraph) : `<em>${inlineHtml(italic[1])}</em>`;
  }

  function blockItemsOf(lines) {
    const items = [];
    let current = null;

    for (const line of lines) {
      const bullet = /^- (.+)/.exec(line);

      if (bullet !== null) {
        current = bullet[1];
        items.push(current);
      } else if (current !== null && line.trim() !== '') {
        items[items.length - 1] += ` ${line.trim()}`;
      }
    }

    return items;
  }

  function paragraphsOf(lines) {
    const text = lines.join('\n').trim();
    if (text === '') return [];
    return text.split(/\n{2,}/).map((p) => p.replace(/\n/g, ' ').trim());
  }

  /**
   * One file's releases, newest first — the order the file already writes them in.
   * `skip` declines a section that is not a release (this file's own `## Unreleased`).
   */
  function releasesOf(markdown, file, { skip = () => false } = {}) {
    const lines = markdown.split('\n');
    const releases = [];
    let heading = null;
    let body = [];

    function flush() {
      if (heading === null) return;

      const match = /^(\S+)\s+—\s+(.+)$/.exec(heading);
      if (match === null) {
        refuse(`${file} heads a release "${heading}", where "<version> — <date>" was expected`);
      }

      const [, version, date] = match;
      const firstRubric = body.findIndex((line) => /^### /.test(line));
      const summaryLines = firstRubric === -1 ? body : body.slice(0, firstRubric);

      const sections = [];
      let current = null;

      for (const line of body) {
        const rubric = /^### (.+)/.exec(line);

        if (rubric !== null) {
          current = { label: rubric[1].trim(), lines: [] };
          sections.push(current);
        } else if (current !== null) {
          current.lines.push(line);
        }
      }

      if (sections.length === 0 && summaryLines.every((line) => line.trim() === '')) {
        refuse(`${file} carries a release ${version} with neither a summary nor a rubric`);
      }

      releases.push({
        version,
        date,
        summaryHtml: paragraphsOf(summaryLines).map(paragraphHtml),
        sections: sections.map((section) => ({
          label: section.label,
          items: blockItemsOf(section.lines).map(inlineHtml),
        })),
      });
    }

    for (const line of lines) {
      const release = /^## (.+)/.exec(line);

      if (release !== null) {
        flush();
        heading = skip(release[1].trim()) ? null : release[1].trim();
        body = [];
      } else if (heading !== null) {
        body.push(line);
      }
    }
    flush();

    return releases;
  }

  /** `August 18, 2026` → `2026-08-18`. */
  function isoDateOf(humanDate, file) {
    const parsed = new Date(`${humanDate} UTC`);
    if (Number.isNaN(parsed.getTime())) {
      refuse(`${file} dates a release "${humanDate}", which does not parse as a date`);
    }
    return parsed.toISOString().slice(0, 10);
  }

  return { releasesOf, isoDateOf };
}

/** A relative link resolves against this repository's tree; an absolute one is left as
 *  written, marked external unless it points at this site's own origin. */
export function githubHrefResolver({ repositoryUrl, siteOrigin }) {
  return function resolveLink(href, { absolute }) {
    if (absolute) {
      return { href, external: !href.startsWith(siteOrigin) };
    }

    return { href: posix.join(`${repositoryUrl}/blob/main`, href), external: true };
  };
}
