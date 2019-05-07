import installedPixelsQuery from './installedPixelsQuery.gql'
import { DataProps, graphql } from 'react-apollo'


interface Data {
  installedPixels: string[]
}

export type PixelsDataProps = DataProps<Data, {}>

const withInstalledPixels = graphql<{}, Data>(installedPixelsQuery)

export default withInstalledPixels
