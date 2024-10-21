export interface ChartConfig {
  maxScore: number;
  assessmentRanges: Array<{ value: number, label: string }>;
  dateKey: string;
  scoreKey?: string;
  scoreKeys?: { left: string; right: string };
  chartType: 'line' | 'bar';
  yAxisLabel: string;
}

export const phq9Config: ChartConfig = {
  maxScore: 27,
  assessmentRanges: [
    { value: 4, label: 'No Depression' },
    { value: 9, label: 'Mild Depression' },
    { value: 14, label: 'Moderate Depression' },
    { value: 19, label: 'Moderately Severe Depression' },
    { value: 27, label: 'Severe Depression' },
  ],
  dateKey: 'observed_at',
  scoreKey: 'phq9_assessment_score',
  chartType: 'line',
  yAxisLabel: 'Score',
};

export const oksConfig: ChartConfig = {
  maxScore: 48,
  assessmentRanges: [
    { value: 16, label: 'Much Better' },
    { value: 7, label: 'A Little Better' },
    { value: 1, label: 'About the Same' },
    { value: 0, label: 'Much Worse' },
  ],
  dateKey: 'observed_at',
  scoreKeys: { left: 'oks_left_assessment_score', right: 'oks_right_assessment_score' },
  chartType: 'line',
  yAxisLabel: 'Score',
};

export const gad7Config: ChartConfig = {
  maxScore: 21,
  assessmentRanges: [
    { value: 5, label: 'Mild Anxiety' },
    { value: 10, label: 'Moderate Anxiety' },
    { value: 15, label: 'Severe Anxiety' },
  ],
  dateKey: 'observed_at',
  scoreKey: 'gad7_assessment_score',
  chartType: 'line',
  yAxisLabel: 'Score',
};

export const chartConfigs: { [key: string]: ChartConfig } = {
  survey_phq9: phq9Config,
  survey_oks: oksConfig,
  survey_gad7: gad7Config,
};
