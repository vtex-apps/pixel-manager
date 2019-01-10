import React, { Component } from 'react'
import { RuntimeContext, withRuntimeContext } from 'render'

import { ContextType, Pixel, PixelData, Subscriber } from './PixelContext'

interface Props {
  pixel: string
  runtime: RuntimeContext
}

interface State {
  eventQueue: PixelData[]
}

class PixelIFrame extends Component<Props & ContextType, State> {
  public state = {
    eventQueue: [],
  }

  private frame: React.RefObject<HTMLIFrameElement> = React.createRef()
  private unsubscribe?: () => void
  private sendingEvents = false

  public pixelEventHandler = (event: string) => (data: PixelData) => {
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

    if (navigator.onLine) {
      if (this.state.eventQueue.length > 0) {
        this.sendQueuedEvents()
      }

      this.sendEvent(this.frame.current.contentWindow, eventData)
    } else {
      this.setState(state => ({
        eventQueue: [
          ...state.eventQueue,
          eventData,
        ],
      }))
    }
  }

  public sendQueuedEvents = () => {
    if (this.sendingEvents) {
      return
    }

    this.sendingEvents = true

    this.state.eventQueue.forEach(
      queuedEvent => this.sendEvent(this.frame.current!.contentWindow!, queuedEvent)
    )

    this.setState({
      eventQueue: [],
    }, () => this.sendingEvents = false)
  }

  public handleOnlineStatus = () => {
    if (!this.state.eventQueue.length) {
      return
    }

    this.sendQueuedEvents()
  }

  /* tslint:disable member-ordering */
  public productView = this.pixelEventHandler('productView')
  public categoryView = this.pixelEventHandler('categoryView')
  public departmentView = this.pixelEventHandler('departmentView')
  public internalSiteSearchView = this.pixelEventHandler('internalSiteSearchView')
  public otherView = this.pixelEventHandler('otherView')
  public pageInfo = this.pixelEventHandler('pageInfo')
  public pageView = this.pixelEventHandler('pageView')
  /* tslint:enable member-ordering */

  public componentDidMount() {
    this.unsubscribe = this.props.subscribe(this)

    window.addEventListener('online', this.handleOnlineStatus)
  }

  public componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus)

    if (!this.unsubscribe) {
      return
    }

    this.unsubscribe()
  }

  public shouldComponentUpdate(prevProps: Props) {
    return prevProps.pixel !== this.props.pixel
  }

  public render() {
    return (
      <iframe
        hidden
        sandbox="allow-scripts"
        src={`/tracking-frame/${this.props.pixel}`}
        ref={this.frame}
      />
    )
  }

  private sendEvent = (frameWindow: Window, data: PixelData) => {
    frameWindow.postMessage(data, '*')
  }
}

export default Pixel(withRuntimeContext(PixelIFrame))
