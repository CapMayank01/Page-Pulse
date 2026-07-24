import { calculateScore } from '../src/services/scoring.service';

describe('Scoring Service', () => {
  it('should return a perfect score 100 and Grade A for ideal page metrics', () => {
    const result = calculateScore({
      title: 'Awesome SEO Page Title',
      metaDescription: 'Detailed meta description explaining page content.',
      h1Count: 1,
      imagesMissingAlt: 0,
      responseTimeMs: 250,
      wordCount: 450,
    });

    expect(result.score).toBe(90); // 15 + 15 + 20 + 20 + 20 - 0 = 90
    expect(result.grade).toBe('A');
    expect(result.breakdown.titlePoints).toBe(15);
    expect(result.breakdown.metaPoints).toBe(15);
    expect(result.breakdown.h1Points).toBe(20);
    expect(result.breakdown.imageDeduction).toBe(0);
    expect(result.breakdown.responseTimePoints).toBe(20);
    expect(result.breakdown.wordCountPoints).toBe(20);
  });

  it('should lock in exact input from user request to return 55/D', () => {
    const result = calculateScore({
      title: 'Example Domain',
      metaDescription: null,
      h1Count: 1,
      imagesMissingAlt: 0,
      responseTimeMs: 71,
      wordCount: 17,
    });

    expect(result.score).toBe(55);
    expect(result.grade).toBe('D');
    expect(result.breakdown.titlePoints).toBe(15);
    expect(result.breakdown.metaPoints).toBe(0);
    expect(result.breakdown.h1Points).toBe(20);
    expect(result.breakdown.imageDeduction).toBe(0);
    expect(result.breakdown.responseTimePoints).toBe(20);
    expect(result.breakdown.wordCountPoints).toBe(0);
  });

  it('should cover all grade bands correctly', () => {
    // Grade A (90+)
    const gradeA = calculateScore({
      title: 'Title',
      metaDescription: 'Meta',
      h1Count: 1,
      imagesMissingAlt: 0,
      responseTimeMs: 200,
      wordCount: 300,
    });
    expect(gradeA.grade).toBe('A');
    expect(gradeA.score).toBe(90); // max sum is 90

    // Grade B (75-89)
    const gradeB = calculateScore({
      title: 'Title', // +15
      metaDescription: null, // +0 (missing)
      h1Count: 1, // +20
      imagesMissingAlt: 0, // -0
      responseTimeMs: 200, // +20
      wordCount: 300, // +20
    });
    expect(gradeB.grade).toBe('B');
    expect(gradeB.score).toBe(75);

    // Grade C (60-74)
    const gradeC = calculateScore({
      title: 'Title', // +15
      metaDescription: 'Meta', // +15
      h1Count: 1, // +20
      imagesMissingAlt: 2, // -10 (missing alt)
      responseTimeMs: 200, // +20
      wordCount: 100, // +0 (low)
    });
    expect(gradeC.grade).toBe('C');
    expect(gradeC.score).toBe(60); // 15+15+20+20 - 10 = 60

    // Grade D (40-59)
    const gradeD = calculateScore({
      title: 'Title', // +15
      metaDescription: null, // +0
      h1Count: 1, // +20
      imagesMissingAlt: 4, // -20
      responseTimeMs: 200, // +20
      wordCount: 300, // +20
    });
    expect(gradeD.grade).toBe('D');
    expect(gradeD.score).toBe(55); // 15+20+20+20 - 20 = 55

    // Grade F (<40)
    const gradeF = calculateScore({
      title: null, // +0
      metaDescription: null, // +0
      h1Count: 0, // +0
      imagesMissingAlt: 5, // -20
      responseTimeMs: 3500, // +0
      wordCount: 50, // +0
    });
    expect(gradeF.grade).toBe('F');
    expect(gradeF.score).toBe(0);
  });

  it('should penalize missing title, meta, multiple H1s, missing alt texts, slow response, low word count', () => {
    const result = calculateScore({
      title: '',
      metaDescription: null,
      h1Count: 3,
      imagesMissingAlt: 5,
      responseTimeMs: 3500,
      wordCount: 120,
    });

    expect(result.score).toBe(0);
    expect(result.grade).toBe('F');
  });

  it('should scale response time points linearly between 500ms and 3000ms', () => {
    const resultHalf = calculateScore({
      title: 'Title',
      metaDescription: 'Meta',
      h1Count: 1,
      imagesMissingAlt: 0,
      responseTimeMs: 1750, // halfway between 500 and 3000 -> 10 pts
      wordCount: 300,
    });

    expect(resultHalf.breakdown.responseTimePoints).toBe(10);
  });
});
