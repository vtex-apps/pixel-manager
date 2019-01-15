import { Apps, LRUCache } from '@vtex/api'

import { getAppMajor } from '../utils/conf'

const RESPONSE_CACHE_TTL_MS = 60 * 60 * 1000
const LONG_TIMEOUT = 20 * 1000

const cacheStorage = new LRUCache<string, any>({
  max: 200,
  maxAge: RESPONSE_CACHE_TTL_MS,
})

const APP_WHITELIST = [
  'vtex.store',
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
