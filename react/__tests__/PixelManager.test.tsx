import { mount } from 'enzyme'
import React from 'react'
import { MockedProvider } from 'react-apollo/test-utils'
import wait from 'waait'

import PixelIFrame from '../PixelIFrame'
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

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <PixelManager />
      </MockedProvider>
    )

    await wait(0)

    wrapper.update()

    expect(wrapper.find(PixelIFrame).length).toBe(2)
    expect(wrapper.find('PixelManager')).toMatchSnapshot()
  })
})
