import { shouldCallEventHandler } from '../usePixelEventCallback'
import { PixelData } from '../PixelContext'

const mockPixelEventData: PixelData = {
  id: 'test',
  event: 'addToCart',
}

describe('shouldCallEventHandler function', () => {
  describe('Should not call the event handler', () => {
    it("If eventName from input matches 'event' property but eventId doesn't match 'id' property", () => {
      const eventNameFromInput = 'addToCart'
      const eventIdFromInput = 'not-test'

      expect(
        shouldCallEventHandler(
          mockPixelEventData,
          eventIdFromInput,
          eventNameFromInput
        )
      ).toBe(false)
    })

    it("If id from input matches 'id' property but eventName doesn't match 'event' property", () => {
      const eventNameFromInput = 'openDrawer'
      const eventIdFromInput = 'test'

      expect(
        shouldCallEventHandler(
          mockPixelEventData,
          eventIdFromInput,
          eventNameFromInput
        )
      ).toBe(false)
    })

    it("If eventName doesn't match 'event' property and no eventId is passed", () => {
      const eventNameFromInput = 'openDrawer'
      const eventIdFromInput = undefined

      expect(
        shouldCallEventHandler(
          mockPixelEventData,
          eventIdFromInput,
          eventNameFromInput
        )
      ).toBe(false)
    })

    it("If eventId doesn't match 'id' property and no eventName is passed", () => {
      const eventNameFromInput = undefined
      const eventIdFromInput = 'not-test'

      expect(
        shouldCallEventHandler(
          mockPixelEventData,
          eventIdFromInput,
          eventNameFromInput
        )
      ).toBe(false)
    })
  })

  describe('Should call the event handler', () => {
    it("If eventId and eventName from input match the event's 'id' and 'event' properties", () => {
      const eventIdFromInput = 'test'
      const eventNameFromInput = 'addToCart'

      expect(
        shouldCallEventHandler(
          mockPixelEventData,
          eventIdFromInput,
          eventNameFromInput
        )
      ).toBe(true)
    })

    it("If eventName from input matches the event's 'event' property and eventId from input is undefined", () => {
      const eventIdFromInput = undefined
      const eventNameFromInput = 'addToCart'

      expect(
        shouldCallEventHandler(
          mockPixelEventData,
          eventIdFromInput,
          eventNameFromInput
        )
      ).toBe(true)
    })

    it("If eventId from input matches the event's 'id' property and eventName from input is undefined", () => {
      const eventIdFromInput = 'test'
      const eventNameFromInput = undefined

      expect(
        shouldCallEventHandler(
          mockPixelEventData,
          eventIdFromInput,
          eventNameFromInput
        )
      ).toBe(true)
    })
  })
})
