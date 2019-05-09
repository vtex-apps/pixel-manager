import React, { memo, useRef, useEffect, useState } from 'react'
import { useRuntime } from 'vtex.render-runtime'
import { PixelData, usePixel } from './PixelContext'

interface Props {
  pixel: string
}

// internal: the apps bellow need special
// access and are trusted.
const WHITELIST = [
  'vtex.request-capture',
  'gocommerce.google-analytics',
  'vtex.google-analytics',
]

const ACCOUNT_WHITELIST = ['boticario']

const isWhitelisted = (app: string, accountName: string): boolean => {
  return WHITELIST.includes(app) || ACCOUNT_WHITELIST.includes(accountName)
}

const sendEvent = (frameWindow: Window, data: PixelData) => {
  frameWindow.postMessage(data, '*')
}

function enhanceEvent(event: PixelData, currency: string) {
  return {
    currency,
    eventName: `vtex:${event.event}`,
    ...event,
  }
}

const PixelIFrame: React.FunctionComponent<Props> = ({ pixel }) => {
  const frame = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setLoadComplete] = useState(false)
  const pastEventsRef = useRef<PixelData[]>([])

  const {
    culture: { currency },
    account,
  } = useRuntime()
  const { subscribe, getFirstEvents } = usePixel()

  const onLoad = () => {
    setLoadComplete(true)

    // If the effect already ran, we use ref, otherwise we use `getFirstEvents`
    const lostEvents =
      pastEventsRef.current && pastEventsRef.current.length > 0
        ? pastEventsRef.current
        : getFirstEvents().map(event => enhanceEvent(event, currency))

    lostEvents.forEach(event => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      sendEvent(frame.current!.contentWindow!, event)
    })
  }

  useEffect(() => {
    const pixelEventHandler = (event: PixelData) => {
      const eventData = enhanceEvent(event, currency)

      if (!isLoaded) {
        // In case it's the first time filling this ref, get the lost events
        // until now from `getFirstEvents`
        if (!pastEventsRef.current) {
          pastEventsRef.current = [getFirstEvents()]
        }
        pastEventsRef.current = [...pastEventsRef.current, eventData]
        return
      }

      if (frame.current === null || frame.current.contentWindow === null) {
        return
      }

      sendEvent(frame.current.contentWindow, eventData)
    }

    const unsubscribe = subscribe({
      addToCart: pixelEventHandler,
      categoryView: pixelEventHandler,
      departmentView: pixelEventHandler,
      homeView: pixelEventHandler,
      internalSiteSearchView: pixelEventHandler,
      otherView: pixelEventHandler,
      orderPlaced: pixelEventHandler,
      pageComponentInteraction: pixelEventHandler,
      pageInfo: pixelEventHandler,
      pageView: pixelEventHandler,
      productClick: pixelEventHandler,
      productView: pixelEventHandler,
      removeFromCart: pixelEventHandler,
    })

    return () => unsubscribe()
  }, [currency, pixel, subscribe, isLoaded, getFirstEvents])

  const [appName] = pixel.split('@')

  return (
    <iframe
      title={pixel}
      hidden
      onLoad={onLoad}
      sandbox={isWhitelisted(appName, account) ? undefined : 'allow-scripts'}
      src={`/_v/public/tracking-frame/${pixel}`}
      ref={frame}
    />
  )
}

const areEqual = (prevProps: Props, props: Props) =>
  prevProps.pixel === props.pixel

export default memo(PixelIFrame, areEqual)
