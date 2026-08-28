(function () {
  'use strict';

  const questions = [
    {
      id: 'situation', stage: 'Your situation', title: 'Where are you now?',
      help: 'Choose the option that best describes your current situation.', max: 1,
      options: ['Full-time job', 'Student', 'Already run a business', 'Ready to start now']
    },
    {
      id: 'motivation', stage: 'What you want', title: 'What do you want a business to change?',
      help: 'Choose up to two. This helps us understand what “better” means to you.', max: 2,
      options: ['Extra income', 'Leave my job eventually', 'Build long-term wealth', 'More freedom / flexibility', 'Build something of my own', 'Exploring']
    },
    {
      id: 'capital', stage: 'Your money', title: 'How much can you safely invest?',
      help: 'Choose an amount you could invest without putting essential expenses at risk.', max: 1,
      options: ['Under ₹25K', '₹25K–₹1L', '₹1L–₹3L', '₹3L–₹7L', '₹7L+']
    },
    {
      id: 'time', stage: 'Your time', title: 'How much time can you realistically give it?',
      help: 'Think about a normal week, not your most motivated week.', max: 1,
      options: ['1 hour/day', '2–3 hours/day', '4–6 hours/day', 'Full-time']
    },
    {
      id: 'environment', stage: 'How you want to work', title: 'Which business environment attracts you?',
      help: 'There is no better choice—only the one that fits how you want to operate.', max: 1,
      options: ['Online', 'Physical / local', 'A mix', 'No preference']
    },
    {
      id: 'strengths', stage: 'Your advantages', title: 'What are your strongest advantages?',
      help: 'Choose up to two strengths you could use from day one.', max: 2,
      options: ['Sales', 'Technology', 'Creative / content', 'Products / sourcing', 'Operations', 'Networking', 'Numbers / analysis', 'Not sure']
    },
    {
      id: 'tradeoff', stage: 'Your trade-off', title: 'What matters more right now?',
      help: 'Choose the direction that feels closer to how you want to build.', max: 1, visual: true,
      options: ['Start earning sooner', 'Balance speed and scale', 'Build something bigger']
    }
  ];

  const insights = {
    1: { title: 'Got it.', copy: 'Now we know what you’re trying to change.' },
    3: { title: 'This changes things.', copy: 'Your available time and capital already make some business models more realistic than others.' },
    5: { title: 'Interesting…', copy: 'We’re starting to see a pattern in how you want to work.' }
  };

  const conditionalQuestions = {
    runway: {
      id: 'runway', stage: 'Quick follow-up', title: 'How many months of expenses could your savings cover?',
      help: 'A rough estimate is enough. This will later help shape a safer transition plan.', max: 1,
      options: ['Less than 1 month', '1–3 months', '4–6 months', 'More than 6 months']
    },
    operations: {
      id: 'operations', stage: 'Quick follow-up', title: 'Are you comfortable managing staff or inventory?',
      help: 'This helps us distinguish between hands-on local models and lighter operating models.', max: 1,
      options: ['Yes, comfortable with both', 'Staff, but not inventory', 'Inventory, but not staff', 'Prefer neither']
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
    insightTitle: document.getElementById('insight-title'), insightCopy: document.getElementById('insight-copy')
  };

  function loadState() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      return saved && typeof saved === 'object' ? { index: 0, mode: 'core', followupIndex: 0, followupIds: [], answers: {}, insightAfter: null, ...saved } : { index: 0, mode: 'core', followupIndex: 0, followupIds: [], answers: {}, insightAfter: null };
    } catch (_) { return { index: 0, mode: 'core', followupIndex: 0, followupIds: [], answers: {}, insightAfter: null }; }
  }

  function saveState() { sessionStorage.setItem(storageKey, JSON.stringify(state)); }
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
    nodes.progressStage.textContent = state.mode === 'core' ? `Step ${state.index + 1} of ${questions.length} · ${question.stage}` : question.stage;
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
    saveState();
    render();
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
      location.href = '/analysis_introduction_desktop/code';
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
