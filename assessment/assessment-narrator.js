(function (global) {
  'use strict';

  const reactions = {
    motivation: {
      'I want more income': ['Understood.', 'We’ll look for paths that can add income without demanding a reckless leap.'],
      'I want out of my job eventually': ['Got it.', 'You want something that could grow beyond a tiny side hustle.'],
      'I want something of my own': ['That matters.', 'Ownership and control should influence what fits—not just potential income.'],
      'I want to build real wealth': ['Clear.', 'We’ll give scalability more weight than quick but limited income.'],
      'I’m just exploring': ['Good place to start.', 'You do not need a perfect idea yet. You need a useful shortlist.']
    },
    situation: {
      'Full-time job': ['Useful.', 'Your first test should probably prove itself before asking you to sacrifice your salary.'],
      'Studying': ['Interesting.', 'Flexibility matters now; capital-heavy commitments probably matter less.'],
      'Already running a business': ['That changes the lens.', 'We’ll look for leverage—not simply another demanding job.'],
      'Ready to go full-time': ['You have room to move.', 'Now the question is where that commitment creates the most leverage.'],
      'Between jobs': ['Understood.', 'We’ll keep speed and financial safety visible at the same time.']
    },
    capital: {
      'Under ₹25K': ['Lean is useful.', 'It forces us to favour validation over overhead.'],
      '₹25K–₹1L': ['That is enough to test.', 'But not enough to waste on the wrong fixed costs.'],
      '₹1L–₹3L': ['That opens real options.', 'But not every option deserves that money.'],
      '₹3L–₹7L': ['You have room to test properly.', 'Capital fit still matters more than spending capacity.'],
      '₹7L+': ['Capital is not your main constraint.', 'Time, operating style and risk now matter more.']
    },
    time: {
      '1 hour/day': ['That narrows the field.', 'We’ll favour models that can be validated in focused blocks.'],
      '2–3 hours/day': ['Useful.', 'We’ll prioritise paths you can test without turning your life upside down.'],
      '4–6 hours/day': ['You have meaningful build time.', 'More involved models can stay in consideration.'],
      'Full-time': ['Time gives you options.', 'Now we need to make sure effort is going toward the right operating model.']
    },
    environment: {
      'Sell or build through the internet': ['Clear.', 'You’re leaning toward lower fixed costs and stronger automation.'],
      'Run something people can visit / use locally': ['Interesting.', 'You are open to real-world operations, not only online models.'],
      'Combine both': ['That gives us more room.', 'Hybrid paths can use local trust and digital reach together.'],
      'I don’t care — show me what fits': ['Good.', 'We’ll let practical fit matter more than format.']
    },
    tradeoff: {
      'Money sooner': ['Speed matters.', 'We’ll favour shorter validation and income cycles.'],
      'Balanced': ['Balanced is useful.', 'We can weigh early proof without giving up long-term upside.'],
      'Growth first': ['Understood.', 'You are willing to wait longer for a stronger growth path.'],
      'Build for the long term': ['Long-term value leads.', 'We’ll give durable, scalable paths more weight.']
    }
  };

  const contract = Object.freeze({
    input: ['user_state', 'current_rank_signals', 'allowed_question_types', 'latest_answer', 'progress_stage'],
    output: ['reaction', 'question', 'supporting_copy', 'options', 'curiosity_hint', 'tone']
  });

  function fallback(input) {
    const pair = reactions[input.question_id]?.[input.latest_answer] || ['Noted.', 'That gives us another useful signal.'];
    return { reaction: pair[0], supporting_copy: pair[1], curiosity_hint: '', tone: 'clear', question: null, options: null };
  }

  async function narrate(input) {
    // Provider-neutral seam. External models may later implement this contract,
    // but deterministic product state remains authoritative.
    return fallback(input);
  }

  global.AssessmentNarrator = Object.freeze({ contract, narrate, fallback });
}(window));
