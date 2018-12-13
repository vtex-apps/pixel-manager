import { Context } from 'koa'

import Resources from './resources'

declare global {
  interface IOContext {
    account: string
    workspace: string
    production: boolean
    authToken: string
    region: string
    route: {
      id: string
      declarer: string
      params: {
        [param: string]: string
      }
    }
    userAgent: string
  }

  interface StoreContext extends Context {
    vtex: IOContext
    status: number
    body: any
    resources: Resources
  }

  interface TemplateInput {
    scripts?: string[]
    settings: {
      [varName: string]: any
    }
  }
}
