import hoistNonReactStatics from 'hoist-non-react-statics'
import React, { Component, useContext, createContext, createRef, Fragment, RefObject } from 'react'
import { Sandbox } from 'vtex.sandbox'

import sendEvent from './modules/sendEvent'
import LocalStorageArray from './modules/LocalStorageArray'

type EventType =
  | 'homeView'
  | 'productView'
  | 'productClick'
  | 'productImpression'
  | 'otherView'
  | 'categoryView'
  | 'departmentView'
  | 'internalSiteSearchView'
  | 'pageInfo'
  | 'pageView'
  | 'addToCart'
  | 'removeFromCart'
  | 'pageComponentInteraction'
  | 'orderPlaced'

export interface PixelData {
  event?: EventType
  [data: string]: any
}

export interface PixelContextType {
  push: (data: PixelData) => void
}

declare var process: {
  env: {
    NODE_ENV: 'production' | 'development'
    VTEX_APP_ID: string
  }
}

interface PixelResponse {
  scripts: string[]
  settings: Record<string, string>
}

interface Props {
  currency: string
}

interface State {
  pixels?: PixelResponse
}

const IFRAME_READY_MESSAGE = `${process.env.VTEX_APP_ID}:pixel:ready`
const PIXELS_URL = `/_v/public/pixel-manager/pixels`

const PixelContext = createContext<PixelContextType>({
  push: () => undefined,
})

const getDisplayName = (comp: React.ComponentType<any>) =>
  comp.displayName || comp.name || 'Component'

/**
 * Pixel is the HOC Component that provides an event subscription to the
 * Wrapped Component. This component will be used by the installed apps.
 */
export function Pixel<T>(
  WrappedComponent: React.ComponentType<T & PixelContextType>
) {
  const PixelComponent: React.SFC<T> = props => (
    <PixelContext.Consumer>
      {({ push }) => (
        <WrappedComponent
          {...props}
          push={push}
        />
      )}
    </PixelContext.Consumer>
  )

  PixelComponent.displayName = `withPixel(${getDisplayName(WrappedComponent)})`

  return hoistNonReactStatics(PixelComponent, WrappedComponent)
}

export const usePixel = () => useContext(PixelContext)

function onLoadIframe (readyMessage: string) {
  window.addEventListener('load', function () {
    window.parent.postMessage(readyMessage, '*')
  })
}

class PixelProvider extends Component<Props, State> {
  private pixelContextValue: PixelContextType
  private events = new LocalStorageArray<PixelData>('vtex-pixel-offline-events')
  private ready: boolean = false
  private iframeRef: RefObject<HTMLIFrameElement>

  public constructor(props: Props) {
    super(props)

    this.state = {}
    this.iframeRef = createRef<HTMLIFrameElement>()
    this.pixelContextValue = {
      push: this.push,
    }
  }

  public componentDidMount() {
    window.addEventListener('online', this.flushEvents)
    window.addEventListener('message', this.handleWindowMessage)
    this.fetchPixels()
  }

  public componentWillUnmount() {
    window.removeEventListener('online', this.flushEvents)
    window.removeEventListener('message', this.handleWindowMessage)
  }

  /**
   * Push event to iframe
   */
  public push = (data: PixelData) => {
    // Add all events to window when is linking to ease debugging
    // **Don't make those if's one!**
    if (process.env.NODE_ENV === 'development') {
      if (typeof window !== 'undefined') {
        window.pixelManagerEvents = window.pixelManagerEvents || []
        window.pixelManagerEvents.push(data)
      }
    }

    if (this.offline || !this.ready) {
      this.events.push(data)
    } else {
      this.handlePixelEvent(data)
    }
  }

  public render() {
    let sandbox = null
    // Pixels are loaded, enter Sandbox
    if (this.state.pixels) {
      const sandboxContent = [
        // Add settings
        `<script>window.__SETTINGS__ = ${JSON.stringify(this.state.pixels.settings)};</script>`,
        // Add pixel scripts
        this.state.pixels.scripts.map((s: string) => `<script src="${s}"></script>`),
        // Add load function to send ready message
        `${onLoadIframe.toString()};onLoadIframe(${IFRAME_READY_MESSAGE});`,
      ].join('')

      sandbox = <Sandbox iframeRef={this.iframeRef} allowStyles={false} allowCookies={true} content={sandboxContent} />
    }

    return (
      <PixelContext.Provider value={this.pixelContextValue}>
        <Fragment>
          {sandbox}
          {this.props.children}
        </Fragment>
      </PixelContext.Provider>
    )
  }

  private get offline () {
    return typeof navigator !== 'undefined' && !navigator.onLine
  }

  private flushEvents = () => {
    this.events.get().forEach(this.handlePixelEvent)
    this.events.clear()
  }

  private handleWindowMessage = (e: any) => {
    if (e.data === IFRAME_READY_MESSAGE) {
      this.ready = true
      this.flushEvents()
    }

    if (e.data.pageComponentInteraction) {
      this.push({
        data: e.data,
        event: 'pageComponentInteraction',
      })
    }
  }

  private fetchPixels = async () => {
    window.fetch(PIXELS_URL).then((r) => r.json()).then((pixels: PixelResponse) => {
      this.setState({pixels})
    })
  }

  private enhanceEvent = (event: PixelData, currency: string) => ({
    currency,
    eventName: `vtex:${event.event}`,
    ...event,
  })

  private handlePixelEvent = (event: PixelData) => {
    const eventData = this.enhanceEvent(event, this.props.currency)

    if (this.iframeRef.current && this.iframeRef.current.contentWindow) {
      sendEvent(this.iframeRef.current.contentWindow, eventData)
    } else {
      this.events.push(event)
    }
  }
}

export default { Pixel, PixelProvider, usePixel }
