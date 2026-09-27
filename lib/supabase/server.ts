import {createServerClient} from "@supabase/ssr";import {cookies} from "next/headers";
const DEFAULT_URL="https://vybmwwmiwumswfmyldjl.supabase.co";const DEFAULT_KEY="sb_publishable_f5RYIBU9xA9-npuCxECXlw_CpVAY3ud";
export async function createClient(){const store=await cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL||DEFAULT_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||DEFAULT_KEY,{cookies:{getAll(){return store.getAll()},setAll(values){try{values.forEach(({name,value,options})=>store.set(name,value,options))}catch{}}}})}
