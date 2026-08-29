import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {NARRATOR_PROMPT_VERSION,NARRATOR_EVENTS,sanitizeNarratorInput,deterministicNarration,validateNarration} from '../shared/narrator-core.mjs';
import {normalizeAssessment,buildResult} from '../shared/escapeplan-result-engine.mjs';
import narratorHandler from '../api/narrate.mjs';

const root=resolve(import.meta.dirname,'..'),models=JSON.parse(readFileSync(resolve(root,'data/BUSINESS_MODELS_SEED_V2.json'))).models;
const raw=(motivation,situation,capital,time,environment,strengths,tradeoff)=>({answerText:{motivation:[motivation],situation:[situation],capital:[capital],time:[time],environment:[environment],strengths,tradeoff:[tradeoff]}});
const personas=[
 raw('I want more income','Full-time job','Under ₹25K','1 hour/day','Sell or build through the internet',['Creative ideas / content'],'Money sooner'),
 raw('I want out of my job eventually','Full-time job','₹1L–₹3L','2–3 hours/day','Combine both',['Selling / convincing','Technology / systems'],'Balanced'),
 raw('I want to build real wealth','Ready to go full-time','₹7L+','Full-time','Run something people can visit / use locally',['Managing people / operations','Finding products / deals'],'Growth first'),
 raw('I want something of my own','Studying','Under ₹25K','2–3 hours/day','Sell or build through the internet',['Creative ideas / content','Technology / systems'],'Build for the long term'),
 raw('I want to build real wealth','Already running a business','₹3L–₹7L','4–6 hours/day','Combine both',['Selling / convincing','Managing people / operations'],'Growth first'),
 raw('I want more income','Full-time job','₹25K–₹1L','1 hour/day','Combine both',['Networking','Selling / convincing'],'Money sooner'),
 raw('I want something of my own','Ready to go full-time','₹1L–₹3L','Full-time','Run something people can visit / use locally',['Managing people / operations'],'Balanced'),
 raw('I want more income','Full-time job','₹25K–₹1L','2–3 hours/day','Sell or build through the internet',['Technology / systems'],'Balanced'),
 raw('I want to build real wealth','Full-time job','₹3L–₹7L','2–3 hours/day','Combine both',['Finding products / deals'],'Growth first'),
 raw('I’m just exploring','Between jobs','Under ₹25K','1 hour/day','I don’t care — show me what fits',['Nothing obvious yet'],'Balanced')
];
const events=['motivation_answered','capital_answered','time_answered','strengths_answered','midpoint_dna_reveal','pre_analysis','match_reveal','paywall_personalization'];
const examples=[];
for(const [index,input] of personas.entries()){
 const assessment=normalizeAssessment(input,`batch9b-${index}`),before=buildResult(assessment,models),after=buildResult(structuredClone(assessment),models);assert.equal(JSON.stringify(before),JSON.stringify(after));assert.equal(before.engine.scoring_model_version,'2.0.1');
 const user={employment:assessment.employment_status,motivation:assessment.primary_motivation,capital_band:input.answerText.capital[0],hours_daily:assessment.available_hours_daily,environment:assessment.preferred_business_environment,strengths:assessment.strengths,archetype:before.profile_archetype.label,top_match:before.top_business.name};
 examples.push({persona:String.fromCharCode(65+index),top_match:before.top_business.name,narration:Object.fromEntries(events.map(event=>[event,deterministicNarration(sanitizeNarratorInput({event,user,fact_tokens:assessment.money.safe_risk_capital_minor===0?['HIGH_OVERHEAD_DEEMPHASIZED']:[],allowed_claims:['user_answer_interpretation'],hidden_names:[],allowed_numbers:[]}))]))});
}
assert.equal(NARRATOR_PROMPT_VERSION,'1.0.0');assert.equal(NARRATOR_EVENTS.length,12);
const good=validateNarration({reaction:'That matters.',insight:'Your available time now changes the shortlist.',curiosity:'One lighter route remains.'});assert(good.ok);
const failures=[
 [{reaction:'This is 92% likely to succeed.'},{},'PROHIBITED_CLAIM'],
 [{reaction:'Secret Marketplace moved higher.'},{hidden_names:['Secret Marketplace']},'HIDDEN_NAME_LEAK'],
 [{reaction:'This could change your life because this is your destiny.'},{},'PROHIBITED_CLAIM'],
 [{reaction:'Invest ₹5,00,000 immediately.'},{allowed_numbers:[]},'UNSUPPORTED_CURRENCY'],
 [{reaction:'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one'},{},'TOO_LONG'],
 [{reaction:'Safe',html:'<b>bad</b>'},{},'UNPERMITTED_KEY'],
 [null,{},'INVALID_JSON_SHAPE']
];
for(const [candidate,context,code] of failures)assert.equal(validateNarration(candidate,context).code,code);
const originalFetch=global.fetch,originalEnv={provider:process.env.NARRATOR_PROVIDER,model:process.env.NARRATOR_MODEL,key:process.env.NARRATOR_API_KEY,url:process.env.NARRATOR_API_URL,timeout:process.env.NARRATOR_TIMEOUT_MS};
Object.assign(process.env,{NARRATOR_PROVIDER:'deepseek',NARRATOR_MODEL:'test-model',NARRATOR_API_KEY:'test-only',NARRATOR_API_URL:'https://provider.invalid',NARRATOR_TIMEOUT_MS:'300'});
const invoke=async(mock,event='capital_answered')=>{global.fetch=mock;let status,body;const res={status(value){status=value;return this},setHeader(){return this},json(value){body=value;return this}};await narratorHandler({method:'POST',headers:{'x-forwarded-for':`${event}-${Math.random()}`},body:{event,user:{capital_band:'100k_300k'},fact_tokens:['HIGH_OVERHEAD_DEEMPHASIZED'],allowed_claims:['capital_affects_shortlist'],hidden_names:['Hidden Business'],allowed_numbers:[]}},res);return {status,body}};
const providerCases=[
 ()=>Promise.resolve({ok:false,status:401,json:async()=>({})}),
 ()=>Promise.resolve({ok:false,status:500,json:async()=>({})}),
 ()=>Promise.resolve({ok:true,json:async()=>({choices:[{message:{content:'not json'}}]})}),
 ()=>Promise.resolve({ok:true,json:async()=>({choices:[{message:{content:''}}]})}),
 ()=>Promise.resolve({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({reaction:'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one'})}}]})}),
 ()=>Promise.resolve({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({reaction:'Hidden Business is your alternative.'})}}]})}),
 ()=>Promise.resolve({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({reaction:'This has a 92% success probability.'})}}]})}),
 (_url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new Error('timeout'))))
];
for(const [index,mock] of providerCases.entries()){const response=await invoke(mock,`capital_answered`);assert.equal(response.status,200);assert.equal(response.body.meta.narrator_mode,'DETERMINISTIC_FALLBACK',`Provider failure case ${index+1} must fall back`)}
const success=await invoke(()=>Promise.resolve({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({reaction:'That opens real options.',insight:'Heavy setup costs still deserve caution.'})}}]})}),'time_answered');assert.equal(success.body.meta.narrator_mode,'AI');
global.fetch=originalFetch;for(const [envKey,value] of Object.entries({NARRATOR_PROVIDER:originalEnv.provider,NARRATOR_MODEL:originalEnv.model,NARRATOR_API_KEY:originalEnv.key,NARRATOR_API_URL:originalEnv.url,NARRATOR_TIMEOUT_MS:originalEnv.timeout})){if(value==null)delete process.env[envKey];else process.env[envKey]=value}
console.log(JSON.stringify({prompt_version:NARRATOR_PROMPT_VERSION,personas:examples,hallucination_failure_cases:failures.length,provider_failure_cases:providerCases.length,deterministic_ranking_checks:personas.length,status:'PASS'},null,2));
