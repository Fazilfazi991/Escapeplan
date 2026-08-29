import {scoreV2,readiness} from '../tools/match_engine_v2.mjs';

export const ENGINE_VERSIONS=Object.freeze({scoring_model_version:'2.0.0',business_dataset_version:'business-models-v2.0.0',country_overlay_version:'IN-2026.08-v1',evidence_version:'IN-evidence-2026.08-v1',financial_engine_version:'1.1.0',quiz_schema_version:'assessment-v1.0.0',output_contract_version:'result-v1.1.0'});
export const formatCurrency=(minor,currency='INR',locale='en-IN')=>new Intl.NumberFormat(locale,{style:'currency',currency,maximumFractionDigits:0}).format(minor/100);
export const stableRank=entries=>entries.sort((a,b)=>b.score.total-a.score.total||a.model.business_model_id.localeCompare(b.model.business_model_id));
const capitalFloor={'Under ₹25K':0,'₹25K–₹1L':2500000,'₹1L–₹3L':10000000,'₹3L–₹7L':30000000,'₹7L+':70000000};
const employment={'Full-time job':'full_time_job',Studying:'student','Already running a business':'existing_business','Ready to go full-time':'ready_full_time','Between jobs':'unemployed'};
const motivation={'I want more income':'extra_income','I want out of my job eventually':'leave_job','I want something of my own':'build_asset','I want to build real wealth':'financial_independence','I’m just exploring':'exploration'};
const environment={'Sell or build through the internet':'online','Run something people can visit / use locally':'offline','Combine both':'hybrid','I don’t care — show me what fits':'no_preference'};
const strength={'Selling / convincing':'sales','Technology / systems':'technology','Creative ideas / content':'creative','Finding products / deals':'product_sourcing','Managing people / operations':'operations',Networking:'networking','Numbers / analysis':'finance_analysis','Nothing obvious yet':'none_identified'};
const timing={'Money sooner':'30_days',Balanced:'6_months','Growth first':'12_months','Build for the long term':'long_term'};
const hours={'1 hour/day':1,'2–3 hours/day':2,'4–6 hours/day':4,'Full-time':8};
const runway={'Less than 2 months':1,'2–4 months':2,'5–7 months':5,'8–12 months':8,'1 year+':12};

export function normalizeAssessment(raw={},id='assessment-local'){
  const a=raw.answerText||raw;
  const one=k=>a[k]?.[0];
  const env=environment[one('environment')]||'no_preference';
  const ops={customer_interaction_tolerance:3,staff_management_tolerance:3,inventory_tolerance:3,content_creation_tolerance:3,computer_work_tolerance:3,system_building_preference:3};
  if(env==='online')Object.assign(ops,{staff_management_tolerance:2,inventory_tolerance:2,computer_work_tolerance:5,system_building_preference:4});
  if(env==='offline')Object.assign(ops,{customer_interaction_tolerance:5,staff_management_tolerance:4,inventory_tolerance:4,computer_work_tolerance:2,system_building_preference:2});
  const op=one('operations');
  if(op==='Avoid both')Object.assign(ops,{staff_management_tolerance:0,inventory_tolerance:0});
  if(op==='Inventory is okay')Object.assign(ops,{staff_management_tolerance:1,inventory_tolerance:4});
  if(op==='Staff is okay')Object.assign(ops,{staff_management_tolerance:4,inventory_tolerance:1});
  if(op==='Comfortable with both')Object.assign(ops,{staff_management_tolerance:5,inventory_tolerance:5});
  const cap=capitalFloor[one('capital')]??0;
  const strengths=(a.strengths||[]).map(x=>strength[x]).filter(Boolean);
  const warnings=['monthly_income_target_missing','risk_tolerance_not_directly_collected','operating_tolerances_partly_derived'];
  if(!one('runway'))warnings.push('savings_runway_missing');
  return {schema_version:'assessment-v1.0.0',assessment_id:id,locale:{country:'IN',region:null,currency:'INR'},employment_status:employment[one('situation')]||'unemployed',primary_motivation:motivation[one('motivation')]||'exploration',money:{available_capital_minor:cap,safe_risk_capital_minor:cap,safe_risk_percentage:null,monthly_income_target_minor:0,cash_savings_minor:null,monthly_personal_expenses_minor:null,monthly_salary_minor:null,monthly_debt_commitments_minor:null},available_hours_daily:hours[one('time')]??1,preferred_business_environment:env,strengths:strengths.length?strengths:['none_identified'],operational_preferences:ops,risk_tolerance:3,time_to_first_income_requirement:timing[one('tradeoff')]||'6_months',savings_runway_months:runway[one('runway')]??0,biggest_fear:'wrong_idea',optional:{business_experience:2,industry_experience:[],network_strength:2,technical_skill_depth:strengths.includes('technology')?4:2,sales_skill_depth:strengths.includes('sales')?4:2,access_to_suppliers:strengths.includes('product_sourcing')?4:1,access_to_existing_customers:1,operating_partner_available:false,credential_ids:[]},normalization:{field_classes:{employment_status:'A',primary_motivation:'A',country:'B',available_capital:'A',safe_risk_capital:'B',available_hours_daily:'A',preferred_business_environment:'A',strengths:'A',risk_or_speed_preference:'B',savings_runway_months:one('runway')?'A':'C',operational_preferences:op?'A':'B',monthly_income_target:'C'},warnings}};
}

