export const NARRATOR_PROMPT_VERSION='1.0.0';
export const NARRATOR_EVENTS=Object.freeze(['motivation_answered','capital_answered','time_answered','working_style_answered','strengths_answered','midpoint_dna_reveal','final_tradeoff_answered','pre_analysis','profile_reveal','match_reveal','alternative_teaser','paywall_personalization']);
export const OUTPUT_KEYS=Object.freeze(['reaction','insight','curiosity']);
const limits={reaction:20,insight:18,curiosity:14};
const prohibited=[/\b\d+(?:\.\d+)?%/i,/success probability/i,/guarantee(?:d)?/i,/destiny/i,/only chance/i,/cannot afford not/i,/algorithm|scoring engine|model weights/i,/market is (?:booming|growing)/i];
const words=value=>String(value||'').trim().split(/\s+/).filter(Boolean).length;
const safeText=value=>typeof value==='string'&&value.length<=240&&!/[<>]/.test(value);

export function validateNarration(output,{hidden_names=[],allowed_numbers=[]}={}){
  if(!output||typeof output!=='object'||Array.isArray(output))return {ok:false,code:'INVALID_JSON_SHAPE'};
  if(Object.keys(output).some(key=>!OUTPUT_KEYS.includes(key)))return {ok:false,code:'UNPERMITTED_KEY'};
  for(const key of OUTPUT_KEYS){if(output[key]!=null&&!safeText(output[key]))return {ok:false,code:'UNSAFE_TEXT'};if(words(output[key])>limits[key])return {ok:false,code:'TOO_LONG'};}
  const joined=OUTPUT_KEYS.map(key=>output[key]||'').join(' ');
  if(hidden_names.some(name=>name&&joined.toLowerCase().includes(name.toLowerCase())))return {ok:false,code:'HIDDEN_NAME_LEAK'};
  if(prohibited.some(rule=>rule.test(joined)))return {ok:false,code:'PROHIBITED_CLAIM'};
  const mentioned=joined.match(/(?:₹|\bRs\.?\s*)\d[\d,.]*/gi)||[];
  if(mentioned.some(value=>!allowed_numbers.includes(value.replace(/\s/g,''))))return {ok:false,code:'UNSUPPORTED_CURRENCY'};
  return {ok:true,value:Object.fromEntries(OUTPUT_KEYS.filter(key=>output[key]).map(key=>[key,output[key].trim()]))};
}

const strengthLabels={sales:'selling',technology:'technology',creative:'creative work',product_sourcing:'product sourcing',operations:'operations',networking:'networking',finance_analysis:'numbers and analysis',none_identified:'no specialist strength yet'};
export function deterministicNarration(input){
  const u=input.user||{},f=new Set(input.fact_tokens||[]),event=input.event;
  if(event==='motivation_answered')return {reaction:'Got it.',insight:u.motivation==='leave_job'?'You’re looking for something that could grow beyond your salary.':'Your reason for building should shape which paths deserve attention.'};
  if(event==='capital_answered')return {reaction:u.capital_band==='under_25k'?'Lean can be useful.':'That opens real options.',insight:f.has('HIGH_OVERHEAD_DEEMPHASIZED')?'Heavy setup costs now need stronger evidence.':'Your budget gives us a clearer test boundary.',curiosity:f.has('LOWER_CAPITAL_ALTERNATIVE_EXISTS')?'A lower-cost route is still in the running.':''};
  if(event==='time_answered')return {reaction:'Useful.',insight:u.hours_daily<=2?'We’ll favour paths you can test without creating another full-time job.':'Your available time keeps more involved paths in consideration.'};
  if(event==='working_style_answered')return {reaction:'That changes the map.',insight:u.environment==='online'?'Location-light paths now fit better.':u.environment==='offline'?'Local customers and hands-on operations can now count as strengths.':u.environment==='hybrid'?'Both digital reach and local execution remain open.':'Practical fit will matter more than business format.'};
  if(event==='strengths_answered'){const labels=(u.strengths||[]).slice(0,2).map(x=>strengthLabels[x]||x);return {reaction:labels.length>1?'That combination matters.':'Good signal.',insight:labels.length>1?`${labels[0]} and ${labels[1]} can strengthen different parts of the same business.`:`Your ${labels[0]||'current'} advantage now affects the shortlist.`};}
  if(event==='midpoint_dna_reveal')return {reaction:'A pattern is starting to form.',insight:f.has('SIDE_BUSINESS_COMPATIBLE')?'Your strongest routes can start light while fitting around your current situation.':'Your money, time and working style are narrowing the field.'};
  if(event==='final_tradeoff_answered'||event==='pre_analysis')return {reaction:'That’s enough.',insight:'We know what you want, what you can test and how you naturally operate.',curiosity:'Let’s see what survived.'};
  if(event==='profile_reveal')return {reaction:u.archetype||'Your profile is ready.',insight:input.fallback_insight||'Your strongest routes balance what you can commit with how you want to work.'};
  if(event==='match_reveal')return {reaction:`${u.top_match||'Your strongest path'} fits for specific reasons.`,insight:input.fallback_insight||'Its strongest factors come directly from your answers.'};
  if(event==='alternative_teaser')return {reaction:'Your #1 isn’t the whole story.',curiosity:input.fallback_curiosity||'Another strong route fits your answers differently.'};
  if(event==='paywall_personalization')return {reaction:input.fallback_reaction||'Compare the paths before you commit.',insight:input.fallback_insight||'Your strongest match is not the only route worth testing.',curiosity:input.fallback_curiosity||''};
  return {reaction:'Noted.',insight:'That gives us another useful signal.'};
}

