/**
 * Manual Testing Script for API Validation
 * Tests various scenarios including success cases and error cases
 * Run with: npm run test:manual
 */

import 'dotenv/config';
import { logger } from '../utils/logger.utils';

const API_URL = `http://localhost:${process.env.PORT || 3000}/api/summarize`;

interface TestCase {
  name: string;
  text: string;
  expectSuccess: boolean;
  expectedError?: string;
}

const testCases: TestCase[] = [
  // Success cases
  {
    name: 'Short article (should succeed)',
    text: 'Artificial intelligence is transforming technology. Machine learning enables computers to learn from data and improve over time without being explicitly programmed. This revolution is changing industries worldwide.',
    expectSuccess: true,
  },
  {
    name: 'Medium article (should succeed)',
    text: `
      Climate change is one of the most pressing challenges facing humanity today. Rising global temperatures 
      are causing sea levels to rise, extreme weather events to become more frequent, and ecosystems to be 
      disrupted. Scientists warn that without immediate action to reduce greenhouse gas emissions, the consequences 
      could be catastrophic. Governments, businesses, and individuals all have a role to play in addressing this 
      crisis through sustainable practices, renewable energy adoption, and policy changes. The transition to a 
      low-carbon economy presents both challenges and opportunities for innovation and economic growth.
    `.trim(),
    expectSuccess: true,
  },
  {
    name: 'Long article (should succeed, ~1000 chars)',
    text: `
      The history of space exploration is a testament to human ingenuity and determination. From the first 
      satellite Sputnik in 1957 to the moon landing in 1969, humanity has continuously pushed the boundaries 
      of what's possible. Today, private companies like SpaceX and Blue Origin are revolutionizing space travel 
      with reusable rockets and ambitious plans for Mars colonization. The International Space Station has been 
      continuously occupied since 2000, serving as a laboratory for scientific research and international 
      cooperation. Recent missions to Mars, including the Perseverance rover, are searching for signs of ancient 
      life and preparing for future human exploration. As technology advances, the dream of becoming a 
      multi-planetary species is becoming increasingly realistic. Space exploration not only expands our 
      understanding of the universe but also drives technological innovation that benefits life on Earth, from 
      satellite communications to medical advancements. The next decades promise exciting developments including 
      lunar bases, asteroid mining, and perhaps the first human footsteps on Mars.
    `.trim(),
    expectSuccess: true,
  },
  
  // Error cases
  {
    name: 'Empty text (should fail - VALIDATION_ERROR)',
    text: '',
    expectSuccess: false,
    expectedError: 'VALIDATION_ERROR',
  },
  {
    name: 'Text too short (should fail - VALIDATION_ERROR)',
    text: 'Short',
    expectSuccess: false,
    expectedError: 'VALIDATION_ERROR',
  },
  {
    name: 'Very long text (should fail - VALIDATION_ERROR, >10k chars)',
    text: 'A'.repeat(11000),
    expectSuccess: false,
    expectedError: 'VALIDATION_ERROR',
  },
  {
    name: 'Whitespace only (should fail - VALIDATION_ERROR)',
    text: '           ',
    expectSuccess: false,
    expectedError: 'VALIDATION_ERROR',
  },
];

async function runTest(testCase: TestCase): Promise<boolean> {
  logger.info(`\n${'='.repeat(80)}`);
  logger.info(`Test: ${testCase.name}`);
  logger.info(`${'='.repeat(80)}`);

  const startTime = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: testCase.text }),
    });

    const duration = Date.now() - startTime;
    const data = await response.json() as any;

    logger.info(`Response Status: ${response.status}`);
    logger.info(`Duration: ${duration}ms`);
    logger.info(`Response:`, data);

    // Validate success case
    if (testCase.expectSuccess) {
      if (!response.ok) {
        logger.error(`✗ Expected success but got error: ${response.status}`);
        return false;
      }

      if (!data.success) {
        logger.error('✗ Expected success=true in response');
        return false;
      }

      // Validate response structure
      if (!data.data || !data.data.title || !data.data.summary || !data.data.keywords || !data.data.sentiment) {
        logger.error('✗ Response missing required fields');
        logger.error('Missing:', {
          title: !data.data?.title,
          summary: !data.data?.summary,
          keywords: !data.data?.keywords,
          sentiment: !data.data?.sentiment,
        });
        return false;
      }

      // Validate sentiment is one of the allowed values
      if (!['positive', 'negative', 'neutral'].includes(data.data.sentiment)) {
        logger.error(`✗ Invalid sentiment value: ${data.data.sentiment}`);
        return false;
      }

      // Validate keywords is an array
      if (!Array.isArray(data.data.keywords)) {
        logger.error('✗ Keywords is not an array');
        return false;
      }

      // Validate metadata
      if (!data.metadata || typeof data.metadata.processingTimeMs !== 'number') {
        logger.error('✗ Missing or invalid metadata');
        return false;
      }

      // Check latency requirement (≤5s)
      if (duration > 5000) {
        logger.warn(`⚠ Latency exceeded 5s: ${duration}ms`);
      } else {
        logger.info(`✓ Latency within limit: ${duration}ms ≤ 5000ms`);
      }

      logger.info('✓ Test PASSED - All validations successful');
      return true;
    } else {
      // Validate error case
      if (response.ok) {
        logger.error('✗ Expected error but got success');
        return false;
      }

      if (data.success !== false) {
        logger.error('✗ Expected success=false in error response');
        return false;
      }

      if (!data.error || !data.error.code) {
        logger.error('✗ Error response missing error.code');
        return false;
      }

      if (testCase.expectedError && data.error.code !== testCase.expectedError) {
        logger.error(`✗ Expected error code ${testCase.expectedError} but got ${data.error.code}`);
        return false;
      }

      logger.info(`✓ Test PASSED - Error handled correctly: ${data.error.code}`);
      return true;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`✗ Test FAILED with exception:`, error);
    logger.error(`Duration: ${duration}ms`);
    
    // Check if it's a timeout
    if (duration > 5000) {
      logger.error('Request timed out (>5s)');
    }
    
    return false;
  }
}

async function runAllTests() {
  logger.info('\n' + '='.repeat(80));
  logger.info('Starting Manual API Testing');
  logger.info('='.repeat(80));
  logger.info(`API URL: ${API_URL}`);
  logger.info(`Total Tests: ${testCases.length}\n`);

  const results = {
    passed: 0,
    failed: 0,
    total: testCases.length,
  };

  for (const testCase of testCases) {
    const passed = await runTest(testCase);
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  logger.info('\n' + '='.repeat(80));
  logger.info('Test Summary');
  logger.info('='.repeat(80));
  logger.info(`Total Tests: ${results.total}`);
  logger.info(`Passed: ${results.passed}`);
  logger.info(`Failed: ${results.failed}`);
  logger.info(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  logger.info('='.repeat(80) + '\n');

  if (results.failed > 0) {
    logger.error('❌ Some tests failed!');
    process.exit(1);
  } else {
    logger.info('✅ All tests passed!');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`http://localhost:${process.env.PORT || 3000}/health`);
    if (response.ok) {
      logger.info('✓ Server is running\n');
      return true;
    }
  } catch (error) {
    logger.error('✗ Server is not running. Please start the server first:');
    logger.error('  npm run dev');
    process.exit(1);
  }
  return false;
}

// Run tests
async function main() {
  await checkServer();
  await runAllTests();
}

main();
