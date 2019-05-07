import { html } from '../templates'
import { ServiceContext } from '@vtex/api'

const LINKED_BASE_PATH = '/_v/private/assets/v1/linked'
const PUBLISHED_BASE_PATH = '/_v/public/assets/v1/published'

const CACHE_2_MINUTES = 2 * 60

const pixelFrame = async (ctx: ServiceContext, next: () => Promise<any>) => {
  const apps = ctx.clients.apps
  const appId = ctx.vtex.route.params.appId as string

  const manifest = await apps.getApp(appId)

  const appFiles = await apps.listAppFiles(appId, { prefix: 'public' })
  const settings = await apps.getAppSettings(appId)

  const isLinked = manifest.version.includes('+build')
  const basePath = isLinked ? LINKED_BASE_PATH : PUBLISHED_BASE_PATH

  const scripts = appFiles.data
    .map(file => file.path)
    .filter(path => path.startsWith('public/react') && !path.endsWith('map'))
    .filter(path => !/\.min\.js$/.test(path))
    .map(path => `${basePath}/${appId}/${path}`)

  ctx.status = 200
  if (!isLinked) {
    ctx.set('Cache-Control', `public, max-age=${CACHE_2_MINUTES}`)
  }
  ctx.body = html({ scripts, settings })

  await next()
}

export default pixelFrame
