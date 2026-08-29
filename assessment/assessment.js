(function () {
  'use strict';

  const questions = [
    {
      id: 'motivation', stage: 'What you want', title: 'What are you trying to change right now?',
      help: 'Choose the one that matters most today.', max: 1,
      options: ['I want more income', 'I want out of my job eventually', 'I want something of my own', 'I want to build real wealth', 'I’m just exploring']
    },
    {
      id: 'situation', stage: 'Your life today', title: 'What does your life look like today?',
      help: 'This tells us what a realistic first move looks like.', max: 1,
      options: ['Full-time job', 'Studying', 'Already running a business', 'Ready to go full-time', 'Between jobs']
    },
    {
      id: 'capital', stage: 'Your money', title: 'If the right business appeared tomorrow, what could you comfortably test with?',
      help: 'Not everything. Just an amount you could test without risking essential expenses.', max: 1,
      options: ['Under ₹25K', '₹25K–₹1L', '₹1L–₹3L', '₹3L–₹7L', '₹7L+']
    },
    {
      id: 'time', stage: 'Your time', title: 'Be realistic — how much time can this get from you?',
      help: 'Think about a normal week, not your most motivated one.', max: 1,
      options: ['1 hour/day', '2–3 hours/day', '4–6 hours/day', 'Full-time']
    },
    {
      id: 'environment', stage: 'How you want to work', title: 'Which kind of work sounds more like you?',
      help: 'Choose the operating style that feels most natural.', max: 1,
      options: ['Sell or build through the internet', 'Run something people can visit / use locally', 'Combine both', 'I don’t care — show me what fits']
    },
    {
      id: 'strengths', stage: 'Your advantages', title: 'What do people already rely on you for?',
      help: 'Choose up to two. Existing advantages can change what is realistic.', max: 2,
      options: ['Selling / convincing', 'Technology / systems', 'Creative ideas / content', 'Finding products / deals', 'Managing people / operations', 'Networking', 'Numbers / analysis', 'Nothing obvious yet']
    },
    {
      id: 'tradeoff', stage: 'Your final trade-off', title: 'Which outcome matters more to you right now?',
      help: 'Choose where you sit between speed and long-term scale.', max: 1, visual: true,
      options: ['Money sooner', 'Balanced', 'Growth first', 'Build for the long term']
    }
  ];

  const insights = {
    1: { title: 'We already know something important.', copy: 'You need a path that fits your life before it asks you to change it.' },
    3: { title: 'Your path is narrowing.', copy: 'Capital ✓  Time ✓  Lifestyle ✓' },
    5: { title: 'Okay… this is getting interesting.', copy: 'Your answers now point toward a clearer operating style.' }
  };

  const conditionalQuestions = {
    runway: {
      id: 'runway', stage: 'One useful follow-up', title: 'If your salary stopped tomorrow, how long would your savings last?',
      help: 'A rough answer is enough.', max: 1,
      options: ['Less than 2 months', '2–4 months', '5–7 months', '8–12 months', '1 year+']
    },
    operations: {
      id: 'operations', stage: 'One useful follow-up', title: 'How do you feel about staff and inventory?',
      help: 'This can materially change which local models stay realistic.', max: 1,
      options: ['Avoid both', 'Inventory is okay', 'Staff is okay', 'Comfortable with both']
    }
  };

  const storageKey = 'escapeplan-assessment-v1';
  const state = loadState();
  const nodes = {
    main: document.getElementById('assessment'), questionView: document.getElementById('question-view'),
    insightView: document.getElementById('insight-view'), category: document.getElementById('question-category'),
    title: document.getElementById('question-title'), help: document.getElementById('question-help'),
    options: document.getElementById('option-list'), progressStage: document.getElementById('progress-stage'),
    progressLabel: document.getElementById('progress-label'), progressBar: document.getElementById('progress-bar'),
    actions: document.getElementById('assessment-actions'), continueButton: document.getElementById('continue-button'),
    continueLabel: document.querySelector('#continue-button span:first-child'), backButton: document.querySelector('[data-action="back"]'),
    reaction: document.getElementById('reaction'), reactionTitle: document.getElementById('reaction-title'), reactionCopy: document.getElementById('reaction-copy'),
    insightTitle: document.getElementById('insight-title'), insightCopy: document.getElementById('insight-copy')
  };

  function loadState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey));
      return saved && typeof saved === 'object' ? { index: 0, mode: 'core', followupIndex: 0, followupIds: [], answers: {}, answerText: {}, insightAfter: null, ...saved } : { index: 0, mode: 'core', followupIndex: 0, followupIds: [], answers: {}, answerText: {}, insightAfter: null };
    } catch (_) { return { index: 0, mode: 'core', followupIndex: 0, followupIds: [], answers: {}, answerText: {}, insightAfter: null }; }
  }

  function saveState() { const serialized = JSON.stringify(state); sessionStorage.setItem(storageKey, serialized); localStorage.setItem(storageKey, serialized); }
  function selectedFor(id) { return Array.isArray(state.answers[id]) ? state.answers[id] : []; }
  function activeQuestion() { return state.mode === 'followup' ? conditionalQuestions[state.followupIds[state.followupIndex]] : questions[state.index]; }
  function conditionalQueue() {
    const queue = [];
    if (selectedFor('situation').includes(0)) queue.push('runway');
    if (selectedFor('environment').includes(1)) queue.push('operations');
    return queue;
  }

  function render() {
    const question = activeQuestion();
    const selected = selectedFor(question.id);
    const percent = state.mode === 'core' ? Math.round(((state.index + 1) / questions.length) * 92) : 96 + state.followupIndex;
    const stage = EscapePlanAssessmentLogic.progressStage(question.id);
    nodes.progressStage.textContent = state.mode === 'core' ? `${stage} · YOUR PATH IS TAKING SHAPE` : 'FIT · ONE USEFUL FOLLOW-UP';
    nodes.progressLabel.textContent = `${percent}% complete`;
    nodes.progressBar.style.transform = `scaleX(${percent / 100})`;
    nodes.category.textContent = question.stage;
    nodes.title.textContent = question.title;
    nodes.help.textContent = question.help;
    nodes.options.className = `option-list${question.visual ? ' option-list--tradeoff' : ''}`;
    nodes.options.setAttribute('aria-label', question.max > 1 ? `Choose up to ${question.max}` : 'Choose one');
    nodes.options.innerHTML = question.options.map((option, optionIndex) => {
      const active = selected.includes(optionIndex);
      return `<button class="option-card${active ? ' is-selected' : ''}" type="button" data-option="${optionIndex}" aria-pressed="${active}">
        <span class="option-indicator" aria-hidden="true">${active ? '✓' : ''}</span><span class="option-label">${option}</span>
      </button>`;
    }).join('');
    nodes.continueButton.disabled = selected.length === 0;
    nodes.continueButton.setAttribute('aria-disabled', String(selected.length === 0));
    const finalFollowup = state.mode === 'followup' && state.followupIndex === state.followupIds.length - 1;
    const finalCoreWithoutFollowup = state.mode === 'core' && state.index === questions.length - 1 && conditionalQueue().length === 0;
    nodes.continueLabel.textContent = finalFollowup || finalCoreWithoutFollowup ? 'Build My EscapePlan' : 'Continue';
    nodes.backButton.disabled = state.mode === 'core' && state.index === 0;
    nodes.questionView.hidden = false;
    nodes.insightView.hidden = true;
    nodes.actions.hidden = false;
    nodes.reaction.hidden = true;
    nodes.main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function selectOption(optionIndex) {
    const question = activeQuestion();
    const selected = selectedFor(question.id);
    if (question.max === 1) state.answers[question.id] = [optionIndex];
    else if (selected.includes(optionIndex)) state.answers[question.id] = selected.filter((value) => value !== optionIndex);
    else if (selected.length < question.max) state.answers[question.id] = [...selected, optionIndex];
    else state.answers[question.id] = [selected[1], optionIndex];
    state.answerText[question.id] = EscapePlanAssessmentLogic.answerLabels(question, state.answers);
    saveState();
    render();
    const latest = state.answerText[question.id]?.at(-1);
    const narration = AssessmentNarrator.fallback({
      user_state: state.answerText, current_rank_signals: [], allowed_question_types: conditionalQueue(),
      latest_answer: latest, progress_stage: EscapePlanAssessmentLogic.progressStage(question.id), question_id: question.id
    });
    nodes.reactionTitle.textContent = narration.reaction;
    nodes.reactionCopy.textContent = narration.supporting_copy;
    nodes.reaction.hidden = false;
  }

  function showInsight(afterIndex) {
    const insight = insights[afterIndex];
    if (!insight) return false;
    state.insightAfter = afterIndex;
    saveState();
    nodes.insightTitle.textContent = insight.title;
    nodes.insightCopy.textContent = insight.copy;
    nodes.questionView.hidden = true;
    nodes.insightView.hidden = false;
    nodes.actions.hidden = true;
    nodes.main.focus({ preventScroll: true });
    return true;
  }

  function showFinalInsight() {
    state.insightAfter = 'final';
    saveState();
    nodes.insightTitle.textContent = 'That’s enough.';
    nodes.insightCopy.textContent = 'Let’s build your EscapePlan.';
    nodes.questionView.hidden = true;
    nodes.insightView.hidden = false;
    nodes.actions.hidden = true;
    nodes.main.focus({ preventScroll: true });
  }

  function continueAssessment() {
    const question = activeQuestion();
    if (!selectedFor(question.id).length) return;
    if (state.mode === 'followup') {
      if (state.followupIndex < state.followupIds.length - 1) {
        state.followupIndex += 1;
        saveState();
        render();
      } else showFinalInsight();
      return;
    }
    if (showInsight(state.index)) return;
    if (state.index === questions.length - 1) {
      state.followupIds = conditionalQueue();
      if (state.followupIds.length) {
        state.mode = 'followup';
        state.followupIndex = 0;
        saveState();
        render();
      } else showFinalInsight();
      return;
    }
    state.index += 1;
    saveState();
    render();
  }

  function continueAfterInsight() {
    const completed = state.insightAfter === 'final';
    state.insightAfter = null;
    if (completed) {
      saveState();
      location.href = '/analysis-v2/code';
      return;
    }
    state.index += 1;
    saveState();
    render();
  }

  function goBack() {
    if (state.mode === 'followup') {
      if (state.followupIndex > 0) state.followupIndex -= 1;
      else { state.mode = 'core'; state.index = questions.length - 1; }
      state.insightAfter = null;
      saveState();
      render();
      return;
    }
    if (state.index === 0) return;
    state.index -= 1;
    state.insightAfter = null;
    saveState();
    render();
  }

  document.addEventListener('click', (event) => {
    const option = event.target.closest('[data-option]');
    if (option) { selectOption(Number(option.dataset.option)); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'continue') continueAssessment();
    if (action === 'back') goBack();
    if (action === 'exit') location.href = '/';
    if (action === 'insight-continue') continueAfterInsight();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && document.activeElement === nodes.continueButton && !nodes.continueButton.disabled) continueAssessment();
  });

  if (state.insightAfter === 'final') showFinalInsight();
  else if (state.insightAfter !== null && insights[state.insightAfter]) showInsight(state.insightAfter);
  else render();
}());
