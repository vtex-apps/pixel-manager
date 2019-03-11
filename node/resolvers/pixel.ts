import { nth, zip } from 'ramda'
import { Apps, LRUCache } from '@vtex/api'

import { getAppMajor } from '../utils/conf'

const RESPONSE_CACHE_TTL_MS = 60 * 60 * 1000
const LONG_TIMEOUT = 20 * 1000

const cacheStorage = new LRUCache<string, any>({
  max: 200,
  maxAge: RESPONSE_CACHE_TTL_MS,
})

export const queries = {
  installedPixels: async (_, __, { vtex }) => {
    const opts = { cacheStorage }
    const withLongTimeout = { ...opts, timeout: LONG_TIMEOUT }

    const apps = new Apps(vtex, withLongTimeout)

    const deps = await apps.getDependencies(
      `vtex.pixel-manager@${getAppMajor()}.x`
    )
    const manifests = await Promise.all(
      Object.keys(deps).map(appId => apps.getApp(appId))
    )

    return Promise.all(
      zip(Object.keys(deps), manifests)
        .filter(
          ([_, manifest]) =>
            manifest.policies &&
            manifest.policies.findIndex(({ name }) => name === 'pixel') !== -1
        )
        .map(nth(0))
    )
  },
}
