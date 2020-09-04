import { useEffect, useRef } from 'react'

import { PixelData } from './PixelContext'

export const shouldCallEventHandler = (
  pixelEventData: PixelData,
  eventId: string | undefined,
  eventName: PixelData['event']
) => {
  const receivedEventId = Boolean(eventId)
  const receivedEventName = Boolean(eventName)
  const eventHasId = Boolean(pixelEventData.id)
  const eventHasName = Boolean(pixelEventData.event)

  let result = false

  // These checks are to make sure that handlers are only called when
  // both the 'eventId' (if received) and the 'eventName' (if received)
  // match the event being processed.
  // If any of those arguments were NOT received, only the one that was
  // received should be taken into account.
  if (receivedEventId && eventHasId && pixelEventData.id === eventId) {
    result =
      !receivedEventName || (eventHasName && pixelEventData.event === eventName)
  } else if (
    receivedEventName &&
    eventHasName &&
    pixelEventData.event === eventName
  ) {
    result = !receivedEventId || (eventHasId && pixelEventData.id === eventId)
  }

  return result
}

const usePixelEventCallback = ({
  eventId,
  eventName,
  handler,
}: {
  eventId?: string
  eventName?: PixelData['event']
  handler: (e?: MessageEvent) => void
}) => {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = Boolean(window?.addEventListener)

    if (!isSupported || (!eventId && !eventName)) {
      return
    }

    const customEventHandler = (e: MessageEvent) => {
      const pixelEventData = e.data as PixelData

      if (shouldCallEventHandler(pixelEventData, eventId, eventName)) {
        savedHandler.current(e)
      }
    }

    window.addEventListener('message', customEventHandler)

    return () => {
      window.removeEventListener('message', customEventHandler)
    }
  }, [eventId, eventName, savedHandler])
}

export default usePixelEventCallback
