(function (global) {
  'use strict';

  const stageByQuestion = {
    motivation: 'GOAL', situation: 'GOAL', capital: 'MONEY', time: 'MONEY',
    environment: 'STYLE', strengths: 'STYLE', tradeoff: 'FIT', runway: 'FIT', operations: 'FIT'
  };

  function answerLabels(question, answers) {
    return (answers[question.id] || []).map((index) => question.options[index]).filter(Boolean);
  }

  function allowedFollowups(state) {
    const allowed = [];
    if ((state.answerText.situation || []).includes('Full-time job')) allowed.push('runway');
    if ((state.answerText.environment || []).includes('Run something people can visit / use locally')) allowed.push('operations');
    return allowed;
  }

  function progressStage(questionId) { return stageByQuestion[questionId] || 'FIT'; }

  function analysisSignals(answerText) {
    const signals = [];
    const capital = answerText.capital?.[0];
    const time = answerText.time?.[0];
    const situation = answerText.situation?.[0];
    const strengths = answerText.strengths || [];
    const tradeoff = answerText.tradeoff?.[0];
    if (capital) signals.push(`Protecting your ${capital} test range`);
    if (situation === 'Full-time job') signals.push('Prioritising options you can validate beside your salary');
    if (time) signals.push(`Filtering for a realistic ${time} commitment`);
    if (strengths.length) signals.push(`Matching your ${strengths.join(' + ').toLowerCase()} advantage`);
    if (tradeoff) signals.push(`Checking your “${tradeoff.toLowerCase()}” preference`);
    return signals.slice(0, 5);
  }

  function profile(answerText) {
    const strengths = answerText.strengths || [];
    const environment = answerText.environment?.[0] || '';
    const title = strengths.includes('Selling / convincing') && strengths.includes('Technology / systems')
      ? 'The Commercial Technologist'
      : environment.includes('internet') ? 'The Digital Builder' : 'The Practical Builder';
    const description = environment.includes('internet')
      ? 'You are drawn to businesses that can be tested lean, improved quickly and scaled through systems.'
      : 'You favour practical businesses where execution, customer understanding and steady validation matter.';
    return { title, description };
  }

  global.EscapePlanAssessmentLogic = Object.freeze({ answerLabels, allowedFollowups, progressStage, analysisSignals, profile });
}(window));
