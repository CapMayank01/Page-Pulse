import { analyzeHtml } from '../src/services/analyzer.service';

describe('Analyzer Service', () => {
  it('should parse HTML title, meta description, H1 count, alt missing images, and word count', () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page Title</title>
          <meta name="description" content="This is a test meta description for SEO." />
        </head>
        <body>
          <h1>Main Heading</h1>
          <p>This is a paragraph with several words to test the word count metric properly.</p>
          <img src="pic1.jpg" alt="A nice picture" />
          <img src="pic2.jpg" />
          <img src="pic3.jpg" alt="" />
        </body>
      </html>
    `;

    const metrics = analyzeHtml(sampleHtml);

    expect(metrics.title).toBe('Test Page Title');
    expect(metrics.metaDescription).toBe('This is a test meta description for SEO.');
    expect(metrics.h1Count).toBe(1);
    expect(metrics.imagesMissingAlt).toBe(1); // Only pic2 has no alt attribute; pic3 has empty alt which is present
    expect(metrics.wordCount).toBeGreaterThan(10);
  });
});
