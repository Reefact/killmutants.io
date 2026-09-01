/**
 * What this site last shipped. Read from generated/site-release.json, written by
 * scripts/generate-release-note.mjs out of RELEASE_NOTES.md at the root of this
 * repository — the newest `## release/*` section, never `## Unreleased`.
 *
 * NOT THE TOOL'S RELEASE NOTES. Those live in a different repository
 * (Reefact/kill-mutants) and describe a different product; this file is what changed
 * on the *site*, and the two must never be shown as one another.
 */
import siteReleaseDocument from './generated/site-release.json';
import { site } from './site';

export interface SiteReleaseRubric {
  readonly label: string;
  readonly items: readonly string[];
}

export interface SiteReleaseSummary {
  readonly tag: string;
  readonly date: string;
  readonly summaryHtml: readonly string[];
  readonly sections: readonly SiteReleaseRubric[];
}

export interface SiteReleaseDocument {
  /** The most recent released section, or null when nothing has shipped yet. */
  readonly latest: SiteReleaseSummary | null;
  /** Up to 5 releases published just before `latest`, newest first. */
  readonly previous: readonly SiteReleaseSummary[];
  /** The tag right past `previous`'s last entry, for a "view more on GitHub" link —
   *  null once the file's whole history fits in `latest` + `previous`. */
  readonly moreTag: string | null;
}

export const siteRelease: SiteReleaseDocument = siteReleaseDocument as SiteReleaseDocument;

/** Where a release of this repository is read on GitHub, anchored on that release's
 *  own entry in the releases list. */
export function releaseUrl(tag: string): string {
  return `${site.siteRepository}/releases#release-${tag}`;
}

/** Where the full releases list is read on GitHub. */
export function releasesListUrl(): string {
  return `${site.siteRepository}/releases`;
}
