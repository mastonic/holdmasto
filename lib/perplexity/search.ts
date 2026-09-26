export type PerplexitySearchResult={title:string;url:string;snippet:string;date?:string|null;last_updated?:string|null};
export type PerplexitySearchOptions={maxResults?:number;searchContextSize?:"low"|"medium"|"high";country?:string;languages?:string[];domains?:string[]};
type PerplexitySearchResponse={results:PerplexitySearchResult[];id:string;server_time?:string|null};

// Perplexity Search API endpoint. Keep credentials server-side only.
const ENDPOINT="https://api.perplexity.ai/search";

function retryDelay(header:string|null){if(!header)return 1000;const seconds=Number(header);if(Number.isFinite(seconds))return Math.max(0,seconds*1000);const at=Date.parse(header);return Number.isNaN(at)?1000:Math.max(0,at-Date.now())}

export async function perplexitySearch(query:string|string[],options:PerplexitySearchOptions={}){
 const key=process.env.PERPLEXITY_API_KEY;
 if(!key)throw new Error("PERPLEXITY_API_KEY is not configured");
 const queries=Array.isArray(query)?query:[query];
 if(!queries.length||queries.length>5||queries.some(q=>!q.trim()))throw new Error("query must contain between 1 and 5 non-empty searches");
 const maxResults=options.maxResults??10;
 if(maxResults<1||maxResults>20)throw new Error("maxResults must be between 1 and 20");
 const body:any={query:Array.isArray(query)?queries:queries[0],max_results:maxResults,search_context_size:options.searchContextSize??"medium"};
 if(options.country)body.country=options.country.toUpperCase();
 if(options.languages?.length)body.search_language_filter=options.languages;
 if(options.domains?.length)body.search_domain_filter=options.domains;
 let response:Response|null=null;
 for(let attempt=0;attempt<2;attempt++){
  response=await fetch(ENDPOINT,{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
  if(response.status!==429||attempt===1)break;
  await new Promise(resolve=>setTimeout(resolve,retryDelay(response.headers.get("retry-after"))));
 }
 if(!response)throw new Error("Perplexity search request failed");
 if(!response.ok){if(response.status===401)throw new Error("Perplexity authentication failed");if(response.status===429)throw new Error("Perplexity rate limit reached");throw new Error(`Perplexity search failed with status ${response.status}`)}
 const data=await response.json() as PerplexitySearchResponse;
 const seen=new Set<string>();
 const results=(data.results??[]).filter(result=>{if(!result?.url||seen.has(result.url))return false;seen.add(result.url);return true});
 return {...data,results};
}
