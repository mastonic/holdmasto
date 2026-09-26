"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
export default function AuthForm(){
 const router=useRouter(), supabase=createClient();
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[info,setInfo]=useState(""),[loading,setLoading]=useState(false);
 async function submit(mode:"login"|"signup"){setLoading(true);setError("");setInfo("");const result=mode==="login"?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});setLoading(false);if(result.error){setError(result.error.message);return}if(mode==="signup"&&!result.data.session){setInfo("Compte cree. Verifie ton email avant de te connecter.");return}router.push("/");router.refresh()}
 return <section className="panel formPage"><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mot de passe<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><div className="filters"><button className="btn" disabled={loading} onClick={()=>submit("login")}>Se connecter</button><button className="chip" disabled={loading} onClick={()=>submit("signup")}>Creer un compte</button></div>{error&&<p className="error">{error}</p>}{info&&<p className="success">{info}</p>}</section>
}