const reasonMap={capital:'Strong capital fit',time:'Fits your available time',skills:'Matches your declared strengths',risk:'Fits your current risk profile',income:'Strong scalability structure',speed:'Fits your preferred validation pace',operating_style:'Matches how you want to operate',employment:'Can work with your employment situation',location:'Fits your location preference'};
const conflictMap={capital:'Capital requirements conflict with your current test range',time:'Time requirements conflict with your availability',skills:'Critical capability gaps exist right now',risk:'Risk exposure conflicts with your current profile',operating_style:'The operating model conflicts with your preferences',employment:'It is difficult to start alongside your current situation'};
const modelPublic=(entry,rank)=>({business_model_id:entry.model.business_model_id,name:entry.model.display_name,category:entry.model.category,rank,profile_match_score:entry.score.total,factor_scores:entry.score.factors,capital_state:entry.score.capital_state,validation_worthy:entry.score.validation_worthy,launch_ready:entry.score.launch_ready,minimum_validation_capital_minor:entry.model.validation_capital?.minimum_cash_required_minor??entry.model.capital.minimum_test_minor,validation_window_days:entry.model.typical_validation_window_days,first_revenue_window_days:entry.model.typical_first_revenue_window_days,can_start_part_time:entry.model.can_start_part_time,requires_inventory:entry.model.requires_inventory,online_offline_type:entry.model.online_offline_type,reasons:Object.entries(entry.score.factors).filter(([,v])=>v>=70).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([factor,score])=>({factor,score,label:reasonMap[factor]}))});

export function buildResult(assessment,models){
  const scored=[],excluded=[];
  for(const model of models){const score=scoreV2(assessment,model);if(score.excluded)excluded.push({model,score});else scored.push({model,score});}
  stableRank(scored);
  if(!scored.length)throw new Error('NO_ELIGIBLE_MODELS');
  const ranked=scored.map((x,i)=>modelPublic(x,i+1));
  const top=ranked[0],alternatives=selectTeasers(ranked);
  const avoids=[];
  for(const x of excluded){avoids.push({business_model_id:x.model.business_model_id,name:x.model.display_name,reasons:[x.score.code]});}
  for(const x of ranked.slice().reverse()){const conflicts=Object.entries(x.factor_scores).filter(([,v])=>v<35).map(([factor,score])=>({factor,score,label:conflictMap[factor]||`Critical ${factor.replace('_',' ')} conflict`}));if(conflicts.length>=2&&!avoids.some(a=>a.business_model_id===x.business_model_id))avoids.push({business_model_id:x.business_model_id,name:x.name,profile_match_score:x.profile_match_score,reasons:conflicts});}
  const ready=readiness(assessment),readiness_band=ready>=75?'ready_to_test':ready>=55?'building_readiness':'needs_foundation';
  return {contract_version:'result-v1.1.0',engine:{...ENGINE_VERSIONS,tie_break_policy:'profile_match_desc_then_business_model_id_asc'},assessment,readiness:{score:ready,band:readiness_band},ranked_businesses:ranked,top_business:top,alternative_teasers:alternatives,avoid_models:avoids.slice(0,3),business_dna:businessDNA(assessment,top),financial_preview:{status:'partial',safe_test_range_minor:assessment.money.safe_risk_capital_minor,runway_status:'not_calculable',missing_inputs:['monthly_personal_expenses_minor','cash_savings_minor'],message:'Your full money plan can be refined after adding your monthly expenses.'},score_semantics:{label:'PROFILE MATCH',definition:'Alignment with stated profile; not probability of success.',is_success_probability:false}};
}

