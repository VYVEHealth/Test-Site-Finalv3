// ── REPLACE the submitQuestionnaire function in onboarding_v8.html ──
// Also replace showResults to use the new response format

const ONBOARDING_EDGE_FN = 'https://ixjfklpckgxrwjlfsaaz.supabase.co/functions/v1/onboarding';

async function submitQuestionnaire() {
  if (!validateSection(10)) return;

  // Collect all data — identical to existing collection
  const data = {
    firstName:          document.getElementById('firstName').value.trim(),
    lastName:           document.getElementById('lastName').value.trim(),
    phone:              document.getElementById('phone').value.trim(),
    email:              document.getElementById('email').value.trim().toLowerCase(),
    dob:                document.getElementById('dob').value,
    gender:             document.getElementById('gender').value,
    heightCm:           getHeightCm(),
    weightKg:           getWeightKg(),
    age:                getAge(),
    activityLevel:      getSingleChoice('activityLevel'),
    goal:               getSingleChoice('nutritionGoal') || getChoices('trainingGoals').join(', '),
    weightUnit:         state.weightUnit === 'kg' ? 'kgs' : 'lbs',
    membershipType:     'Individual',
    status:             'complete',
    recommendedCalories: state.tdeeFinal || null,
    scores: {
      wellbeing:  document.getElementById('sl-wellbeing').value,
      sleep:      document.getElementById('sl-sleep').value,
      energy:     document.getElementById('sl-energy').value,
      stress:     document.getElementById('sl-stress').value,
      physical:   document.getElementById('sl-physical').value,
      diet:       document.getElementById('sl-diet').value,
      social:     document.getElementById('sl-social').value,
      motivation: document.getElementById('sl-motivation').value,
    },
    supportAreas:       getChoices('supportAreas'),
    affectsMost:        getSingleChoice('affectsMost'),
    specificSupport:    getChoices('specificSupport'),
    supportStyle:       getChoices('supportStyle'),
    trainingGoals:      getChoices('trainingGoals'),
    barriers:           getChoices('barriers'),
    injuries:           getChoices('injuries'),
    avoidExercises:     document.getElementById('avoidExercises').value,
    trainingLocation:   getSingleChoice('location-train'),
    equipment:          getChoices('equipment'),
    gymExperience:      getSingleChoice('gymExperience'),
    trainDays:          getSingleChoice('trainDays'),
    sleepIssues:        getChoices('sleepIssues'),
    sleepHelp:          getChoices('sleepHelp'),
    socialHelp:         getChoices('socialHelp'),
    socialBarriers:     getChoices('socialBarriers'),
    socialApproach:     getSingleChoice('socialApproach'),
    lifeContext:        getChoices('lifeContext'),
    lifeContextExtra:   document.getElementById('lifeContext_extra') ? document.getElementById('lifeContext_extra').value : '',
    alcohol:            getSingleChoice('alcohol'),
    motivationHelp:     getChoices('motivationHelp'),
    pastBarriers:       getChoices('pastBarriers'),
    successVision:      document.getElementById('successVision').value,
    goalStyle:          getSingleChoice('goalStyle'),
    reminderFreq:       getSingleChoice('reminderFreq'),
    tonePreference:     getSingleChoice('tonePreference'),
    overwhelmedPref:    getChoices('overwhelmedPref'),
    smartphone:         getSingleChoice('smartphone'),
    smartwatch:         getSingleChoice('smartwatch'),
    specificGoal:       document.getElementById('specificGoal').value,
    anythingElse:       document.getElementById('anythingElse').value,
    location:           document.getElementById('location').value,
  };

  // Show loading screen
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('loadingScreen').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    const response = await fetch(ONBOARDING_EDGE_FN, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Edge Function error');
    }

    showResults(data, result);

  } catch (err) {
    console.error('Onboarding error:', err);
    // Show fallback results so member isn't stuck on loading screen
    showResults(data, {
      persona:        'RIVER',
      persona_reason: 'We\'ve assigned you a default coach while we get things set up.',
      rec_1:          'Start with one daily habit this week \u2014 consistency beats intensity every time.',
      rec_2:          'Join a live session this week \u2014 even 20 minutes makes a difference.',
      rec_3:          'Complete your weekly check-in on Monday to set your intentions.',
      full_response:  ''
    });
  }
}

// ── REPLACE showResults to use Edge Function response ──
function showResults(data, result) {
  document.getElementById('loadingScreen').classList.remove('active');
  const rs = document.getElementById('resultScreen');
  rs.classList.add('active');
  document.getElementById('resultName').textContent = data.firstName;

  const persona       = result.persona        || 'RIVER';
  const personaReason = result.persona_reason || '';
  const rec1          = result.rec_1          || '';
  const rec2          = result.rec_2          || '';
  const rec3          = result.rec_3          || '';

  const personaNames = {
    NOVA:  'NOVA \u2014 Your High-Performance Coach',
    RIVER: 'RIVER \u2014 Your Mindful Wellness Guide',
    SPARK: 'SPARK \u2014 Your Motivational Coach',
    SAGE:  'SAGE \u2014 Your Knowledge-First Mentor',
    HAVEN: 'HAVEN \u2014 Your Wellbeing Companion',
  };

  let html = `
    <div class="result-card">
      <div class="result-card-title">Your VYVE Coach</div>
      <p><strong>${personaNames[persona] || persona}</strong></p>
      <p style="margin-top:8px;">${personaReason}</p>
    </div>
    <div class="result-card">
      <div class="result-card-title">Your First Week Recommendations</div>
      <p>\u2022 ${rec1}</p>
      ${rec2 ? `<p style="margin-top:10px;">\u2022 ${rec2}</p>` : ''}
      ${rec3 ? `<p style="margin-top:10px;">\u2022 ${rec3}</p>` : ''}
    </div>
  `;

  document.getElementById('resultContent').innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
