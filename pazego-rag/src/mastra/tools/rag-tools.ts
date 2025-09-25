import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { PDFDocumentProcessor as DocumentProcessor } from '../../lib/pdf-document-processor';

export const documentSearchTool = createTool({
  id: 'document_search',
  description: 'Search through Berkshire Hathaway shareholder letters for relevant information',
  inputSchema: z.object({
    query: z.string().describe('The search query to find relevant information in the documents'),
    yearFilter: z.number().optional().describe('Optional year filter to search within a specific year'),
    maxResults: z.number().default(5).describe('Maximum number of results to return (default: 5)')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    results: z.array(z.object({
      content: z.string(),
      metadata: z.any(),
      relevanceScore: z.number(),
      rank: z.number()
    })),
    totalResults: z.number(),
    query: z.string(),
    yearFilter: z.union([z.number(), z.string()]).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const processor = new DocumentProcessor();
      const vectorStore = await processor.getVectorStore();
      
      // Construct search filter if year is specified
      const filter = context.yearFilter ? {
        year: { $eq: context.yearFilter }
      } : undefined;
      
      // Perform similarity search
      const results = await vectorStore.similaritySearchWithScore(
        context.query,
        context.maxResults,
        filter
      );
      
      // Format results with metadata
      const formattedResults = results.map((result, index) => {
        const [doc, score] = result;
        return {
          content: doc.pageContent,
          metadata: doc.metadata,
          relevanceScore: score,
          rank: index + 1
        };
      });
      
      return {
        success: true,
        results: formattedResults,
        totalResults: results.length,
        query: context.query,
        yearFilter: context.yearFilter || 'all years'
      };
    } catch (error) {
      console.error('Document search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        results: [],
        totalResults: 0,
        query: context.query
      };
    }
  }
});

export const contextualSearchTool = createTool({
  id: 'contextual_search',
  description: 'Perform a more sophisticated search that considers context and returns enriched results',
  inputSchema: z.object({
    query: z.string().describe('The main search query'),
    context: z.string().optional().describe('Additional context from previous conversation'),
    topics: z.array(z.string()).optional().describe('Specific topics to focus on'),
    yearRange: z.object({
      start: z.number(),
      end: z.number()
    }).optional().describe('Year range to search within')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    results: z.array(z.object({
      content: z.string(),
      metadata: z.any(),
      relevanceScore: z.number(),
      rank: z.number(),
      summary: z.string()
    })),
    totalResults: z.number(),
    originalQuery: z.string(),
    enhancedQuery: z.string(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const processor = new DocumentProcessor();
      const vectorStore = await processor.getVectorStore();
      
      // Enhance query with context and topics
      let enhancedQuery = context.query;
      if (context.context) {
        enhancedQuery = `${context.context} ${context.query}`;
      }
      if (context.topics && context.topics.length > 0) {
        enhancedQuery = `${enhancedQuery} ${context.topics.join(' ')}`;
      }
      
      // Perform similarity search
      const results = await vectorStore.similaritySearchWithScore(enhancedQuery, 6);
      
      const formattedResults = results.map((result, index) => {
        const [doc, score] = result;
        return {
          content: doc.pageContent,
          metadata: doc.metadata,
          relevanceScore: score,
          rank: index + 1,
          summary: generateSummary(doc.pageContent)
        };
      });
      
      return {
        success: true,
        results: formattedResults,
        totalResults: results.length,
        originalQuery: context.query,
        enhancedQuery
      };
    } catch (error) {
      console.error('Contextual search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        results: [],
        totalResults: 0,
        originalQuery: context.query,
        enhancedQuery: context.query
      };
    }
  }
});

// Helper function to generate concise summaries
function generateSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const summary = sentences.slice(0, 2).join('. ').trim();
  return summary + (sentences.length > 2 ? '...' : '');
}

