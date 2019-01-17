import { Apps, LRUCache } from '@vtex/api'

import { getAppMajor } from '../utils/conf'

const RESPONSE_CACHE_TTL_MS = 60 * 60 * 1000
const LONG_TIMEOUT = 20 * 1000

const cacheStorage = new LRUCache<string, any>({
  max: 200,
  maxAge: RESPONSE_CACHE_TTL_MS,
})

// This exists because we use the apps who depend on us
// to figure out who to add to the page inside an iframe,
// but the apps bellow also depends on this app and we
// don't want to package them inside an iframe too, so
// this whitelist is used to decide who won't be.
const APP_WHITELIST = [
  'vtex.store',
  'vtex.store-components',
]

export const queries = {
  installedPixels: async (_, __, { vtex }) => {
    const opts = {cacheStorage}
    const withLongTimeout = {...opts, timeout: LONG_TIMEOUT}

    const apps = new Apps(vtex, withLongTimeout)

    const deps = await apps.getDependencies(`vtex.pixel-manager@${getAppMajor()}.x`)

    return Object.keys(deps).filter(appId => !APP_WHITELIST.includes(appId.split('@')[0]))
  },
}
