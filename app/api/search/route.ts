import {NextRequest,NextResponse} from "next/server";
import {perplexitySearch} from "@/lib/perplexity/search";

export async function POST(req:NextRequest){
 try{
  const body=await req.json();
  const query=body?.query;
  if(!(typeof query==="string"||(Array.isArray(query)&&query.every((q:any)=>typeof q==="string"))))return NextResponse.json({error:"query doit etre une chaine ou un tableau de 1 a 5 chaines."},{status:400});
  const data=await perplexitySearch(query,{maxResults:body.max_results,searchContextSize:body.search_context_size,country:body.country,languages:body.search_language_filter,domains:body.search_domain_filter});
  return NextResponse.json(data);
 }catch(error){
  const message=error instanceof Error?error.message:"Recherche Perplexity impossible";
  if(message.includes("not configured"))return NextResponse.json({error:"Recherche web non configuree."},{status:503});
  if(message.includes("authentication"))return NextResponse.json({error:"Authentification Perplexity invalide."},{status:502});
  if(message.includes("rate limit"))return NextResponse.json({error:"Limite Perplexity atteinte. Reessayez plus tard."},{status:429});
  if(message.startsWith("query")||message.startsWith("maxResults"))return NextResponse.json({error:message},{status:400});
  return NextResponse.json({error:"Recherche web momentanement indisponible."},{status:502});
 }
}
