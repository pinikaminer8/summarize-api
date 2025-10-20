import { HfInference } from '@huggingface/inference';
import { HUGGINGFACE_CONFIG } from '../config/huggingface.config';
import { SummaryData, Sentiment } from '../types/api.types';
import { logger } from '../utils/logger.utils';
import { createServiceUnavailableError } from '../middleware/error.middleware';

/**
 * Summarization Service
 * Handles the complete summarization logic including title, summary, keywords, and sentiment extraction
 */

class SummarizationService {
  private client: HfInference;

  constructor() {
    this.client = new HfInference(HUGGINGFACE_CONFIG.API_TOKEN);
  }

  /**
   * Generate complete summary with title, keywords, and sentiment
   * @param text - Input text to summarize
   * @returns Complete summary data
   */
  async generateSummary(text: string): Promise<SummaryData> {
    try {
      logger.info('Starting summarization process', { inputLength: text.length });

      // Run all tasks in parallel for better performance
      const [summary, title, keywords, sentiment] = await Promise.all([
        this.extractSummary(text),
        this.extractTitle(text),
        this.extractKeywords(text),
        this.analyzeSentiment(text),
      ]);

      const result: SummaryData = {
        title,
        summary,
        keywords,
        sentiment,
      };

      logger.info('Summarization completed successfully', result);
      return result;
    } catch (error) {
      logger.error('Summarization failed', { error });
      throw error;
    }
  }

  /**
   * Extract summary from text using Hugging Face summarization model
   */
  private async extractSummary(text: string): Promise<string> {
    try {
      const result = await this.client.summarization({
        model: HUGGINGFACE_CONFIG.MODEL,
        inputs: text,
        parameters: {
          max_length: HUGGINGFACE_CONFIG.MAX_LENGTH,
          min_length: HUGGINGFACE_CONFIG.MIN_LENGTH,
          do_sample: HUGGINGFACE_CONFIG.DO_SAMPLE,
        },
      });

      if (!result || !result.summary_text) {
        throw new Error('Invalid summarization response');
      }

      return result.summary_text;
    } catch (error) {
      logger.error('Summary extraction failed', { error });
      throw createServiceUnavailableError();
    }
  }

  /**
   * Extract title from text using prompt-based approach
   * Uses the first sentence or generates from summary
   */
  private async extractTitle(text: string): Promise<string> {
    try {
      // Use text generation to create a concise title
      const prompt = `Generate a short, concise title (5-10 words) for the following text. Only provide the title, nothing else:\n\n${text.substring(0, 500)}`;

      const result = await this.client.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 20,
          temperature: 0.3,
          return_full_text: false,
        },
      });

      if (!result || !result.generated_text) {
        // Fallback: use first sentence or create from first words
        return this.generateFallbackTitle(text);
      }

      // Clean up the generated title
      let title = result.generated_text.trim();
      title = title.replace(/^["']|["']$/g, ''); // Remove quotes
      title = title.split('\n')[0] || title; // Take first line only
      title = title.substring(0, 100); // Limit length

      return title || this.generateFallbackTitle(text);
    } catch (error) {
      logger.warn('Title extraction failed, using fallback', { error });
      return this.generateFallbackTitle(text);
    }
  }

  /**
   * Generate fallback title from text
   */
  private generateFallbackTitle(text: string): string {
    // Try to get first sentence
    const firstSentence = text.split(/[.!?]/)[0]?.trim();
    
    if (firstSentence && firstSentence.length > 10 && firstSentence.length < 100) {
      return firstSentence;
    }

    // Take first 10 words
    const words = text.trim().split(/\s+/).slice(0, 10);
    return words.join(' ') + (text.trim().split(/\s+/).length > 10 ? '...' : '');
  }

  /**
   * Extract keywords from text using feature extraction
   */
  private async extractKeywords(text: string): Promise<string[]> {
    try {
      // Simple keyword extraction using frequency and importance
      const keywords = this.extractKeywordsSimple(text);
      
      if (keywords.length > 0) {
        return keywords;
      }

      // Fallback to basic extraction
      return this.extractBasicKeywords(text);
    } catch (error) {
      logger.warn('Keyword extraction failed, using fallback', { error });
      return this.extractBasicKeywords(text);
    }
  }

  /**
   * Simple keyword extraction using word frequency
   */
  private extractKeywordsSimple(text: string): string[] {
    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it',
      'its', 'they', 'their', 'them', 'i', 'you', 'he', 'she', 'we', 'us',
    ]);

    // Extract words and count frequency
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    const frequency = new Map<string, number>();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    // Get top keywords
    const sorted = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);

    return sorted;
  }

  /**
   * Basic keyword extraction fallback
   */
  private extractBasicKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);

    // Get unique words, limit to 5
    const unique = Array.from(new Set(words)).slice(0, 5);
    return unique.length > 0 ? unique : ['summary'];
  }

  /**
   * Analyze sentiment of the text
   */
  private async analyzeSentiment(text: string): Promise<Sentiment> {
    try {
      // Use sentiment analysis model
      const result = await this.client.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: text.substring(0, 512), // Limit input for sentiment model
      });

      if (!result || result.length === 0) {
        return 'neutral';
      }

      // Get the top label
      const topResult = result[0];
      const label = topResult?.label?.toLowerCase() || '';

      // Map label to our sentiment type
      if (label.includes('positive')) return 'positive';
      if (label.includes('negative')) return 'negative';
      return 'neutral';
    } catch (error) {
      logger.warn('Sentiment analysis failed, using neutral', { error });
      return 'neutral';
    }
  }

  /**
   * Validate that the output matches the schema
   */
  validateOutput(data: SummaryData): boolean {
    return !!(
      data.title &&
      data.title.length > 0 &&
      data.summary &&
      data.summary.length > 0 &&
      data.keywords &&
      data.keywords.length > 0 &&
      data.sentiment &&
      ['positive', 'negative', 'neutral'].includes(data.sentiment)
    );
  }
}

// Export singleton instance
export const summarizationService = new SummarizationService();
