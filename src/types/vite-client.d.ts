declare module 'vite/client' {
  interface ImportMeta {
    readonly env: Record<string, string>;
  }
}