export interface SurveyConfig {
  scoreAssessment: (score: number) => string;
  radioLabels: { label: string; value: number }[];
  surveyInstructions?: string;
  questionSpecificLabels?: { [key: string]: { label: string; value: number }[] };
}

export const surveyConfigs: { [key: string]: SurveyConfig } = {
  survey_gad7: {
    scoreAssessment: (score: number) => {
      if (score <= 4) return 'No Anxiety Disorder';
      if (score <= 9) return 'Mild Anxiety Disorder';
      return 'Severe Anxiety Disorder';
    },
    surveyInstructions: 'How often have you been bothered by the following over the past 2 weeks?',
    radioLabels: [
      { label: 'Not at all', value: 0 },
      { label: 'Several days', value: 1 },
      { label: 'More than half the days', value: 2 },
      { label: 'Nearly every day', value: 3 },
    ],
    questionSpecificLabels: {
      gad7_follow_up: [
        { label: 'Not difficult at all', value: 0 },
        { label: 'Somewhat difficult', value: 1 },
        { label: 'Very difficult', value: 2 },
        { label: 'Extremely difficult', value: 3 },
      ]
    }
  },
  survey_phq9: {
    scoreAssessment: (score: number) => {
      if (score >= 1 && score <= 4) return 'Minimal depression';
      if (score >= 5 && score <= 9) return 'Mild depression';
      if (score >= 10 && score <= 14) return 'Moderate depression';
      if (score >= 15 && score <= 19) return 'Moderately severe depression';
      if (score >= 20 && score <= 27) return 'Severe depression';
      return 'Unknown';
    },
    surveyInstructions: 'How often have you been bothered by the following over the past 2 weeks?',
    radioLabels: [
      { label: 'Not at all', value: 0 },
      { label: 'Several days', value: 1 },
      { label: 'More than half the days', value: 2 },
      { label: 'Nearly every day', value: 3 },
    ],
    questionSpecificLabels: {
      phq9_follow_up: [
        { label: 'Not difficult at all', value: 0 },
        { label: 'Somewhat difficult', value: 1 },
        { label: 'Very difficult', value: 2 },
        { label: 'Extremely difficult', value: 3 },
      ]
    }
  },
  survey_oks: {
    scoreAssessment: (score: number) => {
      if (score >= 16) return 'Much better';
      if (score >= 7 && score <= 15) return 'A little better';
      if (score >= 1 && score <= 6) return 'About the same';
      return 'Much worse';
    },
    surveyInstructions: 'Please answer the following questions regarding your knee function and pain.',
    radioLabels: [
      { label: 'None', value: 4 },
      { label: 'Very mild', value: 3 },
      { label: 'Mild', value: 2 },
      { label: 'Moderate', value: 1 },
      { label: 'Severe', value: 0 },
    ],
    questionSpecificLabels: {
      oks_q1_response: [
        { label: 'None', value: 4 },
        { label: 'Very mild', value: 3 },
        { label: 'Mild', value: 2 },
        { label: 'Moderate', value: 1 },
        { label: 'Severe', value: 0 }
      ],
      oks_q2_response: [
        { label: 'No trouble', value: 4 },
        { label: 'Very little trouble', value: 3 },
        { label: 'Moderate trouble', value: 2 },
        { label: 'Extreme difficulty', value: 1 },
        { label: 'Impossible to do', value: 0 }
      ],
      oks_q3_response: [
        { label: 'No trouble', value: 4 },
        { label: 'Very little trouble', value: 3 },
        { label: 'Moderate trouble', value: 2 },
        { label: 'Extreme difficulty', value: 1 },
        { label: 'Impossible to do', value: 0 }
      ],
      oks_q4_response: [
        { label: 'No pain/more than 30 minutes', value: 4 },
        { label: '16 to 30 minutes', value: 3 },
        { label: '5 to 15 minutes', value: 2 },
        { label: 'Around the house only', value: 1 },
        { label: 'Not at all/pain severe when walking', value: 0 }
      ],
      oks_q5_response: [
        { label: 'Not at all painful', value: 4 },
        { label: 'Slightly painful', value: 3 },
        { label: 'Moderately painful', value: 2 },
        { label: 'Very painful', value: 1 },
        { label: 'Unbearable', value: 0 }
      ],
      oks_q6_response: [
        { label: 'Rarely/never', value: 4 },
        { label: 'Sometimes, or just at first', value: 3 },
        { label: 'Often, not just at first', value: 2 },
        { label: 'Most of the time', value: 1 },
        { label: 'All of the time', value: 0 }
      ],
      oks_q7_response: [
        { label: 'Yes, easily', value: 4 },
        { label: 'With little difficulty', value: 3 },
        { label: 'With moderate difficulty', value: 2 },
        { label: 'With extreme difficulty', value: 1 },
        { label: 'No, impossible', value: 0 }
      ],
      oks_q8_response: [
        { label: 'No nights', value: 4 },
        { label: 'Only 1 or 2 nights', value: 3 },
        { label: 'Some nights', value: 2 },
        { label: 'Most nights', value: 1 },
        { label: 'Every night', value: 0 }
      ],
      oks_q9_response: [
        { label: 'Not at all', value: 4 },
        { label: 'A little bit', value: 3 },
        { label: 'Moderately', value: 2 },
        { label: 'Greatly', value: 1 },
        { label: 'Totally', value: 0 }
      ],
      oks_q10_response: [
        { label: 'Rarely/never', value: 4 },
        { label: 'Sometimes, or just at first', value: 3 },
        { label: 'Often, not just at first', value: 2 },
        { label: 'Most of the time', value: 1 },
        { label: 'All of the time', value: 0 }
      ],
      oks_q11_response: [
        { label: 'Yes, easily', value: 4 },
        { label: 'With little difficulty', value: 3 },
        { label: 'With moderate difficulty', value: 2 },
        { label: 'With extreme difficulty', value: 1 },
        { label: 'No, impossible', value: 0 }
      ],
      oks_q12_response: [
        { label: 'Yes, easily', value: 4 },
        { label: 'With little difficulty', value: 3 },
        { label: 'With moderate difficulty', value: 2 },
        { label: 'With extreme difficulty', value: 1 },
        { label: 'No, impossible', value: 0 }
      ]
    }
  }
}