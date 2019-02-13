import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { JSDOM } from 'jsdom'

const jsdom = new JSDOM('<!doctype html><html><body></body></html>')

;(global as any).window = jsdom.window
;(global as any).document = window.document

Enzyme.configure({ adapter: new Adapter() })

window.matchMedia = window.matchMedia || (() => {
  return {
    matches: false,
    addListener() {}, // tslint:disable-line
    removeListener() {}, // tslint:disable-line
  }
})
