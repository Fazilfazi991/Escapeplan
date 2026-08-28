import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const models=JSON.parse(readFileSync(resolve(root,'data/BUSINESS_MODELS_SEED.json'))).models;
const personas=JSON.parse(readFileSync(resolve(root,'data/QA_PERSONAS.json'))).personas;
const clamp=(x,a=0,b=100)=>Math.min(b,Math.max(a,x));
const lerp=(x,x0,x1,y0,y1)=>y0+clamp((x-x0)/(x1-x0),0,1)*(y1-y0);
const norm10=x=>100*(x-1)/9, norm5=x=>25*(x-1);
const weights={capital:18,time:13,skills:13,risk:12,income:13,speed:10,operating_style:9,employment:7,location:5};
const strengthMap={sales:'sales_dependency',technology:'technical_complexity',creative:'creative_dependency',product_sourcing:'supplier_dependency',operations:'operations_dependency',networking:'customer_interaction',finance_analysis:'business_experience_requirement',teaching:'creative_dependency',technical_trade:'operations_dependency'};
const urgency={'30_days':30,'3_months':90,'6_months':180,'12_months':365,long_term:730};
function fitRange(x,lo,hi,shoulder){if(x>=lo&&x<=hi)return 100;if(x<lo)return 100*clamp((x-(lo-shoulder))/shoulder,0,1);return 100-15*clamp((x-hi)/Math.max(hi,shoulder),0,1)}
function score(p,m){
 const s=m.scores,c=m.capital,C=p.money.safe_risk_capital_minor,M=c.minimum_test_minor,L=c.typical_startup_low_minor,H=c.typical_startup_high_minor;
 if(p.available_hours_daily===0)return {excluded:true,code:'ZERO_HOURS'};
 if(M>0&&C<.25*M)return {excluded:true,code:'CAPITAL_BELOW_HARD_GATE'};
 if(p.operational_preferences.inventory_tolerance===0&&m.requires_inventory)return {excluded:true,code:'INVENTORY_REFUSED'};
 const validation=M?clamp(100*C/M):100;
 const startup=M===0?100:C<M?35*C/M:C<L?lerp(C,M,L,35,75):C<=H?lerp(C,L,H,75,100):100;
 const capital=clamp(.35*validation+.45*startup+.2*fitRange(C,c.ideal_low_minor,c.ideal_high_minor,Math.max(c.ideal_low_minor,M,1)));
 const hlo=m.ideal_daily_hours_range[0],cap=clamp(100*p.available_hours_daily/Math.max(hlo,1));
 const time=clamp(.5*fitRange(p.available_hours_daily,...m.ideal_daily_hours_range,Math.max(hlo,1))+.35*(100-Math.max(0,norm10(s.time_requirement)-cap)*.7-Math.max(0,norm10(s.operator_dependency)-cap)*.3)+.15*(m.can_start_part_time?100:100-norm10(s.full_time_founder_requirement)));
 const none=p.strengths.includes('none_identified'); const capabilities={}; for(const d of Object.values(strengthMap)) capabilities[d]=none?55:45; for(const st of p.strengths) if(strengthMap[st])capabilities[strengthMap[st]]=90;
 const deps=['sales_dependency','technical_complexity','creative_dependency','operations_dependency','supplier_dependency']; let gap=0,sur=0,den=0; for(const d of deps){const dep=norm10(s[d]),w=dep+10,skill=capabilities[d]??(none?55:45);gap+=Math.max(0,dep-skill)*w;sur+=Math.max(0,skill-dep)*w;den+=w} const skills=clamp(70-.65*gap/den+.12*sur/den,20,100);
 const exposure=.45*norm10(s.financial_risk)+.2*norm10(s.fixed_cost_intensity)+.15*norm10(s.working_capital_requirement)+.1*norm10(s.regulatory_complexity)+.1*norm10(s.staff_requirement); const risk=clamp(.55*fitRange(p.risk_tolerance,...m.ideal_risk_range,2)+.45*(100-Math.max(0,exposure-norm5(p.risk_tolerance))));
 const target=p.money.monthly_income_target_minor/100,A=clamp(25*Math.log2(Math.max(target,25000)/25000)); const capacity=.45*norm10(s.income_ceiling)+.3*norm10(s.scalability)+.15*norm10(s.recurring_revenue)+.1*norm10(s.automation_potential)-.25*(.65*norm10(s.operator_dependency)+.35*norm10(s.time_requirement)); const income=clamp(100-1.1*Math.max(0,A-capacity)-.15*Math.max(0,capacity-A-50));
 const ws=(actual,req)=>actual<=req?100:100*Math.exp(-1.6*(actual/req-1)); const speed=.35*ws(m.typical_validation_window_days,urgency[p.time_to_first_income_requirement])+.65*ws(m.typical_first_revenue_window_days,urgency[p.time_to_first_income_requirement]);
 const env=p.preferred_business_environment==='no_preference'?100:p.preferred_business_environment===m.online_offline_type?100:(m.online_offline_type==='hybrid'?75:25); const prefs=p.operational_preferences, req=[['customer_interaction_tolerance','customer_interaction'],['staff_management_tolerance','staff_requirement'],['inventory_tolerance','inventory_requirement'],['content_creation_tolerance','creative_dependency'],['computer_work_tolerance','technical_complexity'],['system_building_preference','automation_potential']]; let opn=0,opd=0;for(const [pk,sk]of req){const r=norm10(s[sk]),w=.5+r/100;opn+=(100-Math.abs(norm5(prefs[pk])-r))*w;opd+=w}const operating_style=.2*env+.8*opn/opd;
 let employment=m.can_start_part_time?100:35;if(['full_time_job','student'].includes(p.employment_status))employment-=.55*norm10(s.full_time_founder_requirement);else if(p.employment_status==='part_time_job')employment-=.25*norm10(s.full_time_founder_requirement);else if(['ready_full_time','unemployed'].includes(p.employment_status))employment+=10;else employment=85-.2*norm10(s.operator_dependency);employment=clamp(employment+.15*norm10(s.side_hustle_compatibility));
 const location=clamp(55-.15*norm10(s.location_dependency)+(m.supports_remote_operation?10:0));
 const factors={capital,time,skills,risk,income,speed,operating_style,employment,location}; const total=Object.entries(weights).reduce((n,[k,w])=>n+w*factors[k]/100,0);
 return {excluded:false,total:Math.round(total*10)/10,factors:Object.fromEntries(Object.entries(factors).map(([k,v])=>[k,Math.round(v)]))};
}
const winners={};
for(const p of personas){const ranked=models.map(m=>({id:m.business_model_id,...score(p,m)})).filter(x=>!x.excluded).sort((a,b)=>b.total-a.total||a.id.localeCompare(b.id)); if(ranked[0])winners[ranked[0].id]=(winners[ranked[0].id]||0)+1; console.log(`${p.assessment_id}: ${ranked.slice(0,5).map((x,i)=>`${i+1}.${x.id}(${x.total})`).join(' | ')} excluded=${50-ranked.length}`);}
console.log('winner_counts',JSON.stringify(winners));
