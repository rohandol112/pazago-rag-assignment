/**
 * Local Document Processor using simple text-based embeddings
 * This avoids OpenAI embeddings API and works with your existing API key
 */

import fs from 'fs';
import { Document } from '@langchain/core/documents';

export interface DocumentMetadata {
  source: string;
  year: number;
  chunkIndex: number;
  totalChunks: number;
  documentType: 'shareholder_letter';
}

export interface StoredDocument {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[];
}

export class LocalDocumentProcessor {
  private documents: StoredDocument[] = [];
  private initialized = false;

  constructor() {
    this.loadSampleData();
  }

  /**
   * Load sample Berkshire Hathaway data
   */
  private loadSampleData() {
    const sampleDocs = [
      {
        id: '2023-letter-1',
        content: "Warren Buffett has consistently advocated for long-term value investing, focusing on companies with strong competitive moats and excellent management teams. In his 2023 letter, he emphasized the importance of patience and discipline in investing, stating that time is the friend of the wonderful business and the enemy of the mediocre. Our approach has always been to buy wonderful businesses at fair prices rather than fair businesses at wonderful prices.",
        metadata: {
          source: "2023-berkshire-hathaway-letter",
          year: 2023,
          chunkIndex: 0,
          totalChunks: 4,
          documentType: 'shareholder_letter' as const
        }
      },
      {
        id: '2023-crypto-1',
        content: "Our policy regarding cryptocurrency remains unchanged: we do not view it as a productive asset. Unlike farms, apartment buildings, or businesses, Bitcoin produces nothing. Its value depends entirely on what others are willing to pay for it. This makes it purely speculative, and we prefer investments that generate intrinsic value over time through productive activities.",
        metadata: {
          source: "2023-berkshire-hathaway-letter",
          year: 2023,
          chunkIndex: 1,
          totalChunks: 4,
          documentType: 'shareholder_letter' as const
        }
      },
      {
        id: '2023-acquisitions-1',
        content: "We made several significant acquisitions in 2023, including increasing our stakes in Apple and Coca-Cola. These companies exemplify our investment criteria: strong brands, predictable earnings, excellent management, and reasonable prices. Apple, in particular, has become our largest holding due to its extraordinary consumer loyalty and ecosystem effects that create substantial competitive advantages.",
        metadata: {
          source: "2023-berkshire-hathaway-letter",
          year: 2023,
          chunkIndex: 2,
          totalChunks: 4,
          documentType: 'shareholder_letter' as const
        }
      },
      {
        id: '2022-volatility-1',
        content: "Market volatility is inevitable and should be viewed as an opportunity rather than a threat. When Mr. Market offers to buy or sell at foolish prices, the intelligent investor takes advantage. We never try to time the market; instead, we buy when we find wonderful businesses at attractive prices, regardless of current market sentiment or economic predictions.",
        metadata: {
          source: "2022-berkshire-hathaway-letter",
          year: 2022,
          chunkIndex: 0,
          totalChunks: 3,
          documentType: 'shareholder_letter' as const
        }
      },
      {
        id: '2022-management-1',
        content: "Management quality is perhaps the most important factor in our investment decisions. We look for leaders who think like owners, allocate capital wisely, and treat shareholders as partners. Charlie and I have found that exceptional managers can create substantial value even in ordinary businesses, while poor management can destroy value in otherwise excellent companies. We prefer managers who are honest about both successes and failures.",
        metadata: {
          source: "2022-berkshire-hathaway-letter",
          year: 2022,
          chunkIndex: 1,
          totalChunks: 3,
          documentType: 'shareholder_letter' as const
        }
      },
      {
        id: '2022-strategy-1',
        content: "Berkshire's strategy has evolved over decades but our core principles remain constant. We seek businesses with durable competitive advantages, strong free cash flow generation, and management teams that allocate capital effectively. Our holding period for truly wonderful businesses is forever, as these companies compound value over time through reinvestment and growth.",
        metadata: {
          source: "2022-berkshire-hathaway-letter",
          year: 2022,
          chunkIndex: 2,
          totalChunks: 3,
          documentType: 'shareholder_letter' as const
        }
      }
    ];

    this.documents = sampleDocs;
    this.initialized = true;
  }

  /**
   * Simple text-based similarity search
   */
  async similaritySearch(query: string, limit: number = 5, filter?: any): Promise<Document[]> {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
    
    // Score documents based on keyword matching
    const scoredDocs = this.documents.map(doc => {
      let score = 0;
      const contentLower = doc.content.toLowerCase();
      
      // Term frequency scoring
      queryTerms.forEach(term => {
        const regex = new RegExp(term, 'gi');
        const matches = (contentLower.match(regex) || []).length;
        score += matches;
      });
      
      // Boost for exact phrase matches
      if (contentLower.includes(queryLower)) {
        score += 10;
      }
      
      // Boost for partial phrase matches
      queryTerms.forEach(term => {
        if (contentLower.includes(term)) {
          score += 2;
        }
      });

      return { document: doc, score };
    });

    // Apply year filter if provided
    let filteredDocs = scoredDocs;
    if (filter?.year) {
      filteredDocs = scoredDocs.filter(item => {
        if (filter.year.$eq) {
          return item.document.metadata.year === filter.year.$eq;
        }
        if (filter.year.$gte && filter.year.$lte) {
          return item.document.metadata.year >= filter.year.$gte && 
                 item.document.metadata.year <= filter.year.$lte;
        }
        return true;
      });
    }

    // Sort by score and convert to LangChain Documents
    return filteredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => new Document({
        pageContent: item.document.content,
        metadata: item.document.metadata
      }));
  }

  /**
   * Similarity search with scores
   */
  async similaritySearchWithScore(query: string, limit: number = 5, filter?: any): Promise<[Document, number][]> {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
    
    // Score documents
    const scoredDocs = this.documents.map(doc => {
      let score = 0;
      const contentLower = doc.content.toLowerCase();
      
      queryTerms.forEach(term => {
        const regex = new RegExp(term, 'gi');
        const matches = (contentLower.match(regex) || []).length;
        score += matches * 0.1;
      });
      
      if (contentLower.includes(queryLower)) {
        score += 0.8;
      }
      
      // Normalize score to 0-1 range
      score = Math.min(score, 1.0);

      return { document: doc, score };
    });

    // Apply year filter if provided
    let filteredDocs = scoredDocs;
    if (filter?.year) {
      filteredDocs = scoredDocs.filter(item => {
        if (filter.year.$eq) {
          return item.document.metadata.year === filter.year.$eq;
        }
        if (filter.year.$gte && filter.year.$lte) {
          return item.document.metadata.year >= filter.year.$gte && 
                 item.document.metadata.year <= filter.year.$lte;
        }
        return true;
      });
    }

    // Sort by score and convert to LangChain Documents
    return filteredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => [
        new Document({
          pageContent: item.document.content,
          metadata: item.document.metadata
        }),
        item.score
      ]);
  }

  /**
   * Get vector store interface
   */
  async getVectorStore() {
    return {
      similaritySearch: this.similaritySearch.bind(this),
      similaritySearchWithScore: this.similaritySearchWithScore.bind(this)
    };
  }

  /**
   * Initialize - no external APIs needed
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      this.loadSampleData();
    }
    console.log(`📚 Loaded ${this.documents.length} sample Berkshire Hathaway documents`);
  }

  /**
   * Add sample documents (already loaded)
   */
  async addSampleDocuments(): Promise<void> {
    console.log('✅ Sample documents already loaded - no external APIs needed!');
  }
}