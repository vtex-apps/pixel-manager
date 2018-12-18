import React, { Fragment } from 'react'
import { DataProps, graphql } from 'react-apollo'

import PixelIframe from './PixelIframe'
import installedPixelsQuery from './queries/installedPixelsQuery.gql'

interface Response {
  installedPixels: string[]
}

type Props = DataProps<Response>

const PixelManager: React.SFC<Props> = ({ data: { loading, installedPixels } }) => {
  if (loading || !installedPixels) {
    return null
  }

  return (
    <Fragment>
      {installedPixels.map(pixel => <PixelIframe key={pixel} pixel={pixel} />)}
    </Fragment>
  )
}

export default graphql<Props>(installedPixelsQuery)(PixelManager)
