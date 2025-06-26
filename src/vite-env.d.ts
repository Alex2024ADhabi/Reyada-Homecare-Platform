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
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly API_BASE_URL: string;
    readonly BUILD_VERSION: string;
    readonly WEBPACK_BUILD: string;
    readonly VITE_DISABLED: string;
  }
}

// Vite compatibility for dual build system
interface ImportMetaEnv {
  readonly NODE_ENV: string;
  readonly VITE_TEMPO: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global type augmentations
declare global {
  interface Window {
    __TEMPO_ROUTES_LOADED__?: boolean;
    __TEMPO_ROUTES_COUNT__?: number;
    __TEMPO_ENV_VALID__?: boolean;
    __TEMPO_BUILD_TIME__?: string;
    announceToScreenReader?: (message: string) => void;
  }

  const globalThis: typeof global;
}

// Module declarations for missing types
declare module "tempo-routes" {
  const routes: any[];
  export default routes;
  export { routes };
  export function validateRoutes(): {
    isArray: boolean;
    count: number;
    envValid: boolean;
    timestamp: string;
  };
}

declare module "tempo-devtools" {
  export interface TempoDevtools {
    init(): Promise<void>;
  }
  export const TempoDevtools: TempoDevtools;
  export default TempoDevtools;
}
