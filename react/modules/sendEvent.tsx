import { PixelData } from '../PixelContext'

interface PixelCommunication {
  event: 'pixel:listening'
}

const sendEvent = (frameWindow: Window, data: PixelData | PixelCommunication) => {
  frameWindow.postMessage(data, '*')
}

export default sendEvent
