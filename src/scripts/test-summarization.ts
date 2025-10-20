/**
 * Test script for summarization logic
 * Run with: npm run test:summarization
 */

import 'dotenv/config';
import { summarizationService } from '../services/summarization.service';
import { validateHuggingFaceConfig } from '../config/huggingface.config';
import { logger } from '../utils/logger.utils';

async function testSummarization() {
  logger.info('Starting summarization logic test...\n');

  try {
    // Validate configuration
    validateHuggingFaceConfig();

    // Test texts
    const testTexts = [
      {
        name: 'Technology Article',
        text: `
          Artificial intelligence (AI) is transforming the technology industry at an unprecedented pace. 
          Machine learning algorithms are becoming more sophisticated, enabling computers to perform tasks 
          that were once thought to require human intelligence. From natural language processing to computer 
          vision, AI applications are revolutionizing how we interact with technology. Companies worldwide 
          are investing billions of dollars in AI research and development, recognizing its potential to 
          drive innovation and create competitive advantages. However, this rapid advancement also raises 
          important ethical questions about privacy, bias, and the future of work. As AI continues to evolve, 
          society must grapple with these challenges while harnessing the technology's immense potential for good.
        `.trim(),
      },
      {
        name: 'Short News',
        text: `
          The local community celebrated a major milestone yesterday as the new public library opened its 
          doors to residents. The state-of-the-art facility features modern amenities, digital resources, 
          and community spaces designed to foster learning and collaboration. Mayor Johnson praised the 
          project as a significant investment in education and community development.
        `.trim(),
      },
    ];

    for (const test of testTexts) {
      logger.info(`\n${'='.repeat(60)}`);
      logger.info(`Testing: ${test.name}`);
      logger.info(`${'='.repeat(60)}\n`);

      logger.info('Input Text:', { text: test.text });
      logger.info(`Input Length: ${test.text.length} characters\n`);

      const startTime = Date.now();
      const result = await summarizationService.generateSummary(test.text);
      const duration = Date.now() - startTime;

      logger.info('✓ Summarization Result:', {
        title: result.title,
        summary: result.summary,
        keywords: result.keywords,
        sentiment: result.sentiment,
      });

      logger.info(`\nProcessing Time: ${duration}ms`);

      // Validate output
      const isValid = summarizationService.validateOutput(result);
      if (isValid) {
        logger.info('✓ Output validation: PASSED');
      } else {
        logger.error('✗ Output validation: FAILED');
        process.exit(1);
      }

      // Check latency requirement (≤5s)
      if (duration <= 5000) {
        logger.info(`✓ Latency requirement: PASSED (${duration}ms ≤ 5000ms)`);
      } else {
        logger.warn(`⚠ Latency requirement: WARNING (${duration}ms > 5000ms)`);
      }
    }

    logger.info(`\n${'='.repeat(60)}`);
    logger.info('All summarization tests completed successfully! ✓');
    logger.info(`${'='.repeat(60)}\n`);
  } catch (error) {
    logger.error('Summarization test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSummarization();
