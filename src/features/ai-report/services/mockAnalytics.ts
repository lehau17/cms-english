import { ChartConfig } from '../types';

export const MOCK_CHART_RESPONSE: ChartConfig[] = [
    {
        type: 'chart',
        chartType: 'pie',
        title: 'Student Score Distribution',
        data: [
            { name: 'Excellent (9-10)', value: 35 },
            { name: 'Good (7-8)', value: 45 },
            { name: 'Average (5-6)', value: 15 },
            { name: 'Weak (<5)', value: 5 }
        ],
        config: {
            colors: ['#22c55e', '#3b82f6', '#eab308', '#ef4444'],
            legend: true
        }
    },
    {
        type: 'chart',
        chartType: 'area',
        title: 'Weekly Learning Activity',
        data: [
            { name: 'Week 1', students: 120, hours: 2.5 },
            { name: 'Week 2', students: 135, hours: 2.8 },
            { name: 'Week 3', students: 150, hours: 3.2 },
            { name: 'Week 4', students: 145, hours: 3.0 },
            { name: 'Week 5', students: 160, hours: 3.5 },
            { name: 'Week 6', students: 180, hours: 3.8 },
            { name: 'Week 7', students: 195, hours: 4.0 },
            { name: 'Week 8', students: 210, hours: 4.2 },
        ],
        config: {
            xAxisKey: 'name',
            areas: [
                { dataKey: 'students', color: '#6366f1' },
            ],
            xLabel: 'time',
            yLabel: 'students'
        }
    },
    {
        type: 'chart',
        chartType: 'bar',
        title: 'Skill Proficiency Analysis',
        data: [
            { name: 'Reading', score: 85, target: 80 },
            { name: 'Listening', score: 78, target: 80 },
            { name: 'Speaking', score: 72, target: 80 },
            { name: 'Writing', score: 80, target: 80 },
            { name: 'Grammar', score: 88, target: 80 },
            { name: 'Vocab', score: 92, target: 80 },
        ],
        config: {
            xAxisKey: 'name',
            bars: [
                { dataKey: 'score', color: '#a855f7' },
            ],
            yLabel: 'score'
        }
    },
    {
        type: 'chart',
        chartType: 'radar',
        title: 'Activity Focus & Balance',
        data: [
            { name: 'Practice', value: 85, fullMark: 100 },
            { name: 'Theory', value: 65, fullMark: 100 },
            { name: 'Interaction', value: 90, fullMark: 100 },
            { name: 'Revision', value: 60, fullMark: 100 },
            { name: 'Testing', value: 75, fullMark: 100 },
        ],
        config: {
            colors: ['#ec4899'], // pink-500
            legend: true,
            responsive: true
        }
    }
];

export const MOCK_ANALYSIS_TEXT = `
# Student Learning Analysis Report

Based on the data from the current semester, here is a comprehensive analysis of student performance and engagement patterns.

### 1. Overall Performance Overview
The majority of students are performing well, with **80%** achieving "Good" or "Excellent" grades.
- **Excellent (35%)**: A significant portion of the cohort is exceeding expectations.
- **Needs Improvement (5%)**: A small group requires targeted intervention, particularly in Speaking skills.

### 2. Engagement Trends
Engagement has shown a consistent upward trend over the last 8 weeks.
- **Peak Activity**: Week 8 saw the highest active student count (210 students).
- **Study Time**: The average study time per student has increased from 2.5 hours to **4.2 hours/week**, indicating growing course momentum.

### 3. Skill Proficiency
Students are showing strong aptitude in **Vocabulary (92%)** and **Grammar (88%)**, but **Speaking (72%)** remains a challenging area.

**Recommendations:**
1.  Introduce more interactive speaking sessions or 1-on-1 coaching.
2.  Maintain the current vocabulary curriculum as it is highly effective.
3.  Monitor the "Needs Improvement" group for potential drop-off risks.
`;

export const simulateTokenStream = async (
    text: string,
    onToken: (token: string) => void,
    speed: number = 30
) => {
    const tokens = text.split(/(\s+)/); // Split by whitespace but keep delimiters to preserve formatting

    for (const token of tokens) {
        if (!token) continue;
        await new Promise((resolve) => setTimeout(resolve, Math.random() * speed + 5));
        onToken(token);
    }
};
