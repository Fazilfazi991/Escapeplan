import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const desktop = fs.readFileSync(path.join(root, 'escapeplan_landing_page_desktop_refined/code.html'), 'utf8');
const mobile = fs.readFileSync(path.join(root, 'escapeplan_landing_page_mobile_refined/code.html'), 'utf8');
const prototype = fs.readFileSync(path.join(root, 'prototype.js'), 'utf8');
const assessment = fs.readFileSync(path.join(root, 'assessment/assessment.js'), 'utf8');
const assessmentHtml = fs.readFileSync(path.join(root, 'assessment/code.html'), 'utf8');
const core = fs.readFileSync(path.join(root, 'shared/escapeplan-core.js'), 'utf8');
const narrator = fs.readFileSync(path.join(root, 'assessment/assessment-narrator.js'), 'utf8');
const requiredLandingMarkup = [
  'href="/assessment/code"',
  'href="#how-it-works"',
  'href="#sample-result"',
  'id="how-it-works"',
  'id="sample-result"'
];

for (const marker of requiredLandingMarkup) {
  if (!desktop.includes(marker)) throw new Error(`Desktop landing is missing ${marker}`);
}

for (const marker of ['href="/assessment/code"', 'id="how-it-works"', 'id="sample-result"']) {
  if (!mobile.includes(marker)) throw new Error(`Mobile landing is missing ${marker}`);
}

if (!prototype.includes("page === 'home' || page.includes('landing_page')")) {
  throw new Error('Root URL must be classified as a landing page for in-page navigation');
}
if (!prototype.includes("document.getElementById(kind === 'how' ? 'how-it-works' : 'sample-result')")) {
  throw new Error('Landing navigation must target explicit section IDs before matching text');
}
if (!prototype.includes("if (!target.id) target.id = `escapeplan-${kind}`")) {
  throw new Error('Landing navigation must preserve explicit section IDs');
}
if ((assessment.match(/id: '(situation|motivation|capital|time|environment|strengths|tradeoff)'/g) || []).length !== 7) {
  throw new Error('Assessment must contain exactly seven required questions');
}
if (!assessment.includes("selectedFor('situation').includes(0)") || !assessment.includes("selectedFor('environment').includes(1)")) {
  throw new Error('Assessment conditional rules are missing');
}
if (assessmentHtml.includes('ep-progress') || assessmentHtml.includes('Question 1 of 5')) {
  throw new Error('Assessment must not include the legacy injected progress UI');
}
if (/Question\s+\d+\s+of\s+\d+/i.test(assessmentHtml + assessment)) {
  throw new Error('V2 assessment must not expose conventional question counts');
}
for (const field of ['user_state', 'current_rank_signals', 'allowed_question_types', 'latest_answer', 'progress_stage', 'reaction', 'question', 'supporting_copy', 'options', 'curiosity_hint', 'tone']) {
  if (!narrator.includes(`'${field}'`)) throw new Error(`AssessmentNarrator contract is missing ${field}`);
}
if (!core.includes("IN: { currency: 'INR'") || !core.includes("AE: { currency: 'AED'") || !core.includes("US: { currency: 'USD'")) {
  throw new Error('Shared currency formatter must support INR, AED and USD market configuration');
}

const routeNames = [
  'escapeplan_landing_page_desktop_refined', 'escapeplan_landing_page_mobile_refined',
  'assessment', 'analysis-v2', 'result-v2', 'match-v2', 'unlock-v2',
  'quiz_question_1_mobile', 'quiz_capital_question_desktop', 'quiz_business_style_mobile',
  'quiz_risk_scenario_desktop', 'quiz_final_question_mobile',
  'analysis_introduction_desktop', 'analysis_capital_income_desktop',
  'analysis_model_comparison_desktop', 'analysis_processing_mobile',
  'analysis_complete_desktop', 'analysis_ready_mobile',
  'result_the_digital_operator_desktop', 'result_the_digital_operator_mobile',
  'curiosity_paywall_desktop', 'curiosity_paywall_mobile',
  'checkout_unlock_success_mobile', 'report_executive_summary_desktop',
  'report_summary_dna_mobile', 'report_business_dna_all_matches_desktop',
  'report_financial_fit_income_target_desktop', 'report_runway_quit_planner_desktop',
  'report_avoid_list_30_day_plan_desktop'
];
const missing = routeNames.filter((name) => !fs.existsSync(path.join(root, name, 'code.html')));
if (missing.length) throw new Error(`Missing prototype routes: ${missing.join(', ')}`);

console.log(`Prototype navigation valid: ${routeNames.length} referenced routes exist and landing CTAs have native fallbacks.`);
