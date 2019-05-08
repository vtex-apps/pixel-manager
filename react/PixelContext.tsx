import hoistNonReactStatics from 'hoist-non-react-statics'
import React, { Component, useContext, createContext } from 'react'

type EventType =
  | 'homeView'
  | 'productView'
  | 'productClick'
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

type PixelEventHandler = (data: PixelData) => void

type Subscriber = { [E in EventType]?: PixelEventHandler }

export interface PixelContextType {
  subscribe: (s: Subscriber) => () => void
  push: (data: PixelData) => void
}

const PixelContext = createContext<PixelContextType>({
  push: () => undefined,
  subscribe: () => () => undefined,
})

const getDisplayName = (comp: React.ComponentType<any>) =>
  comp.displayName || comp.name || 'Component'

const getPixelQueue = (): PixelData[] =>
  localStorage.getItem('pixelQueue') ? JSON.parse(localStorage.getItem('pixelQueue')!) : []

/**
 * Pixel is the HOC Component that provides an event subscription to the
 * Wrapped Component. This component will be used by the installed apps.
 */
export function Pixel<T>(
  WrappedComponent: React.ComponentType<T & PixelContextType>
) {
  const PixelComponent: React.SFC<T> = props => (
    <PixelContext.Consumer>
      {({ subscribe, push }) => (
        <WrappedComponent {...props} push={push} subscribe={subscribe} />
      )}
    </PixelContext.Consumer>
  )

  PixelComponent.displayName = `withPixel(${getDisplayName(WrappedComponent)})`

  return hoistNonReactStatics(PixelComponent, WrappedComponent)
}

export const usePixel = () => {
  return useContext(PixelContext)
}

interface ProviderState {
  subscribers: Subscriber[]
}

/**
 * HOC Component that has the Pixel logic, dispatching store events
 * to the subscribed external components.
 */
class PixelProvider extends Component<{}, ProviderState> {
  public state = {
    subscribers: [],
  }

  private pixelContextValue: PixelContextType

  private sendingEvents = false

  constructor(props: any) {
    super(props)

    this.pixelContextValue = {
      push: this.push,
      subscribe: this.subscribe,
    }
  }


  public componentDidMount() {
    window.addEventListener('online', this.sendQueuedEvents)
    window.addEventListener('message', this.handleWindowMessages)
  }

  public componentWillUnmount() {
    window.removeEventListener('online', this.sendQueuedEvents)
    window.removeEventListener('message', this.handleWindowMessages)
  }

  /**
   * Notify all subscribers that have a valid event handler
   * defined for the corresponding data
   */
  public notifySubscribers = (data: PixelData) => {
    this.state.subscribers.forEach((subscriber: Subscriber) => {
      if (!data.event) {
        return
      }

      const listener = subscriber[data.event]

      if (typeof listener !== 'function') {
        return
      }

      listener(data)
    })
  }

  /**
   * Notify all subscribers of an event data
   */
  public push = (data: PixelData) => {
    const notify = () => {
      const offline = typeof navigator !== 'undefined' && !navigator.onLine
      if (offline) {
        const pixelQueue: PixelData[] = getPixelQueue()

        pixelQueue.push(data)

        try {
          localStorage.setItem('pixelQueue', JSON.stringify(pixelQueue))
        } catch (e) {
          // localStorage might be full
        }
      } else {
        localStorage.removeItem('pixelQueue')
        this.notifySubscribers(data)
      }
    }

    // Add all events to window when is linking to ease debugging
    // **Don't make those if's one!**
    if (process.env.NODE_ENV === 'development') {
      if (typeof window !== 'undefined') {
        window.pixelManagerEvents = window.pixelManagerEvents || []
        window.pixelManagerEvents.push(data)
      }
    }

    notify()
  }

  /**
   * Subscribe to all pixel events
   *
   * @returns {Function} Unsubscribe function
   */
  public subscribe = (subscriber: Subscriber) => {
    if (subscriber) {
      this.setState(state => ({
        subscribers: [subscriber, ...state.subscribers],
      }))
    }

    return () => {
      this.setState(state => ({
        subscribers: state.subscribers.filter(sub => sub !== subscriber),
      }))
    }
  }

  public render() {
    return (
      <PixelContext.Provider value={this.pixelContextValue}>
        {this.props.children}
      </PixelContext.Provider>
    )
  }

  private sendQueuedEvents = () => {
    if (this.sendingEvents) {
      return
    }

    this.sendingEvents = true

    const pixelQueue: PixelData[] = getPixelQueue()

    pixelQueue.forEach(queuedEvent => this.notifySubscribers(queuedEvent))
    localStorage.removeItem('pixelQueue')

    this.sendingEvents = false
  }

  private handleWindowMessages = (e: any) => {
    if (e.data.pageComponentInteraction) {
      this.push({
        data: e.data,
        event: 'pageComponentInteraction',
      })
    }
  }
}

export default { Pixel, PixelProvider }
