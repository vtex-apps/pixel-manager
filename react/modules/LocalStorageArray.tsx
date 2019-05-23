function isLocalStorageSupported() {
  var mod = 'detect'
  try {
    localStorage.setItem(mod, mod)
    localStorage.removeItem(mod)
    return true
  } catch (e) {
    return false
  }
}

export default class LocalStorageArray<T> {
  private localStorageSupported: boolean
  private fallbackStorage: T[] = []
  private name: string

  public constructor(name: string) {
    this.name = name
    this.localStorageSupported = isLocalStorageSupported()
  }

  public push(value: T) {
    const storage = this.get()
    storage.push(value)
    if (this.localStorageSupported) {
      try {
        localStorage.setItem(this.name, JSON.stringify(storage))
      } catch (e) {
        console.warn('Failed to save event on localStorage', e)
      }
    }
  }

  public get() {
    if (this.localStorageSupported) {
      const storage = localStorage.getItem(this.name)
      return storage ? (JSON.parse(storage) as T[]) : []
    }
    return this.fallbackStorage
  }

  public clear() {
    this.fallbackStorage = []
    if (this.localStorageSupported) {
      localStorage.removeItem(this.name)
    }
  }
}
