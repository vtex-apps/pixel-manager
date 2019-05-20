import { PixelData } from '../PixelContext'

interface PixelCommunication {
  event: 'pixel:listening'
  pixel: string
}

const sendEvent = (
  frameWindow: Window,
  data: PixelData | PixelCommunication
) => {
  frameWindow.postMessage(data, '*')
}

export default sendEvent