export function sanitizeNarratorInput(raw){
  if(!raw||!NARRATOR_EVENTS.includes(raw.event))throw new Error('INVALID_EVENT');
  const user=raw.user&&typeof raw.user==='object'?raw.user:{};
  const fact_tokens=Array.isArray(raw.fact_tokens)?raw.fact_tokens.filter(x=>/^[A-Z0-9_]{3,64}$/.test(x)).slice(0,20):[];
  const pick=(value,allowed)=>allowed.includes(value)?value:null;
  return {event:raw.event,user:{employment:pick(user.employment,['full_time_job','part_time_job','student','existing_business','ready_full_time','unemployed']),motivation:pick(user.motivation,['extra_income','leave_job','build_asset','financial_independence','exploration']),capital_band:pick(user.capital_band,['under_25k','25k_100k','100k_300k','300k_700k','700k_plus','Under ₹25K','₹25K–₹1L','₹1L–₹3L','₹3L–₹7L','₹7L+']),hours_daily:[1,2,4,8].includes(user.hours_daily)?user.hours_daily:null,environment:pick(user.environment,['online','offline','hybrid','no_preference']),strengths:Array.isArray(user.strengths)?user.strengths.filter(x=>['sales','technology','creative','product_sourcing','operations','networking','finance_analysis','none_identified'].includes(x)).slice(0,2):[],archetype:safeText(user.archetype)&&/^[\w -]{3,50}$/.test(user.archetype)?user.archetype:null,top_match:safeText(user.top_match)&&/^[\w& /-]{3,80}$/.test(user.top_match)?user.top_match:null},fact_tokens,allowed_claims:Array.isArray(raw.allowed_claims)?raw.allowed_claims.filter(x=>/^[a-z0-9_]{3,64}$/.test(x)).slice(0,20):[],hidden_names:Array.isArray(raw.hidden_names)?raw.hidden_names.filter(x=>safeText(x)&&/^[\w& /-]{3,80}$/.test(x)).slice(0,5):[],allowed_numbers:Array.isArray(raw.allowed_numbers)?raw.allowed_numbers.filter(safeText).slice(0,8):[],fallback_reaction:safeText(raw.fallback_reaction)?raw.fallback_reaction:'',fallback_insight:safeText(raw.fallback_insight)?raw.fallback_insight:'',fallback_curiosity:safeText(raw.fallback_curiosity)?raw.fallback_curiosity:''};
}

export class NarratorProvider{async generate(){throw new Error('NARRATOR_PROVIDER_NOT_IMPLEMENTED')}}
export class DeterministicNarratorFallback{generate(input){return deterministicNarration(input)}}
export class NarratorService{
  constructor({provider=null,fallback=new DeterministicNarratorFallback()}={}){this.provider=provider;this.fallback=fallback}
  async narrate(input){if(!this.provider)return {narration:this.fallback.generate(input),mode:'DETERMINISTIC_FALLBACK'};try{const candidate=await this.provider.generate(input),checked=validateNarration(candidate,input);if(!checked.ok)throw new Error(checked.code);return {narration:checked.value,mode:'AI'}}catch{return {narration:this.fallback.generate(input),mode:'DETERMINISTIC_FALLBACK'}}}
}
