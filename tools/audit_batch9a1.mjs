import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {normalizeAssessment,buildResult} from '../shared/escapeplan-result-engine.mjs';
import {scoreV2,weightsV2} from './match_engine_v2.mjs';

const root=resolve(import.meta.dirname,'..');
const models=JSON.parse(readFileSync(resolve(root,'data/BUSINESS_MODELS_SEED_V2.json'))).models;
const byId=Object.fromEntries(models.map(model=>[model.business_model_id,model]));
const raw=(motivation,situation,capital,time,environment,strengths,tradeoff,extra={})=>({answerText:{motivation:[motivation],situation:[situation],capital:[capital],time:[time],environment:[environment],strengths,tradeoff:[tradeoff],...extra}});
const personaInputs={
 A:raw('I want more income','Full-time job','Under ₹25K','1 hour/day','Sell or build through the internet',['Creative ideas / content'],'Money sooner',{runway:['2–4 months']}),
 B:raw('I want out of my job eventually','Full-time job','₹1L–₹3L','2–3 hours/day','Combine both',['Selling / convincing','Technology / systems'],'Balanced',{runway:['5–7 months']}),
 C:raw('I want to build real wealth','Ready to go full-time','₹7L+','Full-time','Run something people can visit / use locally',['Managing people / operations','Finding products / deals'],'Growth first',{operations:['Comfortable with both']}),
 D:raw('I want something of my own','Studying','Under ₹25K','2–3 hours/day','Sell or build through the internet',['Creative ideas / content','Technology / systems'],'Build for the long term'),
 E:raw('I want to build real wealth','Already running a business','₹3L–₹7L','4–6 hours/day','Combine both',['Selling / convincing','Managing people / operations'],'Growth first'),
 F:raw('I want more income','Full-time job','₹25K–₹1L','1 hour/day','Combine both',['Networking','Selling / convincing'],'Money sooner',{runway:['2–4 months']}),
 G:raw('I want something of my own','Ready to go full-time','₹1L–₹3L','Full-time','Run something people can visit / use locally',['Managing people / operations'],'Balanced',{operations:['Comfortable with both']}),
 H:raw('I want more income','Full-time job','₹25K–₹1L','2–3 hours/day','Sell or build through the internet',['Technology / systems'],'Balanced',{runway:['1 year+']}),
 I:raw('I want to build real wealth','Full-time job','₹3L–₹7L','2–3 hours/day','Combine both',['Finding products / deals'],'Growth first',{runway:['8–12 months']}),
 J:raw('I’m just exploring','Between jobs','Under ₹25K','1 hour/day','I don’t care — show me what fits',['Nothing obvious yet'],'Balanced')
};
const scoreProfile=input=>{const assessment=normalizeAssessment(input);return {assessment,result:buildResult(assessment,models)}};
const factorDetail=(assessment,model)=>{const score=scoreV2(assessment,model);const contributions=Object.fromEntries(Object.entries(score.factors).map(([factor,value])=>[factor,Math.round(value*weightsV2[factor])/100]));const base=Object.values(contributions).reduce((sum,value)=>sum+value,0);return {total:score.total,factors:score.factors,weighted_contributions:contributions,base:Math.round(base*10)/10,net_bonus_or_penalty:Math.round((score.total-base)*10)/10,capital_state:score.capital_state,excluded:score.excluded??false};};

const personaI=scoreProfile(personaInputs.I);
const personaITop10=personaI.result.ranked_businesses.slice(0,10).map(entry=>({rank:entry.rank,id:entry.business_model_id,name:entry.name,...factorDetail(personaI.assessment,byId[entry.business_model_id])}));
const comparisonIds=['ai-utility-website','niche-ecommerce','private-label-product','print-on-demand','digital-downloads','import-resale','wholesale-distribution'];
const personaIComparisons=comparisonIds.map(id=>({id,name:byId[id].display_name,...factorDetail(personaI.assessment,byId[id])}));

const ai=byId['ai-utility-website'];
const aiAudit={business_model_id:ai.business_model_id,display_name:ai.display_name,category:ai.category,monetizable_strengths:ai.monetizable_strengths,capital:ai.capital,validation_capital:ai.validation_capital,ideal_daily_hours_range:ai.ideal_daily_hours_range,can_start_part_time:ai.can_start_part_time,online_offline_type:ai.online_offline_type,supports_remote_operation:ai.supports_remote_operation,typical_validation_window_days:ai.typical_validation_window_days,typical_first_revenue_window_days:ai.typical_first_revenue_window_days,requires_inventory:ai.requires_inventory,scores:ai.scores};

