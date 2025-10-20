/**
 * Test script to verify Hugging Face API integration
 * Run with: npx tsx src/scripts/test-huggingface.ts
 */

import 'dotenv/config';
import { huggingFaceService } from '../services/huggingface.service';
import { validateHuggingFaceConfig } from '../config/huggingface.config';
import { logger } from '../utils/logger.utils';

async function testHuggingFace() {
  logger.info('Starting Hugging Face API test...');

  try {
    // Validate configuration
    logger.info('Validating configuration...');
    validateHuggingFaceConfig();
    logger.info('✓ Configuration is valid');

    // Test connection
    logger.info('Testing Hugging Face connection...');
    const isConnected = await huggingFaceService.testConnection();
    
    if (isConnected) {
      logger.info('✓ Successfully connected to Hugging Face API');
      logger.info(`✓ Using model: ${huggingFaceService.getModel()}`);
    } else {
      logger.error('✗ Failed to connect to Hugging Face API');
      process.exit(1);
    }

    // Test summarization with sample text
    logger.info('Testing text summarization...');
    const sampleText = `
      Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the 
      natural intelligence displayed by humans and animals. Leading AI textbooks define the field 
      as the study of "intelligent agents": any device that perceives its environment and takes 
      actions that maximize its chance of successfully achieving its goals. Colloquially, the 
      term "artificial intelligence" is often used to describe machines that mimic "cognitive" 
      functions that humans associate with the human mind, such as "learning" and "problem solving".
    `.trim();

    const summary = await huggingFaceService.summarizeText(sampleText);
    
    logger.info('✓ Summarization successful');
    logger.info('Input text:', { text: sampleText });
    logger.info('Summary:', { summary });

    logger.info('All tests passed! ✓');
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testHuggingFace();
