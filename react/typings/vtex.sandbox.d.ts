declare module 'vtex.sandbox' {
  import React, { ComponentType } from 'react'

  interface SandboxProps {
    content?: string
    width?: string
    height?: string
    allowCookies?: boolean
    allowStyles?: boolean
    iframeRef?: RefObject<HTMLIFrameElement>
  }

  export const Sandbox: ComponentType<SandboxProps>
}
