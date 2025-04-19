import { createBrowserClient } from "@supabase/ssr";
import { ClientType, SassClient } from "@/lib/supabase/unified";
import { Database } from "@/lib/types";

/**
 * Creates a Supabase client for a Single Page Application (SPA).
 * This client is configured to work in the browser environment.
 *
 * @returns {SassClient} - An instance of the Supabase client for SPA.
 */
export function createSPAClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key must be defined in environment variables."
    );
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Creates a SassClient instance for a Single Page Application (SPA).
 * This function wraps the Supabase client in a SassClient for additional functionality.
 *
 * @returns {Promise<SassClient>}
 * - A promise that resolves to an instance of SassClient.
 */
export async function createSPASassClient() {
  const client = createSPAClient();

  // Get the current session to ensure we're authenticated
  const {
    data: { session },
  } = await client.auth.getSession();

  // If there's no session and we're in a browser, redirect to login
  if (!session && typeof window !== "undefined") {
    console.warn(
      "No active session found. Authentication required for storage operations."
    );
    // Optional: Redirect to login
    // window.location.href = '/auth/login';
  }

  // Return a new instance of SassClient, passing the Supabase client and specifying the client type
  return new SassClient(client, ClientType.SPA);
}
