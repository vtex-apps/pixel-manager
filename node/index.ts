import { Service } from '@vtex/api'
import pixelFrame from './handlers/pixelFrame'
import { resolvers } from './resolvers'

export default new Service({
  graphql: {
    resolvers,
  },
  routes: {
    pixelFrame: [
      pixelFrame,
    ],
  }
})
