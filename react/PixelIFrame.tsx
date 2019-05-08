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

const PixelIFrame: React.FunctionComponent<Props> = ({ pixel }) => {
  const frame = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setLoadComplete] = useState(false)
  const pastEventsRef = useRef<PixelData[]>([])

  const {
    culture: { currency },
    account,
  } = useRuntime()
  const { subscribe } = usePixel()

  const onLoad = () => {
    setLoadComplete(true)
    if (pastEventsRef.current && pastEventsRef.current.length > 0) {
      pastEventsRef.current.forEach(event => {
        sendEvent(frame.current!.contentWindow!, event)
      })
    }
  }

  useEffect(() => {
    const pixelEventHandler = (event: string) => (data: PixelData) => {
      const eventName = `vtex:${event}`

      const eventData = {
        currency,
        eventName,
        ...data,
      }

      if (!isLoaded) {
        pastEventsRef.current = [...pastEventsRef.current, eventData]
        return
      }

      if (frame.current === null || frame.current.contentWindow === null) {
        return
      }

      sendEvent(frame.current.contentWindow, eventData)
    }

    const unsubscribe = subscribe({
      addToCart: pixelEventHandler('addToCart'),
      categoryView: pixelEventHandler('categoryView'),
      departmentView: pixelEventHandler('departmentView'),
      homeView: pixelEventHandler('homeView'),
      internalSiteSearchView: pixelEventHandler('internalSiteSearchView'),
      otherView: pixelEventHandler('otherView'),
      orderPlaced: pixelEventHandler('orderPlaced'),
      pageComponentInteraction: pixelEventHandler('pageComponentInteraction'),
      pageInfo: pixelEventHandler('pageInfo'),
      pageView: pixelEventHandler('pageView'),
      productClick: pixelEventHandler('productClick'),
      productView: pixelEventHandler('productView'),
      removeFromCart: pixelEventHandler('removeFromCart'),
    })

    return () => unsubscribe()
  }, [currency, pixel, subscribe, isLoaded])

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