const base=(strengths=['Nothing obvious yet'],environment='Combine both',capital='₹1L–₹3L')=>raw('I want out of my job eventually','Full-time job',capital,'2–3 hours/day',environment,strengths,'Balanced',{runway:['5–7 months']});
const strengthCases={'technology':['Technology / systems'],sales:['Selling / convincing'],sourcing:['Finding products / deals'],operations:['Managing people / operations'],creative:['Creative ideas / content'],networking:['Networking'],numbers:['Numbers / analysis'],none:['Nothing obvious yet']};
const tracked=['ai-utility-website','niche-ecommerce','private-label-product','print-on-demand','digital-downloads','import-resale','wholesale-distribution'];
const controlled=input=>{const {result}=scoreProfile(input),ranks=Object.fromEntries(result.ranked_businesses.map(x=>[x.business_model_id,x.rank]));return {winner:result.top_business.business_model_id,top10:result.ranked_businesses.slice(0,10).map(x=>x.business_model_id),tracked_ranks:Object.fromEntries(tracked.map(id=>[id,ranks[id]??null]))};};
const strengthAffinity=Object.fromEntries(Object.entries(strengthCases).map(([name,strengths])=>[name,controlled(base(strengths))]));
const environmentAffinity=Object.fromEntries([['online','Sell or build through the internet'],['local','Run something people can visit / use locally'],['hybrid','Combine both'],['none','I don’t care — show me what fits']].map(([name,value])=>[name,controlled(base(['Managing people / operations'],value))]));
const capitalAffinity=Object.fromEntries(['Under ₹25K','₹25K–₹1L','₹1L–₹3L','₹3L–₹7L','₹7L+'].map(value=>[value,controlled(base(['Finding products / deals'],'Combine both',value))]));

const riskValues=[1,3,5],incomeValues=[3000000,5000000,10000000,20000000,null];
const sensitivity={};
for(const [id,input] of Object.entries(personaInputs)){
 const baseline=scoreProfile(input),outcomes=[];
 for(const risk of riskValues)for(const income of incomeValues){const assessment=structuredClone(baseline.assessment);assessment.risk_tolerance=risk;assessment.money.monthly_income_target_minor=income;const result=buildResult(assessment,models);outcomes.push({risk,income,winner:result.top_business.business_model_id,top4:result.ranked_businesses.slice(0,4).map(x=>x.business_model_id)});}
 const winners=[...new Set(outcomes.map(x=>x.winner))],top4Signatures=[...new Set(outcomes.map(x=>x.top4.join('|')))];sensitivity[id]={baseline_1:baseline.result.ranked_businesses[0].business_model_id,baseline_2:baseline.result.ranked_businesses[1].business_model_id,winners,top4_variants:top4Signatures.length,classification:winners.length===1?'STABLE':'NEEDS_CLARIFICATION',winner_scenarios:Object.fromEntries(winners.map(winner=>[winner,outcomes.filter(x=>x.winner===winner).map(x=>({risk:x.risk,income:x.income}))]))};
}

