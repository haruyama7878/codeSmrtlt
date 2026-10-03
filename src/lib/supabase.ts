import { createClient } from "@supabase/supabase-js";

// Client-side: dung chinh origin cua trinh duyet (auth di qua rewrite proxy /auth/v1 cua Next.js)
// => link hoat dong o bat ky dau: localhost (tunnel), LAN, hay public IP khi mo port.
// Server-side (SSR/build): dung URL noi bo.
const supabaseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : (process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Supabase environment variables are required");
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
