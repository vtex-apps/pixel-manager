declare module 'vtex.render-runtime' {
  import React, { ReactComponentElement } from 'react'
  import { Subtract } from 'utility-types'

  export interface RuntimeContext {
    account: string
    workspace: string
    page: string
    culture: {
      availableLocales: string[]
      country: string
      language: string
      locale: string
      currency: string
    }
    hints: {
      mobile: boolean
      desktop: boolean
    }
  }

  interface RuntimeProps {
    runtime: RuntimeContext
  }

  export function withRuntimeContext<T extends RuntimeProps>(
    comp: React.ComponentType<T>
  ): React.ComponentType<Subtract<T, RuntimeProps>>

  export function useRuntime(): RuntimeContext

  export const NoSSR: ReactComponentElement
}
