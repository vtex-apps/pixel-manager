import React, { memo, useRef, useEffect } from 'react'
import { useRuntime } from 'vtex.render-runtime'

import { PixelData, usePixel } from './PixelContext'

interface Props {
  pixel: string
}

// internal: the apps bellow need special
// access and are trusted.
const WHITELIST = [
  'vtex.request-capture',
]

const sendEvent = (frameWindow: Window, data: PixelData) => {
  frameWindow.postMessage(data, '*')
}

const PixelIFrame: React.FunctionComponent<Props> = ({ pixel }) => {
  const frame: React.RefObject<HTMLIFrameElement> = useRef(null)

  const runtime = useRuntime()
  const { subscribe } = usePixel()

  const pixelEventHandler = (event: string) => (data: PixelData) => {
    if (frame.current === null || frame.current.contentWindow === null) {
      return
    }

    const { culture: { currency } } = runtime

    const eventName = `vtex:${event}`

    const eventData = {
      currency,
      eventName,
      ...data,
    }

    sendEvent(frame.current.contentWindow, eventData)
  }

  useEffect(() => {
    const unsubscribe = subscribe({
      addToCart: pixelEventHandler('addToCart'),
      categoryView: pixelEventHandler('categoryView'),
      departmentView: pixelEventHandler('departmentView'),
      homeView: pixelEventHandler('homeView'),
      internalSiteSearchView: pixelEventHandler('internalSiteSearchView'),
      otherView: pixelEventHandler('otherView'),
      pageInfo: pixelEventHandler('pageInfo'),
      pageView: pixelEventHandler('pageView'),
      productView: pixelEventHandler('productView'),
      removeFromCart: pixelEventHandler('removeFromCart'),
    })

    return () => unsubscribe()
  }, [runtime.culture.currency, pixel])

  const [appName] = pixel.split('@')

  return (
    <iframe
      hidden
      sandbox={WHITELIST.includes(appName) ? undefined : 'allow-scripts'}
      src={`/tracking-frame/${pixel}`}
      ref={frame}
    />
  )
}

const areEqual = (prevProps: Props, props: Props) =>
  prevProps.pixel === props.pixel

export default memo(PixelIFrame, areEqual)
