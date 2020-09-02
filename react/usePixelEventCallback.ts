import { useEffect, useRef } from 'react'

const usePixelEventCallback = (
  eventId: string | undefined,
  handler: (e: MessageEvent) => void
) => {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = Boolean(window?.addEventListener)

    if (!isSupported || !eventId) {
      return
    }

    const customEventHandler = (e: MessageEvent) => {
      if (e.data.id === eventId) {
        savedHandler.current(e)
      }
    }

    window.addEventListener('message', customEventHandler)

    return () => {
      window.removeEventListener('message', customEventHandler)
    }
  }, [eventId, savedHandler])
}

export default usePixelEventCallback
