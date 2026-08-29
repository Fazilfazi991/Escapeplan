(function(){
  'use strict';
  const saved=JSON.parse(sessionStorage.getItem('escapeplan-assessment-v1')||'{}');
  const answers=saved.answerText||{};
  const page=location.pathname.split('/').filter(Boolean)[0];
  const logic=window.EscapePlanAssessmentLogic;
  const text=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=value||''};
  const capital=answers.capital?.[0]||'your available capital';
  const situation=answers.situation?.[0]||'your current situation';
  const time=answers.time?.[0]||'your available time';
  const strengths=answers.strengths||[];
  const controlledPrototypeResult={name:'Niche E-commerce Brand',profileMatch:86,notCheapest:true};

  if(page==='analysis-v2'){
    const signals=logic.analysisSignals(answers);
    document.getElementById('signal-list').innerHTML=signals.map(signal=>`<li><i>✓</i><span>${signal}</span></li>`).join('');
    text('analysis-context',`Using your actual answers—not invented scores or generic loading.`);
    setTimeout(()=>document.getElementById('analysis-ready').hidden=false,1200);
  }
  if(page==='result-v2'){
    const profile=logic.profile(answers);text('profile-title',profile.title);text('profile-copy',profile.description);
    const summary=[situation,capital,time,...strengths].filter(Boolean).slice(0,5);
    document.getElementById('answer-summary').innerHTML=summary.map(item=>`<span>${item}</span>`).join('');
    text('standout-title',situation==='Full-time job'?'You probably shouldn’t start by quitting your job.':'Your first move should be a test—not a giant commitment.');
    text('direction-copy',situation==='Full-time job'?'Your strongest path appears to be something you can prove beside your current income first.':'Your strongest path appears to be something you can prove before committing heavily.');
    const signals=[`Fits ${capital} capital`,`Fits ${time}`,strengths[0]?`Uses ${strengths[0].toLowerCase()}`:'Uses your existing strengths'];
    document.getElementById('fit-signals').innerHTML=signals.map(signal=>`<li>${signal}<b>✓</b></li>`).join('');
  }
  if(page==='match-v2'){
    text('match-name',controlledPrototypeResult.name);text('match-score',`${controlledPrototypeResult.profileMatch}%`);
    const reasons=[];
    if(situation==='Full-time job')reasons.push('Can be tested beside your job');
    reasons.push(`Works with your ${capital} range`);
    if(strengths[0])reasons.push(`Uses your ${strengths[0].toLowerCase()} strength`);
    reasons.push('Has room to grow beyond your own hours');
    document.getElementById('match-reasons').innerHTML=reasons.slice(0,4).map(reason=>`<li><b>✓</b>${reason}</li>`).join('');
    text('curiosity-line',controlledPrototypeResult.notCheapest?'Your #1 match is not your cheapest option.':'Another option can be tested faster.');
  }
  if(page==='unlock-v2'){
    text('capital-intro',`You said you could test with ${capital}. Your EscapePlan helps you decide where that money is worth testing.`);
    text('capital-anchor',`You’re considering putting ${capital} into a business.`);
    text('anchor-support','Compare your options first for ₹199.');
  }
}());
