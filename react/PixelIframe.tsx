import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withRuntimeContext, RuntimeContext } from 'render'

import { ContextType, Pixel, PixelData, Subscriber } from './PixelContext'

interface Props {
  pixel: string
  runtime: RuntimeContext
}

class PixelIframe extends Component<Props & ContextType> {
  private frame: React.RefObject<HTMLIFrameElement> = React.createRef()
  private unsubscribe?: () => void

  public pixelEventHandler = (event: string) => (data: PixelData) => {
    if (this.frame.current === null || this.frame.current.contentWindow === null) {
      return
    }

    const { runtime: { culture: { currency } } } = this.props

    const eventName = `vtex:${event}`

    this.frame.current.contentWindow.postMessage(
      {
        currency,
        eventName,
        ...data,
      },
      '*'
    )
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
    return (
      <iframe
        hidden
        sandbox="allow-scripts"
        src={`/tracking-frame/${this.props.pixel}`}
        ref={this.frame}
      />
    )
  }
}

export default Pixel(withRuntimeContext(PixelIframe))
