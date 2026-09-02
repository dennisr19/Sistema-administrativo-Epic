import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache"
import kvTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache"

/**
 * Sin estos dos overrides, `unstable_cache` y `revalidateTag` no persisten
 * nada en Cloudflare: el Data Cache de Next necesita un backend real detrás.
 *
 * Los dos usan el mismo namespace (`epic-cache`). Ambos prefijan sus llaves
 * con el buildId, y al incremental se le da además su propio prefijo por
 * `NEXT_INC_CACHE_KV_PREFIX`, así que no se pisan.
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: kvTagCache,
})
