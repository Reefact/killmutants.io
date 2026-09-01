/**
 * What this build is: the release it belongs to, the commit it came from, and when it
 * was made. Written by scripts/generate-version.sh before the site is built, imported
 * here rather than fetched — the /version page and this file describe the same build.
 */
import versionDocument from './generated/version.json';
import { site } from './site';

export interface Version {
  /** The `release/*` tag this build belongs to, or null when it belongs to none. */
  readonly release: string | null;
  /** The full commit sha, or null where the build had no git metadata to read. */
  readonly commit: string | null;
  /** When the build ran, UTC, to the second. */
  readonly built: string;
}

export const version: Version = versionDocument as Version;

/** Where a commit of this repository is read on GitHub. */
export function commitUrl(commit: string): string {
  return `${site.siteRepository}/commit/${commit}`;
}

/** The first seven characters, which is how a sha is read aloud, with the whole of it
 *  kept for the reader who wants to check it. */
export function shortCommit(commit: string): string {
  return commit.slice(0, 7);
}
