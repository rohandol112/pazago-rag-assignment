import fs from 'fs';
import path from 'path';
// import pdfParse from 'pdf-parse'; // Disabled for development
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface DocumentMetadata {
  source: string;
  year: number;
  pageNumber?: number;
  chunkIndex: number;
  totalChunks: number;
  documentType: 'shareholder_letter';
}

export class DocumentProcessor {
  private pinecone: Pinecone;
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-ada-002',
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
  }

  /**
   * Process a single PDF document and extract text with metadata
   * Currently disabled - use SimpleDocumentProcessor for development
   */
  async processPDF(filePath: string): Promise<Document[]> {
    throw new Error('PDF processing disabled in development. Use SimpleDocumentProcessor instead.');
  }

  /**
   * Process all PDFs in a directory
   * Currently disabled - use SimpleDocumentProcessor for development
   */
  async processDirectory(directoryPath: string): Promise<Document[]> {
    throw new Error('PDF processing disabled in development. Use SimpleDocumentProcessor instead.');
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
   * Extract year from filename (assumes format like "2023-shareholder-letter.pdf")
   */
  private extractYearFromFilename(filename: string): number {
    const yearMatch = filename.match(/(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  }

  /**
   * Clean and normalize text content
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
      .replace(/[^\w\s.,!?;:()\-"']/g, '') // Remove special characters except punctuation
      .trim();
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
}