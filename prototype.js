(function () {
  'use strict';

  const path = location.pathname.toLowerCase();
  const page = path.split('/').filter(Boolean).slice(-2, -1)[0] || 'home';
  const clean = (value) => (value || '').replace(/\s+/g, ' ').trim();
  const label = (element) => clean(element.textContent).toLowerCase();
  const route = (name) => `/${name}/code`;
  const isMobile = () => matchMedia('(max-width: 640px)').matches;
  const go = (desktop, mobile) => {
    location.href = route(isMobile() && mobile ? mobile : desktop);
  };

  const routes = {
    home: () => go('escapeplan_landing_page_desktop_refined', 'escapeplan_landing_page_mobile_refined'),
    quiz: () => location.href = route('assessment'),
    result: () => go('result_the_digital_operator_desktop', 'result_the_digital_operator_mobile'),
    paywall: () => go('curiosity_paywall_desktop', 'curiosity_paywall_mobile'),
    report: () => go('report_executive_summary_desktop', 'report_summary_dna_mobile')
  };

  const quizPages = [
    'quiz_question_1_mobile',
    'quiz_capital_question_desktop',
    'quiz_business_style_mobile',
    'quiz_risk_scenario_desktop',
    'quiz_final_question_mobile'
  ];
  const analysisPages = [
    'analysis_introduction_desktop',
    'analysis_capital_income_desktop',
    'analysis_model_comparison_desktop',
    'analysis_processing_mobile'
  ];
  const reportRoutes = {
    overview: 'report_executive_summary_desktop',
    matches: 'report_business_dna_all_matches_desktop',
    money: 'report_financial_fit_income_target_desktop',
    'quit plan': 'report_runway_quit_planner_desktop',
    '30 days': 'report_avoid_list_30_day_plan_desktop'
  };

  function makeClickable(element, handler) {
    if (element.tagName === 'A' && !element.getAttribute('href')) element.setAttribute('href', '#');
    element.removeAttribute('onclick');
    element.dataset.epWired = 'true';
    element.addEventListener('click', (event) => {
      event.preventDefault();
      handler(event);
    });
  }

  function toast(message) {
    let node = document.getElementById('ep-toast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'ep-toast';
      node.setAttribute('role', 'status');
      node.setAttribute('aria-live', 'polite');
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(node._timer);
    node._timer = setTimeout(() => node.classList.remove('show'), 2600);
  }

  function showPrototypeNotice(title) {
    let dialog = document.getElementById('ep-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'ep-dialog';
      dialog.innerHTML = '<form method="dialog"><h2>EscapePlan prototype</h2><p>This link is included for navigation testing. No account, payment, or support request is created.</p><button value="close">Close</button></form>';
      document.body.appendChild(dialog);
    }
    dialog.querySelector('h2').textContent = title || 'EscapePlan prototype';
    dialog.showModal();
  }

  function wireGlobalNavigation() {
    document.documentElement.style.scrollBehavior = 'smooth';
    const all = [...document.querySelectorAll('a, button')];
    all.forEach((element) => {
      const text = label(element);
      if (!text) return;
      if (text === 'escapeplan' || text.includes('escapeplan logo')) makeClickable(element, routes.home);
      else if (text.includes('take the test') || text.includes('find my business match') || text.startsWith('find mine')) makeClickable(element, routes.quiz);
      else if (text === 'how it works') makeClickable(element, () => scrollToLandingSection('how'));
      else if (text === 'sample result') makeClickable(element, () => scrollToLandingSection('sample'));
      else if (/privacy policy|terms of service|financial disclosure|contact support|^support$/.test(text)) makeClickable(element, () => showPrototypeNotice(clean(element.textContent)));
    });
    document.querySelectorAll('a[href=""], a:not([href])').forEach((link) => makeClickable(link, () => showPrototypeNotice(clean(link.textContent))));
    wireMobileMenu();
  }

  function scrollToLandingSection(kind) {
    const landing = page === 'home' || page.includes('landing_page');
    if (!landing) {
      sessionStorage.setItem('escapeplan-scroll-target', kind);
      routes.home();
      return;
    }
    const needles = kind === 'how' ? ['how it works', 'built for'] : ['sample result', 'digital operator', 'your top match'];
    const marker = [...document.querySelectorAll('h1, h2, h3, h4, p, span')]
      .find((node) => needles.some((needle) => label(node).includes(needle)));
    const target = document.getElementById(kind === 'how' ? 'how-it-works' : 'sample-result')
      || marker?.closest('section') || marker?.parentElement?.parentElement || document.body;
    if (!target.id) target.id = `escapeplan-${kind}`;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function wireMobileMenu() {
    if (page.startsWith('report_')) return;
    const menuButton = [...document.querySelectorAll('button')].find((button) => label(button) === 'menu');
    if (!menuButton) return;
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    menuButton.setAttribute('aria-expanded', 'false');
    makeClickable(menuButton, () => {
      let menu = document.getElementById('ep-mobile-menu');
      if (!menu) {
        menu = document.createElement('nav');
        menu.id = 'ep-mobile-menu';
        menu.setAttribute('aria-label', 'Mobile navigation');
        menu.innerHTML = '<button data-action="how">How it works</button><button data-action="sample">Sample result</button><button data-action="quiz">Take the test</button><button data-action="close" aria-label="Close navigation">Close</button>';
        document.body.appendChild(menu);
        menu.addEventListener('click', (event) => {
          const action = event.target.dataset.action;
          if (action === 'how' || action === 'sample') scrollToLandingSection(action);
          if (action === 'quiz') routes.quiz();
          if (action) menu.classList.remove('open');
          menuButton.setAttribute('aria-expanded', 'false');
        });
      }
      const open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      if (open) menu.querySelector('button').focus();
    });
  }

  function quizOptionButtons(index) {
    return [...document.querySelectorAll('button')].filter((button) => {
      const text = label(button);
      return text && !/continue|back|build my escapeplan|menu|take the test|how it works|sample result|close/.test(text);
    });
  }

  function wireQuiz() {
    const index = quizPages.indexOf(page);
    if (index < 0) return;
    document.body.dataset.quizStep = String(index + 1);
    let progress = document.getElementById('ep-progress');
    if (!progress) {
      progress = document.createElement('div');
      progress.id = 'ep-progress';
      progress.innerHTML = `<span>Question ${index + 1} of ${quizPages.length}</span><div><i style="width:${((index + 1) / quizPages.length) * 100}%"></i></div>`;
      document.body.prepend(progress);
    }
    const key = `escapeplan-answer-${index}`;
    const options = quizOptionButtons(index);
    const saved = sessionStorage.getItem(key);
    const continueButton = [...document.querySelectorAll('button, a')].find((item) => /^(continue\b|build my escapeplan\b)/.test(label(item)));
    const backButton = [...document.querySelectorAll('button, a')].find((item) => /(^| )back( |$)/.test(label(item)) || label(item) === 'arrow_back');
    const closeButton = [...document.querySelectorAll('button, a')].find((item) => label(item) === 'close');

    options.forEach((button, optionIndex) => {
      button.disabled = false;
      button.removeAttribute('disabled');
      button.setAttribute('aria-pressed', String(saved === String(optionIndex)));
      if (saved === String(optionIndex)) button.classList.add('ep-selected');
      makeClickable(button, () => {
        options.forEach((item) => { item.classList.remove('ep-selected'); item.setAttribute('aria-pressed', 'false'); });
        button.classList.add('ep-selected');
        button.setAttribute('aria-pressed', 'true');
        sessionStorage.setItem(key, String(optionIndex));
        if (continueButton) { continueButton.disabled = false; continueButton.removeAttribute('aria-disabled'); }
      });
    });

    const selectionRequired = index < quizPages.length - 1 && options.length > 0;
    if (continueButton) {
      if (selectionRequired && saved === null) { continueButton.disabled = true; continueButton.setAttribute('aria-disabled', 'true'); }
      makeClickable(continueButton, () => {
        if (selectionRequired && sessionStorage.getItem(key) === null) { toast('Choose one option to continue.'); return; }
        if (index === quizPages.length - 1) location.href = route(analysisPages[0]);
        else location.href = route(quizPages[index + 1]);
      });
    } else if (index === 3) {
      const next = document.createElement('button');
      next.id = 'ep-continue';
      next.textContent = 'Continue →';
      next.disabled = saved === null;
      document.body.appendChild(next);
      makeClickable(next, () => {
        if (sessionStorage.getItem(key) === null) { toast('Choose one option to continue.'); return; }
        location.href = route(quizPages[index + 1]);
      });
      options.forEach((button) => button.addEventListener('click', () => { next.disabled = false; }));
    }
    if (backButton) makeClickable(backButton, () => index ? location.href = route(quizPages[index - 1]) : routes.home());
    if (closeButton) makeClickable(closeButton, () => index ? location.href = route(quizPages[index - 1]) : routes.home());
  }

  function wireAnalysis() {
    const index = analysisPages.indexOf(page);
    if (index >= 0) {
      const status = document.createElement('div');
      status.id = 'ep-analysis-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.innerHTML = '<span>Analyzing demo answers…</span><div><i></i></div><strong>0%</strong>';
      document.body.appendChild(status);
      let value = index * 22;
      const timer = setInterval(() => {
        value = Math.min(100, value + 4);
        status.querySelector('i').style.width = `${value}%`;
        status.querySelector('strong').textContent = `${value}%`;
        if (value >= Math.min(96, (index + 1) * 24)) {
          clearInterval(timer);
          setTimeout(() => {
            if (index < analysisPages.length - 1) location.href = route(analysisPages[index + 1]);
            else location.href = route(isMobile() ? 'analysis_ready_mobile' : 'analysis_complete_desktop');
          }, 500);
        }
      }, 80);
    }
    if (page === 'analysis_ready_mobile' || page === 'analysis_complete_desktop') {
      [...document.querySelectorAll('a, button')].filter((item) => label(item).includes('see my escapeplan')).forEach((item) => makeClickable(item, routes.result));
    }
  }

  function wireResultAndPaywall() {
    if (page.startsWith('result_the_')) {
      [...document.querySelectorAll('a, button')].filter((item) => /see what else matched|see all matched paths|full report|unlock/.test(label(item))).forEach((item) => makeClickable(item, routes.paywall));
    }
    if (page.startsWith('curiosity_paywall')) {
      [...document.querySelectorAll('a, button')].filter((item) => /unlock full plan|reveal my full plan/.test(label(item))).forEach((item) => makeClickable(item, () => location.href = route('checkout_unlock_success_mobile')));
      const badge = document.createElement('p');
      badge.id = 'ep-demo-badge';
      badge.textContent = '₹199 demo checkout · no real charge';
      document.body.appendChild(badge);
    }
  }

  function wireCheckout() {
    if (page !== 'checkout_unlock_success_mobile') return;
    const paymentButtons = [...document.querySelectorAll('button, a')].filter((item) => /credit\/debit|upi/.test(label(item)));
    paymentButtons.forEach((button) => makeClickable(button, () => {
      paymentButtons.forEach((item) => { item.classList.remove('ep-selected'); item.setAttribute('aria-pressed', 'false'); });
      button.classList.add('ep-selected');
      button.setAttribute('aria-pressed', 'true');
    }));
    const pay = [...document.querySelectorAll('button, a')].find((item) => /pay ₹199 now|continue demo|unlock my escapeplan|preview my unlocked escapeplan/.test(label(item))) || document.getElementById('pay-btn');
    const open = [...document.querySelectorAll('button, a')].find((item) => label(item).includes('open my full report'));
    if (open) { open.hidden = true; makeClickable(open, routes.report); }
    if (pay) {
      pay.innerHTML = 'Preview My Unlocked EscapePlan <span aria-hidden="true">→</span>';
      makeClickable(pay, () => {
        sessionStorage.setItem('escapeplan-demo-unlocked', 'true');
        const checkoutState = document.getElementById('checkout-state');
        const successState = document.getElementById('success-state');
        if (checkoutState && successState) {
          checkoutState.hidden = true;
          successState.hidden = false;
        } else pay.hidden = true;
        if (open) { open.hidden = false; open.focus(); }
        toast('Your EscapePlan is unlocked.');
      });
    }
  }

  function wireReport() {
    if (!page.startsWith('report_')) return;
    document.body.classList.add('ep-report-mode');

    const activePage = page === 'report_summary_dna_mobile' ? reportRoutes.overview : page;
    const sectionLabels = {
      overview: 'Overview',
      matches: 'Matches',
      money: 'Money',
      'quit plan': 'Quit Plan',
      '30 days': '30 Days'
    };
    const mobileLabels = {
      overview: 'Overview',
      matches: 'Business Matches',
      money: 'Money Plan',
      'quit plan': 'Quit Plan',
      '30 days': '30-Day Plan'
    };
    const links = (labels) => Object.entries(reportRoutes).map(([name, target]) =>
      `<a href="${route(target)}"${activePage === target ? ' aria-current="page"' : ''}>${labels[name]}</a>`
    ).join('');

    const header = document.createElement('header');
    header.id = 'ep-report-header';
    header.innerHTML = `
      <a class="ep-report-brand ep-brand-logo" href="${route(reportRoutes.overview)}" aria-label="Your EscapePlan overview">
        <img alt="EscapePlan" src="/escapeplan_logo/screen.png">
      </a>
      <nav id="ep-report-nav" aria-label="Full report sections">${links(sectionLabels)}</nav>
      <button id="ep-report-menu-button" type="button" aria-expanded="false" aria-controls="ep-report-mobile-menu">Sections</button>
      <nav id="ep-report-mobile-menu" aria-label="Report sections">
        ${links(mobileLabels)}
        <button type="button" data-action="close">Close</button>
      </nav>`;
    document.body.prepend(header);

    const menuButton = header.querySelector('#ep-report-menu-button');
    const mobileMenu = header.querySelector('#ep-report-mobile-menu');
    makeClickable(menuButton, () => {
      const open = mobileMenu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      if (open) mobileMenu.querySelector('a').focus();
    });
    mobileMenu.querySelector('[data-action="close"]').addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.focus();
    });

    const maintenance = document.createElement('aside');
    maintenance.id = 'ep-report-maintenance';
    maintenance.setAttribute('aria-label', 'Report preferences');
    maintenance.innerHTML = `<a href="${route('assessment')}">Update My Answers</a><p>Your recommendations may change if your situation changes.</p>`;
    document.body.appendChild(maintenance);
    [...document.querySelectorAll('button, a')].forEach((item) => {
      const text = label(item);
      if (/^(how it works|sample result|take the test)$/.test(text) && !item.closest('#ep-report-header')) item.hidden = true;
      if (text.includes('access full blueprint') || text.includes('explore full analysis')) makeClickable(item, () => location.href = route(reportRoutes.matches));
      if (text.includes('view strategy')) makeClickable(item, () => location.href = route(reportRoutes['quit plan']));
      if ((text.includes('retake assessment') || text.includes('update answers')) && !item.closest('#ep-report-maintenance')) item.hidden = true;
      if (text.includes('download pdf')) makeClickable(item, () => toast('PDF export is represented in this prototype; no file was generated.'));
      if (/expand_more/.test(text)) {
        item.setAttribute('aria-expanded', 'false');
        makeClickable(item, () => {
          const expanded = item.getAttribute('aria-expanded') === 'true';
          item.setAttribute('aria-expanded', String(!expanded));
          item.classList.toggle('ep-expanded', !expanded);
        });
      }
    });
  }

  function finishClickableAudit() {
    [...document.querySelectorAll('a, button, [role="button"]')].forEach((element) => {
      if (element.matches('a') && (!element.getAttribute('href') || element.getAttribute('href') === '#') && !element.dataset.epWired) {
        element.addEventListener('click', (event) => { event.preventDefault(); showPrototypeNotice(clean(element.textContent)); });
      }
      if (!element.hasAttribute('aria-label') && !clean(element.textContent)) element.setAttribute('aria-label', 'Interactive control');
    });
  }

  function init() {
    wireGlobalNavigation();
    wireQuiz();
    wireAnalysis();
    wireResultAndPaywall();
    wireCheckout();
    wireReport();
    finishClickableAudit();
    const target = sessionStorage.getItem('escapeplan-scroll-target');
    if (target && page.includes('landing_page')) {
      sessionStorage.removeItem('escapeplan-scroll-target');
      setTimeout(() => scrollToLandingSection(target), 100);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
