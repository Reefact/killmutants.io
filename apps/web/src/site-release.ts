/**
 * What this site last shipped, in the reader's own language. Read from
 * generated/site-release.json, written by scripts/generate-release-note.mjs out of
 * RELEASE_NOTES-<locale>.md at the root of this repository — the newest `## release/*`
 * section of each, never `## Unreleased`.
 *
 * NOT THE TOOL'S RELEASE NOTES. Those live in a different repository
 * (Reefact/kill-mutants) and describe a different product; this file is what changed on
 * the *site*, and the two must never be shown as one another.
 */
import siteReleaseDocument from "./generated/site-release.json";
import type { Locale } from "./i18n/ui";
import { site } from "./site";

export interface SiteReleaseRubric {
  readonly label: string;
  readonly items: readonly string[];
}

/** One locale's half of a release: the prose, and only the prose. */
export interface SiteReleaseProse {
  readonly summaryHtml: readonly string[];
  readonly sections: readonly SiteReleaseRubric[];
}

export interface SiteReleaseSummary {
  readonly tag: string;
  readonly date: string;
  readonly locales: Readonly<Record<Locale, SiteReleaseProse>>;
}

export interface SiteReleaseDocument {
  /** The most recent released section, or null when nothing has shipped yet. */
  readonly latest: SiteReleaseSummary | null;
  /** Up to 5 releases published just before `latest`, newest first. */
  readonly previous: readonly SiteReleaseSummary[];
  /** The tag right past `previous`'s last entry, for a "view more on GitHub" link —
   *  null once the files' whole history fits in `latest` + `previous`. */
  readonly moreTag: string | null;
}

export const siteRelease: SiteReleaseDocument = siteReleaseDocument as SiteReleaseDocument;

/** The note as a page reads it: the prose of the locale asked for, and the two facts
 *  that are the same in every one. */
export interface LocalisedSiteRelease extends SiteReleaseProse {
  readonly tag: string;
  readonly date: string;
}

export function siteReleaseIn(locale: Locale): LocalisedSiteRelease | null {
  if (siteRelease.latest === null) {
    return null;
  }

  return { tag: siteRelease.latest.tag, date: siteRelease.latest.date, ...siteRelease.latest.locales[locale] };
}

/** The previous releases, in the locale asked for — the "previous releases" section's cards. */
export function previousSiteReleasesIn(locale: Locale): readonly LocalisedSiteRelease[] {
  return siteRelease.previous.map((release) => ({ tag: release.tag, date: release.date, ...release.locales[locale] }));
}

/** Where a release of this repository is read on GitHub, anchored on that release's own
 *  entry in the releases list. */
export function releaseUrl(tag: string): string {
  return `${site.siteRepository}/releases#release-${tag}`;
}

/** Where the full releases list is read on GitHub. */
export function releasesListUrl(): string {
  return `${site.siteRepository}/releases`;
}
