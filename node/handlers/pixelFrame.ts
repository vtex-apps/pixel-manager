import { ok } from '../templates'

const LINKED_BASE_PATH = '/_v/private/assets/v1/linked'
const PUBLISHED_BASE_PATH = '/_v/public/assets/v1/published'

const pixelFrame = async (ctx: StoreContext) => {
  const {
    vtex: {
      route: {
        params: { appId },
      },
    },
    resources: { apps },
  } = ctx

  const [appName] = appId.split('@')
  const manifest = await apps.getApp(appId)

  const appFiles = await apps.listAppFiles(appName, { prefix: 'public' })
  const settings = await apps.getAppSettings(appId)

  const isLinked = manifest.version.includes('+build')
  const basePath = isLinked ? LINKED_BASE_PATH : PUBLISHED_BASE_PATH

  const scripts = appFiles
    .data
    .map(file => file.path)
    .filter(path => path.startsWith('public/react') && !path.endsWith('map'))
    .map(path => `${basePath}/${appId}/${path}`)

  ctx.body = ok({ scripts, settings })
}

export default pixelFrame
