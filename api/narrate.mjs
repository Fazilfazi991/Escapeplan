import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {NARRATOR_PROMPT_VERSION,sanitizeNarratorInput,deterministicNarration,validateNarration,NarratorProvider,NarratorService} from '../shared/narrator-core.mjs';

const cache=new Map(),requests=new Map();
const knownBusinesses=new Set(JSON.parse(readFileSync(new URL('../data/BUSINESS_MODELS_SEED_V2.json',import.meta.url))).models.map(model=>model.display_name));
const json=(res,status,body)=>res.status(status).setHeader('content-type','application/json').setHeader('cache-control','private, max-age=0').json(body);
const rateOkay=ip=>{const now=Date.now(),entry=requests.get(ip)||{start:now,count:0};if(now-entry.start>60000){entry.start=now;entry.count=0}entry.count++;requests.set(ip,entry);return entry.count<=30};
const system=`You are EscapePlan's concise narrator. Return JSON with only reaction, insight, curiosity. Use only supplied FACT TOKENS, user fields and allowed claims. Never rank, calculate, reveal hidden names, invent numbers, use market knowledge, promise success, mention internal systems, or add urgency. Keep reaction <=20 words, insight <=18, curiosity <=14. Omit unsupported fields.`;

async function callProvider(input,signal){
  const provider=process.env.NARRATOR_PROVIDER,model=process.env.NARRATOR_MODEL,key=process.env.NARRATOR_API_KEY;
  if(!provider||!model||!key)return null;
  const payload=JSON.stringify({event:input.event,user:input.user,fact_tokens:input.fact_tokens,allowed_claims:input.allowed_claims});
  if(provider==='gemini'){
    const url=process.env.NARRATOR_API_URL||`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({system_instruction:{parts:[{text:system}]},contents:[{parts:[{text:payload}]}],generationConfig:{responseMimeType:'application/json',temperature:.35,maxOutputTokens:140}}),signal});
    if(!response.ok)throw new Error(`PROVIDER_${response.status}`);const data=await response.json();return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text||'');
  }
  const url=process.env.NARRATOR_API_URL||(provider==='deepseek'?'https://api.deepseek.com/chat/completions':null);if(!url)throw new Error('PROVIDER_URL_MISSING');
  const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:payload}],response_format:{type:'json_object'},temperature:.35,max_tokens:140}),signal});
  if(!response.ok)throw new Error(`PROVIDER_${response.status}`);const data=await response.json();return JSON.parse(data.choices?.[0]?.message?.content||'');
}
class ConfiguredNarratorProvider extends NarratorProvider{constructor(signal){super();this.signal=signal}generate(input){return callProvider(input,this.signal)}}

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'METHOD_NOT_ALLOWED'});
  if(!rateOkay(req.headers['x-forwarded-for']?.split(',')[0]||'local'))return json(res,429,{error:'RATE_LIMITED'});
  let input;try{input=sanitizeNarratorInput(req.body);if(input.user.top_match&&!knownBusinesses.has(input.user.top_match))throw new Error('UNKNOWN_BUSINESS')}catch{return json(res,400,{error:'INVALID_REQUEST'})}
  const fallback=deterministicNarration(input),provider=process.env.NARRATOR_PROVIDER||'none',model=process.env.NARRATOR_MODEL||'none';
  const hash=createHash('sha256').update(JSON.stringify({input,prompt:NARRATOR_PROMPT_VERSION,provider,model})).digest('hex');
  if(cache.has(hash))return json(res,200,cache.get(hash));
  if(provider==='none'||!process.env.NARRATOR_API_KEY){const body={narration:fallback,meta:{narrator_mode:'DETERMINISTIC_FALLBACK',narrator_prompt_version:NARRATOR_PROMPT_VERSION,narrator_provider:provider,narrator_model:model}};cache.set(hash,body);return json(res,200,body)}
  const timeout=Math.min(Math.max(Number(process.env.NARRATOR_TIMEOUT_MS)||1200,300),1500),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
  try{const service=new NarratorService({provider:new ConfiguredNarratorProvider(controller.signal)}),result=await service.narrate(input),body={narration:result.narration,meta:{narrator_mode:result.mode,narrator_prompt_version:NARRATOR_PROMPT_VERSION,narrator_provider:provider,narrator_model:model}};if(result.mode==='AI')cache.set(hash,body);return json(res,200,body)}finally{clearTimeout(timer)}
}
