import React, { memo, useRef, useEffect, useState, useCallback } from 'react'
import { useRuntime } from 'vtex.render-runtime'
import { PixelData, usePixel } from './PixelContext'
import sendEvent from './modules/sendEvent'

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

function enhanceEvent(event: PixelData, currency: string) {
  return {
    currency,
    eventName: `vtex:${event.event}`,
    ...event,
  }
}

function enhanceFirstEvents(firstEvents: PixelData[], currency: string) {
  return firstEvents.map(e => enhanceEvent(e, currency))
}

function useMessageEvents(listener: (e: MessageEvent) => void) {
  useEffect(() => {
    window.addEventListener('message', listener, false)

    return () => {
      window.removeEventListener('message', listener)
    }
  }, [listener])
}

const PixelIFrame: React.FunctionComponent<Props> = ({ pixel }) => {
  const frame = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setLoadComplete] = useState(false)
  const pastEventsRef = useRef<PixelData[]>([])

  const {
    culture: { currency },
    account,
    workspace,
  } = useRuntime()
  const { subscribe, getFirstEvents } = usePixel()

  const [appName] = pixel.split('@')

  const onLoad = useCallback(() => {
    setLoadComplete(true)

    // If the effect already ran, we use ref, otherwise we use `getFirstEvents`
    const lostEvents =
      pastEventsRef.current.length > 0
        ? pastEventsRef.current
        : enhanceFirstEvents(getFirstEvents(), currency)

    lostEvents.forEach(event => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      sendEvent(frame.current!.contentWindow!, event)
    })
  }, [currency, getFirstEvents, setLoadComplete])

  const listenMessage = useCallback(
    (message: MessageEvent) => {
      const sameFrame =
        frame.current && frame.current.contentWindow === message.source
      const samePixel =
        message.data &&
        message.data.indexOf &&
        message.data.indexOf('pixel:ready:' + pixel) === 0

      if (sameFrame && samePixel) {
        onLoad()
      }
    },
    [pixel, onLoad]
  )

  useMessageEvents(listenMessage)

  useEffect(() => {
    const pixelEventHandler = (event: PixelData) => {
      const eventData = enhanceEvent(event, currency)

      if (!isLoaded) {
        // In case it's the first time filling this ref, get the lost events
        // until now from `getFirstEvents`
        if (pastEventsRef.current.length === 0) {
          pastEventsRef.current = [
            ...enhanceFirstEvents(getFirstEvents(), currency),
          ]
        }
        pastEventsRef.current = [...pastEventsRef.current, eventData]

        return
      }

      if (frame.current == null || frame.current.contentWindow === null) {
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
      productImpression: pixelEventHandler,
      removeFromCart: pixelEventHandler,
    })

    return () => unsubscribe()
  }, [currency, pixel, subscribe, isLoaded, getFirstEvents])

  return (
    <iframe
      title={pixel}
      hidden
      {...(isWhitelisted(appName, account)
        ? { sandbox: 'allow-scripts allow-same-origin' }
        : {})}
      src={`https://${workspace}--${account}.myvtex.com/_v/public/tracking-frame/${pixel}`}
      ref={frame}
    />
  )
}

const areEqual = (prevProps: Props, props: Props) =>
  prevProps.pixel === props.pixel

export default memo(PixelIFrame, areEqual)
