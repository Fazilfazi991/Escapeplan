import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..'), load=n=>JSON.parse(readFileSync(resolve(root,'data',n)));
const out=(n,v)=>{const f=resolve(root,'data',n);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,JSON.stringify(v,null,2)+'\n')};
const v1=load('BUSINESS_MODELS_SEED.json'), qa=load('QA_PERSONAS.json').personas;
const reviewed='2026-08-28';
const sources={
 udyam:{title:'Udyam Registration Portal',publisher:'Ministry of MSME',url:'https://www.udyamregistration.gov.in/',source_type:'government',supports:['MSME registration is free and paperless','MSME classification']},
 gst:{title:'GST registration and threshold guidance',publisher:'CBIC',url:'https://cbic-gst.gov.in/pdf/01062019-GST-An-Update.pdf',source_type:'government',supports:['registration thresholds vary by supply and state']},
 fssai:{title:'Food licensing regulations and fee schedule',publisher:'FSSAI',url:'https://www.fssai.gov.in/upload/uploadfiles/files/Compendium_Licensing_Regulations.pdf',source_type:'government',supports:['food registration and licence fee schedule']},
 mca:{title:'SPICe+ incorporation FAQs',publisher:'Ministry of Corporate Affairs',url:'https://www.mca.gov.in/Ministry/pdf/SPICe%2Band_linked_filings_FAQs_V3_13%20Jan_2022_updated.pdf',source_type:'government',supports:['incorporation filing concessions and variable state stamp duty']},
 startup:{title:'Legal and Regulatory Checklist for Startups in India',publisher:'Startup India',url:'https://www.startupindia.gov.in/content/sih/en/bloglist/blogs/legal-and-regulatory-checklist.html',source_type:'government',supports:['sector licences and entity/compliance checklist']},
 ondc:{title:'Seller Network Participants',publisher:'ONDC',url:'https://www.ondc.org/pages/seller-network-participants.html',source_type:'primary_platform',supports:['seller onboarding, cataloguing, payments and fulfilment duties']},
 shopify:{title:'Shopify India pricing',publisher:'Shopify',url:'https://www.shopify.com/in/pricing',source_type:'primary_platform',supports:['hosted commerce trial and plan prices']},
 aws:{title:'AWS Free Tier',publisher:'Amazon Web Services',url:'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier.html',source_type:'primary_platform',supports:['no-cost proof-of-concept hosting subject to limits']},
 ip:{title:'Trade Marks forms and official fees',publisher:'IP India',url:'https://ipindia.gov.in/pages/trade-marks/learn/forms-and-official-fees',source_type:'government',supports:['trademark e-filing fees by applicant type']},
 permit:{title:'Goods vehicle permit types',publisher:'Parivahan Sewa',url:'https://parivahan.gov.in/content/about-permit',source_type:'government',supports:['state and national goods carrier permit requirements']},
 profiles:{title:'MSME project profiles',publisher:'Development Commissioner MSME',url:'https://dcmsme.gov.in/ProjectProfile_DIs.aspx',source_type:'government',supports:['project-profile framework for manufacturing, services and food']},
 scheme:{title:'Startup India Scheme',publisher:'Startup India',url:'https://www.startupindia.gov.in/content/sih/en/startup-scheme.html',source_type:'government',supports:['DPIIT recognition, self-certification and public procurement access']}
};
const sourceCatalog=Object.entries(sources).map(([source_id,x])=>({source_id,...x,accessed_at:reviewed}));
const digital=new Set(['micro-saas','vertical-saas','ai-utility-website','consumer-digital-tool','business-data-product','paid-newsletter','education-membership','online-course','digital-downloads','affiliate-content','lead-generation-asset','directory-platform','job-marketplace','booking-marketplace','b2b-marketplace','software-marketplace','niche-community']);
const service=new Set(['freelancing','agency','consulting','specialized-recruitment','local-service-brand','mobile-service-business','property-service','event-business','local-experiences','professional-practice','technical-trade-service']);
const food=new Set(['cloud-kitchen','specialist-food-brand','restaurant-cafe']);
const commerce=new Set(['niche-ecommerce','local-same-day-commerce','subscription-commerce','import-resale','wholesale-distribution','private-label-product','print-on-demand','creator-commerce','d2c-beauty']);
const logistics=new Set(['local-logistics','rental-business','automotive-service']);
const zeroIds=new Set([...digital,...service,'print-on-demand','creator-commerce']);
zeroIds.delete('professional-practice');
const conceptOnly=new Set(['niche-ecommerce','subscription-commerce','private-label-product','d2c-beauty','cloud-kitchen','specialist-food-brand','restaurant-cafe','small-retail-store','franchise','physical-manufacturing','small-distribution','vending-automated-retail','self-service-kiosk','home-services-platform']);
const zeroMethod=id=>digital.has(id)?'Use a free landing page, direct outreach, or manual prototype to collect qualified intent before building.':service.has(id)?'Offer a narrowly scoped paid pilot through direct outreach before buying equipment or hiring.':id==='print-on-demand'?'Publish mock-ups and collect paid pre-orders before placing any production order.':id==='creator-commerce'?'Test audience response and pre-orders through an existing social channel before holding stock.':null;
const sourceRefs=id=>food.has(id)?['fssai','startup','udyam']:commerce.has(id)?['shopify','ondc','gst','udyam']:digital.has(id)?['aws','mca','gst','scheme']:logistics.has(id)?['permit','udyam','gst']:['udyam','gst','startup','profiles'];
const confidence=id=>food.has(id)||logistics.has(id)?'medium':digital.has(id)||commerce.has(id)?'medium':'low';
const v2Models=v1.models.map(m=>{
 const id=m.business_model_id, zero=zeroIds.has(id), refs=sourceRefs(id), launch=m.capital.typical_startup_low_minor;
 const minimumValidation=zero?0:Math.min(m.capital.minimum_test_minor,Math.round(launch*.1));
 const validationHigh=zero?Math.min(500000,m.capital.minimum_test_minor||500000):Math.max(minimumValidation,Math.min(m.capital.minimum_test_minor*2,Math.round(launch*.25)));
 const calibratedScores={...m.scores};
 if(id==='freelancing')Object.assign(calibratedScores,{side_hustle_compatibility:10,full_time_founder_requirement:1,business_experience_requirement:2});
 if(id==='consulting')Object.assign(calibratedScores,{business_experience_requirement:8});
 if(id==='professional-practice')Object.assign(calibratedScores,{business_experience_requirement:9,regulatory_complexity:8});
 return {...m,scores:calibratedScores,
   industry_tags:[m.category,...(id==='automotive-service'?['automotive']:[]),...(food.has(id)?['food']:[])],
   monetizable_strengths:id==='freelancing'?['technology','creative','sales','teaching','technical_trade','finance_analysis']:id==='consulting'?['finance_analysis','operations','sales','technology','technical_trade']:[],
   can_start_part_time:id==='freelancing'?true:m.can_start_part_time,
   typical_validation_window_days:id==='freelancing'?7:m.typical_validation_window_days,
   typical_first_revenue_window_days:id==='freelancing'?21:m.typical_first_revenue_window_days,
   capital:{...m.capital,minimum_test_minor:minimumValidation},
   validation_capital:{minimum_cash_required_minor:minimumValidation,indicative_high_minor:validationHigh,currency:'INR',zero_cost_validation_supported:zero,concept_validation_possible_without_launch:zero||conceptOnly.has(id),zero_cost_validation_method:zeroMethod(id),launch_readiness_separate:true},
   evidence_summary:{country:'IN',confidence_level:confidence(id),source_ids:refs,review_status:confidence(id)==='low'?'needs_model_specific_review':'reviewed_cross_cutting_only',last_reviewed_at:reviewed,consumer_display:'estimate_range_only'},
   india_constraints:[food.has(id)?'FSSAI registration or licence applies to food businesses.':null,commerce.has(id)?'GST and marketplace obligations depend on turnover, supply pattern and channel.':null,logistics.has(id)?'Vehicle and operating permits depend on route and state.':null,m.requires_physical_location?'Premises, trade-licence and state/local requirements vary by city.':null].filter(Boolean)
 };
});
const evidence=[];
for(const m of v2Models){
 const id=m.business_model_id, refs=m.evidence_summary.source_ids, conf=m.evidence_summary.confidence_level;
 const add=(metric,value,unit,display,notes,c=conf)=>evidence.push({evidence_id:`IN:${id}:${metric}:v1`,business_model_id:id,country:'IN',metric,value,unit,currency:unit==='INR_minor'?'INR':null,confidence:c,source_type:c==='low'?'triangulated_assumption':'mixed_primary',source_ids:refs,assumption_notes:notes,last_reviewed_at:reviewed,review_status:c==='low'?'needs_research':'reviewed_cross_cutting_only',display_classification:display});
 add('minimum_validation_cash_required',m.validation_capital.minimum_cash_required_minor,'INR_minor','display_as_range','Validation can precede launch; amount is a broad test-budget assumption, not a vendor quote.');
 add('typical_startup_capital_range',{low:m.capital.typical_startup_low_minor,high:m.capital.typical_startup_high_minor},'INR_minor','display_as_range_with_estimate_label','Range includes format and city uncertainty; cross-cutting sources do not prove one universal cost.');
 add('time_to_validation_days',{low:Math.max(7,Math.round(m.typical_validation_window_days*.6)),high:Math.round(m.typical_validation_window_days*1.5)},'days','display_as_range_with_estimate_label','Behavioral planning estimate derived from validation archetype.',digital.has(id)||service.has(id)?'medium':'low');
 add('time_to_first_revenue_days',{low:Math.max(7,Math.round(m.typical_first_revenue_window_days*.6)),high:Math.round(m.typical_first_revenue_window_days*1.6)},'days','display_as_range_with_estimate_label','Possible first revenue is not profitability or a forecast.','low');
 add('regulatory_complexity_score',m.scores.regulatory_complexity,'score_1_10','display_with_estimate_label','Structural score informed by identified registrations/licences; exact duties depend on facts and location.',food.has(id)||logistics.has(id)?'medium':'low');
 add('zero_cost_validation_supported',m.validation_capital.zero_cost_validation_supported,'boolean','display_directly','Indicates demand-validation feasibility only, never launch affordability.',zeroIds.has(id)?'medium':'low');
}
const overrides=v2Models.map(m=>({business_model_id:m.business_model_id,country:'IN',currency:'INR',overlay_version:'IN-2026.08-v1',validation_capital:m.validation_capital,capital_range_override:m.capital,score_overrides:{},regulatory_difficulty:m.scores.regulatory_complexity*10,market_maturity:null,competition_level:null,india_constraints:m.india_constraints,evidence_confidence:m.evidence_summary.confidence_level,evidence_ids:evidence.filter(e=>e.business_model_id===m.business_model_id).map(e=>e.evidence_id),source_ids:m.evidence_summary.source_ids,last_reviewed_at:reviewed}));
out('INDIA_EVIDENCE.json',{evidence_version:'IN-evidence-2026.08-v1',country:'IN',currency:'INR',methodology:'docs/INDIA_RESEARCH_METHOD.md',source_catalog:sourceCatalog,records:evidence});
out('INDIA_MODEL_OVERRIDES.json',{overlay_version:'IN-2026.08-v1',base_dataset_version:v1.dataset_version,country:'IN',currency:'INR',overrides});
out('BUSINESS_MODELS_SEED_V2.json',{dataset_version:'business-models-v2.0.0',previous_dataset_version:v1.dataset_version,scoring_model_version:'2.0.0',country_overlay_version:'IN-2026.08-v1',financial_engine_version:'1.1.0',status:'calibration_release_not_market_complete',base_country:'IN',base_currency:'INR',generated_at:reviewed,models:v2Models});

