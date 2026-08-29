let ENGINE_VERSIONS,normalizeAssessment,buildResult,profileCopy,formatCurrency;

const rawKey='escapeplan-assessment-v1',stateKey='escapeplan_assessment_v2';
const page=location.pathname.split('/').filter(Boolean)[0];
const set=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=value??''};
const bandLabel={ready_to_test:'Ready to test',building_readiness:'Building readiness',needs_foundation:'Needs foundation'};
const brand=document.querySelector('.cv-brand');if(brand){brand.removeAttribute('href');brand.setAttribute('role','img');brand.setAttribute('aria-label','EscapePlan');brand.tabIndex=-1}

function readRaw(){for(const storage of [localStorage,sessionStorage]){try{const value=JSON.parse(storage.getItem(rawKey)||'null');if(value?.answerText)return value}catch(_){}}return null;}
async function sha256(value){const bytes=new TextEncoder().encode(value),digest=await crypto.subtle.digest('SHA-256',bytes);return `sha256:${[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}`;}
async function calculate(){
  const raw=readRaw();if(!raw)throw new Error('ASSESSMENT_MISSING');
  const assessment=normalizeAssessment(raw,'local-assessment-v2');
  const response=await fetch('/data/BUSINESS_MODELS_SEED_V2.json');if(!response.ok)throw new Error('DATASET_UNAVAILABLE');
  const data=await response.json();if(data.dataset_version!==ENGINE_VERSIONS.business_dataset_version)throw new Error('DATASET_VERSION_MISMATCH');
  const result=buildResult(assessment,data.models);
  result.engine.input_hash=await sha256(JSON.stringify(assessment));result.engine.engine_configuration_hash=await sha256(JSON.stringify(ENGINE_VERSIONS));
  result.generated_at=new Date().toISOString();const record={record_version:'escapeplan-assessment-state-v2',saved_at:result.generated_at,versions:ENGINE_VERSIONS,raw_answers:raw.answerText,canonical_assessment:assessment,result};
  localStorage.setItem(stateKey,JSON.stringify(record));sessionStorage.setItem(stateKey,JSON.stringify(record));return record;
}
async function loadRecord(){for(const storage of [localStorage,sessionStorage]){try{const value=JSON.parse(storage.getItem(stateKey)||'null');if(value?.versions?.scoring_model_version===ENGINE_VERSIONS.scoring_model_version&&value?.result?.top_business)return value}catch(_){}}return calculate();}
function failure(error){document.body.innerHTML='<main class="cv-error"><h1>We couldn’t finish your match just now.</h1><p>Your answers are still saved.</p><button type="button" id="retry-analysis">Retry Analysis</button></main>';document.getElementById('retry-analysis').addEventListener('click',()=>{localStorage.removeItem(stateKey);sessionStorage.removeItem(stateKey);location.href='/analysis-v2/code'});console.error('EscapePlan scoring failed:',error.message);}
function reasons(result){return result.top_business.reasons.map(x=>x.label);}

