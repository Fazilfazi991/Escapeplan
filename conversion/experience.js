(function(){
  'use strict';
  let saved={};
  try{saved=JSON.parse(sessionStorage.getItem('escapeplan-assessment-v1')||'{}')}catch(_){saved={}}
  const answers=saved.answerText||{};
  const page=location.pathname.split('/').filter(Boolean)[0];
  const logic=window.EscapePlanAssessmentLogic;
  const first=(key,fallback)=>answers[key]?.[0]||fallback;
  const set=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=value||''};
  const capital=first('capital','your available test budget');
  const situation=first('situation','your current situation');
  const time=first('time','your available time');
  const motivation=first('motivation','');
  const environment=first('environment','');
  const tradeoff=first('tradeoff','');
  const strengths=answers.strengths||[];
  const isEmployed=situation==='Full-time job';
  const result={name:'Niche E-commerce Brand'};
  const brand=document.querySelector('.cv-brand');
  if(brand){brand.removeAttribute('href');brand.setAttribute('role','img');brand.setAttribute('aria-label','EscapePlan');brand.tabIndex=-1}

  function safeReasons(){
    const reasons=[];
    if(isEmployed)reasons.push('Can be tested beside your job');
    if(answers.capital?.length)reasons.push(`Fits the ${capital} range you selected`);
    if(answers.time?.length)reasons.push(`Can be shaped around ${time}`);
    if(strengths[0])reasons.push(`Uses your ${strengths[0].toLowerCase()} advantage`);
    return reasons.slice(0,4);
  }

  if(page==='analysis-v2'){
    const labels=['Commerce','Software','Food','Retail','Services','Marketplace','Rental','Education','Automotive','Content'];
    document.getElementById('category-nodes').innerHTML=labels.map((name,index)=>`<span style="--n:${index}">${name}</span>`).join('');
    const signals=[answers.capital?.length?`Your money: ${capital}`:'Your money',answers.time?.length?`Your available time: ${time}`:'Your available time',strengths[0]?`Your strongest advantage: ${strengths[0]}`:'Your strongest advantage',environment?`Your working style: ${environment}`:'Your working style'];
    document.getElementById('signal-list').innerHTML=signals.map((signal,index)=>`<li style="--delay:${index}"><span>${signal}</span><b>✓</b></li>`).join('');
    setTimeout(()=>document.getElementById('analysis-ready').hidden=false,1250);
  }

  if(page==='result-v2'){
    const profile=logic.profile(answers);set('profile-title',profile.title);
    set('profile-copy',environment.includes('internet')?'You are better suited to testing lean, learning quickly, then putting bigger money behind what works.':'You are better suited to proving demand first, then committing more to what works.');
    const traits=[['LOW OVERHEAD',answers.capital?.length?'Capital-conscious':'Important'],['SIDE-BUSINESS FIT',isEmployed?'Strong signal':'Considered'],['EXISTING ADVANTAGE',strengths.length?'Present':'Still emerging'],['SCALABILITY NEED',tradeoff||'Balanced']];
    document.getElementById('dna-bars').innerHTML=traits.map(([name,value],index)=>`<div style="--fill:${isEmployed||index!==1?78-index*7:62}%"><span>${name}<b>${value}</b></span><i><em></em></i></div>`).join('');
    set('standout-title',isEmployed?'Your strongest path does not require you to quit your job first.':'Your strongest path starts with a realistic first test.');
    document.getElementById('fit-signals').innerHTML=safeReasons().slice(0,3).map(reason=>`<li>${reason}<b>✓</b></li>`).join('');
  }

  if(page==='match-v2'){
    set('match-name',result.name);
    const note=document.querySelector('.score-note'); if(note)note.textContent='This recommendation reflects alignment with your answers—not probability of success.';
    document.getElementById('match-reasons').innerHTML=safeReasons().map(reason=>`<li><b>✓</b><span>${reason}</span></li>`).join('');
    set('curiosity-line','Your strongest path is only one way to fit your answers.');
    const notes=document.querySelectorAll('.map-route small');
    ['Strongest fit','Compared by test capital','Compared by validation speed','Compared by side-business fit'].forEach((value,index)=>{if(notes[index])notes[index].textContent=value});
  }

  if(page==='unlock-v2'){
    set('capital-value',answers.capital?.length?capital:'Your test budget');
    set('capital-intro',answers.capital?.length?`You said you could test with ${capital}. Compare the routes before you commit it.`:'Compare your routes before you commit your test budget.');
    let headline='Compare the paths before you spend the bigger money.';
    if(motivation.includes('out of my job'))headline='Before you leave your salary behind, compare the paths that can start beside it.';
    else if(capital==='Under ₹25K')headline='You don’t have money to waste testing the wrong model.';
    else if(capital==='₹3L–₹7L'||capital==='₹7L+')headline=`Before you put ${capital} behind one idea, compare the alternatives.`;
    else if(tradeoff==='Money sooner')headline='Compare the paths by speed before you bet on one.';
    else if(environment.includes('internet'))headline='Compare the digital paths before you commit to one.';
    set('paywall-headline',headline);
    const previewLink=document.querySelector('.price-panel .cv-button');
    if(previewLink)previewLink.innerHTML='Preview the ₹199 Unlock <span aria-hidden="true">→</span>';
    const trust=document.querySelector('.trust-line');
    if(trust)trust.innerHTML='<span>No charge in preview</span><span>Instant access shown</span><span>No subscription</span>';
  }
}());
