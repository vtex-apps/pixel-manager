import { useEffect, useRef } from 'react'

import { PixelData } from './PixelContext'

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
      if (
        (e.data as PixelData).id === eventId ||
        (e.data as PixelData).event === eventName
      ) {
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
