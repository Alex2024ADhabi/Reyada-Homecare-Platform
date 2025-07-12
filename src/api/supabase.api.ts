import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Enhanced Supabase configuration with robust environment variable handling
const getEnvironmentVariable = (key: string): string | undefined => {
  // Check process.env first (Node.js environment)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Check import.meta.env (Vite environment)
  if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  // Check window environment variables (runtime)
  if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key]) {
    return (window as any).env[key];
  }
  
  return undefined;
};

const supabaseUrl = getEnvironmentVariable('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvironmentVariable('VITE_SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = getEnvironmentVariable('VITE_SUPABASE_SERVICE_ROLE_KEY');

// Enhanced validation with fallback configuration
if (!supabaseUrl) {
  console.error(
    "❌ VITE_SUPABASE_URL is not set. Please add it to your environment variables.",
  );
  // In development, provide helpful guidance
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.info("💡 For development, ensure your .env file contains VITE_SUPABASE_URL");
  }
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  console.error(
    "❌ VITE_SUPABASE_ANON_KEY is not set. Please add it to your environment variables.",
  );
  // In development, provide helpful guidance
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.info("💡 For development, ensure your .env file contains VITE_SUPABASE_ANON_KEY");
  }
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

// Service role key is optional but recommended for admin operations
if (!supabaseServiceRoleKey) {
  console.warn(
    "⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations may be limited.",
  );
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.info("💡 Add VITE_SUPABASE_SERVICE_ROLE_KEY for full admin functionality");
  }
}

console.log("✅ Supabase configuration validated:", {
  url: supabaseUrl.substring(0, 30) + "...",
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceRoleKey,
});

// Create Supabase client with enhanced configuration
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        "X-Client-Info": "reyada-homecare-platform",
      },
    },
  },
);

export default supabase;