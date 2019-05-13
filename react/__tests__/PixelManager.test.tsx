import React from 'react'
import { render, wait } from '@vtex/test-tools/react'

import PixelManager from '../PixelManager'
import installedPixelsQuery from '../queries/installedPixelsQuery.gql'

describe('<PixelManager />', () => {
  it('should render 2 iframes', async () => {
    const mocks = [
      {
        request: {
          query: installedPixelsQuery,
        },
        result: {
          data: {
            installedPixels: [
              'vtex.facebook-pixel@1.0.2',
              'vtex.google-tag-manager@1.0.0',
            ],
          },
        },
      },
    ]

    const { getByTitle } = render(<PixelManager />, {
      graphql: { mocks },
    })

    await wait(() => true)

    expect(getByTitle(mocks[0].result.data.installedPixels[0])).toBeDefined()
    expect(getByTitle(mocks[0].result.data.installedPixels[1])).toBeDefined()
  })
})
