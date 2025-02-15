// src/types/global.d.ts
export {}

declare global {
  interface Window {
    NDEFReader?: new () => NDEFReader
  }
}

interface NDEFReader {
  scan: () => Promise<void>
  addEventListener: (type: 'reading' | 'readingerror', listener: (event: unknown) => void) => void
}