const calibrationProfiles=[
 ['employed_technical_low_capital','full_time_job',50000,20000,50000,2,'online',['technology'],2,'3_months'],
 ['full_time_offline_operator','ready_full_time',1500000,900000,150000,9,'offline',['operations'],4,'6_months'],
 ['student_creative','student',20000,5000,20000,2,'online',['creative'],3,'long_term'],
 ['zero_capital_seller','unemployed',0,0,40000,6,'hybrid',['sales','networking'],3,'30_days'],
 ['funded_food_operator','ready_full_time',2000000,1400000,250000,10,'offline',['operations','product_sourcing'],4,'6_months'],
 ['existing_distribution_owner','existing_business',2500000,1200000,300000,7,'hybrid',['operations','sales','product_sourcing'],4,'6_months'],
 ['cautious_executive','full_time_job',5000000,500000,200000,2,'no_preference',['finance_analysis'],1,'12_months'],
 ['digital_growth_founder','ready_full_time',1000000,500000,1000000,10,'online',['technology','sales'],4,'12_months'],
 ['no_strengths_explorer','part_time_job',75000,25000,30000,3,'no_preference',['none_identified'],3,'6_months'],
 ['trade_operator','ready_full_time',800000,500000,120000,9,'offline',['technical_trade','operations'],4,'3_months'],
 ['brand_builder','part_time_job',300000,120000,100000,4,'hybrid',['creative','sales'],3,'6_months'],
 ['extreme_income_target','ready_full_time',10000000,2000000,1000000,12,'online',['technology','sales'],5,'12_months']
];
const pairModels=['restaurant-cafe','digital-downloads','micro-saas','freelancing','cloud-kitchen','local-service-brand','niche-ecommerce','wholesale-distribution','paid-newsletter','automotive-service'];
const expected=(p,id)=>{
 const name=p[0];
 if(name==='employed_technical_low_capital')return ['micro-saas','digital-downloads','paid-newsletter'].includes(id)?'strong':['restaurant-cafe','cloud-kitchen','wholesale-distribution','automotive-service'].includes(id)?'poor':'mixed';
 if(name==='full_time_offline_operator')return ['local-service-brand','automotive-service','cloud-kitchen'].includes(id)?'strong':['digital-downloads','paid-newsletter'].includes(id)?'weak':'good';
 if(name==='student_creative')return ['digital-downloads','paid-newsletter'].includes(id)?'strong':['restaurant-cafe','wholesale-distribution','automotive-service'].includes(id)?'poor':'weak';
 if(name==='zero_capital_seller')return ['freelancing','local-service-brand'].includes(id)?'good':['restaurant-cafe','cloud-kitchen','wholesale-distribution'].includes(id)?'poor':'weak';
 if(name==='funded_food_operator')return ['cloud-kitchen','restaurant-cafe'].includes(id)?'strong':['paid-newsletter','micro-saas'].includes(id)?'weak':'good';
 if(name==='existing_distribution_owner')return ['wholesale-distribution','niche-ecommerce','local-service-brand'].includes(id)?'strong':'mixed';
 if(name==='cautious_executive')return ['micro-saas','digital-downloads','paid-newsletter'].includes(id)?'good':['restaurant-cafe','cloud-kitchen'].includes(id)?'poor':'mixed';
 if(name==='digital_growth_founder')return ['micro-saas','niche-ecommerce'].includes(id)?'strong':['restaurant-cafe','automotive-service'].includes(id)?'weak':'good';
 if(name==='no_strengths_explorer')return ['digital-downloads','freelancing','paid-newsletter'].includes(id)?'good':['restaurant-cafe','wholesale-distribution'].includes(id)?'poor':'mixed';
 if(name==='trade_operator')return ['automotive-service','local-service-brand'].includes(id)?'exceptional':['paid-newsletter','digital-downloads'].includes(id)?'weak':'good';
 if(name==='brand_builder')return ['niche-ecommerce','digital-downloads'].includes(id)?'strong':['wholesale-distribution','automotive-service'].includes(id)?'weak':'good';
 return ['micro-saas','niche-ecommerce'].includes(id)?'good':['freelancing'].includes(id)?'mixed':'weak';
};
const comparisons=[];for(const p of calibrationProfiles)for(const id of pairModels)comparisons.push({reference_id:`cal:${p[0]}:${id}`,profile_id:p[0],business_model_id:id,expected_band:expected(p,id),label_type:'calibration_reference',rationale:'Manually reasoned from capital, time, strengths, risk, environment, speed and operating burden; not ground truth.',review_status:'internally_reasoned',reviewed_at:reviewed});
out('CALIBRATION_REFERENCES.json',{version:'calibration-references-v1.0.0',label_semantics:'Internal manually reasoned references, not expert ground truth or success probabilities.',profiles:calibrationProfiles.map(x=>({profile_id:x[0],employment_status:x[1],available_capital_inr:x[2],safe_risk_capital_inr:x[3],monthly_income_target_inr:x[4],available_hours_daily:x[5],environment:x[6],strengths:x[7],risk_tolerance:x[8],income_timing:x[9]})),comparisons});