function renderAnalysis(record){
  const {result,canonical_assessment:a}=record;const topCategories=[...new Set(result.ranked_businesses.slice(0,12).map(x=>x.category))];
  document.getElementById('category-nodes').innerHTML=topCategories.map((name,index)=>`<span style="--n:${index}">${name.replace(/-/g,' ')}</span>`).join('');
  const signals=[`Capital fit: ${Math.round(result.top_business.factor_scores.capital)}%`,`Time fit: ${Math.round(result.top_business.factor_scores.time)}%`,`Strengths fit: ${Math.round(result.top_business.factor_scores.skills)}%`,`Operating style: ${Math.round(result.top_business.factor_scores.operating_style)}%`,`${result.ranked_businesses.length} eligible models compared`];
  document.getElementById('signal-list').innerHTML=signals.map((signal,index)=>`<li style="--delay:${index}"><span>${signal}</span><b>✓</b></li>`).join('');
  document.getElementById('analysis-ready').hidden=false;
}
function renderDNA(record){
  const {result,canonical_assessment:a}=record;set('profile-title',result.business_dna[1].band==='High'?'The Practical Builder':a.preferred_business_environment==='online'?'The Digital Builder':'The Adaptive Builder');set('profile-copy',profileCopy(a,result));
  document.getElementById('dna-bars').innerHTML=result.business_dna.slice(0,4).map(x=>`<div style="--fill:${Math.round(x.value)}%"><span>${x.label.toUpperCase()}<b>${x.band}</b></span><i><em></em></i></div>`).join('');
  set('standout-title',profileCopy(a,result));document.getElementById('fit-signals').innerHTML=reasons(result).slice(0,3).map(reason=>`<li>${reason}<b>✓</b></li>`).join('');
}
function renderMatch(record){
  const {result}=record,top=result.top_business;set('match-name',top.name);document.querySelector('.score-note').textContent=`${Math.round(top.profile_match_score)}% Profile Match reflects alignment with your answers—not probability of success.`;
  document.getElementById('match-reasons').innerHTML=reasons(result).map(reason=>`<li><b>✓</b><span>${reason}</span></li>`).join('');
  set('curiosity-line',result.alternative_teasers[0]?.label||'Your strongest path is only one way to fit your answers.');
  const routes=[...document.querySelectorAll('.map-route')];routes[0].querySelector('strong').textContent=top.name;routes[0].querySelector('small').textContent=`${Math.round(top.profile_match_score)}% Profile Match`;
  result.alternative_teasers.forEach((teaser,index)=>{const route=routes[index+1];if(!route)return;route.querySelector('b').textContent=`#${teaser.rank}`;route.querySelector('small').textContent=`${Math.round(teaser.profile_match_score)}% · ${teaser.label}`;});
  routes.slice(result.alternative_teasers.length+1).forEach(route=>route.hidden=true);
  const poor=document.querySelector('.poor-routes');poor.innerHTML=result.avoid_models.map(()=>'<span>Poor fit ×</span>').join('');poor.setAttribute('aria-label',`${result.avoid_models.length} explainable poor-fit routes`);
}
function renderPaywall(record){
  const {result,canonical_assessment:a,raw_answers:raw}=record,capital=raw.capital?.[0]||formatCurrency(a.money.safe_risk_capital_minor);
  set('capital-value',capital);set('capital-intro',`You said you could test with ${capital}. Compare the routes before you commit it.`);
  const motivation=raw.motivation?.[0],tradeoff=raw.tradeoff?.[0],env=raw.environment?.[0];let headline='Compare the paths before you spend the bigger money.';
  if(motivation==='I want out of my job eventually')headline='Before you leave your salary behind, compare the paths that can start beside it.';else if(raw.capital?.[0]==='Under ₹25K')headline='You don’t have money to waste testing the wrong model.';else if(['₹3L–₹7L','₹7L+'].includes(raw.capital?.[0]))headline=`Before you put ${capital} behind one idea, compare the alternatives.`;else if(tradeoff==='Money sooner')headline='Compare the paths by speed before you bet on one.';else if(env==='Sell or build through the internet')headline='Compare the digital paths before you commit to one.';set('paywall-headline',headline);
  const teaser=result.alternative_teasers[0];const questions=[teaser?.label||'Which alternative fits differently?','Which one could validate sooner?','Which one fits best beside your job?',`What should you NOT start right now?`];document.querySelectorAll('.question-locks strong').forEach((node,index)=>node.textContent=questions[index]);
  const avoidCount=result.avoid_models.length;const avoidNode=document.querySelector('.question-locks article:last-child span');if(avoidNode)avoidNode.textContent=`${avoidCount} explainable poor-fit ${avoidCount===1?'business':'businesses'}`;
  const outcomes=[`${result.ranked_businesses.length} eligible paths`,'Your money plan',`${avoidCount} poor-fit ${avoidCount===1?'business':'businesses'}`,'Your first 30 days'];document.querySelectorAll('.unlock-outcomes b').forEach((node,index)=>node.textContent=outcomes[index]);
  const moneyCopy=document.querySelector('.unlock-outcomes p:nth-child(2) span');if(moneyCopy)moneyCopy.textContent=result.financial_preview.message;
  const preview=document.querySelector('.price-panel .cv-button');if(preview)preview.innerHTML='Preview the ₹199 Unlock <span aria-hidden="true">→</span>';const trust=document.querySelector('.trust-line');if(trust)trust.innerHTML='<span>No charge in preview</span><span>Instant access shown</span><span>No subscription</span>';
}
function renderCheckout(record){const routes=[...document.querySelectorAll('.unlock-map .map-route')];record.result.ranked_businesses.slice(0,4).forEach((business,index)=>{const route=routes[index];if(!route)return;route.querySelector('b').textContent=`#${business.rank}`;route.querySelector('.locked-name').textContent=business.name;route.querySelector('.locked-name').dataset.computed='true';const score=document.createElement('small');score.textContent=`${Math.round(business.profile_match_score)}% Profile Match`;route.querySelector('article').appendChild(score);});}

(async()=>{try{({ENGINE_VERSIONS,normalizeAssessment,buildResult,profileCopy,formatCurrency}=await import('/shared/escapeplan-result-engine.mjs'));const record=page==='analysis-v2'?await calculate():await loadRecord();if(page==='analysis-v2')renderAnalysis(record);if(page==='result-v2')renderDNA(record);if(page==='match-v2')renderMatch(record);if(page==='unlock-v2')renderPaywall(record);if(page==='checkout_unlock_success_mobile')renderCheckout(record);}catch(error){failure(error);}})();
