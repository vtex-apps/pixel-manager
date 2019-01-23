import React, { Component } from 'react'
import { RuntimeContext, withRuntimeContext } from 'vtex.render-runtime'

import { ContextType, Pixel, PixelData } from './PixelContext'

interface Props {
  pixel: string
  runtime: RuntimeContext
}

// internal: the apps bellow need special
// access and are trusted.
const WHITELIST = [
  'vtex.request-capture-app',
]

class PixelIFrame extends Component<Props & ContextType> {
  private frame: React.RefObject<HTMLIFrameElement> = React.createRef()
  private unsubscribe?: () => void

  private pixelEventHandler = (event: string) => (data: PixelData) => {
    if (this.frame.current === null || this.frame.current.contentWindow === null) {
      return
    }

    const { runtime: { culture: { currency } } } = this.props

    const eventName = `vtex:${event}`

    const eventData = {
      currency,
      eventName,
      ...data,
    }

    this.sendEvent(this.frame.current.contentWindow, eventData)
  }

  /* tslint:disable member-ordering */
  public homeView = this.pixelEventHandler('homeView')
  public productView = this.pixelEventHandler('productView')
  public categoryView = this.pixelEventHandler('categoryView')
  public departmentView = this.pixelEventHandler('departmentView')
  public internalSiteSearchView = this.pixelEventHandler('internalSiteSearchView')
  public otherView = this.pixelEventHandler('otherView')
  public pageInfo = this.pixelEventHandler('pageInfo')
  public pageView = this.pixelEventHandler('pageView')
  public addToCart = this.pixelEventHandler('addToCart')
  public removeFromCart = this.pixelEventHandler('removeFromCart')

  public componentDidMount() {
    this.unsubscribe = this.props.subscribe(this)
  }

  public componentWillUnmount() {
    if (!this.unsubscribe) {
      return
    }

    this.unsubscribe()
  }

  public shouldComponentUpdate(prevProps: Props) {
    return prevProps.pixel !== this.props.pixel
  }

  public render() {
    const { pixel } = this.props
    const [appName] = pixel.split('@')

    return (
      <iframe
        hidden
        sandbox={WHITELIST.includes(appName) ? undefined : 'allow-scripts'}
        src={`/tracking-frame/${pixel}`}
        ref={this.frame}
      />
    )
  }
  /* tslint:enable member-ordering */

  private sendEvent = (frameWindow: Window, data: PixelData) => {
    frameWindow.postMessage(data, '*')
  }
}

export default Pixel(withRuntimeContext(PixelIFrame))
