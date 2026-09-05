import { createHash } from 'node:crypto';

import sharp from 'sharp';
import { baseService } from 'astro/assets';
import sharpService from 'astro/assets/services/sharp';

/**
 * Astro's own sharp service, with the encoder that produced the bytes folded
 * into the asset's hash.
 *
 * ## Why this file exists
 *
 * A hashed `/_astro/` filename is a promise — change the bytes and you change
 * the name — and `public/_headers` cashes that promise for a year with
 * `immutable`. Astro hashes `{ service entrypoint, src, width, height, format,
 * quality, fit, position, background }` and pointedly *not*
 * `image.service.config`, which is exactly where this site's encoder settings
 * live (they have to: `<Picture>`'s own `quality` prop is one number for every
 * format at once, and "good AVIF" and "good JPEG" are not the same number).
 *
 * So the promise was false, and demonstrably so. Dropping `avif.quality` from
 * 62 to 40 and rebuilding produced `banner.BhOC3dsZ_Z1g0yHd.avif` at 123,707
 * bytes where it had been 265,546: same URL, different image. Every visitor
 * already holding that URL would have kept the old one for up to a year, with
 * nothing on the site able to tell them otherwise. A sharp or libvips upgrade
 * that encodes the same options differently falls through the same hole.
 *
 * Rather than weaken the caching — the revalidation would be paid on every
 * request forever to cover an encoder change that happens approximately never
 * — this makes the name tell the truth, so `immutable` is simply honest.
 *
 * ## What is hashed
 *
 * Both halves of "which encoder produced these bytes": the settings
 * (`image.service.config`) and the implementation (every version sharp
 * reports, its own and the libraries under it). The implementation half is
 * taken whole rather than narrowed to the codecs in use — over-invalidating on
 * an unrelated bump costs one cold fetch of an image, while under-invalidating
 * costs a year of a stale one, and only one of those is worth being clever
 * about.
 */
const ENCODER_PROPERTY = 'encoder';

/** Key order must not change the digest, so sort all the way down. */
function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'undefined';
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
    .join(',')}}`;
}

/** Astro re-reads this for every transform, so it is worth computing once. */
let revision;

function encoderRevision(imageConfig) {
  revision ??= createHash('sha256')
    .update(stable({ settings: imageConfig.service.config ?? {}, versions: sharp.versions }))
    .digest('hex')
    .slice(0, 12);
  return revision;
}

export default {
  ...sharpService,

  // Astro's own list plus ours, read from `baseService` rather than copied, so
  // a property a future Astro adds to it is picked up here too instead of
  // quietly dropping out of the hash.
  propertiesToHash: [...baseService.propertiesToHash, ENCODER_PROPERTY],

  async validateOptions(options, imageConfig) {
    const validated = await sharpService.validateOptions(options, imageConfig);

    // `getSrcSet` spreads every property it does not name onto each width's
    // transform, so setting this once here carries it across the whole ladder.
    return { ...validated, [ENCODER_PROPERTY]: encoderRevision(imageConfig) };
  },
};
