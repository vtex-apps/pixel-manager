import hoistNonReactStatics from 'hoist-non-react-statics'
import React, { useContext, createContext, PureComponent } from 'react'

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

interface Props {
  currency: string
}

const PixelContext = createContext<PixelContextType>({
  push: () => undefined,
})

const getDisplayName = (comp: React.ComponentType<any>) =>
  comp.displayName || comp.name || 'Component'

/**
 * withPixel is the HOC Component that provides an event subscription to the
 * Wrapped Component. This component will be used by the installed apps.
 */
export function withPixel<T>(
  WrappedComponent: React.ComponentType<T & PixelContextType>
) {
  const PixelComponent: React.SFC<T> = props => (
    <PixelContext.Consumer>
      {({ push }) => <WrappedComponent {...props} push={push} />}
    </PixelContext.Consumer>
  )

  PixelComponent.displayName = `withPixel(${getDisplayName(WrappedComponent)})`

  return hoistNonReactStatics(PixelComponent, WrappedComponent)
}

export const usePixel = () => useContext(PixelContext)

class PixelProvider extends PureComponent<Props> {
  private pixelContextValue: PixelContextType
  private events = new LocalStorageArray<PixelData>('vtex-pixel-offline-events')

  public constructor(props: Props) {
    super(props)

    this.pixelContextValue = {
      push: this.push,
    }
  }

  public componentDidMount() {
    window.addEventListener('online', this.flushEvents)
    window.addEventListener('message', this.handleWindowMessage)
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

    if (this.offline) {
      this.events.push(data)
    } else {
      this.handlePixelEvent(data)
    }
  }

  public render() {
    return (
      <PixelContext.Provider value={this.pixelContextValue}>
        {this.props.children}
      </PixelContext.Provider>
    )
  }

  private get offline() {
    return typeof navigator !== 'undefined' && !navigator.onLine
  }

  private flushEvents = () => {
    this.events.get().forEach(this.handlePixelEvent)
    this.events.clear()
  }

  private handleWindowMessage = (e: any) => {
    if (e.data.pageComponentInteraction) {
      this.push({
        data: e.data,
        event: 'pageComponentInteraction',
      })
    }
  }

  private enhanceEvent = (event: PixelData, currency: string) => ({
    currency,
    eventName: `vtex:${event.event}`,
    ...event,
  })

  private handlePixelEvent = (event: PixelData) => {
    const eventData = this.enhanceEvent(event, this.props.currency)
    try {
      window.postMessage(eventData, window.origin)
    } catch (e) {
      // IE and Edge have a bug on postMessage inside promises.
      // Ignoring for now, will try to find a fix that makes
      // postMessage work
      // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/14719328/
    }
  }
}

export default { Pixel: withPixel, withPixel, PixelProvider, usePixel }