// Enhanced search tool for investment topics
export const investmentInsightsTool = createTool({
  id: 'investment_insights',
  description: 'Search for specific investment insights, strategies, and Warren Buffett quotes',
  inputSchema: z.object({
    topic: z.enum(['investment_philosophy', 'risk_management', 'market_timing', 'business_quality', 'management_evaluation', 'dividend_policy', 'acquisitions', 'economic_outlook']).describe('Specific investment topic to focus on'),
    keywords: z.array(z.string()).optional().describe('Additional keywords to refine the search'),
    includeQuotes: z.boolean().default(true).describe('Whether to prioritize direct Buffett quotes')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    insights: z.array(z.object({
      principle: z.string(),
      explanation: z.string(),
      quote: z.string().optional(),
      year: z.number(),
      source: z.string(),
      relevance: z.number()
    })),
    summary: z.string(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const processor = new DocumentProcessor();
      const vectorStore = await processor.getVectorStore();
      
      // Build search query based on topic
      const topicQueries = {
        investment_philosophy: 'investment philosophy value investing intrinsic value long-term',
        risk_management: 'risk management diversification margin safety permanent loss',
        market_timing: 'market timing volatility Mr. Market emotional discipline',
        business_quality: 'business quality competitive moat durable advantage',
        management_evaluation: 'management quality leadership integrity capital allocation',
        dividend_policy: 'dividends dividend policy shareholder returns capital',
        acquisitions: 'acquisitions mergers buyout criteria business purchase',
        economic_outlook: 'economic outlook inflation interest rates recession growth'
      };
      
      let searchQuery = topicQueries[context.topic];
      if (context.keywords && context.keywords.length > 0) {
        searchQuery += ' ' + context.keywords.join(' ');
      }
      
      const results = await vectorStore.similaritySearchWithScore(searchQuery, 8);
      
      const insights = results.map(([doc, score]) => {
        const content = doc.pageContent;
        const metadata = doc.metadata;
        
        // Extract potential quotes (text in quotation marks)
        const quoteMatch = content.match(/"([^"]+)"/);
        const quote = quoteMatch ? quoteMatch[1] : undefined;
        
        return {
          principle: extractPrinciple(content, context.topic),
          explanation: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
          quote,
          year: metadata.year || new Date().getFullYear(),
          source: `${metadata.source || 'Berkshire Hathaway'} Shareholder Letter`,
          relevance: Math.round((1 - score) * 100) / 100
        };
      });
      
      const summary = generateTopicSummary(context.topic, insights);
      
      return {
        success: true,
        insights: insights.slice(0, 5), // Top 5 most relevant
        summary
      };
    } catch (error) {
      return {
        success: false,
        insights: [],
        summary: '',
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }
});

function extractPrinciple(content: string, topic: string): string {
  const topicMap: Record<string, string> = {
    investment_philosophy: 'Investment Philosophy',
    risk_management: 'Risk Management',
    market_timing: 'Market Approach',
    business_quality: 'Business Quality',
    management_evaluation: 'Management Evaluation',
    dividend_policy: 'Capital Returns',
    acquisitions: 'Acquisition Strategy',
    economic_outlook: 'Economic Perspective'
  };
  
  return topicMap[topic] || 'Investment Insight';
}

function generateTopicSummary(topic: string, insights: any[]): string {
  const summaries: Record<string, string> = {
    investment_philosophy: 'Warren Buffett\'s investment philosophy centers on value investing principles',
    risk_management: 'Berkshire\'s approach to risk focuses on avoiding permanent loss of capital',
    market_timing: 'Buffett consistently advocates against market timing and short-term thinking',
    business_quality: 'Quality businesses with durable competitive advantages are preferred',
    management_evaluation: 'Strong, honest management teams are crucial for long-term success',
    dividend_policy: 'Capital allocation decisions prioritize shareholder value creation',
    acquisitions: 'Acquisition criteria emphasize quality management and sustainable advantages',
    economic_outlook: 'Long-term economic optimism tempered by short-term caution'
  };
  
  return summaries[topic] || 'Investment insights from Berkshire Hathaway letters';
}