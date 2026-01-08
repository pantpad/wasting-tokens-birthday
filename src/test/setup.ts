import '@testing-library/jest-dom'

// Ensure requestAnimationFrame and cancelAnimationFrame are available in test environment
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
    return setTimeout(cb, 16) as unknown as number
  }
}

if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  globalThis.cancelAnimationFrame = (id: number) => {
    clearTimeout(id)
  }
}
