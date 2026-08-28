import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = (name, value) => {
  const file = resolve(root, 'data', name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};

const dims = ['capital_intensity','time_requirement','operator_dependency','speed_to_validation','speed_to_first_revenue','scalability','recurring_revenue','inventory_requirement','staff_requirement','customer_interaction','technical_complexity','sales_dependency','marketing_dependency','creative_dependency','operations_dependency','product_dependency','supplier_dependency','regulatory_complexity','fixed_cost_intensity','working_capital_requirement','financial_risk','income_ceiling','automation_potential','location_dependency','side_hustle_compatibility','full_time_founder_requirement','business_experience_requirement'];
const strengths = ['sales','technology','creative','product_sourcing','operations','networking','finance_analysis','teaching','technical_trade'];
const templates = {commerce:'commerce',software:'software',digital:'digital_product',service:'local_service',market:'marketplace',content:'content_education',retail:'physical_retail',food:'food',rental:'rental',b2b:'b2b'};
const catalog = [
['niche-ecommerce','Niche E-commerce Brand','commerce','commerce','hybrid',15,100,600,4,5,5,7,6,8,5,8,3,7,4,6,8,7,6,7,8,6,3,4,5,6,6,8,6,5,6,4,5],
['local-same-day-commerce','Local Same-Day Commerce','commerce','commerce','hybrid',25,150,800,5,7,8,8,8,6,3,8,6,9,3,8,7,3,9,7,7,8,6,4,6,8,7,7,3,9,4,7,6],
['subscription-commerce','Subscription Commerce','commerce','commerce','online',25,200,900,5,6,6,6,5,8,9,8,4,7,4,7,8,6,8,7,7,8,5,4,5,8,7,8,7,5,5,5,6],
['import-resale','Import & Resale','commerce','commerce','hybrid',40,300,1500,7,6,6,7,6,6,4,9,4,6,2,8,6,3,8,8,9,8,7,6,6,9,8,8,3,7,4,6,7],
['wholesale-distribution','Wholesale Distribution','b2b','b2b','offline',80,600,3000,9,8,8,5,6,7,6,9,7,8,2,9,4,2,9,8,10,8,8,6,8,10,8,9,4,8,2,8,8],
['private-label-product','Private Label Product','commerce','commerce','hybrid',35,250,1200,7,6,6,5,5,8,5,9,3,5,4,7,9,7,8,9,9,7,6,6,6,9,7,8,6,5,4,6,7],
['print-on-demand','Print-on-Demand Brand','commerce','commerce','online',5,25,150,2,4,4,8,7,6,3,2,1,5,3,4,9,9,3,7,2,2,2,3,2,3,6,3,8,2,9,2,3],
['creator-commerce','Creator-led Commerce','commerce','commerce','online',5,30,250,2,6,7,7,6,8,5,4,2,8,3,7,10,10,4,8,5,3,2,4,4,5,7,3,8,5,7,6,4],
['d2c-beauty','D2C Beauty Brand','commerce','commerce','hybrid',50,400,1800,8,7,7,5,5,8,6,9,4,7,5,8,10,9,8,9,9,9,7,7,7,9,8,9,6,6,3,7,8],
['vending-automated-retail','Vending / Automated Retail','retail','retail','offline',80,500,2500,9,5,5,4,6,6,2,9,3,3,4,5,3,1,8,5,8,7,8,7,8,9,7,7,5,9,3,5,7],
['micro-saas','Micro-SaaS','software','software','online',3,30,250,2,5,4,6,4,10,9,1,1,4,8,6,5,4,3,8,1,2,1,2,3,8,10,1,9,3,9,2,6],
['vertical-saas','Vertical SaaS','software','software','online',10,80,600,4,7,6,5,4,10,10,1,2,6,9,8,6,4,6,9,2,4,2,3,5,9,10,2,8,5,8,5,8],
['ai-utility-website','AI Utility Website','software','software','online',2,20,200,2,4,3,8,6,9,6,1,1,3,9,5,7,4,3,7,1,2,1,2,4,7,10,1,10,2,9,2,5],
['consumer-digital-tool','Consumer Digital Tool','software','software','online',4,40,300,3,5,4,7,5,9,6,1,1,4,8,5,9,7,4,8,1,3,1,2,5,8,9,1,9,3,8,3,6],
['business-data-product','Business Data Product','digital','digital','online',3,25,180,2,5,4,7,5,9,8,1,1,3,7,7,5,3,3,8,1,3,1,2,3,8,9,2,9,3,9,2,6],
['paid-newsletter','Paid Newsletter / Research Product','content','content','online',1,10,80,1,5,6,7,5,7,9,1,1,5,3,6,7,8,3,6,1,2,1,1,2,6,8,1,9,3,8,2,3],
['education-membership','Education Membership','content','content','online',2,20,150,2,6,6,6,5,8,10,1,1,8,4,7,8,8,4,7,1,2,1,1,3,7,8,1,8,4,8,3,5],
['online-course','Online Course Business','content','content','online',2,15,120,1,5,6,6,5,8,4,1,1,6,3,7,9,9,3,7,1,2,1,1,3,7,9,1,9,3,8,2,4],
['digital-downloads','Digital Downloads','digital','digital','online',1,5,50,1,3,2,9,8,8,3,1,1,2,3,3,9,9,2,6,1,1,1,1,2,6,10,1,10,1,10,1,2],
['affiliate-content','Affiliate Content Business','content','content','online',1,10,100,1,5,5,6,3,8,3,1,1,2,3,3,9,9,2,6,1,1,1,1,3,6,9,1,9,3,9,2,3],
['lead-generation-asset','Lead Generation Asset','digital','digital','online',2,20,150,2,5,4,7,6,9,4,1,1,4,6,8,7,5,3,7,1,2,1,1,3,7,9,2,9,3,9,2,5],
['directory-platform','Directory / Listing Platform','market','market','online',3,25,180,2,5,4,6,4,9,5,1,1,5,7,8,6,4,4,8,1,3,1,2,4,8,9,2,9,4,8,3,6],
['job-marketplace','Job Marketplace','market','market','online',8,60,450,3,7,6,5,4,10,7,1,2,8,8,9,6,3,6,9,1,4,2,2,6,9,9,3,8,5,7,5,8],
['booking-marketplace','Booking Marketplace','market','market','online',10,80,600,4,7,7,5,4,10,7,1,3,8,8,9,6,3,7,9,1,4,2,3,6,9,9,5,7,6,6,6,8],
['b2b-marketplace','B2B Marketplace','market','market','online',20,150,1000,5,8,8,4,3,10,8,1,4,9,8,10,5,2,8,10,2,5,3,3,7,10,9,4,6,7,5,7,9],
['software-marketplace','Software Marketplace','market','market','online',8,70,500,3,7,6,5,4,10,8,1,2,7,9,9,5,3,5,9,1,3,2,2,5,9,9,2,8,5,7,5,8],
['niche-community','Niche Community','content','content','online',1,10,100,1,6,7,7,5,8,9,1,1,9,3,6,7,7,4,6,1,2,1,1,2,7,7,2,9,4,8,3,4],
['freelancing','Freelancing','service','b2b','online',0,5,30,1,5,9,10,10,4,2,1,1,8,4,7,3,4,5,3,2,1,1,1,1,2,3,4,1,7,8,10,1,2],
['agency','Agency','service','b2b','hybrid',2,20,150,2,8,9,9,9,7,7,1,7,10,9,4,5,4,9,3,2,2,2,4,6,7,2,6,8,6,7,7],
['consulting','Consulting','service','b2b','hybrid',1,10,80,1,6,9,10,9,6,5,1,1,9,3,8,2,3,5,3,1,2,1,1,2,4,6,2,8,8,9,2,6],
['specialized-recruitment','Specialized Recruitment Platform','service','b2b','hybrid',3,25,180,2,7,8,8,8,7,5,1,3,10,4,9,3,2,7,5,1,3,1,2,4,7,7,3,7,7,7,4,6],
['local-service-brand','Local Service Brand','service','service','offline',5,30,200,3,7,9,9,9,5,4,2,3,9,3,8,4,8,3,9,4,3,4,3,4,5,6,4,9,5,7,4,6,4],
['mobile-service-business','Mobile Service Business','service','service','offline',8,50,300,3,7,9,9,9,5,3,3,2,9,2,7,3,9,4,8,5,3,4,3,4,5,6,3,10,5,7,3,6,4],
['home-services-platform','Home Services Platform','market','market','hybrid',20,150,900,5,9,9,6,5,9,7,1,8,10,8,10,4,2,10,9,1,5,4,4,7,9,8,8,7,8,4,8,8],
['property-service','Property-related Service','service','service','offline',10,80,500,4,8,9,8,8,6,5,2,5,10,3,9,3,6,6,9,3,5,4,5,6,7,8,3,10,6,6,6,7],
['automotive-service','Automotive Service','service','service','offline',30,250,1200,7,9,10,6,7,5,3,7,8,9,3,8,2,10,7,9,7,6,7,7,8,8,8,3,10,7,5,8,7],
['event-business','Event-related Business','service','service','offline',10,80,500,4,8,9,8,9,5,2,4,6,10,3,10,8,9,4,9,4,5,4,4,5,7,7,2,10,7,6,6,6],
['local-experiences','Local Experience Business','service','service','offline',8,50,300,3,7,9,8,8,6,3,2,3,10,2,9,7,8,4,8,3,3,3,4,4,6,7,2,10,6,7,4,5],
['rental-business','Rental Business','rental','rental','offline',30,250,1500,8,6,6,5,7,6,4,9,5,6,3,6,5,2,9,7,8,5,5,7,8,9,7,7,4,10,4,5,5,7],
['cloud-kitchen','Cloud Kitchen','food','food','offline',50,400,2000,8,10,10,7,8,6,4,10,9,7,3,8,8,6,10,9,10,10,10,8,9,10,9,7,2,10,2,9,8],
['specialist-food-brand','Specialist Food Brand','food','food','hybrid',20,150,800,6,8,8,7,7,7,5,9,6,6,2,8,9,7,9,9,9,9,8,7,7,9,8,7,4,8,4,7,7],
['restaurant-cafe','Restaurant / Cafe','food','food','offline',100,1000,5000,10,10,10,4,6,6,5,10,10,10,3,8,8,6,10,10,10,10,10,9,10,10,9,8,1,10,2,10,9],
['small-retail-store','Small Retail Store','retail','retail','offline',80,600,3000,9,10,10,5,7,5,3,10,9,9,2,8,6,3,10,9,10,8,9,9,9,10,8,6,2,10,2,9,8],
['self-service-kiosk','Self-service Kiosk Business','retail','retail','offline',60,500,2500,9,6,6,4,6,6,2,9,4,4,5,5,4,2,9,7,9,7,8,8,8,9,7,7,5,10,3,6,7],
['franchise','Franchise','retail','retail','offline',150,1200,6000,10,9,9,3,6,6,5,9,10,9,2,8,7,3,10,9,10,10,10,9,10,10,8,8,1,10,2,9,9],
['local-logistics','Local Logistics','service','service','offline',40,300,1800,8,10,10,8,9,6,5,6,9,8,4,9,4,2,10,7,8,6,7,8,8,9,8,8,3,10,3,9,8],
['physical-manufacturing','Physical Manufacturing','b2b','b2b','offline',150,1200,8000,10,10,9,3,5,7,5,10,10,7,7,9,4,4,10,10,10,9,10,9,10,10,9,9,2,9,1,10,10],
['small-distribution','Small Distribution Business','b2b','b2b','offline',60,500,2500,9,9,9,6,7,6,5,10,8,8,2,9,5,2,10,8,10,7,9,8,8,10,8,8,3,9,2,8,8],
['professional-practice','Professional Practice','service','b2b','hybrid',10,80,500,4,8,10,7,8,6,7,1,5,10,4,8,2,2,9,5,2,6,3,2,5,6,8,3,7,8,7,4,9],
['technical-trade-service','Technical Trade Service','service','service','offline',15,100,600,5,8,10,9,9,5,3,4,4,9,5,7,2,10,6,8,5,5,5,5,5,6,6,2,10,6,7,5,7]
];

const money = n => n * 100000;
const models = catalog.map(row => {
  const [id,name,category,tpl,mode,min,low,high,...values] = row;
  if (values.length < dims.length) throw new Error(`${id}: expected at least ${dims.length} dimensions, got ${values.length}`);
  // Catalog rows retain two reserved calibration slots at the tail. V1 ignores
  // them deliberately so adding future dimensions does not reorder live keys.
  const scores = Object.fromEntries(dims.map((d,i)=>[d,values[i]]));
  const best = [...strengths].sort((a,b)=>{
    const map={sales:'sales_dependency',technology:'technical_complexity',creative:'creative_dependency',product_sourcing:'supplier_dependency',operations:'operations_dependency',networking:'customer_interaction',finance_analysis:'business_experience_requirement',teaching:'creative_dependency',technical_trade:'operations_dependency'};
    return scores[map[b]]-scores[map[a]];
  }).slice(0,3);
  return {
    business_model_id:id, slug:id, display_name:name,
    short_description:`A ${mode} ${name.toLowerCase()} model evaluated as a category rather than a niche.`,
    category, validation_template_id:templates[tpl], online_offline_type:mode, base_currency:'INR',
    capital:{minimum_test_minor:money(min),typical_startup_low_minor:money(low),typical_startup_high_minor:money(high),ideal_low_minor:money(low),ideal_high_minor:money(high)},
    scores, best_strengths:best, poor_fit_strengths:[],
    ideal_risk_range:[Math.max(1,Math.ceil(scores.financial_risk/2.5)-1),Math.min(5,Math.ceil(scores.financial_risk/2.5)+1)],
    ideal_daily_hours_range:[Math.max(1,Math.round(scores.time_requirement/2)),Math.min(12,Math.max(2,Math.round(scores.time_requirement*1.2)))],
    typical_validation_window_days:Math.max(7,Math.round(100/scores.speed_to_validation*3)),
    typical_first_revenue_window_days:Math.max(14,Math.round(180/scores.speed_to_first_revenue*3)),
    common_failure_modes:['Testing an offer without enough customer evidence','Scaling spend before repeatable unit economics'],
    advantages:['Can be tested with explicit evidence gates','Supports a staged commitment decision'],
    disadvantages:['Outcome depends on execution and market choice','Seed estimates require model-specific research'],
    validation_methods:['Customer interviews','Priced offer or pre-sale test','Capped acquisition experiment'],
    key_metrics:['qualified_demand','conversion_rate','contribution_margin','payback_period'],
    requires_inventory:scores.inventory_requirement>=7, requires_staff_initially:scores.staff_requirement>=8,
    requires_physical_location:mode==='offline' && scores.location_dependency>=7,
    supports_remote_operation:mode!=='offline', supports_recurring_revenue:scores.recurring_revenue>=7,
    can_start_part_time:scores.side_hustle_compatibility>=6,
    evidence:{confidence_level:'low',source_type:'model_assumption',assumption_id:`assumption-${id}-in-v1`,source_refs:[],last_reviewed_at:'2026-08-28',notes:'Generalized India-first seed for engine QA; not a verified quote or forecast.'}
  };
});

for (const m of models) {
  const c=m.capital; if (!(c.minimum_test_minor<=c.typical_startup_low_minor && c.typical_startup_low_minor<=c.typical_startup_high_minor)) throw new Error(`${m.slug}: capital ordering`);
  for (const [k,v] of Object.entries(m.scores)) if (!Number.isInteger(v)||v<1||v>10) throw new Error(`${m.slug}.${k}: out of range`);
}
if (models.length!==50 || new Set(models.map(x=>x.business_model_id)).size!==50) throw new Error('Dataset must contain 50 unique models');

out('BUSINESS_MODELS_SEED.json',{dataset_version:'business-models-in-v1.0.0',status:'qa_seed_not_market_verified',base_country:'IN',base_currency:'INR',generated_at:'2026-08-28',score_scale:{minimum:1,maximum:10},models});

const base={schema_version:'assessment-v1.0.0',locale:{country:'IN',region:null,currency:'INR'},primary_motivation:'extra_income',preferred_business_environment:'no_preference',operational_preferences:{customer_interaction_tolerance:3,staff_management_tolerance:3,inventory_tolerance:3,content_creation_tolerance:3,computer_work_tolerance:3,system_building_preference:3},biggest_fear:'wrong_idea',optional:{business_experience:2,network_strength:2,technical_skill_depth:2,sales_skill_depth:2,access_to_suppliers:1,access_to_existing_customers:1,operating_partner_available:false,credential_ids:[]}};
const specs=[
['A','Employed technical cautious','full_time_job',100000,40000,50000,2,'online',['technology'],2,'3_months',8],
['B','Funded full-time operator','ready_full_time',1000000,500000,150000,8,'offline',['operations'],4,'6_months',12],
['C','Patient creative student','student',20000,10000,20000,1.5,'online',['creative'],3,'long_term',6],
['D','Zero-capital commercial seller','unemployed',0,0,40000,6,'hybrid',['sales','networking'],3,'30_days',1],
['E','High-capital low-risk executive','full_time_job',5000000,500000,200000,2,'no_preference',['finance_analysis','operations'],1,'12_months',18],
['F','No declared strengths explorer','part_time_job',75000,25000,30000,3,'no_preference',['none_identified'],3,'6_months',5],
['G','Inventory-refusing digital builder','full_time_job',250000,75000,100000,3,'online',['technology','creative'],3,'6_months',10],
['H','Aggressive income growth seeker','ready_full_time',2000000,1000000,10000000,10,'hybrid',['sales','operations'],5,'12_months',15],
['I','Existing business owner','existing_business',600000,250000,200000,4,'hybrid',['product_sourcing','sales'],4,'3_months',9],
['J','Contradictory urgent cautious profile','full_time_job',300000,210000,100000,1,'offline',['operations'],1,'30_days',2],
['K','Zero available hours edge case','full_time_job',500000,100000,50000,0,'online',['technology'],2,'3_months',12],
['L','Extreme target edge case','ready_full_time',10000000,2000000,1000000000,12,'online',['technology','sales'],5,'6_months',24]
];
const personas=specs.map(([id,label,employment,available,safe,target,hours,env,str,risk,speed,runway])=>({
  ...structuredClone(base), assessment_id:`qa-persona-${id.toLowerCase()}`, label, employment_status:employment,
  money:{available_capital_minor:money(available/1000),safe_risk_capital_minor:money(safe/1000),safe_risk_percentage:null,monthly_income_target_minor:money(target/1000),cash_savings_minor:null,monthly_personal_expenses_minor:null,monthly_salary_minor:null,monthly_debt_commitments_minor:null},
  available_hours_daily:hours,preferred_business_environment:env,strengths:str,risk_tolerance:risk,time_to_first_income_requirement:speed,savings_runway_months:runway
}));
personas.find(x=>x.assessment_id==='qa-persona-g').operational_preferences.inventory_tolerance=0;
out('QA_PERSONAS.json',{dataset_version:'qa-personas-v1.0.0',currency_minor_unit:2,personas});

out('API_OUTPUT_CONTRACT.json',{
  contract_version:'result-v1.0.0',assessment_id:'qa-persona-a',engine:{match_version:'match-v1.0.0',readiness_version:'readiness-v1.0.0',model_dataset_version:'business-models-in-v1.0.0',country_data_version:'country-in-v0.1.0',input_hash:'sha256:example'},
  score_semantics:{label:'PROFILE MATCH',definition:'Alignment with stated profile; not probability of success.',is_success_probability:false},
  readiness:{score:72.4,band:'ready_to_test',confidence_level:'medium',components:[{id:'financial_foundation',score:67,weight:25,contribution:16.8}],positives:['Stable employment supports low-pressure testing.'],constraints:['Only two hours per day are available.']},
  entrepreneur_profile:{id:'digital_operator',name:'The Digital Operator',confidence:0.71,explanation_key:'profile.digital_operator'},
  ranked_businesses:[{business_model_id:'micro-saas',rank:1,profile_match_score:84.3,hard_excluded:false,factor_scores:{capital:91,time:83,skills:90,risk:82,income:79,speed:68,operating_style:93,employment:89,location:70},factor_contributions:{capital:16.4,time:10.8,skills:11.7,risk:9.8,income:10.3,speed:6.8,operating_style:8.4,employment:6.2,location:3.5},positives:[{code:'SKILL_TECH_ALIGNMENT',factor:'skills'}],conflicts:[{code:'SPEED_WINDOW_GAP',factor:'speed'}],estimated_parameters:{minimum_test_capital:{amount_minor:300000,currency:'INR',confidence_level:'low',source_type:'model_assumption',last_reviewed_at:'2026-08-28'},first_revenue_window_days:{low:45,high:120,confidence_level:'low'}},validation_template_id:'software'}],
  excluded_models:[{business_model_id:'restaurant-cafe',codes:['CAPITAL_BELOW_HARD_GATE']}],
  avoid_models:[{business_model_id:'restaurant-cafe',profile_match_score:18.2,label:'Poor fit for your current profile.',reasons:[{code:'TIME_CRITICAL_CONFLICT'},{code:'CAPITAL_CRITICAL_CONFLICT'}],what_would_need_to_change:[{field:'available_hours_daily',current:2,threshold:8},{field:'safe_risk_capital_minor',current:4000000,threshold:25000000}]}],
  financial_plan:{status:'partial',safe_test_budget:{amount_minor:1200000,currency:'INR',formula_version:'finance-v1.0.0'},capital_reserve:{amount_minor:2800000,currency:'INR'},runway_while_employed:{status:'not_calculable',missing_inputs:['monthly_personal_expenses_minor','monthly_salary_minor']},runway_if_quit:{status:'not_calculable',missing_inputs:['monthly_personal_expenses_minor']},quit_trigger:{type:'planning_framework',not_financial_advice:true,profit_coverage_range:[0.7,1.0],consistency_months_range:[3,6],minimum_emergency_reserve_months:6}},
  what_if_options:[{patch:{available_hours_daily:6},old_rank:4,new_rank:1,score_delta:8.7,movement:3,reason_codes:['TIME_CAPACITY_IMPROVED']}],
  validation_plan:{template_id:'software',business_model_id:'micro-saas',weeks:[{week:1,objective:'Problem evidence',tasks:['Interview 12 target users'],evidence_gate:{metric:'confirmed_problem_interviews',minimum:5}}]},
  assumptions:[{id:'assumption-micro-saas-in-v1',text:'Generalized India-first seed; requires focused research.',confidence_level:'low',source_type:'model_assumption'}],warnings:[],disclaimers:['Profile match is not a probability of success.','Financial outputs are planning scenarios, not financial advice.'],generated_copy:null
});

console.log(`Generated ${models.length} models, ${personas.length} personas, and API contract.`);
