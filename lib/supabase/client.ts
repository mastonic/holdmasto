import { createBrowserClient } from "@supabase/ssr";
const DEFAULT_URL="https://vybmwwmiwumswfmyldjl.supabase.co";
const DEFAULT_KEY="sb_publishable_f5RYIBU9xA9-npuCxECXlw_CpVAY3ud";
export function createClient(){return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL||DEFAULT_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||DEFAULT_KEY)}
