import React, { Fragment } from 'react'
import PixelIFrame from './PixelIFrame'
import withInstalledPixels, {
  PixelsDataProps,
} from './queries/withInstalledPixels'

const PixelManager: React.SFC<Partial<PixelsDataProps>> = ({ data }) => {
  if (!data || data.loading || !data.installedPixels) {
    return null
  }

  return (
    <Fragment>
      {data.installedPixels.map(pixel => (
        <PixelIFrame key={pixel} pixel={pixel} />
      ))}
    </Fragment>
  )
}

export default withInstalledPixels(PixelManager)
