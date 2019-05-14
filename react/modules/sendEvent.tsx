import { PixelData } from '../PixelContext'

const sendEvent = (frameWindow: Window, data: PixelData) => {
  frameWindow.postMessage(data, '*')
}

export default sendEvent
