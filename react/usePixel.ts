import { useContext } from 'react'

import { PixelContext } from './PixelContext'

const usePixel = () => {
  return useContext(PixelContext)
}

export default usePixel
