import { queries as pixelQueries } from './pixel'

export const resolvers = {
  Query: {
    ...pixelQueries,
  },
}
