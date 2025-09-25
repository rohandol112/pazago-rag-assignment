/**
 * Simplified Document Processor for Development
 * This version avoids pdf-parse initialization issues during development
 */

import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';

export interface DocumentMetadata {
  source: string;
  year: number;
  pageNumber?: number;
  chunkIndex: number;
  totalChunks: number;
  documentType: 'shareholder_letter';
}

export class SimpleDocumentProcessor {
  private pinecone: Pinecone;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-ada-002',
    });
  }

  /**
   * Create or get Pinecone vector store for querying
   */
  async getVectorStore(): Promise<PineconeStore> {
    const index = this.pinecone.Index(process.env.PINECONE_INDEX_NAME!);
    
    return new PineconeStore(this.embeddings, {
      pineconeIndex: index,
      namespace: 'berkshire-hathaway-letters',
    });
  }

  /**
   * Initialize Pinecone index if it doesn't exist
   */
  async initializePineconeIndex(): Promise<void> {
    try {
      const indexName = process.env.PINECONE_INDEX_NAME!;
      
      // Check if index exists
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(index => index.name === indexName);
      
      if (!indexExists) {
        console.log(`Creating Pinecone index: ${indexName}`);
        
        await this.pinecone.createIndex({
          name: indexName,
          dimension: 1536, // OpenAI ada-002 embedding dimension
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        // Wait for index to be ready
        console.log('Waiting for index to be ready...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
      }
      
      console.log(`Pinecone index ${indexName} is ready`);
    } catch (error) {
      console.error('Error initializing Pinecone index:', error);
      throw error;
    }
  }

  /**
   * Add sample documents for testing (without PDF processing)
   */
  async addSampleDocuments(): Promise<void> {
    const sampleDocuments = [
      new Document({
        pageContent: "Warren Buffett has consistently advocated for long-term value investing, focusing on companies with strong competitive moats and excellent management teams. In his 2023 letter, he emphasized the importance of patience and discipline in investing.",
        metadata: {
          source: "2023-berkshire-hathaway-letter",
          year: 2023,
          chunkIndex: 0,
          totalChunks: 1,
          documentType: 'shareholder_letter'
        }
      }),
      new Document({
        pageContent: "Berkshire Hathaway's investment philosophy centers around buying wonderful businesses at fair prices rather than fair businesses at wonderful prices. This approach has served shareholders well over decades of market cycles.",
        metadata: {
          source: "2022-berkshire-hathaway-letter", 
          year: 2022,
          chunkIndex: 0,
          totalChunks: 1,
          documentType: 'shareholder_letter'
        }
      }),
      new Document({
        pageContent: "Our policy regarding cryptocurrency remains unchanged: we do not view it as a productive asset. Unlike farms, apartment buildings, or businesses, Bitcoin produces nothing. Its value depends entirely on what others are willing to pay for it.",
        metadata: {
          source: "2023-berkshire-hathaway-letter",
          year: 2023, 
          chunkIndex: 1,
          totalChunks: 2,
          documentType: 'shareholder_letter'
        }
      })
    ];

    await this.storeDocuments(sampleDocuments);
  }

  /**
   * Store documents in Pinecone vector database
   */
  async storeDocuments(documents: Document[]): Promise<void> {
    try {
      const index = this.pinecone.Index(process.env.PINECONE_INDEX_NAME!);
      
      await PineconeStore.fromDocuments(
        documents,
        this.embeddings,
        {
          pineconeIndex: index,
          namespace: 'berkshire-hathaway-letters',
        }
      );
      
      console.log(`Successfully stored ${documents.length} documents in Pinecone`);
    } catch (error) {
      console.error('Error storing documents in Pinecone:', error);
      throw error;
    }
  }
}