const offline=[
 ['offline-a-operator-15l',1500000,900000,9,['operations'],'offline',4],
 ['offline-b-sourcing-sales-5l',500000,300000,8,['product_sourcing','sales'],'hybrid',4],
 ['offline-c-owner-25l',2500000,1200000,7,['operations','finance_analysis'],'offline',3],
 ['offline-d-automotive-8l',800000,500000,9,['technical_trade','operations'],'offline',4],
 ['offline-e-food-20l',2000000,1400000,10,['operations','product_sourcing'],'offline',4]
];
const clone=(x)=>structuredClone(x), regression=[];
for(const p of qa)regression.push({persona_id:p.assessment_id,assessment:p,expectations:{top5_must_include:p.assessment_id==='qa-persona-d'?['freelancing']:p.assessment_id==='qa-persona-a'?['ai-utility-website','digital-downloads']:[],top10_must_exclude:p.assessment_id==='qa-persona-a'?['restaurant-cafe']:[],readiness_score_range:[20,95],safe_test_budget_range_minor:[0,p.money.safe_risk_capital_minor],notes:'Original Batch 7 persona; ranking bands are locked more tightly after V2 baseline run.'}});
for(const [id,available,safe,hours,str,env,risk] of offline){const p=clone(qa[1]);p.assessment_id=id;p.label=id;p.money.available_capital_minor=available*100;p.money.safe_risk_capital_minor=safe*100;p.available_hours_daily=hours;p.strengths=str;p.preferred_business_environment=env;p.risk_tolerance=risk;p.optional.industry_experience=id.includes('automotive')?['automotive']:id.includes('food')?['food']:id.includes('sourcing')?['commerce']:id.includes('owner')?['retail','b2b']:['service'];p.operational_preferences.customer_interaction_tolerance=5;p.operational_preferences.staff_management_tolerance=5;p.operational_preferences.inventory_tolerance=4;p.operational_preferences.computer_work_tolerance=2;const must=id.includes('automotive')?['automotive-service']:id.includes('food')?['specialist-food-brand']:id.includes('sourcing')?['private-label-product','niche-ecommerce']:id.includes('operator')?['property-service']:[];regression.push({persona_id:id,assessment:p,expectations:{top5_must_include:must,top5_category_must_include:['service','food','retail','b2b','rental'],top10_must_not_be_all_online:true,readiness_score_range:[55,95],safe_test_budget_range_minor:[0,p.money.safe_risk_capital_minor],notes:'Offline/operator calibration fixture.'}})}
out('REGRESSION_PERSONAS.json',{version:'regression-personas-v1.0.0',scoring_model_version:'2.0.0',personas:regression});
const apiV2=load('API_OUTPUT_CONTRACT.json');apiV2.contract_version='result-v1.1.0';apiV2.engine={scoring_model_version:'2.0.0',business_dataset_version:'business-models-v2.0.0',country_overlay_version:'IN-2026.08-v1',evidence_version:'IN-evidence-2026.08-v1',financial_engine_version:'1.1.0',input_hash:'sha256:example'};apiV2.ranked_businesses=apiV2.ranked_businesses.map(x=>({...x,profile_match_score:79.2,evidence_confidence:{level:'medium',country:'IN',coverage:'partial',consumer_note:'Some India cost estimates remain approximate.',evidence_ids:['IN:micro-saas:minimum_validation_cash_required:v1','IN:micro-saas:typical_startup_capital_range:v1']},capital_state:'lean_to_comfortable_launch',validation_worthy:true,launch_ready:true}));apiV2.disclaimers=[...new Set([...apiV2.disclaimers,'Evidence confidence describes estimate quality and is separate from profile match.'])];out('API_OUTPUT_CONTRACT_V2.json',apiV2);
console.log(`Batch 8 data: ${v2Models.length} models, ${evidence.length} evidence records, ${comparisons.length} calibration pairs, ${regression.length} regressions.`);
