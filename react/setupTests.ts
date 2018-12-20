import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { JSDOM } from 'jsdom'

const jsdom = new JSDOM('<!doctype html><html><body></body></html>')

;(global as any).window = jsdom.window
;(global as any).document = window.document

Enzyme.configure({ adapter: new Adapter() })

window.matchMedia = window.matchMedia || (() => {
  return {
    matches: false,
    addListener() {},
    removeListener() {},
  }
})
