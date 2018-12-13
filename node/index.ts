import { map } from 'ramda'

import pixelFrame from './handlers/pixelFrame'
import Resources from './resources'

const prepare = (handler: (ctx: StoreContext) => Promise<void>) => async (ctx: StoreContext) => {
  ctx.resources = new Resources(ctx)

  try {
    await handler(ctx)
  } catch (err) {
    console.error('err', err)

    if (err.code && err.message && err.status) {
      ctx.status = err.status
      ctx.body = {
        code: err.code,
        message: err.message,
      }
      return
    }

    if (err.response) {
      ctx.status = err.response.status || 500
      ctx.body = ctx.status === 404 ? 'Not Found' : err.response.data
      return
    }

    throw err
  }
}

export default {
  routes: map(prepare, {
    pixelFrame,
  })
}
