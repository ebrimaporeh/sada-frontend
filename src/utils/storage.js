export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch {}
  },
  clear: () => {
    try {
      localStorage.clear()
    } catch {}
  },
}
