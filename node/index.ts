import { AppMetaInfo, isLinkedApp, LRUCache, Service } from '@vtex/api'
import { difference, filter, isEmpty, keys } from 'ramda'

const LINKED_BASE_PATH = '/_v/private/assets/v1/linked'
const PUBLISHED_BASE_PATH = '/_v/public/assets/v1/published'
const {VTEX_APP_VENDOR, VTEX_APP_NAME, VTEX_APP_VERSION} = process.env
const [MAJOR] = VTEX_APP_VERSION!.split('.')
const APP_AT_MAJOR = `${VTEX_APP_VENDOR}.${VTEX_APP_NAME}@${MAJOR}` // e.g. vtex.pixel-manager@0
const REQUIRED_DEPS = [
  'vtex.render-runtime',
  'vtex.render-server',
  `${VTEX_APP_VENDOR}.${VTEX_APP_NAME}`,
]
const CACHE_2_MINUTES = 2 * 60
const cacheStorage = new LRUCache<string, any>({
  max: 5000,
})
metrics.trackCache('apps', cacheStorage)

const getFilteredPixelDependencies = (appAtMajor: string, deps: AppMetaInfo[]) => {
  return filter((app: AppMetaInfo) => {
    const [name, major] = appAtMajor.split('@')
    const version = app._resolvedDependencies[name]
    if (!version) {
      return false
    }

    // Must be installed in root
    if (!app._isRoot) {
      return false
    }

    // Checks it depends exactly on pixel manager and render. In the future, we will have a different dimension than the generic `depends`, which is insufficient here.
    if (!isEmpty(difference(keys(app._resolvedDependencies), REQUIRED_DEPS))) {
      return false
    }

    const [depMajor] = version.split('.')
    return major === depMajor
  }, deps)
}

export default new Service({
  clients: {
    options: {
      apps: {
        memoryCache: cacheStorage,
      },
      default: {
        retries: 2,
        timeout: 2000,
      },
    },
  },
  routes: {
    pixels: async (ctx) => {
      const {clients: {apps}, vtex: {production}} = ctx

      const allApps = await apps.getAppsMetaInfos()
      const pixelApps = getFilteredPixelDependencies(APP_AT_MAJOR, allApps)
      const settings: Record<string, any> = {}
      const scripts: string[] = []
      let hasLinkedPixels = false

      await Promise.all(pixelApps.map((app: AppMetaInfo) => {
        return apps.getAppSettings(app.id).then((appSettings) => {
          const isLinkedPixel = isLinkedApp(app)
          const [appIdWithoutBuild] = app.id.split('+build')

          if (isLinkedPixel) {
            hasLinkedPixels = true
          }

          // Add settings
          settings[appIdWithoutBuild] = appSettings

          // Add scripts
          const basePath = isLinkedPixel ? LINKED_BASE_PATH : PUBLISHED_BASE_PATH
          scripts.push(`${basePath}/${appIdWithoutBuild}/public/react/index${production ? '.min' : ''}.js`)
        })
      }))

      const isLinked = !!process.env.VTEX_APP_LINK
      if (hasLinkedPixels || isLinked) {
        ctx.set('Cache-Control', `private, no-cache, no-store`)
      } else {
        ctx.set('Cache-Control', `public, max-age=${CACHE_2_MINUTES}`)
      }

      ctx.status = 200
      ctx.body = {
        scripts,
        settings,
      }
    },
  },
})