export function selectTeasers(ranked){
  const top=ranked[0],pool=ranked.slice(1).filter(x=>x.profile_match_score>=top.profile_match_score-15),used=new Set(),out=[];
  const add=(kind,label,predicate,sorter)=>{const item=pool.filter(x=>!used.has(x.business_model_id)&&predicate(x)).sort(sorter)[0];if(item){used.add(item.business_model_id);out.push({kind,label,business_model_id:item.business_model_id,rank:item.rank,profile_match_score:item.profile_match_score});}};
  add('lower_capital','Needs at least 20% less validation capital',x=>x.minimum_validation_capital_minor<=top.minimum_validation_capital_minor*.8,(a,b)=>b.profile_match_score-a.profile_match_score);
  add('faster_validation','Has a meaningfully shorter validation window',x=>x.validation_window_days<=top.validation_window_days*.75&&top.validation_window_days-x.validation_window_days>=14,(a,b)=>b.profile_match_score-a.profile_match_score);
  add('side_business','Scores clearly better beside current employment',x=>x.factor_scores.employment>=top.factor_scores.employment+10,(a,b)=>b.factor_scores.employment-a.factor_scores.employment);
  add('lower_operations','Needs less operational load',x=>x.factor_scores.operating_style>=top.factor_scores.operating_style+10,(a,b)=>b.factor_scores.operating_style-a.factor_scores.operating_style);
  add('no_inventory','Can be tested without inventory',x=>top.requires_inventory&&!x.requires_inventory,(a,b)=>b.profile_match_score-a.profile_match_score);
  for(const x of pool){if(out.length>=3)break;if(!used.has(x.business_model_id)){used.add(x.business_model_id);out.push({kind:'strong_alternative',label:'Another strong route fits your answers differently',business_model_id:x.business_model_id,rank:x.rank,profile_match_score:x.profile_match_score});}}
  return out.slice(0,3);
}

export function businessDNA(a,top){return [{id:'low_overhead',label:'Low overhead fit',band:top.factor_scores.capital>=75?'High':top.factor_scores.capital>=50?'Moderate':'Low',value:top.factor_scores.capital},{id:'side_business',label:'Side-business compatibility',band:top.factor_scores.employment>=75?'High':top.factor_scores.employment>=50?'Moderate':'Low',value:top.factor_scores.employment},{id:'strength',label:'Existing advantage fit',band:top.factor_scores.skills>=75?'High':top.factor_scores.skills>=50?'Moderate':'Low',value:top.factor_scores.skills},{id:'digital',label:'Digital comfort',band:a.preferred_business_environment==='online'?'High':a.preferred_business_environment==='hybrid'?'Moderate':'Low',value:a.preferred_business_environment==='online'?85:a.preferred_business_environment==='hybrid'?60:35},{id:'scale',label:'Scalability requirement',band:top.factor_scores.income>=75?'High':top.factor_scores.income>=50?'Moderate':'Low',value:top.factor_scores.income}];}

export function profileCopy(a,result){const top=result.top_business;if(a.employment_status==='full_time_job'&&top.factor_scores.employment>=70)return 'Your strongest paths can be tested without immediately giving up your salary.';if(a.strengths.includes('sales')&&top.factor_scores.skills>=70)return 'Your ability to sell gives you an advantage in customer-acquisition-heavy models.';if(a.money.safe_risk_capital_minor<=2500000)return 'Low-overhead models rise because your first test needs to preserve capital.';if(a.preferred_business_environment==='online')return 'Digital-first paths rise because they match how you want to work.';return 'Your strongest routes balance what you can commit with how you want to operate.';}
