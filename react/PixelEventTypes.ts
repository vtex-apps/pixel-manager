export type EventName =
  | 'addToCart'
  | 'cart'
  | 'cartChanged'
  | 'cartId'
  | 'cartLoaded'
  | 'categoryView'
  | 'checkout'
  | 'checkoutOption'
  | 'departmentView'
  | 'finishPayment'
  | 'homeView'
  | 'installWebApp'
  | 'internalSiteSearchView'
  | 'openDrawer'
  | 'orderPlaced'
  | 'otherView'
  | 'pageComponentInteraction'
  | 'pageInfo'
  | 'pageView'
  | 'productClick'
  | 'productImpression'
  | 'productView'
  | 'promotionClick'
  | 'promoView'
  | 'removeFromCart'
  | 'sendPayments'

export interface PixelData {
  id?: string
  event?: EventName
  [data: string]: unknown
}
