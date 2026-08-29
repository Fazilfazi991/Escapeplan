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
    text('direction-copy',situation==='Full-time job'?'Your shortlist should favour ideas that can prove demand beside your salary.':'Your shortlist should match the commitment you can make now.');
  }
  if(page==='unlock-v2'){
    text('capital-anchor',`You’re considering using ${capital} to test a business decision.`);
    text('anchor-support','Compare the paths before you commit the bigger amount.');
  }
}());
