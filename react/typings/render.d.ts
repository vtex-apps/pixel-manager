declare module "render" {
  import React from 'react'

  export function withRuntimeContext<T>(comp: React.ComponentType<T>): React.ComponentType<T>
}
