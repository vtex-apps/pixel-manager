import {Apps, LRUCache, Registry} from '@vtex/api'

const MAX_ELEMS = 1000
const RESPONSE_CACHE_TTL_MS = 60 * 60 * 1000
const LONG_TIMEOUT = 20 * 1000

const cacheStorage = new LRUCache<string, any>({
  max: MAX_ELEMS,
  maxAge: RESPONSE_CACHE_TTL_MS,
})

export default class Resources {
  public apps: Apps
  public registry: Registry

  constructor(ctx: StoreContext) {
    const opts = {cacheStorage}
    const withLongTimeout = {...opts, timeout: LONG_TIMEOUT}

    this.apps = new Apps(ctx.vtex, withLongTimeout)
    this.registry = new Registry(ctx.vtex, withLongTimeout)
  }
}
