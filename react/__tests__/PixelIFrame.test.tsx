/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react'
import { render, fireEvent } from '@vtex/test-tools/react'

import PixelIFrame from '../PixelIFrame'
import sendEvent from '../modules/sendEvent'

const sendEventMock = sendEvent as jest.Mock

jest.mock('../modules/sendEvent', () => jest.fn())

jest.mock('../PixelContext', () => {
  let __subscribers: any[] = []
  let __firstEvents: any[] = []

  const pixel = {
    subscribe: jest.fn(fn => {
      __subscribers.push(fn)
      return () => {
        __subscribers = __subscribers.filter(sub => sub !== fn)
      }
    }),
    getFirstEvents: jest.fn(() => __firstEvents),
  }

  return {
    __clear: () => {
      __subscribers = []
      __firstEvents = []
    },
    __pushEvent: (event: { event: string }) => {
      __subscribers.forEach(fn => fn[event.event](event))
      __firstEvents.push(event)
    },
    usePixel: () => pixel,
  }
})

const getEventArgument = (callArgs: any[]) => callArgs[1]

const renderComponent = () => {
  const pixelName = 'vtex.pixel-name'
  const helpers = render(<PixelIFrame pixel={pixelName} />)

  const iframe = helpers.getByTitle(pixelName)

  return { ...helpers, pixelName, iframe }
}

beforeEach(() => {
  sendEventMock.mockClear()
  const { __clear, usePixel } = require('../PixelContext')
  const { subscribe, getFirstEvents } = usePixel()
  __clear()
  subscribe.mockClear()
  getFirstEvents.mockClear()
})

test('should subscribe', () => {
  const { usePixel } = require('../PixelContext')
  const { subscribe: subscribeMock } = usePixel()

  renderComponent()

  expect(subscribeMock).toHaveBeenCalledTimes(1)
  expect(subscribeMock).toHaveBeenCalledWith(
    expect.objectContaining({
      addToCart: expect.any(Function),
      categoryView: expect.any(Function),
      departmentView: expect.any(Function),
      homeView: expect.any(Function),
      internalSiteSearchView: expect.any(Function),
      otherView: expect.any(Function),
      orderPlaced: expect.any(Function),
      pageComponentInteraction: expect.any(Function),
      pageInfo: expect.any(Function),
      pageView: expect.any(Function),
      productClick: expect.any(Function),
      productView: expect.any(Function),
      removeFromCart: expect.any(Function),
    })
  )
})

test('should unsubscribe', async () => {
  const { usePixel } = require('../PixelContext')
  const { subscribe: subscribeMock } = usePixel()

  const unsubscribeMock = jest.fn()

  subscribeMock.mockImplementationOnce(() => unsubscribeMock)

  const { unmount } = renderComponent()

  unmount()

  expect(unsubscribeMock).toHaveBeenCalledTimes(1)
})

test('should trigger past first events triggered before rendering on load', () => {
  const { __pushEvent } = require('../PixelContext')

  __pushEvent({ event: 'pageView' })

  const { iframe } = renderComponent()

  expect(sendEventMock.mock.calls).toHaveLength(0)

  fireEvent.load(iframe)

  const event = getEventArgument(sendEventMock.mock.calls[0])

  expect(event).toMatchObject({
    currency: 'BRL',
    event: 'pageView',
    eventName: 'vtex:pageView',
  })
})

test('should trigger past first events triggered after subscribing but before on load', () => {
  const { __pushEvent, usePixel } = require('../PixelContext')
  const { subscribe: subscribeMock } = usePixel()

  const { iframe } = renderComponent()

  expect(subscribeMock).toHaveBeenCalledTimes(1)
  expect(sendEventMock).toHaveBeenCalledTimes(0)

  __pushEvent({ event: 'pageView' })

  fireEvent.load(iframe)

  const event = getEventArgument(sendEventMock.mock.calls[0])

  expect(event).toMatchObject({
    currency: 'BRL',
    event: 'pageView',
    eventName: 'vtex:pageView',
  })
})

test('should trigger events subscribed and past first events', () => {
  const { __pushEvent } = require('../PixelContext')

  __pushEvent({ event: 'pageView' })

  const { iframe } = renderComponent()

  __pushEvent({ event: 'pageInfo', data: 'baz' })

  expect(sendEventMock).toHaveBeenCalledTimes(0)

  fireEvent.load(iframe)

  __pushEvent({ event: 'orderPlaced', data: 'foo' })

  expect(sendEventMock).toHaveBeenCalledTimes(3)
  expect(getEventArgument(sendEventMock.mock.calls[0]).event).toBe('pageView')
  expect(getEventArgument(sendEventMock.mock.calls[1]).event).toBe('pageInfo')
  expect(getEventArgument(sendEventMock.mock.calls[2]).event).toBe(
    'orderPlaced'
  )
})

test('should not trigger duplicate events', () => {
  const { __pushEvent } = require('../PixelContext')
  const { iframe } = renderComponent()

  __pushEvent({ event: 'pageView' })

  expect(sendEventMock).toHaveBeenCalledTimes(0)

  fireEvent.load(iframe)

  __pushEvent({ event: 'orderPlaced', data: 'foo' })

  expect(sendEventMock).toHaveBeenCalledTimes(2)
  expect(getEventArgument(sendEventMock.mock.calls[0]).event).toBe('pageView')
  expect(getEventArgument(sendEventMock.mock.calls[1]).event).toBe(
    'orderPlaced'
  )
})