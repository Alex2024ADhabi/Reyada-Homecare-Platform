/// <reference types="node" />
/// <reference types="webpack/module" />

// Webpack environment types
declare const __webpack_public_path__: string;
declare const __webpack_require__: any;

// Process environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: string;
    readonly TEMPO: string;
  }
}

// Legacy Vite compatibility
interface ImportMetaEnv {
  readonly NODE_ENV: string;
  readonly TEMPO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
