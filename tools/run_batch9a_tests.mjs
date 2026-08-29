import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {normalizeAssessment,buildResult,ENGINE_VERSIONS,formatCurrency,stableRank,profileArchetype} from '../shared/escapeplan-result-engine.mjs';
import {scoreV2} from './match_engine_v2.mjs';
const root=resolve(import.meta.dirname,'..'),data=name=>JSON.parse(readFileSync(resolve(root,'data',name))),models=data('BUSINESS_MODELS_SEED_V2.json').models,regression=data('REGRESSION_PERSONAS.json').personas;
const raw=(motivation,situation,capital,time,environment,strengths,tradeoff,extra={})=>({answerText:{motivation:[motivation],situation:[situation],capital:[capital],time:[time],environment:[environment],strengths,tradeoff:[tradeoff],...extra}});
const personas=[
 ['A',raw('I want more income','Full-time job','Under ₹25K','1 hour/day','Sell or build through the internet',['Creative ideas / content'],'Money sooner',{runway:['2–4 months']})],
 ['B',raw('I want out of my job eventually','Full-time job','₹1L–₹3L','2–3 hours/day','Combine both',['Selling / convincing','Technology / systems'],'Balanced',{runway:['5–7 months']})],
 ['C',raw('I want to build real wealth','Ready to go full-time','₹7L+','Full-time','Run something people can visit / use locally',['Managing people / operations','Finding products / deals'],'Growth first',{operations:['Comfortable with both']})],
 ['D',raw('I want something of my own','Studying','Under ₹25K','2–3 hours/day','Sell or build through the internet',['Creative ideas / content','Technology / systems'],'Build for the long term')],
 ['E',raw('I want to build real wealth','Already running a business','₹3L–₹7L','4–6 hours/day','Combine both',['Selling / convincing','Managing people / operations'],'Growth first')],
 ['F',raw('I want more income','Full-time job','₹25K–₹1L','1 hour/day','Combine both',['Networking','Selling / convincing'],'Money sooner',{runway:['2–4 months']})],
 ['G',raw('I want something of my own','Ready to go full-time','₹1L–₹3L','Full-time','Run something people can visit / use locally',['Managing people / operations'],'Balanced',{operations:['Comfortable with both']})],
 ['H',raw('I want more income','Full-time job','₹25K–₹1L','2–3 hours/day','Sell or build through the internet',['Technology / systems'],'Balanced',{runway:['1 year+']})],
 ['I',raw('I want to build real wealth','Full-time job','₹3L–₹7L','2–3 hours/day','Combine both',['Finding products / deals'],'Growth first',{runway:['8–12 months']})],
 ['J',raw('I’m just exploring','Between jobs','Under ₹25K','1 hour/day','I don’t care — show me what fits',['Nothing obvious yet'],'Balanced')]
];
assert.equal(formatCurrency(2500000),'₹25,000');
assert.deepEqual(stableRank([{model:{business_model_id:'z'},score:{total:70}},{model:{business_model_id:'a'},score:{total:70}}]).map(x=>x.model.business_model_id),['a','z']);
const mapped=normalizeAssessment(personas[0][1],'mapping-test');
assert.equal(mapped.employment_status,'full_time_job');assert.equal(mapped.money.safe_risk_capital_minor,0);assert.equal(mapped.money.available_capital_minor,null);assert.equal(mapped.risk_tolerance,null);assert.equal(mapped.normalization.field_classes.monthly_income_target,'C');assert.equal(profileArchetype(mapped).id,'side_business_strategist');
const capitalExpectations=[['Under ₹25K',0],['₹25K–₹1L',2500000],['₹1L–₹3L',10000000],['₹3L–₹7L',30000000],['₹7L+',70000000]];
for(const [label,minor] of capitalExpectations)assert.equal(normalizeAssessment(raw('I want more income','Between jobs',label,'2–3 hours/day','Combine both',['Nothing obvious yet'],'Balanced')).money.safe_risk_capital_minor,minor);
assert.equal(normalizeAssessment(personas[1][1]).available_hours_daily,2);assert.deepEqual(normalizeAssessment(personas[1][1]).strengths,['sales','technology']);assert.equal(normalizeAssessment(personas[2][1]).operational_preferences.inventory_tolerance,5);assert.equal(normalizeAssessment(personas[1][1]).savings_runway_months,5);assert.throws(()=>buildResult(mapped,[]),/NO_ELIGIBLE_MODELS/);
const ui=[];
for(const [id,input] of personas){
 const assessment=normalizeAssessment(input,`persona-${id}`),one=buildResult(assessment,models),two=buildResult(structuredClone(assessment),models);
 assert.equal(JSON.stringify(one),JSON.stringify(two),'Same normalized input must create byte-equivalent output');
 assert.equal(one.engine.scoring_model_version,'2.0.0');assert.equal(one.score_semantics.is_success_probability,false);assert(one.top_business.reasons.every(x=>x.factor&&Number.isFinite(x.score)&&x.label));assert(one.alternative_teasers.every(x=>one.ranked_businesses.some(r=>r.business_model_id===x.business_model_id)));assert(one.avoid_models.every(x=>x.reasons.length));
 ui.push({persona:id,business_dna:one.business_dna.map(x=>`${x.label}: ${x.band}`),readiness:one.readiness,top1:{id:one.top_business.business_model_id,name:one.top_business.name,score:one.top_business.profile_match_score},top4:one.ranked_businesses.slice(0,4).map(x=>({id:x.business_model_id,score:x.profile_match_score})),reasons:one.top_business.reasons.map(x=>x.label),teasers:one.alternative_teasers.map(x=>({kind:x.kind,rank:x.rank,label:x.label,business_model_id:x.business_model_id})),avoid:one.avoid_models.map(x=>({id:x.business_model_id,reasons:x.reasons.map(r=>typeof r==='string'?r:r.label)})),paywall:{capital:input.answerText.capital[0],employment:assessment.employment_status,motivation:assessment.primary_motivation,tradeoff:assessment.time_to_first_income_requirement}});
}
const winners=Object.fromEntries([...new Set(ui.map(x=>x.top1.id))].sort().map(id=>[id,ui.filter(x=>x.top1.id===id).length]));assert(Object.keys(winners).length>=4);assert(Math.max(...Object.values(winners))<=5);
const scores=ui.map(x=>x.top1.score).sort((a,b)=>a-b),average=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10,median=(scores[4]+scores[5])/2,p90=scores[Math.ceil(scores.length*.9)-1];assert(ui.filter(x=>x.top1.score>=90).length<=1);
let regressionPass=0;
for(const fixture of regression){const ranked=models.map(model=>({id:model.business_model_id,category:model.category,...scoreV2(fixture.assessment,model)})).filter(x=>!x.excluded).sort((a,b)=>b.total-a.total||a.id.localeCompare(b.id)),ids=ranked.map(x=>x.id),expect=fixture.expectations;let ok=true;for(const id of expect.top5_must_include??[])if(!ids.slice(0,5).includes(id))ok=false;for(const id of expect.top10_must_exclude??[])if(ids.slice(0,10).includes(id))ok=false;if(expect.top5_category_must_include&&!ranked.slice(0,5).some(x=>expect.top5_category_must_include.includes(x.category)))ok=false;if(expect.top10_must_not_be_all_online&&ranked.slice(0,10).every(x=>models.find(model=>model.business_model_id===x.id).online_offline_type==='online'))ok=false;if(ok)regressionPass++;}
assert.equal(regressionPass,17);
console.log(JSON.stringify({versions:ENGINE_VERSIONS,persona_results:ui,winner_frequency:winners,distinct_winners:Object.keys(winners).length,score_distribution:{average,median,p90,minimum:scores[0],maximum:scores.at(-1),scores_90_plus:scores.filter(x=>x>=90).length},regression:{passed:regressionPass,total:regression.length}},null,2));
