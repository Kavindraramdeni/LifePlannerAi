// FIX: Removed reference to 'vite/client' to resolve "Cannot find type definition file" error.
// Manually declared ImportMetaEnv and ImportMeta to provide type safety for environment variables.

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  // Standard Vite env variables
  readonly BASE_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  [key: string]: any
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
