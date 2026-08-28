import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const desktop = fs.readFileSync(path.join(root, 'escapeplan_landing_page_desktop_refined/code.html'), 'utf8');
const mobile = fs.readFileSync(path.join(root, 'escapeplan_landing_page_mobile_refined/code.html'), 'utf8');
const requiredLandingMarkup = [
  'href="/quiz_question_1_mobile/code"',
  'href="#how-it-works"',
  'href="#sample-result"',
  'id="how-it-works"',
  'id="sample-result"'
];

for (const marker of requiredLandingMarkup) {
  if (!desktop.includes(marker)) throw new Error(`Desktop landing is missing ${marker}`);
}

for (const marker of ['href="/quiz_question_1_mobile/code"', 'id="how-it-works"', 'id="sample-result"']) {
  if (!mobile.includes(marker)) throw new Error(`Mobile landing is missing ${marker}`);
}

const routeNames = [
  'escapeplan_landing_page_desktop_refined', 'escapeplan_landing_page_mobile_refined',
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