const motivations=['I want more income','I want out of my job eventually','I want something of my own','I want to build real wealth','I’m just exploring'];
const situations=['Full-time job','Studying','Already running a business','Ready to go full-time','Between jobs'];
const capitals=['Under ₹25K','₹25K–₹1L','₹1L–₹3L','₹3L–₹7L','₹7L+'];
const times=['1 hour/day','2–3 hours/day','4–6 hours/day','Full-time'];
const environments=['Sell or build through the internet','Run something people can visit / use locally','Combine both','I don’t care — show me what fits'];
const strengthSets=Object.values(strengthCases);
const tradeoffs=['Money sooner','Balanced','Growth first','Build for the long term'];
const population=[];let populationIndex=0;
for(let si=0;si<situations.length;si++)for(let ci=0;ci<capitals.length;ci++)for(let ti=0;ti<times.length;ti++)for(let ei=0;ei<environments.length;ei++)for(let sti=0;sti<strengthSets.length;sti++)for(let tri=0;tri<tradeoffs.length;tri++){const motivation=motivations[(si+ci+ti+ei+sti+tri)%motivations.length],situation=situations[si],capital=capitals[ci],time=times[ti],environment=environments[ei],strengths=strengthSets[sti],tradeoff=tradeoffs[tri],extra={};if(situation==='Full-time job')extra.runway=['5–7 months'];if(environment==='Run something people can visit / use locally')extra.operations=['Comfortable with both'];const {assessment,result}=scoreProfile(raw(motivation,situation,capital,time,environment,strengths,tradeoff,extra)),top3=result.ranked_businesses.slice(0,3).map(x=>x.business_model_id),top5=result.ranked_businesses.slice(0,5).map(x=>x.business_model_id);population.push({index:populationIndex++,winner:result.top_business.business_model_id,winner_category:result.top_business.category,score:result.top_business.profile_match_score,top3,ai_top3:top3.includes('ai-utility-website'),ai_top5:top5.includes('ai-utility-website'),strengths:assessment.strengths,environment:assessment.preferred_business_environment});}
const frequency=(rows,key)=>Object.fromEntries([...new Set(rows.map(key))].sort().map(value=>[value,rows.filter(row=>key(row)===value).length]));
const scores=population.map(x=>x.score).sort((a,b)=>a-b),percentile=p=>scores[Math.ceil(scores.length*p)-1],aiRows=population.filter(x=>x.winner==='ai-utility-website');
const segmentAi=(label,predicate)=>{const rows=population.filter(predicate);return {segment:label,n:rows.length,wins:rows.filter(x=>x.winner==='ai-utility-website').length,win_rate_pct:Math.round(rows.filter(x=>x.winner==='ai-utility-website').length/rows.length*1000)/10};};
const aiDominance={winner_count:aiRows.length,winner_pct:Math.round(aiRows.length/population.length*1000)/10,top3_count:population.filter(x=>x.ai_top3).length,top3_pct:Math.round(population.filter(x=>x.ai_top3).length/population.length*1000)/10,top5_count:population.filter(x=>x.ai_top5).length,top5_pct:Math.round(population.filter(x=>x.ai_top5).length/population.length*1000)/10,strength_segments:[segmentAi('technology',x=>x.strengths.includes('technology')),segmentAi('non_technology',x=>!x.strengths.includes('technology')&&!x.strengths.includes('none_identified')),segmentAi('no_strength',x=>x.strengths.includes('none_identified'))],environment_segments:['online','hybrid','offline','no_preference'].map(env=>segmentAi(env,x=>x.environment===env))};

const report={persona_i:{assessment:personaI.assessment,top10:personaITop10,comparisons:personaIComparisons},ai_utility_dataset:aiAudit,strength_affinity:strengthAffinity,environment_affinity:environmentAffinity,capital_affinity:capitalAffinity,null_field_behavior:{risk_factor:60,income_factor:60,total_available_capital:'unused by scoring; null',expenses_salary_debt:'unused by matching; null',optional_business_experience:'engine-neutral fallback 2 is applied inside the approved V2 skill factor'},sensitivity,population:{n:population.length,winner_frequency:frequency(population,x=>x.winner),top3_frequency:Object.fromEntries(models.map(m=>[m.business_model_id,population.filter(x=>x.top3.includes(m.business_model_id)).length]).filter(([,count])=>count).sort((a,b)=>b[1]-a[1])),category_winner_frequency:frequency(population,x=>x.winner_category),score_distribution:{average:Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10,median:percentile(.5),p10:percentile(.1),p50:percentile(.5),p90:percentile(.9),maximum:scores.at(-1),scores_gte_80:scores.filter(x=>x>=80).length,scores_gte_90:scores.filter(x=>x>=90).length,distinct_winners:new Set(population.map(x=>x.winner)).size},ai_utility:aiDominance}};
const summary={persona_i:report.persona_i,ai_utility_dataset:report.ai_utility_dataset,strength_affinity:report.strength_affinity,environment_affinity:report.environment_affinity,capital_affinity:report.capital_affinity,null_field_behavior:report.null_field_behavior,sensitivity:Object.fromEntries(Object.entries(sensitivity).map(([id,value])=>[id,{baseline_1:value.baseline_1,baseline_2:value.baseline_2,winners:value.winners,top4_variants:value.top4_variants,classification:value.classification}])),population:report.population};
const output=process.argv.includes('--population')?report.population:process.argv.includes('--controlled')?{strength_affinity:report.strength_affinity,environment_affinity:report.environment_affinity,capital_affinity:report.capital_affinity,null_field_behavior:report.null_field_behavior,sensitivity:summary.sensitivity}:process.argv.includes('--persona-i')?{persona_i:report.persona_i,ai_utility_dataset:report.ai_utility_dataset}:process.argv.includes('--summary')?summary:report;
console.log(JSON.stringify(output,null,2));
