import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { withRuntimeContext } from 'render'

import PixelIframe from './PixelIframe'

interface Props {
  runtime: {
    extensions: {
      [ext: string]: {
        component: string
        declarer: string
      }
    }
  }
}

const PixelManager: React.SFC<Props> = ({ runtime: { extensions } }) => {
  const pixels = Object.entries(extensions)
    .filter(([extensionName]) => extensionName.startsWith('store/pixel/'))
    .map(([_, ext]) => ext.declarer)

  return (
    <Fragment>
      {pixels.map(pixel => (
        <PixelIframe
          key={pixel}
          pixel={pixel}
        />
      ))}
    </Fragment>
  )
}

export default withRuntimeContext(PixelManager)
